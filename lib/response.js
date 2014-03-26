'use strict';

var Response = exports.Response = function (context) {
    this.context = context;

    context.res.redirect = function (url) {
        this.statusCode = 302;
        this.setHeader('Location', url);
        this.end();
    };
};

Response.prototype = new function () {
};
