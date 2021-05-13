// MIT Licensed, full details here: https://gimmi.mit-license.org

/* global Validator:writable */

Validator = function (value, hierarchy) {
    "use strict";

    var _this = this,
        _value = value,
        _hierarchy = hierarchy || [],
        _checkedKeys = [];

        _this.check = check;
        _this.checkKey = checkKey;
        _this.error = error;
        _this.checkNoMoreKeys = checkNoMoreKeys;
        _this.getUnckeckedKeys = getUnckeckedKeys;

    function checkKey(name, options, nestedFn) {
        _checkedKeys.push(name);
        new Validator(_value[name], _hierarchy.concat(name))
            .check(options, nestedFn);

        return _this
    }

    function checkNoMoreKeys(options) {
        var uncheckedKeys = getUnckeckedKeys(options)

        if (uncheckedKeys.length > 0) {
            error('Unexpected extra keys: ' + JSON.stringify(uncheckedKeys))
        }

        return _this
    }

    function getUnckeckedKeys(options) {
        options = options || {};

        var allKeys = [];
        if (Validator.isObject(_value)) {
            allKeys = Object.keys(_value)
        } else if (Validator.isArray(_value)) {
            allKeys = _value.map(function (_, index) { return index })
        }

        if (options.skipFn) {
            allKeys = allKeys.filter(function (key) { return !Validator.isFunction(_value[key])  })
        }

        if (options.skip) {
            allKeys = allKeys.filter(function (key) { return options.skip.indexOf(key) === -1 })
        }

        return allKeys.filter(function (key) {
            return _checkedKeys.indexOf(key) === -1
        })
    }

    function check(options, nestedFn) {
        if (Validator.isRegExp(options)) {
            options = { req: true, type: String, regex: options }
        }

        if (Validator.isArray(options)) {
            options = { req: true, enum: options }
        }

        if (!Validator.isObject(options)) {
            options = { req: true, type: options }
        }

        if (Validator.isNullOrUndefined(options.req)) {
            options.req = true;
        }

        if (Validator.isNullOrUndefined(_value)) {
            if (options.req) {
                error('required but missing')
            } else {
                return _this
            }
        }

        if (options.type === String) {
            if (!Validator.isString(_value)) {
                error('Expected String')
            }
            var length = _value.length;
            if (Validator.isNumber(options.min) && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (Validator.isNumber(options.max) && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!Validator.isNumber(_value)) {
                error('Expected Number')
            }
            if (Validator.isNumber(options.min) && _value < options.min) {
                error('Expected >= ', options.min, ' but is ', _value)
            }
            if (Validator.isNumber(options.max) && _value > options.max) {
                error('Expected <= ', options.max, ' but is ', _value)
            }
        } else if (options.type === Boolean) {
            if (!Validator.isBoolean(_value)) {
                error('Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!Validator.isObject(_value)) {
                error('Expected Object')
            }
            var keysLength = Object.keys(_value).length;
            if (Validator.isNumber(options.min) && keysLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', keysLength)
            }
            if (Validator.isNumber(options.max) && keysLength > options.max) {
                error('Expected length <= ', options.max, ' but is ', keysLength)
            }
        } else if (options.type === Array) {
            if (!Validator.isArray(_value)) {
                error('Expected Array')
            }

            var arrayLength = _value.length;
            if (Validator.isNumber(options.min) && arrayLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', _value.length)
            }
            if (Validator.isNumber(options.max) && _value.length > options.max) {
                error('Expected length <= ', options.max, ' but is ', _value.length)
            }
        } else if (options.type) {
            error('Unknown type "', options.type, '"')
        }

        if (Validator.isArray(options.enum) && options.enum.indexOf(_value) === -1) {
            error(JSON.stringify(_value), ' not in ', JSON.stringify(options.enum))
        }

        if (Validator.isRegExp(options.regex) && !options.regex.test(_value)) {
            error('does not match ' + options.regex)
        }

        if (Validator.isFunction(nestedFn)) {
            if (Validator.isArray(_value)) {
                _value.forEach(function (nestedVal, nestedIndex) {
                    var nestedHierarchy = _hierarchy.concat(nestedIndex);
                    var nestedValidator = new Validator(nestedVal, nestedHierarchy);
                    nestedFn(nestedValidator, nestedVal)
                })
            } else {
                nestedFn(_this, _value)
            }
        }

        return _this
    }

    function error(/* msg... */) {
        var args = Array.prototype.slice.call(arguments);
        throw '/' + _hierarchy.join('/') + ': ' + args.join('')
    }
};

Validator.isString = function (val) { return typeof val === 'string' }

Validator.isNumber = function (val) { return typeof val === 'number' }

Validator.isRegExp = function (val) { return val instanceof RegExp }

Validator.isBoolean = function (val) { return val === true || val === false }

Validator.isFunction = function (val) { return typeof val === 'function' }

Validator.isNullOrUndefined = function (val) { return val === null || typeof val === 'undefined' }

Validator.isArray = Array.isArray

Validator.isObject = function (val) {
    return val !== null
        && !Array.isArray(val)
        && !(val instanceof RegExp)
        && typeof val === 'object'
}
