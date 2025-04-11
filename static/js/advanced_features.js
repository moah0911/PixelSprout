/**
 * PixelSprout Advanced Features Integration
 * 
 * This file integrates all the advanced features into the main application:
 * - Interactive Growth System
 * - AI Plant Advisor
 * - 3D Plant Visualization
 * - Gamification System
 */

class AdvancedFeatures {
    constructor() {
        // Feature instances
        this.interactiveGrowth = null;
        this.aiAdvisor = null;
        this.plant3DVisualizer = null;
        this.gamification = null;
        
        // State
        this.isInitialized = false;
        this.currentPlant = null;
        this.userPreferences = {
            enableInteractiveEffects: true,
            enableAIAdvisor: true,
            enable3DVisualization: true,
            enableGamification: true,
            enableSoundEffects: true,
            enableVoiceInterface: false,
            enableNotifications: true,
            enableConfetti: true,
            enableWeatherEffects: true,
            enableMoodTracking: true
        };
        
        // Containers
        this.containers = {
            garden: document.getElementById('garden-container'),
            plant3D: document.getElementById('plant-3d-container'),
            aiAdvisor: document.getElementById('ai-advisor-container'),
            notifications: document.getElementById('notification-container'),
            badges: document.getElementById('badge-container'),
            level: document.getElementById('level-container'),
            challenges: document.getElementById('challenge-container'),
            rewards: document.getElementById('reward-container')
        };
        
        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.loadUserPreferences = this.loadUserPreferences.bind(this);
        this.saveUserPreferences = this.saveUserPreferences.bind(this);
        this.initializeInteractiveGrowth = this.initializeInteractiveGrowth.bind(this);
        this.initializeAIAdvisor = this.initializeAIAdvisor.bind(this);
        this.initialize3DVisualizer = this.initialize3DVisualizer.bind(this);
        this.initializeGamification = this.initializeGamification.bind(this);
        this.handlePlantSelection = this.handlePlantSelection.bind(this);
        this.handlePlantInteraction = this.handlePlantInteraction.bind(this);
        this.handleHabitCompletion = this.handleHabitCompletion.bind(this);
        this.handleAIAdvisorAction = this.handleAIAdvisorAction.bind(this);
        this.handleWaterPlant = this.handleWaterPlant.bind(this);
        this.setupEventListeners = this.setupEventListeners.bind(this);
    }

    /**
     * Initialize all advanced features
     * @returns {Promise} Initialization promise
     */
    async initialize() {
        if (this.isInitialized) return Promise.resolve();
        
        try {
            console.log("Initializing PixelSprout Advanced Features...");
            
            // Check if user is logged in
            const isLoggedIn = this.checkUserLoggedIn();
            
            if (!isLoggedIn) {
                console.log("User not logged in. Advanced features disabled.");
                return Promise.resolve();
            }
            
            try {
                // Load user preferences
                await this.loadUserPreferences();
            } catch (prefError) {
                console.warn("Error loading user preferences:", prefError);
                // Continue with default preferences
            }
            
            // Create containers if they don't exist
            try {
                this.createContainers();
            } catch (containerError) {
                console.warn("Error creating containers:", containerError);
                // Continue without containers
            }
            
            // Initialize features based on user preferences
            const initPromises = [];
            
            if (this.userPreferences.enableInteractiveEffects) {
                try {
                    initPromises.push(this.initializeInteractiveGrowth());
                } catch (growthError) {
                    console.warn("Error initializing interactive growth:", growthError);
                }
            }
            
            if (this.userPreferences.enableAIAdvisor) {
                try {
                    initPromises.push(this.initializeAIAdvisor());
                } catch (advisorError) {
                    console.warn("Error initializing AI advisor:", advisorError);
                }
            }
            
            if (this.userPreferences.enable3DVisualization) {
                try {
                    initPromises.push(this.initialize3DVisualizer());
                } catch (visualizerError) {
                    console.warn("Error initializing 3D visualizer:", visualizerError);
                }
            }
            
            if (this.userPreferences.enableGamification) {
                try {
                    initPromises.push(this.initializeGamification());
                } catch (gamificationError) {
                    console.warn("Error initializing gamification:", gamificationError);
                }
            }
            
            // Wait for all initializations to complete
            try {
                await Promise.all(initPromises);
            } catch (promiseError) {
                console.warn("Error during feature initialization:", promiseError);
                // Continue with partial initialization
            }
            
            // Set up event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log("PixelSprout Advanced Features initialized successfully");
            return Promise.resolve();
        } catch (error) {
            console.error(`Initialization error: ${error.message}`);
            return Promise.reject(error);
        }
    }
    
