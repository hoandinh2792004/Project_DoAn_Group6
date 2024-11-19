document.getElementById("btn-reset").addEventListener("click", function (event) {
    event.preventDefault();

    const email = document.getElementById("reset-email-input").value;
    const resetSuccessMessage = document.getElementById("reset-succ");

    // Hàm để hiển thị thông báo
    function showMessage(message, color) {
        resetSuccessMessage.innerText = message;
        resetSuccessMessage.style.color = color;
    }

    // Kiểm tra email trống
    if (email.trim() === "") {
        showMessage("Vui lòng nhập địa chỉ email.", "red");
        return;
    }

    // Lưu email vào session storage
    sessionStorage.setItem("userEmail", email);

    // Gửi yêu cầu API để gửi email OTP
    axios.post("http://localhost:5135/api/Auth/SendOtp", { email: email })
        .then(function (response) {
            if (response.status === 200) {
                showMessage("Mã Otp đã được gửi thành công!", "green");
                console.log("Đang chuyển hướng...");

                // Thêm độ trễ 2 giây (2000ms) trước khi chuyển hướng
                setTimeout(function () {
                    window.location.href = "verifyOtp";
                }, 2000); // Sửa thời gian delay nếu cần
            } else {
                showMessage("Có lỗi xảy ra trong quá trình gửi email.", "red");
            }
        })
        .catch(function (error) {
            if (error.response && error.response.data && error.response.data.message) {
                showMessage(error.response.data.message, "red");
            } else {
                showMessage("Không thể gửi email. Vui lòng thử lại.", "red");
            }
            console.error("Error response:", error);
        });
});
