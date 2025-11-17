// Initialize Lucide icons after DOM is loaded
function initializeLucide() {
  if (typeof lucide !== 'undefined') {
    console.log('Initializing Lucide icons...');
    console.log('Available lucide methods:', Object.keys(lucide));

    try {
      // createIcons() doesn't work in this build, use manual creation
      console.log('Using manual icon creation');

      // Manual icon creation using individual icon functions
      const iconElements = document.querySelectorAll('[data-lucide]');
      iconElements.forEach(el => {
        const iconName = el.getAttribute('data-lucide');
        // Convert kebab-case to PascalCase (e.g., refresh-cw -> RefreshCw)
        const pascalName = iconName.split('-').map(word =>
          word.charAt(0).toUpperCase() + word.slice(1)
        ).join('');

        console.log(`Trying to create icon: ${iconName} (${pascalName})`);

        if (lucide[pascalName]) {
          console.log(`Icon ${pascalName} type:`, typeof lucide[pascalName]);
          console.log(`Icon ${pascalName} methods:`, Object.keys(lucide[pascalName]));
          console.log(`Icon ${pascalName} value:`, lucide[pascalName]);

          // Try different ways to create the icon
          let svg = null;

          // Method 1: Check if it's the icon data object
          if (typeof lucide[pascalName] === 'string') {
            svg = lucide[pascalName];
          }
          // Method 2: Check if it's an array [tag, attrs, children]
          else if (Array.isArray(lucide[pascalName])) {
            console.log('Icon is an array:', lucide[pascalName]);
          }
          // Method 3: Use createElement if available
          else if (lucide.createElement) {
            svg = lucide.createElement(lucide[pascalName]);
          }

          if (svg) {
            el.innerHTML = svg;
            console.log(`Created icon: ${iconName}`);
          } else {
            console.error(`Could not create icon: ${iconName}`);
          }
        } else {
          console.error(`Icon ${pascalName} not found in lucide`);
        }
      });

      console.log('Lucide icons initialized successfully');

      // Check if icons were actually created
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
