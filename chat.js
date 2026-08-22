const btn = document.getElementById("chat-button");
const box = document.getElementById("ai-chat");
const input = document.getElementById("user-input");
const body = document.getElementById("chat-body");

// 聊天历史
let chatHistory = [];


// ================================
// 打开 / 关闭 AI 聊天窗口
// ================================

btn.onclick = function () {

    if (box.style.display === "block") {

        box.style.display = "none";

    } else {

        box.style.display = "block";

        input.focus();
    }
};


// ================================
// 发送消息
// ================================

async function sendMessage() {

    const text = input.value.trim();

    if (!text) {
        return;
    }


    // 显示用户消息
    addMessage(text, "user-message");


    // 清空输入框
    input.value = "";


    // 创建“正在思考”
    const loading = document.createElement("div");

    loading.className = "ai-message";

    loading.textContent = "正在思考...";

    body.appendChild(loading);


    // 滚动到底部
    body.scrollTop = body.scrollHeight;


    try {

        // =====================================
        // 调用 Vercel 后端
        // =====================================

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


        // 判断 API 是否成功
        if (!response.ok) {

            throw new Error(
                data.error || "AI 请求失败"
            );

        }


        // 获取 AI 回复
        const reply =
            data.reply ||
            "抱歉，AI 暂时没有返回内容。";


        // 显示 AI 回复
        addMessage(
            reply,
            "ai-message"
        );


        // =====================================
        // 保存聊天历史
        // =====================================

        chatHistory.push({

            role: "user",

            content: text

        });


        chatHistory.push({

            role: "assistant",

            content: reply

        });


        // 最多保留最近 10 条消息
        if (chatHistory.length > 10) {

            chatHistory =
                chatHistory.slice(-10);

        }


    } catch (error) {

        console.error(
            "AI Chat Error:",
            error
        );


        // 删除加载状态
        loading.remove();


        // 显示错误
        addMessage(
            "抱歉，AI 暂时无法连接，请稍后再试。",
            "ai-message"
        );

    }


    // 滚动到底部
    body.scrollTop =
        body.scrollHeight;
}


// ================================
// 添加聊天消息
// ================================

function addMessage(text, className) {

    const message =
        document.createElement("div");


    message.className =
        className;


    // 使用 textContent
    // 防止用户输入 HTML
    message.textContent =
        text;


    body.appendChild(message);


    // 自动滚动
    body.scrollTop =
        body.scrollHeight;
}


// ================================
// Enter 键发送
// ================================

input.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Enter") {

            event.preventDefault();

            sendMessage();

        }

    }
);
