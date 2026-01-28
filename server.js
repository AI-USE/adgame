const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const sessions = {};
const rankings = [];
const history = [];
const stats = {
    totalPlays: 0,
    totalCorrect: 0,
    totalIncorrect: 0
};
const ADMIN_PASSWORD = 'admin'; // In a real app, use environment variables

const EMOJIS = ['🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼', '🐻‍❄️', '🐨', '🐯', '🦁', '🐮', '🐷', '🐸', '🐵', '🐔', '🐧', '🐦', '🐤', '🐣', '🐥', '🦆', '🦅', '🦉', '🦇', '🐺', '🐗', '🐴', '🦄', '🐝', '🪱', '🐛', '🦋', '🐌', '🐞', '🐜', '🪰', '🪲', '🪳', '🦟', '🦗', '🕷', '🕸', '🦂', '🐢', '🐍', '🦎', '🦖', '🦕', '🐙', '🦑', '🦐', '🦞', '🦀', '🐡', '🐠', '🐟', '🐬', '🐳', '🐋', '🦈', '🐊', '🐅', '🐆', '🦓', '🦍', '🦧', '🦣', '🐘', '🦛', '🦏', '🐪', '🐫', '🦒', '🦘', '🦬', '🐃', '🐂', '🐄', '🐎', '🐖', '🐏', '🐑', '🦙', '🐐', '🦌', '🐕', '🐩', '🦮', '🐕‍🦺', '🐈', '🐈‍⬛', '🐓', '🦃', '🦤', '🦚', '🦜', '🦢', '🦩', '🕊', '🐇', '🦝', '🦨', '🦡', '🦦', '🦫', '🦥', '🐁', '🐀', '🐿', '🦔'];

function getRandomEmojis(count) {
    const shuffled = [...EMOJIS].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
}

function generateDifficulty() {
    const totalCount = Math.floor(Math.random() * 5) + 2; // 2 to 6 buttons
    const correctCount = Math.floor(Math.random() * (totalCount - 1)) + 1; // 1 to totalCount-1
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
    res.json(rankings.slice(0, 10));
});

app.post('/api/start', (req, res) => {
    const sessionId = uuidv4();
    const diff = generateDifficulty();
    sessions[sessionId] = {
        winCount: 0,
        ...diff,
        lastSeen: Date.now()
    };
    stats.totalPlays += 1;
    res.json({
        sessionId,
        winCount: 0,
        choices: diff.emojis,
        correctCount: diff.correctCount
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
        const currentWinCount = session.winCount;

        const nextDiff = generateDifficulty();
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
                        correctCount: ${nextDiff.correctCount}
                    };
                    if (window.opener) {
                        window.opener.postMessage(data, '*');
                        window.close();
                    } else {
                        const params = new URLSearchParams({
                            correct: 'true',
                            winCount: currentWinCount,
                            choices: JSON.stringify(data.choices),
                            correctCount: data.correctCount
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
            const rankingEntry = { ...historyEntry };
            rankings.push(rankingEntry);
            rankings.sort((a, b) => b.score - a.score);
            if (rankings.indexOf(rankingEntry) < 10) {
                topToken = `TOP-${rankingEntry.id}-${finalScore}`;
            }
        }

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
        history
    });
});

app.post('/api/admin/add-dummy', adminAuth, (req, res) => {
    const { score } = req.body;
    const rankingEntry = {
        score: parseInt(score),
        date: new Date(),
        id: 'DUMMY-' + Math.floor(Math.random() * 1000)
    };
    rankings.push(rankingEntry);
    rankings.sort((a, b) => b.score - a.score);
    res.json({ success: true });
});

app.post('/api/admin/delete-ranking', adminAuth, (req, res) => {
    const { id } = req.body;
    const index = rankings.findIndex(r => r.id === id);
    if (index !== -1) {
        rankings.splice(index, 1);
        res.json({ success: true });
    } else {
        res.status(404).json({ error: 'Not found' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
