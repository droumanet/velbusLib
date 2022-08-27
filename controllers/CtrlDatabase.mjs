/*----------------------------------------------------------------------------
  DataBase management
  ----------------------------------------------------------------------------
*/

import * as DB from '../models/DBModel.mjs'

async function writePowerByDay(req) {
  // FIXME pb state connexion "Error: Can't add new command when connection is in closed state"
   console.log(DB.setPowerDay(req))
}

async function readPowerDay(dateIN, dateOUT) {
  return DB.getPowerDay(dateIN, dateOUT)
}


export {writePowerByDay, readPowerDay}