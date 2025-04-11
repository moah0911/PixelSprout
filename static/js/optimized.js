/**
 * Performance optimizations for PixelSprout
 * This file contains functions to improve site performance
 */

// Debounce function to limit how often a function can be called
function debounce(func, wait) {
    let timeout;
    return function(...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

// Throttle function to limit how often a function can be called
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('[data-src]');
    const options = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    }, options);
    
    images.forEach(img => {
        observer.observe(img);
    });
}

// Optimize animations
function optimizeAnimations() {
    // Reduce animation complexity on mobile
    if (window.innerWidth < 768) {
        document.body.classList.add('reduce-animations');
    }
    
    // Disable animations when the page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            document.body.classList.add('pause-animations');
        } else {
            document.body.classList.remove('pause-animations');
        }
    });
}

// Optimize event listeners
function optimizeEventListeners() {
    // Use event delegation where possible
    document.addEventListener('click', (e) => {
        // Handle water plant buttons
        if (e.target.closest('.water-plant-btn')) {
            const button = e.target.closest('.water-plant-btn');
            const plantId = button.getAttribute('data-plant-id');
            if (plantId && window.waterPlant) {
                window.waterPlant(plantId);
            }
        }
        
        // Handle dance plant buttons
        if (e.target.closest('.dance-plant-btn')) {
            const button = e.target.closest('.dance-plant-btn');
            const plantId = button.getAttribute('data-plant-id');
            const plantContainer = document.querySelector(`.plant-container[data-plant-id="${plantId}"]`);
            
            if (plantContainer) {
                // Toggle dancing class
                if (plantContainer.classList.contains('animation-dancing')) {
                    plantContainer.classList.remove('animation-dancing');
                    button.innerHTML = '<i class="fas fa-music me-2"></i> Animate';
                    button.classList.remove('btn-garden-primary');
                    button.classList.add('btn-garden-outline');
                } else {
                    plantContainer.classList.add('animation-dancing');
                    button.innerHTML = '<i class="fas fa-stop me-2"></i> Stop Animation';
                    button.classList.remove('btn-garden-outline');
                    button.classList.add('btn-garden-primary');
                }
            }
        }
    });
    
    // Throttle scroll and resize events
    window.addEventListener('scroll', throttle(() => {
        // Handle scroll-based animations or effects
    }, 100));
    
    window.addEventListener('resize', debounce(() => {
        // Handle resize-based layout changes
        if (window.innerWidth < 768) {
            document.body.classList.add('reduce-animations');
        } else {
            document.body.classList.remove('reduce-animations');
        }
    }, 250));
}

// Optimize CSS animations
function optimizeCSSAnimations() {
    const style = document.createElement('style');
    style.textContent = `
        /* Reduce animations for better performance */
        .reduce-animations * {
            transition-duration: 0.1s !important;
            animation-duration: 0.1s !important;
        }
        
        /* Pause animations when page is not visible */
        .pause-animations * {
            animation-play-state: paused !important;
            transition: none !important;
        }
        
        /* Use hardware acceleration for animations */
        .plant-card,
        .plant-container,
        .water-credits-display,
        .btn-garden,
        .auth-card {
            transform: translateZ(0);
            will-change: transform;
        }
        
        /* Optimize background animations */
        @media (max-width: 768px) {
            .bg-animated,
            .bg-plants,
            .bg-stars,
            .auth-bg-circle,
            .auth-bg-line,
            .particles-container {
                display: none !important;
            }
        }
    `;
    document.head.appendChild(style);
}

// Optimize API calls
function optimizeAPICalls() {
    // Cache API responses
    const apiCache = {};
    
    // Override fetch to add caching
    const originalFetch = window.fetch;
    window.fetch = async function(url, options = {}) {
        // Only cache GET requests
        if (!options.method || options.method === 'GET') {
            // Check if we have a cached response
            const cacheKey = url.toString();
            if (apiCache[cacheKey]) {
                const cachedData = apiCache[cacheKey];
                // Check if cache is still valid (5 minutes)
                if (Date.now() - cachedData.timestamp < 5 * 60 * 1000) {
                    return Promise.resolve(new Response(JSON.stringify(cachedData.data), {
                        status: 200,
                        headers: { 'Content-Type': 'application/json' }
                    }));
                }
            }
            
            // No valid cache, make the request
            return originalFetch(url, options).then(response => {
                // Clone the response so we can read it twice
                const clone = response.clone();
                
                // Only cache successful responses
                if (response.ok) {
                    clone.json().then(data => {
                        apiCache[cacheKey] = {
                            timestamp: Date.now(),
                            data: data
                        };
                    }).catch(() => {
                        // If it's not JSON, don't cache it
                    });
                }
                
                return response;
            });
        }
        
        // For non-GET requests, just use the original fetch
        return originalFetch(url, options);
    };
}

// Show notification with improved performance
function showNotification(message, type = 'info', duration = 3000) {
    const statusContainer = document.getElementById('status-container');
    if (!statusContainer) return;
    
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-white bg-${type} border-0`;
    toast.setAttribute('role', 'alert');
    toast.setAttribute('aria-live', 'assertive');
    toast.setAttribute('aria-atomic', 'true');
    
    // Get icon based on notification type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    if (type === 'error' || type === 'danger') icon = 'times-circle';
    
    toast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">
                <i class="fas fa-${icon} me-2"></i>
                ${message}
            </div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>
    `;
    
    statusContainer.appendChild(toast);
    
    const bsToast = new bootstrap.Toast(toast, {
        autohide: true,
        delay: duration
    });
    
    bsToast.show();
    
    toast.addEventListener('hidden.bs.toast', function() {
        statusContainer.removeChild(toast);
    });
}

// Initialize all optimizations
function initOptimizations() {
    // Apply optimizations
    lazyLoadImages();
    optimizeAnimations();
    optimizeEventListeners();
    optimizeCSSAnimations();
    optimizeAPICalls();
    
    // Make showNotification available globally
    window.showNotification = showNotification;
    
    // Log optimization status
    console.log('Performance optimizations applied');
}

// Run optimizations when the DOM is loaded
document.addEventListener('DOMContentLoaded', initOptimizations);