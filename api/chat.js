export default async function handler(req, res) {
    // 只允许 POST 请求
    if (req.method !== "POST") {
        return res.status(405).json({
            error: "只允许 POST 请求"
        });
    }

    try {
        // 获取前端发送的数据
        const { message, history = [] } = req.body || {};

        if (!message || typeof message !== "string") {
            return res.status(400).json({
                error: "请输入有效的问题"
            });
        }

        // 从 Vercel 环境变量读取 API Key
        const apiKey = process.env.DEEPSEEK_API_KEY;

        if (!apiKey) {
            return res.status(500).json({
                error: "服务器没有配置 DEEPSEEK_API_KEY"
            });
        }

        // 柳贯 AI 助手的角色设定
        const systemPrompt = `
你是“柳贯 AI 助手”，运行在柳贯的个人作品集网站上。

你的任务是帮助网站访客了解柳贯的个人情况、技能、项目和求职方向。

【个人信息】
柳贯是一名应届毕业生，目前正在寻找第一份正式工作。

【技能】
- Keil uVision5
- Python
- Java
- C++
- MATLAB
- Excel
- RSoft
- 数据分析
- DevEco Studio

【项目】
1. 基于亚波长复合光栅的光学气体传感器设计
使用 RSoft 对光栅传感器进行建模、仿真，并进行数据统计和对比。

2. AI 避障小车
使用 Keil uVision5 和 FlyMcu 进行烧录和控制，实现显示、循迹和避障。
进一步使用 Python 和摄像头，实现人体跟随和 AI 避障。

3. 个人介绍网站
柳贯自己制作了这个个人作品集网站，并部署到了 Vercel。

【回答要求】
- 默认使用中文。
- 回答自然、简洁、专业。
- 不要编造柳贯没有提供的信息。
- 不要虚构工作经历、公司、学历、奖项或证书。
- 不知道的信息直接说明网站资料中没有相关信息。
- 招聘相关问题可以重点介绍他的项目实践、动手能力和学习能力。
- 不要夸大他的能力。
`;

        // 创建消息数组
        const messages = [
            {
                role: "system",
                content: systemPrompt
            }
        ];

        // 加入历史聊天记录
        if (Array.isArray(history)) {
            const safeHistory = history
                .filter(item =>
                    item &&
                    (item.role === "user" || item.role === "assistant") &&
                    typeof item.content === "string"
                )
                .slice(-10);

            messages.push(...safeHistory);
        }

        // 当前问题
        messages.push({
            role: "user",
            content: message
        });

        // 请求 DeepSeek API
        const deepseekResponse = await fetch(
            "https://api.deepseek.com/chat/completions",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${apiKey}`
                },

                body: JSON.stringify({
                    model: "deepseek-chat",
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 1000,
                    stream: false
                })
            }
        );

        // 获取 DeepSeek 返回数据
        const data = await deepseekResponse.json();

        // DeepSeek 请求失败
        if (!deepseekResponse.ok) {
            console.error("DeepSeek API Error:", data);

            return res.status(deepseekResponse.status).json({
                error:
                    data?.error?.message ||
                    "DeepSeek API 请求失败"
            });
        }

        // 获取 AI 回复
        const reply =
            data?.choices?.[0]?.message?.content;

        if (!reply) {
            return res.status(502).json({
                error: "DeepSeek 没有返回有效内容"
            });
        }

        // 返回给前端 chat.js
        return res.status(200).json({
            reply: reply
        });

    } catch (error) {

        console.error("API Error:", error);

        return res.status(500).json({
            error: "服务器内部错误，请稍后再试"
        });
    }
}
