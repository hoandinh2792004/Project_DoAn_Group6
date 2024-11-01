﻿// Function to initialize the cart count and total price
function initializeCart() {
    const cartDisplayElement = document.getElementById('cart-display');
    const cartCountElement = document.getElementById('cart-item-count');

    if (cartDisplayElement) {
        const cart = loadCartFromStorage();
        cartDisplayElement.textContent = cart.length > 0 ? `You have ${cart.length} items in your cart.` : 'Your cart is empty.';
        if (cartCountElement) {
            // Initialize cart item count display
            cartCountElement.textContent = cart.length;
            cartCountElement.style.display = cart.length > 0 ? 'block' : 'none'; // Show or hide based on count
        }
    } else {
        console.warn('Cart display element not found.');
    }
}


// Function to add a product to the cart
function addToCart(productName, productPrice, productImg, productQty = 1) {
    const cartItems = document.querySelector('.cart-items ol');

    // Check if the item already exists in session storage
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const existingItem = cart.find(item => item.name === productName);

    if (existingItem) {
        alert(`The product "${productName}" is already in your cart.`);
        existingItem.qty += productQty;

        // Update displayed quantity in the cart
        const existingItemElement = Array.from(cartItems.children).find(item => {
            return item.querySelector('.product-name-mini span').textContent === productName;
        });
        if (existingItemElement) {
            const qtyElement = existingItemElement.querySelector('.qty-value');
            qtyElement.textContent = existingItem.qty;
            const productPriceElement = existingItemElement.querySelector('.product-price');
            productPriceElement.textContent = formatPrice(existingItem.qty * productPrice); // Update price format
        }
    } else {
        cart.push({ name: productName, price: productPrice, img: productImg, qty: productQty });
        const newItem = createCartItemElement(productName, productPrice, productImg, productQty);
        cartItems.appendChild(newItem);
    }

    sessionStorage.setItem('cart', JSON.stringify(cart));

    // Update total count and price
    updateCartCount(productQty);
    updateTotalPrice(productPrice * productQty);
}

// Function to format price to Vietnamese currency
function formatPrice(price) {
    return price.toLocaleString('vi-VN') + 'đ';
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
                    <span class="product-price">${formatPrice(productPrice * productQty)}</span>
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

// Load products from sessionStorage
function loadCartItems() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    let totalQuantity = 0;
    const cartItems = document.querySelector('.cart-items ol');

    if (!cartItems) {
        console.warn('Cart items container not found.');
        return;
    }

    cart.forEach(item => {
        const newItem = createCartItemElement(item.name, item.price, item.img, item.qty);
        cartItems.appendChild(newItem);
        totalQuantity += item.qty;
        updateTotalPrice(item.price * item.qty);
    });
    updateCartCount(totalQuantity);
}

// Function to clear the cart
function clearCart() {
    sessionStorage.removeItem('cart'); // Xóa giỏ hàng từ sessionStorage
    const cartItems = document.querySelector('.cart-items ol');
    if (cartItems) {
        cartItems.innerHTML = ''; // Xóa tất cả các mục trong giao diện giỏ hàng
    }
    updateCartCount(0); // Cập nhật số lượng giỏ hàng
    const totalPriceElement = document.getElementById('total-price');
    if (totalPriceElement) {
        totalPriceElement.textContent = formatPrice(0); // Cập nhật giá trị tổng là 0
    }
}

// Function to update total price
function updateTotalPrice(priceChange) {
    const totalPriceElement = document.getElementById('total-price');
    if (!totalPriceElement) {
        console.warn('Total price element not found.');
        return;
    }

    let currentTotal = parseFloat(totalPriceElement.textContent.replace('đ', '').replace('.', '').replace(',', '')) || 0;
    totalPriceElement.textContent = formatPrice(currentTotal + priceChange);
}

