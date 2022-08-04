// Require node js dgram module.
import Dgram from "dgram"
import pickle from "pickle"
// const Dgram = require('dgram')
let port = 65432
// Create a udp socket client object.
const TeleInfo = Dgram.createSocket("udp4")

let compteurConso = {
    "TYPE":"CONSOMMATION",
    "DATE": "",
    "PRM": "",
    "EASF01": "",
    "EASF02": "",
    "IRMS1": "",
    "URMS1": "",
    "SINSTS": "",
    "UMOY1": "",
    "NGTF": "",
    "NTARF": "",
    "MSG1": "",
    "SMAXSN": "",
    "SMAXSN1": "",
    "RELAIS": ""
}
let compteurProd = {
    "TYPE":"PRODUCTION",
    "DATE": "",
    "PRM": "",
    "EASF01": "",
    "EAIT": "",
    "IRMS1": "",
    "URMS1": "",
    "SINSTI": "",
    "SMAXIN": "",
    "SMAXIN1": "",
    "NGTF": "",
    "MSG1": ""
}

// decode TeleInfo date :SAISON (E/H)+YYMMDDHHmmSS
function decodeDate(m) {
    let msg = m.split(" ")
    let HeureEte = "E" == m[0].substr(0,1)
    let d = "20"+msg[0].substr(1,2) + "-" + msg[0].substr(3,2) + "-" + msg[0].substr(5,2) + " " + msg[0].substr(7,2) + ":" + msg[0].substr(9,2) + ":" + msg[0].substr(11,2)
    return d
}
// decode TeleInfo max power :"DATE POWER"
function decodeSMAXNpower(m) {
    let msg = m.split(" ")
    return msg[1]*1
}


TeleInfo.on('listening', (message) => {
    console.log("listening from TeleInfo", message)
})
TeleInfo.on('message', (message) => {
    let maVariable = JSON.parse(message.toString())
    if (maVariable.TYPE =="CONSOMMATION") {
        console.log("------------------------------------------")
        console.log(maVariable.TYPE+" : ", maVariable.SINSTS*1, "Pmax : ", decodeSMAXNpower(maVariable.SMAXSN),"W" , decodeDate(maVariable.SMAXSN));     // DEBUG obj.Nom-1 ne peut pas être analysé
    } else {
        try {
        console.log(maVariable.TYPE+" : ", maVariable.SINSTI*1, "Pmax : ", decodeSMAXNpower(maVariable.SMAXIN),"W" , decodeDate(maVariable.SMAXIN))
        } catch {
            console.log(maVariable.TYPE, maVariable)
        }
    }
})
TeleInfo.on('error', (message, info) => {
    console.log("Error message from TeleInfo", message)

})

TeleInfo.bind(port)

setTimeout( () => {
    TeleInfo.close()
}, 20*60*1000)      // 20 minuts

/*
setInterval( () => {
    console.log("Not dead")
}, 5000)
*/