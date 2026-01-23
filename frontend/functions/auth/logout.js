import { getCookie, deleteSession } from "../utils/auth";

export async function onRequestPost({ request, env }) {
    const sessionId = getCookie(request, 'session');

    if (sessionId) await deleteSession(sessionId, env);

    return new Response(JSON.stringify({
        success: true,
        message: 'Déconnecté avec succès'
    }, {
        status: 200,
        headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': [
                `session=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`
            ].join('; ')
        }  
    }))
};