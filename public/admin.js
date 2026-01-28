let adminPassword = '';

const loginOverlay = document.getElementById('login-overlay');
const adminDashboard = document.getElementById('admin-dashboard');
const passwordInput = document.getElementById('admin-password');
const loginBtn = document.getElementById('login-btn');

loginBtn.onclick = () => {
    adminPassword = passwordInput.value;
    loadDashboard();
};

async function adminFetch(url, options = {}) {
    options.headers = {
        ...options.headers,
        'x-admin-password': adminPassword,
        'Content-Type': 'application/json'
    };
    const res = await fetch(url, options);
    if (res.status === 403) {
        alert('Unauthorized');
        loginOverlay.classList.remove('hidden');
        adminDashboard.classList.add('hidden');
        throw new Error('Unauthorized');
    }
    return res.json();
}

async function loadDashboard() {
    try {
        const data = await adminFetch('/api/admin/data');
        loginOverlay.classList.add('hidden');
        adminDashboard.classList.remove('hidden');

        // Stats
        document.getElementById('total-plays').textContent = data.stats.totalPlays;
        document.getElementById('total-correct').textContent = data.stats.totalCorrect;
        document.getElementById('total-incorrect').textContent = data.stats.totalIncorrect;
        document.getElementById('active-sessions').textContent = data.activeSessions;

        // Config
        document.getElementById('sponsor-url').value = data.config.sponsorUrl;

        // Ranking Table
        const rankingTbody = document.getElementById('ranking-tbody');
        rankingTbody.innerHTML = '';
        data.rankings.forEach((r, i) => {
            const tr = document.createElement('tr');

            const tdRank = document.createElement('td');
            tdRank.className = 'px-6 py-4 font-bold text-slate-300';
            tdRank.textContent = i + 1;

            const tdName = document.createElement('td');
            tdName.className = 'px-6 py-4 font-bold';
            tdName.textContent = r.nickname;

            const tdScore = document.createElement('td');
            tdScore.className = 'px-6 py-4 font-black text-indigo-600';
            tdScore.textContent = r.score;

            const tdEmail = document.createElement('td');
            tdEmail.className = 'px-6 py-4';
            if (r.email) {
                const badge = document.createElement('span');
                badge.className = 'bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold';
                badge.textContent = r.email;
                tdEmail.appendChild(badge);
            } else {
                const dash = document.createElement('span');
                dash.className = 'text-slate-300';
                dash.textContent = '-';
                tdEmail.appendChild(dash);
            }

            const tdDate = document.createElement('td');
            tdDate.className = 'px-6 py-4 text-xs text-slate-400';
            tdDate.textContent = new Date(r.date).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });

            const tdAction = document.createElement('td');
            tdAction.className = 'px-6 py-4';
            const delBtn = document.createElement('button');
            delBtn.className = 'text-rose-400 hover:text-rose-600 text-xs font-bold bg-rose-50 px-3 py-1 rounded-lg transition-colors';
            delBtn.textContent = 'Delete';
            delBtn.onclick = () => window.deleteRanking(r.id);
            tdAction.appendChild(delBtn);

            tr.appendChild(tdRank);
            tr.appendChild(tdName);
            tr.appendChild(tdScore);
            tr.appendChild(tdEmail);
            tr.appendChild(tdDate);
            tr.appendChild(tdAction);
            rankingTbody.appendChild(tr);
        });

        // History Table
        const historyTbody = document.getElementById('history-tbody');
        historyTbody.innerHTML = '';
        data.history.forEach(h => {
            const tr = document.createElement('tr');
            tr.className = 'text-xs';

            const tdId = document.createElement('td');
            tdId.className = 'px-6 py-3 font-mono text-slate-400';
            tdId.textContent = h.id;

            const tdScore = document.createElement('td');
            tdScore.className = 'px-6 py-3 font-bold';
            tdScore.textContent = h.score;

            const tdTime = document.createElement('td');
            tdTime.className = 'px-6 py-3 text-slate-400';
            tdTime.textContent = new Date(h.date).toLocaleTimeString();

            tr.appendChild(tdId);
            tr.appendChild(tdScore);
            tr.appendChild(tdTime);
            historyTbody.appendChild(tr);
        });

    } catch (e) {
        console.error(e);
    }
}

window.deleteRanking = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await adminFetch('/api/admin/delete-ranking', {
        method: 'POST',
        body: JSON.stringify({ id })
    });
    loadDashboard();
};

document.getElementById('save-config-btn').onclick = async () => {
    const sponsorUrl = document.getElementById('sponsor-url').value;
    await adminFetch('/api/admin/config', {
        method: 'POST',
        body: JSON.stringify({ sponsorUrl })
    });
    alert('Config saved');
};

document.getElementById('add-dummy-btn').onclick = async () => {
    const nickname = document.getElementById('dummy-nickname').value;
    const score = document.getElementById('dummy-score').value;
    await adminFetch('/api/admin/add-dummy', {
        method: 'POST',
        body: JSON.stringify({ nickname, score })
    });
    loadDashboard();
};
