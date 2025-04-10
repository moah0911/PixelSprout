/**
 * Profile Page JavaScript
 * Handles profile page functionality and animations
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize profile page
    initProfilePage();
    
    // Add event listeners
    setupEventListeners();
    
    // Fetch profile data
    fetchProfileData();
});

/**
 * Initialize profile page elements
 */
function initProfilePage() {
    console.log('Initializing profile page...');
    
    // Add animation classes to elements
    const animateElements = document.querySelectorAll('.dashboard-card');
    animateElements.forEach((element, index) => {
        element.style.animationDelay = `${0.1 + (index * 0.1)}s`;
    });
    
    // Initialize profile picture upload
    initProfilePictureUpload();
}

/**
 * Set up event listeners for interactive elements
 */
function setupEventListeners() {
    // Profile picture upload
    const profilePictureInput = document.getElementById('profile-picture-input');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleProfilePictureChange);
    }
    
    // Time range selector for progress charts
    const timeButtons = document.querySelectorAll('.time-btn');
    timeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            timeButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update chart based on selected time range
            const timeRange = this.getAttribute('data-range');
            updateProgressChart(timeRange);
        });
    });
    
    // Refresh activity button
    const refreshActivityButton = document.getElementById('refresh-activity');
    if (refreshActivityButton) {
        refreshActivityButton.addEventListener('click', function() {
            // Add spinning animation to button icon
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Fetch activity data
            fetchActivityData().then(() => {
                // Remove spinning animation after data is loaded
                setTimeout(() => {
                    icon.classList.remove('fa-spin');
                }, 500);
            });
        });
    }
}

/**
 * Initialize profile picture upload functionality
 */
function initProfilePictureUpload() {
    const profilePictureContainer = document.getElementById('profile-picture-container');
    const profilePicturePreview = document.getElementById('profile-picture-preview');
    
    if (profilePictureContainer && profilePicturePreview) {
        // Add hover effect
        profilePictureContainer.addEventListener('mouseenter', function() {
            profilePicturePreview.style.filter = 'brightness(0.8)';
        });
        
        profilePictureContainer.addEventListener('mouseleave', function() {
            profilePicturePreview.style.filter = 'brightness(1)';
        });
    }
}

/**
 * Handle profile picture change
 * @param {Event} event - The change event
 */
function handleProfilePictureChange(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.match('image.*')) {
        showNotification('Please select an image file', 'error');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showNotification('Image size should be less than 5MB', 'error');
        return;
    }
    
    // Create file reader to read the file
    const reader = new FileReader();
    reader.onload = function(e) {
        // Update profile picture preview
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        if (profilePicturePreview) {
            profilePicturePreview.src = e.target.result;
        }
        
        // Upload profile picture to server
        uploadProfilePicture(file);
    };
    
    // Read the file as data URL
    reader.readAsDataURL(file);
}

/**
 * Upload profile picture to server
 * @param {File} file - The image file to upload
 */
function uploadProfilePicture(file) {
    // Create form data
    const formData = new FormData();
    formData.append('profile_picture', file);
    
    // Show loading notification
    showNotification('Uploading profile picture...', 'info');
    
    // Send request to server
    fetch('/api/upload-profile-picture', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            showNotification('Profile picture updated successfully', 'success');
        } else {
            showNotification(data.message || 'Failed to update profile picture', 'error');
        }
    })
    .catch(error => {
        console.error('Error uploading profile picture:', error);
        showNotification('Error uploading profile picture', 'error');
    });
}

/**
 * Fetch profile data from server
 */
function fetchProfileData() {
    // Show loading state
    showLoadingState();
    
    // Fetch data from server
    Promise.all([
        fetchGardenStats(),
        fetchActivityData(),
        fetchHabits()
    ])
    .then(() => {
        // Hide loading state
        hideLoadingState();
    })
    .catch(error => {
        console.error('Error fetching profile data:', error);
        showNotification('Error loading profile data', 'error');
    });
}

