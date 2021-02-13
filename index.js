// Partie serveur Node.JS classique
let app = require('express')();
let express = require('express');
let http = require('http').createServer(app);
let bodyparser = require('body-parser');
let io = require("socket.io")(http);        // create websocket with existing port HTTP
let Routeur = require('./routes/routes');
app.set('view engine', 'ejs');
app.use(express.static('views'));


// Partie Velbus
let net = require("net");
let traitement = require('./controllers/traitement');
let velbus = require('./controllers/velbuslib');

// let VMBserver = require();
let host = "192.168.168.248";
let port = 8445;
let client = new net.Socket();
let connexion = () => {
    console.log("connected to velbus server...");
}
client.connect(port, host, connexion);

client.on('data', (data) => {
    let d = traitement.enHexa(data);
    let crc = velbus.CheckSum(data);
    console.log("DATA: "+d+" CRC:"+crc.toString(16));
    io.emit('news',"DATA: "+d+" CRC:"+crc.toString(16))
});
client.on('close', ()  => {
    console.log("CLOSING CONNEXION");
});

// établissement de la connexion
// let listenClients = io.listen(http);
io.on('connection', (socket) =>{
    console.log(`Connecté au client ${socket.id}`)
 })

// lancement serveur NodeJS
http.listen(8002, () => {
    console.log("Le serveur écoute sur le port 8001");
})


app.get('/', Routeur);


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
// server.listen(8001);
io.listen(http);
