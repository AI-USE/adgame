export const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', 'ラム', '羊', '🦙', '山羊', '鹿', '犬', 'プードル', '介助犬', '猫', '黒猫', '雄鶏', '七面鳥', 'ドードー', '孔雀', 'インコ', '白鳥', 'フラミンゴ', '鳩', '兎', 'アライグマ', 'スカンク', '穴熊', 'カワウソ', 'ビーバー', 'ナマケモノ', '二十日鼠', '鼠', '栗鼠', '針鼠'];

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
    const data = await env.MIN_KV.get('game_data', 'json');
    return data || {
        rankings: [],
        history: [],
        emails: [],
        playerMetadata: {},
        stats: { totalPlays: 0, totalCorrect: 0, totalIncorrect: 0 },
        config: { sponsorUrl: 'https://otieu.com/4/10530383' }
    };
}

export async function saveStorage(env, data) {
    await env.MIN_KV.put('game_data', JSON.stringify(data));
}

export async function getSession(env, sessionId) {
    return await env.MIN_KV.get(`session:${sessionId}`, 'json');
}

export async function saveSession(env, sessionId, sessionData) {
    await env.MIN_KV.put(`session:${sessionId}`, JSON.stringify(sessionData), { expirationTtl: 3600 });
}

export async function deleteSession(env, sessionId) {
    await env.MIN_KV.delete(`session:${sessionId}`);
}
