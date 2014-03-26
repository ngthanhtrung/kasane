'use strict';

var EventEmitter = require('events').EventEmitter,
    shien = require('shien'),

    Request = require('./request').Request,
    Response = require('./response').Response;

var Context = exports.Context = function (req, res) {
    EventEmitter.call(this);

    this.req = req;
    this.res = res;

    this.request = new Request(this);
    this.response = new Response(this);
};

var proto = Context.prototype = new function () {

    shien.assign(this, EventEmitter.prototype);

    this.next = function (err) {
        if (!err) {
            return this.next;
        }

        if (!(this instanceof this.next)) {
            return new this.next;
        }

        this.error = err;
    };

    this.throw = function (err) {
        if (typeof err === 'number') {
            err = new Error('Bubu gà vãi!');
        }

        throw err;
    };

};

Object.defineProperty(proto, 'url', {
    get: function () {
        return this.req.url;
    },
    set: function (value) {
        return (this.req.url = value);
    }
});

Object.defineProperty(proto, 'originalUrl', {
    get: function () {
        return this.req.originalUrl;
    },
    set: function (value) {
        return (this.req.originalUrl = value);
    }
});

Object.defineProperty(proto, 'path', {
    get: function () {
        return this.url.split('?')[0];
    }
});
