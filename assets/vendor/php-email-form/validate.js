/**
* PHP Email Form Validation - v3.2
* URL: https://bootstrapmade.com/php-email-form/
* Author: BootstrapMade.com
* Adapted for static hosting (FormSubmit.co / JSON endpoints).
*/
(function () {
  "use strict";

  let forms = document.querySelectorAll('.php-email-form');

  forms.forEach( function(e) {
    e.addEventListener('submit', function(event) {
      event.preventDefault();

      let thisForm = this;

      let action = thisForm.getAttribute('action');
      let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

      if( ! action ) {
        displayError(thisForm, 'The form action property is not set!')
        return;
      }
      thisForm.querySelector('.loading').classList.add('d-block');
      thisForm.querySelector('.error-message').classList.remove('d-block');
      thisForm.querySelector('.sent-message').classList.remove('d-block');

      let formData = new FormData( thisForm );

      if ( recaptcha ) {
        if(typeof grecaptcha !== "undefined" ) {
          grecaptcha.ready(function() {
            try {
              grecaptcha.execute(recaptcha, {action: 'php_email_form_submit'})
              .then(token => {
                formData.set('recaptcha-response', token);
                php_email_form_submit(thisForm, action, formData);
              })
            } catch(error) {
              displayError(thisForm, error)
            }
          });
        } else {
          displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
        }
      } else {
        php_email_form_submit(thisForm, action, formData);
      }
    });
  });

  function php_email_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: 'POST',
      body: formData,
      headers: {'Accept': 'application/json', 'X-Requested-With': 'XMLHttpRequest'}
    })
    .then(response => response.text().then(text => ({ ok: response.ok, status: response.status, text: text })))
    .then(result => {
      thisForm.querySelector('.loading').classList.remove('d-block');
      if (isSuccess(result.text, result.ok)) {
        thisForm.querySelector('.sent-message').classList.add('d-block');
        thisForm.reset();
      } else {
        throw new Error(readError(result.text) || ('Form submission failed (' + result.status + ')'));
      }
    })
    .catch((error) => {
      displayError(thisForm, error.message || error);
    });
  }

  // Accept both plain "OK" responses and JSON APIs such as FormSubmit.co.
  function isSuccess(text, ok) {
    let body = (text || '').trim();
    if (body.toUpperCase() === 'OK') {
      return true;
    }
    try {
      let json = JSON.parse(body);
      if (json && (json.success === true || json.success === 'true' || json.ok === true)) {
        return true;
      }
    } catch (e) {
      // Not JSON; fall through.
    }
    return false;
  }

  function readError(text) {
    let body = (text || '').trim();
    try {
      let json = JSON.parse(body);
      if (json && json.message) {
        return json.message;
      }
    } catch (e) {
      // Not JSON.
    }
    return body;
  }

  function displayError(thisForm, error) {
    thisForm.querySelector('.loading').classList.remove('d-block');
    thisForm.querySelector('.error-message').innerHTML = error;
    thisForm.querySelector('.error-message').classList.add('d-block');
  }

})();
