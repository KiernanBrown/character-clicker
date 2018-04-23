const mongoose = require('mongoose');
mongoose.Promise = global.Promise;
const _ = require('underscore');

let CharacterModel = {};

const convertId = mongoose.Types.ObjectId;
const setName = (name) => _.escape(name).trim();

const CharacterSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
    trim: true,
    set: setName,
  },

  rarity: {
    type: String,
    require: true,
    trim: true,
  },

  level: {
    type: Number,
    min: 0,
    required: true,
  },

  xp: {
    type: Number,
    min: 0,
    required: true,
  },

  xpNeeded: {
    type: Number,
    min: 0,
    required: true,
  },

  attack: {
    type: Number,
    min: 0,
    required: true,
  },

  defense: {
    type: Number,
    min: 0,
    required: true,
  },

  owner: {
    type: mongoose.Schema.ObjectId,
    required: true,
    ref: 'Account',
  },

  upgrades: {
    type: [String],
  },

  createdData: {
    type: Date,
    default: Date.now,
  },
});

CharacterSchema.statics.toAPI = (doc) => ({
  name: doc.name,
  rarity: doc.rarity,
  level: doc.level,
  xp: doc.xp,
  upgrades: doc.upgrades,
  xpNeeded: doc.xpNeeded,
  attack: doc.attack,
  defense: doc.defense,
  goldMod: doc.goldMod,
});

CharacterSchema.statics.findByOwner = (ownerId, callback) => {
  const search = {
    owner: convertId(ownerId),
  };

  return CharacterModel.find(search).select('name rarity level xp xpNeeded upgrades attack defense')
  .exec(callback);
};

CharacterModel = mongoose.model('Character', CharacterSchema);

module.exports.CharacterModel = CharacterModel;
module.exports.CharacterSchema = CharacterSchema;
