import { getStorage, saveStorage } from '../../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const password = request.headers.get('x-admin-password');
    const adminPassword = env.ADMIN_PASSWORD || 'admin';

    if (password !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { id } = await request.json();
    const storage = await getStorage(env);
    const index = storage.rankings.findIndex(r => r.id === id);

    if (index !== -1) {
        storage.rankings.splice(index, 1);
        await saveStorage(env, storage);
        return new Response(JSON.stringify({ success: true }));
    } else {
        return new Response(JSON.stringify({ error: 'Not found' }), { status: 404 });
    }
}
