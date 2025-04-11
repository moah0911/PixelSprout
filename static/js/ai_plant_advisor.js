/**
 * AI Plant Advisor System
 * 
 * This advanced system provides personalized plant care recommendations,
 * growth predictions, and habit suggestions based on user behavior patterns.
 */

class AIPlantAdvisor {
    constructor(options = {}) {
        // Configuration
        this.config = {
            apiEndpoint: options.apiEndpoint || '/api/ai-advisor',
            userDataEndpoint: options.userDataEndpoint || '/api/user/data',
            plantDataEndpoint: options.plantDataEndpoint || '/api/plants/data',
            habitDataEndpoint: options.habitDataEndpoint || '/api/habits/data',
            updateInterval: options.updateInterval || 3600000, // 1 hour in ms
            enablePredictions: options.enablePredictions !== undefined ? options.enablePredictions : true,
            enableNotifications: options.enableNotifications !== undefined ? options.enableNotifications : true,
            enableVoiceInterface: options.enableVoiceInterface !== undefined ? options.enableVoiceInterface : true,
            enableMoodTracking: options.enableMoodTracking !== undefined ? options.enableMoodTracking : true,
            enableWeatherIntegration: options.enableWeatherIntegration !== undefined ? options.enableWeatherIntegration : true,
            debugMode: options.debugMode || false
        };

        // State
        this.userData = null;
        this.plantData = [];
        this.habitData = [];
        this.weatherData = null;
        this.recommendations = [];
        this.predictionModels = {};
        this.lastUpdate = 0;
        this.isInitialized = false;
        this.speechRecognition = null;
        this.speechSynthesis = window.speechSynthesis;
        this.voices = [];
        this.selectedVoice = null;
        this.moodHistory = [];
        this.correlations = {};
        this.advisorPersonality = {
            name: "Sprout",
            traits: ["helpful", "encouraging", "knowledgeable", "friendly"],
            emoji: "🌱",
            color: "#4CAF50"
        };

        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.fetchUserData = this.fetchUserData.bind(this);
        this.fetchPlantData = this.fetchPlantData.bind(this);
        this.fetchHabitData = this.fetchHabitData.bind(this);
        this.fetchWeatherData = this.fetchWeatherData.bind(this);
        this.generateRecommendations = this.generateRecommendations.bind(this);
        this.updatePredictionModels = this.updatePredictionModels.bind(this);
        this.predictPlantGrowth = this.predictPlantGrowth.bind(this);
        this.predictHabitSuccess = this.predictHabitSuccess.bind(this);
        this.getPersonalizedAdvice = this.getPersonalizedAdvice.bind(this);
        this.displayRecommendation = this.displayRecommendation.bind(this);
        this.startVoiceRecognition = this.startVoiceRecognition.bind(this);
        this.speakRecommendation = this.speakRecommendation.bind(this);
        this.trackMood = this.trackMood.bind(this);
        this.analyzeHabitMoodCorrelations = this.analyzeHabitMoodCorrelations.bind(this);
    }

