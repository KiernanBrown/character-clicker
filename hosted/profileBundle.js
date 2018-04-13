'use strict';

var username = '';
var gold = 0;

var handleChange = function handleChange(e) {
  e.preventDefault();

  console.dir('hey');

  $("#characterMessage").animate({ width: 'hide' }, 350);

  if ($("#pass").val() == '' || $("#newPass").val() == '' || $("#newPass2").val() == '') {
    handleError("All fields are required");
    return false;
  }

  if ($("#newPass").val() !== $("#newPass2").val()) {
    handleError("Passwords do not match");
    return false;
  }

  sendAjax('POST', '/changePassword', $("#passwordForm").serialize(), redirect);

  return false;
};

var ProfileWindow = function ProfileWindow(props) {
  var submitForm = function submitForm() {
    console.dir('submit');
    document.getElementById('passwordForm').submit();
  };

  return React.createElement(
    'div',
    { id: 'profileInfo' },
    React.createElement(
      'h3',
      null,
      username,
      '\'s Profile Page'
    ),
    React.createElement(
      'p',
      null,
      'Gold: ',
      Math.floor(gold)
    ),
    React.createElement(
      'form',
      { id: 'passwordForm', name: 'passwordForm',
        onSubmit: handleChange,
        action: '/changePassword',
        method: 'POST',
        className: 'newForm'
      },
      React.createElement(
        'label',
        { htmlFor: 'pass' },
        'Current Password: '
      ),
      React.createElement('input', { id: 'pass', type: 'password', name: 'pass', placeholder: 'Current Password' }),
      React.createElement('br', null),
      React.createElement(
        'label',
        { htmlFor: 'newPass' },
        'New Password: '
      ),
      React.createElement('input', { id: 'newPass', type: 'password', name: 'newPass', placeholder: 'New Password' }),
      React.createElement('br', null),
      React.createElement(
        'label',
        { htmlFor: 'newPass2' },
        'Confirm New Password: '
      ),
      React.createElement('input', { id: 'newPass2', type: 'password', name: 'newPass2', placeholder: 'Retype New Password' }),
      React.createElement('input', { type: 'hidden', name: '_csrf', value: props.csrf }),
      React.createElement(
        'div',
        { className: 'row' },
        React.createElement(
          'button',
          { className: 'btn waves-effect waves-light grey', type: 'submit', name: 'action' },
          'Change Password',
          React.createElement(
            'i',
            { className: 'material-icons right' },
            'lock'
          )
        )
      )
    )
  );
};

var createProfileWindow = function createProfileWindow(csrf) {
  ReactDOM.render(React.createElement(ProfileWindow, { csrf: csrf }), document.querySelector("#content"));
};

var setup = function setup(csrf) {
  createProfileWindow(csrf); // Default view
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    username = result.account.username;
    gold = result.account.gold;
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#characterMessage").show();
  $("#characterMessage").fadeOut(3000);
};

var redirect = function redirect(response) {
  $("#characterMessage").animate({ width: 'hide' }, 350);
  window.location = response.redirect;
};

var sendAjax = function sendAjax(type, action, data, success) {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function error(xhr, status, _error) {
      console.dir(_error);
      console.warn(xhr.responseText);
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
