const state = {
    sessionId: null,
    winCount: 0,
    nickname: localStorage.getItem('nickname') || '',
    userId: localStorage.getItem('userId') || '',
    isAdBlockDetected: false
};

if (!state.userId) {
    state.userId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    localStorage.setItem('userId', state.userId);
}

// Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const nicknameInput = document.getElementById('nickname');
const winCountDisplay = document.getElementById('win-count');
const winProbDisplay = document.getElementById('win-prob-display');
const bonusProbDisplay = document.getElementById('bonus-prob-display');
const choicesContainer = document.getElementById('choices-container');
const quizInstruction = document.getElementById('quiz-instruction');
const bonusIndicator = document.getElementById('bonus-indicator');
const finalScoreDisplay = document.getElementById('final-score');
const registrationSection = document.getElementById('registration-section');
const registrationForm = document.getElementById('registration-form');
const rankingList = document.getElementById('ranking-list');
const startBtn = document.getElementById('start-btn');
const retryBtn = document.getElementById('retry-btn');
const shareBtn = document.getElementById('share-btn');
const checkRankBtn = document.getElementById('check-rank-btn');
const rankCheckResult = document.getElementById('rank-check-result');
const blockModal = document.getElementById('block-modal');
const modalContinue = document.getElementById('modal-continue');
const waitOverlay = document.getElementById('wait-overlay');
const waitTimerDisplay = document.getElementById('wait-timer');

// Ad Tracking Logic
function getAdStatus() {
    const now = new Date();
    const hourKey = `${now.getFullYear()}-${now.getMonth()}-${now.getDate()}-${now.getHours()}`;
    let stats = JSON.parse(localStorage.getItem('ad_status') || '{}');

    if (stats.hourKey !== hourKey) {
        stats = {
            hourKey: hourKey,
            count: 0,
            limit: Math.floor(Math.random() * 3) + 1 // 1-3 times
        };
        localStorage.setItem('ad_status', JSON.stringify(stats));
    }
    return stats;
}

function incrementAdCount() {
    const stats = getAdStatus();
    stats.count++;
    localStorage.setItem('ad_status', JSON.stringify(stats));
}

function shouldSkipAd() {
    const stats = getAdStatus();
    return stats.count >= stats.limit;
}

// Wait Penalty Logic
let waitInterval = null;
let currentWaitTime = 0;

function startWaitPenalty() {
    const finishAt = Date.now() + 10000;
    localStorage.setItem('wait_finish_at', finishAt.toString());

    waitOverlay.classList.remove('hidden');
    manageAds('wait');

    if (waitInterval) clearInterval(waitInterval);
    waitInterval = setInterval(updateWaitTick, 100);
}

function updateWaitTick() {
    const finishAt = parseInt(localStorage.getItem('wait_finish_at') || '0');
    const remaining = Math.max(0, Math.ceil((finishAt - Date.now()) / 1000));
    currentWaitTime = remaining;
    waitTimerDisplay.textContent = remaining;

    if (remaining <= 0) {
        endWaitPenalty();
    }
}

function resetWaitPenalty() {
    const finishAt = parseInt(localStorage.getItem('wait_finish_at') || '0');
    if (finishAt > Date.now()) {
        const newFinishAt = Date.now() + 10000;
        localStorage.setItem('wait_finish_at', newFinishAt.toString());
        updateWaitTick();
    }
}

function endWaitPenalty() {
    clearInterval(waitInterval);
    waitInterval = null;
    localStorage.removeItem('wait_finish_at');
    waitOverlay.classList.add('hidden');
    manageAds('none');
    startGame(); // Restart
}

// Interaction listeners for wait penalty
window.addEventListener('mousedown', resetWaitPenalty);
window.addEventListener('touchstart', resetWaitPenalty);
window.addEventListener('keydown', resetWaitPenalty);

// Initialize
if (state.nickname) nicknameInput.value = state.nickname;

