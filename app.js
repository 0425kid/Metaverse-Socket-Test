var app = require('express')();
var server = require('http').createServer(app);
// http server를 socket.io server로 upgrade한다
var io = require('socket.io')(server);



// localhost:3000으로 서버에 접속하면 클라이언트로 index.html을 전송한다
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

  let currentRoom = () => {
    return socket.rooms.values().next().value;
  }
  socket.leave(socket.id);
  socket.join('forum');

  socket.on('change_room', (data) => {
    socket.leave(currentRoom());
    socket.join(data.room);
    console.log(data.username, '의 방 접속 정보 :', socket.rooms);
    io.to(data.room).emit('new_user', data.username);
  })

  socket.on('chatting_update', (data) => {
    //console.log('chatting_update를 실시하겠습니다', data);
    io.to(currentRoom()).emit('client_chatting_update', data);
  })

  socket.on('get_room_clients', () => {
    const clients = io.sockets.adapter.rooms.get(currentRoom());
    if(clients){
      const socketIds = Array.from(clients.keys());
      console.log('Sockets in room:', socketIds);
    }
  })
})

server.listen(3001, function() {
  console.log('Socket IO server listening on port 3001');
});