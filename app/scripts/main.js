$( document ).ready(function() {
  var signupBtn = $("#signup-btn");
  var loginBtn = $("#login-btn");
  var logoutBtn = $("#logout-btn");
  var navLogin = $("#nav-login");
  var navSignup = $("#nav-signup");
  var navUser = $("#nav-user");
  var navUsername = $("#nav-username");

  navLogin.hide();
  navSignup.hide();
  navUser.hide();

  function init(){
    firebase.auth().onAuthStateChanged(function(user) {
      if (user) {
        console.log(user);
        navLogin.hide();
        navSignup.hide();
        navUsername.text();
        firebase.database().ref('/users/' + user.uid).once('value').then(function(snapshot) {
            console.log(snapshot.val());
            navUsername.text(snapshot.val().username);
        });
        navUser.show();
      } else {
        console.log('logout');
        navLogin.show();
        navSignup.show();
        navUser.hide();
      }
    });
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

  loginBtn.click(function(){
    var loginEmail = $("#loginEmail").val();
    var loginPassword = $("#loginPassword").val();
    login(loginEmail, loginPassword);
    $('#logInModal').modal('hide');
  });

  signupBtn.click(function(){
    var signupName = $("#signupName").val();
    var signupEmail = $("#signupEmail").val();
    var signupPassword = $("#signupPassword").val();
    createUser(signupEmail, signupPassword, signupName);
  });

  logoutBtn.click(function(){
    logout();
  });

  init();

});

