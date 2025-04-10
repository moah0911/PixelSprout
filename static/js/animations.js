/**
 * Enhanced Animation System for PixelSprout
 * This script provides advanced animation controls and effects for plants
 * Redesigned to use buttons instead of dropdowns
 */

document.addEventListener('DOMContentLoaded', function() {
    // Setup automatic animations for plants
    setupPlantAnimations();
    
    // Start random plant movements for more lifelike garden
    startRandomPlantMovements();
    
    // Setup effects dropdown handlers
    setupEffectsDropdownHandlers();
    
    // Initialize particle effects
    initParticles();
    
    // Update unit label when condition type changes
    const conditionTypeSelect = document.getElementById('condition-type');
    if (conditionTypeSelect) {
        conditionTypeSelect.addEventListener('change', updateValueUnit);
    }
});

/**
 * Create effect buttons and add them to the page
 */
function createEffectButtons() {
    // Get the area where we'll add the buttons
    const quickActionsDiv = document.querySelector('.d-flex.flex-wrap.gap-2.mt-3');
    if (!quickActionsDiv) return;
    
    // Create animation buttons container
    const animationButtonsContainer = document.createElement('div');
    animationButtonsContainer.className = 'animation-buttons-container ms-2';
    animationButtonsContainer.innerHTML = `
        <div class="btn-group me-2">
            <button class="btn btn-sm btn-outline-secondary" id="toggle-animations-btn">
                <i class="fas fa-magic me-1"></i> Toggle Effects
            </button>
        </div>
        <div class="btn-group me-2">
            <button class="btn btn-sm btn-outline-success dropdown-toggle" type="button" id="addSamplePlantBtn" data-bs-toggle="dropdown" aria-expanded="false">
                <i class="fas fa-seedling me-1"></i> Add Sample Plant
            </button>
            <ul class="dropdown-menu" id="sample-plant-options">
                <li><a class="dropdown-item" href="#" data-plant-type="flower">Flower (Sunflower)</a></li>
                <li><a class="dropdown-item" href="#" data-plant-type="vine">Vine (Ivy)</a></li>
                <li><a class="dropdown-item" href="#" data-plant-type="succulent">Succulent (Cactus)</a></li>
                <li><a class="dropdown-item" href="#" data-plant-type="herb">Herb (Basil)</a></li>
                <li><a class="dropdown-item" href="#" data-plant-type="tree">Tree (Bonsai)</a></li>
            </ul>
        </div>
    `;
    
    // Add to the page
    quickActionsDiv.appendChild(animationButtonsContainer);
    
    // Create the animation buttons panel (initially hidden)
    const animationPanel = document.createElement('div');
    animationPanel.id = 'animation-effects-panel';
    animationPanel.className = 'animation-effects-panel mt-3 p-3 rounded bg-dark d-none';
    animationPanel.innerHTML = `
        <h5 class="mb-3">Animation Effects</h5>
        
        <div class="mb-3">
            <label class="form-label">Animation Mode</label>
            <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Animation modes">
                <button type="button" class="btn btn-sm btn-outline-success active" data-animation-mode="default">
                    <i class="fas fa-leaf me-1"></i> Default
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-animation-mode="dancing">
                    <i class="fas fa-music me-1"></i> Dancing
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-animation-mode="bouncing">
                    <i class="fas fa-angle-double-up me-1"></i> Bouncing
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-animation-mode="shimmering">
                    <i class="fas fa-sync me-1"></i> Shimmering
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-animation-mode="rainbow">
                    <i class="fas fa-rainbow me-1"></i> Rainbow
                </button>
            </div>
        </div>
        
        <div class="mb-3">
            <label class="form-label">Seasonal Theme</label>
            <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Seasonal themes">
                <button type="button" class="btn btn-sm btn-outline-success active" data-season="spring">
                    <i class="fas fa-seedling me-1"></i> Spring
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-season="summer">
                    <i class="fas fa-sun me-1"></i> Summer
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-season="autumn">
                    <i class="fas fa-leaf me-1"></i> Autumn
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-season="winter">
                    <i class="fas fa-snowflake me-1"></i> Winter
                </button>
            </div>
        </div>
        
        <div class="mb-3">
            <label class="form-label">Special Effects</label>
            <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Special effects">
                <button type="button" class="btn btn-sm btn-outline-success" data-effect="sparkle">
                    <i class="fas fa-star me-1"></i> Sparkle
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-effect="glow">
                    <i class="fas fa-lightbulb me-1"></i> Glow
                </button>
            </div>
        </div>
    `;
    
    // Add the panel after the quick actions
    quickActionsDiv.parentNode.insertBefore(animationPanel, quickActionsDiv.nextSibling);
    
    // Toggle effects panel when button is clicked
    document.getElementById('toggle-animations-btn').addEventListener('click', function() {
        const panel = document.getElementById('animation-effects-panel');
        if (panel.classList.contains('d-none')) {
            panel.classList.remove('d-none');
            this.classList.add('active');
        } else {
            panel.classList.add('d-none');
            this.classList.remove('active');
        }
    });
    
    // Set up animation mode buttons
    const animationModeButtons = document.querySelectorAll('[data-animation-mode]');
    animationModeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const mode = this.getAttribute('data-animation-mode');
            setAnimationMode(mode);
            
            // Update active state
            animationModeButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Set up seasonal theme buttons
    const seasonButtons = document.querySelectorAll('[data-season]');
    seasonButtons.forEach(button => {
        button.addEventListener('click', function() {
            const season = this.getAttribute('data-season');
            setSeason(season);
            
            // Update active state
            seasonButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
        });
    });
    
    // Set up special effect buttons
    const effectButtons = document.querySelectorAll('[data-effect]');
    effectButtons.forEach(button => {
        button.addEventListener('click', function() {
            const effect = this.getAttribute('data-effect');
            
            // Toggle the effect and button state
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                toggleSpecialEffect(effect, false);
            } else {
                this.classList.add('active');
                toggleSpecialEffect(effect, true);
            }
        });
    });
    
    // Set up sample plant options
    const samplePlantOptions = document.querySelectorAll('#sample-plant-options .dropdown-item');
    samplePlantOptions.forEach(option => {
        option.addEventListener('click', async function(e) {
            e.preventDefault();
            const plantType = this.getAttribute('data-plant-type');
            
            try {
                const response = await fetch('/api/preset-plants', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ type: plantType })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification(data.message, 'success');
                    
                    // Reload plants after a short delay
                    setTimeout(() => {
                        window.location.reload();
                    }, 1500);
                } else {
                    showNotification(data.message || 'Failed to add sample plant', 'error');
                }
            } catch (error) {
                console.error('Error adding sample plant:', error);
                showNotification('Error adding sample plant', 'error');
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
        plant.classList.remove('animation-dancing', 'animation-bouncing', 'animation-shimmering', 'animation-rainbow');
        plant.classList.remove('effect-sparkle', 'effect-glow');
    });
    
    // Apply the new animation class based on mode
    switch (mode) {
        case 'dancing':
            plants.forEach(plant => plant.classList.add('animation-dancing'));
            showNotification('Plants are now dancing!', 'info');
            break;
        case 'bouncing':
            plants.forEach(plant => plant.classList.add('animation-bouncing'));
            showNotification('Plants are now bouncing!', 'info');
            break;
        case 'shimmering':
            plants.forEach(plant => plant.classList.add('animation-shimmering'));
            showNotification('Plants are now shimmering!', 'info');
            break;
        case 'rainbow':
            plants.forEach(plant => plant.classList.add('animation-rainbow'));
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
                plant.style.animation = `plantBounce 4s ${randomDelay}s infinite ease-in-out`;
                plant.style.filter = 'brightness(1.1) saturate(1.1)';
            });
            break;
        case 'summer':
            // Subtle wave effect for summer heat
            plants.forEach(plant => {
                const randomDelay = Math.random() * 2;
                plant.style.animation = `plantDance 7s ${randomDelay}s infinite ease-in-out`;
                plant.style.filter = 'brightness(1.2) saturate(1.3)';
            });
            break;
        case 'autumn':
            // The CSS filter handles the autumn colors
            plants.forEach(plant => {
                plant.style.filter = 'hue-rotate(-15deg) saturate(1.5) brightness(0.95)';
            });
            break;
        case 'winter':
            // Slight blue tint for winter cold
            plants.forEach(plant => {
                const randomDelay = Math.random() * 1;
                plant.style.animation = `plantShimmer 3s ${randomDelay}s infinite ease-in-out`;
                plant.style.filter = 'brightness(0.9) saturate(0.8) hue-rotate(15deg)';
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

/**
 * Set up event handlers for the effects dropdown menu
 */
function setupEffectsDropdownHandlers() {
    // Setup animation mode options
    const animationModeItems = document.querySelectorAll('[data-animation-mode]');
    animationModeItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-animation-mode');
            setAnimationMode(mode);
        });
    });
    
    // Setup seasonal theme options
    const seasonItems = document.querySelectorAll('[data-season]');
    seasonItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const season = this.getAttribute('data-season');
            setSeason(season);
        });
    });
    
    // Setup special effect options
    const effectItems = document.querySelectorAll('[data-effect]');
    let activeEffects = {};
    
    effectItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const effect = this.getAttribute('data-effect');
            
            // Toggle the effect
            if (activeEffects[effect]) {
                activeEffects[effect] = false;
                toggleSpecialEffect(effect, false);
            } else {
                activeEffects[effect] = true;
                toggleSpecialEffect(effect, true);
            }
        });
    });
}

