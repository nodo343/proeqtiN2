import {
    showNotification,
    checkAuth,
    setAuthSession,
    getPostLoginRedirect,
    getRegisteredUserByEmail
} from '../common/common.js';

(function () {
    emailjs.init("pydBn61ETbAfZva2V");
})();

let generatedCode = null;

const mailSenderName = 'Step Ordering';
const emailServiceId = 'service_3q7gxqb';
const emailTemplateId = 'template_0hrfqwa';
const SIGNIN_DRAFT_STORAGE_KEY = 'step_ordering_signin_draft';

const codeInput = document.getElementById('code-input');
const codeInput2 = document.getElementById('code-input-2');
const codeInput3 = document.getElementById('code-input-3');
const codeInput4 = document.getElementById('code-input-4');
const codeInput5 = document.getElementById('code-input-5');
const codeInput6 = document.getElementById('code-input-6');

const btnLoginMain = document.getElementById('btn-login-main');
const btnVerifyCode = document.getElementById('btn-verify-code');
const codeGroup = document.getElementById('code-group');
const loginCredentials = document.getElementById('login-credentials');
const loginEmailInput = document.getElementById('login-email');
const loginPasswordInput = document.getElementById('login-password');

checkAuth({ redirectAuthenticatedTo: getPostLoginRedirect() });
restoreSignInDraft();
setupSignInDraftAutoSave();

function readSignInDraft() {
    const rawValue = localStorage.getItem(SIGNIN_DRAFT_STORAGE_KEY);
    if (!rawValue) return null;

    try {
        const parsed = JSON.parse(rawValue);
        if (!parsed || typeof parsed !== 'object') return null;
        return parsed;
    } catch (error) {
        localStorage.removeItem(SIGNIN_DRAFT_STORAGE_KEY);
        return null;
    }
}

function writeSignInDraft(draft = {}) {
    localStorage.setItem(SIGNIN_DRAFT_STORAGE_KEY, JSON.stringify(draft));
}

function clearSignInDraft() {
    localStorage.removeItem(SIGNIN_DRAFT_STORAGE_KEY);
}

function restoreSignInDraft() {
    const draft = readSignInDraft();
    if (!draft) return;

    if (typeof draft.email === 'string') {
        loginEmailInput.value = draft.email;
    }
}

function setupSignInDraftAutoSave() {
    loginEmailInput.addEventListener('input', () => {
        writeSignInDraft({
            email: loginEmailInput.value.trim().toLowerCase()
        });
    });
}

btnLoginMain.addEventListener('click', () => {
    const email = loginEmailInput.value.trim().toLowerCase();
    const password = loginPasswordInput.value;
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !isValidEmail) {
        showNotification('error', 'Hold on!', 'Please enter a valid email address first.');
        return;
    }
    if (!password) {
        showNotification('error', 'Missing Password', 'Please enter your password.');
        return;
    }

    loginEmailInput.value = email;
    writeSignInDraft({ email });
    const registeredUser = getRegisteredUserByEmail(email);
    if (!registeredUser) {
        showNotification('error', 'Account Not Found', 'No account exists for this email. Please sign up first.');
        return;
    }

    if (!registeredUser.password) {
        showNotification('error', 'Password Missing', 'This account has no saved password. Please sign up again.');
        return;
    }

    if (password !== registeredUser.password) {
        showNotification('error', 'Wrong Password', 'Password is incorrect. Try again.');
        return;
    }

    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const recipientName = registeredUser?.firstName || email.split('@')[0];

    // Provide common variable names so different EmailJS template setups
    // can resolve recipient and display fields correctly.
    const templateParams = {
        email: email,
        to_email: email,
        recipient_email: email,
        to: email,
        user_email: email,
        reply_to: email,
        to_name: recipientName,
        user_name: recipientName,
        recipient_name: recipientName,
        code: generatedCode,
        passcode: generatedCode,
        verification_code: generatedCode,
        otp: generatedCode,
        from_name: mailSenderName,
        sender_name: mailSenderName,
        app_name: mailSenderName,
        company_name: mailSenderName
    };

    btnLoginMain.innerText = "Sending Code...";
    btnLoginMain.disabled = true;
    console.log('EmailJS send payload:', {
        service: emailServiceId,
        template: emailTemplateId,
        params: templateParams
    });

    emailjs.send(emailServiceId, emailTemplateId, templateParams)
        .then(() => {
            showNotification('success', 'Email Sent!', `A 6-digit code is on its way to ${email}`);
            loginCredentials.style.display = 'none';
            codeGroup.style.display = 'block';
            btnLoginMain.style.display = 'none';
            btnVerifyCode.style.display = 'block';
        }, (error) => {
            const reason = error?.text || error?.message || `status: ${error?.status ?? 'unknown'}`;
            showNotification('error', 'Email Failed!', `Could not send email (${reason}).`);
            console.error("EmailJS Error:", error);
            btnLoginMain.innerText = "Get Login Code";
            btnLoginMain.disabled = false;
        });
});

btnVerifyCode.addEventListener('click', () => {
    if (!generatedCode) {
        showNotification('error', 'No Code', 'Please request a login code first.');
        return;
    }

    const enteredCode = document.getElementById('verification-code').value;
    if (enteredCode === generatedCode) {
        const email = loginEmailInput.value.trim().toLowerCase();
        const registeredUser = getRegisteredUserByEmail(email);
        const password = loginPasswordInput.value;

        if (!registeredUser || !registeredUser.password) {
            showNotification('error', 'Login Failed', 'Account data is missing. Please sign up again.');
            return;
        }

        if (password !== registeredUser.password) {
            showNotification('error', 'Wrong Password', 'Password changed or incorrect. Please try again.');
            return;
        }

        const firstName = registeredUser?.firstName || (email ? email.split('@')[0] : 'User');
        const redirectTo = getPostLoginRedirect();

        setAuthSession({ email, firstName });
        clearSignInDraft();
        showNotification('success', 'Logged In!', 'Welcome back to Step Ordering!');
        setTimeout(() => {
            window.location.href = redirectTo;
        }, 1200);
    } else {
        showNotification('error', 'Invalid Code', 'The code you entered is incorrect. Try again.');
    }
});
