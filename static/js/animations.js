/**
 * Enhanced Animation System for Digital Zen Garden
 * This script provides advanced animation controls and effects for plants
 */

document.addEventListener('DOMContentLoaded', function() {
    // Set up animation controls when document is loaded
    setupAnimationControls();
    
    // Setup automatic animations for plants
    setupPlantAnimations();
    
    // Start random plant movements for more lifelike garden
    startRandomPlantMovements();
});

/**
 * Set up animation control handlers for the dropdown menu
 */
function setupAnimationControls() {
    // Animation mode controls
    const animationModeLinks = document.querySelectorAll('[data-animation-mode]');
    animationModeLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-animation-mode');
            setAnimationMode(mode);
            
            // Update active state in dropdown
            animationModeLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Seasonal controls
    const seasonLinks = document.querySelectorAll('[data-season]');
    seasonLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const season = this.getAttribute('data-season');
            setSeason(season);
            
            // Update active state in dropdown
            seasonLinks.forEach(l => l.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Special effect controls
    const effectLinks = document.querySelectorAll('[data-effect]');
    effectLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const effect = this.getAttribute('data-effect');
            
            // Toggle the effect (on if not active, off if active)
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                toggleSpecialEffect(effect, false);
            } else {
                this.classList.add('active');
                toggleSpecialEffect(effect, true);
            }
        });
    });
}

/**
 * Set the animation mode for all plants
 * @param {string} mode - The animation mode to set (default, dancing, bouncing, shimmering, rainbow)
 */
function setAnimationMode(mode) {
    const gardenContainer = document.getElementById('garden-container');
    if (!gardenContainer) return;
    
    const plants = document.querySelectorAll('.plant-container');
    
    // Remove all animation classes first
    plants.forEach(plant => {
        plant.classList.remove('plant-dancing', 'plant-bouncing', 'plant-shimmering', 'plant-waving', 'plant-excited');
        plant.classList.remove('effect-rainbow');
    });
    
    // Apply the new animation class based on mode
    switch (mode) {
        case 'dancing':
            plants.forEach(plant => plant.classList.add('plant-dancing'));
            showNotification('Plants are now dancing!', 'info');
            break;
        case 'bouncing':
            plants.forEach(plant => plant.classList.add('plant-bouncing'));
            showNotification('Plants are now bouncing!', 'info');
            break;
        case 'shimmering':
            plants.forEach(plant => plant.classList.add('plant-shimmering'));
            showNotification('Plants are now shimmering!', 'info');
            break;
        case 'rainbow':
            plants.forEach(plant => plant.classList.add('effect-rainbow'));
            showNotification('Rainbow mode activated!', 'info');
            break;
        default:
            // Default mode has no animation classes
            showNotification('Default animation mode set', 'info');
            break;
    }
}

/**
 * Set the seasonal theme for the garden
 * @param {string} season - The season to set (spring, summer, autumn, winter)
 */
function setSeason(season) {
    const gardenContainer = document.getElementById('garden-container');
    if (!gardenContainer) return;
    
    // Remove all season classes first
    gardenContainer.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    
    // Apply the new season class
    gardenContainer.classList.add(`season-${season}`);
    
    // Apply special seasonal effects
    applySeasonalEffects(season);
    
    // Show notification
    const seasonMessages = {
        'spring': 'Spring season active: Plants grow faster!',
        'summer': 'Summer season active: Plants are thriving!',
        'autumn': 'Autumn season active: Plants changing colors!',
        'winter': 'Winter season active: Plants growing slower!'
    };
    
    showNotification(seasonMessages[season] || `${season.charAt(0).toUpperCase() + season.slice(1)} season activated!`, 'info');
}

/**
 * Apply special effects based on the current season
 * @param {string} season - The active season
 */
function applySeasonalEffects(season) {
    const plants = document.querySelectorAll('.plant-container');
    
    // Remove any existing seasonal animations
    plants.forEach(plant => {
        plant.style.animation = '';
        plant.style.filter = '';
    });
    
    // Apply season-specific effects
    switch (season) {
        case 'spring':
            // Light bounce effect for spring growth
            plants.forEach(plant => {
                const randomDelay = Math.random() * 2;
                plant.style.animation = `plant-bounce 4s ${randomDelay}s infinite ease-in-out`;
            });
            break;
        case 'summer':
            // Subtle wave effect for summer heat
            plants.forEach(plant => {
                const randomDelay = Math.random() * 2;
                plant.style.animation = `plant-wave 7s ${randomDelay}s infinite ease-in-out`;
            });
            break;
        case 'autumn':
            // No special animation, the CSS filter handles the autumn colors
            break;
        case 'winter':
            // Slight shiver for winter cold
            plants.forEach(plant => {
                const randomDelay = Math.random() * 1;
                plant.style.animation = `plant-shiver 0.5s ${randomDelay}s infinite ease-in-out`;
            });
            break;
    }
}

