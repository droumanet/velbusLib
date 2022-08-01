/**
 * @author David ROUMANET <golfy@free.fr>
 * @version 0.1
 * This code is experimental and is published only for those who want to use Velbus with NodeJS project.
 * Use it without any warranty.
 */

 'use strict';
 

// Partie serveur Node.JS classique
import path from 'path'
import {dirname} from 'path'
import express from 'express'
import cors from "cors"
import http from 'http'
import {Server} from 'socket.io'
import {Router} from './routes/routes.js'
import { fileURLToPath } from 'url'
import schedule from 'node-schedule'
import { blindHello } from './controllers/primitives_blind.mjs'

const __dirname = dirname(fileURLToPath(import.meta.url))
let app = express()
app.set('view engine', 'ejs')
app.set('views', path.join(__dirname + '/views/'))
app.use(express.static('views'))
app.use('/', Router)

// Make the app available through an ADSL box (WAN) and adding CORS to SocketIO + App
app.use(cors({
   origin: '*',
   optionsSuccessStatus: 200
}));

// FIXME CDN ok, npm isn't. install @mdi/font doesn't works with following line
// tried with ./node_modules/... , node_modules/, /node_modules
app.use('/css', express.static(path.join(__dirname, 'node_modules/@mdi/font/css')))
console.error(path.join(__dirname, 'node_modules/@mdi/font/css'))

let myhttp = http.createServer(app);
let myio = new Server(myhttp, {
    // manage CORS for NAT traversal
    cors: {
        origin: "http://teo-tea.hd.free.fr:8002",
        methods: ["GET", "POST"]
      }    
});        // create websocket with existing port HTTP for web client

// Velbus part
import VMBserver from './config/VMBServer.json' assert {type:"json"}
// DEBUG import {enHexa} from './controllers/traitement'

// in VelbusLib, there is socketIO for communication between Velbus and this application
import * as velbuslib  from "./controllers/velbuslib.js"
velbuslib.VelbusStart(VMBserver.host, VMBserver.port)
let moduleList = new Map()


// ==================================================================================
// =                          SocketIO client connexion                             =
// ==================================================================================

// here is an example on how to connect, from HTML/JS page : let listenClients = io.listen(http);

myio.on('connection', (socket) => {
    console.log(`▶️ SocketIO Connected to @IP:${socket.request.connection.remoteAddress} (client ${socket.id})`)
    moduleList = velbuslib.resume()
    let json = JSON.stringify(Object.fromEntries(moduleList))
    console.log(json)
    myio.emit("resume", json)
    console.log("▶️ Nombre de modules récupérés : ",moduleList.size)
    socket.on("energy", (msg) => {
        console.log("► Energy request transmitted (socketIO client)")
        velbuslib.VMBWrite(velbuslib.CounterRequest(msg.address, msg.part))
    })
    socket.on('relay', (msg) => {
        console.log("▶️ ", msg)
        if (msg.status == "ON") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 1))
        if (msg.status == "OFF") velbuslib.VMBWrite(velbuslib.relaySet(msg.address, msg.part, 0))
        console.log("▶️ Action on relay: ", msg, "address:", msg.address);
    });
    socket.on('blind', (msg) => {
        if (msg.status == "DOWN") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, -1, 10))
        if (msg.status == "UP") velbuslib.VMBWrite(velbuslib.blindMove(msg.address, msg.part, 1, 10))
        if (msg.status == "STOP") velbuslib.VMBWrite(velbuslib.blindStop(msg.address, msg.part))
        console.log("▶️ Action on blind: ", msg)
    })
    socket.on('discover', () => {
        for (let t = 1; t < 255; t++) {
            velbuslib.discover(t)
        }
    })
})

// when a message is detected on Velbus bus, send it to socketIO client
velbuslib.VMBEmitter.on("msg", (dataSend) => {
    console.log("Send SocketIO ⏩ ", dataSend.RAW)
    myio.emit("msg", dataSend)
});

// NOTE - lancement serveur NodeJS sur le port 8002
let portWeb = 8002;
myhttp.listen(portWeb, () => {
    console.log("Web app listening on port ", portWeb)
});

myio.listen(myhttp)

// MAIN CODE END ==================================================================================

let launchSync = () => {velbuslib.VMBsyncTime()}

let everyDay5h = schedule.scheduleJob('* * 5 */1 * *', () => {
    // Synchronize time each day at 5:00 (AM)
    velbuslib.VMBsyncTime()
    console.log("CRON for Time synchronisation done...")
    
})

// Timer part (see https://crontab.guru)
// Cron format : SS MM HH Day Month weekday

let everyHour = schedule.scheduleJob('*/10 * * * * *', () => {
    // call every minute energy counter
    // DEBUG call every 10 secondes for debuging

    let d = new Date()
    console.log(d.toISOString())
    // FIXME howto to use submodules in NodeJS. console.log("blindHello call : ", velbuslib.blind.blindHello("Max"))
    // console.log("blindHello call : ", velbuslib.blind.blindHello("Max"))
    velbuslib.VMBRequestEnergy(0x06, 1)
    .then((msg) => console.log("CRON for PAC  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))
    velbuslib.VMBRequestEnergy(0x06, 3)
    .then((msg) => console.log("CRON for EV Charge  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))
    velbuslib.VMBRequestEnergy(0x40, 1)
    .then((msg) => console.log("CRON for clim  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))
    velbuslib.VMBRequestEnergy(0x40, 2)
    .then((msg) => console.log("CRON for domo  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))


    velbuslib.VMBRequestTemp(0x74, 1)
    .then((msg) => console.log("Temp Exterieur  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))
    velbuslib.VMBRequestTemp(0x7C, 1)
    .then((msg) => console.log("Temp Grenier  : ", msg, new Date(msg.timestamp).toISOString()))
    .catch((msg) => console.error(msg))
})

let every5min = schedule.scheduleJob('*/5 * * * *', () => {
    // call every 5 minutes event like temperatures
})



