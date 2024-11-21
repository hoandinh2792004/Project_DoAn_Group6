using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class Services : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
