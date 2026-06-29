(function () {
  'use strict';

  var FORM_ACTION =
    'https://docs.google.com/forms/d/e/1FAIpQLSd0GQdELuXQvGcdaePoj1xAbyfPow1cGOiyQ8gmlX3S4iAbyg/formResponse';
  var CONSENT_VALUE = '上記内容に同意します。';

  var ENTRY = {
    name: 'entry.878097099',
    furigana: 'entry.1045738239',
    gender: 'entry.887438216',
    age: 'entry.762102209',
    address: 'entry.729600832',
    email: 'entry.1009441241',
    tel: 'entry.1097159677',
    activityName: 'entry.1324927947',
    portfolioUrl: 'entry.124666130',
    snsUrl: 'entry.884933023',
    message: 'entry.1730771449',
    consent: 'entry.1796987835'
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

  function isValidUrl(value) {
    if (!value) return true;
    try {
      new URL(value.indexOf('://') === -1 ? 'https://' + value : value);
      return true;
    } catch (err) {
      return false;
    }
  }

  function getGenreLabel() {
    var genre = document.getElementById('genre');
    if (!genre || !genre.value) return '';
    return genre.options[genre.selectedIndex].text;
  }

  function buildMotivationText() {
    var parts = [];
    var genreLabel = getGenreLabel();
    var bio = document.getElementById('bio').value.trim();
    var message = document.getElementById('message').value.trim();

    if (genreLabel) {
      parts.push('【活動ジャンル】' + genreLabel);
    }
    if (bio) {
      parts.push('【活動実績・自己紹介】\n' + bio);
    }
    if (message) {
      parts.push('【ご相談内容】\n' + message);
    }

    return parts.join('\n\n');
  }

  function buildPayload() {
    var payload = new URLSearchParams();
    var nameValue = document.getElementById('name').value.trim();
    var telValue = document.getElementById('tel').value.trim();

    payload.append(ENTRY.name, nameValue);
    payload.append(ENTRY.furigana, '未入力');
    payload.append(ENTRY.gender, '男性');
    payload.append(ENTRY.age, '未記入');
    payload.append(ENTRY.address, '未記入');
    payload.append(ENTRY.email, document.getElementById('email').value.trim());
    payload.append(ENTRY.tel, telValue || '未記入');
    payload.append(ENTRY.activityName, document.getElementById('activityName').value.trim());
    payload.append(ENTRY.portfolioUrl, document.getElementById('portfolioUrl').value.trim());
    payload.append(ENTRY.snsUrl, document.getElementById('snsUrl').value.trim());
    payload.append(ENTRY.message, buildMotivationText());

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

    if (value !== '' && (input.id === 'portfolioUrl' || input.id === 'snsUrl') && !isValidUrl(value)) {
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
        iframe.name = 'contactCreatorHiddenFrame';
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
