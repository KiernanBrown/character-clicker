const controllers = require('./controllers');
const mid = require('./middleware');

const router = (app) => {
  app.get('/getToken', mid.requiresSecure, controllers.Account.getToken);
  app.get('/getCharacters', mid.requiresSecure, controllers.Character.getCharacters);
  app.get('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
  app.get('/profile', mid.requiresSecure, mid.requiresLogin, controllers.Account.profilePage);
  app.get('/store', mid.requiresSecure, mid.requiresLogin, controllers.Account.storePage);
  app.post('/login', mid.requiresSecure, mid.requiresLogout, controllers.Account.login);
  app.post('/signup', mid.requiresSecure, mid.requiresLogout, controllers.Account.signup);
  app.post('/changePassword', mid.requiresSecure, mid.requiresLogin,
  controllers.Account.changePassword);
  app.get('/logout', mid.requiresLogin, controllers.Account.logout);
  app.get('/maker', mid.requiresLogin, controllers.Character.makerPage);
  app.post('/maker', mid.requiresLogin, controllers.Character.make);
  app.post('/deleteCharacter', mid.requiresLogin, controllers.Character.delete);
  app.post('/saveCharacter', mid.requiresLogin, controllers.Character.save);
  app.post('/saveAccount', mid.requiresLogin, controllers.Account.save);
  app.get('/', mid.requiresSecure, mid.requiresLogout, controllers.Account.loginPage);
};

module.exports = router;