/**
 * Fetch garden stats from server
 */
function fetchGardenStats() {
    return fetch('/api/garden-stats')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateGardenStats(data);
            } else {
                console.error('Failed to fetch garden stats:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching garden stats:', error);
        });
}

/**
 * Update garden stats in the UI
 * @param {Object} data - The garden stats data
 */
function updateGardenStats(data) {
    // Update garden level
    const gardenLevel = document.getElementById('garden-level');
    if (gardenLevel) {
        gardenLevel.textContent = `Level ${data.level || 1}`;
    }
    
    // Update level progress
    const levelProgressBar = document.getElementById('level-progress-bar');
    if (levelProgressBar) {
        levelProgressBar.style.width = `${data.level_progress || 0}%`;
    }
    
    // Update member since
    const memberSince = document.getElementById('member-since');
    if (memberSince) {
        memberSince.textContent = data.member_since || 'New Member';
    }
    
    // Update water credits
    const waterCreditsCount = document.getElementById('water-credits-count');
    if (waterCreditsCount) {
        waterCreditsCount.textContent = data.water_credits || 0;
    }
    
    // Update plants count
    const plantsCount = document.getElementById('plants-count');
    if (plantsCount) {
        plantsCount.textContent = data.plants_count || 0;
    }
    
    // Update conditions count
    const conditionsCount = document.getElementById('conditions-count');
    if (conditionsCount) {
        conditionsCount.textContent = data.conditions_count || 0;
    }
    
    // Update garden score
    const gardenScore = document.getElementById('garden-score');
    if (gardenScore) {
        gardenScore.textContent = data.garden_score || 0;
    }
    
    // Update streak count
    const streakCount = document.getElementById('streak-count');
    if (streakCount) {
        streakCount.textContent = data.streak_count || 0;
    }
    
    // Update plant summary
    updatePlantSummary(data.plants || []);
}

/**
 * Update plant summary in the UI
 * @param {Array} plants - The plants data
 */
function updatePlantSummary(plants) {
    const plantSummaryContainer = document.getElementById('plant-summary-container');
    if (!plantSummaryContainer) return;
    
    // Clear container
    plantSummaryContainer.innerHTML = '';
    
    // Check if there are plants
    if (plants.length === 0) {
        plantSummaryContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-seedling"></i>
                </div>
                <p>No plants in your garden yet</p>
                <a href="/garden" class="btn btn-success btn-sm">
                    <i class="fas fa-plus me-1"></i> Plant Your First Seed
                </a>
            </div>
        `;
        return;
    }
    
    // Create plant summary
    const plantSummary = document.createElement('div');
    plantSummary.className = 'plant-summary';
    
    // Add plants (limit to 5)
    const displayPlants = plants.slice(0, 5);
    displayPlants.forEach(plant => {
        const plantItem = document.createElement('div');
        plantItem.className = 'plant-summary-item';
        plantItem.innerHTML = `
            <div class="plant-summary-visual">
                ${getPlantSvg(plant.type, plant.stage)}
            </div>
            <div class="plant-summary-info">
                <div class="plant-summary-name">${plant.name}</div>
                <div class="plant-summary-meta">
                    <span>${getPlantStageName(plant.stage)}</span>
                    <span>${Math.round(plant.health)}% Health</span>
                </div>
            </div>
        `;
        plantSummary.appendChild(plantItem);
    });
    
    // Add view all button if there are more plants
    if (plants.length > 5) {
        const viewAllButton = document.createElement('a');
        viewAllButton.href = '/garden';
        viewAllButton.className = 'btn-view-all-plants';
        viewAllButton.innerHTML = `
            <span>View All Plants (${plants.length})</span>
            <i class="fas fa-chevron-right"></i>
        `;
        plantSummary.appendChild(viewAllButton);
    }
    
    // Add to container
    plantSummaryContainer.appendChild(plantSummary);
}

/**
 * Get plant stage name
 * @param {number} stage - The plant stage
 * @returns {string} The stage name
 */
function getPlantStageName(stage) {
    const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
    return stageNames[stage] || 'Unknown';
}

/**
 * Fetch activity data from server
 */
function fetchActivityData() {
    return fetch('/api/recent-activity')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateActivityList(data.activities || []);
            } else {
                console.error('Failed to fetch activity data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching activity data:', error);
        });
}

/**
 * Update activity list in the UI
 * @param {Array} activities - The activities data
 */
function updateActivityList(activities) {
    const activityList = document.getElementById('recent-activity-list');
    if (!activityList) return;
    
    // Clear container
    activityList.innerHTML = '';
    
    // Check if there are activities
    if (activities.length === 0) {
        activityList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-history"></i>
                </div>
                <p>No recent activity</p>
            </div>
        `;
        return;
    }
    
    // Add activities
    activities.forEach(activity => {
        const activityItem = document.createElement('div');
        activityItem.className = 'activity-item';
        
        // Get icon based on activity type
        let icon = 'fa-leaf';
        if (activity.type === 'condition') {
            icon = 'fa-clipboard-check';
        } else if (activity.type === 'water') {
            icon = 'fa-tint';
        } else if (activity.type === 'level_up') {
            icon = 'fa-arrow-up';
        }
        
        activityItem.innerHTML = `
            <div class="activity-icon">
                <i class="fas ${icon}"></i>
            </div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-subtitle">${activity.description}</div>
                <div class="activity-meta">
                    <div class="activity-time">
                        <i class="far fa-clock"></i>
                        <span>${formatTimeAgo(activity.timestamp)}</span>
                    </div>
                </div>
            </div>
        `;
        
        activityList.appendChild(activityItem);
    });
}

