/**
 * Advanced Gamification System
 * 
 * This system adds game-like elements to habit tracking, including:
 * - Experience points and leveling
 * - Achievements and badges
 * - Challenges and quests
 * - Rewards and unlockables
 * - Streaks and multipliers
 * - Social features and leaderboards
 */

class GamificationSystem {
    constructor(options = {}) {
        // Configuration
        this.config = {
            apiEndpoint: options.apiEndpoint || '/api/gamification',
            userDataEndpoint: options.userDataEndpoint || '/api/user/data',
            notificationContainer: options.notificationContainer || document.getElementById('notification-container'),
            badgeContainer: options.badgeContainer || document.getElementById('badge-container'),
            levelContainer: options.levelContainer || document.getElementById('level-container'),
            challengeContainer: options.challengeContainer || document.getElementById('challenge-container'),
            rewardContainer: options.rewardContainer || document.getElementById('reward-container'),
            enableNotifications: options.enableNotifications !== undefined ? options.enableNotifications : true,
            enableSound: options.enableSound !== undefined ? options.enableSound : true,
            enableConfetti: options.enableConfetti !== undefined ? options.enableConfetti : true,
            enableVibration: options.enableVibration !== undefined ? options.enableVibration : true,
            debugMode: options.debugMode || false
        };

        // State
        this.userData = null;
        this.achievements = [];
        this.challenges = [];
        this.rewards = [];
        this.streaks = {};
        this.multipliers = {};
        this.leaderboard = [];
        this.isInitialized = false;
        this.sounds = {};
        this.confetti = null;
        this.notificationQueue = [];
        this.processingNotifications = false;

        // Constants
        this.LEVEL_XP_FORMULA = level => Math.floor(100 * Math.pow(1.5, level - 1));
        this.MAX_LEVEL = 100;
        this.STREAK_BONUS_FORMULA = streak => Math.min(2, 1 + (streak * 0.05));
        this.BADGE_TIERS = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

        // Bind methods
        this.initialize = this.initialize.bind(this);
        this.fetchUserData = this.fetchUserData.bind(this);
        this.fetchAchievements = this.fetchAchievements.bind(this);
        this.fetchChallenges = this.fetchChallenges.bind(this);
        this.fetchRewards = this.fetchRewards.bind(this);
        this.awardXP = this.awardXP.bind(this);
        this.checkLevelUp = this.checkLevelUp.bind(this);
        this.checkAchievements = this.checkAchievements.bind(this);
        this.updateStreak = this.updateStreak.bind(this);
        this.completeChallenge = this.completeChallenge.bind(this);
        this.unlockReward = this.unlockReward.bind(this);
        this.showNotification = this.showNotification.bind(this);
        this.processNotificationQueue = this.processNotificationQueue.bind(this);
        this.playSound = this.playSound.bind(this);
        this.triggerConfetti = this.triggerConfetti.bind(this);
        this.updateUI = this.updateUI.bind(this);
    }

