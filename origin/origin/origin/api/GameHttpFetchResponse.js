class GameHttpFetchResponse {
    get ok() {
        return 200 <= this.status && this.status < 300;
    }
    constructor(status, statusText, headers, json, text, arrayBuffer, close){
        this.status = status;
        this.statusText = statusText;
        this.headers = headers;
        this.json = json;
        this.text = text;
        this.arrayBuffer = arrayBuffer;
        this.close = close;
    }
}