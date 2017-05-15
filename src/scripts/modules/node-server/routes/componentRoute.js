/*jslint node:true unparam:true*/
'use strict';

var _ = require('lodash');
var asyn = require('async');
var express = require('express');
var router = express.Router();
var cachedRequest= require('../util/simpleRequestCaching');
var config = require('config');
var widgetsEndpoint = config.sportsbook + config.widgets;
var indexUrl = widgetsEndpoint + '/widgets.json';

var MINUTES_TO_CACHE = 5;

function createComponentUrl(mod) {
    return widgetsEndpoint + '/' +  mod + '/config.json';
}

function getComponentResource(mod, callback) {
    cachedRequest({
        uri: createComponentUrl(mod),
        ttl: MINUTES_TO_CACHE * 60 * 1000,
        timeout: 1500
    }, function (err, res, data) {
        callback(err, data);
    });
}

router.route('/')
    .get(function (req, res) {
        cachedRequest({
            uri: indexUrl,
            ttl: MINUTES_TO_CACHE * 60 * 1000,
            timeout: 5000
        }, function (err, _res, data) {
            if (err) {
                return res.jSend.serverError(err);
            }
            asyn.map(data, getComponentResource, function (err, data) {
                    if (err) {
                        return res.jSend.serverError(err);
                    }
                    res.jSend(_.compact(data));
                });
            });
        });

router.route('/:resource')
    .get(function (req, res) {
        getComponentResource(req.params.resource, function (err, data) {
            if (err) {
                return res.jSend.serverError(err);
            }
            res.jSend(data);
        });
    });

module.exports = router;
