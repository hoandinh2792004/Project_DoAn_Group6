using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Do_an.Migrations
{
    /// <inheritdoc />
    public partial class AddNewDatabase : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Admin",
                columns: table => new
                {
                    AdminID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Role = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Admin__719FE4E891B50B4C", x => x.AdminID);
                });

            migrationBuilder.CreateTable(
                name: "Categories",
                columns: table => new
                {
                    CategoryID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CategoryName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Categori__19093A2B8E6A0F49", x => x.CategoryID);
                });

            migrationBuilder.CreateTable(
                name: "Roles",
                columns: table => new
                {
                    RoleID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    RolesName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Roles__B03200E3F5E848B2", x => x.RoleID);
                });

            migrationBuilder.CreateTable(
                name: "User",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Password = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Users__F7F2B247A9B14D7D", x => x.UserID);
                });

            migrationBuilder.CreateTable(
                name: "WasteCollectionPoints",
                columns: table => new
                {
                    CollectionPointID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    LocationName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    CollectionDate = table.Column<DateTime>(type: "datetime", nullable: true),
                    Capacity = table.Column<int>(type: "int", nullable: true),
                    ManagerName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    CreatedBy = table.Column<int>(type: "int", nullable: true),
                    CreatedByNavigationAdminId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WasteCol__E8EFF6FEBEFDBEEC", x => x.CollectionPointID);
                    table.ForeignKey(
                        name: "FK_WasteCollectionPoints_Admin_CreatedByNavigationAdminId",
                        column: x => x.CreatedByNavigationAdminId,
                        principalTable: "Admin",
                        principalColumn: "AdminID");
                });

            migrationBuilder.CreateTable(
                name: "Products",
                columns: table => new
                {
                    ProductID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Name = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Quantity = table.Column<int>(type: "int", nullable: false),
                    ImageURL = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    ModifiedBy = table.Column<int>(type: "int", nullable: true),
                    CategoryName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CategoryId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Products__B40CC6ED68993502", x => x.ProductID);
                    table.ForeignKey(
                        name: "FK__Products__Catego__3B75D760",
                        column: x => x.CategoryId,
                        principalTable: "Categories",
                        principalColumn: "CategoryID");
                    table.ForeignKey(
                        name: "FK__Products__Modifi__3E52440B",
                        column: x => x.ModifiedBy,
                        principalTable: "Admin",
                        principalColumn: "AdminID");
                });

            migrationBuilder.CreateTable(
                name: "Customers",
                columns: table => new
                {
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FullName = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PhoneNumber = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: true),
                    Address = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    UpdatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    Username = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Customer__A4AE64B8B079EA0F", x => x.UserId);
                    table.ForeignKey(
                        name: "FK_Customers_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserID");
                });

            migrationBuilder.CreateTable(
                name: "UserRoles",
                columns: table => new
                {
                    UserID = table.Column<int>(type: "int", nullable: false),
                    RoleID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__UserRole__5C1B90C6D43DBE27", x => new { x.UserID, x.RoleID });
                    table.ForeignKey(
                        name: "FK__UserRole__RoleID__6B24B6D2",
                        column: x => x.RoleID,
                        principalTable: "Roles",
                        principalColumn: "RoleID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK__UserRole__UserID__6A30C643",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Cart",
                columns: table => new
                {
                    CartID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    ProductID = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Cart__51BCD797535DCAF7", x => x.CartID);
                    table.ForeignKey(
                        name: "FK__Cart__CustomerID__5BE2A6F2",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__Cart__ProductID__5CD6CB2B",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ProductID");
                });

            migrationBuilder.CreateTable(
                name: "Orders",
                columns: table => new
                {
                    OrderID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderDate = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())"),
                    TotalAmount = table.Column<decimal>(type: "decimal(10,2)", nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    UserID = table.Column<int>(type: "int", nullable: false),
                    ShippingAddress = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AdminId = table.Column<int>(type: "int", nullable: true),
                    CustomerUserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Orders__C3905BAF5E28BB23", x => x.OrderID);
                    table.ForeignKey(
                        name: "FK_Orders_Admin_AdminId",
                        column: x => x.AdminId,
                        principalTable: "Admin",
                        principalColumn: "AdminID");
                    table.ForeignKey(
                        name: "FK_Orders_Customers_CustomerUserId",
                        column: x => x.CustomerUserId,
                        principalTable: "Customers",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_Orders_Users_UserID",
                        column: x => x.UserID,
                        principalTable: "User",
                        principalColumn: "UserID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "Reviews",
                columns: table => new
                {
                    ReviewID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ProductID = table.Column<int>(type: "int", nullable: true),
                    CustomerID = table.Column<int>(type: "int", nullable: true),
                    Rating = table.Column<int>(type: "int", nullable: true),
                    Comment = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    CreatedAt = table.Column<DateTime>(type: "datetime", nullable: true, defaultValueSql: "(getdate())")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__Reviews__74BC79AEDF827FC7", x => x.ReviewID);
                    table.ForeignKey(
                        name: "FK__Reviews__Custome__571DF1D5",
                        column: x => x.CustomerID,
                        principalTable: "Customers",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK__Reviews__Product__5629CD9C",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ProductID");
                });

            migrationBuilder.CreateTable(
                name: "WasteExchanges",
                columns: table => new
                {
                    ExchangeID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CustomerId = table.Column<int>(type: "int", nullable: true),
                    CollectionPointId = table.Column<int>(type: "int", nullable: true),
                    ProductId = table.Column<int>(type: "int", nullable: true),
                    WasteAmount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    ExchangeDate = table.Column<DateTime>(type: "datetime", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__WasteExc__35C06BF0F14DB14E", x => x.ExchangeID);
                    table.ForeignKey(
                        name: "FK_WasteExchanges_Customers_CustomerId",
                        column: x => x.CustomerId,
                        principalTable: "Customers",
                        principalColumn: "UserId");
                    table.ForeignKey(
                        name: "FK_WasteExchanges_Products_ProductId",
                        column: x => x.ProductId,
                        principalTable: "Products",
                        principalColumn: "ProductID");
                    table.ForeignKey(
                        name: "FK_WasteExchanges_WasteCollectionPoints_CollectionPointId",
                        column: x => x.CollectionPointId,
                        principalTable: "WasteCollectionPoints",
                        principalColumn: "CollectionPointID");
                });

            migrationBuilder.CreateTable(
                name: "OrderDetails",
                columns: table => new
                {
                    OrderDetailID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OrderID = table.Column<int>(type: "int", nullable: true),
                    ProductID = table.Column<int>(type: "int", nullable: true),
                    Quantity = table.Column<int>(type: "int", nullable: true),
                    Price = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    Total = table.Column<decimal>(type: "decimal(21,2)", nullable: true, computedColumnSql: "([Quantity]*[Price])", stored: true),
                    ProductName = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    ShippingAddress = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaymentMethod = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__OrderDet__D3B9D30C060D8175", x => x.OrderDetailID);
                    table.ForeignKey(
                        name: "FK__OrderDeta__Order__49C3F6B7",
                        column: x => x.OrderID,
                        principalTable: "Orders",
                        principalColumn: "OrderID");
                    table.ForeignKey(
                        name: "FK__OrderDeta__Produ__4AB81AF0",
                        column: x => x.ProductID,
                        principalTable: "Products",
                        principalColumn: "ProductID");
                });

            migrationBuilder.CreateIndex(
                name: "IX_Cart_CustomerID",
                table: "Cart",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Cart_ProductID",
                table: "Cart",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_OrderID",
                table: "OrderDetails",
                column: "OrderID");

            migrationBuilder.CreateIndex(
                name: "IX_OrderDetails_ProductID",
                table: "OrderDetails",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_AdminId",
                table: "Orders",
                column: "AdminId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_CustomerUserId",
                table: "Orders",
                column: "CustomerUserId");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserID",
                table: "Orders",
                column: "UserID");

            migrationBuilder.CreateIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                column: "CategoryId");

            migrationBuilder.CreateIndex(
                name: "IX_Products_ModifiedBy",
                table: "Products",
                column: "ModifiedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_CustomerID",
                table: "Reviews",
                column: "CustomerID");

            migrationBuilder.CreateIndex(
                name: "IX_Reviews_ProductID",
                table: "Reviews",
                column: "ProductID");

            migrationBuilder.CreateIndex(
                name: "IX_UserRoles_RoleID",
                table: "UserRoles",
                column: "RoleID");

            migrationBuilder.CreateIndex(
                name: "IX_WasteCollectionPoints_CreatedByNavigationAdminId",
                table: "WasteCollectionPoints",
                column: "CreatedByNavigationAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_WasteExchanges_CollectionPointId",
                table: "WasteExchanges",
                column: "CollectionPointId");

            migrationBuilder.CreateIndex(
                name: "IX_WasteExchanges_CustomerId",
                table: "WasteExchanges",
                column: "CustomerId");

            migrationBuilder.CreateIndex(
                name: "IX_WasteExchanges_ProductId",
                table: "WasteExchanges",
                column: "ProductId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Cart");

            migrationBuilder.DropTable(
                name: "OrderDetails");

            migrationBuilder.DropTable(
                name: "Reviews");

            migrationBuilder.DropTable(
                name: "UserRoles");

            migrationBuilder.DropTable(
                name: "WasteExchanges");

            migrationBuilder.DropTable(
                name: "Orders");

            migrationBuilder.DropTable(
                name: "Roles");

            migrationBuilder.DropTable(
                name: "Products");

            migrationBuilder.DropTable(
                name: "WasteCollectionPoints");

            migrationBuilder.DropTable(
                name: "Customers");

            migrationBuilder.DropTable(
                name: "Categories");

            migrationBuilder.DropTable(
                name: "Admin");

            migrationBuilder.DropTable(
                name: "User");
        }
    }
}
