using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Do_an.Migrations
{
    /// <inheritdoc />
    public partial class AddUserIdToCustomer : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "CustomerID",
                table: "Orders",
                newName: "UserId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_CustomerID",
                table: "Orders",
                newName: "IX_Orders_UserId");

            migrationBuilder.RenameColumn(
                name: "CustomerID",
                table: "Customers",
                newName: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Orders",
                newName: "CustomerID");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                newName: "IX_Orders_CustomerID");

            migrationBuilder.RenameColumn(
                name: "UserId",
                table: "Customers",
                newName: "CustomerID");
        }
    }
}
