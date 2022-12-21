/**
 * @author David ROUMANET <golfy@free.fr>
 * @description VELBUS Library to use with Velbus NodeJS projects
 * @version 1.0
 * @license CommonCreative BY.
 * information from https://github.com/velbus/moduleprotocol
 */

// [ ] Etat Relais
// [ ] Fonctions relais
// [ ] Liste bouton
// [ ] Appui bouton
// [ ] Etat dimmer
// [ ] Fonctions dimmer
// [ ] Etat volet
// [x] Etat température


/* ====================================================================================================================
	Velbus frame Format 0F (FB|F8) @@ LL ( FT B2 ... Bn) ## 04 
  --------------------------------------------------------------------------------------------------------------------
 |    0    |   1  |  2   |    3    |  4   |   5   |   6   |   7   |   8   |  ...  |   10  |   11  |     x    |   x+1  |
  --------------------------------------------------------------------------------------------------------------------
 | VMBStrt | Prio | Addr | RTR/Len | Func | Byte2 | Byte3 | Byte4 | Byte5 |  ...  | Byte7 | Byte8 | Checksum | VMBEnd |
  --------------------------------------------------------------------------------------------------------------------
  (1) Len = RTR/Len & 0x0F
  (2) RTR = 1 only for Module Type Request (reception). RTR is Remote Transmit Request
 =================================================================================================================== */

import EventEmitter from 'events';
import { VMBmodule, VMBsubmodule } from '../models/velbuslib_class.mjs';
import * as VMB from './velbuslib_constant.js'
import { FrameModuleScan, FrameRequestName, FrameTransmitTime, FrameRequestTime, CheckSum } from './velbuslib_generic.mjs';
import { FrameRequestMove, FrameRequestStop, FrameHello } from './velbuslib_blind.mjs'
import { FrameRequestTemp } from './velbuslib_temp.mjs';
import { FrameRequestCounter } from './velbuslib_input.mjs';


const VMBEmitter = new EventEmitter()

// General list for event
let moduleList = new Map()
let VMBNameStatus = new Map()
let VMBTempStatus = new Map()
let VMBEnergyStatus = new Map()

// ============================================================================================================
// =                                    Functions for internal use                                            =
// ============================================================================================================



/**
 * Cut split messages that are in the same frame. Example 0F...msg1...04 0F...msg2...04
 * @param {*} data 
 * @returns 
 */
const Cut = (data) => {
	let table = [];
	let longueur, VMBSize;
	let i = 0;
	// search for 0x0F header, then look at size byte and check if end byte is in good place
	while (i < data.length) {
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
		i++;
	}
	return table;
}

/**
 * toHexa convert a buffer into a table containing hexa code (2 chars) for each byte
 * @param {Array} donnees 
 * @returns Hexadecimal string
 */
