const express = require("express");
const app = express();

const {MongoClient} = require('mongodb');
const uri = "mongodb://127.0.0.1:27017/chatUsers";
const client = new MongoClient(uri);
let  database
let dbUsers

const bcrypt = require('bcrypt')
const saltRounds = 10

let salt
bcrypt.genSalt(saltRounds, (e,salt1) => {

    salt = salt1
    
})



const passport = require('passport');

app.use(express.json()); //to check to see if library has been set right
app.use(express.urlencoded({ extended: true}))  
//app.use(express.bodyParser())

app.use(express.static("chat"))

//const chatRouter = require("./routes/chat.js");
//app.use(chatRouter.router);

const gameRouter = require("./routes/game.js")
app.use(gameRouter.router);

const newsletterRouter = require("./routes/newsletter.js")
app.use(newsletterRouter.router);

const usersRouter = require("./routes/users.js")
app.use(usersRouter.router);





const fs = require("fs")



const navbar = fs.readFileSync(__dirname + "/navbar/nav.html", "utf-8");

const frontpage = fs.readFileSync(__dirname + "/frontpage/frontpage.html", "utf-8");
const chat = fs.readFileSync(__dirname + "/chat/chat2.html", "utf-8");
const game = fs.readFileSync(__dirname + "/frontpage/frontpage.html", "utf-8");
const newsletter = fs.readFileSync(__dirname + "/frontpage/frontpage.html", "utf-8");
const users = fs.readFileSync(__dirname + "/frontpage/frontpage.html", "utf-8");

const login = fs.readFileSync(__dirname + "/chat/login.html", "utf-8");
//const newUser = fs.readFileSync(__dirname + "/chat/newUser.html", "utf-8");

async function databaseConnect()
{
  await client.connect()
  database = client.db('chatUsers')
  dbUsers = database.collection('users');
  console.log('database connected')
}
databaseConnect()

app.get("/", (req, res) => {
    res.send(navbar + frontpage);
});

app.post('/loginPassPort',
  passport.authenticate('local', { successRedirect: '/chat',
                                   failureRedirect: '/login' }));


app.get("/chat", (req, res) => {
res.send(navbar + chat);
});


app.get("/game", (req, res) => {
    res.send(navbar + game);
});

app.get("/newsletter", (req, res) => {
    res.send(navbar + newsletter);
});

app.get("/login", (req, res) => {
    res.send(navbar + login.replace("${message}",""));
});

app.get("/newUser", (req, res) => {
    res.send(navbar + newUser)
})

app.post('/newUser', async (req, res) => 
{
    let email = req.body.email
    let username = req.body.username
    let password = req.body.password
 
    console.log("New username ", username, ' email',email,' new password', password)  
    const query = { name: req.body.username };
    const newUser = await dbUsers.findOne(query);
    console.log('new user ', newUser)

    

    if (newUser === null)
    {
        const passwordHash = await bcrypt.hash(password, salt)
        console.log('hash for ', password, " = ", passwordHash)
        const dbResult = await dbUsers.insertOne( {email: email, username: username, password: passwordHash})
        console.log("db insert ",dbResult)

        if (dbResult.insertedCount === 1)
        {
            res.send(navbar + chat.replace('${username}', req.body.username))
            return
        }
        
        
        
        if (false){
            bcrypt.hash(password, salt, (error,hash) => {
                console.log('hash for ', password, " = ", hash)
                dbUsers.insertOne( {username: username, password: hash})
            })

        }
    }
    res.send(navbar + login.replace("{message}","Det gik galt"))  
})

app.post("/login", async function(req, res) {
    console.log('LOGIN username', req.body.username, ' og password', req.body.password)


    //var password = "hundenViggo";
    
        // Query for a movie that has the title 'Back to the Future'
        const query = { name: req.body.username };
        const user = await dbUsers.findOne(query);
        if (user === null)
        {
            res.send(navbar + login.replace("${message}","Unknown user"))  
            return
        }
        console.log(user);
        console.log("user password = ", user.password);
  
  
      //if user.password 
  
      bcrypt.compare(req.body.password, user.password, (err, result) => {
          if (result) {
            console.log("It matches!")
            //console.log(querystring.stringify({username: req.body.username}))
            //res.send('/chat')//, req.body.username)//, querystring.stringify({username: req.body.username}))//, querystring.parse(username=req.body.username))//, {body: req.body.username})
            res.send(navbar + chat.replace('${username}', req.body.username))
            }
          
          else {
            console.log("Invalid password!");
            res.send(navbar + login.replace("${message}","Wrong password"))  
          }
        });
  
  
  
     // }
      // finally {
        // Ensures that the client will close when you finish/error
       // await client.close();
      //}
    //run().catch(console.dir);
})


