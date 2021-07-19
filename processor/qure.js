const mysql = require('mysql');
const pool  = mysql.createPool({
    host     : 'localhost',   // database address
    user     : 'dev_pathway',    // user
    password : 'pathway110',  // password
    database : 'dev_pathway'  // database
});

//connect to databse
let fn_query = function( sql, values ) {
    // return a Promise
    return new Promise(( resolve, reject ) => {
      pool.getConnection(function(err, connection) {
        if (err) {
          reject( err )
        } else {
          connection.query(sql, values, ( err, rows) => {
            if ( err ) {
              reject( err );
              console.log(err);
            } else {
              resolve( rows )
            }
            // kill connection
            connection.release()
          })
        }
      })
    })
}

module.exports = fn_query;