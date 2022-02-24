const fn_query = require("../processor/qure")

let fn_verify_user_id = async(id) => {
    console.log(id)
    let verify = await fn_query(
        `select U_name 
        from User
        where U_name = "${id}"`
    );
    if(verify.length == 0){
        let insert = await fn_query(
            `insert into User
            (U_name)
            VALUES
            ("${id}")`
        )
    }
    let result = {
        u_id:id,
        status:"success"
    }
    return JSON.stringify( result )
}

module.exports = fn_verify_user_id;