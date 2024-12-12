// Phương thức lấy token từ cookie
function getAuthToken() {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    return token ? token.split('=')[1] : null;
}

// Phương thức giải mã token và lấy userId
function decodeToken(token) {
    try {
        console.log('Bắt đầu giải mã token:', token);
        const payload = JSON.parse(atob(token.split('.')[1])); // Giải mã payload từ token JWT
        const userId = payload["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/userid"]; // Lấy userId từ payload
        console.log('UserId đã lấy từ token:', userId);
        return userId;
    } catch (error) {
        console.error('Lỗi giải mã token:', error);
        return null;
    }
}

// Hàm lấy đơn hàng từ server
let orders = [];  // Biến toàn cục để lưu danh sách đơn hàng

// Hàm lấy đơn hàng từ server
async function getOrdersByUserId(userId) {
    try {
        console.log(`Gửi yêu cầu lấy đơn hàng cho userId: ${userId}`);

        const response = await fetch(`http://localhost:5135/api/order/GetOrdersByUserId?userId=${userId}`);

        if (response.ok) {
            const data = await response.json();
            console.log('Dữ liệu đơn hàng nhận được:', data);

            // Kiểm tra và lấy giá trị từ $values
            orders = data.$values || [];  // Gán giá trị cho biến orders toàn cục
            console.log('Danh sách đơn hàng sau khi lấy từ $values:', orders);

            displayOrders(orders);  // Hiển thị đơn hàng sau khi nhận được từ API
        } else {
            console.error('Lỗi khi lấy đơn hàng:', response.statusText);
        }
    } catch (error) {
        console.error('Lỗi khi gọi API:', error);
    }
}

function displayOrders(orders) {
    console.log('Dữ liệu đơn hàng:', orders); // Kiểm tra dữ liệu orders

    const orderListElement = document.getElementById('order-list');

    if (!orderListElement) {
        console.error('Không tìm thấy phần tử với id="order-list"');
        return;
    }

    orderListElement.innerHTML = ''; // Xóa danh sách cũ

    if (orders && orders.length > 0) {
        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');

            const orderDetails = order.orderDetails && order.orderDetails.$values;
            if (!orderDetails || orderDetails.length === 0) {
                return; // Nếu không có chi tiết đơn hàng, bỏ qua
            }

            const productNames = orderDetails.map(detail => `<div>${detail.productName}</div>`).join('');
            const quantities = orderDetails.map(detail => `<div>${detail.quantity}</div>`).join('');
            const prices = orderDetails.map(detail => `<div>${detail.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>`).join('');


            // Map trạng thái từ API về trạng thái chuẩn
            const statusMapping = {
                "Chờ xác nhận": "Đang chờ xử lý",
                "Đơn hàng đã được xác nhận và giao đi": "Đã xác nhận và giao đi",
                "Giao hàng thành công": "Đã hoàn thành",
                "Đơn hàng đã bị từ chối": "Đã bị từ chối"
            };

            const mappedStatus = statusMapping[order.status] || order.status;

            orderItem.innerHTML = `
                <div class="order-img">
                    <img src="${order.img || 'default-image.png'}" alt="Sản phẩm" />
                </div>
                <div class="order-info">
                    <h5 class="product-name">${productNames || 'Sản phẩm không xác định'}</h5>
                    <p class="product-quantity">x${quantities || 0}</p>
                </div>
                <div class="order-price">
                    <p class="product-price">${prices || 'Không có giá'}</p>
                    <p class="total-price">${order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                </div>
                <div class="order-actions">
                 ${mappedStatus === 'Đã bị từ chối' ? '<p class="text-danger">Đơn hàng đã bị hủy</p>' : ''}
                ${mappedStatus === 'Đã hoàn thành' ? '<p class="text-custom-success">Đơn hàng đã được giao</p>' : ''}
                    <button 
                        class="btn btn-primary btn-received-order ${mappedStatus !== "Đã xác nhận và giao đi" ? 'disabled' : ''}" 
                        data-order-id="${order.orderId}" 
                        onclick="updateOrderStatus(this, 'Giao hàng thành công')" 
                        style="${mappedStatus !== 'Đã xác nhận và giao đi' ? 'background-color: #6c757d; cursor: not-allowed;' : ''}">
                        Đã nhận được đơn hàng
                    </button>
                    <button class="btn btn-info" data-order-id="${order.orderId}" onclick="openOrderDetailModal(this)">Xem chi tiết</button>
                    <button class="btn btn-warning" onclick="showCancelOrderModal(${order.orderId})">Hủy đơn hàng</button>
                </div>
            `;

            // Ẩn nút "Đã nhận được đơn hàng" nếu trạng thái là "Giao hàng thành công"
            if (mappedStatus === "Đã hoàn thành") {
                const receivedButton = orderItem.querySelector('.btn-received-order');
                const cancelButton = orderItem.querySelector('.btn-warning');
                if (receivedButton) {
                    receivedButton.style.display = 'none';  // Ẩn nút nếu trạng thái đã hoàn thành
                }
                if (cancelButton) {
                    cancelButton.style.display = 'none';  // Ẩn nút "Hủy đơn hàng"
                }
            }

            // Ẩn nút "Đã nhận được đơn hàng" nếu trạng thái là "Đơn hàng đã bị từ chối"
            if (mappedStatus === "Đã bị từ chối") {
                const receivedButton = orderItem.querySelector('.btn-received-order');
                const cancelButton = orderItem.querySelector('.btn-warning');
                if (receivedButton) {
                    receivedButton.style.display = 'none';  // Ẩn nút nếu trạng thái đơn hàng đã bị từ chối
                }
                if (cancelButton) {
                    cancelButton.style.display = 'none';  // Ẩn nút "Hủy đơn hàng"
                }
            }

            orderListElement.appendChild(orderItem);
        });
    } else {
        orderListElement.innerHTML = '<p>Không có đơn hàng nào.</p>';
    }
}


