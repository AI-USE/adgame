const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
app.set('trust proxy', true); // Trust Cloudflare proxy
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const DATA_FILE = path.join(__dirname, 'data.json');

const sessions = {};
let rankings = []; // Top rankings (unique nicknames)
let history = [];  // All game results
let emails = [];   // Registered emails for prizes
let playerMetadata = {}; // Store persistent info like lastBonusDate
let stats = {
    totalPlays: 0,
    totalCorrect: 0,
    totalIncorrect: 0
};
let config = {
    sponsorUrl: 'https://otieu.com/4/10530383'
};

// Storage Abstraction for Cloudflare Compatibility
const Storage = {
    async load() {
        if (typeof global.MIN_KV !== 'undefined') {
            // Cloudflare KV Example:
            // const data = await MIN_KV.get('game_data', 'json');
            // return data || {};
        }
        if (fs.existsSync(DATA_FILE)) {
            return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
        }
        return {};
    },
    async save(data) {
        if (typeof global.MIN_KV !== 'undefined') {
            // await MIN_KV.put('game_data', JSON.stringify(data));
        }
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    }
};

async function initData() {
    const data = await Storage.load();
    rankings = data.rankings || [];
    history = data.history || [];
    emails = data.emails || [];
    playerMetadata = data.playerMetadata || {};
    stats = data.stats || { totalPlays: 0, totalCorrect: 0, totalIncorrect: 0 };
    config = data.config || { sponsorUrl: 'https://otieu.com/4/10530383' };
    console.log('Data initialized.');
}

async function saveData() {
    const data = { rankings, history, emails, playerMetadata, stats, config };
    await Storage.save(data);
}

initData();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦫', '🦥', '🐁', '🐀', '🐿', '🦔'];

