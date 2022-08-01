/**
 * @author David ROUMANET <golfy@free.fr>
 * @description VELBUS Library to use with Velbus NodeJS projects
 * @version 1.0
 * @license CommonCreative BY.
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
	Velbus frame
  --------------------------------------------------------------------------------------------------------------------
 |    0    |   1  |  2   |    3    |  4   |   5   |   6   |   7   |   8   |   9   |   10  |   11  |     x    |   x+1  |
  --------------------------------------------------------------------------------------------------------------------
 | VMBStrt | Prio | Addr | RTR/Len | Func | Byte2 | Byte3 | Byte4 | Byte5 | Byte6 | Byte7 | Byte8 | Checksum | VMBEnd |
  --------------------------------------------------------------------------------------------------------------------
  (1) Len = RTR/Len & 0x0F
  (2) RTR = 1 only for Module Type Request (reception). RTR is Remote Transmit Request
 ======================================================================================================================
*/

import EventEmitter from 'events';
//const EventEmitter = require('events').EventEmitter;
import { write, WriteStream } from "fs"
// const BlindModule = require('./primitives_blind.mjs')	//DEBUG submodules problem to resolve
import {blindHello} from './primitives_blind.mjs'

blindHello("David")

const VMBEmitter = new EventEmitter()

class VMBmodule {
	address = 0
	part = 0
	id = ""			// adr-part : part always be 1 to n, ex. VMB1TS would be 128-1
	name = ""
	type = 0		// exact type module
	fct=""			// function like 'temp', 'energy', 'relay', 'lamp', 'dimmer', blind', 'motor'...
	status = {}		// object containing the specific status
	group = []		// could be multiple : room, floor, orientation (west, north...) or some useful tags

	constructor(address, part, key, fct, status) {
		this.address = address
		this.part = part
		this.id = key
		this.fct = fct
		this.status = status
	}
}

// General list for event
let moduleList = new Map()
let VMBNameStatus = new Map()
let VMBTempStatus = new Map()
let VMBEnergyStatus = new Map()

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
	{ code: 0xEF, name: "VMBNameRequest" },
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

// ============================================================================================================
// =                                    Functions for internal use                                            =
// ============================================================================================================

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

