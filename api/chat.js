const btn = document.getElementById("chat-button");
const box = document.getElementById("ai-chat");
const input = document.getElementById("user-input");
const body = document.getElementById("chat-body");

// 聊天历史
let chatHistory = [];

// 打开 / 关闭 AI 聊天窗口
btn.onclick = function () {
    if (box.style.display === "block") {
        box.style.display = "none";
    } else {
        box.style.display = "block";
        input.focus();
    }
};


// 发送消息
async function sendMessage() {

    const text = input.value.trim();

    if (!text) return;

    // 显示用户消息
    addMessage(text, "user-message");

    // 清空输入框
    input.value = "";

    // 显示加载状态
    const loading = document.createElement("div");
    loading.className = "ai-message";
    loading.textContent = "正在思考...";
    body.appendChild(loading);

    // 自动滚到底部
    body.scrollTop = body.scrollHeight;

    try {

        // 调用 Vercel API
        const response = await fetch("/api/chat", {
            method: "POST",

            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                message: text,
                history: chatHistory
            })
        });


        const data = await response.json();


        // 删除“正在思考”
        loading.remove();


        if (!response.ok) {
            throw new Error(data.error || "AI 请求失败");
        }


        // AI 回复
        const reply = data.reply || "抱歉，我暂时没有生成回答。";

        addMessage(reply, "ai-message");


        // 保存聊天记录
        chatHistory.push({
            role: "user",
            content: text
        });

        chatHistory.push({
            role: "assistant",
            content: reply
        });


        // 限制历史消息数量
        if (chatHistory.length > 10) {
            chatHistory = chatHistory.slice(-10);
        }

    } catch (error) {

        console.error("AI Chat Error:", error);

        loading.remove();

        addMessage(
            "抱歉，AI 暂时无法连接。请稍后再试。",
            "ai-message"
        );
    }

    body.scrollTop = body.scrollHeight;
}


// 添加聊天消息
function addMessage(text, className) {

    const message = document.createElement("div");

    message.className = className;

    // 防止用户输入 HTML 造成页面注入
    message.textContent = text;

    body.appendChild(message);

    body.scrollTop = body.scrollHeight;
}


// 按 Enter 发送
input.addEventListener("keydown", function (event) {

    if (event.key === "Enter") {

        event.preventDefault();

        sendMessage();
    }

});
