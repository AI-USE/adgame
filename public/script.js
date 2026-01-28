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
const hintBtn = document.getElementById('hint-btn');
const rankingsList = document.getElementById('rankings-list');
const finalScoreDisplay = document.getElementById('final-score');
const tokenDisplay = document.getElementById('token-display');
const rankToken = document.getElementById('rank-token');
const nicknameInput = document.getElementById('nickname-input');
const emailSection = document.getElementById('email-section');
const emailInput1 = document.getElementById('email-input-1');
const emailInput2 = document.getElementById('email-input-2');
const emailSubmitBtn = document.getElementById('email-submit-btn');

let popupBlockDetected = false;
let currentNickname = '';

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
        rankingsList.innerHTML = '';
        data.forEach((r, i) => {
            const li = document.createElement('li');
            const nameSpan = document.createElement('span');
            nameSpan.textContent = `${i + 1}. ${r.nickname || 'Guest'}`;
            const scoreSpan = document.createElement('span');
            scoreSpan.textContent = `${r.score}連勝`;
            li.appendChild(nameSpan);
            li.appendChild(scoreSpan);
            rankingsList.appendChild(li);
        });
    } catch (e) {
        console.error('Failed to update rankings', e);
    }
}

async function startGame() {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('ニックネームを入力してください');
        return;
    }
    currentNickname = nickname;
    localStorage.setItem('nickname', nickname);

    try {
        const response = await fetch('/api/start', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname })
        });
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
    quizInstruction.textContent = `${choices.length}個の中から正解（${correctCount}個）を1つ選んでください！`;
    hintBtn.disabled = false;

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

            // Show email section if in top 5 (indicated by token)
            if (token) {
                tokenDisplay.classList.remove('hidden');
                rankToken.textContent = token;
                emailSection.classList.remove('hidden');
            } else {
                tokenDisplay.classList.add('hidden');
                emailSection.classList.add('hidden');
            }

            showScreen(gameOverScreen);
            updateRankings();
        }
    }
});

emailSubmitBtn.addEventListener('click', async () => {
    const e1 = emailInput1.value.trim();
    const e2 = emailInput2.value.trim();

    if (!e1 || e1 !== e2) {
        alert('メールアドレスが一致しません');
        return;
    }

    try {
        const response = await fetch('/api/register-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nickname: currentNickname, email: e1 })
        });
        if (response.ok) {
            alert('メールアドレスを登録しました');
            emailSection.classList.add('hidden');
        }
    } catch (e) {
        console.error('Email registration failed', e);
    }
});

// Handle fallback parameters on load
window.addEventListener('load', () => {
    sessionId = localStorage.getItem('sessionId');
    currentNickname = localStorage.getItem('nickname') || '';
    if (currentNickname) nicknameInput.value = currentNickname;
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

hintBtn.addEventListener('click', async () => {
    try {
        const response = await fetch('/api/hint', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ sessionId })
        });
        const data = await response.json();
        if (data.hintIndex !== undefined) {
            const buttons = choicesContainer.querySelectorAll('.choice-btn');
            buttons[data.hintIndex].classList.add('hint-highlight');
            hintBtn.disabled = true;
        }
    } catch (e) {
        console.error('Hint failed', e);
    }
});

adTrigger.addEventListener('click', () => {
    // Restart game after clicking ad
    startGame();
});
