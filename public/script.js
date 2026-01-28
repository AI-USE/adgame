const state = {
    sessionId: null,
    winCount: 0,
    nickname: localStorage.getItem('nickname') || '',
    isAdBlockDetected: false
};

// Elements
const startScreen = document.getElementById('start-screen');
const gameScreen = document.getElementById('game-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const nicknameInput = document.getElementById('nickname');
const winCountDisplay = document.getElementById('win-count');
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

// Initialize
if (state.nickname) nicknameInput.value = state.nickname;

async function checkEnvironment() {
    // AdBlock Check
    const bait = document.getElementById('ad-bait');
    let adBlockEnabled = false;
    if (!bait || bait.offsetParent === null || bait.offsetHeight === 0 || window.canRunAds !== true) {
        adBlockEnabled = true;
    }

    // Popup Check
    const popup = window.open('about:blank', '_blank', 'width=1,height=1');
    let popupBlockEnabled = false;
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
        popupBlockEnabled = true;
    } else {
        popup.close();
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

const showScreen = (screen) => {
    [startScreen, gameScreen, gameOverScreen].forEach(s => s.classList.add('hidden'));
    screen.classList.remove('hidden');
};

const updateRankings = async () => {
    try {
        const res = await fetch('/api/rankings');
        const data = await res.json();
        rankingList.innerHTML = data.map((r, i) => `
            <div class="flex items-center justify-between px-6 py-4">
                <div class="flex items-center gap-4">
                    <span class="font-bold text-slate-300 w-4">${i + 1}</span>
                    <span class="font-semibold text-slate-700">${r.nickname || 'Guest'}</span>
                </div>
                <span class="text-indigo-600 font-bold">${r.score} Wins</span>
            </div>
        `).join('') || '<p class="p-6 text-slate-400 text-center">No rankings yet</p>';
    } catch (e) { console.error(e); }
};

const startGame = async () => {
    const nickname = nicknameInput.value.trim();
    if (!nickname) {
        alert('Please enter a nickname');
        return;
    }
    state.nickname = nickname;
    localStorage.setItem('nickname', nickname);

    const res = await fetch('/api/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname })
    });

    if (res.status === 403) {
        const err = await res.json();
        alert(err.message);
        return;
    }

    const data = await res.json();
    state.sessionId = data.sessionId;
    state.winCount = data.winCount;
    renderQuiz(data);
    showScreen(gameScreen);
};

const renderQuiz = (data) => {
    winCountDisplay.textContent = state.winCount;
    quizInstruction.textContent = data.correctCount === 1 ? '正解を1つ選んでください' : `正解を${data.correctCount}つ選んでください`;

    if (data.isBonus) bonusIndicator.classList.remove('hidden');
    else bonusIndicator.classList.add('hidden');

    choicesContainer.innerHTML = '';
    data.choices.forEach((emoji, idx) => {
        const btn = document.createElement('button');
        btn.className = 'quiz-btn bg-white border-2 border-slate-100 hover:border-indigo-500 hover:bg-indigo-50 text-4xl p-6 rounded-2xl shadow-sm transition-all';
        btn.textContent = emoji;
        btn.onclick = () => {
            const url = `/check?sessionId=${state.sessionId}&choice=${idx}`;
            const win = window.open(url, '_blank');
            if (!win) window.location.href = url;
        };
        choicesContainer.appendChild(btn);
    });
};

// Listen for results
window.addEventListener('message', (e) => {
    if (e.data.type === 'quiz-result') {
        if (e.data.correct) {
            state.winCount = e.data.winCount;
            renderQuiz(e.data);
            document.body.classList.add('bg-emerald-50');
            setTimeout(() => document.body.classList.remove('bg-emerald-50'), 300);
        } else {
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
        }
    }
});

startBtn.onclick = async () => {
    if (await checkEnvironment()) startGame();
};

modalContinue.onclick = () => {
    blockModal.classList.add('hidden');
    startGame();
};

retryBtn.onclick = () => startGame();

shareBtn.onclick = () => {
    const text = `【Infinite Master】で記録に挑戦中！現在のスコア：${state.winCount}連勝！ #InfiniteMaster #懸賞`;
    const url = window.location.origin;
    window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`);
};

checkRankBtn.onclick = async () => {
    const nick = nicknameInput.value.trim();
    if (!nick) return alert('Enter nickname');
    const res = await fetch(`/api/my-rank?nickname=${encodeURIComponent(nick)}`);
    const data = await res.json();
    rankCheckResult.textContent = data.message;
    rankCheckResult.classList.remove('hidden');
};

registrationForm.onsubmit = async (e) => {
    e.preventDefault();
    const email = document.getElementById('regEmail').value;
    const res = await fetch('/api/register-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nickname: state.nickname, email })
    });
    if (res.ok) {
        alert('Registered successfully!');
        registrationSection.classList.add('hidden');
    }
};

updateRankings();
