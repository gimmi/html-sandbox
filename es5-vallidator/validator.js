Validator = function (contextObject, hierarchy) {
    "use strict";

    if (is(contextObject, 'Null', 'Undefined')) {
        throw 'Invalid context object'
    }

    if (!is(hierarchy, 'Array')) {
        hierarchy = [hierarchy]
    }

    var _hierarchy = hierarchy,
        _contextObject = contextObject,
        _validatedFields = [],
        _this = Object.assign(this, {
            pushContext: pushContext,
            popContext: popContext,
            check: check,
        });


    function pushContext(contextObject, description) {
        if (is(contextObject, 'Null', 'Undefined')) {
            error('Invalid context object')
        }

        _contextObject = contextObject;
        _hierarchy.push(description);
        _validatedFields = [];

        return _this
    }

    function popContext() {
        _hierarchy.pop()

        return _this
    }

    function check(fieldName, options, nestedFn) {
        var val = _contextObject[fieldName];

        if (!is(options, 'Object')) {
            options = { req: true, type: options }
        }

        if (is(options.req, 'Null', 'Undefined')) {
            options.req = true;
        }

        if (is(val, 'Null', 'Undefined')) {
            if (options.req) {
                error(fieldName, ': required but missing')
            } else {
                return _this
            }
        }

        if (options.req && is(val, 'Null', 'Undefined')) {
            error(fieldName, ': required but missing')
        }

        if (options.type === String) {
            if (!is(val, 'String')) {
                error(fieldName, ': Expected String')
            }
            var length = val.length;
            if (is(options.min, 'Number') && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!is(val, 'Number')) {
                error(fieldName, ': Expected Number')
            }
            if (is(options.min, 'Number') && val < options.min) {
                error(fieldName, ': Expected >= ', options.min, ' but is ', val)
            }
            if (is(options.max, 'Number') && val > options.max) {
                error(fieldName, ': Expected <= ', options.max, ' but is ', val)
            }
        } else if (options.type === Boolean) {
            if (!is(val, 'Boolean')) {
                error(fieldName, ': Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!is(val, 'Object')) {
                error(fieldName, ': Expected Object')
            }

            if (is(options.size, 'Number') && Object.keys(val).length !== options.size) {
                error(fieldName, ': Expected size ', options.size, ' but size is ', val.length)
            }
            var length = Object.keys(val).length;
            if (is(options.min, 'Number') && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Array) {
            if (!is(val, 'Array')) {
                error(fieldName, ': Expected Array')
            }

            var length = val.length;
            if (is(options.min, 'Number') && length < options.min) {
                error(fieldName, ': Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error(fieldName, ': Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type) {
            error(fieldName, ': Unknown type "', options.type, '"')
        }

        if (is(options.enum, 'Array') && options.enum.indexOf(val) === -1) {
            error(fieldName, ': "', val, '" not in ', JSON.stringify(options.enum))
        }

        _validatedFields.push(fieldName);

        if (is(nestedFn, 'Function') && is(val, 'Array')) {
            val.forEach(function (nestedVal, nestedIndex) {
                var nestedHierarchy = _hierarchy.concat(fieldName).concat(nestedIndex);
                var nestedValidator = new Validator(nestedVal, nestedHierarchy);
                nestedFn(nestedValidator, nestedVal)
            })
        } else if (is(nestedFn, 'Function') && is(val, 'Object')) {
            var nestedHierarchy = _hierarchy.concat(fieldName);
            var nestedValidator = new Validator(val, nestedHierarchy);
            nestedFn(nestedValidator, val)
        }

        return _this
    }

    function error(/* msg... */) {
        var args = Array.prototype.slice.call(arguments);
        throw _hierarchy.join('/') + '/' + args.join('')
    }

    function is(/* value, type... */) {
        var args = Array.prototype.slice.call(arguments),
            value = Object.prototype.toString.call(args.shift());

        return args.map(function (x) { return '[object ' + x + ']' })
            .indexOf(value) !== -1;
    }
};