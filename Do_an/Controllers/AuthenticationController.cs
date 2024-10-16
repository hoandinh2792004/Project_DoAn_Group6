using Microsoft.AspNetCore.Mvc;

namespace Do_an.Controllers
{
    public class AuthenticationController : Controller
    {
        public IActionResult Index()
        {
            return View();
        }
    }
}
