

var menu = function () {
    $('#menu').css('height', $('#menu').width()*.75+'px');

    let uuid = localStorage.getItem("uuid");
        if (!uuid){
            uuid = `${Math.floor(1000000000*Math.random())}`;
            localStorage.setItem("uuid", uuid);
    }


    $('#startGame').click(function() {
        //let userName = $('#username').val();
        //if (userName === '') {
        let userName = `user-${uuid}`;
        //}
        $('#menu').css('display', 'none');
        var dg = new dodgeGame(userName);     
    })

}