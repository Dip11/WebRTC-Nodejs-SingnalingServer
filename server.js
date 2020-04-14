var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

app.get('/', function (req, res) {
   res.send('<h1>Hello, Singaling Server</h1>');
});

var users = []
io.on('connection', function (socket) {
   // console.log('Connected To Socket');
   socket.emit("connection_open", "Connected To the Singnaling Server...")
   socket.on('login', function (data) {
      var data;
      try {
         console.log('user logged in: ' + data.name);
         //if anyone is logged in with this username then refuse 
         if (users.find(x => x.name == data.name) || typeof users.find(x => x.name == data.name) !== 'undefined') {
            var loginResult = {
               type: "login",
               success: false
            }
            socket.emit('login_result', loginResult);
         } else {
            //save user connection on the server
            var user = {}
            user.id = data.id;
            user.name = data.name;
            user.socketId = socket.id
            users.push(user);
            var loginResult = {
               type: "login",
               success: true,
               user: data.name
            }
            socket.emit('login_result', loginResult, users);
            socket.broadcast.emit('active_user_list', [user]);
         }
         
      } catch (e) {
         console.log(e);
         data = {};
      }
   });

   socket.on('candidate', function (data) {
      var data;
      try {
         console.log('getting candiate in server: ' + data.candidate);
         var d = {
            type: "candidate",
            candidate: data.candidate,
            candidateFrom: data.candidateFrom,
            candidateTo: data.candidateTo
         }
         socket.broadcast.emit("candidate_result", d)
      } catch (e) {
         console.log(e);
         data = {};
      }
   });


   socket.on('offer', function (data) {
      var data;
      try {
         console.log('sending offer to: ' + data.offerTo);
         var d = {
            type: "offer",
            offer: data.offer,
            offerFrom: data.offerFrom,
            offerTo: data.offerTo
         }
         socket.broadcast.emit("offer_result", d)
      } catch (e) {
         console.log(e);
         data = {};
      }
   });

   socket.on('answer', function (data) {
      var data;
      try {
         console.log('sending answer to: ' + data.answerTo);
         var d = {
            type: "answer",
            answer: data.answer,
            answerFrom: data.answerFrom,
            answerTo: data.answerTo
         }
         socket.broadcast.emit("answer_result", d)
      } catch (e) {
         console.log("Invalid JSON");
         data = {};
      }
   });

   socket.on('leave', function (data) {
      console.log('user: ' + data.left + ' left From ' + data.leftFrom);
      var index = users.findIndex(x => x.name == data.left);
      users.splice(index, 1);
      console.log(users)
      var d = {
         type: "leave",
         left: data.left,
         leftFrom: data.leftFrom,
      }
      socket.broadcast.emit("leave_result", d)
   });

   socket.on('disconnect', function () {
      console.log('user disconnected');
   });
});

http.listen(3000, function () {
   console.log('listening on *:3000');
});
