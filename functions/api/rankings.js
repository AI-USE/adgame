import { getStorage } from '../_utils.js';

export async function onRequestGet(context) {
    const storage = await getStorage(context.env);
    return new Response(JSON.stringify(storage.rankings.slice(0, 5)), {
        headers: { 'Content-Type': 'application/json' }
    });
}
