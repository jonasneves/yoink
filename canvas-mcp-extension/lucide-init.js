// Initialize Lucide icons after DOM is loaded
function initializeLucide() {
  if (typeof lucide !== 'undefined') {
    console.log('Initializing Lucide icons...');
    try {
      lucide.createIcons();
      console.log('Lucide icons initialized successfully');

      // Check if icons were actually created
      const iconElements = document.querySelectorAll('[data-lucide]');
      console.log(`Found ${iconElements.length} icon elements`);
      iconElements.forEach(el => {
        console.log(`Icon: ${el.getAttribute('data-lucide')}, has SVG: ${el.querySelector('svg') !== null}`);
      });
    } catch (error) {
      console.error('Error initializing Lucide:', error);
    }
  } else {
    console.error('Lucide library not loaded');
  }
}

// Try multiple initialization strategies
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeLucide);
} else {
  // DOM already loaded
  initializeLucide();
}

// Also try after a short delay as backup
setTimeout(initializeLucide, 100);
