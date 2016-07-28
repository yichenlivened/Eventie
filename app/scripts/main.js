$(document).ready(function () {
  'use strict';

  // Initialize Firebase
  var config = {
    apiKey: 'AIzaSyCxRkGJI20d-SRzTlFYnmU94Jnfj7oCJbw',
    authDomain: 'scorching-fire-2347.firebaseapp.com',
    databaseURL: 'https://scorching-fire-2347.firebaseio.com',
    storageBucket: 'scorching-fire-2347.appspot.com',
  };

  firebase.initializeApp(config);

  $.fn.serializeObject = function () {
    var o = {};
    var a = this.serializeArray();
    $.each(a, function () {
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

  function validateEmail(email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  }

  //Auth State header
  firebase.auth().onAuthStateChanged(function (user) {
    var headerLoginBtn = $('#headerLoginBtn');
    var headerSignupBtn = $('#headerSignupBtn');
    var headerUserBtn = $('#headerUserBtn');
    var headerUsername = $('#headerUsername');
    var headerLogoutBtn = $('#headerLogoutBtn');
    var modalCreateEventBtn = $('#modalCreateEventBtn');

    if (user) {
      firebase.database().ref('/users/' + user.uid).once('value').then(function (snapshot) {
        headerLoginBtn.addClass('hide');
        headerSignupBtn.addClass('hide');
        headerUsername.text('Hi, ' + snapshot.val().username).append('<span class="caret"></span>');
        headerUserBtn.removeClass('hide');
      });
      modalCreateEventBtn.off('click');
      modalCreateEventBtn.click(function () {
        modalCreateEvent.modal('show');
      });
    } else {
      console.log('no user');

      headerLoginBtn.removeClass('hide');
      headerSignupBtn.removeClass('hide');
      headerUserBtn.addClass('hide');

      modalCreateEventBtn.off('click');
      modalCreateEventBtn.click(function () {
        modalSignup.modal('show');
      });
    }

    headerLogoutBtn.click(function () {
      logout();
      function logout() {
        firebase.auth().signOut().then(function () {
          console.log('logout');
        }, function (error) {
          console.log('error');
        });
      }
    });
  });

  //event table
  firebase.database().ref('events/').once('value').then(function (snapshot) {
    $.each(snapshot.val(), function (key, value) {
      $('#showEvent').append('<div class="col-xs-12 col-md-6"><div class="thumbnail"><div class="caption"><p>' +
        value.eventStart
        + '</p><h3>' +
        value.eventTitle
        + '</h3><p>' +
        value.eventLocation
        + '</p></div></div></div>');
    });
  });

  function alert(type, msg) {
    var htmlContent = '<div role="alert" class="alert alert-' + type + '">' +
      '<span class="alert-link">' + msg + ' </span>' +
      '</div>';
    return htmlContent;
  }

//modal signup
  var modalSignupBtn = $('#modalSignupBtn');
  var modalSignup = $('#modalSignup');
  var modalRLogin = $('#modalRLogin');

  var modalSignupName = $('#modalSignupName');
  var modalSignupJob = $('#modalSignupJob');
  var modalSignupEmail = $('#modalSignupEmail');
  var modalSignupPassword = $('#modalSignupPassword');

  modalSignup.on('shown.bs.modal', function () {
    modalSignupName.focus();
  });

  modalRLogin.click(function () {
    modalSignup.modal('hide');
    modalLogin.modal('show');
  });


  //get input value
  var modalSignupNameVal = modalSignupName.val();
  var modalSignupJobVal = modalSignupJob.val();
  var modalSignupEmailVal = modalSignupEmail.val();
  var modalSignupPasswordVal = modalSignupPassword.val();

  modalSignupName.blur(function (e) {
    e.preventDefault();

    var modalSignupNameIssue= $('#modalSignupName-issue');

    modalSignupNameVal = modalSignupName.val();

    if (modalSignupNameVal == '') {
      modalSignupNameIssue.html(alert('danger','Please enter your name.'));
    } else if (modalSignupNameVal.length < 3) {
      modalSignupNameIssue.html(alert('danger','Your name should be greater than 3 characters.'));
    } else if (modalSignupNameVal && modalSignupNameVal.length > 20) {
      modalSignupNameIssue.html(alert('danger','Your name should be fewer than 20 characters.'));
    } else {
      modalSignupNameIssue.html('');
    }

  });

  $("#formSignup").click(function (e) {

    // function createUser(name, job, email, password){
    //   firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
    //     writeUserData(user.uid, name, job);
    //     console.log('successfully created the user.');
    //     console.log(user);
    //     modalSignup.modal('hide');
    //   }).catch(function(error) {
    //     var errorCode = error.code;
    //     var errorMessage = error.message;
    //     modalSignupEmail[0].setCustomValidity(errorMessage);
    //   });
    // }
    //
    // function writeUserData(userId, name, job) {
    //   firebase.database().ref('users/' + userId).set({
    //     username: name,
    //     job: job
    //   });
    // }

  });


//modal login
  var modalLoginBtn = $('#modalLoginBtn');
  var modalLogin = $('#modalLogin');

  modalLoginBtn.click(function () {

    var modalLoginEmail = $('#modalLoginEmail');
    var modalLoginPassword = $('#modalLoginPassword');

    //get input val value
    var modalLoginEmailVal = $('#modalLoginEmail').val();
    var modalLoginPasswordVal = $('#modalLoginPassword').val();

    //add issue tracker
    var modalLoginEmailTraker = new IssueTracker();
    var modalLoginPasswordTraker = new IssueTracker();

    function checkrequirements() {
      if (!validateEmail(modalLoginEmailVal)) {
        modalLoginEmailTraker.add('Email address is badly formatted.');
      }

      if (modalLoginPasswordVal.length < 5) {
        modalLoginPasswordTraker.add('Password should be greater than 5 characters.');
      } else if (modalLoginPasswordVal.length > 20) {
        modalLoginPasswordTraker.add('Password should be fewer than 20 characters.');
      }
    };

    function login(email, password) {
      firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
        console.log('successfully log in.');
        modalLogin.modal('hide');
      }).catch(function (error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        modalLoginEmail[0].setCustomValidity(errorMessage);
      });
    }

    checkrequirements();

    var modalLoginEmailIssue = modalLoginEmailTraker.retrieve();
    var modalLoginPasswordIssue = modalLoginPasswordTraker.retrieve();

    if (modalLoginEmailIssue.length + modalLoginPasswordIssue.length === 0) {
      login(modalLoginEmailVal, modalLoginPasswordVal);
    } else {
      modalLoginEmail[0].setCustomValidity(modalLoginEmailIssue);
      modalLoginPassword[0].setCustomValidity(modalLoginPasswordIssue);
    }
    ;

  });

//modal create event
  var modalSubmitBtn = $('#modalSubmitBtn');
  var modalCreateEvent = $('#modalCreateEvent');

  modalSubmitBtn.click(function () {

    var modalEventTitle = $('modalEventTitle');
    var modalEventType = $('modalEventType');
    var modalEventHost = $('modalEventHost');
    var modalEventDate = $('modalEventDate');
    var modalEventLocation = $('modalEventLocation');
    var modalEventGuest = $('modalEventGuest');
    var modalEventMessage = $('modalEventMessage');

    //get input value
    var modalEventTitleVal = modalEventTitle.val();
    var modalEventTypeVal = $('#modalEventType option:selected').text();
    var modalEventHostVal = modalEventHost.val();
    var modalEventDateVal = modalEventDate.val();
    var modalEventLocationVal = modalEventLocation.val();
    var modalEventGuestVal = modalEventGuest.val();
    var modalEventMessageVal = modalEventMessage.val();

    //add issue tracker
    var modalEventTitleTraker = new IssueTracker();
    var modalEventTypeTraker = new IssueTracker();
    var modalEventHostTraker = new IssueTracker();
    var modalEventDateTraker = new IssueTracker();
    var modalEventLocationTraker = new IssueTracker();
    var modalEventGuestTraker = new IssueTracker();
    var modalEventMessageTraker = new IssueTracker();

    function checkrequirements() {

      if (modalEventTitleVal.length < 3) {
        modalEventTitleTraker.add('Event title should be greater than 3 characters.');
      } else if (modalEventTitleVal.length > 20) {
        modalEventTitleTraker.add('Event title should be fewer than 20 characters.');
      }
      ;

      if (modalEventTypeVal === 'Select the type of the event') {
        modalEventTypeTraker.add('Please select an event type.');
      }

      if (modalEventHostVal.length < 3) {
        modalEventHostTraker.add('Host name should be greater than 3 characters.');
      } else if (modalEventHostVal.length > 20) {
        modalEventHostTraker.add('Host name shouold be fewer than 20 characters.');
      }
    }

    console.log(modalEventTitleVal);
    checkrequirements();

    var modalEventTitleIssue = modalEventTitleTraker.retrieve();
    var modalEventTypeIssue = modalEventTypeTraker.retrieve();
    var modalEventHostIssue = modalEventHostTraker.retrieve();

    modalEventTitle[0].setCustomValidity(modalEventTitleIssue);
    modalEventHost[0].setCustomValidity.setCustomValidity(modalEventHostIssue);

    createEvent();

    function createEvent() {
      var user = firebase.auth().currentUser;
      writeNewPost(user.uid);

      function writeNewPost(uid) {
        var formData = $('#createEvent').serializeObject();

        console.log(formData);
        var newPostKey = firebase.database().ref().child('posts').push().key;
        var updates = {};
        updates['/events/' + newPostKey] = formData;
        updates['/users/' + uid + '/events/' + newPostKey] = formData;
        return firebase.database().ref().update(updates);
      }
    }

    return false;
  });


});

