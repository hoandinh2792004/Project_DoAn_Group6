async function loadOrders() {
    try {
        // Gọi cả hai API
        const [orderResponse, totalResponse] = await Promise.all([
            fetch('http://localhost:5135/api/Order/GetOrderCustomers'),
            fetch('http://localhost:5135/api/Product/GetOrderTotals')
        ]);

        const orderResult = await orderResponse.json();
        const totalResult = await totalResponse.json();

        console.log('Kết quả trả về từ API GetOrderCustomers:', orderResult);
        console.log('Kết quả trả về từ API GetOrderTotals:', totalResult);

        // Lấy danh sách đơn hàng
        const orders = orderResult.$values || orderResult;

        // Lấy danh sách tổng từ $values
        const totals = totalResult.$values || [];
        const totalMap = new Map(totals.map(total => [total.orderId, total.totalSum]));

        console.log('Bản đồ TotalSum:', totalMap);

        if (orders && Array.isArray(orders)) {
            const orderTableBody = document.getElementById('orderTableBody');
            orderTableBody.innerHTML = '';

            if (orders.length === 0) {
                orderTableBody.innerHTML = '<tr><td colspan="8" class="text-center">Không có đơn hàng nào.</td></tr>';
                return;
            }

            orders.forEach(order => {
                const orderDetails = order.orderDetails?.$values || [];

                if (orderDetails.length === 0) {
                    return; // Nếu không có chi tiết đơn hàng, bỏ qua
                }

                // Tạo HTML cho các chi tiết đơn hàng
                const productNames = orderDetails.map(detail => `<div>${detail.productName}</div>`).join('');
                const quantities = orderDetails.map(detail => `<div>${detail.quantity}</div>`).join('');
                const prices = orderDetails.map(detail => `<div>${detail.price}</div>`).join('');

                // Lấy TotalSum từ Map (nếu không có, trả về giá trị mặc định là 0)
                const totalSum = totalMap.get(order.orderId) || 0;

                // Tạo dòng dữ liệu cho bảng
                const row = `
                    <tr>
                        <td>${order.orderId}</td>
                        <td>${productNames}</td>
                        <td>${quantities}</td>
                        <td>${prices}</td>
                        <td>${totalSum.toFixed(2)} đ</td>
                        <td>${order.orderDate ? new Date(order.orderDate).toLocaleDateString() : ''}</td>
                        <td>${order.status}</td>
                        <td>
                            <button class="btn btn-sm btn-warning" onclick="openEditOrderModal(${order.orderId})">Chỉnh sửa</button>
                            <button class="btn btn-sm btn-detail" onclick="openOrderDetailModal(${order.orderId})">Chi tiết</button>
                            <button class="btn btn-sm btn-danger" onclick="deleteOrder(${order.orderId})">Xóa</button>
                        </td>
                    </tr>
                `;
                orderTableBody.insertAdjacentHTML('beforeend', row);
            });
        } else {
            console.error("Dữ liệu không hợp lệ:", orderResult);
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
            $('.modal-backdrop').remove(); // Loại bỏ backdrop cũ (nếu có)
            $('body').removeClass('modal-open'); // Xóa lớp modal-open khỏi body
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

async function openOrderDetailModal(orderId) {
    try {
        console.log("Đang mở modal chi tiết đơn hàng với ID:", orderId);

        // Gửi yêu cầu tới API để lấy thông tin chi tiết đơn hàng
        const orderResponse = await fetch(`http://localhost:5135/api/Order/GetOrderCustomers/${orderId}`);
        if (!orderResponse.ok) {
            console.log(await orderResponse.text()); // In ra nội dung trả về từ API
            throw new Error(`Không thể tải thông tin đơn hàng với ID: ${orderId}`);
        }

        const order = await orderResponse.json();
        console.log("Dữ liệu trả về từ API:", order);

        // Kiểm tra dữ liệu trả về từ API
        if (!order || !order.orderDetails || !order.orderDetails.$values) {
            alert("Không có chi tiết đơn hàng để hiển thị.");
            return;
        }

        // Đọc userId từ đơn hàng
        const userId = order.userId;
        console.log("userId từ đơn hàng:", userId);

        // Gửi yêu cầu tới API để lấy thông tin khách hàng
        const customerResponse = await fetch(`http://localhost:5135/api/Customer/GetCustomers`);
        if (!customerResponse.ok) {
            throw new Error(`Không thể tải thông tin khách hàng`);
        }

        const customers = await customerResponse.json();
        console.log("Dữ liệu khách hàng:", customers);

        // Lấy mảng khách hàng từ trường $values
        const customerList = customers.$values || [];
        console.log("Danh sách khách hàng:", customerList);

        // Lấy thông tin khách hàng từ danh sách (tìm khách hàng theo userId)
        const customer = customerList.find(c => c.userId === userId);
        console.log("Khách hàng tìm thấy:", customer);

        const customerName = customer ? customer.fullName : "Không có tên khách hàng";
        const customerEmail = customer ? customer.email : "Không có email";
        const customerPhone = customer ? customer.phoneNumber : "Không có số điện thoại";

        // Chuẩn bị thông tin chi tiết đơn hàng
        const orderDetails = order.orderDetails.$values.map(detail => ({
            name: detail.productName || "Không có tên sản phẩm",
            sku: detail.sku || "N/A",
            quantity: detail.quantity || 0,
            price: detail.price || 0,
            total: detail.total || 0
        }));

        const orderData = {
            imageUrl: order.img || "https://via.placeholder.com/50",
            orderId: order.orderId || "N/A",
            customerName: customerName,
            customerEmail: customerEmail,
            customerPhone: customerPhone,
            paymentMethod: order.paymentMethod || "Không có",
            shippingAddress: order.shippingAddress || "Không có",
            total: order.totalAmount || 0,
            items: orderDetails,
            status: order.status || "Không rõ trạng thái" // Lấy trạng thái đơn hàng
        };

        console.log('Toàn bộ thông tin đơn hàng:', order); // Kiểm tra toàn bộ thông tin đơn hàng
        console.log('Lý do hủy:', order.cancelReason); // Kiểm tra lý do hủy

        // Hiển thị lý do hủy nếu trạng thái là "Đơn hàng đã bị từ chối"
        const cancelReasonDiv = document.getElementById('cancelReason');
        const cancelReasonText = document.getElementById('cancelReasonText');
        if (order.status === 'Đơn hàng đã bị từ chối') {
            cancelReasonDiv.style.display = 'block'; // Hiển thị phần lý do hủy
            if (order.cancelReason) {
                cancelReasonText.textContent = order.cancelReason; // Hiển thị lý do hủy nếu có
            } else {
                cancelReasonText.textContent = 'Không có lý do hủy'; // Hiển thị thông báo mặc định nếu không có lý do hủy
            }
        } else {
            cancelReasonDiv.style.display = 'none'; // Ẩn phần lý do hủy nếu đơn hàng không bị từ chối
        }

        // Mở modal chi tiết với dữ liệu đã chuẩn bị
        openOrderDetailModalContent(orderData);
        $('.modal-backdrop').remove(); // Loại bỏ backdrop nếu có
    } catch (error) {
        console.error("Lỗi khi tải thông tin đơn hàng:", error);
        alert("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
    }
}

// Hàm hiển thị dữ liệu trong modal (đã viết trước đó)
function openOrderDetailModalContent(order) {
    // Điền thông tin vào modal
    document.getElementById('orderId').textContent = order.orderId;
    document.getElementById('customerName').textContent = order.customerName;
    document.getElementById('customerEmail').textContent = order.customerEmail;
    document.getElementById('customerPhone').textContent = order.customerPhone;
    document.getElementById('paymentMethod').textContent = order.paymentMethod;
    document.getElementById('shippingAddress').textContent = order.shippingAddress;
    document.getElementById('orderTotal').textContent = order.total.toLocaleString() + " đ";

    // Hiển thị danh sách sản phẩm
    const orderItemsContainer = document.getElementById('orderItems');
    orderItemsContainer.innerHTML = '';
    order.items.forEach(item => {
        const row = `
            <tr>
                <td><img src="${order.imageUrl || 'https://via.placeholder.com/50'}" alt="Hình sản phẩm" width="50" /></td>
                <td>${item.name}</td>
                <td>${order.orderId}</td>
                <td>${item.quantity}</td>
                <td>${item.price.toLocaleString()} đ</td>
                <td>${item.total.toLocaleString()} đ</td>
            </tr>
        `;
        orderItemsContainer.insertAdjacentHTML('beforeend', row);
    });

    // Ẩn/hiện các nút dựa trên trạng thái đơn hàng
    const acceptButton = document.getElementById('acceptOrder');
    const rejectButton = document.getElementById('rejectOrder');

    if (order.status === "Đơn hàng đã được xác nhận và giao đi") {
        acceptButton.style.display = "none";
    } else if (order.status === "Giao hàng thành công") {
        acceptButton.style.display = "none";
        rejectButton.style.display = "none";
    } else if (order.status === "Đơn hàng đã bị từ chối") {
        acceptButton.style.display = "none";
        rejectButton.style.display = "none";
    }
    else {
        acceptButton.style.display = "inline-block";
        rejectButton.style.display = "inline-block";
    }

    // Hiển thị modal
    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
}


// Thêm sự kiện click cho nút "Chấp nhận"
document.getElementById('acceptOrder').addEventListener('click', async function () {
    try {
        const orderId = document.getElementById('orderId').textContent;

        if (!orderId) {
            alert("Không thể xác nhận đơn hàng vì thiếu Order ID.");
            return;
        }

        // Gửi yêu cầu cập nhật trạng thái đơn hàng
        const response = await fetch(`http://localhost:5135/api/Order/UpdateStatus/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: parseInt(orderId), status: 'Đơn hàng đã được xác nhận và giao đi' }),
        });

        if (!response.ok) {
            throw new Error(`Không thể cập nhật trạng thái cho đơn hàng ${orderId}`);
        }

        alert("Đơn hàng đã được xác nhận và giao đi!");

        // Cập nhật giao diện
        const statusElement = document.querySelector(`[data-order-id="${orderId}"] .order-status`);
        if (statusElement) {
            statusElement.textContent = 'Đơn hàng đã được xác nhận và giao đi';
        }

        // Ẩn nút "Chấp nhận"
        document.getElementById('acceptOrder').style.display = 'none';

        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailModal'));
        modal.hide();

        // Tải lại danh sách đơn hàng
        loadOrders();
    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        alert('Không thể xác nhận đơn hàng. Vui lòng thử lại sau.');
    }
});

// Thêm chức năng cho nút từ chối

document.getElementById('rejectOrder').addEventListener('click', async function () {
    try {
        const orderId = document.getElementById('orderId').textContent;

        // Kiểm tra nếu orderId không hợp lệ
        if (!orderId) {
            alert("Không thể từ chối đơn hàng vì thiếu Order ID.");
            return;
        }

        // Gửi yêu cầu cập nhật trạng thái đơn hàng
        const response = await fetch(`http://localhost:5135/api/Order/UpdateStatus/${orderId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderId: parseInt(orderId), status: 'Đơn hàng đã bị từ chối' }),
        });

        if (!response.ok) {
            throw new Error(`Không thể từ chối đơn hàng ${orderId}`);
        }

        alert("Đơn hàng đã bị từ chối!");

        // Cập nhật giao diện
        const statusElement = document.querySelector(`[data-order-id="${orderId}"] .order-status`);
        if (statusElement) {
            statusElement.textContent = 'Đơn hàng đã bị từ chối';
        }

        // Ẩn nút "Chấp nhận" và "Từ chối"
        document.getElementById('acceptOrder').style.display = 'none';
        document.getElementById('rejectOrder').style.display = 'none';

        // Đóng modal
        const modal = bootstrap.Modal.getInstance(document.getElementById('orderDetailModal'));
        modal.hide();

        // Tải lại danh sách đơn hàng
        loadOrders();
    } catch (error) {
        console.error('Lỗi khi từ chối đơn hàng:', error);
        alert('Không thể từ chối đơn hàng. Vui lòng thử lại sau.');
    }
});

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
document.querySelector('#editOrderModal .btn-secondary[data-dismiss="modal"]').addEventListener('click', function () {
    $('#editOrderModal').modal('hide');
});

// Load customers on page load
$(document).ready(function () {
    loadOrders();
});