import { showNotification } from '../common/common.js';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    loadProfileData();
    setupLogout();
}

function loadProfileData() {
    document.getElementById('profile-img').src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    document.getElementById('profile-fullname').innerText = 'User';
    document.getElementById('profile-email-sub').innerText = '';
    document.getElementById('info-fname').innerText = '-';
    document.getElementById('info-lname').innerText = '-';
    document.getElementById('info-email').innerText = '-';
    document.getElementById('info-phone').innerText = '-';
    document.getElementById('info-address').innerText = '-';
    document.getElementById('info-age').innerText = '-';
    document.getElementById('info-gender').innerText = '-';
    document.getElementById('info-zip').innerText = '-';
}

function setupLogout() {
    document.getElementById('btn-logout').addEventListener('click', () => {
        showNotification('success', 'Logged Out', 'Successfully logged out.');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 1500);
    });
}
