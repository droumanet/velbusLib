export class VMBmodule {
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