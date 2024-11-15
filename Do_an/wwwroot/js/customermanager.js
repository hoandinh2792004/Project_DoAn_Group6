// Load customers from the server and populate the table
async function loadCustomers() {
    try {
        const response = await fetch('http://localhost:5135/api/Customer/GetCustomers');
        const result = await response.json();

        // Kiểm tra dữ liệu trả về có hợp lệ và có thuộc tính $values
        if (result && Array.isArray(result.$values)) {
            const customers = result.$values; // Lấy mảng người dùng từ $values

            const customerTableBody = document.getElementById('customerTableBody');
            customerTableBody.innerHTML = ''; // Xóa nội dung cũ

            // Kiểm tra nếu có người dùng
            if (customers.length === 0) {
                customerTableBody.innerHTML = '<tr><td colspan="7" class="text-center">Không có người dùng nào.</td></tr>';
                return;
            }

            customers.forEach(customer => {
                // Xây dựng một dòng trong bảng hiển thị thông tin người dùng
                const row = `
                    <tr>
                        <td>${customer.userId}</td>
                        <td>${customer.fullName}</td>
                        <td>${customer.email}</td>
                        <td>${customer.phoneNumber || ''}
                        <td>${customer.address || ''}
                        <td>${customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : ''}</td>
                        <td>
                            <button class="btn btn-sm btn-primary" onclick="openEditCustomerModal(${customer.userId})">Chỉnh sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteCustomer(${customer.userId})">Xóa</button>
                        </td>
                    </tr>
                `;
                customerTableBody.insertAdjacentHTML('beforeend', row); // Thêm dòng mới vào bảng
            });
        } else {
            console.error("Dữ liệu không hợp lệ:", result);
            document.getElementById('customerTableBody').innerHTML = '<tr><td colspan="7" class="text-center">Đã xảy ra lỗi khi tải danh sách người dùng.</td></tr>';
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách người dùng:", error);
        document.getElementById('customerTableBody').innerHTML = '<tr><td colspan="7" class="text-center">Đã xảy ra lỗi khi tải danh sách người dùng.</td></tr>';
    }
}



// Mở modal và tải thông tin người dùng theo ID
// Hàm để tải thông tin người dùng khi mở modal chỉnh sửa
function openEditCustomerModal(id) {
    $.ajax({
        url: `http://localhost:5135/api/Customer/GetCustomer/${id}`, // API lấy thông tin người dùng
        method: 'GET',
        success: function (customer) {
            // Điền thông tin người dùng vào các trường trong modal
            $("#editCustomerId").val(customer.userId);
            $("#editFullName").val(customer.fullName);
            $("#editEmail").val(customer.email);
            $("#editPhoneNumber").val(customer.phoneNumber);
            $("#editAddress").val(customer.address);

            // Mở modal chỉnh sửa
            $("#editCustomerModal").modal("show");
        },
        error: function () {
            alert("Lỗi khi tải thông tin người dùng.");
        }
    });
}


// Chỉnh sửa thông tin người dùng
function editCustomer() {
    // Lấy dữ liệu từ các trường trong modal chỉnh sửa
    const id = $("#editCustomerId").val();
    const fullName = $("#editFullName").val();
    const email = $("#editEmail").val();
    const phoneNumber = $("#editPhoneNumber").val();
    const address = $("#editAddress").val();

    // Kiểm tra tính hợp lệ của dữ liệu (có thể thêm các kiểm tra khác)
    if (!fullName || !email || !phoneNumber || !address) {
        alert("Vui lòng điền đầy đủ thông tin.");
        return;
    }

    // Tạo đối tượng DTO chứa dữ liệu chỉnh sửa
    const updateCustomerDto = {
        fullName: fullName,
        email: email,
        phoneNumber: phoneNumber,
        address: address
    };

    // Gửi yêu cầu PUT để chỉnh sửa thông tin người dùng
    $.ajax({
        url: `http://localhost:5135/api/Customer/EditCustomer/${id}`, // API chỉnh sửa người dùng
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(updateCustomerDto),
        success: function () {
            alert("Thông tin người dùng đã được cập nhật!");
            loadCustomers(); // Tải lại danh sách người dùng
            $("#editCustomerModal").modal("hide"); // Đóng modal sau khi chỉnh sửa thành công
        },
        error: function () {
            alert("Lỗi khi chỉnh sửa thông tin người dùng.");
        }
    });
}


// Delete a customer by ID
function deleteCustomer(id) {
    if (confirm("Bạn có chắc muốn xóa người dùng này?")) {
        $.ajax({
            url: `http://localhost:5135/api/Customer/Delete/${id}`, // Endpoint để xóa khách hàng
            method: 'DELETE', // Thay đổi thành 'DELETE' thay vì 'POST'
            success: function () {
                alert("Người dùng đã được xóa!");
                loadCustomers(); // Tải lại danh sách khách hàng để cập nhật bảng
            },
            error: function () {
                alert("Lỗi khi xóa người dùng.");
            }
        });
    }
}



// Load customers on page load
$(document).ready(function () {
    loadCustomers();
});
