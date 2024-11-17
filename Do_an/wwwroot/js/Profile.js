document.addEventListener('DOMContentLoaded', function () {
    const token = getAuthToken();
    const userId = decodeToken(token);
    if (userId) {
        checkCustomerInfo(userId);
    } else {
        alert('Không thể lấy userId từ token.');
    }

    // Gắn sự kiện cho nút chỉnh sửa
    const editProfileButton = document.getElementById('editProfileButton');
    editProfileButton.addEventListener('click', function () {
        const editProfileModal = new bootstrap.Modal(document.getElementById('editProfileModal'));
        editProfileModal.show();
    });
});

function getAuthToken() {
    const token = document.cookie.split('; ').find(row => row.startsWith('authToken='));
    return token ? token.split('=')[1] : null;
}

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

function checkCustomerInfo(userId) {
    const token = getAuthToken();
    if (!token) {
        alert('Bạn cần đăng nhập để thực hiện thao tác này.');
        console.log('Không tìm thấy token, yêu cầu đăng nhập.');
        return;
    }

    console.log('Gửi yêu cầu kiểm tra thông tin khách hàng cho userId:', userId);
    axios.get(`http://localhost:5135/api/Profile/CheckCustomerInfo?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
        .then(response => {
            console.log('Phản hồi từ API kiểm tra thông tin khách hàng:', response.data);

            // Kiểm tra giá trị của hasCustomerInfo
            const hasCustomerInfo = response.data.hasCustomerInfo;
            console.log('hasCustomerInfo:', hasCustomerInfo);

            // Lấy các phần tử modal và nút từ DOM
            const addInfoButton = document.getElementById('addInfoButton');
            const editInfoButton = document.getElementById('editInfoButton');
            console.log('addInfoButton:', addInfoButton); // Kiểm tra nút có tồn tại không
            console.log('editInfoButton:', editInfoButton); // Kiểm tra nút có tồn tại không

            const addCustomerModalElement = document.getElementById('addCustomerModal');
            const editProfileModalElement = document.getElementById('editProfileModal');

            // Kiểm tra sự tồn tại của các phần tử modal
            if (!addCustomerModalElement || !editProfileModalElement) {
                console.error('Không tìm thấy modal.');
                return;
            }

            // Khởi tạo modal bằng bootstrap.Modal
            const addCustomerModal = new bootstrap.Modal(addCustomerModalElement);
            const editProfileModal = new bootstrap.Modal(editProfileModalElement);

            // Kiểm tra và thay đổi nút khi không có thông tin khách hàng
            if (!hasCustomerInfo) {
                console.log('Thay đổi nút: Cập nhật thông tin');
                if (addInfoButton) {
                    // Thay thế nút Thêm thông tin bằng một nút mới
                    const newButton = document.createElement('button');
                    newButton.innerText = 'Cập nhật thông tin';
                    newButton.classList.add('btn', 'btn-primary');  // Thêm các class Bootstrap nếu cần
                    newButton.id = 'addInfoButton';  // Đảm bảo ID là duy nhất để thay thế đúng
                    newButton.onclick = () => {
                        // Mở modal thêm thông tin khi nút được nhấn
                        addCustomerModal.show();
                        console.log('Nút Cập nhật thông tin được nhấn và mở modal thêm thông tin.');
                    };
                    addInfoButton.replaceWith(newButton);  // Thay thế nút cũ bằng nút mới
                    console.log('Nút đã được thay đổi.');
                } else {
                    console.error('Không tìm thấy nút "addInfoButton".');
                }
            } else {
                console.log('Thay đổi nút: Chỉnh sửa');
                if (editInfoButton) {
                    // Thay thế nút Chỉnh sửa bằng một nút mới
                    const newButton = document.createElement('button');
                    newButton.innerText = 'Chỉnh sửa';
                    newButton.classList.add('btn', 'btn-primary');  // Thêm các class Bootstrap nếu cần
                    newButton.id = 'editInfoButton';  // Đảm bảo ID là duy nhất để thay thế đúng
                    newButton.onclick = () => {
                        // Mở modal chỉnh sửa thông tin khi nút được nhấn
                        editProfileModal.show();
                        console.log('Nút Chỉnh sửa được nhấn và mở modal chỉnh sửa thông tin.');
                    };
                    editInfoButton.replaceWith(newButton);  // Thay thế nút cũ bằng nút mới
                    console.log('Nút đã được thay đổi.');
                } else {
                    console.error('Không tìm thấy nút "editInfoButton".');
                }
            }
        })
        .catch(error => {
            console.error('Lỗi kiểm tra thông tin khách hàng:', error);
        });
}



document.getElementById('addCustomerModal').addEventListener('shown.bs.modal', function () {
    // Add the form submit listener here
    document.getElementById('addCustomerForm').addEventListener('submit', function (event) {
        event.preventDefault();

        // Create FormData object from the form
        const form = document.getElementById('addCustomerForm');
        const formData = new FormData(form);

        // Log the values to console for debugging
        console.log('Full Name:', formData.get('FullName'));
        console.log('Email:', formData.get('Email'));
        console.log('Phone Number:', formData.get('PhoneNumber'));
        console.log('Address:', formData.get('Address'));

        // Check for empty fields and log missing fields
        const missingFields = [];
        formData.forEach((value, key) => {
            if (!value) {
                missingFields.push(key);
            }
        });

        if (missingFields.length > 0) {
            alert('Please fill in all fields: ' + missingFields.join(', '));
            console.log('Missing fields:', missingFields);
            return;
        }

        const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]').value;
        const token = getAuthToken();

        if (!token) {
            alert('You need to log in to perform this action.');
            console.log('Token not found when submitting form.');
            return;
        }

        // Get userId from token
        const userId = decodeToken(token);
        if (!userId) {
            alert('Unable to retrieve userId from token.');
            console.log('Cannot retrieve userId from token.');
            return;
        }

        // Add userId to form data object
        formData.append('UserId', userId);

        // Log the content of formData
        const customerData = {};
        formData.forEach((value, key) => {
            customerData[key] = value; // Convert FormData to a plain object for logging
        });
        console.log('Customer data:', customerData);

        axios.post('http://localhost:5135/api/Profile/Addcustomer', customerData, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })
            .then(response => {
                alert('Thông tin đã được cập nhật thành công!');
                location.reload();
            })
            .catch(error => {
                if (error.response) {
                    // Khi có phản hồi lỗi từ API
                    console.error('Lỗi từ API:', error.response.data);
                    alert('Lỗi từ API: ' + error.response.data.message);
                } else if (error.request) {
                    // Khi không có phản hồi từ API
                    console.error('Không có phản hồi từ API:', error.request);
                } else {
                    console.error('Lỗi khi gửi yêu cầu:', error.message);
                }
            });
    });
});



// Cập nhật thông tin
document.getElementById('saveProfileButton').addEventListener('click', function () {
    const updatedCustomer = {
        FullName: document.getElementById('FullName').value,
        Email: document.getElementById('Email').value,
        PhoneNumber: document.getElementById('PhoneNumber').value,
        Address: document.getElementById('Address').value
    };

    const csrfToken = document.querySelector('input[name="__RequestVerificationToken"]').value;
    const token = getAuthToken();

    if (!token) {
        alert('Bạn cần đăng nhập để thực hiện thao tác này.');
        return;
    }

    axios.post('http://localhost:5135/api/Profile/Updatecustomer', updatedCustomer, {
        headers: {
            'Content-Type': 'application/json',
            'RequestVerificationToken': csrfToken,
            'Authorization': `Bearer ${token}`
        }
    })
        .then(response => {
            alert('Thông tin đã được cập nhật thành công!');
            const editModal = bootstrap.Modal.getInstance(document.getElementById('editProfileModal'));
            editModal.hide();
            location.reload();
        })
        .catch(error => {
            console.error('Lỗi:', error);
            alert('Có lỗi xảy ra khi cập nhật thông tin.');
        });
});
