const socket = io('wss://your-live-server.com'); // Replace with your live Socket.IO server URL
const myPeer = new Peer(undefined, {
    host: 'your-peerjs-server.com', // Replace with your PeerJS server URL
    port: 443,  // Secure port
    secure: true  // Use secure connection
});

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    // Your code to handle video stream
}).catch(err => {
    console.error('Error accessing media devices:', err);
    alert('Please allow camera and microphone access.');
});
