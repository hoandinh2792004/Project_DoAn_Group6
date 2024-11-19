document.addEventListener("DOMContentLoaded", function () {
    const verifyButton = document.querySelector(".verify-form button");
    const verificationMessage = document.getElementById("verification-message");
    const otpInputs = Array.from(document.querySelectorAll(".input-field input"));

    if (verifyButton) {
        verifyButton.addEventListener("click", function (event) {
            event.preventDefault();

            // Ghép các giá trị OTP lại thành một chuỗi
            const otp = otpInputs.map(input => input.value.trim() || "").join("");
            console.log("OTP:", otp); // Kiểm tra OTP trong console

            if (otp.length < 6) {
                verificationMessage.innerText = "Vui lòng nhập đầy đủ mã OTP.";
                verificationMessage.style.color = "red";
                return;
            }

            // Gửi yêu cầu API để xác thực OTP
            axios.post("http://localhost:5135/api/Auth/verifyOtp", { otp: otp }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(function (response) {
                    verificationMessage.innerText = response.data.message;
                    verificationMessage.style.color = "green";

                    // Chuyển hướng sau 2 giây
                    setTimeout(function () {
                        window.location.href = "/Login/resetPassword";
                    }, 2000);
                })
                .catch(function (error) {
                    verificationMessage.innerText = error.response?.data?.message || "Có lỗi xảy ra. Vui lòng thử lại.";
                    verificationMessage.style.color = "red";
                    console.error(error);
                });
        });
    }

    // Xử lý sự kiện nhấn vào liên kết Resend OTP
    const resendOtpLink = document.getElementById("resendotp");
    if (resendOtpLink) {
        resendOtpLink.addEventListener("click", function (event) {
            event.preventDefault();

            // Lấy email từ sessionStorage
            const email = sessionStorage.getItem("userEmail");
            if (!email) {
                verificationMessage.innerText = "Không tìm thấy email. Vui lòng quay lại trang trước.";
                verificationMessage.style.color = "red";
                return;
            }

            // Gửi yêu cầu API để gửi lại OTP
            axios.post("http://localhost:5135/api/Auth/SendOtp", { email: email }, {
                headers: {
                    "Content-Type": "application/json"
                }
            })
                .then(function (response) {
                    verificationMessage.innerText = response.data.message;
                    verificationMessage.style.color = "green";
                })
                .catch(function (error) {
                    verificationMessage.innerText = error.response?.data?.message || "Không thể gửi OTP. Vui lòng thử lại.";
                    verificationMessage.style.color = "red";
                    console.error(error);
                });
        });
    }
});
