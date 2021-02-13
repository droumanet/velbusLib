const express = require('express');
const Routeur = express.Router();

racine = (req, res) => {
    res.render('client');
}

Routeur.get('/', racine);

module.exports = Routeur;