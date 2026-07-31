class QueryList {
    constructor(getCurrentPage, nextPage){
        this.getCurrentPage = getCurrentPage;
        this.nextPage = nextPage;
        this.isLastPage = false;
    }
}