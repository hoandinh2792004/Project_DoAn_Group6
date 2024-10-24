using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using Microsoft.EntityFrameworkCore;
using Do_an.Data;

namespace Do_an.Controllers
{
    public class WasteExchangesController : Controller
    {
        private readonly DoAnContext _context;

        public WasteExchangesController(DoAnContext context)
        {
            _context = context;
        }

        // GET: WasteExchanges
        public async Task<IActionResult> Index()
        {
            var doAnContext = _context.WasteExchanges.Include(w => w.CollectionPoint).Include(w => w.Customer).Include(w => w.Product);
            return View(await doAnContext.ToListAsync());
        }

        // GET: WasteExchanges/Details/5
        public async Task<IActionResult> Details(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var wasteExchange = await _context.WasteExchanges
                .Include(w => w.CollectionPoint)
                .Include(w => w.Customer)
                .Include(w => w.Product)
                .FirstOrDefaultAsync(m => m.ExchangeId == id);
            if (wasteExchange == null)
            {
                return NotFound();
            }

            return View(wasteExchange);
        }

        // GET: WasteExchanges/Create
        public IActionResult Create()
        {
            ViewData["CollectionPointId"] = new SelectList(_context.WasteCollectionPoints, "CollectionPointId", "CollectionPointId");
            ViewData["CustomerId"] = new SelectList(_context.Customers, "CustomerId", "CustomerId");
            ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "ProductId");
            return View();
        }

        // POST: WasteExchanges/Create
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("ExchangeId,CustomerId,CollectionPointId,ProductId,WasteAmount,ExchangeDate")] WasteExchange wasteExchange)
        {
            if (ModelState.IsValid)
            {
                _context.Add(wasteExchange);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            ViewData["CollectionPointId"] = new SelectList(_context.WasteCollectionPoints, "CollectionPointId", "CollectionPointId", wasteExchange.CollectionPointId);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "CustomerId", "CustomerId", wasteExchange.CustomerId);
            ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "ProductId", wasteExchange.ProductId);
            return View(wasteExchange);
        }

        // GET: WasteExchanges/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var wasteExchange = await _context.WasteExchanges.FindAsync(id);
            if (wasteExchange == null)
            {
                return NotFound();
            }
            ViewData["CollectionPointId"] = new SelectList(_context.WasteCollectionPoints, "CollectionPointId", "CollectionPointId", wasteExchange.CollectionPointId);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "CustomerId", "CustomerId", wasteExchange.CustomerId);
            ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "ProductId", wasteExchange.ProductId);
            return View(wasteExchange);
        }

        // POST: WasteExchanges/Edit/5
        // To protect from overposting attacks, enable the specific properties you want to bind to.
        // For more details, see http://go.microsoft.com/fwlink/?LinkId=317598.
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("ExchangeId,CustomerId,CollectionPointId,ProductId,WasteAmount,ExchangeDate")] WasteExchange wasteExchange)
        {
            if (id != wasteExchange.ExchangeId)
            {
                return NotFound();
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(wasteExchange);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!WasteExchangeExists(wasteExchange.ExchangeId))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            ViewData["CollectionPointId"] = new SelectList(_context.WasteCollectionPoints, "CollectionPointId", "CollectionPointId", wasteExchange.CollectionPointId);
            ViewData["CustomerId"] = new SelectList(_context.Customers, "CustomerId", "CustomerId", wasteExchange.CustomerId);
            ViewData["ProductId"] = new SelectList(_context.Products, "ProductId", "ProductId", wasteExchange.ProductId);
            return View(wasteExchange);
        }

        // GET: WasteExchanges/Delete/5
        public async Task<IActionResult> Delete(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var wasteExchange = await _context.WasteExchanges
                .Include(w => w.CollectionPoint)
                .Include(w => w.Customer)
                .Include(w => w.Product)
                .FirstOrDefaultAsync(m => m.ExchangeId == id);
            if (wasteExchange == null)
            {
                return NotFound();
            }

            return View(wasteExchange);
        }

        // POST: WasteExchanges/Delete/5
        [HttpPost, ActionName("Delete")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteConfirmed(int id)
        {
            var wasteExchange = await _context.WasteExchanges.FindAsync(id);
            if (wasteExchange != null)
            {
                _context.WasteExchanges.Remove(wasteExchange);
            }

            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Index));
        }

        private bool WasteExchangeExists(int id)
        {
            return _context.WasteExchanges.Any(e => e.ExchangeId == id);
        }
    }
}
