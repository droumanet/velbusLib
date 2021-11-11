var VelbusLib = require('./velbuslib')

// ========================= SERVER PART ===========================================
let connexion = () => {
    console.log("Velbus connexion launched...");
}

let net = require("net");
const { isUndefined } = require('util');
let client = new net.Socket();
const VelbusStart = (host, port) => {
    client.connect(port, host);
}

client.on('connect', (data) => {
    console.log("connected to > ", client.remoteAddress, ":", client.remotePort);
})

client.on('data', (data) => {
    let VMBmsgList = [], entry = {}
    let desc = '', d = '', crc = 0

    // RAW data could have multiple Velbus message
    VelbusLib.Cut(data).forEach(element => {
        desc = VelbusLib.analysing(element);
        d = VelbusLib.toHexa(element);
        crc = VelbusLib.CheckSum(element);
        entry = { "RAW": element, "HEX": d, "CRC": crc, "DESCRIPTION": desc }
        VMBmsgList.push(entry)
        VMBEmitter.emit("msg", entry);
    })
});
client.on('close', () => {
    console.log("Closing velbus server connexion");
});


const EventEmitter = require('events')
const VMBEmitter = new EventEmitter()
module.exports = {
    VMBEmitter,
    VelbusStart,
}