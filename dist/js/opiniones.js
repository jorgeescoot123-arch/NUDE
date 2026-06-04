document.addEventListener('DOMContentLoaded', () => {
  // Sample reviews for initializing database
  const sampleReviews = [
    {
      id: 'rev-1',
      nombre: 'Diana Laura Ruvalcaba',
      calificacion: 5,
      comentario: '¡Excelente servicio! Reservamos una mesa Ultra VIP para festejar el cumpleaños de mi hermana y todo estuvo de maravilla. La música del DJ resident estuvo buenísima y la atención del mesero fue de 10. ¡Regresaremos pronto!',
      fecha: '2026-05-30T23:15:30.000Z'
    },
    {
      id: 'rev-2',
      nombre: 'Héctor Hugo Flores',
      calificacion: 5,
      comentario: 'El audio y las pantallas del antro están impresionantes, nada que pedirle a los antros de Guadalajara. Las bebidas de mixología con humo y luces neón se ven increíbles y saben delicioso. El ambiente es súper agradable.',
      fecha: '2026-05-24T02:40:00.000Z'
    },
    {
      id: 'rev-3',
      nombre: 'Karla María Torres',
      calificacion: 4,
      comentario: 'Me encantó la decoración glassmorphic y los efectos de luces neón moradas y rosas. El lugar se llena bastante el sábado, así que les recomiendo reservar su mesa con anticipación. La barra nacional tiene buen precio.',
      fecha: '2026-05-23T22:10:00.000Z'
    },
    {
      id: 'rev-4',
      nombre: 'Rubén Castorena',
      calificacion: 5,
      comentario: 'Las promociones de botellas nacionales al 2x1 los viernes antes de las 11:30 PM valen mucho la pena. La seguridad al entrar te hace sentir muy cómodo y tranquilo. Jalpa necesitaba un lugar de este nivel.',
      fecha: '2026-05-16T04:20:00.000Z'
    }
  ];

  // DOM Elements
  const reviewForm = document.getElementById('reviewForm');
  const reviewsContainer = document.getElementById('reviewsContainer');
  const averageRatingEl = document.getElementById('averageRating');
  const averageStarsEl = document.getElementById('averageStars');
  const totalReviewsCountEl = document.getElementById('totalReviewsCount');
  const ratingBarsContainer = document.getElementById('ratingBarsContainer');
  const filterRatingSelect = document.getElementById('filterRating');

  // Edit Modal Elements
  const editReviewModal = document.getElementById('editReviewModal');
  const editReviewForm = document.getElementById('editReviewForm');
  const closeEditModalBtn = document.getElementById('closeEditModalBtn');
  const btnCancelEdit = document.getElementById('btnCancelEdit');
  const editReviewIdInput = document.getElementById('editReviewId');
  const editReviewNameInput = document.getElementById('editReviewName');
  const editReviewCommentInput = document.getElementById('editReviewComment');

  // Initialize DB from LocalStorage or Sample Reviews
  let reviews = JSON.parse(localStorage.getItem('nude_opiniones'));
  if (!reviews || reviews.length === 0) {
    reviews = sampleReviews;
    localStorage.setItem('nude_opiniones', JSON.stringify(reviews));
  }

  // Calculate and Render Stats
  const updateStats = () => {
    const totalReviews = reviews.length;
    if (totalReviews === 0) {
      averageRatingEl.textContent = '0.0';
      averageStarsEl.innerHTML = renderStars(0);
      totalReviewsCountEl.textContent = 'Sin opiniones aún';
      renderRatingBars([]);
      return;
    }

    const sumRatings = reviews.reduce((sum, r) => sum + r.calificacion, 0);
    const average = (sumRatings / totalReviews).toFixed(1);
    
    averageRatingEl.textContent = average;
    averageStarsEl.innerHTML = renderStars(Math.round(parseFloat(average)));
    totalReviewsCountEl.textContent = `Basado en ${totalReviews} ${totalReviews === 1 ? 'opinión' : 'opiniones'}`;

    // Calculate rating counts for progress bars
    const counts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(r => {
      if (counts[r.calificacion] !== undefined) {
        counts[r.calificacion]++;
      }
    });

    renderRatingBars(counts, totalReviews);
  };

  // Helper to render stars HTML
  const renderStars = (rating) => {
    let starsHtml = '';
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        starsHtml += '<i class="fas fa-star"></i>';
      } else {
        starsHtml += '<i class="far fa-star"></i>';
      }
    }
    return starsHtml;
  };

  // Render Rating progress bars helper
  const renderRatingBars = (counts, total) => {
    ratingBarsContainer.innerHTML = '';
    for (let i = 5; i >= 1; i--) {
      const count = counts[i] || 0;
      const percentage = total > 0 ? ((count / total) * 100).toFixed(0) : 0;

      const barRow = document.createElement('div');
      barRow.className = 'rating-bar-row';
      barRow.innerHTML = `
        <span class="star-num">${i} <i class="fas fa-star" style="color: #ffc83b; font-size: 0.75rem;"></i></span>
        <div class="progress-bar-bg">
          <div class="progress-bar-fill" style="width: ${percentage}%"></div>
        </div>
        <span class="rating-percentage">${percentage}%</span>
      `;
      ratingBarsContainer.appendChild(barRow);
    }
  };

  // Helper to format date relative or formatted
  const formatReviewDate = (dateStr) => {
    const reviewDate = new Date(dateStr);
    const options = { day: 'numeric', month: 'short', year: 'numeric' };
    return reviewDate.toLocaleDateString('es-MX', options);
  };

  // Helper to get initials
  const getInitials = (name) => {
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return (name[0] || 'U').toUpperCase();
  };

  // Render reviews list
  const renderReviews = (filter = 'all') => {
    reviewsContainer.innerHTML = '';
    
    // Sort reviews: most recent first
    let sortedReviews = [...reviews].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));

    // Filter
    if (filter !== 'all') {
      const filterVal = parseInt(filter);
      sortedReviews = sortedReviews.filter(r => r.calificacion === filterVal);
    }

    if (sortedReviews.length === 0) {
      reviewsContainer.innerHTML = `
        <div class="reviews-empty-state">
          <i class="far fa-comments"></i>
          <h4>No hay opiniones en esta categoría</h4>
          <p>¡Sé el primero en calificar tu experiencia en NUDE!</p>
        </div>
      `;
      return;
    }

    sortedReviews.forEach(r => {
      const reviewCard = document.createElement('div');
      reviewCard.className = 'review-item-card reveal active'; // active to show immediately
      reviewCard.innerHTML = `
        <div class="review-header">
          <div class="testimonial-user" style="width: auto;">
            <div class="user-avatar">${getInitials(r.nombre)}</div>
            <div class="user-info">
              <h4>${escapeHTML(r.nombre)}</h4>
              <div class="review-date">${formatReviewDate(r.fecha)}</div>
            </div>
          </div>
          <div class="stars-display">
            ${renderStars(r.calificacion)}
          </div>
        </div>
        <div class="review-body">
          <p>${escapeHTML(r.comentario)}</p>
        </div>
        <div class="review-actions">
          <button class="btn-edit-review" data-id="${r.id}"><i class="fas fa-edit"></i> Editar</button>
          <button class="btn-delete-review" data-id="${r.id}"><i class="fas fa-trash-alt"></i> Eliminar</button>
        </div>
      `;
      reviewsContainer.appendChild(reviewCard);
    });

    // Rebind action buttons
    bindActionButtons();
  };

  // Bind Actions (Edit & Delete) to buttons
  const bindActionButtons = () => {
    document.querySelectorAll('.btn-edit-review').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        openEditModal(id);
      });
    });

    document.querySelectorAll('.btn-delete-review').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.getAttribute('data-id');
        deleteReview(id);
      });
    });
  };

  // Open Edit Modal
  const openEditModal = (id) => {
    const review = reviews.find(r => r.id === id);
    if (!review) return;

    editReviewIdInput.value = review.id;
    editReviewNameInput.value = review.nombre;
    editReviewCommentInput.value = review.comentario;

    // Set star radio checked
    const radioId = `editStar${review.calificacion}`;
    const radio = document.getElementById(radioId);
    if (radio) radio.checked = true;

    // Open Modal
    if (editReviewModal) {
      editReviewModal.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  };

  // Close Edit Modal
  const closeEditModal = () => {
    if (editReviewModal) {
      editReviewModal.classList.remove('active');
      document.body.style.overflow = '';
      editReviewForm.reset();
      
      // Clear errors
      editReviewForm.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    }
  };

  if (closeEditModalBtn) closeEditModalBtn.addEventListener('click', closeEditModal);
  if (btnCancelEdit) btnCancelEdit.addEventListener('click', closeEditModal);
  
  if (editReviewModal) {
    editReviewModal.addEventListener('click', (e) => {
      if (e.target === editReviewModal) {
        closeEditModal();
      }
    });
  }

  // Delete Review Handler
  const deleteReview = (id) => {
    const confirmDelete = confirm('¿Estás seguro de que deseas eliminar esta reseña?');
    if (!confirmDelete) return;

    reviews = reviews.filter(r => r.id !== id);
    localStorage.setItem('nude_opiniones', JSON.stringify(reviews));
    
    updateStats();
    renderReviews(filterRatingSelect.value);
  };

  // Form Validations helpers
  const validateReviewForm = (form, isEdit = false) => {
    let isValid = true;
    const suffix = isEdit ? 'edit' : 'add';

    const nameInput = isEdit ? editReviewNameInput : document.getElementById('reviewName');
    const commentInput = isEdit ? editReviewCommentInput : document.getElementById('reviewComment');
    
    // Check stars
    const starSelector = isEdit ? 'input[name="editRating"]:checked' : 'input[name="rating"]:checked';
    const checkedStar = form.querySelector(starSelector);
    const starContainer = isEdit ? document.getElementById('editStarRating') : document.querySelector('.star-rating-input');

    // Validate Name
    if (nameInput.value.trim().length < 3) {
      nameInput.classList.add('is-invalid');
      isValid = false;
    } else {
      nameInput.classList.remove('is-invalid');
    }

    // Validate Star
    if (!checkedStar) {
      starContainer.nextElementSibling.style.display = 'block';
      isValid = false;
    } else {
      starContainer.nextElementSibling.style.display = 'none';
    }

    // Validate Comment
    if (commentInput.value.trim().length < 10) {
      commentInput.classList.add('is-invalid');
      isValid = false;
    } else {
      commentInput.classList.remove('is-invalid');
    }

    return isValid;
  };

  // Handle Add Review Submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateReviewForm(reviewForm, false)) {
        return;
      }

      const ratingVal = parseInt(reviewForm.querySelector('input[name="rating"]:checked').value);
      const newReview = {
        id: 'rev-' + Date.now(),
        nombre: document.getElementById('reviewName').value.trim(),
        calificacion: ratingVal,
        comentario: document.getElementById('reviewComment').value.trim(),
        fecha: new Date().toISOString()
      };

      reviews.push(newReview);
      localStorage.setItem('nude_opiniones', JSON.stringify(reviews));

      // Reset
      reviewForm.reset();
      
      // Update
      updateStats();
      renderReviews(filterRatingSelect.value);
    });
  }

  // Handle Edit Review Submission
  if (editReviewForm) {
    editReviewForm.addEventListener('submit', (e) => {
      e.preventDefault();

      if (!validateReviewForm(editReviewForm, true)) {
        return;
      }

      const editId = editReviewIdInput.value;
      const ratingVal = parseInt(editReviewForm.querySelector('input[name="editRating"]:checked').value);
      
      // Find and update
      const index = reviews.findIndex(r => r.id === editId);
      if (index !== -1) {
        reviews[index].nombre = editReviewNameInput.value.trim();
        reviews[index].calificacion = ratingVal;
        reviews[index].comentario = editReviewCommentInput.value.trim();
        reviews[index].fecha = new Date().toISOString(); // update timestamp
        
        localStorage.setItem('nude_opiniones', JSON.stringify(reviews));
      }

      // Close modal & update
      closeEditModal();
      updateStats();
      renderReviews(filterRatingSelect.value);
    });
  }

  // Handle Filter Change
  if (filterRatingSelect) {
    filterRatingSelect.addEventListener('change', (e) => {
      renderReviews(e.target.value);
    });
  }

  // HTML Escaper for Security
  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        "'": '&#39;',
        '"': '&quot;'
      }[tag] || tag)
    );
  }

  // Initial Load
  updateStats();
  renderReviews();
});
