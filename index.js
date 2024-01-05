const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const randomstring = require('randomstring');

const app = express();
const PORT = 3000; // Set your desired port number

app.use(bodyParser.json());

// Load data from the JSON file
const dataPath = 'data.json';
let data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));

app.get('/rooms', (req, res) => {
    res.json(data);
});

app.post('/add', (req, res) => {
    const roomName = req.body.roomName;

    if (!roomName) {
        return res.status(400).json({ error: 'Room name is required' });
    }

    const roomKey = randomstring.generate({ length: 4, charset: 'numeric' });

    const newRoom = {
        Name: roomName,
        messages: [],
    };

    data.rooms[roomKey] = newRoom;

    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

    console.log(`Done making Room ${roomName} by Key ${roomKey}`);

    return res.json({ message: `Key = ${roomKey}`, data: newRoom });
});

app.delete('/delete/:room_key', (req, res) => {
    const roomKey = req.params.room_key;

    try {
        const deletedRoom = data.rooms[roomKey];
        delete data.rooms[roomKey];

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        return res.json({
            message: `Room with key ${roomKey} deleted successfully`,
            data: deletedRoom,
        });
    } catch (error) {
        return res.status(404).json({ error: `Room with key ${roomKey} not found` });
    }
});

app.get('/get_messages/:room_key', (req, res) => {
    const roomKey = req.params.room_key;

    try {
        const roomMessages = data.rooms[roomKey].messages;
        res.json(roomMessages);
    } catch (error) {
        res.status(404).json({ error: 'Room not found' });
    }
});

app.post('/add_message/:room_key', (req, res) => {
    const roomKey = req.params.room_key;

    try {
        if (!data.rooms[roomKey]) {
            console.log('Key is wrong');
        }

        console.log(`Received POST request for room key: ${roomKey}`);

        const messageContent = req.body.messageContent;

        if (!messageContent) {
            return res.status(400).json({ error: 'Message content is required' });
        }

        data.rooms[roomKey].messages.push(messageContent);

        fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

        return res.json({
            message: 'Message added successfully',
            data: { roomKey: roomKey, messageContent: messageContent },
        });
    } catch (error) {
        console.log(`Room with key ${roomKey} not found`);
        return res.status(404).json({ error: `Room with key ${roomKey} not found` });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
