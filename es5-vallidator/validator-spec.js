describe("Player", function() {
    it('Should validate valid props', function() {
        var data = {
            aString: 'abc',
            aNumber: 123,
            aBoolean: true,
            anArray: [1, 2, 3]
        };

        new Validator(data)
            .checkField('aString', String)
            .checkField('aNumber', Number)
            .checkField('aBoolean', Boolean)
            .checkField('anArray', Array)

        expect().nothing();
    });

    it('Should validate String', function() {
        expect(function () {
            new Validator({ str: 123 }).checkField('str', String)
        }).toThrow('/str: Expected String');

        expect(function () {
            new Validator({ str: null }).checkField('str', String)
        }).toThrow('/str: required but missing');

        expect(function () {
            new Validator({}).checkField('str', String)
        }).toThrow('/str: required but missing');
    });

    it('Should have sensible default for "req" option', function() {
        new Validator({ str: 'val' }).checkField('str', String)

        expect(function () {
            new Validator({}).checkField('str', String)
        }).toThrow('/str: required but missing');

        new Validator({}).checkField('str', { req: false, type: String })
        new Validator({ str: null }).checkField('str', { req: false, type: String })
        new Validator({ str: undefined }).checkField('str', { req: false, type: String })
    });

    it('Should validate enum', function() {
        new Validator({ str: 'V1' }).checkField('str', { enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 123 }).checkField('str', { enum: ['V1', 'V2'] })
        }).toThrow('/str: 123 not in ["V1","V2"]');

        new Validator({ str: null }).checkField('str', { req: false, enum: ['V1', 'V2'] })

        expect(function () {
            new Validator({ str: 'V3' }).checkField('str', { enum: ['V1', 'V2'] })
        }).toThrow('/str: "V3" not in ["V1","V2"]');

        new Validator(1).check({ enum: [1, 2, 3] })

        expect(function () {
            new Validator(4).check({ enum: [1, 2, 3] })
        }).toThrow('/: 4 not in [1,2,3]');
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
        new Validator(tree).check(Object, function (validator, value) {
            expect(value.id).toBe('/');
            validator.checkField('id', String)
                .checkField('ary', Array, function (validator, value) {
                    expect(value.id).toBe('ary1');
                    validator.check(Object)
                    validator.checkField('id', String)
                        .checkField('obj', Object, function (validator, value) {
                            expect(value.id).toBe('obj');
                            validator.checkField('id', String)
                            expect(function () {
                                validator.checkField('name', String)
                            }).toThrow('/ary/0/obj/name: required but missing')
                        })
                })
        })
    });

    it('Should allow custom contextual error', function() {
        var data = {
            field1: [{
                field2: {
                    field3: 'value'
                }
            }]
        }
        expect(function () {
            new Validator(data).checkField('field1', Array, function (validator) {
                validator.checkField('field2', Object, function (validator) {
                    validator.error('custom error');
                })
            })
        }).toThrow('/field1/0/field2: custom error');
    });

    it('Should validate against regex', function() {
        new Validator('abc').check(/^[a-z]+$/)
        expect(function () {
            new Validator('abc123').check(/^[a-z]+$/)
        }).toThrow('/: does not match /^[a-z]+$/');
    });

    it('Should detext extra fields', function() {
        var data = { f1: 1, f2: 2, f3: 3}
        
        new Validator(data)
            .checkField('f1', Number)
            .checkField('f2', Number)
            .checkField('f3', Number)
            .checkNoMoreFields()
        
        expect(function () {
            new Validator(data)
                .checkField('f1', Number)
                .checkNoMoreFields()
        }).toThrow('/: Unexpected extra fields: ["f2","f3"]');
    });
});
