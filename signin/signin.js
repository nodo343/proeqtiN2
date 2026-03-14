import { showNotification } from '../common/common.js';

(function () {
    emailjs.init("P6OUoqTv8bPjbPRkX");
})();

let generatedCode = null;

const btnLoginMain = document.getElementById('btn-login-main');
const btnVerifyCode = document.getElementById('btn-verify-code');
const codeGroup = document.getElementById('code-group');
const loginCredentials = document.getElementById('login-credentials');
const loginEmailInput = document.getElementById('login-email');

btnLoginMain.addEventListener('click', () => {
    const email = loginEmailInput.value;
    if (!email) {
        showNotification('error', 'Hold on!', 'Please enter your email address first.');
        return;
    }

    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    const templateParams = {
        email: email,
        code: generatedCode
    };

    btnLoginMain.innerText = "Sending Code...";
    btnLoginMain.disabled = true;

    emailjs.send('service_2nyaids', 'template_8aflfjv', templateParams)
        .then(() => {
            showNotification('success', 'Email Sent!', `A 6-digit code is on its way to ${email}`);
            loginCredentials.style.display = 'none';
            codeGroup.style.display = 'block';
            btnLoginMain.style.display = 'none';
            btnVerifyCode.style.display = 'block';
        }, (error) => {
            showNotification('error', 'Email Failed!', 'We could not send the email. Check your connection.');
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
