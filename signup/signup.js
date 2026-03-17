import { showNotification, saveRegisteredUser } from '../common/common.js';

const btnSignupMain = document.getElementById('btn-signup-main');
const SIGNUP_DRAFT_STORAGE_KEY = 'step_ordering_signup_draft';
const signupFieldIds = [
    'reg-fname',
    'reg-lname',
    'reg-phone',
    'reg-email',
    'reg-password',
    'reg-address',
    'reg-avatar',
    'reg-age',
    'reg-gender',
    'reg-zip'
];

restoreSignupDraft();
setupDraftAutoSave();

function readSignupDraft() {
    const rawValue = localStorage.getItem(SIGNUP_DRAFT_STORAGE_KEY);
    if (!rawValue) return null;

    try {
        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (error) {
        localStorage.removeItem(SIGNUP_DRAFT_STORAGE_KEY);
        return null;
    }
}

function writeSignupDraft(draft = {}) {
    localStorage.setItem(SIGNUP_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearSignupDraft() {
    localStorage.removeItem(SIGNUP_DRAFT_STORAGE_KEY);
}

function buildSignupDraft() {
    return signupFieldIds.reduce((draft, fieldId) => {
        const input = document.getElementById(fieldId);
        draft[fieldId] = input ? input.value : '';
        return draft;
    }, {});
}

function restoreSignupDraft() {
    const draft = readSignupDraft();
    if (!draft) return;

    signupFieldIds.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (!input) return;

        const draftValue = draft[fieldId];
        if (typeof draftValue === 'string') {
            input.value = draftValue;
        }
    });
}

function setupDraftAutoSave() {
    signupFieldIds.forEach((fieldId) => {
        const input = document.getElementById(fieldId);
        if (!input) return;

        const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
        input.addEventListener(eventName, () => {
            writeSignupDraft(buildSignupDraft());
        });
    });
}

btnSignupMain.addEventListener('click', () => {
    const firstName = document.getElementById('reg-fname').value.trim();
    const lastName = document.getElementById('reg-lname').value.trim();
    const phone = document.getElementById('reg-phone').value.trim();
    const email = document.getElementById('reg-email').value.trim().toLowerCase();
    const password = document.getElementById('reg-password').value;
    const address = document.getElementById('reg-address').value.trim();
    const avatar = document.getElementById('reg-avatar').value.trim();
    const age = document.getElementById('reg-age').value.trim();
    const gender = document.getElementById('reg-gender').value.trim();
    const zipCode = document.getElementById('reg-zip').value.trim();

    if (!firstName || !email || !password) {
        showNotification('error', 'Missing Data', 'Please fill in Name, Email and Password.');
        return;
    }

    btnSignupMain.innerText = "Creating Account...";
    btnSignupMain.disabled = true;

    setTimeout(() => {
        saveRegisteredUser({
            email,
            firstName,
            lastName,
            phone,
            password,
            address,
            avatar,
            age,
            gender,
            zipCode
        });
        clearSignupDraft();
        showNotification('success', 'Welcome!', `Account for ${firstName} has been created.`);
        btnSignupMain.innerText = "Create Account";
        btnSignupMain.disabled = false;

        setTimeout(() => {
            window.location.href = '../signin/index.html';
        }, 2000);
    }, 1500);
});