/**
 * Format time ago
 * @param {string} timestamp - The timestamp to format
 * @returns {string} Formatted time ago
 */
function formatTimeAgo(timestamp) {
    const date = new Date(timestamp);
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
 * Fetch habits from server
 */
function fetchHabits() {
    return fetch('/api/condition-types')
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                updateHabitsList(data.condition_types || []);
            } else {
                console.error('Failed to fetch habits:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching habits:', error);
        });
}

/**
 * Update habits list in the UI
 * @param {Array} habits - The habits data
 */
function updateHabitsList(habits) {
    const habitsList = document.getElementById('condition-types-list');
    if (!habitsList) return;
    
    // Clear container
    habitsList.innerHTML = '';
    
    // Check if there are habits
    if (habits.length === 0) {
        habitsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-heartbeat"></i>
                </div>
                <p>No habits added yet</p>
                <button class="btn btn-success btn-sm" data-bs-toggle="modal" data-bs-target="#add-condition-type-modal">
                    <i class="fas fa-plus me-1"></i> Add Your First Habit
                </button>
            </div>
        `;
        return;
    }
    
    // Add habits
    habits.forEach(habit => {
        const habitItem = document.createElement('div');
        habitItem.className = 'habit-item';
        
        habitItem.innerHTML = `
            <div class="habit-icon">
                <i class="fas ${habit.icon || 'fa-check'}"></i>
            </div>
            <div class="habit-info">
                <div class="habit-name">${habit.name}</div>
                <div class="habit-meta">
                    <span>
                        <i class="fas fa-tint"></i>
                        ${habit.water_credits} credits
                    </span>
                    <span>
                        <i class="fas fa-calendar-check"></i>
                        ${habit.count || 0} times
                    </span>
                </div>
            </div>
            <div class="habit-actions">
                <button class="btn-habit-action" data-habit-id="${habit.id}" title="Log this habit">
                    <i class="fas fa-plus"></i>
                </button>
            </div>
        `;
        
        habitsList.appendChild(habitItem);
    });
    
    // Add event listeners to habit action buttons
    const habitActionButtons = habitsList.querySelectorAll('.btn-habit-action');
    habitActionButtons.forEach(button => {
        button.addEventListener('click', function() {
            const habitId = this.getAttribute('data-habit-id');
            openLogHabitModal(habitId);
        });
    });
}

/**
 * Open log habit modal
 * @param {string} habitId - The habit ID
 */
function openLogHabitModal(habitId) {
    // Set habit ID in the modal
    const habitIdInput = document.getElementById('condition-type-id');
    if (habitIdInput) {
        habitIdInput.value = habitId;
    }
    
    // Show the modal
    const modal = new bootstrap.Modal(document.getElementById('log-condition-modal'));
    if (modal) {
        modal.show();
    }
}

/**
 * Update progress chart
 * @param {string} timeRange - The time range (week, month, year)
 */
function updateProgressChart(timeRange) {
    console.log(`Updating progress chart for ${timeRange}...`);
    
    // Fetch data for the selected time range
    fetch(`/api/progress-data?range=${timeRange}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                renderProgressChart(data);
            } else {
                console.error('Failed to fetch progress data:', data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching progress data:', error);
        });
}

