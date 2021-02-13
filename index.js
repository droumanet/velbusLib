let http = require('http');
//let io = require("socket.io");
let net = require("net");
let traitement = require('./controllers/traitement.js');
let velbus = require('./controllers/velbuslib.js');

let host = "192.168.168.248";
let port = 8445;
let client = new net.Socket();
let connexion = () => {
    console.log("connected to velbus server...");
}
client.connect(port, host, connexion);

client.on('data', (data) => {
    let d = traitement.enHexa(data);
    let crc = velbus.CheckSum(data);
    console.log("DATA: "+d+" CRC:"+crc.toString(16));
});
client.on('close', ()  => {
    console.log("CLOSING CONNEXION");
});


let server = http.createServer(function(request, response){
    response.writeHead(200, {'Content-Type': 'text/html'});
    response.write('hello world');
    response.end();
});


// Le serveur écoute les requêtes http sur le port 8001 mais aussi les requêtes "socket"
server.listen(8001);
// io.listen(server);