/** 
* @description MeshCentral Stream Monitor Plugin - AI-powered activity monitoring
* @author Brett Kettler
* @copyright 
* @license Apache-2.0
* @version v0.1.0
*/

"use strict";

module.exports.streammonitor = function (parent) {
    var obj = {};
    obj.parent = parent;
    obj.meshServer = parent.parent;
    obj.fs = require('fs');
    obj.path = require('path');
    obj.VIEWS = __dirname + '/views/';
    
    // Settings file path
    obj.settingsPath = obj.path.join(__dirname, 'settings.json');
    
    // Default configuration with hardcoded values
    obj.defaultConfig = {
        groqApiKey: 'gsk_****',
        groqModel: 'meta-llama/llama-4-scout-17b-16e-instruct',
        groqEnabled: true,
        monitoringInterval: 5000,
        screenshotQuality: 80,
        maxConcurrentAnalysis: 3,
        enableLogging: true,
        activityThreshold: 0.7,
        analysisPrompt: '',
        temperature: 0.3,
        maxTokens: 500
    };
    
    // Current configuration (loaded from file or defaults)
    obj.config = { ...obj.defaultConfig, monitoredDevices: new Set() };
    
    // State management
    obj.activeMonitors = new Map(); // deviceId -> monitor state
    obj.analysisQueue = [];
    obj.groqClient = null;
    
    // Export functions to Web UI
    obj.exports = [
        "startMonitoring",
        "stopMonitoring",
        "getMonitorStatus",
        "updateConfig"
    ];
    
    /**
     * Load settings from file
     */
    obj.loadSettings = function() {
        try {
            if (obj.fs.existsSync(obj.settingsPath)) {
                const data = obj.fs.readFileSync(obj.settingsPath, 'utf8');
                const savedSettings = JSON.parse(data);
                obj.config = { ...obj.defaultConfig, ...savedSettings, monitoredDevices: new Set() };
                obj.log('Settings loaded from file');
                return true;
            } else {
                obj.log('No settings file found, using defaults');
                return false;
            }
        } catch (err) {
            obj.log('Error loading settings: ' + err.message, 'error');
            return false;
        }
    };
    
    /**
     * Save settings to file
     */
    obj.saveSettings = function(newSettings) {
        try {
            // Merge with current config
            const settingsToSave = { ...obj.config, ...newSettings };
            delete settingsToSave.monitoredDevices; // Don't save the Set
            
            obj.fs.writeFileSync(obj.settingsPath, JSON.stringify(settingsToSave, null, 2), 'utf8');
            
            // Update current config
            obj.config = { ...obj.config, ...newSettings };
            
            // Reinitialize Groq if API key changed
            if (newSettings.groqApiKey) {
                obj.initGroq();
            }
            
            obj.log('Settings saved successfully');
            return true;
        } catch (err) {
            obj.log('Error saving settings: ' + err.message, 'error');
            return false;
        }
    };
    
    /**
     * Initialize Groq client
     */
    obj.initGroq = function() {
        if (!obj.config.groqEnabled) {
            obj.log('Groq analysis is disabled in settings');
            return;
        }
        
        if (!obj.config.groqApiKey || obj.config.groqApiKey === 'gsk_****') {
            obj.log('Groq API key not configured. Please replace the placeholder in streammonitor.js line 22 with your actual API key.', 'warn');
            return;
        }
        
        try {
            const Groq = require('groq-sdk');
            obj.groqClient = new Groq({
                apiKey: obj.config.groqApiKey
            });
            obj.log('Groq client initialized successfully with model: ' + obj.config.groqModel);
        } catch (err) {
            obj.log('Error initializing Groq client: ' + err.message, 'error');
            obj.log('Make sure groq-sdk is installed: npm install groq-sdk', 'error');
        }
    };
    
    /**
     * Server startup hook
     */
    obj.server_startup = function() {
        try {
            obj.log('Stream Monitor Plugin starting up...');
            obj.log('Plugin directory: ' + __dirname);
            
            // Load settings from file
            obj.loadSettings();
            
            // Initialize Groq if configured
            obj.initGroq();
            
            // Setup HTTP handlers for plugin API
            obj.setupHttpHandlers();
            
            obj.log('Stream Monitor Plugin started successfully');
        } catch (err) {
            obj.log('FATAL ERROR during plugin startup: ' + err.message, 'error');
            obj.log('Stack trace: ' + err.stack, 'error');
            throw err; // Re-throw to let MeshCentral know the plugin failed
        }
    };
    
    /**
     * Setup HTTP handlers for plugin API endpoints
     */
    obj.setupHttpHandlers = function() {
        // Admin panel view
        obj.meshServer.webserver.app.get('/pluginadmin.ashx', function(req, res) {
            if (req.query.pin === 'streammonitor') {
                res.render(obj.VIEWS + 'admin', {});
            }
        });
        
        // API endpoint for starting monitoring
        obj.meshServer.webserver.app.post('/pluginadmin.ashx/streammonitor/start', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            const deviceId = req.body.deviceId;
            if (!deviceId) {
                res.status(400).json({ error: 'Device ID required' });
                return;
            }
            
            obj.startMonitoringDevice(deviceId);
            res.json({ success: true, message: 'Monitoring started for device: ' + deviceId });
        });
        
        // API endpoint for stopping monitoring
        obj.meshServer.webserver.app.post('/pluginadmin.ashx/streammonitor/stop', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            const deviceId = req.body.deviceId;
            if (!deviceId) {
                res.status(400).json({ error: 'Device ID required' });
                return;
            }
            
            obj.stopMonitoringDevice(deviceId);
            res.json({ success: true, message: 'Monitoring stopped for device: ' + deviceId });
        });
        
        // API endpoint for getting monitor status
        obj.meshServer.webserver.app.get('/pluginadmin.ashx/streammonitor/status', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            const status = obj.getMonitoringStatus();
            res.json(status);
        });
        
        // API endpoint for updating configuration
        obj.meshServer.webserver.app.post('/pluginadmin.ashx/streammonitor/config', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            obj.updatePluginConfig(req.body);
            res.json({ success: true, message: 'Configuration updated' });
        });
        
        // API endpoint for getting settings
        obj.meshServer.webserver.app.get('/pluginadmin.ashx/streammonitor/settings', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            // Return settings without exposing full API key
            const safeSettings = { ...obj.config };
            if (safeSettings.groqApiKey) {
                safeSettings.groqApiKey = safeSettings.groqApiKey.substring(0, 10) + '...' + safeSettings.groqApiKey.slice(-4);
            }
            delete safeSettings.monitoredDevices;
            
            res.json({ success: true, settings: safeSettings });
        });
        
        // API endpoint for saving settings
        obj.meshServer.webserver.app.post('/pluginadmin.ashx/streammonitor/settings', function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            const success = obj.saveSettings(req.body);
            if (success) {
                res.json({ success: true, message: 'Settings saved successfully' });
            } else {
                res.status(500).json({ success: false, error: 'Failed to save settings' });
            }
        });
        
        // API endpoint for testing Groq connection
        obj.meshServer.webserver.app.post('/pluginadmin.ashx/streammonitor/test-groq', async function(req, res) {
            if (!obj.checkAuth(req, res)) return;
            
            const { apiKey, model } = req.body;
            
            if (!apiKey) {
                res.status(400).json({ success: false, error: 'API key required' });
                return;
            }
            
            try {
                const Groq = require('groq-sdk');
                const testClient = new Groq({ apiKey: apiKey });
                
                // Test with a simple completion
                const completion = await testClient.chat.completions.create({
                    model: model || 'llama-3.2-90b-vision-preview',
                    messages: [
                        {
                            role: 'user',
                            content: 'Reply with just "OK" if you can read this.'
                        }
                    ],
                    max_tokens: 10
                });
                
                if (completion && completion.choices && completion.choices.length > 0) {
                    res.json({ 
                        success: true, 
                        message: 'Connection successful',
                        model: completion.model
                    });
                } else {
                    res.json({ success: false, error: 'Invalid response from Groq API' });
                }
            } catch (err) {
                obj.log('Groq test failed: ' + err.message, 'error');
                res.json({ success: false, error: err.message });
            }
        });
    };
    
    /**
     * Check authentication for API requests
     */
    obj.checkAuth = function(req, res) {
        if (!req.session || !req.session.userid) {
            res.status(401).json({ error: 'Unauthorized' });
            return false;
        }
        return true;
    };
    
    /**
     * Start monitoring a device
     */
    obj.startMonitoringDevice = function(deviceId) {
        if (obj.activeMonitors.has(deviceId)) {
            obj.log('Device ' + deviceId + ' is already being monitored');
            return;
        }
        
        const monitorState = {
            deviceId: deviceId,
            startTime: Date.now(),
            captureCount: 0,
            analysisCount: 0,
            lastActivity: null,
            interval: null,
            isActive: true
        };
        
        // Start periodic screenshot capture and analysis
        monitorState.interval = setInterval(() => {
            obj.captureAndAnalyze(deviceId, monitorState);
        }, obj.config.monitoringInterval);
        
        obj.activeMonitors.set(deviceId, monitorState);
        obj.config.monitoredDevices.add(deviceId);
        
        obj.log('Started monitoring device: ' + deviceId);
    };
    
    /**
     * Stop monitoring a device
     */
    obj.stopMonitoringDevice = function(deviceId) {
        const monitorState = obj.activeMonitors.get(deviceId);
        
        if (!monitorState) {
            obj.log('Device ' + deviceId + ' is not being monitored');
            return;
        }
        
        if (monitorState.interval) {
            clearInterval(monitorState.interval);
        }
        
        monitorState.isActive = false;
        obj.activeMonitors.delete(deviceId);
        obj.config.monitoredDevices.delete(deviceId);
        
        obj.log('Stopped monitoring device: ' + deviceId);
    };
    
    /**
     * Capture screenshot and analyze with Groq
     */
    obj.captureAndAnalyze = async function(deviceId, monitorState) {
        if (!obj.groqClient) {
            obj.log('Groq client not initialized. Skipping analysis.', 'warn');
            return;
        }
        
        try {
            monitorState.captureCount++;
            
            // Request screenshot from device
            // Note: This requires the device to have desktop access enabled
            const screenshot = await obj.requestScreenshot(deviceId);
            
            if (!screenshot) {
                obj.log('Failed to capture screenshot from device: ' + deviceId, 'warn');
                return;
            }
            
            // Analyze with Groq
            const analysis = await obj.analyzeWithGroq(screenshot, deviceId);
            
            if (analysis) {
                monitorState.analysisCount++;
                monitorState.lastActivity = analysis;
                
                // Report significant activity
                if (analysis.confidence >= obj.config.activityThreshold) {
                    obj.reportActivity(deviceId, analysis);
                }
            }
            
        } catch (err) {
            obj.log('Error in captureAndAnalyze for device ' + deviceId + ': ' + err.message, 'error');
        }
    };
    
    /**
     * Request screenshot from device
     * This is a placeholder - actual implementation depends on MeshCentral's desktop relay
     */
    obj.requestScreenshot = async function(deviceId) {
        // TODO: Implement actual screenshot capture via MeshCentral desktop relay
        // This would involve:
        // 1. Establishing a desktop connection to the device
        // 2. Capturing a frame from the stream
        // 3. Converting to base64 or buffer
        
        obj.log('Screenshot capture requested for device: ' + deviceId);
        
        // Placeholder return
        return null;
    };
    
    /**
     * Analyze screenshot with Groq multimodal LLM
     */
    obj.analyzeWithGroq = async function(screenshot, deviceId) {
        if (!obj.groqClient) {
            return null;
        }
        
        try {
            // Convert screenshot to base64 if needed
            const imageBase64 = Buffer.isBuffer(screenshot) 
                ? screenshot.toString('base64') 
                : screenshot;
            
            // Default prompt if none configured
            const defaultPrompt = "Analyze this screenshot and describe any significant activity, user interactions, or notable content. Focus on: 1) What applications or windows are visible, 2) What actions the user appears to be taking, 3) Any suspicious or unusual activity, 4) Overall activity level (low/medium/high). Provide a confidence score (0-1) for your analysis.";
            
            const promptText = obj.config.analysisPrompt || defaultPrompt;
            
            // Use configured Groq vision model
            const completion = await obj.groqClient.chat.completions.create({
                model: obj.config.groqModel || "llama-3.2-90b-vision-preview",
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: promptText
                            },
                            {
                                type: "image_url",
                                image_url: {
                                    url: `data:image/jpeg;base64,${imageBase64}`
                                }
                            }
                        ]
                    }
                ],
                temperature: obj.config.temperature || 0.3,
                max_tokens: obj.config.maxTokens || 500
            });
            
            const response = completion.choices[0]?.message?.content || '';
            
            // Parse response and extract confidence
            const analysis = {
                timestamp: Date.now(),
                deviceId: deviceId,
                description: response,
                confidence: obj.extractConfidence(response),
                rawResponse: response
            };
            
            obj.log('Analysis completed for device ' + deviceId + ' (confidence: ' + analysis.confidence + ')');
            
            return analysis;
            
        } catch (err) {
            obj.log('Error analyzing with Groq: ' + err.message, 'error');
            return null;
        }
    };
    
    /**
     * Extract confidence score from analysis response
     */
    obj.extractConfidence = function(response) {
        // Try to extract confidence score from response
        const confidenceMatch = response.match(/confidence[:\s]+([0-9.]+)/i);
        if (confidenceMatch) {
            return parseFloat(confidenceMatch[1]);
        }
        
        // Default confidence based on response length and keywords
        const keywords = ['suspicious', 'unusual', 'active', 'interaction', 'activity'];
        const keywordCount = keywords.filter(k => response.toLowerCase().includes(k)).length;
        
        return Math.min(0.5 + (keywordCount * 0.1), 1.0);
    };
    
    /**
     * Report significant activity
     */
    obj.reportActivity = function(deviceId, analysis) {
        const report = {
            type: 'activity_detected',
            deviceId: deviceId,
            timestamp: analysis.timestamp,
            description: analysis.description,
            confidence: analysis.confidence
        };
        
        // Log to console
        obj.log('ACTIVITY DETECTED on ' + deviceId + ': ' + analysis.description);
        
        // Store in database or send notification
        obj.storeActivityReport(report);
        
        // Emit event to connected web clients
        obj.notifyWebClients(report);
    };
    
    /**
     * Store activity report
     */
    obj.storeActivityReport = function(report) {
        // TODO: Implement database storage
        // Could use MeshCentral's database or a separate storage
        obj.log('Activity report stored: ' + JSON.stringify(report));
    };
    
    /**
     * Notify web clients of activity
     */
    obj.notifyWebClients = function(report) {
        // TODO: Implement WebSocket notification to connected clients
        // This would use MeshCentral's existing WebSocket infrastructure
        obj.log('Notifying web clients of activity');
    };
    
    /**
     * Get monitoring status for all devices
     */
    obj.getMonitoringStatus = function() {
        const status = {
            activeMonitors: [],
            totalDevices: obj.activeMonitors.size,
            groqInitialized: !!obj.groqClient,
            config: {
                monitoringInterval: obj.config.monitoringInterval,
                activityThreshold: obj.config.activityThreshold
            }
        };
        
        obj.activeMonitors.forEach((state, deviceId) => {
            status.activeMonitors.push({
                deviceId: deviceId,
                startTime: state.startTime,
                captureCount: state.captureCount,
                analysisCount: state.analysisCount,
                lastActivity: state.lastActivity ? {
                    timestamp: state.lastActivity.timestamp,
                    confidence: state.lastActivity.confidence,
                    description: state.lastActivity.description.substring(0, 100) + '...'
                } : null
            });
        });
        
        return status;
    };
    
    /**
     * Update plugin configuration
     */
    obj.updatePluginConfig = function(newConfig) {
        if (newConfig.groqApiKey) {
            obj.config.groqApiKey = newConfig.groqApiKey;
            obj.initGroq();
        }
        
        if (newConfig.monitoringInterval) {
            obj.config.monitoringInterval = parseInt(newConfig.monitoringInterval);
        }
        
        if (newConfig.activityThreshold !== undefined) {
            obj.config.activityThreshold = parseFloat(newConfig.activityThreshold);
        }
        
        obj.log('Configuration updated');
    };
    
    /**
     * Logging utility
     */
    obj.log = function(message, level = 'info') {
        if (!obj.config.enableLogging && level === 'info') return;
        
        const timestamp = new Date().toISOString();
        const prefix = '[StreamMonitor] ';
        
        switch(level) {
            case 'error':
                console.error(prefix + timestamp + ' ERROR: ' + message);
                break;
            case 'warn':
                console.warn(prefix + timestamp + ' WARN: ' + message);
                break;
            default:
                console.log(prefix + timestamp + ' ' + message);
        }
    };
    
    /**
     * Web UI functions (exported)
     */
    obj.startMonitoring = function(deviceId) {
        obj.startMonitoringDevice(deviceId);
    };
    
    obj.stopMonitoring = function(deviceId) {
        obj.stopMonitoringDevice(deviceId);
    };
    
    obj.getMonitorStatus = function() {
        return obj.getMonitoringStatus();
    };
    
    obj.updateConfig = function(config) {
        obj.updatePluginConfig(config);
    };
    
    /**
     * Hook: Agent core is stable (device connected)
     */
    obj.hook_agentCoreIsStable = function(device) {
        obj.log('Device connected: ' + device.nodeid);
        
        // Auto-start monitoring if device was previously monitored
        if (obj.config.monitoredDevices.has(device.nodeid)) {
            obj.startMonitoringDevice(device.nodeid);
        }
    };
    
    /**
     * Cleanup on plugin unload
     */
    obj.cleanup = function() {
        obj.log('Cleaning up Stream Monitor Plugin...');
        
        // Stop all active monitors
        obj.activeMonitors.forEach((state, deviceId) => {
            obj.stopMonitoringDevice(deviceId);
        });
        
        obj.log('Stream Monitor Plugin cleaned up');
    };
    
    return obj;
};
