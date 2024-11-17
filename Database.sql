CREATE DATABASE DoAn
-- Bảng Admin (Quản trị viên)
CREATE TABLE Admin (
    AdminID INT PRIMARY KEY IDENTITY(1,1),
    Username NVARCHAR(100) NOT NULL,
    Password NVARCHAR(100) NOT NULL,
    Role NVARCHAR(50) NOT NULL
);

-- Bảng Categories (Danh mục sản phẩm)
CREATE TABLE Categories (
    CategoryID INT PRIMARY KEY IDENTITY(1,1),
    CategoryName NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX)
);

-- Bảng Products (Sản phẩm cây - Đổi tên từ Plants thành Products)
CREATE TABLE Products (
    ProductID INT PRIMARY KEY IDENTITY(1,1),
    Name NVARCHAR(100) NOT NULL,
    Description NVARCHAR(MAX),
    Price DECIMAL(10, 2) NOT NULL,
    Quantity INT NOT NULL,
    CategoryID INT FOREIGN KEY REFERENCES Categories(CategoryID),
    ImageURL NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE(),
    ModifiedBy INT FOREIGN KEY REFERENCES Admin(AdminID)  -- FK đến bảng Admin
);

-- Bảng Customers (Khách hàng)
CREATE TABLE Customers (
    CustomerID INT PRIMARY KEY IDENTITY(1,1),
    FullName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(100) NOT NULL,
    PhoneNumber NVARCHAR(20),
    Address NVARCHAR(255),
    CreatedAt DATETIME DEFAULT GETDATE(),
    UpdatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Orders (Đơn hàng)
CREATE TABLE Orders (
    OrderID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),  -- FK đến bảng Customers
    OrderDate DATETIME DEFAULT GETDATE(),
    TotalAmount DECIMAL(10, 2) NOT NULL,
    Status NVARCHAR(50),
    ProcessedBy INT FOREIGN KEY REFERENCES Admin(AdminID)  -- FK đến bảng Admin
);

-- Bảng OrderDetails (Chi tiết đơn hàng)
CREATE TABLE OrderDetails (
    OrderDetailID INT PRIMARY KEY IDENTITY(1,1),
    OrderID INT FOREIGN KEY REFERENCES Orders(OrderID),  -- FK đến bảng Orders
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),  -- FK đến bảng Products
    Quantity INT NOT NULL,
    Price DECIMAL(10, 2) NOT NULL,
    Total AS (Quantity * Price) PERSISTED  -- Tính tổng tự động
);

-- Bảng WasteCollectionPoints (Điểm thu gom rác thải)
CREATE TABLE WasteCollectionPoints (
    CollectionPointID INT PRIMARY KEY IDENTITY(1,1),
    LocationName NVARCHAR(100) NOT NULL,
    Address NVARCHAR(255) NOT NULL,
    CollectionDate DATETIME,
    Capacity INT,
    ManagerName NVARCHAR(100),
    PhoneNumber NVARCHAR(20),
    CreatedBy INT FOREIGN KEY REFERENCES Admin(AdminID)  -- FK đến bảng Admin
);

-- Bảng WasteExchanges (Giao dịch đổi rác lấy cây)
CREATE TABLE WasteExchanges (
    ExchangeID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),  -- FK đến bảng Customers
    CollectionPointID INT FOREIGN KEY REFERENCES WasteCollectionPoints(CollectionPointID),  -- FK đến bảng WasteCollectionPoints
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),  -- FK đến bảng Products
    WasteAmount DECIMAL(10, 2) NOT NULL,  -- Khối lượng rác thải nộp (kg)
    ExchangeDate DATETIME DEFAULT GETDATE()
);

-- Bảng Reviews (Đánh giá sản phẩm)
CREATE TABLE Reviews (
    ReviewID INT PRIMARY KEY IDENTITY(1,1),
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),  -- FK đến bảng Products
    CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),  -- FK đến bảng Customers
    Rating INT CHECK (Rating BETWEEN 1 AND 5),  -- Đánh giá từ 1 đến 5 sao
    Comment NVARCHAR(MAX),
    CreatedAt DATETIME DEFAULT GETDATE()
);

-- Bảng Cart (Giỏ hàng)
CREATE TABLE Cart (
    CartID INT PRIMARY KEY IDENTITY(1,1),
    CustomerID INT FOREIGN KEY REFERENCES Customers(CustomerID),  -- FK đến bảng Customers
    ProductID INT FOREIGN KEY REFERENCES Products(ProductID),  -- FK đến bảng Products
    Quantity INT NOT NULL
);
