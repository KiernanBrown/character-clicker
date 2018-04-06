'use strict';

var selectedCharacter = {};
var selectedId = '';
var csrfToken = '';
var characters = [];

// Update all of our characters in the database
// We call this every 30 seconds as a way of autosaving
var saveToDB = function saveToDB() {
  console.dir('Saved to the db!');

  for (var i = 0; i < characters.length; i++) {
    var character = characters[i];
    sendAjax('POST', '/saveCharacter', 'id=' + character._id + '&xp=' + character.xp + '&xpNeeded=' + character.xpNeeded + '&level=' + character.level + '&_csrf=' + csrfToken);
  }
};

var handleCharacter = function handleCharacter(e) {
  e.preventDefault();

  saveToDB();

  $("#characterMessage").animate({ width: 'hide' }, 350);

  if ($("#characterName").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }

  sendAjax('POST', $("characterForm").attr("action"), $("#characterForm").serialize(), function () {
    loadCharactersFromServer();
  });

  return false;
};

var handleClick = function handleClick() {
  selectedCharacter.xp++;
  checkLevelUp();
  updateCharacter();
  ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
};

var checkLevelUp = function checkLevelUp() {
  if (selectedCharacter.xp >= selectedCharacter.xpNeeded) {
    selectedCharacter.xp -= selectedCharacter.xpNeeded;
    selectedCharacter.level++;
    selectedCharacter.xpNeeded = Math.floor(Math.pow(selectedCharacter.xpNeeded, 1.12));
    checkLevelUp();
  }
};

var updateCharacter = function updateCharacter() {
  for (var i = 0; i < characters.length; i++) {
    if (characters[i]._id === selectedCharacter._id) {
      characters[i] = selectedCharacter;
      break;
    }
  }
};

var CharacterForm = function CharacterForm(props) {
  return React.createElement(
    'form',
    { id: 'characterForm',
      onSubmit: handleCharacter,
      name: 'characterForm',
      action: '/maker',
      method: 'POST',
      className: 'characterForm'
    },
    React.createElement(
      'label',
      { htmlFor: 'name' },
      'Name: '
    ),
    React.createElement('input', { id: 'characterName', type: 'text', name: 'name', placeholder: 'Character Name' }),
    React.createElement('input', { id: 'csrfToken', type: 'hidden', name: '_csrf', value: props.csrf }),
    React.createElement('input', { className: 'makeCharacterSubmit', type: 'submit', value: 'Make Character' })
  );
};

var CharacterList = function CharacterList(props) {
  if (props.characters.length === 0) {
    return React.createElement(
      'div',
      { className: 'characterList' },
      React.createElement(
        'h3',
        { className: 'emptyCharacter' },
        'No Characters Yet'
      )
    );
  }

  csrfToken = document.querySelector("#csrfToken").value;

  var characterNodes = props.characters.map(function (character) {
    console.dir(character);

    var deleteCharacter = function deleteCharacter() {
      sendAjax('POST', '/deleteCharacter', 'id=' + character._id + '&_csrf=' + csrfToken, function () {
        loadCharactersFromServer({ csrfToken: csrfToken });
      });
    };

    var playGame = function playGame() {
      selectedCharacter = character;
      ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
    };

    if (selectedCharacter && selectedCharacter._id === character._id) return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { key: character._id, className: 'character', onClick: playGame },
        React.createElement('img', { src: '/assets/img/characterface.png', alt: 'character face', className: 'characterFace' }),
        React.createElement(
          'h3',
          { className: 'characterName' },
          ' Name: ',
          character.name,
          ' '
        ),
        React.createElement(
          'h3',
          { className: 'characterAge' },
          ' Rarity: ',
          character.rarity,
          ' '
        ),
        React.createElement(
          'h3',
          { className: 'characterFood' },
          ' Level: ',
          character.level,
          ' '
        ),
        React.createElement('input', { className: 'makeCharacterSubmit', type: 'submit', id: 'deleteButton', onClick: deleteCharacter, value: 'Delete Character' })
      ),
      React.createElement(
        'div',
        null,
        React.createElement(
          'p',
          null,
          'Current XP: ',
          character.xp,
          ' XP Needed For Level Up: ',
          character.xpNeeded
        ),
        React.createElement('input', { className: 'makeCharacterSubmit', onClick: handleClick, value: 'Click to gain xp' })
      )
    );else return React.createElement(
      'div',
      { key: character._id, className: 'character', onClick: playGame },
      React.createElement('img', { src: '/assets/img/characterface.png', alt: 'character face', className: 'characterFace' }),
      React.createElement(
        'h3',
        { className: 'characterName' },
        ' Name: ',
        character.name,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'characterAge' },
        ' Rarity: ',
        character.rarity,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'characterFood' },
        ' Level: ',
        character.level,
        ' '
      ),
      React.createElement('input', { className: 'makeCharacterSubmit', type: 'submit', id: 'deleteButton', onClick: deleteCharacter, value: 'Delete Character' })
    );
  });

  return React.createElement(
    'div',
    { className: 'characterList' },
    React.createElement(
      'h2',
      null,
      'Click on one of your characters to open their menus'
    ),
    characterNodes
  );
};

var loadCharactersFromServer = function loadCharactersFromServer(csrf) {
  sendAjax('GET', '/getCharacters', null, function (data) {
    characters = data.characters;
    ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: data.characters }), document.querySelector("#characters"));
  });
};

var setup = function setup(csrf) {
  ReactDOM.render(React.createElement(CharacterForm, { csrf: csrf }), document.querySelector("#makeCharacter"));

  ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: [] }), document.querySelector("#characters"));

  loadCharactersFromServer(csrf);

  setInterval(saveToDB, 30000);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    setup(result.csrfToken);
  });
};

$(document).ready(function () {
  getToken();
});
"use strict";

var handleError = function handleError(message) {
  $("#errorMessage").text(message);
  $("#characterMessage").animate({ width: 'toggle' }, 350);
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
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
