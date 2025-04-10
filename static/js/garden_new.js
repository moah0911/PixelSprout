/**
 * Enhanced Garden functionality for PixelSprout
 * Handles plant management, watering, and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Garden variables
    let plants = [];
    let selectedPlant = null;
    let waterCredits = 20; // Default water credits
    let gardenMode = 'grid'; // Default view mode: 'grid' or 'list'
    let sortBy = 'name'; // Default sort: 'name', 'health', 'progress', 'age'
    let filterBy = 'all'; // Default filter: 'all', 'healthy', 'needs-water', 'growing', etc.
    
    // DOM Elements
    const gardenContainer = document.getElementById('garden-container');
    const plantDetailsPanel = document.getElementById('plant-details-panel');
    const addPlantForm = document.getElementById('add-plant-form');
    const waterAllPlantsBtn = document.getElementById('water-all-plants-btn');
    const waterCreditsCount = document.getElementById('water-credits-count');
    const sortDropdown = document.getElementById('sort-plants-dropdown');
    const filterDropdown = document.getElementById('filter-plants-dropdown');
    const viewModeToggle = document.getElementById('view-mode-toggle');
    const searchPlantsInput = document.getElementById('search-plants');
    
    // Initialize garden
    initGarden();
    
    // Event listeners
    if (addPlantForm) {
        addPlantForm.addEventListener('submit', handleAddPlant);
    }
    
    if (gardenContainer) {
        gardenContainer.addEventListener('click', handlePlantClick);
    }
    
    if (waterAllPlantsBtn) {
        waterAllPlantsBtn.addEventListener('click', handleWaterAllPlants);
    }
    
    if (sortDropdown) {
        sortDropdown.addEventListener('change', function() {
            sortBy = this.value;
            renderGarden();
        });
    }
    
    if (filterDropdown) {
        filterDropdown.addEventListener('change', function() {
            filterBy = this.value;
            renderGarden();
        });
    }
    
    if (viewModeToggle) {
        viewModeToggle.addEventListener('click', toggleViewMode);
    }
    
    if (searchPlantsInput) {
        searchPlantsInput.addEventListener('input', function() {
            renderGarden();
        });
    }
    
    // Initialize garden
    async function initGarden() {
        // Fetch plant types for the select dropdown
        await fetchPlantTypes();
        
        // Fetch water credits
        await fetchWaterCredits();
        
        // Fetch and display plants
        await fetchPlants();
        
        // Initialize plant details panel
        updatePlantDetailsPanel();
        
        // Initialize garden stats
        updateGardenStats();
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
        if (waterCreditsCount) {
            waterCreditsCount.textContent = waterCredits;
            
            // Add animation effect when credits change
            waterCreditsCount.classList.add('credit-change');
            setTimeout(() => {
                waterCreditsCount.classList.remove('credit-change');
            }, 500);
        }
    }
    
    // Fetch plant types
    async function fetchPlantTypes() {
        try {
            const response = await fetch('/api/plant-types');
            const data = await response.json();
            
            if (data.success) {
                // Store the plant types for later use
                window.plantTypes = data.plant_types;
                const plantTypeSelect = document.getElementById('plant-type');
                
                if (plantTypeSelect) {
                    // Set up dropdown
                    plantTypeSelect.innerHTML = '<option value="" selected disabled>Select plant type...</option>';
                    
                    // Icons for data attributes (can be used for styling)
                    const typeIcons = {
                        'succulent': 'seedling',
                        'flower': 'spa',
                        'tree': 'tree',
                        'herb': 'mortar-pestle',
                        'vine': 'leaf',
                        'bonsai': 'tree',
                        'fern': 'fan',
                        'cactus': 'mountain',
                        'palm': 'umbrella-beach',
                        'fruit': 'apple-alt',
                        'bamboo': 'ruler-vertical',
                        'carnivorous': 'teeth',
                        'aquatic': 'water',
                        'moss': 'cloud-meatball'
                    };
                    
                    window.plantTypes.forEach(type => {
                        const option = document.createElement('option');
                        option.value = type.value;
                        
                        // Add icon as data attribute
                        const icon = typeIcons[type.value.toLowerCase()] || 'leaf';
                        option.setAttribute('data-icon', icon);
                        
                        // Format name for display
                        const displayName = type.name.replace(/\b\w/g, l => l.toUpperCase());
                        option.textContent = displayName;
                        
                        plantTypeSelect.appendChild(option);
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching plant types:', error);
            showNotification('Failed to load plant types', 'error');
        }
    }
    
    // Fetch plants
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
    
    // Render garden
    function renderGarden() {
        if (!gardenContainer) return;
        
        // Clear container
        gardenContainer.innerHTML = '';
        
        // Filter plants
        let filteredPlants = filterPlants();
        
        // Sort plants
        filteredPlants = sortPlants(filteredPlants);
        
        // Search plants
        if (searchPlantsInput && searchPlantsInput.value.trim()) {
            const searchTerm = searchPlantsInput.value.trim().toLowerCase();
            filteredPlants = filteredPlants.filter(plant => 
                plant.name.toLowerCase().includes(searchTerm) || 
                plant.type.toLowerCase().includes(searchTerm)
            );
        }
        
        if (filteredPlants.length === 0) {
            // Show empty garden state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-garden-state text-center p-5';
            emptyState.innerHTML = `
                <div class="mb-4">
                    <i class="fas fa-seedling fa-4x text-muted"></i>
                </div>
                <h3>No plants found</h3>
                <p class="text-muted">Try changing your filters or add a new plant!</p>
            `;
            gardenContainer.appendChild(emptyState);
            return;
        }
        
        // Create plant grid or list
        const gardenLayout = document.createElement('div');
        gardenLayout.className = gardenMode === 'grid' ? 'row g-4' : 'plant-list';
        
        filteredPlants.forEach(plant => {
            const plantElement = gardenMode === 'grid' 
                ? createPlantGridElement(plant) 
                : createPlantListElement(plant);
            gardenLayout.appendChild(plantElement);
        });
        
        gardenContainer.appendChild(gardenLayout);
        
        // Update garden stats
        updateGardenStats();
    }
    
    // Filter plants based on current filter
    function filterPlants() {
        if (filterBy === 'all') return [...plants];
        
        switch (filterBy) {
            case 'healthy':
                return plants.filter(plant => plant.health >= 75);
            case 'needs-water':
                return plants.filter(plant => plant.health < 50);
            case 'growing':
                return plants.filter(plant => plant.stage < 3);
            case 'mature':
                return plants.filter(plant => plant.stage >= 3 && plant.stage < 5);
            case 'withering':
                return plants.filter(plant => plant.stage >= 5);
            default:
                return [...plants];
        }
    }
    
    // Sort plants based on current sort
    function sortPlants(plantsToSort) {
        const sortedPlants = [...plantsToSort];
        
        switch (sortBy) {
            case 'name':
                return sortedPlants.sort((a, b) => a.name.localeCompare(b.name));
            case 'health':
                return sortedPlants.sort((a, b) => b.health - a.health);
            case 'progress':
                return sortedPlants.sort((a, b) => b.progress - a.progress);
            case 'age':
                return sortedPlants.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
            case 'stage':
                return sortedPlants.sort((a, b) => b.stage - a.stage);
            default:
                return sortedPlants;
        }
    }
    
    // Create a plant element in grid view
    function createPlantGridElement(plant) {
        const col = document.createElement('div');
        col.className = 'col-md-4 col-lg-3';
        
        // Calculate health class
        let healthClass = 'bg-success';
        if (plant.health < 75) healthClass = 'bg-info';
        if (plant.health < 50) healthClass = 'bg-warning';
        if (plant.health < 25) healthClass = 'bg-danger';
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[plant.stage] || 'Unknown';
        
        const card = document.createElement('div');
        card.className = `card plant-card ${selectedPlant && selectedPlant.id === plant.id ? 'selected' : ''}`;
        card.dataset.plantId = plant.id;
        
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
        waterButton.className = 'water-plant-btn mt-3';
        waterButton.innerHTML = '<i class="fas fa-tint"></i> Water Plant';
        waterButton.setAttribute('data-plant-id', plant.id);
        waterButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent plant selection
            
            // Add ripple effect
            const ripple = document.createElement('span');
            ripple.classList.add('water-ripple');
            this.appendChild(ripple);
            
            // Position the ripple
            const rect = this.getBoundingClientRect();
            const size = Math.max(rect.width, rect.height);
            ripple.style.width = ripple.style.height = size + 'px';
            ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
            ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
            ripple.classList.add('active');
            
            // Remove ripple after animation
            setTimeout(() => {
                ripple.remove();
            }, 800);
            
            waterPlant(plant.id);
        });
        
        // Format dates
        const createdDate = new Date(plant.created_at);
        const lastWateredDate = new Date(plant.last_watered);
        const timeElapsedSinceWatering = getTimeElapsed(plant.last_watered);
        
        // Assemble the card
        card.innerHTML = `
            <div class="card-body text-center">
                <div class="plant-visual mb-3"></div>
                <h5 class="card-title">${plant.name}</h5>
                <div class="plant-badges mb-2">
                    <span class="badge bg-primary">${plant.type}</span>
                    <span class="badge ${plant.stage > 4 ? 'bg-danger' : 'bg-success'}">${stageName}</span>
                </div>
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
                <div class="mt-1 text-muted x-small">
                    Last Watered: ${timeElapsedSinceWatering}
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
    
    // Create a plant element in list view
    function createPlantListElement(plant) {
        const listItem = document.createElement('div');
        listItem.className = `plant-list-item ${selectedPlant && selectedPlant.id === plant.id ? 'selected' : ''}`;
        listItem.dataset.plantId = plant.id;
        
        // Calculate health class
        let healthClass = 'bg-success';
        if (plant.health < 75) healthClass = 'bg-info';
        if (plant.health < 50) healthClass = 'bg-warning';
        if (plant.health < 25) healthClass = 'bg-danger';
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[plant.stage] || 'Unknown';
        
        // Create plant container for animations
        const plantContainer = document.createElement('div');
        plantContainer.className = 'plant-container-small';
        plantContainer.dataset.plantId = plant.id;
        
        // Add health-based classes
        if (plant.health > 75) {
            plantContainer.classList.add('plant-healthy');
        } else if (plant.health < 30) {
            plantContainer.classList.add('plant-unhealthy');
        }
        
        // Add plant SVG to container
        plantContainer.innerHTML = getPlantSvg(plant.type, plant.stage);
        
        // Format dates
        const lastWateredDate = new Date(plant.last_watered);
        const timeElapsedSinceWatering = getTimeElapsed(plant.last_watered);
        
        // Assemble the list item
        listItem.innerHTML = `
            <div class="plant-list-visual"></div>
            <div class="plant-list-info">
                <div class="plant-list-header">
                    <h5 class="plant-list-title">${plant.name}</h5>
                    <div class="plant-list-badges">
                        <span class="badge bg-primary">${plant.type}</span>
                        <span class="badge ${plant.stage > 4 ? 'bg-danger' : 'bg-success'}">${stageName}</span>
                    </div>
                </div>
                <div class="plant-list-stats">
                    <div class="progress-container">
                        <label>Health</label>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar ${healthClass}" role="progressbar" style="width: ${plant.health}%;" 
                                aria-valuenow="${plant.health}" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                        <span>${Math.round(plant.health)}%</span>
                    </div>
                    <div class="progress-container">
                        <label>Growth</label>
                        <div class="progress" style="height: 8px;">
                            <div class="progress-bar bg-info" role="progressbar" style="width: ${plant.progress}%;" 
                                aria-valuenow="${plant.progress}" aria-valuemin="0" aria-valuemax="100">
                            </div>
                        </div>
                        <span>${Math.round(plant.progress)}%</span>
                    </div>
                </div>
                <div class="plant-list-meta">
                    <span>Last Watered: ${timeElapsedSinceWatering}</span>
                </div>
            </div>
            <div class="plant-list-actions">
                <button class="water-plant-btn" data-plant-id="${plant.id}">
                    <i class="fas fa-tint"></i> Water
                </button>
            </div>
        `;
        
        // Insert plant container
        const visualContainer = listItem.querySelector('.plant-list-visual');
        visualContainer.appendChild(plantContainer);
        
        // Add water button event listener
        const waterButton = listItem.querySelector('.water-plant-btn');
        waterButton.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent plant selection
            waterPlant(plant.id);
        });
        
        return listItem;
    }
    
    // Get plant SVG based on type and stage
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
    
    // Get color for plant type
    function getColorForPlantType(type) {
        const colors = {
            'succulent': '#7CB342',
            'flower': '#EC407A',
            'tree': '#5D4037',
            'herb': '#66BB6A',
            'vine': '#8BC34A',
            'bonsai': '#795548',
            'fern': '#4CAF50',
            'cactus': '#8D6E63',
            'palm': '#FFA000',
            'fruit': '#F57C00',
            'bamboo': '#33691E',
            'carnivorous': '#D32F2F',
            'aquatic': '#0288D1',
            'moss': '#558B2F'
        };
        
        return colors[type.toLowerCase()] || '#8BC34A';
    }
    
    // Handle plant click
    function handlePlantClick(e) {
        const plantCard = e.target.closest('.plant-card, .plant-list-item');
        if (!plantCard) return;
        
        const plantId = plantCard.dataset.plantId;
        if (!plantId) return;
        
        // Find the plant
        const plant = plants.find(p => p.id == plantId);
        if (!plant) return;
        
        // Update selected plant
        selectedPlant = plant;
        
        // Update UI
        updatePlantDetailsPanel();
        
        // Update selected state
        document.querySelectorAll('.plant-card.selected, .plant-list-item.selected').forEach(card => {
            card.classList.remove('selected');
        });
        plantCard.classList.add('selected');
        
        // Scroll to details panel on mobile
        if (window.innerWidth < 992) {
            plantDetailsPanel.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    // Update plant details panel
    function updatePlantDetailsPanel() {
        if (!plantDetailsPanel) return;
        
        if (!selectedPlant) {
            plantDetailsPanel.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">Select a plant to view details</p>
                </div>
            `;
            return;
        }
        
        // Format dates with India time zone adjustment
        const createdDateFormatted = formatDate(selectedPlant.created_at);
        const lastWateredFormatted = formatDate(selectedPlant.last_watered);
        const timeElapsedSinceWatering = getTimeElapsed(selectedPlant.last_watered);
        
        // Get plant stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[selectedPlant.stage] || 'Unknown';
        
        plantDetailsPanel.innerHTML = `
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
                    <small class="text-muted">Created: ${createdDateFormatted}</small>
                </div>
                <div class="mb-3">
                    <small class="text-muted">Last Watered: ${timeElapsedSinceWatering}</small>
                </div>
                
                <div class="d-flex gap-2 mb-3">
                    <button class="water-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-tint"></i> Water Plant
                    </button>
                    <button class="btn btn-outline-success dance-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-music"></i> Make Dance
                    </button>
                </div>
                
                <div class="alert ${selectedPlant.health < 30 ? 'alert-danger' : 'alert-info'} small">
                    ${getPlantStatusMessage(selectedPlant)}
                </div>
                
                <div class="d-flex justify-content-end mt-4">
                    <button class="btn btn-sm btn-outline-danger delete-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-trash-alt me-1"></i> Delete Plant
                    </button>
                </div>
            </div>
        `;
        
        // Add event listener for dance button
        const danceButton = plantDetailsPanel.querySelector('.dance-plant-btn');
        if (danceButton) {
            danceButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"], .plant-container-small[data-plant-id="${plantId}"]`);
                
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
                            const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"], .plant-container-small[data-plant-id="${plantId}"]`);
                            
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
        const waterButton = plantDetailsPanel.querySelector('.water-plant-btn');
        if (waterButton) {
            waterButton.addEventListener('click', function(e) {
                const plantId = this.getAttribute('data-plant-id');
                
                // Add ripple effect
                const ripple = document.createElement('span');
                ripple.classList.add('water-ripple');
                this.appendChild(ripple);
                
                // Position the ripple
                const rect = this.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                ripple.style.width = ripple.style.height = size + 'px';
                ripple.style.left = (e.clientX - rect.left - size/2) + 'px';
                ripple.style.top = (e.clientY - rect.top - size/2) + 'px';
                ripple.classList.add('active');
                
                // Remove ripple after animation
                setTimeout(() => {
                    ripple.remove();
                }, 800);
                
                waterPlant(plantId);
            });
        }
        
        // Add event listener for delete button
        const deleteButton = plantDetailsPanel.querySelector('.delete-plant-btn');
        if (deleteButton) {
            deleteButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                deletePlant(plantId);
            });
        }
    }
    
    // Get health bar class based on health value
    function getHealthBarClass(health) {
        if (health > 75) return 'bg-success';
        if (health > 50) return 'bg-info';
        if (health > 25) return 'bg-warning';
        return 'bg-danger';
    }
    
    // Get plant status message
    function getPlantStatusMessage(plant) {
        if (plant.health < 30) {
            return `<i class="fas fa-exclamation-triangle me-1"></i> ${plant.name} needs water urgently! Health is critically low.`;
        }
        
        if (plant.health < 50) {
            return `<i class="fas fa-info-circle me-1"></i> ${plant.name} could use some water soon.`;
        }
        
        if (plant.stage === 4) { // Flowering
            return `<i class="fas fa-star me-1"></i> ${plant.name} is flowering beautifully!`;
        }
        
        if (plant.stage === 3) { // Mature
            return `<i class="fas fa-check-circle me-1"></i> ${plant.name} is mature and healthy.`;
        }
        
        if (plant.progress > 75) {
            return `<i class="fas fa-arrow-up me-1"></i> ${plant.name} is growing well and will advance to the next stage soon!`;
        }
        
        return `<i class="fas fa-heart me-1"></i> ${plant.name} is doing well. Keep up the good work!`;
    }
    
    // Water plant function
    async function waterPlant(plantId) {
        try {
            // Show watering effect immediately for better user feedback
            const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"], .plant-container-small[data-plant-id="${plantId}"]`);
            if (plantContainer) {
                // Add watering animation
                const wateringEffect = document.createElement('div');
                wateringEffect.className = 'watering-effect';
                
                // Add water drops
                for (let i = 0; i < 5; i++) {
                    const waterDrop = document.createElement('div');
                    waterDrop.className = 'water-drop';
                    wateringEffect.appendChild(waterDrop);
                }
                
                // Add water splash effects
                for (let i = 0; i < 5; i++) {
                    const waterSplash = document.createElement('div');
                    waterSplash.className = 'water-splash';
                    wateringEffect.appendChild(waterSplash);
                }
                
                plantContainer.appendChild(wateringEffect);
                
                // Make plant dance briefly
                plantContainer.classList.add('plant-dancing');
            }
            
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
                
                // Update UI
                renderGarden();
                if (selectedPlant && selectedPlant.id == plantId) {
                    selectedPlant = plants.find(p => p.id == plantId);
                    updatePlantDetailsPanel();
                }
                
                showNotification(data.message, 'success');
            } else {
                // Remove watering effect if failed
                if (plantContainer) {
                    const wateringEffect = plantContainer.querySelector('.watering-effect');
                    if (wateringEffect) {
                        plantContainer.removeChild(wateringEffect);
                    }
                    plantContainer.classList.remove('plant-dancing');
                }
                showNotification(data.message || 'Failed to water plant', 'error');
            }
            
            // Remove effects after animation completes
            if (plantContainer) {
                setTimeout(() => {
                    const wateringEffect = plantContainer.querySelector('.watering-effect');
                    if (wateringEffect && wateringEffect.parentNode === plantContainer) {
                        plantContainer.removeChild(wateringEffect);
                    }
                    plantContainer.classList.remove('plant-dancing');
                }, 2000);
            }
        } catch (error) {
            console.error('Error watering plant:', error);
            showNotification('Error watering plant', 'error');
            
            // Remove watering effect if error
            if (plantContainer) {
                const wateringEffect = plantContainer.querySelector('.watering-effect');
                if (wateringEffect) {
                    plantContainer.removeChild(wateringEffect);
                }
                plantContainer.classList.remove('plant-dancing');
            }
        }
    }
    
    // Handle adding a plant
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
        
        if (!type) {
            showNotification('Please select a plant type', 'warning');
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
                // Reset form
                nameInput.value = '';
                typeSelect.selectedIndex = 0;
                
                // Refresh plants
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
            showNotification('Error adding plant', 'error');
        }
    }
    
    // Handle watering all plants
    async function handleWaterAllPlants() {
        const waterButtons = document.querySelectorAll('.water-plant-btn');
        
        if (waterButtons.length === 0) {
            showNotification('No plants to water!', 'warning');
            return;
        }
        
        // Check if we have enough water credits
        if (waterCredits < waterButtons.length) {
            showNotification(`Not enough water credits! You need ${waterButtons.length} but have ${waterCredits}.`, 'warning');
            return;
        }
        
        // Create a small delay between watering each plant for visual effect
        let waterCount = 0;
        for (let btn of waterButtons) {
            const plantId = btn.getAttribute('data-plant-id');
            if (plantId) {
                setTimeout(() => {
                    waterPlant(plantId);
                }, waterCount * 500);
                waterCount++;
            }
        }
        
        showNotification(`Watering ${waterCount} plants...`, 'info');
    }
    
    // Delete a plant
    async function deletePlant(plantId) {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to delete this plant?')) {
            return;
        }
        
        try {
            const response = await fetch(`/api/plants/${plantId}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Remove plant from array
                plants = plants.filter(p => p.id != plantId);
                
                // Reset selected plant if it was deleted
                if (selectedPlant && selectedPlant.id == plantId) {
                    selectedPlant = null;
                }
                
                // Update UI
                renderGarden();
                updatePlantDetailsPanel();
                
                showNotification(data.message || 'Plant deleted successfully', 'success');
            } else {
                showNotification(data.message || 'Failed to delete plant', 'error');
            }
        } catch (error) {
            console.error('Error deleting plant:', error);
            showNotification('Error deleting plant', 'error');
        }
    }
    
    // Toggle view mode (grid/list)
    function toggleViewMode() {
        gardenMode = gardenMode === 'grid' ? 'list' : 'grid';
        
        // Update button icon
        if (viewModeToggle) {
            viewModeToggle.innerHTML = gardenMode === 'grid' 
                ? '<i class="fas fa-list"></i>' 
                : '<i class="fas fa-th-large"></i>';
            
            viewModeToggle.setAttribute('title', gardenMode === 'grid' 
                ? 'Switch to List View' 
                : 'Switch to Grid View');
        }
        
        // Update garden container class
        if (gardenContainer) {
            gardenContainer.classList.toggle('garden-list-view', gardenMode === 'list');
        }
        
        // Re-render garden
        renderGarden();
    }
    
    // Update garden stats
    function updateGardenStats() {
        const statsContainer = document.getElementById('garden-stats');
        if (!statsContainer) return;
        
        // Calculate stats
        const totalPlants = plants.length;
        const healthyPlants = plants.filter(p => p.health >= 75).length;
        const needsWaterPlants = plants.filter(p => p.health < 50).length;
        const averageHealth = totalPlants > 0 
            ? plants.reduce((sum, plant) => sum + plant.health, 0) / totalPlants 
            : 0;
        
        // Update stats display
        statsContainer.innerHTML = `
            <div class="stat-item">
                <div class="stat-value">${totalPlants}</div>
                <div class="stat-label">Total Plants</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${healthyPlants}</div>
                <div class="stat-label">Healthy</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${needsWaterPlants}</div>
                <div class="stat-label">Needs Water</div>
            </div>
            <div class="stat-item">
                <div class="stat-value">${Math.round(averageHealth)}%</div>
                <div class="stat-label">Avg. Health</div>
            </div>
        `;
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        const statusContainer = document.getElementById('status-container');
        if (!statusContainer) return;
        
        const toast = document.createElement('div');
        toast.className = `toast align-items-center text-white bg-${type} border-0`;
        toast.setAttribute('role', 'alert');
        toast.setAttribute('aria-live', 'assertive');
        toast.setAttribute('aria-atomic', 'true');
        
        toast.innerHTML = `
            <div class="d-flex">
                <div class="toast-body">
                    ${message}
                </div>
                <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        `;
        
        statusContainer.appendChild(toast);
        
        const bsToast = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 3000
        });
        
        bsToast.show();
        
        // Remove toast from DOM after it's hidden
        toast.addEventListener('hidden.bs.toast', function() {
            statusContainer.removeChild(toast);
        });
    }
    
    // Make showNotification available globally
    window.showNotification = showNotification;
});