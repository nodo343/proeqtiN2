import {
    showNotification,
    checkAuth,
    getAuthSession,
    clearAuthSession,
    getAppPath
} from '../common/common.js';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    const isAuthorized = checkAuth({ requireAuth: true });
    if (!isAuthorized) return;

    loadProfileData();
    setupLogout();
}

function loadProfileData() {
    const session = getAuthSession();
    const fallbackName = session?.email ? session.email.split('@')[0] : 'User';
    const fullName = session?.firstName || fallbackName;

    document.getElementById('profile-img').src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    document.getElementById('profile-fullname').innerText = fullName || 'User';
    document.getElementById('profile-email-sub').innerText = session?.email || '';
    document.getElementById('info-fname').innerText = fullName || '-';
    document.getElementById('info-lname').innerText = '-';
    document.getElementById('info-email').innerText = session?.email || '-';
    document.getElementById('info-phone').innerText = '-';
    document.getElementById('info-address').innerText = '-';
    document.getElementById('info-age').innerText = '-';
    document.getElementById('info-gender').innerText = '-';
    document.getElementById('info-zip').innerText = '-';
}

function setupLogout() {
    document.getElementById('btn-logout').addEventListener('click', () => {
        clearAuthSession();
        showNotification('success', 'Logged Out', 'Successfully logged out.');
        setTimeout(() => {
            window.location.href = getAppPath('signin/index.html');
        }, 900);
    });
}
