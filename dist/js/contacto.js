document.addEventListener('DOMContentLoaded', () => {
  const contactForm = document.getElementById('contactForm');
  const successBanner = document.getElementById('contactSuccessBanner');

  // Input elements
  const nameInput = document.getElementById('contactName');
  const emailInput = document.getElementById('contactEmail');
  const subjectInput = document.getElementById('contactSubject');
  const messageInput = document.getElementById('contactMessage');

  // Validation function
  const validateField = (input) => {
    let isValid = true;

    if (input.id === 'contactName') {
      isValid = input.value.trim().length > 3;
    } else if (input.id === 'contactEmail') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value.trim());
    } else if (input.id === 'contactMessage') {
      isValid = input.value.trim().length >= 15;
    } else {
      isValid = input.checkValidity();
    }

    if (!isValid) {
      input.classList.add('is-invalid');
    } else {
      input.classList.remove('is-invalid');
    }

    return isValid;
  };

  // Blur/input event listeners
  const formInputs = [nameInput, emailInput, subjectInput, messageInput];
  formInputs.forEach(input => {
    if (!input) return;

    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('change', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.classList.contains('is-invalid')) {
        validateField(input);
      }
    });
  });

  // Submission handler
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let formIsValid = true;
      formInputs.forEach(input => {
        if (input && !validateField(input)) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        const firstInvalid = contactForm.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      // Create contact object
      const contactSubmission = {
        id: 'msg-' + Date.now(),
        nombre: nameInput.value.trim(),
        email: emailInput.value.trim(),
        asunto: subjectInput.value,
        mensaje: messageInput.value.trim(),
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      saveContactMessage(contactSubmission);

      // Hide form, show success banner
      contactForm.style.display = 'none';
      if (successBanner) {
        successBanner.style.display = 'block';
        successBanner.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      // Reset form (in case we show it again or just reset state)
      contactForm.reset();
      formInputs.forEach(input => input.classList.remove('is-invalid'));
    });
  }

  // Save to LocalStorage helper
  const saveContactMessage = (msg) => {
    let messages = JSON.parse(localStorage.getItem('nude_contact_messages')) || [];
    messages.push(msg);
    localStorage.setItem('nude_contact_messages', JSON.stringify(messages));
  };
});
