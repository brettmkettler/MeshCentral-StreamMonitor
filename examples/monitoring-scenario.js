/**
 * Real-World Monitoring Scenario Example
 * 
 * This example demonstrates a complete monitoring workflow:
 * - Monitor multiple devices
 * - Handle activity alerts
 * - Generate reports
 * - Implement custom logic
 */

const fs = require('fs');
const path = require('path');

/**
 * Monitoring Manager
 * Orchestrates monitoring of multiple devices with custom logic
 */
class MonitoringManager {
    constructor(config) {
        this.config = {
            meshcentralUrl: config.meshcentralUrl || 'http://localhost',
            devices: config.devices || [],
            alertThreshold: config.alertThreshold || 0.8,
            reportInterval: config.reportInterval || 60000, // 1 minute
            logFile: config.logFile || './monitoring.log',
            ...config
        };
        
        this.activities = [];
        this.deviceStats = new Map();
        this.alertHandlers = [];
    }
    
    /**
     * Start monitoring all configured devices
     */
    async startAll() {
        console.log(`Starting monitoring for ${this.config.devices.length} devices...`);
        
        for (const deviceId of this.config.devices) {
            await this.startDevice(deviceId);
            this.deviceStats.set(deviceId, {
                startTime: Date.now(),
                activityCount: 0,
                lastActivity: null
            });
        }
        
        // Start periodic reporting
        this.reportInterval = setInterval(() => {
            this.generateReport();
        }, this.config.reportInterval);
        
        console.log('✓ All devices monitoring started');
    }
    
    /**
     * Start monitoring a single device
     */
    async startDevice(deviceId) {
        try {
            const response = await fetch(
                `${this.config.meshcentralUrl}/pluginadmin.ashx/streammonitor/start`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId })
                }
            );
            
            const result = await response.json();
            console.log(`✓ Started monitoring: ${deviceId}`);
            return result;
            
        } catch (err) {
            console.error(`✗ Failed to start monitoring ${deviceId}:`, err.message);
        }
    }
    
    /**
     * Stop monitoring all devices
     */
    async stopAll() {
        console.log('Stopping all monitoring...');
        
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
        }
        
        for (const deviceId of this.config.devices) {
            await this.stopDevice(deviceId);
        }
        
        // Generate final report
        this.generateReport(true);
        
        console.log('✓ All monitoring stopped');
    }
    
    /**
     * Stop monitoring a single device
     */
    async stopDevice(deviceId) {
        try {
            await fetch(
                `${this.config.meshcentralUrl}/pluginadmin.ashx/streammonitor/stop`,
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ deviceId })
                }
            );
            
            console.log(`✓ Stopped monitoring: ${deviceId}`);
            
        } catch (err) {
            console.error(`✗ Failed to stop monitoring ${deviceId}:`, err.message);
        }
    }
    
    /**
     * Register an alert handler
     */
    onAlert(handler) {
        this.alertHandlers.push(handler);
    }
    
    /**
     * Handle incoming activity alert
     */
    handleActivity(activity) {
        this.activities.push(activity);
        
        // Update device stats
        const stats = this.deviceStats.get(activity.deviceId);
        if (stats) {
            stats.activityCount++;
            stats.lastActivity = activity;
        }
        
        // Log activity
        this.logActivity(activity);
        
        // Trigger alerts if threshold exceeded
        if (activity.confidence >= this.config.alertThreshold) {
            this.triggerAlert(activity);
        }
    }
    
    /**
     * Trigger alert handlers
     */
    triggerAlert(activity) {
        console.log(`🚨 ALERT: High-confidence activity detected on ${activity.deviceId}`);
        console.log(`   Confidence: ${(activity.confidence * 100).toFixed(1)}%`);
        console.log(`   Description: ${activity.description.substring(0, 100)}...`);
        
        // Call all registered alert handlers
        this.alertHandlers.forEach(handler => {
            try {
                handler(activity);
            } catch (err) {
                console.error('Alert handler error:', err.message);
            }
        });
    }
    
    /**
     * Log activity to file
     */
    logActivity(activity) {
        const logEntry = {
            timestamp: new Date(activity.timestamp).toISOString(),
            deviceId: activity.deviceId,
            confidence: activity.confidence,
            description: activity.description
        };
        
        const logLine = JSON.stringify(logEntry) + '\n';
        
        fs.appendFile(this.config.logFile, logLine, (err) => {
            if (err) {
                console.error('Failed to write log:', err.message);
            }
        });
    }
    
    /**
     * Generate monitoring report
     */
    generateReport(isFinal = false) {
        const reportType = isFinal ? 'FINAL REPORT' : 'PERIODIC REPORT';
        console.log(`\n${'='.repeat(60)}`);
        console.log(`${reportType} - ${new Date().toISOString()}`);
        console.log('='.repeat(60));
        
        // Overall statistics
        console.log('\nOverall Statistics:');
        console.log(`  Total Activities: ${this.activities.length}`);
        console.log(`  Monitored Devices: ${this.deviceStats.size}`);
        
        // Per-device statistics
        console.log('\nPer-Device Statistics:');
        this.deviceStats.forEach((stats, deviceId) => {
            const uptime = ((Date.now() - stats.startTime) / 1000 / 60).toFixed(1);
            console.log(`\n  Device: ${deviceId}`);
            console.log(`    Uptime: ${uptime} minutes`);
            console.log(`    Activities: ${stats.activityCount}`);
            if (stats.lastActivity) {
                console.log(`    Last Activity: ${new Date(stats.lastActivity.timestamp).toLocaleString()}`);
                console.log(`    Last Confidence: ${(stats.lastActivity.confidence * 100).toFixed(1)}%`);
            }
        });
        
        // Recent high-confidence activities
        const highConfidence = this.activities
            .filter(a => a.confidence >= this.config.alertThreshold)
            .slice(-5);
        
        if (highConfidence.length > 0) {
            console.log('\nRecent High-Confidence Activities:');
            highConfidence.forEach((activity, i) => {
                console.log(`\n  ${i + 1}. ${new Date(activity.timestamp).toLocaleString()}`);
                console.log(`     Device: ${activity.deviceId}`);
                console.log(`     Confidence: ${(activity.confidence * 100).toFixed(1)}%`);
                console.log(`     Description: ${activity.description.substring(0, 80)}...`);
            });
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }
    
    /**
     * Get current status from plugin
     */
    async getStatus() {
        try {
            const response = await fetch(
                `${this.config.meshcentralUrl}/pluginadmin.ashx/streammonitor/status`
            );
            
            return await response.json();
            
        } catch (err) {
            console.error('Failed to get status:', err.message);
            return null;
        }
    }
}

