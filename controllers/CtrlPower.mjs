/*----------------------------------------------------------------------------
  Power Controller (energy from TeleInfo database)
  source for example project: https://github.com/rrazvanrraducanu/Node.js-MySQL-MVC-
  ----------------------------------------------------------------------------
*/

// import * as db from '../Database.mjs'
// import * as myModel from '../models/DBModel.mjs'

/*
let db = require('../Database');
let myModel = require('../models/DBModel');
*/

function getPower(req, res) {
    myModel.getPower(function (data) {
        res.render('index', { title: 'General Power', flowerData: data })
    })
}

export {getPower}