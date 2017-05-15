/*jslint node:true unparam:true */
'use strict';
// var _ = require('lodash');
var express = require('express');
var app = express();
var morgan = require('morgan');

// middleware:
var bodyParser = require('body-parser');
var jSend = require('proto-jsend');
var jSendConvenience = require('./util/jSendConveniance.js');
var config = require('config');
var cors = require('cors');

var environment = process.env.NODE_ENV;


// Enable all CORS requests when in development
if (environment === 'development'){
    console.log('--------------RUNNING IN DEV MODE------------------------');
    app.use(cors());
}

app.use(morgan('combined'));
app.use(bodyParser.json());
app.use(jSend);
app.use(jSendConvenience);

// routes:
var layoutRoute = require('./routes/layoutRoute.js');
var componentRoute = require('./routes/componentRoute.js');
var promotionsRoute = require('./routes/promotionsRoute.js');
var faqRoute = require('./routes/faqRoute.js');

app.use(config.prefix + '/layout/', layoutRoute);
app.use(config.prefix + '/component/', componentRoute);
app.use(config.prefix + '/promotions/', promotionsRoute);
app.use(config.prefix + '/faq/', faqRoute);

// socket:
var http = require('http');
var server = http.createServer(app);
var io = require('socket.io')(server, { path: config.prefix + '/socket.io' });
var config = require('config');
var feeder = require('./feeder.js');

io.on('connection', function (socket) {
    console.log('User connected. Socket id %s', socket.id);

    socket.on('join', function (room, doc) {
        console.log('Socket %s subscribed to %s', socket.id, room);
        socket.join(room);
        if (doc) {
            socket.join(room + ':' + doc);
        }

        feeder.subscribe(room, doc, function (err, data) {
            if (err) {
                console.log(err);
                return io.to(socket.id).emit(room + ':error', err);
            }
            // upon joining a room, the user should be sent an initial response
            io.to(socket.id).emit(room + ':data', data);
        });
    });

    socket.on('leave', function (room, doc) {
        console.log('Socket %s unsubscribed from %s', socket.id, room);
        socket.leave(room);
        if (doc) {
            socket.leave(room + ':'  + doc);
        }
    });

    socket.on('disconnect', function () {
        console.log('User disconnected. %s. Socket id %s', socket.id);
    });
});

server.listen(config.port, function () {
    console.log('listening on:', config.port);
});

feeder.start(function (room, type, message) {
    io.to(room).emit(type, message);
});
