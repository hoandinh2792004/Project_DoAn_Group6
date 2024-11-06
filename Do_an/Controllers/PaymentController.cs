using Microsoft.AspNetCore.Mvc;
using Stripe;
using Stripe.Checkout;
using System.Collections.Generic;
using System.Threading.Tasks;
using Do_an.DTOs;
using Do_an.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;


namespace Do_an.Controllers
{
    [Route("api/payment")]
    [ApiController]
    [Authorize]
    public class PaymentController : ControllerBase

    {
        private readonly DoAnContext _context;

        // Chỉ một constructor cho PaymentController
        public PaymentController(DoAnContext context)
        {
            _context = context;
            StripeConfiguration.ApiKey = "sk_test_51QBtx3GCdl3dzztXaahV3AVOKclrxCj0nwoeXa2Y9v5Sx2iGHWbTOPi8jyrNlyKaCWfNiNi0BjReGTTd04FRGdAJ00dLCH5IDM";
        }


        // Replace with your secret key

        [HttpPost("create-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] CreatePaymentDto paymentDto)
        {
            if (paymentDto == null || paymentDto.PaymentAmount <= 0)
            {
                return BadRequest(new { error = "Invalid request. Amount must be greater than 0." }); // Validate input data
            }

            try
            {
                // Create Payment Intent
                var paymentIntentOptions = new PaymentIntentCreateOptions
                {
                    Amount = (long)(paymentDto.PaymentAmount * 100), // Stripe expects amounts in cents
                    Currency = "usd", // Change to your currency if needed
                    Metadata = new Dictionary<string, string>
                    {
                        { "AuctionID", paymentDto.AuctionID.ToString() },
                        { "UserID", paymentDto.UserID.ToString() }
                    }
                };

                var paymentIntentService = new PaymentIntentService();
                var paymentIntent = await paymentIntentService.CreateAsync(paymentIntentOptions);

                // Create Checkout Session
                var sessionOptions = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    Mode = "payment",
                    SuccessUrl = "http://localhost:3000/auctionwebsite/#/user/order-success?session_id={CHECKOUT_SESSION_ID}", // Redirect after success
                    CancelUrl = "http://localhost:3000/auctionwebsite/#/user/payment",
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = "usd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = "Auction Item",
                                    // Optionally, add description and images here
                                },
                                UnitAmount = (long)(paymentDto.PaymentAmount * 100), // Amount in cents
                            },
                            Quantity = 1,
                        },
                    },
                };

                var sessionService = new SessionService();
                var session = await sessionService.CreateAsync(sessionOptions);

                // Return client secret and session ID
                return Ok(new
                {
                    clientSecret = paymentIntent.ClientSecret,
                    sessionId = session.Id
                });
            }
            catch (StripeException ex)
            {
                // Return Stripe error
                return BadRequest(new { error = "Stripe error: " + ex.Message });
            }
            catch (System.Exception ex)
            {
                // Return server error
                return StatusCode(500, new { error = "Internal Server Error: " + ex.Message });
            }
        }

        // API method for creating Checkout Session
        [HttpPost("create-checkout-session")]
        public async Task<IActionResult> CreateCheckoutSession([FromBody] CreatePaymentDto paymentDto)
        {
            if (paymentDto == null || paymentDto.PaymentAmount <= 0)
            {
                return BadRequest(new { error = "Invalid request. Amount must be greater than 0." });
            }

            try
            {
                var domain = "http://localhost:5135"; // Replace with your actual domain
                var sessionOptions = new SessionCreateOptions
                {
                    PaymentMethodTypes = new List<string> { "card" },
                    LineItems = new List<SessionLineItemOptions>
                    {
                        new SessionLineItemOptions
                        {
                            PriceData = new SessionLineItemPriceDataOptions
                            {
                                Currency = "usd",
                                ProductData = new SessionLineItemPriceDataProductDataOptions
                                {
                                    Name = "Auction Item",
                                },
                                UnitAmount = (long)(paymentDto.PaymentAmount * 100), // Amount in cents
                            },
                            Quantity = 1,
                        },
                    },
                    Mode = "payment",
                    SuccessUrl = $"{domain}/auctionwebsite/#/user/order-success?session_id={{CHECKOUT_SESSION_ID}}",
                    CancelUrl = $"{domain}/auctionwebsite/#/user/payment",
                };

                var sessionService = new SessionService();
                var session = await sessionService.CreateAsync(sessionOptions);

                return Ok(new { sessionId = session.Id });
            }
            catch (StripeException ex)
            {
                return BadRequest(new { error = "Stripe error: " + ex.Message });
            }
            catch (System.Exception ex)
            {
                return StatusCode(500, new { error = "Internal Server Error: " + ex.Message });
            }
        }
    }
}
