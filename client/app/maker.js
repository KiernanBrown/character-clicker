let selectedCharacter = {};
let selectedId = '';
let csrfToken = '';
let characters = [];


// Update all of our characters in the database
// We call this every 30 seconds as a way of autosaving
const saveToDB = () => {
  console.dir('Saved to the db!');
  
  for (let i = 0; i < characters.length; i++) {
    const character = characters[i];
    sendAjax('POST', '/saveCharacter', `id=${character._id}&xp=${character.xp}&xpNeeded=${character.xpNeeded}&level=${character.level}&_csrf=${csrfToken}`);
  }
};

const handleCharacter = (e) => {
  e.preventDefault();
  
  saveToDB();
  
  $("#characterMessage").animate({width:'hide'},350);
  
  if($("#characterName").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }
  
  sendAjax('POST', $("characterForm").attr("action"), $("#characterForm").serialize(), function() {
    loadCharactersFromServer();
  });
  
  return false;
};

const handleClick = () => {
  selectedCharacter.xp++;
  checkLevelUp();
  updateCharacter();
  ReactDOM.render(
    <CharacterList csrf={csrfToken} characters={characters} />, document.querySelector("#characters")
  );
};

const checkLevelUp = () => {
  if (selectedCharacter.xp >= selectedCharacter.xpNeeded) {
    selectedCharacter.xp -= selectedCharacter.xpNeeded;
    selectedCharacter.level++;
    selectedCharacter.xpNeeded = Math.floor(selectedCharacter.xpNeeded ** 1.12);
    checkLevelUp();
  }
};

const updateCharacter = () => {
  for (let i = 0; i < characters.length; i++) {
    if (characters[i]._id === selectedCharacter._id) {
      characters[i] = selectedCharacter; 
      break;
    }
  }
};

const CharacterForm = (props) => {
  return (
    <form id="characterForm"
      onSubmit={handleCharacter}
      name="characterForm"
      action="/maker"
      method="POST"
      className="characterForm"
    >
      <label htmlFor="name">Name: </label>
      <input id="characterName" type="text" name="name" placeholder="Character Name"/>
      <input id="csrfToken" type="hidden" name="_csrf" value={props.csrf} />
      <input className = "makeCharacterSubmit" type="submit" value="Make Character" />
    </form>
  );
};

const CharacterList = function(props) {
  if(props.characters.length === 0) {
    return(
      <div className="characterList">
        <h3 className="emptyCharacter">No Characters Yet</h3>
      </div>
    );
  }
  
  csrfToken = document.querySelector("#csrfToken").value;
  
  const characterNodes = props.characters.map(function(character) {
    console.dir(character);
    
    const deleteCharacter = () => {
      sendAjax('POST', '/deleteCharacter', `id=${character._id}&_csrf=${csrfToken}`, function() {
        loadCharactersFromServer({csrfToken});
      });
    };
    
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
          <h3 className="characterName"> Name: {character.name} </h3>
          <h3 className="characterAge"> Rarity: {character.rarity} </h3>
          <h3 className="characterFood"> Level: {character.level} </h3>
          <input className="makeCharacterSubmit" type="submit" id='deleteButton' onClick={deleteCharacter} value="Delete Character" />
        </div>

        <div>
          <p>Current XP: {character.xp} XP Needed For Level Up: {character.xpNeeded}</p>
          <input className="makeCharacterSubmit" onClick={handleClick} value="Click to gain xp"/>
        </div>
      </div>
    ); else return (
      <div key={character._id} className="character" onClick={playGame} >
        <img src="/assets/img/characterface.png" alt="character face" className="characterFace" />
        <h3 className="characterName"> Name: {character.name} </h3>
        <h3 className="characterAge"> Rarity: {character.rarity} </h3>
        <h3 className="characterFood"> Level: {character.level} </h3>
        <input className="makeCharacterSubmit" type="submit" id='deleteButton' onClick={deleteCharacter} value="Delete Character" />
      </div>
    ); 
  });
  
  return (
    <div className="characterList">
      <h2>Click on one of your characters to open their menus</h2>
      {characterNodes}
    </div>
  );
};

const loadCharactersFromServer = (csrf) => {
  sendAjax('GET', '/getCharacters', null, (data) => {
    characters = data.characters;
    ReactDOM.render(
      <CharacterList csrf={csrf} characters={data.characters} />, document.querySelector("#characters")
    );
  });
};

const setup = function(csrf) {
  ReactDOM.render(
    <CharacterForm csrf={csrf} />, document.querySelector("#makeCharacter")
  );
  
  ReactDOM.render(
    <CharacterList csrf={csrf} characters={[]} />, document.querySelector("#characters")
  );
  
  loadCharactersFromServer(csrf);
  
  setInterval(saveToDB, 30000);
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
