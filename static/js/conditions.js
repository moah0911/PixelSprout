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
        
        conditionTypeSelect.innerHTML = '';
        
        // Sort condition types: system first, then user-defined
        const sortedTypes = [...conditionTypes].sort((a, b) => {
            if (a.is_custom && !b.is_custom) return 1;
            if (!a.is_custom && b.is_custom) return -1;
            return a.name.localeCompare(b.name);
        });
        
        sortedTypes.forEach(type => {
            const option = document.createElement('option');
            option.value = type.name;
            
            // Format name for display
            const displayName = type.name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
                
            option.textContent = displayName + (type.is_custom ? ' (Custom)' : '');
            conditionTypeSelect.appendChild(option);
        });
        
        // Update unit label after populating select
        updateUnitLabel();
    }
    
    function updateUnitLabel() {
        if (!conditionTypeSelect) return;
        
        const selectedTypeName = conditionTypeSelect.value;
        const selectedType = conditionTypes.find(type => type.name === selectedTypeName);
        
        const unitLabel = document.getElementById('condition-unit-label');
        if (unitLabel && selectedType) {
            unitLabel.textContent = selectedType.unit;
        }
        
        // Update goal hint if available
        const goalHint = document.getElementById('condition-goal-hint');
        if (goalHint && selectedType && selectedType.default_goal) {
            goalHint.textContent = `Suggested goal: ${selectedType.default_goal} ${selectedType.unit}`;
            goalHint.classList.remove('d-none');
        } else if (goalHint) {
            goalHint.classList.add('d-none');
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
        
        recentConditions.forEach(condition => {
            // Find condition type to get unit
            const conditionType = conditionTypes.find(t => t.name === condition.type_name);
            const unit = conditionType ? conditionType.unit : '';
            
            // Format date
            const date = new Date(condition.date_logged);
            const formattedDate = date.toLocaleString();
            
            // Format name for display
            const displayName = condition.type_name
                .replace(/_/g, ' ')
                .replace(/\b\w/g, l => l.toUpperCase());
            
            const listItem = document.createElement('li');
            listItem.className = 'list-group-item d-flex justify-content-between align-items-center';
            listItem.innerHTML = `
                <div>
                    <span class="fw-bold">${displayName}</span>
                    <br>
                    <small class="text-muted">${formattedDate}</small>
                </div>
                <span class="badge bg-primary rounded-pill">${condition.value} ${unit}</span>
            `;
            
            recentConditionsList.appendChild(listItem);
        });
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
