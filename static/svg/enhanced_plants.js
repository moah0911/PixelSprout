// Enhanced Plant SVG representations with animation attributes
window.enhancedPlantSvgs = {
    // Succulent plants with animation classes
    succulent: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-seed">
            <circle cx="50" cy="60" r="10" fill="#8D6E63" />
            <line x1="50" y1="50" x2="50" y2="30" stroke="#A5D6A7" stroke-width="2" class="plant-stem"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-sprout">
            <circle cx="50" cy="70" r="15" fill="#8D6E63" />
            <path d="M 50 70 L 50 45 C 50 35, 55 35, 55 45 C 55 35, 60 35, 60 45 L 60 55" fill="none" stroke="#81C784" stroke-width="3" class="plant-leaf left-leaf" />
            <path d="M 50 70 L 50 50 C 50 40, 45 40, 45 50 C 45 40, 40 40, 40 50 L 40 55" fill="none" stroke="#81C784" stroke-width="3" class="plant-leaf right-leaf" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-growing">
            <circle cx="50" cy="75" r="18" fill="#8D6E63" />
            <path d="M 50 75 L 50 40 C 50 30, 60 30, 60 40 C 60 30, 70 30, 70 40 L 70 55" fill="none" stroke="#66BB6A" stroke-width="4" class="plant-leaf left-leaf" />
            <path d="M 50 75 L 50 45 C 50 35, 40 35, 40 45 C 40 35, 30 35, 30 45 L 30 60" fill="none" stroke="#66BB6A" stroke-width="4" class="plant-leaf right-leaf" />
            <circle cx="70" cy="50" r="5" fill="#C5E1A5" class="plant-bud" />
            <circle cx="30" cy="55" r="5" fill="#C5E1A5" class="plant-bud" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-mature">
            <circle cx="50" cy="80" r="20" fill="#795548" />
            <path d="M 50 80 L 50 30 C 50 20, 65 20, 65 30 C 65 20, 80 20, 80 30 L 80 50" fill="none" stroke="#43A047" stroke-width="5" class="plant-leaf left-leaf" />
            <path d="M 50 80 L 50 35 C 50 25, 35 25, 35 35 C 35 25, 20 25, 20 35 L 20 55" fill="none" stroke="#43A047" stroke-width="5" class="plant-leaf right-leaf" />
            <circle cx="80" cy="45" r="8" fill="#AED581" class="plant-bud" />
            <circle cx="20" cy="50" r="8" fill="#AED581" class="plant-bud" />
            <circle cx="50" cy="40" r="8" fill="#AED581" class="plant-bud" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-flowering">
            <circle cx="50" cy="85" r="15" fill="#5D4037" />
            <path d="M 50 85 L 50 25 C 50 15, 65 15, 65 25 C 65 15, 80 15, 80 25 L 80 45" fill="none" stroke="#2E7D32" stroke-width="5" class="plant-leaf left-leaf" />
            <path d="M 50 85 L 50 30 C 50 20, 35 20, 35 30 C 35 20, 20 20, 20 30 L 20 50" fill="none" stroke="#2E7D32" stroke-width="5" class="plant-leaf right-leaf" />
            <circle cx="80" cy="40" r="10" fill="#7CB342" class="plant-bud" />
            <circle cx="20" cy="45" r="10" fill="#7CB342" class="plant-bud" />
            <circle cx="50" cy="35" r="10" fill="#7CB342" class="plant-bud" />
            <circle cx="65" cy="25" r="6" fill="#E57373" class="plant-flower" />
            <circle cx="35" cy="30" r="6" fill="#E57373" class="plant-flower" />
            <circle cx="50" cy="20" r="8" fill="#EF5350" class="plant-flower" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-withering">
            <circle cx="50" cy="85" r="15" fill="#4E342E" />
            <path d="M 50 85 L 50 25 C 50 15, 65 15, 65 25 C 65 15, 80 15, 80 25 L 80 45" fill="none" stroke="#9E9D24" stroke-width="4" stroke-dasharray="5,2" class="plant-leaf left-leaf" />
            <path d="M 50 85 L 50 30 C 50 20, 35 20, 35 30 C 35 20, 20 20, 20 30 L 20 50" fill="none" stroke="#9E9D24" stroke-width="4" stroke-dasharray="5,2" class="plant-leaf right-leaf" />
            <circle cx="80" cy="40" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" class="plant-bud" />
            <circle cx="20" cy="45" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" class="plant-bud" />
            <circle cx="50" cy="35" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" class="plant-bud" />
            <circle cx="65" cy="25" r="5" fill="#FFAB91" stroke="#E64A19" stroke-width="1" class="plant-flower" />
            <circle cx="35" cy="30" r="5" fill="#FFAB91" stroke="#E64A19" stroke-width="1" class="plant-flower" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-dead">
            <circle cx="50" cy="85" r="15" fill="#3E2723" />
            <path d="M 50 85 L 50 35 C 50 30, 55 25, 60 30 L 70 25" fill="none" stroke="#827717" stroke-width="3" stroke-dasharray="4,3" class="plant-leaf" />
            <path d="M 50 85 L 50 40 C 50 35, 45 30, 40 35 L 30 30" fill="none" stroke="#827717" stroke-width="3" stroke-dasharray="4,3" class="plant-leaf" />
            <circle cx="70" cy="25" r="6" fill="#A1887F" stroke="#3E2723" stroke-width="1" />
            <circle cx="30" cy="30" r="6" fill="#A1887F" stroke="#3E2723" stroke-width="1" />
        </svg>`
    },
    
    // Vine plant special animation effects
    vine: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-seed">
            <ellipse cx="50" cy="75" rx="8" ry="5" fill="#8D6E63" />
            <line x1="50" y1="70" x2="50" y2="65" stroke="#A5D6A7" stroke-width="1" class="vine-sprout"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-sprout">
            <ellipse cx="50" cy="80" rx="10" ry="5" fill="#8D6E63" />
            <path d="M 50 80 C 50 75, 50 70, 55 65 C 60 60, 55 55, 50 50 C 45 45, 50 40, 55 35" fill="none" stroke="#7CB342" stroke-width="2" class="vine-stem" />
            <ellipse cx="55" cy="35" rx="5" ry="3" fill="#AED581" transform="rotate(30, 55, 35)" class="vine-leaf" />
            <ellipse cx="50" cy="50" rx="5" ry="3" fill="#AED581" transform="rotate(-30, 50, 50)" class="vine-leaf" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-growing">
            <ellipse cx="50" cy="85" rx="12" ry="6" fill="#795548" />
            <path d="M 50 85 C 50 80, 50 75, 60 70 C 70 65, 65 60, 55 55 C 45 50, 40 45, 50 40 C 60 35, 65 30, 60 25" fill="none" stroke="#558B2F" stroke-width="3" class="vine-stem" />
            <ellipse cx="60" cy="25" rx="6" ry="4" fill="#8BC34A" transform="rotate(30, 60, 25)" class="vine-leaf" />
            <ellipse cx="50" cy="40" rx="6" ry="4" fill="#8BC34A" transform="rotate(-30, 50, 40)" class="vine-leaf" />
            <ellipse cx="55" cy="55" rx="6" ry="4" fill="#8BC34A" transform="rotate(30, 55, 55)" class="vine-leaf" />
            <ellipse cx="60" cy="70" rx="6" ry="4" fill="#8BC34A" transform="rotate(-15, 60, 70)" class="vine-leaf" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-mature">
            <ellipse cx="50" cy="85" rx="15" ry="7" fill="#5D4037" />
            <path d="M 50 85 C 50 80, 45 75, 55 70 C 65 65, 70 60, 60 55 C 50 50, 45 45, 55 40 C 65 35, 70 30, 60 25 C 50 20, 45 15, 50 10" fill="none" stroke="#33691E" stroke-width="3" class="vine-stem" />
            <ellipse cx="50" cy="10" rx="7" ry="5" fill="#66BB6A" transform="rotate(0, 50, 10)" class="vine-leaf" />
            <ellipse cx="60" cy="25" rx="7" ry="5" fill="#66BB6A" transform="rotate(30, 60, 25)" class="vine-leaf" />
            <ellipse cx="55" cy="40" rx="7" ry="5" fill="#66BB6A" transform="rotate(-30, 55, 40)" class="vine-leaf" />
            <ellipse cx="60" cy="55" rx="7" ry="5" fill="#66BB6A" transform="rotate(30, 60, 55)" class="vine-leaf" />
            <ellipse cx="55" cy="70" rx="7" ry="5" fill="#66BB6A" transform="rotate(-15, 55, 70)" class="vine-leaf" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-flowering">
            <ellipse cx="50" cy="90" rx="18" ry="7" fill="#4E342E" />
            <path d="M 50 90 C 50 85, 40 80, 50 75 C 60 70, 70 65, 60 60 C 50 55, 40 50, 50 45 C 60 40, 70 35, 60 30 C 50 25, 40 20, 50 15 C 60 10, 55 5, 50 5" fill="none" stroke="#2E7D32" stroke-width="3" class="vine-stem" />
            <ellipse cx="50" cy="5" rx="8" ry="5" fill="#43A047" transform="rotate(0, 50, 5)" class="vine-leaf" />
            <ellipse cx="60" cy="30" rx="8" ry="5" fill="#43A047" transform="rotate(30, 60, 30)" class="vine-leaf" />
            <ellipse cx="50" cy="45" rx="8" ry="5" fill="#43A047" transform="rotate(-30, 50, 45)" class="vine-leaf" />
            <ellipse cx="60" cy="60" rx="8" ry="5" fill="#43A047" transform="rotate(30, 60, 60)" class="vine-leaf" />
            <ellipse cx="50" cy="75" rx="8" ry="5" fill="#43A047" transform="rotate(-15, 50, 75)" class="vine-leaf" />
            <circle cx="50" cy="5" r="5" fill="#BA68C8" class="vine-flower" />
            <circle cx="60" cy="30" r="4" fill="#BA68C8" class="vine-flower" />
            <circle cx="50" cy="45" r="4" fill="#BA68C8" class="vine-flower" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-withering">
            <ellipse cx="50" cy="90" rx="18" ry="7" fill="#3E2723" />
            <path d="M 50 90 C 50 85, 40 80, 50 75 C 60 70, 70 65, 60 60 C 50 55, 40 50, 50 45 C 60 40, 70 35, 60 30 C 50 25, 40 20, 50 15" fill="none" stroke="#827717" stroke-width="2" stroke-dasharray="5,2" class="vine-stem" />
            <ellipse cx="50" cy="15" rx="7" ry="4" fill="#AEB853" stroke="#827717" stroke-width="1" transform="rotate(0, 50, 15)" class="vine-leaf" />
            <ellipse cx="60" cy="30" rx="7" ry="4" fill="#AEB853" stroke="#827717" stroke-width="1" transform="rotate(30, 60, 30)" class="vine-leaf" />
            <ellipse cx="50" cy="45" rx="7" ry="4" fill="#AEB853" stroke="#827717" stroke-width="1" transform="rotate(-30, 50, 45)" class="vine-leaf" />
            <ellipse cx="60" cy="60" rx="7" ry="4" fill="#AEB853" stroke="#827717" stroke-width="1" transform="rotate(30, 60, 60)" class="vine-leaf" />
            <ellipse cx="50" cy="75" rx="7" ry="4" fill="#AEB853" stroke="#827717" stroke-width="1" transform="rotate(-15, 50, 75)" class="vine-leaf" />
            <circle cx="50" cy="15" r="4" fill="#CE93D8" stroke="#8E24AA" stroke-width="1" class="vine-flower" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80" class="plant-dead">
            <ellipse cx="50" cy="90" rx="15" ry="6" fill="#3E2723" />
            <path d="M 50 90 C 50 85, 45 80, 55 75 C 65 70, 60 65, 50 60 C 40 55, 45 50, 55 45" fill="none" stroke="#795548" stroke-width="2" stroke-dasharray="4,3" class="vine-stem" />
            <ellipse cx="55" cy="45" rx="6" ry="3" fill="#A1887F" stroke="#3E2723" stroke-width="1" transform="rotate(30, 55, 45)" class="vine-leaf" />
            <ellipse cx="50" cy="60" rx="6" ry="3" fill="#A1887F" stroke="#3E2723" stroke-width="1" transform="rotate(-30, 50, 60)" class="vine-leaf" />
            <ellipse cx="55" cy="75" rx="6" ry="3" fill="#A1887F" stroke="#3E2723" stroke-width="1" transform="rotate(0, 55, 75)" class="vine-leaf" />
        </svg>`
    },
    
    // Add more special dancing animations for all other plant types
    // These will inherit from the original types but with enhanced animation classes
};

