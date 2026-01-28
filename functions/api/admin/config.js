import { getStorage, saveStorage } from '../../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const password = request.headers.get('x-admin-password');
    const adminPassword = env.ADMIN_PASSWORD || 'admin';

    if (password !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { sponsorUrl } = await request.json();
    if (sponsorUrl) {
        const storage = await getStorage(env);
        storage.config.sponsorUrl = sponsorUrl;
        await saveStorage(env, storage);
        return new Response(JSON.stringify({ success: true, config: storage.config }));
    } else {
        return new Response(JSON.stringify({ error: 'Missing sponsorUrl' }), { status: 400 });
    }
}
