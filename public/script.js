let sessionId = null;
let winCount = 0;

const startBtn = document.getElementById('start-btn');
const adTrigger = document.getElementById('ad-trigger');
const modalContinue = document.getElementById('modal-continue');
const modalHowto = document.getElementById('modal-howto');

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const blockModal = document.getElementById('block-modal');
const blockMessage = document.getElementById('block-message');

const winCountDisplay = document.getElementById('win-count');
const choicesContainer = document.getElementById('choices-container');
const quizInstruction = document.getElementById('quiz-instruction');
const rankingsList = document.getElementById('rankings-list');
const finalScoreDisplay = document.getElementById('final-score');
const tokenDisplay = document.getElementById('token-display');
const rankToken = document.getElementById('rank-token');
let popupBlockDetected = false;

// Environment Check
async function checkEnvironment() {
    let adBlockEnabled = false;
    let popupBlockEnabled = false;

    // AdBlock Check
    const bait = document.getElementById('ad-bait');
    if (!bait || bait.offsetParent === null || bait.offsetHeight === 0 || window.canRunAds !== true) {
        adBlockEnabled = true;
    }

    // Popup Check (must be triggered by user action)
    const popup = window.open('about:blank', '_blank', 'width=100,height=100');
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        popupBlockEnabled = true;
        popupBlockDetected = true;
    } else {
        popup.close();
        popupBlockDetected = false;
    }

    if (adBlockEnabled || popupBlockEnabled) {
        let message = '快適なプレイのために以下の設定を確認してください：<br><br>';
        if (adBlockEnabled) message += '・広告ブロックが有効です<br>';
        if (popupBlockEnabled) {
            message += '・ポップアップブロックが有効です<br>';
            message += '<small>※ブロックされた場合、不正解時に画面が切り替わります</small><br>';
        }
        blockMessage.innerHTML = message;
        blockModal.classList.remove('hidden');
        return false;
    }

    return true;
}

startBtn.addEventListener('click', async () => {
    const ok = await checkEnvironment();
    if (ok) {
        startGame();
    }
});

modalContinue.addEventListener('click', () => {
    blockModal.classList.add('hidden');
    startGame();
});

modalHowto.addEventListener('click', () => {
    alert('ブラウザの設定から広告ブロックやポップアップブロックを無効にしてください。');
});

async function updateRankings() {
    try {
        const response = await fetch('/api/rankings');
        const data = await response.json();
        rankingsList.innerHTML = data.map((r, i) => `
            <li>
                <span>${i + 1}. ID:${r.id}</span>
                <span>${r.score}連勝</span>
            </li>
        `).join('');
    } catch (e) {
        console.error('Failed to update rankings', e);
    }
}

async function startGame() {
    try {
        const response = await fetch('/api/start', { method: 'POST' });
        const data = await response.json();
        sessionId = data.sessionId;
        localStorage.setItem('sessionId', sessionId);
        winCount = data.winCount;
        renderChoices(data.choices, data.correctCount);
        updateUI();
        showScreen(gameScreen);
        updateRankings();
    } catch (e) {
        console.error('Failed to start game', e);
    }
}

function updateUI() {
    winCountDisplay.textContent = winCount;
}

function renderChoices(choices, correctCount) {
    choicesContainer.innerHTML = '';
    quizInstruction.textContent = `${choices.length}個の中から正解を${correctCount}個選んでください！`;

    choices.forEach((emoji, index) => {
        const btn = document.createElement('button');
        btn.className = 'choice-btn';
        btn.textContent = emoji;
        btn.addEventListener('click', () => {
            const checkUrl = `/check?sessionId=${sessionId}&choice=${index}`;
            const checkWindow = window.open(checkUrl, '_blank');
            if (!checkWindow || checkWindow.closed || typeof checkWindow.closed === 'undefined') {
                window.location.href = checkUrl;
            }
        });
        choicesContainer.appendChild(btn);
    });
}

function showScreen(screen) {
    [startScreen, gameScreen, gameOverScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'quiz-result') {
        const { correct, winCount: newWinCount, choices, correctCount, score, token } = event.data;
        if (correct) {
            document.body.classList.add('correct-flash');
            setTimeout(() => document.body.classList.remove('correct-flash'), 500);

            winCount = newWinCount;
            updateUI();
            renderChoices(choices, correctCount);
        } else {
            document.getElementById('app').classList.add('shake');
            setTimeout(() => document.getElementById('app').classList.remove('shake'), 500);

            finalScoreDisplay.textContent = score;
            if (token) {
                tokenDisplay.classList.remove('hidden');
                rankToken.textContent = token;
            } else {
                tokenDisplay.classList.add('hidden');
            }

            showScreen(gameOverScreen);
            updateRankings();
        }
    }
});

// Handle fallback parameters on load
window.addEventListener('load', () => {
    sessionId = localStorage.getItem('sessionId');
    const params = new URLSearchParams(window.location.search);
    if (params.has('winCount')) {
        winCount = parseInt(params.get('winCount'));
        updateUI();
        if (params.has('choices')) {
            renderChoices(JSON.parse(params.get('choices')), parseInt(params.get('correctCount')));
        }
        showScreen(gameScreen);
    }
    updateRankings();
});

adTrigger.addEventListener('click', () => {
    // Restart game after clicking ad
    startGame();
});
