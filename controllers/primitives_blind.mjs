// ============================================================================================================
// =                                        functions VMB BLIND                                               =
// ============================================================================================================
// [ ] Write this module as CtrlSensor.js


/**
 * Function to create frame for moving UP or DOWN blind on a module
 * @param {byte} adr address of module on the bus
 * @param {int} part part to move on module (%0011 or %1100 or %1111)
 * @param {int} state 0: moveUP, other moveDOWN
 * @param {int} duration in seconds, default 30 seconds
 * @returns Velbus frame ready to emit
 */
 function blindMove(adr, part, state, duration = 30) {
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
function blindStop(adr, part) {
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

function blindHello (name) {
    console.log("Hello ", name)
	return name.length
}

// ==========================================================================================================

export {
    blindMove,
    blindStop,
    blindHello
}