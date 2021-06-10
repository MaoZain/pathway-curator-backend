const testProcessor = require("../processor/test")
const qure = require("../processor/qure")

function test(){
    let result = testProcessor();
    return "here is controller && " + result;
}

module.exports = test;