/**
 * @author David ROUMANET <golfy@free.fr>
 * @description VELBUS Library to use with Velbus NodeJS projects
 * @version 1.0
 * @license CommonCreative BY.
 */


/* ====================================================================================================================
    Velbus frame
  --------------------------------------------------------------------------------------------------------------------
 |    0    |   1  |  2   |    3    |  4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |     x    |   x+1  |
  --------------------------------------------------------------------------------------------------------------------
 | VMBStrt | Prio | Addr | RTR/Len | Func | Byte2 | Byte3 | Byte4 | Byte5 | Byte6 | Byte7 | Byte8 | Checksum | VMBEnd |
  --------------------------------------------------------------------------------------------------------------------
  (1) Len = RTR/Len & 0x0F
 ======================================================================================================================
*/

const EventEmitter = require('events')
const VMBEmitter = new EventEmitter()

const VMB_StartX = 0x0F;
const VMB_EndX = 0x04;
const VMB_PrioHi = 0xF8;
const VMB_PrioLo = 0xFB;


//#region modules AS Modules (code, name, desc)
const VMBmodules =
    [{ code: "0x01", name: "VMB8PB", desc: "8 simple push buttons module", part: 8 },
    { code: "0x02", name: "VMB1RY", desc: "1 relay (with physical button) module", part: 1 },
    { code: "0x03", name: "VMB1BL", desc: "1 blind (with physical button) module", part: 1 },
    { code: "0x05", name: "VMB6IN", desc: "6 inputs module", part: 6 },
    { code: "0x07", name: "VMB1DM", desc: "1 dimmer (with physical button) module", part: 1 },
    { code: "0x08", name: "VMB4RY", desc: "4 relays (with physical buttons) module", part: 4 },
    { code: "0x08", name: "VMB4RY", desc: "4 relays (with physical buttons) module", part: 4 },
    { code: "0x09", name: "VMB2BL", desc: "2 blind (with physical button) module", part: 2 },
    { code: "0x0B", name: "VMB4PD", desc: "8 (2x4) push buttons with display module", part: 8 },
    { code: "0x0C", name: "VMB1TS", desc: "1 temperature sensor module", part: 1 },
    { code: "0x0D", name: "VMB1TH", desc: "-never produced-", part: 0 },
    { code: "0x0E", name: "VMB1TC", desc: "1 temperature sensor module", part: 1 },
    { code: "0x0F", name: "VMB1LED", desc: "1 LED controller module", part: 1 },
    { code: "0x10", name: "VMB4RYLD", desc: "4 relays (common power source) module", part: 4 },
    { code: "0x11", name: "VMB4RYNO", desc: "4 relays module", part: 4 },
    { code: "0x12", name: "VMB4DC", desc: "4 channels controller (0..10v) module", part: 4 },
    { code: "0x14", name: "VMBDME", desc: "1 dimmer (electronic transformer load) module", part: 1 },
    { code: "0x15", name: "VMBDMI", desc: "1 dimmer (inductive load) module", part: 1 },
    { code: "0x16", name: "VMB8PBU", desc: "8 push buttons (different form factor) module", part: 8 },
    { code: "0x17", name: "VMB6BPN", desc: "6 push buttons (Niko compatible) module", part: 6 },
    { code: "0x18", name: "VMB2PBAN", desc: "2 push buttons (Niko compatible) module", part: 2 },
    { code: "0x18", name: "VMB2PBN", desc: "2 push buttons (Niko compatible) module", part: 2 },
    { code: "0x1A", name: "VMB4RF", desc: "4 channels wireless remote module", part: 4 },
    { code: "0x1B", name: "VMB1RYNO", desc: "1 relay module", part: 1 },
    { code: "0x1C", name: "VMB1BLE", desc: "1 blind module", part: 1 },
    { code: "0x1D", name: "VMB2BLE", desc: "2 blind module", part: 2 },
    { code: "0x1E", name: "VMBGP1", desc: "1 push glass button module", part: 1 },
    { code: "0x1F", name: "VMBGP2", desc: "2 push glass button module", part: 2 },
    { code: "0x20", name: "VMBGP4", desc: "4 push glass button module", part: 4 },
    { code: "0x25", name: "VMBGPTC", desc: "", part: 1 },
    { code: "0x28", name: "VMBGPOD", desc: "", part: 1 },
    { code: "0x29", name: "VMB1RYNOS", desc: "", part: 1 },
    { code: "0x2A", name: "VMBPIRM", desc: "Infra Red sensor", part: 1 },
    { code: "0x2B", name: "VMBPIRC", desc: "Infra Red sensor", part: 1 },
    { code: "0x2C", name: "VMBPIRO", desc: "Infra Red sensor", part: 1 },
    { code: "0x2D", name: "VMBGP4PIR", desc: "4 push buttons + Infra Red sensor", part: 4 },
    { code: "0x2E", name: "VMB1BLS", desc: "", part: 1 },
    { code: "0x2F", name: "VMBDMIR", desc: "", part: 1 },
    { code: "0x30", name: "VMBRF8RXS", desc: "", part: 8 }
    ];
