﻿// <auto-generated />
using System;
using Do_an.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Infrastructure;
using Microsoft.EntityFrameworkCore.Metadata;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

#nullable disable

namespace Do_an.Migrations
{
    [DbContext(typeof(DoAnContext))]
    partial class DoAnContextModelSnapshot : ModelSnapshot
    {
        protected override void BuildModel(ModelBuilder modelBuilder)
        {
#pragma warning disable 612, 618
            modelBuilder
                .HasAnnotation("ProductVersion", "8.0.10")
                .HasAnnotation("Relational:MaxIdentifierLength", 128);

            SqlServerModelBuilderExtensions.UseIdentityColumns(modelBuilder);

            modelBuilder.Entity("Do_an.Data.Admin", b =>
                {
                    b.Property<int>("AdminId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("AdminID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("AdminId"));

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Role")
                        .IsRequired()
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("AdminId")
                        .HasName("PK__Admin__719FE4E891B50B4C");

                    b.ToTable("Admin", (string)null);
                });

            modelBuilder.Entity("Do_an.Data.Cart", b =>
                {
                    b.Property<int>("CartId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("CartID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CartId"));

                    b.Property<int?>("CustomerId")
                        .HasColumnType("int")
                        .HasColumnName("CustomerID");

                    b.Property<int?>("ProductId")
                        .HasColumnType("int")
                        .HasColumnName("ProductID");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.HasKey("CartId")
                        .HasName("PK__Cart__51BCD797535DCAF7");

                    b.HasIndex("CustomerId");

                    b.HasIndex("ProductId");

                    b.ToTable("Cart", (string)null);
                });

            modelBuilder.Entity("Do_an.Data.Category", b =>
                {
                    b.Property<int>("CategoryId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("CategoryID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CategoryId"));

                    b.Property<string>("CategoryName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Description")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("CategoryId")
                        .HasName("PK__Categori__19093A2B8E6A0F49");

                    b.ToTable("Categories");
                });

            modelBuilder.Entity("Do_an.Data.Customer", b =>
                {
                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("UserId");

                    b.Property<string>("Address")
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("FullName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("PhoneNumber")
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.Property<DateTime?>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Username")
                        .HasColumnType("nvarchar(max)");

                    b.HasKey("UserId")
                        .HasName("PK__Customer__A4AE64B8B079EA0F");

                    b.ToTable("Customers");
                });

            modelBuilder.Entity("Do_an.Data.Order", b =>
                {
                    b.Property<int>("OrderId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("OrderID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("OrderId"));

                    b.Property<int?>("AdminId")
                        .HasColumnType("int");

                    b.Property<int?>("CustomerUserId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("OrderDate")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Status")
                        .HasMaxLength(50)
                        .HasColumnType("nvarchar(50)");

                    b.Property<decimal>("TotalAmount")
                        .HasColumnType("decimal(10, 2)");

                    b.HasKey("OrderId")
                        .HasName("PK__Orders__C3905BAF5E28BB23");

                    b.HasIndex("AdminId");

                    b.HasIndex("CustomerUserId");

                    b.ToTable("Orders");
                });

            modelBuilder.Entity("Do_an.Data.OrderDetail", b =>
                {
                    b.Property<int>("OrderDetailId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("OrderDetailID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("OrderDetailId"));

                    b.Property<int?>("OrderId")
                        .HasColumnType("int")
                        .HasColumnName("OrderID");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(10, 2)");

                    b.Property<int?>("ProductId")
                        .HasColumnType("int")
                        .HasColumnName("ProductID");

                    b.Property<string>("ProductName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<decimal?>("Total")
                        .ValueGeneratedOnAddOrUpdate()
                        .HasColumnType("decimal(21, 2)")
                        .HasComputedColumnSql("([Quantity]*[Price])", true);

                    b.HasKey("OrderDetailId")
                        .HasName("PK__OrderDet__D3B9D30C060D8175");

                    b.HasIndex("OrderId");

                    b.HasIndex("ProductId");

                    b.ToTable("OrderDetails");
                });

            modelBuilder.Entity("Do_an.Data.Product", b =>
                {
                    b.Property<int>("ProductId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("ProductID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ProductId"));

                    b.Property<int?>("CategoryId")
                        .HasColumnType("int");

                    b.Property<string>("CategoryName")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<string>("Description")
                        .IsRequired()
                        .HasColumnType("nvarchar(max)");

                    b.Property<string>("ImageUrl")
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)")
                        .HasColumnName("ImageURL");

                    b.Property<int?>("ModifiedBy")
                        .HasColumnType("int");

                    b.Property<string>("Name")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<decimal>("Price")
                        .HasColumnType("decimal(10, 2)");

                    b.Property<int>("Quantity")
                        .HasColumnType("int");

                    b.Property<DateTime?>("UpdatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.HasKey("ProductId")
                        .HasName("PK__Products__B40CC6ED68993502");

                    b.HasIndex("CategoryId");

                    b.HasIndex("ModifiedBy");

                    b.ToTable("Products");
                });

            modelBuilder.Entity("Do_an.Data.Review", b =>
                {
                    b.Property<int>("ReviewId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("ReviewID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ReviewId"));

                    b.Property<string>("Comment")
                        .HasColumnType("nvarchar(max)");

                    b.Property<DateTime?>("CreatedAt")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("datetime")
                        .HasDefaultValueSql("(getdate())");

                    b.Property<int?>("CustomerId")
                        .HasColumnType("int")
                        .HasColumnName("CustomerID");

                    b.Property<int?>("ProductId")
                        .HasColumnType("int")
                        .HasColumnName("ProductID");

                    b.Property<int?>("Rating")
                        .HasColumnType("int");

                    b.HasKey("ReviewId")
                        .HasName("PK__Reviews__74BC79AEDF827FC7");

                    b.HasIndex("CustomerId");

                    b.HasIndex("ProductId");

                    b.ToTable("Reviews");
                });

            modelBuilder.Entity("Do_an.Data.WasteCollectionPoint", b =>
                {
                    b.Property<int>("CollectionPointId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("CollectionPointID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("CollectionPointId"));

                    b.Property<string>("Address")
                        .IsRequired()
                        .HasMaxLength(255)
                        .HasColumnType("nvarchar(255)");

                    b.Property<int?>("Capacity")
                        .HasColumnType("int");

                    b.Property<DateTime?>("CollectionDate")
                        .HasColumnType("datetime");

                    b.Property<int?>("CreatedBy")
                        .HasColumnType("int");

                    b.Property<int?>("CreatedByNavigationAdminId")
                        .HasColumnType("int");

                    b.Property<string>("LocationName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("ManagerName")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("PhoneNumber")
                        .HasMaxLength(20)
                        .HasColumnType("nvarchar(20)");

                    b.HasKey("CollectionPointId")
                        .HasName("PK__WasteCol__E8EFF6FEBEFDBEEC");

                    b.HasIndex("CreatedByNavigationAdminId");

                    b.ToTable("WasteCollectionPoints");
                });

            modelBuilder.Entity("Do_an.Data.WasteExchange", b =>
                {
                    b.Property<int>("ExchangeId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("ExchangeID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("ExchangeId"));

                    b.Property<int?>("CollectionPointId")
                        .HasColumnType("int");

                    b.Property<int?>("CustomerId")
                        .HasColumnType("int");

                    b.Property<DateTime?>("ExchangeDate")
                        .HasColumnType("datetime");

                    b.Property<int?>("ProductId")
                        .HasColumnType("int");

                    b.Property<decimal>("WasteAmount")
                        .HasColumnType("decimal(18,2)");

                    b.HasKey("ExchangeId")
                        .HasName("PK__WasteExc__35C06BF0F14DB14E");

                    b.HasIndex("CollectionPointId");

                    b.HasIndex("CustomerId");

                    b.HasIndex("ProductId");

                    b.ToTable("WasteExchanges");
                });

            modelBuilder.Entity("Role", b =>
                {
                    b.Property<int>("RolesId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("RoleID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("RolesId"));

                    b.Property<string>("RolesName")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("RolesId")
                        .HasName("PK__Roles__B03200E3F5E848B2");

                    b.ToTable("Roles");
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Property<int>("UserId")
                        .ValueGeneratedOnAdd()
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    SqlServerPropertyBuilderExtensions.UseIdentityColumn(b.Property<int>("UserId"));

                    b.Property<string>("Email")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("FullName")
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Password")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.Property<string>("Username")
                        .IsRequired()
                        .HasMaxLength(100)
                        .HasColumnType("nvarchar(100)");

                    b.HasKey("UserId")
                        .HasName("PK__Users__F7F2B247A9B14D7D");

                    b.ToTable("User");
                });

            modelBuilder.Entity("UserRole", b =>
                {
                    b.Property<int>("UserId")
                        .HasColumnType("int")
                        .HasColumnName("UserID");

                    b.Property<int>("RolesId")
                        .HasColumnType("int")
                        .HasColumnName("RoleID");

                    b.HasKey("UserId", "RolesId")
                        .HasName("PK__UserRole__5C1B90C6D43DBE27");

                    b.HasIndex("RolesId");

                    b.ToTable("UserRoles");
                });

            modelBuilder.Entity("Do_an.Data.Cart", b =>
                {
                    b.HasOne("Do_an.Data.Customer", "Customer")
                        .WithMany("Carts")
                        .HasForeignKey("CustomerId")
                        .HasConstraintName("FK__Cart__CustomerID__5BE2A6F2");

                    b.HasOne("Do_an.Data.Product", "Product")
                        .WithMany("Carts")
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK__Cart__ProductID__5CD6CB2B");

                    b.Navigation("Customer");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Do_an.Data.Customer", b =>
                {
                    b.HasOne("User", "User")
                        .WithMany("Customers")
                        .HasForeignKey("UserId")
                        .IsRequired()
                        .HasConstraintName("FK_Customers_Users_UserId");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Do_an.Data.Order", b =>
                {
                    b.HasOne("Do_an.Data.Admin", null)
                        .WithMany("Orders")
                        .HasForeignKey("AdminId");

                    b.HasOne("Do_an.Data.Customer", null)
                        .WithMany("Orders")
                        .HasForeignKey("CustomerUserId");
                });

            modelBuilder.Entity("Do_an.Data.OrderDetail", b =>
                {
                    b.HasOne("Do_an.Data.Order", "Order")
                        .WithMany("OrderDetails")
                        .HasForeignKey("OrderId")
                        .HasConstraintName("FK__OrderDeta__Order__49C3F6B7");

                    b.HasOne("Do_an.Data.Product", "Product")
                        .WithMany("OrderDetails")
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK__OrderDeta__Produ__4AB81AF0");

                    b.Navigation("Order");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Do_an.Data.Product", b =>
                {
                    b.HasOne("Do_an.Data.Category", "Category")
                        .WithMany("Products")
                        .HasForeignKey("CategoryId")
                        .HasConstraintName("FK__Products__Catego__3B75D760");

                    b.HasOne("Do_an.Data.Admin", "ModifiedByNavigation")
                        .WithMany("Products")
                        .HasForeignKey("ModifiedBy")
                        .HasConstraintName("FK__Products__Modifi__3E52440B");

                    b.Navigation("Category");

                    b.Navigation("ModifiedByNavigation");
                });

            modelBuilder.Entity("Do_an.Data.Review", b =>
                {
                    b.HasOne("Do_an.Data.Customer", "Customer")
                        .WithMany("Reviews")
                        .HasForeignKey("CustomerId")
                        .HasConstraintName("FK__Reviews__Custome__571DF1D5");

                    b.HasOne("Do_an.Data.Product", "Product")
                        .WithMany("Reviews")
                        .HasForeignKey("ProductId")
                        .HasConstraintName("FK__Reviews__Product__5629CD9C");

                    b.Navigation("Customer");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("Do_an.Data.WasteCollectionPoint", b =>
                {
                    b.HasOne("Do_an.Data.Admin", "CreatedByNavigation")
                        .WithMany("WasteCollectionPoints")
                        .HasForeignKey("CreatedByNavigationAdminId");

                    b.Navigation("CreatedByNavigation");
                });

            modelBuilder.Entity("Do_an.Data.WasteExchange", b =>
                {
                    b.HasOne("Do_an.Data.WasteCollectionPoint", "CollectionPoint")
                        .WithMany("WasteExchanges")
                        .HasForeignKey("CollectionPointId");

                    b.HasOne("Do_an.Data.Customer", "Customer")
                        .WithMany("WasteExchanges")
                        .HasForeignKey("CustomerId");

                    b.HasOne("Do_an.Data.Product", "Product")
                        .WithMany("WasteExchanges")
                        .HasForeignKey("ProductId");

                    b.Navigation("CollectionPoint");

                    b.Navigation("Customer");

                    b.Navigation("Product");
                });

            modelBuilder.Entity("UserRole", b =>
                {
                    b.HasOne("Role", "Role")
                        .WithMany("UserRoles")
                        .HasForeignKey("RolesId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("FK__UserRole__RoleID__6B24B6D2");

                    b.HasOne("User", "User")
                        .WithMany("UserRoles")
                        .HasForeignKey("UserId")
                        .OnDelete(DeleteBehavior.Cascade)
                        .IsRequired()
                        .HasConstraintName("FK__UserRole__UserID__6A30C643");

                    b.Navigation("Role");

                    b.Navigation("User");
                });

            modelBuilder.Entity("Do_an.Data.Admin", b =>
                {
                    b.Navigation("Orders");

                    b.Navigation("Products");

                    b.Navigation("WasteCollectionPoints");
                });

            modelBuilder.Entity("Do_an.Data.Category", b =>
                {
                    b.Navigation("Products");
                });

            modelBuilder.Entity("Do_an.Data.Customer", b =>
                {
                    b.Navigation("Carts");

                    b.Navigation("Orders");

                    b.Navigation("Reviews");

                    b.Navigation("WasteExchanges");
                });

            modelBuilder.Entity("Do_an.Data.Order", b =>
                {
                    b.Navigation("OrderDetails");
                });

            modelBuilder.Entity("Do_an.Data.Product", b =>
                {
                    b.Navigation("Carts");

                    b.Navigation("OrderDetails");

                    b.Navigation("Reviews");

                    b.Navigation("WasteExchanges");
                });

            modelBuilder.Entity("Do_an.Data.WasteCollectionPoint", b =>
                {
                    b.Navigation("WasteExchanges");
                });

            modelBuilder.Entity("Role", b =>
                {
                    b.Navigation("UserRoles");
                });

            modelBuilder.Entity("User", b =>
                {
                    b.Navigation("Customers");

                    b.Navigation("UserRoles");
                });
#pragma warning restore 612, 618
        }
    }
}
