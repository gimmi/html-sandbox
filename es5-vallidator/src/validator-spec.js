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

    it('Should support optional values', function() {
        var nestedFnCalled = false;

        new Validator({}).checkKey('str', { req: false, type: String }, function () { nestedFnCalled = true })
        new Validator({ str: null }).checkKey('str', { req: false, type: String }, function () { nestedFnCalled = true })
        new Validator({ str: undefined }).checkKey('str', { req: false, type: String }, function () { nestedFnCalled = true })

        expect(nestedFnCalled).toBe(false)
    });

    it('Should have sensible default for "req" option', function() {
        new Validator({ str: 'val' }).checkKey('str', String)

        expect(function () {
            new Validator({}).checkKey('str', String)
        }).toThrow('/str: required but missing');
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

    it('Should keep track of unchecked object keys', function() {
        new Validator({ f1: 1, f2: 2, f3: 3})
            .checkKey('f1', Number)
            .checkKey('f2', Number)
            .checkKey('f3', Number)
            .checkNoMoreKeys()

        new Validator({ f1: 1, f2: 2, f3: 3})
            .checkKey('f1', Number)
            .checkNoMoreKeys({ skip: ['f3', 'f2'] })

        expect(function () {
            new Validator({ f1: 1, f2: 2, f3: 3})
                .checkKey('f1', Number)
                .checkNoMoreKeys()
        }).toThrow('/: Unexpected extra keys: ["f2","f3"]');

        expect(function () {
            new Validator({ f1: 1, fn1: function () {}, fn2: function () {} })
                .checkKey('f1', Number)
                .checkNoMoreKeys()
        }).toThrow('/: Unexpected extra keys: ["fn1","fn2"]');

        new Validator({ f1: 1, fn1: function () {}, fn2: function () {} })
            .checkKey('f1', Number)
            .checkNoMoreKeys({ skipFn: true })

        new Validator(123).checkNoMoreKeys()
        new Validator(null).checkNoMoreKeys()
        new Validator(undefined).checkNoMoreKeys()
    });

    it('Should keep track of unchecked array elements', function() {
        var actual;

        actual = new Validator(['first', 'second', 'third'])
            .checkKey(0, String)
            .getUnckeckedKeys()
        expect(actual).toEqual([1, 2])

        actual = new Validator(['first', 'second', 'third'])
            .checkKey(0, String)
            .checkKey(2, String)
            .getUnckeckedKeys()
        expect(actual).toEqual([1])

        actual = new Validator(['first', function() {}, function() {}])
            .checkKey(0, String)
            .getUnckeckedKeys({ skipFn: true })
        expect(actual).toEqual([])

        expect(function () {
            new Validator(['first', 'second', 'third'])
                .checkKey(0, String)
                .checkNoMoreKeys()
        }).toThrow('/: Unexpected extra keys: [1,2]');

        new Validator(['first', 'second', 'third'])
            .checkKey(0, String)
            .checkKey(1, String)
            .checkKey(2, String)
            .checkNoMoreKeys()

        new Validator(['first', 'second', 'third'])
            .checkKey(1, String)
            .checkNoMoreKeys({ skip: [0, 2] })
    });

    it('Should detect type fast', function() {
        expect(Validator.isString('str')).toBe(true)
        expect(Validator.isNumber('str')).toBe(false)
        expect(Validator.isObject('str')).toBe(false)
        expect(Validator.isArray('str')).toBe(false)
        expect(Validator.isRegExp('str')).toBe(false)
        expect(Validator.isBoolean('str')).toBe(false)
        expect(Validator.isFunction('str')).toBe(false)
        expect(Validator.isNullOrUndefined('str')).toBe(false)

        expect(Validator.isString(3.14)).toBe(false)
        expect(Validator.isNumber(3.14)).toBe(true)
        expect(Validator.isObject(3.14)).toBe(false)
        expect(Validator.isArray(3.14)).toBe(false)
        expect(Validator.isRegExp(3.14)).toBe(false)
        expect(Validator.isBoolean(3.14)).toBe(false)
        expect(Validator.isFunction(3.14)).toBe(false)
        expect(Validator.isNullOrUndefined(3.14)).toBe(false)

        expect(Validator.isString({})).toBe(false)
        expect(Validator.isNumber({})).toBe(false)
        expect(Validator.isObject({})).toBe(true)
        expect(Validator.isArray({})).toBe(false)
        expect(Validator.isRegExp({})).toBe(false)
        expect(Validator.isBoolean({})).toBe(false)
        expect(Validator.isFunction({})).toBe(false)
        expect(Validator.isNullOrUndefined({})).toBe(false)

        expect(Validator.isString([])).toBe(false)
        expect(Validator.isNumber([])).toBe(false)
        expect(Validator.isObject([])).toBe(false)
        expect(Validator.isArray([])).toBe(true)
        expect(Validator.isRegExp([])).toBe(false)
        expect(Validator.isBoolean([])).toBe(false)
        expect(Validator.isFunction([])).toBe(false)
        expect(Validator.isNullOrUndefined([])).toBe(false)

        expect(Validator.isString(/abc/)).toBe(false)
        expect(Validator.isNumber(/abc/)).toBe(false)
        expect(Validator.isObject(/abc/)).toBe(false)
        expect(Validator.isArray(/abc/)).toBe(false)
        expect(Validator.isRegExp(/abc/)).toBe(true)
        expect(Validator.isBoolean(/abc/)).toBe(false)
        expect(Validator.isFunction(/abc/)).toBe(false)
        expect(Validator.isNullOrUndefined(/abc/)).toBe(false)

        expect(Validator.isString(true)).toBe(false)
        expect(Validator.isNumber(true)).toBe(false)
        expect(Validator.isObject(true)).toBe(false)
        expect(Validator.isArray(true)).toBe(false)
        expect(Validator.isRegExp(true)).toBe(false)
        expect(Validator.isBoolean(true)).toBe(true)
        expect(Validator.isFunction(true)).toBe(false)
        expect(Validator.isNullOrUndefined(true)).toBe(false)

        expect(Validator.isString(false)).toBe(false)
        expect(Validator.isNumber(false)).toBe(false)
        expect(Validator.isObject(false)).toBe(false)
        expect(Validator.isArray(false)).toBe(false)
        expect(Validator.isRegExp(false)).toBe(false)
        expect(Validator.isBoolean(false)).toBe(true)
        expect(Validator.isFunction(false)).toBe(false)
        expect(Validator.isNullOrUndefined(false)).toBe(false)

        expect(Validator.isString(function(){})).toBe(false)
        expect(Validator.isNumber(function(){})).toBe(false)
        expect(Validator.isObject(function(){})).toBe(false)
        expect(Validator.isArray(function(){})).toBe(false)
        expect(Validator.isRegExp(function(){})).toBe(false)
        expect(Validator.isBoolean(function(){})).toBe(false)
        expect(Validator.isFunction(function(){})).toBe(true)
        expect(Validator.isNullOrUndefined(function(){})).toBe(false)

        expect(Validator.isString(null)).toBe(false)
        expect(Validator.isNumber(null)).toBe(false)
        expect(Validator.isObject(null)).toBe(false)
        expect(Validator.isArray(null)).toBe(false)
        expect(Validator.isRegExp(null)).toBe(false)
        expect(Validator.isBoolean(null)).toBe(false)
        expect(Validator.isFunction(null)).toBe(false)
        expect(Validator.isNullOrUndefined(null)).toBe(true)

        expect(Validator.isString(undefined)).toBe(false)
        expect(Validator.isNumber(undefined)).toBe(false)
        expect(Validator.isObject(undefined)).toBe(false)
        expect(Validator.isArray(undefined)).toBe(false)
        expect(Validator.isRegExp(undefined)).toBe(false)
        expect(Validator.isBoolean(undefined)).toBe(false)
        expect(Validator.isFunction(undefined)).toBe(false)
        expect(Validator.isNullOrUndefined(undefined)).toBe(true)
    })
});
