'use strict';
// Partie serveur Node.JS classique
let path = require('path')
let express = require('express')
let app = require('express')()
app.set('view engine', 'ejs')
app.set('views',path.join(__dirname+'/views/'))
app.use(express.static('views'))

// TODO - Timer part (see https://crontab.guru)
let schedule = require('node-schedule');
let eventHour = schedule.scheduleJob('* */1 * * *', () => {
    // call energy counter
})
let event5min = schedule.scheduleJob('*/5 * * * *', () => {
    // call temperature status
})

let http = require('http').createServer(app);
let io = require("socket.io")(http);        // create websocket with existing port HTTP

let bodyparser = require('body-parser')    // middleware
let Routeur = require('./routes/routes')
app.get('/', Routeur)
// FIXME - problem on /installation (view not accessible)

// Partie Velbus
let VMBserver = require('./VMBServer.ini')
let traitement = require('./controllers/traitement')
let velbusServer = require('./controllers/velbuslib')
velbusServer.VelbusStart(VMBserver.host, VMBserver.port)
let moduleList = []


// établissement de la connexion
// let listenClients = io.listen(http);
io.on('connection', (socket) =>{
    console.log(`Connecté au client ${socket.id}`)
    socket.on('relay', (msg) => {
        console.log("► ",msg)
        if (msg.status == "ON") velbusServer.VMBWrite(velbusServer.relaySet(msg.address, msg.part, 1))
        if (msg.status == "OFF") velbusServer.VMBWrite(velbusServer.relaySet(msg.address, msg.part, 0))
        console.log("Action sur le relay : ", msg, "address:", msg.address);
    });
    socket.on('blind', (msg) => {
        if (msg.status == "DOWN") velbusServer.VMBWrite(velbusServer.blindMove(msg.address, msg.part, -1, 10))
        if (msg.status == "UP") velbusServer.VMBWrite(velbusServer.blindMove(msg.address, msg.part, 1, 10))
        if (msg.status == "STOP") velbusServer.VMBWrite(velbusServer.blindStop(msg.address, msg.part))
        console.log("Action sur le volet : ", msg)
    })
 });
 velbusServer.VMBEmitter.on("msg", (dataSend) => {
     console.log("Envoi ⏩ ",dataSend.RAW)
     io.emit("msg", dataSend)
 });

// lancement serveur NodeJS sur le port 8002
let portWeb = 8002;
http.listen(portWeb, () => {
    console.log("Web app listening on port ", portWeb)
});


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
// server.listen(8001);
io.listen(http)
