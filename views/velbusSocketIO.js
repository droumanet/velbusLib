/* =================================================================================================
    Client side program: enable socketIO for direct communication with VelbusServer
    Author: David ROUMANET
    version: 0.5
    date: 2022-02-14

    News:
    2022-02-14  Add this header
    ================================================================================================
*/
// initialisation
var socket = io.connect();
let nbMsg = 15;
let tableMsg = new array();
tableMsg.length = nbMsg;

// Function to show only last nbMsg messages
function listerMsg() {
  let texte = "";
  let part = [];
  let timestamp = Date.now()
  for(let message of tableMsg) {
    part[0] = new Date(Date.now()).toLocaleString()
    part[1] = message.DESCRIPTION
    part[2] = message.HEX
    texte = texte + '<div class="line"><div class="msg">'+part[0]+" "+part[1]+"</div>" + '<div class="other">'+part[2]+"</div><div></div></div>\n";
  }

  return texte;
}

// Fonction to send relayOn or relayOff
function ChangeRelay() {
  let etat = document.getElementById("btRelay");
  let modId = Number("0x" + document.getElementById("moduleId").value)
  let part = Number(document.getElementById("part").value);
  let sendMsg = { "address": modId, "part": part, "status": "ON" }
  if (etat.value == "ON") {
    sendMsg.status = "ON"
    socket.emit('relay', sendMsg);
    etat.value = "OFF";
  } else {
    sendMsg.status = "OFF"
    socket.emit('relay', sendMsg);
    etat.value = "ON"
  }
}
// Fonction to send blindUp or blindDown 1s
function BlindMove(arg) {
  console.log("BlindMove() called")
  let modId = Number("0x"+document.getElementById("moduleId").value)
  let part= Number(document.getElementById("part").value);
  let sendMsg = {"address" : modId, "part" : part, "status" : arg}
  console.log("SocketIO sending ", sendMsg)
  socket.emit('blind', sendMsg);
}

socket.on('msg', (msg) => {
  // console.log(msg);
  tableMsg.push(msg);
  if (tableMsg.length > nbMsg) tableMsg.shift();
  document.getElementById('VelbusMsg').innerHTML = listerMsg()
})