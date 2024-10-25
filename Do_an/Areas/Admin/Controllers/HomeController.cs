using Microsoft.AspNetCore.Mvc;

namespace Do_an.Areas.Admin.Controllers
{
    [Area("Admin")]
    public class HomeController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }

        // Action cho trang Products
        public IActionResult ProductsManager()
        {
            return View();
        }
    }
}
