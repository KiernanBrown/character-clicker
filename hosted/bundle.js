'use strict';

var selectedCharacter = {};
var selectedId = '';
var csrfToken = '';
var characters = [];
var gold = 0;
var account = {};

// Update all of our characters in the database
// We call this every 30 seconds as a way of autosaving
var saveToDB = function saveToDB() {
  console.dir('Saved to the db!');
  sendAjax('POST', '/saveAccount', 'id=' + account._id + '&gold=' + gold + '&_csrf=' + csrfToken);

  for (var i = 0; i < characters.length; i++) {
    var character = characters[i];
    sendAjax('POST', '/saveCharacter', 'id=' + character._id + '&xp=' + character.xp + '&xpNeeded=' + character.xpNeeded + '&level=' + character.level + '&upgrades=' + character.upgrades + '&_csrf=' + csrfToken);
  }
};

// Function to create a character
var createCharacter = function createCharacter(e) {
  e.preventDefault();

  saveToDB();

  if (gold < 2000) {
    handleError("You don't have enough gold!");
    return false;
  }

  sendAjax('POST', '/maker', '_csrf=' + csrfToken, function () {
    gold -= 2000;
    loadCharactersFromServer();
  });

  return false;
};

// Function to handle clicking to train a character
var handleClick = function handleClick() {
  selectedCharacter.xp++;
  if (selectedCharacter.upgrades.includes('Dedicated Trainer')) selectedCharacter.xp++;
  checkLevelUp();
  updateCharacter();
  ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
};

// Function to check if a character should level up
var checkLevelUp = function checkLevelUp() {
  if (selectedCharacter.xp >= selectedCharacter.xpNeeded) {
    selectedCharacter.xp -= selectedCharacter.xpNeeded;
    selectedCharacter.level++;
    selectedCharacter.xpNeeded = Math.floor(Math.pow(selectedCharacter.xpNeeded, 1.12));
    checkLevelUp();
  }
};

// Function to update character
var updateCharacter = function updateCharacter() {
  for (var i = 0; i < characters.length; i++) {
    if (characters[i]._id === selectedCharacter._id) {
      characters[i] = selectedCharacter;
      break;
    }
  }
};

// Function to update the gold modifier for each character
var updateGoldMods = function updateGoldMods() {
  for (var i = 0; i < characters.length; i++) {
    var character = characters[i];
    var gMod = 1.0;
    if (character.rarity === 'Uncommon') gMod = 1.25;else if (character.rarity === 'Rare') gMod = 1.5;else if (character.rarity === 'Epic') gMod = 1.75;else if (character.rarity === 'Legendary') gMod = 2;
    if (character.upgrades.includes('Golden Touch')) gMod *= 2;
    character.goldMod = gMod;
  }
};

// Function to update your gold
// This is called every second
var updateGold = function updateGold() {
  for (var i = 0; i < characters.length; i++) {
    gold += characters[i].level * characters[i].goldMod;
  }
  document.querySelector('#goldNum').textContent = 'Gold: ' + Math.floor(gold);
};

// Purchases the Golden Touch upgrade for the selected character (double gold)
var purchaseGolden = function purchaseGolden() {
  if (selectedCharacter.upgrades.includes('Golden Touch')) {
    handleError('This character already has this upgrade');
    return false;
  }

  if (gold < 1000) {
    handleError("You don't have enough gold");
    return false;
  }

  gold -= 1000;
  selectedCharacter.upgrades.push('Golden Touch');

  updateGoldMods();
  saveToDB();
  ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
};

// Purchases the Dedicated Trainer upgrade for the selected character (double xp)
var purchaseDedicated = function purchaseDedicated() {
  if (selectedCharacter.upgrades.includes('Dedicated Trainer')) {
    handleError('This character already has this upgrade');
    return false;
  }

  if (gold < 1000) {
    handleError("You don't have enough gold");
    return false;
  }

  gold -= 1000;
  selectedCharacter.upgrades.push('Dedicated Trainer');

  saveToDB();

  ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
};

