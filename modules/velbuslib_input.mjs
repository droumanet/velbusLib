
// ==================================================================================
// =                       functions VMB ENERGY COUNTER                             =
// ==================================================================================

import {VMBTypemodules, VMBfunction, VMB_StartX, VMB_EndX, VMB_PrioHi, VMB_PrioLo, CheckSum} from './velbuslib_constant.js'

/**
 * Function to create frame for changing relay's state on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to change on module
 * @param {*} state  optionnal : true (on) or false (off), default false
 * @returns  Velbus frame ready to emit
 */
 function FrameRequestCounter(adr, part) {
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

export {
    FrameRequestCounter
}