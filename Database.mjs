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

export {db}