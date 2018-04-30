let selectedCharacter = {};
let selectedId = '';
let csrfToken = '';
let characters = [];
let gold = 0;
let account = {};
let goldCap = 2000;

// Update all of our characters in the database
// We call this every 30 seconds as a way of autosaving
const saveToDB = () => {
  console.dir('Saved to the db!');
  sendAjax('POST', '/saveAccount', `id=${account._id}&gold=${gold}&battlesCompleted=${account.battlesCompleted}&_csrf=${csrfToken}`);
  
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    sendAjax('POST', '/saveCharacter', `id=${character._id}&xp=${character.xp}&xpNeeded=${character.xpNeeded}&level=${character.level}&attack=${character.attack}&defense=${character.defense}&upgrades=${character.upgrades}&_csrf=${csrfToken}`);
  }
};

const initializeTooltips = () => {
  $('.tooltipped').tooltip({ delay: 50 });
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

// Function to check if a character should level up
const checkLevelUp = (chara) => {
  const character = chara;
  if (character.xp >= character.xpNeeded) {
    character.xp -= character.xpNeeded;
    character.level++;
    character.attack++;
    character.defense++;
    character.xpNeeded = Math.floor(character.xpNeeded ** 1.09);
    checkLevelUp(character);
  }
};

// Function to give each character xp every 10 seconds
const updateXP = () => {
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    character.xp++;
    if (character.upgrades.includes('Dedicated Trainer')) character.xp++;
    checkLevelUp(character);
  }
  
  updateCharacter();
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
  
  saveToDB();
};

// Function to handle clicking to train a character
const handleClick = () => {
  selectedCharacter.xp++;
  if (selectedCharacter.upgrades.includes('Dedicated Trainer')) selectedCharacter.xp++;
  checkLevelUp(selectedCharacter);
  updateCharacter();
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
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
  if (gold > goldCap) gold = goldCap;
  document.querySelector('#goldNum').textContent = `Gold: ${Math.floor(gold)} / ${goldCap}`;
};

const UpgradeButton = function(props) {
  const upgrade = props.upgrade;
  const character = props.character;
  const cost = props.cost;
  const description = props.description;
  
  const purchaseUpgrade = () => {
    if (character.upgrades.includes(upgrade)) {
      handleError('This character already has this upgrade');
      return false;
    }
    
    if (gold >= cost) {
      gold -= cost;
      character.upgrades.push(upgrade);
      
      updateGoldMods();
      saveToDB();
      
      ReactDOM.render(
        <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
      );
    } else {
      handleError("You don't have enough gold");
      return false;
    }
  };
  
  if (character.upgrades.includes(upgrade)) {
    return (
      <a className="waves-effect waves-light btn tooltipped centered green darken-1 upgrade disabled">Purchase {upgrade} ({cost} Gold)</a>
    );
  } else {
        return (
      <a className="waves-effect waves-light btn tooltipped centered green darken-1 upgrade" onClick={purchaseUpgrade} data-position="bottom" data-tooltip={description} >Purchase {upgrade} ({cost} Gold)</a>
    );
  }
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
  
  if (character.level >= 5) {
    return(
      <div className="characterMenu">
        <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded} Attack: {character.attack} Defense: {character.defense}</p>
        <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
        <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
        <UpgradeButton character={selectedCharacter} cost="1000" upgrade="Golden Touch" description="Doubles gold generated by this character"/>
        <UpgradeButton character={selectedCharacter} cost="1000" upgrade="Dedicated Trainer" description="Doubles xp gained by this character"/>
      </div>
    );
  } else {
    return(
      <div className="characterMenu">
        <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded} Attack: {character.attack} Defense: {character.defense}</p>
        <a className="waves-effect waves-light btn centered purple darken-3" onClick={handleClick}>Train Character</a>
        <a className="waves-effect waves-light btn centered red darken-4" onClick={deleteCharacter}>Delete Character</a>
      </div>
    );
  }
};

const addGold = () => {
  gold+=1000;
};

