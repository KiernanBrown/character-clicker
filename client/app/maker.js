let selectedCharacter = {};
let selectedId = '';
let csrfToken = '';
let characters = [];
let gold = 0;
let account = {};

// Update all of our characters in the database
// We call this every 30 seconds as a way of autosaving
const saveToDB = () => {
  console.dir('Saved to the db!');
  sendAjax('POST', '/saveAccount', `id=${account._id}&gold=${gold}&_csrf=${csrfToken}`);
  
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    sendAjax('POST', '/saveCharacter', `id=${character._id}&xp=${character.xp}&xpNeeded=${character.xpNeeded}&level=${character.level}&upgrades=${character.upgrades}&_csrf=${csrfToken}`);
  }
};

// Function to create a character
const createCharacter = (e) => {
  e.preventDefault();
  
  saveToDB();
  
  if (gold < 2000) {
    handleError("You don't have enough gold!");
    return false;
  }
  
  sendAjax('POST', '/maker', `_csrf=${csrfToken}`, function() {
    gold -= 2000;
    loadCharactersFromServer();
  });
  
  return false;
};

// Function to handle clicking to train a character
const handleClick = () => {
  selectedCharacter.xp++;
  if(selectedCharacter.upgrades.includes('Dedicated Trainer')) selectedCharacter.xp++;
  checkLevelUp();
  updateCharacter();
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
};

// Function to check if a character should level up
const checkLevelUp = () => {
  if (selectedCharacter.xp >= selectedCharacter.xpNeeded) {
    selectedCharacter.xp -= selectedCharacter.xpNeeded;
    selectedCharacter.level++;
    selectedCharacter.xpNeeded = Math.floor(selectedCharacter.xpNeeded ** 1.12);
    checkLevelUp();
  }
};

// Function to update character
const updateCharacter = () => {
  for (let i = 0; i < characters.length; i++) {
    if (characters[i]._id === selectedCharacter._id) {
      characters[i] = selectedCharacter; 
      break;
    }
  }
};

// Function to update the gold modifier for each character
const updateGoldMods = () => {
  for (let i = 0; i < characters.length; i++) {
    let character = characters[i];
    let gMod = 1.0;
    if(character.rarity === 'Uncommon') gMod = 1.25;
    else if (character.rarity === 'Rare') gMod = 1.5;
    else if (character.rarity === 'Epic') gMod = 1.75;
    else if (character.rarity === 'Legendary') gMod = 2;
    if(character.upgrades.includes('Golden Touch')) gMod *= 2;
    character.goldMod = gMod;
  }
};

// Function to update your gold
// This is called every second
const updateGold = () => {
  for (let i = 0; i < characters.length; i++) {
    gold += characters[i].level * characters[i].goldMod;
  }
  document.querySelector('#goldNum').textContent = `Gold: ${Math.floor(gold)}`;
};

// Purchases the Golden Touch upgrade for the selected character (double gold)
const purchaseGolden = () => {
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
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
};

// Purchases the Dedicated Trainer upgrade for the selected character (double xp)
const purchaseDedicated = () => {
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
  
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
};

