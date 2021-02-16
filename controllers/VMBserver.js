let host = "192.168.168.248";
let port = 8445;
let client = new net.Socket();
let connexion = () => {
    console.log("connected to velbus server...");
}
client.connect(port, host, connexion);

client.on('data', (data) => {
    let tableMsg = velbus.split(data);
    let d = traitement.enHexa(data);
    let crc = velbus.CheckSum(data);
    console.log("DATA: "+d+" CRC:"+crc.toString(16));
});
client.on('close', ()  => {
    console.log("CLOSING CONNEXION");
});