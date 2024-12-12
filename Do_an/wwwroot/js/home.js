// Định nghĩa hàm toggleChat toàn cục
function toggleChat() {
    const chatContainer = document.getElementById("chatContainer");
    const isHidden = chatContainer.style.display === "none" || !chatContainer.style.display;
    chatContainer.style.display = isHidden ? "block" : "none";
}

const bannedWords = [
    // Các từ bị cấm khác
    "có", // Thêm từ "có" vào danh sách từ bị cấm
    "tôi", "tao", "mày", "chúng", "các", "anh", "em", "họ", "nó", "mình", "bạn", "chúng ta", "bạn ấy", "anh ấy", "chị ấy", "người ta", "ai", "gì", "đâu", "khi nào", "bao giờ", "sao", "cái này", "cái kia", "cái đó", "này", "kia", "đây", "ấy", "nọ",
    // Động từ (verbs)
    "muốn", "cần", "trồng", "giúp", "tìm", "làm", "ở", "là", "yêu", "ghét", "đi", "đứng", "ngủ", "học", "ăn", "uống", "đọc", "viết", "chạy", "nói", "xem", "nghe", "hiểu", "suy nghĩ", "thích", "biết", "hỏi", "trả lời", "mang", "để", "đưa", "cầm", "đặt", "sống", "chết", "cho", "nhận", "vào", "ra", "đến", "qua", "dừng", "bắt", "bỏ", "chọn", "tư vấn",
    // Danh từ (nouns)
    "nhà", "người", "đất", "nước", "trời", "mưa", "gió", "mặt trời", "trăng", "sao", "hoa", "lá", "quả", "trái", "bạn", "cha", "mẹ", "cháu", "anh", "chị", "em", "vợ", "chồng", "đồng hồ", "xe", "máy tính", "điện thoại", "sách", "vở", "bút", "trường", "lớp", "ghế", "cửa", "quần", "áo", "sản phẩm",
    // Giới từ (prepositions)
    "trong", "ngoài", "dưới", "trên", "giữa", "gần", "xa", "ở", "của", "từ", "với", "cho", "đến", "qua", "bởi", "về", "tại", "ngay", "có",
    // Liên từ (conjunctions)
    "và", "nhưng", "hoặc", "mà", "vì", "nếu", "khi", "bởi vì", "nên", "thì", "cũng", "tuy", "dù", "do", "để", "thế là", "tuy nhiên", "mặc dù",
    // Phụ từ (particles)
    "ơi", "hả", "nhỉ", "nhé", "ừ", "hử", "hả", "đấy", "vậy", "cơ", "chứ", "đâu", "rồi", "cả", "chỉ", "mới", "thôi", "nhất", "luôn", "nào", "đã", "rồi", "nữa",
    // Trợ từ (modals)
    "là", "thì", "đã", "đang", "sẽ", "vừa", "chỉ", "cả", "nhất", "chính", "này", "ấy", "nọ", "mang", "lại", "thế", "nào", "không",
    // Số từ (numerals)
    "một", "hai", "bốn", "năm", "sáu", "bảy", "tám", "chín", "mười", "mấy", "bao nhiêu", "vài", "nhiều", "ít", "tất cả", "toàn bộ",
    //từ thêm
    "giới thiệu", "1 số"
];



