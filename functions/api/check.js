import { generateDifficulty, getStorage, saveStorage, getSession, saveSession, deleteSession } from '../_utils.js';

export async function onRequestGet(context) {
    const { request, env } = context;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');
    const choice = parseInt(url.searchParams.get('choice'));
    const noRedirect = url.searchParams.get('noRedirect');

    const session = await getSession(env, sessionId);
    if (!session) {
        return new Response(JSON.stringify({ error: 'Invalid session' }), { status: 400 });
    }

    const isCorrect = session.correctIndices.includes(choice);
    const storage = await getStorage(env);

    if (isCorrect) {
        session.winCount += 1;
        storage.stats.totalCorrect += 1;

        if (!session.isBonus) {
            if (Math.random() >= 0.05) {
                const decrease = Math.floor(Math.random() * 5) + 1;
                session.winProb = Math.max(15, session.winProb - decrease);
            }
        }

        const currentWinCount = session.winCount;
        const currentWinProb = session.winProb;

        const nextDiff = generateDifficulty(currentWinCount, null, currentWinProb);
        session.emojis = nextDiff.emojis;
        session.correctIndices = nextDiff.correctIndices;
        session.correctCount = nextDiff.correctCount;
        session.lastSeen = Date.now();

        await saveSession(env, sessionId, session);
        await saveStorage(env, storage);

        return new Response(`
            <!DOCTYPE html>
            <html lang="ja">
            <head><meta charset="UTF-8"></head>
            <body>
                <script>
                    const data = {
                        type: 'quiz-result',
                        correct: true,
                        winCount: ${currentWinCount},
                        winProb: ${currentWinProb},
                        bonusChance: ${session.bonusChance},
                        choices: ${JSON.stringify(nextDiff.emojis)},
                        correctCount: ${nextDiff.correctCount},
                        isBonus: ${session.isBonus}
                    };
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        window.close();
                    } else {
                        const params = new URLSearchParams({
                            correct: 'true',
                            winCount: currentWinCount,
                            winProb: currentWinProb,
                            bonusChance: session.bonusChance,
                            choices: JSON.stringify(data.choices),
                            correctCount: data.correctCount,
                            isBonus: data.isBonus
                        });
                        window.location.href = '/?' + params.toString();
                    }
                </script>
                <p>正解！画面を戻ります...</p>
            </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    } else {
        const finalScore = session.winCount;
        storage.stats.totalIncorrect += 1;
        let topToken = null;

        const historyEntry = {
            id: crypto.randomUUID().slice(0, 8),
            score: finalScore,
            date: new Date().toISOString()
        };
        storage.history.unshift(historyEntry);
        if (storage.history.length > 100) storage.history.pop();

        if (finalScore > 0) {
            const nickname = session.nickname;
            const existingIndex = storage.rankings.findIndex(r => r.nickname === nickname);

            if (existingIndex === -1 || storage.rankings[existingIndex].score < finalScore) {
                if (existingIndex !== -1) storage.rankings.splice(existingIndex, 1);

                const rankingEntry = { ...historyEntry, nickname };
                storage.rankings.push(rankingEntry);
                storage.rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
                if (storage.rankings.length > 100) storage.rankings.pop();

                const newRank = storage.rankings.findIndex(r => r.id === rankingEntry.id);
                if (newRank < 5) {
                    topToken = `TOP-${rankingEntry.id}-${finalScore}`;
                }
            }
        }

        await saveStorage(env, storage);
        await deleteSession(env, sessionId);

        return new Response(`
            <!DOCTYPE html>
            <html lang="ja">
            <head><meta charset="UTF-8"></head>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'quiz-result',
                            correct: false,
                            score: ${finalScore},
                            token: ${topToken ? `'${topToken}'` : 'null'},
                            limitReached: ${noRedirect === '1'}
                        }, '*');
                    }
                    if ('${noRedirect}' === '1') {
                        if (window.opener) {
                           window.close();
                        } else {
                           window.location.href = '/?failed=1&score=${finalScore}';
                        }
                    } else {
                        window.location.href = '${storage.config.sponsorUrl}';
                    }
                </script>
                <p>不正解！${noRedirect === '1' ? '画面を戻ります...' : '広告に移動します...'}</p>
            </body>
            </html>
        `, { headers: { 'Content-Type': 'text/html; charset=UTF-8' } });
    }
}
