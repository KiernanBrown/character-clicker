const models = require('../models');

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
  console.dir(id);
  const characterPromise = Character.CharacterModel.findOneAndRemove({ _id: id });
  characterPromise.then(() => res.json({ redirect: '/maker' }));
};

const saveCharacter = (req) => {
  const id = req.body.id;
  console.dir(id);
  Character.CharacterModel.findOne({ _id: id }, (err, doc) => {
    const character = doc;
    character.xp = req.body.xp;
    character.xpNeeded = req.body.xpNeeded;
    character.level = req.body.level;

    character.save();
  });
};

const makeCharacter = (req, res) => {
  if (!req.body.name) {
    return res.status(400).json({ error: 'A name is required' });
  }

  // Set the rarity of the character
  // Common - 54%
  // Uncommon - 26%
  // Rare - 12%
  // Epic - 6%
  // Legendary - 2%
  let rarity = 'Common';
  const rarityNum = Math.floor(Math.random() * 50);
  if (rarityNum >= 27 && rarityNum < 40) {
    rarity = 'Uncommon';
  } else if (rarityNum >= 40 && rarityNum < 46) {
    rarity = 'Rare';
  } else if (rarityNum >= 46 && rarityNum <= 48) {
    rarity = 'Epic';
  } else if (rarityNum === 49) {
    rarity = 'Legendary';
  }

  const characterData = {
    name: req.body.name,
    rarity,
    level: 1,
    xp: 0,
    xpNeeded: 10,
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
