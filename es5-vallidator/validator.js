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

        return _this
    }

    function popContext() {
        _hierarchy.pop()

        return _this
    }

    function check(fieldName, options, nestedFn) {
        var val = _contextObject[fieldName];

        _hierarchy.push(fieldName);

        if (!is(options, 'Object')) {
            options = { req: true, type: options }
        }

        if (is(options.req, 'Null', 'Undefined')) {
            options.req = true;
        }

        if (is(val, 'Null', 'Undefined')) {
            if (options.req) {
                error('required but missing')
            } else {
                _hierarchy.pop()
                return _this
            }
        }

        if (options.req && is(val, 'Null', 'Undefined')) {
            error('required but missing')
        }

        if (options.type === String) {
            if (!is(val, 'String')) {
                error('Expected String')
            }
            var length = val.length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!is(val, 'Number')) {
                error('Expected Number')
            }
            if (is(options.min, 'Number') && val < options.min) {
                error('Expected >= ', options.min, ' but is ', val)
            }
            if (is(options.max, 'Number') && val > options.max) {
                error('Expected <= ', options.max, ' but is ', val)
            }
        } else if (options.type === Boolean) {
            if (!is(val, 'Boolean')) {
                error('Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!is(val, 'Object')) {
                error('Expected Object')
            }

            if (is(options.size, 'Number') && Object.keys(val).length !== options.size) {
                error('Expected size ', options.size, ' but size is ', val.length)
            }
            var length = Object.keys(val).length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Array) {
            if (!is(val, 'Array')) {
                error('Expected Array')
            }

            var length = val.length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type) {
            error('Unknown type "', options.type, '"')
        }

        if (is(options.enum, 'Array') && options.enum.indexOf(val) === -1) {
            error('"', val, '" not in ', JSON.stringify(options.enum))
        }

        if (is(nestedFn, 'Function') && is(val, 'Array')) {
            val.forEach(function (nestedVal, nestedIndex) {
                var nestedHierarchy = _hierarchy.concat(nestedIndex);
                var nestedValidator = new Validator(nestedVal, nestedHierarchy);
                nestedFn(nestedValidator, nestedVal)
            })
        } else if (is(nestedFn, 'Function') && is(val, 'Object')) {
            var nestedValidator = new Validator(val, _hierarchy);
            nestedFn(nestedValidator, val)
        }

        _hierarchy.pop()
        return _this
    }

    function error(/* msg... */) {
        var args = Array.prototype.slice.call(arguments);
        throw _hierarchy.join('/') + ': ' + args.join('')
    }

    function is(/* value, type... */) {
        var args = Array.prototype.slice.call(arguments),
            value = Object.prototype.toString.call(args.shift());

        return args.map(function (x) { return '[object ' + x + ']' })
            .indexOf(value) !== -1;
    }
};