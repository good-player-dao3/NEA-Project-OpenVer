class ScriptResourceSync {
    normalizePath(path) {
        return this.parseAbsolutePath(path).join('/');
    }
    synchronizeResources(state) {
        this.hashToPath = {};
        this.pathToHash = {};
        this.pathToHash[''] = new ScriptResource('', '', GameAssetType.DIRECTORY);
        Object.keys(state.resources).forEach((path)=>{
            let parent = null;
            const subPaths = path.split('/');
            for(let i = 0; i < subPaths.length; ++i){
                const prefix = subPaths.slice(0, i).join('/');
                if (prefix in this.pathToHash) {
                    parent = this.pathToHash[prefix];
                    continue;
                }
                const child = this.pathToHash[prefix] = new ScriptResource(prefix, '', GameAssetType.DIRECTORY);
                if (parent) {
                    parent.children.push(child);
                    parent = child;
                }
            }
            const info = state.resources[path];
            const resource = new ScriptResource(path, info.hash, gameResourceType(info.type));
            if (parent) {
                parent.children.push(resource);
            }
            this.hashToPath[info.hash] = resource;
            this.pathToHash[path] = resource;
        });
        this.moduleCache = {};
        this.moduleSource = {};
        Object.keys(state.modules).forEach((mod)=>{
            this.moduleSource[mod] = state.modules[mod];
        });
        this.fileToMeshId = {};
        this.fileToMotions = {};
        this.fileToRigidBodyOffset = {};
        this.fileToRenderBoxOffset = {};
        this.meshIdToFile.length = 0;
        state.meshTable.forEach((file, i)=>{
            if (file) {
                this.fileToMeshId[file] = i;
                this.meshIdToFile.push(file);
                const scriptResource = this.pathToHash[file];
                if (!scriptResource) {
                    return;
                }
                const motionList = state.meshMotions[scriptResource.hash];
                if (motionList) {
                    this.fileToMotions[file] = motionList.map((motion)=>{
                        return new ScriptMeshMotion(motion.id, motion.name, motion.duration);
                    });
                }
                const rigidBodyOffset = state.meshRigidBodyOffset[scriptResource.hash];
                if (rigidBodyOffset) {
                    this.fileToRigidBodyOffset[file] = [
                        rigidBodyOffset[0],
                        rigidBodyOffset[1],
                        rigidBodyOffset[2]
                    ];
                }
                const renderBoxOffset = state.meshRenderBoxOffset[scriptResource.hash];
                if (renderBoxOffset) {
                    this.fileToRenderBoxOffset[file] = [
                        renderBoxOffset[0],
                        renderBoxOffset[1],
                        renderBoxOffset[2]
                    ];
                }
            } else {
                this.meshIdToFile.push('');
            }
        });
        this.nameToSkinId = {};
        this.skinIdToName.length = 0;
        this.defaultSkinName = undefined;
        state.skinTable.forEach((name, i)=>{
            if (name) {
                this.nameToSkinId[name] = i;
                this.skinIdToName.push(name);
            } else {
                this.skinIdToName.push(undefined);
            }
        });
        this.defaultSkinName = this.getSkinFileName(state.defaultSkinId);
        Object.assign(this.defaultGamepadPath, PlayerGamepadSchema.toJSON(state.defaultGamepadPath));
    }
    parseAbsolutePath(path) {
        const parts = path.split('/');
        const result = [];
        for(let i = 0; i < parts.length; ++i){
            const p = parts[i];
            if (p === '' || p === '.') {
                continue;
            } else if (p === '..') {
                result.pop();
            } else {
                result.push(p);
            }
        }
        return result;
    }
    loadModule(_filename, parent) {
        const parts = this.parseAbsolutePath(_filename);
        const filename = parts.join('/');
        if (!(filename in this.moduleSource)) {
            throw new Error(`error loading module: ${filename}, module not found`);
        }
        const prefix = parts.slice(0, parts.length - 1);
        const dirname = prefix.join('/');
        const resolve = (_path)=>{
            const path = '' + (_path || '');
            let finalPath;
            if (path.length > 0) {
                switch(path.charAt(0)){
                    case '.':
                        finalPath = prefix.slice();
                        break;
                    case '/':
                        finalPath = [];
                        break;
                    default:
                        finalPath = [
                            'node_modules'
                        ];
                        break;
                }
            } else {
                finalPath = parts.slice();
            }
            path.split('/').forEach((dir)=>{
                if (dir === '.') {
                    return;
                } else if (dir === '..') {
                    finalPath.pop();
                } else if (dir === '') {
                    finalPath.length = 0;
                } else {
                    finalPath.push(dir);
                }
            });
            let relativePath = finalPath.join('/');
            const asset = this.pathToHash[relativePath];
            if (asset && asset.type === GameAssetType.DIRECTORY) {
                relativePath += '/index.js';
            }
            return relativePath;
        };
        const self = this;
        const moduleInfo = this.moduleCache[filename] = new ScriptModule(filename, parent, require);
        if (parent) {
            parent.children.push(moduleInfo);
        }
        function require(_path) {
            const path = resolve(_path);
            if (path in self.moduleCache) {
                return self.moduleCache[path].exports;
            }
            return self.loadModule(path, moduleInfo);
        }
        Object.assign(require, {
            resolve
        });
        const resources = new GameResourceSystem(this.ls);
        const moduleEnvironment = {
            __dirname: dirname,
            __filename: filename,
            require,
            resources,
            module: moduleInfo,
            exports: moduleInfo.exports
        };
        this.evalFuncs.module(moduleEnvironment, this.moduleSource[filename], filename);
        moduleInfo.loaded = true;
        return moduleInfo.exports;
    }
    resolveHash(hash) {
        const asset = this.hashToPath[hash];
        if (!asset) {
            return '';
        }
        return asset.path;
    }
    resolveAsset(fileName, type) {
        const asset = this.pathToHash[this.normalizePath('' + (fileName || ''))];
        if (!asset || asset.type !== type) {
            return '';
        }
        return asset.hash;
    }
    getMeshId(filename) {
        return this.fileToMeshId[filename] || 0;
    }
    getMeshFileName(id) {
        return this.meshIdToFile[id] || '';
    }
    getMeshMotionList(filename) {
        return this.fileToMotions[filename] || [];
    }
    getRigidBodyOffset(filename) {
        return this.fileToRigidBodyOffset[filename] || [
            0,
            0,
            0
        ];
    }
    getRenderBoxOffset(filename) {
        return this.fileToRenderBoxOffset[filename] || [
            0,
            0,
            0
        ];
    }
    getSkinId(skinName) {
        if (skinName === undefined || skinName === null) {
            return 0;
        }
        if (typeof skinName !== 'string') {
            throw new Error(`error read param ${JSON.stringify(skinName)}, skin name must be string/undefined/null`);
        }
        const skinId = this.nameToSkinId[skinName];
        if (!skinId) {
            throw new Error(`cannot find skin name ${skinName} in resources`);
        }
        return skinId;
    }
    getSkinFileName(id) {
        return this.skinIdToName[id] || undefined;
    }
    constructor(evalFuncs){
        this.evalFuncs = evalFuncs;
        this.moduleSource = {};
        this.moduleCache = {};
        this.hashToPath = {};
        this.pathToHash = {};
        this.meshIdToFile = [];
        this.fileToMotions = {};
        this.fileToRigidBodyOffset = {};
        this.fileToRenderBoxOffset = {};
        this.fileToMeshId = {};
        this.skinIdToName = [];
        this.nameToSkinId = {};
        this.defaultGamepadPath = {
            joystickBackground: '',
            joystickController: '',
            flyButton: '',
            flyingBackground: '',
            flyingController: '',
            jump: '',
            crouch: '',
            actionA: '',
            actionB: ''
        };
        this.ls = (_path)=>{
            const path = this.normalizePath('' + (_path || ''));
            const resource = this.pathToHash[path];
            if (!resource) {
                throw new Error('file not found');
            }
            return resource.children.map((info)=>new GameAssetListEntry(info.path, info.type));
        };
        this.resources = new GameResourceSystem(this.ls);
    }
}