function toHexa(donnees) {
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
/**
 * toButtons convert a binary value into an array with active bit (ex. 0b00110 => [2,4])
 * @param {*} valeur 
 * @param {*} nb 
 * @returns array of active button's number
 */
function toButtons(valeur, nb) {
	let response = [];
	let x = 1;
	for (let t = 1; t < (nb + 1); t++) {
		if (valeur & x) {
			response.push(t);
		}
		x = x << 1
	}
	return response;
}

// Convert Binary digit to human part number (0b0100 => 3)
function Bin2Part(binValue, offset = 0) {
	for (let t = 1; t < 9; t++) {
		if (2 ** (t - 1) == binValue) return t + offset
	}
	return offset
}
// Convert humar part number to binary element (5 => 0b10000)
function Part2Bin(partValue) {
	return 2 ** (partValue - 1)
}

function localModuleName(k) {
	let myModule = VMBNameStatus.get(k)
	if (myModule == undefined) return "****"
	return myModule.name
}

function resume() {
	return moduleList;
}

function checkName(element) {
	console.log("-------------- NAME " + element[4].toString(16) + " ------------------")
	let key = element[2] + "-" + Bin2Part(element[5])
	let fctVelbus = element[4]
	let myModule = VMBNameStatus.get(key)
	console.log("🔁 VMBNameStatus.get(" + key + ")=", myModule)
	let max = 6
	if (myModule == undefined) {
		VMBNameStatus.set(key, { "address": element[2], "name": "", "n1": "", "n2": "", "n3": "", "flag": 0 })
		myModule = VMBNameStatus.get(key)
	}
	if (fctVelbus == 0xF2) max = 4

	let n = new Array()
	let idx = fctVelbus - 0xF0
	let flag = 2 ** idx
	let f = myModule.flag

	n[0] = myModule.n1
	n[1] = myModule.n2
	n[2] = myModule.n3
	n[idx] = ""

	// console.log("🔁 NAME", key, element[5], "Idx:", idx, "["+n[0]+"]["+n[1]+"]["+n[2]+"]")
	for (let t = 0; t < max; t++) {
		if (element[6 + t] != 0xFF) {
			n[idx] = n[idx] + String.fromCharCode(element[6 + t])
		}
	}

	// in case name is complete (flag = 100 | 010 | 001)
	if ((f | flag) == 0b111) {
		let m = moduleList.get(key)
		if (m != undefined) {
			m.name = n[0] + n[1] + n[2]
			moduleList.set(key, m)
			console.log("submodule " + key + " is named " + m.name)
		}
	}
	VMBNameStatus.set(key, { "address": element[2], "name": n[0] + n[1] + n[2], "n1": n[0], "n2": n[1], "n3": n[2], "flag": flag | f })
}

// debug function
function analyze2Texte(element) {
	let fctVelbus = Number(element[4])
	let adrVelbus = element[2]
	let texte = "@:" + adrVelbus.toString(16) + " Fct:" + fctVelbus.toString(16).toUpperCase() + "(" + VMB.getFunctionName(fctVelbus) + ") ► "
	let buttonOn = ""
	let keyModule = ""

	switch (fctVelbus) {
		case 0x00:
			buttonOn = toButtons(element[5], 8)
			texte += " [" + buttonOn + "]"
			break;
		case 0xBE:
			// Read VMB7IN counter
			let division = (element[5] >> 2) * 100;
			let part = (element[5] & 0x3);

			// part is 0 to 3 but keyModule is 1 to 4
			keyModule = element[2] + "-" + (part + 1)
			let compteur = (element[6] * 0x1000000 + element[7] * 0x10000 + element[8] * 0x100 + element[9]) / division;
			compteur = Math.round(compteur * 1000) / 1000;
			let conso = 0;
			if (element[10] != 0xFF && element[11] != 0xFF) {
				conso = Math.round((1000 * 1000 * 3600 / (element[10] * 256 + element[11])) / division * 10) / 10;
			}
			texte += localModuleName(keyModule) + " " + compteur + " KW, (Inst. :" + conso + " W) ";
			break;
		case 0xE6:
			keyModule = adrVelbus + "-1"
			texte += localModuleName(keyModule) + " " + TempCurrentCalculation(element) + "°C";
			break;
		case 0xEA:
			texte += localModuleName(keyModule) + " " + Number(element[8]) / 2 + "°C";
			break;
		case 0xF0:
		case 0xF1:
		case 0xF2:
			checkName(element)
			let key = adrVelbus + "-" + Bin2Part(element[5])
			texte += " Transmit it name '" + VMBNameStatus.get(key).name + "'"
			break
		case 0xFB:
			buttonOn = toButtons(element[7], 4);
			texte += " [" + buttonOn + "]"
			break
		case 0xFF: // Module Type Transmit
			let moduleType = element[5]
			console.log(adrVelbus, "Detected module type ", moduleType)
			// WIP checkList(Address, )
			break
		default:
			break
	}
	return texte
}



// ============================================================================================================
// =                                          functions VMB ALL                                               =
// ============================================================================================================

/**
 * This method write a Velbus frame to the TCP connexion
 * @param {Buffer} req RAW format Velbus frame
 * @param {*} res not used
 */
async function VMBWrite(req) {
	console.log('\x1b[32m', "VelbusLib writing", '\x1b[0m', toHexa(req).join())
	VelbusConnexion.write(req);
	await sleep(10)
}

// Synchronize Velbus with host. If day/hour/minute are wrong (ie. 99) then use system date
function VMBSetTime(day, hour, minute) {
	VMBWrite(FrameTransmitTime(day, hour, minute))
}

// Send a scan on all addresses
function VMBscanAll() {
	let fr
	for (let t = 0; t < 256; t++) {
		fr = FrameModuleScan(t)
		if (t == 0xDB) { console.log(fr, 'CheckSum should be 0xDB') }
		VMBWrite(FrameModuleScan(t))
	}
}

// ==================================================================================
// =                          functions VMB RELAY                                   =
// ==================================================================================

/**
 * Function to create frame for changing relay's state on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} state  optionnal : true (on) or false (off), default false
 * @returns  Velbus frame ready to emit
 */
function relaySet(adr, part, state = false) {
	let trame = new Uint8Array(8);
	trame[0] = StartX;
	trame[1] = PrioHi;
	trame[2] = adr;
	trame[3] = 0x02;    // len
	if (state) trame[4] = 0x02; else trame[4] = 0x01;     // true=ON, false=OFF 
	trame[5] = part;
	trame[6] = CheckSum(trame, 0);
	trame[7] = EndX;
	return trame;
}

/**
 * Function to create frame for activating relay's state for a delimited time on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} timing  value in second, from 1 to FFFFFF (permanent), default 120 seconds
 * @returns  Velbus frame ready to emit
 */
function relayTimer(adr, part, timing = 120) {
	let thigh = timing >> 16 & 0xFF;
	let tmid = timing >> 8 & 0xFF;
	let tlow = timing & 0xFF;
	let trame = new Uint8Array(8);
	trame[0] = StartX;
	trame[1] = PrioHi;
	trame[2] = adr;
	trame[3] = 0x05;    // len
	trame[4] = 0x03;
	trame[5] = part;
	trame[6] = thigh;   // timer with 3 bytes
	trame[7] = tmid;
	trame[8] = tlow;
	trame[9] = CheckSum(trame, 0);
	trame[10] = EndX;
	return trame;
}



// ============================================================================================================
// =                                 functions with Listener                                                  =
// ============================================================================================================
// Basic calculation function are named by Type/Value/Calculation
// Listener are named as 'survey'/Type/'Value'
// Function that return a value are named 'VMBRequest'/Type and read a Map

function EnergyIndexCalculation(msg) {
	let pulse = (msg.RAW[5] >> 2) * 100
	let rawcounter = msg.RAW[6] * 2 ** 24 + msg.RAW[7] * 2 ** 16 + msg.RAW[8] * 2 ** 8 + msg.RAW[9]
	return Math.round(rawcounter / pulse * 1000) / 1000;
}
function EnergyPowerCalculation(msg) {
	let power = 0
	let pulse = (msg.RAW[5] >> 2) * 100
	if (msg.RAW[10] != 0xFF && msg.RAW[11] != 0xFF) {
		power = Math.round((1000 * 1000 * 3600 / (msg.RAW[10] * 256 + msg.RAW[11])) / pulse * 10) / 10;
	}
	return power
}

// Function to calculate temperature with high precision
function TempCurrentCalculation(msg) {
	// E6 (Transmit Temp) or EA (Sensor status)
	switch (msg[4]) {
		case 0xE6:
			return msg[5] / 2 - Math.round(((4 - msg[6]) >> 5) * 0.0625 * 10) / 10
		case 0xEA:
			return msg[8] / 2 - Math.round(((4 - msg[9]) >> 5) * 0.0625 * 10) / 10
		default:
			console.error("ERROR with TempCalculation", msg)
			return undefined
	}
}
function TempMinCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return msg[7] / 2 - Math.round(((4 - msg[8]) >> 5) * 0.0625 * 10) / 10
	} else {
		return undefined
	}
}
function TempMaxCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return msg[9] / 2 - Math.round(((4 - msg[10]) >> 5) * 0.0625 * 10) / 10
	} else {
		return undefined
	}
}
function UpdateModule(key, value) {
	let m = moduleList.get(key)
	if (m != undefined) {
		m.status = value
		moduleList.set(key, m)
	}
}


