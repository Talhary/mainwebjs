const fs = require('fs')
const util = require('util')
const gtts = require('better-node-gtts').default;
let unlink = util.promisify(fs.unlinkSync)
module.exports = tts=  async(text,client,pathofsound)=>{



    let filepath =pathofsound;
    try{
          
    gtts.save(filepath, text).then(async (response)=>{
        
        
           client.sendMessage(
                m.sender, 
                { audio: { url:pathofsound}, mimetype: 'audio/mp4' } ,
                { url: pathofsound } // can send mp3, mp4, & ogg
             
            ).then((res)=>{
                unlink(pathofsound).then((res)=>console.log('done sending audio'))
            })
   
        
           
    }).catch((err)=>console.log(err))
    
    
    
    } 
    catch(err){
    console.log(err);
    }
     
   
   
   }