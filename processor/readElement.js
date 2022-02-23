const fs = require('fs');

let readElements = function(path){
    console.log(path);
    console.log('++++++++++++++++++');
    // console.log("read elements")
    // let path = workPath + "img/" + imgName.split(".")[0] + "_elements.json";
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                resolve("err");
            }else{
                console.log("read e ok")
                let elements = JSON.parse(data);
                resolve(elements);
            }
            
        });
    })
 }

 module.exports = readElements;