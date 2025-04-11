/**
 * Interactive Plant Growth Animation System
 * 
 * This advanced system creates realistic, interactive plant growth animations
 * with physics-based interactions, particle effects, and dynamic responses to user actions.
 */

class InteractiveGrowthSystem {
    constructor(options = {}) {
        // Configuration
        this.config = {
            container: options.container || document.getElementById('garden-container'),
            particleCount: options.particleCount || 50,
            growthSpeed: options.growthSpeed || 1,
            interactionRadius: options.interactionRadius || 100,
            windEffect: options.windEffect !== undefined ? options.windEffect : true,
            soundEffects: options.soundEffects !== undefined ? options.soundEffects : true,
            hapticFeedback: options.hapticFeedback !== undefined ? options.hapticFeedback : true,
            weatherEffects: options.weatherEffects !== undefined ? options.weatherEffects : true,
            timeBasedGrowth: options.timeBasedGrowth !== undefined ? options.timeBasedGrowth : true,
            growthParticles: options.growthParticles !== undefined ? options.growthParticles : true,
            ambientLighting: options.ambientLighting !== undefined ? options.ambientLighting : true
        };

        // State
        this.plants = [];
        this.particles = [];
        this.mousePosition = { x: 0, y: 0 };
        this.lastFrameTime = 0;
        this.timeOfDay = 'day';
        this.weather = 'clear';
        this.windDirection = 0;
        this.windStrength = 0;
        this.isRunning = false;
        this.audioContext = null;
        this.sounds = {};
        this.ambientLight = null;
        this.spotLight = null;

        // Bind methods
        this.update = this.update.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseClick = this.handleMouseClick.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleResize = this.handleResize.bind(this);

        // Initialize
        this.init();
    }

    /**
     * Initialize the growth system
     */
    init() {
        // Set up event listeners
        if (this.config.container) {
            this.config.container.addEventListener('mousemove', this.handleMouseMove);
            this.config.container.addEventListener('click', this.handleMouseClick);
            this.config.container.addEventListener('touchstart', this.handleTouchStart);
            this.config.container.addEventListener('touchmove', this.handleTouchMove);
            window.addEventListener('resize', this.handleResize);
        }

        // Initialize audio if enabled
        if (this.config.soundEffects) {
            this.initAudio();
        }

        // Initialize lighting if enabled
        if (this.config.ambientLighting) {
            this.initLighting();
        }

        // Initialize weather system
        if (this.config.weatherEffects) {
            this.initWeather();
        }

        // Create initial particles
        if (this.config.growthParticles) {
            this.createParticles();
        }

        console.log('Interactive Growth System initialized');
    }

    /**
     * Initialize audio system
     */
    initAudio() {
        try {
            // Create audio context
            window.AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();

            // Load sounds
            this.loadSound('growth', '/static/sounds/growth.mp3');
            this.loadSound('water', '/static/sounds/water.mp3');
            this.loadSound('rustle', '/static/sounds/rustle.mp3');
            this.loadSound('achievement', '/static/sounds/achievement.mp3');
            this.loadSound('ambient', '/static/sounds/ambient_garden.mp3', true);

            console.log('Audio system initialized');
        } catch (e) {
            console.warn('Audio system could not be initialized:', e);
            this.config.soundEffects = false;
        }
    }

