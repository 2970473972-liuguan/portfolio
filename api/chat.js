export default async function handler(req, res) {

    // ================================
    // 只允许 POST
    // ================================

    if (req.method !== "POST") {

        return res.status(405).json({

            error: "Method not allowed"

        });

    }


    try {

        // ================================
        // 获取前端发送的数据
        // ================================

        const {
            message,
            history = []
        } = req.body || {};


        // 没有消息
        if (!message) {

            return res.status(400).json({

                error: "请输入消息"

            });

        }


        // ================================
        // 获取 DeepSeek API Key
        // ================================

        const apiKey =
            process.env.DEEPSEEK_API_KEY;


        // 没有配置 Key
        if (!apiKey) {

            return res.status(500).json({

                error:
                    "DEEPSEEK_API_KEY 未配置"

            });

        }


        // ================================
        // AI 系统提示词
        // ================================

        const systemPrompt = `

你是“柳贯 AI 助手”。

你现在运行在柳贯的个人作品集网站上。

你的主要任务是帮助网站访客了解柳贯本人、
他的技能、项目经历、学习能力以及求职情况。


【柳贯基本情况】

柳贯是一名应届毕业生，
目前正在寻找第一份正式工作。


【柳贯的技能】

他接触和掌握的技术包括：

- Keil uVision5
- Python
- Java
- C++
- MATLAB
- Excel
- RSoft
- 数据分析
- DevEco Studio


【项目经历】

项目一：

基于亚波长复合光栅的光学气体传感器设计。

使用 RSoft 对光栅传感器模型进行建模、
仿真，并对得到的数据进行统计和对比。


项目二：

AI 避障小车。

使用 Keil uVision5 和 FlyMcu
对小车进行烧录和控制。

实现了显示、循迹和避障。

之后进一步使用 Python 和摄像头，
让小车能够进行 AI 化的人体跟随和避障。


项目三：

个人介绍网站。

柳贯为了学习新的 AI 和编程技术，
自己制作了这个个人作品集网站。

目前网站部署在 Vercel。


【回答规则】

1. 使用中文回答。

2. 回答自然、简洁、专业。

3. 你是柳贯的 AI 助手，
   不是柳贯本人。

4. 不要编造柳贯没有提供的信息。

5. 不要虚构他的工作经历。

6. 不要虚构公司经历。

7. 不要虚构学历、奖项或者证书。

8. 如果访客询问你不知道的信息，
   请直接说网站资料中没有相关信息。

9. 如果招聘者询问柳贯，
   可以介绍他的学习能力、动手能力、
   项目实践能力和对新技术的学习能力。

10. 不要夸大柳贯的能力。

11. 如果访客询问项目，
    可以根据上面的项目资料详细解释。

12. 如果访客询问联系方式，
    可以提示访客查看网站的 CONTACT 联系区域。

`;



        // ================================
        // 构造聊天消息
        // ================================

        const messages = [

            {
                role: "system",

                content: systemPrompt

            }

        ];


        // ================================
        // 加入历史聊天记录
        // ================================

        if (Array.isArray(history)) {

            const safeHistory =
                history
                    .filter(item =>
                        item &&
                        (
                            item.role === "user" ||
                            item.role === "assistant"
                        ) &&
                        typeof item.content === "string"
                    )
                    .slice(-10);


            messages.push(
                ...safeHistory
            );

        }


        // ================================
        // 加入当前用户问题
        // ================================

        messages.push({

            role: "user",

            content: message

        });



        // ================================
        // 请求 DeepSeek
        // ================================

        const response = await fetch(

            "https://api.deepseek.com/chat/completions",

            {

                method: "POST",

                headers: {

                    "Content-Type":
                        "application/json",

                    "Authorization":
                        `Bearer ${apiKey}`

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


        // ================================
        // 获取 DeepSeek 返回结果
        // ================================

        const data =
            await response.json();


        // DeepSeek 返回错误
        if (!response.ok) {

            console.error(
                "DeepSeek API Error:",
                data
            );


            return res.status(
                response.status
            ).json({

                error:
                    data?.error?.message ||
                    "DeepSeek API 请求失败"

            });

        }


        // ================================
        // 获取 AI 回复
        // ================================

        const reply =
            data?.choices?.[0]?.message?.content;


        if (!reply) {

            return res.status(502).json({

                error:
                    "AI 没有返回有效回答"

            });

        }


        // ================================
        // 返回给前端
        // ================================

        return res.status(200).json({

            reply: reply

        });


    } catch (error) {

        // ================================
        // 服务器错误
        // ================================

        console.error(
            "Server Error:",
            error
        );


        return res.status(500).json({

            error:
                "服务器发生错误，请稍后再试"

        });

    }

}
