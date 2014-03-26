'use strict';

var Request = exports.Request = function (context) {
    this.context = context;

    Object.defineProperty(context.req, 'path', {
        get: function () {
            return this.url.split('?')[0];
        }
    });
};

Request.prototype = new function () {
};
