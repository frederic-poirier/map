import { S3Client, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

export async function onRequest({ env, request }) {
  const fileName = 'montreal.pmtiles';
  const bucketName = 'map'; // Remplace par le vrai nom de ton bucket

  try {
    const S3 = new S3Client({
      region: "auto",
      endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      credentials: {
        accessKeyId: env.R2_ACCESS_KEY_ID,
        secretAccessKey: env.R2_SECRET_ACCESS_KEY,
      },
    });

    // 3. Préparation de la commande
    // On dit simplement "Je veux permettre la lecture (GetObject) de ce fichier"
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: fileName,
    });

    // 4. Génération de la signature
    // expiresIn: 3600 = Le lien est valide 1 heure
    const url = await getSignedUrl(S3, command, { expiresIn: 3600 });

    // 5. Réponse au Frontend
    // On renvoie du JSON contenant l'URL magique.
    // Le frontend utilisera cette URL pour initialiser PMTiles.
    return new Response(JSON.stringify({ 
      url: url,
      expiresAt: Date.now() + 3600 * 1000 // Utile pour que le front sache quand rafraîchir
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*', // Important pour le fetch du frontend
      }
    });

  } catch (error) {
    console.error('Presigning Error:', error);
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

// Gestion des requêtes OPTIONS (CORS) - Reste identique
export async function onRequestOptions() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization', // Ajout de Authorization si tu l'utilises
      'Access-Control-Max-Age': '86400',
    }
  });
}