//#endregion

//#region VMBfunction AS Velbus functions (code, name)
const VMBfunction =
    [{ code: 0x00, name: "VMBInputStatusResponse" },
    { code: 0x01, name: "VMBRelayOff" },
    { code: 0x02, name: "VMBRelayOn" },
    { code: 0x03, name: "VMBRelayTimer" },
    { code: 0x04, name: "VMBBlindHalt" },
    { code: 0x05, name: "VMBBlindUp" },
    { code: 0x06, name: "VMBBlindDown" },
    { code: 0x06, name: "VMBDimmerValueSet" },
    { code: 0x0D, name: "VMBStartBlink" },
    { code: 0x0F, name: "VMBSliderStatusRequest" },
    { code: 0x12, name: "VMBUnlockChannel" },
    { code: 0x13, name: "VMBUnlockChannel" },
    { code: 0x66, name: "VMB update1" },
    { code: 0x67, name: "VMB update2" },
    { code: 0x68, name: "VMB update3" },
    { code: 0xAF, name: "VMBSetDaylightSaving" },
    { code: 0xB1, name: "VMBDisableChannelProgram" },
    { code: 0xB2, name: "VMBEnableChannelProgram" },
    { code: 0xB3, name: "VMBSelectProgram" },
    { code: 0xB7, name: "VMBDateStatus" },
    { code: 0xB9, name: "VMBSensorSettingsPart4" },
    { code: 0xBB, name: "VMBSensorConfigData" },
    { code: 0xBD, name: "VMBCounterStatusRequest" },
    { code: 0xBE, name: "VMBCounterStatusResponse" },
    { code: 0xBF, name: "undefined" },
    { code: 0xC6, name: "VMBSensorSettingsPart3" },
    { code: 0xC9, name: "VMBReadMemBlock" },
    { code: 0xCA, name: "VMBWriteMemBlock" },
    { code: 0xCB, name: "VMBMemDumpRequest" },
    { code: 0xCC, name: "VMBTransmitMemBlock" },
    { code: 0xD0, name: "VMBLCDTextRequest" },
    { code: 0xD1, name: "VMBButtonTimer" },
    { code: 0xD2, name: "VMBLCDBackLightDefault" },
    { code: 0xD3, name: "VMBButtonBackLightDef" },
    { code: 0xD4, name: "VMBButtonBackLight" },
    { code: 0xD5, name: "VMBBackContrastRequest" },
    { code: 0xD7, name: "VMBRealTimeClockRequest" },
    { code: 0xD8, name: "VMBRealTimeClockSet" },
    { code: 0xD9, name: "VMBErrorCountRequest" },
    { code: 0xDA, name: "VMBErrorCountResponse" },
    { code: 0xE4, name: "VMBTempReset" },
    { code: 0xE5, name: "VMBTempRequest" },
    { code: 0xE6, name: "VMBTempResponse" },
    { code: 0xE7, name: "-" },
    { code: 0xE8, name: "VMBSensorSettingsPart1" },
    { code: 0xE9, name: "VMBSensorSettingsPart2" },
    { code: 0xEA, name: "VMBSensorStatusResponse" },
    { code: 0xEC, name: "VMBTransmitBlindStatus" },
    { code: 0xED, name: "VMB7InputStatusResponse" },
    { code: 0xEE, name: "VMBTransmitDimStatus" },
    { code: 0xEF, name: "VMBNameResquest" },
    { code: 0xF0, name: "VMBNamePart1" },
    { code: 0xF1, name: "VMBNamePart2" },
    { code: 0xF2, name: "VMBNamePart3" },
    { code: 0xF3, name: "VMBLCDBackLightSet" },
    { code: 0xF4, name: "VMBLedUpdate" },
    { code: 0xF5, name: "VMBLedClear" },
    { code: 0xF6, name: "VMBLedSet" },
    { code: 0xF7, name: "VMBBlinkSlow" },
    { code: 0xF8, name: "VMBBlinkFast" },
    { code: 0xF9, name: "VMBBlinkVeryFast" },
    { code: 0xFA, name: "VMBStatusRequest" },
    { code: 0xFB, name: "VMBTransmitRelayStatus" },
    { code: 0xFC, name: "VMBWriteMem" },
    { code: 0xFD, name: "VMBReadMem" },
    { code: 0xFE, name: "VMBTransmitMem" },
    { code: 0xFF, name: "VMBModuleTypeRequest" }];
//#endregion

