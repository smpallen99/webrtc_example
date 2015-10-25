//
// Copyright @E-MetroTel 2015 
// 
//<script src="https://www.webrtc-experiment.com/RTCPeerConnection-v1.5.js"></script>
import {Socket} from "deps/phoenix/web/static/js/phoenix"
let socket = new Socket("/socket")


$(document).ready(function() {

  var localStream;
  var sdpConstraints = {video: false, audio: true};

  socket.connect()

  var loginPage = document.querySelector('#login-page'),
      usernameInput = document.querySelector('#username'),
      loginButton = document.querySelector('#login'),
      callPage = document.querySelector('#call-page'),
      theirUsernameInput = document.querySelector('#their-username'),
      callButton = document.querySelector('#call'),
      hangUpButton = document.querySelector('#hang-up'),
      name;

  callPage.style.display = "none";

  // Login when the user clicks the button
  loginButton.addEventListener("click", function (event) {
    name = usernameInput.value;

    if (name.length > 0) {
      var chan = socket.channel("webrtc:client-"+name, {})

      chan.join()
        .receive("ok", resp => { onLogin(true) })
        .receive("error", resp => { onLogin(false) })

      chan.on("webrtc:login", data => {
        console.log("Got login", data);
        onLogin(data.success);
      })
      chan.on("webrtc:offer", data => {
        console.log("Got offer", data);
        onOffer(data.offer, data.name);
      })
      chan.on("webrtc:answer", data => {
        console.log("Got answer", data);
        onAnswer(data.answer);
      })
      chan.on("webrtc:candidate", data => {
        console.log("Got candidate", data);
        onCandidate(data.candidate);
      })
      chan.on("webrtc:leave", data => {
        console.log("Got leave", data);
        // console.log("update:line: ", msg)
        onLeave();
      })
    }

    // Alias for sending messages in JSON format
    function send(message) {
      if (connectedUser) {
        message.name = connectedUser;
      }
      chan.push("client:webrtc-" + name, message) 
    }

    function onLogin(success) {
      if (success === false) {
        alert("Login unsuccessful, please try a different name.");
      } else {
        loginPage.style.display = "none";
        callPage.style.display = "block";

        // Get the plumbing ready for a call
        startConnection();
      }
    };

    callButton.addEventListener("click", function () {
      var theirUsername = theirUsernameInput.value;

      if (theirUsername.length > 0) {
        startPeerConnection(theirUsername);
      }
    });

    hangUpButton.addEventListener("click", function () {
      send({
        type: "leave"
      });

      onLeave();
    });

    function onOffer(offer, name) {
      connectedUser = name;
      yourConnection.setRemoteDescription(new RTCSessionDescription(offer));

      yourConnection.createAnswer(function (answer) {
        yourConnection.setLocalDescription(answer);
        send({
          type: "answer",
          answer: answer
        });
      }, function (error) {
        console.log("onOffer error", error)
        alert("An error has occurred" + error);
      });
    }

    function onAnswer(answer) {
      yourConnection.setRemoteDescription(new RTCSessionDescription(answer));
    }

    function onCandidate(candidate) {
      yourConnection.addIceCandidate(new RTCIceCandidate(candidate));
    }

    function onLeave() {
      connectedUser = null;
      theirAudio.src = null;
      yourConnection.close();
      yourConnection.onicecandidate = null;
      yourConnection.onaddstream = null;
      setupPeerConnection(stream);
    }

    function hasUserMedia() {
      navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      return !!navigator.getUserMedia;
    }

    function hasRTCPeerConnection() {
      window.RTCPeerConnection = window.RTCPeerConnection || window.webkitRTCPeerConnection || window.mozRTCPeerConnection;
      window.RTCSessionDescription = window.RTCSessionDescription || window.webkitRTCSessionDescription || window.mozRTCSessionDescription;
      window.RTCIceCandidate = window.RTCIceCandidate || window.webkitRTCIceCandidate || window.mozRTCIceCandidate;
      return !!window.RTCPeerConnection;
    }

    var theirAudio = document.querySelector('#theirs'),
        yourConnection, connectedUser, stream;

    function startConnection() {
      if (hasUserMedia()) {
        navigator.getUserMedia({ video: false, audio: true }, function (myStream) {
          stream = myStream;

          if (hasRTCPeerConnection()) {
            setupPeerConnection(stream);
          } else {
            alert("Sorry, your browser does not support WebRTC.");
          }
        }, function (error) {
          console.log(error);
        });
      } else {
        alert("Sorry, your browser does not support WebRTC.");
      }
    }

    function setupPeerConnection(stream) {
      var configuration = {
        "iceServers": [{ "url": "stun:stun.1.google.com:19302" }]
      };
      yourConnection = new RTCPeerConnection(configuration);

      // Setup stream listening
      yourConnection.addStream(stream);
      yourConnection.onaddstream = function (e) {
        theirAudio.src = window.URL.createObjectURL(e.stream);
      };

      // Setup ice handling
      yourConnection.onicecandidate = function (event) {
        if (event.candidate) {
          send({
            name: name, 
            type: "candidate",
            candidate: event.candidate
          });
        }
      };
    }

    function startPeerConnection(user) {
      connectedUser = user;

      // Begin the offer
      yourConnection.createOffer(function (offer) {
        send({
          type: "offer",
          offer: offer
        });
        yourConnection.setLocalDescription(offer);
      }, function (error) {
        alert("An error has occurred.");
      });
    };
  });

})
export default socket
