const handleLogin = (e) => {
  e.preventDefault();
  
  $("characterMessage").animate({width:'hide'},350);
  
  if($("#user").val() == '' || $("#pass").val() == '') {
    handleError("RAWR! Username or password is empty");
    return false;
  }
  
  console.log($("input[name=_csrf]").val());
  
  sendAjax('POST', $("#loginForm").attr("action"), $("#loginForm").serialize(), redirect);
  
  return false;
};

const handleSignup = (e) => {
  e.preventDefault();
  
  $("#characterMessage").animate({width:'hide'},350);
  
  if($("#user").val() == '' || $("#pass").val() == '' || $("#pass2").val() == '') {
    handleError("RAWR! All fields are required");
    return false;
  }
  
  if($("#pass").val() !== $("#pass2").val()) {
    handleError("RAWR! Passwords do not match");
    return false;
  }
  
  sendAjax('POST', $("#signupForm").attr("action"), $("#signupForm").serialize(), redirect);
  
  return false;
};

const LoginWindow = (props) => {
  return (
    <form id="loginForm" name="loginForm"
      onSubmit={handleLogin}
      action="/login"
      method="POST"
      className="newForm"
      >
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="Username"/>
      <br />
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="Password"/>
      <br />
      <input type="hidden" name="_csrf" value={props.csrf}/>
      <div className="row">
        <button className="btn waves-effect waves-light grey" type="submit" name="action">Sign In</button>
      </div>
    </form>
  );
};

const SignupWindow = (props) => {
  return (
    <form id="signupForm" name="signupForm"
      onSubmit={handleSignup}
      action="/signup"
      method="POST"
      className="newForm"
      >
      <label htmlFor="username">Username: </label>
      <input id="user" type="text" name="username" placeholder="Username"/>
      <br />
      <label htmlFor="pass">Password: </label>
      <input id="pass" type="password" name="pass" placeholder="Password"/>
      <br />
      <label htmlFor="pass2">Password: </label>
      <input id="pass2" type="password" name="pass2" placeholder="Retype Password"/>
      <input type="hidden" name="_csrf" value={props.csrf}/>
            <div className="row">
        <button className="btn waves-effect waves-light grey" type="submit" name="action">Sign Up</button>
      </div>
    </form>
  );
};

const createLoginWindow = (csrf) => {
  ReactDOM.render(
    <LoginWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const createSignupWindow = (csrf) => {
  ReactDOM.render(
    <SignupWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};

const setup = (csrf) => {
  const loginButton = document.querySelector("#loginButton");
  const signupButton = document.querySelector("#signupButton");
  
  signupButton.addEventListener("click", (e) => {
    e.preventDefault();
    createSignupWindow(csrf);
    return false;
  });
  
  loginButton.addEventListener("click", (e) => {
    e.preventDefault();
    createLoginWindow(csrf);
    return false;
  });
  
  createLoginWindow(csrf); // Default view
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
