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
        // Cập nhật phí vận chuyển và chuyển sang dạng số
        shippingFee = parseInt(fee);

        // Cập nhật lại tổng đơn hàng
        updateOrderTotal();

        // Loại bỏ lớp 'selected' khỏi tất cả các phương thức vận chuyển
        document.querySelectorAll('.ship-method').forEach(el => {
            el.classList.remove('selected');
        });

        // Thêm lớp 'selected' vào phương thức đang chọn
        element.closest('.ship-method').classList.add('selected');
    };



    // Hàm hiển thị giỏ hàng và cập nhật tổng ban đầu
    function displayCartItems() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
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
                deleteItem(event, productName, productPrice, currentQty);
                return;
            }

            cart[itemIndex].qty = newQty;
            updateCartInStorage(cart);
            displayCartItems(); // Cập nhật hiển thị

            // Cập nhật số lượng và tổng giá trị
            updateCartCount(change);
            updateTotalPrice(productPrice * change);
        }
    }

    // Function to delete an item
    function deleteItem(event, productName) {
        event.preventDefault();

        let cart = loadCartFromStorage();
        cart = cart.filter(item => !checkItemNameMatch(item.name, productName));
        updateCartInStorage(cart);
        displayCartItems(); // Cập nhật hiển thị

        console.log("Cart after item removed:", cart);
    }

    function checkItemNameMatch(itemName, productName) {
        if (!isNaN(productName) && !isNaN(itemName)) {
            // Cả hai đều là số, so sánh số nguyên
            return parseInt(itemName) === parseInt(productName);
        } else {
            // Ít nhất một trong hai là chuỗi, so sánh trực tiếp
            return itemName === productName;
        }
    }


    async function initializeStripe() {
        const stripe = Stripe('pk_test_51QBtx3GCdl3dzztXq6dbzGmUufunk1FIialSltyAEh9Q7pSxzfu96yGKZVrTkefon58bXwfuLwYIsjSRfaf9OpPq00mQAFG6FE');
        const elements = stripe.elements();

        // Define the style for the inputs
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

        // Create separate elements for card number, expiration, and CVV
        const cardNumber = elements.create('cardNumber', { style });
        const cardExpiry = elements.create('cardExpiry', { style });
        const cardCvc = elements.create('cardCvc', { style });

        // Mount them to the corresponding DOM elements
        cardNumber.mount('#card-number');
        cardExpiry.mount('#card-expiry');
        cardCvc.mount('#card-cvc');

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirm-payment';
        confirmButton.classList.add('btn', 'btn-primary');
        confirmButton.textContent = 'Pay';
        confirmButton.disabled = true; // Initially disabled
        confirmButton.onclick = confirmPayment;

        // Style the button when it's disabled
        confirmButton.style.backgroundColor = '#d3d3d3'; // Gray background
        confirmButton.style.cursor = 'not-allowed'; // Change cursor to indicate disabled state
        confirmButton.style.color = '#808080'; // Gray text

        document.getElementById('card').appendChild(confirmButton);

        // Monitor changes in card elements and enable the button once the card is valid
        cardNumber.on('change', function (event) {
            if (event.complete) {
                confirmButton.disabled = false;
                // Style the button when enabled
                confirmButton.style.backgroundColor = '#007bff'; // Blue background (or change to your preferred active color)
                confirmButton.style.cursor = 'pointer'; // Change cursor to indicate enabled state
                confirmButton.style.color = '#ffffff'; // White text
            } else {
                confirmButton.disabled = true;
                // Style the button when disabled
                confirmButton.style.backgroundColor = '#d3d3d3'; // Gray background
                confirmButton.style.cursor = 'not-allowed'; // Change cursor to indicate disabled state
                confirmButton.style.color = '#808080'; // Gray text
            }

            if (event.error) {
                document.getElementById('card-errors').textContent = event.error.message;
            } else {
                document.getElementById('card-errors').textContent = '';
            }
        });

        cardExpiry.on('change', function (event) {
            // Add similar validation for expiration date here if needed
        });

        cardCvc.on('change', function (event) {
            // Add similar validation for CVV here if needed
        });

        async function confirmPayment(event) {
            event.preventDefault(); // Prevent form submission

            const totalAmount = calculateTotalAmount();
            if (totalAmount <= 0) {
                alert("Số tiền phải lớn hơn 0 để thực hiện thanh toán.");
                return;
            }

            // Get cart items
            const cartItems = getCartItems();
            if (cartItems.length === 0) {
                alert("Giỏ hàng của bạn hiện đang trống.");
                return;
            }

            try {
                // Create a checkout session with the payment amount
                const response = await fetch('http://localhost:5135/api/payment/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ PaymentAmount: totalAmount }),
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    document.getElementById('card-errors').textContent = errorData.error || "Đã xảy ra lỗi khi tạo checkout session.";
                    return;
                }

                const { sessionId } = await response.json();

                // Proceed with uploading cart data if checkout session was created successfully
                const uploadResponse = await fetch('http://localhost:5135/api/cart/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(cartItems),
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.text();
                    console.error("Lỗi khi tải dữ liệu giỏ hàng:", uploadError);
                    alert("Đã xảy ra lỗi khi tải dữ liệu giỏ hàng lên: " + uploadError);
                } else {
                    // If successful, clear the cart and redirect
                    alert('Thanh toán thành công!');
                    clearCart();
                    window.location.href = '/User/UserDashboard';
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu giỏ hàng lên: ", error);
                alert("Đã xảy ra lỗi khi tải dữ liệu giỏ hàng lên: " + error.message);
            }
        }
    }

    function getCartItems() {
        const cart = [];
        const storedItems = JSON.parse(sessionStorage.getItem('cart')) || [];

        storedItems.forEach(item => {
            cart.push({ 
                Name: item.name,
                Price: item.price,
                Quantity: item.qty, // Sử dụng qty thay vì quantity
            });
        });

        return cart;
    }



    // Gọi hàm khởi tạo Stripe khi tài liệu sẵn sàng
    document.addEventListener("DOMContentLoaded", initializeStripe);


    // Không gọi hàm clearCart để giữ lại giỏ hàng sau khi thanh toán cho việc thử nghiệm
    function clearCart() {
        sessionStorage.removeItem('cart');
    }

    displayCartItems();
    initializeStripe();

    window.syncCart = function () {
        displayCartItems();
    };
});