document.addEventListener("DOMContentLoaded", function () {
    const resetPasswordForm = document.getElementById("reset-password-form");

    if (resetPasswordForm) {
        resetPasswordForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const newPassword = document.getElementById("new-password").value;
            const confirmPassword = document.getElementById("confirm-password").value;

            // Kiểm tra độ dài mật khẩu
            if (newPassword.length < 8) {
                alert("Mật khẩu phải có ít nhất 8 ký tự.");
                return;
            }

            if (newPassword === confirmPassword) {
                // Lấy thông tin email từ sessionStorage
                const email = sessionStorage.getItem("userEmail");
                if (!email) {
                    alert("Không tìm thấy email. Vui lòng quay lại trang trước.");
                    return;
                }

                // Gửi yêu cầu API để đổi mật khẩu
                axios.post("http://localhost:5135/api/Auth/resetPassword", {
                    email: email,
                    newPassword: newPassword
                }, {
                    headers: {
                        "Content-Type": "application/json"
                    }
                })
                    .then(function (response) {
                        alert(response.data.message); // Hiển thị thông báo thành công
                        // Chuyển hướng đến trang đăng nhập hoặc trang khác
                        window.location.href = "/Login/Login";
                    })
                    .catch(function (error) {
                        alert(error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.");
                        console.error(error);
                    });
            } else {
                alert("Mật khẩu không khớp! Vui lòng kiểm tra lại.");
            }
        });
    }
});
