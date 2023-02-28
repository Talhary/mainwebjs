let id2= document.getElementById('id2');
let id1= document.querySelector('.id1')
setInterval(()=>{
    fetch('/data')   
  .then(response => response.json())
  .then(data => {
   if(data.status){document.getElementById('state').textContent = data.msg
   if(data.msg == 'Bot started'){
    document.getElementById('img').style.display='none'
    id1.style.display='none'
    id2.style.display='none'
    id3.style.display='flex'
   }
   
 
  }})
  
   document.getElementById('img').src = './image.png'
   
},1000)
document.getElementById('btn2').addEventListener('click',()=>{
  document.getElementById('img').src = './image.png'
})
document.getElementById('input-values-buttons').addEventListener('click',()=>{
  let api = document.getElementById('input-api').value
  let name = document.getElementById('input-owner').value
  let data= {api: api, name: name}
  fetch("/api/people", {
  method: "POST",
  body: JSON.stringify(data),
  headers: {
    "Content-Type": "application/json"
  }
})
.then((response) => response.json())
.then((data) =>
{
  if(data.success)
  document.getElementById('stateOfsending').innerText = 'Successfully sended'
  id2.style.display='flex'
  id1.style.display='none'

});
})

    