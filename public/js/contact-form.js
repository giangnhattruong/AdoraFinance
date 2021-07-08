const form = document.querySelector("#contact-form");

const formEvent = form.addEventListener("submit", (event) => {
    event.preventDefault();
  
    //2.
    let mail = new FormData(form);
  
    //3.
    sendMail(mail);
  })