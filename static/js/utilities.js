/**
 * Utility functions for Digital Zen Garden
 */

/**
 * Show a toast notification
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Get the toast container
    const toast = document.getElementById('notification-toast');
    if (!toast) return;
    
    // Get the message container
    const messageContainer = document.getElementById('notification-message');
    if (messageContainer) {
        messageContainer.textContent = message;
    }
    
    // Remove existing color classes
    toast.classList.remove('toast-success', 'toast-error', 'toast-warning', 'toast-info');
    
    // Add the appropriate color class
    toast.classList.add(`toast-${type}`);
    
    // Set icon based on type
    const iconElement = toast.querySelector('i');
    if (iconElement) {
        iconElement.className = 'fas me-2';
        
        switch (type) {
            case 'success':
                iconElement.classList.add('fa-check-circle');
                break;
            case 'error':
                iconElement.classList.add('fa-exclamation-circle');
                break;
            case 'warning':
                iconElement.classList.add('fa-exclamation-triangle');
                break;
            default:
                iconElement.classList.add('fa-info-circle');
        }
    }
    
    // Create Bootstrap Toast object if not exists
    const bsToast = new bootstrap.Toast(toast, {
        delay: 3000
    });
    
    // Show the toast
    bsToast.show();
}

/**
 * Increase the user's water credits
 * @param {number} amount - The amount of credits to add
 * @returns {Promise<boolean>} - True if successful, false otherwise
 */
async function increaseWaterCredits(amount = 2) {
    try {
        const response = await fetch('/api/water-credits/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ amount })
        });
        
        const data = await response.json();
        
        if (data.success) {
            const creditsDisplay = document.getElementById('water-credits-count');
            if (creditsDisplay) {
                creditsDisplay.textContent = data.water_credits;
            }
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error increasing water credits:', error);
        return false;
    }
}

/**
 * Update plant growth in the UI
 * @param {Object} plant - The plant object to update
 */
function updatePlantGrowth(plant) {
    const plantElement = document.querySelector(`.plant-card[data-plant-id="${plant.id}"]`);
    
    if (!plantElement) return;
    
    // Update visual
    const plantContainer = plantElement.querySelector('.plant-container');
    if (plantContainer) {
        // Clear any existing plant SVG
        const existingSvg = plantContainer.querySelector('svg');
        if (existingSvg) {
            plantContainer.removeChild(existingSvg);
        }
        
        // Add new SVG based on current stage
        const svgString = getPlantSvg(plant.type, plant.stage);
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = svgString;
        const newSvg = tempDiv.firstChild;
        
        plantContainer.appendChild(newSvg);
        
        // Set health-based classes
        plantContainer.classList.remove('plant-healthy', 'plant-unhealthy');
        if (plant.health > 75) {
            plantContainer.classList.add('plant-healthy');
        } else if (plant.health < 30) {
            plantContainer.classList.add('plant-unhealthy');
        }
    }
    
    // Update progress and health bars
    const healthBar = plantElement.querySelector('.progress-bar[aria-valuenow]');
    if (healthBar) {
        healthBar.style.width = `${plant.health}%`;
        healthBar.setAttribute('aria-valuenow', plant.health);
        
        // Remove existing color classes
        healthBar.classList.remove('bg-success', 'bg-info', 'bg-warning', 'bg-danger');
        
        // Add new color class based on health
        let healthClass = 'bg-success';
        if (plant.health < 75) healthClass = 'bg-info';
        if (plant.health < 50) healthClass = 'bg-warning';
        if (plant.health < 25) healthClass = 'bg-danger';
        
        healthBar.classList.add(healthClass);
    }
    
    // Update progress bar
    const progressBar = plantElement.querySelector('.progress-bar.bg-info');
    if (progressBar) {
        progressBar.style.width = `${plant.progress}%`;
        progressBar.setAttribute('aria-valuenow', plant.progress);
    }
    
    // Update health and progress text
    const statsText = plantElement.querySelector('.text-muted.small');
    if (statsText) {
        statsText.textContent = `Health: ${Math.round(plant.health)}% | Growth: ${Math.round(plant.progress)}%`;
    }
}

/**
 * Get text description of a plant stage
 * @param {number} stage - The plant stage value
 * @returns {string} - The stage name
 */
function getStageText(stage) {
    const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
    return stageNames[stage] || 'Unknown';
}

/**
 * Format a date for display
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string
 */
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

/**
 * Get time elapsed since a date
 * @param {string} dateString - ISO date string
 * @returns {string} - Time elapsed description
 */
function getTimeElapsed(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    
    const diffMs = now - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    if (diffDays > 0) {
        return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
    }
    
    if (diffHr > 0) {
        return diffHr === 1 ? '1 hour ago' : `${diffHr} hours ago`;
    }
    
    if (diffMin > 0) {
        return diffMin === 1 ? '1 minute ago' : `${diffMin} minutes ago`;
    }
    
    return 'Just now';
}

/**
 * Create a pulsing effect on an element
 * @param {HTMLElement} element - The element to animate
 * @param {number} duration - The animation duration in ms
 */
function pulseElement(element, duration = 2000) {
    if (!element) return;
    
    element.style.transition = `transform ${duration/2}ms ease, opacity ${duration/2}ms ease`;
    element.style.transform = 'scale(1.1)';
    element.style.opacity = '0.8';
    
    setTimeout(() => {
        element.style.transform = 'scale(1)';
        element.style.opacity = '1';
    }, duration / 2);
    
    setTimeout(() => {
        element.style.transition = '';
    }, duration);
}