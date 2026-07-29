class GameVoxels {
    constructor(shape, VoxelTypes, id, name, setVoxel, getVoxel, getVoxelRotation, setVoxelId, getVoxelId){
        this.shape = shape;
        this.VoxelTypes = VoxelTypes;
        this.id = id;
        this.name = name;
        this.setVoxel = setVoxel;
        this.getVoxel = getVoxel;
        this.getVoxelRotation = getVoxelRotation;
        this.setVoxelId = setVoxelId;
        this.getVoxelId = getVoxelId;
    }
}