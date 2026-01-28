import { getStorage } from '../_utils.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const nickname = url.searchParams.get('nickname');

    if (!nickname) return new Response(JSON.stringify({ error: 'Nickname required' }), { status: 400 });

    const storage = await getStorage(env);
    const rank = storage.rankings.findIndex(r => r.nickname === nickname);

    const headers = { 'Content-Type': 'application/json; charset=UTF-8' };
    if (rank === -1) {
        return new Response(JSON.stringify({ inTop5: false, message: 'ランキング圏外です' }), { headers });
    } else if (rank < 5) {
        return new Response(JSON.stringify({ inTop5: true, rank: rank + 1, message: `現在${rank + 1}位です！` }), { headers });
    } else {
        return new Response(JSON.stringify({ inTop5: false, rank: rank + 1, message: `現在${rank + 1}位です（TOP5圏外）` }), { headers });
    }
}
