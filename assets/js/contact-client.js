(function () {
  'use strict';

  var FORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLSecvpUl1s373Dva_lERhV5qOYvtlozeIYMbBdM7cJjC9GhyCA/formResponse';
  var CONSENT_VALUE = '上記内容に同意します。';

  var ENTRY = {
    name: 'entry.1366306727',
    email: 'entry.407468413',
    company: 'entry.618702819',
    message: 'entry.1061281858',
    consent: 'entry.2008305608'
  };

  var form = document.getElementById('contactForm');
  if (!form) return;

  var formCard = form.closest('.contact_form-card');
  var btn = document.getElementById('submitBtn');
  var success = document.getElementById('contactSuccess');
  var consentField = document.getElementById('consentField');
  var consentInput = document.getElementById('privacyConsent');
  var fields = document.querySelectorAll('[data-field]');
  var iframe = null;

  function getInput(field) {
    return field.querySelector('.contact_input, .contact_textarea, .contact_select');
  }

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getInquiryTypeLabel() {
    var inquiryType = document.getElementById('inquiryType');
    if (!inquiryType || !inquiryType.value) return '';
    return inquiryType.options[inquiryType.selectedIndex].text;
  }

  function buildMessageText() {
    var parts = [];
    var typeLabel = getInquiryTypeLabel();
    var telValue = document.getElementById('tel').value.trim();
    var messageValue = document.getElementById('message').value.trim();

    if (typeLabel) {
      parts.push('【お問い合わせ種別】' + typeLabel);
    }
    if (telValue) {
      parts.push('【電話番号】' + telValue);
    }
    if (messageValue) {
      parts.push('【お問い合わせ内容】\n' + messageValue);
    }

    return parts.join('\n\n');
  }

  function buildPayload() {
    var payload = new URLSearchParams();

    payload.append(ENTRY.name, document.getElementById('name').value.trim());
    payload.append(ENTRY.email, document.getElementById('email').value.trim());
    payload.append(ENTRY.company, document.getElementById('company').value.trim());
    payload.append(ENTRY.message, buildMessageText());

    if (consentInput && consentInput.checked) {
      payload.append(ENTRY.consent, CONSENT_VALUE);
    }

    return payload;
  }

  function validateField(field) {
    var input = getInput(field);
    if (!input) return true;

    var value = input.value.trim();
    var required = input.hasAttribute('required');
    var ok = true;

    if (required && value === '') {
      ok = false;
    }

    if (input.id === 'email' && value !== '' && !isValidEmail(value)) {
      ok = false;
    }

    field.classList.toggle('is-error', !ok);
    field.classList.toggle('is-valid', ok && value !== '' && (required || input.id === 'email'));
    return ok;
  }

  function validateConsent() {
    if (!consentInput) return true;
    var ok = consentInput.checked;
    if (consentField) {
      consentField.classList.toggle('is-error', !ok);
    }
    return ok;
  }

  function showSuccess() {
    if (formCard) {
      formCard.classList.add('is-submitted');
    }
    if (success) {
      success.removeAttribute('hidden');
      success.classList.add('is-on');
    }
  }

  function submitViaIframe(body) {
    return new Promise(function (resolve) {
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.name = 'contactClientHiddenFrame';
        iframe.setAttribute('aria-hidden', 'true');
        iframe.tabIndex = -1;
        iframe.style.cssText = 'position:absolute;width:0;height:0;border:0;opacity:0;pointer-events:none;';
        document.body.appendChild(iframe);
      }

      var tempForm = document.createElement('form');
      tempForm.method = 'POST';
      tempForm.action = FORM_ACTION;
      tempForm.target = iframe.name;
      tempForm.style.display = 'none';

      body.forEach(function (value, key) {
        var input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        tempForm.appendChild(input);
      });

      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        tempForm.remove();
        resolve();
      };

      iframe.addEventListener('load', finish, { once: true });
      document.body.appendChild(tempForm);
      tempForm.submit();
      window.setTimeout(finish, 3000);
    });
  }

  async function submitToGoogleForm(payload) {
    try {
      await fetch(FORM_ACTION, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
        },
        body: payload.toString()
      });
    } catch (err) {
      await submitViaIframe(payload);
    }
  }

  fields.forEach(function (field) {
    var input = getInput(field);
    if (!input) return;

    input.addEventListener('input', function () {
      validateField(field);
    });

    input.addEventListener('blur', function () {
      validateField(field);
    });

    input.addEventListener('focus', function () {
      field.classList.remove('is-error');
    });

    if (input.tagName === 'SELECT') {
      input.addEventListener('change', function () {
        validateField(field);
      });
    }
  });

  if (consentInput) {
    consentInput.addEventListener('change', function () {
      if (consentInput.checked && consentField) {
        consentField.classList.remove('is-error');
      }
    });
  }

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    var allOk = true;
    fields.forEach(function (field) {
      if (!validateField(field)) {
        allOk = false;
      }
    });

    if (!validateConsent()) {
      allOk = false;
    }

    if (!allOk) {
      var firstErr = form.querySelector('.is-error .contact_input, .is-error .contact_textarea, .is-error .contact_select');
      if (firstErr) {
        firstErr.focus();
      } else if (consentInput && consentField && consentField.classList.contains('is-error')) {
        consentInput.focus();
        consentField.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    var honeypot = document.getElementById('website');
    if (honeypot && honeypot.value.trim() !== '') {
      showSuccess();
      return;
    }

    var labelEl = btn ? btn.querySelector('.contact_submit__label') : null;
    var origLabel = labelEl ? labelEl.textContent : '';

    if (btn) {
      btn.disabled = true;
    }
    if (labelEl) {
      labelEl.textContent = '送信中…';
    }

    try {
      await submitToGoogleForm(buildPayload());
      showSuccess();
    } catch (err) {
      alert('送信に失敗しました。通信環境をご確認のうえ、再度お試しください。');
    } finally {
      if (btn) {
        btn.disabled = false;
      }
      if (labelEl) {
        labelEl.textContent = origLabel;
      }
    }
  });
})();
