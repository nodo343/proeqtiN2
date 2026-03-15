import { showNotification } from '../common/common.js';

(function () {
})();

let generatedCode = null;

const btnLoginMain = document.getElementById('btn-login-main');
const btnVerifyCode = document.getElementById('btn-verify-code');
const codeGroup = document.getElementById('code-group');
const loginCredentials = document.getElementById('login-credentials');
const loginEmailInput = document.getElementById('login-email');

btnLoginMain.addEventListener('click', () => {
        return;
    }

    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    const templateParams = {
        email: email,
    };

    btnLoginMain.innerText = "Sending Code...";
    btnLoginMain.disabled = true;

        .then(() => {
            showNotification('success', 'Email Sent!', `A 6-digit code is on its way to ${email}`);
            loginCredentials.style.display = 'none';
            codeGroup.style.display = 'block';
            btnLoginMain.style.display = 'none';
            btnVerifyCode.style.display = 'block';
        }, (error) => {
            console.error("EmailJS Error:", error);
            btnLoginMain.innerText = "Get Login Code";
            btnLoginMain.disabled = false;
        });
});

btnVerifyCode.addEventListener('click', () => {
    const enteredCode = document.getElementById('verification-code').value;
    if (enteredCode === generatedCode) {
        showNotification('success', 'Logged In!', 'Welcome back to Step Ordering!');
        setTimeout(() => {
            window.location.href = '../index.html';
        }, 2000);
    } else {
        showNotification('error', 'Invalid Code', 'The code you entered is incorrect. Try again.');
    }
});
