import { getStorage, saveStorage } from '../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;

    const deadline = new Date('2026-02-05T00:00:00Z');
    if (new Date() > deadline) {
        return new Response(JSON.stringify({ error: 'イベントは終了しました' }), { status: 403 });
    }

    const { nickname, email } = await request.json();
    const storage = await getStorage(env);

    storage.emails.push({ nickname, email, date: new Date().toISOString() });
    await saveStorage(env, storage);

    return new Response(JSON.stringify({ success: true }));
}
