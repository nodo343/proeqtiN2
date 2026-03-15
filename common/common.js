const API_BASE = 'https://restaurant.stepprojects.ge/api';
const AUTH_STORAGE_KEY = 'step_ordering_auth_session';

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

function getProjectBasePath() {
    const path = window.location.pathname;

    return path
        .replace(/\/(signin|signup|cart|profile)\/?(index\.html)?$/i, '/')
        .replace(/\/index\.html$/i, '/');
}

function getAppPath(page = 'index.html') {
    const basePath = getProjectBasePath();
    const normalizedBasePath = basePath.endsWith('/') ? basePath : `${basePath}/`;

    return `${normalizedBasePath}${page}`.replace(/\/{2,}/g, '/');
}

function getCurrentPathWithQuery() {
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

function getAuthSession() {
    const rawValue = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!rawValue) return null;

    try {
        const parsed = JSON.parse(rawValue);
        if (!parsed || parsed.isAuthenticated !== true) {
            return null;
        }

        return parsed;
    } catch (error) {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        return null;
    }
}

function isAuthenticated() {
    return !!getAuthSession();
}

function setAuthSession(userData = {}) {
    const session = {
        isAuthenticated: true,
        email: userData.email || '',
        firstName: userData.firstName || '',
        loggedInAt: new Date().toISOString()
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
    return session;
}

function clearAuthSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
}

function getPostLoginRedirect() {
    const searchParams = new URLSearchParams(window.location.search);
    const next = searchParams.get('next');

    if (next) {
        try {
            const nextUrl = new URL(next, window.location.href);
            const isSameOrigin = nextUrl.origin === window.location.origin;
            const isSameApp = nextUrl.pathname.startsWith(getProjectBasePath());

            if (isSameOrigin && isSameApp) {
                return `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`;
            }
        } catch (error) {
            // Ignore invalid next and fallback to homepage.
        }
    }

    return getAppPath('index.html');
}

function redirectToSignIn() {
    const isSignInPage = /\/signin\/?(index\.html)?$/i.test(window.location.pathname);
    if (isSignInPage) return;

    const signInPath = getAppPath('signin/index.html');
    const currentPath = encodeURIComponent(getCurrentPathWithQuery());
    window.location.href = `${signInPath}?next=${currentPath}`;
}

function checkAuth(options = {}) {
    const config = typeof options === 'string'
        ? { redirectAuthenticatedTo: options }
        : options;
    const { requireAuth = false, redirectAuthenticatedTo = '' } = config;
    const authenticated = isAuthenticated();

    if (requireAuth && !authenticated) {
        redirectToSignIn();
        return false;
    }

    if (redirectAuthenticatedTo && authenticated) {
        window.location.href = redirectAuthenticatedTo;
        return true;
    }

    return authenticated;
}

export {
    API_BASE,
    showNotification,
    updateCartBadge,
    checkAuth,
    getAuthSession,
    setAuthSession,
    clearAuthSession,
    getPostLoginRedirect,
    getAppPath,
    isAuthenticated
};
