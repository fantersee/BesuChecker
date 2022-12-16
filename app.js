const helmet = require('koa-helmet')
const http = require('http');
const koa = require('koa');
const views = require('koa-views');
const cors = require('koa2-cors');
const app = new koa();
const Router = require('koa-router');
const router = new Router();
const json = require('koa-json');
const bodyParser = require('koa-bodyparser');
const RateLimit = require('koa2-ratelimit').RateLimit;
function onListening() {
	const os = require('os');
	const ifaces = os.networkInterfaces();
	for (let dev in ifaces) {
		let alias = 0;
		ifaces[dev].forEach(details => {
			if (details.family == 'IPv4') {
				console.log(dev + (alias ? ':' + alias : ''), details.address);
				++alias;
			}
		});
	}
	console.log(`os: ${os.platform()}`);
}
onListening();
require('./global')()
	.then(()=>{
		app.use(helmet());
		app.use(bodyParser());
		app.use(json());

		app.use(require('koa-static')(__dirname + '/public'));
		app.use(views(__dirname + '/views', {
			"extension": 'html'
		}));

		const limiter = RateLimit.middleware({
			interval: { min: 10 },
			max: 100,
		});
		app.use(limiter);

		app.use(cors({
			'origin': '*',
			'methods': 'GET,POST',
			'credentials': true,
			'preflightContinue': false,
			'maxAge': 60
		}));

		router.get('/', async (ctx) => {
			ctx.status = 200;
			await ctx.render('index');
		});


		router.post('/api', async (ctx) => {

			const { request:{ body:{ api,data } } } = ctx;

			ctx.status = 200;
			ctx.body = await require(`./api/${api}`)(data)
				.then(d=>d)
				.catch(e=>'');
		});

		app.use(router.routes(), router.allowedMethods());

		const server = http.createServer(app.callback());

		server.listen(SET.port);

	});
