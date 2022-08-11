import * as db from '../Database.mjs'

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
    let sql='INSERT INTO pwrDay (powerconsohp,powerconsohc, pwrprod, pwrprodmax) VALUES ?';

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