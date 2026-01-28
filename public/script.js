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
    } else {
        popup.close();
    }

    if (adBlockEnabled || popupBlockEnabled) {
        let message = '快適なプレイのために以下の設定を確認してください：<br><br>';
        if (adBlockEnabled) message += '・広告ブロックが有効です<br>';
        if (popupBlockEnabled) message += '・ポップアップブロックが有効です<br>';
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

choiceBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
        const choice = parseInt(btn.getAttribute('data-choice'));
        try {
            const response = await fetch('/api/choice', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId, choice })
            });
            const data = await response.json();

            if (data.correct) {
                document.body.classList.add('correct-flash');
                setTimeout(() => document.body.classList.remove('correct-flash'), 500);

                winCount = data.winCount;
                updateUI();
                if (data.victory) {
                    showScreen(victoryScreen);
                }
            } else {
                document.getElementById('app').classList.add('shake');
                setTimeout(() => document.getElementById('app').classList.remove('shake'), 500);

                // Immediate ad trigger on wrong choice
                window.open('https://otieu.com/4/10530383', '_blank');
                setTimeout(() => showScreen(gameOverScreen), 500);
            }
        } catch (e) {
            console.error('Choice failed', e);
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
