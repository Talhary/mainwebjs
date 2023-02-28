const { Client, Location, List, Buttons, LocalAuth , MessageMedia } = require('whatsapp-web.js');

var QRCode = require('qrcode')
const fs= require('fs')



const midjourney = (...args) => import('midjourney-client').then(({default: fetch}) => fetch(...args));
const util = require("util");


const { Configuration, OpenAIApi } = require("openai");

const key= require('./key.json')



let senderJson = []



const express = require('express');

const http = require('https')                                                
const  Stream = require('stream').Transform                                

const app = express()
app.use('/',express.static('./public'))
app.use(express.urlencoded({ extended: false }))
// parse json
app.use(express.json())
const path = require('path')
app.get('/',(req,res)=>{
    res.sendFile(path.resolve(__dirname, './navbar-app/index.html'))
})
let state ;
const client = new Client({
    authStrategy: new LocalAuth(),
    
});
client.on('qr', (qr) => {
    console.log('runnig')
    fs.unlinkSync('./public/image.png')
   QRCode.toFile('./public/image.png' , qr, function (err, url) {console.log(err) })
   state='scan qr code'
})
app.get('/api/people', (req, res) => {
    res.status(200).json({ success: true, data: people })
})
  
app.post('/api/people', (req, res) => {
    
    const { name , api } = req.body
     if (!name) {
      return res
        .status(400)
        .json({ success: false, msg: 'please provide name value' })
    }if (!api) {
        return res
          .status(400)
          .json({ success: false, msg: 'please provide name value' })
      }
      fs.writeFileSync('./key.json', JSON.stringify({key: api, name:name}))
    res.status(201).json({ success: true, person: {name:name, api:api} })
})

client.on('authenticated', () => {
 console.log('AUTHENTICATED');
 state='Authenticated'
       
});
client.on('auth_failure', msg => {
 console.error('AUTHENTICATION FAILURE', msg);
 state='failed authenticating'

});




client.on('ready', () => {
    console.log('READY');
    state = 'Bot started'
});
app.get('/data' ,(req, res)=>{
    res.json({status: true, msg: state})
})

