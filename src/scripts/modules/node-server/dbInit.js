/*jslint node:true */
'use strict';

var async = require('async');
var r = require('rethinkdb');

module.exports = function (config, tables, done) {

    function createConnection(callback) {
        r.connect(config, callback);
    }

    function createDatabase(connection, callback) {
        //Create the database if needed.
        r.dbList().contains(config.db).do(function(containsDb) {
            return r.branch(
                containsDb,
                {created: 0},
                r.dbCreate(config.db)
            );
        }).run(connection, function(err) {
            callback(err, connection);
        });
    }

    function createIndex(table, connection, callback) {
        r.table(table).indexList().contains('doc').do(function (containsIndex) {
            return r.branch(
                containsIndex,
                {created: 0},
                r.table(table).indexCreate('doc')
            );
        }).run(connection, callback);
    }

    function createTable(table, connection, callback) {
        //Create the table if needed.
        r.tableList().contains(table).do(function(containsTable) {
            return r.branch(
                containsTable,
                {created: 0},
                r.tableCreate(table)
            );
        }).run(connection, function(err) {
            if (err) {
                return callback(err);
            }
            createIndex(table, connection, function (err) {
                callback(err, connection);
            });
        });
    }

    function createTables(connection, callback) {
        async.each(tables, function (table, cb) {
            createTable(table, connection, cb);
        }, function (err) {
            callback(err, connection);
        });
    }



    async.waterfall([
        createConnection,
        createDatabase,
        createTables
    ], done);
};
