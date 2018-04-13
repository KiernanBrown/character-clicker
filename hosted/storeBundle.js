'use strict';

var username = '';
var gold = 0;

var StoreWindow = function StoreWindow(props) {
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
      'Store'
    ),
    React.createElement(
      'p',
      null,
      '(Not implemented)'
    ),
    React.createElement(
      'div',
      { className: 'storeDiv' },
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'button',
          { className: 'btn waves-effect waves-light grey', type: 'submit', name: 'action' },
          'Buy 50 Gems ($4.99)'
        )
      ),
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'button',
          { className: 'btn waves-effect waves-light grey', type: 'submit', name: 'action' },
          'Buy 110 Gems ($9.99)'
        )
      ),
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'button',
          { className: 'btn waves-effect waves-light grey', type: 'submit', name: 'action' },
          'Buy 250 Gems ($19.99)'
        )
      )
    )
  );
};

var createStoreWindow = function createStoreWindow(csrf) {
  ReactDOM.render(React.createElement(StoreWindow, { csrf: csrf }), document.querySelector("#content"));
};

var setup = function setup(csrf) {
  createStoreWindow(csrf); // Default view
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
