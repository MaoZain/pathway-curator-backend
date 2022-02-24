const fn_query = require("../processor/qure")

let fn_getNumbers = async() => {
    //================
    //get # of users
    //================
    let num_users = await fn_query(
        `select count(distinct U_name) as num
        from User;`
    )
    let num_figures = await fn_query(
        `select count(distinct fig_id) as num
        from Figure;`
    )
    let numbers = {
        users: num_users[0].num,
        figures: num_figures[0].num,
    }
    return JSON.stringify(numbers);
}
module.exports = fn_getNumbers;