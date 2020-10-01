

var menu = function () {

    let uuid = localStorage.getItem("uuid");
    if (!uuid){
        uuid = `${Math.floor(1000000000*Math.random())}`;
        localStorage.setItem("uuid", uuid);
    }

    let self = this;
    this.userName = `user-${uuid}`;

    $('#yourName').text(`${this.userName}`);

    var firebaseConfig = {
        apiKey: "AIzaSyA6XcBrdTRlldJCTLS54HP0NpChvBHRz4E",
        authDomain: "dodgegame-3834e.firebaseapp.com",
        databaseURL: "https://dodgegame-3834e.firebaseio.com",
        projectId: "dodgegame-3834e",
        storageBucket: "dodgegame-3834e.appspot.com",
        messagingSenderId: "161895663276",
        appId: "1:161895663276:web:4a2059774d6b427f5b8109"
      };
     firebase.initializeApp(firebaseConfig);

     var google_provider = new firebase.auth.GoogleAuthProvider();


    firebase.auth().onAuthStateChanged(user => {
        if (!!user){
            let splitname = user.displayName.split(" ");
            if(splitname.length > 1) { 
                self.userName = splitname[0] + ' ' + splitname[1].charAt(0);
                console.log(self.userName);
            }
            $("#logout").css('display', 'block');
            $("#login").css('display','none');
            $('#yourName').text(`${self.userName}`);
        }
      });
      
      $("#login").click(()=>{
        firebase.auth().signInWithRedirect(google_provider);
        $("#logout").css('display', 'block');
        $("#login").css('display','none');
      });

      $("#logout").click(()=> {
          firebase.auth().signOut();
          $('#login').css('display', 'block');
          $("#logout").css('display', 'hide');
          self.userName =  'user-' + localStorage.getItem("uuid");
          $('#yourName').text(`${self.userName}`);
      })



    $('#menu').css('height', $('#menu').width()*.75+'px');


    $('#startGame').click(function() {
        //let userName = $('#username').val();
        //if (userName === '') {
        //}
        $('#menu').css('display', 'none');
        var dg = new dodgeGame(self.userName);     
    })

    



}