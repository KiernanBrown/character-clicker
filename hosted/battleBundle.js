'use strict';

var username = '';
var gold = 0;
var battlesCompleted = 0;
var characters = void 0;
var hp = 10;
var damage = 1;
var enemy = void 0;
var account = void 0;
var csrfToken = void 0;
var enemyAttackInterval = void 0;

var startBattle = function startBattle() {
  enemy = {
    hp: Math.floor(battlesCompleted * 10 * Math.pow(battlesCompleted, 1.12) + 10),
    damage: battlesCompleted * 2 + 1
  };
  loadCharactersFromServer();

  // The enemy attacks every 3 seconds
  enemyAttackInterval = setInterval(enemyAttack, 3000);
};

var attack = function attack() {
  enemy.hp -= damage;
  createBattleWindow();
  if (enemy.hp <= 0) {
    handleError('You have won the battle! Gold Cap increased by 500!');
    endBattle(true);
  }
};

var enemyAttack = function enemyAttack() {
  hp -= enemy.damage;
  createBattleWindow();
  if (hp <= 0) {
    handleError('You have lost the battle!');
    endBattle(false);
  }
};

var endBattle = function endBattle(won) {
  if (won) {
    account.battlesCompleted++;
    battlesCompleted++;
    saveToDB();
    account.goldCap += 500;
  }
  hp = 10;
  damage = 1;
  clearInterval(enemyAttackInterval);

  // Render our PreBattleWindow again
  ReactDOM.render(React.createElement(PreBattleWindow, null), document.querySelector("#content"));
};

var PreBattleWindow = function PreBattleWindow(props) {
  return React.createElement(
    'div',
    { id: 'battleInfo' },
    React.createElement(
      'h3',
      { className: 'centered' },
      'Battle'
    ),
    React.createElement(
      'h5',
      { className: 'centered' },
      'Battles Completed: ',
      battlesCompleted
    ),
    React.createElement(
      'p',
      { className: 'centered' },
      'Battle monsters of increasing difficulty using the characters that you have trained up. Enemies will attack you every 3 seconds. Try to defeat the enemy before your HP runs out to increase your gold cap as a reward!'
    ),
    React.createElement(
      'div',
      { className: 'battleDiv' },
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'button',
          { className: 'btn-large waves-effect waves-light green', onClick: startBattle },
          React.createElement(
            'i',
            { className: 'material-icons right' },
            'colorize'
          ),
          'Start Battle'
        )
      )
    )
  );
};

var BattleWindow = function BattleWindow(props) {
  return React.createElement(
    'div',
    { id: 'battleInfo' },
    React.createElement(
      'h3',
      { className: 'centered' },
      'Battle'
    ),
    React.createElement(
      'h5',
      { className: 'centered' },
      'Battles Completed: ',
      battlesCompleted
    ),
    React.createElement(
      'p',
      { className: 'centered' },
      'Battle monsters of increasing difficulty using the characters that you have trained up. Enemies will attack you every 3 seconds. Try to defeat the enemy before your HP runs out to increase your gold cap as a reward!'
    ),
    React.createElement(
      'div',
      { className: 'battleDiv' },
      React.createElement(
        'h3',
        { className: 'centered' },
        'Battle ',
        battlesCompleted + 1
      ),
      React.createElement(
        'h5',
        { className: 'centered' },
        'Enemy HP: ',
        enemy.hp
      ),
      React.createElement(
        'h5',
        { className: 'centered' },
        'Your HP: ',
        hp
      ),
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'button',
          { className: 'btn-large waves-effect waves-light red', onClick: attack },
          React.createElement(
            'i',
            { className: 'material-icons right' },
            'colorize'
          ),
          'Attack (',
          damage,
          ')'
        )
      )
    )
  );
};

var createPreBattleWindow = function createPreBattleWindow(csrf) {
  ReactDOM.render(React.createElement(PreBattleWindow, { csrf: csrf }), document.querySelector("#content"));
};

var createBattleWindow = function createBattleWindow() {
  ReactDOM.render(React.createElement(BattleWindow, null), document.querySelector("#content"));
};

var setup = function setup(csrf) {
  csrfToken = csrf;
  createPreBattleWindow(csrf); // Default view
};

// Gets our characters from the server
var loadCharactersFromServer = function loadCharactersFromServer() {
  sendAjax('GET', '/getCharacters', null, function (data) {
    characters = data.characters;
    for (var i = 0; i < characters.length; i++) {
      hp += characters[i].defense;
      damage += characters[i].attack;
    }

    createBattleWindow();
  });
};

// Save the account to the database
var saveToDB = function saveToDB() {
  sendAjax('POST', '/saveAccount', 'id=' + account._id + '&gold=' + gold + '&battlesCompleted=' + battlesCompleted + '&_csrf=' + csrfToken);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    account = result.account;
    username = account.username;
    gold = account.gold;
    battlesCompleted = account.battlesCompleted;
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  // Error message fade out
  // http://jsfiddle.net/JohnnyWorker/SC7Zm/
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
