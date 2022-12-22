/*--------------------------------------------------------------------------
  Initialisation for database connexion.
  Change here for connexion settings.
  --------------------------------------------------------------------------
*/

import mysql from 'mysql2/promise.js'
// import Pool from 'mysql2/typings/mysql/lib/Pool.js';
let db

async function connectDB(){
    
    const connection = await mysql.createPool({
        host: '192.168.168.248',        // Replace with your host name
        user: 'velbus',                 // Replace with your database username
        password: 'citr0n',             // Replace with your database password
        database: 'velbus',             // Replace with your database Name
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
    });
    console.log("Connected to remote database");
    return connection;
}

async function getPower(callback){

    let sql='SELECT * FROM pwrDay';
    db.query(sql, function (err, data, fields) {
        if (err) throw err;
        return callback(data)
    })

    
}

// WIP sample for power
/**
 * @param values Array of TeleInfo for production and cunsomption
 */
async function SQLsetPowerDay(values) {
    let sql='INSERT INTO pwrDay (jour, pwrconsohp,pwrconsohc, pwrprod, pwrconsomax, pwrprodmax) VALUES (?)';
    db.query(sql, [values], function (err, data) {
        if (err) throw err;
        return data.affectedRows;
    })
}

/**
 * @param values Array of TeleInfo for production and cunsomption
 */
 async function SQLsetEnergy(values) {
    let sql='REPLACE INTO Energie (ModAddr, ModPart, dateRecord, PowerIndex, PowerInst) VALUES (?)';
    db.query(sql, [values], function (err, data) {
        if (err) throw err;
        return data.affectedRows;
    })
}

async function SQLgetPowerDay(dateIN, dateOUT) {
    // DEBUG for testing
    if (dateIN == undefined || dateOUT == undefined) {
        let dayOffset = 60
        let dateToday = new Date()
        let dateBefore = new Date()
        let d = dateToday.getTime() - 1000*60*60*24*dayOffset; // Offset by 60 day;
        dateBefore.setTime(d);
        dateOUT=dateToday.getFullYear()+"-"+(dateToday.getMonth()+1)+"-"+dateToday.getDate()
        dateIN=dateBefore.getFullYear()+"-"+(dateBefore.getMonth()+1)+"-"+dateBefore.getDate()
        //dateIN="2022-08-20"
        //dateOUT="2022-12-31"
    }
    let sql =
    `SELECT 	jour,
    pwrconsohp - LAG(pwrconsohp) OVER (ORDER BY jour) AS ecartHP,
    pwrconsohc - LAG(pwrconsohc) OVER (ORDER BY jour) AS ecartHC,
    pwrprod - LAG(pwrprod) OVER (ORDER BY jour) AS ecartProd
    FROM pwrDay
    WHERE jour BETWEEN '${dateIN}' AND '${dateOUT}';`
    return db.query(sql)
}

/**
 * Get delta power from Energie Table (day by day)
 * @param {*} dateIN 
 * @param {*} dateOUT 
 * @param {*} addr 
 * @param {*} part 
 * @returns SQL answer
 */
async function SQLgetEnergyDay(dateIN, dateOUT, addr, part) {
    if (dateIN == undefined || dateOUT == undefined) {
        let dayOffset = 60
        let dateToday = new Date()
        let dateBefore = new Date()
        let d = dateToday.getTime() - 1000*60*60*24*dayOffset; // Offset by 60 day;
        dateBefore.setTime(d);
        dateOUT=dateToday.getFullYear()+"-"+(dateToday.getMonth()+1)+"-"+dateToday.getDate()
        dateIN=dateBefore.getFullYear()+"-"+(dateBefore.getMonth()+1)+"-"+dateBefore.getDate()
        //dateIN="2022-08-20"
        //dateOUT="2022-12-31"
    }
    let sql =
    `SELECT	dateRecord, 
    PowerIndex - LAG(PowerIndex) OVER (ORDER BY dateRecord) AS ConsoJour
    FROM Energie
    WHERE ModAddr = ${addr}	-- Module 6-1 PAC, 6-2 Radiators, 6-3 ChargeCar
    AND ModPart = ${part}	-- other 40-1 clim, 40-2 HousAutomation, 40-3 unused
    AND dateRecord BETWEEN '${dateIN}' AND '${dateOUT}'
    AND time(dateRecord) = "23:59:00"
    ORDER BY dateRecord;`
    return db.query(sql)
}

/**
 * Get instant power from Energie Table (each minutes)
 * @param {*} addr 
 * @param {*} part 
 * @returns SQL answer
 */
async function SQLgetEnergyInstant(addr, part) {

    let dayOffset = 1
    let dateToday = new Date()
    let dateBefore = new Date()
    let d = dateToday.getTime() - 1000*60*60*24*dayOffset; // Offset by 1 day;
    dateBefore.setTime(d);
    let dateOUT=dateToday.getFullYear()+"-"+(dateToday.getMonth()+1)+"-"+dateToday.getDate()
    let dateIN=dateBefore.getFullYear()+"-"+(dateBefore.getMonth()+1)+"-"+dateBefore.getDate()

    let sql =
    `SELECT dateRecord, PowerInst, PowerIndex
    FROM Energie
    WHERE ModAddr = ${addr}
    AND ModPart = ${part} -- 1: PAC, 3: ChargeCar
    AND dateRecord BETWEEN '${dateIN}' AND '${dateOUT}'
    ORDER BY dateRecord;`
    return db.query(sql)
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

// launch initial connexion
db = await connectDB()
console.log("db ==>", db)

export {getPower, SQLsetPowerDay, SQLgetPowerDay, SQLgetEnergyDay, SQLgetEnergyInstant, SQLsetEnergy}