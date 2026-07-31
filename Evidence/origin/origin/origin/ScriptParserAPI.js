class ScriptParserAPI {
    constructor(resource){
        this.resource = resource;
        this.meshIdToFile = (meshId)=>{
            return this.resource.getMeshFileName(meshId);
        };
        this.fileToMeshId = (file)=>{
            return this.resource.getMeshId(file);
        };
        this.entityToId = (entity)=>{
            const wrapper = WRAPPER_INDEX.get(entity);
            if (wrapper) {
                return wrapper.id;
            }
            return 0;
        };
        this.idToEntity = (id)=>{
            const wrapper = ENTITY_INDEX.get(id);
            if (wrapper) {
                return wrapper.entity;
            }
            return null;
        };
        this.hashToPath = (hash)=>{
            return this.resource.resolveHash(hash);
        };
        this.pathToHash = (path, type)=>{
            return this.resource.resolveAsset(path, type);
        };
        this.positionToRigidBodyPosition = (targetId, x, y, z)=>{
            const wrapper = ENTITY_INDEX.get(targetId);
            if (!wrapper) {
                return {
                    x,
                    y,
                    z
                };
            }
            const { entity } = wrapper;
            if (entity.isPlayer) {
                return {
                    x,
                    y,
                    z
                };
            }
            const offset = this.resource.getRigidBodyOffset(entity.mesh);
            if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
                return {
                    x,
                    y,
                    z
                };
            }
            const { px, py, pz } = wrapper.applyTransform(offset[0], offset[1], offset[2]);
            return {
                x: px + x,
                y: py + y,
                z: pz + z
            };
        };
        this.rigidBodyPositionToPosition = (targetId, x, y, z)=>{
            const wrapper = ENTITY_INDEX.get(targetId);
            if (!wrapper) {
                return {
                    x,
                    y,
                    z
                };
            }
            const { entity } = wrapper;
            if (entity.isPlayer) {
                return {
                    x,
                    y,
                    z
                };
            }
            const offset = this.resource.getRigidBodyOffset(entity.mesh);
            if (offset[0] === 0 && offset[1] === 0 && offset[2] === 0) {
                return {
                    x,
                    y,
                    z
                };
            }
            const { px, py, pz } = wrapper.applyTransform(-offset[0], -offset[1], -offset[2]);
            return {
                x: px + x,
                y: py + y,
                z: pz + z
            };
        };
    }
}