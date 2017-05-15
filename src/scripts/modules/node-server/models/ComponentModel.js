/*jslint node:true*/
'use strict';

var thinky = require('../util/thinky.js');
var type = thinky.type;
var _ = require('lodash');

var Component = thinky.createModel('Component', {
    id: type.string(),
    name: type.string().required(),
    title: type.string().default(function () {
        return _.startCase(this.name);
    }),
    span: type.number(),
    min: type.number(),
    max: type.number()
});

module.exports = Component;