/**
 * Checksum is able to calculate the frame checksum
 * @param {Buffer} frame a Velbus frame from 0F xxxxx to 04
 * @param {number} full number removed from frame length (default=1)
 * @returns {number} sum all bytes then XOR FF + 1
 */
const CheckSum = (frame, full = 1) => {
    let crc = 0;
    for (let i = 0; i < frame.length - 1 - full; i++) {
        crc = crc + (frame[i] & 0xFF);
    }
    crc = crc ^ 0xFF;
    crc = crc + 1;
    crc = crc & 0xFF;
    return crc;
}

// Function Cut : split messages that are in the same frame 0F...msg1...040F...msg2...04
const Cut = (data) => {
    let table = [];
    let longueur, VMBSize;
    // search for 0x0F header, then look at size byte and check if end byte is in good place
    for (let i = 0; i < data.length; i++) {
        if (data[i] == 0x0F && i + 3 < data.length) {
            longueur = data[i + 3];
            VMBSize = longueur + 3 + 1 + 1;     // message length + offset 3 + checksum + end byte
            if (data[i + VMBSize] == 0x04) {
                // push de i à VMBSize dans tableau
                // console.log("trame OK à position ",i, " longueur ", VMBSize);
                table.push(data.slice(i, i + VMBSize + 1));     // slice utilise position début et position fin
                i = i + VMBSize;
            } else {
                // console.log("octet à longueur VMBSize : ",data[i+VMBSize])
            }
        }
    }
    return table;
}

/**
 * convert a buffer into a table containing hexa code (2 chars) for each byte
 * @param {Array} donnees 
 * @returns Hexadecimal string
 */
const toHexa = (donnees) => {
    if (donnees !== undefined) {
        let c = '';
        let dhex = [];
        for (const donnee of donnees) {
            c = donnee.toString(16).toUpperCase();
            if (c.length < 2) c = '0' + c;
            dhex.push(c);
        }
        return dhex;
    } else { return "" }
}

// convert a binary value into a string with number or . (ex 5 => 1.4.....)
const toButtons = (valeur, nb) => {
    let response = "";
    let x = 1;
    for (let t = 1; t < (nb + 1); t++) {
        if (valeur & x) {
            response += t.toString();
        } else {
            response += ".";
        }
        x = x << 1
    }
    return response;
}

/**
 * send back name module from code module
 * @param {Number} code 
 * @returns name of module
 */
const getName = (code) => {
    let result = modules.find(item => Number(item.code) == code);
    if (result !== undefined) return result.name;
    return "unknown";
};

/**
 * send back code module from name module
 * @param {String} name 
 * @returns code of module
 */
const getCode = (name) => {
    for (let item of modules) {
        if (item.name == name) return Number(item.code);
    }
    return 0x00;
};

/**
 * send back description module from code or name module
 * @param {*} element String or Number. Searched element
 * @returns Description for the item searched
 */
const getDesc = (element) => {
    // if string then search by name...
    if (typeOf(element) == string) {
        for (let item of modules) {
            if (item.name == element) return item.desc
        }
        return "unknown"
    } else {
        // ... search by code
        for (let item of modules) {
            if (Number(item.code) == element) return item.desc
        }
        return "unknown"
    }

}

// send back function name module from function code module
const getFunction = (code) => {
    let result = VMBfunction.find(item => Number(item.code) == code)
    if (result !== undefined) return result.name
    return "unknown"
}

const analyze2Texte = (element) => {
    let fctVelbus = Number(element[4])
    let lenVelbus = element[3] & 0x0F
    let adrVelbus = element[2]
    let texte = "Capteur : " + adrVelbus.toString(16) + "  " + getFunction(fctVelbus) + " (" + fctVelbus.toString(16).toUpperCase() + ") ► "
    let buttonOn = ""

    switch (fctVelbus) {
        case 0x00:
            buttonOn = toButtons(element[5], 8)
            texte += " [" + buttonOn + "]"
            break;
        case 0xBE:
            // Read VMB7IN counter
            let division = (element[5] >> 2) * 100;
            let part = (element[5] & 0x7);   // part is 0 to 3
            let compteur = (element[6] * 0x1000000 + element[7] * 0x10000 + element[8] * 0x100 + element[9]) / division;
            compteur = Math.round(compteur * 1000) / 1000;
            let conso = 0;
            if (element[10] != 0xFF && element[11] != 0xFF) {
                conso = Math.round((1000 * 1000 * 3600 / (element[10] * 256 + element[11])) / division * 10) / 10;
            }
            texte += "  " + compteur + " KW, (Instantané :" + conso + " W)";
            break;
        case 0xE6:
            texte += "  " + Number(element[5]) / 2 + "°C";
            break;
        case 0xEA:
            texte += "  " + Number(element[8]) / 2 + "°C";
            break;
        case 0xFB:
            buttonOn = toButtons(element[7], 4);
            texte += " [" + buttonOn + "]"
            break;
        default:
            break;
    }

    console.log(texte)
    return texte;

}

