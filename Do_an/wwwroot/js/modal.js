// Hàm hiển thị modal yêu cầu đăng nhập
function showLoginPrompt() {
    hideCart(); // Gọi hàm ẩn giỏ hàng
    document.getElementById("loginPromptModal").style.display = "block"; // Hiển thị modal
}

// Hàm ẩn giỏ hàng
// Hàm thêm sản phẩm vào giỏ hàng mà không yêu cầu đăng nhập
function addToCart(productName, productPrice, productImg) {
    // Logic to add sản phẩm vào giỏ hàng (giả lập bằng console log)
    console.log(`Đã thêm vào giỏ: ${productName} - ${productPrice} - ${productImg}`);
    alert(`Đã thêm sản phẩm vào giỏ hàng: ${productName}`);
}


// Hàm đóng modal
function closeModal() {
    document.getElementById("loginPromptModal").style.display = "none"; // Ẩn modal
}

// Đóng modal khi nhấp bên ngoài modal
window.onclick = function (event) {
    var modal = document.getElementById("loginPromptModal");
    if (event.target === modal) {
        closeModal();
    }
}

// Hàm hiển thị thông báo yêu cầu đăng nhập khi nhấn nút Check Out
function showCheckoutPrompt() {
    hideCart(); // Ẩn giỏ hàng
    showLoginPrompt(); // Hiển thị modal yêu cầu đăng nhập
}
