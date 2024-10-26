using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Do_an.Migrations
{
    /// <inheritdoc />
    public partial class RemoveCustomerAndProcessedBy : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK__Orders__Customer__44FF419A",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK__Orders__Processe__46E78A0C",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_UserId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "ProcessedBy",
                table: "Orders",
                newName: "CustomerUserId");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_ProcessedBy",
                table: "Orders",
                newName: "IX_Orders_CustomerUserId");

            migrationBuilder.AddColumn<int>(
                name: "AdminId",
                table: "Orders",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Orders_AdminId",
                table: "Orders",
                column: "AdminId");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Admin_AdminId",
                table: "Orders",
                column: "AdminId",
                principalTable: "Admin",
                principalColumn: "AdminID");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Customers_CustomerUserId",
                table: "Orders",
                column: "CustomerUserId",
                principalTable: "Customers",
                principalColumn: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Admin_AdminId",
                table: "Orders");

            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Customers_CustomerUserId",
                table: "Orders");

            migrationBuilder.DropIndex(
                name: "IX_Orders_AdminId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "AdminId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "CustomerUserId",
                table: "Orders",
                newName: "ProcessedBy");

            migrationBuilder.RenameIndex(
                name: "IX_Orders_CustomerUserId",
                table: "Orders",
                newName: "IX_Orders_ProcessedBy");

            migrationBuilder.CreateIndex(
                name: "IX_Orders_UserId",
                table: "Orders",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK__Orders__Customer__44FF419A",
                table: "Orders",
                column: "UserId",
                principalTable: "Customers",
                principalColumn: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK__Orders__Processe__46E78A0C",
                table: "Orders",
                column: "ProcessedBy",
                principalTable: "Admin",
                principalColumn: "AdminID");
        }
    }
}
