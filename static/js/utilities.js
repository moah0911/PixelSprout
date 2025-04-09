// Utility functions for the digital garden

// Global notification function - empty implementation to fix errors
function showNotification(message, type = 'info') {
    // Disabled for now
    console.log(`Notification (${type}): ${message}`);
}

// Automatic water credits increase - ONLY every hour by 2 credits
document.addEventListener('DOMContentLoaded', function() {
    // Increase water credits every hour
    setInterval(function() {
        increaseWaterCredits(2); // Only increase by 2 credits per hour
    }, 60 * 60 * 1000); // 1 hour in milliseconds
    
    // No more increasing credits every minute
});

// Function to increase water credits
function increaseWaterCredits(amount = 2) {
    fetch('/api/water-credits/add', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount: amount })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            const creditDisplay = document.getElementById('water-credits-count');
            if (creditDisplay) {
                creditDisplay.textContent = data.water_credits;
                
                // Add animation class
                creditDisplay.parentElement.classList.add('credit-change');
                setTimeout(() => {
                    creditDisplay.parentElement.classList.remove('credit-change');
                }, 500);
                
                // Show notification
                showNotification(`You received ${amount} water credits!`, 'success');
            }
        }
    })
    .catch(error => {
        console.error('Error adding water credits:', error);
    });
}

// Plant growth function - different SVGs at different stages
function updatePlantGrowth(plant) {
    const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plant.id}"]`);
    if (!plantContainer) return;
    
    // Update plant SVG based on type and stage
    const plantType = plant.type;
    const stage = plant.stage;
    
    // Get new SVG representation
    let newSvg = '';
    
    // Try to get enhanced SVG first
    if (window.enhancedPlantSvgs && window.enhancedPlantSvgs[plantType] && window.enhancedPlantSvgs[plantType][stage]) {
        newSvg = window.enhancedPlantSvgs[plantType][stage];
    } 
    // Fall back to regular SVGs
    else if (window.plantSvgs && window.plantSvgs[plantType] && window.plantSvgs[plantType][stage]) {
        newSvg = window.plantSvgs[plantType][stage];
    }
    
    if (newSvg) {
        // Update SVG content
        plantContainer.innerHTML = newSvg;
        
        // Apply growing animation
        plantContainer.classList.add('plant-growing');
        
        // Show notification
        showNotification(`${plant.name} has grown to the ${getStageText(stage)} stage!`, 'success');
        
        // Remove animation class after animation completes
        setTimeout(() => {
            plantContainer.classList.remove('plant-growing');
        }, 3000);
    }
}

// Get text representation of plant stage
function getStageText(stage) {
    const stages = ['seed', 'sprout', 'growing', 'mature', 'flowering', 'withering', 'dead'];
    return stages[stage] || 'unknown';
}