/**
 * ZeeFast Authentication Module
 */

const AuthModule = {
    TOKEN_KEY: 'zeefast_token',
    USER_KEY: 'zeefast_user',

    isLoggedIn() {
        return !!localStorage.getItem(this.TOKEN_KEY);
    },

    getUser() {
        const user = localStorage.getItem(this.USER_KEY);
        return user ? JSON.parse(user) : null;
    },

    getToken() {
        return localStorage.getItem(this.TOKEN_KEY);
    },

    setSession(token, user) {
        localStorage.setItem(this.TOKEN_KEY, token);
        localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        this.updateUI();
    },

    clearSession() {
        localStorage.removeItem(this.TOKEN_KEY);
        localStorage.removeItem(this.USER_KEY);
        this.updateUI();
    },

    async login(email, password) {
        try {
            const response = await API.Auth.login(email, password);
            if (response.success) {
                this.setSession(response.token, response.user);
                showToast('Welcome back!', 'success');
                return { success: true };
            }
        } catch (error) {
            showToast(error.message || 'Login failed', 'error');
            return { success: false, error: error.message };
        }
    },

    async signup(data) {
        try {
            const response = await API.Auth.signup(data);
            if (response.success) {
                this.setSession(response.token, response.user);
                showToast('Account created!', 'success');
                return { success: true };
            }
        } catch (error) {
            showToast(error.message || 'Signup failed', 'error');
            return { success: false, error: error.message };
        }
    },

    logout() {
        this.clearSession();
        CartModule.clearLocal();
        showToast('Logged out successfully');
        window.location.href = '/';
    },

    updateUI() {
        const user = this.getUser();
        const authLinks = document.querySelectorAll('.auth-link');
        const userLinks = document.querySelectorAll('.user-link');
        const userNameEls = document.querySelectorAll('.user-name');

        authLinks.forEach(el => el.style.display = user ? 'none' : 'flex');
        userLinks.forEach(el => el.style.display = user ? 'flex' : 'none');
        userNameEls.forEach(el => el.textContent = user ? user.name : '');
    },

    requireAuth(redirectUrl = '/login.html') {
        if (!this.isLoggedIn()) {
            sessionStorage.setItem('redirect_after_login', window.location.href);
            window.location.href = redirectUrl;
            return false;
        }
        return true;
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    AuthModule.updateUI();
});

window.AuthModule = AuthModule;