// Function to wait before reading values (async problem)
async function sleep(timeout) {
	await new Promise(r => setTimeout(r, timeout));
}

// 🌡️ GESTION TEMPERATURE
function surveyTempStatus() {
	VMBEmitter.on("TempStatus", (msg) => {
		if (msg.RAW[4] == 0xE6) {
			let currentT = TempCurrentCalculation(msg.RAW)
			let minT = TempMinCalculation(msg.RAW)
			let maxT = TempMaxCalculation(msg.RAW)
			let key = msg.RAW[2] + "-1"
			let status = { "current": currentT, "min": minT, "max": maxT, "timestamp": Date.now() }
			VMBTempStatus.set(key, status)
			UpdateModule(key, status)
			if (VMBNameStatus.get(key) == undefined) {
				VMBWrite(FrameRequestName(msg.RAW[2], 1))
				moduleList.set(key, new VMBsubmodule(msg.RAW[2], 1, key, "temp", status))
			}
			// console.log("Tableau TempStatus : ", VMBTempStatus)
			// console.log("Tableau NameStatus : ", VMBNameStatus)
		}
	})
}
// ☢️ GESTION ENERGIE
function surveyEnergyStatus() {
	VMBEmitter.on("EnergyStatus", (msg) => {
		//console.warn("Energy Message", "Fct:" + msg.RAW[4].toString(16), "@" + msg.RAW[2].toString(16)+"-"+(msg.RAW[5]&3).toString(16))

		// what I want to do when receiving a frame
		if (msg.RAW[4] == 0xBE) {
			let rawcounter = EnergyIndexCalculation(msg)
			let power = EnergyPowerCalculation(msg)
			let addr = msg.RAW[2]
			let part = (msg.RAW[5] & 3) + 1
			let key = addr + "-" + part
			let status = { "index": rawcounter, "power": power, "timestamp": Date.now() }
			VMBEnergyStatus.set(key, status)
			UpdateModule(key, status)
			if (VMBNameStatus.get(key) == undefined) {
				VMBWrite(FrameRequestName(msg.RAW[2], Part2Bin(part)))
				moduleList.set(key, new VMBsubmodule(addr, part, key, "energy", status))
			}
			// console.log("Tableau EnergyStatus : ", VMBEnergyStatus)

		}
	})
}

