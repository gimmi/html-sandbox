Validator = function (contextObject, hierarchy) {
    "use strict";

    // if (is(contextObject, 'Null', 'Undefined')) {
    //     throw 'Invalid context object'
    // }

    // if (!is(hierarchy, 'Array')) {
    //     hierarchy = [hierarchy]
    // }

    var _hierarchy = hierarchy,
        _contextObject = contextObject,
        _this = Object.assign(this, {
            checkField: checkField,
            check: check,
        });

    function checkField(fieldName, options, nestedFn) {

        new Validator(_contextObject[fieldName], _hierarchy.concat(fieldName))
            .check(options, nestedFn);

        return _this
    }

    function check(options, nestedFn) {
        if (!is(options, 'Object')) {
            options = { req: true, type: options }
        }

        if (is(options.req, 'Null', 'Undefined')) {
            options.req = true;
        }

        if (is(_contextObject, 'Null', 'Undefined')) {
            if (options.req) {
                error('required but missing')
            } else {
                return
            }
        }

        if (options.req && is(_contextObject, 'Null', 'Undefined')) {
            error('required but missing')
        }

        if (options.type === String) {
            if (!is(_contextObject, 'String')) {
                error('Expected String')
            }
            var length = _contextObject.length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Number) {
            if (!is(_contextObject, 'Number')) {
                error('Expected Number')
            }
            if (is(options.min, 'Number') && _contextObject < options.min) {
                error('Expected >= ', options.min, ' but is ', _contextObject)
            }
            if (is(options.max, 'Number') && _contextObject > options.max) {
                error('Expected <= ', options.max, ' but is ', _contextObject)
            }
        } else if (options.type === Boolean) {
            if (!is(_contextObject, 'Boolean')) {
                error('Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!is(_contextObject, 'Object')) {
                error('Expected Object')
            }

            if (is(options.size, 'Number') && Object.keys(_contextObject).length !== options.size) {
                error('Expected size ', options.size, ' but size is ', _contextObject.length)
            }
            var length = Object.keys(_contextObject).length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type === Array) {
            if (!is(_contextObject, 'Array')) {
                error('Expected Array')
            }

            var length = _contextObject.length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
        } else if (options.type) {
            error('Unknown type "', options.type, '"')
        }

        if (is(options.enum, 'Array') && options.enum.indexOf(_contextObject) === -1) {
            error('"', _contextObject, '" not in ', JSON.stringify(options.enum))
        }

        if (is(nestedFn, 'Function') && is(_contextObject, 'Array')) {
            _contextObject.forEach(function (nestedVal, nestedIndex) {
                var nestedHierarchy = _hierarchy.concat(nestedIndex);
                var nestedValidator = new Validator(nestedVal, nestedHierarchy);
                nestedFn(nestedValidator, nestedVal)
            })
        } else if (is(nestedFn, 'Function') && is(_contextObject, 'Object')) {
            var nestedValidator = new Validator(_contextObject, _hierarchy);
            nestedFn(nestedValidator, _contextObject)
        }
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