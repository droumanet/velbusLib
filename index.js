'use strict';

/**
 * @author David ROUMANET <golfy@free.fr>
 * @version 0.1
 * This code is experimental and is published only for those who want to use Velbus with NodeJS project.
 * Use it without any warranty.
 */


// Partie serveur Node.JS classique
let routes = require('./routes/routes')
let path = require('path')
let express = require('express')
let app = require('express')()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views/'))
app.use(express.static('views'))
app.use('/', routes)

// FIXME - problem : CDN is ok, but npm install @mdi/font doesn't works with following line
// tried with ./node_modules/... , node_modules/, /node_modules
app.use('/css', express.static(path.join(__dirname, 'node_modules/@mdi/font/css')))
console.error(path.join(__dirname, 'node_modules/@mdi/font/css'))

let http = require('http').createServer(app);
let io = require("socket.io")(http);        // create websocket with existing port HTTP for web client

// Velbus part
let VMBserver = require('./VMBServer.ini')
let traitement = require('./controllers/traitement')
// bad call? let velbusServer = require('./controllers/VelbusServer')

// in VelbusLib, there is socketIO for communication between Velbus and this application
let velbuslib = require("./controllers/velbuslib")
velbuslib.VelbusStart(VMBserver.host, VMBserver.port)
let moduleList = []


// établissement de la connexion
// let listenClients = io.listen(http);
io.on('connection', (socket) => {
    console.log(`Connecté au client ${socket.id}`)
    socket.on('relay', (msg) => {
        console.log("► ", msg)
        if (msg.status == "ON") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 1))
        if (msg.status == "OFF") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 0))
        console.log("Action sur le relay : ", msg, "address:", msg.address);
    });
    socket.on('blind', (msg) => {
        if (msg.status == "DOWN") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, -1, 10))
        if (msg.status == "UP") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, 1, 10))
        if (msg.status == "STOP") velbuslib.VMBWrite(velbuslib.blindStop(msg.address, msg.part))
        console.log("Action sur le volet : ", msg)
    })
    socket.on('discover', () => {
        for (let t = 1; t < 255; t++) {
            velbuslib.discover(t)
        }
    })
})
velbuslib.VMBEmitter.on("msg", (dataSend) => {
    console.log("Envoi ⏩ ", dataSend.RAW)
    io.emit("msg", dataSend)
});

// NOTE - lancement serveur NodeJS sur le port 8002
let portWeb = 8002;
http.listen(portWeb, () => {
    console.log("Web app listening on port ", portWeb)
});


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
// server.listen(8001);
io.listen(http)

// MAIN CODE END ==================================================================================

const { Console } = require('console');

// TODO - Timer part (see https://crontab.guru)
// Cron format : SS MM HH Day Month weekday
let schedule = require('node-schedule');
let launchSync = () => {velbuslib.VMBsyncTime()}

let everyDay5h = schedule.scheduleJob('* * 5 */1 * *', () => {
    // Synchronize time
    velbuslib.VMBsyncTime()
    console.log("CRON for Time synchronisation done...")
    
})

let everyHour = schedule.scheduleJob('* */1 * * *', () => {
    // call energy counter
})

let every5min = schedule.scheduleJob('*/5 * * * *', () => {
    // call every 5 minutes event like temperatures
})



