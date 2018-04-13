let username = '';
let gold = 0;

const handleChange = (e) => {
  e.preventDefault();
  
  console.dir('hey');
  
  $("#characterMessage").animate({width:'hide'},350);
  
  if($("#pass").val() == '' || $("#newPass").val() == '' || $("#newPass2").val() == '') {
    handleError("All fields are required");
    return false;
  }
  
  if($("#newPass").val() !== $("#newPass2").val()) {
    handleError("Passwords do not match");
    return false;
  }
  
  sendAjax('POST', '/changePassword', $("#passwordForm").serialize(), redirect);
  
  return false;
};

const ProfileWindow = (props) => {
  const submitForm = () => {
    console.dir('submit');
    document.getElementById('passwordForm').submit();
  };
  
  // Button submit for forms
  // https://stackoverflow.com/questions/38030863/materializecss-form-input-submit-button?utm_medium=organic&utm_source=google_rich_qa&utm_campaign=google_rich_qa
  return (
    <div id='profileInfo'>
      <h3>{username}'s Profile Page</h3>
      <p>Gold: {Math.floor(gold)}</p>
      <form id="passwordForm" name="passwordForm"
        onSubmit={handleChange}
        action="/changePassword"
        method="POST"
        className="newForm"
        >
        <label htmlFor="pass">Current Password: </label>
        <input id="pass" type="password" name="pass" placeholder="Current Password"/>
        <br />
        <label htmlFor="newPass">New Password: </label>
        <input id="newPass" type="password" name="newPass" placeholder="New Password"/>
        <br />
        <label htmlFor="newPass2">Confirm New Password: </label>
        <input id="newPass2" type="password" name="newPass2" placeholder="Retype New Password"/>
        <input type="hidden" name="_csrf" value={props.csrf}/>
        <div className="row">
          <button className="btn waves-effect waves-light grey" type="submit" name="action">Change Password
              <i className="material-icons right">lock</i>
          </button>
        </div>
      </form>
    </div>
  );
};

const createProfileWindow = (csrf) => {
  ReactDOM.render(
    <ProfileWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};


const setup = (csrf) => {
  createProfileWindow(csrf); // Default view
};

const getToken = () => {
  sendAjax('GET', '/getToken', null, (result) => {
    username = result.account.username;
    gold = result.account.gold;
    setup(result.csrfToken);
  });
};

$(document).ready(function() {
  getToken();
});
