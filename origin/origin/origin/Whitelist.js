    class Whitelist {
	    add(rule) {
	        this.rules.push(rule);
	    }
	    test(url) {
	        for (const rule of this.rules){
	            if ((0, minimatch_1.default)(urlNoProtocol(url), rule)) {
	                return true;
	            }
	        }
	        return false;
	    }
	    constructor(list){
	        this.rules = [];
	        if (list) {
	            for (const rule of list){
	                this.add(rule);
	            }
	        }
	    }
	}