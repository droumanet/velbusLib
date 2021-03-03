/* ==========================================================================================
    VELBUS Library
    @author : David ROUMANET
    @date : 2021-02-16 (start date)
    @version : 1.0

    2021-02-16  Initial setup with checksum, cut multi-messages in one frame (inspired by Purebasic VMBLibs)
   ==========================================================================================
*/

// messages constants
const VMB_StartX = 0x0F;
const VMB_EndX = 0x04;
const VMB_PrioLow = 0xFB;
const VMB_PrioHi = 0xF8;

//#region Modules constants
const modules    = 
[{code : "0x01", name :  "VMB8PB", desc : "8 simple push buttons module"},
 {code : "0x02", name :  "VMB1RY",  desc : "1 relay (with physical button) module"},
 {code : "0x03", name :  "VMB1BL",  desc : "1 blind (with physical button) module"},
 {code : "0x05", name :  "VMB6IN",  desc : "6 inputs module"},
 {code : "0x07", name :  "VMB1DM",  desc : "1 dimmer (with physical button) module"},
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
 {code : "0x30", name :  "VMBRF8RXS", desc : ""}]
//#endregion

//#region Velbus functions ID
const VMBTransmitInputStatus = 0x00;
const VMBRelayOff            = 0x01;
const VMBRelayOn             = 0x02;
const VMBRelayTimer          = 0x03;
const VMBBlindHalt           = 0x04;
const VMBBlindUp             = 0x05;
const VMBBlindDown           = 0x06;
const VMBStartBlink          = 0x0D;
const VMBReadMemBlock        = 0xC9;
const VMBWriteMemBlock       = 0xCA;
const VMBMemDumpRequest      = 0xCB;
const VMBTransmitMemBlock    = 0xCC;
const VMBLCDTextRequest      = 0xD0;
const VMBButtonTimer         = 0xD1;
const VMBLCDBackLightDefault = 0xD2;
const VMBButtonBackLightDef  = 0xD3;
const VMBButtonBackLight     = 0xD4;
const VMBBackContrastRequest = 0xD5;
const VMBRealTimeClockRequest= 0xD7;
const VMBRealTimeClockSet    = 0xD8;
const VMBErrorCountRequest   = 0xD9;
const VMBErrorCountResponse  = 0xDA;
const VMBTempReset           = 0xE4;
const VMBTempRequest         = 0xE5;
const VMBTempResponse        = 0xE6;
const VMBTransmitBlindStatus = 0xEC;
const VMBTransmitDimStatus   = 0xEE;
const VMBNameResquest        = 0xEF;
const VMBNamePart1           = 0xF0;
const VMBNamePart2           = 0xF1;
const VMBNamePart3           = 0xF2;
const VMBLCDBackLight        = 0xF3;
const VMBLedUpdate           = 0xF4;
const VMBLedClear            = 0xF5;
const VMBLedSet              = 0xF6;
const VMBBlinkSlow           = 0xF7;
const VMBBlinkFast           = 0xF8;
const VMBBlinkVeryFast       = 0xF9;
const VMBStatusRequest       = 0xFA;
const VMBTransmitRelayStatus = 0xFB;
const VMBWriteMem            = 0xFC;
const VMBReadMem             = 0xFD;
const VMBTransmitMem         = 0xFE;
const VMBModuleStatus        = 0xFF;
//#endregion


// Checksum : sum all bytes then XOR FF + 1
const CheckSum = (frame, full=1) => {
    let crc = 0;
    for (let i=0; i < frame.length-1-full; i++) {
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
    for (let i=0; i<data.length; i++) {
        if (data[i] == 0x0F && i+3<data.length) {
            longueur = data[i+3];
            VMBSize = longueur+3+1+1;     // message length + offset 3 + checksum + end byte
            if (data[i+VMBSize] == 0x04) {
                // push de i à VMBSize dans tableau
                console.log("trame OK à position ",i, " longueur ", VMBSize);
                table.push(data.slice(i, i+VMBSize+1));     // slice utilise position début et position fin
                i = i + VMBSize;
            } else {
                // console.log("octet à longueur VMBSize : ",data[i+VMBSize])
            }
        }
    }
    console.log("table = ",table);
    return table;
}

// convert a buffer into a table containing hexa code for each byte
const toHexa = (donnees) => {
    let c='';
    let dhex=[];
    for (let i=0; i < donnees.length; i++) {
        c = donnees[i].toString(16).toUpperCase();
        if (c.length < 2) c='0'+c;
        dhex.push(c);
    }
    return dhex;
}

// ========================= functions VMB RELAY ===================================
const relaySet = (adr, part, state) => {
    let trame=new Uint8Array(8);
    trame[0] = VMB_StartX;
    trame[1] = VMB_PrioHi;
    trame[2] = adr;
    trame[3] = 0x02;    // len
    trame[4] = 0x01;
    if (state) trame[4] = 0x02;
    trame[5] = part;
    trame[6] = CheckSum(trame, 0);
    trame[7] = VMB_EndX;
    return trame;
}


module.exports = {
    CheckSum,
    Cut,
    toHexa,
    relaySet
}