// Function Cut : split messages that are in the same frame. Example 0F...msg1...04 0F...msg2...04
const Cut = (data) => {
	let table = [];
	let longueur, VMBSize;
	let i=0;
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
 * convert a buffer into a table containing hexa code (2 chars) for each byte
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
function toButtons(valeur, nb) {
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

// Convert Binary digit to human part number (0b0100 => 3)
function Bin2Part(binValue, offset=0) {
	for (let t=1; t <9; t++) {
		if (2**(t-1) == binValue) return t+offset
	}
	return offset
}
// Convert humar part number to binary element (5 => 0b10000)
function Part2Bin(partValue) {
	return 2**(partValue-1)
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
function getFunction(code) {
	let result = VMBfunction.find(item => Number(item.code) == code)
	if (result !== undefined) return result.name
	return "unknown"
}
function localModuleName(k) {
	let myModule = VMBNameStatus.get(k)
	if (myModule == undefined) return "****"
	return myModule.name
}

function resume() {
	return moduleList;
}


// debug function
function analyze2Texte(element) {
	let fctVelbus = Number(element[4])
	let lenVelbus = element[3] & 0x0F
	let adrVelbus = element[2]
	let texte = adrVelbus.toString(16) + "  " + getFunction(fctVelbus) + " (" + fctVelbus.toString(16).toUpperCase() + ") ► "
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
			keyModule=element[2]+"-"+(part+1)
			let compteur = (element[6] * 0x1000000 + element[7] * 0x10000 + element[8] * 0x100 + element[9]) / division;
			compteur = Math.round(compteur * 1000) / 1000;
			let conso = 0;
			if (element[10] != 0xFF && element[11] != 0xFF) {
				conso = Math.round((1000 * 1000 * 3600 / (element[10] * 256 + element[11])) / division * 10) / 10;
			}
			texte += "  " +localModuleName(keyModule)+" "+ compteur + " KW, (Instantané :" + conso + " W) ";
			break;
		case 0xE6:
			keyModule=adrVelbus+"-1"
			texte += "  " +localModuleName(keyModule) + " " +TempCurrentCalculation(element) + "°C";
			break;
		case 0xEA:
			texte += "  " +localModuleName(keyModule) + " " + Number(element[8]) / 2 + "°C";
			break;
		case 0xF0:
		case 0xF1:
		case 0xF2:
			let key = adrVelbus+"-"+Bin2Part(element[5])
			let myModule = VMBNameStatus.get(key)
			let max=6
			if (myModule == undefined) {
				VMBNameStatus.set(key, {"address":element[2],"name":"", "n1":"", "n2":"", "n3":"", "flag":0})
				myModule = VMBNameStatus.get(key)
			}
			if (fctVelbus == 0xF2) max=4

			let n=new Array()
			let idx = fctVelbus-0xF0
			let flag = 2**idx
			let f = myModule.flag
	
			n[0]=myModule.n1
			n[1]=myModule.n2
			n[2]=myModule.n3
			n[idx]=""
			
			// console.log("NAME", key, element[5], "Idx:", idx, "["+n[0]+"]["+n[1]+"]["+n[2]+"]")
			for (let t=0; t<max; t++) {
				if (element[6+t] != 0xFF) {
					n[idx]=n[idx]+String.fromCharCode(element[6+t])
				}
			}

			// in case name is complete (flag = 100 | 010 | 001)
			// [X] trying name setting in modules
			if ((f|flag) == 0b111) {
				let m = moduleList.get(key)
				if (m != undefined) {
					m.name = n[0]+n[1]+n[2]
					moduleList.set(key, m)
				}
			}
			VMBNameStatus.set(key, {"address":element[2],"name":n[0]+n[1]+n[2], "n1":n[0], "n2":n[1], "n3":n[2], "flag":flag|f})
			texte += " Transmit it name '"+n[0]+n[1]+n[2]+"'"
			break;
		case 0xFB:
			buttonOn = toButtons(element[7], 4);
			texte += " [" + buttonOn + "]"
			break;
		default:
			break;
	}

	// console.log(texte)
	return texte;
}

/**
 * This method write a Velbus frame to the TCP connexion
 * @param {Buffer} req RAW format Velbus frame
 * @param {*} res not used
 */
async function VMBWrite(req) {
	console.error('\x1b[32m', "VelbusLib writing", toHexa(req).join(), '\x1b[0m')
	VelbusConnexion.write(req);
	await sleep(10)
}

/**
 * Convert JS day to Velbus day (offset problem)
 * @param {date} d date as new Date()
 * @returns 0 for monday (d.getDay() would be 1) to 6 for sunday 
 */
function VelbusDay(d) {
	if (d.getDay() == 0) return 6
	else return d.getDay() - 1
}

// ============================================================================================================
// =                                          functions VMB ALL                                               =
// ============================================================================================================

/**
 * scanModule Create a frame to force module to answer
 * @param {*} adr Address of module
 * @returns Velbus frame ready to emit
 */
function scanModule(adr) {
	let trame = new Uint8Array(6);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = adr;
	trame[3] = 0x40;    // len 0, RTR on
	trame[6] = CheckSum(trame, 0);
	trame[7] = VMB_EndX;
	return trame;
}
const discover = scanModule


/**
 * VMBsyncTime Create a frame able to synchronize time on Velbus modules
  * @returns Velbus frame ready to emit
 */
function VMBsyncTime() {
	let d = new Date()

	let trame = new Uint8Array(9);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = 0x00;
	trame[3] = 0x04;    // len 4, RTR off
	trame[4] = 0xD8     // synchronize time function
	trame[5] = VelbusDay(d)
	trame[6] = d.getHours()
	trame[7] = d.getMinutes()
	trame[8] = CheckSum(trame, 0);
	trame[9] = VMB_EndX;
	console.log("SyncTime send")
	return trame
}

/**
 * synchroTime Create a frame able to synchronize time on Velbus modules
  * @param {byte} day value between 0 (monday) and 6 (sunday). Use VelbusDay(d) rather d.getDay() because Velbus offset
  * @param {byte} hour value as 24h format
  * @param {byte} minuts value between 0 and 59
  * @returns Velbus frame ready to emit
  * Nota : if one transmitted value is wrong, then the current date replace them
 */
function synchroTime(day, hour, minuts) {
	let trame = new Uint8Array(9);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = 0x00;
	trame[3] = 0x04;    // len 4, RTR off
	trame[4] = 0xD8     // synchronize time function
	if (day > -1 && day < 7 && hour > -1 && hour < 24 && minuts > -1 && minuts < 60) {
		trame[5] = day
		trame[6] = hour
		trame[7] = minuts
	} else {
		let d = new Date()
		trame[5] = VelbusDay(d)
		trame[6] = d.getHours()
		trame[7] = d.getMinutes()
	}
	trame[8] = CheckSum(trame, 0);
	trame[9] = VMB_EndX;
	return trame
}

/**
 * Request Real Time Clock status
 * @returns Velbus frame ready to emit
 */
function requestTime() {
	let trame = new Uint8Array(5);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = 0x00;
	trame[3] = 0x01;    // len 1, RTR off
	trame[4] = 0xD7;    // request time function
	trame[5] = CheckSum(trame, 0);
	trame[6] = VMB_EndX;
	return trame;
}

function requestName (addr, part) {
	let trame = new Uint8Array(8);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = addr;
	trame[3] = 0x02;    // len 1, RTR off
	trame[4] = 0xEF;     // request name function
	trame[5] = part;
	trame[6] = CheckSum(trame, 0);
	trame[7] = VMB_EndX;
	return trame;
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
 * @param {*} timing  value in second, from 1 to FFFFFF (permanent), default 120 seconds
 * @returns  Velbus frame ready to emit
 */
function relayTimer(adr, part, timing = 120) {
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


// ==================================================================================
// =                       functions VMB TEMPERATURE                             =
// ==================================================================================

function TempRequest(addr, part=1, interval=0) {
	let trame = new Uint8Array(8);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = addr;
	trame[3] = 0x02;    // len 1, RTR off
	trame[4] = 0xE5;     // request Temp function
	trame[5] = interval;
	trame[6] = CheckSum(trame, 0);
	trame[7] = VMB_EndX;
	return trame;
}

// ==================================================================================
// =                       functions VMB ENERGY COUNTER                             =
// ==================================================================================

/**
 * Function to create frame for changing relay's state on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} state  optionnal : true (on) or false (off), default false
 * @returns  Velbus frame ready to emit
 */
function CounterRequest(adr, part) {
	let trame = new Uint8Array(9);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = adr;
	trame[3] = 0x03;    // len
	trame[4] = 0xBD;    // Counter Status Request
	trame[5] = part;
	trame[6] = 0;
	trame[7] = CheckSum(trame, 0);
	trame[8] = VMB_EndX;
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
			return msg[5]/2 - Math.round(((4-msg[6])>>5)*0.0625*10)/10
		case 0xEA:
			return msg[8]/2 - Math.round(((4-msg[9])>>5)*0.0625*10)/10
		default:
			console.error("ERROR with TempCalculation",msg)
			return undefined
	}
}
function TempMinCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return msg[7]/2 - Math.round(((4-msg[8])>>5)*0.0625*10)/10
	} else {
		return undefined
	}
}
function TempMaxCalculation(msg) {
	// E6 (Transmit Temp)
	if (msg[4] == 0xE6) {
		return msg[9]/2 - Math.round(((4-msg[10])>>5)*0.0625*10)/10
	} else {
		return undefined
	}
}
function UpdateModule(key, value) {
	let m=moduleList.get(key)
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
			let status = { "current": currentT, "min": minT, "max":maxT, "timestamp": Date.now() }
			VMBTempStatus.set(key, status)
			UpdateModule(key, status)
			if (VMBNameStatus.get(key) == undefined) {
				VMBWrite(requestName(msg.RAW[2], 1))
				moduleList.set(key, new VMBmodule(msg.RAW[2], 1, key, "temp", status))
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
			let part = (msg.RAW[5] & 3)+1
			let key = msg.RAW[2] + "-" + part
			let status = { "index": rawcounter, "power": power, "timestamp": Date.now() }
			VMBEnergyStatus.set(key, status)
			UpdateModule(key, status)
			if (VMBNameStatus.get(key) == undefined) {
				VMBWrite(requestName(msg.RAW[2], Part2Bin(part)))
				moduleList.set(key, new VMBmodule(msg.RAW[2], 1, key, "energy", status))
			}
			// console.log("Tableau EnergyStatus : ", VMBEnergyStatus)

		}
	})
}