/**
 * Toggle special visual effects for plants
 * @param {string} effect - The effect to toggle (sparkle, glow)
 * @param {boolean} active - Whether to enable or disable the effect
 */
function toggleSpecialEffect(effect, active) {
    const plantContainers = document.querySelectorAll('.plant-container');
    
    plantContainers.forEach(plant => {
        if (active) {
            plant.classList.add(`effect-${effect}`);
        } else {
            plant.classList.remove(`effect-${effect}`);
        }
    });
    
    // Show notification
    if (active) {
        showNotification(`${effect.charAt(0).toUpperCase() + effect.slice(1)} effect activated!`, 'info');
    } else {
        showNotification(`${effect.charAt(0).toUpperCase() + effect.slice(1)} effect deactivated`, 'info');
    }
}

/**
 * Set up various animation handlers for plants
 */
function setupPlantAnimations() {
    // Add click interaction to make plants dance when clicked
    const plantContainers = document.querySelectorAll('.plant-container');
    
    plantContainers.forEach(plant => {
        plant.addEventListener('click', function(e) {
            // Prevent event bubbling to avoid card selection
            e.stopPropagation();
            togglePlantDance(this);
        });
        
        // Add hover animation
        plant.addEventListener('mouseenter', function() {
            this.style.transform = 'scale(1.05)';
        });
        
        plant.addEventListener('mouseleave', function() {
            this.style.transform = 'scale(1)';
        });
    });
    
    // Add event listeners for plant watering buttons
    const waterButtons = document.querySelectorAll('.water-plant-btn');
    waterButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const plantId = this.getAttribute('data-plant-id');
            if (plantId) {
                waterPlant(plantId);
            }
        });
    });
}

/**
 * Make a specific plant dance briefly
 * @param {HTMLElement} plantElement - The plant container element
 */
function togglePlantDance(plantElement) {
    // Add dancing class temporarily
    plantElement.classList.add('plant-excited');
    
    // Remove the class after animation completes
    setTimeout(() => {
        plantElement.classList.remove('plant-excited');
    }, 1000);
}

/**
 * Handle plant watering with animations
 * @param {number} plantId - The ID of the plant to water
 */
function waterPlant(plantId) {
    // Find the plant container
    const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
    
    if (plantContainer) {
        // Add watering animation
        addWateringEffect(plantContainer);
        
        // The actual API call to water the plant is handled in garden.js
    }
}

/**
 * Add water drop animation to a plant
 * @param {HTMLElement} plantElement - The plant container element
 */
function addWateringEffect(plantElement) {
    // Create watering effect container
    const wateringEffect = document.createElement('div');
    wateringEffect.className = 'watering-effect';
    
    // Add water drops
    for (let i = 0; i < 5; i++) {
        const waterDrop = document.createElement('div');
        waterDrop.className = 'water-drop';
        // Randomize drop position
        waterDrop.style.left = `${30 + randomInRange(0, 40)}%`;
        waterDrop.style.animationDelay = `${randomInRange(0, 0.8)}s`;
        wateringEffect.appendChild(waterDrop);
    }
    
    plantElement.appendChild(wateringEffect);
    
    // Make plant bounce happily
    plantElement.classList.add('plant-dancing');
    
    // Remove effects after animation completes
    setTimeout(() => {
        if (wateringEffect && wateringEffect.parentNode === plantElement) {
            plantElement.removeChild(wateringEffect);
        }
        plantElement.classList.remove('plant-dancing');
    }, 2500);
}

/**
 * Generate a random number between min and max
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @returns {number} Random number in the specified range
 */
function randomInRange(min, max) {
    return min + Math.random() * (max - min);
}

/**
 * Make plants move slightly at random intervals to create a living garden feel
 */
function startRandomPlantMovements() {
    // Apply periodic random animations to plants
    setInterval(() => {
        const plants = document.querySelectorAll('.plant-container');
        if (plants.length === 0) return;
        
        // Pick a random plant
        const randomIndex = Math.floor(Math.random() * plants.length);
        const randomPlant = plants[randomIndex];
        
        // Make it do a subtle movement (only if not already animated)
        if (!randomPlant.classList.contains('plant-dancing') && 
            !randomPlant.classList.contains('plant-bouncing') &&
            !randomPlant.classList.contains('plant-excited')) {
            
            // Choose a random animation
            const animations = ['plant-waving', 'plant-excited'];
            const randomAnimation = animations[Math.floor(Math.random() * animations.length)];
            
            // Apply animation briefly
            randomPlant.classList.add(randomAnimation);
            
            // Remove after a short time
            setTimeout(() => {
                randomPlant.classList.remove(randomAnimation);
            }, 2000);
        }
    }, 6000); // Every 6 seconds
}