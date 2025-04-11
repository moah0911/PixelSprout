/**
 * API Test Script for PixelSprout
 * This file contains functions to test API endpoints
 */

// Test the plants API health endpoint
async function testPlantsAPIHealth() {
    try {
        const response = await fetch('/api/plants/health');
        const data = await response.json();
        console.log('Plants API Health Check:', data);
        return data;
    } catch (error) {
        console.error('Error testing plants API health:', error);
        return { status: 'error', message: error.message };
    }
}

// Test getting all plants
async function testGetPlants() {
    try {
        const response = await fetch('/api/plants');
        const data = await response.json();
        console.log('Get Plants Response:', data);
        return data;
    } catch (error) {
        console.error('Error getting plants:', error);
        return { status: 'error', message: error.message };
    }
}

// Test getting plant types
async function testGetPlantTypes() {
    try {
        const response = await fetch('/api/plant-types');
        const data = await response.json();
        console.log('Get Plant Types Response:', data);
        return data;
    } catch (error) {
        console.error('Error getting plant types:', error);
        return { status: 'error', message: error.message };
    }
}

// Test adding a plant
async function testAddPlant(name, type) {
    try {
        const response = await fetch('/api/plants', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, type })
        });
        const data = await response.json();
        console.log('Add Plant Response:', data);
        return data;
    } catch (error) {
        console.error('Error adding plant:', error);
        return { status: 'error', message: error.message };
    }
}

// Run all tests
async function runAllTests() {
    console.log('Running API tests...');
    
    // Test health endpoint
    await testPlantsAPIHealth();
    
    // Test getting plants
    await testGetPlants();
    
    // Test getting plant types
    await testGetPlantTypes();
    
    // Test adding a plant
    await testAddPlant('Test Plant', 'fern');
    
    console.log('API tests completed');
}

// Run tests when the page loads
document.addEventListener('DOMContentLoaded', function() {
    // Add a test button to the page
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.bottom = '20px';
    container.style.right = '20px';
    container.style.zIndex = '9999';
    
    const button = document.createElement('button');
    button.textContent = 'Test API';
    button.className = 'btn btn-sm btn-primary';
    button.onclick = runAllTests;
    
    container.appendChild(button);
    document.body.appendChild(container);
});