/**
 * Example: Monitor suspicious activity
 */
async function monitorSuspiciousActivity() {
    const manager = new MonitoringManager({
        meshcentralUrl: 'http://localhost',
        devices: [
            'node//device1',
            'node//device2',
            'node//device3'
        ],
        alertThreshold: 0.75,
        reportInterval: 30000 // 30 seconds
    });
    
    // Register alert handler for suspicious activity
    manager.onAlert((activity) => {
        // Check for suspicious keywords
        const suspiciousKeywords = [
            'password', 'credential', 'bank', 'credit card',
            'social security', 'unauthorized', 'suspicious'
        ];
        
        const description = activity.description.toLowerCase();
        const hasSuspiciousContent = suspiciousKeywords.some(
            keyword => description.includes(keyword)
        );
        
        if (hasSuspiciousContent) {
            console.log('⚠️  SUSPICIOUS ACTIVITY DETECTED!');
            console.log('   Sending notification...');
            // Send email, webhook, etc.
        }
    });
    
    // Start monitoring
    await manager.startAll();
    
    // Run for 5 minutes
    setTimeout(async () => {
        await manager.stopAll();
    }, 5 * 60 * 1000);
}

/**
 * Example: Monitor work hours activity
 */
async function monitorWorkHours() {
    const manager = new MonitoringManager({
        meshcentralUrl: 'http://localhost',
        devices: ['node//employee-device'],
        alertThreshold: 0.6,
        reportInterval: 60000 // 1 minute
    });
    
    // Track activity during work hours
    manager.onAlert((activity) => {
        const now = new Date();
        const hour = now.getHours();
        
        // Check if outside work hours (9 AM - 5 PM)
        if (hour < 9 || hour >= 17) {
            console.log('📅 Activity detected outside work hours');
            console.log(`   Time: ${now.toLocaleString()}`);
            console.log(`   Device: ${activity.deviceId}`);
        }
    });
    
    await manager.startAll();
}

