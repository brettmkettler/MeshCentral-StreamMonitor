/**
 * Example API Usage for MeshCentral Stream Monitor Plugin
 * 
 * This script demonstrates how to interact with the plugin's REST API
 */

const https = require('https');
const http = require('http');

// Configuration
const config = {
    meshcentralUrl: 'https://your-meshcentral-server.com',
    username: 'admin',
    password: 'your-password',
    deviceId: 'node//your-device-id-here'
};

/**
 * Make API request to MeshCentral
 */
async function apiRequest(method, path, data = null) {
    return new Promise((resolve, reject) => {
        const url = new URL(config.meshcentralUrl + path);
        const isHttps = url.protocol === 'https:';
        const client = isHttps ? https : http;
        
        const options = {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };
        
        const req = client.request(url, options, (res) => {
            let body = '';
            
            res.on('data', (chunk) => {
                body += chunk;
            });
            
            res.on('end', () => {
                try {
                    const response = JSON.parse(body);
                    resolve(response);
                } catch (err) {
                    resolve(body);
                }
            });
        });
        
        req.on('error', reject);
        
        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

/**
 * Start monitoring a device
 */
async function startMonitoring(deviceId) {
    console.log('Starting monitoring for device:', deviceId);
    
    try {
        const response = await apiRequest(
            'POST',
            '/pluginadmin.ashx/streammonitor/start',
            { deviceId: deviceId }
        );
        
        console.log('Response:', response);
        return response;
    } catch (err) {
        console.error('Error starting monitoring:', err.message);
    }
}

/**
 * Stop monitoring a device
 */
async function stopMonitoring(deviceId) {
    console.log('Stopping monitoring for device:', deviceId);
    
    try {
        const response = await apiRequest(
            'POST',
            '/pluginadmin.ashx/streammonitor/stop',
            { deviceId: deviceId }
        );
        
        console.log('Response:', response);
        return response;
    } catch (err) {
        console.error('Error stopping monitoring:', err.message);
    }
}

/**
 * Get monitoring status
 */
async function getStatus() {
    console.log('Getting monitoring status...');
    
    try {
        const response = await apiRequest(
            'GET',
            '/pluginadmin.ashx/streammonitor/status'
        );
        
        console.log('Status:', JSON.stringify(response, null, 2));
        return response;
    } catch (err) {
        console.error('Error getting status:', err.message);
    }
}

/**
 * Update plugin configuration
 */
async function updateConfig(newConfig) {
    console.log('Updating configuration...');
    
    try {
        const response = await apiRequest(
            'POST',
            '/pluginadmin.ashx/streammonitor/config',
            newConfig
        );
        
        console.log('Response:', response);
        return response;
    } catch (err) {
        console.error('Error updating config:', err.message);
    }
}

/**
 * Example: Monitor a device for 60 seconds
 */
async function monitorForDuration(deviceId, durationSeconds) {
    console.log(`Monitoring device ${deviceId} for ${durationSeconds} seconds...`);
    
    // Start monitoring
    await startMonitoring(deviceId);
    
    // Check status every 10 seconds
    const statusInterval = setInterval(async () => {
        await getStatus();
    }, 10000);
    
    // Stop after duration
    setTimeout(async () => {
        clearInterval(statusInterval);
        await stopMonitoring(deviceId);
        console.log('Monitoring completed');
    }, durationSeconds * 1000);
}

/**
 * Example: Update configuration
 */
async function exampleUpdateConfig() {
    await updateConfig({
        monitoringInterval: 10000,  // 10 seconds
        activityThreshold: 0.8,     // 80% confidence
        groqApiKey: 'your-new-api-key'  // Update API key
    });
}

// Main execution
async function main() {
    console.log('MeshCentral Stream Monitor - API Usage Examples\n');
    
    // Example 1: Get current status
    console.log('=== Example 1: Get Status ===');
    await getStatus();
    console.log('\n');
    
    // Example 2: Start monitoring
    console.log('=== Example 2: Start Monitoring ===');
    await startMonitoring(config.deviceId);
    console.log('\n');
    
    // Wait 5 seconds
    await new Promise(resolve => setTimeout(resolve, 5000));
    
    // Example 3: Check status again
    console.log('=== Example 3: Check Status After Start ===');
    await getStatus();
    console.log('\n');
    
    // Example 4: Update configuration
    console.log('=== Example 4: Update Configuration ===');
    await updateConfig({
        monitoringInterval: 15000,
        activityThreshold: 0.75
    });
    console.log('\n');
    
    // Example 5: Stop monitoring
    console.log('=== Example 5: Stop Monitoring ===');
    await stopMonitoring(config.deviceId);
    console.log('\n');
    
    console.log('Examples completed!');
}

// Run examples if executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export functions for use in other scripts
module.exports = {
    startMonitoring,
    stopMonitoring,
    getStatus,
    updateConfig,
    monitorForDuration
};
