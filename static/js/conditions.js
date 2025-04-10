document.addEventListener('DOMContentLoaded', function() {
    // Variables
    let conditionTypes = [];
    let recentConditions = [];
    
    // Elements
    const conditionsForm = document.getElementById('log-condition-form');
    const conditionTypeSelect = document.getElementById('condition-type');
    const recentConditionsList = document.getElementById('recent-conditions-list');
    const customConditionForm = document.getElementById('add-condition-type-form');
    
    // Initialize
    if (conditionsForm) {
        initConditions();
        
        // Event listeners
        conditionsForm.addEventListener('submit', handleLogCondition);
        
        if (customConditionForm) {
            customConditionForm.addEventListener('submit', handleAddConditionType);
        }
        
        // Update unit label when condition type changes
        conditionTypeSelect.addEventListener('change', updateUnitLabel);
    }
    
    // Functions
    async function initConditions() {
        await fetchConditionTypes();
        await fetchRecentConditions();
        updateUnitLabel();
    }
    
    async function fetchConditionTypes() {
        try {
            const response = await fetch('/api/condition-types');
            const data = await response.json();
            
            if (data.success) {
                conditionTypes = data.condition_types;
                populateConditionTypeSelect();
            }
        } catch (error) {
            console.error('Error fetching condition types:', error);
            showNotification('Failed to load condition types', 'error');
        }
    }
    
    function populateConditionTypeSelect() {
        if (!conditionTypeSelect) return;
        
        // Clear existing options
        conditionTypeSelect.innerHTML = '<option value="" selected disabled>Select condition...</option>';
        
        // Check if conditionTypes is empty or undefined
        if (!conditionTypes || conditionTypes.length === 0) {
            console.error('No condition types available');
            showNotification('Failed to load condition types', 'error');
            return;
        }
        
        // First, deduplicate the array by name
        const uniqueTypes = {};
        for (const type of conditionTypes) {
            uniqueTypes[type.name] = type;
        }
        
        // Sort condition types: system first, then user-defined
        const sortedTypes = Object.values(uniqueTypes).sort((a, b) => {
            if (a.is_custom && !b.is_custom) return 1;
            if (!a.is_custom && b.is_custom) return -1;
            
            // Sort by display name if available
            const aName = a.display_name || a.name;
            const bName = b.display_name || b.name;
            return aName.localeCompare(bName);
        });
        
        // Get icons for different condition types (for reference in data attributes)
        const typeIcons = {
            'water_intake': 'tint',
            'focus_time': 'bullseye',
            'deep_work': 'laptop-code',
            'sunlight': 'sun',
            'exercise': 'running',
            'meditation': 'om',
            'reading': 'book',
            'sleep': 'bed',
            'gratitude': 'heart',
            'journaling': 'pencil-alt',
            'nature_time': 'leaf',
            'digital_detox': 'power-off'
        };
        
        // Default icon
        const defaultIcon = 'check-circle';
        
        // Add options to select
        sortedTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            
            // Get icon for this type
            const icon = typeIcons[type.name] || defaultIcon;
            option.setAttribute('data-icon', icon);
            
            // Use the display_name from server or format name for display
            const displayName = type.display_name || type.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
            option.textContent = displayName;
            
            conditionTypeSelect.appendChild(option);
        });
        
        // Update the unit label when condition type changes
        conditionTypeSelect.addEventListener('change', function() {
            const selectedTypeName = this.value;
            const selectedType = conditionTypes.find(type => type.name === selectedTypeName);
            
            if (selectedType) {
                updateGoalHint(selectedType);
                
                // Update the unit label in the input group
                const valueUnit = document.getElementById('value-unit');
                if (valueUnit) {
                    valueUnit.textContent = selectedType.unit || 'units';
                }
            }
        });
        
        // Trigger change event if there's a default selection
        if (conditionTypeSelect.value) {
            conditionTypeSelect.dispatchEvent(new Event('change'));
        }
    }
    
    function updateGoalHint(conditionType) {
        const goalHint = document.getElementById('condition-goal-hint');
        
        if (goalHint && conditionType.default_goal) {
            goalHint.textContent = `Suggested goal: ${conditionType.default_goal} ${conditionType.unit}`;
            goalHint.style.display = 'block';
        } else if (goalHint) {
            goalHint.style.display = 'none';
        }
    }
    
    // Keep this function for backwards compatibility
    function updateSelectedConditionInfo(conditionType) {
        updateGoalHint(conditionType);
    }
    
    function updateUnitLabel() {
        // This function is now replaced by updateSelectedConditionInfo
        // But we'll keep it for backward compatibility
        if (!conditionTypeSelect) return;
        
        const selectedTypeName = conditionTypeSelect.value;
        const selectedType = conditionTypes.find(type => type.name === selectedTypeName);
        
        if (selectedType) {
            updateSelectedConditionInfo(selectedType);
        }
    }
    
    async function fetchRecentConditions() {
        try {
            const response = await fetch('/api/conditions');
            const data = await response.json();
            
            if (data.success) {
                recentConditions = data.conditions;
                displayRecentConditions();
            }
        } catch (error) {
            console.error('Error fetching recent conditions:', error);
            showNotification('Failed to load recent conditions', 'error');
        }
    }
    
    function displayRecentConditions() {
        if (!recentConditionsList) return;
        
        if (recentConditions.length === 0) {
            recentConditionsList.innerHTML = `
                <div class="text-center p-4">
                    <p class="text-muted">No conditions logged yet</p>
                </div>
            `;
            return;
        }
        
        recentConditionsList.innerHTML = '';
        
        // Get icons for different condition types
        const typeIcons = {
            'water_intake': 'tint',
            'focus_time': 'bullseye',
            'deep_work': 'laptop-code',
            'sunlight': 'sun',
            'exercise': 'running',
            'meditation': 'om',
            'reading': 'book',
            'sleep': 'bed',
            'gratitude': 'heart',
            'journaling': 'pencil-alt',
            'nature_time': 'leaf',
            'digital_detox': 'power-off'
        };
        
        // Default icon
        const defaultIcon = 'check-circle';
        
        // Create a list group
        const listGroup = document.createElement('ul');
        listGroup.className = 'list-group';
        
        // Limit to the 5 most recent conditions
        const recentLimit = 5;
        const limitedConditions = recentConditions.slice(0, recentLimit);
        
        // Add a header showing how many conditions are displayed
        const headerItem = document.createElement('li');
        headerItem.className = 'list-group-item d-flex justify-content-between align-items-center';
        headerItem.innerHTML = `
            <span>Recent Conditions</span>
            <span class="badge bg-success rounded-pill">${limitedConditions.length} of ${recentConditions.length}</span>
        `;
        listGroup.appendChild(headerItem);
        
        limitedConditions.forEach(condition => {
            // Find condition type to get unit
            const conditionType = conditionTypes.find(t => t.name === condition.type_name);
            const unit = conditionType ? conditionType.unit : '';
            
            // Format date
            const date = new Date(condition.date_logged);
            
            // Get display name from condition type if available
            let displayName;
            
            if (conditionType && conditionType.display_name) {
                displayName = conditionType.display_name;
            } else {
                // Fallback to formatted name
                displayName = condition.type_name
                    .replace(/_/g, ' ')
                    .replace(/\b\w/g, l => l.toUpperCase());
            }
                
            // Get icon for this type or use default
            const icon = typeIcons[condition.type_name] || defaultIcon;
            
            // Calculate time elapsed
            const timeElapsed = getTimeElapsed(date);
            
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item condition-card';
            
            // Get a color based on condition type for visual variety
            const typeColors = {
                'water_intake': '#56CCF2',
                'focus_time': '#9B51E0',
                'deep_work': '#2D9CDB',
                'sunlight': '#F2C94C',
                'exercise': '#EB5757',
                'meditation': '#BB6BD9',
                'reading': '#6FCF97',
                'sleep': '#6B7FD9',
                'gratitude': '#F2994A',
                'journaling': '#27AE60',
                'nature_time': '#219653',
                'digital_detox': '#828282'
            };
            
            // Get color for this condition or use default
            const color = typeColors[condition.type_name] || '#4CAF50';
            
            listItem.innerHTML = `
                <div class="condition-card-content">
                    <div class="condition-header">
                        <div class="condition-icon-container" style="background-color: ${color}20; border-color: ${color}">
                            <i class="fas fa-${icon}" style="color: ${color}"></i>
                        </div>
                        <div class="condition-info">
                            <span class="condition-name">${displayName}</span>
                            <div class="condition-time">${timeElapsed}</div>
                        </div>
                    </div>
                    <div class="condition-value-container">
                        <span class="condition-value" style="background-color: ${color}; box-shadow: 0 0 10px ${color}80">
                            ${condition.value} ${unit}
                        </span>
                    </div>
                </div>
            `;
            
            listGroup.appendChild(listItem);
        });
        
        // Add "View All" button if there are more conditions
        if (recentConditions.length > recentLimit) {
            const viewAllItem = document.createElement('li');
            viewAllItem.className = 'list-group-item text-center';
            viewAllItem.innerHTML = `
                <button class="btn btn-sm btn-outline-success" id="view-all-conditions-btn">
                    <i class="fas fa-list me-1"></i> View All ${recentConditions.length} Conditions
                </button>
            `;
            listGroup.appendChild(viewAllItem);
            
            // Add event listener after appending to DOM
            setTimeout(() => {
                const viewAllBtn = document.getElementById('view-all-conditions-btn');
                if (viewAllBtn) {
                    viewAllBtn.addEventListener('click', function() {
                        // Show modal with all conditions or navigate to conditions page
                        showNotification('Viewing all conditions feature coming soon!', 'info');
                    });
                }
            }, 0);
        }
        
        recentConditionsList.appendChild(listGroup);
    }
    
    // Enhanced function to get human-readable time elapsed with more precise formatting
    function getTimeElapsed(date) {
        const now = new Date();
        const diffInSeconds = Math.floor((now - date) / 1000);
        
        // Format the actual time
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const formattedHours = hours % 12 || 12; // Convert to 12-hour format
        const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
        const timeString = `${formattedHours}:${formattedMinutes} ${ampm}`;
        
        // Get day name
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const dayName = days[date.getDay()];
        
        // Format based on time elapsed
        if (diffInSeconds < 60) {
            return `<span class="time-highlight">Just now</span> at ${timeString}`;
        }
        
        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `<span class="time-highlight">${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago</span> at ${timeString}`;
        }
        
        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `<span class="time-highlight">${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago</span> at ${timeString}`;
        }
        
        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays === 1) {
            return `<span class="time-highlight">Yesterday</span> at ${timeString}`;
        }
        
        if (diffInDays < 7) {
            return `<span class="time-highlight">${dayName}</span> at ${timeString}`;
        }
        
        if (diffInDays < 30) {
            return `<span class="time-highlight">${diffInDays} days ago</span> on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${timeString}`;
        }
        
        const diffInMonths = Math.floor(diffInDays / 30);
        if (diffInMonths < 12) {
            return `<span class="time-highlight">${diffInMonths} month${diffInMonths > 1 ? 's' : ''} ago</span> on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
        }
        
        const diffInYears = Math.floor(diffInMonths / 12);
        return `<span class="time-highlight">${diffInYears} year${diffInYears > 1 ? 's' : ''} ago</span> on ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
    }
    
    async function handleLogCondition(event) {
        event.preventDefault();
        
        const typeSelect = document.getElementById('condition-type');
        const valueInput = document.getElementById('condition-value');
        
        const typeName = typeSelect.value;
        const value = parseFloat(valueInput.value);
        
        if (!typeName || isNaN(value)) {
            showNotification('Please select a condition type and enter a valid value', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/conditions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ type_name: typeName, value })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Reset form
                valueInput.value = '';
                
                // Refresh conditions list
                await fetchRecentConditions();
                
                // Show success message
                showNotification('Condition logged successfully!', 'success');
                
                // Close modal if it exists
                const modal = bootstrap.Modal.getInstance(document.getElementById('log-condition-modal'));
                if (modal) {
                    modal.hide();
                }
                
                // Refresh plants to show changes
                if (typeof fetchPlants === 'function') {
                    await fetchPlants();
                }
            } else {
                showNotification(data.message || 'Failed to log condition', 'error');
            }
        } catch (error) {
            console.error('Error logging condition:', error);
            showNotification('Failed to log condition', 'error');
        }
    }
    
    async function handleAddConditionType(event) {
        event.preventDefault();
        
        const nameInput = document.getElementById('condition-type-name');
        const descriptionInput = document.getElementById('condition-type-description');
        const unitInput = document.getElementById('condition-type-unit');
        const goalInput = document.getElementById('condition-type-goal');
        
        const name = nameInput.value.trim().toLowerCase().replace(/\s+/g, '_');
        const description = descriptionInput.value.trim();
        const unit = unitInput.value.trim();
        const goal = goalInput.value ? parseFloat(goalInput.value) : null;
        
        if (!name || !description || !unit) {
            showNotification('Please fill in all required fields', 'warning');
            return;
        }
        
        try {
            const response = await fetch('/api/condition-types', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, description, unit, default_goal: goal })
            });
            
            const data = await response.json();
            
            if (data.success) {
                // Reset form
                nameInput.value = '';
                descriptionInput.value = '';
                unitInput.value = '';
                goalInput.value = '';
                
                // Refresh condition types
                await fetchConditionTypes();
                
                // Show success message
                showNotification('Custom condition type created!', 'success');
                
                // Close modal if it exists
                const modal = bootstrap.Modal.getInstance(document.getElementById('add-condition-type-modal'));
                if (modal) {
                    modal.hide();
                }
            } else {
                showNotification(data.message || 'Failed to create condition type', 'error');
            }
        } catch (error) {
            console.error('Error creating condition type:', error);
            showNotification('Failed to create condition type', 'error');
        }
    }
    
    function showNotification(message, type = 'info') {
        // Get or create notifications container
        let notificationsContainer = document.getElementById('notifications-container');
        if (!notificationsContainer) {
            notificationsContainer = document.createElement('div');
            notificationsContainer.id = 'notifications-container';
            notificationsContainer.className = 'position-fixed top-0 end-0 p-3';
            notificationsContainer.style.zIndex = '1050';
            document.body.appendChild(notificationsContainer);
        }
        
        // Create toast element
        const toastId = 'toast-' + Date.now();
        const toast = document.createElement('div');
        toast.id = toastId;
        toast.className = `toast align-items-center text-white bg-${type === 'error' ? 'danger' : type}`;
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
        
        // Add toast to container
        notificationsContainer.appendChild(toast);
        
        // Initialize and show toast
        const toastInstance = new bootstrap.Toast(toast, {
            autohide: true,
            delay: 5000
        });
        toastInstance.show();
        
        // Remove toast after hiding
        toast.addEventListener('hidden.bs.toast', function() {
            toast.remove();
        });
    }
});
