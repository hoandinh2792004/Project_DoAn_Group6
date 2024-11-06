﻿using Do_an.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Diagnostics;
using Do_an.Data;

namespace Do_an.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> _logger;
        private readonly DoAnContext _context;

        public HomeController(ILogger<HomeController> logger, DoAnContext context)
        {
            _logger = logger;
            _context = context;
        }

        public IActionResult Index(int page = 1, int pageSize = 4)
        {
            HttpContext.Response.Cookies.Delete("authToken");

            var products = _context.Products.ToList();
            var uniqueProducts = products.GroupBy(p => p.ProductId)
                                          .Select(g => g.First())
                                          .ToList();

            var totalProducts = uniqueProducts.Count();
            var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);

            var pagedProducts = uniqueProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var model = new ProductViewModel
            {
                Products = pagedProducts,
                Page = page,
                TotalPages = totalPages
            };

            ViewBag.PageSize = pageSize; // Truyền pageSize đến View
            return View(model);
        }

        public IActionResult Shop(int page = 1, int pageSize = 12)
        {
            var products = _context.Products.ToList();
            var uniqueProducts = products.GroupBy(p => p.ProductId)
                                          .Select(g => g.First())
                                          .ToList();

            var totalProducts = uniqueProducts.Count();
            var totalPages = (int)Math.Ceiling((double)totalProducts / pageSize);

            var pagedProducts = uniqueProducts.Skip((page - 1) * pageSize).Take(pageSize).ToList();

            var model = new ProductViewModel
            {
                Products = pagedProducts,
                Page = page,
                TotalPages = totalPages
            };

            ViewBag.PageSize = pageSize; // Truyền pageSize đến View
            return View(model);
        }
    }
}