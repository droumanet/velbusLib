/*
   Router : 
*/

const express = require('express')
const CtrlPower = require('../controllers/CtrlPower')
const CtrlRelay = require('../controllers/CtrlRelay')
const Routeur = express.Router()

let racine = (req, res) => {
    res.render('client')
}
let installation = (req, res) => {
    console.log("*** going to installation.ejs ***")
    res.render('installation.ejs')
}

/*
Routeur.get('/power', CtrlPower.getPower)
Routeur.get('/scan', Ctrl.scan)
*/
Routeur.get('/installation', installation)
Routeur.get('/', racine)
Routeur.get('*', racine)

module.exports = Routeur