client.on('message', async msg => {
    if(msg.body =='hi'){
       
     }
  else if (msg.body === '!ping reply') {
        // Send a new message as a reply to the current one
        msg.reply('pong');

    } else if (msg.body.startsWith('img ')) {
        
        let body = msg.body.substr(msg.body.indexOf(" ") + 1);

let img= async ()=>{
    midjourney(body).then(async(imglink)=>{
       
        http.request(imglink[0], function(response) {                                        
            var data = new Stream();                                                    
          
            response.on('data', function(chunk) {                                       
              data.push(chunk);                                                         
            });                                                                         
          
            response.on('end', function() {                    
              const fswrite = util.promisify(fs.writeFile)
              fswrite('./files/image.png', data.read())
              .then(async()=>{
                const media =  MessageMedia.fromFilePath('./files/image.png')
               client.sendMessage(msg.from,media )
               console.log('i am runnig')
              })                           
                      
            });                                                                         
          }).end();

    })
    
    }
 img()   
        

    } else if (msg.body.startsWith('ai ')) {
        
        let body = msg.body.substr(msg.body.indexOf(" ") + 1);
        budy = body
       
        text = body
        try {
            // let pathofsound1 = path.join(__dirname, 'files',`${msg.from.split('@')[0]}.mp3` )
            if (key.key === "ISI_APIKEY_OPENAI_DISINI")
              return reply(
                "Apikey belum diisi\n\nSilahkan isi terlebih dahulu apikeynya di file key.json\n\nApikeynya bisa dibuat di website: https://beta.openai.com/account/api-keys"
              );
            if (!text)
              return reply(
                `Chat dengan AI.\n\nContoh:\n${prefix}${command} Apa itu resesi`
              );
            const configuration = new Configuration({
              apiKey: key.key,
            });
           let data;
            if(senderJson.indexOf(msg.from) == -1){
              console.log(senderJson.indexOf(msg.from))
                senderJson.push(msg.from)
                let user = null
                if(fs.existsSync(`./users/${msg.from.split('@')[0]}.json`)){
                     
                  user = fs.readFileSync(`./users/${msg.from.split('@')[0]}.json`, {encoding:'utf-8'})
                 
                  user = JSON.parse(user)
                  user.message += `Human:${text}\n`
                  
           
                }else{
                    
                    user = {id: msg.from.split('@')[0], message: `Human:${text}\n`}

                    const buttons = [
                        {buttonId: 'id1', buttonText: {displayText: '/ai Clear'}, type: 1},
                        {buttonId: 'id2', buttonText: {displayText: ''}, type: 1} ,
                        {buttonId: 'id3', buttonText: {displayText: 'Say 1000 ❤'}, type: 1}
                       
                      ]
                      
                      const buttonMessage = {
                          text: `You are talking to chatbot.\n Chatbot remember your chat history \nfor better communication,\n 1) In order to clear your previous \n history press Clear \n2) To get AI generated image \n type Img "your text and send" `,
                          footer: 'Talha riaz',
                          buttons: buttons,
                          headerType: 1
                      }
                      
                      await client.sendMessage(msg.from, buttonMessage)
                     
                }
                
                
                data = user.message
                
               user = JSON.stringify(user)
                fs.writeFile(`./users/${msg.from.split('@')[0]}.json`, user ,(err)=>{
                    if(!err){
                        console.log('done')
                    }
                })
                
                
                 
            }else {
                
                    let path = `./users/${msg.from.split('@')[0]}.json`
                   
                if(text == 'Clear'){
                    let unlinkp = util.promisify(fs.unlink)
                    unlinkp(path)
                     
                    
                     let rightArray = senderJson.slice(0, senderJson.indexOf(msg.from))
                     let leftarray = senderJson.slice(senderJson.indexOf(msg.from)+1, senderJson.length)
                     senderJson = rightArray.concat(leftarray)
                    
                      msg.reply('wait for 5 seconds')
                      
                    client.sendMessage(msg.from, 'Congratulation \n you cleared your old \n history ').then(()=>console.log('done'))
                
                
                       return;
                    
                }
                 
                   let user = JSON.parse(fs.readFileSync(path));
                   user.message +=`Human: ${text}\n.`
                   data = user.message
                    user = JSON.stringify(user)
                  fs.writeFile(`./users/${msg.from.split('@')[0]}.json`, user ,(err)=>{
                        if(!err){
                            console.log('done')
                        }
                    })
                  }

                    
  
            const openai = new OpenAIApi(configuration);
            

            const response = await openai.createCompletion({
              model: "text-davinci-003",
              prompt: data,
              temperature: 0.9,
              max_tokens: 3000,
              top_p: 1,
              frequency_penalty: 0.0,
              presence_penalty: 0.6,
            });
        
            client.sendMessage(msg.from, `Human: ${text} ${response.data.choices[0].text} `)
            // tts(` ${text} ${response.data.choices[0].text}  \n\n`, client ,pathofsound1)
            let path = `./users/${msg.from.split('@')[0]}.json`
            let user = JSON.parse(fs.readFileSync(path));
            user.message +=`\n${response.data.choices[0].text}`
                   console.log(user.message)
                    user = JSON.stringify(user)
                  fs.writeFile(`./users/${msg.from.split('@')[0]}.json`, user ,(err)=>{
                        if(!err){
                            console.log('done')
                        }
                    })
           
        
            
            
          } catch (error) {
            if (error.response) {
              console.log(error.response.status);
              console.log(error.response.data);
              console.log(`${error.response.status}\n\n${error.response.data}`);
            } else {
              console.log(error);
              
            }
            
          }
          client.once('message', async msg => {
            if(msg.body =='hi'){
               let file= new MessageMedia('image/png')
               file.fromUrl('https://tpc.googlesyndication.com/simgad/15334539621681324193')
                client.sendMessage(msg.from, file)
            }
        })
           

    } else if (msg.body.startsWith('!subject ')) {
        // Change the group subject
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newSubject = msg.body.slice(9);
            chat.setSubject(newSubject);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!echo ')) {
        // Replies with the same message
        msg.reply(msg.body.slice(6));
    } else if (msg.body.startsWith('!desc ')) {
        // Change the group description
        let chat = await msg.getChat();
        if (chat.isGroup) {
            let newDescription = msg.body.slice(6);
            chat.setDescription(newDescription);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!leave') {
        // Leave the group
        let chat = await msg.getChat();
        if (chat.isGroup) {
            chat.leave();
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body.startsWith('!join ')) {
        const inviteCode = msg.body.split(' ')[1];
        try {
            await client.acceptInvite(inviteCode);
            msg.reply('Joined the group!');
        } catch (e) {
            msg.reply('That invite code seems to be invalid.');
        }
    } else if (msg.body === '!groupinfo') {
        let chat = await msg.getChat();
        if (chat.isGroup) {
            msg.reply(`
                *Group Details*
                Name: ${chat.name}
                Description: ${chat.description}
                Created At: ${chat.createdAt.toString()}
                Created By: ${chat.owner.user}
                Participant count: ${chat.participants.length}
            `);
        } else {
            msg.reply('This command can only be used in a group!');
        }
    } else if (msg.body === '!chats') {
        const chats = await client.getChats();
        client.sendMessage(msg.from, `The bot has ${chats.length} chats open.`);
    } else if (msg.body === '!info') {
        let info = client.info;
        client.sendMessage(msg.from, `
            *Connection info*
            User name: ${info.pushname}
            My number: ${info.wid.user}
            Platform: ${info.platform}
        `);
    } else if (msg.body === '!mediainfo' && msg.hasMedia) {
        const attachmentData = await msg.downloadMedia();
        msg.reply(`
            *Media info*
            MimeType: ${attachmentData.mimetype}
            Filename: ${attachmentData.filename}
            Data (length): ${attachmentData.data.length}
        `);
    } else if (msg.body === '!quoteinfo' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();

        quotedMsg.reply(`
            ID: ${quotedMsg.id._serialized}
            Type: ${quotedMsg.type}
            Author: ${quotedMsg.author || quotedMsg.from}
            Timestamp: ${quotedMsg.timestamp}
            Has Media? ${quotedMsg.hasMedia}
        `);
    } else if (msg.body === '!resendmedia' && msg.hasQuotedMsg) {
        const quotedMsg = await msg.getQuotedMessage();
        if (quotedMsg.hasMedia) {
            const attachmentData = await quotedMsg.downloadMedia();
            client.sendMessage(msg.from, attachmentData, { caption: 'Here\'s your requested media.' });
        }
    } else if (msg.body === '!location') {
        msg.reply(new Location(37.422, -122.084, 'Googleplex\nGoogle Headquarters'));
    } else if (msg.location) {
        msg.reply(msg.location);
    } else if (msg.body.startsWith('!status ')) {
        const newStatus = msg.body.split(' ')[1];
        await client.setStatus(newStatus);
        msg.reply(`Status was updated to *${newStatus}*`);
    } else if (msg.body === '!mention') {
        const contact = await msg.getContact();
        const chat = await msg.getChat();
        chat.sendMessage(`Hi @${contact.number}!`, {
            mentions: [contact]
        });
    } else if (msg.body === '!delete') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            if (quotedMsg.fromMe) {
                quotedMsg.delete(true);
            } else {
                msg.reply('I can only delete my own messages');
            }
        }
    } else if (msg.body === '!pin') {
        const chat = await msg.getChat();
        await chat.pin();
    } else if (msg.body === '!archive') {
        const chat = await msg.getChat();
        await chat.archive();
    } else if (msg.body === '!mute') {
        const chat = await msg.getChat();
        // mute the chat for 20 seconds
        const unmuteDate = new Date();
        unmuteDate.setSeconds(unmuteDate.getSeconds() + 20);
        await chat.mute(unmuteDate);
    } else if (msg.body === '!typing') {
        const chat = await msg.getChat();
        // simulates typing in the chat
        chat.sendStateTyping();
    } else if (msg.body === '!recording') {
        const chat = await msg.getChat();
        // simulates recording audio in the chat
        chat.sendStateRecording();
    } else if (msg.body === '!clearstate') {
        const chat = await msg.getChat();
        // stops typing or recording in the chat
        chat.clearState();
    } else if (msg.body === '!jumpto') {
        if (msg.hasQuotedMsg) {
            const quotedMsg = await msg.getQuotedMessage();
            client.interface.openChatWindowAt(quotedMsg.id._serialized);
        }
    } else if (msg.body === '!buttons') {
        let button = new Buttons('Button body',[{body:'bt1'},{body:'bt2'},{body:'bt3'}],'title','footer');
        client.sendMessage(msg.from, button);
    } else if (msg.body === '!list') {
        let sections = [{title:'sectionTitle',rows:[{title:'ListItem1', description: 'desc'},{title:'ListItem2'}]}];
        let list = new List('List body','btnText',sections,'Title','footer');
        client.sendMessage(msg.from, list);
    } else if (msg.body === '!reaction') {
        msg.react('👍');
    }
});


client.initialize()
app.listen(8080 ,()=>{
    console.log('server is litening 4000')
})


