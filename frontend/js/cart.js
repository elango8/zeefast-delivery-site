/**
 * ZeeFast Cart Module
 */

const CartModule = {
    CART_KEY: 'zeefast_cart',

    getLocal() {
        const cart = localStorage.getItem(this.CART_KEY);
        return cart ? JSON.parse(cart) : { items: [], restaurantId: null };
    },

    saveLocal(cart) {
        localStorage.setItem(this.CART_KEY, JSON.stringify(cart));
        this.updateBadge();
    },

    clearLocal() {
        localStorage.removeItem(this.CART_KEY);
        this.updateBadge();
    },

    async getCart() {
        if (!AuthModule.isLoggedIn()) {
            return this.getLocal();
        }
        try {
            const response = await API.Cart.get();
            return response.data;
        } catch {
            return this.getLocal();
        }
    },

    async addItem(item, restaurantId) {
        if (AuthModule.isLoggedIn()) {
            try {
                const response = await API.Cart.add(item.id || item.itemId, 1);
                if (response.success) {
                    showToast('Added to cart!', 'success');
                    this.updateBadge();
                    return true;
                }
            } catch (error) {
                if (error.message.includes('another restaurant')) {
                    if (confirm('Cart has items from another restaurant. Clear cart and add this item?')) {
                        await this.clear();
                        return this.addItem(item, restaurantId);
                    }
                    return false;
                }
                showToast(error.message, 'error');
                return false;
            }
        }

        // Local cart for guests
        const cart = this.getLocal();
        if (cart.restaurantId && cart.restaurantId !== restaurantId) {
            if (confirm('Cart has items from another restaurant. Clear cart?')) {
                cart.items = [];
            } else {
                return false;
            }
        }

        const existing = cart.items.find(i => (i.id || i.itemId) === (item.id || item.itemId));
        if (existing) {
            existing.quantity++;
        } else {
            cart.items.push({
                itemId: item.id || item.itemId,
                name: item.name,
                price: item.price,
                image: item.image,
                isVeg: item.isVeg,
                quantity: 1
            });
        }
        cart.restaurantId = restaurantId;
        this.saveLocal(cart);
        showToast('Added to cart!', 'success');
        return true;
    },

    async updateQuantity(itemId, quantity) {
        if (AuthModule.isLoggedIn()) {
            try {
                await API.Cart.update(itemId, quantity);
                this.updateBadge();
            } catch (error) {
                showToast(error.message, 'error');
            }
            return;
        }

        const cart = this.getLocal();
        const item = cart.items.find(i => i.itemId === itemId);
        if (item) {
            if (quantity <= 0) {
                cart.items = cart.items.filter(i => i.itemId !== itemId);
            } else {
                item.quantity = quantity;
            }
            if (cart.items.length === 0) cart.restaurantId = null;
            this.saveLocal(cart);
        }
    },

    async clear() {
        if (AuthModule.isLoggedIn()) {
            await API.Cart.clear();
        }
        this.clearLocal();
    },

    getItemCount() {
        const cart = this.getLocal();
        return cart.items.reduce((sum, item) => sum + item.quantity, 0);
    },

    updateBadge() {
        const badges = document.querySelectorAll('.cart-badge');
        const count = this.getItemCount();
        badges.forEach(badge => {
            badge.textContent = count;
            badge.style.display = count > 0 ? 'flex' : 'none';
            badge.classList.add('cart-bounce');
            setTimeout(() => badge.classList.remove('cart-bounce'), 500);
        });
    },

    calculateTotals(items, deliveryFee = 30) {
        const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const taxes = Math.round(subtotal * 0.05);
        const total = subtotal + deliveryFee + taxes;
        return { subtotal, deliveryFee, taxes, total };
    }
};

document.addEventListener('DOMContentLoaded', () => CartModule.updateBadge());
window.CartModule = CartModule;
