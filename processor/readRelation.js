const fs = require('fs');

let readRelations = function(path){
    // let path = workPath + "img/" + imgName.split(".")[0] + "_relation.json"
    return new Promise((resolve, reject) => {
        fs.readFile(path, 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                resolve("err");
            }else{
                let relations = JSON.parse(data);
                resolve(relations);
            }
            
        });
    })
}

module.exports = readRelations;