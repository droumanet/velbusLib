let db= require('../Database');
module.exports={
    getPower:function(callback){
        var sql='SELECT * FROM pwrDay';
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

}