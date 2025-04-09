/**
 * Advanced animations for Digital Garden
 * This file adds sophisticated animations and visual effects to plants
 */

// Animation settings
const animationSettings = {
    enabled: true,
    currentMode: 'default', // default, dancing, bouncing, shimmering, rainbow
    currentSeason: 'spring', // spring, summer, autumn, winter
    specialEffects: {
        sparkle: false,
        glow: true,
        wateringEffect: true
    }
};

// Initialize animations when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    setupAnimationControls();
    setupPlantAnimations();
    startRandomPlantMovements();
    
    // Apply seasonal effects
    applySeasonalEffects(animationSettings.currentSeason);
});

// Set up the animation controls dropdown
function setupAnimationControls() {
    const animationDropdown = document.querySelector('.animations-dropdown');
    if (!animationDropdown) return;
    
    // Mode selection
    const modeItems = animationDropdown.querySelectorAll('[data-animation-mode]');
    modeItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-animation-mode');
            setAnimationMode(mode);
            
            // Update active class
            modeItems.forEach(mi => mi.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Season selection
    const seasonItems = animationDropdown.querySelectorAll('[data-season]');
    seasonItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const season = this.getAttribute('data-season');
            setSeason(season);
            
            // Update active class
            seasonItems.forEach(si => si.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Special effects toggles
    const effectItems = animationDropdown.querySelectorAll('[data-effect]');
    effectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const effect = this.getAttribute('data-effect');
            toggleSpecialEffect(effect);
            
            // Toggle active class
            this.classList.toggle('active');
        });
    });
}

// Apply the selected animation mode to all plants
function setAnimationMode(mode) {
    animationSettings.currentMode = mode;
    
    // Clear all animation classes first
    document.querySelectorAll('.plant-container').forEach(plant => {
        plant.classList.remove('plant-dancing', 'plant-bouncing', 'plant-shimmering', 'plant-rainbow');
    });
    
    // Apply the selected mode
    if (mode !== 'default') {
        document.querySelectorAll('.plant-container').forEach(plant => {
            plant.classList.add(`plant-${mode}`);
        });
    }
    
    console.log(`Animation mode set to: ${mode}`);
}

// Apply seasonal effects to the garden
function setSeason(season) {
    animationSettings.currentSeason = season;
    applySeasonalEffects(season);
    console.log(`Season set to: ${season}`);
}

// Apply seasonal visual effects
function applySeasonalEffects(season) {
    const gardenContainer = document.getElementById('garden-container');
    if (!gardenContainer) return;
    
    // Remove all season classes
    gardenContainer.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
    
    // Add the new season class
    gardenContainer.classList.add(`season-${season}`);
    
    // Apply season-specific ambient effects
    switch (season) {
        case 'spring':
            // Green glow, occasional sparkles, growth boost
            document.documentElement.style.setProperty('--plant-glow', '0 0 15px rgba(46, 213, 115, 0.6)');
            break;
        case 'summer':
            // Yellow/orange glow, brighter visuals
            document.documentElement.style.setProperty('--plant-glow', '0 0 15px rgba(241, 196, 15, 0.6)');
            break;
        case 'autumn':
            // Orange/red glow, falling leaf effect
            document.documentElement.style.setProperty('--plant-glow', '0 0 15px rgba(230, 126, 34, 0.6)');
            break;
        case 'winter':
            // Blue glow, snow effect, slower growth
            document.documentElement.style.setProperty('--plant-glow', '0 0 15px rgba(52, 152, 219, 0.6)');
            break;
    }
}

// Toggle special visual effects
function toggleSpecialEffect(effect) {
    if (animationSettings.specialEffects.hasOwnProperty(effect)) {
        animationSettings.specialEffects[effect] = !animationSettings.specialEffects[effect];
        
        // Apply or remove the effect
        const gardenContainer = document.getElementById('garden-container');
        if (!gardenContainer) return;
        
        if (effect === 'sparkle') {
            if (animationSettings.specialEffects.sparkle) {
                document.querySelectorAll('.plant-container').forEach(plant => {
                    plant.classList.add('sparkle-effect');
                });
            } else {
                document.querySelectorAll('.plant-container').forEach(plant => {
                    plant.classList.remove('sparkle-effect');
                });
            }
        }
        
        if (effect === 'glow') {
            if (animationSettings.specialEffects.glow) {
                document.documentElement.style.setProperty('--plant-glow', '0 0 15px rgba(46, 213, 115, 0.6)');
            } else {
                document.documentElement.style.setProperty('--plant-glow', '0 0 0px rgba(0, 0, 0, 0)');
            }
        }
        
        console.log(`Effect ${effect} set to: ${animationSettings.specialEffects[effect]}`);
    }
}

// Setup plant-specific animations
function setupPlantAnimations() {
    // Add click effect to toggle plant "dance"
    document.querySelectorAll('.plant-container').forEach(plant => {
        plant.addEventListener('click', function(e) {
            // Don't interfere with other click handlers
            e.stopPropagation();
            
            // Toggle dancing animation for this specific plant
            togglePlantDance(this);
        });
    });
}

// Toggle dancing animation for a specific plant
function togglePlantDance(plantElement) {
    // Only run in default mode 
    if (animationSettings.currentMode === 'default') {
        plantElement.classList.toggle('plant-dancing');
    }
}

// Water plant with animation effect
function waterPlant(plantId) {
    const plantElement = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
    if (!plantElement) return;
    
    // Add watering effect if enabled
    if (animationSettings.specialEffects.wateringEffect) {
        addWateringEffect(plantElement);
    }
}

// Add realistic water droplet animation
function addWateringEffect(plantElement) {
    const wateringEffect = document.createElement('div');
    wateringEffect.className = 'watering-effect';
    
    // Add random water droplets
    for (let i = 0; i < 15; i++) {
        const droplet = document.createElement('div');
        droplet.className = 'droplet';
        
        // Random position
        droplet.style.left = `${randomInRange(20, 80)}%`;
        droplet.style.top = `${randomInRange(-10, 10)}%`;
        
        // Random delay
        droplet.style.animationDelay = `${randomInRange(0, 500)}ms`;
        
        wateringEffect.appendChild(droplet);
    }
    
    plantElement.appendChild(wateringEffect);
    
    // Remove effect after animation completes
    setTimeout(() => {
        if (plantElement.contains(wateringEffect)) {
            plantElement.removeChild(wateringEffect);
        }
    }, 2000);
}

// Helper function to generate random number in range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Start random subtle movements for plants
function startRandomPlantMovements() {
    const plants = document.querySelectorAll('.plant-container');
    if (plants.length === 0) return;
    
    // Randomly select plants to animate
    plants.forEach(plant => {
        if (Math.random() < 0.3) { // 30% chance for each plant
            setTimeout(() => {
                // Skip if already animated or has explicit animation
                if (!plant.classList.contains('plant-dancing') && 
                    !plant.classList.contains('plant-bouncing') &&
                    animationSettings.currentMode === 'default') {
                    // Add subtle movement
                    plant.style.transform = `rotate(${randomInRange(-2, 2)}deg)`;
                    
                    // Restore after a while
                    setTimeout(() => {
                        plant.style.transform = '';
                    }, randomInRange(2000, 5000));
                }
            }, randomInRange(0, 10000)); // Random delay to prevent all plants moving at once
        }
    });
    
    // Repeat periodically
    setTimeout(startRandomPlantMovements, 15000);
}