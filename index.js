/**
 * @author David ROUMANET <golfy@free.fr>
 * @version 0.1
 * This code is experimental and is published only for those who want to use Velbus with NodeJS project.
 * Use it without any warranty.
 */
'use strict';

import path from 'path'
import { dirname } from 'path'
import express from 'express'
import cors from "cors"
import http from 'http'
import { Server } from 'socket.io'
import { Router } from './routes/routes.js'
import { fileURLToPath } from 'url'
import schedule from 'node-schedule'
import VMBserver from './config/VMBServer.json' assert {type: "json"}    // configuration Velbus server TCP port and address
import * as velbuslib from "./modules/velbuslib.js"
import { VMBmodule, VMBsubmodule } from './models/velbuslib_class.mjs'
import { getSunrise, getSunset } from 'sunrise-sunset-js'
import { writePowerByDay, writeEnergy } from './controllers/CtrlDatabase.mjs';


import * as TeleInfo from './modules/teleinfo.js'

const sunset = getSunset(51.4541, -2.5920);

const __dirname = dirname(fileURLToPath(import.meta.url))
console.log(__dirname)      // "/Users/Sam/dirname-example/src/api"
console.log(process.cwd())  // "/Users/Sam/dirname-example"

let app = express()

app.set('views', path.join(__dirname + '/views/'))
app.set('view engine', 'ejs')
app.use(express.static('views'))
app.use('/', Router)

// Make the app available through an ADSL box (WAN) and adding CORS to SocketIO + App
app.use(cors({
    origin: '*',
    optionsSuccessStatus: 200
}));

app.use('/css', express.static(path.join(__dirname, 'node_modules/@mdi/font/css')))
console.error("CSS via NPM : ", path.join(__dirname, 'node_modules/@mdi/font/css'))

// create websocket with existing port HTTP for web client
let myhttp = http.createServer(app);
let myio = new Server(myhttp, {
    // manage CORS for NAT traversal
    cors: {
        origin: "http://teo-tea.hd.free.fr:8002",
        methods: ["GET", "POST"]
    }
});

velbuslib.VelbusStart(VMBserver.host, VMBserver.port)
let subModuleList = new Map()


// ==========================================================================================================
// =                                     SocketIO client connexion                                          =
// ==========================================================================================================

// here is an example on how to connect, from HTML/JS page : let listenClients = io.listen(http);

myio.on('connection', (socket) => {
    console.log(`▶️ SocketIO (re)connected to @IP:${socket.request.remoteAddress} (client ${socket.id})`)
    subModuleList = velbuslib.resume()
    let modulesTeleInfo = TeleInfo.resume()
    subModuleList.set("300-1", modulesTeleInfo[0])
    subModuleList.set("300-2", modulesTeleInfo[1])

    let json = JSON.stringify(Object.fromEntries(subModuleList))
    myio.emit("resume", json)
    console.log("▶️ Nombre de modules récupérés : ", subModuleList.size)
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

    })
})

// when a message is detected on Velbus bus, send it to socketIO client
velbuslib.VMBEmitter.on("msg", (dataSend) => {
    // console.log("Send SocketIO ⏩ ", dataSend.RAW)
    myio.emit("msg", dataSend)
});

// NOTE - lancement serveur NodeJS sur le port 8002
let portWeb = 8002;
myhttp.listen(portWeb, () => {
    console.log("Web app listening on port ", portWeb)
});

myio.listen(myhttp)

let pad = function (num) { return ('00' + num).slice(-2) }

// MAIN CODE END ==================================================================================
// Timer part (see https://crontab.guru)
// Cron format : SS MM HH Day Month weekday

let launchSync = () => { velbuslib.VMBsyncTime() }

let everyDay5h = schedule.scheduleJob('* * 5 */1 * *', () => {
    // Synchronize time each day at 5:00 (AM)
    velbuslib.VMBSetTime(99, 99, 99)
    console.log("CRON for Time synchronisation done...")

})

let everyDay23h59 = schedule.scheduleJob('50 59 23 */1 * *', () => {
    // Record index and some jobs to clear old values
    // read values lists and send to SQL
    let tableCompteur = TeleInfo.resume()

    subModuleList.set("300-1", tableCompteur[0])
    subModuleList.set("300-2", tableCompteur[1])

    if (subModuleList.get('300-1') != undefined) {
        let date = new Date();
        date = date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate())
        let powerTbl = new Array()
        powerTbl.push(date)
        powerTbl.push(subModuleList.get('300-1').status.indexHP + "")
        powerTbl.push(subModuleList.get('300-1').status.indexHC + "")
        powerTbl.push(subModuleList.get('300-2').status.indexProd + "")
        powerTbl.push(TeleInfo.decodePower(subModuleList.get('300-1').status.powermax) + "")
        powerTbl.push(TeleInfo.decodePower(subModuleList.get('300-2').status.powermax) + "")
        console.log(powerTbl)
        writePowerByDay(powerTbl)
        // DEBUG write is ok but need to add some error's control (like writing twice ?)
        console.log("CRON for sending power to DATABASE done...")
    }


})

let everyHour = schedule.scheduleJob('*/1 * * * *', () => {
    // call every minute energy counter

    let d = new Date()
    console.log(d.toISOString(), "Launch minuts CRON scripts")

    // WIP Write results in a database (or/and a Global variables ?)
    // Scan all module and search for a function
    console.log("CRON ============================")
    if (subModuleList != undefined) {
        
        if (subModuleList.size > 0) {
            console.log("THERE ARE SOME MODULES")
            let ll
            let eventDate=""
            subModuleList.forEach((v, k) => {
                
                /* // planned to have multiples values in v.fct
                fctArray = v.fct.map(x => x.toLowerCase())
                if (fctArray.find(e => e.toLowerCase() == "energy")) {
                    msg = velbuslib.VMBRequestEnergy(v.address, v.part)
                    console.log("CRON energy", msg)
                }

                if (v.fct.find(e => e.toLowerCase() == "temp")) {
                    msg=velbuslib.VMBRequestTemp(v.address, v.part)
                    console.log("CRON temperature", msg)
                }
                */
                if (v.fct == "energy") {
                    velbuslib.VMBRequestEnergy(v.address, v.part)
                    .then((msg) => {console.log(msg)})
                    ll = new Date(v.status.timestamp)
                    eventDate=ll.getFullYear()+"-"+pad(ll.getMonth()+1)+"-"+pad(ll.getDate())+" "+pad(ll.getHours())+":"+pad(ll.getMinutes())+":00"
                    //eventDate = (new Date(v.status.timestamp)-).toISOString().slice(0, 19).replace('T', ' ')
                    console.log(eventDate, v.id, v.fct, v.status.power, v.status.index, 'w (', v.address,'-' ,v.part,')')

                    writeEnergy([v.address, v.part, eventDate, v.status.index, v.status.power])
                }
            })
        }
        
    } else { console.log("ModuleList undefined")}

})
// WIP                                                              

let every5min = schedule.scheduleJob('* */5 * * * *', () => {
    // call every 5 minutes event like temperatures
})