/**
 * Render progress chart
 * @param {Object} data - The progress data
 */
function renderProgressChart(data) {
    // Implementation depends on the charting library used
    console.log('Rendering progress chart with data:', data);
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingStates = document.querySelectorAll('.loading-state');
    loadingStates.forEach(state => {
        state.style.display = 'flex';
    });
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingStates = document.querySelectorAll('.loading-state');
    loadingStates.forEach(state => {
        state.style.display = 'none';
    });
}

/**
 * Show notification
 * @param {string} message - The notification message
 * @param {string} type - The notification type (success, error, info, warning)
 */
function showNotification(message, type = 'info') {
    // Check if notification container exists
    let notificationContainer = document.getElementById('notification-container');
    
    // Create container if it doesn't exist
    if (!notificationContainer) {
        notificationContainer = document.createElement('div');
        notificationContainer.id = 'notification-container';
        notificationContainer.className = 'notification-container';
        document.body.appendChild(notificationContainer);
    }
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    
    // Get icon based on type
    let icon = 'fa-info-circle';
    if (type === 'success') {
        icon = 'fa-check-circle';
    } else if (type === 'error') {
        icon = 'fa-exclamation-circle';
    } else if (type === 'warning') {
        icon = 'fa-exclamation-triangle';
    }
    
    // Set notification content
    notification.innerHTML = `
        <div class="notification-icon">
            <i class="fas ${icon}"></i>
        </div>
        <div class="notification-content">
            <div class="notification-message">${message}</div>
        </div>
        <button class="notification-close">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Add to container
    notificationContainer.appendChild(notification);
    
    // Add close button event listener
    const closeButton = notification.querySelector('.notification-close');
    if (closeButton) {
        closeButton.addEventListener('click', function() {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        });
    }
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode === notificationContainer) {
            notification.classList.add('notification-hiding');
            setTimeout(() => {
                if (notification.parentNode === notificationContainer) {
                    notificationContainer.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
    
    // Add animation class
    setTimeout(() => {
        notification.classList.add('notification-show');
    }, 10);
}

/**
 * Get plant SVG
 * This is a placeholder function - the actual implementation would depend on your SVG system
 * @param {string} type - The plant type
 * @param {number} stage - The plant stage
 * @returns {string} The plant SVG HTML
 */
function getPlantSvg(type, stage) {
    // This is a placeholder - replace with your actual SVG generation logic
    return `<svg width="50" height="50" viewBox="0 0 50 50">
        <circle cx="25" cy="40" r="8" fill="#4CAF50" />
        <rect x="24" y="15" width="2" height="25" fill="#8BC34A" />
        <ellipse cx="25" cy="15" rx="${5 + stage * 2}" ry="${3 + stage}" fill="#8BC34A" />
    </svg>`;
}