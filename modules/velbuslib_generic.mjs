// ==================================================================================
// =                       functions VMB TEMPERATURE                                =
// ==================================================================================

import {VMBTypemodules, VMBfunction, VMB_StartX, VMB_EndX, VMB_PrioHi, VMB_PrioLo, CheckSum} from './velbuslib_constant.js'

function FrameRequestName (addr, part) {
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

/**
 * scanModule Create a frame to force module to answer
 * @param {*} adr Address of module
 * @returns Velbus frame ready to emit
 */
 function FrameModuleScan(adr) {
	let trame = new Uint8Array(6);
	trame[0] = VMB_StartX;
	trame[1] = VMB_PrioLo;
	trame[2] = adr;
	trame[3] = 0x40;    // len 0, RTR on
	trame[6] = CheckSum(trame, 0);
	trame[7] = VMB_EndX;
	return trame;
}

/**
 * synchroTime Create a frame able to synchronize time on Velbus modules
  * @param {byte} day value between 0 (monday) and 6 (sunday). Use VelbusDay(d) rather d.getDay() because Velbus offset
  * @param {byte} hour value as 24h format
  * @param {byte} minuts value between 0 and 59
  * @returns Velbus frame ready to emit
  * Nota : if one transmitted value is wrong, then the current system date (server) replace them (be worry with timezone)
 */
 function FrameTransmitTime(day, hour, minuts) {
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
 function FrameRequestTime() {
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

export {FrameModuleScan, FrameRequestName, FrameTransmitTime, FrameRequestTime}