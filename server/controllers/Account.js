const models = require('../models');

const Account = models.Account;

const loginPage = (req, res) => {
  res.render('login', { csrfToken: req.csrfToken() });
};

const profilePage = (req, res) => {
  res.render('profile', { csrfToken: req.csrfToken(), account: req.session.account });
};

const storePage = (req, res) => {
  res.render('store', { csrfToken: req.csrfToken(), account: req.session.account });
};

const logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};

const login = (request, response) => {
  const req = request;
  const res = response;

  // Force cast to strings to cover some security flaws
  const username = `${req.body.username}`;
  const password = `${req.body.pass}`;

  if (!username || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  return Account.AccountModel.authenticate(username, password, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Wrong username or password' });
    }

    req.session.account = Account.AccountModel.toAPI(account);

    return res.json({ redirect: '/maker' });
  });
};

const signup = (request, response) => {
  const req = request;
  const res = response;

  // Cast to strings to cover up some security flaws
  req.body.username = `${req.body.username}`;
  req.body.pass = `${req.body.pass}`;
  req.body.pass2 = `${req.body.pass2}`;

  if (!req.body.username || !req.body.pass || !req.body.pass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.pass !== req.body.pass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  return Account.AccountModel.generateHash(req.body.pass, (salt, hash) => {
    const accountData = {
      username: req.body.username,
      salt,
      password: hash,
      gold: 2000,
    };

    const newAccount = new Account.AccountModel(accountData);

    const savePromise = newAccount.save();

    savePromise.then(() => {
      req.session.account = Account.AccountModel.toAPI(newAccount);
      return res.json({ redirect: '/maker' });
    });

    savePromise.catch((err) => {
      console.log(err);

      if (err.code === 11000) {
        return res.status(400).json({ error: 'Username already in use.' });
      }

      return res.status(400).json({ error: 'An error occurred' });
    });
  });
};

const changePassword = (request, response) => {
  const req = request;
  const res = response;
  console.dir('CHANGING');

  console.dir(req.session);

  // Cast to strings to cover up some security flaws
  req.body.pass = `${req.body.pass}`;
  req.body.newPass = `${req.body.newPass}`;
  req.body.newPass2 = `${req.body.newPass2}`;

  if (!req.body.pass || !req.body.newPass || !req.body.newPass2) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (req.body.newPass !== req.body.newPass2) {
    return res.status(400).json({ error: 'Passwords do not match' });
  }

  const username = req.session.account.username;

  return Account.AccountModel.authenticate(username, req.body.pass, (err, account) => {
    if (err || !account) {
      return res.status(401).json({ error: 'Incorrect current password' });
    }

    return Account.AccountModel.findOne({ username }, (error, doc) => {
      const acc = doc;
      console.dir(acc);

      Account.AccountModel.generateHash(req.body.newPass, (salt, hash) => {
        acc.password = hash;
        acc.salt = salt;

        console.dir('New Acc');
        console.dir(acc);

        const savePromise = new Account.AccountModel(acc).save();

        savePromise.then(() => {
          req.session.account = acc;
          return res.json({ redirect: '/profile' });
        });
      });
    });
  });
};

// Method to save an account with updated information
const saveAccount = (request, res) => {
  const req = request;
  const id = req.body.id;
  Account.AccountModel.findOne({ _id: id }, (err, doc) => {
    const account = doc;
    account.gold = req.body.gold;
    account.lastUpdate = Date.now();
    const savePromise = new Account.AccountModel(account).save();
    savePromise.then(() => {
      req.session.account = account;
      return res.json({ redirect: '/maker' });
    });
  });
};

const getToken = (request, response) => {
  const req = request;
  const res = response;

  const csrfJSON = {
    csrfToken: req.csrfToken(),
    account: req.session.account,
  };

  res.json(csrfJSON);
};

module.exports.loginPage = loginPage;
module.exports.login = login;
module.exports.logout = logout;
module.exports.signup = signup;
module.exports.getToken = getToken;
module.exports.profilePage = profilePage;
module.exports.storePage = storePage;
module.exports.changePassword = changePassword;
module.exports.save = saveAccount;
