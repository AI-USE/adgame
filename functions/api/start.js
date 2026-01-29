import { generateDifficulty, getStorage, saveStorage, saveSession } from '../_utils.js';

export async function onRequestPost(context) {
    const { request, env } = context;
    const { nickname } = await request.json();
    const userId = request.headers.get('X-User-ID') || nickname || 'anonymous';

    const storage = await getStorage(env);

    let winProb = 100;
    let isBonus = false;
    let bonusChance = 0.01;

    if (!storage.playerMetadata[userId]) {
        storage.playerMetadata[userId] = {
            cumulativeBonusChance: 0.01,
            hasAchieved10Wins: false,
            lastBonusDate: null
        };
    }
    const meta = storage.playerMetadata[userId];

    // ボーナスプレイをその日既に実施したかチェック
    if (meta.lastBonusDate && (new Date(meta.lastBonusDate).toDateString() === new Date().toDateString())) {
        return new Response(JSON.stringify({
            message: "本日はこれ以上プレイできません（ボーナスプレイ完了済み）。明日また挑戦してください！"
        }), {
            status: 403,
            headers: { 'Content-Type': 'application/json; charset=UTF-8' }
        });
    }

    // ボーナスプレイの判定 (プレイ毎に確率上昇)
    bonusChance = meta.cumulativeBonusChance || 0.01;
    if (Math.random() < bonusChance) {
        isBonus = true;
        // ボーナス時は当選確率 70-99% (低い方に偏らせる)
        winProb = Math.floor(Math.pow(Math.random(), 2) * (99 - 70 + 1)) + 70;
        meta.cumulativeBonusChance = 0.01;
        meta.lastBonusDate = new Date().toISOString();
    } else {
        meta.cumulativeBonusChance = bonusChance + 0.02;
        isBonus = false;
    }

    const diff = generateDifficulty(0, null, winProb);
    const sessionId = crypto.randomUUID();

    const sessionData = {
        nickname: nickname || 'ゲスト',
        userId: userId,
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
