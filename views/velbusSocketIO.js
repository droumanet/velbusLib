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
const socket = io("http://192.168.168.248:8002");
let nbMsg = 15;
let tableMsg = [];
tableMsg.length = nbMsg;    // force 15 rows even if they're empty

// Function to show only last nbMsg messages
function listerMsg() {
  let texte = "";
  let part = [];
  let timestamp = Date.now()
  console.log("et voici "+tableMsg.length+" messages.")
  for(const message of tableMsg) {
    console.log("ListerMsg() => ",tableMsg)
    part[0] = new Date(Date.now()).toLocaleString()
    if (message === undefined) {
      part[1] = "(empty)"
      part[2] = "(empty)"
    } else {
      part[1] = message.DESCRIPTION
      part[2] = message.HEX
    }
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
  console.log(msg);
  tableMsg.push(msg);
  console.log(tableMsg.length)
  if (tableMsg.length > nbMsg) tableMsg.shift();
  console.log(tableMsg.length)
  document.getElementById('VelbusMsg').innerHTML = listerMsg()
})

socket.on('connect_failed', function() {
  document.write("Sorry, there seems to be an issue with the connection!");

})