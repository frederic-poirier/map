export default {
	async fetch(request, env) {
		const url = new URL(request.url);
		const key = url.pathname.slice(1);

		// --- Configuration CORS ---
		const allowedOrigins = ['https://map.frederic.dog', 'http://localhost:3001'];
		const origin = request.headers.get('Origin');
		const isAllowedOrigin = allowedOrigins.includes(origin) || !origin;

		const corsHeaders = {
			'Access-Control-Allow-Origin': isAllowedOrigin ? origin : 'null',
			'Access-Control-Allow-Methods': 'GET, HEAD, OPTIONS',
			'Access-Control-Allow-Headers': 'Range, If-Match, If-None-Match',
			'Access-Control-Expose-Headers': 'Content-Length, Content-Range, ETag',
		};

		// Gestion du Preflight (OPTIONS)
		if (request.method === 'OPTIONS') {
			return new Response(null, { headers: corsHeaders });
		}

		if (!key) {
			return new Response('Missing key', { status: 400, headers: corsHeaders });
		}

		try {
			const rangeHeader = request.headers.get('Range');
			const getOptions = {
				onlyIf: request.headers,
			};

			// Si PMTiles demande un morceau (Range), on le décode proprement pour R2
			if (rangeHeader && rangeHeader.startsWith('bytes=')) {
				const [startStr, endStr] = rangeHeader.replace('bytes=', '').split('-');
				const start = parseInt(startStr);
				const end = endStr ? parseInt(endStr) : undefined;

				getOptions.range = {
					offset: start,
					length: end ? end - start + 1 : undefined,
				};
			}

			const object = await env.WORKER_BUCKET.get(key, getOptions);

			if (!object) {
				return new Response('Object Not Found', { status: 404, headers: corsHeaders });
			}

			const headers = new Headers();
			object.writeHttpMetadata(headers);

			// On rajoute les headers indispensables pour PMTiles
			headers.set('etag', object.httpEtag);
			headers.set('Accept-Ranges', 'bytes');
			Object.entries(corsHeaders).forEach(([k, v]) => headers.set(k, v));

			// Si R2 a renvoyé un morceau, on doit calculer le Content-Range manuellement
			// car R2 ne le fait pas toujours automatiquement dans le SDK Worker
			if (object.range) {
				const start = object.range.offset;
				const length = object.range.length;
				headers.set('Content-Range', `bytes ${start}-${start + length - 1}/${object.size}`);
			}

			return new Response(object.body, {
				headers,
				status: object.range ? 206 : 200,
			});
		} catch (e) {
			// Pour debug dans 'wrangler tail'
			console.error(`Erreur sur ${key}:`, e.message);
			return new Response(`Worker Error: ${e.message}`, {
				status: 500,
				headers: corsHeaders,
			});
		}
	},
};
