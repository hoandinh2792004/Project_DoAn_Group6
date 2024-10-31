using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class LoginController : Controller
    {
        // Action cho trang Login
        public IActionResult Login()
        {
            return View(); // Trả về view Login.cshtml
        }

        // Action cho trang Reset Password
        public IActionResult ResetPassword()
        {
            return View(); // Trả về view ResetPassword.cshtml
        }

        // Action cho trang Verify Account
        public IActionResult VerifyOtp()
        {
            return View(); // Trả về view VerifyAccount.cshtml
        }
    }
}
