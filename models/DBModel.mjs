/*--------------------------------------------------------------------------
  Initialisation for database connexion.
  Change here for connexion settings.
  --------------------------------------------------------------------------
*/

import mysql from 'mysql2/promise.js'

let db = await mysql.createConnection({
    host: '192.168.168.248',        // Replace with your host name
    user: 'velbus',                 // Replace with your database username
    password: 'citr0n',             // Replace with your database password
    database: 'velbus'              // Replace with your database Name
})

function getPower(callback){
    let sql='SELECT * FROM pwrDay';
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        return callback(data);
    });
}

// WIP sample for power
/**
 * 
 */
async function setPowerDay(values) {
    let sql='INSERT INTO pwrDay (jour, pwrconsohp,pwrconsohc, pwrprod, pwrconsomax, pwrprodmax) VALUES (?)';
    await db.query(sql, [values], function (err, data) {
        if (err) throw err;
        return data.affectedRows;
    })
}

async function getPowerDay(dateIN, dateOUT) {
    // DEBUG for testing
    if (dateIN == undefined || dateOUT == undefined) {
        dateIN="2022-08-20"
        dateOUT="2022-12-31"
    }
    let sql =
    `SELECT 	jour,
    pwrconsohp - LAG(pwrconsohp) OVER (ORDER BY jour) AS ecartHP,
    pwrconsohc - LAG(pwrconsohc) OVER (ORDER BY jour) AS ecartHC,
    pwrprod - LAG(pwrprod) OVER (ORDER BY jour) AS ecartProd
    FROM pwrDay
    WHERE jour BETWEEN '${dateIN}' AND '${dateOUT}';`
    return await db.query(sql)
}

/*
// Original example
addFlower:function(flowerDetails,callback){
    var sql = 'INSERT INTO flori SET ?';
    db.query(sql, flowerDetails,function (err, data) {
        if (err) throw err;
        return callback(data);
    });
},
*/

export {getPower, setPowerDay, getPowerDay}