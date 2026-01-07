/**
 * ZeeFast Main Application
 */

// Toast notification
function showToast(message, type = 'default') {
    let container = document.querySelector('.toast-container');
    if (!container) {
        container = document.createElement('div');
        container.className = 'toast-container';
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span>${message}</span><button class="toast-close" onclick="this.parentElement.remove()">×</button>`;
    container.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Scroll reveal
function initScrollReveal() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}

// Navbar scroll effect
function initNavbar() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;

    window.addEventListener('scroll', () => {
        navbar.classList.toggle('scrolled', window.scrollY > 20);
    });
}

// Image lazy loading
function initLazyLoad() {
    const images = document.querySelectorAll('img[data-src]');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    });
    images.forEach(img => observer.observe(img));
}

// Format currency
function formatPrice(price) {
    return `₹${price.toLocaleString('en-IN')}`;
}

// Format date
function formatDate(dateStr) {
    return new Date(dateStr).toLocaleDateString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric'
    });
}

// Render rating stars
function renderRating(rating) {
    return `<span class="rating"><i class="fas fa-star"></i> ${rating.toFixed(1)}</span>`;
}

// Render veg/non-veg badge
function vegBadge(isVeg) {
    return `<span class="veg-badge ${isVeg ? '' : 'non-veg'}"></span>`;
}

// Get URL params
function getUrlParam(param) {
    return new URLSearchParams(window.location.search).get(param);
}

// Show loading skeleton
function showSkeleton(container, count = 4, type = 'card') {
    container.innerHTML = Array(count).fill(`<div class="skeleton skeleton-${type}"></div>`).join('');
}

// Error state
function showError(container, message = 'Something went wrong') {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-exclamation-circle"></i></div>
            <h3 class="empty-state-title">Oops!</h3>
            <p class="empty-state-text">${message}</p>
            <button class="btn btn-primary" onclick="location.reload()">Try Again</button>
        </div>`;
}

// Empty state
function showEmpty(container, icon = 'inbox', title = 'Nothing here', text = '') {
    container.innerHTML = `
        <div class="empty-state">
            <div class="empty-state-icon"><i class="fas fa-${icon}"></i></div>
            <h3 class="empty-state-title">${title}</h3>
            <p class="empty-state-text">${text}</p>
        </div>`;
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    initNavbar();
    initScrollReveal();
    initLazyLoad();
    CartModule.updateBadge();
    AuthModule.updateUI();
});

// Global exports
window.showToast = showToast;
window.formatPrice = formatPrice;
window.formatDate = formatDate;
window.renderRating = renderRating;
window.vegBadge = vegBadge;
window.getUrlParam = getUrlParam;
window.showSkeleton = showSkeleton;
window.showError = showError;
window.showEmpty = showEmpty;
