using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class LoginController : Controller
    {
        public IActionResult Login() // Action cho trang Login
        {
            return View(); // Trả về view Login.cshtml
        }
    }
}
