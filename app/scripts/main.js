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
  String.prototype.capitalizeFirstLetter = function () {
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
      firebase.database().ref('events/').once('value').then(function (snapshot) {
        $('#showEvent').html('');
        $.each(snapshot.val(), function (key, value) {
          $('#showEvent').append('<div class="col-xs-12 col-md-6"><div class="thumbnail"><div class="caption"><p>' +
            value.start
            + '</p><h3>' +
            value.title
            + '</h3><p>' +
            value.location
            + '</p></div></div></div>');
        });
      });
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
      this.createEventBtn = $('#createEventBtn');
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
        self.headerLogoutBtn.click(function () {
          navController.signOut();
        });
        self.createEventBtn.off('click');
        self.createEventBtn.click(function () {
          console.log(modalCreateEvent.view.modal);
          modalCreateEvent.view.modal.modal('show');
        });
      } else {
        console.log('no user');
        self.headerLoginBtn.removeClass('hide');
        self.headerSignupBtn.removeClass('hide');
        self.headerUserBtn.addClass('hide');

        self.createEventBtn.off('click');
        self.createEventBtn.click(function () {
          modalSignUp.view.modal.modal('show');
        });
      }
    }
  };

  navController.init();
  firebase.auth().onAuthStateChanged(function (user) {
    navView.render(user);
  });



  requirementModel = {
    nameRequirement: [
      {condition: 'value == ""', output: 'Please enter your name.'},
      {condition: 'value.length < 3', output: 'Your name should be greater than 3 characters.'},
      {condition: 'value.length > 30', output: 'Your name should be fewer than 30 characters.'}
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
      {condition: 'value.length < 8', output: 'Your password should be greater than 8 characters.'},
      {condition: 'value.length > 20', output: 'Your password should be fewer than 20 characters.'}
    ],
    titleRequirement: [
      {condition: 'value == ""', output: 'Please enter the event title.'},
      {condition: 'value.length < 3', output: 'Your title should be greater than 3 characters.'},
      {condition: 'value.length > 20', output: 'Your title should be fewer than 20 characters.'}
    ],
    typeRequirement: [
      {condition: 'value == "Select the type of the event"', output: 'Please select the type of the event.'}
    ],
    hostRequirement: [
      {condition: 'value == ""', output: 'Please enter the event host.'},
      {condition: 'value.length < 3', output: 'The event host should be greater than 3 characters.'},
      {condition: 'value.length > 20', output: 'The event host should be fewer than 20 characters.'}
    ],
    startRequirement: [
      {condition: 'value == ""', output: 'Please enter the event start time.'}
    ],
    endRequirement: [
      {condition: 'value == ""', output: 'Please enter the event end time.'}
    ],
    locationRequirement: [
      {condition: 'value == ""', output: 'Please enter the event location.'},
      {condition: 'value.length < 3', output: 'The event location should be greater than 3 characters.'},
      {condition: 'value.length > 50', output: 'The event location should be fewer than 50 characters.'}
    ],
    guestRequirement: [
      {condition: 'value == ""', output: 'Please enter the event guest.'},
      {condition: 'value.length < 3', output: 'The event guest should be greater than 3 characters.'},
      {condition: 'value.length > 20', output: 'The event guest should be fewer than 20 characters.'}
    ],
    messageRequirement: [
      {condition: 'value.length > 100', output: 'The event message should be fewer than 100 characters.'}
    ]
  };

  var ConstructForm = function (modalName, inputList, type) {
    var construct = this;
    this.controller = {
      init: function () {
        construct.view.init();
      },
      clean: function (){
        inputList.forEach(function (e) {
          construct.view[e].val('');
        });
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
        if(varName == 'start'){
          value = new Date(value);
          var dateNow = new Date();
          if(dateNow > value){
            result = 'Start day should be after' + dateNow;
          }
        }
        if(varName == 'end'){
          value = new Date(value);
          var start = new Date(this.getVal('start'));
          if(this.getVal('start') == ''){
            result = 'Please enter start day.';
          }
          if(start > value){
            result = 'End day should be after start day:' + start;
          }
        }
        return result;
      },
      createUser: function (name, job, emailVal, passwordVal) {
        var self = this;
        firebase.auth().createUserWithEmailAndPassword(emailVal, passwordVal).then(function (user) {
          self.writeUserData(user.uid, name, job);
          console.log('successfully created the user.');
          console.log(user);
          construct.view.modal.modal('hide');
        }).catch(function (error) {
          construct.view.email.parent().append(construct.view.alert('danger', error.message));
        });
      },
      writeUserData: function (userId, name, job) {
        firebase.database().ref('users/' + userId).set({
          username: name,
          job: job
        });
      },
      login: function (emailVal, passwordVal) {
        firebase.auth().signInWithEmailAndPassword(emailVal, passwordVal).then(function (user) {
          console.log(user);
          construct.view.modal.modal('hide');
        }).catch(function (error) {
          construct.view.password.parent().append(construct.view.alert('danger', error.message));
        });
      },
      createEvent: function createEvent(title, type, host, start, end, location, guest, message) {
        var user = firebase.auth().currentUser;
        function writeNewPost(uid) {
          var formData = {
            title: title,
            type: type,
            host: host,
            start: start,
            end: end,
            location: location,
            guest: guest,
            message: message
          };
          var newPostKey = firebase.database().ref().child('posts').push().key;
          var updates = {};
          updates['/events/' + newPostKey] = formData;
          updates['/users/' + uid + '/events/' + newPostKey] = formData;
          return firebase.database().ref().update(updates);
        }
        writeNewPost(user.uid).then(function(){
          construct.controller.clean();
          construct.view.modal.modal('hide');
          homeView.init();
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
        inputList.forEach(function (input) {
          self[input] = $('#' + modalName + input.capitalizeFirstLetter());
          self.addCheck(self[input], input);
        });
        //button
        this.modalSubmitBtn = this.modal.find('button[type=submit]');
        this.submit(self.modalSubmitBtn, type);
        // set first var focus
        this.focus(inputList[0]);

        //link
        if (type == 'signup') {
          this.link = this.modal.find('.link-login');
          this.link.click(function () {
            self.modal.modal('hide');
            modalLogin.view.modal.modal('show');
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
            console.log('submit');
            if (type == 'signup') {
              controller.createUser(controller.getVal('name'), controller.getVal('job'), controller.getVal('email'), controller.getVal('password'));
            }
            if (type == 'login') {
              controller.login(controller.getVal('email'), controller.getVal('password'));
            }
            if (type == 'createEvent') {
              controller.createEvent(controller.getVal('title'), controller.getVal('type'),controller.getVal('host'),controller.getVal('start'), controller.getVal('end'), controller.getVal('location'), controller.getVal('guest'), controller.getVal('message'));
            }
          } else {
            self[self.error[0]].focus();
          }
        })
      }
    };

    this.start = function () {
      this.controller.init();
    }
  };
  ConstructForm.prototype.validateEmail = function (email) {
    var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
  };

  //SIGNUP MODAL
  var modalSignUp = new ConstructForm('modalSignup', ['name', 'job', 'email', 'password'], 'signup');
  modalSignUp.start();

  //SIGNUP MODAL
  var modalLogin = new ConstructForm('modalLogin', ['email', 'password'], 'login');
  modalLogin.start();

  //CREATE MODAL
  var modalCreateEvent = new ConstructForm('modalCreateEvent', ['title', 'type', 'host', 'start', 'end', 'location', 'guest', 'message'], 'createEvent');
  modalCreateEvent.start();

});

