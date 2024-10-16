using Do_an.Models;
using Microsoft.AspNetCore.Mvc;
using System.Diagnostics;

namespace Do_an.Controllers
{
    public class UserController : Controller
    {
        private readonly ILogger<UserController> _logger;

        public UserController(ILogger<UserController> logger)
        {
            _logger = logger;
        }

        public IActionResult Userdashboard()
        {
            return View();
        }

        public IActionResult Payment() // Thêm action Payment
        {
            return View(); // Trả về view Payment.cshtml
        }

        public IActionResult Privacy()
        {
            return View();
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }
    }

}
