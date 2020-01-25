;(function () {
    "use strict"
    let _global;

    const CODE = {
        success: 200,
        failure: -1
    };

    const SERVER = 'http://localhost:9010';

    const GLOBAL = {
        loginURL: SERVER + '/access/login',
        socketURL: SERVER + '/nabootsocket'
    };

    const SUBSCRIBE = {
        privateChannel: '/user/private/message',
        groupChannel: '/user/group/message',
        notifyChannel: '/user/notify'
    };

    const SEND = {
        privateChannel: '/to/private/send',
        groupChannel: '/to/group/send'
    };

    let stompClient = null;

    function createxmlHttpRequest() {
        if (window.ActiveXObject) {
            return new ActiveXObject("Microsoft.XMLHTTP");
        } else if (window.XMLHttpRequest) {
            return new XMLHttpRequest();
        }
    }

    let NABootSocket = {
        Message: function (sender,receiver,content) {
            this.sender = sender
            this.receiver = receiver
            this.content = content
        },
        LoginParam: function(NA_username,NA_password,sessionId) {
            this.sessionId = sessionId
            this.authLogin = {
                username: NA_username,
                password: NA_password
            }
        },
        ConnectCallbacks: function() {
            this.onSuccess = arguments[0].onSuccess,
                this.onFailure = arguments[0].onFailure,
                this.onReceivedPrivate = arguments[0].onReceivedPrivate,
                this.onReceivedGroup = arguments[0].onReceivedGroup,
                this.onReceivedNotify = arguments[0].onReceivedNotify
        },

        sendPrivateMessage: function (msg) {
            stompClient.send(SEND.privateChannel, {}, JSON.stringify(msg));
        },
        sendGroupMessage: function (msg) {
            stompClient.send(SEND.groupChannel, {}, JSON.stringify(msg));
        },
        disconnect: function () {
            if (stompClient !== null) {
                stompClient.disconnect();
            }
        },
        connect: function (NA_loginParam, NA_connectCallbaccks) {
            let success = arguments[1].onSuccess || function() {}
            let failure = arguments[1].onFailure || function() {}
            let receivePrivate = arguments[1].onReceivedPrivate || function() {}
            let receiveGroup = arguments[1].onReceivedGroup || function() {}
            let receiveNotify = arguments[1].onReceivedNotify || function() {}

            const socket = new SockJS(GLOBAL.socketURL);
            stompClient = Stomp.over(socket);

            stompClient.connect({}, function () {
                const urlSlice = stompClient.ws._transport.url.split('/');
                const sessionId = urlSlice[urlSlice.length - 2];

                let loginParam = NA_loginParam
                loginParam.sessionId = sessionId

                let xhr = createxmlHttpRequest()
                xhr.open("POST",GLOBAL.loginURL,true)
                xhr.responseType='json'
                xhr.setRequestHeader("Content-Type",'application/json')
                xhr.send(JSON.stringify(loginParam))
                xhr.onreadystatechange = function() {
                    if (xhr.readyState == 4) {
                        if(xhr.status == 200){
                            console.log(xhr.response)
                            success(xhr.response)
                            stompClient.subscribe(SUBSCRIBE.privateChannel, function (data) {
                                data = JSON.parse(data.body);
                                if (data.code === CODE.success) {
                                    const message = data.data;
                                    receivePrivate(message)
                                } else {
                                    alert(data.message)
                                }
                            });

                            // Subscribe group chat channel
                            stompClient.subscribe(SUBSCRIBE.groupChannel, function (data) {
                                data = JSON.parse(data.body);
                                if (data.code === CODE.success) {
                                    const message = data.data;
                                    receiveGroup(message)
                                } else {
                                    alert(data.message)
                                }
                            });

                            // Subscribe notify channel
                            stompClient.subscribe(SUBSCRIBE.notifyChannel, function (data) {
                                data = JSON.parse(data.body);
                                if (data.code === CODE.success) {
                                    const message = data.data;
                                    receiveNotify(message)
                                } else {
                                    alert(data.message)
                                }
                            });
                        }else{
                            console.log('not connected')
                            console.log(xhr.response)
                            failure(xhr.response)
                        }
                    }
                }

            })
        }
    }

    _global = (function () { return this || (0, eval)('this'); }());
    if (typeof module !== "undefined" && module.exports) {
        module.exports = NABootSocket;
    } else if (typeof define === "function" && define.amd) {
        define(function () { return NABootSocket; });
    } else {
        !('NABootSocket' in _global) && (_global.NABootSocket = NABootSocket);
    }
}())
