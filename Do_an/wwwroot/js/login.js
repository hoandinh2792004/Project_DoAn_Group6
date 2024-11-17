const container = document.getElementById('container');
const registerBtn = document.getElementById('register');
const loginBtn = document.getElementById('login');

registerBtn.addEventListener('click', () => {
    container.classList.add("active");
});

loginBtn.addEventListener('click', () => {
    container.classList.remove("active");
});

// Get form elements
const signUpForm = document.getElementById('signup-form');
const signInForm = document.querySelector('.sign-in form');

// Clear previous messages
function clearMessages() {
    const existingMessages = document.querySelectorAll('.error-message, .success-message');
    existingMessages.forEach((message) => message.remove());
}

// Show error message
function showError(inputElement, errorMessage) {
    clearMessages();
    const errorElement = document.createElement('p');
    errorElement.className = 'error-message';
    errorElement.textContent = errorMessage;

    const containerElement = inputElement.parentElement;
    containerElement.appendChild(errorElement);
}

// Show success message
function showSuccess(inputElement, successMessage) {
    clearMessages();
    const successElement = document.createElement('p');
    successElement.className = 'success-message';
    successElement.textContent = successMessage;

    const containerElement = inputElement.parentElement;
    containerElement.appendChild(successElement);
}

// Validate inputs
function validateName(name) {
    return name.length >= 2;
}

function validateEmail(email) {
    const pattern = /^[\w\.-]+@[\w\.-]+\.\w+$/;
    return pattern.test(email);
}

function validatePassword(password) {
    return password.length >= 8;
}

// Sign Up Form Submission
signUpForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const nameInput = document.getElementById('name');
    const emailInput = document.getElementById('email');
    const passwordInput = document.getElementById('password');

    // Validate inputs
    const isNameValid = validateName(nameInput.value);
    const isEmailValid = validateEmail(emailInput.value);
    const isPasswordValid = validatePassword(passwordInput.value);

    // Show error messages and prevent form submission if any input is invalid
    if (!isNameValid) {
        showError(nameInput, 'Tên người dùng phải có ít nhất 2 chữ');
        return;
    }
    if (!isEmailValid) {
        showError(emailInput, 'Địa chỉ email sai');
        return;
    }
    if (!isPasswordValid) {
        showError(passwordInput, 'Mật khẩu phải có ít nhất 8 chữ');
        return;
    }

    // All inputs are valid, proceed with API call
    axios.post("http://localhost:5135/api/Auth/register", {
        username: nameInput.value,
        email: emailInput.value,
        password: passwordInput.value
    })
        .then(response => {
            if (response.status === 200 || response.status === 201) {
                showSuccess(emailInput, "Tài khoản đã được đăng ký thành công!");
                setTimeout(() => {
                    window.location.href = loginUrl;
                }, 3000);
            }
        })
        .catch(error => {
            console.error("Đã có lỗi xảy ra khi đăng ký :", error);
            showError(emailInput, error.response.data.Errors ? error.response.data.Errors.join(", ") : "Đăng ký thất bại,vui lòng thử lại.");
        });
});
// Sign In Form Submission
signInForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const emailInput = document.getElementById("emails");
    const passwordInput = document.getElementById("passwords");

    // Validate inputs
    const isEmailValid = validateEmail(emailInput.value);
    const isPasswordValid = validatePassword(passwordInput.value);

    if (!isEmailValid) {
        showError(emailInput, 'Địa chỉ email sai');
        console.log("Invalid email address entered:", emailInput.value); // Log invalid email
        return;
    }
    if (!isPasswordValid) {
        showError(passwordInput, 'Mật khẩu phải có ít nhất 8 chữ');
        console.log("Invalid password entered:", passwordInput.value); // Log invalid password
        return;
    }

    // Attempt to log in using axios
    axios.post("http://localhost:5135/api/Auth/login", {
        email: emailInput.value,
        password: passwordInput.value
    }, {
        withCredentials: true  // Ensure cookies are sent with the request
    })
        .then(response => {
            const token = response.data.token;
            const role = response.data.role;

            console.log("Role returned from API:", role); // Check role value
            console.log("Token received:", token); // Check token

            setCookie('authToken', token); // Store the token in a cookie
            console.log("Cookie Set:", document.cookie); // Log the cookies

            clearCart(); // Call function to clear the cart
            console.log("Cart cleared."); // Log cart clearing

            if (role && role === "1") { // Assuming role '1' is for Admin
                console.log("Redirecting to admin dashboard");
                window.location.href = adminDashboardUrl;  // Redirect to Admin dashboard
            } else {
                console.log("Redirecting to user dashboard");
                window.location.href = userDashboardUrl;  // Redirect to User dashboard
            }
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                console.log("Access denied: 403 error");
                document.getElementById("wrongpassword").innerText = "Bạn không có quyền truy cập vào tài nguyên này.";
            } else {
                console.error("Login error:", error); // Log the full error for debugging
                document.getElementById("wrongpassword").innerText = "Mật khẩu hoặc email sai";
            }
        });
});


// Định nghĩa hàm clearCart
function clearCart() {
    // Xóa giỏ hàng trong sessionStorage
    console.log("Clearing cart..."); // Log để kiểm tra
    sessionStorage.removeItem('cart');

    // Cập nhật giao diện người dùng (nếu cần)
    const cartItems = document.querySelector('.cart-items ol');
    if (cartItems) {
        cartItems.innerHTML = ''; // Xóa các mục trong giỏ hàng
        console.log("Cart items cleared."); // Log kiểm tra
    }
}

// Cookie function
function setCookie(name, value) {
    document.cookie = name + "=" + value + "; path=/";
}

// Clear error messages when input value changes
const inputElements = document.querySelectorAll('input');
inputElements.forEach((inputElement) => {
    inputElement.addEventListener('input', () => {
        clearMessages();
    });
});
