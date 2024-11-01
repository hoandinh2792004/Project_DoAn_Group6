using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class LoginController : Controller
    {
        // Action cho trang Login
        public IActionResult Login()
        {
            return View();
        }

        // Action cho trang Reset Password
        public IActionResult ResetPassword()
        {
            return View(); 
        }

        // Action cho trang Verify Account
        public IActionResult VerifyOtp()
        {
            return View(); 
        }

        public IActionResult SendOtp()
        {
            return View(); 
        }
    }
}
