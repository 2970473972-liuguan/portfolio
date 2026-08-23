const btn = document.getElementById("chat-button");
const box = document.getElementById("ai-chat");
const input = document.getElementById("user-input");
const body = document.getElementById("chat-body");


// 聊天记录
let chatHistory = [];



// 打开关闭窗口

btn.onclick = function(){

    if(box.style.display === "block"){

        box.style.display="none";

    }else{

        box.style.display="block";

        input.focus();

    }

};




// 发送消息

async function sendMessage(){


    const text=input.value.trim();


    if(!text)return;



    addMessage(
        text,
        "user-message"
    );



    input.value="";



    const loading=document.createElement("div");

    loading.className="ai-message";

    loading.textContent="正在思考...";

    body.appendChild(loading);



    try{


        const response=await fetch(
            "/api/chat",
            {

            method:"POST",

            headers:{
                "Content-Type":"application/json"
            },


            body:JSON.stringify({

                message:text,

                history:chatHistory

            })

        });



        const data=await response.json();



        loading.remove();



        if(!response.ok){

            throw new Error(
                data.error || "请求失败"
            );

        }



        const reply=data.reply;



        addMessage(
            reply,
            "ai-message"
        );



        chatHistory.push({

            role:"user",

            content:text

        });



        chatHistory.push({

            role:"assistant",

            content:reply

        });



    }catch(error){


        console.error(error);


        loading.remove();


        addMessage(

            "⚠️ AI连接失败："+error.message,

            "ai-message"

        );

    }


}




// 添加消息

function addMessage(text,className){


    const div=document.createElement("div");


    div.className=className;


    div.textContent=text;


    body.appendChild(div);


    body.scrollTop=body.scrollHeight;


}





// 回车发送

input.addEventListener(
"keydown",
function(event){


    if(event.key==="Enter"){

        event.preventDefault();

        sendMessage();

    }


});
