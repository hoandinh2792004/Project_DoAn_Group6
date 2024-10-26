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
        showError(nameInput, 'Name must be at least 2 characters long.');
        return;
    }
    if (!isEmailValid) {
        showError(emailInput, 'Invalid email address.');
        return;
    }

    if (!isPasswordValid) {
        showError(passwordInput, 'Password must be at least 8 characters long.');
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
                showSuccess(emailInput, "Account created successfully!");
                setTimeout(() => {
                    window.location.href = loginUrl;
                }, 3000);
            }
            return response.json();
        })
        .then(users => {
            const user = users.find(user => user.email === emailInput.value);
            if (!user) {
                showError(emailInput, "Tài khoản không tồn tại.");
                return;
            }
            if (user.password !== passwordInput.value) {
                showError(passwordInput, "Email hoặc mật khẩu không đúng.");
                return;
            }

            // Nếu người dùng tồn tại và mật khẩu đúng, chuyển hướng đến User Dashboard
            window.location.href = userDashboardUrl; // Sử dụng biến userDashboardUrl
        })
        .catch(error => {
            console.error("There was a problem creating the user:", error);
            showError(emailInput, error.response.data.Errors ? error.response.data.Errors.join(", ") : "Registration failed. Please try again.");
        });
});

// Sign In Form Submission (Updated)
signInForm.addEventListener('submit', function (event) {
    event.preventDefault(); // Prevent form submission

    const emailInput = document.getElementById("emails");
    const passwordInput = document.getElementById("passwords");

    // Validate inputs
    const isEmailValid = validateEmail(emailInput.value);
    const isPasswordValid = validatePassword(passwordInput.value);

    // Show error messages and prevent form submission if any input is invalid
    if (!isEmailValid) {
        showError(emailInput, 'Invalid email address.');
        return;
    }
    if (!isPasswordValid) {
        showError(passwordInput, 'Password must be at least 8 characters long.');
        return;
    }

    axios.post("http://localhost:5135/api/Auth/login", {
        email: emailInput.value,
        password: passwordInput.value
    })
        .then(response => {
            const token = response.data.token;
            const role = response.data.role; // Sửa lại tên trường cho đúng với dữ liệu trả về

            console.log("Role returned from API:", role); // Kiểm tra giá trị role
            console.log("Token received:", token); // Kiểm tra token

            setCookie('authToken', token);

            // Kiểm tra điều kiện vai trò
            if (role && role === "1") { // So sánh với chuỗi "1"
                console.log("Redirecting to admin dashboard");
                window.location.href = adminDashboardUrl;  // Admin dashboard
            } else {
                console.log("Redirecting to user dashboard");
                window.location.href = userDashboardUrl;  // User dashboard
            }
            return response.json();
        })
        .then(data => {
            showSuccess(document.getElementById("email"), "Account created successfully!");
        })
        .catch(error => {
            if (error.response && error.response.status === 403) {
                document.getElementById("wrongpassword").innerText = "Bạn không có quyền truy cập vào tài nguyên này.";
            } else {
                console.error("Login error:", error);
                document.getElementById("wrongpassword").innerText = "Wrong email or password.";
            }
        });



});

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
}
