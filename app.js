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

const config = require('./config')
const testRouter = require('./routes/testRouter')
const router_getHistoryInfo = require('./routes/router_getHistoryInfo')
const router_getHistoryFigureInfo = require('./routes/router_getHistoryFigureInfo')
const testController = require('./routes/testController');
const { fstat } = require('fs');

const port = process.env.PORT || config.port

// error handler
onerror(app)

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
  ctx.set("Access-Control-Allow-Origin", "*");

  const start = new Date()
  await next()
  const ms = new Date() - start
  console.log(`${ctx.method} ${ctx.url} - $ms`)
})

//cors
app.use(cors())

app.use(async (ctx, next) => {
  ctx.set("Access-Control-Allow-Origin", "*")
  await next()
})


router.post('/back', async (ctx, next) => {
  // ctx.body = 'Hello World'
  ctx.state = {
    title: 'Welcome to pathway backend dev'
  }
  ctx.response.body = ctx.state.title
})


//test



// router.post('/back/test', async (ctx, next) =>{
//   console.log(ctx.request.body)
//   ctx.state = {
//     title: 'Welcome to pathway backend dev'
//   }
//   ctx.response.body = ctx.request.body
// })

//create api router
testRouter(router);
testController(router)
router_getHistoryInfo(router)
router_getHistoryFigureInfo(router)

app.on('error', function(err, ctx) {
  console.log(err)
  logger.error('server error', err, ctx)
})

module.exports = app.listen(config.port, () => {
  console.log(`Listening on http://localhost:${config.port}`)
})
