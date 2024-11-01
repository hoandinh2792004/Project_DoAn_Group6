using Do_an.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using Stripe;
using Do_an.Services;
using Serilog;

namespace Do_an
{
    public class Program
    {
        public static void Main(string[] args)
        {
            // Configure Serilog for logging
            Log.Logger = new LoggerConfiguration()
                .MinimumLevel.Debug()
                .WriteTo.File("logs/myapp.log", rollingInterval: RollingInterval.Day)
                .CreateLogger();

            try
            {
                Log.Information("Starting up the application...");

                var builder = WebApplication.CreateBuilder(args);

                // Add services to the container.
                builder.Services.AddControllersWithViews();
                builder.Services.AddRazorPages();

                // Connect to database
                builder.Services.AddDbContext<DoAnContext>(options =>
                    options.UseSqlServer(builder.Configuration.GetConnectionString("GardenConnectionString")));

                // JWT Authentication configuration
                builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                    .AddJwtBearer(options =>
                    {
                        options.TokenValidationParameters = new TokenValidationParameters
                        {
                            ValidateIssuer = true,
                            ValidateAudience = true,
                            ValidateLifetime = true,
                            ValidateIssuerSigningKey = true,
                            ValidIssuer = builder.Configuration["Jwt:Issuer"],
                            ValidAudience = builder.Configuration["Jwt:Audience"],
                            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]))
                        };
                    });

                // Configure JSON options
                builder.Services.AddControllers()
                    .AddJsonOptions(options =>
                    {
                        options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
                    });

                // Stripe configuration
                var stripeSettings = builder.Configuration.GetSection("Stripe");
                StripeConfiguration.ApiKey = stripeSettings["SecretKey"];

                // Configure session
                builder.Services.AddSession(options =>
                {
                    options.IdleTimeout = TimeSpan.FromMinutes(30);
                    options.Cookie.HttpOnly = true;
                    options.Cookie.IsEssential = true;
                });

                // Add CORS policy
                builder.Services.AddCors(options =>
                {
                    options.AddPolicy("AllowAllOrigins", builder =>
                    {
                        builder.AllowAnyOrigin()
                               .AllowAnyMethod()
                               .AllowAnyHeader();
                    });
                });

                // Add Swagger service
                builder.Services.AddSwaggerGen(c =>
                {
                    c.SwaggerDoc("v1", new OpenApiInfo
                    {
                        Version = "v1",
                        Title = "Your API",
                        Description = "An ASP.NET Core Web API with Swagger integration"
                    });

                    // Add JWT Authentication to Swagger
                    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
                    {
                        Description = "JWT Authorization header using the Bearer scheme (Example: 'Bearer 12345abcdef')",
                        Name = "Authorization",
                        In = ParameterLocation.Header,
                        Type = SecuritySchemeType.ApiKey,
                        Scheme = "Bearer"
                    });

                    c.AddSecurityRequirement(new OpenApiSecurityRequirement()
                    {
                        {
                            new OpenApiSecurityScheme
                            {
                                Reference = new OpenApiReference
                                {
                                    Type = ReferenceType.SecurityScheme,
                                    Id = "Bearer"
                                },
                                Scheme = "oauth2",
                                Name = "Bearer",
                                In = ParameterLocation.Header,
                            },
                            new List<string>()
                        }
                    });
                });

                // Register services
                builder.Services.AddScoped<IEmailServices, EmailService>();
                builder.Services.AddScoped<IUserService, UserService>();
                builder.Services.AddScoped<CustomerService>();

                var app = builder.Build();

                // Configure the HTTP request pipeline.
                if (app.Environment.IsDevelopment())
                {
                    app.UseDeveloperExceptionPage();
                    app.UseSwagger();
                    app.UseSwaggerUI(c =>
                    {
                        c.SwaggerEndpoint("/swagger/v1/swagger.json", "Your API v1");
                    });
                }
                else
                {
                    app.UseExceptionHandler("/Home/Error");
                    app.UseHsts();
                }

                app.UseHttpsRedirection();
                app.UseStaticFiles();

                app.UseRouting();

                // Enable CORS
                app.UseCors("AllowAll");

                // Enable session middleware
                app.UseSession();

                // Authentication and Authorization
                app.UseAuthentication();
                app.UseAuthorization();

                // Map routes
                app.MapControllerRoute(
                    name: "areas",
                    pattern: "{area:exists}/{controller=Home}/{action=Index}/{id?}");

                app.MapControllerRoute(
                    name: "default",
                    pattern: "{controller=Home}/{action=Index}/{id?}");

                app.MapRazorPages(); // Include Razor Pages routing

                app.Run();
            }
            catch (Exception ex)
            {
                Log.Fatal(ex, "Application start-up failed");
            }
            finally
            {
                Log.CloseAndFlush();
            }
        }
    }
}
