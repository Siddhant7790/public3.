const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const http = require("http");
const path = require("path");
const { Server } = require("socket.io");
const cors = require('cors');

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors({
    origin: 'https://your-frontend-url.com', // Update with your frontend URL
    methods: ['GET', 'POST']
}));

// Set up the HTTP server and Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "https://your-frontend-url.com", // Allow frontend requests
        methods: ["GET", "POST"]
    }
});

// Serve static files from the "public" directory
app.use(express.static(path.resolve("./public")));

app.get('/', (req, res) => {
    res.sendFile(path.resolve("./public/index.html"));
});

// Calendly Webhook Endpoint
app.post('/calendly-webhook', async (req, res) => {
    const eventData = req.body.payload;
    
    // Extract relevant information
    const eventStartTime = eventData.event_start_time;
    const participants = eventData.invitees;
    
    // Generate a meeting link using your video platform
    const meetingLink = await generateMeetingLink(eventStartTime, participants);
    
    // Update the Calendly event or notify participants
    await sendMeetingDetails(participants, meetingLink);

    res.status(200).send('Webhook processed successfully');
});

// Function to generate a meeting link
async function generateMeetingLink(startTime, participants) {
    const response = await axios.post('https://your-platform.com/api/create-meeting', {
        startTime: startTime,
        participants: participants
    });
    
    return response.data.meetingLink;
}

// Function to send meeting details to participants
async function sendMeetingDetails(participants, meetingLink) {
    participants.forEach(async participant => {
        await axios.post('https://your-email-service.com/send', {
            to: participant.email,
            subject: 'Your Meeting Link',
            body: `Join the meeting here: ${meetingLink}`
        });
    });
}

// Socket.IO
io.on("connection", (socket) => {
    console.log('A user connected:', socket.id);

    // Handle user joining the room
    socket.on('join-room', (roomId, userId) => {
        socket.join(roomId);
        socket.to(roomId).emit('user-connected', userId);

        // Handle disconnection
        socket.on('disconnect', () => {
            socket.to(roomId).emit('user-disconnected', userId);
        });
    });

    // Handle user message
    socket.on("user-message", (message) => {
        io.emit("message", message);
    });

    // Handle file sharing
    socket.on("file-upload", (file) => {
        io.emit("file-share", file);
    });
});

// Start the server
server.listen(5500, '0.0.0.0', () => console.log('Server started at PORT: 5500'));