// Hiển thị modal để hỏi lý do hủy đơn hàng
function showCancelOrderModal(orderId) {
    // Mở modal
    const cancelOrderModal = new bootstrap.Modal(document.getElementById('cancelOrderModal'));
    cancelOrderModal.show();

    // Lưu id đơn hàng để xử lý sau khi người dùng nhập lý do
    window.currentOrderId = orderId;
}

// Hàm xử lý khi người dùng gửi lý do hủy đơn hàng
async function submitCancelOrder() {
    const cancelReason = document.getElementById('cancelReason').value.trim();

    if (cancelReason === '') {
        alert("Vui lòng nhập lý do hủy đơn hàng!");
        return;
    }

    // Cập nhật trạng thái đơn hàng thành "Đơn hàng đã bị từ chối"
    const orderId = window.currentOrderId;
    console.log(`Đơn hàng ID: ${orderId} bị hủy với lý do: ${cancelReason}`);

    // Gửi yêu cầu PUT tới API để cập nhật trạng thái đơn hàng và lý do hủy
    try {
        const response = await fetch(`http://localhost:5135/api/Order/UpdateStatus/${orderId}`, {
            method: 'PUT',  // Thay đổi từ POST thành PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                status: 'Đơn hàng đã bị từ chối',
                cancelReason: cancelReason  // Gửi lý do hủy lên API
            })
        });

        if (!response.ok) {
            throw new Error('Cập nhật trạng thái thất bại.');
        }

        console.log(`Đã cập nhật trạng thái đơn hàng ID ${orderId} thành "Đơn hàng đã bị từ chối" với lý do: ${cancelReason}.`);

        // Cập nhật giao diện
        const orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(item => {
            const orderIdElement = item.querySelector('[data-order-id]');
            if (orderIdElement && orderIdElement.dataset.orderId == orderId) {
                const receivedButton = item.querySelector('.btn-received-order');
                const cancelButton = item.querySelector('.btn-warning');
                const statusText = item.querySelector('.order-status');

                if (receivedButton) receivedButton.style.display = 'none';  // Ẩn nút "Đã nhận được đơn hàng"
                if (cancelButton) cancelButton.style.display = 'none';      // Ẩn nút "Hủy đơn hàng"
                if (statusText) statusText.innerHTML = '<p class="text-danger">Đơn hàng đã bị hủy</p>';  // Hiển thị trạng thái "Đơn hàng đã bị hủy"
            }
        });

        // Đóng modal sau khi xử lý xong
        const cancelOrderModal = bootstrap.Modal.getInstance(document.getElementById('cancelOrderModal'));
        cancelOrderModal.hide();

        // Làm mới lại danh sách đơn hàng
        getOrdersByUserId(userId);  // Gọi lại hàm lấy danh sách đơn hàng với userId hiện tại

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    }
}


