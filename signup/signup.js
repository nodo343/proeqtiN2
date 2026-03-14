import { showNotification } from '../common/common.js';

const btnSignupMain = document.getElementById('btn-signup-main');

btnSignupMain.addEventListener('click', () => {
    const firstName = document.getElementById('reg-fname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    if (!firstName || !email || !password) {
        showNotification('error', 'Missing Data', 'Please fill in Name, Email and Password.');
        return;
    }

    btnSignupMain.innerText = "Creating Account...";
    btnSignupMain.disabled = true;

    setTimeout(() => {
        showNotification('success', 'Welcome!', `Account for ${firstName} has been created.`);
        btnSignupMain.innerText = "Create Account";
        btnSignupMain.disabled = false;

        setTimeout(() => {
            window.location.href = '../signin/index.html';
        }, 2000);
    }, 1500);
});