/**
 * Initialize particle effects for the garden header
 */
function initParticles() {
    const particlesContainer = document.querySelector('.particles-container');
    if (!particlesContainer) return;
    
    // Create particles
    for (let i = 0; i < 30; i++) {
        createParticle(particlesContainer);
    }
}

/**
 * Create a single floating particle
 * @param {HTMLElement} container - The container to add the particle to
 */
function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'floating-particle';
    
    // Random size between 3px and 8px
    const size = 3 + Math.random() * 5;
    
    // Random position
    const posX = Math.random() * 100;
    const posY = Math.random() * 100;
    
    // Random opacity
    const opacity = 0.1 + Math.random() * 0.4;
    
    // Random animation duration between 15s and 40s
    const duration = 15 + Math.random() * 25;
    
    // Random delay
    const delay = Math.random() * 10;
    
    // Random color (green shades)
    const hue = 100 + Math.random() * 40; // Green hues
    const saturation = 60 + Math.random() * 40;
    const lightness = 40 + Math.random() * 30;
    
    // Apply styles
    particle.style.cssText = `
        position: absolute;
        width: ${size}px;
        height: ${size}px;
        border-radius: 50%;
        background-color: hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity});
        top: ${posY}%;
        left: ${posX}%;
        filter: blur(1px);
        box-shadow: 0 0 ${size * 2}px hsla(${hue}, ${saturation}%, ${lightness}%, ${opacity * 0.5});
        animation: float ${duration}s ${delay}s infinite ease-in-out;
        pointer-events: none;
    `;
    
    container.appendChild(particle);
}

