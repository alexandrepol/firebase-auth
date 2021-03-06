/**
 * Created by Alex on 09/02/2017.
 */

/*
 * var = variable, l'élement de la variable peut varier (var a = 'toto'; var a = b ; même pointeur en mémoire)
 * en Js, on fonctionne par référence
 * let = pour un élément qui peut varier. Portée de bloc
 * const = pour un élément constant, permet de créer un point de référence pour être sur que la variable ne change pas d'affectation. Portée de bloc
 * bloc d'éxécution (if, for, switch, while...)
 * setter = permet d'affecter des valeurs aux propriétés et faire une manipulation si on le souhaite (ex : toUppercase);
 * getter = permet de récupérer les propriétés d'un object et faire une manipulation si on le souhaite avec un pré-traitement (ne pas oublier le return);
 * _ underscore permet de faire un private en Js pour les propriétés (convention)
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

        //Blob
        let canvas = document.getElementById('canvas');
        canvas.toBlob(function (blob) {

            var newImg = document.createElement('img');
            var url = URL.createObjectURL(blob);
            newImg.src = url;
            document.body.appendChild(newImg);
            let fileName = document.getElementById('pic').files[0].name;

            let imagesRef = storageRef.child('images/'+fileName);
            imagesRef.put(blob).then(function(snapshot) {
                console.log('Uploaded a blob or file!');
            });

        }, 'image/jpeg', 0.1);

    });




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