// 🌡️ GESTION TEMPERATURE
async function VMBRequestTemp(adr, part) {
	let trame = FrameRequestTemp(adr, part);
	VMBWrite(trame);
	await sleep(200);
	let result = VMBTempStatus.get(adr + "-" + part)
	if (result != undefined) return result;
	return { "currentT": 1000, "min": 1000, "max": 1000, "timestamp": Date.now() };

}

async function VMBRequestEnergy(adr, part) {
	let trame;
	if (part < 5) {
		trame = FrameRequestCounter(adr, Part2Bin(part)); // need to change 1 => 1, 2 => 2, 3 => 4 and 4 => 8
		VMBWrite(trame);
		await sleep(200); // VMBEmitter isn't synchronous, need to wait
		let result = VMBEnergyStatus.get(adr + "-" + part)
		if (result != undefined) return result;
		return { "power": undefined, "index": undefined, "timestamp": Date.now() };
	} else {
		// part is 0xF or more
		let tableModule = [];
		trame = FrameRequestCounter(adr, part || 0xF);
		VMBWrite(trame);

		await sleep(200);
		tableModule.push(VMBEnergyStatus.get(adr + "-1"));
		tableModule.push(VMBEnergyStatus.get(adr + "-2"));
		tableModule.push(VMBEnergyStatus.get(adr + "-3"));
		tableModule.push(VMBEnergyStatus.get(adr + "-4"));
		return tableModule;
	}

}

