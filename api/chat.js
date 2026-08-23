export default async function handler(req, res) {
  console.log("API 请求方法:", req.method);

  if (req.method !== "POST") {
    return res.status(405).json({
      error: "只允许 POST 请求"
    });
  }

  try {
    const { message } = req.body || {};

    if (!message) {
      return res.status(400).json({
        error: "没有收到消息"
      });
    }

    const response = await fetch(
      "https://api.deepseek.com/chat/completions",
      {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.DEEPSEEK_API_KEY}`
        },

        body: JSON.stringify({
          model: "deepseek-chat",

          messages: [
            {
              role: "system",
              content: "你是柳贯个人网站的 AI 助手，请使用中文友好回答问题。"
            },
            {
              role: "user",
              content: message
            }
          ]
        })
      }
    );

    const data = await response.json();

    console.log("DeepSeek 返回:", JSON.stringify(data));

    if (!response.ok) {
      return res.status(response.status).json({
        error: "DeepSeek API 请求失败",
        details: data
      });
    }

    return res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "AI 没有返回内容"
    });

  } catch (error) {
    console.error("服务器错误:", error);

    return res.status(500).json({
      error: error.message
    });
  }
}
