/*----------------------------------------------------------------------------
  Power Controller (energy from TeleInfo database)
  source for example project: https://github.com/rrazvanrraducanu/Node.js-MySQL-MVC-
  ----------------------------------------------------------------------------
*/

// import * as db from '../Database.mjs'
import * as myModel from '../models/DBModel.mjs'

// Because there is no easiest way to convert a timestamp to a date
function formatDate(milliseconds) {
  let d = new Date(milliseconds),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();

  if (month.length < 2) 
    month = '0' + month;
  if (day.length < 2) 
    day = '0' + day;

  return [year, month, day].join('-');
}

async function view(req, res) {
    let data = await myModel.getPowerDay(undefined, undefined)
    let dataJour=[], dataHP=[], dataHC=[], dataProd=[]
    console.log(data[0])
    data[0].forEach((pwrObj) => {
      dataJour.push(formatDate(pwrObj.jour))
      dataHP.push(pwrObj.ecartHP)
      dataHC.push(pwrObj.ecartHC)
      dataProd.push(pwrObj.ecartProd)
    })
    dataJour.shift()
    dataHP.shift()
    dataHC.shift()
    dataProd.shift()
    res.render('statEnergy', {statistiques: data[0], dataJour: dataJour, dataHP: dataHP, dataHC: dataHC, dataProd:dataProd})
}

export {view}