// [ ] Write a function that store the request in a array then,
// [ ] Write a function in receive part, that compare mask & msg and execute callback if true
function VMBSearchMsg(msg, callBackFct, part = 0xFF) {

}


// ============================================================================================================
// =                                           VELBUS SERVER PART                                             =
// ============================================================================================================

let Cnx = { host: "127.0.0.1", port: 8445 }
import net from 'net'
let VelbusConnexion = new net.Socket();
const VelbusStart = (host, port) => {
	Cnx.host = host
	Cnx.port = port
	VelbusConnexion.connect(port, host);
}

let ReconnectTimer
let DisconnectDate


VelbusConnexion.on('connect', () => {
	console.log("  ✅ connected to server > ", VelbusConnexion.remoteAddress, ":", VelbusConnexion.remotePort);
	console.log("--------------------------------------------------------------", '\n\n')
	surveyTempStatus()
	surveyEnergyStatus()

	if (ReconnectTimer != undefined) {
		let duration = ((Date.now() - DisconnectDate) / 1000)
		console.log("Reconnect after ", Math.round(duration / 60), "minuts and", Math.round(duration % 60), "seconds")
		clearInterval(ReconnectTimer)
		ReconnectTimer = undefined
	}

})

VelbusConnexion.once('connect', () => {
	setTimeout(() => {
		// VMBscanAll()
		console.log("⚠️⚠️⚠️ Normally : VMBScanAll() ⚠️⚠️⚠️")
	}, 1000)
})

VelbusConnexion.on('data', (data) => {
	let VMBmessage = {}
	let desc = ''


	// data may contains multiples RAW Velbus frames: send
	Cut(data).forEach(element => {
		desc = analyze2Texte(element);
		console.log(desc, element)	// use as debug

		VMBmessage = { "RAW": element, "Description": desc, "TimeStamp": Date.now(), "Address": element[2], "Function": element[4] }
		VMBEmitter.emit("msg", VMBmessage);

		switch (element[4]) {
			case 0xBE:
				VMBEmitter.emit("EnergyStatus", VMBmessage);
				break;
			case 0xE6:
				VMBEmitter.emit("TempStatus", VMBmessage);
				break;
			default:
				break;
		}

	})
});
VelbusConnexion.on('error', (err) => {
	// FIXME: Check if this part is needed (lost connexion start event 'close') and how...
	console.log("  ❌ Connexion Error! Velbus reusedSocket:", VelbusConnexion.reusedSocket, "   err.code:", err.code)
	if (VelbusConnexion.reusedSocket && err.code === 'ECONNRESET') {
		// retriableRequest();
	}

});
VelbusConnexion.on('close', () => {
	console.log("Closing velbus server connexion");
});
VelbusConnexion.once('close', () => {
	// Try to reconnect every 10 seconds
	console.log("  📶 Try velbus server reconnexion");
	DisconnectDate = Date.now()
	ReconnectTimer = setInterval(() => {
		VelbusConnexion.connect(Cnx.port, Cnx.host)
	}, 10 * 1000)
})
// ==================================================================================

export {
	CheckSum,
	Cut,
	toHexa,
	VMB, resume,
	VMBWrite, VMBSetTime, VMBscanAll,
	relaySet,
	FrameRequestCounter as CounterRequest,
	VelbusStart, VMBEmitter,
	VMBRequestTemp, VMBRequestEnergy
}