app.get("/users", (req, res) => {
    res.send(navbar + users);
});

app.get("/rooms/list", (req, res) => {
    res.send(roomsList);
});

/*
/asus/users
*/
app.get('/rooms/:name/users', (req, res) => 
{
    
    console.log("room ",req.params.name)

    res.send(roomsArray[req.params.name.toLowerCase()].users);
});

/*
app.get('/test/:name/:prop', (req, res) => 
{
    
    console.log(roomsArray[req.params.name][req.params.prop])

    res.send(roomsArray[req.params.name][req.params.prop]);
});

*/


const PORT = process.env.PORT || 8080;

const server = app.listen(PORT, (error) => {
    if (error) {
        console.log(error);
    }
    // you are defining a variable and using it before finsishing the declaration
    console.log("Server is running", server.address().port);
});

//Socket functions

//Json Arrays containing the chatrooms and users
const usersArray = {}
let roomsList = ["Games","Food","General"];
let roomsArray = { "games"   :  {name:"Games",   users:['Louise','Per','Thor','Thea','Viggo']},
                   "food"    :  {name:"Food",    users:['Viggo', 'Mikkel']},
                   "general" :  {name:"General", users:['Nicklas', 'emilie']}
                 };


const io = require("socket.io")(server)

//General chatroom
io.on('connection', socket => 
{

    socket.on('new-user', name => 
    {
        //Give the new user connected to a chat a new name
        usersArray[socket.id] = name
        //Server sends broadcast message to everyone subscribed to the same topic,
        //with the name of the newly connected user
        socket.broadcast.emit('user-connected', name)
        //console.log('new user "',name,'"', room)  //Debug line
    })

    socket.on('join-room', room => 
    {
        //Give the new user connected to a chat a new name
        const name = usersArray[socket.id]
        console.log('User "'+name+'" joined room "'+room+'"')  //Debug line
        console.log(roomsArray['games'])
        roomsArray[room.toLowerCase()].users.push(name)
        console.log(roomsArray['games'])



        //Server sends broadcast message to everyone subscribed to the same topic,
        //with the name of the newly connected user
        socket.broadcast.emit('room-'+room.toLowerCase()+'-user-connected', name)
    })


    socket.on('send-chat-message', (message, room) => 
    {
        //'room-'+room.toLowerCase()+'-chat-message'
        //Server broadcasts message to every user subscribed, with a new message, except for the one sending that message
        console.log("Is the room undefined?", room)
        socket.broadcast.emit('room-'+room.toLowerCase()+'-chat-message', {message: message, name:usersArray[socket.id]})
        console.log('char-message "',message,'"')   //Debug line
    })

    //When a user disconnects from a chat
    socket.on('disconnect', () => {
        //Broadcast message to everyone on the topic with disconnect message
        socket.broadcast.emit('user-disconnected', usersArray[socket.id])

        console.log(roomsArray['games'])
        //User gets removed from Json 
        const name = usersArray[socket.id]
        if (name !=undefined)
        {
            for (const [room, obj] of Object.entries(roomsArray)) 
            {
                //if(obj.users[room])
                console.log("Deleting",name, "from", room)
                console.log(obj.users[0])
                console.log(obj.users.indexOf(name))

                //roomsArray[room.users].splice(0,1)
                //roomsArray[room.users].splice(0,1);
                //delete obj.name[room];
                obj.users.splice(obj.users.indexOf(name), 1)
            }
            delete usersArray[socket.id]
            console.log(roomsArray['games'])
        }
        else
        {
            console.log("disconnect unknown user")
        }
    })

    socket.on('leave-room', room => 
    {
        const name = usersArray[socket.id]
        console.log(name, 'left the room', room)
        let speRoom = roomsArray[room.toLowerCase()];
        //let speRoom = roomsArray.findIndex(room=> room.name === name)
        console.log('room',speRoom)
        console.log('value of roomsarray',roomsArray)

        let idx = speRoom.users.indexOf(name);
        console.log('user at index', idx)
        speRoom.users.splice(idx, 1)
        socket.broadcast.emit('room-'+room.toLowerCase()+'-user-leave', name)
        //console.log('char-message "',message,'"')   //Debug line
    })
});

