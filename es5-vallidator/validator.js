
validator = (function () {
    "use strict";

    var _hierarchy = [],
        _contextObject = {},
        _validatedFields = [];

    return {
        reset: reset,
        pushContext: pushContext,
        popContext: popContext,
        check: check
    }

    function reset(contextObject, description) {
        _hierarchy = [];
        _contextObject = {};
        _validatedFields = [];

        pushContext(contextObject, description)

        return this
    }

    function pushContext(contextObject, description) {
        if (isNullOrUndefined(contextObject)) {
            error('Invalid context object')
        }

        _contextObject = contextObject;
        _hierarchy.push(description);
        _validatedFields = [];

        return this
    }

    function popContext() {
        _hierarchy.pop()

        return this
    }

    function check(fieldName, options) {
        var val = _contextObject[fieldName];

        if (!isObject(options)) {
            options = { req: true, type: options }
        }

        if (isNullOrUndefined(options.req)) {
            options.req = true;
        }

        if (isNullOrUndefined(val)) {
            if (options.req) {
                error(fieldName, ': required but missing')
            } else {
                return this
            }
        }

        if (options.req && isNullOrUndefined(val)) {
            error(fieldName, ': required but missing')
        }

        if (options.type === String) {
            if (!isString(val)) {
                error(fieldName, ': Expected String')
            }
            var length = val.length;
            if (isNumber(options.min) && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (isNumber(options.max) && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!isNumber(val)) {
                error(fieldName, ': Expected Number')
            }
            if (isNumber(options.min) && val < options.min) {
                error(fieldName, ': Expected >= ', options.min, ' but is ', val)
            }
            if (isNumber(options.max) && val > options.max) {
                error(fieldName, ': Expected <= ', options.max, ' but is ', val)
            }
        } else if (options.type === Boolean) {
            if (!isBoolean(val)) {
                error(fieldName, ': Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!isObject(val)) {
                error(fieldName, ': Expected Object')
            }

            if (isNumber(options.size) && Object.keys(val).length !== options.size) {
                error(fieldName, ': Expected size ', options.size, ' but size is ', val.length)
            }
            var length = Object.keys(val).length;
            if (isNumber(options.min) && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (isNumber(options.max) && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Array) {
            if (!isArray(val)) {
                error(fieldName, ': Expected Array')
            }

            var length = val.length;
            if (isNumber(options.min) && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (isNumber(options.max) && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type) {
            error(fieldName, ': Unknown type "', options.type, '"')
        }

        if (isArray(options.enum) && options.enum.indexOf(val) === -1) {
            error(fieldName, ': "', val, '" not in ', JSON.stringify(options.enum))
        }

        _validatedFields.push(fieldName);

        return this
    }

    function wrapInContext(description, fn) {
        pushContext(_contextObject, fieldName)
        try {
            fn()
        } catch(ex) {
            popContext()
            throw ex
        }
        popContext()
        return this
    }

    function error(/*...*/) {
        var args = Array.prototype.slice.call(arguments);
        throw _hierarchy.join('/') + '/' + args.join('')
    }

    function isNumber(value) {
        return Object.prototype.toString.call(value) === '[object Number]'
    }

    function isArray(value) {
        return Object.prototype.toString.call(value) === '[object Array]';
    }

    function isString(value) {
        return Object.prototype.toString.call(value) === "[object String]"
    }

    function isBoolean(value) {
        return Object.prototype.toString.call(value) === '[object Boolean]'
    }

    function isNullOrUndefined(value) {
        return Object.prototype.toString.call(value) === '[object Undefined]'
            || Object.prototype.toString.call(value) === '[object Null]'
    }

    function isObject(value) {
        return Object.prototype.toString.call(value) === '[object Object]'
    }

    function isRegExp(value) {
        return Object.prototype.toString.call(value) === '[object RegExp]'
    }

})();