// Function to update product quantity
function updateQuantity(element, productPrice, change) {
    const qtyElement = element.closest('.product-quantity-mini').querySelector('.qty-value');
    let currentQty = parseInt(qtyElement.textContent);
    let newQty = currentQty + change;

    if (newQty < 1) {
        deleteItem(element, productPrice, currentQty);
        return;
    }

    qtyElement.textContent = newQty;
    const productPriceElement = element.closest('.product-info-cart').querySelector('.product-price');
    productPriceElement.textContent = formatPrice(newQty * productPrice);

    updateCartCount(change);
    updateTotalPrice(productPrice * change);

    updateCartItemInStorage(element, productPrice, newQty);
}

// Function to update product in sessionStorage
function updateCartItemInStorage(element, productPrice, newQty) {
    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    const productName = element.closest('.product-detail-cart').querySelector('.product-name-mini span').textContent;

    const itemIndex = cart.findIndex(item => item.name === productName);
    if (itemIndex !== -1) {
        cart[itemIndex].qty = newQty;
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }
}

function deleteItem(element, productPrice, quantity) {
    const itemElement = element.closest('li');
    const productName = itemElement.querySelector('.product-name-mini span').textContent;

    let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    cart = cart.filter(item => item.name !== productName);
    sessionStorage.setItem('cart', JSON.stringify(cart));

    updateCartCount(-quantity);
    updateTotalPrice(-productPrice * quantity);

    itemElement.remove();
}

// Function to update cart count
function updateCartCount(change) {
    const cartCountElement = document.getElementById('cart-item-count');
    const cartCount = document.getElementById('cart-count');
    if (cartCountElement) {
        let currentCount = parseInt(cartCountElement.textContent) || 0;
        currentCount += change;
        cartCountElement.textContent = currentCount;
        cartCountElement.style.display = currentCount > 0 ? 'block' : 'none';
    } else {
        console.warn('Cart item count element not found.');
    }
    // Update the cart count display element if it exists
    if (cartCount) {
        let totalCount = parseInt(cartCount.textContent) || 0;
        totalCount += change;
        cartCount.textContent = totalCount;
    }
}

// Handle checkout process
async function handleCheckout() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Calculate total amount in cents
    const totalAmount = cart.reduce((sum, item) => {
        const priceInNumber = parseFloat(item.price) || 0; // Convert to number, return 0 if invalid
        return sum + (priceInNumber * item.qty); // Multiply by quantity
    }, 0);

    // Check if total amount exceeds Stripe's limit
    if (totalAmount > 99999999) {
        alert("Total amount exceeds the limit for payment processing.");
        return;
    }

    // Prepare payload for the backend
    const paymentRequest = {
        PaymentAmount: totalAmount,
        AuctionID: 123,  // Replace with actual AuctionID
        UserID: 456      // Replace with actual UserID
    };

    console.log("Sending payment request:", paymentRequest); // Log request details

    try {
        const response = await fetch('http://localhost:5135/api/payment/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentRequest)
        });

        console.log("Backend response status:", response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Response error text:", errorText);
            throw new Error("Failed to create payment intent");
        }

        const paymentData = await response.json();
        console.log("Payment data received:", paymentData);

        // Redirect to the payment page with sessionId
        window.location.href = `/User/Payment?sessionId=${paymentData.id}`;
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("There was an error processing your payment. Please try again.");
    }
}

// Load cart items on page load
document.addEventListener('DOMContentLoaded', () => {
    loadCartItems();
    initializeCart();

    // Add click event for the checkout button
    const checkoutButton = document.querySelector('.button-checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout();
        });
    }

    // Add click event to the new add-to-cart button
    document.querySelectorAll('.add-to-cart').forEach(button => {
        button.addEventListener('click', function (e) {
            e.preventDefault(); // Ngăn hành động mặc định của thẻ <a>

            const productName = this.getAttribute('data-name');
            const productPrice = parseFloat(this.getAttribute('data-price').replace('$', '')); // Xóa '$' và chuyển đổi sang float
            const productImg = this.getAttribute('data-img');

            console.log(`Adding to cart: ${productName}, Price: ${productPrice}, Image: ${productImg}`);
            addToCart(productName, productPrice, productImg); // Gọi hàm thêm vào giỏ hàng
        });
    });
});