    /**
     * Initialize the gamification system
     * @returns {Promise} Initialization promise
     */
    async initialize() {
        if (this.isInitialized) return Promise.resolve();

        try {
            this.log("Initializing Gamification System...");

            // Load required libraries
            await this.loadDependencies();

            // Fetch initial data
            await Promise.all([
                this.fetchUserData(),
                this.fetchAchievements(),
                this.fetchChallenges(),
                this.fetchRewards()
            ]);

            // Initialize sounds
            if (this.config.enableSound) {
                this.initializeSounds();
            }

            // Update UI
            this.updateUI();

            this.isInitialized = true;
            this.log("Gamification System initialized successfully");
            return Promise.resolve();
        } catch (error) {
            this.log(`Initialization error: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Load required dependencies
     * @returns {Promise} Loading promise
     */
    async loadDependencies() {
        const promises = [];

        // Load confetti library if enabled
        if (this.config.enableConfetti && typeof confetti === 'undefined') {
            promises.push(new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
                script.onload = resolve;
                script.onerror = reject;
                document.head.appendChild(script);
            }));
        }

        return Promise.all(promises);
    }

    /**
     * Initialize sound effects
     */
    initializeSounds() {
        // Create audio elements
        const soundEffects = {
            xp: '/static/sounds/xp.mp3',
            levelUp: '/static/sounds/level_up.mp3',
            achievement: '/static/sounds/achievement.mp3',
            challenge: '/static/sounds/challenge.mp3',
            reward: '/static/sounds/reward.mp3',
            streak: '/static/sounds/streak.mp3'
        };

        Object.entries(soundEffects).forEach(([name, src]) => {
            const audio = new Audio(src);
            audio.preload = 'auto';
            audio.volume = 0.5;
            this.sounds[name] = audio;
        });
    }

    /**
     * Fetch user data from the API
     * @returns {Promise} User data promise
     */
    async fetchUserData() {
        try {
            const response = await fetch(this.config.userDataEndpoint);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.userData = data;
            
            // Initialize streaks and multipliers
            if (data.streaks) {
                this.streaks = data.streaks;
            }
            
            if (data.multipliers) {
                this.multipliers = data.multipliers;
            }
            
            this.log("User data fetched successfully");
            return data;
        } catch (error) {
            this.log(`Error fetching user data: ${error.message}`, true);
            
            // Use default data if fetch fails
            if (!this.userData) {
                this.userData = {
                    id: 'unknown',
                    level: 1,
                    xp: 0,
                    totalXp: 0,
                    streaks: {},
                    achievements: [],
                    completedChallenges: [],
                    unlockedRewards: []
                };
            }
            
            return this.userData;
        }
    }

    /**
     * Fetch achievements from the API
     * @returns {Promise} Achievements promise
     */
    async fetchAchievements() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/achievements`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.achievements = data;
            this.log(`Fetched ${data.length} achievements`);
            return data;
        } catch (error) {
            this.log(`Error fetching achievements: ${error.message}`, true);
            
            // Use default achievements if fetch fails
            if (!this.achievements.length) {
                this.achievements = this.getDefaultAchievements();
            }
            
            return this.achievements;
        }
    }

    /**
     * Get default achievements
     * @returns {Array} Default achievements
     */
    getDefaultAchievements() {
        return [
            {
                id: 'first_plant',
                name: 'Green Thumb',
                description: 'Add your first plant to the garden',
                icon: 'seedling',
                xpReward: 50,
                criteria: { type: 'plants_added', threshold: 1 }
            },
            {
                id: 'plant_collector',
                name: 'Plant Collector',
                description: 'Add 5 different plants to your garden',
                icon: 'leaf',
                xpReward: 100,
                criteria: { type: 'plants_added', threshold: 5 }
            },
            {
                id: 'watering_routine',
                name: 'Watering Routine',
                description: 'Water your plants 10 times',
                icon: 'tint',
                xpReward: 75,
                criteria: { type: 'watering_count', threshold: 10 }
            },
            {
                id: 'streak_week',
                name: 'Consistency is Key',
                description: 'Maintain a 7-day streak',
                icon: 'calendar-check',
                xpReward: 150,
                criteria: { type: 'max_streak', threshold: 7 }
            },
            {
                id: 'streak_month',
                name: 'Habit Master',
                description: 'Maintain a 30-day streak',
                icon: 'trophy',
                xpReward: 500,
                criteria: { type: 'max_streak', threshold: 30 }
            },
            {
                id: 'level_5',
                name: 'Growing Up',
                description: 'Reach level 5',
                icon: 'arrow-up',
                xpReward: 200,
                criteria: { type: 'level', threshold: 5 }
            },
            {
                id: 'level_10',
                name: 'Garden Expert',
                description: 'Reach level 10',
                icon: 'star',
                xpReward: 500,
                criteria: { type: 'level', threshold: 10 }
            },
            {
                id: 'full_bloom',
                name: 'Full Bloom',
                description: 'Have a plant reach its final growth stage',
                icon: 'spa',
                xpReward: 300,
                criteria: { type: 'plant_max_growth', threshold: 1 }
            },
            {
                id: 'early_bird',
                name: 'Early Bird',
                description: 'Log a habit before 8 AM',
                icon: 'sun',
                xpReward: 100,
                criteria: { type: 'habit_time', threshold: { before: 8 } }
            },
            {
                id: 'night_owl',
                name: 'Night Owl',
                description: 'Log a habit after 10 PM',
                icon: 'moon',
                xpReward: 100,
                criteria: { type: 'habit_time', threshold: { after: 22 } }
            }
        ];
    }

    /**
     * Fetch challenges from the API
     * @returns {Promise} Challenges promise
     */
    async fetchChallenges() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/challenges`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.challenges = data;
            this.log(`Fetched ${data.length} challenges`);
            return data;
        } catch (error) {
            this.log(`Error fetching challenges: ${error.message}`, true);
            
            // Use default challenges if fetch fails
            if (!this.challenges.length) {
                this.challenges = this.getDefaultChallenges();
            }
            
            return this.challenges;
        }
    }

    /**
     * Get default challenges
     * @returns {Array} Default challenges
     */
    getDefaultChallenges() {
        return [
            {
                id: 'weekly_watering',
                name: 'Weekly Watering',
                description: 'Water your plants 3 days in a row',
                icon: 'tint',
                xpReward: 150,
                waterCreditsReward: 10,
                duration: 7, // days
                criteria: { type: 'watering_streak', threshold: 3 }
            },
            {
                id: 'plant_diversity',
                name: 'Plant Diversity',
                description: 'Add 3 different types of plants to your garden',
                icon: 'pagelines',
                xpReward: 200,
                waterCreditsReward: 15,
                duration: 14, // days
                criteria: { type: 'plant_types', threshold: 3 }
            },
            {
                id: 'morning_routine',
                name: 'Morning Routine',
                description: 'Log a habit before 9 AM for 5 days',
                icon: 'coffee',
                xpReward: 250,
                waterCreditsReward: 20,
                duration: 7, // days
                criteria: { type: 'morning_habits', threshold: 5 }
            },
            {
                id: 'perfect_week',
                name: 'Perfect Week',
                description: 'Complete all your daily habits for 7 days straight',
                icon: 'calendar-check',
                xpReward: 500,
                waterCreditsReward: 50,
                duration: 7, // days
                criteria: { type: 'perfect_days', threshold: 7 }
            },
            {
                id: 'garden_master',
                name: 'Garden Master',
                description: 'Have 5 plants reach at least growth stage 3',
                icon: 'tree',
                xpReward: 400,
                waterCreditsReward: 30,
                duration: 30, // days
                criteria: { type: 'mature_plants', threshold: 5 }
            }
        ];
    }

    /**
     * Fetch rewards from the API
     * @returns {Promise} Rewards promise
     */
    async fetchRewards() {
        try {
            const response = await fetch(`${this.config.apiEndpoint}/rewards`);
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            const data = await response.json();
            this.rewards = data;
            this.log(`Fetched ${data.length} rewards`);
            return data;
        } catch (error) {
            this.log(`Error fetching rewards: ${error.message}`, true);
            
            // Use default rewards if fetch fails
            if (!this.rewards.length) {
                this.rewards = this.getDefaultRewards();
            }
            
            return this.rewards;
        }
    }

    /**
     * Get default rewards
     * @returns {Array} Default rewards
     */
    getDefaultRewards() {
        return [
            {
                id: 'rare_plant_1',
                name: 'Rare Plant: Crystal Rose',
                description: 'A beautiful, rare plant with crystalline petals',
                icon: 'gem',
                cost: 500, // XP cost
                type: 'plant',
                rarity: 'rare',
                unlockCriteria: { level: 5 }
            },
            {
                id: 'rare_plant_2',
                name: 'Rare Plant: Midnight Orchid',
                description: 'A mysterious orchid that glows in the dark',
                icon: 'moon',
                cost: 1000,
                type: 'plant',
                rarity: 'epic',
                unlockCriteria: { level: 10 }
            },
            {
                id: 'garden_theme_1',
                name: 'Garden Theme: Enchanted Forest',
                description: 'Transform your garden into a magical forest',
                icon: 'tree',
                cost: 300,
                type: 'theme',
                unlockCriteria: { achievements: 5 }
            },
            {
                id: 'garden_theme_2',
                name: 'Garden Theme: Zen Garden',
                description: 'A peaceful, minimalist garden theme',
                icon: 'yin-yang',
                cost: 300,
                type: 'theme',
                unlockCriteria: { achievements: 5 }
            },
            {
                id: 'pot_design_1',
                name: 'Pot Design: Crystal',
                description: 'Beautiful crystal-inspired pot designs',
                icon: 'cube',
                cost: 200,
                type: 'pot',
                unlockCriteria: { level: 3 }
            },
            {
                id: 'pot_design_2',
                name: 'Pot Design: Ancient Runes',
                description: 'Pots inscribed with mysterious ancient runes',
                icon: 'book',
                cost: 200,
                type: 'pot',
                unlockCriteria: { level: 3 }
            },
            {
                id: 'water_boost',
                name: 'Water Boost',
                description: 'Your plants need 20% less water for 7 days',
                icon: 'tint-slash',
                cost: 400,
                type: 'boost',
                duration: 7, // days
                effect: { waterConsumption: 0.8 },
                unlockCriteria: { level: 7 }
            },
            {
                id: 'growth_boost',
                name: 'Growth Boost',
                description: 'Your plants grow 50% faster for 3 days',
                icon: 'rocket',
                cost: 500,
                type: 'boost',
                duration: 3, // days
                effect: { growthRate: 1.5 },
                unlockCriteria: { level: 8 }
            },
            {
                id: 'profile_badge_1',
                name: 'Profile Badge: Master Gardener',
                description: 'Show off your gardening expertise',
                icon: 'award',
                cost: 1000,
                type: 'badge',
                rarity: 'legendary',
                unlockCriteria: { level: 15 }
            }
        ];
    }

    /**
     * Award XP to the user
     * @param {number} amount - Amount of XP to award
     * @param {string} source - Source of the XP (for tracking)
     * @param {boolean} applyMultiplier - Whether to apply streak multipliers
     * @returns {Promise} XP award promise
     */
    async awardXP(amount, source = 'action', applyMultiplier = true) {
        if (!this.userData) await this.fetchUserData();
        
        try {
            // Calculate actual XP amount with multipliers
            let actualAmount = amount;
            
            if (applyMultiplier) {
                const multiplier = this.multipliers[source] || 1;
                actualAmount = Math.floor(amount * multiplier);
            }
            
            // Update local user data
            const oldXP = this.userData.xp;
            const oldLevel = this.userData.level;
            
            this.userData.xp += actualAmount;
            this.userData.totalXp += actualAmount;
            
            // Check for level up
            const leveledUp = this.checkLevelUp();
            
            // Save to server
            const response = await fetch(`${this.config.apiEndpoint}/xp`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    amount: actualAmount,
                    source: source
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            // Show notification
            if (actualAmount > 0) {
                this.showNotification({
                    type: 'xp',
                    title: `+${actualAmount} XP`,
                    message: source === 'action' ? 'Keep up the good work!' : `From ${source}`,
                    icon: 'star',
                    color: '#4CAF50'
                });
                
                // Play sound
                this.playSound('xp');
            }
            
            // Update UI
            this.updateUI();
            
            // Check achievements
            this.checkAchievements();
            
            return {
                awarded: actualAmount,
                newTotal: this.userData.totalXp,
                leveledUp: leveledUp,
                oldLevel: oldLevel,
                newLevel: this.userData.level
            };
        } catch (error) {
            this.log(`Error awarding XP: ${error.message}`, true);
            
            // Still update local data even if server update fails
            this.userData.xp += amount;
            this.userData.totalXp += amount;
            this.checkLevelUp();
            this.updateUI();
            
            return {
                awarded: amount,
                newTotal: this.userData.totalXp,
                leveledUp: false,
                oldLevel: this.userData.level,
                newLevel: this.userData.level,
                error: error.message
            };
        }
    }

    /**
     * Check if user has leveled up and handle level up
     * @returns {boolean} Whether user leveled up
     */
    checkLevelUp() {
        if (!this.userData) return false;
        
        const oldLevel = this.userData.level;
        let leveledUp = false;
        
        // Calculate required XP for next level
        const requiredXP = this.LEVEL_XP_FORMULA(this.userData.level);
        
        // Check if user has enough XP to level up
        while (this.userData.xp >= requiredXP && this.userData.level < this.MAX_LEVEL) {
            // Level up
            this.userData.level++;
            this.userData.xp -= requiredXP;
            leveledUp = true;
            
            // Show level up notification
            this.showNotification({
                type: 'levelUp',
                title: `Level Up!`,
                message: `You've reached level ${this.userData.level}`,
                icon: 'level-up-alt',
                color: '#FF9800',
                duration: 5000,
                confetti: true
            });
            
            // Play level up sound
            this.playSound('levelUp');
            
            // Trigger confetti
            this.triggerConfetti();
            
            // Check for level-based achievements
            this.checkAchievements();
            
            // Check for level-based rewards
            this.checkLevelRewards(this.userData.level);
        }
        
        return leveledUp;
    }

    /**
     * Check for level-based rewards
     * @param {number} level - Current level
     */
    checkLevelRewards(level) {
        // Find rewards unlocked at this level
        const unlockedRewards = this.rewards.filter(reward => 
            reward.unlockCriteria && 
            reward.unlockCriteria.level === level &&
            !this.userData.unlockedRewards.includes(reward.id)
        );
        
        // Unlock rewards
        unlockedRewards.forEach(reward => {
            this.unlockReward(reward.id, true);
        });
    }

    /**
     * Check achievements and award any that have been completed
     * @returns {Array} Newly completed achievements
     */
    async checkAchievements() {
        if (!this.userData || !this.achievements.length) return [];
        
        const newlyCompleted = [];
        
        // Get achievements that aren't already completed
        const incompleteAchievements = this.achievements.filter(
            achievement => !this.userData.achievements.includes(achievement.id)
        );
        
        // Check each achievement
        incompleteAchievements.forEach(achievement => {
            if (this.checkAchievementCriteria(achievement)) {
                // Mark as completed
                this.userData.achievements.push(achievement.id);
                newlyCompleted.push(achievement);
                
                // Award XP
                if (achievement.xpReward) {
                    this.awardXP(achievement.xpReward, `Achievement: ${achievement.name}`, false);
                }
                
                // Show notification
                this.showNotification({
                    type: 'achievement',
                    title: `Achievement Unlocked!`,
                    message: achievement.name,
                    description: achievement.description,
                    icon: achievement.icon || 'trophy',
                    color: '#9C27B0',
                    duration: 6000,
                    confetti: true
                });
                
                // Play achievement sound
                this.playSound('achievement');
            }
        });
        
        // Save to server if any achievements were completed
        if (newlyCompleted.length > 0) {
            try {
                const response = await fetch(`${this.config.apiEndpoint}/achievements`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        achievements: newlyCompleted.map(a => a.id)
                    })
                });
                
                if (!response.ok) throw new Error(`HTTP error ${response.status}`);
                
                // Update UI
                this.updateUI();
            } catch (error) {
                this.log(`Error saving achievements: ${error.message}`, true);
            }
        }
        
        return newlyCompleted;
    }

    /**
     * Check if an achievement's criteria have been met
     * @param {Object} achievement - Achievement to check
     * @returns {boolean} Whether criteria are met
     */
    checkAchievementCriteria(achievement) {
        if (!achievement.criteria) return false;
        
        const { type, threshold } = achievement.criteria;
        
        switch (type) {
            case 'plants_added':
                return this.userData.plantsAdded >= threshold;
                
            case 'watering_count':
                return this.userData.wateringCount >= threshold;
                
            case 'max_streak':
                return Object.values(this.streaks).some(streak => streak >= threshold);
                
            case 'level':
                return this.userData.level >= threshold;
                
            case 'plant_max_growth':
                return (this.userData.plantsAtMaxGrowth || 0) >= threshold;
                
            case 'habit_time':
                if (threshold.before) {
                    return this.userData.earliestHabitHour <= threshold.before;
                } else if (threshold.after) {
                    return this.userData.latestHabitHour >= threshold.after;
                }
                return false;
                
            default:
                return false;
        }
    }

    /**
     * Update streak for a specific activity
     * @param {string} activity - Activity type
     * @param {boolean} completed - Whether activity was completed
     * @param {Date} date - Date of activity
     * @returns {Object} Updated streak info
     */
    async updateStreak(activity, completed, date = new Date()) {
        if (!this.userData) await this.fetchUserData();
        
        try {
            // Get current streak
            const currentStreak = this.streaks[activity] || 0;
            let newStreak = currentStreak;
            let streakBroken = false;
            
            if (completed) {
                // Increment streak
                newStreak = currentStreak + 1;
                
                // Update multiplier
                this.multipliers[activity] = this.STREAK_BONUS_FORMULA(newStreak);
                
                // Show streak notification for milestones
                if (newStreak > 0 && newStreak % 5 === 0) {
                    this.showNotification({
                        type: 'streak',
                        title: `${newStreak} Day Streak!`,
                        message: `You've maintained your ${activity} streak for ${newStreak} days`,
                        icon: 'fire',
                        color: '#FF5722',
                        duration: 5000
                    });
                    
                    // Play streak sound
                    this.playSound('streak');
                    
                    // For big milestones, trigger confetti
                    if (newStreak % 10 === 0) {
                        this.triggerConfetti();
                    }
                }
            } else {
                // Break streak if it was active
                if (currentStreak > 0) {
                    streakBroken = true;
                    newStreak = 0;
                    
                    // Reset multiplier
                    this.multipliers[activity] = 1;
                    
                    // Show streak broken notification
                    this.showNotification({
                        type: 'streakBroken',
                        title: `Streak Broken`,
                        message: `Your ${activity} streak of ${currentStreak} days has been reset`,
                        icon: 'fire-alt',
                        color: '#607D8B'
                    });
                }
            }
            
            // Update local data
            this.streaks[activity] = newStreak;
            
            // Save to server
            const response = await fetch(`${this.config.apiEndpoint}/streaks`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    activity: activity,
                    streak: newStreak,
                    date: date.toISOString().split('T')[0]
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            // Update UI
            this.updateUI();
            
            // Check achievements
            this.checkAchievements();
            
            return {
                activity,
                previousStreak: currentStreak,
                newStreak,
                streakBroken,
                multiplier: this.multipliers[activity] || 1
            };
        } catch (error) {
            this.log(`Error updating streak: ${error.message}`, true);
            
            // Still update local data even if server update fails
            this.streaks[activity] = completed ? (currentStreak + 1) : 0;
            
            return {
                activity,
                previousStreak: currentStreak,
                newStreak: this.streaks[activity],
                streakBroken: completed ? false : (currentStreak > 0),
                multiplier: this.multipliers[activity] || 1,
                error: error.message
            };
        }
    }

    /**
     * Complete a challenge
     * @param {string} challengeId - Challenge ID
     * @returns {Promise} Challenge completion promise
     */
    async completeChallenge(challengeId) {
        if (!this.userData) await this.fetchUserData();
        
        try {
            // Find challenge
            const challenge = this.challenges.find(c => c.id === challengeId);
            if (!challenge) throw new Error(`Challenge not found: ${challengeId}`);
            
            // Check if already completed
            if (this.userData.completedChallenges.includes(challengeId)) {
                return { success: false, message: 'Challenge already completed' };
            }
            
            // Mark as completed
            this.userData.completedChallenges.push(challengeId);
            
            // Award XP
            if (challenge.xpReward) {
                await this.awardXP(challenge.xpReward, `Challenge: ${challenge.name}`, false);
            }
            
            // Award water credits
            if (challenge.waterCreditsReward) {
                // In a real implementation, you would update water credits here
                this.log(`Awarded ${challenge.waterCreditsReward} water credits for challenge completion`);
            }
            
            // Show notification
            this.showNotification({
                type: 'challenge',
                title: `Challenge Completed!`,
                message: challenge.name,
                description: challenge.description,
                icon: challenge.icon || 'flag-checkered',
                color: '#2196F3',
                duration: 6000,
                confetti: true
            });
            
            // Play challenge sound
            this.playSound('challenge');
            
            // Save to server
            const response = await fetch(`${this.config.apiEndpoint}/challenges`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    challengeId: challengeId
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            // Update UI
            this.updateUI();
            
            return { 
                success: true, 
                challenge,
                xpAwarded: challenge.xpReward || 0,
                waterCreditsAwarded: challenge.waterCreditsReward || 0
            };
        } catch (error) {
            this.log(`Error completing challenge: ${error.message}`, true);
            return { success: false, error: error.message };
        }
    }

    /**
     * Unlock a reward
     * @param {string} rewardId - Reward ID
     * @param {boolean} fromLevelUp - Whether this is from a level up (free)
     * @returns {Promise} Reward unlock promise
     */
    async unlockReward(rewardId, fromLevelUp = false) {
        if (!this.userData) await this.fetchUserData();
        
        try {
            // Find reward
            const reward = this.rewards.find(r => r.id === rewardId);
            if (!reward) throw new Error(`Reward not found: ${rewardId}`);
            
            // Check if already unlocked
            if (this.userData.unlockedRewards.includes(rewardId)) {
                return { success: false, message: 'Reward already unlocked' };
            }
            
            // Check if user has enough XP (if not from level up)
            if (!fromLevelUp && reward.cost > this.userData.xp) {
                return { success: false, message: 'Not enough XP' };
            }
            
            // Check if user meets unlock criteria
            if (reward.unlockCriteria) {
                if (reward.unlockCriteria.level && this.userData.level < reward.unlockCriteria.level) {
                    return { success: false, message: `Requires level ${reward.unlockCriteria.level}` };
                }
                
                if (reward.unlockCriteria.achievements && 
                    this.userData.achievements.length < reward.unlockCriteria.achievements) {
                    return { 
                        success: false, 
                        message: `Requires ${reward.unlockCriteria.achievements} achievements` 
                    };
                }
            }
            
            // Deduct XP if not from level up
            if (!fromLevelUp && reward.cost) {
                this.userData.xp -= reward.cost;
            }
            
            // Mark as unlocked
            this.userData.unlockedRewards.push(rewardId);
            
            // Show notification
            this.showNotification({
                type: 'reward',
                title: `Reward Unlocked!`,
                message: reward.name,
                description: reward.description,
                icon: reward.icon || 'gift',
                color: '#E91E63',
                duration: 6000,
                confetti: true
            });
            
            // Play reward sound
            this.playSound('reward');
            
            // Trigger confetti
            this.triggerConfetti();
            
            // Save to server
            const response = await fetch(`${this.config.apiEndpoint}/rewards`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    rewardId: rewardId,
                    fromLevelUp: fromLevelUp
                })
            });
            
            if (!response.ok) throw new Error(`HTTP error ${response.status}`);
            
            // Update UI
            this.updateUI();
            
            return { 
                success: true, 
                reward,
                xpCost: fromLevelUp ? 0 : (reward.cost || 0)
            };
        } catch (error) {
            this.log(`Error unlocking reward: ${error.message}`, true);
            return { success: false, error: error.message };
        }
    }

    /**
     * Show a notification
     * @param {Object} options - Notification options
     */
    showNotification(options) {
        if (!this.config.enableNotifications) return;
        
        // Add to queue
        this.notificationQueue.push(options);
        
        // Start processing queue if not already processing
        if (!this.processingNotifications) {
            this.processNotificationQueue();
        }
    }

    /**
     * Process notification queue
     */
    async processNotificationQueue() {
        if (this.processingNotifications || this.notificationQueue.length === 0) return;
        
        this.processingNotifications = true;
        
        // Get next notification
        const notification = this.notificationQueue.shift();
        
        // Create notification element
        const element = document.createElement('div');
        element.className = `gamification-notification notification-${notification.type}`;
        element.style.backgroundColor = notification.color || '#333';
        
        // Create HTML content
        element.innerHTML = `
            <div class="notification-icon">
                <i class="fas fa-${notification.icon || 'bell'}"></i>
            </div>
            <div class="notification-content">
                <h4>${notification.title}</h4>
                <p>${notification.message}</p>
                ${notification.description ? `<p class="notification-description">${notification.description}</p>` : ''}
            </div>
            <button class="notification-close">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add to container
        if (this.config.notificationContainer) {
            this.config.notificationContainer.appendChild(element);
            
            // Add close button handler
            const closeButton = element.querySelector('.notification-close');
            closeButton.addEventListener('click', () => {
                this.removeNotification(element);
            });
            
            // Trigger vibration if enabled
            if (this.config.enableVibration && navigator.vibrate) {
                navigator.vibrate(notification.type === 'levelUp' ? 100 : 50);
            }
            
            // Trigger confetti if enabled
            if (notification.confetti && this.config.enableConfetti) {
                this.triggerConfetti();
            }
            
            // Auto-remove after duration
            const duration = notification.duration || 4000;
            setTimeout(() => {
                this.removeNotification(element);
            }, duration);
            
            // Add animation classes
            setTimeout(() => {
                element.classList.add('notification-visible');
            }, 10);
        }
        
        // Wait before processing next notification
        await new Promise(resolve => setTimeout(resolve, 500));
        
        this.processingNotifications = false;
        this.processNotificationQueue();
    }

    /**
     * Remove a notification element
     * @param {HTMLElement} element - Notification element
     */
    removeNotification(element) {
        if (!element) return;
        
        // Add exit animation
        element.classList.add('notification-exit');
        
        // Remove after animation
        setTimeout(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        }, 300);
    }

    /**
     * Play a sound effect
     * @param {string} name - Sound name
     */
    playSound(name) {
        if (!this.config.enableSound || !this.sounds[name]) return;
        
        try {
            // Clone the audio to allow overlapping sounds
            const sound = this.sounds[name].cloneNode();
            sound.volume = 0.5;
            sound.play();
        } catch (error) {
            this.log(`Error playing sound: ${error.message}`, true);
        }
    }

    /**
     * Trigger confetti effect
     */
    triggerConfetti() {
        if (!this.config.enableConfetti || typeof confetti === 'undefined') return;
        
        try {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#4CAF50', '#8BC34A', '#CDDC39', '#FFEB3B', '#FFC107']
            });
        } catch (error) {
            this.log(`Error triggering confetti: ${error.message}`, true);
        }
    }

    /**
     * Update UI elements
     */
    updateUI() {
        if (!this.userData) return;
        
        // Update level display
        if (this.config.levelContainer) {
            const requiredXP = this.LEVEL_XP_FORMULA(this.userData.level);
            const progress = (this.userData.xp / requiredXP) * 100;
            
            this.config.levelContainer.innerHTML = `
                <div class="level-display">
                    <div class="level-number">${this.userData.level}</div>
                    <div class="level-progress-container">
                        <div class="level-progress-bar" style="width: ${progress}%"></div>
                        <div class="level-progress-text">${this.userData.xp}/${requiredXP} XP</div>
                    </div>
                </div>
            `;
        }
        
        // Update badge display
        if (this.config.badgeContainer && this.userData.achievements) {
            // Get badges (achievements)
            const badges = this.userData.achievements.map(id => {
                const achievement = this.achievements.find(a => a.id === id);
                return achievement || { id, name: 'Unknown Achievement', icon: 'question' };
            });
            
            // Sort by newest first (assuming IDs are added in order)
            badges.reverse();
            
            // Limit to most recent badges
            const recentBadges = badges.slice(0, 5);
            
            // Create badge elements
            this.config.badgeContainer.innerHTML = '';
            
            recentBadges.forEach(badge => {
                const badgeElement = document.createElement('div');
                badgeElement.className = 'badge-item';
                badgeElement.innerHTML = `
                    <div class="badge-icon">
                        <i class="fas fa-${badge.icon || 'award'}"></i>
                    </div>
                    <div class="badge-name">${badge.name}</div>
                `;
                
                // Add tooltip
                badgeElement.title = badge.description || badge.name;
                
                this.config.badgeContainer.appendChild(badgeElement);
            });
            
            // Add badge count if there are more
            if (badges.length > 5) {
                const countElement = document.createElement('div');
                countElement.className = 'badge-count';
                countElement.innerHTML = `+${badges.length - 5} more`;
                this.config.badgeContainer.appendChild(countElement);
            }
        }
        
        // Update challenge display
        if (this.config.challengeContainer) {
            // Get active challenges
            const activeChallenges = this.challenges.filter(challenge => 
                !this.userData.completedChallenges.includes(challenge.id)
            );
            
            // Sort by XP reward
            activeChallenges.sort((a, b) => (b.xpReward || 0) - (a.xpReward || 0));
            
            // Limit to top challenges
            const topChallenges = activeChallenges.slice(0, 3);
            
            // Create challenge elements
            this.config.challengeContainer.innerHTML = '';
            
            topChallenges.forEach(challenge => {
                const challengeElement = document.createElement('div');
                challengeElement.className = 'challenge-item';
                challengeElement.innerHTML = `
                    <div class="challenge-icon">
                        <i class="fas fa-${challenge.icon || 'flag'}"></i>
                    </div>
                    <div class="challenge-info">
                        <div class="challenge-name">${challenge.name}</div>
                        <div class="challenge-description">${challenge.description}</div>
                        <div class="challenge-rewards">
                            ${challenge.xpReward ? `<span class="xp-reward">${challenge.xpReward} XP</span>` : ''}
                            ${challenge.waterCreditsReward ? `<span class="water-reward">${challenge.waterCreditsReward} <i class="fas fa-tint"></i></span>` : ''}
                        </div>
                    </div>
                `;
                
                this.config.challengeContainer.appendChild(challengeElement);
            });
            
            // Add message if no challenges
            if (topChallenges.length === 0) {
                this.config.challengeContainer.innerHTML = `
                    <div class="no-challenges">
                        <p>No active challenges. Check back later!</p>
                    </div>
                `;
            }
        }
        
        // Update reward display
        if (this.config.rewardContainer) {
            // Get available rewards
            const availableRewards = this.rewards.filter(reward => 
                !this.userData.unlockedRewards.includes(reward.id) &&
                (!reward.unlockCriteria || 
                    ((!reward.unlockCriteria.level || this.userData.level >= reward.unlockCriteria.level) &&
                     (!reward.unlockCriteria.achievements || this.userData.achievements.length >= reward.unlockCriteria.achievements)))
            );
            
            // Sort by cost
            availableRewards.sort((a, b) => (a.cost || 0) - (b.cost || 0));
            
            // Limit to affordable rewards
            const affordableRewards = availableRewards.filter(reward => 
                !reward.cost || reward.cost <= this.userData.xp
            ).slice(0, 3);
            
            // Create reward elements
            this.config.rewardContainer.innerHTML = '';
            
            affordableRewards.forEach(reward => {
                const rewardElement = document.createElement('div');
                rewardElement.className = 'reward-item';
                rewardElement.dataset.rewardId = reward.id;
                
                rewardElement.innerHTML = `
                    <div class="reward-icon">
                        <i class="fas fa-${reward.icon || 'gift'}"></i>
                    </div>
                    <div class="reward-info">
                        <div class="reward-name">${reward.name}</div>
                        <div class="reward-description">${reward.description}</div>
                        <div class="reward-cost">${reward.cost || 0} XP</div>
                    </div>
                    <button class="reward-unlock-btn">Unlock</button>
                `;
                
                // Add click handler
                const unlockButton = rewardElement.querySelector('.reward-unlock-btn');
                unlockButton.addEventListener('click', () => {
                    this.unlockReward(reward.id);
                });
                
                this.config.rewardContainer.appendChild(rewardElement);
            });
            
            // Add message if no rewards
            if (affordableRewards.length === 0) {
                this.config.rewardContainer.innerHTML = `
                    <div class="no-rewards">
                        <p>No rewards available. Keep earning XP!</p>
                    </div>
                `;
            }
        }
    }

    /**
     * Log a message
     * @param {string} message - Message to log
     * @param {boolean} isError - Whether this is an error message
     */
    log(message, isError = false) {
        if (!this.config.debugMode && !isError) return;
        
        const prefix = `[Gamification] ${isError ? 'ERROR: ' : ''}`;
        if (isError) {
            console.error(prefix + message);
        } else {
            console.log(prefix + message);
        }
    }
}

// Add CSS styles
const gamificationStyles = document.createElement('style');
gamificationStyles.textContent = `
    /* Notification styles */
    .gamification-notification {
        position: relative;
        display: flex;
        align-items: center;
        width: 300px;
        margin-bottom: 10px;
        padding: 15px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        color: white;
        transform: translateX(120%);
        transition: transform 0.3s ease-out;
        overflow: hidden;
        z-index: 9999;
    }
    
    .gamification-notification::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        width: 5px;
        height: 100%;
        background-color: rgba(255, 255, 255, 0.3);
    }
    
    .gamification-notification.notification-visible {
        transform: translateX(0);
    }
    
    .gamification-notification.notification-exit {
        transform: translateX(120%);
    }
    
    .notification-icon {
        flex-shrink: 0;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background-color: rgba(255, 255, 255, 0.2);
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 15px;
        font-size: 18px;
    }
    
    .notification-content {
        flex-grow: 1;
    }
    
    .notification-content h4 {
        margin: 0 0 5px;
        font-size: 16px;
        font-weight: 600;
    }
    
    .notification-content p {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
    }
    
    .notification-description {
        font-size: 12px !important;
        opacity: 0.8 !important;
        margin-top: 5px !important;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: white;
        opacity: 0.7;
        cursor: pointer;
        padding: 5px;
        margin-left: 10px;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
    
    /* Level display styles */
    .level-display {
        display: flex;
        align-items: center;
        background-color: rgba(10, 31, 10, 0.8);
        border-radius: 20px;
        padding: 5px 15px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    }
    
    .level-number {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #4CAF50, #2E7D32);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        font-weight: bold;
        margin-right: 15px;
        box-shadow: 0 2px 5px rgba(46, 125, 50, 0.3);
    }
    
    .level-progress-container {
        flex-grow: 1;
        height: 10px;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 5px;
        position: relative;
        overflow: hidden;
    }
    
    .level-progress-bar {
        height: 100%;
        background: linear-gradient(to right, #4CAF50, #8BC34A);
        border-radius: 5px;
        transition: width 0.5s ease;
    }
    
    .level-progress-text {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 10px;
        color: white;
        text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
        white-space: nowrap;
    }
    
    /* Badge styles */
    .badge-item {
        display: inline-flex;
        flex-direction: column;
        align-items: center;
        margin: 0 10px;
        cursor: pointer;
        transition: transform 0.2s;
    }
    
    .badge-item:hover {
        transform: translateY(-5px);
    }
    
    .badge-icon {
        width: 50px;
        height: 50px;
        border-radius: 50%;
        background: linear-gradient(135deg, #9C27B0, #673AB7);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 20px;
        margin-bottom: 8px;
        box-shadow: 0 3px 10px rgba(156, 39, 176, 0.3);
    }
    
    .badge-name {
        font-size: 12px;
        text-align: center;
        max-width: 80px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    
    .badge-count {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 5px 10px;
        font-size: 12px;
        margin-left: 10px;
        cursor: pointer;
    }
    
    /* Challenge styles */
    .challenge-item {
        display: flex;
        align-items: center;
        background-color: rgba(10, 31, 10, 0.8);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }
    
    .challenge-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
    
    .challenge-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #2196F3, #1976D2);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        margin-right: 15px;
        flex-shrink: 0;
        box-shadow: 0 3px 8px rgba(33, 150, 243, 0.3);
    }
    
    .challenge-info {
        flex-grow: 1;
    }
    
    .challenge-name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .challenge-description {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 8px;
    }
    
    .challenge-rewards {
        display: flex;
        align-items: center;
    }
    
    .xp-reward, .water-reward {
        display: inline-flex;
        align-items: center;
        background-color: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
        padding: 3px 8px;
        font-size: 12px;
        margin-right: 8px;
    }
    
    .xp-reward {
        color: #FFEB3B;
    }
    
    .water-reward {
        color: #29B6F6;
    }
    
    .water-reward i {
        margin-left: 5px;
    }
    
    .no-challenges, .no-rewards {
        text-align: center;
        padding: 20px;
        background-color: rgba(10, 31, 10, 0.8);
        border-radius: 8px;
        color: rgba(255, 255, 255, 0.7);
    }
    
    /* Reward styles */
    .reward-item {
        display: flex;
        align-items: center;
        background-color: rgba(10, 31, 10, 0.8);
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        transition: transform 0.2s;
    }
    
    .reward-item:hover {
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.15);
    }
    
    .reward-icon {
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #E91E63, #C2185B);
        color: white;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 18px;
        margin-right: 15px;
        flex-shrink: 0;
        box-shadow: 0 3px 8px rgba(233, 30, 99, 0.3);
    }
    
    .reward-info {
        flex-grow: 1;
    }
    
    .reward-name {
        font-size: 16px;
        font-weight: 600;
        margin-bottom: 5px;
    }
    
    .reward-description {
        font-size: 14px;
        opacity: 0.8;
        margin-bottom: 8px;
    }
    
    .reward-cost {
        font-size: 14px;
        color: #FFEB3B;
        font-weight: 600;
    }
    
    .reward-unlock-btn {
        background: linear-gradient(135deg, #E91E63, #C2185B);
        color: white;
        border: none;
        border-radius: 20px;
        padding: 8px 15px;
        font-size: 14px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s;
        box-shadow: 0 3px 8px rgba(233, 30, 99, 0.3);
        margin-left: 15px;
    }
    
    .reward-unlock-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(233, 30, 99, 0.4);
    }
    
    .reward-unlock-btn:active {
        transform: translateY(1px);
    }
`;

document.head.appendChild(gamificationStyles);

// Export the class
window.GamificationSystem = GamificationSystem;