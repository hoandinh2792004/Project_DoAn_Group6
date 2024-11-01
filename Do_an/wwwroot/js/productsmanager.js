// Hàm mở modal thêm sản phẩm
function openAddProductModal() {
    document.getElementById('addProductModalLabel').innerText = "Thêm Sản Phẩm Mới";
    document.getElementById('addProductForm').reset(); // Reset form
    document.getElementById('addMessage').innerHTML = ''; // Xóa thông điệp cũ
    $('#addProductModal').modal('show'); // Hiển thị modal
}

// Hàm xử lý lưu sản phẩm
async function saveProduct() {
    const form = document.getElementById('addProductForm');
    const formData = new FormData(form); // Tạo FormData từ form
    const imageFile = document.getElementById('imageFile').files[0];

    // Kiểm tra nếu không có file hình
    if (!imageFile) {
        showMessage('Vui lòng chọn một hình ảnh.', 'danger', false, 'addProduct'); // Sửa ở đây
        return;
    }

    formData.append('name', document.getElementById('name').value);
    formData.append('description', document.getElementById('description').value);
    formData.append('price', parseFloat(document.getElementById('price').value));
    formData.append('quantity', parseInt(document.getElementById('quantity').value));
    formData.append('categoryName', document.getElementById('categoryName').value);
    formData.append('imageFile', imageFile); // Thêm file hình

    try {
        const response = await fetch('http://localhost:5135/api/Product/AddProduct', {
            method: 'POST',
            body: formData // Gửi FormData
        });

        if (response.ok) {
            const data = await response.json();
            showMessage('Sản phẩm đã được thêm thành công!', 'success', false, 'addProduct'); // Sửa ở đây
            $('#addProductModal').modal('hide'); // Đóng modal sau khi thêm thành công
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const errorData = await response.json();
            showMessage(errorData.errors.ImageFile ? errorData.errors.ImageFile.join(', ') : 'Không thể thêm sản phẩm.', 'danger', false, 'addProduct'); // Sửa ở đây
        }
    } catch (error) {
        showMessage(error.message, 'danger', false, 'addProduct'); // Sửa ở đây
    }
}

// Hàm hiển thị thông báo
function showMessage(message, type, isEditMode = false, modalType = 'addProduct') {
    const messageElementId = modalType === 'editProduct' ? 'editMessage' : 'addMessage'; 
    const messageElement = document.getElementById(messageElementId);
    messageElement.innerHTML = `<div class="alert alert-${type}">${message}</div>`;
}

// Hàm tải danh sách sản phẩm từ API
async function loadProducts() {
    try {
        const response = await fetch('http://localhost:5135/api/Product/GetProducts');
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
                // Kiểm tra và xây dựng đường dẫn hình ảnh
                const imageUrl = product.imageUrl
                    ? `http://localhost:5135/images/${product.imageUrl.split('/').pop()}`
                    : 'http://localhost:5135/images/default.png'; // Đặt hình ảnh mặc định nếu không có

                const row = `
                    <tr>
                        <td>${product.productId}</td>
                        <td>${product.name}</td>
                        <td>${product.price}</td>
                        <td>${product.description}</td>
                        <td>${product.quantity}</td>
                        <td><img src="${imageUrl}" alt="Hình ảnh sản phẩm" width="50"></td>
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
    const modalLabel = document.getElementById('editProductModalLabel');
    if (!modalLabel) {
        console.error("Modal label element not found!");
        return; // Prevent further execution if element is not found
    }

    modalLabel.innerText = "Chỉnh Sửa Sản Phẩm"; // Set the modal title

    // Reset the form and message display
    document.getElementById('editProductForm').reset(); // Reset the form
    document.getElementById('editMessage').innerHTML = ''; // Clear old messages

    // Fill the form fields with the product information
    document.getElementById('editProductId').value = product.productId;
    document.getElementById('editName').value = product.name;
    document.getElementById('editDescription').value = product.description;
    document.getElementById('editPrice').value = product.price;
    document.getElementById('editQuantity').value = product.quantity;
    document.getElementById('editCategoryName').value = product.categoryName;

    // Show the old image if available
    const oldImagePreview = document.getElementById('oldImagePreview');
    if (product.imageUrl) {
        oldImagePreview.src = `http://localhost:5135/images/${product.imageUrl.split('/').pop()}`;
        oldImagePreview.style.display = 'block'; // Make the old image visible
    } else {
        oldImagePreview.style.display = 'none'; // Hide if there's no image
    }

    $('#editProductModal').modal('show'); // Show the modal
}

