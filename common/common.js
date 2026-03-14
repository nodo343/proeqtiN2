const API_BASE = 'https://restaurant.stepprojects.ge/api';

function showNotification(type, title, message) {
    const container = document.getElementById('notification-container');
    if (!container) {
        const newContainer = document.createElement('div');
        newContainer.id = 'notification-container';
        document.body.appendChild(newContainer);
    }
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;

    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <div class="notification-content">
            <span>${title}</span>
            <span>${message}</span>
        </div>
    `;

    document.getElementById('notification-container').appendChild(notification);

    setTimeout(() => {
        notification.classList.add('fade-out');
        setTimeout(() => notification.remove(), 300);
    }, 3500);
}

function updateCartBadge(cart) {
    const cartCount = cart.reduce((sum, item) => sum + (item.quantity || 0), 0);
}

function checkAuth() {
}

export { API_BASE, showNotification, updateCartBadge, checkAuth };
