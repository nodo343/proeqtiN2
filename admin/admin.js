import {
    checkAuth,
    renderAuthNavigation,
    isCurrentUserAdmin,
    getRegisteredUsersList,
    getAppPath,
    showNotification
} from '../common/common.js';

const ADMIN_ACCESS_EMAIL = 'nodikogamer01@gmail.com';
const DEFAULT_AVATAR = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';

const usersTableBody = document.getElementById('users-table-body');
const usersEmpty = document.getElementById('users-empty');
const searchInput = document.getElementById('search-user');
const refreshButton = document.getElementById('btn-refresh-users');
const statTotalUsers = document.getElementById('stat-total-users');
const statWithPhone = document.getElementById('stat-with-phone');
const statWithAddress = document.getElementById('stat-with-address');

const detailAvatar = document.getElementById('detail-avatar');
const detailName = document.getElementById('detail-name');
const detailEmail = document.getElementById('detail-email');
const detailPhone = document.getElementById('detail-phone');
const detailAddress = document.getElementById('detail-address');
const detailAge = document.getElementById('detail-age');
const detailGender = document.getElementById('detail-gender');
const detailZip = document.getElementById('detail-zip');

let allUsers = [];
let visibleUsers = [];
let selectedEmail = '';

document.addEventListener('DOMContentLoaded', () => {
    init();
});

function init() {
    const isAuthorized = checkAuth({ requireAuth: true });
    if (!isAuthorized) return;

    if (!isCurrentUserAdmin()) {
        showNotification('error', 'Access Denied', `Admin panel is only for ${ADMIN_ACCESS_EMAIL}.`);
        setTimeout(() => {
            window.location.href = getAppPath('index.html');
        }, 1200);
        return;
    }

    renderAuthNavigation();
    setupEventListeners();
    refreshUsers(true);
}

function setupEventListeners() {
    searchInput.addEventListener('input', () => {
        applySearchFilter();
    });

    refreshButton.addEventListener('click', () => {
        refreshUsers(false);
    });
}

function refreshUsers(isInitialLoad = false) {
    const registeredUsers = getRegisteredUsersList();

    allUsers = registeredUsers
        .map((user) => ({
            firstName: normalizeText(user?.firstName),
            lastName: normalizeText(user?.lastName),
            email: normalizeText(user?.email).toLowerCase(),
            phone: normalizeText(user?.phone),
            address: normalizeText(user?.address),
            age: normalizeText(user?.age),
            gender: normalizeText(user?.gender),
            zipCode: normalizeText(user?.zipCode),
            avatar: normalizeText(user?.avatar)
        }))
        .filter((user) => !!user.email)
        .sort((a, b) => a.email.localeCompare(b.email));

    updateStats();
    applySearchFilter();

    if (!isInitialLoad) {
        showNotification('success', 'Updated', 'User list has been refreshed.');
    }
}

function applySearchFilter() {
    const query = normalizeText(searchInput.value).toLowerCase();

    visibleUsers = allUsers.filter((user) => {
        if (!query) return true;

        const fullName = `${user.firstName} ${user.lastName}`.trim().toLowerCase();
        const email = user.email.toLowerCase();
        const phone = user.phone.toLowerCase();

        return fullName.includes(query) || email.includes(query) || phone.includes(query);
    });

    if (!visibleUsers.length) {
        selectedEmail = '';
    } else if (!visibleUsers.some((user) => user.email === selectedEmail)) {
        selectedEmail = visibleUsers[0].email;
    }

    renderUsersTable();
    renderUserDetails();
}

function renderUsersTable() {
    if (!visibleUsers.length) {
        usersTableBody.innerHTML = '';
        usersEmpty.hidden = false;
        return;
    }

    usersEmpty.hidden = true;
    usersTableBody.innerHTML = visibleUsers
        .map((user, index) => {
            const fullName = buildFullName(user);
            const encodedEmail = encodeURIComponent(user.email);
            const selectedClass = user.email === selectedEmail ? 'selected-row' : '';

            return `
                <tr class="${selectedClass}">
                    <td>${index + 1}</td>
                    <td>${escapeHtml(fullName)}</td>
                    <td>${escapeHtml(user.email)}</td>
                    <td>${escapeHtml(toDisplay(user.phone))}</td>
                    <td><button class="btn-view-user" data-email="${encodedEmail}">View</button></td>
                </tr>
            `;
        })
        .join('');

    document.querySelectorAll('.btn-view-user').forEach((button) => {
        button.addEventListener('click', () => {
            const email = decodeURIComponent(button.dataset.email || '');
            selectedEmail = email;
            renderUsersTable();
            renderUserDetails();
        });
    });
}

function renderUserDetails() {
    const user = allUsers.find((item) => item.email === selectedEmail);
    if (!user) {
        clearUserDetails();
        return;
    }

    const fullName = buildFullName(user);
    const formattedGender = formatGender(user.gender);

    detailAvatar.src = user.avatar || DEFAULT_AVATAR;
    detailAvatar.onerror = () => {
        detailAvatar.onerror = null;
        detailAvatar.src = DEFAULT_AVATAR;
    };

    detailName.textContent = fullName;
    detailEmail.textContent = toDisplay(user.email);
    detailPhone.textContent = toDisplay(user.phone);
    detailAddress.textContent = toDisplay(user.address);
    detailAge.textContent = toDisplay(user.age);
    detailGender.textContent = toDisplay(formattedGender);
    detailZip.textContent = toDisplay(user.zipCode);
}

function clearUserDetails() {
    detailAvatar.src = DEFAULT_AVATAR;
    detailName.textContent = '-';
    detailEmail.textContent = '-';
    detailPhone.textContent = '-';
    detailAddress.textContent = '-';
    detailAge.textContent = '-';
    detailGender.textContent = '-';
    detailZip.textContent = '-';
}

function updateStats() {
    const withPhoneCount = allUsers.filter((user) => normalizeText(user.phone)).length;
    const withAddressCount = allUsers.filter((user) => normalizeText(user.address)).length;

    statTotalUsers.textContent = `${allUsers.length}`;
    statWithPhone.textContent = `${withPhoneCount}`;
    statWithAddress.textContent = `${withAddressCount}`;
}

function buildFullName(user) {
    const fullName = `${normalizeText(user.firstName)} ${normalizeText(user.lastName)}`.trim();
    if (fullName) return fullName;

    if (user.email) {
        return user.email.split('@')[0];
    }

    return 'Unknown User';
}

function formatGender(value) {
    const text = normalizeText(value);
    if (!text) return '';

    return `${text.charAt(0).toUpperCase()}${text.slice(1).toLowerCase()}`;
}

function toDisplay(value) {
    const text = normalizeText(value);
    return text || '-';
}

function normalizeText(value) {
    return `${value ?? ''}`.trim();
}

function escapeHtml(value) {
    return `${value ?? ''}`
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}
