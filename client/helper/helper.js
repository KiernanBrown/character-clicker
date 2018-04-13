const handleError = (message) => {
  // Error message fade out
  // http://jsfiddle.net/JohnnyWorker/SC7Zm/
  $("#errorMessage").text(message);
  $("#characterMessage").show();
  $("#characterMessage").fadeOut(3000);
};

const redirect = (response) => {
  $("#characterMessage").animate({width:'hide'},350);
  window.location = response.redirect;
};

const sendAjax = (type, action, data, success) => {
  $.ajax({
    cache: false,
    type: type,
    url: action,
    data: data,
    dataType: "json",
    success: success,
    error: function(xhr, status, error) {
      console.dir(error);
      console.warn(xhr.responseText);
      var messageObj = JSON.parse(xhr.responseText);
      handleError(messageObj.error);
    }
  });
};
