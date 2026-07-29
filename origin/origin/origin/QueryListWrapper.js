class QueryListWrapper {
    constructor(result, pointer, list){
        this.pointer = pointer;
        this.list = list;
        this.result = [];
        this.getCurrentPage = ()=>{
            return this.result;
        };
        this.nextPage = ()=>__awaiter(this, void 0, void 0, function*() {
                this.pointer++;
                const result = yield this.list(this.pointer);
                const { items, isLastPage } = result;
                if (items.length > 0) {
                    this.result = items.slice();
                }
                this.queryList.isLastPage = isLastPage;
            });
        const { items, isLastPage } = result;
        this.result = items.slice();
        this.queryList = new QueryList(this.getCurrentPage, this.nextPage);
        this.queryList.isLastPage = isLastPage;
    }
}