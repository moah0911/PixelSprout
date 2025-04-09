// Enhanced plant SVGs for different plant types and stages
// This file provides more detailed and specialized SVGs for each plant type

// Initialize enhanced plant SVGs object
window.enhancedPlantSvgs = {
    // Succulents - round, thick leaves with water storage
    succulent: {
        0: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="5" fill="#4f9c2c" />
            </svg>`,
        1: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="8" fill="#4f9c2c" />
                <circle cx="50" cy="65" r="6" fill="#5bae3a" />
            </svg>`,
        2: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="9" fill="#4f9c2c" />
                <ellipse cx="40" cy="65" rx="8" ry="10" fill="#5bae3a" transform="rotate(-10,40,65)" />
                <ellipse cx="60" cy="65" rx="8" ry="10" fill="#5bae3a" transform="rotate(10,60,65)" />
                <ellipse cx="50" cy="55" rx="7" ry="9" fill="#65b93f" />
            </svg>`,
        3: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="12" fill="#4f9c2c" />
                <ellipse cx="35" cy="65" rx="9" ry="12" fill="#5bae3a" transform="rotate(-15,35,65)" />
                <ellipse cx="65" cy="65" rx="9" ry="12" fill="#5bae3a" transform="rotate(15,65,65)" />
                <ellipse cx="30" cy="55" rx="8" ry="10" fill="#65b93f" transform="rotate(-25,30,55)" />
                <ellipse cx="70" cy="55" rx="8" ry="10" fill="#65b93f" transform="rotate(25,70,55)" />
                <ellipse cx="50" cy="45" rx="8" ry="12" fill="#6ec445" />
            </svg>`,
        4: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="12" fill="#4f9c2c" />
                <ellipse cx="35" cy="65" rx="9" ry="12" fill="#5bae3a" transform="rotate(-15,35,65)" />
                <ellipse cx="65" cy="65" rx="9" ry="12" fill="#5bae3a" transform="rotate(15,65,65)" />
                <ellipse cx="30" cy="55" rx="8" ry="10" fill="#65b93f" transform="rotate(-25,30,55)" />
                <ellipse cx="70" cy="55" rx="8" ry="10" fill="#65b93f" transform="rotate(25,70,55)" />
                <ellipse cx="50" cy="45" rx="8" ry="12" fill="#6ec445" />
                <circle cx="50" cy="35" r="6" fill="#ff85a2" />
                <circle cx="40" cy="40" r="4" fill="#ff85a2" />
                <circle cx="60" cy="40" r="4" fill="#ff85a2" />
            </svg>`,
        5: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="12" fill="#4f9c2c" />
                <ellipse cx="35" cy="65" rx="9" ry="12" fill="#999e3a" transform="rotate(-15,35,65)" />
                <ellipse cx="65" cy="65" rx="9" ry="12" fill="#999e3a" transform="rotate(15,65,65)" />
                <ellipse cx="30" cy="55" rx="8" ry="10" fill="#a19d3f" transform="rotate(-25,30,55)" />
                <ellipse cx="70" cy="55" rx="8" ry="10" fill="#a19d3f" transform="rotate(25,70,55)" />
                <ellipse cx="50" cy="45" rx="8" ry="12" fill="#b1a945" />
                <circle cx="50" cy="35" r="6" fill="#cc6680" />
                <circle cx="40" cy="40" r="4" fill="#cc6680" />
                <circle cx="60" cy="40" r="4" fill="#cc6680" />
            </svg>`,
        6: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <circle cx="50" cy="75" r="12" fill="#7c7a6c" />
                <ellipse cx="35" cy="65" rx="9" ry="12" fill="#696755" transform="rotate(-20,35,65)" />
                <ellipse cx="65" cy="65" rx="9" ry="12" fill="#696755" transform="rotate(20,65,65)" />
                <ellipse cx="30" cy="55" rx="8" ry="10" fill="#595845" transform="rotate(-30,30,55)" />
                <ellipse cx="70" cy="55" rx="8" ry="10" fill="#595845" transform="rotate(30,70,55)" />
                <ellipse cx="50" cy="45" rx="8" ry="12" fill="#494939" />
            </svg>`
    },
    
    // Flowers - tall with distinct stem, leaves, and flower
    flower: {
        0: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="75" width="4" height="5" fill="#3e8a21" />
            </svg>`,
        1: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="65" width="4" height="15" fill="#3e8a21" />
                <ellipse cx="46" cy="65" rx="4" ry="2" fill="#4a9e2a" transform="rotate(-20,46,65)" />
                <ellipse cx="54" cy="62" rx="4" ry="2" fill="#4a9e2a" transform="rotate(20,54,62)" />
            </svg>`,
        2: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="45" width="4" height="35" fill="#3e8a21" />
                <ellipse cx="46" cy="65" rx="6" ry="3" fill="#4a9e2a" transform="rotate(-20,46,65)" />
                <ellipse cx="54" cy="60" rx="6" ry="3" fill="#4a9e2a" transform="rotate(20,54,60)" />
                <ellipse cx="44" cy="55" rx="7" ry="3" fill="#4a9e2a" transform="rotate(-30,44,55)" />
                <ellipse cx="56" cy="50" rx="7" ry="3" fill="#4a9e2a" transform="rotate(30,56,50)" />
                <circle cx="50" cy="40" r="5" fill="#59b936" />
            </svg>`,
        3: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="35" width="4" height="45" fill="#3e8a21" />
                <ellipse cx="46" cy="65" rx="8" ry="3" fill="#4a9e2a" transform="rotate(-20,46,65)" />
                <ellipse cx="54" cy="60" rx="8" ry="3" fill="#4a9e2a" transform="rotate(20,54,60)" />
                <ellipse cx="44" cy="55" rx="9" ry="3" fill="#4a9e2a" transform="rotate(-30,44,55)" />
                <ellipse cx="56" cy="50" rx="9" ry="3" fill="#4a9e2a" transform="rotate(30,56,50)" />
                <circle cx="50" cy="30" r="7" fill="#59b936" />
                <ellipse cx="46" cy="26" rx="4" ry="5" fill="#ec86df" transform="rotate(-15,46,26)" />
                <ellipse cx="54" cy="26" rx="4" ry="5" fill="#ec86df" transform="rotate(15,54,26)" />
                <ellipse cx="50" cy="22" rx="4" ry="5" fill="#ec86df" />
            </svg>`,
        4: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="30" width="4" height="50" fill="#3e8a21" />
                <ellipse cx="46" cy="65" rx="8" ry="3" fill="#4a9e2a" transform="rotate(-20,46,65)" />
                <ellipse cx="54" cy="60" rx="8" ry="3" fill="#4a9e2a" transform="rotate(20,54,60)" />
                <ellipse cx="44" cy="55" rx="9" ry="3" fill="#4a9e2a" transform="rotate(-30,44,55)" />
                <ellipse cx="56" cy="50" rx="9" ry="3" fill="#4a9e2a" transform="rotate(30,56,50)" />
                <ellipse cx="42" cy="45" rx="9" ry="3" fill="#4a9e2a" transform="rotate(-40,42,45)" />
                <ellipse cx="58" cy="40" rx="9" ry="3" fill="#4a9e2a" transform="rotate(40,58,40)" />
                <circle cx="50" cy="25" r="10" fill="#59b936" />
                <ellipse cx="45" cy="20" rx="5" ry="7" fill="#ec86df" transform="rotate(-15,45,20)" />
                <ellipse cx="55" cy="20" rx="5" ry="7" fill="#ec86df" transform="rotate(15,55,20)" />
                <ellipse cx="40" cy="25" rx="5" ry="7" fill="#ec86df" transform="rotate(-45,40,25)" />
                <ellipse cx="60" cy="25" rx="5" ry="7" fill="#ec86df" transform="rotate(45,60,25)" />
                <ellipse cx="50" cy="15" rx="5" ry="7" fill="#ec86df" />
                <circle cx="50" cy="25" r="5" fill="#ffeb3b" />
            </svg>`,
        5: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="30" width="4" height="50" fill="#3e8a21" />
                <ellipse cx="46" cy="65" rx="8" ry="3" fill="#8d9e2a" transform="rotate(-20,46,65)" />
                <ellipse cx="54" cy="60" rx="8" ry="3" fill="#8d9e2a" transform="rotate(20,54,60)" />
                <ellipse cx="44" cy="55" rx="9" ry="3" fill="#8d9e2a" transform="rotate(-30,44,55)" />
                <ellipse cx="56" cy="50" rx="9" ry="3" fill="#8d9e2a" transform="rotate(30,56,50)" />
                <ellipse cx="42" cy="45" rx="9" ry="3" fill="#8d9e2a" transform="rotate(-40,42,45)" />
                <ellipse cx="58" cy="40" rx="9" ry="3" fill="#8d9e2a" transform="rotate(40,58,40)" />
                <circle cx="50" cy="25" r="10" fill="#a9b936" />
                <ellipse cx="45" cy="20" rx="5" ry="7" fill="#cc6dc2" transform="rotate(-15,45,20)" />
                <ellipse cx="55" cy="20" rx="5" ry="7" fill="#cc6dc2" transform="rotate(15,55,20)" />
                <ellipse cx="40" cy="25" rx="5" ry="7" fill="#cc6dc2" transform="rotate(-45,40,25)" />
                <ellipse cx="60" cy="25" rx="5" ry="7" fill="#cc6dc2" transform="rotate(45,60,25)" />
                <ellipse cx="50" cy="15" rx="5" ry="7" fill="#cc6dc2" />
                <circle cx="50" cy="25" r="5" fill="#d6cb4a" />
            </svg>`,
        6: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="30" width="4" height="50" fill="#817a6c" />
                <ellipse cx="46" cy="65" rx="8" ry="3" fill="#7e7a65" transform="rotate(-25,46,65)" />
                <ellipse cx="54" cy="60" rx="8" ry="3" fill="#7e7a65" transform="rotate(25,54,60)" />
                <ellipse cx="44" cy="55" rx="9" ry="3" fill="#7e7a65" transform="rotate(-35,44,55)" />
                <ellipse cx="56" cy="50" rx="9" ry="3" fill="#7e7a65" transform="rotate(35,56,50)" />
                <ellipse cx="42" cy="45" rx="9" ry="3" fill="#7e7a65" transform="rotate(-45,42,45)" />
                <ellipse cx="58" cy="40" rx="9" ry="3" fill="#7e7a65" transform="rotate(45,58,40)" />
                <circle cx="50" cy="25" r="10" fill="#69685f" />
                <ellipse cx="45" cy="20" rx="5" ry="5" fill="#5d5d54" transform="rotate(-15,45,20)" />
                <ellipse cx="55" cy="20" rx="5" ry="5" fill="#5d5d54" transform="rotate(15,55,20)" />
                <ellipse cx="40" cy="25" rx="5" ry="5" fill="#5d5d54" transform="rotate(-45,40,25)" />
                <ellipse cx="60" cy="25" rx="5" ry="5" fill="#5d5d54" transform="rotate(45,60,25)" />
                <ellipse cx="50" cy="15" rx="5" ry="5" fill="#5d5d54" />
            </svg>`
    },
    
    // Trees - thick trunk with branches and leaves
    tree: {
        0: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="48" y="75" width="4" height="5" fill="#8b5d3b" />
            </svg>`,
        1: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="47" y="65" width="6" height="15" fill="#8b5d3b" />
                <circle cx="50" cy="60" r="8" fill="#4f9c2c" />
            </svg>`,
        2: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="46" y="50" width="8" height="30" fill="#8b5d3b" />
                <circle cx="50" cy="40" r="15" fill="#4f9c2c" />
                <circle cx="40" cy="45" r="8" fill="#4f9c2c" />
                <circle cx="60" cy="45" r="8" fill="#4f9c2c" />
            </svg>`,
        3: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="45" y="40" width="10" height="40" fill="#8b5d3b" />
                <rect x="40" y="50" width="5" height="2" fill="#8b5d3b" />
                <rect x="55" y="45" width="5" height="2" fill="#8b5d3b" />
                <circle cx="50" cy="30" r="20" fill="#4f9c2c" />
                <circle cx="35" cy="35" r="10" fill="#5bae3a" />
                <circle cx="65" cy="35" r="10" fill="#5bae3a" />
                <circle cx="45" cy="25" r="8" fill="#65b93f" />
                <circle cx="55" cy="25" r="8" fill="#65b93f" />
            </svg>`,
        4: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="44" y="30" width="12" height="50" fill="#8b5d3b" />
                <rect x="38" y="45" width="6" height="3" fill="#8b5d3b" />
                <rect x="56" y="40" width="6" height="3" fill="#8b5d3b" />
                <rect x="35" y="55" width="9" height="3" fill="#8b5d3b" />
                <rect x="56" y="60" width="9" height="3" fill="#8b5d3b" />
                <circle cx="50" cy="20" r="22" fill="#4f9c2c" />
                <circle cx="32" cy="30" r="12" fill="#5bae3a" />
                <circle cx="68" cy="30" r="12" fill="#5bae3a" />
                <circle cx="40" cy="15" r="10" fill="#65b93f" />
                <circle cx="60" cy="15" r="10" fill="#65b93f" />
                <circle cx="38" cy="38" r="8" fill="#65b93f" />
                <circle cx="62" cy="38" r="8" fill="#65b93f" />
                <circle cx="50" cy="10" r="8" fill="#6ec445" />
                <circle cx="45" cy="17" r="3" fill="#f44336" />
                <circle cx="55" cy="15" r="3" fill="#f44336" />
                <circle cx="40" cy="25" r="3" fill="#f44336" />
            </svg>`,
        5: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="44" y="30" width="12" height="50" fill="#8b5d3b" />
                <rect x="38" y="45" width="6" height="3" fill="#8b5d3b" />
                <rect x="56" y="40" width="6" height="3" fill="#8b5d3b" />
                <rect x="35" y="55" width="9" height="3" fill="#8b5d3b" />
                <rect x="56" y="60" width="9" height="3" fill="#8b5d3b" />
                <circle cx="50" cy="20" r="22" fill="#d2a24c" />
                <circle cx="32" cy="30" r="12" fill="#e6b251" />
                <circle cx="68" cy="30" r="12" fill="#e6b251" />
                <circle cx="40" cy="15" r="10" fill="#f1c26f" />
                <circle cx="60" cy="15" r="10" fill="#f1c26f" />
                <circle cx="38" cy="38" r="8" fill="#d9a548" />
                <circle cx="62" cy="38" r="8" fill="#d9a548" />
                <circle cx="50" cy="10" r="8" fill="#d2954d" />
                <circle cx="45" cy="17" r="3" fill="#c82333" />
                <circle cx="55" cy="15" r="3" fill="#c82333" />
                <circle cx="40" cy="25" r="3" fill="#c82333" />
            </svg>`,
        6: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <rect x="44" y="30" width="12" height="50" fill="#8b5d3b" />
                <rect x="38" y="45" width="6" height="3" fill="#8b5d3b" />
                <rect x="56" y="40" width="6" height="3" fill="#8b5d3b" />
                <rect x="35" y="55" width="9" height="3" fill="#8b5d3b" />
                <rect x="56" y="60" width="9" height="3" fill="#8b5d3b" />
                <rect x="31" y="38" width="2" height="10" fill="#8b5d3b" transform="rotate(45,31,38)" />
                <rect x="67" y="38" width="2" height="10" fill="#8b5d3b" transform="rotate(-45,67,38)" />
                <rect x="50" y="18" width="2" height="12" fill="#8b5d3b" transform="rotate(90,50,18)" />
            </svg>`
    },
    
    // Herbs - bushy with many small leaves
    herb: {
        0: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="75" rx="3" ry="5" fill="#3e8a21" />
            </svg>`,
        1: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="75" rx="3" ry="5" fill="#3e8a21" />
                <ellipse cx="45" cy="70" rx="4" ry="6" fill="#4a9e2a" transform="rotate(-15,45,70)" />
                <ellipse cx="55" cy="70" rx="4" ry="6" fill="#4a9e2a" transform="rotate(15,55,70)" />
            </svg>`,
        2: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="75" rx="3" ry="10" fill="#3e8a21" />
                <ellipse cx="45" cy="70" rx="4" ry="8" fill="#4a9e2a" transform="rotate(-15,45,70)" />
                <ellipse cx="55" cy="70" rx="4" ry="8" fill="#4a9e2a" transform="rotate(15,55,70)" />
                <ellipse cx="40" cy="65" rx="4" ry="7" fill="#59b936" transform="rotate(-25,40,65)" />
                <ellipse cx="60" cy="65" rx="4" ry="7" fill="#59b936" transform="rotate(25,60,65)" />
                <ellipse cx="47" cy="60" rx="3" ry="6" fill="#59b936" transform="rotate(-10,47,60)" />
                <ellipse cx="53" cy="60" rx="3" ry="6" fill="#59b936" transform="rotate(10,53,60)" />
            </svg>`,
        3: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="70" rx="3" ry="15" fill="#3e8a21" />
                <ellipse cx="45" cy="65" rx="4" ry="10" fill="#4a9e2a" transform="rotate(-15,45,65)" />
                <ellipse cx="55" cy="65" rx="4" ry="10" fill="#4a9e2a" transform="rotate(15,55,65)" />
                <ellipse cx="40" cy="60" rx="4" ry="9" fill="#59b936" transform="rotate(-25,40,60)" />
                <ellipse cx="60" cy="60" rx="4" ry="9" fill="#59b936" transform="rotate(25,60,60)" />
                <ellipse cx="35" cy="55" rx="4" ry="8" fill="#59b936" transform="rotate(-35,35,55)" />
                <ellipse cx="65" cy="55" rx="4" ry="8" fill="#59b936" transform="rotate(35,65,55)" />
                <ellipse cx="45" cy="50" rx="3" ry="9" fill="#59b936" transform="rotate(-10,45,50)" />
                <ellipse cx="55" cy="50" rx="3" ry="9" fill="#59b936" transform="rotate(10,55,50)" />
                <ellipse cx="50" cy="45" rx="4" ry="8" fill="#59b936" />
            </svg>`,
        4: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="65" rx="3" ry="20" fill="#3e8a21" />
                <ellipse cx="45" cy="60" rx="4" ry="12" fill="#4a9e2a" transform="rotate(-15,45,60)" />
                <ellipse cx="55" cy="60" rx="4" ry="12" fill="#4a9e2a" transform="rotate(15,55,60)" />
                <ellipse cx="38" cy="55" rx="4" ry="11" fill="#59b936" transform="rotate(-25,38,55)" />
                <ellipse cx="62" cy="55" rx="4" ry="11" fill="#59b936" transform="rotate(25,62,55)" />
                <ellipse cx="32" cy="50" rx="4" ry="10" fill="#59b936" transform="rotate(-35,32,50)" />
                <ellipse cx="68" cy="50" rx="4" ry="10" fill="#59b936" transform="rotate(35,68,50)" />
                <ellipse cx="42" cy="45" rx="3" ry="11" fill="#59b936" transform="rotate(-10,42,45)" />
                <ellipse cx="58" cy="45" rx="3" ry="11" fill="#59b936" transform="rotate(10,58,45)" />
                <ellipse cx="50" cy="40" rx="4" ry="10" fill="#6ec445" />
                <ellipse cx="40" cy="38" rx="3" ry="6" fill="#6ec445" transform="rotate(-20,40,38)" />
                <ellipse cx="60" cy="38" rx="3" ry="6" fill="#6ec445" transform="rotate(20,60,38)" />
                <ellipse cx="46" cy="32" rx="3" ry="5" fill="#6ec445" transform="rotate(-10,46,32)" />
                <ellipse cx="54" cy="32" rx="3" ry="5" fill="#6ec445" transform="rotate(10,54,32)" />
                <circle cx="50" cy="30" r="2" fill="#8ef2c7" />
                <circle cx="46" cy="35" r="2" fill="#8ef2c7" />
                <circle cx="54" cy="35" r="2" fill="#8ef2c7" />
                <circle cx="43" cy="42" r="2" fill="#8ef2c7" />
                <circle cx="57" cy="42" r="2" fill="#8ef2c7" />
            </svg>`,
        5: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="65" rx="3" ry="20" fill="#3e8a21" />
                <ellipse cx="45" cy="60" rx="4" ry="12" fill="#999e2a" transform="rotate(-15,45,60)" />
                <ellipse cx="55" cy="60" rx="4" ry="12" fill="#999e2a" transform="rotate(15,55,60)" />
                <ellipse cx="38" cy="55" rx="4" ry="11" fill="#a9b936" transform="rotate(-25,38,55)" />
                <ellipse cx="62" cy="55" rx="4" ry="11" fill="#a9b936" transform="rotate(25,62,55)" />
                <ellipse cx="32" cy="50" rx="4" ry="10" fill="#a9b936" transform="rotate(-35,32,50)" />
                <ellipse cx="68" cy="50" rx="4" ry="10" fill="#a9b936" transform="rotate(35,68,50)" />
                <ellipse cx="42" cy="45" rx="3" ry="11" fill="#a9b936" transform="rotate(-10,42,45)" />
                <ellipse cx="58" cy="45" rx="3" ry="11" fill="#a9b936" transform="rotate(10,58,45)" />
                <ellipse cx="50" cy="40" rx="4" ry="10" fill="#c0c445" />
                <ellipse cx="40" cy="38" rx="3" ry="6" fill="#c0c445" transform="rotate(-20,40,38)" />
                <ellipse cx="60" cy="38" rx="3" ry="6" fill="#c0c445" transform="rotate(20,60,38)" />
                <ellipse cx="46" cy="32" rx="3" ry="5" fill="#c0c445" transform="rotate(-10,46,32)" />
                <ellipse cx="54" cy="32" rx="3" ry="5" fill="#c0c445" transform="rotate(10,54,32)" />
                <circle cx="50" cy="30" r="2" fill="#d6cb4a" />
                <circle cx="46" cy="35" r="2" fill="#d6cb4a" />
                <circle cx="54" cy="35" r="2" fill="#d6cb4a" />
            </svg>`,
        6: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <ellipse cx="50" cy="65" rx="3" ry="20" fill="#757168" />
                <ellipse cx="45" cy="60" rx="4" ry="12" fill="#696755" transform="rotate(-25,45,60)" />
                <ellipse cx="55" cy="60" rx="4" ry="12" fill="#696755" transform="rotate(25,55,60)" />
                <ellipse cx="38" cy="55" rx="4" ry="11" fill="#595845" transform="rotate(-35,38,55)" />
                <ellipse cx="62" cy="55" rx="4" ry="11" fill="#595845" transform="rotate(35,62,55)" />
                <ellipse cx="32" cy="50" rx="4" ry="10" fill="#595845" transform="rotate(-45,32,50)" />
                <ellipse cx="68" cy="50" rx="4" ry="10" fill="#595845" transform="rotate(45,68,50)" />
                <ellipse cx="42" cy="45" rx="3" ry="8" fill="#494939" transform="rotate(-15,42,45)" />
                <ellipse cx="58" cy="45" rx="3" ry="8" fill="#494939" transform="rotate(15,58,45)" />
                <ellipse cx="50" cy="40" rx="4" ry="8" fill="#494939" />
            </svg>`
    },
    
    // Vines - long, climbing stems with small leaves
    vine: {
        0: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 52,72 50,70" stroke="#3e8a21" stroke-width="3" fill="none" />
            </svg>`,
        1: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 55,70 50,65 Q 45,60 50,55" stroke="#3e8a21" stroke-width="3" fill="none" />
                <ellipse cx="54" cy="65" rx="3" ry="2" fill="#4a9e2a" transform="rotate(15,54,65)" />
                <ellipse cx="46" cy="55" rx="3" ry="2" fill="#4a9e2a" transform="rotate(-15,46,55)" />
            </svg>`,
        2: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 60,65 50,55 Q 40,45 50,35" stroke="#3e8a21" stroke-width="3" fill="none" />
                <path d="M 50,65 Q 55,60 60,62" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,55 Q 45,50 40,52" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,45 Q 55,40 60,42" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <ellipse cx="60" cy="62" rx="3" ry="2" fill="#59b936" transform="rotate(15,60,62)" />
                <ellipse cx="40" cy="52" rx="3" ry="2" fill="#59b936" transform="rotate(-15,40,52)" />
                <ellipse cx="60" cy="42" rx="3" ry="2" fill="#59b936" transform="rotate(15,60,42)" />
            </svg>`,
        3: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 65,60 50,45 Q 35,30 50,15" stroke="#3e8a21" stroke-width="3" fill="none" />
                <path d="M 50,65 Q 60,60 65,62" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,55 Q 40,50 35,52" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,45 Q 60,40 65,42" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,35 Q 40,30 35,32" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,25 Q 60,20 65,22" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <ellipse cx="65" cy="62" rx="4" ry="3" fill="#59b936" transform="rotate(15,65,62)" />
                <ellipse cx="35" cy="52" rx="4" ry="3" fill="#59b936" transform="rotate(-15,35,52)" />
                <ellipse cx="65" cy="42" rx="4" ry="3" fill="#59b936" transform="rotate(15,65,42)" />
                <ellipse cx="35" cy="32" rx="4" ry="3" fill="#59b936" transform="rotate(-15,35,32)" />
                <ellipse cx="65" cy="22" rx="4" ry="3" fill="#59b936" transform="rotate(15,65,22)" />
            </svg>`,
        4: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 70,55 50,35 Q 30,15 50,5" stroke="#3e8a21" stroke-width="3" fill="none" />
                <path d="M 50,65 Q 65,60 70,62" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,55 Q 35,50 30,52" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,45 Q 65,40 70,42" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,35 Q 35,30 30,32" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,25 Q 65,20 70,22" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <path d="M 50,15 Q 35,10 30,12" stroke="#4a9e2a" stroke-width="2" fill="none" />
                <ellipse cx="70" cy="62" rx="4" ry="3" fill="#59b936" transform="rotate(15,70,62)" />
                <ellipse cx="30" cy="52" rx="4" ry="3" fill="#59b936" transform="rotate(-15,30,52)" />
                <ellipse cx="70" cy="42" rx="4" ry="3" fill="#59b936" transform="rotate(15,70,42)" />
                <ellipse cx="30" cy="32" rx="4" ry="3" fill="#59b936" transform="rotate(-15,30,32)" />
                <ellipse cx="70" cy="22" rx="4" ry="3" fill="#59b936" transform="rotate(15,70,22)" />
                <ellipse cx="30" cy="12" rx="4" ry="3" fill="#59b936" transform="rotate(-15,30,12)" />
                <circle cx="70" cy="62" r="2" fill="#ff85a2" />
                <circle cx="70" cy="22" r="2" fill="#ff85a2" />
                <circle cx="30" cy="32" r="2" fill="#ff85a2" />
                <circle cx="50" cy="5" r="3" fill="#ff85a2" />
            </svg>`,
        5: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 70,55 50,35 Q 30,15 50,5" stroke="#3e8a21" stroke-width="3" fill="none" />
                <path d="M 50,65 Q 65,60 70,62" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <path d="M 50,55 Q 35,50 30,52" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <path d="M 50,45 Q 65,40 70,42" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <path d="M 50,35 Q 35,30 30,32" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <path d="M 50,25 Q 65,20 70,22" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <path d="M 50,15 Q 35,10 30,12" stroke="#8d9e2a" stroke-width="2" fill="none" />
                <ellipse cx="70" cy="62" rx="4" ry="3" fill="#a9b936" transform="rotate(15,70,62)" />
                <ellipse cx="30" cy="52" rx="4" ry="3" fill="#a9b936" transform="rotate(-15,30,52)" />
                <ellipse cx="70" cy="42" rx="4" ry="3" fill="#a9b936" transform="rotate(15,70,42)" />
                <ellipse cx="30" cy="32" rx="4" ry="3" fill="#a9b936" transform="rotate(-15,30,32)" />
                <ellipse cx="70" cy="22" rx="4" ry="3" fill="#a9b936" transform="rotate(15,70,22)" />
                <ellipse cx="30" cy="12" rx="4" ry="3" fill="#a9b936" transform="rotate(-15,30,12)" />
                <circle cx="70" cy="62" r="2" fill="#cc6680" />
                <circle cx="70" cy="22" r="2" fill="#cc6680" />
                <circle cx="30" cy="32" r="2" fill="#cc6680" />
            </svg>`,
        6: `<svg viewBox="0 0 100 100" class="plant-svg">
                <circle cx="50" cy="85" r="10" fill="#6c5f5b" />
                <path d="M 50,75 Q 70,55 50,35 Q 30,15 50,5" stroke="#7e7a65" stroke-width="3" fill="none" />
                <path d="M 50,65 Q 60,60 65,62" stroke="#595845" stroke-width="2" fill="none" />
                <path d="M 50,55 Q 40,50 35,52" stroke="#595845" stroke-width="2" fill="none" />
                <path d="M 50,45 Q 60,40 65,42" stroke="#595845" stroke-width="2" fill="none" />
                <path d="M 50,35 Q 40,30 35,32" stroke="#595845" stroke-width="2" fill="none" />
                <path d="M 50,25 Q 60,20 65,22" stroke="#595845" stroke-width="2" fill="none" />
                <path d="M 50,15 Q 40,10 35,12" stroke="#595845" stroke-width="2" fill="none" />
            </svg>`
    }
};

