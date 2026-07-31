class FetchScriptShell {
    _getErrorMsg(err) {
        const { key, msg } = err;
        let error = errorMsgList[key] || errorMsgList['UNKNOWN'];
        if (msg) {
            error.msg = msg;
        }
        return JSON.stringify(error);
    }
    constructor(client, schedule){
        this.schedule = schedule;
        this.wrappers = {};
        this.handleCounter = 0;
        this.getMiaoShells = (playerId)=>{
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.miaoShells || 0;
                } catch (error) {
                    return 0;
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.getMiaoShells({
                handle,
                playerId
            });
            return wrapper.query;
        };
        this.createTempChat = (userIds)=>{
            if (userIds !== undefined && !Array.isArray(userIds)) {
                throw new Error('userIds must be an array');
            }
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.chatId || '';
                } catch (error) {
                    return '';
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.createTempChat({
                handle,
                userIds: userIds || []
            });
            return wrapper.query;
        };
        this.destroyTempChat = (chatIds)=>{
            if (!Array.isArray(chatIds)) {
                throw new Error('chatIds must be an array');
            }
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.chatIds || [];
                } catch (error) {
                    return '';
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.destroyTempChat({
                handle,
                chatIds
            });
            return wrapper.query;
        };
        this.addTempChatPlayer = (chatId, userIds)=>{
            if (typeof chatId !== 'string') {
                throw new Error('chatId must be a string');
            }
            if (!Array.isArray(userIds)) {
                throw new Error('userIds must be an array');
            }
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.userIds || [];
                } catch (error) {
                    return [];
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.addTempChatPlayer({
                handle,
                userIds,
                chatId
            });
            return wrapper.query;
        };
        this.removeTempChatPlayer = (chatId, userIds)=>{
            if (typeof chatId !== 'string') {
                throw new Error('chatId must be a string');
            }
            if (!Array.isArray(userIds)) {
                throw new Error('userIds must be an array');
            }
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.userIds || [];
                } catch (error) {
                    return [];
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.removeTempChatPlayer({
                handle,
                userIds,
                chatId
            });
            return wrapper.query;
        };
        this.getTempChats = ()=>{
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data;
                } catch (error) {
                    return [];
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.getTempChats({
                handle
            });
            return wrapper.query;
        };
        this.getTempChatUsers = (chatId)=>{
            if (typeof chatId !== 'string') {
                throw new Error('chatId must be a string');
            }
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data;
                } catch (error) {
                    return [];
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.getTempChatUsers({
                handle,
                chatId
            });
            return wrapper.query;
        };
        this.querySocial = (socialType, userId)=>{
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    const data = JSON.parse(res);
                    return data.socialList || [];
                } catch (error) {
                    return [];
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.querySocial({
                handle,
                userId,
                socialType
            });
            return wrapper.query;
        };
        this.querySocialStatistic = (userId)=>{
            const wrapper = new PromiseWrapper(this.schedule, (res)=>{
                try {
                    return JSON.parse(res);
                } catch (error) {
                    return {
                        followingNum: 0,
                        followerNum: 0,
                        friendsNum: 0
                    };
                }
            });
            const handle = wrapper.handle = this.handleCounter++;
            this.wrappers[handle] = wrapper;
            this.protocol.server.message.querySocialStatistic({
                handle,
                userId
            });
            return wrapper.query;
        };
        this.protocol = client.protocol(FetchScriptProtocol);
        this.protocol.configure({
            message: {
                fetchDone: ({ handle, data })=>{
                    if (this.wrappers[handle]) {
                        this.wrappers[handle].notifyDone(data);
                        delete this.wrappers[handle];
                    }
                },
                fetchError: ({ handle, error })=>{
                    if (this.wrappers[handle]) {
                        this.wrappers[handle].notifyError(new Error(this._getErrorMsg(error)));
                        delete this.wrappers[handle];
                    }
                }
            }
        });
    }
}