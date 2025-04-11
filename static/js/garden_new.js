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
    
    // Add event listener for rename form
    const renamePlantForm = document.getElementById('rename-plant-form');
    if (renamePlantForm) {
        renamePlantForm.addEventListener('submit', handleRenamePlant);
    }
    
    /**
     * Handle click on a plant card
     * @param {Event} event - The click event
     */
    function handlePlantClick(event) {
        // Find the closest plant card or list item
        const plantCard = event.target.closest('.plant-card, .plant-list-item');
        if (!plantCard) return;
        
        // Get the plant ID
        const plantId = plantCard.dataset.plantId;
        if (!plantId) return;
        
        // Find the selected plant
        selectedPlant = plants.find(p => p.id == plantId);
        if (!selectedPlant) return;
        
        // Update UI to show selected plant
        document.querySelectorAll('.plant-card, .plant-list-item').forEach(card => {
            card.classList.remove('selected');
        });
        plantCard.classList.add('selected');
        
        // Update plant details panel
        updatePlantDetailsPanel();
        
        // Show plant details modal
        const detailsModal = new bootstrap.Modal(document.getElementById('plant-details-modal'));
        detailsModal.show();
        
        // Prepare the modal with plant details
        prepareDetailsModal(plantId);
    }
    
    /**
     * Update the plant details panel with information about the selected plant
     */
    function updatePlantDetailsPanel() {
        const detailsPanel = document.getElementById('plant-details-panel');
        if (!detailsPanel) return;
        
        if (!selectedPlant) {
            detailsPanel.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-leaf fa-3x text-muted mb-3"></i>
                    <p class="text-muted">Select a plant to view detailed information</p>
                </div>
            `;
            return;
        }
        
        // Format dates
        const createdDate = new Date(selectedPlant.created_at);
        const lastWateredDate = new Date(selectedPlant.last_watered);
        const timeElapsedSinceWatering = getTimeElapsed(selectedPlant.last_watered);
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[selectedPlant.stage] || 'Unknown';
        
        // Calculate days since creation
        const daysSinceCreation = Math.floor((new Date() - createdDate) / (1000 * 60 * 60 * 24));
        
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
                            <div class="plant-stat-value">${formatDate(selectedPlant.created_at)}</div>
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
                    
                    <button class="btn btn-garden btn-garden-primary" data-bs-toggle="modal" data-bs-target="#plant-details-modal">
                        <i class="fas fa-info-circle me-2"></i> More Details
                    </button>
                </div>
                
                <div class="plant-status-message ${selectedPlant.health < 30 ? 'status-danger' : 'status-info'}">
                    <i class="fas ${selectedPlant.health < 30 ? 'fa-exclamation-triangle' : 'fa-info-circle'} me-2"></i>
                    ${getPlantStatusMessage(selectedPlant)}
                </div>
            </div>
        `;
        
        // Add event listeners to buttons
        const waterButton = detailsPanel.querySelector('.water-plant-btn');
        if (waterButton) {
            waterButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                waterPlant(plantId);
            });
        }
        
        const danceButton = detailsPanel.querySelector('.dance-plant-btn');
        if (danceButton) {
            danceButton.addEventListener('click', function() {
                const plantId = this.getAttribute('data-plant-id');
                const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
                
                if (plantContainer) {
                    // Toggle dancing class
                    if (plantContainer.classList.contains('animation-dancing')) {
                        plantContainer.classList.remove('animation-dancing');
                        this.innerHTML = '<i class="fas fa-music me-2"></i> Animate';
                        this.classList.remove('btn-garden-primary');
                        this.classList.add('btn-garden-outline');
                    } else {
                        plantContainer.classList.add('animation-dancing');
                        this.innerHTML = '<i class="fas fa-stop me-2"></i> Stop Animation';
                        this.classList.remove('btn-garden-outline');
                        this.classList.add('btn-garden-primary');
                    }
                }
            });
        }
    }
    
    /**
     * Prepare the details modal with plant information
     * @param {string} plantId - The ID of the plant to show details for
     */
    function prepareDetailsModal(plantId) {
        // Find the plant by ID
        const plant = plants.find(p => p.id == plantId);
        if (!plant) return;
        
        // Update modal title
        const modalTitle = document.getElementById('modal-plant-name');
        if (modalTitle) {
            modalTitle.textContent = plant.name;
        }
        
        // Update plant visual
        const modalPlantVisual = document.getElementById('modal-plant-visual');
        if (modalPlantVisual) {
            modalPlantVisual.innerHTML = getPlantSvg(plant.type, plant.stage);
        }
        
        // Update plant stats
        const modalPlantStats = document.getElementById('modal-plant-stats');
        if (modalPlantStats) {
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
        }
        
        // Set up modal water button
        const modalWaterButton = document.getElementById('modal-water-plant-btn');
        if (modalWaterButton) {
            modalWaterButton.setAttribute('data-plant-id', plant.id);
            modalWaterButton.onclick = function() {
                waterPlant(plant.id);
            };
        }
        
        // Set up rename button
        const modalRenameButton = document.getElementById('modal-rename-plant-btn');
        if (modalRenameButton) {
            modalRenameButton.onclick = function() {
                // Set the plant ID in the rename form
                const renameIdInput = document.getElementById('rename-plant-id');
                if (renameIdInput) {
                    renameIdInput.value = plant.id;
                }
                
                // Set the current name as default
                const newNameInput = document.getElementById('new-plant-name');
                if (newNameInput) {
                    newNameInput.value = plant.name;
                }
                
                // Hide the details modal and show the rename modal
                const detailsModal = bootstrap.Modal.getInstance(document.getElementById('plant-details-modal'));
                if (detailsModal) {
                    detailsModal.hide();
                }
                
                // Show rename modal
                const renameModal = new bootstrap.Modal(document.getElementById('rename-plant-modal'));
                if (renameModal) {
                    renameModal.show();
                }
            };
        }
        
        // Create a simple growth history chart
        const historyContainer = document.getElementById('modal-plant-history');
        if (historyContainer) {
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
            
            // Create the chart if Chart.js is available
            if (typeof Chart !== 'undefined') {
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
                                    color: '#e9ecef'
                                }
                            },
                            x: {
                                grid: {
                                    color: 'rgba(255, 255, 255, 0.1)'
                                },
                                ticks: {
                                    color: '#e9ecef'
                                }
                            }
                        }
                    }
                });
            } else {
                // Fallback if Chart.js is not available
                historyContainer.innerHTML = `
                    <div class="alert alert-info">
                        <i class="fas fa-info-circle me-2"></i>
                        Chart.js is required to display growth history. Please include it in your project.
                    </div>
                `;
            }
        }
    }
    
    /**
     * Get a status message for a plant based on its health and growth
     * @param {Object} plant - The plant object
     * @returns {string} A status message
     */
    function getPlantStatusMessage(plant) {
        if (plant.health < 30) {
            return 'This plant needs water urgently!';
        } else if (plant.health < 50) {
            return 'This plant could use some water soon.';
        } else if (plant.progress > 90 && plant.stage < 4) {
            return 'This plant is ready to advance to the next stage!';
        } else if (plant.health > 80 && plant.progress > 70) {
            return 'This plant is thriving!';
        } else {
            return 'This plant is doing well.';
        }
    }
    
    /**
     * Format a date string into a readable format
     * @param {string} dateString - The date string to format
     * @returns {string} A formatted date string
     */
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Get a human-readable time elapsed string
     * @param {string} dateString - The date string to calculate elapsed time from
     * @returns {string} A human-readable time elapsed string
     */
    function getTimeElapsed(dateString) {
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        if (diffInSeconds < 60) {
            return 'Just now';
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return 'Yesterday';
        }
        
        if (diffInDays < 7) {
            return `${diffInDays} days ago`;
        }
        
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }
    
    /**
     * Handle plant rename form submission
     * @param {Event} event - The form submission event
     */
    async function handleRenamePlant(event) {
        event.preventDefault();
        
        const plantIdInput = document.getElementById('rename-plant-id');
        const newNameInput = document.getElementById('new-plant-name');
        
        if (!plantIdInput || !newNameInput) {
            showNotification('Form elements not found', 'error');
            return;
        }
        
        const plantId = plantIdInput.value;
        const newName = newNameInput.value.trim();
        
        if (!plantId || !newName) {
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
    
    /**
     * Water a plant
     * @param {string} plantId - The ID of the plant to water
     */
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
                plantContainer.classList.add('animation-dancing');
                
                // Remove effects after animation completes
                setTimeout(() => {
                    const wateringEffect = plantContainer.querySelector('.watering-effect');
                    if (wateringEffect && wateringEffect.parentNode === plantContainer) {
                        plantContainer.removeChild(wateringEffect);
                    }
                    plantContainer.classList.remove('animation-dancing');
                }, 2000);
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
                    selectedPlant = data.plant;
                    updatePlantDetailsPanel();
                }
                
                showNotification(data.message || 'Plant watered successfully!', 'success');
            } else {
                showNotification(data.message || 'Failed to water plant', 'error');
            }
        } catch (error) {
            console.error('Error watering plant:', error);
            showNotification('Error watering plant', 'error');
        }
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
    
    // Initialize garden with improved error handling
    async function initGarden() {
        try {
            // Show loading indicator
            if (window.showNotification) {
                window.showNotification('Loading your garden...', 'info', 2000);
            }
            
            // Create a status container if it doesn't exist
            if (!document.getElementById('status-container')) {
                const container = document.createElement('div');
                container.id = 'status-container';
                container.className = 'position-fixed top-0 end-0 p-3';
                container.style.zIndex = '9999';
                container.style.marginTop = '80px';
                document.body.appendChild(container);
            }
            
            // Load plant types for the add plant form first (faster response)
            try {
                await loadPlantTypes();
                console.log('Plant types loaded successfully');
            } catch (typeError) {
                console.error('Error loading plant types:', typeError);
                if (window.showNotification) {
                    window.showNotification('Error loading plant types. Please try again.', 'warning');
                }
            }
            
            // Fetch water credits
            try {
                await fetchWaterCredits();
                console.log('Water credits loaded successfully');
            } catch (waterError) {
                console.error('Error loading water credits:', waterError);
                // Use default water credits
                waterCredits = 20;
                updateWaterCreditsDisplay();
            }
            
            // Fetch and display plants
            try {
                await fetchPlants();
                console.log('Plants loaded successfully');
            } catch (plantsError) {
                console.error('Error loading plants:', plantsError);
                if (window.showNotification) {
                    window.showNotification('Error loading plants. Please try again.', 'warning');
                }
                // Show empty garden
                renderGarden();
            }
            
            // Initialize plant details panel
            updatePlantDetailsPanel();
            
            // Initialize garden stats
            updateGardenStats();
            
            // Add plant details modal to the page if it doesn't exist
            if (!document.getElementById('plant-details-modal')) {
                createPlantDetailsModal();
            }
            
            console.log('Garden initialized successfully');
        } catch (error) {
            console.error('Error initializing garden:', error);
            if (window.showNotification) {
                window.showNotification('Error loading garden. Please refresh the page.', 'error');
            }
        }
        
        // Create animation effects panel if it doesn't exist
        if (!document.getElementById('animation-effects-panel')) {
            createAnimationEffectsPanel();
        }
    }
    
    /**
     * Create the animation effects panel
     * This panel allows users to toggle various visual effects
     */
    function createAnimationEffectsPanel() {
        // Create the panel container
        const panel = document.createElement('div');
        panel.id = 'animation-effects-panel';
        panel.className = 'animation-effects-panel';
        
        // Add panel content
        panel.innerHTML = `
            <div class="animation-panel-header">
                <h5>Visual Effects</h5>
                <button class="btn btn-sm btn-outline-light animation-panel-toggle">
                    <i class="fas fa-chevron-up"></i>
                </button>
            </div>
            <div class="animation-panel-body">
                <!-- Effects will be added by the animations.js script -->
                <div class="mb-3">
                    <label class="form-label">Plant Animations</label>
                    <div class="btn-group d-flex flex-wrap gap-1" role="group" aria-label="Plant animations">
                        <button type="button" class="btn btn-sm btn-outline-success" data-animation="dance">
                            <i class="fas fa-music me-1"></i> Dance
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" data-animation="wave">
                            <i class="fas fa-wind me-1"></i> Wave
                        </button>
                        <button type="button" class="btn btn-sm btn-outline-success" data-animation="shimmer">
                            <i class="fas fa-sparkles me-1"></i> Shimmer
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        // Add panel to the page
        document.body.appendChild(panel);
        
        // Add toggle functionality
        const toggleButton = panel.querySelector('.animation-panel-toggle');
        const panelBody = panel.querySelector('.animation-panel-body');
        
        if (toggleButton && panelBody) {
            toggleButton.addEventListener('click', function() {
                const isCollapsed = panelBody.classList.toggle('collapsed');
                this.innerHTML = isCollapsed ? 
                    '<i class="fas fa-chevron-down"></i>' : 
                    '<i class="fas fa-chevron-up"></i>';
            });
        }
        
        // Add event listeners for animation buttons
        const animationButtons = panel.querySelectorAll('[data-animation]');
        animationButtons.forEach(button => {
            button.addEventListener('click', function() {
                const animationType = this.getAttribute('data-animation');
                const isActive = this.classList.toggle('active');
                
                // Apply animation to all plants
                const plantContainers = document.querySelectorAll('.plant-container');
                plantContainers.forEach(container => {
                    if (isActive) {
                        // Remove other animations first
                        container.classList.remove('animation-dancing', 'animation-waving', 'animation-shimmer');
                        
                        // Add the selected animation
                        container.classList.add(`animation-${animationType}`);
                    } else {
                        // Remove the animation
                        container.classList.remove(`animation-${animationType}`);
                    }
                });
                
                // Show notification
                showNotification(`${isActive ? 'Enabled' : 'Disabled'} ${animationType} animation`, 'info');
            });
        });
        
        // Add CSS for the panel
        const style = document.createElement('style');
        style.textContent = `
            .animation-effects-panel {
                position: fixed;
                bottom: 20px;
                right: 20px;
                width: 300px;
                background-color: rgba(33, 37, 41, 0.9);
                border-radius: 10px;
                box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
                z-index: 1000;
                overflow: hidden;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .animation-panel-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background-color: rgba(0, 0, 0, 0.2);
                border-bottom: 1px solid rgba(255, 255, 255, 0.1);
            }
            
            .animation-panel-header h5 {
                margin: 0;
                color: #fff;
                font-size: 1rem;
            }
            
            .animation-panel-body {
                padding: 15px;
                max-height: 400px;
                overflow-y: auto;
                transition: max-height 0.3s ease;
            }
            
            .animation-panel-body.collapsed {
                max-height: 0;
                padding: 0 15px;
                overflow: hidden;
            }
            
            .animation-effects-panel .form-label {
                color: #e9ecef;
                font-size: 0.9rem;
                margin-bottom: 0.5rem;
            }
            
            .animation-effects-panel .btn-group {
                margin-bottom: 0.5rem;
            }
            
            /* Animation classes */
            .animation-dancing {
                animation: plantDance 3s cubic-bezier(0.45, 0.05, 0.55, 0.95) infinite;
                transform-origin: bottom center;
            }
            
            .animation-waving {
                animation: plantWave 3s ease-in-out infinite;
                transform-origin: bottom center;
            }
            
            .animation-shimmer {
                animation: plantShimmer 4s ease-in-out infinite;
            }
        `;
        document.head.appendChild(style);
    }
    
    /**
     * Create the plant details modal
     * This modal shows detailed information about a plant when clicked
     */
    function createPlantDetailsModal() {
        const modalHtml = `
            <div class="modal fade" id="plant-details-modal" tabindex="-1" aria-labelledby="plant-details-modal-label" aria-hidden="true">
                <div class="modal-dialog modal-lg">
                    <div class="modal-content bg-dark">
                        <div class="modal-header">
                            <h5 class="modal-title" id="modal-plant-name">Plant Details</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <div class="row">
                                <div class="col-md-5 text-center">
                                    <div id="modal-plant-visual" class="plant-details-visual mb-4"></div>
                                    <div id="modal-plant-stats"></div>
                                </div>
                                <div class="col-md-7">
                                    <h5 class="mb-3">Growth History</h5>
                                    <div id="modal-plant-history" class="mb-4"></div>
                                    
                                    <h5 class="mb-3">Care Instructions</h5>
                                    <div class="care-instructions mb-4">
                                        <div class="care-instruction-item">
                                            <i class="fas fa-tint text-info"></i>
                                            <span>Water regularly to maintain health above 70%</span>
                                        </div>
                                        <div class="care-instruction-item">
                                            <i class="fas fa-sun text-warning"></i>
                                            <span>Log sunlight conditions to boost growth</span>
                                        </div>
                                        <div class="care-instruction-item">
                                            <i class="fas fa-heart text-danger"></i>
                                            <span>Log self-care activities to earn water credits</span>
                                        </div>
                                    </div>
                                    
                                    <h5 class="mb-3">Plant Traits</h5>
                                    <div class="plant-traits mb-4">
                                        <span class="plant-trait">Resilient</span>
                                        <span class="plant-trait">Fast-growing</span>
                                        <span class="plant-trait">Colorful</span>
                                        <span class="plant-trait">Adaptive</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-outline-light" id="modal-rename-plant-btn">
                                <i class="fas fa-edit me-1"></i> Rename
                            </button>
                            <button type="button" class="btn btn-info" id="modal-water-plant-btn">
                                <i class="fas fa-tint me-1"></i> Water Plant
                            </button>
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Rename Plant Modal -->
            <div class="modal fade" id="rename-plant-modal" tabindex="-1" aria-labelledby="rename-plant-modal-label" aria-hidden="true">
                <div class="modal-dialog">
                    <div class="modal-content bg-dark">
                        <div class="modal-header">
                            <h5 class="modal-title" id="rename-plant-modal-label">Rename Plant</h5>
                            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
                        </div>
                        <div class="modal-body">
                            <form id="rename-plant-form">
                                <input type="hidden" id="rename-plant-id">
                                <div class="mb-3">
                                    <label for="new-plant-name" class="form-label">New Name</label>
                                    <input type="text" class="form-control" id="new-plant-name" required>
                                </div>
                                <div class="text-center mt-4">
                                    <button type="submit" class="btn btn-success w-100">
                                        <i class="fas fa-check-circle me-1"></i> Save New Name
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Add modals to the page
        document.body.insertAdjacentHTML('beforeend', modalHtml);
        
        // Add event listener for rename form
        const renameForm = document.getElementById('rename-plant-form');
        if (renameForm) {
            renameForm.addEventListener('submit', handleRenamePlant);
        }
    }
    
    // Fetch water credits from the API
    async function fetchWaterCredits() {
        try {
            const response = await fetch('/api/water-credits');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch water credits: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.success) {
                waterCredits = data.water_credits;
                updateWaterCreditsDisplay();
                return waterCredits;
            } else {
                throw new Error(data.message || 'Failed to fetch water credits');
            }
        } catch (error) {
            console.error('Error fetching water credits:', error);
            // Use default value on error
            waterCredits = 20;
            updateWaterCreditsDisplay();
            return waterCredits;
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
    
    // Fetch plants from the API
    async function fetchPlants() {
        try {
            const response = await fetch('/api/plants');
            
            if (!response.ok) {
                throw new Error(`Failed to fetch plants: ${response.status} ${response.statusText}`);
            }
            
            const data = await response.json();
            
            // The API returns an array directly
            plants = data;
            renderGarden();
            
            return plants;
        } catch (error) {
            console.error('Error fetching plants:', error);
            if (window.showNotification) {
                window.showNotification('Failed to load garden. Please try again.', 'error');
            }
            
            // Empty plants array
            plants = [];
            renderGarden();
            return plants;
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
            
            // Use the correct API endpoint
            const response = await fetch(`/api/plants/${plantId}/water`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`Failed to water plant: ${response.status} ${response.statusText}`);
            }
            
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
                
                if (window.showNotification) {
                    window.showNotification(data.message || 'Plant watered successfully!', 'success');
                }
            } else {
                // Remove watering effect if failed
                if (plantContainer) {
                    const wateringEffect = plantContainer.querySelector('.watering-effect');
                    if (wateringEffect) {
                        plantContainer.removeChild(wateringEffect);
                    }
                    plantContainer.classList.remove('plant-dancing');
                }
                
                if (window.showNotification) {
                    window.showNotification(data.message || 'Failed to water plant', 'error');
                }
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
    
    // Load plant types for the dropdown
    async function loadPlantTypes() {
        try {
            const typeSelect = document.getElementById('plant-type');
            if (!typeSelect) return;
            
            // Clear existing options except the first one
            while (typeSelect.options.length > 1) {
                typeSelect.remove(1);
            }
            
            // Add loading option
            const loadingOption = document.createElement('option');
            loadingOption.text = 'Loading plant types...';
            loadingOption.disabled = true;
            typeSelect.add(loadingOption);
            
            // Fetch plant types from API
            const response = await fetch('/api/plant-types');
            
            if (!response.ok) {
                throw new Error(`Failed to load plant types: ${response.status} ${response.statusText}`);
            }
            
            const plantTypes = await response.json();
            
            // Remove loading option
            typeSelect.remove(typeSelect.options.length - 1);
            
            // Add plant types to dropdown
            plantTypes.forEach(type => {
                const option = document.createElement('option');
                option.value = type.id;
                option.text = type.name;
                typeSelect.add(option);
            });
            
            console.log('Plant types loaded successfully');
            return plantTypes;
        } catch (error) {
            console.error('Error loading plant types:', error);
            if (window.showNotification) {
                window.showNotification('Error loading plant types. Please try again.', 'error');
            }
            
            // Remove loading option
            const typeSelect = document.getElementById('plant-type');
            if (typeSelect && typeSelect.options.length > 1) {
                typeSelect.remove(typeSelect.options.length - 1);
            }
            
            return [];
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
            if (window.showNotification) {
                window.showNotification('Please enter a plant name', 'warning');
            }
            return;
        }
        
        if (!type) {
            if (window.showNotification) {
                window.showNotification('Please select a plant type', 'warning');
            }
            return;
        }
        
        try {
            // Show loading notification
            if (window.showNotification) {
                window.showNotification('Adding your plant...', 'info', 2000);
            }
            
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
                
                if (window.showNotification) {
                    window.showNotification(`Added ${name} to your garden!`, 'success');
                }
                
                // Close modal if it exists
                const modal = bootstrap.Modal.getInstance(document.getElementById('add-plant-modal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                if (window.showNotification) {
                    window.showNotification(data.message || 'Failed to add plant', 'error');
                }
            }
        } catch (error) {
            console.error('Error adding plant:', error);
            if (window.showNotification) {
                window.showNotification('Error adding plant. Please try again.', 'error');
            }
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