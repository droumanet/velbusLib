'use strict';
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
let host = "teo-tea.hd.free.fr";
let port = 8445;
let traitement = require('./controllers/traitement');
let velbusServer = require('./controllers/velbuslib');
velbusServer.VelbusStart(host, port);

// établissement de la connexion
// let listenClients = io.listen(http);
io.on('connection', (socket) =>{
    console.log(`Connecté au client ${socket.id}`);
    socket.on('relay', (msg) => {
        console.log("Action sur le relay : ", msg, velbusServer.toHexa(velbusServer.relaySet(0x02, 1, 1)));
        if (msg == "ON") velbusServer.VMBWrite(velbusServer.relaySet(0x2E, 1, 1));
        if (msg == "OFF") velbusServer.VMBWrite(velbusServer.relaySet(0x2E, 1, 0));
    });
    socket.on('blind', (msg) => {
        console.log("Action sur le volet : ", msg, velbusServer.toHexa(velbusServer.blindMove(0x2C, 1, -1, 1)));
        if (msg == "DOWN") velbusServer.VMBWrite(velbusServer.blindMove(0x2C, 1, -1, 1));
        if (msg == "UP") velbusServer.VMBWrite(velbusServer.blindMove(0x2C, 1, 1, 1));
        if (msg == "STOP") velbusServer.VMBWrite(velbusServer.blindStop(0x2C, 1));
    });
 });
 velbusServer.VMBEmitter.on("msg", (dataSend) => {
     console.log("Envoi ⏩ ",dataSend)
     io.emit("msg", dataSend)
 });

// lancement serveur NodeJS
http.listen(portWeb, () => {
    console.log("Web app listening on port ", portWeb);
});


app.get('/', Routeur);


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
// server.listen(8001);
io.listen(http);
