var menu = function () {

    $('#menu').css('height', $('#menu').width()*.75+'px');

    $('#startGame').click(function() {
        let userName = $('#username').val();
        if (userName === '') {
            userName = `user-${Math.floor(1000000000*Math.random())}`;
        }
        $('#menu').css('display', 'none');
        var dg = new dodgeGame(userName);     
    })

}