/**
 * Example: Monitor multiple locations
 */
async function monitorMultipleLocations() {
    const locations = {
        'office': ['node//office-pc1', 'node//office-pc2'],
        'remote': ['node//remote-worker1', 'node//remote-worker2'],
        'lab': ['node//lab-station1']
    };
    
    const managers = {};
    
    // Create manager for each location
    for (const [location, devices] of Object.entries(locations)) {
        managers[location] = new MonitoringManager({
            meshcentralUrl: 'http://localhost',
            devices: devices,
            alertThreshold: 0.7,
            logFile: `./logs/${location}-monitoring.log`
        });
        
        // Location-specific alert handling
        managers[location].onAlert((activity) => {
            console.log(`📍 Activity in ${location.toUpperCase()}`);
            console.log(`   Device: ${activity.deviceId}`);
            console.log(`   Confidence: ${(activity.confidence * 100).toFixed(1)}%`);
        });
        
        await managers[location].startAll();
    }
    
    // Generate combined report every 2 minutes
    setInterval(() => {
        console.log('\n' + '='.repeat(60));
        console.log('MULTI-LOCATION REPORT');
        console.log('='.repeat(60));
        
        for (const [location, manager] of Object.entries(managers)) {
            console.log(`\n${location.toUpperCase()}:`);
            console.log(`  Devices: ${manager.config.devices.length}`);
            console.log(`  Activities: ${manager.activities.length}`);
        }
        
        console.log('\n' + '='.repeat(60) + '\n');
    }, 2 * 60 * 1000);
}

/**
 * Example: Custom analysis with webhooks
 */
async function monitorWithWebhooks() {
    const manager = new MonitoringManager({
        meshcentralUrl: 'http://localhost',
        devices: ['node//monitored-device'],
        alertThreshold: 0.8
    });
    
    // Send webhook on high-confidence activity
    manager.onAlert(async (activity) => {
        const webhookUrl = 'https://your-webhook-endpoint.com/alerts';
        
        try {
            await fetch(webhookUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    type: 'activity_alert',
                    deviceId: activity.deviceId,
                    timestamp: activity.timestamp,
                    confidence: activity.confidence,
                    description: activity.description
                })
            });
            
            console.log('✓ Webhook sent successfully');
            
        } catch (err) {
            console.error('✗ Webhook failed:', err.message);
        }
    });
    
    await manager.startAll();
}

// Main execution
async function main() {
    console.log('MeshCentral Stream Monitor - Monitoring Scenarios\n');
    
    const scenario = process.argv[2] || 'suspicious';
    
    switch (scenario) {
        case 'suspicious':
            console.log('Running: Suspicious Activity Monitoring\n');
            await monitorSuspiciousActivity();
            break;
            
        case 'workhours':
            console.log('Running: Work Hours Monitoring\n');
            await monitorWorkHours();
            break;
            
        case 'locations':
            console.log('Running: Multi-Location Monitoring\n');
            await monitorMultipleLocations();
            break;
            
        case 'webhooks':
            console.log('Running: Webhook Integration\n');
            await monitorWithWebhooks();
            break;
            
        default:
            console.log('Available scenarios:');
            console.log('  node monitoring-scenario.js suspicious  # Monitor suspicious activity');
            console.log('  node monitoring-scenario.js workhours   # Monitor work hours');
            console.log('  node monitoring-scenario.js locations   # Multi-location monitoring');
            console.log('  node monitoring-scenario.js webhooks    # Webhook integration');
    }
}

// Run if executed directly
if (require.main === module) {
    main().catch(console.error);
}

// Export for use in other scripts
module.exports = {
    MonitoringManager,
    monitorSuspiciousActivity,
    monitorWorkHours,
    monitorMultipleLocations,
    monitorWithWebhooks
};
