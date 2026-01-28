let adminPassword = '';

const loginBtn = document.getElementById('login-btn');
const loginOverlay = document.getElementById('login-overlay');
const adminDashboard = document.getElementById('admin-dashboard');
const passwordInput = document.getElementById('admin-password');

loginBtn.addEventListener('click', async () => {
    adminPassword = passwordInput.value;
    const success = await refreshData();
    if (success) {
        loginOverlay.classList.add('hidden');
        adminDashboard.classList.remove('hidden');
    } else {
        alert('ログインに失敗しました');
    }
});

async function refreshData() {
    try {
        const response = await fetch('/api/admin/data', {
            headers: { 'x-admin-password': adminPassword }
        });
        if (!response.ok) return false;

        const data = await response.json();
        updateUI(data);
        return true;
    } catch (e) {
        console.error(e);
        return false;
    }
}

function updateUI(data) {
    document.getElementById('total-plays').textContent = data.stats.totalPlays;
    document.getElementById('total-correct').textContent = data.stats.totalCorrect;
    document.getElementById('total-incorrect').textContent = data.stats.totalIncorrect;

    const rankingBody = document.querySelector('#ranking-table tbody');
    rankingBody.innerHTML = data.rankings.map(r => `
        <tr>
            <td>${r.id}</td>
            <td>${r.score}</td>
            <td>${new Date(r.date).toLocaleString()}</td>
            <td><button class="delete-btn" onclick="deleteRanking('${r.id}')">削除</button></td>
        </tr>
    `).join('');

    const historyBody = document.querySelector('#history-table tbody');
    historyBody.innerHTML = data.history.map(h => `
        <tr>
            <td>${h.id}</td>
            <td>${h.score}</td>
            <td>${new Date(h.date).toLocaleString()}</td>
        </tr>
    `).join('');
}

window.deleteRanking = async (id) => {
    if (!confirm('削除しますか？')) return;
    try {
        const response = await fetch('/api/admin/delete-ranking', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword
            },
            body: JSON.stringify({ id })
        });
        if (response.ok) refreshData();
    } catch (e) {
        console.error(e);
    }
};

document.getElementById('add-dummy-btn').addEventListener('click', async () => {
    const score = document.getElementById('dummy-score').value;
    if (!score) return;
    try {
        const response = await fetch('/api/admin/add-dummy', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-admin-password': adminPassword
            },
            body: JSON.stringify({ score })
        });
        if (response.ok) {
            document.getElementById('dummy-score').value = '';
            refreshData();
        }
    } catch (e) {
        console.error(e);
    }
});
