using System;
using System.Collections.Generic;
using Microsoft.EntityFrameworkCore;

namespace Do_an.Data
{
    public partial class DoAnContext : DbContext
    {
        public DoAnContext()
        {
        }

        public DoAnContext(DbContextOptions<DoAnContext> options)
            : base(options)
        {
        }

        public virtual DbSet<Admin> Admins { get; set; }
        public virtual DbSet<Cart> Carts { get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<Customer> Customers { get; set; }
        public virtual DbSet<Order> Orders { get; set; }
        public virtual DbSet<OrderDetail> OrderDetails { get; set; }
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<Review> Reviews { get; set; }
        public virtual DbSet<WasteCollectionPoint> WasteCollectionPoints { get; set; }
        public virtual DbSet<WasteExchange> WasteExchanges { get; set; }
        

        /*        public virtual DbSet<UserManagerContext> UserManagerContext { get; set; }*/
        // Thêm các DbSet cho User và Role
        public virtual DbSet<User> User { get; set; }
        public virtual DbSet<Role> Roles { get; set; }
        public virtual DbSet<UserRole> UserRoles { get; set; }


        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {

            modelBuilder.Entity<Admin>(entity =>
            {
                entity.HasKey(e => e.AdminId).HasName("PK__Admin__719FE4E891B50B4C");
                entity.ToTable("Admin");
                entity.Property(e => e.AdminId).HasColumnName("AdminID");
                entity.Property(e => e.Password).HasMaxLength(100);
                entity.Property(e => e.Role).HasMaxLength(50);
                entity.Property(e => e.Username).HasMaxLength(100);
            });

            modelBuilder.Entity<Cart>(entity =>
            {
                entity.HasKey(e => e.CartId).HasName("PK__Cart__51BCD797535DCAF7");
                entity.ToTable("Cart");
                entity.Property(e => e.CartId).HasColumnName("CartID");
                entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
                entity.Property(e => e.ProductId).HasColumnName("ProductID");

                entity.HasOne(d => d.Customer).WithMany(p => p.Carts)
                    .HasForeignKey(d => d.CustomerId)
                    .HasConstraintName("FK__Cart__CustomerID__5BE2A6F2");

                entity.HasOne(d => d.Product).WithMany(p => p.Carts)
                    .HasForeignKey(d => d.ProductId)
                    .HasConstraintName("FK__Cart__ProductID__5CD6CB2B");
            });

            modelBuilder.Entity<Category>(entity =>
            {
                entity.HasKey(e => e.CategoryId).HasName("PK__Categori__19093A2B8E6A0F49");
                entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
                entity.Property(e => e.CategoryName).HasMaxLength(100);
            });

            modelBuilder.Entity<Customer>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK__Customer__A4AE64B8B079EA0F");
                entity.Property(e => e.UserId).HasColumnName("UserId");
                entity.Property(e => e.Address).HasMaxLength(255);
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.FullName).HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
            });

