/* JavaScript helper to apply the data URI background */
import { heroBackgroundDataURI } from '../heroBackgroundDataURI';

// Apply the data URI background when the page loads
document.addEventListener('DOMContentLoaded', () => {
  const heroSections = document.querySelectorAll('.hero-section');
  
  if (heroSections.length) {
    heroSections.forEach(section => {
      // Try to load the original background image
      const img = new Image();
      img.onload = () => {
        // Image loaded successfully, do nothing
        console.log('Hero background image loaded successfully');
      };
      
      img.onerror = () => {
        // Image failed to load, apply data URI
        console.log('Using data URI fallback for hero background');
        section.style.backgroundImage = `linear-gradient(rgba(33, 37, 41, 0.7), rgba(33, 37, 41, 0.7)), url('${heroBackgroundDataURI}')`;
        section.classList.add('hero-data-uri');
      };
      
      // Get the current background image URL from the computed style
      const style = getComputedStyle(section);
      const backgroundImage = style.backgroundImage;
      
      // Try to extract the URL from the backgroundImage property
      const urlMatch = backgroundImage.match(/url\(['"]?(.*?)['"]?\)/);
      if (urlMatch && urlMatch[1]) {
        img.src = urlMatch[1];
      } else {
        // No background image found, apply data URI immediately
        section.style.backgroundImage = `linear-gradient(rgba(33, 37, 41, 0.7), rgba(33, 37, 41, 0.7)), url('${heroBackgroundDataURI}')`;
        section.classList.add('hero-data-uri');
      }
    });
  }
});