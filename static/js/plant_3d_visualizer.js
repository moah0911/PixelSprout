/**
 * 3D Plant Visualization System
 * 
 * This advanced system creates realistic 3D plant visualizations with
 * growth animations, environmental effects, and interactive elements.
 * Uses Three.js for 3D rendering.
 */

class Plant3DVisualizer {
    constructor(options = {}) {
        // Configuration
        this.config = {
            container: options.container || document.getElementById('plant-3d-container'),
            plantData: options.plantData || null,
            width: options.width || window.innerWidth,
            height: options.height || 400,
            backgroundColor: options.backgroundColor || 0x0a1f0a,
            enableShadows: options.enableShadows !== undefined ? options.enableShadows : true,
            enableBloom: options.enableBloom !== undefined ? options.enableBloom : true,
            enableAmbientOcclusion: options.enableAmbientOcclusion !== undefined ? options.enableAmbientOcclusion : true,
            enableInteraction: options.enableInteraction !== undefined ? options.enableInteraction : true,
            enableGrowthAnimation: options.enableGrowthAnimation !== undefined ? options.enableGrowthAnimation : true,
            growthSpeed: options.growthSpeed || 1.0,
            autoRotate: options.autoRotate !== undefined ? options.autoRotate : true,
            debugMode: options.debugMode || false
        };

        // Three.js components
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.clock = null;
        this.composer = null;
        this.bloomPass = null;
        this.aoPass = null;

        // Plant models and materials
        this.plantModels = {};
        this.plantMaterials = {};
        this.plantLights = {};
        this.plantAnimations = {};
        this.currentPlant = null;
        this.growthProgress = 0;
        this.targetGrowthProgress = 0;

        // Interaction state
        this.isRotating = this.config.autoRotate;
        this.isDragging = false;
        this.isGrowing = false;
        this.mousePosition = { x: 0, y: 0 };
        this.raycaster = null;
        this.intersectedObject = null;

        // Animation mixers
        this.mixers = [];
        this.actions = {};

        // Bind methods
        this.init = this.init.bind(this);
        this.createScene = this.createScene.bind(this);
        this.createLighting = this.createLighting.bind(this);
        this.createPostProcessing = this.createPostProcessing.bind(this);
        this.loadPlantModel = this.loadPlantModel.bind(this);
        this.createPlantMaterials = this.createPlantMaterials.bind(this);
        this.updatePlantVisualization = this.updatePlantVisualization.bind(this);
        this.animate = this.animate.bind(this);
        this.handleResize = this.handleResize.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseDown = this.handleMouseDown.bind(this);
        this.handleMouseUp = this.handleMouseUp.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);
        this.handleTouchEnd = this.handleTouchEnd.bind(this);
        this.handleWheel = this.handleWheel.bind(this);
        this.cleanup = this.cleanup.bind(this);
    }

    /**
     * Initialize the 3D visualization system
     * @returns {Promise} Initialization promise
     */
    async init() {
        try {
            this.log("Initializing 3D Plant Visualizer...");

            // Check if Three.js is available
            if (typeof THREE === 'undefined') {
                await this.loadThreeJS();
            }

            // Create Three.js scene
            this.createScene();

            // Create lighting
            this.createLighting();

            // Create post-processing effects
            if (this.config.enableBloom || this.config.enableAmbientOcclusion) {
                this.createPostProcessing();
            }

            // Create materials
            this.createPlantMaterials();

            // Load initial plant model if data is provided
            if (this.config.plantData) {
                await this.loadPlantModel(this.config.plantData);
                this.updatePlantVisualization(this.config.plantData);
            }

            // Set up event listeners
            window.addEventListener('resize', this.handleResize);
            
            if (this.config.enableInteraction && this.config.container) {
                this.config.container.addEventListener('mousemove', this.handleMouseMove);
                this.config.container.addEventListener('mousedown', this.handleMouseDown);
                this.config.container.addEventListener('mouseup', this.handleMouseUp);
                this.config.container.addEventListener('touchstart', this.handleTouchStart);
                this.config.container.addEventListener('touchmove', this.handleTouchMove);
                this.config.container.addEventListener('touchend', this.handleTouchEnd);
                this.config.container.addEventListener('wheel', this.handleWheel);
            }

            // Start animation loop
            this.clock = new THREE.Clock();
            this.animate();

            this.log("3D Plant Visualizer initialized successfully");
            return Promise.resolve();
        } catch (error) {
            this.log(`Initialization error: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Load Three.js library dynamically
     * @returns {Promise} Loading promise
     */
    loadThreeJS() {
        return new Promise((resolve, reject) => {
            // Load Three.js core
            const threeScript = document.createElement('script');
            threeScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/build/three.min.js';
            threeScript.onload = () => {
                // Load OrbitControls
                const orbitControlsScript = document.createElement('script');
                orbitControlsScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/controls/OrbitControls.js';
                orbitControlsScript.onload = () => {
                    // Load GLTFLoader
                    const gltfLoaderScript = document.createElement('script');
                    gltfLoaderScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/loaders/GLTFLoader.js';
                    gltfLoaderScript.onload = () => {
                        // Load post-processing
                        const effectComposerScript = document.createElement('script');
                        effectComposerScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/postprocessing/EffectComposer.js';
                        effectComposerScript.onload = () => {
                            const renderPassScript = document.createElement('script');
                            renderPassScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/postprocessing/RenderPass.js';
                            renderPassScript.onload = () => {
                                const bloomPassScript = document.createElement('script');
                                bloomPassScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/postprocessing/UnrealBloomPass.js';
                                bloomPassScript.onload = () => {
                                    const ssaoPassScript = document.createElement('script');
                                    ssaoPassScript.src = 'https://cdn.jsdelivr.net/npm/three@0.132.2/examples/js/postprocessing/SSAOPass.js';
                                    ssaoPassScript.onload = () => {
                                        resolve();
                                    };
                                    document.head.appendChild(ssaoPassScript);
                                };
                                document.head.appendChild(bloomPassScript);
                            };
                            document.head.appendChild(renderPassScript);
                        };
                        document.head.appendChild(effectComposerScript);
                    };
                    document.head.appendChild(gltfLoaderScript);
                };
                document.head.appendChild(orbitControlsScript);
            };
            threeScript.onerror = () => {
                reject(new Error("Failed to load Three.js"));
            };
            document.head.appendChild(threeScript);
        });
    }

    /**
     * Create Three.js scene, camera, and renderer
     */
    createScene() {
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(this.config.backgroundColor);
        this.scene.fog = new THREE.FogExp2(this.config.backgroundColor, 0.02);

        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            45, // Field of view
            this.config.width / this.config.height, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);

        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(this.config.width, this.config.height);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        
        // Enable shadows
        if (this.config.enableShadows) {
            this.renderer.shadowMap.enabled = true;
            this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        }
        
        // Add renderer to container
        if (this.config.container) {
            // Clear container first
            while (this.config.container.firstChild) {
                this.config.container.removeChild(this.config.container.firstChild);
            }
            this.config.container.appendChild(this.renderer.domElement);
        }

        // Create orbit controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.rotateSpeed = 0.5;
        this.controls.enableZoom = true;
        this.controls.minDistance = 3;
        this.controls.maxDistance = 20;
        this.controls.maxPolarAngle = Math.PI / 2;
        this.controls.autoRotate = this.config.autoRotate;
        this.controls.autoRotateSpeed = 1.0;
        
        // Create raycaster for interaction
        this.raycaster = new THREE.Raycaster();

        // Create ground plane
        const groundGeometry = new THREE.CircleGeometry(10, 32);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x0a3f0a,
            roughness: 0.8,
            metalness: 0.2,
            side: THREE.DoubleSide
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -0.5;
        ground.receiveShadow = this.config.enableShadows;
        this.scene.add(ground);
    }

    /**
     * Create lighting for the scene
     */
    createLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        this.scene.add(ambientLight);

        // Directional light (sun)
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(5, 10, 7);
        directionalLight.castShadow = this.config.enableShadows;
        
        // Configure shadow properties
        if (this.config.enableShadows) {
            directionalLight.shadow.mapSize.width = 2048;
            directionalLight.shadow.mapSize.height = 2048;
            directionalLight.shadow.camera.near = 0.5;
            directionalLight.shadow.camera.far = 50;
            directionalLight.shadow.camera.left = -10;
            directionalLight.shadow.camera.right = 10;
            directionalLight.shadow.camera.top = 10;
            directionalLight.shadow.camera.bottom = -10;
            directionalLight.shadow.bias = -0.0005;
        }
        
        this.scene.add(directionalLight);

        // Hemisphere light (sky and ground)
        const hemisphereLight = new THREE.HemisphereLight(0xb1e1ff, 0x4d8c4a, 0.6);
        this.scene.add(hemisphereLight);
    }

    /**
     * Create post-processing effects
     */
    createPostProcessing() {
        // Create composer
        this.composer = new THREE.EffectComposer(this.renderer);
        
        // Add render pass
        const renderPass = new THREE.RenderPass(this.scene, this.camera);
        this.composer.addPass(renderPass);
        
        // Add bloom pass
        if (this.config.enableBloom) {
            this.bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(this.config.width, this.config.height),
                0.5, // strength
                0.4, // radius
                0.85 // threshold
            );
            this.composer.addPass(this.bloomPass);
        }
        
        // Add ambient occlusion pass
        if (this.config.enableAmbientOcclusion) {
            this.aoPass = new THREE.SSAOPass(
                this.scene,
                this.camera,
                this.config.width,
                this.config.height
            );
            this.aoPass.kernelRadius = 16;
            this.aoPass.minDistance = 0.005;
            this.aoPass.maxDistance = 0.1;
            this.composer.addPass(this.aoPass);
        }
    }

    /**
     * Create materials for plant visualization
     */
    createPlantMaterials() {
        // Stem material
        this.plantMaterials.stem = new THREE.MeshStandardMaterial({
            color: 0x2e7d32,
            roughness: 0.7,
            metalness: 0.1,
            flatShading: false
        });
        
        // Leaf material
        this.plantMaterials.leaf = new THREE.MeshStandardMaterial({
            color: 0x4caf50,
            roughness: 0.6,
            metalness: 0.1,
            flatShading: false,
            side: THREE.DoubleSide
        });
        
        // Flower material
        this.plantMaterials.flower = new THREE.MeshStandardMaterial({
            color: 0xffeb3b,
            roughness: 0.5,
            metalness: 0.2,
            flatShading: false,
            emissive: 0xffeb3b,
            emissiveIntensity: 0.2
        });
        
        // Fruit material
        this.plantMaterials.fruit = new THREE.MeshStandardMaterial({
            color: 0xff5722,
            roughness: 0.4,
            metalness: 0.3,
            flatShading: false
        });
        
        // Soil material
        this.plantMaterials.soil = new THREE.MeshStandardMaterial({
            color: 0x3e2723,
            roughness: 0.9,
            metalness: 0.1,
            flatShading: true
        });
        
        // Water material
        this.plantMaterials.water = new THREE.MeshStandardMaterial({
            color: 0x29b6f6,
            roughness: 0.2,
            metalness: 0.8,
            transparent: true,
            opacity: 0.8
        });
    }

    /**
     * Load a plant model
     * @param {Object} plantData - Plant data object
     * @returns {Promise} Loading promise
     */
    async loadPlantModel(plantData) {
        if (!plantData || !plantData.id) {
            return Promise.reject(new Error("Invalid plant data"));
        }
        
        // Check if model is already loaded
        if (this.plantModels[plantData.id]) {
            this.currentPlant = plantData.id;
            return Promise.resolve(this.plantModels[plantData.id]);
        }
        
        try {
            this.log(`Loading plant model for ${plantData.name || plantData.id}...`);
            
            // In a real implementation, you would load a GLTF model
            // For this demo, we'll create a procedural plant model
            
            // Create plant group
            const plantGroup = new THREE.Group();
            plantGroup.name = `plant-${plantData.id}`;
            
            // Create pot
            const potGeometry = new THREE.CylinderGeometry(1, 0.8, 1, 16);
            const potMaterial = new THREE.MeshStandardMaterial({
                color: 0x795548,
                roughness: 0.8,
                metalness: 0.1
            });
            const pot = new THREE.Mesh(potGeometry, potMaterial);
            pot.position.y = -0.5;
            pot.castShadow = this.config.enableShadows;
            pot.receiveShadow = this.config.enableShadows;
            plantGroup.add(pot);
            
            // Create soil
            const soilGeometry = new THREE.CylinderGeometry(0.9, 0.9, 0.2, 16);
            const soil = new THREE.Mesh(soilGeometry, this.plantMaterials.soil);
            soil.position.y = 0;
            soil.receiveShadow = this.config.enableShadows;
            plantGroup.add(soil);
            
            // Create stem
            const stemGeometry = new THREE.CylinderGeometry(0.1, 0.15, 3, 8);
            const stem = new THREE.Mesh(stemGeometry, this.plantMaterials.stem);
            stem.position.y = 1.5;
            stem.castShadow = this.config.enableShadows;
            plantGroup.add(stem);
            
            // Create leaves
            const leafCount = 5;
            const leafGroup = new THREE.Group();
            leafGroup.name = "leaves";
            
            for (let i = 0; i < leafCount; i++) {
                const leafGeometry = new THREE.PlaneGeometry(1, 0.5);
                const leaf = new THREE.Mesh(leafGeometry, this.plantMaterials.leaf);
                
                // Position leaf
                const angle = (i / leafCount) * Math.PI * 2;
                const radius = 0.6;
                const height = 0.5 + i * 0.5;
                
                leaf.position.x = Math.cos(angle) * radius;
                leaf.position.z = Math.sin(angle) * radius;
                leaf.position.y = height;
                
                // Rotate leaf to face outward
                leaf.rotation.y = -angle;
                leaf.rotation.x = Math.PI / 4;
                
                leaf.castShadow = this.config.enableShadows;
                leafGroup.add(leaf);
            }
            
            plantGroup.add(leafGroup);
            
            // Create flowers (for mature plants)
            if (plantData.type === "flower" || plantData.growthStage >= 3) {
                const flowerGroup = new THREE.Group();
                flowerGroup.name = "flowers";
                
                const flowerCount = 3;
                for (let i = 0; i < flowerCount; i++) {
                    const flowerGeometry = new THREE.SphereGeometry(0.2, 8, 8);
                    const flower = new THREE.Mesh(flowerGeometry, this.plantMaterials.flower);
                    
                    // Position flower
                    const angle = (i / flowerCount) * Math.PI * 2;
                    const radius = 0.3;
                    const height = 3.0;
                    
                    flower.position.x = Math.cos(angle) * radius;
                    flower.position.z = Math.sin(angle) * radius;
                    flower.position.y = height;
                    
                    flower.castShadow = this.config.enableShadows;
                    flowerGroup.add(flower);
                    
                    // Add petals
                    const petalCount = 6;
                    for (let j = 0; j < petalCount; j++) {
                        const petalGeometry = new THREE.PlaneGeometry(0.2, 0.1);
                        const petal = new THREE.Mesh(petalGeometry, this.plantMaterials.flower);
                        
                        const petalAngle = (j / petalCount) * Math.PI * 2;
                        const petalRadius = 0.2;
                        
                        petal.position.x = Math.cos(petalAngle) * petalRadius;
                        petal.position.z = Math.sin(petalAngle) * petalRadius;
                        
                        petal.rotation.y = -petalAngle;
                        petal.rotation.x = Math.PI / 4;
                        
                        petal.castShadow = this.config.enableShadows;
                        flower.add(petal);
                    }
                }
                
                flowerGroup.visible = false; // Initially hidden, shown based on growth stage
                plantGroup.add(flowerGroup);
            }
            
            // Create fruits (for fruit-bearing plants)
            if (plantData.type === "fruit" || plantData.type === "vegetable") {
                const fruitGroup = new THREE.Group();
                fruitGroup.name = "fruits";
                
                const fruitCount = 2;
                for (let i = 0; i < fruitCount; i++) {
                    const fruitGeometry = new THREE.SphereGeometry(0.3, 8, 8);
                    const fruit = new THREE.Mesh(fruitGeometry, this.plantMaterials.fruit);
                    
                    // Position fruit
                    const angle = (i / fruitCount) * Math.PI * 2;
                    const radius = 0.5;
                    const height = 2.0 + i * 0.5;
                    
                    fruit.position.x = Math.cos(angle) * radius;
                    fruit.position.z = Math.sin(angle) * radius;
                    fruit.position.y = height;
                    
                    fruit.castShadow = this.config.enableShadows;
                    fruitGroup.add(fruit);
                }
                
                fruitGroup.visible = false; // Initially hidden, shown based on growth stage
                plantGroup.add(fruitGroup);
            }
            
            // Add plant to scene
            this.scene.add(plantGroup);
            
            // Store model reference
            this.plantModels[plantData.id] = plantGroup;
            this.currentPlant = plantData.id;
            
            // Set initial scale based on growth stage
            this.updatePlantVisualization(plantData);
            
            this.log(`Plant model loaded for ${plantData.name || plantData.id}`);
            return Promise.resolve(plantGroup);
        } catch (error) {
            this.log(`Error loading plant model: ${error.message}`, true);
            return Promise.reject(error);
        }
    }

    /**
     * Update plant visualization based on data
     * @param {Object} plantData - Plant data object
     */
    updatePlantVisualization(plantData) {
        if (!plantData || !plantData.id || !this.plantModels[plantData.id]) {
            return;
        }
        
        const plantModel = this.plantModels[plantData.id];
        
        // Calculate growth progress
        const growthProgress = plantData.growthStage / plantData.maxGrowthStage;
        this.targetGrowthProgress = growthProgress;
        
        // If growth animation is disabled, update immediately
        if (!this.config.enableGrowthAnimation) {
            this.growthProgress = this.targetGrowthProgress;
            this.updatePlantScale(plantModel, this.growthProgress);
            this.updatePlantParts(plantModel, this.growthProgress, plantData);
        } else {
            // Growth animation will be handled in the animation loop
            this.isGrowing = true;
        }
        
        // Update materials based on plant health
        this.updatePlantHealth(plantModel, plantData.health || 1.0);
        
        // Update water level visualization
        this.updateWaterLevel(plantModel, plantData.waterLevel || 0);
    }

    /**
     * Update plant scale based on growth progress
     * @param {THREE.Group} plantModel - Plant model group
     * @param {number} progress - Growth progress (0-1)
     */
    updatePlantScale(plantModel, progress) {
        // Apply non-linear scaling for more natural growth
        const scale = 0.3 + progress * 0.7;
        
        // Scale the plant parts (not the pot)
        const stem = plantModel.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry);
        if (stem) {
            stem.scale.set(scale, scale, scale);
        }
        
        const leaves = plantModel.getObjectByName("leaves");
        if (leaves) {
            leaves.scale.set(scale, scale, scale);
        }
    }

    /**
     * Update plant parts visibility based on growth stage
     * @param {THREE.Group} plantModel - Plant model group
     * @param {number} progress - Growth progress (0-1)
     * @param {Object} plantData - Plant data object
     */
    updatePlantParts(plantModel, progress, plantData) {
        // Show/hide flowers based on growth stage
        const flowers = plantModel.getObjectByName("flowers");
        if (flowers) {
            flowers.visible = progress >= 0.6;
        }
        
        // Show/hide fruits based on growth stage
        const fruits = plantModel.getObjectByName("fruits");
        if (fruits) {
            fruits.visible = progress >= 0.8;
        }
    }

    /**
     * Update plant materials based on health
     * @param {THREE.Group} plantModel - Plant model group
     * @param {number} health - Plant health (0-1)
     */
    updatePlantHealth(plantModel, health) {
        // Update leaf color based on health
        const leaves = plantModel.getObjectByName("leaves");
        if (leaves) {
            leaves.traverse(child => {
                if (child instanceof THREE.Mesh) {
                    // Interpolate between healthy and unhealthy colors
                    const healthyColor = new THREE.Color(0x4caf50);
                    const unhealthyColor = new THREE.Color(0xa5d6a7);
                    const color = healthyColor.clone().lerp(unhealthyColor, 1 - health);
                    
                    child.material = child.material.clone();
                    child.material.color.copy(color);
                    
                    // Adjust material properties based on health
                    child.material.roughness = 0.6 + (1 - health) * 0.3;
                }
            });
        }
        
        // Update stem color based on health
        const stem = plantModel.children.find(child => child instanceof THREE.Mesh && child.geometry instanceof THREE.CylinderGeometry);
        if (stem) {
            const healthyColor = new THREE.Color(0x2e7d32);
            const unhealthyColor = new THREE.Color(0x81c784);
            const color = healthyColor.clone().lerp(unhealthyColor, 1 - health);
            
            stem.material = stem.material.clone();
            stem.material.color.copy(color);
        }
    }

    /**
     * Update water level visualization
     * @param {THREE.Group} plantModel - Plant model group
     * @param {number} waterLevel - Water level (0-1)
     */
    updateWaterLevel(plantModel, waterLevel) {
        // Find or create water visualization
        let water = plantModel.getObjectByName("water");
        
        if (waterLevel <= 0) {
            // Remove water visualization if level is 0
            if (water) {
                plantModel.remove(water);
            }
            return;
        }
        
        if (!water) {
            // Create water visualization
            const waterGeometry = new THREE.CylinderGeometry(0.85, 0.85, 0.1, 16);
            water = new THREE.Mesh(waterGeometry, this.plantMaterials.water);
            water.name = "water";
            water.position.y = 0.05;
            plantModel.add(water);
        }
        
        // Update water height based on level
        water.scale.y = waterLevel;
        water.position.y = 0.05 * waterLevel;
    }

    /**
     * Main animation loop
     */
    animate() {
        if (!this.renderer) return;
        
        requestAnimationFrame(this.animate);
        
        const delta = this.clock.getDelta();
        
        // Update controls
        if (this.controls) {
            this.controls.update();
        }
        
        // Update animation mixers
        this.mixers.forEach(mixer => {
            mixer.update(delta);
        });
        
        // Update growth animation
        if (this.isGrowing && this.config.enableGrowthAnimation) {
            // Smoothly interpolate towards target growth
            const growthDelta = (this.targetGrowthProgress - this.growthProgress) * delta * 2 * this.config.growthSpeed;
            
            if (Math.abs(growthDelta) > 0.001) {
                this.growthProgress += growthDelta;
                
                // Update plant based on new growth progress
                const plantModel = this.plantModels[this.currentPlant];
                if (plantModel) {
                    this.updatePlantScale(plantModel, this.growthProgress);
                    this.updatePlantParts(plantModel, this.growthProgress, this.config.plantData);
                }
            } else {
                this.isGrowing = false;
            }
        }
        
        // Render scene
        if (this.composer && (this.config.enableBloom || this.config.enableAmbientOcclusion)) {
            this.composer.render();
        } else {
            this.renderer.render(this.scene, this.camera);
        }
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.camera || !this.renderer) return;
        
        // Update dimensions
        this.config.width = this.config.container ? this.config.container.clientWidth : window.innerWidth;
        this.config.height = this.config.container ? this.config.container.clientHeight : 400;
        
        // Update camera
        this.camera.aspect = this.config.width / this.config.height;
        this.camera.updateProjectionMatrix();
        
        // Update renderer
        this.renderer.setSize(this.config.width, this.config.height);
        
        // Update composer
        if (this.composer) {
            this.composer.setSize(this.config.width, this.config.height);
        }
    }

    /**
     * Handle mouse move for interaction
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseMove(event) {
        if (!this.config.enableInteraction || !this.raycaster || !this.scene || !this.camera) return;
        
        // Calculate mouse position in normalized device coordinates
        const rect = this.config.container.getBoundingClientRect();
        this.mousePosition.x = ((event.clientX - rect.left) / this.config.width) * 2 - 1;
        this.mousePosition.y = -((event.clientY - rect.top) / this.config.height) * 2 + 1;
        
        // Update raycaster
        this.raycaster.setFromCamera(this.mousePosition, this.camera);
        
        // Find intersections with plant parts
        const plantModel = this.plantModels[this.currentPlant];
        if (!plantModel) return;
        
        const intersects = this.raycaster.intersectObjects(plantModel.children, true);
        
        if (intersects.length > 0) {
            // Highlight intersected object
            if (this.intersectedObject !== intersects[0].object) {
                if (this.intersectedObject) {
                    // Reset previous object
                    if (this.intersectedObject.material.emissive) {
                        this.intersectedObject.material.emissive.setHex(this.intersectedObject.currentHex || 0);
                    }
                }
                
                this.intersectedObject = intersects[0].object;
                
                if (this.intersectedObject.material.emissive) {
                    // Store current color and set highlight
                    this.intersectedObject.currentHex = this.intersectedObject.material.emissive.getHex();
                    this.intersectedObject.material.emissive.setHex(0x333333);
                }
                
                // Change cursor
                this.config.container.style.cursor = 'pointer';
            }
        } else {
            // Reset highlight
            if (this.intersectedObject && this.intersectedObject.material.emissive) {
                this.intersectedObject.material.emissive.setHex(this.intersectedObject.currentHex || 0);
            }
            
            this.intersectedObject = null;
            this.config.container.style.cursor = 'auto';
        }
    }

    /**
     * Handle mouse down for interaction
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseDown(event) {
        if (!this.config.enableInteraction) return;
        
        this.isDragging = true;
        this.controls.autoRotate = false;
    }

    /**
     * Handle mouse up for interaction
     * @param {MouseEvent} event - Mouse event
     */
    handleMouseUp(event) {
        if (!this.config.enableInteraction) return;
        
        this.isDragging = false;
        
        // If not dragging and there's an intersected object, trigger interaction
        if (!this.isDragging && this.intersectedObject) {
            this.interactWithPlant(this.intersectedObject);
        }
        
        // Resume auto-rotation if it was enabled
        this.controls.autoRotate = this.isRotating;
    }

    /**
     * Handle touch start for interaction
     * @param {TouchEvent} event - Touch event
     */
    handleTouchStart(event) {
        if (!this.config.enableInteraction || event.touches.length === 0) return;
        
        this.isDragging = false;
        this.controls.autoRotate = false;
        
        // Calculate touch position
        const rect = this.config.container.getBoundingClientRect();
        this.mousePosition.x = ((event.touches[0].clientX - rect.left) / this.config.width) * 2 - 1;
        this.mousePosition.y = -((event.touches[0].clientY - rect.top) / this.config.height) * 2 + 1;
    }

    /**
     * Handle touch move for interaction
     * @param {TouchEvent} event - Touch event
     */
    handleTouchMove(event) {
        if (!this.config.enableInteraction || event.touches.length === 0) return;
        
        this.isDragging = true;
        
        // Calculate touch position
        const rect = this.config.container.getBoundingClientRect();
        this.mousePosition.x = ((event.touches[0].clientX - rect.left) / this.config.width) * 2 - 1;
        this.mousePosition.y = -((event.touches[0].clientY - rect.top) / this.config.height) * 2 + 1;
    }

    /**
     * Handle touch end for interaction
     * @param {TouchEvent} event - Touch event
     */
    handleTouchEnd(event) {
        if (!this.config.enableInteraction) return;
        
        // If not dragging, check for interaction
        if (!this.isDragging) {
            // Update raycaster
            this.raycaster.setFromCamera(this.mousePosition, this.camera);
            
            // Find intersections with plant parts
            const plantModel = this.plantModels[this.currentPlant];
            if (plantModel) {
                const intersects = this.raycaster.intersectObjects(plantModel.children, true);
                
                if (intersects.length > 0) {
                    this.interactWithPlant(intersects[0].object);
                }
            }
        }
        
        this.isDragging = false;
        
        // Resume auto-rotation if it was enabled
        this.controls.autoRotate = this.isRotating;
    }

    /**
     * Handle mouse wheel for zoom
     * @param {WheelEvent} event - Wheel event
     */
    handleWheel(event) {
        if (!this.config.enableInteraction) return;
        
        // Handled by OrbitControls
    }

    /**
     * Interact with a plant part
     * @param {THREE.Object3D} object - Intersected object
     */
    interactWithPlant(object) {
        // Find the plant part type
        let partType = "plant";
        
        if (object.parent && object.parent.name) {
            if (object.parent.name === "leaves") {
                partType = "leaf";
            } else if (object.parent.name === "flowers") {
                partType = "flower";
            } else if (object.parent.name === "fruits") {
                partType = "fruit";
            }
        } else if (object.name === "water") {
            partType = "water";
        }
        
        // Create interaction event
        const event = new CustomEvent('plantInteraction', {
            detail: {
                plantId: this.currentPlant,
                partType: partType,
                position: object.position.clone()
            }
        });
        
        // Dispatch event
        this.config.container.dispatchEvent(event);
        
        // Visual feedback
        this.createInteractionEffect(object.position.clone());
    }

    /**
     * Create visual effect for interaction
     * @param {THREE.Vector3} position - Effect position
     */
    createInteractionEffect(position) {
        // Create particles
        const particleCount = 10;
        const particleGroup = new THREE.Group();
        particleGroup.name = "interaction-effect";
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 8, 8);
            const particleMaterial = new THREE.MeshBasicMaterial({
                color: 0x7deb7d,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Random position around interaction point
            particle.position.copy(position);
            particle.position.x += (Math.random() - 0.5) * 0.5;
            particle.position.y += (Math.random() - 0.5) * 0.5;
            particle.position.z += (Math.random() - 0.5) * 0.5;
            
            // Random velocity
            particle.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.05,
                Math.random() * 0.1,
                (Math.random() - 0.5) * 0.05
            );
            
            // Life properties
            particle.userData.life = 1.0;
            particle.userData.decay = 0.02 + Math.random() * 0.02;
            
            particleGroup.add(particle);
        }
        
        this.scene.add(particleGroup);
        
        // Animate particles
        const animateParticles = () => {
            let allDead = true;
            
            particleGroup.children.forEach(particle => {
                // Update position
                particle.position.add(particle.userData.velocity);
                
                // Apply gravity
                particle.userData.velocity.y -= 0.001;
                
                // Update life
                particle.userData.life -= particle.userData.decay;
                
                // Update opacity
                particle.material.opacity = particle.userData.life;
                
                // Check if particle is still alive
                if (particle.userData.life > 0) {
                    allDead = false;
                }
            });
            
            // Remove group when all particles are dead
            if (allDead) {
                this.scene.remove(particleGroup);
                return;
            }
            
            requestAnimationFrame(animateParticles);
        };
        
        animateParticles();
    }

    /**
     * Toggle auto-rotation
     * @param {boolean} enabled - Whether auto-rotation should be enabled
     */
    toggleAutoRotate(enabled) {
        if (this.controls) {
            this.isRotating = enabled !== undefined ? enabled : !this.controls.autoRotate;
            this.controls.autoRotate = this.isRotating;
        }
    }

    /**
     * Set plant growth stage directly
     * @param {number} stage - Growth stage
     * @param {number} maxStage - Maximum growth stage
     */
    setGrowthStage(stage, maxStage) {
        if (!this.config.plantData) return;
        
        this.config.plantData.growthStage = stage;
        this.config.plantData.maxGrowthStage = maxStage || this.config.plantData.maxGrowthStage;
        
        this.updatePlantVisualization(this.config.plantData);
    }

    /**
     * Water the plant
     * @param {number} amount - Water amount (0-1)
     */
    waterPlant(amount = 0.5) {
        if (!this.config.plantData) return;
        
        // Update water level
        this.config.plantData.waterLevel = Math.min(1, (this.config.plantData.waterLevel || 0) + amount);
        
        // Update visualization
        const plantModel = this.plantModels[this.currentPlant];
        if (plantModel) {
            this.updateWaterLevel(plantModel, this.config.plantData.waterLevel);
        }
        
        // Create water droplet effect
        this.createWaterEffect();
    }

    /**
     * Create water droplet effect
     */
    createWaterEffect() {
        const plantModel = this.plantModels[this.currentPlant];
        if (!plantModel) return;
        
        // Create water droplets
        const dropletCount = 20;
        const dropletGroup = new THREE.Group();
        dropletGroup.name = "water-effect";
        
        for (let i = 0; i < dropletCount; i++) {
            const dropletGeometry = new THREE.SphereGeometry(0.03 + Math.random() * 0.03, 8, 8);
            const dropletMaterial = new THREE.MeshStandardMaterial({
                color: 0x29b6f6,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.8
            });
            
            const droplet = new THREE.Mesh(dropletGeometry, dropletMaterial);
            
            // Random position above plant
            droplet.position.x = (Math.random() - 0.5) * 2;
            droplet.position.y = 5 + Math.random() * 2;
            droplet.position.z = (Math.random() - 0.5) * 2;
            
            // Random velocity (downward)
            droplet.userData.velocity = new THREE.Vector3(
                (Math.random() - 0.5) * 0.02,
                -0.1 - Math.random() * 0.1,
                (Math.random() - 0.5) * 0.02
            );
            
            // Life properties
            droplet.userData.life = 1.0;
            droplet.userData.decay = 0;
            
            dropletGroup.add(droplet);
        }
        
        this.scene.add(dropletGroup);
        
        // Animate droplets
        const animateDroplets = () => {
            let allDead = true;
            
            dropletGroup.children.forEach(droplet => {
                // Update position
                droplet.position.add(droplet.userData.velocity);
                
                // Check if droplet hit the soil
                if (droplet.position.y <= 0.1) {
                    // Create splash effect
                    this.createSplashEffect(droplet.position);
                    
                    // Remove droplet
                    droplet.userData.life = 0;
                    droplet.visible = false;
                } else {
                    allDead = false;
                }
            });
            
            // Remove group when all droplets are dead
            if (allDead) {
                this.scene.remove(dropletGroup);
                return;
            }
            
            requestAnimationFrame(animateDroplets);
        };
        
        animateDroplets();
    }

    /**
     * Create water splash effect
     * @param {THREE.Vector3} position - Splash position
     */
    createSplashEffect(position) {
        // Create splash particles
        const particleCount = 8;
        const splashGroup = new THREE.Group();
        splashGroup.name = "splash-effect";
        
        for (let i = 0; i < particleCount; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.02, 8, 8);
            const particleMaterial = new THREE.MeshStandardMaterial({
                color: 0x29b6f6,
                roughness: 0.2,
                metalness: 0.8,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            
            // Position at splash point
            particle.position.copy(position);
            particle.position.y = 0.1;
            
            // Random outward velocity
            const angle = (i / particleCount) * Math.PI * 2;
            const speed = 0.05 + Math.random() * 0.05;
            
            particle.userData.velocity = new THREE.Vector3(
                Math.cos(angle) * speed,
                0.05 + Math.random() * 0.05,
                Math.sin(angle) * speed
            );
            
            // Life properties
            particle.userData.life = 1.0;
            particle.userData.decay = 0.05 + Math.random() * 0.05;
            
            splashGroup.add(particle);
        }
        
        this.scene.add(splashGroup);
        
        // Animate splash
        const animateSplash = () => {
            let allDead = true;
            
            splashGroup.children.forEach(particle => {
                // Update position
                particle.position.add(particle.userData.velocity);
                
                // Apply gravity
                particle.userData.velocity.y -= 0.005;
                
                // Update life
                particle.userData.life -= particle.userData.decay;
                
                // Update opacity
                particle.material.opacity = particle.userData.life;
                
                // Check if particle is still alive
                if (particle.userData.life > 0) {
                    allDead = false;
                }
            });
            
            // Remove group when all particles are dead
            if (allDead) {
                this.scene.remove(splashGroup);
                return;
            }
            
            requestAnimationFrame(animateSplash);
        };
        
        animateSplash();
    }

    /**
     * Clean up resources
     */
    cleanup() {
        // Stop animation loop
        this.isRunning = false;
        
        // Remove event listeners
        window.removeEventListener('resize', this.handleResize);
        
        if (this.config.container) {
            this.config.container.removeEventListener('mousemove', this.handleMouseMove);
            this.config.container.removeEventListener('mousedown', this.handleMouseDown);
            this.config.container.removeEventListener('mouseup', this.handleMouseUp);
            this.config.container.removeEventListener('touchstart', this.handleTouchStart);
            this.config.container.removeEventListener('touchmove', this.handleTouchMove);
            this.config.container.removeEventListener('touchend', this.handleTouchEnd);
            this.config.container.removeEventListener('wheel', this.handleWheel);
        }
        
        // Dispose of Three.js resources
        this.scene.traverse(object => {
            if (object instanceof THREE.Mesh) {
                if (object.geometry) {
                    object.geometry.dispose();
                }
                
                if (object.material) {
                    if (Array.isArray(object.material)) {
                        object.material.forEach(material => material.dispose());
                    } else {
                        object.material.dispose();
                    }
                }
            }
        });
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
            
            // Remove canvas from container
            if (this.config.container && this.renderer.domElement.parentNode === this.config.container) {
                this.config.container.removeChild(this.renderer.domElement);
            }
        }
        
        // Clear references
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.raycaster = null;
        this.composer = null;
        this.bloomPass = null;
        this.aoPass = null;
        this.plantModels = {};
        this.plantMaterials = {};
        this.plantLights = {};
        this.plantAnimations = {};
        this.currentPlant = null;
        this.intersectedObject = null;
        this.mixers = [];
        this.actions = {};
        
        this.log("3D Plant Visualizer cleaned up");
    }

    /**
     * Log a message
     * @param {string} message - Message to log
     * @param {boolean} isError - Whether this is an error message
     */
    log(message, isError = false) {
        if (!this.config.debugMode && !isError) return;
        
        const prefix = `[3D Visualizer] ${isError ? 'ERROR: ' : ''}`;
        if (isError) {
            console.error(prefix + message);
        } else {
            console.log(prefix + message);
        }
    }
}

// Export the class
window.Plant3DVisualizer = Plant3DVisualizer;