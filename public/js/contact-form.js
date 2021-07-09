const form = document.querySelector("#contact-form");

const formEvent = form.addEventListener("submit", (event) => {
  event.preventDefault();

  //2.
  let mail = new FormData(form);
  //3.
  sendMail(mail);
  form.elements.name = "";
  form.elements.email = "";
  form.elements.message = "";
});

const sendMail = async (mail) => {
  //1.
  try {
  console.dir(`mail: ${mail}`)
  await fetch("https://limitless-savannah-41564.herokuapp.com/send", {
    method: "post", //2.
    body: mail, //3.
  }).then((response) => {
    console.log(`Response: ${response.json()}`);
    return response.json();
  });
} catch (error) {
  console.log(error);
}
};
