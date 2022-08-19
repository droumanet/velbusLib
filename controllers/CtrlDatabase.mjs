/*----------------------------------------------------------------------------
  DataBase management
  ----------------------------------------------------------------------------
*/

import * as DB from '../models/DBModel.mjs'

async function writePowerByDay(req) {
   console.log(DB.setPowerDay(req))
}


export {writePowerByDay}