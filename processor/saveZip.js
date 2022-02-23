const fs = require('fs');;
const path = require('path');

let saveImg = function(image, filePath){
      return new Promise((resolve, reject) => {
          let reader = fs.createReadStream(image.path);
          let writeStream = fs.createWriteStream(filePath+`/${image.name}`);
          reader.on('open', function(){
              console.log('start')
              reader.pipe(writeStream);
          })
          reader.on('end', async function(){
              console.log('all saved');
              resolve('ok');
          })
          writeStream.on('error', function(err){
              reject("failed");
              console.log(25,err);
          })
          reader.on('error', function(err){
              reject("failed");
              console.log(28,err);
          })
      })
      .catch((err) => {
          return err;
      })
}
module.exports = saveImg;