// Function to create enhanced plant with various animated effects
function createEnhancedPlant(type, stage, name, health) {
    // Default to succulent if type not found
    if (!window.enhancedPlantSvgs[type]) {
        type = 'succulent';
    }
    
    // Default to seed stage if stage not found
    if (!window.enhancedPlantSvgs[type][stage]) {
        stage = 0;
    }
    
    // Get the SVG string for this plant type and stage
    let svgString = window.enhancedPlantSvgs[type][stage];
    
    // Apply plant-type specific styles
    svgString = applyPlantTypeStyles(svgString, type, stage);
    
    return svgString;
}

// Apply specific styles based on plant type
function applyPlantTypeStyles(svgString, plantType, plantStage) {
    // Add CSS classes based on plant type
    let result = svgString.replace('class="plant-svg"', `class="plant-svg plant-${plantType} stage-${plantStage}"`);
    
    // Add additional styling based on type
    switch (plantType) {
        case 'succulent':
            // Add more rounded, water-filled appearance
            break;
        case 'flower':
            // Add taller, more elegant appearance
            break;
        case 'tree':
            // Add stronger, more robust appearance
            break;
        case 'herb':
            // Add bushy, aromatic appearance
            break;
        case 'vine':
            // Add climbing, winding appearance
            break;
    }
    
    return result;
}

// Function to add preset plants with different types for testing
function addPresetPlants(userId) {
    fetch('/api/plants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo Succulent',
            plant_type: 'succulent'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Added demo succulent:', data);
    })
    .catch(error => {
        console.error('Error adding demo succulent:', error);
    });
    
    fetch('/api/plants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo Flower',
            plant_type: 'flower'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Added demo flower:', data);
    })
    .catch(error => {
        console.error('Error adding demo flower:', error);
    });
    
    fetch('/api/plants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo Tree',
            plant_type: 'tree'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Added demo tree:', data);
    })
    .catch(error => {
        console.error('Error adding demo tree:', error);
    });
    
    fetch('/api/plants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo Herb',
            plant_type: 'herb'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Added demo herb:', data);
    })
    .catch(error => {
        console.error('Error adding demo herb:', error);
    });
    
    fetch('/api/plants', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: 'Demo Vine',
            plant_type: 'vine'
        })
    })
    .then(response => response.json())
    .then(data => {
        console.log('Added demo vine:', data);
    })
    .catch(error => {
        console.error('Error adding demo vine:', error);
    });
}

// Start random animations for all plants
function startRandomAnimations() {
    // This will be called on page load to initialize animations
    console.log('Starting random plant animations');
}