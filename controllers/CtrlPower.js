/*----------------------------------------------------------------------------
  Power Controller (energy from TeleInfo database)
  source for example project: https://github.com/rrazvanrraducanu/Node.js-MySQL-MVC-
  ----------------------------------------------------------------------------
*/

let db=require('../Database');
let myModel=require('../models/DBModel');
module.exports= {
    getPower: function (req, res) {
        myModel.getPower(function (data) {
            res.render('index', {title: 'General Power', flowerData: data});
        });
    },
}