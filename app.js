var app = require('koa')();
var logger = require('koa-logger');
var route = require('koa-route');
var views = require('koa-views');
var serve = require('koa-static');
var ZabbixProxy = require('./lib/zabbix');
var config = require('./config');

app.use(views('views', {
    default: 'jade',
    cache: true

//    map: {
//        html: underscore
//    }
}));

app.use(logger());

app.use(route.get('/', index));
app.use(route.get('/host/:id', index));

function *index() {
    this.locals.title = 'monitoring';

    yield this.render('index', {
        user: 'Prick'
    });
}

// Send static files
app.use(serve('./public'));


// This must come after last app.use()
var server = require('http').Server(app.callback()),
    io = require('socket.io')(server),
    zabbix = new ZabbixProxy(config, io);

zabbix.start();


// Start the server
server.listen(1337);
console.info('Now running on localhost:1337');
