export const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐑', '🐐', '🦌', '🐩', '🐕', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦫', '🦥', '🐁', '🐀', '🐿', '🦔'];

export function getRandomEmojis(count) {
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

export function generateDifficulty(winCount = 0, bonusMissRate = null, winProb = 100) {
    const totalCount = 100;
    let correctCount;

    if (bonusMissRate !== null) {
        correctCount = Math.round(totalCount * (1 - bonusMissRate));
        correctCount = Math.max(1, Math.min(99, correctCount));
    } else {
        correctCount = Math.round(winProb);
        correctCount = Math.max(1, Math.min(99, correctCount));
    }

    const emojis = getRandomEmojis(totalCount);
    const indices = Array.from({length: totalCount}, (_, i) => i);
    const correctIndices = indices.sort(() => 0.5 - Math.random()).slice(0, correctCount);

    return { totalCount, correctCount, emojis, correctIndices };
}

export async function getStorage(env) {
    if (!env.KV) {
        throw new Error('KV namespace "KV" is not bound. Please check your wrangler.toml and Cloudflare dashboard settings.');
    }
    const data = await env.KV.get('game_data', 'json') || {};
    return {
        rankings: data.rankings || [],
        history: data.history || [],
        emails: data.emails || [],
        playerMetadata: data.playerMetadata || {},
        stats: data.stats || { totalPlays: 0, totalCorrect: 0, totalIncorrect: 0 },
        config: data.config || { sponsorUrl: 'https://otieu.com/4/10530383' }
    };
}

export async function saveStorage(env, data) {
    if (!env.KV) return;
    await env.KV.put('game_data', JSON.stringify(data));
}

export async function getSession(env, sessionId) {
    if (!env.KV) return null;
    return await env.KV.get(`session:${sessionId}`, 'json');
}

export async function saveSession(env, sessionId, sessionData) {
    if (!env.KV) return;
    await env.KV.put(`session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 3600 });
}

export async function deleteSession(env, sessionId) {
    if (!env.KV) return;
    await env.KV.delete(`session:${sessionId}`);
}
