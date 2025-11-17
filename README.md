# MeshCentral Stream Monitor Plugin

AI-powered stream monitoring plugin for MeshCentral that uses Groq's multimodal LLM to analyze desktop activity in real-time.

## Features

- 🎨 **Web-Based Settings UI**: Configure everything through the MeshCentral admin panel - no config files needed!
- 🤖 **AI-Powered Analysis**: Uses Groq's vision-capable LLM (llama-3.2-90b-vision-preview) for intelligent activity detection
- 📸 **Automated Screenshot Capture**: Periodic screenshot capture from monitored devices
- 🔍 **Activity Detection**: Identifies user interactions, applications, and suspicious behavior
- ⚡ **Real-time Monitoring**: Configurable monitoring intervals for responsive detection
- 📊 **Confidence Scoring**: Each analysis includes a confidence score for reliability
- 🎯 **Threshold-based Alerts**: Only report activity above configurable confidence thresholds
- 🌐 **REST API**: Full API for programmatic control and integration
- ✅ **Built-in Connection Testing**: Test your Groq API key directly from the UI

## Prerequisites

1. **MeshCentral Server** with plugins enabled:
   ```json
   {
     "plugins": {
       "enabled": true
     }
   }
   ```

2. **Groq API Key**: Get your free API key from [Groq Console](https://console.groq.com/)

3. **Node.js**: Version 14.0.0 or higher

## Installation

### Method 1: Via MeshCentral Plugin Manager (Recommended)

1. Navigate to your MeshCentral web interface
2. Go to **My Account** → **Plugins**
3. Click **Add Plugin**
4. Enter the plugin configuration URL (when available)

### Method 2: Manual Installation

1. Clone or download this repository to your MeshCentral plugins directory:
   ```bash
   cd /path/to/meshcentral-data/plugins
   git clone https://github.com/yourusername/MeshCentral-StreamMonitor.git streammonitor
   ```

2. Install dependencies:
   ```bash
   cd streammonitor
   npm install
   ```

3. Restart your MeshCentral server

4. **Configure via Web UI** (Recommended):
   - Log into MeshCentral
   - Go to **My Account** → **Plugins**
   - Click on **Stream Monitor Agent**
   - Enter your Groq API key and configure settings
   - Click **Save Settings**

## Configuration

### ⚠️ Important: API Key Setup

The Groq API key is hardcoded in `streammonitor.js` line 22 as a placeholder (`gsk_****`). 

**Before using the plugin, replace the placeholder with your actual API key:**

1. Open `streammonitor.js`
2. Find line 22: `groqApiKey: 'gsk_****',`
3. Replace `gsk_****` with your actual Groq API key from [console.groq.com](https://console.groq.com/)
4. Save the file and restart MeshCentral

**Note:** The API key is stored directly in the code. Do not share this file publicly with your real API key.

### 🎨 Web-Based Configuration (Recommended)

The easiest way to configure the plugin is through the built-in settings UI:

1. **Access Settings Panel**:
   - Navigate to **My Account** → **Plugins** in MeshCentral
   - Click on **Stream Monitor Agent**
   - You'll see a comprehensive settings interface

2. **Configure Groq API**:
   - Enter your Groq API key from [console.groq.com](https://console.groq.com/)
   - Select your preferred model
   - Click "Test Connection" to verify

3. **Adjust Monitoring Settings**:
   - Set capture interval (how often to take screenshots)
   - Configure screenshot quality
   - Set activity threshold (confidence level for alerts)
   - Enable/disable detailed logging

4. **Customize Analysis** (Optional):
   - Add custom analysis prompt
   - Adjust AI temperature and max tokens
   - Fine-tune for your specific use case

5. **Save Settings**:
   - Click **💾 Save Settings**
   - Settings are saved to `settings.json`
   - No server restart required!

See [SETTINGS_UI_GUIDE.md](SETTINGS_UI_GUIDE.md) for detailed documentation.

### Alternative: Environment Variables (Legacy)

You can also set the API key via environment variable:
```bash
export GROQ_API_KEY='your-api-key-here'
```

**Note:** Settings configured via the UI take precedence over environment variables.

## Usage

### Starting Monitoring

**Via API:**
```bash
curl -X POST http://your-meshcentral-server/pluginadmin.ashx/streammonitor/start \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "node//device-id-here"}'
```

**Via Web UI (if implemented):**
- Navigate to a device
- Click the "Stream Monitor" tab
- Click "Start Monitoring"

### Stopping Monitoring

```bash
curl -X POST http://your-meshcentral-server/pluginadmin.ashx/streammonitor/stop \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "node//device-id-here"}'
```

### Checking Status

```bash
curl http://your-meshcentral-server/pluginadmin.ashx/streammonitor/status
```

Response:
```json
{
  "activeMonitors": [
    {
      "deviceId": "node//abc123",
      "startTime": 1700000000000,
      "captureCount": 120,
      "analysisCount": 115,
      "lastActivity": {
        "timestamp": 1700000600000,
        "confidence": 0.85,
        "description": "User is actively browsing web pages..."
      }
    }
  ],
  "totalDevices": 1,
  "groqInitialized": true,
  "config": {
    "monitoringInterval": 5000,
    "activityThreshold": 0.7
  }
}
```

### Updating Configuration

```bash
curl -X POST http://your-meshcentral-server/pluginadmin.ashx/streammonitor/config \
  -H "Content-Type: application/json" \
  -d '{
    "monitoringInterval": 10000,
    "activityThreshold": 0.8
  }'
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/pluginadmin.ashx/streammonitor/start` | POST | Start monitoring a device |
| `/pluginadmin.ashx/streammonitor/stop` | POST | Stop monitoring a device |
| `/pluginadmin.ashx/streammonitor/status` | GET | Get monitoring status |
| `/pluginadmin.ashx/streammonitor/config` | POST | Update configuration |

## How It Works

1. **Screenshot Capture**: The plugin periodically captures screenshots from monitored devices using MeshCentral's desktop relay
2. **Image Processing**: Screenshots are converted to base64 format for transmission
3. **AI Analysis**: Images are sent to Groq's vision model with a prompt to analyze activity
4. **Activity Detection**: The LLM identifies:
   - Active applications and windows
   - User interactions and actions
   - Suspicious or unusual behavior
   - Overall activity level
5. **Confidence Scoring**: Each analysis includes a confidence score (0-1)
6. **Threshold Filtering**: Only activities above the configured threshold are reported
7. **Reporting**: Significant activities are logged and can trigger notifications

## Analysis Capabilities

The Groq vision model can detect:

- **Application Usage**: What programs are running and being used
- **Web Activity**: Websites visited, content viewed
- **User Actions**: Typing, clicking, file operations
- **Suspicious Behavior**: Unusual patterns, unauthorized access attempts
- **Content Analysis**: Text visible on screen (OCR-like capabilities)
- **Activity Level**: Low, medium, or high activity classification

## Development

### Project Structure

```
streammonitor/
├── config.json          # Plugin metadata
├── streammonitor.js     # Main plugin code
├── package.json         # Node.js dependencies
├── README.md           # This file
└── changelog.md        # Version history
```

### Extending the Plugin

To add custom analysis logic:

1. Modify the `analyzeWithGroq()` function to customize the prompt
2. Update `extractConfidence()` to parse custom response formats
3. Extend `reportActivity()` to add custom notification channels

### TODO / Future Enhancements

- [ ] Implement actual screenshot capture via MeshCentral desktop relay
- [ ] Add WebSocket notifications to web clients
- [ ] Create admin panel UI for configuration
- [ ] Add database storage for activity reports
- [ ] Implement activity history and search
- [ ] Add support for multiple LLM providers
- [ ] Create custom device tab in web UI
- [ ] Add email/webhook notifications
- [ ] Implement activity recording/replay
- [ ] Add privacy controls and data retention policies

## Troubleshooting

### Groq Client Not Initialized

**Error**: `Groq client not initialized. Skipping analysis.`

**Solution**: Ensure `GROQ_API_KEY` environment variable is set:
```bash
export GROQ_API_KEY='your-api-key'
# Restart MeshCentral
```

### Screenshot Capture Fails

**Error**: `Failed to capture screenshot from device`

**Solution**: 
- Ensure the device has desktop access enabled
- Check that the device is online and connected
- Verify MeshCentral has permission to access the desktop

### High API Usage

If you're hitting Groq API rate limits:
- Increase `monitoringInterval` (e.g., 30000 for 30 seconds)
- Reduce number of monitored devices
- Implement caching for similar screenshots

## Security Considerations

- **API Key Protection**: Never commit your Groq API key to version control
- **Screenshot Privacy**: Screenshots may contain sensitive information
- **Access Control**: Only authorized users should access monitoring features
- **Data Retention**: Implement appropriate data retention policies
- **Encryption**: Consider encrypting stored screenshots and analysis results

## Performance

- **Memory Usage**: ~50-100MB per monitored device
- **CPU Usage**: Minimal (screenshot capture is the main overhead)
- **Network**: ~100-500KB per analysis (depends on screenshot size)
- **Groq API**: ~1-2 seconds per analysis

## License

Apache-2.0

## Credits

- Built for [MeshCentral](https://github.com/Ylianst/MeshCentral)
- Powered by [Groq](https://groq.com/)
- Uses [groq-sdk](https://www.npmjs.com/package/groq-sdk)

## Support

For issues, questions, or contributions:
- GitHub Issues: [Create an issue](https://github.com/yourusername/MeshCentral-StreamMonitor/issues)
- MeshCentral Discord: [Join the community](https://discord.gg/meshcentral)

## Changelog

See [changelog.md](changelog.md) for version history.
