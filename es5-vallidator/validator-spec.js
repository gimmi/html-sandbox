/* jshint esversion: 5, asi: true, curly: true */
/* globals Validator, describe, it, expect */

describe("Validator", function() {
    "use strict";

    it('Should validate valid props', function() {
        var data = {
            aString: 'abc',
            aNumber: 123,
            aBoolean: true,
            anArray: [1, 2, 3]
        };

        new Validator(data)
            .checkKey('aString', String)
            .checkKey('aNumber', Number)
            .checkKey('aBoolean', Boolean)
            .checkKey('anArray', Array)

        expect().nothing();
    });

    it('Should validate String', function() {
        expect(function () {
            new Validator({ str: 123 }).checkKey('str', String)
        }).toThrow('/str: Expected String');

        expect(function () {
            new Validator({ str: null }).checkKey('str', String)
        }).toThrow('/str: required but missing');

        expect(function () {
            new Validator({}).checkKey('str', String)
        }).toThrow('/str: required but missing');
    });

    it('Should have sensible default for "req" option', function() {
        new Validator({ str: 'val' }).checkKey('str', String)

        expect(function () {
            new Validator({}).checkKey('str', String)
        }).toThrow('/str: required but missing');

        new Validator({}).checkKey('str', { req: false, type: String })
        new Validator({ str: null }).checkKey('str', { req: false, type: String })
        new Validator({ str: undefined }).checkKey('str', { req: false, type: String })
    });

    it('Should validate enum', function() {
        new Validator({ str: 'V1' }).checkKey('str', { enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 123 }).checkKey('str', { enum: ['V1', 'V2'] })
        }).toThrow('/str: 123 not in ["V1","V2"]');

        new Validator({ str: null }).checkKey('str', { req: false, enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 'V3' }).checkKey('str', { enum: ['V1', 'V2'] })
        }).toThrow('/str: "V3" not in ["V1","V2"]');

        new Validator(1).check({ enum: [1, 2, 3] })

        expect(function () {
            new Validator(4).check({ enum: [1, 2, 3] })
        }).toThrow('/: 4 not in [1,2,3]');
    });

    it('Should validate enum when passing array', function() {
        new Validator('V1').check(['V1', 'V2'])

        expect(function () {
            new Validator(123).check(['V1', 'V2'])
        }).toThrow('/: 123 not in ["V1","V2"]');
    });

    it('Should navigate tree', function() {
        var tree = {
            id: '/',
            ary: [{
                id: 'ary1',
                obj: {
                    id: 'obj',
                }
            }]
        }
        new Validator(tree).check(Object, function (validator, value) {
            expect(value.id).toBe('/');
            validator.checkKey('id', String)
                .checkKey('ary', Array, function (validator, value) {
                    expect(value.id).toBe('ary1');
                    validator.check(Object)
                    validator.checkKey('id', String)
                        .checkKey('obj', Object, function (validator, value) {
                            expect(value.id).toBe('obj');
                            validator.checkKey('id', String)
                            expect(function () {
                                validator.checkKey('name', String)
                            }).toThrow('/ary/0/obj/name: required but missing')
                        })
                })
        })
    });

    it('Should allow custom contextual error', function() {
        var data = {
            field1: [{
                field2: {
                    field3: 'value'
                }
            }]
        }
        expect(function () {
            new Validator(data).checkKey('field1', Array, function (validator) {
                validator.checkKey('field2', Object, function (validator) {
                    validator.error('custom error');
                })
            })
        }).toThrow('/field1/0/field2: custom error');
    });

    it('Should validate against regex', function() {
        new Validator('abc').check(/^[a-z]+$/)

        expect(function () {
            new Validator('abc123').check(/^[a-z]+$/)
        }).toThrow('/: does not match /^[a-z]+$/');

        expect(function () {
            new Validator(123).check({ regex: /^[a-z]+$/ })
        }).toThrow('/: does not match /^[a-z]+$/');

        expect(function () {
            new Validator('abc123').check({ regex: /^[a-z]+$/ })
        }).toThrow('/: does not match /^[a-z]+$/');

        new Validator(null).check({ req: false, regex: /^[a-z]+$/ })
    });

    it('Should detect extra keys', function() {
        var data = { f1: 1, f2: 2, f3: 3}

        new Validator(data)
            .checkKey('f1', Number)
            .checkKey('f2', Number)
            .checkKey('f3', Number)
            .checkNoMoreKeys()

        expect(function () {
            new Validator(data)
                .checkKey('f1', Number)
                .checkNoMoreKeys()
        }).toThrow('/: Unexpected extra keys: ["f2","f3"]');

        data = {
            f1: 1,
            fn1: function () {},
            fn2: function () {}
        }

        expect(function () {
            new Validator(data)
                .checkKey('f1', Number)
                .checkNoMoreKeys()
        }).toThrow('/: Unexpected extra keys: ["fn1","fn2"]');

        new Validator(data)
            .checkKey('f1', Number)
            .checkNoMoreKeys({ skipFn: true })

        new Validator(123).checkNoMoreKeys()
        new Validator(null).checkNoMoreKeys()
        new Validator(undefined).checkNoMoreKeys()
    });

    it('Should detect non unique values', function() {
        expect(function () {
            new Validator(123)
                .checkUnique(1)
                .checkUnique(2)
                .checkUnique(3)
                .checkUnique(1)
        }).toThrow('/: duplicate value detected: 1');
    });
});
