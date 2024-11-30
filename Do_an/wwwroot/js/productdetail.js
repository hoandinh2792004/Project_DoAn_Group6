$(document).ready(function () {
    // Lấy `productId` từ URL
    const urlParams = new URLSearchParams(window.location.search);
    const productId = urlParams.get('id');

    function formatPrice(price) {
        return price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
    }
    // Hàm lấy chi tiết sản phẩm từ server
    function fetchProductDetail(id) {
        $.ajax({
            url: `http://localhost:5135/api/Product/GetProduct/${id}`,
            method: 'GET',
            success: function (product) {
                const imageUrl = product.imageUrl
                    ? `http://localhost:5135/images/${product.imageUrl.split('/').pop()}`
                    : 'http://localhost:5135/images/default.png';

                $('#product-detail').html(`
                <!-- HTML hiển thị chi tiết sản phẩm -->
                <aside class="col-lg-6">
                    <div class="border rounded-4 mb-3 d-flex justify-content-center">
                        <a data-fslightbox="mygalley" class="rounded-4" target="_blank" data-type="image" href="${imageUrl}">
                            <img style="max-width: 100%; max-height: 100vh; margin: auto;" class="rounded-4 fit" src="${imageUrl}" alt="${product.name}" />
                        </a>
                    </div>
                </aside>
                <main class="col-lg-6">
                    <div class="ps-lg-3">
                        <h4 class="title text-dark">${product.name}</h4>
                        <div class="d-flex flex-row my-3">
                            <div class="text-warning mb-1 me-2">
                              <i class="fa fa-star"></i>
                              <i class="fa fa-star"></i>
                              <i class="fa fa-star"></i>
                              <i class="fa fa-star"></i>
                              <i class="fas fa-star-half-alt"></i>
                              <span class="ms-1">4.5</span>
                            </div>
                            <span class="text-muted"><i class="fas fa-shopping-basket fa-sm mx-1"></i>100 orders</span>
                            <span class="text-success ms-2">In stock</span>
                        </div>
                        <div class="mb-3">
                            <span class="h5">${formatPrice(product.price)}</span>
                        </div>
                        <p>${product.description}</p>
                        <div class="row">
                            <dt class="col-3">Type:</dt>
                            <dd class="col-9">${product.categoryName}</dd>
                        </div>
                        <hr />
                        <div class="row mb-4">
                            <div class="col-md-4 col-6 mb-3">
                                <label class="mb-2 d-block">Quantity</label>
                                <div class="input-group mb-3" style="width: 170px;">
                                    <button class="btn btn-white border border-secondary px-3 decrease-qty" type="button"><i class="fas fa-minus"></i></button>
                                    <input type="text" class="form-control text-center border border-secondary quantity-input" value="1" />
                                    <button class="btn btn-white border border-secondary px-3 increase-qty" type="button"><i class="fas fa-plus"></i></button>
                                </div>
                            </div>
                        </div>
                        <a href="#" class="btn btn-warning shadow-0 buy-now">
                            Buy now
                        </a>
                        <a class="btn btn-primary shadow-0 add-to-cart"
                           data-name="${product.name}"
                           data-price="${product.price}" 
                           data-img="${imageUrl}">
                           <i class="bi bi-cart"></i> Add to cart
                        </a>
                    </div>
                </main>
            `);

                // Lắng nghe sự kiện click trên nút "Add to cart"
                $('.add-to-cart').on('click', function (event) {
                    event.preventDefault(); // Prevent default link behavior

                    // Retrieve the selected quantity from the input field
                    const productQty = parseInt($('.quantity-input').val()) || 1; // Default to 1 if invalid

                    // Retrieve data attributes from the clicked button
                    const productName = $(this).data('name');
                    const productPrice = $(this).data('price');
                    const productImg = $(this).data('img');

                    // Call addToCart with the retrieved data
                    addToCart(productName, productPrice, productImg, productQty);
                });

                // Handle the increase/decrease quantity buttons
                $('.increase-qty').on('click', function () {
                    let quantity = parseInt($('.quantity-input').val());
                    $('.quantity-input').val(quantity + 1);
                });

                $('.decrease-qty').on('click', function () {
                    let quantity = parseInt($('.quantity-input').val());
                    if (quantity > 1) {
                        $('.quantity-input').val(quantity - 1);
                    }
                });

                // Handle "Buy Now" button click
                // Handle "Buy Now" button click
                $('.buy-now').on('click', function (event) {
                    event.preventDefault();

                    // Retrieve the selected quantity from the input field
                    const productQty = parseInt($('.quantity-input').val()) || 1; // Default to 1 if invalid

                    // Retrieve product data from the product (the same as "Add to Cart")
                    const productName = product.name;
                    const productPrice = product.price;
                    const productImg = imageUrl;

                    // Add product to cart
                    addToCart(productName, productPrice, productImg, productQty);

                    // Trigger checkout process
                    handleCheckout();
                });
            },
            error: function (error) {
                console.error('Error fetching product details:', error);
            }
        });
    }

    // Function to add a product to the cart
    function addToCart(productName, productPrice, productImg, productQty = 1) {
        const cartItems = document.querySelector('.cart-items ol');

        // Check if the item already exists in session storage
        let cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        const existingItem = cart.find(item => item.name === productName);

        if (existingItem) {
            alert(`Sản phẩm "${productName}" đã có trong giỏ hàng.`);
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

    // Gọi hàm fetchProductDetail với `productId`
    if (productId) {
        fetchProductDetail(productId);
    } else {
        $('#product-detail').html('<p>Không có sản phẩm nào được chọn.</p>');
    }
});

// Handle checkout process
async function handleCheckout() {
    const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
    if (cart.length === 0) {
        alert("Your cart is empty.");
        return;
    }

    const totalAmount = cart.reduce((sum, item) => {
        const priceInNumber = parseFloat(item.price) || 0;
        return sum + (priceInNumber * item.qty);
    }, 0);

    if (totalAmount > 99999999) {
        alert("Total amount exceeds the limit for payment processing.");
        return;
    }

    const paymentRequest = {
        PaymentAmount: totalAmount,
        AuctionID: 123,
        UserID: 456
    };

    try {
        const response = await fetch('http://localhost:5135/api/payment/create-intent', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(paymentRequest)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error("Failed to create payment intent");
        }

        const paymentData = await response.json();

        // Check if clientSecret is present in the response
        if (!paymentData.clientSecret) {
            console.error("Missing client_secret in the response");
            alert("There was an error processing your payment. Please contact support.");
            return;
        }

        window.location.href = `/User/Payment?clientSecret=${paymentData.clientSecret}`;
    } catch (error) {
        console.error("Error during checkout:", error);
        alert("There was an error processing your payment. Please try again.");
    }
}