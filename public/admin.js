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
        rankingTbody.innerHTML = data.rankings.map((r, i) => `
            <tr>
                <td class="px-6 py-4 font-bold text-slate-300">${i + 1}</td>
                <td class="px-6 py-4 font-bold">${r.nickname}</td>
                <td class="px-6 py-4 font-black text-indigo-600">${r.score}</td>
                <td class="px-6 py-4">
                    ${r.email ? `<span class="bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full text-xs font-semibold">${r.email}</span>` : '<span class="text-slate-300">-</span>'}
                </td>
                <td class="px-6 py-4 text-xs text-slate-400">
                    ${new Date(r.date).toLocaleString('ja-JP', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </td>
                <td class="px-6 py-4">
                    <button onclick="deleteRanking('${r.id}')" class="text-rose-400 hover:text-rose-600 text-xs font-bold bg-rose-50 px-3 py-1 rounded-lg transition-colors">Delete</button>
                </td>
            </tr>
        `).join('');

        // History Table
        const historyTbody = document.getElementById('history-tbody');
        historyTbody.innerHTML = data.history.map(h => `
            <tr class="text-xs">
                <td class="px-6 py-3 font-mono text-slate-400">${h.id}</td>
                <td class="px-6 py-3 font-bold">${h.score}</td>
                <td class="px-6 py-3 text-slate-400">${new Date(h.date).toLocaleTimeString()}</td>
            </tr>
        `).join('');

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