    /**
     * Initialize the AI advisor system
     * @returns {Promise} Initialization promise
     */
    async initialize() {
        if (this.isInitialized) return Promise.resolve();

        try {
            this.log("Initializing AI Plant Advisor...");

            // Initialize speech synthesis
            if (this.config.enableVoiceInterface && this.speechSynthesis) {
                this.voices = this.speechSynthesis.getVoices();
                if (this.voices.length === 0) {
                    // If voices aren't loaded yet, wait for them
                    await new Promise(resolve => {
                        this.speechSynthesis.onvoiceschanged = () => {
                            this.voices = this.speechSynthesis.getVoices();
                            resolve();
                        };
                    });
                }
                
                // Select a voice (prefer female voices for the plant advisor)
                this.selectedVoice = this.voices.find(voice => 
                    voice.name.includes("Female") || 
                    voice.name.includes("Samantha") || 
                    voice.name.includes("Google UK English Female")
                ) || this.voices[0];
                
                this.log(`Selected voice: ${this.selectedVoice.name}`);
            }

            // Initialize speech recognition
            if (this.config.enableVoiceInterface && window.webkitSpeechRecognition) {
                this.speechRecognition = new webkitSpeechRecognition();
                this.speechRecognition.continuous = false;
                this.speechRecognition.interimResults = false;
                this.speechRecognition.lang = 'en-US';
                
                this.speechRecognition.onresult = (event) => {
                    const transcript = event.results[0][0].transcript.toLowerCase();
                    this.log(`Voice input: ${transcript}`);
                    this.processVoiceCommand(transcript);
                };
                
                this.speechRecognition.onerror = (event) => {
                    this.log(`Speech recognition error: ${event.error}`, true);
                };
            }

            // Fetch initial data
            try {
                await Promise.all([
                    this.fetchUserData(),
                    this.fetchPlantData(),
                    this.fetchHabitData(),
                    this.config.enableWeatherIntegration ? this.fetchWeatherData() : Promise.resolve()
                ]);
            } catch (fetchError) {
                this.log(`Error fetching initial data: ${fetchError.message}`, true);
                // Continue initialization with default/cached data
            }

            // Generate initial recommendations
            await this.generateRecommendations();

            // Set up update interval
            setInterval(() => {
                this.update();
            }, this.config.updateInterval);

            this.isInitialized = true;
            this.log("AI Plant Advisor initialized successfully");
            return Promise.resolve();
        } catch (error) {
            this.log(`Initialization error: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Update the advisor system
     * @returns {Promise} Update promise
     */
    async update() {
        try {
            this.log("Updating AI Plant Advisor data...");
            
            // Fetch updated data
            await Promise.all([
                this.fetchUserData(),
                this.fetchPlantData(),
                this.fetchHabitData(),
                this.config.enableWeatherIntegration ? this.fetchWeatherData() : Promise.resolve()
            ]);

            // Update prediction models
            if (this.config.enablePredictions) {
                await this.updatePredictionModels();
            }

            // Generate new recommendations
            await this.generateRecommendations();

            this.lastUpdate = Date.now();
            this.log("AI Plant Advisor updated successfully");
            return Promise.resolve();
        } catch (error) {
            this.log(`Update error: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Fetch user data from the API
     * @returns {Promise} User data promise
     */
    async fetchUserData() {
        try {
            // Check if endpoint is available
            if (!this.config.userDataEndpoint) {
                this.log('User data endpoint not configured, using default data', true);
                return this.userData || {
                    id: 'default-user',
                    name: 'Guest User',
                    preferences: {},
                    stats: {
                        plantsGrown: 0,
                        habitsCompleted: 0,
                        wateringStreak: 0
                    }
                };
            }
            
            try {
                const response = await fetch(this.config.userDataEndpoint);
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                
                const data = await response.json();
                this.userData = data;
                this.log("User data fetched successfully");
                return data;
            } catch (fetchError) {
                this.log(`Error fetching user data: ${fetchError.message}`, true);
                // Use cached data if available, or default data
                return this.userData || {
                    id: 'default-user',
                    name: 'Guest User',
                    preferences: {},
                    stats: {
                        plantsGrown: 0,
                        habitsCompleted: 0,
                        wateringStreak: 0
                    }
                };
            }
        } catch (error) {
            this.log(`Unexpected error in fetchUserData: ${error.message}`, true);
            // Return a minimal default user object
            return {
                id: 'default-user',
                name: 'Guest User',
                preferences: {},
                stats: {
                    plantsGrown: 0,
                    habitsCompleted: 0,
                    wateringStreak: 0
                }
            };
        }
    }

    /**
     * Fetch plant data from the API
     * @returns {Promise} Plant data promise
     */
    async fetchPlantData() {
        try {
            const response = await fetch(this.config.plantDataEndpoint);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.plantData = data;
            this.log(`Fetched data for ${data.length} plants`);
            return data;
        } catch (error) {
            this.log(`Error fetching plant data: ${error.message}`, true);
            // Use cached data if available
            return this.plantData || [];
        }
    }

    /**
     * Fetch habit data from the API
     * @returns {Promise} Habit data promise
     */
    async fetchHabitData() {
        try {
            const response = await fetch(this.config.habitDataEndpoint);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.habitData = data;
            this.log(`Fetched data for ${data.length} habits`);
            return data;
        } catch (error) {
            this.log(`Error fetching habit data: ${error.message}`, true);
            // Use cached data if available
            return this.habitData || [];
        }
    }

    /**
     * Fetch weather data from a weather API
     * @returns {Promise} Weather data promise
     */
    async fetchWeatherData() {
        if (!this.config.enableWeatherIntegration) return Promise.resolve(null);
        
        try {
            // Get user's location (if available)
            let latitude, longitude;
            
            if (this.userData && this.userData.location) {
                // Use stored location
                latitude = this.userData.location.latitude;
                longitude = this.userData.location.longitude;
            } else {
                // Try to get current location
                const position = await new Promise((resolve, reject) => {
                    if (!navigator.geolocation) {
                        reject(new Error("Geolocation not supported"));
                        return;
                    }
                    
                    navigator.geolocation.getCurrentPosition(resolve, reject, {
                        enableHighAccuracy: false,
                        timeout: 5000,
                        maximumAge: 600000 // 10 minutes
                    });
                });
                
                latitude = position.coords.latitude;
                longitude = position.coords.longitude;
            }
            
            // Fetch weather data from OpenWeatherMap or similar service
            // Note: In a real implementation, you would use your own API key
            const apiKey = "demo_key"; // Replace with actual API key in production
            const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=metric&appid=${apiKey}`;
            
            // For demo purposes, we'll simulate weather data
            // In a real implementation, you would uncomment the fetch call below
            /*
            const response = await fetch(weatherUrl);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            const data = await response.json();
            */
            
            // Simulated weather data
            const data = {
                weather: [{ main: "Clear", description: "clear sky" }],
                main: {
                    temp: 22,
                    humidity: 65,
                    pressure: 1012
                },
                wind: {
                    speed: 3.5,
                    deg: 220
                },
                sys: {
                    sunrise: Math.floor(Date.now() / 1000) - 21600, // 6 hours ago
                    sunset: Math.floor(Date.now() / 1000) + 21600 // 6 hours from now
                },
                name: "Your City"
            };
            
            this.weatherData = data;
            this.log(`Weather data fetched for ${data.name}`);
            return data;
        } catch (error) {
            this.log(`Error fetching weather data: ${error.message}`, true);
            // Use cached data if available
            return this.weatherData || null;
        }
    }

    /**
     * Generate personalized recommendations
     * @returns {Promise} Recommendations promise
     */
    async generateRecommendations() {
        try {
            this.log("Generating personalized recommendations...");
            
            // Initialize recommendations array
            const recommendations = [];
            
            // Validate data
            if (!this.userData) {
                this.log("No user data available for recommendations", true);
                this.userData = {
                    id: 'default-user',
                    name: 'Guest User',
                    preferences: {},
                    stats: {
                        plantsGrown: 0,
                        habitsCompleted: 0,
                        wateringStreak: 0
                    }
                };
            }
            
            if (!this.plantData || !Array.isArray(this.plantData)) {
                this.log("No plant data available for recommendations", true);
                this.plantData = [];
            }
            
            // Check if we have enough data
            if (!this.userData || this.plantData.length === 0) {
                recommendations.push({
                    type: "general",
                    priority: "medium",
                    message: "Welcome to PixelSprout! Start by adding plants to your garden.",
                    actionable: true,
                    action: {
                        type: "navigate",
                        target: "/garden/add"
                    }
                });
                
                this.recommendations = recommendations;
                return recommendations;
            }
            
            // Plant-specific recommendations
            for (const plant of this.plantData) {
                // Check watering needs
                const daysSinceWatered = plant.lastWatered ? 
                    Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)) : 
                    999;
                
                if (daysSinceWatered >= plant.wateringFrequency) {
                    recommendations.push({
                        type: "watering",
                        priority: "high",
                        plantId: plant.id,
                        plantName: plant.name,
                        message: `${plant.name} needs watering! It's been ${daysSinceWatered} days.`,
                        actionable: true,
                        action: {
                            type: "water",
                            plantId: plant.id
                        }
                    });
                } else if (daysSinceWatered >= plant.wateringFrequency - 1) {
                    recommendations.push({
                        type: "watering",
                        priority: "medium",
                        plantId: plant.id,
                        plantName: plant.name,
                        message: `${plant.name} will need watering soon.`,
                        actionable: false
                    });
                }
                
                // Growth stage recommendations
                if (plant.growthStage < plant.maxGrowthStage) {
                    const nextStageRequirements = this.getNextStageRequirements(plant);
                    if (nextStageRequirements) {
                        recommendations.push({
                            type: "growth",
                            priority: "medium",
                            plantId: plant.id,
                            plantName: plant.name,
                            message: `To help ${plant.name} reach the next growth stage: ${nextStageRequirements}`,
                            actionable: false
                        });
                    }
                }
                
                // Health recommendations
                if (plant.health < 0.7) {
                    const healthTips = this.getHealthTips(plant);
                    recommendations.push({
                        type: "health",
                        priority: plant.health < 0.4 ? "high" : "medium",
                        plantId: plant.id,
                        plantName: plant.name,
                        message: `${plant.name} doesn't look very healthy. ${healthTips}`,
                        actionable: true,
                        action: {
                            type: "navigate",
                            target: `/garden/plant/${plant.id}`
                        }
                    });
                }
            }
            
            // Habit recommendations
            if (this.habitData.length > 0) {
                // Find habits that haven't been completed today
                const today = new Date().toISOString().split('T')[0];
                const incompleteTodayHabits = this.habitData.filter(habit => 
                    !habit.completionDates || !habit.completionDates.includes(today)
                );
                
                // Prioritize habits based on streak and importance
                incompleteTodayHabits.sort((a, b) => {
                    const aScore = (a.streak || 0) + (a.importance || 1);
                    const bScore = (b.streak || 0) + (b.importance || 1);
                    return bScore - aScore;
                });
                
                // Add recommendations for top habits
                for (let i = 0; i < Math.min(3, incompleteTodayHabits.length); i++) {
                    const habit = incompleteTodayHabits[i];
                    recommendations.push({
                        type: "habit",
                        priority: i === 0 ? "high" : "medium",
                        habitId: habit.id,
                        habitName: habit.name,
                        message: `Don't forget to ${habit.name.toLowerCase()} today${habit.streak ? ` (current streak: ${habit.streak} days)` : ''}.`,
                        actionable: true,
                        action: {
                            type: "completeHabit",
                            habitId: habit.id
                        }
                    });
                }
                
                // Add mood-based recommendations if mood tracking is enabled
                if (this.config.enableMoodTracking && this.moodHistory.length > 0) {
                    const recentMood = this.moodHistory[this.moodHistory.length - 1];
                    if (recentMood && recentMood.value < 3) { // If recent mood is low
                        // Find habits that correlate with improved mood
                        const positiveHabits = Object.entries(this.correlations)
                            .filter(([habitId, correlation]) => correlation > 0.3)
                            .map(([habitId]) => this.habitData.find(h => h.id === habitId))
                            .filter(Boolean);
                        
                        if (positiveHabits.length > 0) {
                            const habit = positiveHabits[0];
                            recommendations.push({
                                type: "mood",
                                priority: "medium",
                                habitId: habit.id,
                                habitName: habit.name,
                                message: `Feeling down? ${habit.name} has helped improve your mood in the past.`,
                                actionable: true,
                                action: {
                                    type: "completeHabit",
                                    habitId: habit.id
                                }
                            });
                        }
                    }
                }
            }
            
            // Weather-based recommendations
            if (this.config.enableWeatherIntegration && this.weatherData) {
                // Check if it's a good day for outdoor activities
                if (this.weatherData.weather[0].main === "Clear" || this.weatherData.weather[0].main === "Clouds") {
                    const outdoorHabits = this.habitData.filter(habit => 
                        habit.tags && (habit.tags.includes("outdoor") || habit.tags.includes("nature"))
                    );
                    
                    if (outdoorHabits.length > 0) {
                        const habit = outdoorHabits[0];
                        recommendations.push({
                            type: "weather",
                            priority: "low",
                            habitId: habit.id,
                            habitName: habit.name,
                            message: `It's a nice day for ${habit.name.toLowerCase()}!`,
                            actionable: true,
                            action: {
                                type: "completeHabit",
                                habitId: habit.id
                            }
                        });
                    } else {
                        recommendations.push({
                            type: "weather",
                            priority: "low",
                            message: `It's a beautiful day! Consider spending some time outdoors.`,
                            actionable: false
                        });
                    }
                } else if (this.weatherData.weather[0].main === "Rain") {
                    // Indoor plant care recommendation
                    recommendations.push({
                        type: "weather",
                        priority: "low",
                        message: `Rainy day! Perfect time to check on your indoor plants.`,
                        actionable: true,
                        action: {
                            type: "navigate",
                            target: "/garden"
                        }
                    });
                }
            }
            
            // Add prediction-based recommendations if enabled
            if (this.config.enablePredictions && Object.keys(this.predictionModels).length > 0) {
                // Plant growth predictions
                for (const plant of this.plantData) {
                    const growthPrediction = this.predictPlantGrowth(plant.id);
                    if (growthPrediction && growthPrediction.daysToNextStage) {
                        if (growthPrediction.daysToNextStage <= 3) {
                            recommendations.push({
                                type: "prediction",
                                priority: "medium",
                                plantId: plant.id,
                                plantName: plant.name,
                                message: `${plant.name} is likely to reach the next growth stage in ${growthPrediction.daysToNextStage} days!`,
                                actionable: false
                            });
                        }
                    }
                }
                
                // Habit success predictions
                for (const habit of this.habitData) {
                    const successPrediction = this.predictHabitSuccess(habit.id);
                    if (successPrediction && successPrediction.probability < 0.4) {
                        recommendations.push({
                            type: "prediction",
                            priority: "medium",
                            habitId: habit.id,
                            habitName: habit.name,
                            message: `You might find it challenging to maintain your "${habit.name}" habit. Need some motivation?`,
                            actionable: true,
                            action: {
                                type: "motivation",
                                habitId: habit.id
                            }
                        });
                    }
                }
            }
            
            // Sort recommendations by priority
            const priorityValues = { high: 3, medium: 2, low: 1 };
            recommendations.sort((a, b) => priorityValues[b.priority] - priorityValues[a.priority]);
            
            // Limit to a reasonable number
            const limitedRecommendations = recommendations.slice(0, 5);
            
            this.recommendations = limitedRecommendations;
            this.log(`Generated ${limitedRecommendations.length} recommendations`);
            return limitedRecommendations;
        } catch (error) {
            this.log(`Error generating recommendations: ${error.message}`, true);
            return this.recommendations || [];
        }
    }

    /**
     * Get requirements for a plant to reach the next growth stage
     * @param {Object} plant - Plant object
     * @returns {string} Requirements description
     */
    getNextStageRequirements(plant) {
        // This would be more sophisticated in a real implementation
        const requirements = [];
        
        if (plant.wateringFrequency > 3) {
            requirements.push("regular watering");
        } else {
            requirements.push("careful watering (don't overwater)");
        }
        
        if (plant.sunlightNeeds === "high") {
            requirements.push("plenty of sunlight");
        } else if (plant.sunlightNeeds === "low") {
            requirements.push("indirect light");
        } else {
            requirements.push("moderate sunlight");
        }
        
        // Add more specific requirements based on plant type
        if (plant.type === "flower") {
            requirements.push("occasional fertilizing");
        } else if (plant.type === "vegetable") {
            requirements.push("nutrient-rich soil");
        } else if (plant.type === "succulent") {
            requirements.push("well-draining soil");
        }
        
        return requirements.join(", ");
    }

    /**
     * Get health improvement tips for a plant
     * @param {Object} plant - Plant object
     * @returns {string} Health tips
     */
    getHealthTips(plant) {
        // This would be more sophisticated in a real implementation
        const tips = [];
        
        // Check watering issues
        const daysSinceWatered = plant.lastWatered ? 
            Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)) : 
            999;
            
        if (daysSinceWatered > plant.wateringFrequency * 1.5) {
            tips.push("It needs water urgently");
        } else if (daysSinceWatered < plant.wateringFrequency * 0.5 && plant.health < 0.5) {
            tips.push("It might be overwatered");
        }
        
        // Check sunlight issues
        if (plant.currentSunlight && plant.sunlightNeeds) {
            if (plant.sunlightNeeds === "high" && plant.currentSunlight === "low") {
                tips.push("It needs more sunlight");
            } else if (plant.sunlightNeeds === "low" && plant.currentSunlight === "high") {
                tips.push("It's getting too much direct sunlight");
            }
        }
        
        // Generic tips if nothing specific
        if (tips.length === 0) {
            tips.push("Check for pests, ensure proper drainage, and consider adding nutrients to the soil");
        }
        
        return tips.join(". ") + ".";
    }

    /**
     * Update prediction models based on historical data
     * @returns {Promise} Update promise
     */
    async updatePredictionModels() {
        try {
            this.log("Updating prediction models...");
            
            // In a real implementation, this would use machine learning algorithms
            // For this demo, we'll use simple heuristics
            
            // Plant growth prediction models
            for (const plant of this.plantData) {
                if (!plant.growthHistory || plant.growthHistory.length < 2) continue;
                
                // Calculate average days between growth stages
                const growthIntervals = [];
                for (let i = 1; i < plant.growthHistory.length; i++) {
                    const prevStage = plant.growthHistory[i - 1];
                    const currStage = plant.growthHistory[i];
                    const days = Math.floor((new Date(currStage.date).getTime() - new Date(prevStage.date).getTime()) / (1000 * 60 * 60 * 24));
                    growthIntervals.push(days);
                }
                
                const avgDaysPerStage = growthIntervals.reduce((sum, days) => sum + days, 0) / growthIntervals.length;
                
                // Create simple prediction model
                this.predictionModels[`plant_${plant.id}`] = {
                    type: "growth",
                    avgDaysPerStage: avgDaysPerStage,
                    wateringImpact: 0.2, // Watering reduces time by 20%
                    sunlightImpact: 0.15, // Proper sunlight reduces time by 15%
                    lastUpdated: Date.now()
                };
            }
            
            // Habit success prediction models
            for (const habit of this.habitData) {
                if (!habit.completionDates || habit.completionDates.length < 7) continue;
                
                // Calculate completion rate
                const last30Days = [];
                const now = new Date();
                for (let i = 0; i < 30; i++) {
                    const date = new Date(now);
                    date.setDate(date.getDate() - i);
                    const dateString = date.toISOString().split('T')[0];
                    last30Days.push(dateString);
                }
                
                const completedDays = last30Days.filter(date => habit.completionDates.includes(date));
                const completionRate = completedDays.length / 30;
                
                // Calculate streak impact
                const streakImpact = habit.streak ? Math.min(0.3, habit.streak * 0.02) : 0;
                
                // Create simple prediction model
                this.predictionModels[`habit_${habit.id}`] = {
                    type: "habit",
                    baseSuccessRate: completionRate,
                    streakImpact: streakImpact,
                    timeOfDayImpact: 0.1, // Completing at the right time of day improves success by 10%
                    weatherImpact: habit.tags && (habit.tags.includes("outdoor") || habit.tags.includes("nature")) ? 0.15 : 0,
                    lastUpdated: Date.now()
                };
            }
            
            this.log(`Updated prediction models for ${Object.keys(this.predictionModels).length} items`);
            return Promise.resolve();
        } catch (error) {
            this.log(`Error updating prediction models: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Predict plant growth timeline
     * @param {string} plantId - Plant ID
     * @returns {Object|null} Growth prediction
     */
    predictPlantGrowth(plantId) {
        const model = this.predictionModels[`plant_${plantId}`];
        if (!model || model.type !== "growth") return null;
        
        const plant = this.plantData.find(p => p.id === plantId);
        if (!plant) return null;
        
        // Calculate base days to next stage
        let daysToNextStage = model.avgDaysPerStage;
        
        // Apply modifiers
        const daysSinceWatered = plant.lastWatered ? 
            Math.floor((Date.now() - new Date(plant.lastWatered).getTime()) / (1000 * 60 * 60 * 24)) : 
            999;
            
        // Watering impact
        if (daysSinceWatered <= plant.wateringFrequency) {
            daysToNextStage *= (1 - model.wateringImpact);
        } else {
            daysToNextStage *= (1 + model.wateringImpact);
        }
        
        // Sunlight impact
        if (plant.currentSunlight === plant.sunlightNeeds) {
            daysToNextStage *= (1 - model.sunlightImpact);
        } else {
            daysToNextStage *= (1 + model.sunlightImpact);
        }
        
        // Round to nearest day
        daysToNextStage = Math.round(daysToNextStage);
        
        return {
            plantId: plantId,
            currentStage: plant.growthStage,
            maxStage: plant.maxGrowthStage,
            daysToNextStage: daysToNextStage,
            estimatedDate: new Date(Date.now() + daysToNextStage * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            confidence: 0.7 // Fixed confidence for demo
        };
    }

    /**
     * Predict habit completion success probability
     * @param {string} habitId - Habit ID
     * @returns {Object|null} Success prediction
     */
    predictHabitSuccess(habitId) {
        const model = this.predictionModels[`habit_${habitId}`];
        if (!model || model.type !== "habit") return null;
        
        const habit = this.habitData.find(h => h.id === habitId);
        if (!habit) return null;
        
        // Start with base success rate
        let successProbability = model.baseSuccessRate;
        
        // Apply streak impact
        if (habit.streak) {
            successProbability += model.streakImpact;
        }
        
        // Apply time of day impact
        const now = new Date();
        const hour = now.getHours();
        const preferredTimeStart = habit.preferredTimeStart || 8;
        const preferredTimeEnd = habit.preferredTimeEnd || 20;
        
        if (hour >= preferredTimeStart && hour <= preferredTimeEnd) {
            successProbability += model.timeOfDayImpact;
        }
        
        // Apply weather impact for outdoor habits
        if (model.weatherImpact > 0 && this.weatherData) {
            const goodWeather = ["Clear", "Clouds"].includes(this.weatherData.weather[0].main);
            if (goodWeather) {
                successProbability += model.weatherImpact;
            } else {
                successProbability -= model.weatherImpact;
            }
        }
        
        // Clamp probability between 0 and 1
        successProbability = Math.max(0, Math.min(1, successProbability));
        
        return {
            habitId: habitId,
            probability: successProbability,
            factors: {
                baseRate: model.baseSuccessRate,
                streak: habit.streak || 0,
                timeOfDay: hour >= preferredTimeStart && hour <= preferredTimeEnd,
                weather: this.weatherData ? this.weatherData.weather[0].main : null
            }
        };
    }

    /**
     * Get personalized advice based on user data and context
     * @param {string} topic - Advice topic
     * @returns {Promise<string>} Advice text
     */
    async getPersonalizedAdvice(topic = 'general') {
        try {
            // Validate input
            if (!topic || typeof topic !== 'string') {
                this.log('Invalid topic provided to getPersonalizedAdvice, using "general" instead', true);
                topic = 'general';
            }
            
            // Ensure topic is one of the supported values
            const validTopics = ['watering', 'sunlight', 'motivation', 'general'];
            if (!validTopics.includes(topic)) {
                this.log(`Unsupported topic "${topic}", using "general" instead`, true);
                topic = 'general';
            }
            
            // In a real implementation, this might call an AI service
            // For this demo, we'll use predefined advice templates
            
            const adviceTemplates = {
                watering: [
                    "Remember that consistent watering is key to healthy plants. Try to water at the same time each day.",
                    "When watering, aim for the soil rather than the leaves to prevent fungal issues.",
                    "Most plants prefer deep, infrequent watering rather than frequent light watering."
                ],
                sunlight: [
                    "Rotate your plants occasionally so all sides get equal sunlight exposure.",
                    "If your plant's leaves are yellowing, it might be getting too much direct sunlight.",
                    "For plants that need indirect light, place them near a north or east-facing window."
                ],
                motivation: [
                    "Building habits takes time. Focus on consistency rather than perfection.",
                    "Try linking your new habit to an existing routine to make it easier to remember.",
                    "Celebrate small wins! Each day you complete your habit is a success."
                ],
                general: [
                    "Taking care of plants can improve your mood and reduce stress levels.",
                    "Consider keeping a plant journal to track growth and changes over time.",
                    "Talking to your plants might sound silly, but the extra CO2 can actually help them grow!"
                ]
            };
            
            // Select advice based on topic
            const templates = adviceTemplates[topic] || adviceTemplates.general;
            let advice = templates[Math.floor(Math.random() * templates.length)];
            
            // Personalize with user name if available
            if (this.userData && this.userData.name) {
                advice = `${this.userData.name}, ${advice.charAt(0).toLowerCase() + advice.slice(1)}`;
            }
            
            // Add advisor personality
            advice = `${this.advisorPersonality.emoji} ${advice}`;
            
            return advice;
        } catch (error) {
            this.log(`Error getting personalized advice: ${error.message}`, true);
            return "I recommend maintaining a consistent care routine for your plants.";
        }
    }

    /**
     * Display a recommendation in the UI
     * @param {Object} recommendation - Recommendation object
     * @param {HTMLElement} container - Container element
     */
    displayRecommendation(recommendation, container) {
        if (!container) {
            this.log("No container provided for recommendation display", true);
            return;
        }
        
        // Create recommendation element
        const element = document.createElement('div');
        element.className = `ai-recommendation priority-${recommendation.priority}`;
        
        // Add icon based on type
        const iconMap = {
            watering: 'tint',
            growth: 'seedling',
            health: 'heartbeat',
            habit: 'check-circle',
            weather: 'cloud-sun',
            prediction: 'magic',
            mood: 'smile',
            general: 'info-circle'
        };
        
        const icon = iconMap[recommendation.type] || 'leaf';
        
        // Create HTML content
        element.innerHTML = `
            <div class="recommendation-icon">
                <i class="fas fa-${icon}"></i>
            </div>
            <div class="recommendation-content">
                <p class="recommendation-message">${recommendation.message}</p>
                ${recommendation.actionable ? 
                    `<button class="recommendation-action" data-action='${JSON.stringify(recommendation.action)}'>
                        ${this.getActionText(recommendation.action)}
                    </button>` : 
                    ''}
            </div>
        `;
        
        // Add event listener for action button
        if (recommendation.actionable) {
            const actionButton = element.querySelector('.recommendation-action');
            actionButton.addEventListener('click', () => {
                this.handleRecommendationAction(recommendation.action);
            });
        }
        
        // Add to container
        container.appendChild(element);
    }

    /**
     * Get text for action button
     * @param {Object} action - Action object
     * @returns {string} Action text
     */
    getActionText(action) {
        switch (action.type) {
            case 'water':
                return 'Water Now';
            case 'navigate':
                return 'View Details';
            case 'completeHabit':
                return 'Complete';
            case 'motivation':
                return 'Get Motivated';
            default:
                return 'Take Action';
        }
    }

    /**
     * Handle recommendation action
     * @param {Object} action - Action object
     */
    handleRecommendationAction(action) {
        this.log(`Handling action: ${action.type}`);
        
        // Dispatch custom event for the application to handle
        const event = new CustomEvent('aiAdvisorAction', {
            detail: action
        });
        document.dispatchEvent(event);
        
        // Provide haptic feedback if available
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
    }

    /**
     * Start voice recognition for commands
     */
    startVoiceRecognition() {
        if (!this.config.enableVoiceInterface || !this.speechRecognition) {
            this.log("Voice interface not enabled or not supported", true);
            return;
        }
        
        try {
            this.speechRecognition.start();
            this.log("Voice recognition started");
        } catch (error) {
            this.log(`Error starting voice recognition: ${error.message}`, true);
        }
    }

    /**
     * Process voice command
     * @param {string} command - Voice command text
     */
    processVoiceCommand(command) {
        this.log(`Processing voice command: ${command}`);
        
        // Simple command processing
        if (command.includes("water") || command.includes("watering")) {
            // Find plants that need watering
            const plantsNeedingWater = this.recommendations
                .filter(r => r.type === "watering" && r.priority === "high")
                .map(r => r.plantId);
                
            if (plantsNeedingWater.length > 0) {
                this.handleRecommendationAction({
                    type: "water",
                    plantId: plantsNeedingWater[0]
                });
                
                this.speakRecommendation(`Watering ${this.plantData.find(p => p.id === plantsNeedingWater[0]).name}`);
            } else {
                this.speakRecommendation("No plants currently need watering.");
            }
        } else if (command.includes("advice") || command.includes("tip")) {
            // Provide random advice
            this.getPersonalizedAdvice("general").then(advice => {
                this.speakRecommendation(advice);
            });
        } else if (command.includes("habit") || command.includes("task")) {
            // Find incomplete habits
            const incompleteHabits = this.recommendations
                .filter(r => r.type === "habit")
                .map(r => r.habitId);
                
            if (incompleteHabits.length > 0) {
                const habit = this.habitData.find(h => h.id === incompleteHabits[0]);
                this.speakRecommendation(`You still need to ${habit.name} today.`);
            } else {
                this.speakRecommendation("You've completed all your habits for today. Great job!");
            }
        } else if (command.includes("weather")) {
            // Provide weather information
            if (this.weatherData) {
                this.speakRecommendation(`The weather is currently ${this.weatherData.weather[0].description} with a temperature of ${Math.round(this.weatherData.main.temp)}°C.`);
            } else {
                this.speakRecommendation("I don't have current weather information.");
            }
        } else {
            this.speakRecommendation("I'm not sure how to help with that. You can ask me about watering, habits, advice, or the weather.");
        }
    }

    /**
     * Speak a recommendation using text-to-speech
     * @param {string} text - Text to speak
     */
    speakRecommendation(text) {
        if (!this.config.enableVoiceInterface || !this.speechSynthesis) {
            this.log("Voice interface not enabled or not supported", true);
            return;
        }
        
        try {
            // Cancel any ongoing speech
            this.speechSynthesis.cancel();
            
            // Create utterance
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Set voice if available
            if (this.selectedVoice) {
                utterance.voice = this.selectedVoice;
            }
            
            // Set properties
            utterance.pitch = 1.1; // Slightly higher pitch for friendly tone
            utterance.rate = 1.0; // Normal rate
            utterance.volume = 0.8; // Slightly quieter than max
            
            // Speak
            this.speechSynthesis.speak(utterance);
            this.log(`Speaking: ${text}`);
        } catch (error) {
            this.log(`Error speaking recommendation: ${error.message}`, true);
        }
    }

    /**
     * Track user mood
     * @param {number} value - Mood value (1-5)
     * @param {string} note - Optional mood note
     */
    trackMood(value, note = "") {
        if (!this.config.enableMoodTracking) return;
        
        try {
            // Add mood entry
            this.moodHistory.push({
                value: value,
                note: note,
                timestamp: Date.now(),
                date: new Date().toISOString().split('T')[0],
                completedHabits: this.habitData
                    .filter(habit => 
                        habit.completionDates && 
                        habit.completionDates.includes(new Date().toISOString().split('T')[0])
                    )
                    .map(habit => habit.id)
            });
            
            // Limit history size
            if (this.moodHistory.length > 100) {
                this.moodHistory = this.moodHistory.slice(-100);
            }
            
            // Analyze correlations
            this.analyzeHabitMoodCorrelations();
            
            this.log(`Mood tracked: ${value}/5`);
        } catch (error) {
            this.log(`Error tracking mood: ${error.message}`, true);
        }
    }

    /**
     * Analyze correlations between habits and mood
     */
    analyzeHabitMoodCorrelations() {
        if (this.moodHistory.length < 7) return; // Need at least a week of data
        
        try {
            // Group mood entries by date
            const moodByDate = {};
            for (const entry of this.moodHistory) {
                moodByDate[entry.date] = entry.value;
            }
            
            // Calculate correlation for each habit
            for (const habit of this.habitData) {
                if (!habit.completionDates || habit.completionDates.length < 5) continue;
                
                // Get dates with mood data that overlap with habit data
                const dates = habit.completionDates.filter(date => moodByDate[date] !== undefined);
                if (dates.length < 5) continue;
                
                // Calculate correlation coefficient
                const habitValues = dates.map(date => habit.completionDates.includes(date) ? 1 : 0);
                const moodValues = dates.map(date => moodByDate[date]);
                
                const correlation = this.calculateCorrelation(habitValues, moodValues);
                this.correlations[habit.id] = correlation;
            }
            
            this.log(`Analyzed mood correlations for ${Object.keys(this.correlations).length} habits`);
        } catch (error) {
            this.log(`Error analyzing mood correlations: ${error.message}`, true);
        }
    }

    /**
     * Calculate correlation coefficient between two arrays
     * @param {Array<number>} x - First array
     * @param {Array<number>} y - Second array
     * @returns {number} Correlation coefficient
     */
    calculateCorrelation(x, y) {
        const n = x.length;
        if (n !== y.length || n === 0) return 0;
        
        // Calculate means
        const xMean = x.reduce((sum, val) => sum + val, 0) / n;
        const yMean = y.reduce((sum, val) => sum + val, 0) / n;
        
        // Calculate covariance and variances
        let covariance = 0;
        let xVariance = 0;
        let yVariance = 0;
        
        for (let i = 0; i < n; i++) {
            const xDiff = x[i] - xMean;
            const yDiff = y[i] - yMean;
            covariance += xDiff * yDiff;
            xVariance += xDiff * xDiff;
            yVariance += yDiff * yDiff;
        }
        
        // Calculate correlation coefficient
        if (xVariance === 0 || yVariance === 0) return 0;
        return covariance / Math.sqrt(xVariance * yVariance);
    }

    /**
     * Log a message
     * @param {string} message - Message to log
     * @param {boolean} isError - Whether this is an error message
     */
    log(message, isError = false) {
        if (!this.config.debugMode && !isError) return;
        
        const prefix = `[AI Advisor] ${isError ? 'ERROR: ' : ''}`;
        if (isError) {
            console.error(prefix + message);
        } else {
            console.log(prefix + message);
        }
    }
}

// Export the class
window.AIPlantAdvisor = AIPlantAdvisor;