let username = '';
let gold = 0;
let battlesCompleted = 0;
let characters;
let hp = 10;
let damage = 1;
let enemy;
let account;
let csrfToken;
let enemyAttackInterval;

const startBattle = () => {
  enemy = {
    hp: Math.floor((battlesCompleted * 10) * (battlesCompleted ** 1.12) + 10),
    damage: (battlesCompleted * 2) + 1,
  };
  loadCharactersFromServer();
  
  // The enemy attacks every 3 seconds
  enemyAttackInterval = setInterval(enemyAttack, 3000);
  
};

const attack = () => {
  enemy.hp -= damage;
  createBattleWindow();
  if(enemy.hp <= 0) {
    handleError('You have won the battle! Gold Cap increased by 500!');
    endBattle(true);
  }
};

const enemyAttack = () => {
  hp -= enemy.damage;
  createBattleWindow();
  if (hp <= 0) {
    handleError('You have lost the battle!');
    endBattle(false);
  }
};

const endBattle = (won) => {
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
  ReactDOM.render(
    <PreBattleWindow />,
    document.querySelector("#content")
  );
};

const PreBattleWindow = (props) => {
  return (
    <div id='battleInfo'>
      <h3 className="centered">Battle</h3>
      <h5 className="centered">Battles Completed: {battlesCompleted}</h5>
      <p className="centered">Battle monsters of increasing difficulty using the characters that you have trained up. Enemies will attack you every 3 seconds. Try to defeat the enemy before your HP runs out to increase your gold cap as a reward!</p>
      <div className='battleDiv'>
        <p className="centered">
          <button className="btn-large waves-effect waves-light green" onClick={startBattle}><i className="material-icons right">colorize</i>Start Battle</button>
        </p>
      </div>
    </div>
  );
};

const BattleWindow = (props) => {
  return (
    <div id='battleInfo'>
      <h3 className="centered">Battle</h3>
      <h5 className="centered">Battles Completed: {battlesCompleted}</h5>
      <p className="centered">Battle monsters of increasing difficulty using the characters that you have trained up. Enemies will attack you every 3 seconds. Try to defeat the enemy before your HP runs out to increase your gold cap as a reward!</p>
      <div className='battleDiv'>
        <h3 className="centered">Battle {battlesCompleted + 1}</h3>
        <h5 className="centered">Enemy HP: {enemy.hp}</h5>
        <h5 className="centered">Your HP: {hp}</h5>
        <p className="centered">
          <button className="btn-large waves-effect waves-light red" onClick={attack}><i className="material-icons right">colorize</i>Attack ({damage})</button>
        </p>
      </div>
    </div>
  );
};

const createPreBattleWindow = (csrf) => {
  ReactDOM.render(
    <PreBattleWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const createBattleWindow = () => {
  ReactDOM.render(
    <BattleWindow />,
    document.querySelector("#content")
  );
};

const setup = (csrf) => {
  csrfToken = csrf;
  createPreBattleWindow(csrf); // Default view
};

// Gets our characters from the server
const loadCharactersFromServer = () => {
  sendAjax('GET', '/getCharacters', null, (data) => {
    characters = data.characters;
    for (let i = 0; i < characters.length; i++) {
      hp += characters[i].defense;
      damage += characters[i].attack;
    }
    
    createBattleWindow();
  });
};

// Save the account to the database
const saveToDB = () => {
  sendAjax('POST', '/saveAccount', `id=${account._id}&gold=${gold}&battlesCompleted=${battlesCompleted}&_csrf=${csrfToken}`);
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    account = result.account;
    username = account.username;
    gold = account.gold;
    battlesCompleted = account.battlesCompleted;
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
