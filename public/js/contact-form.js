const form = document.querySelector("#contact-form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();

  //2.
  let mail = new FormData(form);

  //3.
  sendMail(mail);
});

const sendMail = (mail) => {
  //1.
  fetch("https://limitless-savannah-41564.herokuapp.com/send" || "https://adora.finance/send" , {
    method: "post", //2.
    body: mail, //3.
  }).then((response) => {
    return response.json();
  });
};
