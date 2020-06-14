Validator = function (value, hierarchy) {
    "use strict";

    var _value = value,
        _hierarchy = hierarchy || [],
        _this = Object.assign(this, {
            check: check,
            checkField: checkField,
            error: error
        });

    function checkField(name, options, nestedFn) {
        new Validator(_value[name], _hierarchy.concat(name))
            .check(options, nestedFn);

        return _this
    }

    function check(options, nestedFn) {
        if (is(options, 'RegExp')) {
            options = { req: true, type: String, regex: options }
        }

        if (!is(options, 'Object')) {
            options = { req: true, type: options }
        }

        if (is(options.req, 'Null', 'Undefined')) {
            options.req = true;
        }

        if (is(_value, 'Null', 'Undefined')) {
            if (options.req) {
                error('required but missing')
            } else {
                return _this
            }
        }

        if (options.req && is(_value, 'Null', 'Undefined')) {
            error('required but missing')
        }

        if (options.type === String) {
            if (!is(_value, 'String')) {
                error('Expected String')
            }
            var length = _value.length;
            if (is(options.min, 'Number') && length < options.min) {
                error('Expected length >= ', options.min, ' but is ', length)
            }
            if (is(options.max, 'Number') && length > options.max) {
                error('Expected length <= ', options.max, ' but is ', length)
            }
            if (is(options.regex, 'RegExp') && !options.regex.test(_value)) {
                error('does not match ' + options.regex)
            }
        } else if (options.type === Number) {
            if (!is(_value, 'Number')) {
                error('Expected Number')
            }
            if (is(options.min, 'Number') && _value < options.min) {
                error('Expected >= ', options.min, ' but is ', _value)
            }
            if (is(options.max, 'Number') && _value > options.max) {
                error('Expected <= ', options.max, ' but is ', _value)
            }
        } else if (options.type === Boolean) {
            if (!is(_value, 'Boolean')) {
                error('Expected Boolean')
            }
        } else if (options.type === Object) {
            if (!is(_value, 'Object')) {
                error('Expected Object')
            }

            if (is(options.size, 'Number') && Object.keys(_value).length !== options.size) {
                error('Expected size ', options.size, ' but size is ', _value.length)
            }
            var keysLength = Object.keys(_value).length;
            if (is(options.min, 'Number') && keysLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', keysLength)
            }
            if (is(options.max, 'Number') && keysLength > options.max) {
                error('Expected length <= ', options.max, ' but is ', keysLength)
            }
        } else if (options.type === Array) {
            if (!is(_value, 'Array')) {
                error('Expected Array')
            }

            var arrayLength = _value.length;
            if (is(options.min, 'Number') && arrayLength < options.min) {
                error('Expected length >= ', options.min, ' but is ', _value.length)
            }
            if (is(options.max, 'Number') && _value.length > options.max) {
                error('Expected length <= ', options.max, ' but is ', _value.length)
            }
        } else if (options.type) {
            error('Unknown type "', options.type, '"')
        }

        if (is(options.enum, 'Array') && options.enum.indexOf(_value) === -1) {
            error('"', _value, '" not in ', JSON.stringify(options.enum))
        }

        if (is(nestedFn, 'Function')) {
            if (is(_value, 'Array')) {
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

    function is(/* value, type... */) {
        var args = Array.prototype.slice.call(arguments),
            value = Object.prototype.toString.call(args.shift());

        return args.map(function (x) { return '[object ' + x + ']' })
            .indexOf(value) !== -1;
    }
};
