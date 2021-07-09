const form = document.querySelector("#contact-form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();

  //2.
  let mail = new FormData(form);
  console.log(`mail: ${mail}`)
  //3.
  sendMail(mail);
});

const sendMail = (mail) => {
  //1.
  fetch("https://limitless-savannah-41564.herokuapp.com/send", {
    method: "post", //2.
    body: mail, //3.
  }).then((response) => {
    console.log(response);
    return response.json();
  });
};
