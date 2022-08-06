// Require node js dgram module.
import Dgram from "dgram"
import VMBmodule from './velbuslib_class.mjs'
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
    "RELAIS": "",
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

function resume() {
    let statusConso = {"power":compteurConso.SINSTS*1, "index":compteurConso.EASF01/1000, "powermax":compteurConso.SMAXSN, "timestamp":Date.now()}
    let cptConso = new VMBmodule("CPT", 1, "CPT-1", "Energy", statusConso)
    cptConso.name = "TeleInfo Conso"
    let statusProd = {"power":compteurProd.SINSTI*1, "index":compteurProd.EASF01/1000, "powermax":compteurProd.SMAXIN, "timestamp":Date.now()}
    let cptProd = new VMBmodule("CPT", 1, "CPT-1", "Energy", statusProd)
    cptProd.name = "TeleInfo Prod"
    return [cptConso, cptProd]
}

// decode TeleInfo date :SAISON (E/H)+YYMMDDHHmmSS
function decodeDate(m) {
    let msg = m.split(" ")
    // let HeureEte = "E" == m[0].substr(0,1)
    if (msg[0].length >12) {
        let d = "20"+msg[0].substr(1,2) + "-" + msg[0].substr(3,2) + "-" + msg[0].substr(5,2) + " " + msg[0].substr(7,2) + ":" + msg[0].substr(9,2) + ":" + msg[0].substr(11,2)
        return d
    } 
    return msg[0]

}
// decode TeleInfo max power :"DATE POWER"
function decodeSMAXNpower(m) {
    let msg = m.split(" ")
    console.log(m, "=>",msg)
    return msg[1]*1
}


TeleInfo.on('listening', (message) => {
    console.log("listening from TeleInfo", message)
})
TeleInfo.on('message', (message) => {
    let maVariable = JSON.parse(message.toString())
    if (maVariable.TYPE =="CONSOMMATION") {
        console.log("------------------------------------------")
        compteurConso = structuredClone(maVariable)
        console.log(compteurConso.TYPE+" : ", compteurConso.SINSTS*1, "Pmax : ", decodeSMAXNpower(compteurConso.SMAXSN),"W" , decodeDate(compteurConso.SMAXSN));     // DEBUG obj.Nom-1 ne peut pas être analysé
    } else {
        try {
        console.log(maVariable.TYPE+" : ", maVariable.SINSTI*1, "Pmax : ", decodeSMAXNpower(maVariable.SMAXIN),"W" , decodeDate(maVariable.SMAXIN))
        compteurProd = structuredClone(maVariable)
        } catch {
            console.log(compteurProd.TYPE, maVariable)
        }
    }
})
TeleInfo.on('error', (message, info) => {
    console.log("Error message from TeleInfo", message)

})

TeleInfo.bind(port)

export {compteurConso, compteurProd, resume}