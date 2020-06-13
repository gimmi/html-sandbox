describe("Player", function() {
    it('Should validate valid props', function() {
        var data = {
            aString: 'abc',
            aNumber: 123,
            aBoolean: true,
            anArray: [1, 2, 3]
        };

        new Validator(data, ['data'])
            .checkField('aString', String)
            .checkField('aNumber', Number)
            .checkField('aBoolean', Boolean)
            .checkField('anArray', Array)

        expect().nothing();
    });

    it('Should validate String', function() {
        expect(function () {
            new Validator({ str: 123 }, ['data']).checkField('str', String)
        }).toThrow('data/str: Expected String');

        expect(function () {
            new Validator({ str: null }, ['data']).checkField('str', String)
        }).toThrow('data/str: required but missing');

        expect(function () {
            new Validator({}, ['data']).checkField('str', String)
        }).toThrow('data/str: required but missing');
    });

    it('Should have sensible default for "req" option', function() {
        new Validator({ str: 'val' }, ['data']).checkField('str', String)

        expect(function () {
            new Validator({}, ['data']).checkField('str', String)
        }).toThrow('data/str: required but missing');

        new Validator({}, ['data']).checkField('str', { req: false, type: String })
        new Validator({ str: null }, ['data']).checkField('str', { req: false, type: String })
        new Validator({ str: undefined }, ['data']).checkField('str', { req: false, type: String })
    });

    it('Should validate enum', function() {
        new Validator({ str: 'V1' }, ['data']).checkField('str', { enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 123 }, ['data']).checkField('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "123" not in ["V1","V2"]');

        new Validator({ str: null }, ['data']).checkField('str', { req: false, enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 'V3' }, ['data']).checkField('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "V3" not in ["V1","V2"]');
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
        new Validator(tree, ['tree'])
            .checkField('id', String)
            .checkField('ary', Array, function (validator, value) {
                expect(value.id).toBe('ary1');
                validator.checkField('id', String)
                    .checkField('obj', Object, function (validator, value) {
                        expect(value.id).toBe('obj');
                        validator.checkField('id', String)
                        expect(function () {
                            validator.checkField('name', String)
                        }).toThrow('tree/ary/0/obj/name: required but missing')
                    })
            })
    });
});
