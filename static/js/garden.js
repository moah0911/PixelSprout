document.addEventListener('DOMContentLoaded', function() {
    // Garden variables
    let plants = [];
    let selectedPlant = null;
    let waterCredits = 20; // Default water credits
    
    // Initialize garden
    initGarden();
    
    // Event listeners
    document.getElementById('add-plant-form').addEventListener('submit', handleAddPlant);
    document.getElementById('garden-container').addEventListener('click', handlePlantClick);
    
    // Functions
    async function initGarden() {
        // Fetch plant types for the select dropdown
        await fetchPlantTypes();
        
        // Fetch water credits
        await fetchWaterCredits();
        
        // Fetch and display plants
        await fetchPlants();
        
        // Initialize plant details panel
        updatePlantDetailsPanel();
    }
    
    // Fetch water credits
    async function fetchWaterCredits() {
        try {
            const response = await fetch('/api/water-credits');
            const data = await response.json();
            
            if (data.success) {
                waterCredits = data.water_credits;
                updateWaterCreditsDisplay();
            }
        } catch (error) {
            console.error('Error fetching water credits:', error);
        }
    }
    
    // Update water credits display
    function updateWaterCreditsDisplay() {
        const creditsDisplay = document.getElementById('water-credits-count');
        if (creditsDisplay) {
            creditsDisplay.textContent = waterCredits;
        }
    }
    
    async function fetchPlantTypes() {
        try {
            const response = await fetch('/api/plant-types');
            const data = await response.json();
            
            if (data.success) {
                const plantTypeSelect = document.getElementById('plant-type');
                plantTypeSelect.innerHTML = '';
                
                data.plant_types.forEach(type => {
                    const option = document.createElement('option');
                    option.value = type.value;
                    option.textContent = type.name.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
                    plantTypeSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error fetching plant types:', error);
            showNotification('Failed to load plant types', 'error');
        }
    }
    
    async function fetchPlants() {
        try {
            const response = await fetch('/api/plants');
            const data = await response.json();
            
            if (data.success) {
                plants = data.plants;
                renderGarden();
            }
        } catch (error) {
            console.error('Error fetching plants:', error);
            showNotification('Failed to load garden', 'error');
        }
    }
    
    function renderGarden() {
        const gardenContainer = document.getElementById('garden-container');
        gardenContainer.innerHTML = '';
        
        if (plants.length === 0) {
            // Show empty garden state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-garden-state text-center p-5';
            emptyState.innerHTML = `
                <div class="mb-4">
                    <i class="fas fa-seedling fa-4x text-muted"></i>
                </div>
                <h3>Your garden is empty</h3>
                <p class="text-muted">Start by adding your first plant!</p>
            `;
            gardenContainer.appendChild(emptyState);
            return;
        }
        
        // Create plant grid
        const gardenGrid = document.createElement('div');
        gardenGrid.className = 'row g-4';
        
        plants.forEach(plant => {
            const plantElement = createPlantElement(plant);
            gardenGrid.appendChild(plantElement);
        });
        
        gardenContainer.appendChild(gardenGrid);
    }
    
    function createPlantElement(plant) {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6';
        
        const card = document.createElement('div');
        card.className = `card plant-card ${selectedPlant && selectedPlant.id === plant.id ? 'selected' : ''}`;
        card.dataset.plantId = plant.id;
        
        // Calculate health class
        let healthClass = 'bg-success';
        if (plant.health < 75) healthClass = 'bg-info';
        if (plant.health < 50) healthClass = 'bg-warning';
        if (plant.health < 25) healthClass = 'bg-danger';
        
        // Create plant container for animations
        const plantContainer = document.createElement('div');
        plantContainer.className = 'plant-container';
        plantContainer.dataset.plantId = plant.id;
        
        // Add health-based classes
        if (plant.health > 75) {
            plantContainer.classList.add('plant-healthy');
        } else if (plant.health < 30) {
            plantContainer.classList.add('plant-unhealthy');
        }
        
        // Add plant SVG to container
        plantContainer.innerHTML = getPlantSvg(plant.type, plant.stage);
        
        // Add water button
        const waterButton = document.createElement('button');
        waterButton.className = 'water-plant-btn btn btn-sm btn-info mt-2';
        waterButton.innerHTML = '<i class="fas fa-tint"></i> Water';
        waterButton.setAttribute('data-plant-id', plant.id);
        waterButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent plant selection
            waterPlant(plant.id);
        });
        
        // Assemble the card
        card.innerHTML = `
            <div class="card-body text-center">
                <div class="plant-visual mb-3"></div>
                <h5 class="card-title">${plant.name}</h5>
                <div class="progress mb-2" style="height: 10px;">
                    <div class="progress-bar ${healthClass}" role="progressbar" style="width: ${plant.health}%;" 
                         aria-valuenow="${plant.health}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
                <div class="progress" style="height: 5px;">
                    <div class="progress-bar bg-info" role="progressbar" style="width: ${plant.progress}%;" 
                         aria-valuenow="${plant.progress}" aria-valuemin="0" aria-valuemax="100">
                    </div>
                </div>
                <div class="mt-2 text-muted small">
                    Health: ${Math.round(plant.health)}% | Growth: ${Math.round(plant.progress)}%
                </div>
            </div>
        `;
        
        // Insert plant container and water button
        const visualContainer = card.querySelector('.plant-visual');
        visualContainer.appendChild(plantContainer);
        card.querySelector('.card-body').appendChild(waterButton);
        
        col.appendChild(card);
        return col;
    }
    
    function getPlantSvg(type, stage) {
        // Try to get enhanced SVG first
        if (window.enhancedPlantSvgs && window.enhancedPlantSvgs[type] && window.enhancedPlantSvgs[type][stage]) {
            return window.enhancedPlantSvgs[type][stage];
        }
        
        // Fall back to regular SVGs
        const plantSvgs = window.plantSvgs || {};
        const typeSvgs = plantSvgs[type] || plantSvgs.succulent;
        
        // If we have a specific SVG for this stage, use it
        if (typeSvgs && typeSvgs[stage]) {
            return typeSvgs[stage];
        }
        
        // Fallback to a generic plant representation
        return `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="${20 + stage * 5}" fill="${getColorForPlantType(type)}" />
        </svg>`;
    }
    
    // Water plant function
    async function waterPlant(plantId) {
        try {
            const response = await fetch(`/api/water-plant/${plantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update water credits
                waterCredits = data.water_credits;
                updateWaterCreditsDisplay();
                
                // Update plant data
                const plant = plants.find(p => p.id == plantId);
                if (plant) {
                    Object.assign(plant, data.plant);
                }
                
                // Show watering effect
                const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
                if (plantContainer) {
                    // Add watering animation
                    const wateringEffect = document.createElement('div');
                    wateringEffect.className = 'watering-effect';
                    
                    // Add water drops
                    for (let i = 0; i < 3; i++) {
                        const waterDrop = document.createElement('div');
                        waterDrop.className = 'water-drop';
                        wateringEffect.appendChild(waterDrop);
                    }
                    
                    plantContainer.appendChild(wateringEffect);
                    
                    // Make plant dance briefly
                    plantContainer.classList.add('plant-dancing');
                    
                    // Remove effects after animation completes
                    setTimeout(() => {
                        if (wateringEffect && wateringEffect.parentNode === plantContainer) {
                            plantContainer.removeChild(wateringEffect);
                        }
                        plantContainer.classList.remove('plant-dancing');
                    }, 2000);
                }
                
                // Update UI
                renderGarden();
                if (selectedPlant && selectedPlant.id == plantId) {
                    updatePlantDetailsPanel();
                }
                
                showNotification(data.message, 'success');
            } else {
                showNotification(data.message || 'Failed to water plant', 'error');
            }
        } catch (error) {
            console.error('Error watering plant:', error);
            showNotification('Error watering plant', 'error');
        }
    }
    
    function getColorForPlantType(type) {
        // Return a color based on plant type
        const colors = {
            'succulent': '#7CB342',
            'flower': '#EC407A',
            'tree': '#5D4037',
            'herb': '#66BB6A',
            'vine': '#8BC34A'
        };
        
        return colors[type] || '#8BC34A';
    }
    
    async function handleAddPlant(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('plant-name');
        const typeSelect = document.getElementById('plant-type');
        
        const name = nameInput.value.trim();
        const type = typeSelect.value;
        
        if (!name) {
            showNotification('Please enter a plant name', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/plants', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, type })
            });
            
            const data = await response.json();
            
            if (data.success) {
                nameInput.value = '';
                await fetchPlants();
                showNotification(`Added ${name} to your garden!`, 'success');
                
                // Close modal if it exists
                const modal = bootstrap.Modal.getInstance(document.getElementById('add-plant-modal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                showNotification(data.message || 'Failed to add plant', 'error');
            }
        } catch (error) {
            console.error('Error adding plant:', error);
            showNotification('Failed to add plant', 'error');
        }
    }
    
    function handlePlantClick(event) {
        const plantCard = event.target.closest('.plant-card');
        if (!plantCard) return;
        
        const plantId = plantCard.dataset.plantId;
        
        // Find the selected plant
        selectedPlant = plants.find(p => p.id == plantId);
        
        // Update UI to show selected plant
        document.querySelectorAll('.plant-card').forEach(card => {
            card.classList.remove('selected');
        });
        plantCard.classList.add('selected');
        
        // Update plant details panel
        updatePlantDetailsPanel();
    }
    
    function updatePlantDetailsPanel() {
        const detailsPanel = document.getElementById('plant-details-panel');
        
        if (!selectedPlant) {
            detailsPanel.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">Select a plant to view details</p>
                </div>
            `;
            return;
        }
        
        // Format dates
        const createdDate = new Date(selectedPlant.created_at);
        const lastWateredDate = new Date(selectedPlant.last_watered);
        
        // Get plant stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[selectedPlant.stage] || 'Unknown';
        
        detailsPanel.innerHTML = `
            <div class="p-3">
                <h3>${selectedPlant.name}</h3>
                <div class="mb-3">
                    <span class="badge bg-primary">${selectedPlant.type}</span>
                    <span class="badge ${selectedPlant.stage > 4 ? 'bg-danger' : 'bg-success'}">${stageName}</span>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Health</label>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar ${getHealthBarClass(selectedPlant.health)}" role="progressbar" 
                             style="width: ${selectedPlant.health}%;" aria-valuenow="${selectedPlant.health}" 
                             aria-valuemin="0" aria-valuemax="100">
                            ${Math.round(selectedPlant.health)}%
                        </div>
                    </div>
                </div>
                
                <div class="mb-3">
                    <label class="form-label">Growth Progress</label>
                    <div class="progress" style="height: 20px;">
                        <div class="progress-bar bg-info" role="progressbar" 
                             style="width: ${selectedPlant.progress}%;" aria-valuenow="${selectedPlant.progress}" 
                             aria-valuemin="0" aria-valuemax="100">
                            ${Math.round(selectedPlant.progress)}%
                        </div>
                    </div>
                </div>
                
                <div class="mb-1">
                    <small class="text-muted">Created: ${createdDate.toLocaleDateString()}</small>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Last Watered: ${lastWateredDate.toLocaleDateString()}</small>
                </div>
                
                <div class="d-flex gap-2 mb-3">
                    <button class="btn btn-info water-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-tint"></i> Water Plant
                    </button>
                    <button class="btn btn-outline-success dance-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-music"></i> Make Dance
                    </button>
                </div>
                
                <div class="alert ${selectedPlant.health < 30 ? 'alert-danger' : 'alert-info'} small">
                    ${getPlantStatusMessage(selectedPlant)}
                </div>
            </div>
        `;
        
        // Add event listener for dance button
        const danceButton = detailsPanel.querySelector('.dance-plant-btn');
        if (danceButton) {
            danceButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
                
                if (plantContainer) {
                    // Start dancing
                    plantContainer.classList.add('plant-dancing');
                    
                    // Change button to stop dancing
                    this.innerHTML = '<i class="fas fa-stop"></i> Stop Dancing';
                    this.classList.remove('btn-outline-success');
                    this.classList.add('btn-outline-danger');
                    
                    // Set flag on the button to know it's dancing
                    this.dataset.dancing = 'true';
                    
                    // Set button click to stop dancing
                    this.addEventListener('click', function stopDancing(e) {
                        e.preventDefault();
                        
                        // Stop dancing
                        plantContainer.classList.remove('plant-dancing');
                        
                        // Reset button
                        this.innerHTML = '<i class="fas fa-music"></i> Make Dance';
                        this.classList.remove('btn-outline-danger');
                        this.classList.add('btn-outline-success');
                        
                        // Remove flag
                        delete this.dataset.dancing;
                        
                        // Remove this event listener
                        this.removeEventListener('click', stopDancing);
                        
                        // Reset original event
                        this.addEventListener('click', function() {
                            const plantId = this.getAttribute('data-plant-id');
                            const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
                            
                            if (plantContainer) {
                                plantContainer.classList.add('plant-dancing');
                                updatePlantDetailsPanel(); // Re-render to get the stop button
                            }
                        });
                    });
                }
            });
        }
        
        // Add event listener for water button in details panel
        const waterButton = detailsPanel.querySelector('.water-plant-btn');
        if (waterButton) {
            waterButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                waterPlant(plantId);
            });
        }
    }
    
    function getHealthBarClass(health) {
        if (health > 75) return 'bg-success';
        if (health > 50) return 'bg-info';
        if (health > 25) return 'bg-warning';
        return 'bg-danger';
    }
    
    function getPlantStatusMessage(plant) {
        if (plant.health < 20) {
            return 'Your plant is in critical condition! Log some healthy habits to revive it.';
        } else if (plant.health < 50) {
            return 'Your plant could use some care. Try logging more of your daily habits.';
        } else if (plant.stage === 6) { // Dead
            return 'Your plant has completed its lifecycle. You can keep it as a memento or remove it from your garden.';
        } else if (plant.stage === 5) { // Withering
            return 'Your plant is withering. This is a natural part of its lifecycle.';
        } else if (plant.stage === 4) { // Flowering
            return 'Your plant is flowering beautifully! Keep up your good habits!';
        } else if (plant.progress > 75) {
            return 'Your plant is nearly ready to advance to the next growth stage!';
        } else {
            return 'Keep logging your daily habits to help your plant grow!';
        }
    }
    
    function showNotification(message, type = 'info') {
        // Just log to console instead of showing notifications
        console.log(`Notification (${type}): ${message}`);
    }
    
    // Refresh plants data periodically
    setInterval(fetchPlants, 60000); // Refresh every minute
});