async function sendMessage() {
    const userMessage = document.getElementById("userMessage");
    const chatMessages = document.getElementById("chatMessages");
    const message = userMessage.value.trim();

    if (message === "") return;

    // Hiển thị tin nhắn người dùng
    const userDiv = document.createElement("div");
    userDiv.className = "message user";
    userDiv.textContent = message;
    chatMessages.appendChild(userDiv);
    userMessage.value = "";

    const botDiv = document.createElement("div");
    botDiv.className = "message bot";

    // Kiểm tra câu hỏi mặc định trước khi lọc từ cấm
    if (message.toLowerCase().includes("chào") || message.toLowerCase().includes("xin chào")) {
        setTimeout(() => {
            botDiv.textContent = "Chào bạn! Tôi là trợ lý ảo của Heart & Garden. Bạn cần giúp gì hôm nay?";
            chatMessages.appendChild(botDiv);
        }, 1500); // Delay 1.5 giây
        return; // Thoát khỏi hàm để không tiếp tục lọc từ cấm
    } else if (message.toLowerCase().includes("loại cây nào") || message.toLowerCase().includes("loại cây gì")) {
        setTimeout(() => {
            botDiv.textContent = "Chúng tôi cung cấp các loại cây trồng trong nhà và ngoài trời, cây cảnh và cây để bàn. Bạn có thể cung cấp thêm thông tin về nhu cầu của mình để tôi tư vấn chính xác hơn.";
            chatMessages.appendChild(botDiv);
        }, 1500); // Delay 1.5 giây
        return; // Thoát khỏi hàm để không tiếp tục lọc từ cấm
    } else if (message.toLowerCase().includes("tôi muốn mua sản phẩm thì làm thế nào")) {
        setTimeout(() => {
            botDiv.textContent = "Có 2 cách mua chính đó là bạn nhấp vào hình ảnh của sản phẩm tôi đã mô tả hoặc nhập tên hoặc loại cây trục tiếp vào phần tìm kiếm sản phẩm";
            chatMessages.appendChild(botDiv);
        }, 1500); // Delay 1.5 giây
        return; // Thoát khỏi hàm để không tiếp tục lọc từ cấm
    } else if (message.toLowerCase().includes("giúp") || message.toLowerCase().includes("hỗ trợ")) {
        setTimeout(() => {
            botDiv.textContent = "Tôi sẵn sàng hỗ trợ bạn! Bạn cần giúp đỡ về loại cây nào?";
            chatMessages.appendChild(botDiv);
        }, 1500); // Delay 1.5 giây
        return; // Thoát khỏi hàm để không tiếp tục lọc từ cấm
    } else if (message.toLowerCase().includes("cảm ơn")) {
        setTimeout(() => {
            botDiv.textContent = "Cảm ơn bạn đã sử dụng dịch vụ của chúng tôi. Nếu cần thêm thông tin, đừng ngần ngại liên hệ.";
            chatMessages.appendChild(botDiv);
        }, 1500); // Delay 1.5 giây
        return; // Thoát khỏi hàm để không tiếp tục lọc từ cấm

    }

    // Tiếp tục lọc từ cấm nếu câu không nằm trong danh sách câu mặc định
    let filteredMessage = message;
    console.log("Original message:", message);

    // Kiểm tra trước khi lọc từ cấm
    console.log("Before filtering:", filteredMessage);

    // Lọc các từ cấm
    bannedWords.forEach((word) => {
        const regex = new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, 'giu');
        console.log(`Regex for '${word}':`, regex);

        // Lọc từ cấm ra khỏi câu
        filteredMessage = filteredMessage.replace(regex, '').trim();
    });

    // Nếu sau khi lọc từ cấm, câu hỏi không còn từ khóa hợp lệ, không gửi yêu cầu
    if (filteredMessage === "") {
        botDiv.textContent = "Câu hỏi không hợp lệ và không thể xử lý.";
        chatMessages.appendChild(botDiv);
        return;
    }

    try {
        // Gửi yêu cầu API
        const response = await fetch(`http://localhost:5135/api/ChatBot/search?keyword=${encodeURIComponent(filteredMessage)}`);
        const responseData = await response.json();
        console.log("API Response Data:", responseData);

        if (responseData && responseData.data && responseData.data.$values && responseData.data.$values.length > 0) {
            let productResponse = `Về "${filteredMessage}", chúng tôi có thể có các sản phẩm phù hợp với nhu cầu của bạn:<br>`;
            responseData.data.$values.forEach((product) => {
                const id = product.productId;
                const name = product.name || "Không có tên";
                const category = product.categoryName || "Không rõ danh mục";
                const description = product.description || "Không có mô tả";
                const price = product.price && !isNaN(product.price) ? `${product.price.toLocaleString()} VND` : "Không rõ giá";
                const imageUrl = product.imageUrl || "/images/default.png";

                productResponse += `
                    <div class="product-item1">
                        <a href="http://localhost:5135/Home/ProductDetail?id=${id}" target="_blank">
                            <img src="${imageUrl}" alt="${name}" class="product-image">
                        </a>
                        <div class="product-details">
                            <strong>${name}</strong> <span>(${category})</span>
                            <span>${description}</span>
                            <span><strong>Giá:</strong> ${price}</span>
                        </div>
                    </div>
                `;
            });

            setTimeout(() => {
                botDiv.innerHTML = productResponse;
                chatMessages.appendChild(botDiv);
            }, 1500);
        } else {
            setTimeout(() => {
                botDiv.textContent = responseData.response || "Không có sản phẩm nào khớp với tìm kiếm.";
                chatMessages.appendChild(botDiv);
            }, 1500);
        }
    } catch (error) {
        console.error("Error:", error);
        botDiv.textContent = "Đã xảy ra lỗi khi xử lý yêu cầu. Vui lòng thử lại.";
        chatMessages.appendChild(botDiv);
    }
}

// Đặt phím Enter làm nút gửi tin nhắn
document.getElementById("userMessage").addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        event.preventDefault();
        sendMessage();
    }
});
