/**
 * Utility functions for Digital Zen Garden
 */

/**
 * Show a status notification
 * @param {string} message - The message to display
 * @param {string} type - The notification type (success, error, warning, info)
 */
function showNotification(message, type = 'info') {
    // Get the status container
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;
    
    // Create a new status alert
    const alert = document.createElement('div');
    alert.className = `alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    alert.role = 'alert';
    
    // Add icon based on type
    let icon = 'info-circle';
    switch (type) {
        case 'success':
            icon = 'check-circle';
            break;
        case 'error':
            icon = 'exclamation-circle';
            break;
        case 'warning':
            icon = 'exclamation-triangle';
            break;
    }
    
    // Set content
    alert.innerHTML = `
        <i class="fas fa-${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    
    // Add to container
    statusContainer.appendChild(alert);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (alert && alert.parentNode === statusContainer) {
            alert.classList.remove('show');
            
            // Remove from DOM after fade out
            setTimeout(() => {
                if (alert && alert.parentNode === statusContainer) {
                    statusContainer.removeChild(alert);
                }
            }, 500);
        }
    }, 5000);
    
    // Log to console for debugging
    console.log(`Status (${type}): ${message}`);
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
 * Adjust server time to India time zone (UTC+5:30)
 * @param {string} dateString - ISO date string from server (US West/Oregon - UTC-7 or UTC-8)
 * @returns {Date} - Date object adjusted to India time
 */
function adjustToIndiaTimeZone(dateString) {
    // Create date object from server time
    const serverDate = new Date(dateString);
    
    // Get the user's local time zone offset in minutes
    const userOffset = new Date().getTimezoneOffset();
    
    // India time zone is UTC+5:30 (offset of -330 minutes from UTC)
    const indiaOffset = -330;
    
    // Calculate the difference between user's time zone and India time zone in milliseconds
    const offsetDiff = (userOffset - indiaOffset) * 60 * 1000;
    
    // Adjust the date by adding the offset difference
    return new Date(serverDate.getTime() + offsetDiff);
}

/**
 * Format a date for display with India time zone adjustment
 * @param {string} dateString - ISO date string
 * @returns {string} - Formatted date string in India time
 */
function formatDate(dateString) {
    // Adjust to India time zone
    const indiaDate = adjustToIndiaTimeZone(dateString);
    
    // Format with India time indicator
    return indiaDate.toLocaleDateString(undefined, { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }) + ' (IST)';
}

/**
 * Get time elapsed since a date, adjusted for India time zone
 * @param {string} dateString - ISO date string
 * @returns {string} - Time elapsed description
 */
function getTimeElapsed(dateString) {
    // Adjust to India time zone
    const date = adjustToIndiaTimeZone(dateString);
    
    // Create a new date object representing current time in India
    const now = new Date();
    const indiaTimeNow = adjustToIndiaTimeZone(now.toISOString());
    
    const diffMs = indiaTimeNow - date;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDays = Math.floor(diffHr / 24);
    
    // Format the time in 12-hour format with AM/PM
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    const formattedHours = hours % 12 || 12; // Convert to 12-hour format
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const timeString = `${formattedHours}:${formattedMinutes} ${ampm} IST`;
    
    if (diffDays > 7) {
        // For dates more than a week ago, show the full date
        return `${date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} at ${timeString}`;
    } else if (diffDays > 0) {
        return diffDays === 1 ? `Yesterday at ${timeString}` : `${diffDays} days ago at ${timeString}`;
    } else if (diffHr > 0) {
        return diffHr === 1 ? `1 hour ago at ${timeString}` : `${diffHr} hours ago at ${timeString}`;
    } else if (diffMin > 0) {
        return diffMin === 1 ? `1 minute ago at ${timeString}` : `${diffMin} minutes ago at ${timeString}`;
    } else {
        return `Just now at ${timeString}`;
    }
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