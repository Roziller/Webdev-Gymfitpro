// challenge-detail.js - Enhanced version with better error handling, accessibility, and functionality

'use strict';

document.addEventListener('DOMContentLoaded', function() {
  // Check if localStorage is available
  const isLocalStorageAvailable = (() => {
    try {
      const testKey = '__test__';
      localStorage.setItem(testKey, testKey);
      localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      console.error('LocalStorage is not available:', e);
      return false;
    }
  })();

  // Safe localStorage setter
  const safeLocalStorageSet = (key, value) => {
    if (!isLocalStorageAvailable) return false;
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error('Error saving to localStorage:', e);
      return false;
    }
  };

  // Safe localStorage getter
  const safeLocalStorageGet = (key) => {
    if (!isLocalStorageAvailable) return null;
    try {
      return JSON.parse(localStorage.getItem(key));
    } catch (e) {
      console.error('Error reading from localStorage:', e);
      return null;
    }
  };

  // Calendar Navigation
  const prevWeekBtn = document.querySelector('.btn-prev-week');
  const nextWeekBtn = document.querySelector('.btn-next-week');
  const calendarWeekDisplay = document.querySelector('.calendar-week');
  const weekContainers = document.querySelectorAll('.calendar-week-container');
  let currentWeek = 1;
  const totalWeeks = weekContainers.length;

  // Update calendar display
  const updateCalendarDisplay = () => {
    if (calendarWeekDisplay) {
      calendarWeekDisplay.textContent = `Week ${currentWeek}`;
    }

    weekContainers.forEach((container, index) => {
      container.classList.toggle('active', index + 1 === currentWeek);
    });

    if (prevWeekBtn) prevWeekBtn.disabled = currentWeek === 1;
    if (nextWeekBtn) nextWeekBtn.disabled = currentWeek === totalWeeks;
  };

  // Event listeners for calendar navigation
  if (prevWeekBtn && nextWeekBtn) {
    prevWeekBtn.addEventListener('click', () => {
      if (currentWeek > 1) {
        currentWeek--;
        updateCalendarDisplay();
      }
    });

    nextWeekBtn.addEventListener('click', () => {
      if (currentWeek < totalWeeks) {
        currentWeek++;
        updateCalendarDisplay();
      }
    });
  }

  // Exercise Detail Modal
  const modal = document.getElementById('exercise-modal');
  const modalClose = document.querySelector('.modal-close');
  const viewExerciseBtns = document.querySelectorAll('.btn-view-exercise');
  const modalDayNumber = document.getElementById('modal-day-number');
  const markCompleteBtn = document.querySelector('.mark-complete-btn');

  // Load exercise details
  const loadExerciseDetails = (dayNumber) => {
    if (modalDayNumber) {
      modalDayNumber.textContent = dayNumber;
    }
    // In a real app, you would fetch exercise details for this day here
  };

  // Open modal
  const openModal = (dayNumber) => {
    loadExerciseDetails(dayNumber);
    if (modal) {
      modal.style.display = 'flex';
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${window.innerWidth - document.documentElement.clientWidth}px`;
      trapFocusInModal();
    }
  };

  // Close modal
  const closeModal = () => {
    if (modal) {
      modal.style.display = 'none';
      document.body.style.overflow = 'auto';
      document.body.style.paddingRight = '0';
    }
  };

  // Focus trapping for modal
  const trapFocusInModal = () => {
    const focusableElements = modal.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement.focus();

    const handleTabKey = (e) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        lastElement.focus();
        e.preventDefault();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        firstElement.focus();
        e.preventDefault();
      }
    };

    modal.addEventListener('keydown', handleTabKey);
    return () => modal.removeEventListener('keydown', handleTabKey);
  };

  // Event listeners for modal
  viewExerciseBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dayNumber = btn.getAttribute('data-day');
      openModal(dayNumber);
    });
  });

  if (modalClose) {
    modalClose.addEventListener('click', closeModal);
  }

  window.addEventListener('click', (event) => {
    if (event.target === modal) {
      closeModal();
    }
  });

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && modal.style.display === 'flex') {
      closeModal();
    }
  });

  // Progress Tracking
  const completeBtns = document.querySelectorAll('.btn-complete');
  let completedDays = 0;
  const totalDays = 30;

  // Update progress display
  const updateProgress = () => {
    const progressBar = document.querySelector('.progress-bar');
    const daysCompletedSpan = document.querySelector('.days-completed');
    const daysRemainingSpan = document.querySelector('.days-remaining');
    
    const progressPercentage = (completedDays / totalDays) * 100;
    
    if (progressBar) progressBar.style.width = `${progressPercentage}%`;
    if (daysCompletedSpan) daysCompletedSpan.textContent = `${completedDays} day${completedDays !== 1 ? 's' : ''} completed`;
    if (daysRemainingSpan) {
      const remaining = totalDays - completedDays;
      daysRemainingSpan.textContent = `${remaining} day${remaining !== 1 ? 's' : ''} remaining`;
    }
  };

  // Toggle complete state
  const toggleCompleteState = (btn) => {
    const icon = btn.querySelector('i');
    const dayElement = btn.closest('.calendar-day');
    
    if (icon.classList.contains('fa-circle-o')) {
      icon.classList.replace('fa-circle-o', 'fa-circle');
      dayElement?.classList.add('completed');
      completedDays++;
    } else {
      icon.classList.replace('fa-circle', 'fa-circle-o');
      dayElement?.classList.remove('completed');
      completedDays--;
    }
    
    saveProgress();
    updateProgress();
  };

  // Event listeners for complete buttons
  completeBtns.forEach(btn => {
    btn.addEventListener('click', () => toggleCompleteState(btn));
  });

  if (markCompleteBtn) {
    markCompleteBtn.addEventListener('click', () => {
      const dayNumber = modalDayNumber.textContent;
      const dayButton = document.querySelector(`.btn-view-exercise[data-day="${dayNumber}"]`);
      
      if (dayButton) {
        const completeBtn = dayButton.closest('.calendar-day')?.querySelector('.btn-complete');
        if (completeBtn) toggleCompleteState(completeBtn);
        closeModal();
      }
    });
  }

  // Get challenge ID from page
  const getChallengeId = () => {
    const urlPath = window.location.pathname;
    return urlPath.split('/').pop().replace('.html', '') || 'default-challenge';
  };

  // Save progress to localStorage
  const saveProgress = () => {
    const challengeId = getChallengeId();
    const completedDayElements = document.querySelectorAll('.calendar-day.completed');
    const completedDayNumbers = Array.from(completedDayElements).map(day => {
      const btn = day.querySelector('.btn-view-exercise');
      return btn ? btn.getAttribute('data-day') : null;
    }).filter(Boolean);
    
    safeLocalStorageSet(`challenge-${challengeId}-progress`, completedDayNumbers);
  };

  // Load progress from localStorage
  const loadProgress = () => {
    const challengeId = getChallengeId();
    const savedProgress = safeLocalStorageGet(`challenge-${challengeId}-progress`);
    
    if (savedProgress && Array.isArray(savedProgress)) {
      savedProgress.forEach(dayNumber => {
        const dayButton = document.querySelector(`.btn-view-exercise[data-day="${dayNumber}"]`);
        
        if (dayButton) {
          const dayElement = dayButton.closest('.calendar-day');
          const completeBtn = dayElement?.querySelector('.btn-complete');
          const icon = completeBtn?.querySelector('i');
          
          if (icon) {
            icon.classList.replace('fa-circle-o', 'fa-circle');
            dayElement?.classList.add('completed');
            completedDays++;
          }
        }
      });
      
      updateProgress();
    }
  };

  // Favorites functionality
  const favoriteBtn = document.querySelector('.btn-favorite');
  
  const addToFavorites = () => {
    const challengeId = getChallengeId();
    let favorites = safeLocalStorageGet('fitnessChallengeFavorites') || [];
    if (!favorites.includes(challengeId)) {
      favorites.push(challengeId);
      safeLocalStorageSet('fitnessChallengeFavorites', favorites);
    }
  };

  const removeFromFavorites = () => {
    const challengeId = getChallengeId();
    let favorites = safeLocalStorageGet('fitnessChallengeFavorites') || [];
    favorites = favorites.filter(id => id !== challengeId);
    safeLocalStorageSet('fitnessChallengeFavorites', favorites);
  };

  const checkFavoriteStatus = () => {
    if (!favoriteBtn) return;
    const challengeId = getChallengeId();
    const favorites = safeLocalStorageGet('fitnessChallengeFavorites') || [];
    const icon = favoriteBtn.querySelector('i');
    
    if (favorites.includes(challengeId)) {
      icon?.classList.replace('far', 'fas');
      favoriteBtn.setAttribute('aria-label', 'Remove from favorites');
    }
  };

  if (favoriteBtn) {
    favoriteBtn.addEventListener('click', () => {
      const icon = favoriteBtn.querySelector('i');
      
      if (icon.classList.contains('far')) {
        icon.classList.replace('far', 'fas');
        favoriteBtn.setAttribute('aria-label', 'Remove from favorites');
        addToFavorites();
      } else {
        icon.classList.replace('fas', 'far');
        favoriteBtn.setAttribute('aria-label', 'Add to favorites');
        removeFromFavorites();
      }
    });
  }

  // Share functionality
  const shareBtn = document.querySelector('.btn-share');
  
  const showShareFallback = () => {
    const tempInput = document.createElement('input');
    tempInput.value = window.location.href;
    document.body.appendChild(tempInput);
    tempInput.select();
    
    try {
      document.execCommand('copy');
      alert('Link copied to clipboard! Share it with your friends.');
    } catch (err) {
      console.error('Failed to copy URL:', err);
      alert('Copy this link to share: ' + window.location.href);
    }
    
    document.body.removeChild(tempInput);
  };

  if (shareBtn) {
    shareBtn.addEventListener('click', () => {
      if (navigator.share) {
        navigator.share({
          title: document.title,
          url: window.location.href,
          text: `Check out this fitness challenge: ${document.title}`
        }).catch(() => showShareFallback());
      } else {
        showShareFallback();
      }
    });
  }

  // Print functionality
  const printBtn = document.querySelector('.btn-print');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Add to calendar functionality
  const addToCalendarBtn = document.querySelector('.btn-add-calendar');
  const formatDateForCalendar = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}${month}${day}T000000Z`;
  };

  if (addToCalendarBtn) {
    addToCalendarBtn.addEventListener('click', () => {
      const challengeTitle = document.querySelector('.challenge-title')?.textContent || 'Fitness Challenge';
      const today = new Date();
      const endDate = new Date();
      endDate.setDate(today.getDate() + totalDays - 1);
      
      const googleCalLink = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(challengeTitle)}&dates=${formatDateForCalendar(today)}/${formatDateForCalendar(endDate)}&details=${encodeURIComponent('Daily fitness challenge - track your progress at ' + window.location.href)}`;
      
      window.open(googleCalLink, '_blank');
    });
  }

  // Rating system
  const ratingStars = document.querySelectorAll('.rating-star');
  const ratingMessage = document.querySelector('.rating-message');
  
  const saveRating = (rating) => {
    const challengeId = getChallengeId();
    safeLocalStorageSet(`challenge-${challengeId}-rating`, rating);
  };

  const updateStarRating = (rating) => {
    ratingStars.forEach((star, index) => {
      const icon = star.querySelector('i');
      if (index < rating) {
        icon?.classList.replace('far', 'fas');
      } else {
        icon?.classList.replace('fas', 'far');
      }
    });
  };

  const loadRating = () => {
    const challengeId = getChallengeId();
    const savedRating = safeLocalStorageGet(`challenge-${challengeId}-rating`);
    
    if (savedRating && savedRating >= 1 && savedRating <= 5) {
      updateStarRating(parseInt(savedRating));
    }
  };

  ratingStars.forEach((star, index) => {
    star.addEventListener('click', () => handleRating(index + 1));
    star.addEventListener('keydown', (e) => {
      if (['Enter', ' '].includes(e.key)) {
        e.preventDefault();
        handleRating(index + 1);
      }
    });
  });

  const handleRating = (rating) => {
    if (rating < 1 || rating > 5) return;
    
    updateStarRating(rating);
    saveRating(rating);
    
    if (ratingMessage) {
      ratingMessage.textContent = 'Thanks for your rating!';
      ratingMessage.style.display = 'block';
      setTimeout(() => {
        ratingMessage.style.display = 'none';
      }, 3000);
    }
  };

  // Initialize everything
  const init = () => {
    updateCalendarDisplay();
    loadProgress();
    checkFavoriteStatus();
    loadRating();
  };

  init();
});