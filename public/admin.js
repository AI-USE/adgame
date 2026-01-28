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
    document.getElementById('active-sessions').textContent = data.activeSessions || 0;

    const rankingBody = document.querySelector('#ranking-table tbody');
    rankingBody.innerHTML = '';
    data.rankings.forEach(r => {
        const tr = document.createElement('tr');

        const idTd = document.createElement('td');
        idTd.textContent = r.id;

        const nickTd = document.createElement('td');
        nickTd.textContent = r.nickname || 'Guest';

        const scoreTd = document.createElement('td');
        scoreTd.textContent = r.score;

        const dateTd = document.createElement('td');
        dateTd.textContent = new Date(r.date).toLocaleString();

        const actionTd = document.createElement('td');
        const delBtn = document.createElement('button');
        delBtn.className = 'delete-btn';
        delBtn.textContent = '削除';
        delBtn.onclick = () => deleteRanking(r.id);
        actionTd.appendChild(delBtn);

        tr.append(idTd, nickTd, scoreTd, dateTd, actionTd);
        rankingBody.appendChild(tr);
    });

    const historyBody = document.querySelector('#history-table tbody');
    historyBody.innerHTML = '';
    data.history.forEach(h => {
        const tr = document.createElement('tr');
        const idTd = document.createElement('td');
        idTd.textContent = h.id;
        const scoreTd = document.createElement('td');
        scoreTd.textContent = h.score;
        const dateTd = document.createElement('td');
        dateTd.textContent = new Date(h.date).toLocaleString();
        tr.append(idTd, scoreTd, dateTd);
        historyBody.appendChild(tr);
    });
}

async function refreshEmails() {
    try {
        const response = await fetch('/api/admin/emails', {
            headers: { 'x-admin-password': adminPassword }
        });
        if (!response.ok) return;
        const data = await response.json();

        const emailBody = document.querySelector('#email-table tbody');
        emailBody.innerHTML = '';
        data.forEach(e => {
            const tr = document.createElement('tr');
            const nickTd = document.createElement('td');
            nickTd.textContent = e.nickname;
            const emailTd = document.createElement('td');
            emailTd.textContent = e.email;
            const dateTd = document.createElement('td');
            dateTd.textContent = new Date(e.date).toLocaleString();
            tr.append(nickTd, emailTd, dateTd);
            emailBody.appendChild(tr);
        });
    } catch (e) {
        console.error(e);
    }
}

document.getElementById('refresh-emails-btn').addEventListener('click', refreshEmails);

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
