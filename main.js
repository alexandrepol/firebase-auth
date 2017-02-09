/**
 * Created by Alex on 09/02/2017.
 */

(function(){
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCm1MXrj-8rHvILuQocmhrvnQGX_2gEwgE",
        authDomain: "b3-js-firebase.firebaseapp.com",
        databaseURL: "https://b3-js-firebase.firebaseio.com",
        storageBucket: "b3-js-firebase.appspot.com",
        messagingSenderId: "454751489097"
    };
    firebase.initializeApp(config);

    var provider = new firebase.auth.GoogleAuthProvider();

    $('.content').on('click', "#googleSign",function () {
        googleSignin();
    })
    $('.content').on('click', "#googleSignOut", function () {
        googleSignout();
    })

    function googleSignin() {
        firebase.auth()
            .signInWithPopup(provider).then(function(result) {
            var token = result.credential.accessToken;
            var user = result.user;
        }).catch(function(error) {
            var errorCode = error.code;
            var errorMessage = error.message;

            console.log(error.code)
            console.log(error.message)
        });
    }

    function googleSignout() {
        firebase.auth().signOut()

            .then(function() {
                $('#user-name').html('');
                $('#googleSignOut').remove();
                $('.content').append('<button id="googleSign">Google Signin</button>');
                console.log('Signout Succesfull')
            }, function(error) {
                console.log('Signout Failed')
            });
    }

    //Ajouter des commentaires dans la base
    function writeComData(comId, userId, userName, com, time) {
        firebase.database().ref('commentaires/' + comId).set({
            userId: userId,
            userName: userName,
            commentaire : com,
            date: time
        });
    }

    //Lire les commentaires
    firebase.auth().onAuthStateChanged(function(user){
       if(user){
           $('#user-name').html(user.displayName);
           $('.content').append('<div id="listCom"></div>');
           let signIn = $('#googleSign');
           let signOut = $('#googleSignOut');
           if(signIn.length != 0){
               signIn.remove();
           }
           if(signOut.length == 0){
               $('.content').append('<button id="googleSignOut">Google SignOut</button>')
           }

           var listCom = firebase.database().ref('commentaires');
           listCom.on('value', function(snapshot) {
               var div = document.getElementById('listCom');
               div.innerHTML = "";

               snapshot.forEach(function (childSnapshot) {
                   var childData = childSnapshot.val();
                   //console.log(childData);
                   var p = document.createElement("p");
                   var node = document.createTextNode(childData.userName+": "+childData.commentaire);
                   p.appendChild(node);
                   div.appendChild(p);

               });

           });
       }
       else{
           $('#listCom').remove();
       }
    });

    /*Set storage for upload images*/

    let storage = firebase.storage();
    let storageRef = storage.ref();


    document.getElementById("pic").addEventListener("change", function(e){

        var ctx = document.getElementById("canvas").getContext('2d');
        var img = new Image;
        img.src = URL.createObjectURL(e.target.files[0]);
        img.onload = function(){
            ctx.drawImage(img, 0,0, img.width, img.height,0, 0, 400, 300);
        }


    });


    $('#submitFile').on('click', function(e){
        e.preventDefault();
        let selectedFile = document.getElementById('pic').files[0];
        let imagesRef = storageRef.child('images/'+selectedFile.name);

        imagesRef.put(selectedFile).then(function(snapshot) {

            console.log('Uploaded a blob or file!');
        });
    })




    $("#submitCom").on('click', function(e){
        var user = firebase.auth().currentUser;

        e.preventDefault();
        var com = $('#commentaire').val();
        var d = new Date();
        var time = d.getTime();
        var comId = Math.round(Math.random()*36000);
        if(com == ''){
            alert('Vous devez remplir le champ commentaire .. pd');
        }
        if(com != '' && user){
            writeComData(comId ,user.uid, user.displayName, com, time);
            console.log('done');
        }

    });

})(jQuery);
