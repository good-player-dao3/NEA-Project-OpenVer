class GameRaycastResult {
    constructor(hit, hitEntity, hitVoxel, origin, direction, distance, hitPosition, normal, voxelIndex){
        this.hit = hit;
        this.hitEntity = hitEntity;
        this.hitVoxel = hitVoxel;
        this.origin = origin;
        this.direction = direction;
        this.distance = distance;
        this.hitPosition = hitPosition;
        this.normal = normal;
        this.voxelIndex = voxelIndex;
    }
}