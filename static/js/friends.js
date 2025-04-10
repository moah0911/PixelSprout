/**
 * Friends functionality for PixelSprout
 * Handles friend search, requests, connections, and garden viewing
 */

document.addEventListener('DOMContentLoaded', function() {
    // DOM Elements
    const searchForm = document.getElementById('friend-search-form');
    const searchInput = document.getElementById('friend-username');
    const searchResults = document.getElementById('search-results');
    const friendsList = document.getElementById('friends-list');
    const friendRequestsList = document.getElementById('friend-requests-list');
    const pendingRequestsList = document.getElementById('pending-requests-list');
    const friendsCount = document.getElementById('friends-count');
    const requestsCount = document.getElementById('requests-count');
    const friendGardenModal = document.getElementById('friend-garden-modal');
    const friendGardenContainer = document.getElementById('friend-garden-container');
    const friendGardenTitle = document.getElementById('friend-garden-title');
    
    // Initialize friends page
    initFriendsPage();
    
    // Event listeners
    if (searchForm) {
        searchForm.addEventListener('submit', handleFriendSearch);
    }
    
    // Initialize the friends page
    async function initFriendsPage() {
        await Promise.all([
            loadFriends(),
            loadFriendRequests(),
            loadPendingRequests()
        ]);
        
        // Add event listeners for friend actions
        addFriendActionListeners();
    }
    
    // Load friends list
    async function loadFriends() {
        if (!friendsList) return;
        
        try {
            showLoadingState(friendsList, 'Loading your friends...');
            
            const response = await fetch('/api/friends');
            const data = await response.json();
            
            if (data.success) {
                renderFriendsList(data.friends);
                updateFriendsCount(data.friends.length);
            } else {
                showErrorState(friendsList, 'Failed to load friends');
            }
        } catch (error) {
            console.error('Error loading friends:', error);
            showErrorState(friendsList, 'Failed to load friends');
        }
    }
    
    // Load friend requests
    async function loadFriendRequests() {
        if (!friendRequestsList) return;
        
        try {
            showLoadingState(friendRequestsList, 'Loading friend requests...');
            
            const response = await fetch('/api/friends/requests');
            const data = await response.json();
            
            if (data.success) {
                renderFriendRequestsList(data.friend_requests);
                updateRequestsCount(data.friend_requests.length);
            } else {
                showErrorState(friendRequestsList, 'Failed to load friend requests');
            }
        } catch (error) {
            console.error('Error loading friend requests:', error);
            showErrorState(friendRequestsList, 'Failed to load friend requests');
        }
    }
    
    // Load pending friend requests (sent by current user)
    async function loadPendingRequests() {
        if (!pendingRequestsList) return;
        
        try {
            showLoadingState(pendingRequestsList, 'Loading pending requests...');
            
            const response = await fetch('/api/friends/pending');
            const data = await response.json();
            
            if (data.success) {
                renderPendingRequestsList(data.pending_requests);
            } else {
                showErrorState(pendingRequestsList, 'Failed to load pending requests');
            }
        } catch (error) {
            console.error('Error loading pending requests:', error);
            showErrorState(pendingRequestsList, 'Failed to load pending requests');
        }
    }
    
    // Render friends list
    function renderFriendsList(friends) {
        if (!friendsList) return;
        
        if (friends.length === 0) {
            friendsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-user-friends"></i>
                    </div>
                    <p class="empty-state-text">You don't have any friends yet.</p>
                    <p class="empty-state-subtext">Search for users to add friends!</p>
                </div>
            `;
            return;
        }
        
        friendsList.innerHTML = '';
        
        // Create a row for the friends grid
        const friendsGrid = document.createElement('div');
        friendsGrid.className = 'row g-3';
        
        friends.forEach(friend => {
            const friendCard = createFriendCard(friend);
            friendsGrid.appendChild(friendCard);
        });
        
        friendsList.appendChild(friendsGrid);
    }
    
    // Create a friend card
    function createFriendCard(friend) {
        const col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';
        
        // Format date
        const joinDate = new Date(friend.created_at);
        const formattedDate = joinDate.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
        
        // Get garden score info
        const gardenScore = friend.garden_score || 0;
        const scoreLevel = getScoreLevel(gardenScore);
        
        col.innerHTML = `
            <div class="friend-card">
                <div class="friend-card-header">
                    <div class="friend-avatar">
                        <div class="avatar-circle" style="background-color: ${getAvatarColor(friend.username)}">
                            ${friend.username.charAt(0).toUpperCase()}
                        </div>
                        <div class="friend-status online"></div>
                    </div>
                    <div class="friend-info">
                        <h5 class="friend-name">${friend.username}</h5>
                        <div class="friend-meta">
                            <span class="friend-level">${scoreLevel}</span>
                            <span class="friend-joined">Joined ${formattedDate}</span>
                        </div>
                    </div>
                </div>
                <div class="friend-card-body">
                    <div class="friend-stats">
                        <div class="stat">
                            <i class="fas fa-seedling"></i>
                            <span>${friend.plants_count || 0} Plants</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-tint"></i>
                            <span>${friend.water_credits} Credits</span>
                        </div>
                        <div class="stat">
                            <i class="fas fa-star"></i>
                            <span>${gardenScore} Points</span>
                        </div>
                    </div>
                </div>
                <div class="friend-card-footer">
                    <button class="btn btn-sm btn-outline-success view-garden-btn" data-friend-id="${friend.id}" data-friend-name="${friend.username}">
                        <i class="fas fa-seedling me-1"></i> View Garden
                    </button>
                    <button class="btn btn-sm btn-outline-danger remove-friend-btn" data-friend-id="${friend.id}">
                        <i class="fas fa-user-minus me-1"></i> Remove
                    </button>
                </div>
            </div>
        `;
        
        return col;
    }
    
    // Render friend requests list
    function renderFriendRequestsList(requests) {
        if (!friendRequestsList) return;
        
        if (requests.length === 0) {
            friendRequestsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-inbox"></i>
                    </div>
                    <p class="empty-state-text">No pending friend requests</p>
                </div>
            `;
            return;
        }
        
        friendRequestsList.innerHTML = '';
        
        requests.forEach(request => {
            const requestItem = document.createElement('div');
            requestItem.className = 'friend-request-item';
            
            // Format date
            const requestDate = new Date(request.created_at);
            const formattedDate = requestDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            requestItem.innerHTML = `
                <div class="friend-request-content">
                    <div class="friend-request-avatar">
                        <div class="avatar-circle" style="background-color: ${getAvatarColor(request.requester_username)}">
                            ${request.requester_username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="friend-request-info">
                        <div class="friend-request-name">${request.requester_username}</div>
                        <div class="friend-request-time">${formattedDate}</div>
                    </div>
                </div>
                <div class="friend-request-actions">
                    <button class="btn btn-sm btn-success accept-request" data-request-id="${request.id}">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger decline-request" data-request-id="${request.id}">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
            
            friendRequestsList.appendChild(requestItem);
        });
    }
    
    // Render pending requests list
    function renderPendingRequestsList(requests) {
        if (!pendingRequestsList) return;
        
        if (requests.length === 0) {
            pendingRequestsList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-paper-plane"></i>
                    </div>
                    <p class="empty-state-text">No pending sent requests</p>
                </div>
            `;
            return;
        }
        
        pendingRequestsList.innerHTML = '';
        
        requests.forEach(request => {
            const requestItem = document.createElement('div');
            requestItem.className = 'pending-request-item';
            
            // Format date
            const requestDate = new Date(request.created_at);
            const formattedDate = requestDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
            
            requestItem.innerHTML = `
                <div class="pending-request-content">
                    <div class="pending-request-avatar">
                        <div class="avatar-circle" style="background-color: ${getAvatarColor(request.addressee_username)}">
                            ${request.addressee_username.charAt(0).toUpperCase()}
                        </div>
                    </div>
                    <div class="pending-request-info">
                        <div class="pending-request-name">${request.addressee_username}</div>
                        <div class="pending-request-time">Sent on ${formattedDate}</div>
                    </div>
                </div>
                <div class="pending-request-actions">
                    <button class="btn btn-sm btn-outline-danger cancel-request" data-request-id="${request.id}">
                        <i class="fas fa-times me-1"></i> Cancel
                    </button>
                </div>
            `;
            
            pendingRequestsList.appendChild(requestItem);
        });
    }
    
    // Handle friend search
    async function handleFriendSearch(e) {
        e.preventDefault();
        
        const username = searchInput.value.trim();
        if (!username) return;
        
        try {
            showLoadingState(searchResults, 'Searching...');
            
            const response = await fetch(`/api/friends/search?username=${encodeURIComponent(username)}`);
            const data = await response.json();
            
            if (data.success) {
                renderSearchResults(data.users);
            } else {
                showErrorState(searchResults, data.message || 'No users found');
            }
        } catch (error) {
            console.error('Error searching for friends:', error);
            showErrorState(searchResults, 'Error searching for users');
        }
    }
    
    // Render search results
    function renderSearchResults(users) {
        if (!searchResults) return;
        
        if (users.length === 0) {
            searchResults.innerHTML = `
                <div class="alert alert-info">
                    No users found with that username.
                </div>
            `;
            return;
        }
        
        searchResults.innerHTML = '';
        
        users.forEach(user => {
            const userItem = document.createElement('div');
            userItem.className = 'search-result-item';
            
            // Determine if this user is already a friend or has a pending request
            let actionButton = '';
            
            if (user.is_friend) {
                actionButton = `
                    <button class="btn btn-sm btn-success" disabled>
                        <i class="fas fa-check me-1"></i> Friends
                    </button>
                `;
            } else if (user.has_pending_request) {
                actionButton = `
                    <button class="btn btn-sm btn-secondary" disabled>
                        <i class="fas fa-clock me-1"></i> Pending
                    </button>
                `;
            } else {
                actionButton = `
                    <button class="btn btn-sm btn-primary add-friend-btn" data-user-id="${user.id}">
                        <i class="fas fa-user-plus me-1"></i> Add Friend
                    </button>
                `;
            }
            
            userItem.innerHTML = `
                <div class="search-result-avatar">
                    <div class="avatar-circle" style="background-color: ${getAvatarColor(user.username)}">
                        ${user.username.charAt(0).toUpperCase()}
                    </div>
                </div>
                <div class="search-result-info">
                    <div class="search-result-name">${user.username}</div>
                    <div class="search-result-meta">Garden Score: ${user.garden_score || 0}</div>
                </div>
                <div class="search-result-actions">
                    ${actionButton}
                </div>
            `;
            
            searchResults.appendChild(userItem);
        });
        
        // Add event listeners to the add friend buttons
        const addFriendButtons = searchResults.querySelectorAll('.add-friend-btn');
        addFriendButtons.forEach(button => {
            button.addEventListener('click', handleAddFriend);
        });
    }
    
    // Handle adding a friend
    async function handleAddFriend(e) {
        const userId = e.currentTarget.getAttribute('data-user-id');
        
        try {
            e.currentTarget.disabled = true;
            e.currentTarget.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Sending...';
            
            const response = await fetch('/api/friends/request', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ addressee_id: userId })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                e.currentTarget.innerHTML = '<i class="fas fa-check me-1"></i> Request Sent';
                e.currentTarget.classList.remove('btn-primary');
                e.currentTarget.classList.add('btn-secondary');
                
                // Reload pending requests
                loadPendingRequests();
            } else {
                showNotification(data.message, 'error');
                e.currentTarget.disabled = false;
                e.currentTarget.innerHTML = '<i class="fas fa-user-plus me-1"></i> Add Friend';
            }
        } catch (error) {
            console.error('Error adding friend:', error);
            showNotification('Error sending friend request', 'error');
            e.currentTarget.disabled = false;
            e.currentTarget.innerHTML = '<i class="fas fa-user-plus me-1"></i> Add Friend';
        }
    }
    
    // Add event listeners for friend actions
    function addFriendActionListeners() {
        // Event delegation for friend requests list
        if (friendRequestsList) {
            friendRequestsList.addEventListener('click', async function(e) {
                // Accept friend request
                if (e.target.closest('.accept-request')) {
                    const button = e.target.closest('.accept-request');
                    const requestId = button.getAttribute('data-request-id');
                    await handleFriendRequestResponse(requestId, true, button);
                }
                
                // Decline friend request
                if (e.target.closest('.decline-request')) {
                    const button = e.target.closest('.decline-request');
                    const requestId = button.getAttribute('data-request-id');
                    await handleFriendRequestResponse(requestId, false, button);
                }
            });
        }
        
        // Event delegation for pending requests list
        if (pendingRequestsList) {
            pendingRequestsList.addEventListener('click', async function(e) {
                // Cancel friend request
                if (e.target.closest('.cancel-request')) {
                    const button = e.target.closest('.cancel-request');
                    const requestId = button.getAttribute('data-request-id');
                    await handleCancelRequest(requestId, button);
                }
            });
        }
        
        // Event delegation for friends list
        if (friendsList) {
            friendsList.addEventListener('click', async function(e) {
                // View friend's garden
                if (e.target.closest('.view-garden-btn')) {
                    const button = e.target.closest('.view-garden-btn');
                    const friendId = button.getAttribute('data-friend-id');
                    const friendName = button.getAttribute('data-friend-name');
                    await loadFriendGarden(friendId, friendName);
                }
                
                // Remove friend
                if (e.target.closest('.remove-friend-btn')) {
                    const button = e.target.closest('.remove-friend-btn');
                    const friendId = button.getAttribute('data-friend-id');
                    await handleRemoveFriend(friendId, button);
                }
            });
        }
    }
    
    // Handle friend request response (accept/decline)
    async function handleFriendRequestResponse(requestId, accept, button) {
        try {
            button.disabled = true;
            
            if (accept) {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            } else {
                button.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
            }
            
            const response = await fetch('/api/friends/respond', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    friendship_id: requestId,
                    accept: accept
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove the request item from the list
                const requestItem = button.closest('.friend-request-item');
                requestItem.classList.add('fade-out');
                
                setTimeout(() => {
                    requestItem.remove();
                    
                    // Check if there are no more requests
                    if (friendRequestsList.children.length === 0) {
                        renderFriendRequestsList([]);
                    }
                    
                    // Update the requests count
                    updateRequestsCount(friendRequestsList.querySelectorAll('.friend-request-item').length);
                    
                    // If accepted, reload friends list
                    if (accept) {
                        loadFriends();
                    }
                }, 300);
            } else {
                showNotification(data.message, 'error');
                button.disabled = false;
                button.innerHTML = accept ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
            }
        } catch (error) {
            console.error('Error responding to friend request:', error);
            showNotification('Error responding to friend request', 'error');
            button.disabled = false;
            button.innerHTML = accept ? '<i class="fas fa-check"></i>' : '<i class="fas fa-times"></i>';
        }
    }
    
    // Handle canceling a friend request
    async function handleCancelRequest(requestId, button) {
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Canceling...';
            
            const response = await fetch(`/api/friends/cancel/${requestId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove the request item from the list
                const requestItem = button.closest('.pending-request-item');
                requestItem.classList.add('fade-out');
                
                setTimeout(() => {
                    requestItem.remove();
                    
                    // Check if there are no more requests
                    if (pendingRequestsList.children.length === 0) {
                        renderPendingRequestsList([]);
                    }
                }, 300);
            } else {
                showNotification(data.message, 'error');
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-times me-1"></i> Cancel';
            }
        } catch (error) {
            console.error('Error canceling friend request:', error);
            showNotification('Error canceling friend request', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-times me-1"></i> Cancel';
        }
    }
    
    // Handle removing a friend
    async function handleRemoveFriend(friendId, button) {
        // Show confirmation dialog
        if (!confirm('Are you sure you want to remove this friend?')) {
            return;
        }
        
        try {
            button.disabled = true;
            button.innerHTML = '<i class="fas fa-spinner fa-spin me-1"></i> Removing...';
            
            const response = await fetch(`/api/friends/remove/${friendId}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            const data = await response.json();
            
            if (data.success) {
                showNotification(data.message, 'success');
                
                // Remove the friend card from the list
                const friendCard = button.closest('.col-md-6');
                friendCard.classList.add('fade-out');
                
                setTimeout(() => {
                    friendCard.remove();
                    
                    // Check if there are no more friends
                    if (friendsList.querySelector('.row').children.length === 0) {
                        renderFriendsList([]);
                    }
                    
                    // Update the friends count
                    updateFriendsCount(friendsList.querySelectorAll('.friend-card').length);
                }, 300);
            } else {
                showNotification(data.message, 'error');
                button.disabled = false;
                button.innerHTML = '<i class="fas fa-user-minus me-1"></i> Remove';
            }
        } catch (error) {
            console.error('Error removing friend:', error);
            showNotification('Error removing friend', 'error');
            button.disabled = false;
            button.innerHTML = '<i class="fas fa-user-minus me-1"></i> Remove';
        }
    }
    
    // Load friend's garden
    async function loadFriendGarden(friendId, friendName) {
        if (!friendGardenModal || !friendGardenContainer) return;
        
        try {
            // Show loading state
            friendGardenContainer.innerHTML = `
                <div class="text-center p-5">
                    <div class="spinner-border text-success" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                    <p class="text-muted mt-3">Loading ${friendName}'s garden...</p>
                </div>
            `;
            
            // Set the modal title
            if (friendGardenTitle) {
                friendGardenTitle.textContent = `${friendName}'s Garden`;
            }
            
            // Show the modal
            const modal = new bootstrap.Modal(friendGardenModal);
            modal.show();
            
            // Fetch the friend's garden data
            const response = await fetch(`/api/friends/${friendId}/garden`);
            const data = await response.json();
            
            if (data.success) {
                renderFriendGarden(data.plants, friendName);
            } else {
                friendGardenContainer.innerHTML = `
                    <div class="alert alert-danger">
                        ${data.message || 'Failed to load garden'}
                    </div>
                `;
            }
        } catch (error) {
            console.error('Error loading friend garden:', error);
            friendGardenContainer.innerHTML = `
                <div class="alert alert-danger">
                    Error loading garden. Please try again.
                </div>
            `;
        }
    }
    
    // Render friend's garden
    function renderFriendGarden(plants, friendName) {
        if (!friendGardenContainer) return;
        
        if (plants.length === 0) {
            friendGardenContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <p class="empty-state-text">${friendName} doesn't have any plants yet.</p>
                </div>
            `;
            return;
        }
        
        // Create a grid for the plants
        const plantsGrid = document.createElement('div');
        plantsGrid.className = 'row g-3';
        
        plants.forEach(plant => {
            const plantCard = createFriendPlantCard(plant);
            plantsGrid.appendChild(plantCard);
        });
        
        friendGardenContainer.innerHTML = '';
        friendGardenContainer.appendChild(plantsGrid);
    }
    
    // Create a plant card for friend's garden
    function createFriendPlantCard(plant) {
        const col = document.createElement('div');
        col.className = 'col-md-4';
        
        // Calculate health class
        let healthClass = 'bg-success';
        if (plant.health < 75) healthClass = 'bg-info';
        if (plant.health < 50) healthClass = 'bg-warning';
        if (plant.health < 25) healthClass = 'bg-danger';
        
        // Get stage name
        const stageNames = ['Seed', 'Sprout', 'Growing', 'Mature', 'Flowering', 'Withering', 'Dead'];
        const stageName = stageNames[plant.stage] || 'Unknown';
        
        // Format dates
        const createdDate = new Date(plant.created_at);
        const lastWateredDate = new Date(plant.last_watered);
        
        col.innerHTML = `
            <div class="card plant-card">
                <div class="card-body text-center">
                    <div class="plant-visual mb-3">
                        <div class="plant-container" data-plant-type="${plant.type}" data-plant-stage="${plant.stage}">
                            <!-- Plant SVG will be inserted by JavaScript -->
                        </div>
                    </div>
                    <h5 class="card-title">${plant.name}</h5>
                    <div class="plant-type-badge">${plant.type}</div>
                    <div class="plant-stage-badge">${stageName}</div>
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
                        Last Watered: ${formatTimeAgo(lastWateredDate)}
                    </div>
                </div>
            </div>
        `;
        
        // Add plant SVG
        setTimeout(() => {
            const plantContainer = col.querySelector('.plant-container');
            if (plantContainer) {
                plantContainer.innerHTML = getPlantSvg(plant.type, plant.stage);
            }
        }, 0);
        
        return col;
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
    
    // Update friends count
    function updateFriendsCount(count) {
        if (friendsCount) {
            friendsCount.textContent = count;
        }
    }
    
    // Update requests count
    function updateRequestsCount(count) {
        if (requestsCount) {
            requestsCount.textContent = count;
            
            // Show/hide the badge based on count
            if (count > 0) {
                requestsCount.classList.remove('d-none');
            } else {
                requestsCount.classList.add('d-none');
            }
        }
    }
    
    // Show loading state
    function showLoadingState(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="text-center p-4">
                <div class="spinner-border text-success" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="text-muted mt-2">${message}</p>
            </div>
        `;
    }
    
    // Show error state
    function showErrorState(container, message) {
        if (!container) return;
        
        container.innerHTML = `
            <div class="alert alert-danger">
                <i class="fas fa-exclamation-circle me-2"></i> ${message}
            </div>
        `;
    }
    
    // Get avatar color based on username
    function getAvatarColor(username) {
        const colors = [
            '#4CAF50', '#2196F3', '#9C27B0', '#F44336', '#FF9800',
            '#009688', '#673AB7', '#3F51B5', '#E91E63', '#FFC107'
        ];
        
        // Simple hash function to get consistent color for a username
        let hash = 0;
        for (let i = 0; i < username.length; i++) {
            hash = username.charCodeAt(i) + ((hash << 5) - hash);
        }
        
        return colors[Math.abs(hash) % colors.length];
    }
    
    // Get score level based on garden score
    function getScoreLevel(score) {
        const levels = {
            0: "Seed Starter",
            100: "Sprout Nurturer",
            500: "Growth Enthusiast",
            1000: "Plant Master",
            2500: "Garden Sage",
            5000: "Nature Whisperer",
            10000: "Botanical Legend",
            25000: "Garden God"
        };
        
        // Find appropriate level
        let level = "Seed Starter";  // Default
        for (const threshold of Object.keys(levels).sort((a, b) => b - a)) {
            if (score >= threshold) {
                level = levels[threshold];
                break;
            }
        }
        
        return level;
    }
    
    // Format time ago
    function formatTimeAgo(date) {
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
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Check if the showNotification function exists globally
        if (typeof window.showNotification === 'function') {
            window.showNotification(message, type);
        } else {
            // Fallback to alert if the function doesn't exist
            alert(message);
        }
    }
});