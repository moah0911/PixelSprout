// Plant SVG representations for different growth stages
window.plantSvgs = {
    // Succulent plant SVGs
    succulent: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="60" r="10" fill="#8D6E63" />
            <line x1="50" y1="50" x2="50" y2="30" stroke="#A5D6A7" stroke-width="2"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="70" r="15" fill="#8D6E63" />
            <path d="M 50 70 L 50 45 C 50 35, 55 35, 55 45 C 55 35, 60 35, 60 45 L 60 55" fill="none" stroke="#81C784" stroke-width="3" />
            <path d="M 50 70 L 50 50 C 50 40, 45 40, 45 50 C 45 40, 40 40, 40 50 L 40 55" fill="none" stroke="#81C784" stroke-width="3" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="75" r="18" fill="#8D6E63" />
            <path d="M 50 75 L 50 40 C 50 30, 60 30, 60 40 C 60 30, 70 30, 70 40 L 70 55" fill="none" stroke="#66BB6A" stroke-width="4" />
            <path d="M 50 75 L 50 45 C 50 35, 40 35, 40 45 C 40 35, 30 35, 30 45 L 30 60" fill="none" stroke="#66BB6A" stroke-width="4" />
            <circle cx="70" cy="50" r="5" fill="#C5E1A5" />
            <circle cx="30" cy="55" r="5" fill="#C5E1A5" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="80" r="20" fill="#795548" />
            <path d="M 50 80 L 50 30 C 50 20, 65 20, 65 30 C 65 20, 80 20, 80 30 L 80 50" fill="none" stroke="#43A047" stroke-width="5" />
            <path d="M 50 80 L 50 35 C 50 25, 35 25, 35 35 C 35 25, 20 25, 20 35 L 20 55" fill="none" stroke="#43A047" stroke-width="5" />
            <circle cx="80" cy="45" r="8" fill="#AED581" />
            <circle cx="20" cy="50" r="8" fill="#AED581" />
            <circle cx="50" cy="40" r="8" fill="#AED581" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#5D4037" />
            <path d="M 50 85 L 50 25 C 50 15, 65 15, 65 25 C 65 15, 80 15, 80 25 L 80 45" fill="none" stroke="#2E7D32" stroke-width="5" />
            <path d="M 50 85 L 50 30 C 50 20, 35 20, 35 30 C 35 20, 20 20, 20 30 L 20 50" fill="none" stroke="#2E7D32" stroke-width="5" />
            <circle cx="80" cy="40" r="10" fill="#7CB342" />
            <circle cx="20" cy="45" r="10" fill="#7CB342" />
            <circle cx="50" cy="35" r="10" fill="#7CB342" />
            <circle cx="65" cy="25" r="6" fill="#E57373" />
            <circle cx="35" cy="30" r="6" fill="#E57373" />
            <circle cx="50" cy="20" r="8" fill="#EF5350" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#4E342E" />
            <path d="M 50 85 L 50 25 C 50 15, 65 15, 65 25 C 65 15, 80 15, 80 25 L 80 45" fill="none" stroke="#9E9D24" stroke-width="4" stroke-dasharray="5,2" />
            <path d="M 50 85 L 50 30 C 50 20, 35 20, 35 30 C 35 20, 20 20, 20 30 L 20 50" fill="none" stroke="#9E9D24" stroke-width="4" stroke-dasharray="5,2" />
            <circle cx="80" cy="40" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" />
            <circle cx="20" cy="45" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" />
            <circle cx="50" cy="35" r="8" fill="#C0CA33" stroke="#827717" stroke-width="1" />
            <circle cx="65" cy="25" r="5" fill="#FFAB91" stroke="#E64A19" stroke-width="1" />
            <circle cx="35" cy="30" r="5" fill="#FFAB91" stroke="#E64A19" stroke-width="1" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#3E2723" />
            <path d="M 50 85 L 50 35 C 50 30, 55 25, 60 30 L 70 25" fill="none" stroke="#827717" stroke-width="3" stroke-dasharray="4,3" />
            <path d="M 50 85 L 50 40 C 50 35, 45 30, 40 35 L 30 30" fill="none" stroke="#827717" stroke-width="3" stroke-dasharray="4,3" />
            <circle cx="70" cy="25" r="6" fill="#A1887F" stroke="#3E2723" stroke-width="1" />
            <circle cx="30" cy="30" r="6" fill="#A1887F" stroke="#3E2723" stroke-width="1" />
        </svg>`
    },
    
    // Flower plant SVGs
    flower: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="70" rx="8" ry="5" fill="#8D6E63" />
            <line x1="50" y1="65" x2="50" y2="55" stroke="#DCEDC8" stroke-width="1"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="75" rx="12" ry="8" fill="#8D6E63" />
            <path d="M 50 75 L 50 50" stroke="#AED581" stroke-width="2" />
            <path d="M 50 55 C 45 50, 55 45, 50 40" stroke="#AED581" stroke-width="2" fill="none" />
            <path d="M 50 55 C 55 50, 45 45, 50 40" stroke="#AED581" stroke-width="2" fill="none" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="80" rx="15" ry="10" fill="#795548" />
            <path d="M 50 80 L 50 40" stroke="#7CB342" stroke-width="3" />
            <path d="M 50 50 C 40 45, 60 35, 50 30" stroke="#7CB342" stroke-width="3" fill="none" />
            <path d="M 50 50 C 60 45, 40 35, 50 30" stroke="#7CB342" stroke-width="3" fill="none" />
            <path d="M 50 60 C 40 55, 30 60, 35 65" stroke="#7CB342" stroke-width="2" fill="none" />
            <path d="M 50 60 C 60 55, 70 60, 65 65" stroke="#7CB342" stroke-width="2" fill="none" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#5D4037" />
            <path d="M 50 85 L 50 30" stroke="#558B2F" stroke-width="4" />
            <path d="M 50 45 C 40 40, 30 30, 40 25" stroke="#558B2F" stroke-width="3" fill="none" />
            <path d="M 50 45 C 60 40, 70 30, 60 25" stroke="#558B2F" stroke-width="3" fill="none" />
            <path d="M 50 60 C 40 55, 25 60, 30 70" stroke="#558B2F" stroke-width="3" fill="none" />
            <path d="M 50 60 C 60 55, 75 60, 70 70" stroke="#558B2F" stroke-width="3" fill="none" />
            <circle cx="50" cy="30" r="8" fill="#C5E1A5" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#4E342E" />
            <path d="M 50 85 L 50 25" stroke="#33691E" stroke-width="4" />
            <path d="M 50 45 C 40 40, 30 30, 40 25" stroke="#33691E" stroke-width="3" fill="none" />
            <path d="M 50 45 C 60 40, 70 30, 60 25" stroke="#33691E" stroke-width="3" fill="none" />
            <path d="M 50 60 C 40 55, 25 60, 30 70" stroke="#33691E" stroke-width="3" fill="none" />
            <path d="M 50 60 C 60 55, 75 60, 70 70" stroke="#33691E" stroke-width="3" fill="none" />
            <circle cx="50" cy="25" r="12" fill="#EC407A" />
            <circle cx="50" cy="25" r="5" fill="#FFF59D" />
            <path d="M 42 17 C 46 21, 54 21, 58 17" stroke="#EC407A" stroke-width="3" fill="none" />
            <path d="M 42 33 C 46 29, 54 29, 58 33" stroke="#EC407A" stroke-width="3" fill="none" />
            <path d="M 42 25 C 38 21, 38 29, 42 25" stroke="#EC407A" stroke-width="3" fill="none" />
            <path d="M 58 25 C 62 21, 62 29, 58 25" stroke="#EC407A" stroke-width="3" fill="none" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#3E2723" />
            <path d="M 50 85 L 50 30" stroke="#827717" stroke-width="3" stroke-dasharray="5,2" />
            <path d="M 50 45 C 40 40, 35 35, 40 30" stroke="#827717" stroke-width="2" fill="none" stroke-dasharray="3,2" />
            <path d="M 50 45 C 60 40, 65 35, 60 30" stroke="#827717" stroke-width="2" fill="none" stroke-dasharray="3,2" />
            <path d="M 50 60 C 40 55, 35 65, 40 70" stroke="#827717" stroke-width="2" fill="none" stroke-dasharray="3,2" />
            <path d="M 50 60 C 60 55, 65 65, 60 70" stroke="#827717" stroke-width="2" fill="none" stroke-dasharray="3,2" />
            <circle cx="50" cy="30" r="10" fill="#E57373" stroke="#C62828" stroke-width="1" />
            <path d="M 45 30 L 55 30" stroke="#C62828" stroke-width="1" />
            <path d="M 50 25 L 50 35" stroke="#C62828" stroke-width="1" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="15" ry="8" fill="#3E2723" />
            <path d="M 50 85 L 47 50 L 50 40 L 53 50 L 50 85" fill="#795548" stroke="#5D4037" stroke-width="1" />
            <path d="M 47 60 C 40 55, 35 60, 38 65" stroke="#795548" stroke-width="1" fill="none" />
            <path d="M 53 65 C 60 60, 65 65, 62 70" stroke="#795548" stroke-width="1" fill="none" />
            <circle cx="50" cy="40" r="8" fill="#A1887F" stroke="#3E2723" stroke-width="1" />
        </svg>`
    },
    
    // Tree plant SVGs
    tree: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="70" rx="10" ry="6" fill="#795548" />
            <line x1="50" y1="64" x2="50" y2="55" stroke="#A5D6A7" stroke-width="2"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="75" rx="15" ry="8" fill="#795548" />
            <rect x="48" y="50" width="4" height="25" fill="#8D6E63" />
            <ellipse cx="50" cy="40" rx="12" ry="15" fill="#81C784" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="80" rx="20" ry="10" fill="#5D4037" />
            <rect x="45" y="40" width="10" height="40" fill="#8D6E63" />
            <ellipse cx="50" cy="30" rx="18" ry="20" fill="#66BB6A" />
            <ellipse cx="35" cy="40" rx="10" ry="12" fill="#66BB6A" />
            <ellipse cx="65" cy="40" rx="10" ry="12" fill="#66BB6A" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="25" ry="10" fill="#4E342E" />
            <rect x="43" y="30" width="14" height="55" fill="#795548" />
            <ellipse cx="50" cy="25" rx="25" ry="20" fill="#43A047" />
            <ellipse cx="30" cy="35" rx="15" ry="12" fill="#43A047" />
            <ellipse cx="70" cy="35" rx="15" ry="12" fill="#43A047" />
            <path d="M 35 55 L 43 55" stroke="#795548" stroke-width="2" />
            <path d="M 57 45 L 65 45" stroke="#795548" stroke-width="2" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="25" ry="10" fill="#3E2723" />
            <rect x="42" y="25" width="16" height="60" fill="#5D4037" />
            <ellipse cx="50" cy="20" rx="30" ry="20" fill="#2E7D32" />
            <ellipse cx="25" cy="30" rx="18" ry="15" fill="#2E7D32" />
            <ellipse cx="75" cy="30" rx="18" ry="15" fill="#2E7D32" />
            <path d="M 30 55 L 42 55" stroke="#5D4037" stroke-width="3" />
            <path d="M 58 45 L 70 45" stroke="#5D4037" stroke-width="3" />
            <circle cx="40" cy="20" r="3" fill="#E57373" />
            <circle cx="60" cy="15" r="3" fill="#E57373" />
            <circle cx="50" cy="10" r="3" fill="#E57373" />
            <circle cx="75" cy="25" r="3" fill="#E57373" />
            <circle cx="25" cy="25" r="3" fill="#E57373" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="25" ry="10" fill="#3E2723" />
            <rect x="42" y="25" width="16" height="60" fill="#4E342E" />
            <ellipse cx="50" cy="20" rx="30" ry="20" fill="#9E9D24" stroke="#827717" stroke-width="1" />
            <ellipse cx="25" cy="30" rx="18" ry="15" fill="#9E9D24" stroke="#827717" stroke-width="1" />
            <ellipse cx="75" cy="30" rx="18" ry="15" fill="#9E9D24" stroke="#827717" stroke-width="1" />
            <path d="M 30 55 L 42 55" stroke="#4E342E" stroke-width="3" />
            <path d="M 58 45 L 70 45" stroke="#4E342E" stroke-width="3" />
            <path d="M 35 20 L 45 20" stroke="#827717" stroke-width="1" />
            <path d="M 55 20 L 65 20" stroke="#827717" stroke-width="1" />
            <path d="M 25 30 L 35 30" stroke="#827717" stroke-width="1" />
            <path d="M 65 30 L 75 30" stroke="#827717" stroke-width="1" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="20" ry="8" fill="#3E2723" />
            <path d="M 40 85 L 40 30 L 45 25 L 55 25 L 60 30 L 60 85" fill="#4E342E" stroke="#3E2723" stroke-width="1" />
            <path d="M 40 50 L 30 40" stroke="#4E342E" stroke-width="2" fill="none" />
            <path d="M 60 60 L 70 50" stroke="#4E342E" stroke-width="2" fill="none" />
            <path d="M 60 40 L 65 30" stroke="#4E342E" stroke-width="2" fill="none" />
            <path d="M 40 70 L 35 60" stroke="#4E342E" stroke-width="2" fill="none" />
        </svg>`
    },
    
    // Herb plant SVGs
    herb: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="70" rx="8" ry="5" fill="#8D6E63" />
            <line x1="50" y1="65" x2="50" y2="60" stroke="#C5E1A5" stroke-width="1"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="75" rx="10" ry="6" fill="#8D6E63" />
            <line x1="50" y1="75" x2="50" y2="55" stroke="#A5D6A7" stroke-width="2"/>
            <ellipse cx="45" cy="55" rx="5" ry="8" fill="#C5E1A5" transform="rotate(-20, 45, 55)" />
            <ellipse cx="55" cy="50" rx="5" ry="8" fill="#C5E1A5" transform="rotate(20, 55, 50)" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="80" rx="15" ry="8" fill="#795548" />
            <line x1="50" y1="80" x2="50" y2="45" stroke="#7CB342" stroke-width="2"/>
            <ellipse cx="40" cy="55" rx="6" ry="10" fill="#AED581" transform="rotate(-20, 40, 55)" />
            <ellipse cx="60" cy="50" rx="6" ry="10" fill="#AED581" transform="rotate(20, 60, 50)" />
            <ellipse cx="45" cy="40" rx="6" ry="10" fill="#AED581" transform="rotate(-10, 45, 40)" />
            <ellipse cx="55" cy="35" rx="6" ry="10" fill="#AED581" transform="rotate(10, 55, 35)" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#5D4037" />
            <line x1="50" y1="85" x2="50" y2="35" stroke="#558B2F" stroke-width="3"/>
            <ellipse cx="35" cy="55" rx="7" ry="12" fill="#8BC34A" transform="rotate(-25, 35, 55)" />
            <ellipse cx="65" cy="50" rx="7" ry="12" fill="#8BC34A" transform="rotate(25, 65, 50)" />
            <ellipse cx="40" cy="35" rx="7" ry="12" fill="#8BC34A" transform="rotate(-15, 40, 35)" />
            <ellipse cx="60" cy="30" rx="7" ry="12" fill="#8BC34A" transform="rotate(15, 60, 30)" />
            <ellipse cx="50" cy="25" rx="7" ry="10" fill="#8BC34A" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#4E342E" />
            <line x1="50" y1="85" x2="50" y2="30" stroke="#33691E" stroke-width="3"/>
            <ellipse cx="30" cy="55" rx="8" ry="15" fill="#689F38" transform="rotate(-25, 30, 55)" />
            <ellipse cx="70" cy="50" rx="8" ry="15" fill="#689F38" transform="rotate(25, 70, 50)" />
            <ellipse cx="35" cy="35" rx="8" ry="15" fill="#689F38" transform="rotate(-15, 35, 35)" />
            <ellipse cx="65" cy="30" rx="8" ry="15" fill="#689F38" transform="rotate(15, 65, 30)" />
            <ellipse cx="50" cy="20" rx="8" ry="12" fill="#689F38" />
            <circle cx="50" cy="20" r="5" fill="#9575CD" />
            <circle cx="30" cy="45" r="4" fill="#9575CD" />
            <circle cx="70" cy="40" r="4" fill="#9575CD" />
            <circle cx="35" cy="30" r="4" fill="#9575CD" />
            <circle cx="65" cy="25" r="4" fill="#9575CD" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#3E2723" />
            <line x1="50" y1="85" x2="50" y2="35" stroke="#827717" stroke-width="2" stroke-dasharray="4,2"/>
            <ellipse cx="35" cy="55" rx="7" ry="12" fill="#AFB42B" transform="rotate(-30, 35, 55)" stroke="#827717" stroke-width="1" />
            <ellipse cx="65" cy="50" rx="7" ry="12" fill="#AFB42B" transform="rotate(30, 65, 50)" stroke="#827717" stroke-width="1" />
            <ellipse cx="40" cy="35" rx="7" ry="12" fill="#AFB42B" transform="rotate(-20, 40, 35)" stroke="#827717" stroke-width="1" />
            <ellipse cx="60" cy="30" rx="7" ry="12" fill="#AFB42B" transform="rotate(20, 60, 30)" stroke="#827717" stroke-width="1" />
            <ellipse cx="50" cy="25" rx="7" ry="10" fill="#AFB42B" stroke="#827717" stroke-width="1" />
            <circle cx="50" cy="25" r="4" fill="#FFCC80" stroke="#EF6C00" stroke-width="1" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="15" ry="8" fill="#3E2723" />
            <line x1="50" y1="85" x2="50" y2="40" stroke="#5D4037" stroke-width="2" stroke-dasharray="5,3"/>
            <path d="M 50 60 L 35 50" stroke="#5D4037" stroke-width="1" fill="none" />
            <path d="M 50 60 L 65 50" stroke="#5D4037" stroke-width="1" fill="none" />
            <path d="M 50 50 L 40 40" stroke="#5D4037" stroke-width="1" fill="none" />
            <path d="M 50 50 L 60 40" stroke="#5D4037" stroke-width="1" fill="none" />
            <path d="M 50 40 L 45 30" stroke="#5D4037" stroke-width="1" fill="none" />
            <path d="M 50 40 L 55 30" stroke="#5D4037" stroke-width="1" fill="none" />
        </svg>`
    },
    
    // Vine plant SVGs
    vine: {
        // Stage 0: Seed
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="70" rx="8" ry="5" fill="#8D6E63" />
            <line x1="50" y1="65" x2="50" y2="55" stroke="#DCEDC8" stroke-width="1"/>
        </svg>`,
        
        // Stage 1: Sprout
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="75" rx="12" ry="7" fill="#8D6E63" />
            <path d="M 50 75 C 50 65, 50 55, 55 50" stroke="#C5E1A5" stroke-width="2" fill="none" />
            <ellipse cx="58" cy="50" rx="5" ry="3" fill="#DCEDC8" transform="rotate(45, 58, 50)" />
        </svg>`,
        
        // Stage 2: Growing
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="80" rx="15" ry="8" fill="#795548" />
            <path d="M 50 80 C 50 70, 50 60, 60 55 C 70 50, 65 40, 55 35" stroke="#AED581" stroke-width="3" fill="none" />
            <ellipse cx="58" cy="55" rx="6" ry="4" fill="#C5E1A5" transform="rotate(45, 58, 55)" />
            <ellipse cx="55" cy="35" rx="6" ry="4" fill="#C5E1A5" transform="rotate(10, 55, 35)" />
        </svg>`,
        
        // Stage 3: Mature
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#5D4037" />
            <path d="M 50 85 C 50 75, 50 65, 65 60 C 80 55, 70 40, 55 35 C 40 30, 45 15, 60 15" stroke="#8BC34A" stroke-width="4" fill="none" />
            <ellipse cx="65" cy="60" rx="8" ry="5" fill="#AED581" transform="rotate(45, 65, 60)" />
            <ellipse cx="55" cy="35" rx="8" ry="5" fill="#AED581" transform="rotate(10, 55, 35)" />
            <ellipse cx="60" cy="15" rx="8" ry="5" fill="#AED581" transform="rotate(0, 60, 15)" />
        </svg>`,
        
        // Stage 4: Flowering
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#4E342E" />
            <path d="M 50 85 C 50 75, 50 65, 70 60 C 90 55, 75 40, 60 35 C 45 30, 50 15, 70 10" stroke="#7CB342" stroke-width="4" fill="none" />
            <ellipse cx="70" cy="60" rx="10" ry="6" fill="#9CCC65" transform="rotate(45, 70, 60)" />
            <ellipse cx="60" cy="35" rx="10" ry="6" fill="#9CCC65" transform="rotate(10, 60, 35)" />
            <ellipse cx="70" cy="10" rx="10" ry="6" fill="#9CCC65" transform="rotate(0, 70, 10)" />
            <circle cx="75" cy="60" r="5" fill="#FFEB3B" />
            <circle cx="65" cy="35" r="5" fill="#FFEB3B" />
            <circle cx="75" cy="10" r="5" fill="#FFEB3B" />
        </svg>`,
        
        // Stage 5: Withering
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="18" ry="10" fill="#3E2723" />
            <path d="M 50 85 C 50 75, 50 65, 70 60 C 90 55, 75 40, 60 35 C 45 30, 50 15, 70 10" stroke="#9E9D24" stroke-width="3" fill="none" stroke-dasharray="5,2" />
            <ellipse cx="70" cy="60" rx="8" ry="5" fill="#C0CA33" transform="rotate(45, 70, 60)" stroke="#827717" stroke-width="1" />
            <ellipse cx="60" cy="35" rx="8" ry="5" fill="#C0CA33" transform="rotate(10, 60, 35)" stroke="#827717" stroke-width="1" />
            <ellipse cx="70" cy="10" rx="8" ry="5" fill="#C0CA33" transform="rotate(0, 70, 10)" stroke="#827717" stroke-width="1" />
            <path d="M 65 60 L 75 60" stroke="#827717" stroke-width="1" />
            <path d="M 55 35 L 65 35" stroke="#827717" stroke-width="1" />
            <path d="M 65 10 L 75 10" stroke="#827717" stroke-width="1" />
        </svg>`,
        
        // Stage 6: Dead
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <ellipse cx="50" cy="85" rx="15" ry="8" fill="#3E2723" />
            <path d="M 50 85 C 50 75, 50 65, 65 62 C 80 58, 70 45, 60 40 C 50 35, 55 25, 65 20" stroke="#5D4037" stroke-width="2" fill="none" stroke-dasharray="4,3" />
            <path d="M 60 62 L 70 62" stroke="#5D4037" stroke-width="1" />
            <path d="M 55 40 L 65 40" stroke="#5D4037" stroke-width="1" />
            <path d="M 60 20 L 70 20" stroke="#5D4037" stroke-width="1" />
        </svg>`
    },
    
    // Default plant fallback
    default: {
        0: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="60" r="10" fill="#8D6E63" />
            <line x1="50" y1="50" x2="50" y2="30" stroke="#A5D6A7" stroke-width="2"/>
        </svg>`,
        
        1: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="70" r="15" fill="#8D6E63" />
            <path d="M 50 70 L 50 40 C 50 30, 60 30, 60 40" fill="none" stroke="#81C784" stroke-width="3" />
        </svg>`,
        
        2: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="75" r="18" fill="#795548" />
            <path d="M 50 75 L 50 30 C 50 20, 65 20, 65 30 C 65 20, 80 20, 80 30" fill="none" stroke="#66BB6A" stroke-width="4" />
        </svg>`,
        
        3: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="80" r="20" fill="#5D4037" />
            <path d="M 50 80 L 50 20 C 50 10, 65 10, 65 20 C 65 10, 80 10, 80 20 L 80 30" fill="none" stroke="#43A047" stroke-width="5" />
        </svg>`,
        
        4: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#4E342E" />
            <path d="M 50 85 L 50 15 C 50 5, 65 5, 65 15 C 65 5, 80 5, 80 15 L 80 25" fill="none" stroke="#2E7D32" stroke-width="5" />
            <circle cx="65" cy="15" r="6" fill="#E57373" />
            <circle cx="80" cy="20" r="6" fill="#E57373" />
        </svg>`,
        
        5: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#3E2723" />
            <path d="M 50 85 L 50 20 C 50 10, 65 10, 65 20 C 65 10, 80 10, 80 20" fill="none" stroke="#827717" stroke-width="4" stroke-dasharray="5,2" />
        </svg>`,
        
        6: `<svg viewBox="0 0 100 100" width="80" height="80">
            <circle cx="50" cy="85" r="15" fill="#3E2723" />
            <path d="M 50 85 L 50 30 C 50 25, 55 20, 60 25 L 70 20" fill="none" stroke="#5D4037" stroke-width="3" stroke-dasharray="4,3" />
        </svg>`
    }
};