// Hàm cập nhật trạng thái đơn hàng
async function updateOrderStatus(buttonElement, newStatus) {
    const orderId = buttonElement.getAttribute('data-order-id');
    console.log(`Cập nhật trạng thái đơn hàng ID: ${orderId} thành "${newStatus}"`);

    try {
        // Gửi yêu cầu PUT tới API để cập nhật trạng thái đơn hàng
        const response = await fetch(`http://localhost:5135/api/Order/UpdateStatus/${orderId}`, {
            method: 'PUT',  // Thay đổi từ POST thành PUT
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: newStatus })
        });

        if (!response.ok) {
            throw new Error('Cập nhật trạng thái thất bại.');
        }

        console.log(`Đã cập nhật trạng thái đơn hàng ID ${orderId} thành "${newStatus}".`);

        // Lấy lại danh sách đơn hàng sau khi cập nhật thành công
        alert(`Đơn hàng ID ${orderId} đã được cập nhật trạng thái thành "${newStatus}".`);

        // Làm mới lại danh sách đơn hàng
        getOrdersByUserId(userId);  // Gọi lại hàm lấy danh sách đơn hàng với userId hiện tại

        buttonElement.style.display = 'none'; 

        // Tự động làm mới trang web
        location.reload();  // Tải lại trang để cập nhật danh sách đơn hàng

    } catch (error) {
        console.error('Lỗi khi cập nhật trạng thái đơn hàng:', error);
        alert('Không thể cập nhật trạng thái đơn hàng. Vui lòng thử lại sau.');
    }
}