    /**
     * Check if user is logged in
     * @returns {boolean} True if user is logged in
     */
    checkUserLoggedIn() {
        // Check for login indicators in the DOM
        const userProfileElement = document.querySelector('.user-profile') || 
                                  document.querySelector('.profile-header') ||
                                  document.querySelector('.user-info');
                                  
        const logoutButton = document.querySelector('.logout-button') || 
                            document.querySelector('a[href="/logout"]');
                            
        const loginForm = document.querySelector('.login-form') ||
                         document.querySelector('form[action="/login"]');
                         
        // If login form is present, user is not logged in
        if (loginForm) {
            return false;
        }
        
        // If user profile or logout button exists, user is logged in
        if (userProfileElement || logoutButton) {
            return true;
        }
        
        // Check URL path - if on login or register page, user is not logged in
        const currentPath = window.location.pathname;
        if (currentPath.includes('/login') || 
            currentPath.includes('/register') || 
            currentPath.includes('/reset-password') ||
            currentPath === '/') {
            return false;
        }
        
        // Check for auth token in localStorage as a fallback
        const authToken = localStorage.getItem('pixelsprout_auth_token');
        return !!authToken;
    }

    /**
     * Create containers for features if they don't exist
     */
    createContainers() {
        // Check if we're on a login/register page
        const isLoginPage = window.location.pathname.includes('/login') || 
                           window.location.pathname.includes('/register') ||
                           window.location.pathname.includes('/reset-password') ||
                           window.location.pathname === '/';
                           
        // Don't create containers on login pages
        if (isLoginPage) {
            console.log("On login/register page. Skipping container creation.");
            return;
        }
        
        // Check if we're on a dashboard or garden page
        const isDashboardPage = window.location.pathname.includes('/dashboard') || 
                               window.location.pathname.includes('/garden') ||
                               window.location.pathname.includes('/plants') ||
                               window.location.pathname.includes('/profile');
                               
        // Create notification container
        if (!this.containers.notifications) {
            const notificationContainer = document.createElement('div');
            notificationContainer.id = 'notification-container';
            notificationContainer.style.position = 'fixed';
            notificationContainer.style.top = '20px';
            notificationContainer.style.right = '20px';
            notificationContainer.style.zIndex = '9999';
            document.body.appendChild(notificationContainer);
            this.containers.notifications = notificationContainer;
        }
        
        // Only create feature containers on dashboard/garden pages
        if (!isDashboardPage) {
            console.log("Not on dashboard/garden page. Skipping feature containers.");
            return;
        }
        
        // Create 3D visualization container if enabled
        if (this.userPreferences.enable3DVisualization && !this.containers.plant3D) {
            const plant3DContainer = document.createElement('div');
            plant3DContainer.id = 'plant-3d-container';
            plant3DContainer.style.width = '100%';
            plant3DContainer.style.height = '400px';
            plant3DContainer.style.borderRadius = '12px';
            plant3DContainer.style.overflow = 'hidden';
            plant3DContainer.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
            
            // Find a suitable location to insert it
            const gardenHeader = document.querySelector('.garden-header');
            if (gardenHeader) {
                gardenHeader.parentNode.insertBefore(plant3DContainer, gardenHeader.nextSibling);
            } else if (this.containers.garden) {
                this.containers.garden.parentNode.insertBefore(plant3DContainer, this.containers.garden);
            } else {
                const mainContent = document.querySelector('.main-content');
                if (mainContent) {
                    mainContent.insertBefore(plant3DContainer, mainContent.firstChild);
                } else {
                    document.body.appendChild(plant3DContainer);
                }
            }
            
            this.containers.plant3D = plant3DContainer;
        }
        
        // Create AI advisor container if enabled
        if (this.userPreferences.enableAIAdvisor && !this.containers.aiAdvisor) {
            const aiAdvisorContainer = document.createElement('div');
            aiAdvisorContainer.id = 'ai-advisor-container';
            aiAdvisorContainer.className = 'ai-advisor-container';
            aiAdvisorContainer.innerHTML = `
                <div class="ai-advisor-header">
                    <div class="ai-advisor-avatar">
                        <i class="fas fa-seedling"></i>
                    </div>
                    <div class="ai-advisor-title">
                        <h3>Sprout</h3>
                        <p>Your Plant Advisor</p>
                    </div>
                    <button class="ai-advisor-toggle">
                        <i class="fas fa-chevron-down"></i>
                    </button>
                </div>
                <div class="ai-advisor-content">
                    <div class="ai-advisor-recommendations"></div>
                    <div class="ai-advisor-input">
                        <input type="text" placeholder="Ask Sprout a question...">
                        <button class="ai-advisor-voice">
                            <i class="fas fa-microphone"></i>
                        </button>
                        <button class="ai-advisor-send">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            `;
            
            // Style the container
            const style = document.createElement('style');
            style.textContent = `
                .ai-advisor-container {
                    position: fixed;
                    bottom: 20px;
                    right: 20px;
                    width: 350px;
                    background: rgba(10, 31, 10, 0.9);
                    border-radius: 12px;
                    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.3);
                    overflow: hidden;
                    z-index: 1000;
                    backdrop-filter: blur(10px);
                    -webkit-backdrop-filter: blur(10px);
                    border: 1px solid rgba(76, 175, 80, 0.3);
                    transition: all 0.3s ease;
                }
                
                .ai-advisor-header {
                    display: flex;
                    align-items: center;
                    padding: 15px;
                    background: rgba(8, 32, 8, 0.8);
                    border-bottom: 1px solid rgba(76, 175, 80, 0.2);
                    cursor: pointer;
                }
                
                .ai-advisor-avatar {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    background: linear-gradient(135deg, #4CAF50, #2E7D32);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 15px;
                    font-size: 20px;
                    color: white;
                    box-shadow: 0 3px 10px rgba(46, 125, 50, 0.3);
                }
                
                .ai-advisor-title {
                    flex-grow: 1;
                }
                
                .ai-advisor-title h3 {
                    margin: 0;
                    font-size: 18px;
                    color: #e9ecef;
                }
                
                .ai-advisor-title p {
                    margin: 0;
                    font-size: 12px;
                    color: rgba(233, 236, 239, 0.7);
                }
                
                .ai-advisor-toggle {
                    background: none;
                    border: none;
                    color: #e9ecef;
                    cursor: pointer;
                    font-size: 16px;
                    transition: transform 0.3s ease;
                }
                
                .ai-advisor-content {
                    max-height: 400px;
                    overflow-y: auto;
                    padding: 15px;
                }
                
                .ai-advisor-recommendations {
                    margin-bottom: 15px;
                }
                
                .ai-advisor-input {
                    display: flex;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 20px;
                    padding: 5px;
                }
                
                .ai-advisor-input input {
                    flex-grow: 1;
                    background: none;
                    border: none;
                    padding: 8px 15px;
                    color: #e9ecef;
                    font-size: 14px;
                }
                
                .ai-advisor-input input:focus {
                    outline: none;
                }
                
                .ai-advisor-input button {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(76, 175, 80, 0.2);
                    border: none;
                    color: #4CAF50;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    margin-left: 5px;
                    transition: all 0.2s ease;
                }
                
                .ai-advisor-input button:hover {
                    background: rgba(76, 175, 80, 0.3);
                    transform: scale(1.05);
                }
                
                .ai-advisor-collapsed .ai-advisor-content {
                    display: none;
                }
                
                .ai-advisor-collapsed .ai-advisor-toggle i {
                    transform: rotate(180deg);
                }
                
                @media (max-width: 768px) {
                    .ai-advisor-container {
                        width: calc(100% - 40px);
                        bottom: 10px;
                        right: 20px;
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(aiAdvisorContainer);
            this.containers.aiAdvisor = aiAdvisorContainer;
            
            // Add toggle functionality
            const toggleButton = aiAdvisorContainer.querySelector('.ai-advisor-toggle');
            const header = aiAdvisorContainer.querySelector('.ai-advisor-header');
            
            const toggleAdvisor = () => {
                aiAdvisorContainer.classList.toggle('ai-advisor-collapsed');
            };
            
            toggleButton.addEventListener('click', toggleAdvisor);
            header.addEventListener('click', (e) => {
                if (e.target !== toggleButton && !toggleButton.contains(e.target)) {
                    toggleAdvisor();
                }
            });
            
            // Initially collapsed on mobile
            if (window.innerWidth <= 768) {
                aiAdvisorContainer.classList.add('ai-advisor-collapsed');
            }
        }
        
        // Create gamification containers if enabled
        if (this.userPreferences.enableGamification) {
            // Level container
            if (!this.containers.level) {
                const levelContainer = document.createElement('div');
                levelContainer.id = 'level-container';
                levelContainer.className = 'gamification-level-container';
                
                // Find a suitable location
                const userInfo = document.querySelector('.user-info') || document.querySelector('.profile-header');
                if (userInfo) {
                    userInfo.appendChild(levelContainer);
                } else {
                    const header = document.querySelector('header');
                    if (header) {
                        header.appendChild(levelContainer);
                    } else {
                        document.body.appendChild(levelContainer);
                    }
                }
                
                this.containers.level = levelContainer;
            }
            
            // Badges container
            if (!this.containers.badges) {
                const badgesContainer = document.createElement('div');
                badgesContainer.id = 'badge-container';
                badgesContainer.className = 'gamification-badges-container';
                
                // Find a suitable location
                const profileSection = document.querySelector('.profile-section') || document.querySelector('.user-achievements');
                if (profileSection) {
                    profileSection.appendChild(badgesContainer);
                } else {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        const badgesSection = document.createElement('div');
                        badgesSection.className = 'badges-section';
                        badgesSection.innerHTML = '<h3>Your Badges</h3>';
                        badgesSection.appendChild(badgesContainer);
                        mainContent.appendChild(badgesSection);
                    } else {
                        document.body.appendChild(badgesContainer);
                    }
                }
                
                this.containers.badges = badgesContainer;
            }
            
            // Challenges container - only on dashboard
            if (!this.containers.challenges && window.location.pathname.includes('/dashboard')) {
                const challengesContainer = document.createElement('div');
                challengesContainer.id = 'challenge-container';
                challengesContainer.className = 'gamification-challenges-container';
                
                // Find a suitable location
                const sidePanel = document.querySelector('.side-panel') || document.querySelector('.dashboard-sidebar');
                if (sidePanel) {
                    const challengesSection = document.createElement('div');
                    challengesSection.className = 'challenges-section';
                    challengesSection.innerHTML = '<h3>Active Challenges</h3>';
                    challengesSection.appendChild(challengesContainer);
                    sidePanel.appendChild(challengesSection);
                } else {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        const challengesSection = document.createElement('div');
                        challengesSection.className = 'challenges-section';
                        challengesSection.innerHTML = '<h3>Active Challenges</h3>';
                        challengesSection.appendChild(challengesSection);
                        mainContent.appendChild(challengesSection);
                    } else {
                        document.body.appendChild(challengesContainer);
                    }
                }
                
                this.containers.challenges = challengesContainer;
            }
            
            // Rewards container - only on dashboard
            if (!this.containers.rewards && window.location.pathname.includes('/dashboard')) {
                const rewardsContainer = document.createElement('div');
                rewardsContainer.id = 'reward-container';
                rewardsContainer.className = 'gamification-rewards-container';
                
                // Find a suitable location
                const sidePanel = document.querySelector('.side-panel') || document.querySelector('.dashboard-sidebar');
                if (sidePanel) {
                    const rewardsSection = document.createElement('div');
                    rewardsSection.className = 'rewards-section';
                    rewardsSection.innerHTML = '<h3>Available Rewards</h3>';
                    rewardsSection.appendChild(rewardsContainer);
                    sidePanel.appendChild(rewardsSection);
                } else {
                    const mainContent = document.querySelector('.main-content');
                    if (mainContent) {
                        const rewardsSection = document.createElement('div');
                        rewardsSection.className = 'rewards-section';
                        rewardsSection.innerHTML = '<h3>Available Rewards</h3>';
                        rewardsSection.appendChild(rewardsContainer);
                        mainContent.appendChild(rewardsSection);
                    } else {
                        document.body.appendChild(rewardsContainer);
                    }
                }
                
                this.containers.rewards = rewardsContainer;
            }
        }
    }

    /**
     * Load user preferences from localStorage
     * @returns {Promise} Loading promise
     */
    async loadUserPreferences() {
        return new Promise(resolve => {
            try {
                const savedPreferences = localStorage.getItem('pixelsprout_preferences');
                if (savedPreferences) {
                    this.userPreferences = { ...this.userPreferences, ...JSON.parse(savedPreferences) };
                }
                resolve();
            } catch (error) {
                console.error(`Error loading preferences: ${error.message}`);
                resolve();
            }
        });
    }

    /**
     * Save user preferences to localStorage
     * @returns {Promise} Saving promise
     */
    async saveUserPreferences() {
        return new Promise(resolve => {
            try {
                localStorage.setItem('pixelsprout_preferences', JSON.stringify(this.userPreferences));
                resolve();
            } catch (error) {
                console.error(`Error saving preferences: ${error.message}`);
                resolve();
            }
        });
    }

    /**
     * Initialize Interactive Growth System
     * @returns {Promise} Initialization promise
     */
    async initializeInteractiveGrowth() {
        return new Promise((resolve, reject) => {
            try {
                // Check if InteractiveGrowthSystem is available
                if (typeof InteractiveGrowthSystem === 'undefined') {
                    console.warn('InteractiveGrowthSystem not available. Loading script...');
                    
                    // Load the script
                    const script = document.createElement('script');
                    script.src = '/static/js/interactive_growth.js';
                    script.onload = () => {
                        this.createInteractiveGrowth();
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('Failed to load InteractiveGrowthSystem');
                        reject(new Error('Failed to load InteractiveGrowthSystem'));
                    };
                    document.head.appendChild(script);
                } else {
                    this.createInteractiveGrowth();
                    resolve();
                }
            } catch (error) {
                console.error(`Error initializing Interactive Growth System: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Create Interactive Growth System instance
     */
    createInteractiveGrowth() {
        // Create instance
        this.interactiveGrowth = new InteractiveGrowthSystem({
            container: this.containers.garden,
            particleCount: 30,
            growthSpeed: 1.0,
            interactionRadius: 100,
            windEffect: this.userPreferences.enableWeatherEffects,
            soundEffects: this.userPreferences.enableSoundEffects,
            hapticFeedback: true,
            weatherEffects: this.userPreferences.enableWeatherEffects,
            timeBasedGrowth: true,
            growthParticles: true,
            ambientLighting: true
        });
        
        // Start the system
        this.interactiveGrowth.start();
        
        console.log('Interactive Growth System created');
    }

    /**
     * Initialize AI Plant Advisor
     * @returns {Promise} Initialization promise
     */
    async initializeAIAdvisor() {
        return new Promise((resolve, reject) => {
            try {
                // Check if AIPlantAdvisor is available
                if (typeof AIPlantAdvisor === 'undefined') {
                    console.warn('AIPlantAdvisor not available. Loading script...');
                    
                    // Load the script
                    const script = document.createElement('script');
                    script.src = '/static/js/ai_plant_advisor.js';
                    script.onload = () => {
                        this.createAIAdvisor();
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('Failed to load AIPlantAdvisor');
                        reject(new Error('Failed to load AIPlantAdvisor'));
                    };
                    document.head.appendChild(script);
                } else {
                    this.createAIAdvisor();
                    resolve();
                }
            } catch (error) {
                console.error(`Error initializing AI Plant Advisor: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Create AI Plant Advisor instance
     */
    async createAIAdvisor() {
        try {
            // Create instance
            this.aiAdvisor = new AIPlantAdvisor({
                apiEndpoint: '/api/ai-advisor',
                userDataEndpoint: '/api/user/data',
                plantDataEndpoint: '/api/plants/data',
                habitDataEndpoint: '/api/habits/data',
                enablePredictions: true,
                enableNotifications: this.userPreferences.enableNotifications,
                enableVoiceInterface: this.userPreferences.enableVoiceInterface,
                enableMoodTracking: this.userPreferences.enableMoodTracking,
                enableWeatherIntegration: this.userPreferences.enableWeatherEffects,
                debugMode: false
            });
            
            // Initialize the advisor
            await this.aiAdvisor.initialize();
        } catch (error) {
            console.error(`Error creating or initializing AI Plant Advisor: ${error.message}`);
            // Create a minimal advisor that won't cause errors
            this.aiAdvisor = {
                initialize: async () => Promise.resolve(),
                getPersonalizedAdvice: async () => "Sorry, the AI advisor is currently unavailable.",
                displayRecommendation: () => {},
                recommendations: [],
                log: (msg) => console.log(`AI Advisor (fallback): ${msg}`)
            };
        }
        
        // Populate recommendations
        if (this.containers.aiAdvisor) {
            const recommendationsContainer = this.containers.aiAdvisor.querySelector('.ai-advisor-recommendations');
            if (recommendationsContainer) {
                this.aiAdvisor.recommendations.forEach(recommendation => {
                    this.aiAdvisor.displayRecommendation(recommendation, recommendationsContainer);
                });
            }
            
            // Set up input handling
            const inputField = this.containers.aiAdvisor.querySelector('.ai-advisor-input input');
            const sendButton = this.containers.aiAdvisor.querySelector('.ai-advisor-send');
            const voiceButton = this.containers.aiAdvisor.querySelector('.ai-advisor-voice');
            
            if (inputField && sendButton) {
                // Send button click
                sendButton.addEventListener('click', async () => {
                    try {
                        if (!inputField || !inputField.value) {
                            console.warn('Input field is empty or not found');
                            return;
                        }
                        
                        const query = inputField.value.trim();
                        if (!query) {
                            console.warn('Query is empty after trimming');
                            return;
                        }
                        
                        // Determine topic based on query content
                        let topic = 'general';
                        if (query.includes('water')) {
                            topic = 'watering';
                        } else if (query.includes('sun')) {
                            topic = 'sunlight';
                        } else if (query.includes('habit')) {
                            topic = 'motivation';
                        }
                        
                        // Get advice with error handling
                        let advice;
                        try {
                            advice = await this.aiAdvisor.getPersonalizedAdvice(topic);
                        } catch (adviceError) {
                            console.error(`Error getting advice: ${adviceError.message}`);
                            advice = "Sorry, I couldn't process your request at this time.";
                        }
                        
                        // Display response
                        const responseElement = document.createElement('div');
                        responseElement.className = 'ai-response';
                        responseElement.innerHTML = `
                            <div class="ai-avatar">
                                <i class="fas fa-seedling"></i>
                            </div>
                            <div class="ai-message">${advice}</div>
                        `;
                        recommendationsContainer.appendChild(responseElement);
                        
                        // Speak response if voice interface is enabled
                        if (this.userPreferences.enableVoiceInterface) {
                            this.aiAdvisor.speakRecommendation(advice);
                        }
                        
                        // Clear input
                        inputField.value = '';
                        
                        // Scroll to bottom
                        recommendationsContainer.scrollTop = recommendationsContainer.scrollHeight;
                    } catch (error) {
                        console.error(`Error processing AI advisor request: ${error.message}`);
                        // Display error message to user
                        if (recommendationsContainer) {
                            const errorElement = document.createElement('div');
                            errorElement.className = 'ai-response error';
                            errorElement.innerHTML = `
                                <div class="ai-avatar">
                                    <i class="fas fa-exclamation-triangle"></i>
                                </div>
                                <div class="ai-message">Sorry, I encountered an error processing your request.</div>
                            `;
                            recommendationsContainer.appendChild(errorElement);
                        }
                    }
                });
                
                // Enter key in input field
                inputField.addEventListener('keypress', (e) => {
                    if (e.key === 'Enter') {
                        sendButton.click();
                    }
                });
                
                // Voice button click
                if (voiceButton && this.userPreferences.enableVoiceInterface) {
                    voiceButton.addEventListener('click', () => {
                        this.aiAdvisor.startVoiceRecognition();
                    });
                } else if (voiceButton) {
                    voiceButton.style.display = 'none';
                }
            }
        }
        
        console.log('AI Plant Advisor created');
    }

    /**
     * Initialize 3D Plant Visualizer
     * @returns {Promise} Initialization promise
     */
    async initialize3DVisualizer() {
        return new Promise((resolve, reject) => {
            try {
                // Check if Plant3DVisualizer is available
                if (typeof Plant3DVisualizer === 'undefined') {
                    console.warn('Plant3DVisualizer not available. Loading script...');
                    
                    // Load the script
                    const script = document.createElement('script');
                    script.src = '/static/js/plant_3d_visualizer.js';
                    script.onload = () => {
                        this.create3DVisualizer();
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('Failed to load Plant3DVisualizer');
                        reject(new Error('Failed to load Plant3DVisualizer'));
                    };
                    document.head.appendChild(script);
                } else {
                    this.create3DVisualizer();
                    resolve();
                }
            } catch (error) {
                console.error(`Error initializing 3D Plant Visualizer: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Create 3D Plant Visualizer instance
     */
    async create3DVisualizer() {
        if (!this.containers.plant3D) return;
        
        // Create instance
        this.plant3DVisualizer = new Plant3DVisualizer({
            container: this.containers.plant3D,
            width: this.containers.plant3D.clientWidth,
            height: this.containers.plant3D.clientHeight,
            backgroundColor: 0x0a1f0a,
            enableShadows: true,
            enableBloom: true,
            enableAmbientOcclusion: true,
            enableInteraction: true,
            enableGrowthAnimation: true,
            growthSpeed: 1.0,
            autoRotate: true,
            debugMode: false
        });
        
        // Initialize the visualizer
        await this.plant3DVisualizer.init();
        
        // Add controls
        this.add3DVisualizerControls();
        
        console.log('3D Plant Visualizer created');
    }

    /**
     * Add controls for 3D visualizer
     */
    add3DVisualizerControls() {
        if (!this.containers.plant3D || !this.plant3DVisualizer) return;
        
        // Create controls container
        const controlsContainer = document.createElement('div');
        controlsContainer.className = 'visualizer-controls';
        controlsContainer.innerHTML = `
            <button class="visualizer-control" data-action="rotate" title="Toggle Rotation">
                <i class="fas fa-sync-alt"></i>
            </button>
            <button class="visualizer-control" data-action="water" title="Water Plant">
                <i class="fas fa-tint"></i>
            </button>
            <button class="visualizer-control" data-action="growth" title="Growth Stage">
                <i class="fas fa-seedling"></i>
            </button>
        `;
        
        // Style the controls
        const style = document.createElement('style');
        style.textContent = `
            .visualizer-controls {
                position: absolute;
                bottom: 20px;
                right: 20px;
                display: flex;
                flex-direction: column;
                gap: 10px;
                z-index: 10;
            }
            
            .visualizer-control {
                width: 40px;
                height: 40px;
                border-radius: 50%;
                background: rgba(10, 31, 10, 0.7);
                border: 1px solid rgba(76, 175, 80, 0.3);
                color: #4CAF50;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                font-size: 16px;
                transition: all 0.2s ease;
                backdrop-filter: blur(5px);
                -webkit-backdrop-filter: blur(5px);
            }
            
            .visualizer-control:hover {
                background: rgba(10, 31, 10, 0.9);
                transform: scale(1.1);
                box-shadow: 0 0 15px rgba(76, 175, 80, 0.3);
            }
            
            .visualizer-control.active {
                background: rgba(76, 175, 80, 0.2);
                color: #e9ecef;
            }
        `;
        
        document.head.appendChild(style);
        this.containers.plant3D.appendChild(controlsContainer);
        
        // Add event listeners
        const rotateButton = controlsContainer.querySelector('[data-action="rotate"]');
        const waterButton = controlsContainer.querySelector('[data-action="water"]');
        const growthButton = controlsContainer.querySelector('[data-action="growth"]');
        
        if (rotateButton) {
            rotateButton.addEventListener('click', () => {
                const isRotating = this.plant3DVisualizer.isRotating;
                this.plant3DVisualizer.toggleAutoRotate(!isRotating);
                rotateButton.classList.toggle('active', !isRotating);
            });
            
            // Set initial state
            rotateButton.classList.toggle('active', this.plant3DVisualizer.isRotating);
        }
        
        if (waterButton) {
            waterButton.addEventListener('click', () => {
                this.plant3DVisualizer.waterPlant(0.5);
                
                // Trigger water plant event
                if (this.currentPlant) {
                    this.handleWaterPlant(this.currentPlant);
                }
            });
        }
        
        if (growthButton) {
            growthButton.addEventListener('click', () => {
                // Toggle growth stage for demo
                if (this.currentPlant && this.plant3DVisualizer.config.plantData) {
                    const currentStage = this.plant3DVisualizer.config.plantData.growthStage;
                    const maxStage = this.plant3DVisualizer.config.plantData.maxGrowthStage;
                    const newStage = (currentStage + 1) % (maxStage + 1);
                    this.plant3DVisualizer.setGrowthStage(newStage === 0 ? 1 : newStage, maxStage);
                }
            });
        }
    }

    /**
     * Initialize Gamification System
     * @returns {Promise} Initialization promise
     */
    async initializeGamification() {
        return new Promise((resolve, reject) => {
            try {
                // Check if GamificationSystem is available
                if (typeof GamificationSystem === 'undefined') {
                    console.warn('GamificationSystem not available. Loading script...');
                    
                    // Load the script
                    const script = document.createElement('script');
                    script.src = '/static/js/gamification_system.js';
                    script.onload = () => {
                        this.createGamification();
                        resolve();
                    };
                    script.onerror = () => {
                        console.error('Failed to load GamificationSystem');
                        reject(new Error('Failed to load GamificationSystem'));
                    };
                    document.head.appendChild(script);
                } else {
                    this.createGamification();
                    resolve();
                }
            } catch (error) {
                console.error(`Error initializing Gamification System: ${error.message}`);
                reject(error);
            }
        });
    }

    /**
     * Create Gamification System instance
     */
    async createGamification() {
        // Create instance
        this.gamification = new GamificationSystem({
            apiEndpoint: '/api/gamification',
            userDataEndpoint: '/api/user/data',
            notificationContainer: this.containers.notifications,
            badgeContainer: this.containers.badges,
            levelContainer: this.containers.level,
            challengeContainer: this.containers.challenges,
            rewardContainer: this.containers.rewards,
            enableNotifications: this.userPreferences.enableNotifications,
            enableSound: this.userPreferences.enableSoundEffects,
            enableConfetti: this.userPreferences.enableConfetti,
            enableVibration: true,
            debugMode: false
        });
        
        // Initialize the gamification system
        await this.gamification.initialize();
        
        console.log('Gamification System created');
    }

    /**
     * Set up event listeners
     */
    setupEventListeners() {
        // Plant selection
        document.addEventListener('plantSelected', (event) => {
            this.handlePlantSelection(event.detail);
        });
        
        // Plant interaction
        document.addEventListener('plantInteraction', (event) => {
            this.handlePlantInteraction(event.detail);
        });
        
        // Habit completion
        document.addEventListener('habitCompleted', (event) => {
            this.handleHabitCompletion(event.detail);
        });
        
        // AI Advisor action
        document.addEventListener('aiAdvisorAction', (event) => {
            this.handleAIAdvisorAction(event.detail);
        });
        
        // Water plant
        document.addEventListener('waterPlant', (event) => {
            this.handleWaterPlant(event.detail);
        });
        
        // Window resize
        window.addEventListener('resize', () => {
            if (this.plant3DVisualizer && this.containers.plant3D) {
                this.plant3DVisualizer.handleResize();
            }
        });
        
        console.log('Event listeners set up');
    }

    /**
     * Handle plant selection
     * @param {Object} plantData - Selected plant data
     */
    async handlePlantSelection(plantData) {
        if (!plantData || !plantData.id) return;
        
        console.log(`Plant selected: ${plantData.name || plantData.id}`);
        this.currentPlant = plantData.id;
        
        // Update 3D visualizer
        if (this.plant3DVisualizer && this.userPreferences.enable3DVisualization) {
            try {
                await this.plant3DVisualizer.loadPlantModel(plantData);
                this.plant3DVisualizer.updatePlantVisualization(plantData);
                
                // Show 3D container
                if (this.containers.plant3D) {
                    this.containers.plant3D.style.display = 'block';
                }
            } catch (error) {
                console.error(`Error updating 3D visualization: ${error.message}`);
            }
        }
        
        // Update interactive growth
        if (this.interactiveGrowth && this.userPreferences.enableInteractiveEffects) {
            try {
                // Add plant to interactive system
                const plantElement = document.querySelector(`[data-plant-id="${plantData.id}"]`);
                if (plantElement) {
                    const rect = plantElement.getBoundingClientRect();
                    const containerRect = this.containers.garden ? 
                        this.containers.garden.getBoundingClientRect() : 
                        { left: 0, top: 0 };
                    
                    this.interactiveGrowth.addPlant({
                        id: plantData.id,
                        element: plantElement,
                        x: rect.left - containerRect.left + rect.width / 2,
                        y: rect.top - containerRect.top + rect.height / 2,
                        growthStage: plantData.growthStage || 0,
                        maxGrowthStage: plantData.maxGrowthStage || 5,
                        growthRate: plantData.growthRate || 1,
                        lastWatered: plantData.lastWatered || Date.now(),
                        health: plantData.health || 1.0
                    });
                }
            } catch (error) {
                console.error(`Error updating interactive growth: ${error.message}`);
            }
        }
    }

    /**
     * Handle plant interaction
     * @param {Object} interaction - Interaction data
     */
    handlePlantInteraction(interaction) {
        if (!interaction || !interaction.plantId) return;
        
        console.log(`Plant interaction: ${interaction.plantId}, part: ${interaction.partType}`);
        
        // Award XP for interaction
        if (this.gamification && this.userPreferences.enableGamification) {
            this.gamification.awardXP(5, 'plant_interaction');
        }
        
        // Handle specific interactions
        if (interaction.partType === 'water') {
            this.handleWaterPlant(interaction.plantId);
        }
    }

    /**
     * Handle habit completion
     * @param {Object} habit - Habit data
     */
    async handleHabitCompletion(habit) {
        if (!habit || !habit.id) return;
        
        console.log(`Habit completed: ${habit.name || habit.id}`);
        
        // Update streak
        if (this.gamification && this.userPreferences.enableGamification) {
            const streakResult = await this.gamification.updateStreak(habit.id, true);
            
            // Award XP with streak multiplier
            const xpAmount = 20; // Base XP for habit completion
            await this.gamification.awardXP(xpAmount, 'habit_completion', true);
            
            // Check for challenges
            const habitChallenges = this.gamification.challenges.filter(
                challenge => challenge.criteria && 
                challenge.criteria.type.includes('habit') &&
                !this.gamification.userData.completedChallenges.includes(challenge.id)
            );
            
            for (const challenge of habitChallenges) {
                // Simple check - in a real implementation, this would be more sophisticated
                if (streakResult.newStreak >= (challenge.criteria.threshold || 3)) {
                    await this.gamification.completeChallenge(challenge.id);
                }
            }
        }
        
        // Update AI advisor
        if (this.aiAdvisor && this.userPreferences.enableAIAdvisor) {
            // Refresh recommendations after habit completion
            await this.aiAdvisor.generateRecommendations();
            
            // Update UI if container exists
            if (this.containers.aiAdvisor) {
                const recommendationsContainer = this.containers.aiAdvisor.querySelector('.ai-advisor-recommendations');
                if (recommendationsContainer) {
                    // Clear existing recommendations
                    recommendationsContainer.innerHTML = '';
                    
                    // Add new recommendations
                    this.aiAdvisor.recommendations.forEach(recommendation => {
                        this.aiAdvisor.displayRecommendation(recommendation, recommendationsContainer);
                    });
                }
            }
        }
    }

    /**
     * Handle AI advisor action
     * @param {Object} action - Action data
     */
    handleAIAdvisorAction(action) {
        if (!action || !action.type) return;
        
        console.log(`AI advisor action: ${action.type}`);
        
        switch (action.type) {
            case 'water':
                if (action.plantId) {
                    this.handleWaterPlant(action.plantId);
                }
                break;
                
            case 'navigate':
                if (action.target) {
                    window.location.href = action.target;
                }
                break;
                
            case 'completeHabit':
                if (action.habitId) {
                    // Trigger habit completion
                    const habitElement = document.querySelector(`[data-habit-id="${action.habitId}"]`);
                    if (habitElement) {
                        const completeButton = habitElement.querySelector('.complete-habit-btn');
                        if (completeButton) {
                            completeButton.click();
                        } else {
                            // Dispatch event manually
                            document.dispatchEvent(new CustomEvent('habitCompleted', {
                                detail: { id: action.habitId }
                            }));
                        }
                    }
                }
                break;
                
            case 'motivation':
                if (action.habitId) {
                    // Show motivation message
                    this.aiAdvisor.getPersonalizedAdvice('motivation').then(advice => {
                        if (this.gamification) {
                            this.gamification.showNotification({
                                type: 'motivation',
                                title: 'Motivation Boost',
                                message: advice,
                                icon: 'bolt',
                                color: '#FF9800'
                            });
                        }
                    });
                }
                break;
        }
    }

    /**
     * Handle watering a plant
     * @param {string} plantId - Plant ID
     */
    async handleWaterPlant(plantId) {
        if (!plantId) return;
        
        console.log(`Watering plant: ${plantId}`);
        
        // Update 3D visualization
        if (this.plant3DVisualizer && this.userPreferences.enable3DVisualization) {
            this.plant3DVisualizer.waterPlant(0.5);
        }
        
        // Update interactive growth
        if (this.interactiveGrowth && this.userPreferences.enableInteractiveEffects) {
            this.interactiveGrowth.waterPlant(plantId);
        }
        
        // Award XP
        if (this.gamification && this.userPreferences.enableGamification) {
            await this.gamification.awardXP(10, 'watering_plant');
            
            // Update streak
            await this.gamification.updateStreak('watering', true);
            
            // Check for watering-related achievements
            await this.gamification.checkAchievements();
        }
        
        // Update AI advisor
        if (this.aiAdvisor && this.userPreferences.enableAIAdvisor) {
            // Refresh recommendations after watering
            await this.aiAdvisor.generateRecommendations();
        }
    }
}

// Create and initialize the advanced features
document.addEventListener('DOMContentLoaded', () => {
    window.pixelSproutFeatures = new AdvancedFeatures();
    window.pixelSproutFeatures.initialize().catch(error => {
        console.error('Failed to initialize advanced features:', error);
    });
});