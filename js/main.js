/*const SERVER = 'http://localhost:9010';*/
const SERVER = 'http://35.243.101.217:9010';

function setConnected(connected) {
    $("#connect").prop("disabled", connected);
    $("#disconnect").prop("disabled", !connected);
    if (connected) {
        $("#conversation").show();
    } else {
        $("#conversation").hide();
    }
    $("#record").html("");
}

function connect() {
    let loginParam = new NABootSocket.LoginParam($('#username').val(),$('#password').val())
    let connectCallbacks = new NABootSocket.ConnectCallbacks({
        onSuccess: function (data) {
            $('#my-uuid').val(data.data.uuid);
            setConnected(true);
            console.log('Connected');
            NABootSocket.getConversationList(data.data.uuid,{
                onSuccess: function (data) {
                    console.log(data)
                },
                onFailure: function (data) {
                    console.log(data)
                }
            })
            NABootSocket.getHistoryRecordList('d198b133-62b3-4e68-973d-efdf97e57a94',{
                onSuccess: function (data) {
                    console.log(data)
                },
                onFailure: function (data) {
                    console.log(data)
                }
            })
        },
        onFailure: function (message) {
            alert(message);
            disconnect();
        },
        onReceivedPrivate: function (message) {
            showRecord(message)
        },
        onReceivedGroup: function (message) {
            showRecord(message)
        },
        onReceivedNotify: function (message) {
            showRecord(message)
        }
    })

    NABootSocket.connect(loginParam,connectCallbacks)
    /*const socket = new SockJS(GLOBAL.socketURL);
    stompClient = Stomp.over(socket);

    stompClient.connect({}, function () {
        // Parse session id
        const urlSlice = stompClient.ws._transport.url.split('/');
        const sessionId = urlSlice[urlSlice.length - 2];

        // Login by HTTP
        const loginParam = {
            sessionId: sessionId,
            authLogin: {
                username: $('#username').val(),
                password: $('#password').val()
            }
        };
        $.ajax({
            type: "POST",
            url: GLOBAL.loginURL,
            dataType: 'json',
            contentType: 'application/json',
            data: JSON.stringify(loginParam),
            success: function (data) {
                if (data.code === CODE.success) {
                    $('#my-uuid').val(data.data.uuid);
                    setConnected(true);
                    console.log('Connected');

                    // Subscribe private chat channel
                    stompClient.subscribe(SUBSCRIBE.privateChannel, function (data) {
                        data = JSON.parse(data.body);
                        if (data.code === CODE.success) {
                            const message = data.data;
                            showRecord(message)
                        } else {
                            alert(data.message)
                        }
                    });

                    // Subscribe group chat channel
                    stompClient.subscribe(SUBSCRIBE.groupChannel, function (data) {
                        data = JSON.parse(data.body);
                        if (data.code === CODE.success) {
                            const message = data.data;
                            showRecord(message)
                        } else {
                            alert(data.message)
                        }
                    });

                    // Subscribe notify channel
                    stompClient.subscribe(SUBSCRIBE.notifyChannel, function (data) {
                        data = JSON.parse(data.body);
                        if (data.code === CODE.success) {
                            const message = data.data;
                            showRecord(message)
                        } else {
                            alert(data.message)
                        }
                    });

                } else {
                    alert(data.message);
                    disconnect();
                }
            }

        });

    });*/
}

function disconnect() {
    /*if (stompClient !== null) {
        stompClient.disconnect();
    }*/
    NABootSocket.disconnect()
    setConnected(false);
    console.log("Disconnected");
}

function sendPrivateMessage() {
    let message = new NABootSocket.Message($("#my-uuid").val(),$("#target-uuid").val(),$("#private-message").val())
    NABootSocket.sendPrivateMessage(message)
    /*const message = {
        sender: $("#my-uuid").val(),
        receiver: $("#target-uuid").val(),
        content: $("#private-message").val()
    };
    stompClient.send(SEND.privateChannel, {}, JSON.stringify(message));*/
}

function sendGroupMessage() {
    let message = new NABootSocket.Message($("#my-uuid").val(),$("#group-uuid").val(),$("#group-message").val())
    NABootSocket.sendGroupMessage(message)
    /*const message = {
        sender: $("#my-uuid").val(),
        receiver: $("#group-uuid").val(),
        content: $("#group-message").val()
    };
    stompClient.send(SEND.groupChannel, {}, JSON.stringify(message));*/
}

function showRecord(message) {
    const record = "<tr>" +
        "<td>" + message.sender + "</td>" +
        "<td>" + message.receiver + "</td>" +
        "<td>" + message.content + "</td>" +
        "<td>" + message.timestamp + "</td>" +
        "</tr>";
    $("#record").append(record);
}

$(function () {
    $("form").on('submit', function (e) {
        e.preventDefault();
    });
    $("#connect").click(function () {
        connect();
    });
    $("#disconnect").click(function () {
        disconnect();
    });
    $("#send-private").click(function () {
        sendPrivateMessage();
    });
    $("#send-group").click(function () {
        sendGroupMessage();
    });
    $("#a-register").attr("href", SERVER + "/swagger-ui.html#/access-controller/registerUsingPOST");
    $("#a-group").attr("href", SERVER + "/swagger-ui.html#/group-controller/createUsingPOST");
});