// Handle Fallback URL Parameters (from redirected main window)
const params = new URLSearchParams(window.location.search);
if (params.get('correct') === 'true') {
    state.winCount = parseInt(params.get('winCount'));
    // We don't have the full session data here, so we might need to fetch it or rely on params
    // But since renderQuiz needs the choices, they are passed in params
    const quizData = {
        winCount: state.winCount,
        winProb: parseInt(params.get('winProb')),
        bonusChance: parseFloat(params.get('bonusChance')),
        choices: JSON.parse(params.get('choices')),
        correctCount: parseInt(params.get('correctCount')),
        isBonus: params.get('isBonus') === 'true'
    };
    // Get sessionId from localStorage if missing in params
    state.sessionId = localStorage.getItem('lastSessionId');
    renderQuiz(quizData);
    showScreen(gameScreen);
    // Clear params
    window.history.replaceState({}, document.title, "/");
} else if (params.get('failed') === '1') {
    finalScoreDisplay.textContent = params.get('score');
    showScreen(gameOverScreen);
    updateRankings();
    window.history.replaceState({}, document.title, "/");
}

// Check for existing wait penalty on load
const savedWaitFinish = parseInt(localStorage.getItem('wait_finish_at') || '0');
if (savedWaitFinish > Date.now()) {
    waitOverlay.classList.remove('hidden');
    manageAds('wait');
    waitInterval = setInterval(updateWaitTick, 100);
}

function checkEnvironment() {
    // AdBlock Check
    const bait = document.getElementById('ad-bait');
    let adBlockEnabled = false;
    if (!bait || bait.offsetParent === null || bait.offsetHeight === 0 || window.canRunAds !== true) {
        adBlockEnabled = true;
    }

    // Popup Check
    let popupBlockEnabled = false;
    try {
        const popup = window.open('about:blank', '_blank', 'width=1,height=1');
        if (!popup || popup.closed || typeof popup.closed === 'undefined') {
            popupBlockEnabled = true;
        } else {
            popup.close();
        }
    } catch (e) {
        popupBlockEnabled = true;
    }

    if (adBlockEnabled || popupBlockEnabled) {
        let msg = '';
        if (adBlockEnabled) msg += '広告ブロックが有効です。';
        if (popupBlockEnabled) msg += 'ポップアップブロックが有効です。';
        document.getElementById('block-message').textContent = msg + ' そのまま続行しますか？';
        blockModal.classList.remove('hidden');
        return false;
    }
    return true;
}

const manageAds = (type) => {
    // Remove existing managed ads
    const existing = document.querySelectorAll('.managed-ad');
    existing.forEach(el => el.remove());

    if (!type || type === 'none') return;

    const s = document.createElement('script');
    s.className = 'managed-ad';
    const target = [document.documentElement, document.body].filter(Boolean).pop();

    if (type === 'game') {
        (function(scr){scr.dataset.zone='10533803',scr.src='https://nap5k.com/tag.min.js'})(target.appendChild(s));
    } else if (type === 'retry') {
        (function(scr){scr.dataset.zone='10533802',scr.src='https://al5sm.com/tag.min.js'})(target.appendChild(s));
    } else if (type === 'wait') {
        s.src = 'https://quge5.com/88/tag.min.js';
        s.dataset.zone = '206398';
        s.async = true;
        s.setAttribute('data-cfasync', 'false');
        target.appendChild(s);
    }
};

const showScreen = (screen) => {
    [startScreen, gameScreen, gameOverScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');

    if (screen === startScreen) {
        manageAds('none');
    } else if (screen === gameScreen) {
        manageAds('game');
    } else if (screen === gameOverScreen) {
        manageAds('retry');
    }
};

const updateRankings = async () => {
    try {
        const res = await fetch('/api/rankings');
        const data = await res.json();
        if (data.length === 0) {
            rankingList.innerHTML = '<p class="p-6 text-slate-400 text-center">まだランキングはありません</p>';
            return;
        }
        rankingList.innerHTML = '';
        data.forEach((r, i) => {
            const item = document.createElement('div');
            item.className = 'flex items-center justify-between px-6 py-4';

            const left = document.createElement('div');
            left.className = 'flex items-center gap-4';

            const rank = document.createElement('span');
            rank.className = 'font-bold text-slate-300 w-4';
            rank.textContent = i + 1;

            const name = document.createElement('span');
            name.className = 'font-semibold text-slate-700';
            name.textContent = r.nickname || 'ゲスト';

            left.appendChild(rank);
            left.appendChild(name);

            const score = document.createElement('span');
            score.className = 'text-indigo-600 font-bold';
            score.textContent = `${r.score} 連勝`;

            item.appendChild(left);
            item.appendChild(score);
            rankingList.appendChild(item);
        });
    } catch (e) { console.error(e); }
};

const startGame = async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('ニックネームを入力してください');
        return;
    }
    state.nickname = nickname;
    localStorage.setItem('nickname', nickname);

    try {
        const res = await fetch('/api/start', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-User-ID': state.userId
            },
            body: JSON.stringify({ nickname })
        });

        if (!res.ok) {
            if (res.status === 403) {
                const err = await res.json();
                alert(err.message);
                return;
            }
            throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();
        if (!data.sessionId) throw new Error('Session ID not received');

        state.sessionId = data.sessionId;
        localStorage.setItem('lastSessionId', data.sessionId);
        state.winCount = data.winCount;
        renderQuiz(data);
        showScreen(gameScreen);
    } catch (err) {
        console.error('Failed to start game:', err);
        alert('ゲームの開始に失敗しました。しばらく時間を置いてから再度お試しください。');
    }
};