// 🌡️ GESTION TEMPERATURE
async function VMBRequestTemp(adr, part) {
	let trame = TempRequest(adr, part);
	VMBWrite(trame);
	await sleep(200);
	if (VMBTempStatus.get(adr + "-" + part) != undefined)
		return VMBTempStatus.get(adr + "-" + part);
	return { "currentT": 1000, "min": 1000, "max": 1000, "timestamp": Date.now() };

}

async function VMBRequestEnergy(adr, part) {
	let trame;
	if (part < 5) {
		trame = CounterRequest(adr, Part2Bin(part)); // need to change 1 => 1, 2 => 2, 3 => 4 and 4 => 8
		VMBWrite(trame);
		await sleep(200); // VMBEmitter isn't synchronous, need to wait
		return VMBEnergyStatus.get(adr + "-" + part);
	} else {
		// part is 0xF or more
		let tableModule = [];
		trame = CounterRequest(adr, part || 0xF);
		VMBWrite(trame);

		await sleep(200);
		tableModule.push(VMBEnergyStatus.get(adr + "-1"));
		tableModule.push(VMBEnergyStatus.get(adr + "-2"));
		tableModule.push(VMBEnergyStatus.get(adr + "-3"));
		tableModule.push(VMBEnergyStatus.get(adr + "-4"));
		return tableModule;
	}

}



