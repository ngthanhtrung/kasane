'use strict';

var EventEmitter = require('events').EventEmitter,
    http = require('http'),

    shien = require('shien'),
    when = require('when'),

    Context = require('./context').Context,
    Request = require('./request').Request,
    Response = require('./response').Response;

var Kasane = module.exports = function () {
    if (!(this instanceof Kasane)) {
        return new Kasane;
    }

    EventEmitter.call(this);

    this.middlewares = [];
};

Kasane.prototype = new function () {

    shien.assign(this, EventEmitter.prototype);

    function convertConnectDispatcher(dispatcher) {
        return function (context) {
            return when.promise(function (resolve, reject) {
                dispatcher(context.req, context.res, function (err) {
                    if (err) {
                        return reject(context.next(err));
                    }

                    resolve(context.next);
                });
            });
        };
    }

    this.use = function (path, dispatcher, options) {
        if (typeof path === 'function') {
            options = dispatcher;
            dispatcher = path;
            path = null;

        } else {
            if (typeof path !== 'string') {
                throw new Error('Path must be a string!');
            }

            if (typeof dispatcher !== 'function') {
                throw new Error('Dispatcher must be a function!');
            }
        }

        var p = (path !== null ? path : ''),
            fn = dispatcher,
            opts = options || {};

        if (opts.connect) {
            fn = convertConnectDispatcher(dispatcher);
            delete opts.connect;
        }

        opts.catch = !!opts.catch;

        this.middlewares.push({
            path: p,
            dispatcher: fn,
            options: opts
        });
    };

    function dispatch(context, index) {
        /* jshint validthis: true */

        var self = this;

        if (index >= this.middlewares.length) {
            if (typeof context.error === 'undefined') {
                return when();
            }

            return when.reject(context.error);
        }

        var middleware = this.middlewares[index],
            path = middleware.path,
            dispatcher = middleware.dispatcher,
            options = middleware.options,

            matched = true;

        if (context.url.slice(0, path.length) !== path ||
                (context.url.length > path.length && context.url.charAt(path.length) !== '/')) {
            matched = false;
        }

        if (matched && (typeof context.error !== 'undefined') !== options.catch) {
            matched = false;
        }

        if (!matched) {
            return when(
                dispatch.call(this, context, index + 1)
            );
        }

        context.url = context.url.slice(path.length);

        return when()
            .then(function () {
                return dispatcher(context);
            })
            .then(
                function (res) {
                    if (res === context.next) {
                        context.url = path + context.url;
                        return dispatch.call(self, context, index + 1);
                    }

                    if (res instanceof context.next) {
                        throw res;
                    }

                    if (typeof context.error !== 'undefined') {
                        delete context.error;
                    }
                },
                function (err) {
                    context.url = path + context.url;
                    context.error = (err instanceof context.next ? err.error : err);
                    return dispatch.call(self, context, index + 1);
                }
            );
    }

    this.handle = function () {
        var self = this;

        return function (req, res) {
            var context = new Context(req, res);

            self.emit('new', context);
            context.originalUrl = context.url;

            dispatch.call(self, context, 0).done();
        };
    };

    this.listen = function (port) {
        if (typeof port !== 'number') {
            throw new Error('Port must be a number!');
        }

        var self = this;

        return when.promise(function (resolve, reject) {
            http.createServer(self.handle())
                .listen(port, function (err) {
                    return (err ? reject(err) : resolve());
                });
        });
    };

};

exports = module.exports;
exports.Context = Context;
exports.Request = Request;
exports.Response = Response;
