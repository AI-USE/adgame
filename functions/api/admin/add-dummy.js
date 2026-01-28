import { getStorage, saveStorage } from '../../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const password = request.headers.get('x-admin-password');
    const adminPassword = env.ADMIN_PASSWORD || 'admin';

    if (password !== adminPassword) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
    }

    const { score, nickname } = await request.json();
    const storage = await getStorage(env);

    const rankingEntry = {
        score: parseInt(score),
        date: new Date().toISOString(),
        id: 'DUMMY-' + Math.floor(Math.random() * 1000),
        nickname: nickname || 'DummyPlayer'
    };
    storage.rankings.push(rankingEntry);
    storage.rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    if (storage.rankings.length > 100) storage.rankings.pop();

    await saveStorage(env, storage);
    return new Response(JSON.stringify({ success: true }));
}
