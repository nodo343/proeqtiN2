import { API_BASE, showNotification, checkAuth } from './common/common.js';

let state = {
    products: [],
    categories: [],
    cart: [],
    currentCategory: 'all',
    filters: {
        spiciness: 0,
        nuts: false,
        vegeterian: false
    }
};

const productsContainer = document.getElementById('products-container');
const categoriesContainer = document.getElementById('categories-container');

document.addEventListener('DOMContentLoaded', () => {
    init();
});

async function init() {
    const isAuthorized = checkAuth({ requireAuth: true });
    if (!isAuthorized) return;

    await Promise.all([
        fetchCategories(),
        fetchProducts(),
        fetchCart()
    ]);
    setupEventListeners();
}

async function fetchCategories() {
    try {
        const response = await fetch(`${API_BASE}/Categories/GetAll`);
        const data = await response.json();
        state.categories = data;
        renderCategories();
    } catch (error) {
        console.error('Error fetching categories:', error);
    }
}

async function fetchProducts() {
    try {
        const response = await fetch(`${API_BASE}/Products/GetAll`);
        const data = await response.json();
        state.products = data;
        renderProducts(data);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

async function fetchFilteredProducts() {
    const { spiciness, nuts, vegeterian } = state.filters;
    const categoryId = state.currentCategory === 'all' ? '' : state.currentCategory;

    const params = new URLSearchParams();
    if (vegeterian) params.append('vegeterian', true);
    if (nuts) params.append('nuts', false);
    if (spiciness > 0) params.append('spiciness', spiciness);
    if (categoryId) params.append('categoryId', categoryId);

    try {
        const response = await fetch(`${API_BASE}/Products/GetFiltered?${params.toString()}`);
        const data = await response.json();
        renderProducts(data);
    } catch (error) {
        console.error('Error filtering products:', error);
    }
}

async function fetchCart() {
    try {
        const response = await fetch(`${API_BASE}/Baskets/GetAll`);
        const data = await response.json();
        state.cart = data;
    } catch (error) {
        console.error('Error fetching cart:', error);
    }
}

async function addToCart(productId) {
    try {
        const existing = state.cart.find(item => item.product && item.product.id === productId);

        if (existing) {
            await updateCartItem(productId, existing.quantity + 1);
        } else {
            const product = state.products.find(p => p.id === productId);
            const response = await fetch(`${API_BASE}/Baskets/AddToBasket`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    productId: productId,
                    quantity: 1,
                    price: product ? product.price : 0
                })
            });
            if (response.ok) {
                showNotification('success', 'Added!', 'Product added to your cart.');
                await fetchCart();
            } else {
                await fetchCart();
                const newExisting = state.cart.find(item => item.product && item.product.id === productId);
                if (newExisting) {
                    await updateCartItem(productId, newExisting.quantity + 1);
                }
            }
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('error', 'Ops!', 'Something went wrong.');
    }
}

async function updateCartItem(productId, quantity) {
    const item = state.cart.find(i => i.product && i.product.id === productId);
    const price = item ? item.price : 0;

    try {
        await fetch(`${API_BASE}/Baskets/UpdateBasket`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                productId: productId,
                quantity: quantity,
                price: price
            })
        });
        showNotification('success', 'Updated!', 'Cart quantity updated.');
        await fetchCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

function renderCategories() {
    const html = state.categories.map(cat => `
        <button class="category-item ${state.currentCategory === cat.id ? 'active' : ''}" data-id="${cat.id}">
            ${cat.name}
        </button>
    `).join('');

    categoriesContainer.innerHTML = `
        <button class="category-item ${state.currentCategory === 'all' ? 'active' : ''}" data-id="all">All</button>
        ${html}
    `;

    document.querySelectorAll('.category-item').forEach(btn => {
        btn.addEventListener('click', (e) => {
            state.currentCategory = e.target.dataset.id === 'all' ? 'all' : parseInt(e.target.dataset.id);
            document.querySelectorAll('.category-item').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            if (window.innerWidth <= 900) {
                categoriesContainer.classList.remove('active');
                const categoryMobileToggle = document.getElementById('category-mobile-toggle');
                const icon = categoryMobileToggle.querySelector('i');
                icon.classList.add('fa-chevron-down');
                icon.classList.remove('fa-chevron-up');
            }
            fetchFilteredProducts();
        });
    });
}

function renderProducts(products) {
    if (!products || products.length === 0) {
        productsContainer.innerHTML = '<div class="no-products">No products found matching filters.</div>';
        return;
    }

    productsContainer.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image" onerror="this.src='https://via.placeholder.com/300x200?text=Food+Image'">
            <div class="product-info">
                <h3 class="product-title">${product.name}</h3>
                <div class="product-details">
                    Spiciness: ${product.spiciness}
                </div>
                <div class="product-tags">
                    <span class="tag-icon ${product.nuts ? 'active' : 'inactive'}" title="Contains Nuts">
                        <i class="fas fa-leaf"></i> Nuts
                    </span>
                    <span class="tag-icon ${product.vegeterian ? 'active' : 'inactive'}" title="Vegetarian">
                        <i class="fas fa-carrot"></i> Vegeterian
                    </span>
                </div>
                <div class="product-price-row">
                    <span class="price">$ ${product.price}</span>
                    <button class="add-to-cart-btn" data-id="${product.id}">Add to cart</button>
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.add-to-cart-btn').forEach(btn => {
        btn.addEventListener('click', () => addToCart(parseInt(btn.dataset.id)));
    });
}

function setupEventListeners() {
    const mobileToggle = document.getElementById('mobile-toggle');
    const mainNav = document.getElementById('main-nav');

    mobileToggle.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    const categoryMobileToggle = document.getElementById('category-mobile-toggle');
    const categoriesContainer = document.getElementById('categories-container');

    categoryMobileToggle.addEventListener('click', () => {
        categoriesContainer.classList.toggle('active');
        const icon = categoryMobileToggle.querySelector('i');
        icon.classList.toggle('fa-chevron-down');
        icon.classList.toggle('fa-chevron-up');
    });

    const spicinessInput = document.getElementById('spiciness-filter');
    const spicinessValue = document.getElementById('spiciness-value');
    spicinessInput.addEventListener('input', (e) => {
        const val = e.target.value;
        spicinessValue.innerText = val == 0 ? 'Not Chosen' : val;
        state.filters.spiciness = parseInt(val);
    });

    const nutsFilter = document.getElementById('nuts-filter');
    nutsFilter.addEventListener('change', (e) => {
        state.filters.nuts = e.target.checked;
    });

    const vegFilter = document.getElementById('veg-filter');
    vegFilter.addEventListener('change', (e) => {
        state.filters.vegeterian = e.target.checked;
    });

    document.getElementById('apply-filter').addEventListener('click', () => {
        fetchFilteredProducts();
    });

    document.getElementById('reset-filter').addEventListener('click', () => {
        state.filters = { spiciness: 0, nuts: false, vegeterian: false };
        spicinessInput.value = 0;
        spicinessValue.innerText = 'Not Chosen';
        nutsFilter.checked = false;
        vegFilter.checked = false;
        state.currentCategory = 'all';
        renderCategories();
        fetchProducts();
    });
}
