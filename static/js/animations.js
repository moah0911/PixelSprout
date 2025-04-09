// Plant animations and water credits system
document.addEventListener('DOMContentLoaded', function() {
    // Initialize water credits system
    initWaterCredits();
    
    // Set up animation events for plants
    setupPlantAnimations();
});

// Water Credits System
let waterCredits = 20; // Default starting credits

function initWaterCredits() {
    // Display water credits on page load
    updateWaterCreditsDisplay();
    
    // Add water credits periodically (e.g., hourly in a real app)
    // For demo, we'll add credits every minute
    setInterval(function() {
        addWaterCredits(1);
    }, 60000);
    
    // Add event listener for the water credits display in the profile section
    const profileSection = document.querySelector('.profile-section');
    if (profileSection) {
        const creditsElement = document.createElement('div');
        creditsElement.className = 'water-credits';
        creditsElement.innerHTML = '<i class="fas fa-tint"></i> <span id="water-credits-count">0</span>';
        profileSection.insertBefore(creditsElement, profileSection.firstChild);
        updateWaterCreditsDisplay();
    }
}

function updateWaterCreditsDisplay() {
    const creditsElement = document.getElementById('water-credits-count');
    if (creditsElement) {
        creditsElement.textContent = waterCredits;
        creditsElement.parentElement.classList.add('credit-change');
        setTimeout(() => {
            creditsElement.parentElement.classList.remove('credit-change');
        }, 500);
    }
}

function addWaterCredits(amount) {
    waterCredits += amount;
    updateWaterCreditsDisplay();
    
    // Show notification
    showNotification(`You received ${amount} water credits!`, 'info');
}

function useWaterCredits(amount) {
    if (waterCredits >= amount) {
        waterCredits -= amount;
        updateWaterCreditsDisplay();
        return true;
    } else {
        showNotification('Not enough water credits!', 'error');
        return false;
    }
}

// Plant Animation Functions
function setupPlantAnimations() {
    // Set up click events for plant containers after they are created
    document.addEventListener('click', function(event) {
        // Check if clicked element is a plant or its container
        const plantElement = event.target.closest('.plant-container');
        if (plantElement) {
            // Toggle dancing animation on double click
            if (event.detail === 2) { // Double click
                togglePlantDance(plantElement);
            }
        }
    });
    
    // Set up water button click
    document.addEventListener('click', function(event) {
        if (event.target.classList.contains('water-plant-btn')) {
            const plantId = event.target.getAttribute('data-plant-id');
            waterPlant(plantId);
        }
    });
}

function togglePlantDance(plantElement) {
    if (plantElement.classList.contains('plant-dancing')) {
        plantElement.classList.remove('plant-dancing');
    } else {
        plantElement.classList.add('plant-dancing');
        
        // Auto stop dancing after 5 seconds
        setTimeout(() => {
            plantElement.classList.remove('plant-dancing');
        }, 5000);
    }
}

function waterPlant(plantId) {
    // Use water credits to water the plant
    if (useWaterCredits(1)) {
        // Find the plant element
        const plantElement = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
        if (plantElement) {
            // Add watering effect
            addWateringEffect(plantElement);
            
            // Log water condition
            logCondition('water_intake', 1);
        }
    }
}

function addWateringEffect(plantElement) {
    // Create watering effect container if it doesn't exist
    let wateringEffect = plantElement.querySelector('.watering-effect');
    if (!wateringEffect) {
        wateringEffect = document.createElement('div');
        wateringEffect.className = 'watering-effect';
        
        // Add water drops
        for (let i = 0; i < 3; i++) {
            const waterDrop = document.createElement('div');
            waterDrop.className = 'water-drop';
            wateringEffect.appendChild(waterDrop);
        }
        
        plantElement.appendChild(wateringEffect);
    }
    
    // Remove the watering effect after animation completes
    setTimeout(() => {
        if (wateringEffect && wateringEffect.parentNode === plantElement) {
            plantElement.removeChild(wateringEffect);
        }
    }, 2000);
}

// Helper function to generate random number within range
function randomInRange(min, max) {
    return Math.random() * (max - min) + min;
}

// Function to make plants sway occasionally
function startRandomPlantMovements() {
    setInterval(() => {
        const plants = document.querySelectorAll('.plant-container');
        // Randomly select a plant to animate
        if (plants.length > 0) {
            const randomIndex = Math.floor(Math.random() * plants.length);
            const randomPlant = plants[randomIndex];
            
            // Make it dance briefly
            randomPlant.classList.add('plant-dancing');
            setTimeout(() => {
                randomPlant.classList.remove('plant-dancing');
            }, randomInRange(2000, 3000));
        }
    }, randomInRange(5000, 15000)); // Random interval between animations
}

// Initialize random plant movements once plants are loaded
window.addEventListener('load', function() {
    // Wait a bit to make sure plants are rendered
    setTimeout(startRandomPlantMovements, 2000);
});