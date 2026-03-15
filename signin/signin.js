import { showNotification } from '../common/common.js';

(function () {
    emailjs.init("pydBn61ETbAfZva2V");
})();

let generatedCode = null;

const mailSenderName = 'Step Ordering';
const emailServiceId = 'service_3q7gxqb';
const emailTemplateId = 'template_0hrfqwa';

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

btnLoginMain.addEventListener('click', () => {
    const email = loginEmailInput.value.trim().toLowerCase();
    const isValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!email || !isValidEmail) {
        showNotification('error', 'Hold on!', 'Please enter a valid email address first.');
        return;
    }

    loginEmailInput.value = email;
    generatedCode = Math.floor(100000 + Math.random() * 900000).toString();
    const recipientName = email.split('@')[0];

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
