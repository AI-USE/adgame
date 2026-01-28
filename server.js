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

app.get('/check', (req, res) => {
    const { sessionId, choice: choiceStr } = req.query;
    const choice = parseInt(choiceStr);
    const session = sessions[sessionId];

    if (!session) {
        return res.status(400).json({ error: 'Invalid session' });
    }
    session.lastSeen = Date.now();

    const isCorrect = choice === session.currentAnswer;

    if (isCorrect) {
        session.winCount += 1;
        const victory = session.winCount >= 10;
        const currentWinCount = session.winCount;

        if (victory) {
            delete sessions[sessionId];
        } else {
            session.currentAnswer = Math.floor(Math.random() * 2);
        }

        res.send(`
            <!DOCTYPE html>
            <html>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({
                            type: 'quiz-result',
                            correct: true,
                            winCount: ${currentWinCount},
                            victory: ${victory}
                        }, '*');
                        window.close();
                    } else {
                        // Fallback if no opener (e.g. redirected)
                        window.location.href = '/?victory=${victory}&winCount=${currentWinCount}';
                    }
                </script>
                <p>正解！画面を戻ります...</p>
            </body>
            </html>
        `);
    } else {
        delete sessions[sessionId];
        res.send(`
            <!DOCTYPE html>
            <html>
            <body>
                <script>
                    if (window.opener) {
                        window.opener.postMessage({ type: 'quiz-result', correct: false }, '*');
                    }
                    window.location.href = 'https://otieu.com/4/10530383';
                </script>
                <p>不正解！広告に移動します...</p>
            </body>
            </html>
        `);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
