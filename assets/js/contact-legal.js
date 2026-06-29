(function () {
  'use strict';

  var modal = document.getElementById('contactLegalModal');
  if (!modal) return;

  function openModal(event) {
    if (event) event.preventDefault();
    modal.removeAttribute('hidden');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    modal.querySelector('.contact_legal-modal__close').focus();
  }

  function closeModal() {
    modal.setAttribute('hidden', '');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }

  document.querySelectorAll('.js-contact-legal-open').forEach(function (link) {
    link.addEventListener('click', openModal);
  });

  modal.querySelectorAll('.js-contact-legal-close').forEach(function (el) {
    el.addEventListener('click', closeModal);
  });

  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && !modal.hasAttribute('hidden')) {
      closeModal();
    }
  });
})();
