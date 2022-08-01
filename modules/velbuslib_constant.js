// frame part
export const VMB_StartX = 0x0F;
export const VMB_EndX = 0x04;
export const VMB_PrioHi = 0xF8;
export const VMB_PrioLo = 0xFB;

//#region modules AS Modules (code, name, desc)
export let VMBTypemodules    = 
[{code : "0x01", name :  "VMB8PB", desc : "8 simple push buttons module"},
 {code : "0x02", name :  "VMB1RY",  desc : "1 relay (with physical button) module"},
 {code : "0x03", name :  "VMB1BL",  desc : "1 blind (with physical button) module"},
 {code : "0x05", name :  "VMB6IN",  desc : "6 inputs module"},
 {code : "0x07", name :  "VMB1DM",  desc : "1 dimmer (with physical button) module"},
 {code : "0x08", name :  "VMB4RY",  desc : "4 relays (with physical buttons) module"},
 {code : "0x08", name :  "VMB4RY",  desc : "4 relays (with physical buttons) module"},
 {code : "0x09", name :  "VMB2BL",  desc : "2 blind (with physical button) module"},
 {code : "0x0B", name :  "VMB4PD",  desc : "8 (2x4) push buttons with display module"},
 {code : "0x0C", name :  "VMB1TS",  desc : "1 temperature sensor module"},
 {code : "0x0D", name :  "VMB1TH",  desc : "-never produced-"},
 {code : "0x0E", name :  "VMB1TC",  desc : "1 temperature sensor module"},
 {code : "0x0F", name :  "VMB1LED",  desc : "1 LED controller module"},
 {code : "0x10", name :  "VMB4RYLD",  desc : "4 relays (common power source) module"},
 {code : "0x11", name :  "VMB4RYNO",  desc : "4 relays module"},
 {code : "0x12", name :  "VMB4DC",  desc : "4 channels controller (0..10v) module"},
 {code : "0x14", name :  "VMBDME",  desc : "1 dimmer (electronic transformer load) module"},
 {code : "0x15", name :  "VMBDMI",  desc : "1 dimmer (inductive load) module"},
 {code : "0x16", name :  "VMB8PBU",  desc : "8 push buttons (different form factor) module"},
 {code : "0x17", name :  "VMB6BPN",  desc : "6 push buttons (Niko compatible) module"},
 {code : "0x18", name :  "VMB2PBAN",  desc : "2 push buttons (Niko compatible) module"},
 {code : "0x18", name :  "VMB2PBN",  desc : "2 push buttons (Niko compatible) module"},
 {code : "0x1A", name :  "VMB4RF",  desc : "4 channels wireless remote module"},
 {code : "0x1B", name :  "VMB1RYNO",  desc : "1 relay module"},
 {code : "0x1C", name :  "VMB1BLE",  desc : "1 blind module"},
 {code : "0x1D", name :  "VMB2BLE",  desc : "2 blind module"},
 {code : "0x1E", name :  "VMBGP1",  desc : "1 push glass button module"},
 {code : "0x1F", name :  "VMBGP2",  desc : "2 push glass button module"},
 {code : "0x20", name :  "VMBGP4",  desc : "4 push glass button module"},
 {code : "0x25", name :  "VMBGPTC", desc : ""},
 {code : "0x28", name :  "VMBGPOD", desc : ""},
 {code : "0x29", name :  "VMB1RYNOS", desc : ""},
 {code : "0x2A", name :  "VMBPIRM", desc : "Infra Red sensor"},
 {code : "0x2B", name :  "VMBPIRC", desc : "Infra Red sensor"},
 {code : "0x2C", name :  "VMBPIRO", desc : "Infra Red sensor"},
 {code : "0x2D", name :  "VMBGP4PIR", desc : "4 push buttons + Infra Red sensor"},
 {code : "0x2E", name :  "VMB1BLS", desc : ""},
 {code : "0x2F", name :  "VMBDMIR", desc : ""},
 {code : "0x30", name :  "VMBRF8RXS", desc : ""}];
//#endregion

