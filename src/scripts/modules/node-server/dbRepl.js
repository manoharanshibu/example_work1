/*jslint node:true */
'use strict';

var r = require('rethinkdb');
var config = require('config');
var dbInit = require('./dbInit.js');
var table = 'stats';
var _ = require('lodash');
var async = require('async');

var mockData = require('./mockData.js');

var repl = require('repl');

function throwOnError(err) {
    if (err) {
        throw err;
    }
}

var tables = ['InplayWidget', 'stats', 'layout', 'promotions'];

var init = dbInit.bind(this, config.rethink, tables);

init(function (err, connection) {
    if (err) {
        throw err;
    }
    var dbRepl = repl.start({ 'prompt': "> " });

    dbRepl.on('exit', function () {
        console.log('\n¯\\_(ツ)_/¯\n');
        process.exit();
    });

    function initialise(callback) {
        callback = callback || _.noop;
        r.dbDrop(config.rethink.db).run(connection, function (err) {
            throwOnError(err);
            init(callback);
        });
    }

    function insertToTable(table, data, callback) {
        r.table(table).insert(data).run(connection, callback);
    }

    function addLayouts(callback) {
        callback = callback || _.noop;
        async.series([
            insertToTable.bind(this, 'layout', mockData.tennisLayout),
            insertToTable.bind(this, 'layout', mockData.basketballLayout),
            insertToTable.bind(this, 'layout', mockData.soccerLayout)
        ], callback);
    }

    function addInplayData(callback) {
        callback = callback || _.noop;
        async.each(_.range(1,4), function (i, cb) {
            insertToTable('InplayWidget', mockData.InplayWidget(i), cb);
        }, callback);
    }


    _.extend(dbRepl.context, {

        initialise: initialise,
        addLayouts: addLayouts,
        addInplayData: addInplayData,

        setup: function () {
            async.series([
                initialise,
                addLayouts,
                addInplayData
            ], function (err) {
                throwOnError(err);
                console.log('done');
            });
        },

        insert: function insert(data) {
            insertToTable('stats', data, throwOnError);
        },
    });
});
