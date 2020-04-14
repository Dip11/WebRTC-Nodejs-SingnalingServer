$(function () {
   var name;
   var connectedUser;

   var loginPage = document.querySelector('#loginPage');
   var usernameInput = document.querySelector('#usernameInput');
   var loginBtn = document.querySelector('#loginBtn');

   var callPage = document.querySelector('#callPage');
  
   var hangUpBtn = document.querySelector('#hangUpBtn');

   var localVideo = document.querySelector('#localVideo');
   var remoteVideo = document.querySelector('#remoteVideo');

   var socket = io.connect('http://localhost:3000');

   var allUsers = []

   socket.on("connection_open", (data) => {
      console.log(data);
   });

   socket.on("login_result", (data, users) => {
      handleLogin(data, users);
      console.log("users");
      console.log(users);

      activeUsers(users);
   })

   socket.on("active_user_list", (data) => {
      console.log("data");
      console.log(data);
      activeUsers(data);
   })

   socket.on("candidate_result", (data) => {
      if (data.candidateTo == name) {
         handleCandidate(data.candidate);
      }
   })

   socket.on("offer_result", (data) => {
      if (data.offerTo == name) {
         handleOffer(data.offer, data.offerFrom);
      }
   })

   socket.on("answer_result", (data) => {
      if (data.answerTo == name) {
         handleAnswer(data.answer);
      }
   })

   socket.on("leave_result", (data) => {
      if (data.leftFrom == name) {
         handleLeave();
      }
   })

   var peerConn;
   var stream;
   var configuration = {
      "iceServers": [{ "url": "stun:stun2.1.google.com:19302" }]
   };
   peerConn = new webkitRTCPeerConnection(configuration);

   callPage.style.display = "none";

   loginBtn.addEventListener("click", function (event) {
      name = usernameInput.value;

      if (name.length > 0) {
         var data = {
            name: name,
            id: 1
         }
         socket.emit("login", data);
      }
   });

   function handleLogin(data, users) {
      if (data.success === false) {
         alert("Ooops...try a different username");
      } else {
         // activeUsers(users);
         loginPage.style.display = "none";
         callPage.style.display = "block";

         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
            .then(function (stream) { 
               playVideo(localVideo, stream);
               localStream = stream;
               console.log(stream);
               
               peerConn.addStream(stream);

               peerConn.onaddstream = function (stream) {
                  playVideo(remoteVideo, stream.stream);
               };

               peerConn.onicecandidate = function (event) {
                  if (event.candidate) {
                     var data = {
                        type: "candidate",
                        candidate: event.candidate,
                        candidateFrom: name,
                        candidateTo: connectedUser
                     }
                     socket.emit("candidate", data);
                  }
               };
            }).catch(function (error) { 
               console.error('mediaDevice.getUserMedia() error:', error);
               return;
            });

      }
   };
   function playVideo(element, stream) {
      element.srcObject = stream;
      element.play();
   }
   
   function handleOffer(offer, from) {
      connectedUser = from;
      peerConn.setRemoteDescription(new RTCSessionDescription(offer));

      peerConn.createAnswer(function (answer) {
         peerConn.setLocalDescription(answer);
         var data = {
            type: "answer",
            answer: answer,
            answerFrom: name,
            answerTo: connectedUser
         }
         socket.emit("answer", data);
      }, function (error) {
         alert("Error when creating an answer");
      });
   };

   function handleAnswer(answer) {
      peerConn.setRemoteDescription(new RTCSessionDescription(answer));
   };

   function handleCandidate(candidate) {
      peerConn.addIceCandidate(new RTCIceCandidate(candidate));
   };

   hangUpBtn.addEventListener("click", function () {
      var data = {
         type: "leave",
         left: name,
         leftFrom: connectedUser
      }
      socket.emit("leave", data);
      handleLeave();
   });

   function handleLeave() {
      connectedUser = null;
      remoteVideo.src = null;
      peerConn.close();
      peerConn.onicecandidate = null;
      peerConn.onaddstream = null;
   };

   function callTo(callTo) {
      var callToUsername = callTo;

      if (callToUsername.length > 0) {

         connectedUser = callToUsername;
         peerConn.createOffer(function (offer) {
            var data = {
               type: "offer",
               offer: offer,
               offerFrom: name,
               offerTo: connectedUser
            }
            socket.emit("offer", data);
            peerConn.setLocalDescription(offer);
         }, function (error) {
            alert("Error when creating an offer");
         });
      }

   }

   function activeUsers(data) {
      activeUserList = data.filter(x => x.name != name);
      unique = [...new Set(activeUserList.map(item => item.name))];
      unique.forEach(element => {
         if (!allUsers.find(x => x.name == element)) {
            allUsers.push(element);
            $("#result").append('<li class="list-group-item"><span>' + element + '</span><button id=' + element + '  class="btn-success btn btn-sm ml-4">Call</button> </li>');
            $(document).on('click', "#" + element, function () {
               callTo(element);
            });
         }
      });
   }
});