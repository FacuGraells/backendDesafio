const mongoose = require('mongoose');

const connectionString = 'mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority';

mongoose.connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch((error) => console.error('Failed to connect to MongoDB:', error));

module.exports = mongoose;


const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://<username>:<password>@cluster0.mongodb.net/ecommerce?retryWrites=true&w=majority', {
 useNewUrlParser: true,
 useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function() {
 console.log("Connected to DB");
});


const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const MessageSchema = new Schema({
 user: String,
 message: String
});

const Message = mongoose.model('Message', MessageSchema);

// Función para guardar un mensaje
async function saveMessage(messageData) {
 const message = new Message(messageData);
 await message.save();
}

// Función para cargar todos los mensajes
async function loadMessages() {
    const messages = await Message.find().sort({ _id: -1 });
    return messages;
   }