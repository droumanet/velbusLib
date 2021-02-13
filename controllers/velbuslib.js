// librairie contenant les messages à transmettre

// constantes des frames
const VMB_StartX = 0x0F;
const VMB_EndX = 0x04;
const VMB_PrioLow = 0xFB;
const VMB_PrioHi = 0xF8;

// Checksum : somme des octets XOR FF + 1
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

// fonctions VMB RELAY
const relayOn = (adr, timer=0) => {
    let dhex=[];
    for (let i=0; i < donnees.length; i++) {
        
        c = donnees[i].toString(16);
        if (c.length < 2) c='0'+c;
        dhex.push(c);
    }
    return dhex.toString()+' ('+donnees.length+')';
}

module.exports = {
    CheckSum
}