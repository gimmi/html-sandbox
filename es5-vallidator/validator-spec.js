describe("Player", function() {
    var validator;

    beforeEach(function() {
      validator = new Validator();
    });

    it('Should validate valid props', function() {
        var data = {
            aString: 'abc',
            aNumber: 123,
            aBoolean: true,
            anArray: [1, 2, 3]
        };

        validator.reset(data, 'data')
            .check('aString', String)
            .check('aNumber', Number)
            .check('aBoolean', Boolean)
            .check('anArray', Array)
            .popContext()

        expect().nothing();
    });

    it('Should validate String', function() {
        expect(function () {
            validator.reset({ str: 123 }, 'data').check('str', String)
        }).toThrow('data/str: Expected String');

        expect(function () {
            validator.reset({ str: null }, 'data').check('str', String)
        }).toThrow('data/str: required but missing');

        expect(function () {
            validator.reset({}, 'data').check('str', String)
        }).toThrow('data/str: required but missing');
    });

    it('Should have sensible default for "req" option', function() {
        validator.reset({ str: 'val' }, 'data').check('str', String)

        expect(function () {
            validator.reset({}, 'data').check('str', String)
        }).toThrow('data/str: required but missing');

        validator.reset({}, 'data').check('str', { req: false, type: String })
        validator.reset({ str: null }, 'data').check('str', { req: false, type: String })
        validator.reset({ str: undefined }, 'data').check('str', { req: false, type: String })
    });

    it('Should validate enum', function() {
        validator.reset({ str: 'V1' }, 'data').check('str', { enum: ['V1', 'V2'] })

        expect(function () {
            validator.reset({ str: 123 }, 'data').check('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "123" not in ["V1","V2"]');

        validator.reset({ str: null }, 'data').check('str', { req: false, enum: ['V1', 'V2'] })

        expect(function () {
            validator.reset({ str: 'V3' }, 'data').check('str', { enum: ['V1', 'V2'] })
        }).toThrow('data/str: "V3" not in ["V1","V2"]');
    });
});