const renderQuiz = (data) => {
    winCountDisplay.textContent = state.winCount;
    winProbDisplay.textContent = (data.winProb || 100) + '%';
    bonusProbDisplay.textContent = '発生率: ' + Math.round((data.bonusChance || 0.01) * 100) + '%';

    quizInstruction.textContent = '正解を選んでください';

    if (data.isBonus) bonusIndicator.classList.remove('hidden');
    else bonusIndicator.classList.add('hidden');

    choicesContainer.innerHTML = '';
    data.choices.forEach((emoji, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn animate-float bg-white border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-xl md:text-3xl p-1 md:p-2 rounded md:rounded-lg shadow-sm transition-all flex items-center justify-center aspect-square';
        btn.style.animationDelay = (Math.random() * -4).toFixed(2) + 's';
        btn.style.animationDuration = (3 + Math.random() * 2).toFixed(2) + 's';
        btn.textContent = emoji;
        btn.onclick = () => {
            const skipAd = shouldSkipAd();
            const url = `/api/check?sessionId=${state.sessionId}&choice=${idx}${skipAd ? '&noRedirect=1' : ''}`;

            const win = window.open(url, '_blank');
            if (!win) {
                window.location.href = url;
            }
        };
        choicesContainer.appendChild(btn);
    });
};

const showCorrectEffect = () => {
    const overlay = document.createElement('div');
    overlay.className = 'success-overlay';
    document.body.appendChild(overlay);

    const text = document.createElement('div');
    text.className = 'effect-text';
    text.textContent = '正解！';
    document.body.appendChild(text);

    setTimeout(() => {
        overlay.remove();
        text.remove();
    }, 800);
};

// Listen for results
window.addEventListener('message', (e) => {
    if (e.data && e.data.type === 'quiz-result') {
        if (e.data.correct) {
            state.winCount = e.data.winCount;
            renderQuiz(e.data);
            showCorrectEffect();
        } else {
            if (!e.data.limitReached) {
                incrementAdCount();
                // ad popup handles redirect
            }

            finalScoreDisplay.textContent = e.data.score;
            if (e.data.token) {
                registrationSection.classList.remove('hidden');
            } else {
                registrationSection.classList.add('hidden');
            }
            showScreen(gameOverScreen);
            updateRankings();
            document.body.classList.add('shake');
            setTimeout(() => document.body.classList.remove('shake'), 500);

            if (e.data.limitReached) {
                startWaitPenalty();
            }
        }
    }
});

startBtn.onclick = () => {
    if (checkEnvironment()) startGame();
};

modalContinue.onclick = () => {
    blockModal.classList.add('hidden');
    startGame();
};

retryBtn.onclick = () => startGame();

shareBtn.onclick = () => {
    const text = `【無限マスター】で記録に挑戦中！現在のスコア：${state.winCount}連勝！ #無限マスター #懸賞`;
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
};

checkRankBtn.onclick = async () => {
    const nick = nicknameInput.value.trim();
    if (!nick) return alert('ニックネームを入力してください');
    const res = await fetch(`/api/my-rank?nickname=${encodeURIComponent(nick)}`);
    const data = await res.json();
    rankCheckResult.textContent = data.message;
    rankCheckResult.classList.remove('hidden');
};

registrationForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const emailConfirm = document.getElementById('regEmailConfirm').value;

    if (email !== emailConfirm) {
        alert('メールアドレスが一致しません');
        return;
    }

    const res = await fetch('/api/register-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: state.nickname, email })
    });
    if (res.ok) {
        alert('メールアドレスを登録しました！');
        registrationSection.classList.add('hidden');
    }
};

updateRankings();
showScreen(startScreen);
