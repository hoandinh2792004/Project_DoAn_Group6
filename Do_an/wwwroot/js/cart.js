// Function to initialize the cart count and total price
function initializeCart() {
    const stripe = Stripe('pk_test_51QBtx3GCdl3dzztXq6dbzGmUufunk1FIialSltyAEh9Q7pSxzfu96yGKZVrTkefon58bXwfuLwYIsjSRfaf9OpPq00mQAFG6FE');
    const cartDisplayElement = document.getElementById('cart-display');
    const cartCountElement = document.getElementById('cart-item-count');

    if (cartDisplayElement) {
        const cart = loadCartFromStorage();
        cartDisplayElement.textContent = cart.length > 0 ? `You have ${cart.length} items in your cart.` : 'Your cart is empty.';
        if (cartCountElement) {  // Ensure cartCountElement exists
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


// Function to load products from sessionStorage
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

// Hàm cập nhật số lượng sản phẩm trong giỏ hàng
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
    // Cập nhật cho phần tử đếm giỏ hàng nếu tồn tại
    if (cartCount) {
        let totalCount = parseInt(cartCount.textContent) || 0; 
        totalCount += change; 
        cartCount.textContent = totalCount; 
    }
}


async function handleCheckout() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    // Calculate total amount in cents
    const totalAmount = cart.reduce((sum, item) => {
        // Giả sử item.price là giá đã được lưu dưới dạng số
        const priceInNumber = parseFloat(item.price) || 0; // Chuyển đổi thành số, nếu không được thì trả về 0
        return sum + (priceInNumber * item.qty ); // Nhân với số lượng và chuyển sang cents
    }, 0);

    // Kiểm tra tổng số tiền có vượt quá giới hạn của Stripe không
    if (totalAmount > 99999999) {
        alert("Total amount exceeds the limit for payment processing.");
        return;
    }

    // Prepare payload for the backend
    const paymentRequest = {
        PaymentAmount: totalAmount,
        AuctionID: 123,  // Thay thế với AuctionID thực tế
        UserID: 456      // Thay thế với UserID thực tế
    };

    console.log("Sending payment request:", paymentRequest); // Add logging to see what's being sent

    try {
        const response = await fetch('/api/payment/create-intent', {
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
        window.location.href = `/User/Payment?sessionId=${paymentData.sessionId}`;
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("An error occurred during the checkout process.");
    }
}



// Load products from sessionStorage on page load
document.addEventListener('DOMContentLoaded', () => {
    initializeCart();
    loadCartItems();

    // Add click event for the checkout button
    const checkoutButton = document.querySelector('.button-checkout');
    if (checkoutButton) {
        checkoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            handleCheckout();
        });
    }
});

// Add click event to all add-to-cart buttons
document.querySelectorAll('.add-to-cart').forEach(button => {
    button.addEventListener('click', function (e) {
        e.preventDefault();

        const productName = this.getAttribute('data-name');
        const productPrice = parseFloat(this.getAttribute('data-price'));
        const productImg = this.getAttribute('data-img');

        addToCart(productName, productPrice, productImg);
    });
});
