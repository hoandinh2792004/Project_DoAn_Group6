async function loadOrders() {
    try {
        const response = await fetch('http://localhost:5135/api/Order/GetOrderCustomers');
        const result = await response.json();

        console.log('Kết quả trả về từ API:', result); // Log kết quả trả về từ API

        // Kiểm tra nếu dữ liệu trả về có thuộc tính $values
        const orders = result.$values || result;

        console.log('Danh sách đơn hàng:', orders); // Log danh sách đơn hàng sau khi xác định đúng mảng

        if (orders && Array.isArray(orders)) {
            const orderTableBody = document.getElementById('orderTableBody');
            orderTableBody.innerHTML = '';

            if (orders.length === 0) {
                orderTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có đơn hàng nào.</td></tr>';
                return;
            }

            orders.forEach(order => {
                // Log thông tin của từng đơn hàng
                console.log('Thông tin đơn hàng:', order);

                // Lấy chi tiết đơn hàng từ orderDetails và kiểm tra nó có tồn tại không
                const orderDetails = order.orderDetails?.$values || [];

                console.log('Chi tiết đơn hàng:', orderDetails); // Log chi tiết đơn hàng

                if (orderDetails.length === 0) {
                    return; // Nếu không có chi tiết đơn hàng, bỏ qua
                }

                // Tạo HTML cho các chi tiết đơn hàng
                const productNames = orderDetails.map(detail => `<div>${detail.productName}</div>`).join('');
                const quantities = orderDetails.map(detail => `<div>${detail.quantity}</div>`).join('');
                const prices = orderDetails.map(detail => `<div>${detail.price}</div>`).join('');
                const totals = orderDetails.map(detail => `<div>${detail.total}</div>`).join('');

                // Tạo dòng dữ liệu cho bảng
                const row = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${productNames}</td>
                        <td>${quantities}</td>
                        <td>${prices}</td>
                        <td>${totals}</td>
                        <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                        <td>${order.status}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="openEditOrderModal(${order.orderId})">Chỉnh sửa</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.orderId})">Xóa</button>
                        </td>
                    </tr>
                `;
                orderTableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            console.error("Dữ liệu không hợp lệ:", result);
            document.getElementById('orderTableBody').innerHTML = '<tr><td colspan="8" class="text-center">Đã xảy ra lỗi khi tải danh sách đơn hàng.</td></tr>';
        }
    } catch (error) {
        console.error("Lỗi khi tải danh sách đơn hàng:", error);
        document.getElementById('orderTableBody').innerHTML = '<tr><td colspan="8" class="text-center">Đã xảy ra lỗi khi tải danh sách đơn hàng.</td></tr>';
    }
}



async function openEditOrderModal(orderId) {
    try {
        console.log("Open Edit Order Modal for Order ID:", orderId);

        // Gửi yêu cầu đến API để lấy thông tin chi tiết đơn hàng theo ID
        const response = await fetch(`http://localhost:5135/api/Order/GetOrderCustomers/${orderId}`);
        const order = await response.json();

        console.log("Dữ liệu trả về từ API:", order);  // In dữ liệu trả về để kiểm tra cấu trúc

        // Kiểm tra xem orderDetails có tồn tại và có dữ liệu không
        if (order && order.orderDetails && order.orderDetails.$values && order.orderDetails.$values.length > 0) {
            const orderDetail = order.orderDetails.$values[0];  // Lấy chi tiết đầu tiên trong mảng $values

            // Điền thông tin vào các trường trong modal
            document.getElementById("editOrderId").value = order.orderId;
            document.getElementById("editProductName").value = orderDetail.productName || "N/A";
            document.getElementById("editQuantity").value = orderDetail.quantity || 0;
            document.getElementById("editPrice").value = orderDetail.price || 0;
            document.getElementById("editTotal").value = orderDetail.total || 0;
            document.getElementById("editOrderDetailId").value = orderDetail.orderDetailId || 0;

            // Hiển thị modal chỉnh sửa
            $('#editOrderModal').modal('show');
        } else {
            console.error("Không có chi tiết đơn hàng cho Order ID:", orderId);
            alert("Không có chi tiết đơn hàng để chỉnh sửa.");
        }
    } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        alert("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
    }
}

async function editOrderDetail() {
    try {
        const orderId = document.getElementById("editOrderId") ? document.getElementById("editOrderId").value : null;
        const productName = document.getElementById("editProductName") ? document.getElementById("editProductName").value : "";
        const quantity = document.getElementById("editQuantity") ? parseInt(document.getElementById("editQuantity").value) : 0;
        const price = document.getElementById("editPrice") ? parseFloat(document.getElementById("editPrice").value) : 0;
        const total = price * quantity;
        const orderDetailId = document.getElementById("editOrderDetailId") ? document.getElementById("editOrderDetailId").value : 0;
        const orderDateElement = document.getElementById("editOrderDate");
        const statusElement = document.getElementById("editStatus");

        // Kiểm tra xem các phần tử có tồn tại hay không
        const orderDate = orderDateElement ? new Date(orderDateElement.value) : null;
        
        const totalAmount = price * quantity;

        // Kiểm tra dữ liệu
        if (!orderId) {
            throw new Error("Order ID is missing.");
        }

        // Tạo đối tượng gửi lên API
        const updatedOrder = {
            orderId: parseInt(orderId),
            orderDate: orderDate ? orderDate.toISOString() : null,
            status: status,
            totalAmount: totalAmount,
            orderDetails: [
                {
                    orderDetailId: parseInt(orderDetailId),
                    productName: productName,
                    quantity: quantity,
                    price: price,
                    total: total
                }
            ]
        };

        // Gửi PUT request tới API
        const response = await fetch(`http://localhost:5135/api/Order/EditOrder/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(updatedOrder),
        });

        if (!response.ok) {
            throw new Error(`Failed to update order with ID: ${orderId}`);
        }

        const result = await response.json();
        console.log("Order updated successfully:", result);

        // Hiển thị thông báo thành công
        alert("Cập nhật đơn hàng thành công!");
        $('#editOrderModal').modal('hide');  // Đóng modal sau khi cập nhật
        loadOrders();  // Tải lại danh sách đơn hàng nếu cần

    } catch (error) {
        console.error("Error updating order:", error);
        alert("Cập nhật đơn hàng thất bại. Vui lòng thử lại.");
    }
}

// Hàm để xóa đơn hàng
async function deleteOrder(orderId) {
    try {
        const response = await fetch(`http://localhost:5135/api/Order/Delete/${orderId}`, {
            method: 'DELETE'
        });

        if (response.ok) {
            alert('Đơn hàng đã được xóa thành công!');
            // Tải lại danh sách đơn hàng
            loadOrders();
        } else {
            const message = await response.text();
            alert(`Lỗi: ${message}`);
        }
    } catch (error) {
        console.error('Lỗi khi xóa đơn hàng:', error);
        alert('Đã xảy ra lỗi, vui lòng thử lại.');
    }
}


// Load customers on page load
$(document).ready(function () {
    loadOrders();
});
