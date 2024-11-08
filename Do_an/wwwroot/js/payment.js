document.addEventListener('DOMContentLoaded', function () {
    const reviewOrderBody = document.getElementById('review-order-body');
    let elements;
    let stripe;
    let clientSecret;

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

    function displayCartItems() {
        const cart = loadCartFromStorage();
        let subtotal = 0;
        let orderTotal = 0;
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

        orderTotal = subtotal + 25000;

        cartHtml += `
    <div class="form-group">
        <div class="col-xs-12">
            <strong>Tổng phụ</strong>
            <div class="pull-right"><span>25.000</span><span>đ</span></div>
        </div>
        <div class="col-xs-12">
            <small>Phí vận chuyển</small>
            <div class="pull-right"><span>-</span></div>
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

        const card = elements.create('card', { style });
        card.mount('#card-element');

        const confirmButton = document.createElement('button');
        confirmButton.id = 'confirm-payment';
        confirmButton.classList.add('btn', 'btn-success');
        confirmButton.textContent = 'Thanh toán';
        confirmButton.disabled = true;
        confirmButton.onclick = confirmPayment;

        document.getElementById('payment-form').appendChild(confirmButton);

        card.on('change', function (event) {
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

        async function confirmPayment(event) {
            event.preventDefault();

            const totalAmount = calculateTotalAmount();
            if (totalAmount <= 0) {
                alert("Số tiền phải lớn hơn 0 để thực hiện thanh toán.");
                return;
            }

            // Lấy dữ liệu giỏ hàng trước khi tạo phiên thanh toán
            const cartItems = getCartItems();
            if (cartItems.length === 0) {
                alert("Giỏ hàng của bạn hiện đang trống.");
                return;
            }

            // Tạo checkout session
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

            try {
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
                    alert('Thanh toán thành công! Dữ liệu giỏ hàng đã được tải lên cơ sở dữ liệu.');
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
