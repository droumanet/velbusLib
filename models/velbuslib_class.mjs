 import * as VMB from '../modules/velbuslib_constant.js'
 
 class VMBsubmodule {
	address = 0
	part = 0
	id = ""			// adr-part : part always be 1 to n, ex. VMB1TS would be 128-1
	name = ""
	type = 0		// exact type module
	fct=""			// function like 'temp', 'energy', 'relay', 'lamp', 'dimmer', blind', 'motor'...
	status = {}		// object containing the specific status
	group = []		// could be multiple : room, floor, orientation (west, north...) or some useful tags
	power = 0		// consumption in mA

	constructor(address, part, key, fct, status) {
		this.address = address
		this.part = part
		this.id = key
		this.fct = fct
		this.status = status
	}
}

class VMBmodule {
	address = 0
	type = 0
	partNumber = 0
	description = ""
	location = ""
	buildWeek = 0
	buildYear = 0
	busErrorTX = 0
	busErrorRX = 0
	busErrorOFF = 0

	constructor(address, type) {
		this.address = address
		this.type = type


	}
}

export {
	VMBmodule, VMBsubmodule
}