function getRandomEmojis(count) {
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateDifficulty(winCount = 0, bonusMissRate = null, winProb = 100) {
    const totalCount = 100;
    let correctCount;

    if (bonusMissRate !== null) {
        // Bonus Play: fixed miss rate
        correctCount = Math.round(totalCount * (1 - bonusMissRate));
        correctCount = Math.max(1, Math.min(99, correctCount));
    } else {
        // Normal Progressive Difficulty: correctCount is winProb
        correctCount = Math.round(winProb);
        correctCount = Math.max(1, Math.min(99, correctCount));
    }

    const emojis = getRandomEmojis(totalCount);
    const indices = Array.from({length: totalCount}, (_, i) => i);
    const correctIndices = indices.sort(() => 0.5 - Math.random()).slice(0, correctCount);

    return { totalCount, correctCount, emojis, correctIndices };
}

// Clean up old sessions every hour
setInterval(() => {
    const now = Date.now();
    for (const id in sessions) {
        if (now - sessions[id].lastSeen > 3600000) {
            delete sessions[id];
        }
    }
}, 3600000);

app.get('/api/rankings', (req, res) => {
    res.json(rankings.slice(0, 5));
});

app.get('/api/my-rank', (req, res) => {
    const { nickname } = req.query;
    if (!nickname) return res.status(400).json({ error: 'Nickname required' });

    const rank = rankings.findIndex(r => r.nickname === nickname);
    if (rank === -1) {
        res.json({ inTop5: false, message: 'ランキング圏外です' });
    } else if (rank < 5) {
        res.json({ inTop5: true, rank: rank + 1, message: `現在${rank + 1}位です！` });
    } else {
        res.json({ inTop5: false, rank: rank + 1, message: `現在${rank + 1}位です（TOP5圏外）` });
    }
});

app.post('/api/start', (req, res) => {
    const { nickname } = req.body;

    const sessionId = uuidv4();
    let winProb = 100;
    let isBonus = false;
    let bonusChance = 0.01;

    if (nickname) {
        if (!playerMetadata[nickname]) playerMetadata[nickname] = { cumulativeBonusChance: 0.01 };
        const meta = playerMetadata[nickname];

        // Increase chance at start of play
        meta.cumulativeBonusChance = (meta.cumulativeBonusChance || 0.01) + 0.02; // 2% increase per play
        bonusChance = meta.cumulativeBonusChance;

        // Lottery
        const canHaveBonus = !meta.lastBonusDate || (new Date(meta.lastBonusDate).toDateString() !== new Date().toDateString());

        if (canHaveBonus && Math.random() < meta.cumulativeBonusChance) {
            isBonus = true;
            winProb = Math.floor(Math.random() * (95 - 70 + 1)) + 70; // 70-95%
            meta.cumulativeBonusChance = 0.01; // Reset
            meta.lastBonusDate = new Date();
        }
    }

    const diff = generateDifficulty(0, null, winProb);
    sessions[sessionId] = {
        nickname: nickname || 'ゲスト',
        winCount: 0,
        winProb: winProb,
        isBonus: isBonus,
        ...diff,
        bonusChance: bonusChance,
        lastSeen: Date.now()
    };
    stats.totalPlays += 1;
    saveData();
    res.json({
        sessionId,
        winCount: 0,
        winProb: winProb,
        bonusChance: bonusChance,
        choices: diff.emojis,
        correctCount: diff.correctCount,
        isBonus: isBonus
    });
});

app.get('/check', (req, res) => {
    const { sessionId, choice: choiceStr, noRedirect } = req.query;
    const choice = parseInt(choiceStr);
    const session = sessions[sessionId];

    if (!session) {
        return res.status(400).json({ error: 'Invalid session' });
    }
    session.lastSeen = Date.now();

    const isCorrect = session.correctIndices.includes(choice);

    if (isCorrect) {
        session.winCount += 1;
        stats.totalCorrect += 1;

        // Update winProb: if NOT bonus, random decrease 1-5, 5% chance of 0. min 15.
        if (!session.isBonus) {
            if (Math.random() >= 0.05) {
                const decrease = Math.floor(Math.random() * 5) + 1;
                session.winProb = Math.max(15, session.winProb - decrease);
            }
        }

        const currentWinCount = session.winCount;
        const currentWinProb = session.winProb;

        saveData();

        const nextDiff = generateDifficulty(currentWinCount, null, currentWinProb);
        session.emojis = nextDiff.emojis;
        session.correctIndices = nextDiff.correctIndices;
        session.correctCount = nextDiff.correctCount;

        res.send(`
            <!DOCTYPE html>
            <html>
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
        `);
    } else {
        const finalScore = session.winCount;
        stats.totalIncorrect += 1;
        let topToken = null;

        const historyEntry = {
            id: uuidv4().slice(0, 8),
            score: finalScore,
            date: new Date()
        };
        history.unshift(historyEntry);
        if (history.length > 100) history.pop();

        if (finalScore > 0) {
            const nickname = session.nickname;
            const existingIndex = rankings.findIndex(r => r.nickname === nickname);

            if (existingIndex === -1 || rankings[existingIndex].score < finalScore) {
                if (existingIndex !== -1) rankings.splice(existingIndex, 1);

                const rankingEntry = { ...historyEntry, nickname };
                rankings.push(rankingEntry);
                // Sort by score DESC, then date ASC (earlier is better)
                rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
                if (rankings.length > 100) rankings.pop();

                const newRank = rankings.findIndex(r => r.id === rankingEntry.id);
                if (newRank < 5) {
                    topToken = `TOP-${rankingEntry.id}-${finalScore}`;
                }
            }
        }

        saveData();
        delete sessions[sessionId];
        res.send(`
            <!DOCTYPE html>
            <html>
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
                        window.location.href = '${config.sponsorUrl}';
                    }
                </script>
                <p>不正解！${noRedirect === '1' ? '画面を戻ります...' : '広告に移動します...'}</p>
            </body>
            </html>
        `);
    }
});

// Admin Endpoints
const adminAuth = (req, res, next) => {
    const password = req.headers['x-admin-password'];
    if (password === ADMIN_PASSWORD) {
        next();
    } else {
        res.status(403).json({ error: 'Unauthorized' });
    }
};

app.get('/api/admin/data', adminAuth, (req, res) => {
    // Map emails to rankings for easier admin view
    const rankingsWithEmails = rankings.map(r => {
        const emailEntry = emails.find(e => e.nickname === r.nickname);
        return {
            ...r,
            email: emailEntry ? emailEntry.email : null
        };
    });

    res.json({
        stats,
        rankings: rankingsWithEmails,
        history,
        config,
        activeSessions: Object.keys(sessions).length
    });
});

app.post('/api/admin/config', adminAuth, (req, res) => {
    const { sponsorUrl } = req.body;
    if (sponsorUrl) {
        config.sponsorUrl = sponsorUrl;
        saveData();
        res.json({ success: true, config });
    } else {
        res.status(400).json({ error: 'Missing sponsorUrl' });
    }
});

app.get('/api/admin/emails', adminAuth, (req, res) => {
    res.json(emails);
});

app.post('/api/admin/add-dummy', adminAuth, (req, res) => {
    const { score, nickname } = req.body;
    const rankingEntry = {
        score: parseInt(score),
        date: new Date(),
        id: 'DUMMY-' + Math.floor(Math.random() * 1000),
        nickname: nickname || 'DummyPlayer'
    };
    rankings.push(rankingEntry);
    rankings.sort((a, b) => b.score - a.score || new Date(a.date) - new Date(b.date));
    if (rankings.length > 100) rankings.pop();
    saveData();
    res.json({ success: true });
});

app.post('/api/register-email', (req, res) => {
    // Deadline: Feb 4th, 2026. Block after start of Feb 5th UTC.
    const deadline = new Date('2026-02-05T00:00:00Z');
    if (new Date() > deadline) {
        return res.status(403).json({ error: 'イベントは終了しました' });
    }
    const { nickname, email } = req.body;
    emails.push({ nickname, email, date: new Date() });
    saveData();
    res.json({ success: true });
});

// Hint API removed as requested

app.post('/api/admin/delete-ranking', adminAuth, (req, res) => {
    const { id } = req.body;
    const index = rankings.findIndex(r => r.id === id);
    if (index !== -1) {
        rankings.splice(index, 1);
        saveData();
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

function getClientIp(req) {
    return req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.socket.remoteAddress;
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
