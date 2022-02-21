/*
   Router : 
*/

const express = require('express')
const Routeur = express.Router()

const CtrlInstall = require('../controllers/CtrlInstall')
const CtrlPower = require('../controllers/CtrlPower')
const CtrlRelay = require('../controllers/CtrlRelay')

let racine = (req, res) => {
    res.render('client')
}

// routes list
Routeur.get('/installation', CtrlInstall.installation)
Routeur.get('/', racine)
Routeur.get('*', racine)

module.exports = Routeur