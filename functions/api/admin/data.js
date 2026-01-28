import { getStorage } from '../../_utils.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const password = request.headers.get('x-admin-password');
    const adminPassword = env.ADMIN_PASSWORD || 'admin';

    if (password !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const storage = await getStorage(env);

    const rankingsWithEmails = storage.rankings.map(r => {
        const emailEntry = storage.emails.find(e => e.nickname === r.nickname);
        return {
            ...r,
            email: emailEntry ? emailEntry.email : null
        };
    });

    return new Response(JSON.stringify({
        stats: storage.stats,
        rankings: rankingsWithEmails,
        history: storage.history,
        config: storage.config,
        activeSessions: 0 // KV doesn't easily list sessions without list()
    }), {
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    });
}
