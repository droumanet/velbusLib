// ==================================================================================
// =                       functions VMB TEMPERATURE                                =
// ==================================================================================

import {VMBTypemodules, VMBfunction, VMB_StartX, VMB_EndX, VMB_PrioHi, VMB_PrioLo, CheckSum} from './velbuslib_constant.js'

const FrameRequestTemp = (addr, part=1, interval=0) => {
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


export {
    FrameRequestTemp

}