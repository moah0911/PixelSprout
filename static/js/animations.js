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
    
    // Initialize cursor trail effect
    initCursorTrail();
    
    // Initialize improved rain effect
    initRainEffect();
    
    // Update unit label when condition type changes
    const conditionTypeSelect = document.getElementById('condition-type');
    if (conditionTypeSelect) {
        conditionTypeSelect.addEventListener('change', updateValueUnit);
    }
    
    // Create effect buttons if they don't exist yet
    if (!document.querySelector('.animation-buttons-container')) {
        createEffectButtons();
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
 * Initialize cursor trail effect
 * Creates a trail of particles that follow the cursor
 */
function initCursorTrail() {
    // Create a container for the cursor trail
    const trailContainer = document.createElement('div');
    trailContainer.className = 'cursor-trail-container';
    trailContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9999;
        overflow: hidden;
    `;
    document.body.appendChild(trailContainer);
    
    // Add CSS for the trail particles
    const style = document.createElement('style');
    style.textContent = `
        .cursor-trail-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            transform: translate(-50%, -50%);
            animation: fadeOut 1.5s ease-out forwards;
        }
        
        @keyframes fadeOut {
            0% { opacity: 0.8; transform: translate(-50%, -50%) scale(1); }
            100% { opacity: 0; transform: translate(-50%, -50%) scale(0); }
        }
    `;
    document.head.appendChild(style);
    
    // Variables for trail effect
    let isTrailActive = true;
    let trailType = 'leaf'; // Default trail type: 'leaf', 'sparkle', 'water'
    
    // Add mousemove event listener
    document.addEventListener('mousemove', function(e) {
        if (!isTrailActive) return;
        
        // Create a trail particle
        createTrailParticle(e.clientX, e.clientY, trailType, trailContainer);
    });
    
    // Add trail toggle button to the animation panel
    const effectsPanel = document.getElementById('animation-effects-panel');
    if (effectsPanel) {
        const trailSection = document.createElement('div');
        trailSection.className = 'mb-3';
        trailSection.innerHTML = `
            <label class="form-label">Cursor Trail</label>
            <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Cursor trail options">
                <button type="button" class="btn btn-sm btn-outline-success active" data-trail="toggle">
                    <i class="fas fa-magic me-1"></i> Toggle Trail
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-trail="leaf">
                    <i class="fas fa-leaf me-1"></i> Leaf
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-trail="sparkle">
                    <i class="fas fa-star me-1"></i> Sparkle
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-trail="water">
                    <i class="fas fa-tint me-1"></i> Water
                </button>
            </div>
        `;
        effectsPanel.appendChild(trailSection);
        
        // Add event listeners to trail buttons
        const trailButtons = document.querySelectorAll('[data-trail]');
        trailButtons.forEach(button => {
            button.addEventListener('click', function() {
                const trailOption = this.getAttribute('data-trail');
                
                if (trailOption === 'toggle') {
                    // Toggle trail on/off
                    isTrailActive = !isTrailActive;
                    this.classList.toggle('active', isTrailActive);
                    showNotification(`Cursor trail ${isTrailActive ? 'enabled' : 'disabled'}`, 'info');
                } else {
                    // Change trail type
                    trailType = trailOption;
                    
                    // Update active state for type buttons
                    trailButtons.forEach(b => {
                        if (b.getAttribute('data-trail') !== 'toggle') {
                            b.classList.remove('active');
                        }
                    });
                    this.classList.add('active');
                    
                    showNotification(`Cursor trail set to ${trailOption}`, 'info');
                }
            });
        });
    }
}

/**
 * Create a single trail particle at the specified position
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {string} type - Type of trail ('leaf', 'sparkle', 'water')
 * @param {HTMLElement} container - Container element for the particles
 */
function createTrailParticle(x, y, type, container) {
    // Create particle element
    const particle = document.createElement('div');
    particle.className = 'cursor-trail-particle';
    
    // Set particle properties based on type
    let size, color, duration, html;
    
    switch (type) {
        case 'leaf':
            size = 10 + Math.random() * 10;
            color = `hsl(${100 + Math.random() * 40}, 70%, 50%)`;
            duration = 1 + Math.random() * 0.5;
            html = `<i class="fas fa-leaf" style="color: ${color}; font-size: ${size}px;"></i>`;
            break;
            
        case 'sparkle':
            size = 8 + Math.random() * 8;
            color = `hsl(${40 + Math.random() * 20}, 100%, 70%)`;
            duration = 0.8 + Math.random() * 0.4;
            html = `<i class="fas fa-sparkles" style="color: ${color}; font-size: ${size}px;"></i>`;
            // Fallback if sparkles icon is not available
            if (!document.querySelector('.fa-sparkles')) {
                html = `<i class="fas fa-star" style="color: ${color}; font-size: ${size}px;"></i>`;
            }
            break;
            
        case 'water':
            size = 8 + Math.random() * 8;
            color = `hsl(${200 + Math.random() * 40}, 80%, 70%)`;
            duration = 1 + Math.random() * 0.5;
            html = `<i class="fas fa-tint" style="color: ${color}; font-size: ${size}px;"></i>`;
            break;
            
        default:
            size = 10 + Math.random() * 10;
            color = `hsl(${100 + Math.random() * 40}, 70%, 50%)`;
            duration = 1 + Math.random() * 0.5;
            html = `<i class="fas fa-leaf" style="color: ${color}; font-size: ${size}px;"></i>`;
    }
    
    // Set content and position
    particle.innerHTML = html;
    particle.style.left = `${x}px`;
    particle.style.top = `${y}px`;
    particle.style.animationDuration = `${duration}s`;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
        if (particle.parentNode === container) {
            container.removeChild(particle);
        }
    }, duration * 1000);
}

/**
 * Initialize improved rain effect
 * Creates a more realistic and less intrusive rain animation
 */
function initRainEffect() {
    // Create a container for the rain effect
    const rainContainer = document.createElement('div');
    rainContainer.id = 'rain-effect-container';
    rainContainer.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 9998;
        overflow: hidden;
        display: none;
    `;
    document.body.appendChild(rainContainer);
    
    // Add CSS for rain drops
    const style = document.createElement('style');
    style.textContent = `
        .rain-drop {
            position: absolute;
            background: linear-gradient(to bottom, rgba(255,255,255,0.1), rgba(150,200,255,0.6));
            width: 2px;
            height: 20px;
            border-radius: 0 0 5px 5px;
            pointer-events: none;
            animation: rain-fall linear forwards;
        }
        
        @keyframes rain-fall {
            0% { transform: translateY(-100px); opacity: 0; }
            10% { opacity: 0.7; }
            95% { opacity: 0.7; }
            100% { transform: translateY(calc(100vh + 100px)); opacity: 0; }
        }
    `;
    document.head.appendChild(style);
    
    // Add rain toggle button to the animation panel
    const effectsPanel = document.getElementById('animation-effects-panel');
    if (effectsPanel) {
        const rainSection = document.createElement('div');
        rainSection.className = 'mb-3';
        rainSection.innerHTML = `
            <label class="form-label">Weather Effects</label>
            <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Weather effects">
                <button type="button" class="btn btn-sm btn-outline-success" data-weather="rain">
                    <i class="fas fa-cloud-rain me-1"></i> Rain
                </button>
                <button type="button" class="btn btn-sm btn-outline-success" data-weather="light">
                    <i class="fas fa-sun me-1"></i> Sunlight
                </button>
            </div>
        `;
        effectsPanel.appendChild(rainSection);
        
        // Add event listeners to weather buttons
        const weatherButtons = document.querySelectorAll('[data-weather]');
        weatherButtons.forEach(button => {
            button.addEventListener('click', function() {
                const weatherType = this.getAttribute('data-weather');
                
                // Toggle active state
                const isActive = this.classList.toggle('active');
                
                if (weatherType === 'rain') {
                    toggleRainEffect(isActive);
                } else if (weatherType === 'light') {
                    toggleSunlightEffect(isActive);
                }
            });
        });
    }
}

