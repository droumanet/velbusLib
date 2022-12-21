/*----------------------------------------------------------------------------
  DataBase management
  ----------------------------------------------------------------------------
*/

import * as DB from '../models/DBModel.mjs'

async function writePowerByDay(req) {
  // FIXME pb state connexion "Error: Can't add new command when connection is in closed state"
   console.log(DB.SQLsetPowerDay(req))
}

async function readPowerDay(dateIN, dateOUT) {
  return DB.SQLgetPowerDay(dateIN, dateOUT)
}

async function writeEnergy(req) {
  return DB.SQLsetEnergy(req)
}

export {writePowerByDay, readPowerDay, writeEnergy}