            modelBuilder.Entity<Order>(entity =>
            {
                entity.HasKey(e => e.OrderId).HasName("PK__Orders__C3905BAF5E28BB23");
                entity.Property(e => e.OrderId).HasColumnName("OrderID");
                entity.Property(e => e.OrderDate)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.Status).HasMaxLength(50);
                entity.Property(e => e.TotalAmount).HasColumnType("decimal(10, 2)");
            });

            modelBuilder.Entity<OrderDetail>(entity =>
            {
                entity.HasKey(e => e.OrderDetailId).HasName("PK__OrderDet__D3B9D30C060D8175");
                entity.Property(e => e.OrderDetailId).HasColumnName("OrderDetailID");
                entity.Property(e => e.OrderId).HasColumnName("OrderID");
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.ProductId).HasColumnName("ProductID");
                entity.Property(e => e.Total)
                    .HasComputedColumnSql("([Quantity]*[Price])", true)
                    .HasColumnType("decimal(21, 2)");

                entity.HasOne(d => d.Order).WithMany(p => p.OrderDetails)
                    .HasForeignKey(d => d.OrderId)
                    .HasConstraintName("FK__OrderDeta__Order__49C3F6B7");

                entity.HasOne(d => d.Product).WithMany(p => p.OrderDetails)
                    .HasForeignKey(d => d.ProductId)
                    .HasConstraintName("FK__OrderDeta__Produ__4AB81AF0");
            });

            modelBuilder.Entity<Product>(entity =>
            {
                entity.HasKey(e => e.ProductId).HasName("PK__Products__B40CC6ED68993502");
                entity.Property(e => e.ProductId).HasColumnName("ProductID");
                entity.Property(e => e.CategoryId).HasColumnName("CategoryID");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.ImageUrl)
                    .HasMaxLength(255)
                    .HasColumnName("ImageURL");
                entity.Property(e => e.Name).HasMaxLength(100);
                entity.Property(e => e.Price).HasColumnType("decimal(10, 2)");
                entity.Property(e => e.UpdatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");

                entity.HasOne(d => d.Category).WithMany(p => p.Products)
                    .HasForeignKey(d => d.CategoryId)
                    .HasConstraintName("FK__Products__Catego__3B75D760");

                entity.HasOne(d => d.ModifiedByNavigation).WithMany(p => p.Products)
                    .HasForeignKey(d => d.ModifiedBy)
                    .HasConstraintName("FK__Products__Modifi__3E52440B");
            });

            modelBuilder.Entity<Review>(entity =>
            {
                entity.HasKey(e => e.ReviewId).HasName("PK__Reviews__74BC79AEDF827FC7");
                entity.Property(e => e.ReviewId).HasColumnName("ReviewID");
                entity.Property(e => e.CreatedAt)
                    .HasDefaultValueSql("(getdate())")
                    .HasColumnType("datetime");
                entity.Property(e => e.CustomerId).HasColumnName("CustomerID");
                entity.Property(e => e.ProductId).HasColumnName("ProductID");

                entity.HasOne(d => d.Customer).WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.CustomerId)
                    .HasConstraintName("FK__Reviews__Custome__571DF1D5");

                entity.HasOne(d => d.Product).WithMany(p => p.Reviews)
                    .HasForeignKey(d => d.ProductId)
                    .HasConstraintName("FK__Reviews__Product__5629CD9C");
            });

            modelBuilder.Entity<WasteCollectionPoint>(entity =>
            {
                entity.HasKey(e => e.CollectionPointId).HasName("PK__WasteCol__E8EFF6FEBEFDBEEC");
                entity.Property(e => e.CollectionPointId).HasColumnName("CollectionPointID");
                entity.Property(e => e.Address).HasMaxLength(255);
                entity.Property(e => e.CollectionDate).HasColumnType("datetime");
                entity.Property(e => e.LocationName).HasMaxLength(100);
                entity.Property(e => e.ManagerName).HasMaxLength(100);
                entity.Property(e => e.PhoneNumber).HasMaxLength(20);
            });

            modelBuilder.Entity<WasteExchange>(entity =>
            {
                entity.HasKey(e => e.ExchangeId).HasName("PK__WasteExc__35C06BF0F14DB14E");
                entity.Property(e => e.ExchangeId).HasColumnName("ExchangeID");
                entity.Property(e => e.ExchangeDate).HasColumnType("datetime");
                
            });

            // Định nghĩa các mối quan hệ cho User, Role và UserRole nếu cần
            modelBuilder.Entity<User>(entity =>
            {
                entity.HasKey(e => e.UserId).HasName("PK__Users__F7F2B247A9B14D7D");
                entity.Property(e => e.UserId).HasColumnName("UserID");
                entity.Property(e => e.Username).HasMaxLength(100);
                entity.Property(e => e.Password).HasMaxLength(100);
                entity.Property(e => e.Email).HasMaxLength(100);
                entity.Property(e => e.FullName).HasMaxLength(100);
            });

            modelBuilder.Entity<Role>(entity =>
            {
                entity.HasKey(e => e.RolesId).HasName("PK__Roles__B03200E3F5E848B2");
                entity.Property(e => e.RolesId).HasColumnName("RoleID");
                entity.Property(e => e.RolesName).HasMaxLength(100);
            });

            modelBuilder.Entity<UserRole>(entity =>
            {
                entity.HasKey(e => new { e.UserId, e.RolesId }).HasName("PK__UserRole__5C1B90C6D43DBE27");
                entity.Property(e => e.UserId).HasColumnName("UserID");
                entity.Property(e => e.RolesId).HasColumnName("RoleID");

                entity.HasOne(d => d.User).WithMany(p => p.UserRoles)
                    .HasForeignKey(d => d.UserId)
                    .HasConstraintName("FK__UserRole__UserID__6A30C643");

                entity.HasOne(d => d.Role).WithMany(p => p.UserRoles)
                    .HasForeignKey(d => d.RolesId)
                    .HasConstraintName("FK__UserRole__RoleID__6B24B6D2");
            });

            OnModelCreatingPartial(modelBuilder);
        }

        partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
    }
}
