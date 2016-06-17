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
      return o;};

      function validateEmail(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      }

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

//issue tracker
function IssueTracker() {
  this.issues = [];
}

IssueTracker.prototype = {
  add: function (issue) {
    this.issues.push(issue);
  },
  retrieve: function () {
    var message = "";
    switch (this.issues.length) {
      case 0:
        // do nothing because message is already ""
        break;
        case 1:
        message = "Please correct the following issue:\n" + this.issues[0];
        break;
        default:
        message = "Please correct the following issues:\n" + this.issues.join("\n");
        console.log(this.issues);
        console.log(message);
        break;
      }
      return message;
    }
  };

//modal signup
var modalSignupBtn = $("#modalSignupBtn");

modalSignupBtn.click(function(){

  var modalSignupName = $("#modalSignupName");
  var modalSignupEmail = $("#modalSignupEmail");
  var modalSignupPassword = $("#modalSignupPassword");

  //get input value
  var modalSignupNameVal = modalSignupName.val();
  var modalSignupEmailVal = modalSignupEmail.val();
  var modalSignupPasswordVal = modalSignupPassword.val();

  //add issue tracker
  var modalSignupNameTraker = new IssueTracker();
  var modalSignupEmailTraker = new IssueTracker();
  var modalSignupPasswordTraker = new IssueTracker();

  function checkrequirements(){
    if(modalSignupNameVal.length< 3){
      modalSignupNameTraker.add("Your name should be greater than 3 characters.");
    } else if(modalSignupNameVal.length > 20){
      modalSignupNameTraker.add("Your name should be fewer than 20 characters.");
    }

    if(!validateEmail(modalSignupEmailVal)) {
      modalSignupEmailTraker.add("Email address is badly formatted.");
    }

    if(modalSignupPasswordVal.length<5){
      modalSignupPasswordTraker.add("Password should be greater than 5 characters.");
    } else if(modalSignupPasswordVal.length>20){
      modalSignupPasswordTraker.add("Password should be fewer than 20 characters.");
    }
  };

  function createUser(name, email, password){
    firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
      writeUserData(user.uid, name);
      console.log('successfully created the user.');
      console.log(user);
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      modalSignupEmail[0].setCustomValidity(errorMessage);
    });
  }

  function writeUserData(userId, name) {
    firebase.database().ref('users/' + userId).set({
      username: name
    });
  }

  checkrequirements();

  var modalSignupNameIssue = modalSignupNameTraker.retrieve();
  var modalSignupEmailIssue = modalSignupEmailTraker.retrieve();
  var modalSignupPasswordIssue = modalSignupPasswordTraker.retrieve();

  if(modalSignupNameIssue.length + modalSignupEmailIssue.length + modalSignupPasswordIssue.length === 0){
    createUser(modalSignupNameVal, modalSignupEmailVal, modalSignupPasswordVal);
  } else {
    modalSignupName[0].setCustomValidity(modalSignupNameIssue);
    modalSignupEmail[0].setCustomValidity(modalSignupEmailIssue);
    modalSignupPassword[0].setCustomValidity(modalSignupPasswordIssue);
  };

});


//modal login
var modalLoginBtn = $("#modalLoginBtn");

modalLoginBtn.click(function(){

  var modalLoginEmail = $("#modalLoginEmail");
  var modalLoginPassword = $("#modalLoginPassword");

  //get input val value
  var modalLoginEmailVal = $("#modalLoginEmail").val();
  var modalLoginPasswordVal = $("#modalLoginPassword").val();

  //add issue tracker
  var modalLoginEmailTraker = new IssueTracker();
  var modalLoginPasswordTraker = new IssueTracker();

  function checkrequirements(){
    if(!validateEmail(modalLoginEmailVal)) {
      modalLoginEmailTraker.add("Email address is badly formatted.");
    }

    if(modalLoginPasswordVal.length<5){
      modalLoginPasswordTraker.add("Password should be greater than 5 characters.");
    } else if(modalLoginPasswordVal.length>20){
      modalLoginPasswordTraker.add("Password should be fewer than 20 characters.");
    }
  };

  function login(email, password){
    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
      console.log("successfully log in.");
    }).catch(function(error) {
      var errorCode = error.code;
      var errorMessage = error.message;
      modalLoginEmail[0].setCustomValidity(errorMessage);
    });
  }

  checkrequirements();

  var modalLoginEmailIssue = modalLoginEmailTraker.retrieve();
  var modalLoginPasswordIssue = modalLoginPasswordTraker.retrieve();

  if(modalLoginEmailIssue.length + modalLoginPasswordIssue.length === 0){
    login(modalLoginEmailVal, modalLoginPasswordVal);
  } else {
    modalLoginEmail[0].setCustomValidity(modalLoginEmailIssue);
    modalLoginPassword[0].setCustomValidity(modalLoginPasswordIssue);
  };

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

