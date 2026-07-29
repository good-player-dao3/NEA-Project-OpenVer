class HrefScriptShell {
    openLink(clientId, href, options) {
        const isConfirm = !options || typeof options.isConfirm === 'undefined' || options.isConfirm;
        const isNewTab = !options || typeof options.isNewTab === 'undefined' || options.isNewTab;
        this.protocol.server.message.openLink({
            clientId,
            href,
            isConfirm,
            isNewTab
        });
    }
    constructor(client){
        this.protocol = client.protocol(HyperlinkScriptProtocol);
    }
}