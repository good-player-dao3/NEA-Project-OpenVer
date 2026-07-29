class ScriptModule {
    constructor(filename, parent, require){
        this.filename = filename;
        this.parent = parent;
        this.require = require;
        this.children = [];
        this.exports = {};
        this.loaded = false;
        this.id = filename;
    }
}