// Partie serveur Node.JS classique
let app = require('express')();
let express = require('express');
let http = require('http').createServer(app);
let bodyparser = require('body-parser');
let io = require("socket.io")(http);        // create websocket with existing port HTTP
let Routeur = require('./routes/routes');
app.set('view engine', 'ejs');
app.use(express.static('views'));
let portWeb = 8002;

// Partie Velbus
let net = require("net");
let traitement = require('./controllers/traitement');
let velbus = require('./controllers/velbuslib');

// let VMBserver = require();
let host = "teo-tea.hd.free.fr";
let port = 8445;
let client = new net.Socket();
let connexion = () => {
    console.log("connected to velbus server...");
}
client.connect(port, host, connexion);

// receiving 
client.on('data', (data) => {
    // frames are coming in a buffer. We need to separate them and display the result
    velbus.Cut(data).forEach(element => {
        let d = velbus.toHexa(element);
        let crc = velbus.CheckSum(element);
        console.log("DATA: "+d+" CRC:"+crc.toString(16));
        io.emit('news',"DATA: "+d+" CRC:"+crc.toString(16))
    });
});
client.on('close', ()  => {
    console.log("CLOSING CONNEXION");
});

// établissement de la connexion
// let listenClients = io.listen(http);
io.on('connection', (socket) =>{
    console.log(`Connecté au client ${socket.id}`);
    socket.on('relay', (msg) => {
        console.log("Action sur le relay : ", msg, velbus.toHexa(velbus.relaySet(0x02, 1, 1)));
        if (msg == "ON") client.write(velbus.relaySet(0x2E, 1, 1));
        if (msg == "OFF") client.write(velbus.relaySet(0x2E, 1, 0));
    });
 });

// lancement serveur NodeJS
http.listen(portWeb, () => {
    console.log("Le serveur écoute sur le port ", portWeb);
});


app.get('/', Routeur);


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
// server.listen(8001);
io.listen(http);
