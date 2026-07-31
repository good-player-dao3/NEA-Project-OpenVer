class GameWearable {
    remove() {
        if (this.player) {
            this.player.removeWearable(this);
        }
    }
    constructor(){
        this.player = null;
        this.bodyPart = GameBodyPart.HEAD;
        this.mesh = '';
        this.color = new GameRGBColor(1, 1, 1);
        this.emissive = 0;
        this.metalness = 0;
        this.shininess = 0;
        this.orientation = new GameQuaternion(0, 1, 0, 0);
        this.scale = new GameVector3(1, 1, 1);
        this.offset = new GameVector3(0, 0, 0);
    }
}