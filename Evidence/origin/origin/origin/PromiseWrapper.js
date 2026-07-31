class PromiseWrapper {
    notifyDone(result) {
        let _result = result;
        if (this.handleResult) {
            _result = this.handleResult(result);
        }
        this.schedule(()=>{
            if (this.resolve) {
                this.resolve(_result);
            }
        });
    }
    notifyError(error) {
        let _error = error;
        if (this.handleError) {
            _error = this.handleError(error);
        }
        this.schedule(()=>{
            if (this.reject) {
                this.reject(_error);
            }
        });
    }
    constructor(schedule, handleResult, handleError){
        this.schedule = schedule;
        this.handle = 0;
        this.handleResult = handleResult;
        this.handleError = handleError;
        this.query = new Promise((resolve, reject)=>{
            this.resolve = resolve;
            this.reject = reject;
        });
    }
}