// List of all the characters the user has
const CharacterList = function(props) {
  if(props.characters.length === 0) {
    return(
      <div>
        <h4 id='goldNum' className="centered">Gold: 0</h4>
        <div className="characterList">
          <h3 className="emptyCharacter">No Characters Yet</h3>
          <p className="centered">
            <a id="createButton" className="waves-effect waves-light btn" onClick={createCharacter}>Create a Character (2000 Gold)</a>
          </p>
          <p className="centered">
            <a id="moneyButton" className="waves-effect waves-light btn grey" onClick={addGold}>Gain 1000 Gold</a>
          </p>
        </div>
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
      <div>
        <h4 id='goldNum' className="centered">Gold: 0</h4>
        <div className="characterList">
          <h4 className='centered'>Click on one of your characters to open their menus</h4>
          {characterNodes}
          <p className="centered">
            <a id="createButton" className="waves-effect waves-light btn" onClick={createCharacter}>Create a Character (2000 Gold)</a>
          </p>
          <p className="centered">
            <a id="moneyButton" className="waves-effect waves-light btn grey" onClick={addGold}>Gain 1000 Gold</a>
          </p>
        </div>
      </div>
    );
  } else {
    // Otherwise display a buy character slots button
    return (
      <div>
        <h4 id='goldNum' className="centered">Gold: 0</h4>
        <div className="characterList">
          <h4 className='centered'>Click on one of your characters to open their menus</h4>
          {characterNodes}
        </div>
        <p className="centered">
          <a href="/store" className="waves-effect waves-light btn centered purple darken-3 centered">Buy An Additional Character Slot (20 Gems)</a>
        </p>
        <p className="centered">
          <a id="moneyButton" className="waves-effect waves-light btn grey" onClick={addGold}>Gain 1000 Gold</a>
        </p>
      </div>
    );
  }
};

// Gets our characters from the server
const loadCharactersFromServer = (csrf, passedTime) => {
  sendAjax('GET', '/getCharacters', null, (data) => {
    characters = data.characters;
    ReactDOM.render(
      <CharacterList csrf={csrf} characters={data.characters} />, document.querySelector("#characters")
    );
    updateGoldMods();
    
    if (passedTime >= 60) {
      offlineProduction(passedTime);
    }
  });
};

const setup = function(csrf, passedTime) {
  csrfToken = csrf;
  
  ReactDOM.render(
    <CharacterList csrf={csrf} characters={[]} />, document.querySelector("#characters")
  );
  
  loadCharactersFromServer(csrf, passedTime);
  
  setInterval(saveToDB, 5000);
  setInterval(updateGold, 1000);
  setInterval(updateXP, 10000);
};

// Add to our gold based on our production  
const offlineProduction = (time) => {
  let addedGold = 0;
  for (let i = 0; i < characters.length; i++) {
    addedGold += characters[i].level * characters[i].goldMod;
  }
  
  addedGold = Math.floor((addedGold / 5) * time);
  gold += addedGold;
  
  document.querySelector('#goldNum').textContent = `Gold: ${Math.floor(gold)}`;
  
  handleError(`Welcome back! You gained ${addedGold} while offline.`);
  
  saveToDB();
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    account = result.account;
    
    // Compare the current time against the lastUpdate for the account
    // If more than a minute has passed, give offline production
    // Comparing times code from here:
    // https://stackoverflow.com/questions/1787939/check-time-difference-in-javascript?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
    const accountTime = Date.parse(account.lastUpdate);
    const currentTime = Date.now();
    account.lastUpdate = currentTime;
    
    if (currentTime < accountTime) {
      currentTime.setDate(currentTime.getDate() + 1);
    }
    
    const passedTime = Math.floor((currentTime - accountTime) / 1000);
    
    goldCap = 2000 + (account.battlesCompleted * 500);
    gold = account.gold;
    setup(result.csrfToken, passedTime);
  });
};

$(document).ready(function() {
  getToken();
});
