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

    console.log('Kiểm tra dữ liệu đơn hàng trước khi hiển thị:', orders);

    if (orders && orders.length > 0) {
        orders.forEach(order => {
            const orderItem = document.createElement('div');
            orderItem.classList.add('order-item');

            // Lấy thông tin chi tiết đơn hàng (orderDetails)
            const orderDetails = order.orderDetails && order.orderDetails.$values; // Lấy toàn bộ chi tiết đơn hàng từ $values
            if (!orderDetails || orderDetails.length === 0) {
                return; // Nếu không có chi tiết đơn hàng, bỏ qua
            }

            // Tạo HTML cho các chi tiết đơn hàng
            const productNames = orderDetails.map(detail => `<div>${detail.productName}</div>`).join('');
            const quantities = orderDetails.map(detail => `<div>${detail.quantity}</div>`).join('');
            const prices = orderDetails.map(detail => `<div>${detail.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</div>`).join('');

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
                    <button class="btn btn-primary">Đã nhận được đơn hàng</button>
                    <button class="btn btn-info" data-order-id="${order.orderId}" onclick="openOrderDetailModal(this)">Xem chi tiết</button>
                    <button class="btn btn-warning">Hủy đơn hàng</button>
                </div>
            `;

            orderListElement.appendChild(orderItem);
        });
    } else {
        orderListElement.innerHTML = '<p>Không có đơn hàng nào.</p>';
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
    const order = orders.find(order => order.orderId.toString() === orderId.toString());  // So sánh đúng kiểu dữ liệu

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
            return;
        }

        const customerName = customer.fullName || 'Không có tên';
        const customerEmail = customer.email || 'Không có email';
        const customerPhone = customer.phoneNumber || 'Không có số điện thoại';
        const paymentMethod = order.paymentMethod || 'Không có thông tin';
        const shippingAddress = order.shippingAddress || 'Không có địa chỉ';

        // Cập nhật thông tin khách hàng vào modal
        console.log('Tên khách hàng:', customerName);
        console.log('Email khách hàng:', customerEmail);
        console.log('Số điện thoại khách hàng:', customerPhone);
        console.log('Phương thức thanh toán:', paymentMethod);
        console.log('Địa chỉ giao hàng:', shippingAddress);

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

    // Mở modal
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