async function openOrderDetailModal(buttonElement) {
    const orderId = buttonElement.getAttribute('data-order-id');
    console.log('Đang mở chi tiết đơn hàng với orderId:', orderId);

    // Kiểm tra xem `orders` đã có giá trị chưa
    if (orders.length === 0) {
        console.error('Không có đơn hàng nào để hiển thị.');
        return;
    }

    // Tìm đơn hàng với orderId trong danh sách orders
    const order = orders.find(order => order.orderId.toString() === orderId.toString()); // So sánh đúng kiểu dữ liệu

    if (!order) {
        console.error('Không tìm thấy đơn hàng với orderId:', orderId);
        return;
    }

    console.log('Thông tin đơn hàng:', order);

    // Đọc userId từ đơn hàng
    const userId = order.userId;
    console.log('userId từ đơn hàng:', userId);

    try {
        // Gửi yêu cầu tới API để lấy thông tin khách hàng
        const customerResponse = await fetch(`http://localhost:5135/api/Customer/GetCustomers`);
        if (!customerResponse.ok) {
            throw new Error(`Không thể tải thông tin khách hàng`);
        }

        const customers = await customerResponse.json();
        console.log("Dữ liệu khách hàng:", customers);

        // Tìm thông tin khách hàng theo userId
        const customer = customers.$values.find(c => c.userId === userId);
        if (!customer) {
            console.error('Không tìm thấy thông tin khách hàng');
            alert('Vui lòng cập nhật thông tin cá nhân trước khi tiếp tục.');
            return;
        }

        const customerName = customer.fullName || 'Không có tên';
        const customerEmail = customer.email || 'Không có email';
        const customerPhone = customer.phoneNumber || 'Không có số điện thoại';
        const paymentMethod = order.paymentMethod || 'Không có thông tin';
        const shippingAddress = order.shippingAddress || 'Không có địa chỉ';

        // Cập nhật thông tin khách hàng vào modal
        document.getElementById('customerName').textContent = customerName;
        document.getElementById('customerEmail').textContent = customerEmail;
        document.getElementById('customerPhone').textContent = customerPhone;
        document.getElementById('paymentMethod').textContent = paymentMethod;
        document.getElementById('shippingAddress').textContent = shippingAddress;

    } catch (error) {
        console.error("Lỗi khi lấy thông tin khách hàng:", error);
        alert("Không thể tải thông tin khách hàng. Vui lòng thử lại sau.");
    }

    // Hiển thị danh sách sản phẩm
    const orderItemsElement = document.getElementById('orderItems');
    orderItemsElement.innerHTML = ''; // Xóa danh sách cũ

    order.orderDetails.$values.forEach(detail => {
        const row = `
            <tr>
                <td><img src="${order.img || 'default-image.png'}" alt="Hình sản phẩm" width="50" /></td>
                <td>${detail.productName}</td>
                <td>${order.orderId || 'Không có mã sản phẩm'}</td>
                <td>${detail.quantity}</td>
                <td>${detail.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                <td>${(detail.quantity * detail.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
            </tr>
        `;
        orderItemsElement.insertAdjacentHTML('beforeend', row);
    });

    // Hiển thị tổng tiền
    document.getElementById('orderTotal').textContent = order.totalAmount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' });

    // Map giá trị trạng thái từ API về trạng thái chuẩn
    const statusMapping = {
        "Chờ xác nhận": "Đang chờ xử lý",
        "Đơn hàng đã được xác nhận và giao đi": "Đã xác nhận và giao đi",
        "Giao hàng thành công": "Đã hoàn thành",
        "Đơn hàng đã bị từ chối": "Đã bị hủy"
    };

    // Nếu trạng thái không khớp, chuyển đổi bằng bản đồ
    const mappedStatus = statusMapping[order.status] || order.status;
    console.log('Trạng thái sau khi map:', mappedStatus);

    const statuses = [
        { id: 1, text: "Đang chờ xử lý" },
        { id: 2, text: "Đã xác nhận và giao đi" },
        { id: 3, text: "Đã hoàn thành" },
        { id: 4, text: "Đã bị hủy" },
    ];

    const currentStatusIndex = statuses.findIndex((status) => status.text === mappedStatus);
    console.log('Chỉ số trạng thái hiện tại:', currentStatusIndex);

    if (currentStatusIndex === -1) {
        console.error('Không tìm thấy trạng thái khớp với dữ liệu đơn hàng.');
    }

    const statusContainer = document.getElementById("orderStatusSteps");
    if (!statusContainer) {
        console.error('Không tìm thấy phần tử #orderStatusSteps trong HTML.');
        return;
    }

    statusContainer.innerHTML = "";
    statuses.forEach((status, index) => {
        console.log(`Đang xử lý trạng thái: ${status.text} (index: ${index})`);

        const step = document.createElement("div");
        step.classList.add("status-step");

        const badgeClass = index <= currentStatusIndex ? "bg-primary" : "bg-secondary";

        step.innerHTML = `
            <span class="badge ${badgeClass}">${index + 1}</span>
            <p>${status.text}</p>
        `;
        statusContainer.appendChild(step);
    });

    console.log('Hoàn tất hiển thị trạng thái đơn hàng.');

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

    const modal = new bootstrap.Modal(document.getElementById('orderDetailModal'));
    modal.show();
}



// Lấy token và giải mã userId
const token = getAuthToken();
const userId = decodeToken(token);

// Đảm bảo rằng mã JavaScript chỉ chạy sau khi DOM đã được tải xong
document.addEventListener('DOMContentLoaded', () => {
    if (userId) {
        console.log('Bắt đầu gọi API với userId:', userId);
        getOrdersByUserId(userId);
    } else {
        console.error('Không thể lấy userId từ token.');
    }
});


