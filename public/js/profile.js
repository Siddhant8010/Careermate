// Profile Page JavaScript - CRUD Operations

// Toggle between view and edit mode
function toggleEditMode() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (viewMode && editMode) {
        viewMode.style.display = 'none';
        editMode.style.display = 'block';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Cancel edit and return to view mode
function cancelEdit() {
    const viewMode = document.getElementById('viewMode');
    const editMode = document.getElementById('editMode');
    
    if (viewMode && editMode) {
        viewMode.style.display = 'block';
        editMode.style.display = 'none';
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// Handle profile form submission (UPDATE)
const profileForm = document.getElementById('profileForm');
if (profileForm) {
    profileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData.entries());
        
        // Remove empty password fields
        if (!data.currentPassword) delete data.currentPassword;
        if (!data.newPassword) delete data.newPassword;
        
        try {
            const response = await fetch('/api/profile/update', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('✅ Profile updated successfully!', 'success');
                
                // Update view mode with new data
                updateViewMode(data);
                
                // Switch back to view mode after delay
                setTimeout(() => {
                    cancelEdit();
                }, 1500);
            } else {
                showNotification('❌ ' + (result.message || 'Failed to update profile'), 'error');
            }
        } catch (error) {
            console.error('Error updating profile:', error);
            showNotification('❌ An error occurred. Please try again.', 'error');
        }
    });
}

// Update view mode with new data
function updateViewMode(data) {
    const elements = {
        displayName: data.username,
        displayEmail: data.email,
        viewUsername: data.username,
        viewEmail: data.email,
        viewPhone: data.phone || 'Not set',
        viewDob: data.dob ? new Date(data.dob).toLocaleDateString() : 'Not set',
        viewGender: data.gender || 'Not set',
        viewCity: data.city || 'Not set',
        viewTenthPercentage: data.tenthPercentage ? data.tenthPercentage + '%' : 'Not set',
        viewBoard: data.board || 'Not set',
        viewInterest: data.interest || 'Not set'
    };
    
    Object.keys(elements).forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = elements[id];
        }
    });
}

// Show delete confirmation modal
function confirmDelete() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.add('show');
    }
}

// Close delete modal
function closeDeleteModal() {
    const modal = document.getElementById('deleteModal');
    if (modal) {
        modal.classList.remove('show');
    }
}

// Delete account (DELETE)
async function deleteAccount() {
    if (!confirm('Are you absolutely sure? This action cannot be undone!')) {
        return;
    }
    
    try {
        const response = await fetch('/api/profile/delete', {
            method: 'DELETE'
        });
        
        const result = await response.json();
        
        if (response.ok) {
            showNotification('✅ Account deleted successfully. Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 2000);
        } else {
            showNotification('❌ ' + (result.message || 'Failed to delete account'), 'error');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        showNotification('❌ An error occurred. Please try again.', 'error');
    }
}

// Handle avatar upload
const avatarInput = document.getElementById('avatarInput');
if (avatarInput) {
    avatarInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // Validate file type
        if (!file.type.startsWith('image/')) {
            showNotification('❌ Please select an image file', 'error');
            return;
        }
        
        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            showNotification('❌ Image size must be less than 5MB', 'error');
            return;
        }
        
        // Preview image
        const reader = new FileReader();
        reader.onload = (e) => {
            const avatar = document.getElementById('profileAvatar');
            if (avatar) {
                avatar.src = e.target.result;
            }
        };
        reader.readAsDataURL(file);
        
        // Upload to server
        const formData = new FormData();
        formData.append('avatar', file);
        
        try {
            const response = await fetch('/api/profile/upload-avatar', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (response.ok) {
                showNotification('✅ Avatar updated successfully!', 'success');
            } else {
                showNotification('❌ ' + (result.message || 'Failed to upload avatar'), 'error');
            }
        } catch (error) {
            console.error('Error uploading avatar:', error);
            showNotification('❌ An error occurred. Please try again.', 'error');
        }
    });
}

// Show notification
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    if (!notification) return;
    
    notification.textContent = message;
    notification.className = `notification ${type} show`;
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    const modal = document.getElementById('deleteModal');
    if (e.target === modal) {
        closeDeleteModal();
    }
});

// Form validation
const inputs = document.querySelectorAll('input[type="tel"]');
inputs.forEach(input => {
    if (input.name === 'phone') {
        input.addEventListener('input', (e) => {
            // Allow only numbers
            e.target.value = e.target.value.replace(/[^0-9]/g, '');
            // Limit to 10 digits
            if (e.target.value.length > 10) {
                e.target.value = e.target.value.slice(0, 10);
            }
        });
    }
});

// Password strength indicator (optional enhancement)
const newPasswordInput = document.getElementById('newPassword');
if (newPasswordInput) {
    newPasswordInput.addEventListener('input', (e) => {
        const password = e.target.value;
        if (password.length > 0 && password.length < 6) {
            e.target.style.borderColor = '#E74C3C';
        } else if (password.length >= 6) {
            e.target.style.borderColor = '#4caf50';
        } else {
            e.target.style.borderColor = '';
        }
    });
}

console.log('✅ Profile page loaded successfully');
