/*--------------------------------------------------------------------------
  Initialisation for database connexion.
  Change here for connexion settings.
  --------------------------------------------------------------------------
*/

//let mysql = require('mysql');
import * as mysql2 from 'mysql2'

let connexion = mysql2.createConnection({
    host: '192.168.168.248',        // Replace with your host name
    user: 'velbus',                 // Replace with your database username
    password: 'citr0n',             // Replace with your database password
    database: 'velbus'              // Replace with your database Name
});
/*
conn.connect(function(err) {
    if (err) throw err;
    console.log('Database is connected successfully !');
});
*/
export {connexion}