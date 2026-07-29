class URL {
    get hash() {
        return this[PARTS].hash;
    }
    set hash(value) {
        value = '' + value;
        if (value.length === 0) {
            this[PARTS].hash = '';
        } else {
            if (value.charAt(0) !== '#') {
                value = '#' + value;
            }
            this[PARTS].hash = '#' + encodeURIComponent(value.substr(1));
        }
    }
    get host() {
        return this.hostname + (this.port ? ':' + this.port : '');
    }
    set host(value) {
        const url = new URL('http://' + value);
        this[PARTS].hostname = url.hostname;
        this[PARTS].port = url.port;
    }
    get hostname() {
        return this[PARTS].hostname;
    }
    set hostname(value) {
        value = value.toString();
        this[PARTS].hostname = encodeURIComponent(value);
    }
    get port() {
        return this[PARTS].port;
    }
    set port(value) {
        const port = parseInt('' + value);
        if (isNaN(port)) {
            this[PARTS].port = '';
        } else {
            this[PARTS].port = Math.max(0, port % (1 << 16)).toString();
        }
    }
    get href() {
        const authentication = this.username || this.password ? this.username + (this.password ? ':' + this.password : '') + '@' : '';
        return this.protocol + '//' + authentication + this.host + this.pathname + this.search + this.hash;
    }
    set href(value) {
        Object.assign(this[PARTS], parse(value));
    }
    get origin() {
        return this.protocol + '//' + this.host;
    }
    get username() {
        return this[PARTS].username;
    }
    set username(value) {
        value = value.toString();
        this[PARTS].username = encodeURIComponent(value);
    }
    get password() {
        return this[PARTS].password;
    }
    set password(value) {
        this[PARTS].password = encodeURIComponent('' + value);
    }
    get pathname() {
        return this[PARTS].path || '/';
    }
    set pathname(value) {
        value = '' + value;
        if (value.length === 0 || value.charAt(0) !== '/') {
            value = '/' + value;
        }
        this[PARTS].path = encodeURIComponent(value).replace(/\%2[fF]/g, '/');
    }
    get protocol() {
        return this[PARTS].protocol + ':';
    }
    set protocol(value) {
        value = '' + value || 'http';
        if (value.charAt(value.length - 1) === ':') {
            value = value.slice(0, -1);
        }
        this[PARTS].protocol = encodeURIComponent(value);
    }
    get search() {
        const s = this[PARTS].query.toString();
        if (s) {
            return '?' + s;
        }
        return s;
    }
    set search(value) {
        const params = new URLSearchParams(value);
        const prev = this[PARTS].query[ENTRIES];
        const next = params[ENTRIES];
        prev.length = 0;
        prev.push.apply(prev, next);
    }
    get searchParams() {
        return this[PARTS].query;
    }
    toString() {
        return this.href;
    }
    toJSON() {
        return this.href;
    }
    constructor(url, base = ''){
        const baseParts = parse(base);
        let urlParts = parse(url);
        if (!urlParts.protocol) {
            urlParts = {
                protocol: baseParts.protocol,
                username: baseParts.username,
                password: baseParts.password,
                hostname: baseParts.hostname,
                port: baseParts.port,
                path: urlParts.path || baseParts.path,
                query: urlParts.query || baseParts.query,
                hash: urlParts.hash
            };
        }
        Object.defineProperty(this, PARTS, {
            value: urlParts,
            writable: false,
            enumerable: false
        });
    }
}