// Enhanced Plant Creation
function createEnhancedPlant(type, stage, name, health) {
    const plantType = type || 'succulent';
    const plantStage = stage || 0;
    
    // Get svg from enhanced svgs if available, or fall back to original svgs
    let plantSvg = '';
    if (window.enhancedPlantSvgs && window.enhancedPlantSvgs[plantType] && window.enhancedPlantSvgs[plantType][plantStage]) {
        plantSvg = window.enhancedPlantSvgs[plantType][plantStage];
    } else if (window.plantSvgs && window.plantSvgs[plantType] && window.plantSvgs[plantType][plantStage]) {
        plantSvg = window.plantSvgs[plantType][plantStage];
    } else {
        // Default to succulent seed if nothing else is available
        plantSvg = window.plantSvgs.succulent[0];
    }
    
    // Add health-based classes
    let healthClass = '';
    if (health > 75) {
        healthClass = 'plant-healthy';
    } else if (health < 30) {
        healthClass = 'plant-unhealthy';
    }
    
    // Create plant container with various interactive elements
    const container = document.createElement('div');
    container.className = `plant-container ${healthClass}`;
    container.innerHTML = plantSvg;
    
    // Add water drop button
    const waterButton = document.createElement('button');
    waterButton.className = 'water-plant-btn';
    waterButton.innerHTML = '💧';
    waterButton.setAttribute('title', 'Water this plant (costs 1 water credit)');
    waterButton.setAttribute('data-plant-id', name);
    
    // Add plant name label
    const nameLabel = document.createElement('div');
    nameLabel.className = 'plant-name';
    nameLabel.textContent = name;
    
    // Add health bar
    const healthBar = document.createElement('div');
    healthBar.className = 'plant-health-bar';
    const healthFill = document.createElement('div');
    healthFill.className = 'plant-health-fill';
    healthFill.style.width = `${health}%`;
    healthBar.appendChild(healthFill);
    
    // Append all elements to container
    container.appendChild(waterButton);
    container.appendChild(nameLabel);
    container.appendChild(healthBar);
    
    return container;
}