async function updateProduct(productId) {
    const form = document.getElementById('editProductForm');
    const formData = new FormData(form); // Tạo FormData từ form

    // Thêm các trường cần thiết vào formData
    formData.append('Name', document.getElementById('editName').value);
    formData.append('Description', document.getElementById('editDescription').value);
    formData.append('CategoryName', document.getElementById('editCategoryName').value);
    formData.append('Price', document.getElementById('editPrice').value);
    formData.append('Quantity', document.getElementById('editQuantity').value);

    const imageFile = document.getElementById('editImageFile').files[0]; // Lấy file hình ảnh
    // Nếu có hình ảnh mới, thêm vào formData
    if (imageFile) {
        formData.append('imageFile', imageFile); // Thêm file hình ảnh
    }

    // Ghi lại nội dung FormData để debug
    for (let [key, value] of formData.entries()) {
        console.log(key, value);
    }

    // Kiểm tra xem tất cả các trường bắt buộc đã được điền hay chưa
    try {
        const requiredFields = ['editName', 'editDescription', 'editCategoryName', 'editPrice', 'editQuantity'];
        for (const fieldId of requiredFields) {
            const fieldValue = document.getElementById(fieldId).value.trim(); // Lấy giá trị và loại bỏ khoảng trắng
            if (!fieldValue) {
                throw new Error(`Vui lòng điền đầy đủ thông tin cho trường: ${fieldId.replace('edit', '')}`); // Ném lỗi nếu trường rỗng
            }
        }

        const response = await fetch(`http://localhost:5135/api/Product/UpdateProduct/${productId}`, {
            method: 'PUT',
            body: formData // Gửi FormData
        });

        if (response.ok) {
            // Xử lý trường hợp không có nội dung
            if (response.status === 204) {
                showMessage('Sản phẩm đã được cập nhật thành công!', 'success', true, 'editProduct'); // Sửa ở đây
            } else {
                // Nếu có body phản hồi, phân tích nó
                const data = await response.json();
                showMessage('Sản phẩm đã được cập nhật thành công!', 'success', true, 'editProduct'); // Sửa ở đây
            }
            $('#editProductModal').modal('hide'); // Đóng modal khi thành công
            loadProducts(); // Tải lại danh sách sản phẩm
        } else {
            const errorData = await response.json();
            console.error("Validation Errors:", errorData); // Ghi lại lỗi xác thực
            showMessage(errorData.errors.Name ? errorData.errors.Name.join(', ') : 'Không thể cập nhật sản phẩm.', 'danger', true, 'editProduct'); // Sửa ở đây
        }
    } catch (error) {
        console.error("Error during update:", error);
        showMessage(error.message || "Có lỗi xảy ra trong quá trình cập nhật sản phẩm. Vui lòng thử lại.", 'danger', true, 'editProduct'); // Sửa ở đây
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
            showMessage(error.message, 'danger', true, 'editProduct'); // Sửa ở đây
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
                showMessage('Sản phẩm đã được xóa thành công!', 'success', false); // Hiển thị thông báo thành công
                document.getElementById('addProductForm').reset(); // Reset form thêm sản phẩm
                document.getElementById('editProductForm').reset(); // Reset form chỉnh sửa sản phẩm
                loadProducts(); // Tải lại danh sách sản phẩm sau khi xóa
            } else {
                const errorData = await response.json();
                showMessage(errorData.message || 'Không thể xóa sản phẩm.', 'danger', false); // Hiển thị thông báo lỗi
            }
        } catch (error) {
            showMessage(error.message, 'danger', false); // Hiển thị thông báo lỗi
        }
    }
}