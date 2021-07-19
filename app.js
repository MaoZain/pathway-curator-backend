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

const config = require('./config');
const testRouter = require('./routes/testRouter');
const router_getAllHistoryInfo = require('./routes/router_getAllHistoryInfo');
const router_getResult = require('./routes/router_getResult');
const router_predict = require('./routes/router_predict')
const testController = require('./routes/testController');
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

// middlewares
app.use(bodyparser())
  .use(json())
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
// const dataPath = 'static/users/testModel/test1/'
// const cmd = 'python3 pathway_module/body_interface.py --dataset ' + dataPath;

// let result = new Promise((resolve, reject) => {
//   exec(cmd, (error, stdout, stderr) => {
//             if (error) {
//                 console.log(`exec error: ${error}`);
//                 reject('error');
//             }else{
//                 //get element output
//                 fs.readFile(dataPath + 'img/input_elements.json', 'utf-8', (err, data) => {
//                     console.log(data);
//                     console.log("----------------------------------------");
//                     let jsondata = JSON.parse(data);
//                     console.log(jsondata);
//                     //getResult[0] = jsondata;
//                 });
//                 //get relation output
//                 fs.readFile(dataPath + 'img/input_relation.json', 'utf-8', (err, data) => {
//                     console.log(data);
//                     console.log("----------------------------------------");
//                     let jsondata = JSON.parse(data);
//                     //getResult[1] = jsondata;
//                     console.log(jsondata)
//                     resolve("success!");
//                 });
//             }
//   });

// })

// router.post('/back/test', async (ctx, next) =>{
//   console.log(ctx.request.body)
//   ctx.state = {
//     title: 'Welcome to pathway backend dev'
//   }
//   ctx.response.body = ctx.request.body
// })
//************************************************************************************** */
//************************************************************************************** */

//create api router
testRouter(router);
testController(router);
router_getAllHistoryInfo(router);
router_getResult(router);
router_predict(router);

app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})