/**
 * Toggle the rain effect on/off
 * @param {boolean} active - Whether to enable or disable the effect
 */
function toggleRainEffect(active) {
    const rainContainer = document.getElementById('rain-effect-container');
    if (!rainContainer) return;
    
    if (active) {
        // Show container and start rain
        rainContainer.style.display = 'block';
        startRain();
        showNotification('Rain effect enabled', 'info');
    } else {
        // Hide container and stop rain
        rainContainer.style.display = 'none';
        stopRain();
        showNotification('Rain effect disabled', 'info');
    }
}

// Rain animation variables
let rainInterval;
let isRaining = false;

/**
 * Start the rain animation
 */
function startRain() {
    if (isRaining) return;
    isRaining = true;
    
    const rainContainer = document.getElementById('rain-effect-container');
    if (!rainContainer) return;
    
    // Clear any existing drops
    rainContainer.innerHTML = '';
    
    // Create initial drops
    for (let i = 0; i < 30; i++) {
        createRainDrop(rainContainer);
    }
    
    // Continue creating drops at interval
    rainInterval = setInterval(() => {
        if (document.hidden) return; // Don't create drops when tab is not visible
        
        for (let i = 0; i < 3; i++) {
            createRainDrop(rainContainer);
        }
    }, 100);
}

/**
 * Stop the rain animation
 */
