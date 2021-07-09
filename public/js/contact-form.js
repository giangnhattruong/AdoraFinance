const form = document.querySelector("#contact-form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();
  let mail = new FormData(form);
  sendEmail(mail);
  form.elements.name = "";
  form.elements.email = "";
  form.elements.message = "";
});

const sendEmail = (mail) => {
  try {
    fetch("https://limitless-savannah-41564.herokuapp.com/send", {
      method: "post",
      body: mail,
    }).then((response) => {
      return response.json();
    });
  } catch (error) {
    console.log(error);
  }
};
