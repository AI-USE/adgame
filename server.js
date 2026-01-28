const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
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

function loadData() {
    if (fs.existsSync(DATA_FILE)) {
        try {
            const data = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
            rankings = data.rankings || [];
            history = data.history || [];
            emails = data.emails || [];
            playerMetadata = data.playerMetadata || {};
            stats = data.stats || { totalPlays: 0, totalCorrect: 0, totalIncorrect: 0 };
            console.log('Data loaded from persistence.');
        } catch (e) {
            console.error('Failed to load data:', e);
        }
    }
}

function saveData() {
    const data = { rankings, history, emails, playerMetadata, stats };
    fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

loadData();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin';

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦫', '🦥', '🐁', '🐀', '🐿', '🦔'];

function getRandomEmojis(count) {
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateDifficulty(winCount = 0, bonusMissRate = null) {
    let totalCount, correctCount;

    if (bonusMissRate !== null) {
        // Bonus Play: fixed miss rate between 10-70%
        // Win rate = 1 - bonusMissRate (0.3 to 0.9)
        totalCount = 10;
        correctCount = Math.round(totalCount * (1 - bonusMissRate));
        correctCount = Math.max(1, Math.min(9, correctCount));
    } else {
        // Normal Progressive Difficulty
        // Base buttons: 2 + floor(winCount/5)
        let base = 2 + Math.floor(winCount / 5);

        // Random fluctuation: 10% chance easier, 20% chance harder
        const rand = Math.random();
        if (rand < 0.1) base -= 1;
        else if (rand < 0.3) base += 1;

        totalCount = Math.max(2, Math.min(6, base));
        correctCount = 1;
        // Occasionally 2 correct if buttons > 4
        if (totalCount > 4 && Math.random() > 0.8) {
            correctCount = 2;
        }
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

    // Daily Limit Check
    if (nickname) {
        const meta = playerMetadata[nickname];
        if (meta && meta.lastBonusDate) {
            const lastDate = new Date(meta.lastBonusDate).toDateString();
            const today = new Date().toDateString();
            if (lastDate === today) {
                return res.status(403).json({
                    error: 'Daily Limit',
                    message: '本日のボーナスプレーは既に終了しました。また明日挑戦してください！'
                });
            }
        }
    }

    const sessionId = uuidv4();
    const diff = generateDifficulty(0);
    sessions[sessionId] = {
        nickname: nickname || 'Guest',
        winCount: 0,
        ...diff,
        bonusChance: 0.01,
        lastSeen: Date.now()
    };
    stats.totalPlays += 1;
    saveData();
    res.json({
        sessionId,
        winCount: 0,
        choices: diff.emojis,
        correctCount: diff.correctCount,
        isBonus: false
    });
});

app.get('/check', (req, res) => {
    const { sessionId, choice: choiceStr } = req.query;
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
        session.bonusChance += 0.01;
        const currentWinCount = session.winCount;

        let bonusMissRate = null;
        let isBonus = false;
        if (Math.random() < session.bonusChance) {
            bonusMissRate = Math.random() * 0.6 + 0.1; // 10% to 70% miss
            session.bonusChance = 0.01;
            isBonus = true;
        }

        if (isBonus) {
            const nickname = session.nickname;
            if (!playerMetadata[nickname]) playerMetadata[nickname] = {};
            playerMetadata[nickname].lastBonusDate = new Date();
        }

        saveData();

        const nextDiff = generateDifficulty(currentWinCount, bonusMissRate);
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
                        choices: ${JSON.stringify(nextDiff.emojis)},
                        correctCount: ${nextDiff.correctCount},
                        isBonus: ${isBonus}
                    };
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        window.close();
                    } else {
                        const params = new URLSearchParams({
                            correct: 'true',
                            winCount: currentWinCount,
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
                            token: ${topToken ? `'${topToken}'` : 'null'}
                        }, '*');
                    }
                    window.location.href = 'https://otieu.com/4/10530383';
                </script>
                <p>不正解！広告に移動します...</p>
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
    res.json({
        stats,
        rankings,
        history,
        activeSessions: Object.keys(sessions).length
    });
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
        return res.status(403).json({ error: 'Event has ended' });
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
