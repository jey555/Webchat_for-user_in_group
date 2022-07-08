var express = require('express')
var bodyparser = require('body-parser')
var app = express()
var http = require('http').Server(app)
var io = require('socket.io')(http)
var mongoose = require('mongoose')
const { sendStatus } = require('express/lib/response')
 


var dburl = 'mongodb+srv://user:user@cluster0.cfgiezc.mongodb.net/?retryWrites=true&w=majority'

var Message = mongoose.model('Message',{
    name:String,
    message:String
})

app.use(express.static(__dirname))
app.use(bodyparser.json())
app.use(bodyparser.urlencoded({extended:false}))

app.get('/messages',(req,res)=>{
    Message.find({},(err,messages)=>{
        res.send(messages)

    })
    
})
app.post('/messages',async (req,res)=>{
    try {
        var message = new Message(req.body)
        var SavedMessage = await message.save()
        console.log('saved')
        var censored =  await Message.findOne({message:'badword'})
                
      
            if(censored)
                await Message.remove({_id :censored.id})
            else
                io.emit('message',req.body) 
           
            res.sendStatus(200)
        
    } catch (error) {
        
            res.sendStatus(500)
            return console.error(err)
       } finally{
           console.log('post called')
       }
})



io.on('connection',(socket)=>{
    console.log('a user connected')
})

mongoose.connect(dburl,(err)=>{
    console.log('mongo db connection',err)
})

var server = http.listen(3000, () => {
    console.log('server is listening on port', server.address().port)
})