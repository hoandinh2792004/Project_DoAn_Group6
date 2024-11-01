using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Do_an.Migrations
{
    /// <inheritdoc />
    public partial class AddCategoryNameToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "CategoryID",
                table: "Products",
                newName: "CategoryId");

            migrationBuilder.RenameIndex(
                name: "IX_Products_CategoryID",
                table: "Products",
                newName: "IX_Products_CategoryId");

            migrationBuilder.AddColumn<string>(
                name: "CategoryName",
                table: "Products",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "CategoryName",
                table: "Products");

            migrationBuilder.RenameColumn(
                name: "CategoryId",
                table: "Products",
                newName: "CategoryID");

            migrationBuilder.RenameIndex(
                name: "IX_Products_CategoryId",
                table: "Products",
                newName: "IX_Products_CategoryID");

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "Orders",
                type: "int",
                nullable: true);
        }
    }
}
