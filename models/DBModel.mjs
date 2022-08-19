import {db} from '../Database.mjs'

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
async function setPowerDay(values){
    let sql='INSERT INTO pwrDay (jour, pwrconsohp,pwrconsohc, pwrprod, pwrconsomax, pwrprodmax) VALUES (?)';

    /* DEBUG example for many insert in one time
    let values = [
        ['value1', 'value2'],
        ['value1', 'value2']
    ]
    */
    await db.query(sql, [values], function (err, data) {
        if (err) throw err;
        return data.affectedRows;
    });
   
}

async function getPowerDay(dateIN, dateOUT) {
    let sql =
    `SELECT 	jour,
    pwrconsohp - LAG(pwrconsohp) OVER (ORDER BY jour) AS ecartHP,
    pwrconsohc - LAG(pwrconsohc) OVER (ORDER BY jour) AS ecartHC,
    pwrprod - LAG(pwrprod) OVER (ORDER BY jour) AS ecartProd
    FROM pwrDay
    WHERE jour BETWEEN '${dateIN}' AND '${dateOUT}';`
    await db.query(sql, function (err, data) {
        if (err) throw err;
        return data
    })
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

export {getPower, setPowerDay}