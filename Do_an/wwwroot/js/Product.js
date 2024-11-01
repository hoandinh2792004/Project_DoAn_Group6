$(document).ready(function () {
    let itemsPerPage = parseInt($('#pageSize').val()) || 4; // Lấy giá trị pageSize từ HTML hoặc mặc định là 8
    let currentPage = 1;
    let products = [];

    if (window.location.pathname.includes('UserDashboard')) {
        itemsPerPage = 4;
    } else if (window.location.pathname.includes('Shop')) {
        itemsPerPage = 12;
    }

    // Gọi API để lấy danh sách sản phẩm
    $.ajax({
        url: 'http://localhost:5135/api/Product/GetProducts',
        method: 'GET',
        success: function (response) {
            console.log(response); // Ghi lại phản hồi để xem cấu trúc
            products = response.$values; // Trích xuất mảng sản phẩm từ phản hồi
            if (Array.isArray(products)) {
                renderProductsUser(); // Hiển thị danh sách sản phẩm cho người dùng
                setupPagination(); // Thiết lập phân trang
            } else {
                console.error("Dự kiến rằng products là một mảng, nhưng nhận được:", products);
            }
        },
        error: function (xhr, status, error) {
            console.error("Lỗi khi lấy sản phẩm:", error);
        }
    });

    
    function renderProductsUser() {
        $('#product-list-user').empty();
        const start = (currentPage - 1) * itemsPerPage;
        const end = start + itemsPerPage;
        const currentProducts = products.slice(start, end);

        currentProducts.forEach(function (product) {
            // Kiểm tra và xây dựng đường dẫn hình ảnh
            const imageUrl = product.imageUrl
                ? `http://localhost:5135/images/${product.imageUrl.split('/').pop()}` // Điều chỉnh để lấy tên file
                : 'http://localhost:5135/images/default.png'; // Hình ảnh mặc định nếu không có

            $('#product-list-user').append(`
            <div class="col-md-6 col-lg-4 col-xl-3 wow fadeInUp" data-wow-delay="0.1s">
                <div class="product-item">
                    <div class="position-relative">
                        <img class="img-fluid" src="${imageUrl}" alt="${product.name}">
                        <div class="product-overlay">
                            <a id="product-link-btn" class="btn btn-square btn-secondary rounded-circle m-1" href="single-product.html?id=${product.productId}">
                                <i class="bi bi-link"></i>
                            </a>
                            <a class="btn btn-square btn-secondary rounded-circle m-1 add-to-cart"
                                data-name="${product.name}"
                                data-price="${product.price}" 
                                data-img="${imageUrl}">
                                <i class="bi bi-cart"></i>
                            </a>
                        </div>
                    </div>
                    <div class="text-center p-4">
                        <a class="d-block h5" href="single-product.html?id=${product.productId}">${product.name}</a>
                        <span class="text-primary me-1">${product.price}$</span>
                    </div>
                </div>
            </div>
        `);
        });
    }

    function setupPagination() {
        const totalPages = Math.ceil(products.length / itemsPerPage);
        $('#pagination').empty();

        for (let i = 1; i <= totalPages; i++) {
            $('#pagination').append(`
                <li class="page-item${i === currentPage ? ' active' : ''}">
                    <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
                </li>
            `);
        }

        $('#prev-page').toggleClass('disabled', currentPage === 1);
        $('#next-page').toggleClass('disabled', currentPage === totalPages);
    }

    window.changePage = function (page) {
        const totalPages = Math.ceil(products.length / itemsPerPage);
        if (page < 1 || page > totalPages) return;
        currentPage = page;
        renderProductsUser();
        setupPagination();
    }

    $(document).on('click', '.add-to-cart', function (event) {
        event.preventDefault();
        const productName = $(this).data('name');
        const productPrice = parseFloat($(this).data('price'));
        const productImg = $(this).data('img');
        addToCart(productName, productPrice, productImg);
    });
});