// Create the div for the selected character
var SelectedCharacterDiv = function SelectedCharacterDiv(props) {
  var character = props.character;

  var deleteCharacter = function deleteCharacter() {
    if (characters.length > 1) {
      sendAjax('POST', '/deleteCharacter', 'id=' + character._id + '&_csrf=' + csrfToken, function () {
        loadCharactersFromServer({ csrfToken: csrfToken });
      });
    } else {
      handleError("You cannot delete your only character!");
      return false;
    }
  };

  // Only display upgrades if the character is level 5 or higher
  if (character.level >= 5) {
    if (selectedCharacter.upgrades.includes('Golden Touch') && selectedCharacter.upgrades.includes('Dedicated Trainer')) {
      return React.createElement(
        'div',
        { className: 'characterMenu' },
        React.createElement(
          'p',
          null,
          'Current XP: ',
          character.xp,
          ' XP Needed For Level Up: ',
          character.xpNeeded
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered purple darken-3', onClick: handleClick },
          'Train Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered red darken-4', onClick: deleteCharacter },
          'Delete Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade disabled', onClick: purchaseGolden },
          'Purchase Golden Touch (1000 Gold)'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade disabled', onClick: purchaseDedicated },
          'Purchase Dedicated Trainer (1000 Gold)'
        )
      );
    } else if (selectedCharacter.upgrades.includes('Golden Touch')) {
      return React.createElement(
        'div',
        { className: 'characterMenu' },
        React.createElement(
          'p',
          null,
          'Current XP: ',
          character.xp,
          ' XP Needed For Level Up: ',
          character.xpNeeded
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered purple darken-3', onClick: handleClick },
          'Train Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered red darken-4', onClick: deleteCharacter },
          'Delete Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade disabled', onClick: purchaseGolden },
          'Purchase Golden Touch (1000 Gold)'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade', onClick: purchaseDedicated },
          'Purchase Dedicated Trainer (1000 Gold)'
        )
      );
    } else if (selectedCharacter.upgrades.includes('Dedicated Trainer')) {
      return React.createElement(
        'div',
        { className: 'characterMenu' },
        React.createElement(
          'p',
          null,
          'Current XP: ',
          character.xp,
          ' XP Needed For Level Up: ',
          character.xpNeeded
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered purple darken-3', onClick: handleClick },
          'Train Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered red darken-4', onClick: deleteCharacter },
          'Delete Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade', onClick: purchaseGolden },
          'Purchase Golden Touch (1000 Gold)'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade disabled', onClick: purchaseDedicated },
          'Purchase Dedicated Trainer (1000 Gold)'
        )
      );
    } else {
      return React.createElement(
        'div',
        { className: 'characterMenu' },
        React.createElement(
          'p',
          null,
          'Current XP: ',
          character.xp,
          ' XP Needed For Level Up: ',
          character.xpNeeded
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered purple darken-3', onClick: handleClick },
          'Train Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered red darken-4', onClick: deleteCharacter },
          'Delete Character'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade', onClick: purchaseGolden },
          'Purchase Golden Touch (1000 Gold)'
        ),
        React.createElement(
          'a',
          { className: 'waves-effect waves-light btn centered green darken-1 upgrade', onClick: purchaseDedicated },
          'Purchase Dedicated Trainer (1000 Gold)'
        )
      );
    }
  } else {
    return React.createElement(
      'div',
      { className: 'characterMenu' },
      React.createElement(
        'p',
        null,
        'Current XP: ',
        character.xp,
        ' XP Needed For Level Up: ',
        character.xpNeeded
      ),
      React.createElement(
        'a',
        { className: 'waves-effect waves-light btn centered purple darken-3', onClick: handleClick },
        'Train Character'
      ),
      React.createElement(
        'a',
        { className: 'waves-effect waves-light btn centered red darken-4', onClick: deleteCharacter },
        'Delete Character'
      )
    );
  }
};

// List of all the characters the user has
var CharacterList = function CharacterList(props) {
  if (props.characters.length === 0) {
    return React.createElement(
      'div',
      { className: 'characterList' },
      React.createElement(
        'h3',
        { className: 'emptyCharacter' },
        'No Characters Yet'
      ),
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'a',
          { id: 'createButton', className: 'waves-effect waves-light btn', onClick: createCharacter },
          'Create a Character (2000 Gold)'
        )
      )
    );
  }

  var characterNodes = props.characters.map(function (character) {
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
          { className: 'characterInfo' },
          ' Name: ',
          character.name,
          ' '
        ),
        React.createElement(
          'h3',
          { className: 'characterInfo' },
          ' Rarity: ',
          character.rarity,
          ' '
        ),
        React.createElement(
          'h3',
          { className: 'characterInfo' },
          ' Level: ',
          character.level,
          ' '
        )
      ),
      React.createElement(SelectedCharacterDiv, { character: selectedCharacter })
    );else return React.createElement(
      'div',
      { key: character._id, className: 'character', onClick: playGame },
      React.createElement('img', { src: '/assets/img/characterface.png', alt: 'character face', className: 'characterFace' }),
      React.createElement(
        'h3',
        { className: 'characterInfo' },
        ' Name: ',
        character.name,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'characterInfo' },
        ' Rarity: ',
        character.rarity,
        ' '
      ),
      React.createElement(
        'h3',
        { className: 'characterInfo' },
        ' Level: ',
        character.level,
        ' '
      )
    );
  });

  if (characterNodes.length < 4) {
    // Display the create a character button if the user has less than 4 characters
    return React.createElement(
      'div',
      { className: 'characterList' },
      React.createElement(
        'h4',
        { className: 'centered' },
        'Click on one of your characters to open their menus'
      ),
      characterNodes,
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'a',
          { id: 'createButton', className: 'waves-effect waves-light btn', onClick: createCharacter },
          'Create a Character (2000 Gold)'
        )
      )
    );
  } else {
    // Otherwise display a buy character slots button
    return React.createElement(
      'div',
      null,
      React.createElement(
        'div',
        { className: 'characterList' },
        React.createElement(
          'h4',
          { className: 'centered' },
          'Click on one of your characters to open their menus'
        ),
        characterNodes
      ),
      React.createElement(
        'p',
        { className: 'centered' },
        React.createElement(
          'a',
          { href: '/store', className: 'waves-effect waves-light btn centered purple darken-3 centered' },
          'Buy An Additional Character Slot (20 Gems)'
        )
      )
    );
  }
};

// Gets our characters from the server
var loadCharactersFromServer = function loadCharactersFromServer(csrf) {
  sendAjax('GET', '/getCharacters', null, function (data) {
    characters = data.characters;
    ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: data.characters }), document.querySelector("#characters"));
    updateGoldMods();
  });
};

var setup = function setup(csrf) {
  csrfToken = csrf;

  ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: [] }), document.querySelector("#characters"));

  loadCharactersFromServer(csrf);

  setInterval(saveToDB, 5000);
  setInterval(updateGold, 1000);
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    account = result.account;
    gold = account.gold;
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
