//const { Socket } = require("socket.io");
const socket = io("/");
const videoGrid = document.getElementById("video-grid");
const myVideo = document.createElement("video");
myVideo.muted = true;
var peer = new Peer(undefined, {
  path: "/peerjs",
  host: "/",
  port: "3030",
});
let myVideoStream;
navigator.mediaDevices
  .getUserMedia({
    video: true,
    audio: true,
  })
  .then((stream) => {
    myVideoStream = stream;
    addVideoStream(myVideo, stream);
    peer.on("call", function (call) {
      call.answer(stream); // Answer the call with an A/V stream.
      const video = document.createElement("video");
      call.on("stream", (userVideoStream) => {
        addVideoStream(video, userVideoStream);
      });
    });
    socket.on("user-connected", (userId) => {
      connectToNewUser(userId, stream);
    });
    let text = $("input");

    $("html").keydown((e) => {
      if (e.which == 13 && text.val().length !== 0) {
        socket.emit("message", text.val());
        text.val("");
      }
    });

    socket.on("createMessage", (message) => {
      console.log('createMessage', message);
      $(".messages").append(`<li class="message"><b>user</b><br />${message}</li>`);
      scrollToBottom()
    });
  });
peer.on("open", (id) => {
  //console.log(id);
  socket.emit("join-room", ROOM_ID, id);
});
//socket.emit("join-room", ROOM_ID); // emit is used to convey ur directions to others which is further broadcasted to other users under join-room event in server.js file
// socket.on("user-connected", (userId) => {
//   connectToNewUser(userId, stream); //once user-connected broadcast event happened this function will be executed
// });
const connectToNewUser = (userId, stream) => {
  // here we are actually streaming other's video to our screen by creating a new video element for him
  const call = peer.call(userId, stream);
  const video = document.createElement("video");
  call.on("stream", (userVideoStream) => {
    addVideoStream(video, userVideoStream);
  }); // this is other person's stream
};
const addVideoStream = (video, stream) => {
  video.srcObject = stream;
  video.addEventListener("loadedmetadata", () => {
    video.play();
  });
  videoGrid.append(video);
};

const scrollToBottom = () => {
  let d = $('.main_chat_window');
  d.scrollTop(d.prop("scrollHeight"));
}

const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();

  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true ;
  }
}

const setMuteButton = () => {
  const html = `<i class="fa-solid fa-microphone-lines"></i>
  <span>Mute</span>`
  document.querySelector('.main_mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `<i class="unmute fa-solid fa-microphone-lines"></i>
  <span>Unmute</span>`
  document.querySelector('.main_mute_button').innerHTML = html;
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo();

  } else {
    setStopVideo();
    myVideoStream.getVideoTracks()[0].enabled = true ;
  }
}

const setStopVideo = () => {
  const html = `<i class="fa-solid fa-video"></i><span>Stop Video</span>`
  document.querySelector('.main_video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `<i class="stop fa-solid fa-video"></i><span>Play Video</span>`
  document.querySelector('.main_video_button').innerHTML = html;
}