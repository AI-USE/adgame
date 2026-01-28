let sessionId = null;
let winCount = 0;

const startBtn = document.getElementById('start-btn');
const choiceBtns = document.querySelectorAll('.choice-btn');
const adTrigger = document.getElementById('ad-trigger');
const retryBtn = document.getElementById('retry-btn');
const modalContinue = document.getElementById('modal-continue');
const modalHowto = document.getElementById('modal-howto');

const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const victoryScreen = document.getElementById('victory-screen');
const blockModal = document.getElementById('block-modal');
const blockMessage = document.getElementById('block-message');

const winCountDisplay = document.getElementById('win-count');
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

async function startGame() {
    try {
        const response = await fetch('/api/start', { method: 'POST' });
        const data = await response.json();
        sessionId = data.sessionId;
        localStorage.setItem('sessionId', sessionId);
        winCount = data.winCount;
        updateUI();
        showScreen(gameScreen);
    } catch (e) {
        console.error('Failed to start game', e);
    }
}

function updateUI() {
    winCountDisplay.textContent = winCount;
}

function showScreen(screen) {
    [startScreen, gameScreen, gameOverScreen, victoryScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
}

window.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'quiz-result') {
        const { correct, winCount: newWinCount, victory } = event.data;
        if (correct) {
            document.body.classList.add('correct-flash');
            setTimeout(() => document.body.classList.remove('correct-flash'), 500);

            winCount = newWinCount;
            updateUI();
            if (victory) {
                showScreen(victoryScreen);
            }
        } else {
            document.getElementById('app').classList.add('shake');
            setTimeout(() => document.getElementById('app').classList.remove('shake'), 500);
            showScreen(gameOverScreen);
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
        if (params.get('victory') === 'true') {
            showScreen(victoryScreen);
        } else {
            showScreen(gameScreen);
        }
    }
});

choiceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const choice = btn.getAttribute('data-choice');
        const checkUrl = `/check?sessionId=${sessionId}&choice=${choice}`;

        // Immediate popup trigger
        const checkWindow = window.open(checkUrl, '_blank');

        // If blocked, fallback to redirect
        if (!checkWindow || checkWindow.closed || typeof checkWindow.closed === 'undefined') {
            window.location.href = checkUrl;
        }
    });
});

adTrigger.addEventListener('click', () => {
    // Restart game after clicking ad
    startGame();
});

retryBtn.addEventListener('click', () => {
    startGame();
});
