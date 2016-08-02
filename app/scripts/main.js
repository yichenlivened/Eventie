$(document).ready(function () {
  'use strict';

  //
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
  String.prototype.capitalizeFirstLetter = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
  };

  var homeModel, homeController, homeView;
  var navController, navView;
  var requirementModel;
  var modalSignup;

  //HOMEPAGE
  homeModel = {
    config: {
      apiKey: 'AIzaSyCxRkGJI20d-SRzTlFYnmU94Jnfj7oCJbw',
      authDomain: 'scorching-fire-2347.firebaseapp.com',
      databaseURL: 'https://scorching-fire-2347.firebaseio.com',
      storageBucket: 'scorching-fire-2347.appspot.com'
    }
  };

  homeController = {
    init: function () {
      // Initialize Firebase
      firebase.initializeApp(homeModel.config);

      // Initialize homepage
      homeView.init();
    }
  };

  homeView = {
    init: function () {

    }
  };

  homeController.init();


  //NAV
  navController = {
    init: function () {
      navView.init();
    },
    signOut: function () {
      firebase.auth().signOut().then(function () {
        console.log('logout');
      }, function (error) {
        console.log(error);
      });
    }
  };

  navView = {
    init: function () {
      this.headerLoginBtn = $('#headerLoginBtn');
      this.headerSignupBtn = $('#headerSignupBtn');
      this.headerUserBtn = $('#headerUserBtn');
      this.headerUsername = $('#headerUsername');
      this.headerLogoutBtn = $('#headerLogoutBtn');
      this.modalCreateEventBtn = $('#modalCreateEventBtn');
      //Auth State header
    },
    render: function (user) {
      var self = this;
      if (user) {
        firebase.database().ref('/users/' + user.uid).once('value').then(function (snapshot) {
          self.headerLoginBtn.addClass('hide');
          self.headerSignupBtn.addClass('hide');
          self.headerUsername.text('Hi, ' + snapshot.val().username).append('<span class="caret"></span>');
          self.headerUserBtn.removeClass('hide');
        });
        self.headerLogoutBtn.click(function(){
          navController.signOut();
        });
        self.modalCreateEventBtn.off('click');
        self.modalCreateEventBtn.click(function () {
          modalCreateEvent.modal('show');
        });
      } else {
        console.log('no user');
        self.headerLoginBtn.removeClass('hide');
        self.headerSignupBtn.removeClass('hide');
        self.headerUserBtn.addClass('hide');

        self.modalCreateEventBtn.off('click');
        self.modalCreateEventBtn.click(function () {
          modalSignup.modal('show');
        });
      }
    }
  };

  navController.init();
  firebase.auth().onAuthStateChanged(function (user) {
    navView.render(user);
  });

  //event table
  // firebase.database().ref('events/').once('value').then(function (snapshot) {
  //   $.each(snapshot.val(), function (key, value) {
  //     $('#showEvent').append('<div class="col-xs-12 col-md-6"><div class="thumbnail"><div class="caption"><p>' +
  //       value.eventStart
  //       + '</p><h3>' +
  //       value.eventTitle
  //       + '</h3><p>' +
  //       value.eventLocation
  //       + '</p></div></div></div>');
  //   });
  // });

  requirementModel = {
    nameRequirement: [
      {condition: 'value == ""', output: 'Please enter your name.'},
      {condition: 'value.length < 3', output: 'Your name should be greater than 3 characters.'},
      {condition: 'value.length > 20', output: 'Your name should be fewer than 20 characters.'}
    ],
    jobRequirement: [
      {condition: 'value.length > 20', output: 'Your job name should be fewer than 20 characters.'}
    ],
    emailRequirement: [
      {condition: 'value == ""', output: 'Please enter your email.'},
      {condition: '!construct.validateEmail(value)', output: 'Your email format is not right.'},
      {condition: 'value.length > 100', output: 'Your email should be fewer than 100 characters.'}
    ],
    passwordRequirement: [
      {condition: 'value == ""', output: 'Please enter your password.'},
      {condition: 'value.length < 3', output: 'Your password should be greater than 3 characters.'},
      {condition: 'value.length > 20', output: 'Your password should be fewer than 20 characters.'}
    ]
  };

  var ConstructForm = function(modalName, inputList, type, redirect){
    var construct = this;
    this.controller = {
      init: function () {
        construct.view.init();
      },
      getVal: function (name) {
        return construct.view[name].val();
      },
      check: function (varName) {
        var value = this.getVal(varName);
        var result = '';
        var requirement = requirementModel[varName + 'Requirement'];
        for (var i = 0; i < requirement.length; i++) {
          if (eval(requirement[i].condition)) {
            result = requirement[i].output;
            break;
          }
        }
        return result;
      },
      createUser: function(name, job, email, password){
          var self = this;
          firebase.auth().createUserWithEmailAndPassword(email, password).then(function(user){
            self.writeUserData(user.uid, name, job);
            console.log('successfully created the user.');
            console.log(user);
            construct.view.modal.modal('hide');
          }).catch(function(error) {
            var errorCode = error.code;
            alert(errorCode);
          });
      },
      writeUserData: function(userId, name, job){
          firebase.database().ref('users/' + userId).set({
            username: name,
            job: job
          });
      },
      login: function(email, password){
          firebase.auth().signInWithEmailAndPassword(email, password).then(function (user) {
            console.log(user);
            construct.view.modal.modal('hide');
          }).catch(function (error) {
            var errorMessage = error.message;
            alert(errorMessage);
          });
      }
    };

    this.view = {
      modalName: modalName,
      inputList: inputList,
      error: [],
      init: function () {
        var self = this;
        //modal
        this.modal = $('#' + modalName);

        //form
        inputList.forEach(function(input){
          self[input] = $('#' + modalName + input.capitalizeFirstLetter());
          self.addCheck(self[input], input);
        });
        //button
        this.modalSubmitBtn = this.modal.find('button[type=submit]');
        this.submit(self.modalSubmitBtn, type);
        // set first var focus
        this.focus(inputList[0]);

        //link
        if(redirect !== undefined){
          this.linkLogin = this.modal.find('.link-login');
          this.linkLogin.click(function () {
            this.modal.modal('hide');
            // modalSignupView.modal.modal('show');
          });
        }
      },
      alert: function (type, msg) {
        var htmlContent = '<div role="alert" class="alert alert-' + type + '">' +
          '<span class="alert-link">' + msg + '</span>' +
          '</div>';
        return htmlContent;
      },
      focus: function (valName) {
        var self = this;
        self.modal.on('shown.bs.modal', function () {
          self[valName].focus();
        });
      },
      cleanError: function () {
        this.error = [];
      },
      addCheck: function (checkVar, varName) {
        var self = this;
        checkVar.blur(function (e) {
          e.preventDefault();
          self.check(checkVar, varName);
        });
      },
      check: function (checkVar, varName) {
        var self = this;
        var result = construct.controller.check(varName);
        if (result == '') {
          checkVar.parent().find('.alert').remove();
        } else {
          self.error.push(varName);
          checkVar.parent().find('.alert').remove();
          checkVar.parent().append(self.alert('danger', result));
        }
      },
      submit: function (btn, type) {
        var self = this;
        var controller = construct.controller;
        btn.click(function (e) {
          e.preventDefault();
          self.cleanError();
          self.inputList.forEach(function (e) {
            self.check(self[e], e);
          });
          if (self.error.length == 0) {
            if(type == 'signup'){
              controller.createUser(controller.getVal('name'), controller.getVal('job'), controller.getVal('email'), controller.getVal('password'));
            }
            if(type == 'login'){
              controller.login(controller.getVal('email'), controller.getVal('password'));
            }
          } else {
            self[self.error[0]].focus();
          }
        })
      }
    };

    this.start = function(){
      this.controller.init();
    }
  };
  ConstructForm.prototype.validateEmail = function(email){
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  //SIGNUP MODAL
  var modalSignUp = new ConstructForm('modalSignup', ['name', 'job', 'email', 'password'], 'signup');
  modalSignUp.start();

  //SIGNUP MODAL
  var modalLogin = new ConstructForm('modalLogin', ['email', 'password'], 'login');
  modalLogin.start();



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