/**
 * Update the value unit label based on the selected condition type
 */
function updateValueUnit() {
    const conditionTypeSelect = document.getElementById('condition-type');
    const valueUnitSpan = document.getElementById('value-unit');
    
    if (!conditionTypeSelect || !valueUnitSpan) return;
    
    const selectedOption = conditionTypeSelect.options[conditionTypeSelect.selectedIndex];
    if (!selectedOption || selectedOption.disabled) {
        valueUnitSpan.textContent = 'units';
        return;
    }
    
    // Get the condition type name
    const typeName = selectedOption.value;
    
    // Find the condition type in the global array
    if (typeof conditionTypes !== 'undefined' && Array.isArray(conditionTypes)) {
        const selectedType = conditionTypes.find(type => type.name === typeName);
        if (selectedType && selectedType.unit) {
            valueUnitSpan.textContent = selectedType.unit;
            return;
        }
    }
    
    // Fallback to common units based on condition name
    const unitMap = {
        'water_intake': 'ml',
        'focus_time': 'min',
        'deep_work': 'min',
        'sunlight': 'min',
        'exercise': 'min',
        'meditation': 'min',
        'reading': 'min',
        'sleep': 'hours',
        'gratitude': 'items',
        'journaling': 'min',
        'nature_time': 'min',
        'digital_detox': 'min'
    };
    
    valueUnitSpan.textContent = unitMap[typeName] || 'units';
}