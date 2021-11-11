// initialisation
var socket = io.connect();
let nbMsg = 15;
let tableMsg = ["","","","","","","","","","","","","","",""];

// Function to show only last nbMsg messages
function listerMsg() {
  let texte = "";
  let part = [];
  for (let i=0; i < tableMsg.length; i++) {
    // console.log("Table "+i+"⏩", tableMsg[i])
    part[0] = tableMsg[i].DESCRIPTION
    part[1] = tableMsg[i].HEX
    texte = texte + '<div class="line"><div class="msg">'+part[0]+"</div>" + '<div class="other">'+part[1]+"</div><div></div></div>\n";
  }
  return texte;
}

// Fonction to send relayOn or relayOff
function AllumerLampe() {
  let etat= document.getElementById("btLampe");
  let sendMsg = { "address": 0x34, "part": 1, "status": etat.value }
  socket.emit('relay', sendMsg);
  if (etat.value == "ON") {
    etat.value = "OFF";
  } else {        
    etat.value = "ON"
  }
}

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
  let modId = Number("0x"+document.getElementById("moduleId").value)
  let part= Number(document.getElementById("part").value);
  let sendMsg = {"address" : modId, "part" : part, "status" : arg}
  socket.emit('blind', sendMsg);
}

socket.on('msg', (msg) => {
  // console.log(msg);
  tableMsg.push(msg);
  if (tableMsg.length > nbMsg) tableMsg.shift();
  document.getElementById('VelbusMsg').innerHTML = listerMsg()
})