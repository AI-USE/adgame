import { generateDifficulty, getStorage, saveStorage, saveSession } from '../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { nickname } = await request.json();

    const storage = await getStorage(env);

    let winProb = 100;
    let isBonus = false;
    let bonusChance = 0.01;

    if (nickname) {
        if (!storage.playerMetadata[nickname]) storage.playerMetadata[nickname] = { cumulativeBonusChance: 0.01 };
        const meta = storage.playerMetadata[nickname];

        meta.cumulativeBonusChance = (meta.cumulativeBonusChance || 0.01) + 0.02;
        bonusChance = meta.cumulativeBonusChance;

        const canHaveBonus = !meta.lastBonusDate || (new Date(meta.lastBonusDate).toDateString() !== new Date().toDateString());

        if (canHaveBonus && Math.random() < meta.cumulativeBonusChance) {
            isBonus = true;
            winProb = Math.floor(Math.random() * (95 - 70 + 1)) + 70;
            meta.cumulativeBonusChance = 0.01;
            meta.lastBonusDate = new Date().toISOString();
        }
    }

    const diff = generateDifficulty(0, null, winProb);
    const sessionId = crypto.randomUUID();

    const sessionData = {
        nickname: nickname || 'ゲスト',
        winCount: 0,
        winProb: winProb,
        isBonus: isBonus,
        ...diff,
        bonusChance: bonusChance,
        lastSeen: Date.now()
    };

    await saveSession(env, sessionId, sessionData);

    storage.stats.totalPlays += 1;
    await saveStorage(env, storage);

    return new Response(JSON.stringify({
        sessionId,
        winCount: 0,
        winProb: winProb,
        bonusChance: bonusChance,
        choices: diff.emojis,
        correctCount: diff.correctCount,
        isBonus: isBonus
    }), {
        headers: { 'Content-Type': 'application/json; charset=UTF-8' }
    });
}
