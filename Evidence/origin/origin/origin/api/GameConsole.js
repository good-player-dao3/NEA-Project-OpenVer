class GameConsole {
    constructor(log, clear){
        this.clear = clear;
        this.dir = ()=>{};
        this.dirxml = ()=>{};
        this.group = ()=>{};
        this.groupCollapsed = ()=>{};
        this.groupEnd = ()=>{};
        this.table = ()=>{};
        this.time = ()=>{};
        this.timeEnd = ()=>{};
        this.timeLog = ()=>{};
        this.timeStamp = ()=>{};
        this.trace = ()=>{};
        this.assert = (assertion, ...args)=>{
            if (!assertion) {
                log(GameLogLevel.ERROR, args.join(' '));
            }
        };
        this.log = (...args)=>log(GameLogLevel.INFO, args.join(' '));
        this.debug = (...args)=>log(GameLogLevel.DEBUG, args.join(' '));
        this.error = (...args)=>log(GameLogLevel.ERROR, args.join(' '));
        this.warn = (...args)=>log(GameLogLevel.WARN, args.join(' '));
    }
}