describe("Player", function() {
    it('Should validate valid props', function() {
        var data = {
            aString: 'abc',
            aNumber: 123,
            aBoolean: true,
            anArray: [1, 2, 3]
        };

        new Validator(data, 'data')
            .check('aString', String)
            .check('aNumber', Number)
            .check('aBoolean', Boolean)
            .check('anArray', Array)
            .popContext()

        expect().nothing();
    });

    it('Should validate String', function() {
        expect(function () {
            new Validator({ str: 123 }, 'data').check('str', String)
        }).toThrow('data/str: Expected String');

        expect(function () {
            new Validator({ str: null }, 'data').check('str', String)
        }).toThrow('data/str: required but missing');

        expect(function () {
            new Validator({}, 'data').check('str', String)
        }).toThrow('data/str: required but missing');
    });

    it('Should have sensible default for "req" option', function() {
        new Validator({ str: 'val' }, 'data').check('str', String)

        expect(function () {
            new Validator({}, 'data').check('str', String)
        }).toThrow('data/str: required but missing');

        new Validator({}, 'data').check('str', { req: false, type: String })
        new Validator({ str: null }, 'data').check('str', { req: false, type: String })
        new Validator({ str: undefined }, 'data').check('str', { req: false, type: String })
    });

    it('Should validate enum', function() {
        new Validator({ str: 'V1' }, 'data').check('str', { enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 123 }, 'data').check('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "123" not in ["V1","V2"]');

        new Validator({ str: null }, 'data').check('str', { req: false, enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 'V3' }, 'data').check('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "V3" not in ["V1","V2"]');
    });
});
