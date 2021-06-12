const socket = io('http://localhost:8080')
const messageContainer = document.getElementById('message-container')
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById('message-input')
let currentRoom



appendMessage('You joined')
console.log("Ny bruger ", name)
socket.emit('new-user', name)


socket.on('user-connected', (name, room) => {
    appendMessage(`${name} connected`)
})

socket.on('user-disconnected', (name, room) => {
    appendMessage(`${name} disconnected`)
})

messageForm.addEventListener('submit', e => {
    e.preventDefault()
    const message = messageInput.value
    appendMessage(`you: ${message}`)
    console.log(`you: ${message}`)
    socket.emit('send-chat-message', message, currentRoom)
    messageInput.value = ''
})

function appendMessage(message)
{
    const messageElement = document.createElement('div')
    messageElement.innerText = message
    messageContainer.append(messageElement)
}


console.log("fetching rooms")
fetch('http://localhost:8080/rooms/list')
  .then(response => response.json())
  .then(data => data.map((room) => {
    let d = document.createElement('div')   
    d.innerText = room
    d.onclick = () => {
        if (currentRoom != null)
        {
            socket.emit('leave-room', currentRoom)
            socket.off('room-'+currentRoom.toLowerCase()+'-user-connected')
            socket.off('room-'+currentRoom.toLowerCase()+'-user-leave')
            socket.off('room-'+currentRoom.toLowerCase()+'-chat-message')
            currentRoom=null;
        }


        socket.emit('join-room',room)
        socket.on('room-'+room.toLowerCase()+'-user-connected', name => {
            appendMessage(`${name} connected ${room} room`)
        })
        socket.on('room-'+room.toLowerCase()+'-chat-message', data => {
            appendMessage(`${data.name}: ${data.message}`)
            console.log(`modtaget besked: ${data.message}`, )
        })
        //disconnect
        socket.on('room-'+room.toLowerCase()+'-user-leave', name => {
            appendMessage(`${name} left ${room} room`)
        })

        getUserList(room)
        currentRoom = room 
    }
    document.getElementById("rooms-listView").append(d)
    })
)


//Onclickhandler room

function getUserList(name)
{
    console.log("fetching Users")
    fetch(`http://localhost:8080/rooms/${name}/users`)
    .then(response => response.json())
    .then(data => {
          //document.getElementById("users-List").replaceChildren();
          let root = document.createElement('div') 
          data.map((o) => {
            let d = document.createElement('div')   
            d.innerText = o
            root.append(d)
            }
        )
        document.getElementById("users-List").replaceChildren(root);

      }
    )
}
  
