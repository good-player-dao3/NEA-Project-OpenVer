class GameRTCChannel {
    constructor(add, remove, unpublish, publishMicrophone, getPlayers, destroy, getVolume, setVolume, getMicrophonePermission){
        this.add = add;
        this.remove = remove;
        this.unpublish = unpublish;
        this.publishMicrophone = publishMicrophone;
        this.getPlayers = getPlayers;
        this.destroy = destroy;
        this.getVolume = getVolume;
        this.setVolume = setVolume;
        this.getMicrophonePermission = getMicrophonePermission;
    }
}