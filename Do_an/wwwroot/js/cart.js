// Function to initialize the cart count and total price
function initializeCart() {
    const cartDisplayElement = document.getElementById('cart-display');
    const cartCountElement = document.getElementById('cart-item-count');

    if (cartDisplayElement) {
        const cart = loadCartFromStorage();
        cartDisplayElement.textContent = cart.length > 0 ? `You have ${cart.length} items in your cart.` : 'Your cart is empty.';
        // Initialize cart item count display
        cartCountElement.textContent = cart.length;
        cartCountElement.style.display = cart.length > 0 ? 'block' : 'none'; // Show or hide based on count
    } else {
        console.warn('Cart display element not found.'); // Thông báo nếu không tìm thấy
    }
}

// Function to add a product to the cart
function addToCart(productName, productPrice, productImg, productQty = 1) {
    const cartItems = document.querySelector('.cart-items ol');

    // Check if the item already exists in session storage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        // Nếu sản phẩm đã tồn tại, hiển thị thông báo
        alert(`The product "${productName}" is already in your cart.`);

        // Update quantity if product already exists
        existingItem.qty += productQty;

        // Update displayed quantity in the cart
        const existingItemElement = Array.from(cartItems.children).find(item => {
            return item.querySelector('.product-name-mini span').textContent === productName;
        });
        if (existingItemElement) {
            const qtyElement = existingItemElement.querySelector('.qty-value');
            qtyElement.textContent = existingItem.qty; // Update the displayed quantity
            const productPriceElement = existingItemElement.querySelector('.product-price');
            productPriceElement.textContent = `$${(existingItem.qty * productPrice).toFixed(2)}`; // Update the displayed price
        }
    } else {
        // Add new item to the cart
        cart.push({ name: productName, price: productPrice, img: productImg, qty: productQty });
        const newItem = createCartItemElement(productName, productPrice, productImg, productQty);
        cartItems.appendChild(newItem);
    }

    sessionStorage.setItem('cart', JSON.stringify(cart)); // Save cart to sessionStorage

    // Update total count and price
    updateCartCount(productQty);
    updateTotalPrice(productPrice * productQty);
}

// Function to create an HTML element for the cart item
function createCartItemElement(productName, productPrice, productImg, productQty) {
    const newItem = document.createElement('li');
    newItem.classList.add('d-flex');
    newItem.innerHTML = `
        <div class="img-product-cart">
            <a href="">
                <img src="${productImg}" alt="${productName}" style="max-width: 100%;">
            </a>
        </div>
        <div class="product-detail-cart">
            <h3 class="product-name-mini">
                <a href="">
                    <span>${productName}</span>
                </a>
            </h3>
            <div class="product-info-cart">
                <div class="product-quantity-mini">
                    <button class="qty-btn" onclick="updateQuantity(this, ${productPrice}, -1)">-</button>
                    <span class="qty-value">${productQty}</span>
                    <button class="qty-btn" onclick="updateQuantity(this, ${productPrice}, 1)">+</button>
                </div>
                <div class="product-price-mini">
                    <span class="product-price">$${(productPrice * productQty).toFixed(2)}</span>
                </div>
            </div>
        </div>
        <div class="product-remove">
            <a href="#" class="delete-item" onclick="deleteItem(this, ${productPrice}, ${productQty})">
                <i class="fa-solid fa-trash"></i>
            </a>
        </div>
    `;
    return newItem;
}

// Function to load products from sessionStorage
function loadCartItems() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let totalQuantity = 0; // Initialize total quantity
    cart.forEach(item => {
        const cartItems = document.querySelector('.cart-items ol');
        const newItem = createCartItemElement(item.name, item.price, item.img, item.qty);
        cartItems.appendChild(newItem);
        totalQuantity += item.qty; // Accumulate total quantity
        updateTotalPrice(item.price * item.qty); // Update total price for each item
    });
    updateCartCount(totalQuantity); // Update cart count after loading items
}

// Function to update the total price
function updateTotalPrice(priceChange) {
    const totalPriceElement = document.getElementById('total-price');
    let currentTotal = parseFloat(totalPriceElement.textContent.replace('$', '').replace(',', '')) || 0; // Remove $ and handle formatting
    totalPriceElement.textContent = `$${(currentTotal + priceChange).toFixed(2)}`; // Format to two decimal places
}

// Function to update product quantity
function updateQuantity(element, productPrice, change) {
    const qtyElement = element.closest('.product-quantity-mini').querySelector('.qty-value');
    let currentQty = parseInt(qtyElement.textContent);
    let newQty = currentQty + change;

    // Prevent quantity from going below 1
    if (newQty < 1) {
        deleteItem(element, productPrice, currentQty); // Remove item if quantity is less than 1
        return;
    }

    // Update displayed quantity and price
    qtyElement.textContent = newQty;
    const productPriceElement = element.closest('.product-info-cart').querySelector('.product-price');
    productPriceElement.textContent = `$${(newQty * productPrice).toFixed(2)}`;

    // Update total values
    updateCartCount(change);
    updateTotalPrice(productPrice * change); // Update total price based on quantity change

    // Update product in sessionStorage
    updateCartItemInStorage(element, productPrice, newQty);
}

// Function to update product in sessionStorage
function updateCartItemInStorage(element, productPrice, newQty) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const productName = element.closest('.product-detail-cart').querySelector('.product-name-mini span').textContent;

    // Find and update the item in the cart
    const itemIndex = cart.findIndex(item => item.name === productName);
    if (itemIndex !== -1) {
        cart[itemIndex].qty = newQty; // Update the quantity
        sessionStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart to sessionStorage
    }
}

function deleteItem(element, productPrice, quantity) {
    // Remove the product from the display
    const itemElement = element.closest('li');
    const productName = itemElement.querySelector('.product-name-mini span').textContent;

    // Remove the product from sessionStorage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.name !== productName); // Filter out the item to be removed
    sessionStorage.setItem('cart', JSON.stringify(cart)); // Save updated cart to sessionStorage

    // Update total count and price
    updateCartCount(-quantity);  // Decrease product count
    updateTotalPrice(-productPrice * quantity);  // Decrease total price

    // Remove the product from the display
    itemElement.remove();
}

// Function to update the cart count
function updateCartCount(change) {
    const cartCountElement = document.getElementById('cart-item-count');
    let currentCount = parseInt(cartCountElement.textContent) || 0; // Default to 0 if null
    currentCount += change;
    cartCountElement.textContent = currentCount;
    cartCountElement.style.display = currentCount > 0 ? 'block' : 'none'; // Hiển thị hoặc ẩn số lượng
}

// Load products from sessionStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCart(); // Initialize cart count and total price
    loadCartItems(); // Load cart items
});

// Add click event to all add-to-cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();

        const productName = this.getAttribute('data-name');
        const productPrice = parseFloat(this.getAttribute('data-price'));
        const productImg = this.getAttribute('data-img');

        // Call addToCart to add product to cart
        addToCart(productName, productPrice, productImg);
    });
});
