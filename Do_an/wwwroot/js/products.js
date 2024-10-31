// Hàm mở modal thêm sản phẩm
function openAddProductModal() {
    document.getElementById('productModalLabel').innerText = "Thêm Sản Phẩm Mới";
    document.getElementById('productForm').reset(); // Reset form
    document.getElementById('message').innerHTML = ''; // Xóa thông điệp cũ
    $('#productModal').modal('show'); // Hiển thị modal
}

// Hàm xử lý lưu sản phẩm
async function saveProduct() {
    const form = document.getElementById('productForm');
    const formData = new FormData(form);
    const imageFile = document.getElementById('imageFile').files[0];

    // Kiểm tra nếu không có file hình
    if (!imageFile) {
        showMessage('Vui lòng chọn một hình ảnh.', 'danger');
        return;
    }

    // Thêm các trường dữ liệu vào FormData
    formData.append('name', document.getElementById('name').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', parseFloat(document.getElementById('price').value));
    formData.append('quantity', parseInt(document.getElementById('quantity').value));
    formData.append('categoryName', document.getElementById('categoryName').value);
    formData.append('imageFile', imageFile);

    try {
        const response = await fetch('http://localhost:5135/api/Product/AddProduct', {
            method: 'POST',
            body: formData
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('Sản phẩm đã được thêm thành công!', 'success');
            $('#productModal').modal('hide');
            loadProducts(); // Reload product list
        } else {
            // Handle validation errors
            const errorData = await response.json();
            const errorMessage = errorData.errors?.ImageFile ? errorData.errors.ImageFile.join(', ') : 'Không thể thêm sản phẩm.';
            showMessage(errorMessage, 'danger');
        }
    } catch (error) {
        // Handle network or unexpected errors
        showMessage('Lỗi kết nối hoặc lỗi không xác định xảy ra.', 'danger');
        console.error("Error saving product:", error);
    }
}

// Hàm hiển thị thông báo
function showMessage(message, type) {
    const messageDiv = document.getElementById('message');
    messageDiv.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
    setTimeout(() => messageDiv.innerHTML = '', 5000); // Clear the message after 5 seconds
}



// Hàm tải danh sách sản phẩm từ API
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5135/api/Product/GetProducts');

        // Kiểm tra mã phản hồi từ server
        if (!response.ok) {
            console.error("Lỗi phản hồi từ server:", response.status, response.statusText);
            document.getElementById('productTableBody').innerHTML = '<tr><td colspan="8" class="text-center">Đã xảy ra lỗi từ server.</td></tr>';
            return;
        }

        const result = await response.json();

        if (result && Array.isArray(result.$values)) {
            const products = result.$values; // Lấy mảng sản phẩm từ $values

            const productTableBody = document.getElementById('productTableBody');
            productTableBody.innerHTML = ''; // Xóa nội dung cũ

            // Kiểm tra nếu có sản phẩm
            if (products.length === 0) {
                productTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có sản phẩm nào.</td></tr>'; // Hiển thị thông báo nếu không có sản phẩm
                return;
            }

            products.forEach(product => {
                const row = `
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>${product.quantity}</td>
                        <td><img src="${product.imageUrl}" alt="Hình ảnh sản phẩm" width="50"></td>
                        <td>${product.categoryName}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="editProduct(${product.productId})">Chỉnh sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteProduct(${product.productId})">Xóa</button>
                        </td>
                    </tr>
                `;
                productTableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            console.error("Dữ liệu không hợp lệ:", result);
            document.getElementById('productTableBody').innerHTML = '<tr><td colspan="8" class="text-center">Đã xảy ra lỗi khi tải sản phẩm.</td></tr>';
        }
    } catch (error) {
        console.error("Lỗi khi tải sản phẩm:", error);
        document.getElementById('productTableBody').innerHTML = '<tr><td colspan="8" class="text-center">Đã xảy ra lỗi khi tải sản phẩm.</td></tr>';
    }
}


// Gọi hàm loadProducts khi trang được tải
document.addEventListener('DOMContentLoaded', loadProducts);

// Hàm mở modal chỉnh sửa sản phẩm
function openEditProductModal(product) {
    document.getElementById('productModalLabel').innerText = "Chỉnh Sửa Sản Phẩm";
    document.getElementById('productForm').reset(); // Reset form
    document.getElementById('message').innerHTML = ''; // Xóa thông điệp cũ

    // Điền thông tin sản phẩm vào form
    document.getElementById('name').value = product.name;
    document.getElementById('description').value = product.description;
    document.getElementById('price').value = product.price;
    document.getElementById('quantity').value = product.quantity;
    document.getElementById('categoryName').value = product.categoryName;

    // Hiển thị hình ảnh sản phẩm
    const imageElement = document.getElementById('imageFile');
    imageElement.src = `http://localhost:5135/images/${product.imageUrl}`;
    imageElement.alt = product.name;

    $('#productModal').modal('show'); // Hiển thị modal
}

// Hàm xử lý cập nhật sản phẩm
async function updateProduct(productId) {
    const form = document.getElementById('productForm');
    const formData = new FormData(form); // Tạo FormData từ form
    const imageFile = document.getElementById('imageFile').files[0];

    // Nếu có file hình mới thì thêm vào formData
    if (imageFile) {
        formData.append('imageFile', imageFile); // Thêm file hình
    }

    try {
        const response = await fetch(`http://localhost:5135/api/Product/UpdateProduct/${productId}`, {
            method: 'PUT',
            body: formData // Gửi FormData
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('Sản phẩm đã được cập nhật thành công!', 'success');
            $('#productModal').modal('hide'); // Đóng modal sau khi cập nhật thành công
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const errorData = await response.json();
            showMessage(errorData.errors.ImageFile ? errorData.errors.ImageFile.join(', ') : 'Không thể cập nhật sản phẩm.', 'danger');
        }
    } catch (error) {
        showMessage(error.message, 'danger');
    }
}

// Hàm chỉnh sửa sản phẩm
function editProduct(productId) {
    // Gọi API để lấy thông tin sản phẩm
    fetch(`http://localhost:5135/api/Product/GetProduct/${productId}`)
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(product => {
            openEditProductModal(product); // Mở modal chỉnh sửa với thông tin sản phẩm
        })
        .catch(error => {
            console.error("Lỗi khi lấy thông tin sản phẩm:", error);
            showMessage(error.message, 'danger');
        });
}

// Hàm xóa sản phẩm
async function deleteProduct(productId) {
    if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
        try {
            const response = await fetch(`http://localhost:5135/api/Product/DeleteProduct/${productId}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('Sản phẩm đã được xóa thành công!', 'success');
                loadProducts(); // Tải lại danh sách sản phẩm sau khi xóa
            } else {
                const errorData = await response.json();
                showMessage(errorData.message || 'Không thể xóa sản phẩm.', 'danger');
            }
        } catch (error) {
            showMessage(error.message, 'danger');
        }
    }
}
