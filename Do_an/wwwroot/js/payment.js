document.addEventListener('DOMContentLoaded', function () {

    // Declare global variables
    const reviewOrderBody = document.getElementById('review-order-body');
    let stripe;
    let elements;
    let clientSecret;
    let shippingFee = 0;

    // Hàm để xử lý khi chọn phương thức vận chuyển
    window.handleShippingMethodSelection = function (method, fee, element) {
        console.log("Selected Shipping Method: " + method + " with Fee: " + fee);
        shippingFee = parseInt(fee);

        // Cập nhật tổng tiền
        updateOrderTotal();

        // Xóa tất cả lớp 'selected' ở các phương thức vận chuyển
        document.querySelectorAll('.ship-method').forEach(el => {
            el.classList.remove('selected');
        });

        // Thêm lớp 'selected' cho phương thức vừa chọn
        element.closest('.ship-method').classList.add('selected');
    };

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
        // Thêm sự kiện cho các phương thức vận chuyển
        document.querySelectorAll('.ship-method-btn').forEach(button => {
            button.addEventListener('click', function () {
                const method = button.dataset.method;
                const fee = button.dataset.fee;
                handleShippingMethodSelection(method, fee, button);
            });
        });

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
                deleteItem(event, productName);
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
        confirmButton.textContent = 'Thanh Toán';
        confirmButton.disabled = true; // Initially disabled
        confirmButton.onclick = confirmPayment;

        document.getElementById('card').appendChild(confirmButton);

        // Monitor changes in card elements and enable the button once the card is valid
        cardNumber.on('change', function (event) {
            if (event.complete) {
                confirmButton.disabled = false;
            } else {
                confirmButton.disabled = true;
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
            event.preventDefault(); // Ngăn ngừa hành động submit mặc định của form (nếu có)

            const cartItems = getCartItems(); // Lấy giỏ hàng
            if (cartItems.length === 0) {
                alert("Giỏ hàng của bạn hiện đang trống.");
                return;
            }

            // Tính toán subtotal từ giỏ hàng
            const subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);

            // Tính tổng tiền (bao gồm phí vận chuyển)
            const totalAmount = calculateOrderTotal(subtotal);

            // Log totalAmount ra console để kiểm tra giá trị
            console.log("Total Amount: ", totalAmount);

            if (totalAmount <= 0) {
                alert("Số tiền phải lớn hơn 0 để thực hiện thanh toán.");
                return;
            }

            // Lấy dữ liệu địa chỉ và phương thức thanh toán
            const firstName = document.querySelector('input[name="first_name"]').value.trim();
            const address = document.querySelector('input[name="address"]').value.trim();
            const phoneNumber = document.querySelector('input[name="phone_number"]').value.trim();
            const emailAddress = document.querySelector('input[name="email_address"]').value.trim();

            // Kiểm tra dữ liệu địa chỉ
            if (!firstName || !address || !phoneNumber || !emailAddress) {
                alert("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.");
                return;
            }

            // Lấy phương thức thanh toán
            const selectedPaymentOption = document.querySelector('.payment-option.selected');
            if (!selectedPaymentOption) {
                alert("Vui lòng chọn phương thức thanh toán.");
                return;
            }
            const paymentMethod = selectedPaymentOption.dataset.method;

            try {
                // Lấy token từ cookie và giải mã để lấy userId
                const token = getAuthToken();
                let userId = token ? decodeToken(token) : null;

                if (!userId) {
                    console.error("Không thể lấy userId từ token.");
                    alert("Lỗi xác thực người dùng.");
                    return;
                }

                // Convert userId to integer if it's not already
                userId = parseInt(userId);

                if (isNaN(userId)) {
                    console.error("userId không hợp lệ.");
                    alert("Lỗi xác thực người dùng.");
                    return;
                }

                // Log dữ liệu trước khi gửi lên server
                console.log("Dữ liệu gửi lên server:", { paymentAmount: totalAmount, cartItems, userId });

                // Tạo checkout session với tổng tiền
                const response = await fetch('http://localhost:5135/api/payment/create-checkout-session', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ paymentAmount: totalAmount, auctionID: 0, userID: userId }), // Gửi paymentAmount và userID
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    document.getElementById('card-errors').textContent = errorData.error || "Đã xảy ra lỗi khi tạo checkout session.";
                    return;
                }

                const { sessionId } = await response.json();

                // Tiến hành tải dữ liệu giỏ hàng và thông tin thanh toán nếu checkout session được tạo thành công
                const uploadResponse = await fetch('http://localhost:5135/api/cart/upload', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userId: userId, // Gửi userId cùng với cartItems
                        cartItems: cartItems.map(item => ({
                            Name: item.name,
                            Price: item.price,
                            Quantity: item.qty, // Gửi quantity (qty)
                            Img: item.img || '' // Nếu có trường img, thêm vào (giả sử giỏ hàng có ảnh)
                        })),
                        shippingAddress: address,  // Địa chỉ giao hàng
                        paymentMethod: paymentMethod, // Phương thức thanh toán
                    }),
                });

                if (!uploadResponse.ok) {
                    const uploadError = await uploadResponse.text();
                    console.error("Lỗi khi tải dữ liệu giỏ hàng:", uploadError);
                    alert("Đã xảy ra lỗi khi tải dữ liệu giỏ hàng lên: " + uploadError);
                } else {
                    // Nếu thành công, xóa giỏ hàng và hiển thị modal
                    clearCart();

                    // Tạo modal hiển thị
                    const modalHtml = `
            <div id="payment-success-modal" class="modal">
                <div class="modal-content">
                    <div class="overlay">
                        <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" class="success-icon">
                            <path d="M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM16 28.8C8.944 28.8 3.2 23.056 3.2 16C3.2 8.944 8.944 3.2 16 3.2C23.056 3.2 28.8 8.944 28.8 16C28.8 23.056 23.056 28.8 16 28.8ZM22.208 10.064L12.8 19.472L9.792 16.464C9.168 15.84 8.16 15.84 7.536 16.464C6.912 17.088 6.912 18.096 7.536 18.72L11.68 22.864C12.304 23.488 13.312 23.488 13.936 22.864L24.48 12.32C25.104 11.696 25.104 10.688 24.48 10.064C23.856 9.44 22.832 9.44 22.208 10.064Z" fill="#24B47E"></path>
                        </svg>
                        <h2>Đơn hàng của bạn đã được thanh toán thành công !</h2>
                        <p>Hãy ấn vô nút dưới đây để được quay trở lại trang chủ </p>
                        <div class="actions">
                            <a href="/User/UserDashboard" class="btn-primary">Trang chủ</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

                    // Thêm modal vào body
                    document.body.insertAdjacentHTML('beforeend', modalHtml);

                    // Hiển thị modal
                    const modal = document.getElementById("payment-success-modal");
                    modal.style.display = "block";
                }
            } catch (error) {
                console.error("Lỗi khi tải dữ liệu giỏ hàng lên: ", error);
                alert("Đã xảy ra lỗi khi tải dữ liệu giỏ hàng lên: " + error.message);
            }
        }
    }

    document.getElementById('confirm-payment-btn').addEventListener('click', handleConfirmPayment);

    // Phương thức lấy token từ cookie
    function getAuthToken() {
        const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
        return token ? token.split('=')[1] : null;
    }

    // Phương thức giải mã token và lấy userId
    function decodeToken(token) {
        try {
            console.log('Bắt đầu giải mã token:', token);
            const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload từ token JWT
            const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid"]; // Lấy userId từ payload
            console.log('UserId đã lấy từ token:', userId);
            return userId;
        } catch (error) {
            console.error('Lỗi giải mã token:', error);
            return null;
        }
    }

    async function handleConfirmPayment(event) {
        event.preventDefault(); // Ngăn chặn hành động mặc định

        // Lấy dữ liệu địa chỉ giao hàng
        const firstName = document.querySelector('input[name="first_name"]').value.trim();
        const address = document.querySelector('input[name="address"]').value.trim();
        const phoneNumber = document.querySelector('input[name="phone_number"]').value.trim();
        const emailAddress = document.querySelector('input[name="email_address"]').value.trim();

        // Kiểm tra dữ liệu địa chỉ
        if (!firstName || !address || !phoneNumber || !emailAddress) {
            alert("Vui lòng nhập đầy đủ thông tin địa chỉ giao hàng.");
            // Disable the button if the fields are not filled
            
            return;
        }

        // Lấy phương thức thanh toán
        const selectedPaymentOption = document.querySelector('.payment-option.selected');
        if (!selectedPaymentOption) {
            alert("Vui lòng chọn phương thức thanh toán.");
            return;
        }
        const paymentMethod = selectedPaymentOption.dataset.method;

        // Lấy dữ liệu giỏ hàng
        const cartItems = getCartItems(); // Hàm này bạn đã có sẵn
        if (cartItems.length === 0) {
            alert("Giỏ hàng trống. Không thể thanh toán.");
            return;
        }

        // Tính toán tổng tiền
        const subtotal = cartItems.reduce((total, item) => total + (item.price * item.qty), 0);
        const totalAmount = calculateOrderTotal(subtotal); // Hàm bạn đã có sẵn
        if (totalAmount <= 0) {
            alert("Số tiền phải lớn hơn 0 để thanh toán.");
            return;
        }

        // Chuẩn hóa dữ liệu giỏ hàng
        const validCartItems = cartItems.map(item => ({
            name: String(item.name),
            price: item.price,
            quantity: item.qty,
            img: item.img,
        }));

        // Lấy token từ cookie hoặc localStorage
        const token = getAuthToken();
        let userId = token ? decodeToken(token) : null;
        if (!userId) {
            alert("Không thể xác thực người dùng.");
            return;
        }
        userId = parseInt(userId);

        // Chuẩn bị dữ liệu gửi lên server
        const requestData = {
            userId: userId,
            cartItems: validCartItems,
            paymentMethod: paymentMethod, // Phương thức thanh toán
            shippingAddress: address, // Địa chỉ giao hàng
        };

        try {
            console.log("Dữ liệu gửi lên server:", requestData);

            const uploadResponse = await fetch('http://localhost:5135/api/cart/upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });


            if (!uploadResponse.ok) {
                const uploadError = await uploadResponse.text();
                console.error("Lỗi khi tải dữ liệu giỏ hàng:", uploadError);
                alert("Đã xảy ra lỗi khi tải dữ liệu giỏ hàng lên: " + uploadError);
            } else {
                // Nếu thành công, xóa giỏ hàng và hiển thị modal
                clearCart();

                // Tạo modal hiển thị
                const modalHtml = `
                <div id="payment-success-modal" class="modal">
                    <div class="modal-content">
                        <div class="overlay">
                            <svg width="32" height="32" xmlns="http://www.w3.org/2000/svg" class="success-icon">
                                <path d="M16 0C7.168 0 0 7.168 0 16C0 24.832 7.168 32 16 32C24.832 32 32 24.832 32 16C32 7.168 24.832 0 16 0ZM16 28.8C8.944 28.8 3.2 23.056 3.2 16C3.2 8.944 8.944 3.2 16 3.2C23.056 3.2 28.8 8.944 28.8 16C28.8 23.056 23.056 28.8 16 28.8ZM22.208 10.064L12.8 19.472L9.792 16.464C9.168 15.84 8.16 15.84 7.536 16.464C6.912 17.088 6.912 18.096 7.536 18.72L11.68 22.864C12.304 23.488 13.312 23.488 13.936 22.864L24.48 12.32C25.104 11.696 25.104 10.688 24.48 10.064C23.856 9.44 22.832 9.44 22.208 10.064Z" fill="#24B47E"></path>
                            </svg>
                            <h2>Đơn hàng của bạn đã được thanh toán thành công !</h2>
                            <p>Hãy ấn vô nút dưới đây để được quay trở lại trang chủ </p>
                            <div class="actions">
                                <a href="/User/UserDashboard" class="btn-primary">Trang chủ</a>
                            </div>
                        </div>
                    </div>
                </div>
            `;

                // Thêm modal vào body
                document.body.insertAdjacentHTML('beforeend', modalHtml);

                // Hiển thị modal
                const modal = document.getElementById("payment-success-modal");
                modal.style.display = "block";
            }
        } catch (error) {
            console.error("Lỗi khi xử lý thanh toán:", error);
            alert("Đã xảy ra lỗi khi xử lý thanh toán.");
        }
    }




    // Lắng nghe sự kiện để chọn phương thức vận chuyển
    function handleShippingMethodSelection(method, fee, button) {
        console.log("Selected Shipping Method: " + method + " with Fee: " + fee);
        shippingFee = parseInt(fee);

        // Cập nhật tổng tiền
        updateOrderTotal();
    }

    function getCartItems() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        return cart;
    }

    document.addEventListener("DOMContentLoaded", initializeStripe);

    function clearCart() {
        sessionStorage.removeItem('cart');
        displayCartItems(); // Reset cart display
    }

    // Initialize stripe and cart display
    initializeStripe();
    displayCartItems();
});