/**
 * This method write a Velbus frame to the TCP connexion
 * @param {Buffer} req RAW format Velbus frame
 * @param {*} res not used
 */
const VMBWrite = (req, res) => {
    client.write(req);
}

// ========================= functions VMB RELAY ===================================

/**
 * Function to create frame for changing relay's state on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} state  true or false
 * @returns  Velbus frame ready to emit
 */
const relaySet = (adr, part, state) => {
    let trame = new Uint8Array(8);
    trame[0] = VMB_StartX;
    trame[1] = VMB_PrioHi;
    trame[2] = adr;
    trame[3] = 0x02;    // len
    if (state) trame[4] = 0x02; else trame[4] = 0x01;     // true=ON, false=OFF 
    trame[5] = part;
    trame[6] = CheckSum(trame, 0);
    trame[7] = VMB_EndX;
    return trame;
}

/**
 * Function to create frame for activating relay's state for a delimited time on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} timing  value in second, from 1 to FFFFFF (permanent)
 * @returns  Velbus frame ready to emit
 */
 const relayTimer = (adr, part, timing) => {
    let thigh = timing >> 16 & 0xFF;
    let tmid = timing >> 8 & 0xFF;
    let tlow = timing & 0xFF;
    let trame = new Uint8Array(8);
    trame[0] = VMB_StartX;
    trame[1] = VMB_PrioHi;
    trame[2] = adr;
    trame[3] = 0x05;    // len
    trame[4] = 0x03;
    trame[5] = part;
    trame[6] = thigh;   // timer with 3 bytes
    trame[7] = tmid;
    trame[8] = tlow;
    trame[9] = CheckSum(trame, 0);
    trame[10] = VMB_EndX;
    return trame;
}

// ========================= functions VMB BLIND ====================================
/**
 * Function to create frame for moving UP or DOWN blind on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to move on module (%0011 or %1100 or %1111)
 * @param {int} state 0: moveUP, other moveDOWN
 * @param {int} duration in seconds
 * @returns Velbus frame ready to emit
 */
const blindMove = (adr, part, state, duration = 0) => {
    if (state > 0) { state = 0x05 } else { state = 0x06 }
    if (part == 1) { part = 0x03 }
    else if (part == 2) { part = 0x0C }
    else { part = 0x0F }
    let trame = new Uint8Array(11)
    trame[0] = VMB_StartX
    trame[1] = VMB_PrioHi
    trame[2] = adr
    trame[3] = 0x05   // len
    trame[4] = state
    trame[5] = part
    trame[6] = duration >> 16 & 0xFF
    trame[7] = duration >> 8 & 0xFF
    trame[8] = duration & 0xFF
    trame[9] = CheckSum(trame, 0)
    trame[10] = VMB_EndX
    return trame
}
const blindStop = (adr, part) => {
    if (part == 1) part = 0x03
    if (part == 2) part = 0x0C
    if (part > 2) part = 0x0F
    let trame = new Uint8Array(8)
    trame[0] = VMB_StartX
    trame[1] = VMB_PrioHi
    trame[2] = adr
    trame[3] = 0x02     // len
    trame[4] = 0x04     // stop
    trame[5] = part
    trame[6] = CheckSum(trame, 0)
    trame[7] = VMB_EndX
    return trame
}
const discover = (adr) => {
    let trame = new Uint8Array(6)
    trame[0] = VMB_StartX
    trame[1] = VMB_PrioLo
    trame[2] = adr
    trame[3] = 0x40     // scan
    trame[4] = CheckSum(trame, 0)
    trame[5] = VMB_EndX
    return trame
}

// ========================= SERVER PART ===========================================
/* This part of code start a TCP connexion to a Velbus TCP server: here you can 
 * transmit to (or receive from) Velbus BUS. 
*/
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
    console.log("connected to Velbus server > ", client.remoteAddress, ":", client.remotePort);
})

/**
 * each time Velbus frames are received, this function create a list and analyze them
 */
client.on('data', (data) => {
    let entry = {}
    let desc = '', d = '', crc = 0

    // RAW data could have multiple Velbus message
    Cut(data).forEach(element => {
        desc = analyze2Texte(element);
        d = toHexa(element);
        crc = CheckSum(element);
        entry = { "RAW": element, "HEX": d, "CRC": crc, "DESCRIPTION": desc }
        VMBmsgList.push(entry)
        VMBEmitter.emit("msg", entry);
    })
});
client.on('close', () => {
    console.log("Closing velbus server connexion");
});



module.exports = {
    VMBEmitter,
    VelbusStart,
    CheckSum,
    Cut,
    toHexa,
    getName, getCode, getDesc,
    VMBWrite,
    relaySet,
    blindMove, blindStop,
    discover,
    analyze2Texte
}

