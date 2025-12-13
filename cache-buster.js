/**
 * Cache Busting Utility
 * Automatically checks for version updates and forces cache refresh
 */

(function() {
    'use strict';
    
    const VERSION_FILE = 'version.json';
    const VERSION_KEY = 'site_version';
    const CHECK_INTERVAL = 60000; // Check every 60 seconds
    const FORCE_RELOAD_DELAY = 2000; // Wait 2 seconds before reloading
    
    let versionCheckInterval = null;
    
    /**
     * Fetch current version from server
     */
    async function fetchCurrentVersion() {
        try {
            const response = await fetch(VERSION_FILE + '?t=' + Date.now());
            if (!response.ok) {
                console.warn('Could not fetch version file');
                return null;
            }
            const data = await response.json();
            return data.version;
        } catch (error) {
            console.warn('Error fetching version:', error);
            return null;
        }
    }
    
    /**
     * Get stored version from localStorage
     */
    function getStoredVersion() {
        try {
            return localStorage.getItem(VERSION_KEY);
        } catch (error) {
            console.warn('Error reading stored version:', error);
            return null;
        }
    }
    
    /**
     * Store version in localStorage
     */
    function storeVersion(version) {
        try {
            localStorage.setItem(VERSION_KEY, version);
        } catch (error) {
            console.warn('Error storing version:', error);
        }
    }
    
    /**
     * Check if version has changed and reload if needed
     */
    async function checkVersion() {
        const currentVersion = await fetchCurrentVersion();
        if (!currentVersion) return; // Skip if we can't fetch version
        
        const storedVersion = getStoredVersion();
        
        // If no stored version, store current and continue
        if (!storedVersion) {
            storeVersion(currentVersion);
            return;
        }
        
        // If versions differ, reload the page
        if (currentVersion !== storedVersion) {
            console.log('New version detected! Reloading page...');
            console.log('Old version:', storedVersion);
            console.log('New version:', currentVersion);
            
            // Show update notification
            showUpdateNotification();
            
            // Store new version
            storeVersion(currentVersion);
            
            // Reload after a short delay
            setTimeout(() => {
                // Clear all caches if possible
                if ('caches' in window) {
                    caches.keys().then(names => {
                        names.forEach(name => {
                            caches.delete(name);
                        });
                    });
                }
                
                // Force reload with cache bypass
                window.location.reload(true);
            }, FORCE_RELOAD_DELAY);
        }
    }
    
    /**
     * Show update notification to user
     */
    function showUpdateNotification() {
        // Remove existing notification if any
        const existing = document.getElementById('version-update-notification');
        if (existing) {
            existing.remove();
        }
        
        // Create notification element
        const notification = document.createElement('div');
        notification.id = 'version-update-notification';
        notification.innerHTML = `
            <div class="version-update-content">
                <i class="fas fa-sync-alt fa-spin"></i>
                <span>New version available! Updating...</span>
            </div>
        `;
        
        // Add styles if not already added
        if (!document.getElementById('version-update-styles')) {
            const style = document.createElement('style');
            style.id = 'version-update-styles';
            style.textContent = `
                #version-update-notification {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    color: white;
                    padding: 16px 24px;
                    text-align: center;
                    z-index: 99999;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    animation: slideDown 0.3s ease-out;
                }
                @keyframes slideDown {
                    from {
                        transform: translateY(-100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateY(0);
                        opacity: 1;
                    }
                }
                .version-update-content {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 12px;
                    font-size: 15px;
                    font-weight: 600;
                }
                .version-update-content i {
                    font-size: 18px;
                }
            `;
            document.head.appendChild(style);
        }
        
        document.body.appendChild(notification);
    }
    
    /**
     * Initialize version checking
     */
    function init() {
        // Check immediately on load
        checkVersion();
        
        // Set up periodic checking
        versionCheckInterval = setInterval(checkVersion, CHECK_INTERVAL);
        
        // Also check when page becomes visible (user switches back to tab)
        document.addEventListener('visibilitychange', function() {
            if (!document.hidden) {
                checkVersion();
            }
        });
        
        // Check on focus
        window.addEventListener('focus', checkVersion);
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
    
    // Export for manual checking if needed
    window.checkVersionUpdate = checkVersion;
})();

