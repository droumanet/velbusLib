import * as db from '../Database.mjs'

function getPower(callback){
    let sql='SELECT * FROM pwrDay';
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        return callback(data);
    });
}

function setPowerDay(callback){
    let sql='SELECT * FROM pwrDay';
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        return callback(data);
    });
}
/*
addFlower:function(flowerDetails,callback){
    var sql = 'INSERT INTO flori SET ?';
    db.query(sql, flowerDetails,function (err, data) {
        if (err) throw err;
        return callback(data);
    });
},
*/

export {getPower}