//#region VMBfunction AS Velbus functions (code, name)
export let VMBfunction    = 
[{code : 0x00, name :  "VMBInputStatusResponse"},
{code : 0x01, name :  "VMBRelayOff"},
{code : 0x02, name :  "VMBRelayOn"},
{code : 0x03, name :  "VMBRelayTimer"},
{code : 0x04, name :  "VMBBlindHalt"},
{code : 0x05, name :  "VMBBlindUp"},
{code : 0x06, name :  "VMBBlindDown"},
{code : 0x06, name :  "VMBDimmerValueSet"},
{code : 0x0D, name :  "VMBStartBlink"},
{code : 0x0F, name :  "VMBSliderStatusRequest"},
{code : 0x12, name :  "VMBUnlockChannel"},
{code : 0x13, name :  "VMBUnlockChannel"},
{code : 0x66, name :  "VMB update1"},
{code : 0x67, name :  "VMB update2"},
{code : 0x68, name :  "VMB update3"},
{code : 0xAF, name :  "VMBSetDaylightSaving"},
{code : 0xB1, name :  "VMBDisableChannelProgram"},
{code : 0xB2, name :  "VMBEnableChannelProgram"},
{code : 0xB3, name :  "VMBSelectProgram"},
{code : 0xB7, name :  "VMBDateStatus"},
{code : 0xB9, name :  "VMBSensorSettingsPart4"},
{code : 0xBB, name :  "VMBSensorConfigData"},
{code : 0xBD, name :  "VMBCounterStatusRequest"},
{code : 0xBE, name :  "VMBCounterStatusResponse"},
{code : 0xBF, name :  "undefined"},
{code : 0xC6, name :  "VMBSensorSettingsPart3"},
{code : 0xC9, name :  "VMBReadMemBlock"},
{code : 0xCA, name :  "VMBWriteMemBlock"},
{code : 0xCB, name :  "VMBMemDumpRequest"},
{code : 0xCC, name :  "VMBTransmitMemBlock"},
{code : 0xD0, name :  "VMBLCDTextRequest"},
{code : 0xD1, name :  "VMBButtonTimer"},
{code : 0xD2, name :  "VMBLCDBackLightDefault"},
{code : 0xD3, name :  "VMBButtonBackLightDef"},
{code : 0xD4, name :  "VMBButtonBackLight"},
{code : 0xD5, name :  "VMBBackContrastRequest"},
{code : 0xD7, name :  "VMBRealTimeClockRequest"},
{code : 0xD8, name :  "VMBRealTimeClockSet"},
{code : 0xD9, name :  "VMBErrorCountRequest"},
{code : 0xDA, name :  "VMBErrorCountResponse"},
{code : 0xE4, name :  "VMBTempReset"},
{code : 0xE5, name :  "VMBTempRequest"},
{code : 0xE6, name :  "VMBTempResponse"},
{code : 0xE7, name :  "-"},
{code : 0xE8, name :  "VMBSensorSettingsPart1"},
{code : 0xE9, name :  "VMBSensorSettingsPart2"},
{code : 0xEA, name :  "VMBSensorStatusResponse"},
{code : 0xEC, name :  "VMBTransmitBlindStatus"},
{code : 0xED, name :  "VMB7InputStatusResponse"},
{code : 0xEE, name :  "VMBTransmitDimStatus"},
{code : 0xEF, name :  "VMBNameResquest"},
{code : 0xF0, name :  "VMBNamePart1"},
{code : 0xF1, name :  "VMBNamePart2"},
{code : 0xF2, name :  "VMBNamePart3"},
{code : 0xF3, name :  "VMBLCDBackLightSet"},
{code : 0xF4, name :  "VMBLedUpdate"},
{code : 0xF5, name :  "VMBLedClear"},
{code : 0xF6, name :  "VMBLedSet"},
{code : 0xF7, name :  "VMBBlinkSlow"},
{code : 0xF8, name :  "VMBBlinkFast"},
{code : 0xF9, name :  "VMBBlinkVeryFast"},
{code : 0xFA, name :  "VMBStatusRequest"},
{code : 0xFB, name :  "VMBTransmitRelayStatus"},
{code : 0xFC, name :  "VMBWriteMem"},
{code : 0xFD, name :  "VMBReadMem"},
{code : 0xFE, name :  "VMBTransmitMem"},
{code : 0xFF, name :  "VMBModuleStatus"}];
//#endregion

/**
 * Checksum is able to calculate the frame checksum
 * @param {Buffer} frame a Velbus frame from 0F xxxxx to 04
 * @param {number} full number removed from frame length (default=1)
 * @returns {number} sum all bytes then XOR FF + 1
 */
 export const CheckSum = (frame, full = 1) => {
	let crc = 0;
	for (let i = 0; i < frame.length - 1 - full; i++) {
		crc = crc + (frame[i] & 0xFF);
	}
	crc = crc ^ 0xFF;
	crc = crc + 1;
	crc = crc & 0xFF;
	return crc;
}