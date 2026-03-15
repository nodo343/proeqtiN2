import { API_BASE, showNotification, checkAuth, renderAuthNavigation } from '../common/common.js';

let cart = [];

async function init() {
    const isAuthorized = checkAuth({ requireAuth: true });
    if (!isAuthorized) return;

    renderAuthNavigation();

    await fetchCart();
    setupEventListeners();
}

async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE}/Baskets/GetAll`);
        const data = await response.json();
        cart = data;
        renderCart();
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

function renderCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total-price');

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<tr><td colspan="5" style="text-align:center; padding: 50px;">Your cart is empty</td></tr>';
        cartTotalElement.innerText = '$ 0';
        return;
    }

    let total = 0;
    cartItemsContainer.innerHTML = cart.map(item => {
        const product = item.product || { id: 0, image: '', name: 'Unknown' };
        const itemTotal = item.price * item.quantity;
        total += itemTotal;

        return `
            <tr>
                <td>
                    <div class="cart-actions">
                        <i class="fas fa-times remove-btn" data-id="${product.id}" title="Remove"></i>
                        <i class="fas fa-pencil-alt edit-icon" title="Edit"></i>
                    </div>
                </td>
                <td>
                    <div class="cart-product-cell">
                        <img src="${product.image}" alt="${product.name}" class="cart-product-img" onerror="this.src='https://via.placeholder.com/60x60?text=Img'">
                        <span>${product.name}</span>
                    </div>
                </td>
                <td>
                    <div class="qty-control">
                        <button class="qty-btn" data-id="${product.id}" data-action="decrease">-</button>
                        <span>${item.quantity}</span>
                        <button class="qty-btn" data-id="${product.id}" data-action="increase">+</button>
                    </div>
                </td>
                <td>$ ${item.price}</td>
                <td>$ ${itemTotal}</td>
            </tr>
        `;
    }).join('');

    cartTotalElement.innerText = `$ ${total}`;

    document.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => removeFromCart(btn.dataset.id));
    });

    document.querySelectorAll('.qty-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const id = btn.dataset.id;
            const action = btn.dataset.action;
            const item = cart.find(i => i.product && i.product.id == id);
            if (action === 'increase') {
                updateCartItem(id, item.quantity + 1);
            } else {
                updateCartItem(id, item.quantity - 1);
            }
        });
    });
}

async function updateCartItem(productId, quantity) {
    if (quantity < 1) {
        return removeFromCart(productId);
    }

    const item = cart.find(i => i.product && i.product.id == productId);
    const price = item ? item.price : 0;

    try {
        const response = await fetch(`${API_BASE}/Baskets/UpdateBasket`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: parseInt(productId),
                quantity: quantity,
                price: price
            })
        });
        if (response.ok) {
            await fetchCart();
        }
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

async function removeFromCart(productId) {
    try {
        const response = await fetch(`${API_BASE}/Baskets/DeleteProduct/${productId}`, {
            method: 'DELETE'
        });
        if (response.ok) {
            showNotification('success', 'Removed', 'Item removed from cart.');
            await fetchCart();
        }
    } catch (error) {
        console.error('Error removing from cart:', error);
    }
}

function setupEventListeners() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');

    mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    document.getElementById('checkout-btn').addEventListener('click', () => {
        if (cart.length === 0) {
            showNotification('error', 'Empty Cart', 'Add some items before checkout!');
        } else {
            showNotification('success', 'Success', 'Proceeding to checkout...');
        }
    });
}

init();
