class GameDataStorage {
    constructor(key, set, update, get, increment, list, remove, destroy){
        this.key = key;
        this.set = set;
        this.update = update;
        this.get = get;
        this.increment = increment;
        this.list = list;
        this.remove = remove;
        this.destroy = destroy;
    }
}