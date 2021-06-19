let db= require('../Database');
module.exports={
    getPower:function(callback){
        var sql='SELECT * FROM pwrDay';
        db.query(sql, function (err, data, fields) {
            if (err) throw err;
            return callback(data);
        });
    },

    // Change these examples...
    getFlower:function(myID, callback){
        var sql='SELECT * FROM flori WHERE id= ?';
        db.query(sql, myID, function (err, data, fields) {
            if (err) throw err;
            return callback(data[0]);
        });
    },
    addFlower:function(flowerDetails,callback){
        var sql = 'INSERT INTO flori SET ?';
        db.query(sql, flowerDetails,function (err, data) {
            if (err) throw err;
            return callback(data);
        });
    },
    deleteFlower:function(flowerID,callback){
        var sql = 'DELETE FROM flori WHERE id = ';
        db.query(sql, flowerID, function (err, data) {
            if (err) throw err;
            return callback(data);
        });
    },
    editFlower:function(editID, callback){
        var sql=`SELECT * FROM flori WHERE id= ?`;
        db.query(sql, editID, function (err, data) {
            if (err) throw err;
            return callback(data[0]);
        });
    },
    updateFlower:function(updateFlower,myID,callback){

        var sql = `UPDATE flori SET ? WHERE id= ?`;
        db.query(sql, [updateFlower, myID], function (err, data) {
            if (err) throw err;
            return callback(data);
        });
    },
}