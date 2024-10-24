using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class ShopController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
