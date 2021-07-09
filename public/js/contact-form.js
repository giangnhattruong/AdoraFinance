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
      mode: "cors", // no-cors, *cors, same-origin
      cache: "no-cache", // *default, no-cache, reload, force-cache, only-if-cached
      credentials: "same-origin", // include, *same-origin, omit
      headers: {
        "Content-Type": "application/json",
        // 'Content-Type': 'application/x-www-form-urlencoded',
      },
      redirect: "follow", // manual, *follow, error
      referrerPolicy: "no-referrer",
      body: mail,
    }).then((response) => {
      return response.json();
    });
  } catch (error) {
    console.log(error);
  }
};
