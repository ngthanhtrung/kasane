'use strict';

var expect = require('chai').expect,
    kasane = require('../lib/kasane');

describe('kasane', function () {

    describe('.use', function () {

        it('should throw errors if `path` argument is not a string', function () {
            try {
                kasane().use(1, function () {});
            } catch (err) {
                expect(err).to.be.instanceOf(Error);
            }
        });

        it('should throw errors if `dispatcher` argument is not a function', function () {
            try {
                kasane().use('/', 1);
            } catch (err) {
                expect(err).to.be.instanceOf(Error);
            }
        });

        it('should add middleware successfully', function () {
            kasane().use(function () {});
            kasane().use('/test', function () {});
        });

    });

});
