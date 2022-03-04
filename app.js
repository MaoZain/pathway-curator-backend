const Koa = require('koa')
const Router = require('koa-router')
const app = new Koa()
const router = new Router()
const cors = require("koa2-cors");
const staticFiles = require('koa-static')

const views = require('koa-views')
const co = require('co')
const convert = require('koa-convert')
const json = require('koa-json')
const onerror = require('koa-onerror')
const bodyparser = require('koa-bodyparser')
const logger = require('koa-logger')
const debug = require('debug')('koa2:server')
const path = require('path')
const fs = require('fs')
const koaBody = require('koa-body');
const send = require('koa-send');

const config = require('./config');
const testRouter = require('./routes/testRouter');
const router_getAllHistoryInfo = require('./routes/router_getAllHistoryInfo');
const router_getResult = require('./routes/router_getResult');
const router_predict = require('./routes/router_predict')
const testController = require('./routes/testController');
const router_deleteHistory = require('./routes/router_deleteHistory');
const router_verify_user_id = require('./routes/router_verify_user_id');
const router_download = require('./routes/router_download');
const router_editGeneInfo = require('./routes/router_editGeneInfo');
const router_gerNumbers = require('./routes/router_getNumbers');
const router_p3db = require('./routes/router_prediction_p3db');
const { fstat } = require('fs');
const exec = require('child_process').exec;

const port = process.env.PORT || config.port

// error handler
onerror(app)

app.use(cors({
  origin: '*', // 允许跨域的地址，我的理解类似白名单，*代表全部允许
  exposeHeaders: ['WWW-Authenticate', 'Server-Authorization'], // 暴露header列表
  maxAge: 5, // 每隔5秒发送预检请求，也就是发送两次请求
  credentials: true, // 允许请求携带cookie
  allowMethods: ['OPTIONS', 'GET', 'PUT', 'POST', 'DELETE'], // 请求方式
  allowHeaders: ['Accept', 'Origin', 'Content-type', 'Authorization'],
}))

app.use(async (ctx, next) => {
  try {
    await next();
  } catch (err) {
    console.log(err)
    // will only respond with JSON
    ctx.status = err.statusCode || err.status || 500;
    ctx.body = {
      message: err.message
    };
  }
})

// middlewares
app.use(koaBody({
  multipart:true,
  encoding:'gzip',
  formidable:{
    maxFieldsSize:2 * 1024 * 1024,
    onError:(err)=>{
      console.log(err);
    }
  }

}));
// app.use(bodyparser())
app.use(json())
  .use(logger())
  .use(require('koa-static')(__dirname + '/public'))
  .use(staticFiles(__dirname + '/static'))
  .use(views(path.join(__dirname, '/views'), {
    options: {settings: {views: path.join(__dirname, 'views')}},
    map: {'njk': 'nunjucks'},
    extension: 'njk'
  }))
  .use(router.routes())
  .use(router.allowedMethods())

// logger
app.use(async (ctx, next) => {
  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - $ms`)
})

router.post('/back', async (ctx, next) => {
  // ctx.body = 'Hello World'
  ctx.state = {
    title: 'Welcome to pathway backend dev'
  }
  console.log("mao",ctx.request.body)
  ctx.response.body = ctx.state.title
})
//************************************************************************************** */
//test model
//************************************************************************************** */
 const dataPath = 'static/users/testModel/'
 const cmd = 'python3 pathway_module/body_interface.py --dataset ' + dataPath;


 let readElements = function(){
    return new Promise((resolve, reject) => {
        fs.readFile(dataPath + 'img/input_elements.json', 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }
            let elements = JSON.parse(data);
            resolve(elements);
        });
    })
 }

  let readRelations = function(){
    return new Promise((resolve, reject) => {
        fs.readFile(dataPath + 'img/input_relation.json', 'utf-8', (err, data) => {
            if(err){
                console.log(err);
                reject(err);
            }
            let relations = JSON.parse(data);
            resolve(relations);
        });
    })
 }

 let predict = function() {
    return new Promise((resolve, reject) => {
        exec(cmd, (error, stdout, stderr) => {
             if (error) {
                 console.log(`exec error: ${error}`);
                 reject('error');
             }else{
                resolve("predict successful!")
             }
        });

    })
 }

 async function predict_process(){
    let result = {elements:null, relation:null};
    //predict
    let predict_status = await predict();
    if(predict_status != "error"){
        //get element output
        result.elements = await readElements();
        //get relation output
        result.relations = await readRelations();
        console.log(result);
    }else{
        console.log("predict failed");
    }
 }

// predict_process();

 //-----------------------------------------------------------------------------------------------------------------------

 router.post('/back/test', async (ctx, next) =>{
   console.log(ctx.request.body)
   ctx.state = {
     title: 'Welcome to pathway backend dev'
   }
   ctx.response.body = ctx.request.body
 })
//************************************************************************************** */
//************************************************************************************** */

//create api router
testRouter(router);
testController(router);
router_getAllHistoryInfo(router);
router_getResult(router);
router_predict(router);
router_deleteHistory(router);
router_verify_user_id(router);
router_download(router);
router_editGeneInfo(router);
router_gerNumbers(router);
router_p3db(router);


app.on('error', function(err, ctx) {
  console.log(err)
})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})
