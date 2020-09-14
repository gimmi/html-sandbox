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
        if (isObject(_value)) {
            allKeys = Object.keys(_value)
        } else if (isArray(_value)) {
            allKeys = _value.map(function (_, index) { return index })
        }

        if (options.skipFn) {
            allKeys = allKeys.filter(function (key) { return !isFunction(_value[key])  })
        }

        if (options.skip) {
            allKeys = allKeys.filter(function (key) { return options.skip.indexOf(key) === -1 })
        }

        return allKeys.filter(function (key) {
            return _checkedKeys.indexOf(key) === -1
        })
    }

    function check(options, nestedFn) {
        if (isRegExp(options)) {
            options = { req: true, type: String, regex: options }
        }

        if (isArray(options)) {
            options = { req: true, enum: options }
        }

        if (!isObject(options)) {
            options = { req: true, type: options }
        }

        if (isNullOrUndefined(options.req)) {
            options.req = true;
        }

        if (isNullOrUndefined(_value)) {
            if (options.req) {
                error('required but missing')
            } else {
                return _this
            }
        }

        if (options.req && isNullOrUndefined(_value)) {
            error('required but missing')
        }

        if (options.type === String) {
            if (!isString(_value)) {
                error('Expected String')
            }
            var length = _value.length;
            if (isNumber(options.min) && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (isNumber(options.max) && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!isNumber(_value)) {
                error('Expected Number')
            }
            if (isNumber(options.min) && _value < options.min) {
                error('Expected >= ', options.min, ' but is ', _value)
            }
            if (isNumber(options.max) && _value > options.max) {
                error('Expected <= ', options.max, ' but is ', _value)
            }
        } else if (options.type === Boolean) {
            if (!isBoolean(_value)) {
                error('Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!isObject(_value)) {
                error('Expected Object')
            }
            var keysLength = Object.keys(_value).length;
            if (isNumber(options.min) && keysLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', keysLength)
            }
            if (isNumber(options.max) && keysLength > options.max) {
                error('Expected length <= ', options.max, ' but is ', keysLength)
            }
        } else if (options.type === Array) {
            if (!isArray(_value)) {
                error('Expected Array')
            }

            var arrayLength = _value.length;
            if (isNumber(options.min) && arrayLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', _value.length)
            }
            if (isNumber(options.max) && _value.length > options.max) {
                error('Expected length <= ', options.max, ' but is ', _value.length)
            }
        } else if (options.type) {
            error('Unknown type "', options.type, '"')
        }

        if (isArray(options.enum) && options.enum.indexOf(_value) === -1) {
            error(JSON.stringify(_value), ' not in ', JSON.stringify(options.enum))
        }

        if (isRegExp(options.regex) && !options.regex.test(_value)) {
            error('does not match ' + options.regex)
        }

        if (isFunction(nestedFn)) {
            if (isArray(_value)) {
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

    function isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]'
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]'
    }

    function isRegExp(value) {
        return Object.prototype.toString.call(value) === '[object RegExp]'
    }

    function isString(value) {
        return Object.prototype.toString.call(value) === '[object String]'
    }

    function isNumber(value) {
        return Object.prototype.toString.call(value) === '[object Number]'
    }

    function isBoolean(value) {
        return Object.prototype.toString.call(value) === '[object Boolean]'
    }

    function isFunction(value) {
        return Object.prototype.toString.call(value) === '[object Function]'
    }

    function isNullOrUndefined(value) {
        var toString = Object.prototype.toString.call(value)
        return toString === '[object Null]' || toString === '[object Undefined]'
    }
};
