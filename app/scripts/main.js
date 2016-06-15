"use strict";

// Initialize Firebase
var config = {
  apiKey: "AIzaSyCxRkGJI20d-SRzTlFYnmU94Jnfj7oCJbw",
  authDomain: "scorching-fire-2347.firebaseapp.com",
  databaseURL: "https://scorching-fire-2347.firebaseio.com",
  storageBucket: "scorching-fire-2347.appspot.com",};
  firebase.initializeApp(config);

  $( document ).ready(function() {

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

//Auth State header
firebase.auth().onAuthStateChanged(function(user) {
  var headerLoginBtn = $("#headerLoginBtn");
  var headerSignupBtn = $("#headerSignupBtn");
  var headerUserBtn = $("#headerUserBtn");
  var headerUsername = $("#headerUsername");
  var headerLogoutBtn = $("#headerLogoutBtn");

  if (user) {
    firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
      headerLoginBtn.addClass("hide");
      headerSignupBtn.addClass("hide");
      headerUsername.text('Hi, ' + snapshot.val().username).append('<span class="caret"></span>');
      headerUserBtn.removeClass("hide");
    });
  } else {
    headerLoginBtn.removeClass("hide");
    headerSignupBtn.removeClass("hide");
    headerUserBtn.addClass("hide");
  }

  headerLogoutBtn.click(function(){
    logout();
    function logout(){
      firebase.auth().signOut().then(function() {
        console.log('logout');
      }, function(error) {
        console.log('error');
      });
    }
  });
}); 

//event table
firebase.database().ref('events/').once('value').then(function(snapshot){
  console.log(snapshot.val());
  $.each(snapshot.val(), function( key, value ) {
    $("#showEvent").append('<div class="col-xs-12 col-md-6"><div class="thumbnail"><div class="caption"><p>' + 
      value.eventStart
      + '</p><h3>' +
      value.eventTitle
      + '</h3><p>' +
      value.eventLocation
      + '</p></div></div></div>');
  }); 
});

//modal signup
var modalSignupBtn = $("#modalSignupBtn");

modalSignupBtn.click(function(){
  var modalSignupNameVal = $("#modalSignupName").val();
  var modalSignupEmailVal = $("#modalSignupEmail").val();
  var modalSignupPasswordVal = $("#modalSignupPassword").val();
  createUser(modalSignupNameVal, modalSignupEmailVal, modalSignupPasswordVal);

  function createUser(email, password, name){
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      console.log('successfully created the user.');

    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      console.log(errorCode + errorMessage);
    });
  }

  function writeUserData(userId, name) {
    firebase.database().ref('users/' + userId).set({
      username: name,
    });
  }
});

//modal login
var modalLoginBtn = $("#modalLoginBtn");

modalLoginBtn.click(function(){
  var modalLoginEmailVal = $("#modalLoginEmail").val();
  var modalLoginPasswordVal = $("#modalLoginPassword").val();
  login(modalLoginEmailVal, modalLoginPasswordVal);
  function login(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
      $('#modalLogin').modal('hide');
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      $("#modalLoginEmail")[0].setCustomValidity(errorMessage);
    });
  }
});

//modal create event
var modalCreateEventBtn = $("#modalCreateEventBtn");

modalCreateEventBtn.click(function(){
  var user = firebase.auth().currentUser;
  console.log('create Event');
  writeNewPost(user.uid, 'test','test', 'test');
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
});




});

