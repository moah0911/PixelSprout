document.addEventListener('DOMContentLoaded', function() {
    // Garden variables
    let plants = [];
    let selectedPlant = null;
    let waterCredits = 20; // Default water credits
    let currentAnimationMode = 'default';
    let currentSort = 'newest';
    
    // Initialize garden
    initGarden();
    
    // Event listeners
    document.getElementById('add-plant-form').addEventListener('submit', handleAddPlant);
    document.getElementById('garden-container').addEventListener('click', handlePlantClick);
    document.getElementById('water-all-plants-btn').addEventListener('click', waterAllPlants);
    
    // Add event listeners for animation modes
    const animationLinks = document.querySelectorAll('[data-animation-mode]');
    animationLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const mode = this.getAttribute('data-animation-mode');
            setAnimationMode(mode);
        });
    });
    
    // Function to set animation mode for all plants
    function setAnimationMode(mode) {
        currentAnimationMode = mode;
        
        // Remove all animation classes from plant containers
        const plantContainers = document.querySelectorAll('.plant-container');
        plantContainers.forEach(container => {
            container.classList.remove('plant-dancing', 'plant-bouncing', 'plant-shimmering', 'plant-rainbow');
            
            // Add the selected animation class if not default
            if (mode !== 'default') {
                container.classList.add(`plant-${mode}`);
            }
        });
        
        // Show notification
        showNotification(`Animation mode set to ${mode}`, 'success');
    }
    
    // Add event listeners for seasonal themes
    const seasonLinks = document.querySelectorAll('[data-season]');
    seasonLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const season = this.getAttribute('data-season');
            setSeasonTheme(season);
        });
    });
    
    // Function to set seasonal theme for garden
    function setSeasonTheme(season) {
        const gardenContainer = document.getElementById('garden-container');
        
        // Remove all season classes
        gardenContainer.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
        
        // Add the selected season class
        gardenContainer.classList.add(`season-${season}`);
        
        // Show notification
        showNotification(`Garden theme changed to ${season}`, 'success');
    }
    
    // Add event listeners for sorting
    const sortLinks = document.querySelectorAll('[data-sort]');
    sortLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const sortType = this.getAttribute('data-sort');
            setSortOrder(sortType);
        });
    });
    
    // Function to set sort order for plants
    function setSortOrder(sortType) {
        currentSort = sortType;
        renderGarden(); // Re-render with new sort order
        
        // Show notification
        const sortNames = {
            'name-asc': 'Name (A-Z)',
            'name-desc': 'Name (Z-A)',
            'health-asc': 'Health (Low-High)',
            'health-desc': 'Health (High-Low)',
            'progress-asc': 'Progress (Low-High)',
            'progress-desc': 'Progress (High-Low)',
            'newest': 'Newest First',
            'oldest': 'Oldest First'
        };
        
        showNotification(`Plants sorted by: ${sortNames[sortType] || sortType}`, 'success');
    }
    
    // Add event listener for rename form
    document.getElementById('rename-plant-form').addEventListener('submit', handleRenamePlant);
    
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
                // Store the plant types for later use
                plantTypes = data.plant_types;
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
                    
                    plantTypes.forEach(type => {
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
        
        // Update total plants count
        const totalPlantsCount = document.getElementById('total-plants-count');
        if (totalPlantsCount) {
            totalPlantsCount.textContent = plants.length;
        }
        
        // Update garden level (based on total plants and their stages)
        const gardenLevel = document.getElementById('garden-level');
        if (gardenLevel) {
            // Calculate garden level based on plants and their growth
            const totalStages = plants.reduce((sum, plant) => sum + plant.stage, 0);
            const calculatedLevel = Math.max(1, Math.floor(totalStages / 3) + 1);
            gardenLevel.textContent = calculatedLevel;
        }
        
        if (plants.length === 0) {
            // Show enhanced empty garden state
            const emptyState = document.createElement('div');
            emptyState.className = 'empty-garden-state';
            emptyState.innerHTML = `
                <i class="fas fa-seedling empty-garden-icon"></i>
                <h3 class="empty-garden-title">Your Garden Awaits</h3>
                <p class="empty-garden-text">Begin your journey by planting your first seed. As you nurture your habits, watch your garden flourish and grow.</p>
                <button class="btn btn-garden btn-garden-primary" data-bs-toggle="modal" data-bs-target="#add-plant-modal">
                    <i class="fas fa-plus-circle me-2"></i> Plant Your First Seed
                </button>
            `;
            gardenContainer.appendChild(emptyState);
            return;
        }
        
        // Create plant grid with enhanced styling
        const gardenGrid = document.createElement('div');
        gardenGrid.className = 'row g-4 grid-view';
        
        // Sort plants based on current sort preference
        const sortedPlants = [...plants]; // Create a copy to avoid modifying the original array
        
        // Apply current sort (default to newest first)
        sortPlants(sortedPlants, currentSort || 'newest');
        
        // Create plant elements
        sortedPlants.forEach(plant => {
            const plantElement = createPlantElement(plant);
            gardenGrid.appendChild(plantElement);
        });
        
        gardenContainer.appendChild(gardenGrid);
    }
    
    function createPlantElement(plant) {
        const col = document.createElement('div');
        col.className = 'col-lg-4 col-md-6 mb-4';
        
        const card = document.createElement('div');
        card.className = `plant-card ${selectedPlant && selectedPlant.id === plant.id ? 'selected' : ''}`;
        card.dataset.plantId = plant.id;
        
        // Add click event to select plant
        card.addEventListener('click', function() {
            selectPlant(plant.id);
        });
        
        // Create plant container with enhanced styling
        const plantContainer = document.createElement('div');
        plantContainer.className = 'plant-container';
        plantContainer.dataset.plantId = plant.id;
        
        // Add animation class based on current animation mode
        if (currentAnimationMode && currentAnimationMode !== 'default') {
            plantContainer.classList.add(`plant-${currentAnimationMode}`);
        }
        
        // Add health-based classes
        if (plant.health > 75) {
            plantContainer.classList.add('plant-healthy');
        } else if (plant.health < 30) {
            plantContainer.classList.add('plant-unhealthy');
        }
        
        // Add plant SVG to container
        plantContainer.innerHTML = getPlantSvg(plant.type, plant.stage);
        
        // Create plant info section
        const plantInfo = document.createElement('div');
        plantInfo.className = 'plant-info';
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[plant.stage] || 'Unknown';
        
        // Create plant name and type
        plantInfo.innerHTML = `
            <div class="d-flex justify-content-between align-items-center mb-2">
                <h3 class="plant-name">${plant.name}</h3>
                <span class="badge bg-success">${stageName}</span>
            </div>
            
            <div class="plant-progress-container">
                <div class="plant-progress-label">
                    <span>Health</span>
                    <span>${Math.round(plant.health)}%</span>
                </div>
                <div class="plant-progress-bar">
                    <div class="plant-progress-fill plant-health-fill" style="width: ${plant.health}%"></div>
                </div>
            </div>
            
            <div class="plant-progress-container">
                <div class="plant-progress-label">
                    <span>Growth</span>
                    <span>${Math.round(plant.progress)}%</span>
                </div>
                <div class="plant-progress-bar">
                    <div class="plant-progress-fill plant-growth-fill" style="width: ${plant.progress}%"></div>
                </div>
            </div>
        `;
        
        // Create water button with enhanced styling
        const waterButton = document.createElement('button');
        waterButton.className = 'water-plant-btn mt-3';
        waterButton.innerHTML = '<i class="fas fa-tint"></i> Water Plant';
        waterButton.setAttribute('data-plant-id', plant.id);
        
        // Add water button click event
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
            
            // Water the plant
            waterPlant(plant.id);
        });
        
        // Add water button to plant info
        plantInfo.appendChild(waterButton);
        
        // Assemble the card
        card.appendChild(plantContainer);
        card.appendChild(plantInfo);
        
        col.appendChild(card);
        return col;
    }
    
    // Sort plants based on different criteria
    function sortPlants(plantsArray, sortType) {
        switch(sortType) {
            case 'name-asc':
                plantsArray.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'name-desc':
                plantsArray.sort((a, b) => b.name.localeCompare(a.name));
                break;
            case 'health-asc':
                plantsArray.sort((a, b) => a.health - b.health);
                break;
            case 'health-desc':
                plantsArray.sort((a, b) => b.health - a.health);
                break;
            case 'progress-asc':
                plantsArray.sort((a, b) => a.progress - b.progress);
                break;
            case 'progress-desc':
                plantsArray.sort((a, b) => b.progress - a.progress);
                break;
            case 'oldest':
                plantsArray.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
                break;
            case 'newest':
            default:
                plantsArray.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                break;
        }
        
        // Save current sort preference
        currentSort = sortType;
    }
    
    function getPlantSvg(type, stage) {
        // Normalize type to lowercase for consistency
        const normalizedType = type.toLowerCase();
        
        // Try to get enhanced SVG first
        if (window.enhancedPlantSvgs && window.enhancedPlantSvgs[normalizedType] && window.enhancedPlantSvgs[normalizedType][stage]) {
            return window.enhancedPlantSvgs[normalizedType][stage];
        }
        
        // Fall back to regular SVGs
        const plantSvgs = window.plantSvgs || {};
        const typeSvgs = plantSvgs[normalizedType] || plantSvgs.succulent;
        
        // If we have a specific SVG for this stage, use it
        if (typeSvgs && typeSvgs[stage]) {
            return typeSvgs[stage];
        }
        
        // Fallback to a generic plant representation
        return `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="50" r="${20 + stage * 5}" fill="${getColorForPlantType(normalizedType)}" />
        </svg>`;
    }
    
    // Water plant function
    async function waterPlant(plantId) {
        try {
            // Show watering effect immediately for better user feedback
            const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
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
                    <i class="fas fa-leaf fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Select a plant to view detailed information</p>
                </div>
            `;
            return;
        }
        
        // Format dates with time zone adjustment
        const createdDateFormatted = formatDate(selectedPlant.created_at);
        const lastWateredFormatted = formatDate(selectedPlant.last_watered);
        const timeElapsedSinceWatering = getTimeElapsed(selectedPlant.last_watered);
        
        // Get plant stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[selectedPlant.stage] || 'Unknown';
        
        // Calculate days since creation
        const daysSinceCreation = Math.floor((new Date() - new Date(selectedPlant.created_at)) / (1000 * 60 * 60 * 24));
        
        // Create enhanced plant details panel
        detailsPanel.innerHTML = `
            <div class="plant-details">
                <div class="plant-details-visual mb-4">
                    ${getPlantSvg(selectedPlant.type, selectedPlant.stage)}
                </div>
                
                <div class="plant-details-header mb-3">
                    <h3 class="plant-details-name">${selectedPlant.name}</h3>
                    <div class="plant-details-badges">
                        <span class="badge bg-primary">${selectedPlant.type}</span>
                        <span class="badge ${selectedPlant.stage > 4 ? 'bg-danger' : 'bg-success'}">${stageName}</span>
                    </div>
                </div>
                
                <div class="plant-progress-container mb-3">
                    <div class="plant-progress-label">
                        <span>Health</span>
                        <span>${Math.round(selectedPlant.health)}%</span>
                    </div>
                    <div class="plant-progress-bar">
                        <div class="plant-progress-fill plant-health-fill" style="width: ${selectedPlant.health}%"></div>
                    </div>
                </div>
                
                <div class="plant-progress-container mb-4">
                    <div class="plant-progress-label">
                        <span>Growth</span>
                        <span>${Math.round(selectedPlant.progress)}%</span>
                    </div>
                    <div class="plant-progress-bar">
                        <div class="plant-progress-fill plant-growth-fill" style="width: ${selectedPlant.progress}%"></div>
                    </div>
                </div>
                
                <div class="plant-details-stats mb-4">
                    <div class="plant-stat-item">
                        <div class="plant-stat-icon">
                            <i class="fas fa-calendar-alt"></i>
                        </div>
                        <div class="plant-stat-content">
                            <div class="plant-stat-label">Age</div>
                            <div class="plant-stat-value">${daysSinceCreation} days</div>
                        </div>
                    </div>
                    
                    <div class="plant-stat-item">
                        <div class="plant-stat-icon">
                            <i class="fas fa-tint"></i>
                        </div>
                        <div class="plant-stat-content">
                            <div class="plant-stat-label">Last Watered</div>
                            <div class="plant-stat-value">${timeElapsedSinceWatering}</div>
                        </div>
                    </div>
                    
                    <div class="plant-stat-item">
                        <div class="plant-stat-icon">
                            <i class="fas fa-seedling"></i>
                        </div>
                        <div class="plant-stat-content">
                            <div class="plant-stat-label">Created</div>
                            <div class="plant-stat-value">${createdDateFormatted}</div>
                        </div>
                    </div>
                </div>
                
                <div class="plant-details-actions mb-3">
                    <button class="btn btn-garden btn-garden-secondary water-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-tint me-2"></i> Water Plant
                    </button>
                    
                    <button class="btn btn-garden btn-garden-outline dance-plant-btn" data-plant-id="${selectedPlant.id}">
                        <i class="fas fa-music me-2"></i> Animate
                    </button>
                    
                    <button class="btn btn-garden btn-garden-primary" data-bs-toggle="modal" data-bs-target="#plant-details-modal" onclick="prepareDetailsModal(${selectedPlant.id})">
                        <i class="fas fa-info-circle me-2"></i> More Details
                    </button>
                </div>
                
                <div class="plant-status-message ${selectedPlant.health < 30 ? 'status-danger' : 'status-info'}">
                    <i class="fas ${selectedPlant.health < 30 ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
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
                    this.innerHTML = '<i class="fas fa-stop me-2"></i> Stop Animation';
                    this.classList.remove('btn-garden-outline');
                    this.classList.add('btn-garden-primary');
                    
                    // Set flag on the button to know it's dancing
                    this.dataset.dancing = 'true';
                    
                    // Set button click to stop dancing
                    this.addEventListener('click', function stopDancing(e) {
                        e.preventDefault();
                        
                        // Stop dancing
                        plantContainer.classList.remove('plant-dancing');
                        
                        // Reset button
                        this.innerHTML = '<i class="fas fa-music me-2"></i> Animate';
                        this.classList.remove('btn-garden-primary');
                        this.classList.add('btn-garden-outline');
                        
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
    }
    
    // Prepare the details modal with plant information
    function prepareDetailsModal(plantId) {
        // Find the plant by ID
        const plant = plants.find(p => p.id === plantId);
        if (!plant) return;
        
        // Update modal title
        document.getElementById('modal-plant-name').textContent = plant.name;
        
        // Update plant visual
        const modalPlantVisual = document.getElementById('modal-plant-visual');
        modalPlantVisual.innerHTML = getPlantSvg(plant.type, plant.stage);
        
        // Update plant stats
        const modalPlantStats = document.getElementById('modal-plant-stats');
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[plant.stage] || 'Unknown';
        
        modalPlantStats.innerHTML = `
            <div class="plant-progress-container mb-3">
                <div class="plant-progress-label">
                    <span>Health</span>
                    <span>${Math.round(plant.health)}%</span>
                </div>
                <div class="plant-progress-bar">
                    <div class="plant-progress-fill plant-health-fill" style="width: ${plant.health}%"></div>
                </div>
            </div>
            
            <div class="plant-progress-container mb-3">
                <div class="plant-progress-label">
                    <span>Growth</span>
                    <span>${Math.round(plant.progress)}%</span>
                </div>
                <div class="plant-progress-bar">
                    <div class="plant-progress-fill plant-growth-fill" style="width: ${plant.progress}%"></div>
                </div>
            </div>
            
            <div class="plant-details-badges mb-3">
                <span class="badge bg-primary">${plant.type}</span>
                <span class="badge ${plant.stage > 4 ? 'bg-danger' : 'bg-success'}">${stageName}</span>
            </div>
        `;
        
        // Set up modal water button
        const modalWaterButton = document.getElementById('modal-water-plant-btn');
        modalWaterButton.setAttribute('data-plant-id', plant.id);
        modalWaterButton.onclick = function() {
            waterPlant(plant.id);
        };
        
        // Set up rename button
        const modalRenameButton = document.getElementById('modal-rename-plant-btn');
        modalRenameButton.onclick = function() {
            // Set the plant ID in the rename form
            document.getElementById('rename-plant-id').value = plant.id;
            
            // Set the current name as default
            document.getElementById('new-plant-name').value = plant.name;
            
            // Hide the details modal and show the rename modal
            const detailsModal = bootstrap.Modal.getInstance(document.getElementById('plant-details-modal'));
            detailsModal.hide();
            
            // Show rename modal
            const renameModal = new bootstrap.Modal(document.getElementById('rename-plant-modal'));
            renameModal.show();
        };
        
        // Create a simple growth history chart
        const historyContainer = document.getElementById('modal-plant-history');
        historyContainer.innerHTML = '<canvas id="growth-history-chart"></canvas>';
        
        // Create dummy data for the chart (in a real app, this would come from the backend)
        const labels = [];
        const healthData = [];
        const growthData = [];
        
        // Generate some data points for the last 7 days
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            labels.push(date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }));
            
            // Generate some random data that trends upward
            const daysSinceCreation = Math.floor((date - new Date(plant.created_at)) / (1000 * 60 * 60 * 24));
            const baseHealth = Math.max(0, Math.min(100, 50 + daysSinceCreation * 5 + Math.random() * 20 - 10));
            const baseGrowth = Math.max(0, Math.min(100, 30 + daysSinceCreation * 7 + Math.random() * 15 - 7.5));
            
            healthData.push(baseHealth);
            growthData.push(baseGrowth);
        }
        
        // Add current values
        labels.push('Today');
        healthData.push(plant.health);
        growthData.push(plant.progress);
        
        // Create the chart
        const ctx = document.getElementById('growth-history-chart').getContext('2d');
        new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Health',
                        data: healthData,
                        borderColor: '#4CAF50',
                        backgroundColor: 'rgba(76, 175, 80, 0.1)',
                        tension: 0.4,
                        fill: true
                    },
                    {
                        label: 'Growth',
                        data: growthData,
                        borderColor: '#2196F3',
                        backgroundColor: 'rgba(33, 150, 243, 0.1)',
                        tension: 0.4,
                        fill: true
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: '#e9ecef'
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#aaa'
                        }
                    },
                    x: {
                        grid: {
                            color: 'rgba(255, 255, 255, 0.1)'
                        },
                        ticks: {
                            color: '#aaa'
                        }
                    }
                }
            }
        });
    }
    
    function getHealthBarClass(health) {
        if (health > 75) return 'bg-success';
        if (health > 50) return 'bg-info';
        if (health > 25) return 'bg-warning';
        return 'bg-danger';
    }
    
    // Set animation mode for plants
    function setAnimationMode(mode) {
        currentAnimationMode = mode;
        
        // Remove all animation classes from plant containers
        document.querySelectorAll('.plant-container').forEach(container => {
            container.classList.remove('plant-dancing', 'plant-bouncing', 'plant-shimmering', 'plant-rainbow');
            
            // Add the selected animation class if not default
            if (mode !== 'default') {
                container.classList.add(`plant-${mode}`);
            }
        });
        
        showNotification(`Animation mode set to ${mode}`, 'success');
    }
    
    // Set seasonal theme for garden
    function setSeasonTheme(season) {
        const gardenContainer = document.getElementById('garden-container');
        
        // Remove all season classes
        gardenContainer.classList.remove('season-spring', 'season-summer', 'season-autumn', 'season-winter');
        
        // Add the selected season class
        gardenContainer.classList.add(`season-${season}`);
        
        showNotification(`Garden theme changed to ${season}`, 'success');
    }
    
    // Set sort order for plants
    function setSortOrder(sortType) {
        // Update current sort
        currentSort = sortType;
        
        // Re-render garden with new sort order
        renderGarden();
        
        // Format sort name for notification
        let sortName = sortType.replace('-', ' ');
        sortName = sortName.charAt(0).toUpperCase() + sortName.slice(1);
        
        showNotification(`Plants sorted by: ${sortName}`, 'success');
    }
    
    // Water all plants
    async function waterAllPlants() {
        if (plants.length === 0) {
            showNotification('No plants to water', 'warning');
            return;
        }
        
        if (waterCredits < plants.length) {
            showNotification('Not enough water credits to water all plants', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/water-all-plants', {
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
                
                // Update plants data
                plants = data.plants;
                
                // Update UI
                renderGarden();
                if (selectedPlant) {
                    // Find the updated selected plant
                    selectedPlant = plants.find(p => p.id === selectedPlant.id) || null;
                    updatePlantDetailsPanel();
                }
                
                showNotification(data.message || 'All plants watered successfully!', 'success');
                
                // Add watering animation to all plants
                document.querySelectorAll('.plant-container').forEach(container => {
                    container.classList.add('plant-dancing');
                    setTimeout(() => {
                        container.classList.remove('plant-dancing');
                    }, 2000);
                });
            } else {
                showNotification(data.message || 'Failed to water all plants', 'error');
            }
        } catch (error) {
            console.error('Error watering all plants:', error);
            showNotification('Error watering all plants', 'error');
        }
    }
    
    // Handle plant rename
    async function handleRenamePlant(event) {
        event.preventDefault();
        
        const plantId = document.getElementById('rename-plant-id').value;
        const newName = document.getElementById('new-plant-name').value.trim();
        
        if (!newName) {
            showNotification('Please enter a new name', 'warning');
            return;
        }
        
        try {
            const response = await fetch(`/api/rename-plant/${plantId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: newName })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Update plant in the array
                const plant = plants.find(p => p.id == plantId);
                if (plant) {
                    plant.name = newName;
                }
                
                // Update UI
                renderGarden();
                if (selectedPlant && selectedPlant.id == plantId) {
                    selectedPlant.name = newName;
                    updatePlantDetailsPanel();
                }
                
                showNotification(`Plant renamed to ${newName}`, 'success');
                
                // Close modal
                const modal = bootstrap.Modal.getInstance(document.getElementById('rename-plant-modal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                showNotification(data.message || 'Failed to rename plant', 'error');
            }
        } catch (error) {
            console.error('Error renaming plant:', error);
            showNotification('Error renaming plant', 'error');
        }
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
        // Get toast elements
        const toast = document.getElementById('notification-toast');
        const toastTitle = document.getElementById('toast-title');
        const toastMessage = document.getElementById('toast-message');
        const toastIcon = document.getElementById('toast-icon');
        
        if (!toast || !toastTitle || !toastMessage || !toastIcon) {
            console.log(`Notification (${type}): ${message}`);
            return;
        }
        
        // Set toast content
        toastMessage.textContent = message;
        
        // Set title and icon based on type
        let title = 'Information';
        let iconClass = 'fa-info-circle text-info';
        
        switch (type) {
            case 'success':
                title = 'Success';
                iconClass = 'fa-check-circle text-success';
                break;
            case 'error':
                title = 'Error';
                iconClass = 'fa-exclamation-circle text-danger';
                break;
            case 'warning':
                title = 'Warning';
                iconClass = 'fa-exclamation-triangle text-warning';
                break;
        }
        
        toastTitle.textContent = title;
        toastIcon.className = `fas ${iconClass} me-2`;
        
        // Show the toast
        const bsToast = new bootstrap.Toast(toast);
        bsToast.show();
        
        // Log to console as well
        console.log(`Notification (${type}): ${message}`);
    }
    
    // Refresh plants data periodically
    setInterval(fetchPlants, 60000); // Refresh every minute
});
