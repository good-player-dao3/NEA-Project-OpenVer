        class Logger {
		    _log(level, message) {
		        this.sink({
		            level,
		            timestamp: new Date(),
		            prefix: this.prefix,
		            uuid: this.uuid,
		            message
		        });
		    }
		    constructor(sink, prefix, uuid){
		        this.sink = sink;
		        this.prefix = prefix;
		        this.uuid = uuid;
		        this.create = (prefix)=>{
		            const p = this.prefix.slice();
		            p.push(prefix);
		            return new Logger(this.sink, p, this.uuid);
		        };
		        this.error = (mesg)=>{
		            if (typeof mesg === 'string') {
		                return this._log(LogLevel.ERROR, mesg);
		            }
		            if (mesg && mesg.stack !== undefined && mesg.stack !== '') {
		                return this._log(LogLevel.ERROR, mesg.stack);
		            }
		            return this._log(LogLevel.ERROR, '' + mesg);
		        };
		        this.warn = (mesg)=>{
		            return this._log(LogLevel.WARN, mesg);
		        };
		        this.log = (mesg)=>{
		            return this._log(LogLevel.INFO, mesg);
		        };
		        this.debug = (mesg)=>{
		            return this._log(LogLevel.DEBUG, mesg);
		        };
		        this.fatal = (mesg)=>{
		            return this.error(mesg);
		        };
		        this.trace = (mesg)=>{
		            return this.debug(mesg);
		        };
		        this.info = (mesg)=>{
		            return this.log(mesg);
		        };
		    }
		}