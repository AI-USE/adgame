const express = require('express');
const { v4: uuidv4 } = require('uuid');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());
app.use(express.static('public'));

const sessions = {};

// Clean up old sessions every hour
setInterval(() => {
    const now = Date.now();
    for (const id in sessions) {
        if (now - sessions[id].lastSeen > 3600000) {
            delete sessions[id];
        }
    }
}, 3600000);

app.post('/api/start', (req, res) => {
    const sessionId = uuidv4();
    sessions[sessionId] = {
        winCount: 0,
        currentAnswer: Math.floor(Math.random() * 2), // 0 or 1
        lastSeen: Date.now()
    };
    res.json({ sessionId, winCount: 0 });
});

app.post('/api/choice', (req, res) => {
    const { sessionId, choice } = req.body;
    const session = sessions[sessionId];

    if (!session) {
        return res.status(400).json({ error: 'Invalid session' });
    }
    session.lastSeen = Date.now();

    const isCorrect = choice === session.currentAnswer;

    if (isCorrect) {
        session.winCount += 1;
        if (session.winCount >= 10) {
            res.json({
                correct: true,
                winCount: session.winCount,
                victory: true
            });
            delete sessions[sessionId];
        } else {
            session.currentAnswer = Math.floor(Math.random() * 2);
            res.json({
                correct: true,
                winCount: session.winCount,
                victory: false
            });
        }
    } else {
        res.json({
            correct: false,
            winCount: 0,
            victory: false
        });
        delete sessions[sessionId];
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
