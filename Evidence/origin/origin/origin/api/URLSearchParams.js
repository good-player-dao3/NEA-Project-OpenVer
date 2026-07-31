class URLSearchParams {
    append(name, value) {
        value = '' + value;
        name = '' + name;
        if (name) {
            this[ENTRIES].push({
                key: name,
                value
            });
        }
    }
    delete(name) {
        name = '' + name;
        let ptr = 0;
        for(let i = 0; i < this[ENTRIES].length; ++i){
            if (this[ENTRIES][i].key !== name) {
                this[ENTRIES][ptr++] = this[ENTRIES][i];
            }
        }
        this[ENTRIES].length = ptr;
    }
    get(name) {
        name = '' + name;
        for(let i = 0; i < this[ENTRIES].length; ++i){
            if (this[ENTRIES][i].key === name) {
                return this[ENTRIES][i].value;
            }
        }
        return null;
    }
    getAll(name) {
        const result = [];
        name = '' + name;
        for(let i = 0; i < this[ENTRIES].length; ++i){
            if (this[ENTRIES][i].key === name) {
                result.push(this[ENTRIES][i].value);
            }
        }
        return result;
    }
    forEach(callback) {
        for(let i = 0; i < this[ENTRIES].length; ++i){
            const entry = this[ENTRIES][i];
            callback.call(this, entry.value, entry.key, this);
        }
    }
    has(name) {
        return this.get(name) !== null;
    }
    set(name, value) {
        this.delete(name);
        this.append(name, value);
    }
    keys() {
        const items = [];
        this.forEach(function(_, key) {
            items.push(key);
        });
        return items[Symbol.iterator]();
    }
    values() {
        const items = [];
        this.forEach(function(value) {
            items.push(value);
        });
        return items[Symbol.iterator]();
    }
    entries() {
        const items = [];
        this.forEach(function(value, name) {
            items.push([
                name,
                value
            ]);
        });
        return items[Symbol.iterator]();
    }
    sort() {
        this[ENTRIES].sort((a, b)=>strcmp(a.key, b.key) || strcmp(a.value, b.value));
    }
    toString() {
        let searchString = '';
        this.forEach(function(value, name) {
            if (searchString.length > 0) {
                searchString += '&';
            }
            searchString += encodeQueryComponent(name) + '=' + encodeQueryComponent(value);
        });
        return searchString;
    }
    [Symbol.iterator]() {
        return this.entries();
    }
    constructor(args){
        let init = '';
        if (args instanceof URLSearchParams) {
            init = '' + args.toString();
        } else if (typeof args === 'string') {
            init = args;
        }
        Object.defineProperties(this, {
            [ENTRIES]: {
                enumerable: false,
                writable: false,
                value: []
            }
        });
        const attributes = init.replace(/^\?/, '').split('&');
        for(let i = 0; i < attributes.length; i++){
            const attribute = attributes[i].split('=');
            this.append(decodeURIComponent('' + attribute[0]), attribute.length > 1 ? decodeURIComponent(attribute[1]) : '');
        }
        if (typeof args === 'object') {
            if (Array.isArray(args)) {
                args.forEach((item)=>this.append(item[0], item[1]));
            } else {
                Object.keys(args).forEach((key)=>this.append(key, args[key]));
            }
        }
    }
}