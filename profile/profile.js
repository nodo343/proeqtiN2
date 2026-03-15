import {
    showNotification,
    checkAuth,
    getAuthSession,
    getRegisteredUserByEmail,
    getUserDisplayName,
    clearAuthSession,
    getAppPath,
    renderAuthNavigation
} from '../common/common.js';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    const isAuthorized = checkAuth({ requireAuth: true });
    if (!isAuthorized) return;

    renderAuthNavigation();
    loadProfileData();
    setupLogout();
}

function loadProfileData() {
    const session = getAuthSession();
    const registeredUser = getRegisteredUserByEmail(session?.email || '') || {};
    const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
    const toText = (value) => `${value ?? ''}`.trim();
    const toDisplay = (value) => {
        const normalized = toText(value);
        return normalized || '-';
    };

    const firstName = toText(registeredUser.firstName) || getUserDisplayName(session);
    const lastName = toText(registeredUser.lastName);
    const fullName = [firstName, lastName].filter(Boolean).join(' ') || 'User';
    const email = toText(session?.email || registeredUser.email);
    const profileImage = document.getElementById('profile-img');
    const avatar = toText(registeredUser.avatar);
    const gender = toText(registeredUser.gender);
    const formattedGender = gender ? `${gender.charAt(0).toUpperCase()}${gender.slice(1)}` : '';

    profileImage.src = avatar || defaultAvatar;
    profileImage.onerror = () => {
        profileImage.onerror = null;
        profileImage.src = defaultAvatar;
    };

    document.getElementById('profile-fullname').innerText = fullName;
    document.getElementById('profile-email-sub').innerText = email;
    document.getElementById('info-fname').innerText = toDisplay(firstName);
    document.getElementById('info-lname').innerText = toDisplay(lastName);
    document.getElementById('info-email').innerText = toDisplay(email);
    document.getElementById('info-phone').innerText = toDisplay(registeredUser.phone);
    document.getElementById('info-address').innerText = toDisplay(registeredUser.address);
    document.getElementById('info-age').innerText = toDisplay(registeredUser.age);
    document.getElementById('info-gender').innerText = toDisplay(formattedGender);
    document.getElementById('info-zip').innerText = toDisplay(registeredUser.zipCode);
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
