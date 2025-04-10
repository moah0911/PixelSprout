/**
 * Supabase Storage JavaScript Client
 * Handles file uploads to Supabase Storage
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize file upload elements
    initializeFileUploads();
});

/**
 * Initialize file upload elements
 */
function initializeFileUploads() {
    // Profile picture upload
    const profilePictureInput = document.getElementById('profile-picture-input');
    if (profilePictureInput) {
        profilePictureInput.addEventListener('change', handleProfilePictureUpload);
    }
    
    // Plant image upload
    const plantImageInputs = document.querySelectorAll('.plant-image-input');
    plantImageInputs.forEach(input => {
        input.addEventListener('change', handlePlantImageUpload);
    });
    
    // Generic file upload
    const fileUploadInput = document.getElementById('file-upload-input');
    if (fileUploadInput) {
        fileUploadInput.addEventListener('change', handleFileUpload);
    }
}

/**
 * Handle profile picture upload
 * @param {Event} event - The change event
 */
async function handleProfilePictureUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
        showError('Please select an image file');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size should be less than 5MB');
        return;
    }
    
    try {
        // Show loading state
        const profilePicturePreview = document.getElementById('profile-picture-preview');
        if (profilePicturePreview) {
            profilePicturePreview.innerHTML = '<div class="spinner-border text-success" role="status"><span class="visually-hidden">Loading...</span></div>';
        }
        
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        // Upload to server
        const response = await fetch('/api/storage/profile-picture', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_data: base64Data
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccess('Profile picture uploaded successfully');
            
            // Update profile picture preview
            if (profilePicturePreview) {
                profilePicturePreview.innerHTML = `<img src="${data.file_url}" class="img-fluid rounded-circle" alt="Profile Picture">`;
            }
            
            // Update profile picture in the UI
            const profilePictures = document.querySelectorAll('.profile-picture');
            profilePictures.forEach(img => {
                img.src = data.file_url;
            });
        } else {
            showError(data.message || 'Failed to upload profile picture');
        }
    } catch (error) {
        console.error('Profile picture upload error:', error);
        showError('An error occurred while uploading the profile picture');
    }
}

/**
 * Handle plant image upload
 * @param {Event} event - The change event
 */
async function handlePlantImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.match('image.*')) {
        showError('Please select an image file');
        return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
        showError('File size should be less than 5MB');
        return;
    }
    
    // Get plant ID from data attribute
    const plantId = event.target.dataset.plantId;
    if (!plantId) {
        showError('Plant ID not found');
        return;
    }
    
    try {
        // Show loading state
        const plantImagePreview = document.getElementById(`plant-image-preview-${plantId}`);
        if (plantImagePreview) {
            plantImagePreview.innerHTML = '<div class="spinner-border text-success" role="status"><span class="visually-hidden">Loading...</span></div>';
        }
        
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        // Upload to server
        const response = await fetch(`/api/storage/plant-image/${plantId}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_data: base64Data
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccess('Plant image uploaded successfully');
            
            // Update plant image preview
            if (plantImagePreview) {
                plantImagePreview.innerHTML = `<img src="${data.file_url}" class="img-fluid rounded" alt="Plant Image">`;
            }
            
            // Update plant image in the UI
            const plantImages = document.querySelectorAll(`.plant-image-${plantId}`);
            plantImages.forEach(img => {
                img.src = data.file_url;
            });
        } else {
            showError(data.message || 'Failed to upload plant image');
        }
    } catch (error) {
        console.error('Plant image upload error:', error);
        showError('An error occurred while uploading the plant image');
    }
}

/**
 * Handle generic file upload
 * @param {Event} event - The change event
 */
async function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
        showError('File size should be less than 10MB');
        return;
    }
    
    try {
        // Show loading state
        const fileUploadPreview = document.getElementById('file-upload-preview');
        if (fileUploadPreview) {
            fileUploadPreview.innerHTML = '<div class="spinner-border text-success" role="status"><span class="visually-hidden">Loading...</span></div>';
        }
        
        // Convert file to base64
        const base64Data = await fileToBase64(file);
        
        // Upload to server
        const response = await fetch('/api/storage/upload', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                file_data: base64Data,
                file_name: file.name
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            // Show success message
            showSuccess('File uploaded successfully');
            
            // Update file upload preview
            if (fileUploadPreview) {
                if (file.type.match('image.*')) {
                    fileUploadPreview.innerHTML = `<img src="${data.file_url}" class="img-fluid rounded" alt="Uploaded Image">`;
                } else {
                    fileUploadPreview.innerHTML = `<a href="${data.file_url}" target="_blank" class="btn btn-success">View Uploaded File</a>`;
                }
            }
        } else {
            showError(data.message || 'Failed to upload file');
        }
    } catch (error) {
        console.error('File upload error:', error);
        showError('An error occurred while uploading the file');
    }
}

/**
 * Convert a file to base64
 * @param {File} file - The file to convert
 * @returns {Promise<string>} - A promise that resolves to the base64 data
 */
function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = error => reject(error);
    });
}

/**
 * Show an error message
 * @param {string} message - The error message
 */
function showError(message) {
    const errorElement = document.getElementById('error-message');
    if (errorElement) {
        errorElement.textContent = message;
        errorElement.classList.remove('d-none');
        
        // Hide after 5 seconds
        setTimeout(() => {
            errorElement.classList.add('d-none');
        }, 5000);
    } else {
        alert(message);
    }
}

/**
 * Show a success message
 * @param {string} message - The success message
 */
function showSuccess(message) {
    const successElement = document.getElementById('success-message');
    if (successElement) {
        successElement.textContent = message;
        successElement.classList.remove('d-none');
        
        // Hide after 5 seconds
        setTimeout(() => {
            successElement.classList.add('d-none');
        }, 5000);
    } else {
        alert(message);
    }
}