// Add pre-defined plants
function addPresetPlants(userId) {
    // Define preset plants
    const presetPlants = [
        { name: "Sunflower", type: PlantType.FLOWER, stage: PlantStage.MATURE, health: 95 },
        { name: "Ivy", type: PlantType.VINE, stage: PlantStage.GROWING, health: 80 },
        { name: "Cactus", type: PlantType.SUCCULENT, stage: PlantStage.FLOWERING, health: 100 },
        { name: "Basil", type: PlantType.HERB, stage: PlantStage.SPROUT, health: 75 },
        { name: "Bonsai", type: PlantType.TREE, stage: PlantStage.MATURE, health: 90 }
    ];
    
    // Create plants via API
    presetPlants.forEach(plant => {
        const plantData = {
            name: plant.name,
            type: plant.type.value
        };
        
        fetch('/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(plantData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                console.log(`Created preset plant: ${plant.name}`);
                
                // Update plant stage and health to match preset values
                // Note: In a real app, you'd have an API endpoint for this
                // For now, we'll rely on the frontend to show the preset appearance
            }
        })
        .catch(error => {
            console.error('Error creating preset plant:', error);
        });
    });
}

// Initialize animation system
document.addEventListener('DOMContentLoaded', function() {
    // Add CSS animation classes for plants
    const style = document.createElement('style');
    style.textContent = `
        .vine-stem {
            animation: vineSway 8s ease-in-out infinite;
        }
        
        .vine-leaf {
            animation: leafRustle 5s ease-in-out infinite;
        }
        
        .vine-flower {
            animation: flowerBob 4s ease infinite;
        }
        
        .plant-flower {
            animation: flowerPulse 3s ease infinite;
        }
        
        .plant-growing .plant-leaf {
            animation: leafGrow 10s ease-out;
        }
        
        .plant-seed {
            animation: seedPulse 2s ease infinite;
        }
        
        @keyframes vineSway {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            75% { transform: rotate(-2deg); }
        }
        
        @keyframes leafRustle {
            0%, 100% { transform: scale(1) rotate(0deg); }
            25% { transform: scale(1.05) rotate(2deg); }
            75% { transform: scale(0.95) rotate(-2deg); }
        }
        
        @keyframes flowerBob {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-2px); }
        }
        
        @keyframes flowerPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
        }
        
        @keyframes leafGrow {
            0% { stroke-dasharray: 0, 100; }
            100% { stroke-dasharray: 100, 0; }
        }
        
        @keyframes seedPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
    `;
    document.head.appendChild(style);
});