// Create the div for the selected character
const SelectedCharacterDiv = function(props) {
  const character = props.character;
  
  const deleteCharacter = () => {
    if(characters.length > 1) {
      sendAjax('POST', '/deleteCharacter', `id=${character._id}&_csrf=${csrfToken}`, function() {
        loadCharactersFromServer({csrfToken});
      });
    } else {
      handleError("You cannot delete your only character!");
      return false;
    }
  };
  
  // Only display upgrades if the character is level 5 or higher
  if(character.level >= 5) {
    if(selectedCharacter.upgrades.includes('Golden Touch') && selectedCharacter.upgrades.includes('Dedicated Trainer')) {
      return(
        <div className="characterMenu">
          <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
            <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
            <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade disabled" onClick={purchaseGolden}>Purchase Golden Touch (1000 Gold)</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade disabled" onClick={purchaseDedicated}>Purchase Dedicated Trainer (1000 Gold)</a>
        </div>
      );
    } else if (selectedCharacter.upgrades.includes('Golden Touch')) {
      return(
        <div className="characterMenu">
          <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
            <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
            <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade disabled" onClick={purchaseGolden}>Purchase Golden Touch (1000 Gold)</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade" onClick={purchaseDedicated}>Purchase Dedicated Trainer (1000 Gold)</a>
        </div>
      );
    } else if (selectedCharacter.upgrades.includes('Dedicated Trainer')) {
      return(
        <div className="characterMenu">
          <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
            <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
            <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade" onClick={purchaseGolden}>Purchase Golden Touch (1000 Gold)</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade disabled" onClick={purchaseDedicated}>Purchase Dedicated Trainer (1000 Gold)</a>
        </div>
      );
    } else {
      return(
        <div className="characterMenu">
          <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
            <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
            <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade" onClick={purchaseGolden}>Purchase Golden Touch (1000 Gold)</a>
            <a className="waves-effect waves-light btn centered green darken-1 upgrade" onClick={purchaseDedicated}>Purchase Dedicated Trainer (1000 Gold)</a>
        </div>
      );
    }
  } else {
    return(
      <div className="characterMenu">
        <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
        <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
        <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
      </div>
    );
  }
};

// List of all the characters the user has
const CharacterList = function(props) {
  if(props.characters.length === 0) {
    return(
      <div className="characterList">
        <h3 className="emptyCharacter">No Characters Yet</h3>
        <p className="centered">
          <a id="createButton" className="waves-effect waves-light btn" onClick={createCharacter}>Create a Character (2000 Gold)</a>
        </p>
      </div>
    );
  }
  
  const characterNodes = props.characters.map(function(character) {
    const playGame = () => {
      selectedCharacter = character;
      ReactDOM.render(
        <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
      );
    };
    
    if (selectedCharacter && selectedCharacter._id === character._id) return (
      <div>
        <div key={character._id} className="character" onClick={playGame} >
          <img src="/assets/img/characterface.png" alt="character face" className="characterFace" />
          <h3 className="characterInfo"> Name: {character.name} </h3>
          <h3 className="characterInfo"> Rarity: {character.rarity} </h3>
          <h3 className="characterInfo"> Level: {character.level} </h3>
        </div>
        <SelectedCharacterDiv character={selectedCharacter} />
      </div>
    ); else return (
      <div key={character._id} className="character" onClick={playGame} >
        <img src="/assets/img/characterface.png" alt="character face" className="characterFace" />
        <h3 className="characterInfo"> Name: {character.name} </h3>
        <h3 className="characterInfo"> Rarity: {character.rarity} </h3>
        <h3 className="characterInfo"> Level: {character.level} </h3>
      </div>
    ); 
  });
  
  if(characterNodes.length < 4) {
    // Display the create a character button if the user has less than 4 characters
    return (
      <div className="characterList">
        <h4 className='centered'>Click on one of your characters to open their menus</h4>
        {characterNodes}
        <p className="centered">
          <a id="createButton" className="waves-effect waves-light btn" onClick={createCharacter}>Create a Character (2000 Gold)</a>
        </p>
      </div>
    );
  } else {
    // Otherwise display a buy character slots button
    return (
      <div>
        <div className="characterList">
          <h4 className='centered'>Click on one of your characters to open their menus</h4>
          {characterNodes}
        </div>
        <p className="centered">
          <a href="/store" className="waves-effect waves-light btn centered purple darken-3 centered">Buy An Additional Character Slot (20 Gems)</a>
        </p>
      </div>
    );
  }
};

// Gets our characters from the server
const loadCharactersFromServer = (csrf) => {
  sendAjax('GET', '/getCharacters', null, (data) => {
    characters = data.characters;
    ReactDOM.render(
      <CharacterList csrf={csrf} characters={data.characters} />, document.querySelector("#characters")
    );
    updateGoldMods();
  });
};

const setup = function(csrf) {
  csrfToken = csrf;
  
  ReactDOM.render(
    <CharacterList csrf={csrf} characters={[]} />, document.querySelector("#characters")
  );
  
  loadCharactersFromServer(csrf);
  
  setInterval(saveToDB, 5000);
  setInterval(updateGold, 1000);
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    account = result.account;
    gold = account.gold;
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
