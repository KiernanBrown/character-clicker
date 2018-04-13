let username = '';
let gold = 0;

const StoreWindow = (props) => {
  const submitForm = () => {
    console.dir('submit');
    document.getElementById('passwordForm').submit();
  };
  
  return (
    <div id='profileInfo'>
      <h3>Store</h3>
      <p>(Not implemented)</p>
      <div className='storeDiv'>
        <p className="centered">
          <button className="btn waves-effect waves-light grey" type="submit" name="action">Buy 50 Gems ($4.99)</button>
        </p>
        <p className="centered">
          <button className="btn waves-effect waves-light grey" type="submit" name="action">Buy 110 Gems ($9.99)</button>
        </p>
        <p className="centered">
          <button className="btn waves-effect waves-light grey" type="submit" name="action">Buy 250 Gems ($19.99)</button>
        </p>
      </div>
    </div>
  );
};

const createStoreWindow = (csrf) => {
  ReactDOM.render(
    <StoreWindow csrf={csrf} />,
    document.querySelector("#content")
  );
};


const setup = (csrf) => {
  createStoreWindow(csrf); // Default view
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
