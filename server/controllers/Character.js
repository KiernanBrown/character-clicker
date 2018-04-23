const models = require('../models');
const names = require('../names.json');

const Character = models.Character;

const makerPage = (req, res) => {
  Character.CharacterModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.render('app', { csrfToken: req.csrfToken(), characters: docs });
  });
};

const deleteCharacter = (req, res) => {
  const id = req.body.id;
  const characterPromise = Character.CharacterModel.findOneAndRemove({ _id: id });
  characterPromise.then(() => res.json({ redirect: '/maker' }));
};

const saveCharacter = (req, res) => {
  const id = req.body.id;
  Character.CharacterModel.findOne({ _id: id }, (err, doc) => {
    const character = doc;
    character.xp = req.body.xp;
    character.xpNeeded = req.body.xpNeeded;
    character.level = req.body.level;
    character.upgrades = req.body.upgrades.split(',');
    const savePromise = new Character.CharacterModel(character).save();
    savePromise.then(() => res.json({ redirect: '/maker' }));
  });
};

const makeCharacter = (req, res) => {
  // Give the character a name from our list
  const name = names.names[Math.floor(Math.random() * names.names.length)];

  // Set the rarity of the character
  // Common - 54%
  // Uncommon - 26%
  // Rare - 12%
  // Epic - 6%
  // Legendary - 2%
  let rarity = 'Common';
  let attack = Math.round(Math.random() * 3);
  let defense = Math.round(Math.random() * 3);
  const rarityNum = Math.floor(Math.random() * 50);
  if (rarityNum >= 27 && rarityNum < 40) {
    rarity = 'Uncommon';
    attack = Math.round(Math.random() * 3) + 2;
    defense = Math.round(Math.random() * 3) + 2;
  } else if (rarityNum >= 40 && rarityNum < 46) {
    rarity = 'Rare';
    attack = Math.round(Math.random() * 3) + 4;
    defense = Math.round(Math.random() * 3) + 4;
  } else if (rarityNum >= 46 && rarityNum <= 48) {
    rarity = 'Epic';
    attack = Math.round(Math.random() * 3) + 5;
    defense = Math.round(Math.random() * 3) + 5;
  } else if (rarityNum === 49) {
    rarity = 'Legendary';
    attack = Math.round(Math.random() * 3) + 6;
    defense = Math.round(Math.random() * 3) + 6;
  }

  const characterData = {
    name,
    rarity,
    level: 1,
    xp: 0,
    xpNeeded: 10,
    attack,
    defense,
    upgrades: [],
    goldMod: 1,
    owner: req.session.account._id,
  };

  console.dir(characterData);

  const newCharacter = new Character.CharacterModel(characterData);

  console.dir(newCharacter);

  const characterPromise = newCharacter.save();

  characterPromise.then(() => res.json({ redirect: '/maker' }));

  characterPromise.catch((err) => {
    console.log(err);
    if (err.code === 11000) {
      return res.status(400).json({ error: 'Character already exists.' });
    }

    return res.status(400).json({ error: 'An error occurred' });
  });

  return characterPromise;
};

const getCharacters = (request, response) => {
  const req = request;
  const res = response;

  return Character.CharacterModel.findByOwner(req.session.account._id, (err, docs) => {
    if (err) {
      console.log(err);
      return res.status(400).json({ error: 'An error occurred' });
    }

    return res.json({ characters: docs });
  });
};

module.exports.makerPage = makerPage;
module.exports.getCharacters = getCharacters;
module.exports.make = makeCharacter;
module.exports.delete = deleteCharacter;
module.exports.save = saveCharacter;
