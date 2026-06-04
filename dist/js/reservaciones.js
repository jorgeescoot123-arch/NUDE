document.addEventListener('DOMContentLoaded', () => {
  const bookingForm = document.getElementById('bookingForm');
  const successModal = document.getElementById('successModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const btnFinishBooking = document.getElementById('btnFinishBooking');
  const btnDownloadTicket = document.getElementById('btnDownloadTicket');

  // Input elements
  const nombreInput = document.getElementById('nombre');
  const telefonoInput = document.getElementById('telefono');
  const emailInput = document.getElementById('email');
  const fechaInput = document.getElementById('fecha');
  const horaInput = document.getElementById('hora');
  const personasInput = document.getElementById('personas');
  const tipoMesaSelect = document.getElementById('tipoMesa');

  // Set minimum date to today
  if (fechaInput) {
    const today = new Date().toISOString().split('T')[0];
    fechaInput.min = today;
  }

  // QR Code global variable
  let qrCodeGenerator = null;

  // Validation function
  const validateField = (input) => {
    let isValid = true;

    // Custom validations
    if (input.id === 'nombre') {
      isValid = input.value.trim().length > 3;
    } else if (input.id === 'telefono') {
      const phoneRegex = /^[0-9]{10}$/;
      isValid = phoneRegex.test(input.value.trim());
    } else if (input.id === 'email') {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      isValid = emailRegex.test(input.value.trim());
    } else if (input.id === 'fecha') {
      if (!input.value) {
        isValid = false;
      } else {
        // Nightclub open days validation (Thursday, Friday, Saturday)
        const bookingDate = new Date(input.value + 'T00:00:00');
        const dayOfWeek = bookingDate.getDay(); // 0: Sunday, 4: Thursday, 5: Friday, 6: Saturday
        isValid = (dayOfWeek === 4 || dayOfWeek === 5 || dayOfWeek === 6);
      }
    } else if (input.id === 'personas') {
      const val = parseInt(input.value);
      isValid = !isNaN(val) && val >= 1 && val <= 15;
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

  // Add validation on blur and input change
  const formInputs = [nombreInput, telefonoInput, emailInput, fechaInput, horaInput, personasInput, tipoMesaSelect];
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

  // Handle Form Submission
  if (bookingForm) {
    bookingForm.addEventListener('submit', (e) => {
      e.preventDefault();

      let formIsValid = true;
      formInputs.forEach(input => {
        if (input && !validateField(input)) {
          formIsValid = false;
        }
      });

      if (!formIsValid) {
        // Scroll to first invalid field
        const firstInvalid = bookingForm.querySelector('.is-invalid');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
          firstInvalid.focus();
        }
        return;
      }

      // Generate Folio ND-XXXXX
      const folio = 'ND-' + Math.floor(10000 + Math.random() * 90000);

      // Create booking object
      const bookingData = {
        folio: folio,
        nombre: nombreInput.value.trim(),
        telefono: telefonoInput.value.trim(),
        email: emailInput.value.trim(),
        fecha: fechaInput.value,
        hora: horaInput.value,
        personas: personasInput.value,
        tipoMesa: tipoMesaSelect.value,
        createdAt: new Date().toISOString()
      };

      // Save to localStorage
      saveReservation(bookingData);

      // Show Ticket details in Modal
      populateTicket(bookingData);

      // Show Modal
      if (successModal) {
        successModal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }

      // Reset form
      bookingForm.reset();
      formInputs.forEach(input => input.classList.remove('is-invalid'));
    });
  }

  // Save to LocalStorage helper
  const saveReservation = (booking) => {
    let reservations = JSON.parse(localStorage.getItem('nude_reservaciones')) || [];
    reservations.push(booking);
    localStorage.setItem('nude_reservaciones', JSON.stringify(reservations));
  };

  // Populate ticket modal helper
  const populateTicket = (data) => {
    document.getElementById('ticketName').textContent = data.nombre;
    document.getElementById('ticketZone').textContent = data.tipoMesa;
    document.getElementById('ticketTime').textContent = data.hora + ' PM';
    document.getElementById('ticketGuests').textContent = data.personas + (data.personas == 1 ? ' Persona' : ' Personas');
    document.getElementById('ticketFolio').textContent = '#' + data.folio;
    document.getElementById('ticketFolioCode').textContent = data.folio;

    // Format Date (Spanish)
    const bookingDate = new Date(data.fecha + 'T00:00:00');
    const options = { weekday: 'long', day: 'numeric', month: 'short' };
    let formattedDate = bookingDate.toLocaleDateString('es-MX', options);
    // Capitalize first letters
    formattedDate = formattedDate.replace(/\b\w/g, c => c.toUpperCase());
    document.getElementById('ticketDate').textContent = formattedDate;

    // Generate QR Code
    const qrContainer = document.getElementById('qrcode');
    if (qrContainer) {
      qrContainer.innerHTML = ''; // Clear previous QR Code

      // Format QR text data
      const qrText = `NUDE CLUB\nFolio: ${data.folio}\nCliente: ${data.nombre}\nMesa: ${data.tipoMesa}\nFecha: ${data.fecha}\nPersonas: ${data.personas}`;

      // Create QRCode.js instance (loaded via CDN)
      if (typeof QRCode !== 'undefined') {
        qrCodeGenerator = new QRCode(qrContainer, {
          text: qrText,
          width: 140,
          height: 140,
          colorDark : "#020004",
          colorLight : "#ffffff",
          correctLevel : QRCode.CorrectLevel.H
        });
      }
    }
  };

  // Close Modal functions
  const closeModal = () => {
    if (successModal) {
      successModal.classList.remove('active');
      document.body.style.overflow = '';
    }
  };

  if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
  if (btnFinishBooking) btnFinishBooking.addEventListener('click', closeModal);
  
  if (successModal) {
    successModal.addEventListener('click', (e) => {
      if (e.target === successModal) {
        closeModal();
      }
    });
  }

  // Print/Download ticket function
  if (btnDownloadTicket) {
    btnDownloadTicket.addEventListener('click', () => {
      // Basic browser print for the ticket area
      window.print();
    });
  }
});
