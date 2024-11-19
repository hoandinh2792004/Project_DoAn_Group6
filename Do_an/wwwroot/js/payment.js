document.addEventListener('DOMContentLoaded', function () {
    const reviewOrderBody = document.getElementById('review-order-body');
    let elements;
    let stripe;
    let clientSecret;
    let shippingFee = 0;

    function loadCartFromStorage() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        return cart;
    }
    const cartItems = loadCartFromStorage();  // Replace getCartItems with loadCartFromStorage
    if (cartItems.length === 0) {
        alert("Giỏ hàng của bạn hiện đang trống.");
        return;
    }

    function updateCartInStorage(cart) {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }

    function calculateTotalAmount() {
        let total = 0;
        const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
        cartItems.forEach(item => {
            total += item.price * item.qty;
        });
        return total;
    }

    // Hàm để tính toán tổng tiền bao gồm cả phí vận chuyển
    function calculateOrderTotal(subtotal) {
        return subtotal + shippingFee;
    }

    function updateOrderTotal() {
        const cartItems = JSON.parse(sessionStorage.getItem('cart')) || [];
        let subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
        let orderTotal = calculateOrderTotal(subtotal);

        const orderTotalElement = document.querySelector('.order-total');
        if (orderTotalElement) {
            orderTotalElement.textContent = `${orderTotal.toLocaleString()} đ`;
        }
    }

    // Hàm để xử lý khi chọn phương thức vận chuyển
    window.handleShippingMethodSelection = function (method, fee, element) {
        shippingFee = parseInt(fee);
        updateOrderTotal();

        document.querySelectorAll('.ship-method').forEach(el => {
            el.classList.remove('selected');
        });

        element.closest('.ship-method').classList.add('selected');
    };

    // Hàm hiển thị giỏ hàng và cập nhật tổng ban đầu
    function displayCartItems() {
        const cart = loadCartFromStorage();
        let subtotal = 0;
        let cartHtml = '';

        if (cart.length === 0) {
            reviewOrderBody.innerHTML = '<p>Không có sản phẩm nào trong giỏ hàng của bạn.</p>';
            return;
        }

        cart.forEach(item => {
            const { name: productName, price: productPrice, img: productImg, qty: productQty } = item;
            const itemTotal = productPrice * productQty;
            subtotal += itemTotal;

            cartHtml += `
                <div class="product-item">
                    <div class="form-group">
                        <div class="col-sm-3">
                            <img class="img-responsive" src="${productImg}" alt="${productName}" />
                        </div>
                        <div class="col-sm-6">
                            <div>${productName}</div>
                            <div class="product-quantity">
                                <button class="qty-btn decrease" data-product-name="${productName}" data-product-price="${productPrice}">-</button>
                                <span class="qty-value">${productQty}</span>
                                <button class="qty-btn increase" data-product-name="${productName}" data-product-price="${productPrice}">+</button>
                            </div>
                        </div>
                        <div class="col-sm-3 text-right">
                            <h6><span class="item-total">${itemTotal.toLocaleString()} đ</span></h6>
                            <button class="delete-btn" data-product-name="${productName}">
                                <i class="fa-solid fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    <hr />
                </div>
            `;
        });

        let orderTotal = calculateOrderTotal(subtotal);
        cartHtml += `
            <div class="form-group">
                <div class="col-xs-12">
                    <strong>Đơn hàng</strong>
                    <div class="pull-right"><span>${subtotal.toLocaleString()}</span><span>đ</span></div>
                </div>
            </div>
            <hr />
            <div class="form-group">
                <div class="col-xs-12">
                    <strong>Tổng đơn hàng</strong>
                    <div class="pull-right"><span class="order-total">${orderTotal.toLocaleString()}</span><span>đ</span></div>
                </div>
            </div>
        `;

        reviewOrderBody.innerHTML = cartHtml;

        // Thêm sự kiện cho các nút tăng/giảm
        reviewOrderBody.querySelectorAll('.qty-btn.decrease').forEach(button => {
            button.addEventListener('click', (event) => updateQuantity(event, button.dataset.productName, parseInt(button.dataset.productPrice), -1));
        });

        reviewOrderBody.querySelectorAll('.qty-btn.increase').forEach(button => {
            button.addEventListener('click', (event) => updateQuantity(event, button.dataset.productName, parseInt(button.dataset.productPrice), 1));
        });

        // Thêm sự kiện xóa
        reviewOrderBody.querySelectorAll('.delete-btn').forEach(button => {
            button.addEventListener('click', (event) => deleteItem(event, button.dataset.productName));
        });
    }

    function updateQuantity(event, productName, productPrice, change) {
        event.preventDefault();
        const cart = loadCartFromStorage();
        const itemIndex = cart.findIndex(item => checkItemNameMatch(item.name, productName));

        if (itemIndex !== -1) {
            let currentQty = cart[itemIndex].qty;
            let newQty = currentQty + change;

            if (newQty < 1) {
                deleteItem(event, productName);  // Chỉ cần gọi deleteItem với 2 tham số
                return;
            }

            cart[itemIndex].qty = newQty;
            updateCartInStorage(cart);
            displayCartItems();  // Cập nhật lại hiển thị
            updateCartCount(change);
            updateTotalPrice(productPrice * change);
        }
    }


    function deleteItem(event, productName) {
        event.preventDefault();
        let cart = loadCartFromStorage();
        cart = cart.filter(item => !checkItemNameMatch(item.name, productName));
        updateCartInStorage(cart);
        displayCartItems(); // Cập nhật lại giỏ hàng sau khi xóa
    }


    function checkItemNameMatch(itemName, productName) {
        return itemName === productName;
    }

    async function initializeStripe() {
        const stripe = Stripe('pk_test_51QBtx3GCdl3dzztXq6dbzGmUufunk1FIialSltyAEh9Q7pSxzfu96yGKZVrTkefon58bXwfuLwYIsjSRfaf9OpPq00mQAFG6FE');
        const elements = stripe.elements();

        const style = {
            base: {
                color: "#32325d",
                fontFamily: 'Arial, sans-serif',
                fontSize: "16px",
                "::placeholder": {
                    color: "#aab7c4",
                },
            },
            invalid: {
                color: "#fa755a",
                iconColor: "#fa755a",
            },
        };

        const cardNumber = elements.create('cardNumber', { style });
        const cardExpiry = elements.create('cardExpiry', { style });
        const cardCvc = elements.create('cardCvc', { style });

        cardNumber.mount('#card-number');
        cardExpiry.mount('#card-expiry');
        cardCvc.mount('#card-cvc');

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirm-payment';
        confirmButton.classList.add('btn', 'btn-primary');
        confirmButton.textContent = 'Pay';
        confirmButton.disabled = true;

        confirmButton.style.backgroundColor = '#d3d3d3';
        confirmButton.style.cursor = 'not-allowed';
        confirmButton.style.color = '#808080';

        document.getElementById('card').appendChild(confirmButton);

        cardNumber.on('change', function (event) {
            confirmButton.disabled = !event.complete;
            confirmButton.style.backgroundColor = event.complete ? '#007bff' : '#d3d3d3';
            confirmButton.style.cursor = event.complete ? 'pointer' : 'not-allowed';
            confirmButton.style.color = event.complete ? '#ffffff' : '#808080';

            if (event.error) {
                document.getElementById('card-errors').textContent = event.error.message;
            } else {
                document.getElementById('card-errors').textContent = '';
            }
        });

        confirmButton.onclick = confirmPayment;
    }

    async function confirmPayment(event) {
        event.preventDefault();

        const totalAmount = calculateTotalAmount();
        if (totalAmount <= 0) {
            alert("Số tiền phải lớn hơn 0 để thực hiện thanh toán.");
            return;
        }

        const cartItems = getCartItems();
        if (cartItems.length === 0) {
            alert("Giỏ hàng của bạn hiện đang trống.");
            return;
        }

        const response = await fetch('http://localhost:5135/api/payment/create-checkout-session', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ PaymentAmount: totalAmount })
        });

        if (!response.ok) {
            const errorData = await response.json();
            document.getElementById('card-errors').textContent = errorData.error || "Đã xảy ra lỗi khi tạo checkout session.";
            return;
        }

        const { clientSecret } = await response.json();

        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: elements.getElement('cardNumber'),
                billing_details: { name: 'Tên khách hàng' },
            }
        });

        if (error) {
            document.getElementById('card-errors').textContent = error.message;
        } else {
            // Handle successful payment
            alert("Thanh toán thành công!");
            clearCart();
        }
    }

    function clearCart() {
        sessionStorage.removeItem('cart');
        displayCartItems(); // Reset cart display
    }

    // Initialize stripe and cart display
    initializeStripe();
    displayCartItems();
});