// ============================================================================================================
// =                                           VELBUS SERVER PART                                             =
// ============================================================================================================

// see VelbusServer.js 
import net from 'net'
import { isUndefined } from 'util';
// const { isUndefined } = require('util');
let VelbusConnexion = new net.Socket();
const VelbusStart = (host, port) => {
	VelbusConnexion.connect(port, host);
}

VelbusConnexion.on('connect', () => {
	console.log("connected to server > ", VelbusConnexion.remoteAddress, ":", VelbusConnexion.remotePort);
	console.log("--------------------------------------------------------------", '\n\n')
	surveyTempStatus()
	surveyEnergyStatus()
})

VelbusConnexion.on('data', (data) => {
	let VMBmessage = {}
	let desc = ''


	// data may contains multiples RAW Velbus frames: send
	Cut(data).forEach(element => {
		desc = analyze2Texte(element);
		console.log(desc)	// use as debug

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
VelbusConnexion.on('close', () => {
	console.log("Closing velbus server connexion");
});
// ==================================================================================

export {
	CheckSum,
	Cut,
	toHexa,
	getName, getCode, getDesc, resume,
	VMBWrite, requestName,
	relaySet,
	CounterRequest, blindHello,
	// BlindModule.blind, blindStop, // DEBUG 
	discover,
	analyze2Texte,
	VelbusStart, VMBEmitter,
	VMBsyncTime, synchroTime,
	VMBRequestTemp, VMBRequestEnergy
}

