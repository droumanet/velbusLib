const express = require('express');
const CtrlPower = require('../controllers/CtrlPower');
const Routeur = express.Router();
const CtrlRelay = require('../controllers/CtrlRelay');

racine = (req, res) => {
    res.render('client');
}

Routeur.get('/', racine);
Routeur.get('/power', CtrlPower.getPower);

module.exports = Routeur;