function stopRain() {
    isRaining = false;
    clearInterval(rainInterval);
    
    const rainContainer = document.getElementById('rain-effect-container');
    if (rainContainer) {
        // Fade out existing drops
        const drops = rainContainer.querySelectorAll('.rain-drop');
        drops.forEach(drop => {
            drop.style.opacity = '0';
            setTimeout(() => {
                if (drop.parentNode === rainContainer) {
                    rainContainer.removeChild(drop);
                }
            }, 1000);
        });
    }
}

/**
 * Create a single rain drop
 * @param {HTMLElement} container - Container for the rain drops
 */
function createRainDrop(container) {
    const drop = document.createElement('div');
    drop.className = 'rain-drop';
    
    // Random properties
    const x = Math.random() * 100; // Position across screen (%)
    const size = 1 + Math.random() * 2; // Width
    const length = 15 + Math.random() * 25; // Height
    const duration = 0.8 + Math.random() * 0.7; // Animation duration
    const delay = Math.random() * 0.5; // Animation delay
    const opacity = 0.3 + Math.random() * 0.4; // Opacity
    
    // Apply styles
    drop.style.cssText = `
        left: ${x}%;
        width: ${size}px;
        height: ${length}px;
        opacity: ${opacity};
        animation-duration: ${duration}s;
        animation-delay: ${delay}s;
    `;
    
    // Add to container
    container.appendChild(drop);
    
    // Remove after animation completes
    setTimeout(() => {
        if (drop.parentNode === container) {
            container.removeChild(drop);
        }
    }, (duration + delay) * 1000);
}

/**
 * Toggle the sunlight effect on/off
 * @param {boolean} active - Whether to enable or disable the effect
 */
function toggleSunlightEffect(active) {
    const gardenContainer = document.getElementById('garden-container');
    if (!gardenContainer) return;
    
    if (active) {
        // Add sunlight class
        gardenContainer.classList.add('sunlight-effect');
        showNotification('Sunlight effect enabled', 'info');
        
        // Add sunlight particles
        createSunlightParticles(gardenContainer);
    } else {
        // Remove sunlight class
        gardenContainer.classList.remove('sunlight-effect');
        showNotification('Sunlight effect disabled', 'info');
        
        // Remove sunlight particles
        const particles = document.querySelectorAll('.sunlight-particle');
        particles.forEach(particle => {
            particle.remove();
        });
    }
}

/**
 * Create sunlight particles
 * @param {HTMLElement} container - Container for the particles
 */
function createSunlightParticles(container) {
    // Add CSS for sunlight effect if not already added
    if (!document.getElementById('sunlight-effect-style')) {
        const style = document.createElement('style');
        style.id = 'sunlight-effect-style';
        style.textContent = `
            .sunlight-effect {
                position: relative;
                overflow: hidden;
            }
            
            .sunlight-effect::before {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(circle at top right, 
                    rgba(255, 255, 200, 0.2), 
                    rgba(255, 255, 200, 0) 70%);
                pointer-events: none;
                z-index: 1;
            }
            
            .sunlight-particle {
                position: absolute;
                background-color: rgba(255, 255, 200, 0.6);
                border-radius: 50%;
                filter: blur(1px);
                pointer-events: none;
                z-index: 2;
                animation: sunlight-float linear infinite;
            }
            
            @keyframes sunlight-float {
                0% { transform: translateY(0) rotate(0deg); opacity: 0; }
                10% { opacity: 0.8; }
                90% { opacity: 0.8; }
                100% { transform: translateY(-100px) rotate(360deg); opacity: 0; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Create sunlight particles
    for (let i = 0; i < 20; i++) {
        createSunlightParticle(container);
    }
    
    // Continue creating particles
    const sunlightInterval = setInterval(() => {
        if (!container.classList.contains('sunlight-effect')) {
            clearInterval(sunlightInterval);
            return;
        }
        
        if (document.hidden) return; // Don't create particles when tab is not visible
        
        createSunlightParticle(container);
    }, 500);
}

/**
 * Create a single sunlight particle
 * @param {HTMLElement} container - Container for the particles
 */
function createSunlightParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'sunlight-particle';
    
    // Random properties
    const size = 3 + Math.random() * 5;
    const x = 70 + Math.random() * 30; // Right side of screen
    const y = Math.random() * 100;
    const duration = 5 + Math.random() * 10;
    
    // Apply styles
    particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        top: ${y}%;
        right: ${x - 100}%;
        animation-duration: ${duration}s;
    `;
    
    // Add to container
    container.appendChild(particle);
    
    // Remove after animation completes
    setTimeout(() => {
        if (particle.parentNode === container) {
            container.removeChild(particle);
        }
    }, duration * 1000);
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