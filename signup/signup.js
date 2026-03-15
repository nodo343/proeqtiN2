import { showNotification, saveRegisteredUser } from '../common/common.js';

const btnSignupMain = document.getElementById('btn-signup-main');

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
            address,
            avatar,
            age,
            gender,
            zipCode
        });
        showNotification('success', 'Welcome!', `Account for ${firstName} has been created.`);
        btnSignupMain.innerText = "Create Account";
        btnSignupMain.disabled = false;

        setTimeout(() => {
            window.location.href = '../signin/index.html';
        }, 2000);
    }, 1500);
});