    /**
     * Load a sound file
     * @param {string} name - Sound identifier
     * @param {string} url - Sound file URL
     * @param {boolean} loop - Whether the sound should loop
     */
    loadSound(name, url, loop = false) {
        fetch(url)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => this.audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => {
                this.sounds[name] = {
                    buffer: audioBuffer,
                    loop: loop
                };
                console.log(`Sound loaded: ${name}`);
            })
            .catch(error => console.error(`Error loading sound ${name}:`, error));
    }

    /**
     * Play a sound
     * @param {string} name - Sound identifier
     * @param {number} volume - Volume level (0-1)
     * @param {number} pitch - Pitch adjustment (0.5-2)
     */
    playSound(name, volume = 1.0, pitch = 1.0) {
        if (!this.config.soundEffects || !this.audioContext || !this.sounds[name]) return;

        const source = this.audioContext.createBufferSource();
        const gainNode = this.audioContext.createGain();
        
        source.buffer = this.sounds[name].buffer;
        source.loop = this.sounds[name].loop;
        source.playbackRate.value = pitch;
        
        gainNode.gain.value = volume;
        
        source.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        source.start(0);
        return { source, gainNode };
    }

    /**
     * Initialize ambient lighting system
     */
    initLighting() {
        // Create ambient light container
        this.ambientLight = document.createElement('div');
        this.ambientLight.className = 'ambient-light';
        this.ambientLight.style.position = 'absolute';
        this.ambientLight.style.top = '0';
        this.ambientLight.style.left = '0';
        this.ambientLight.style.width = '100%';
        this.ambientLight.style.height = '100%';
        this.ambientLight.style.pointerEvents = 'none';
        this.ambientLight.style.zIndex = '1';
        this.ambientLight.style.background = 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.1) 0%, rgba(0,0,0,0) 70%)';
        this.ambientLight.style.mixBlendMode = 'overlay';
        this.ambientLight.style.transition = 'opacity 0.5s ease';
        
        // Create spotlight for mouse interaction
        this.spotLight = document.createElement('div');
        this.spotLight.className = 'spotlight';
        this.spotLight.style.position = 'absolute';
        this.spotLight.style.width = '200px';
        this.spotLight.style.height = '200px';
        this.spotLight.style.borderRadius = '50%';
        this.spotLight.style.background = 'radial-gradient(circle at center, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)';
        this.spotLight.style.transform = 'translate(-50%, -50%)';
        this.spotLight.style.pointerEvents = 'none';
        this.spotLight.style.zIndex = '2';
        this.spotLight.style.mixBlendMode = 'screen';
        this.spotLight.style.opacity = '0';
        this.spotLight.style.transition = 'opacity 0.3s ease';
        
        // Add to container
        if (this.config.container) {
            this.config.container.style.position = 'relative';
            this.config.container.style.overflow = 'hidden';
            this.config.container.appendChild(this.ambientLight);
            this.config.container.appendChild(this.spotLight);
        }
        
        // Set initial time of day
        this.updateLighting();
        
        console.log('Lighting system initialized');
    }

    /**
     * Update lighting based on time of day
     */
    updateLighting() {
        if (!this.config.ambientLighting || !this.ambientLight) return;
        
        // Get current hour
        const hour = new Date().getHours();
        
        // Determine time of day
        if (hour >= 6 && hour < 10) {
            // Morning
            this.timeOfDay = 'morning';
            this.ambientLight.style.background = 'radial-gradient(circle at 30% 30%, rgba(255,200,150,0.15) 0%, rgba(0,0,0,0) 70%)';
        } else if (hour >= 10 && hour < 16) {
            // Day
            this.timeOfDay = 'day';
            this.ambientLight.style.background = 'radial-gradient(circle at 50% 0%, rgba(255,255,200,0.1) 0%, rgba(0,0,0,0) 70%)';
        } else if (hour >= 16 && hour < 20) {
            // Evening
            this.timeOfDay = 'evening';
            this.ambientLight.style.background = 'radial-gradient(circle at 70% 30%, rgba(255,150,100,0.2) 0%, rgba(0,0,0,0) 70%)';
        } else {
            // Night
            this.timeOfDay = 'night';
            this.ambientLight.style.background = 'radial-gradient(circle at 50% 50%, rgba(100,150,255,0.1) 0%, rgba(0,0,0,0.2) 70%)';
        }
    }

    /**
     * Initialize weather effects system
     */
    initWeather() {
        // Create weather container
        this.weatherContainer = document.createElement('div');
        this.weatherContainer.className = 'weather-effects';
        this.weatherContainer.style.position = 'absolute';
        this.weatherContainer.style.top = '0';
        this.weatherContainer.style.left = '0';
        this.weatherContainer.style.width = '100%';
        this.weatherContainer.style.height = '100%';
        this.weatherContainer.style.pointerEvents = 'none';
        this.weatherContainer.style.zIndex = '3';
        this.weatherContainer.style.overflow = 'hidden';
        
        // Add to container
        if (this.config.container) {
            this.config.container.appendChild(this.weatherContainer);
        }
        
        // Set initial weather
        this.updateWeather();
        
        // Schedule random weather changes
        setInterval(() => {
            if (Math.random() < 0.3) {
                this.updateWeather(true);
            }
        }, 60000); // Check for weather change every minute
        
        console.log('Weather system initialized');
    }

    /**
     * Update weather effects
     * @param {boolean} random - Whether to set random weather
     */
    updateWeather(random = false) {
        if (!this.config.weatherEffects || !this.weatherContainer) return;
        
        // Clear current weather
        this.weatherContainer.innerHTML = '';
        
        // Set weather type
        if (random) {
            const weatherTypes = ['clear', 'cloudy', 'rain', 'windy'];
            this.weather = weatherTypes[Math.floor(Math.random() * weatherTypes.length)];
        }
        
        // Apply weather effects
        switch (this.weather) {
            case 'clear':
                // No special effects for clear weather
                break;
                
            case 'cloudy':
                // Add cloud elements
                for (let i = 0; i < 5; i++) {
                    const cloud = document.createElement('div');
                    cloud.className = 'cloud';
                    cloud.style.position = 'absolute';
                    cloud.style.width = `${100 + Math.random() * 200}px`;
                    cloud.style.height = `${50 + Math.random() * 100}px`;
                    cloud.style.borderRadius = '50%';
                    cloud.style.background = 'rgba(255, 255, 255, 0.3)';
                    cloud.style.boxShadow = '0 0 40px 20px rgba(255, 255, 255, 0.3)';
                    cloud.style.top = `${Math.random() * 100}%`;
                    cloud.style.left = `${Math.random() * 100}%`;
                    cloud.style.opacity = '0.7';
                    cloud.style.filter = 'blur(10px)';
                    cloud.style.animation = `cloud-drift ${20 + Math.random() * 40}s linear infinite`;
                    this.weatherContainer.appendChild(cloud);
                }
                break;
                
            case 'rain':
                // Add rain elements
                for (let i = 0; i < 100; i++) {
                    const raindrop = document.createElement('div');
                    raindrop.className = 'raindrop';
                    raindrop.style.position = 'absolute';
                    raindrop.style.width = '2px';
                    raindrop.style.height = `${10 + Math.random() * 20}px`;
                    raindrop.style.background = 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(255,255,255,0.7))';
                    raindrop.style.top = `${Math.random() * 100}%`;
                    raindrop.style.left = `${Math.random() * 100}%`;
                    raindrop.style.opacity = '0.7';
                    raindrop.style.animation = `rainfall ${1 + Math.random()}s linear infinite`;
                    raindrop.style.animationDelay = `${Math.random() * 2}s`;
                    this.weatherContainer.appendChild(raindrop);
                }
                
                // Add rain CSS animation if not already present
                if (!document.getElementById('weather-animations')) {
                    const style = document.createElement('style');
                    style.id = 'weather-animations';
                    style.textContent = `
                        @keyframes rainfall {
                            0% { transform: translateY(-100px); }
                            100% { transform: translateY(calc(100vh + 100px)); }
                        }
                        @keyframes cloud-drift {
                            0% { transform: translateX(-200px); }
                            100% { transform: translateX(calc(100vw + 200px)); }
                        }
                        @keyframes leaf-sway {
                            0% { transform: rotate(0deg); }
                            50% { transform: rotate(5deg); }
                            100% { transform: rotate(0deg); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
                
            case 'windy':
                // Set wind direction and strength
                this.windDirection = Math.random() * 360;
                this.windStrength = 0.5 + Math.random() * 1.5;
                
                // Add visual wind indicators
                for (let i = 0; i < 30; i++) {
                    const windLine = document.createElement('div');
                    windLine.className = 'wind-line';
                    windLine.style.position = 'absolute';
                    windLine.style.width = `${30 + Math.random() * 70}px`;
                    windLine.style.height = '1px';
                    windLine.style.background = 'rgba(255, 255, 255, 0.2)';
                    windLine.style.top = `${Math.random() * 100}%`;
                    windLine.style.left = `${Math.random() * 100}%`;
                    windLine.style.opacity = '0.5';
                    windLine.style.transform = `rotate(${this.windDirection}deg)`;
                    windLine.style.animation = `wind-drift ${0.5 + Math.random() * 2}s linear infinite`;
                    windLine.style.animationDelay = `${Math.random() * 2}s`;
                    this.weatherContainer.appendChild(windLine);
                }
                
                // Add wind CSS animation if not already present
                if (!document.getElementById('wind-animations')) {
                    const style = document.createElement('style');
                    style.id = 'wind-animations';
                    style.textContent = `
                        @keyframes wind-drift {
                            0% { opacity: 0; transform: rotate(${this.windDirection}deg) translateX(-50px); }
                            50% { opacity: 0.5; }
                            100% { opacity: 0; transform: rotate(${this.windDirection}deg) translateX(calc(100vw + 50px)); }
                        }
                    `;
                    document.head.appendChild(style);
                }
                break;
        }
        
        console.log(`Weather updated to: ${this.weather}`);
    }

    /**
     * Create particle effects
     */
    createParticles() {
        this.particles = [];
        
        for (let i = 0; i < this.config.particleCount; i++) {
            this.particles.push({
                x: Math.random() * (this.config.container ? this.config.container.offsetWidth : window.innerWidth),
                y: Math.random() * (this.config.container ? this.config.container.offsetHeight : window.innerHeight),
                size: 2 + Math.random() * 5,
                color: `hsl(${120 + Math.random() * 40}, ${70 + Math.random() * 30}%, ${70 + Math.random() * 30}%)`,
                vx: Math.random() * 2 - 1,
                vy: Math.random() * 2 - 1,
                alpha: 0.1 + Math.random() * 0.5,
                life: 1.0,
                decay: 0.01 + Math.random() * 0.02,
                active: false,
                element: null
            });
        }
    }

    /**
     * Add a plant to the system
     * @param {Object} plant - Plant object with position and element
     */
    addPlant(plant) {
        if (!plant.element) return;
        
        // Add plant to the list
        this.plants.push({
            id: plant.id || `plant-${Date.now()}-${this.plants.length}`,
            element: plant.element,
            x: plant.x || 0,
            y: plant.y || 0,
            width: plant.width || plant.element.offsetWidth,
            height: plant.height || plant.element.offsetHeight,
            growthStage: plant.growthStage || 0,
            maxGrowthStage: plant.maxGrowthStage || 5,
            growthProgress: plant.growthProgress || 0,
            growthRate: plant.growthRate || 1,
            lastWatered: plant.lastWatered || Date.now(),
            health: plant.health || 1.0,
            swayFactor: plant.swayFactor || (0.5 + Math.random() * 0.5),
            swayOffset: plant.swayOffset || (Math.random() * Math.PI * 2),
            interactionCount: 0,
            lastInteraction: 0
        });
        
        // Apply initial styles
        this.updatePlantStyles(this.plants[this.plants.length - 1]);
        
        console.log(`Plant added: ${this.plants[this.plants.length - 1].id}`);
    }

    /**
     * Update plant visual styles
     * @param {Object} plant - Plant object
     */
    updatePlantStyles(plant) {
        if (!plant.element) return;
        
        // Apply base styles if not already set
        if (!plant.element.style.transition) {
            plant.element.style.transition = 'transform 0.5s ease, filter 0.5s ease';
        }
        
        // Apply health-based filter
        const healthFilter = `brightness(${0.7 + plant.health * 0.3}) saturate(${0.7 + plant.health * 0.5})`;
        plant.element.style.filter = healthFilter;
        
        // Apply growth stage transform
        const growthScale = 0.5 + (plant.growthStage / plant.maxGrowthStage) * 0.5;
        plant.element.style.transform = `scale(${growthScale})`;
    }

    /**
     * Start the animation loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        requestAnimationFrame(this.update);
        
        // Start ambient sound if available
        if (this.config.soundEffects && this.sounds.ambient) {
            this.playSound('ambient', 0.3);
        }
        
        console.log('Interactive Growth System started');
    }

    /**
     * Stop the animation loop
     */
    stop() {
        this.isRunning = false;
        console.log('Interactive Growth System stopped');
    }

    /**
     * Main update loop
     * @param {number} timestamp - Current timestamp
     */
    update(timestamp) {
        if (!this.isRunning) return;
        
        // Calculate delta time
        const deltaTime = (timestamp - this.lastFrameTime) / 1000;
        this.lastFrameTime = timestamp;
        
        // Update time-based systems
        if (this.config.timeBasedGrowth) {
            this.updateTimeBasedGrowth(deltaTime);
        }
        
        // Update lighting
        if (this.config.ambientLighting) {
            this.updateLighting();
        }
        
        // Update plants
        this.updatePlants(deltaTime);
        
        // Update particles
        if (this.config.growthParticles) {
            this.updateParticles(deltaTime);
        }
        
        // Continue the loop
        requestAnimationFrame(this.update);
    }

    /**
     * Update time-based growth for all plants
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateTimeBasedGrowth(deltaTime) {
        const now = Date.now();
        
        this.plants.forEach(plant => {
            // Calculate time-based growth
            const timeSinceWatered = (now - plant.lastWatered) / 1000; // in seconds
            const waterFactor = Math.max(0, 1 - (timeSinceWatered / (24 * 60 * 60))); // Decay over 24 hours
            
            // Apply growth based on health and water
            const growthIncrement = deltaTime * plant.growthRate * plant.health * waterFactor * this.config.growthSpeed;
            plant.growthProgress += growthIncrement;
            
            // Check for growth stage advancement
            if (plant.growthProgress >= 1 && plant.growthStage < plant.maxGrowthStage) {
                plant.growthStage++;
                plant.growthProgress = 0;
                
                // Update visual appearance
                this.updatePlantStyles(plant);
                
                // Play growth sound
                if (this.config.soundEffects) {
                    this.playSound('growth', 0.5, 0.8 + Math.random() * 0.4);
                }
                
                // Create growth particles
                if (this.config.growthParticles) {
                    this.createGrowthParticles(plant);
                }
                
                console.log(`Plant ${plant.id} advanced to growth stage ${plant.growthStage}`);
            }
        });
    }

    /**
     * Update all plants
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updatePlants(deltaTime) {
        const now = performance.now() / 1000; // Current time in seconds
        
        this.plants.forEach(plant => {
            if (!plant.element) return;
            
            // Apply wind effect if enabled
            if (this.config.windEffect && this.weather === 'windy') {
                const windAngle = (now * plant.swayFactor + plant.swayOffset) * this.windStrength;
                const swayAmount = Math.sin(windAngle) * 5 * this.windStrength * plant.swayFactor;
                
                // Apply sway transform
                const growthScale = 0.5 + (plant.growthStage / plant.maxGrowthStage) * 0.5;
                plant.element.style.transform = `scale(${growthScale}) rotate(${swayAmount}deg)`;
            }
            
            // Check for mouse interaction
            const dx = this.mousePosition.x - plant.x;
            const dy = this.mousePosition.y - plant.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < this.config.interactionRadius) {
                // Plant is being interacted with
                if (now - plant.lastInteraction > 0.5) { // Limit interaction frequency
                    plant.lastInteraction = now;
                    plant.interactionCount++;
                    
                    // Play rustle sound
                    if (this.config.soundEffects && Math.random() < 0.3) {
                        this.playSound('rustle', 0.3, 0.8 + Math.random() * 0.4);
                    }
                    
                    // Create interaction particles
                    if (this.config.growthParticles) {
                        this.createInteractionParticles(plant);
                    }
                }
                
                // Update spotlight position if lighting is enabled
                if (this.config.ambientLighting && this.spotLight) {
                    this.spotLight.style.left = `${this.mousePosition.x}px`;
                    this.spotLight.style.top = `${this.mousePosition.y}px`;
                    this.spotLight.style.opacity = '1';
                }
            }
        });
    }

    /**
     * Update all particles
     * @param {number} deltaTime - Time since last frame in seconds
     */
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            if (!particle.active) return;
            
            // Update particle position
            particle.x += particle.vx * deltaTime * 60;
            particle.y += particle.vy * deltaTime * 60;
            
            // Update particle life
            particle.life -= particle.decay * deltaTime * 60;
            
            // Update particle element if it exists
            if (particle.element) {
                particle.element.style.left = `${particle.x}px`;
                particle.element.style.top = `${particle.y}px`;
                particle.element.style.opacity = particle.life * particle.alpha;
                
                // Remove particle if it's dead
                if (particle.life <= 0) {
                    if (particle.element.parentNode) {
                        particle.element.parentNode.removeChild(particle.element);
                    }
                    particle.element = null;
                    particle.active = false;
                }
            }
        });
    }

    /**
     * Create particles for plant growth
     * @param {Object} plant - Plant object
     */
    createGrowthParticles(plant) {
        const particleCount = 10 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < particleCount; i++) {
            // Find an inactive particle
            const particle = this.particles.find(p => !p.active);
            if (!particle) continue;
            
            // Position particle at plant
            particle.x = plant.x + plant.width / 2 + (Math.random() * 40 - 20);
            particle.y = plant.y + plant.height / 2 + (Math.random() * 40 - 20);
            
            // Set particle properties
            particle.size = 3 + Math.random() * 5;
            particle.color = `hsl(${110 + Math.random() * 40}, ${80 + Math.random() * 20}%, ${70 + Math.random() * 30}%)`;
            
            // Set velocity (upward with spread)
            const angle = Math.PI * 1.5 + (Math.random() * Math.PI / 4 - Math.PI / 8);
            const speed = 1 + Math.random() * 2;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Set life properties
            particle.alpha = 0.7 + Math.random() * 0.3;
            particle.life = 1.0;
            particle.decay = 0.01 + Math.random() * 0.02;
            particle.active = true;
            
            // Create particle element
            if (!particle.element) {
                particle.element = document.createElement('div');
                particle.element.className = 'growth-particle';
                particle.element.style.position = 'absolute';
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size}px`;
                particle.element.style.borderRadius = '50%';
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${particle.color}`;
                particle.element.style.pointerEvents = 'none';
                particle.element.style.zIndex = '10';
                
                // Add to container
                if (this.config.container) {
                    this.config.container.appendChild(particle.element);
                }
            } else {
                // Update existing element
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size}px`;
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size * 2}px ${particle.color}`;
            }
            
            // Position element
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.alpha;
        }
    }

    /**
     * Create particles for plant interaction
     * @param {Object} plant - Plant object
     */
    createInteractionParticles(plant) {
        const particleCount = 5 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < particleCount; i++) {
            // Find an inactive particle
            const particle = this.particles.find(p => !p.active);
            if (!particle) continue;
            
            // Position particle at interaction point
            particle.x = this.mousePosition.x + (Math.random() * 20 - 10);
            particle.y = this.mousePosition.y + (Math.random() * 20 - 10);
            
            // Set particle properties
            particle.size = 2 + Math.random() * 3;
            particle.color = `hsl(${90 + Math.random() * 40}, ${70 + Math.random() * 30}%, ${70 + Math.random() * 30}%)`;
            
            // Set velocity (outward from interaction point)
            const angle = Math.random() * Math.PI * 2;
            const speed = 0.5 + Math.random() * 1;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Set life properties
            particle.alpha = 0.5 + Math.random() * 0.5;
            particle.life = 1.0;
            particle.decay = 0.02 + Math.random() * 0.03;
            particle.active = true;
            
            // Create particle element
            if (!particle.element) {
                particle.element = document.createElement('div');
                particle.element.className = 'interaction-particle';
                particle.element.style.position = 'absolute';
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size}px`;
                particle.element.style.borderRadius = '50%';
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
                particle.element.style.pointerEvents = 'none';
                particle.element.style.zIndex = '10';
                
                // Add to container
                if (this.config.container) {
                    this.config.container.appendChild(particle.element);
                }
            } else {
                // Update existing element
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size}px`;
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
            }
            
            // Position element
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.alpha;
        }
    }

    /**
     * Water a plant
     * @param {string} plantId - Plant ID
     * @param {number} amount - Water amount
     */
    waterPlant(plantId, amount = 1.0) {
        const plant = this.plants.find(p => p.id === plantId);
        if (!plant) return false;
        
        // Update plant properties
        plant.lastWatered = Date.now();
        plant.health = Math.min(1.0, plant.health + amount * 0.2);
        
        // Update visual appearance
        this.updatePlantStyles(plant);
        
        // Play water sound
        if (this.config.soundEffects) {
            this.playSound('water', 0.5, 0.9 + Math.random() * 0.2);
        }
        
        // Create water particles
        if (this.config.growthParticles) {
            this.createWaterParticles(plant);
        }
        
        // Provide haptic feedback if enabled
        if (this.config.hapticFeedback && navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        console.log(`Plant ${plantId} watered with amount ${amount}`);
        return true;
    }

    /**
     * Create water particles for a plant
     * @param {Object} plant - Plant object
     */
    createWaterParticles(plant) {
        const particleCount = 15 + Math.floor(Math.random() * 10);
        
        for (let i = 0; i < particleCount; i++) {
            // Find an inactive particle
            const particle = this.particles.find(p => !p.active);
            if (!particle) continue;
            
            // Position particle above plant
            particle.x = plant.x + plant.width / 2 + (Math.random() * plant.width - plant.width / 2);
            particle.y = plant.y + (Math.random() * 20);
            
            // Set particle properties
            particle.size = 2 + Math.random() * 4;
            particle.color = `hsl(${200 + Math.random() * 40}, ${70 + Math.random() * 30}%, ${70 + Math.random() * 30}%)`;
            
            // Set velocity (downward with spread)
            const angle = Math.PI / 2 + (Math.random() * Math.PI / 4 - Math.PI / 8);
            const speed = 2 + Math.random() * 3;
            particle.vx = Math.cos(angle) * speed;
            particle.vy = Math.sin(angle) * speed;
            
            // Set life properties
            particle.alpha = 0.7 + Math.random() * 0.3;
            particle.life = 1.0;
            particle.decay = 0.02 + Math.random() * 0.03;
            particle.active = true;
            
            // Create particle element
            if (!particle.element) {
                particle.element = document.createElement('div');
                particle.element.className = 'water-particle';
                particle.element.style.position = 'absolute';
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size * 1.5}px`;
                particle.element.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
                particle.element.style.pointerEvents = 'none';
                particle.element.style.zIndex = '10';
                
                // Add to container
                if (this.config.container) {
                    this.config.container.appendChild(particle.element);
                }
            } else {
                // Update existing element
                particle.element.style.width = `${particle.size}px`;
                particle.element.style.height = `${particle.size * 1.5}px`;
                particle.element.style.backgroundColor = particle.color;
                particle.element.style.boxShadow = `0 0 ${particle.size}px ${particle.color}`;
            }
            
            // Position element
            particle.element.style.left = `${particle.x}px`;
            particle.element.style.top = `${particle.y}px`;
            particle.element.style.opacity = particle.alpha;
        }
    }

    /**
     * Handle mouse movement
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        const rect = this.config.container.getBoundingClientRect();
        this.mousePosition.x = event.clientX - rect.left;
        this.mousePosition.y = event.clientY - rect.top;
        
        // Update spotlight position if lighting is enabled
        if (this.config.ambientLighting && this.spotLight) {
            this.spotLight.style.left = `${this.mousePosition.x}px`;
            this.spotLight.style.top = `${this.mousePosition.y}px`;
            this.spotLight.style.opacity = '1';
            
            // Hide spotlight after inactivity
            clearTimeout(this.spotlightTimeout);
            this.spotlightTimeout = setTimeout(() => {
                this.spotLight.style.opacity = '0';
            }, 2000);
        }
    }

    /**
     * Handle mouse click
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseClick(event) {
        const rect = this.config.container.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Check if a plant was clicked
        let clickedPlant = null;
        for (const plant of this.plants) {
            if (x >= plant.x && x <= plant.x + plant.width &&
                y >= plant.y && y <= plant.y + plant.height) {
                clickedPlant = plant;
                break;
            }
        }
        
        // Handle plant interaction
        if (clickedPlant) {
            // Trigger plant interaction event
            const customEvent = new CustomEvent('plantInteraction', {
                detail: {
                    plantId: clickedPlant.id,
                    x: x,
                    y: y
                }
            });
            this.config.container.dispatchEvent(customEvent);
            
            // Provide haptic feedback if enabled
            if (this.config.hapticFeedback && navigator.vibrate) {
                navigator.vibrate(30);
            }
        }
    }

    /**
     * Handle touch start
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        if (event.touches.length > 0) {
            const rect = this.config.container.getBoundingClientRect();
            this.mousePosition.x = event.touches[0].clientX - rect.left;
            this.mousePosition.y = event.touches[0].clientY - rect.top;
            
            // Update spotlight
            if (this.config.ambientLighting && this.spotLight) {
                this.spotLight.style.left = `${this.mousePosition.x}px`;
                this.spotLight.style.top = `${this.mousePosition.y}px`;
                this.spotLight.style.opacity = '1';
            }
        }
    }

    /**
     * Handle touch move
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        if (event.touches.length > 0) {
            const rect = this.config.container.getBoundingClientRect();
            this.mousePosition.x = event.touches[0].clientX - rect.left;
            this.mousePosition.y = event.touches[0].clientY - rect.top;
            
            // Update spotlight
            if (this.config.ambientLighting && this.spotLight) {
                this.spotLight.style.left = `${this.mousePosition.x}px`;
                this.spotLight.style.top = `${this.mousePosition.y}px`;
                this.spotLight.style.opacity = '1';
            }
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        // Update particle positions
        if (this.config.growthParticles) {
            this.particles.forEach(particle => {
                if (particle.active && particle.element) {
                    // Keep particles within container bounds
                    const containerWidth = this.config.container ? this.config.container.offsetWidth : window.innerWidth;
                    const containerHeight = this.config.container ? this.config.container.offsetHeight : window.innerHeight;
                    
                    particle.x = Math.min(Math.max(particle.x, 0), containerWidth);
                    particle.y = Math.min(Math.max(particle.y, 0), containerHeight);
                    
                    particle.element.style.left = `${particle.x}px`;
                    particle.element.style.top = `${particle.y}px`;
                }
            });
        }
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Stop animation
        this.stop();
        
        // Remove event listeners
        if (this.config.container) {
            this.config.container.removeEventListener('mousemove', this.handleMouseMove);
            this.config.container.removeEventListener('click', this.handleMouseClick);
            this.config.container.removeEventListener('touchstart', this.handleTouchStart);
            this.config.container.removeEventListener('touchmove', this.handleTouchMove);
        }
        window.removeEventListener('resize', this.handleResize);
        
        // Remove particles
        this.particles.forEach(particle => {
            if (particle.element && particle.element.parentNode) {
                particle.element.parentNode.removeChild(particle.element);
            }
        });
        
        // Remove lighting elements
        if (this.ambientLight && this.ambientLight.parentNode) {
            this.ambientLight.parentNode.removeChild(this.ambientLight);
        }
        if (this.spotLight && this.spotLight.parentNode) {
            this.spotLight.parentNode.removeChild(this.spotLight);
        }
        
        // Remove weather elements
        if (this.weatherContainer && this.weatherContainer.parentNode) {
            this.weatherContainer.parentNode.removeChild(this.weatherContainer);
        }
        
        console.log('Interactive Growth System cleaned up');
    }
}

// Export the class
window.InteractiveGrowthSystem = InteractiveGrowthSystem;