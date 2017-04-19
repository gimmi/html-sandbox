function ObjectLocalStorage() {
    var me = this
    var key = ''
    var template = {}

    me.withKey = withKey
    me.withTemplate = withTemplate
    me.load = load
    me.save = save

    function withKey(k) {
        key = k
        return me
    }

    function withTemplate(t) {
        template = JSON.parse(JSON.stringify(t))
        return me
    }

    function load() {
        var storedObj = window.localStorage.getItem(key)
        storedObj = JSON.parse(storedObj || '{}')
        clean(storedObj)
        return storedObj
    }

    function save(obj) {
        obj = JSON.parse(JSON.stringify(obj))
        clean(obj)
        window.localStorage.setItem(key, JSON.stringify(obj))
    }

    function clean(obj) {
        var pname
        for (pname in obj) {
            if (typeof template[pname] !== typeof obj[pname]) {
                delete obj[pname]
            }
        }
        for (pname in template) {
            if (typeof obj[pname] === 'undefined') {
                obj[pname] = template[pname]
            }
        }
    }
}

document.addEventListener('DOMContentLoaded', function() {
    var ols = new ObjectLocalStorage()
        .withKey('test')
        .withTemplate({ a: 1, b: 2 })

    console.dir(ols.load())
    ols.save({ a: 2, b: '2' })
    console.dir(ols.load())
});
