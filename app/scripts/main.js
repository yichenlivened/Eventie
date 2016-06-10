"use strict";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCxRkGJI20d-SRzTlFYnmU94Jnfj7oCJbw",
  authDomain: "scorching-fire-2347.firebaseapp.com",
  databaseURL: "https://scorching-fire-2347.firebaseio.com",
  storageBucket: "scorching-fire-2347.appspot.com",};
  firebase.initializeApp(config);

//
$( document ).ready(function() {
  
  //header
  var headerLoginBtn = $("#headerLoginBtn");
  var headerSignupBtn = $("#headerSignupBtn");
  var headerUserBtn = $("#headerUserBtn");
  var headerUsername = $("#headerUsername");
  var headerLogoutBtn = $("#headerLogoutBtn");

  //main content
  var createEventBtn = $("#btn-createEvent");

  //modal
  var modalSignupBtn = $("#modalSignupBtn");
  var loginBtn = $("#login-btn");


function userInit(){

}

function publicInit(){

}

  firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
          headerLoginBtn.hide(0);
          headerSignupBtn.hide(0);
          firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
            console.log(snapshot.val());
            headerUsername.text(snapshot.val().username);
          });
          headerUserBtn.show(0);
          firebase.database().ref('events/').once('value').then(function(snapshot){
            console.log(snapshot.val());
            $.each(snapshot.val(), function( key, value ) {
                    // console.log(key + ": " + value.eventType);
                    $("#showEvent").append('<div class="col-xs-12 col-md-6"><div class="thumbnail"><div class="caption"><p>' + 
                      value.eventStart
                      +'</p><h3>'+
                      value.eventTitle
                      + '</h3><p>' +
                      value.eventLocation
                      + '</p></div></div></div>');
                  }); 
          });
    } else {
          console.log('logout');
          headerLoginBtn.show();
          headerSignupBtn.show();
          headerUserBtn.hide();
        }
  });


      function init(){

        modalSignupBtn.click(function(){
          var signupName = $("#signupName").val();
          var signupEmail = $("#signupEmail").val();
          var signupPassword = $("#signupPassword").val();
          createUser(signupEmail, signupPassword, signupName);
        });

        loginBtn.click(function(){
          var loginEmail = $("#loginEmail").val();
          var loginPassword = $("#loginPassword").val();
          login(loginEmail, loginPassword);
          $('#logInModal').modal('hide');
        });



        headerLogoutBtn.click(function(){
          logout();
        });
      }

      createEventBtn.click(function(){
        var user = firebase.auth().currentUser;
        console.log('create Event');
        writeNewPost(user.uid, 'test','test', 'test');
      });

      $.fn.serializeObject = function() {
        var o = {};
        var a = this.serializeArray();
        $.each(a, function() {
          if (o[this.name]) {
            if (!o[this.name].push) {
              o[this.name] = [o[this.name]];
            }
            o[this.name].push(this.value || '');
          } else {
            o[this.name] = this.value || '';
          }
        });
        return o;
      };

      function writeNewPost(uid, username, title, body) {
  // A post entry.
  var formData = $('#createEvent').serializeObject();
  // Get a key for a new Post.
  var newPostKey = firebase.database().ref().child('posts').push().key;
  // Write the new post's data simultaneously in the posts list and the user's post list.
  var updates = {};
  updates['/events/' + newPostKey] = formData;
  updates['/users/' + uid + '/events/' + newPostKey] = formData;

  return firebase.database().ref().update(updates);
}


function createUser(email, password, name){
  firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorCode + errorMessage);
  }).then(function(user){
    console.log('successfully created the user.');
    writeUserData(user.uid,name);
  })
}

function writeUserData(userId, name) {
  firebase.database().ref('users/' + userId).set({
    username: name,
  });
}

function login(email, password){
  firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
    var errorCode = error.code;
    var errorMessage = error.message;
    console.log(errorMessage);
  }).then(function(){
    console.log(user);
  });
}

function logout(){
  firebase.auth().signOut().then(function() {
    console.log('logout');
  }, function(error) {
    console.log('error');
  });
}

init();

});

