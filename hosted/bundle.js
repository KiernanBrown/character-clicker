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

var initializeTooltips = function initializeTooltips() {
  $('.tooltipped').tooltip({ delay: 50 });
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
    selectedCharacter.attack++;
    selectedCharacter.defense++;
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

var UpgradeButton = function UpgradeButton(props) {
  var upgrade = props.upgrade;
  var character = props.character;
  var cost = props.cost;
  var description = props.description;

  var purchaseUpgrade = function purchaseUpgrade() {
    if (character.upgrades.includes(upgrade)) {
      handleError('This character already has this upgrade');
      return false;
    }

    if (gold >= cost) {
      gold -= cost;
      character.upgrades.push(upgrade);

      updateGoldMods();
      saveToDB();

      ReactDOM.render(React.createElement(CharacterList, { csrf: csrfToken, characters: characters }), document.querySelector("#characters"));
    } else {
      handleError("You don't have enough gold");
      return false;
    }
  };

  if (character.upgrades.includes(upgrade)) {
    return React.createElement(
      'a',
      { className: 'waves-effect waves-light btn tooltipped centered green darken-1 upgrade disabled' },
      'Purchase ',
      upgrade,
      ' (',
      cost,
      ' Gold)'
    );
  } else {
    return React.createElement(
      'a',
      { className: 'waves-effect waves-light btn tooltipped centered green darken-1 upgrade', onClick: purchaseUpgrade, 'data-position': 'bottom', 'data-tooltip': description },
      'Purchase ',
      upgrade,
      ' (',
      cost,
      ' Gold)'
    );
  }
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

  if (character.level >= 5) {
    return React.createElement(
      'div',
      { className: 'characterMenu' },
      React.createElement(
        'p',
        null,
        'Current XP: ',
        character.xp,
        ' XP Needed For Level Up: ',
        character.xpNeeded,
        ' Attack: ',
        character.attack,
        ' Defense: ',
        character.defense
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
      React.createElement(UpgradeButton, { character: selectedCharacter, cost: '1000', upgrade: 'Golden Touch', description: 'Doubles gold generated by this character' }),
      React.createElement(UpgradeButton, { character: selectedCharacter, cost: '1000', upgrade: 'Dedicated Trainer', description: 'Doubles xp gained by this character' })
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
        character.xpNeeded,
        ' Attack: ',
        character.attack,
        ' Defense: ',
        character.defense
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
var loadCharactersFromServer = function loadCharactersFromServer(csrf, passedTime) {
  sendAjax('GET', '/getCharacters', null, function (data) {
    characters = data.characters;
    ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: data.characters }), document.querySelector("#characters"));
    updateGoldMods();

    if (passedTime >= 60) {
      offlineProduction(passedTime);
    }
  });
};

var setup = function setup(csrf, passedTime) {
  csrfToken = csrf;

  ReactDOM.render(React.createElement(CharacterList, { csrf: csrf, characters: [] }), document.querySelector("#characters"));

  loadCharactersFromServer(csrf, passedTime);

  setInterval(saveToDB, 5000);
  setInterval(updateGold, 1000);
};

// Add to our gold based on our production  
var offlineProduction = function offlineProduction(time) {
  var addedGold = 0;
  for (var i = 0; i < characters.length; i++) {
    addedGold += characters[i].level * characters[i].goldMod;
  }

  addedGold = Math.floor(addedGold / 5 * time);
  gold += addedGold;

  document.querySelector('#goldNum').textContent = 'Gold: ' + Math.floor(gold);

  handleError('Welcome back! You gained ' + addedGold + ' while offline.');
};

var getToken = function getToken() {
  sendAjax('GET', '/getToken', null, function (result) {
    account = result.account;

    // Compare the current time against the lastUpdate for the account
    // If more than a minute has passed, give offline production
    // Comparing times code from here:
    // https://stackoverflow.com/questions/1787939/check-time-difference-in-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    var accountTime = Date.parse(account.lastUpdate);
    var currentTime = Date.now();
    account.lastUpdate = currentTime;

    if (currentTime < accountTime) {
      currentTime.setDate(currentTime.getDate() + 1);
    }

    var passedTime = Math.floor((currentTime - accountTime) / 1000);

    gold = account.gold;
    setup(result.csrfToken, passedTime);
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
