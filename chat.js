const btn =
document.getElementById("chat-button");


const box =
document.getElementById("ai-chat");


btn.onclick=function(){

if(box.style.display==="block")
{
box.style.display="none";
}
else
{
box.style.display="block";
}

}



async function sendMessage(){

let input=
document.getElementById("user-input");


let text=input.value;


if(!text)return;


let body=
document.getElementById("chat-body");


body.innerHTML +=
`
<div class="user-message">
${text}
</div>
`;


input.value="";


body.innerHTML +=
`
<div class="ai-message">
正在思考...
</div>
`;



}
