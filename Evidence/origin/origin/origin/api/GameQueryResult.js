class GameQueryResult {
    [Symbol.asyncIterator]() {
        return this;
    }
    constructor(next, abort, error, then){
        this.next = next;
        this['return'] = abort;
        this['throw'] = error;
        this['then'] = then;
    }
}