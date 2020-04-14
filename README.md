# WebRTC-Nodejs-SingnalingServer

This project uses [WEBRTC](https://webrtc.org/) Technology to make RealTime Video and Audio Calling from Browser.
It is one of the most famous technologies that is being used to make Real time Audio Video communication using peer-to-peer data sharing. WebRTC is used in various apps like WhatsApp, Facebook Messenger, appear.in and platforms such as TokBox. WebRTC has also been integrated with WebKitGTK+ and Qt native apps.

WebRTC does not require a conventional server to make real time communication. It uses RTCPeerConnection to communicate streaming data between browsers (aka peers), but also needs a mechanism to coordinate communication and to send control messages, a process known as signaling. Signaling methods and protocols are not specified by WebRTC: signaling is not part of the RTCPeerConnection API.

In this repository a simple NodeJS Signaling Server using [SocketIo](https://socket.io/) is built to exchange the basic icecandidate data between peers.


### Requirements
Make sure you have installed 
[NodeJs](https://nodejs.org/en/download/)
& 
[NodeMon](https://www.npmjs.com/package/nodemon)(globally).


### Run the Code

To run at first clone the repo to your desired folder and cd to that folder and run the following command.

```
// To install dependencies
npm install


// To run server
nodemon server.js

//Server up and running on port 3000


// To run client go client folder and open 'index.html' file in a browser
