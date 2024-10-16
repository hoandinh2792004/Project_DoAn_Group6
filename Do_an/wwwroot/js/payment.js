document.addEventListener('DOMContentLoaded', function () {
    const reviewOrderBody = document.getElementById('review-order-body');

    // Function to retrieve cart from sessionStorage
    function loadCartFromStorage() {
        const cart = JSON.parse(sessionStorage.getItem('cart')) || [];
        return cart;
    }

    // Function to update the cart in sessionStorage
    function updateCartInStorage(cart) {
        sessionStorage.setItem('cart', JSON.stringify(cart));
    }

    // Function to generate and display the cart items
    function displayCartItems() {
        const cart = loadCartFromStorage(); // Get cart items from sessionStorage

        let subtotal = 0;
        let orderTotal = 0;
        let cartHtml = '';

        // Check if the cart is empty
        if (cart.length === 0) {
            reviewOrderBody.innerHTML = '<p>No items in your cart.</p>';
            return; // Exit if there are no items
        }

        // Loop through each cart item
        cart.forEach(item => {
            const { name: productName, price: productPrice, img: productImg, qty: productQty } = item;

            // Calculate the total price for the current item
            const itemTotal = productPrice * productQty;
            subtotal += itemTotal;

            // Create the HTML for each product with quantity controls and delete button
            cartHtml += `
                <div class="product-item">
                    <div class="form-group">
                        <div class="col-sm-3">
                            <img class="img-responsive" src="${productImg}" alt="${productName}" />
                        </div>
                        <div class="col-sm-6">
                            <div>${productName}</div>
                            <div class="product-quantity">
                                <button class="qty-btn" onclick="updateQuantity('${productName}', ${productPrice}, -1)">-</button>
                                <span class="qty-value">${productQty}</span>
                                <button class="qty-btn" onclick="updateQuantity('${productName}', ${productPrice}, 1)">+</button>
                            </div>
                        </div>
                        <div class="col-sm-3 text-right">
                            <h6><span>$</span><span class="item-total">${itemTotal.toFixed(2)}</span></h6>
                            <button class="delete-btn" onclick="deleteItem('${productName}')">
                                <i class="fa-solid fa-trash"></i> <!-- Trash can icon -->
                            </button>
                        </div>
                    </div>
                    <hr />
                </div>
            `;
        });

        // Calculate the total
        orderTotal = subtotal; // You can add shipping and other fees here

        // Append subtotal and order total
        cartHtml += `
            <div class="form-group">
                <div class="col-xs-12">
                    <strong>Subtotal</strong>
                    <div class="pull-right"><span>$</span><span>${subtotal.toFixed(2)}</span></div>
                </div>
                <div class="col-xs-12">
                    <small>Shipping</small>
                    <div class="pull-right"><span>-</span></div>
                </div>
            </div>
            <hr />
            <div class="form-group">
                <div class="col-xs-12">
                    <strong>Order Total</strong>
                    <div class="pull-right"><span>$</span><span class="order-total">${orderTotal.toFixed(2)}</span></div>
                </div>
            </div>
        `;

        // Insert the generated HTML into the DOM
        reviewOrderBody.innerHTML = cartHtml;
    }

    // Function to update quantity
    window.updateQuantity = function (productName, productPrice, change) {
        let cart = loadCartFromStorage();
        const itemIndex = cart.findIndex(item => item.name === productName);

        if (itemIndex !== -1) {
            const newQty = cart[itemIndex].qty + change;

            if (newQty < 1) {
                // Remove item if quantity is less than 1
                cart.splice(itemIndex, 1);
            } else {
                // Update the quantity
                cart[itemIndex].qty = newQty;
            }

            // Update the sessionStorage
            updateCartInStorage(cart);
            // Refresh the display
            displayCartItems();
        }
    };

    // Function to delete an item from the cart
    window.deleteItem = function (productName) {
        let cart = loadCartFromStorage();
        cart = cart.filter(item => item.name !== productName); // Remove item from cart
        updateCartInStorage(cart); // Update sessionStorage
        displayCartItems(); // Refresh the display
        syncCart(); // Synchronize with any other cart display
    };

    // Call the function to display the cart items when the page loads
    displayCartItems();

    // Ensure synchronization with add to cart page
    window.syncCart = function () {
        displayCartItems();
    };
});
