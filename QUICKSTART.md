# Quick Start Guide

Get up and running with MeshCentral Stream Monitor in 5 minutes.

## Prerequisites

- MeshCentral server installed and running
- Node.js 14.0.0 or higher
- Groq API key ([Get one free here](https://console.groq.com/))

## Installation

### Step 1: Install the Plugin

```bash
# Navigate to your MeshCentral plugins directory
cd /path/to/meshcentral-data/plugins/

# Clone or copy the plugin
git clone https://github.com/yourusername/MeshCentral-StreamMonitor.git streammonitor
cd streammonitor

# Run the installation script
./install.sh
```

Or install manually:

```bash
npm install
cp .env.example .env
```

### Step 2: Configure via Web UI

**No config files needed!** Configure everything through the web interface:

1. Restart MeshCentral after installing the plugin
2. Log into MeshCentral web interface
3. Navigate to **My Account** → **Plugins**
4. Click on **Stream Monitor Agent**
5. Enter your Groq API key from [console.groq.com](https://console.groq.com/)
6. Click **Test Connection** to verify it works
7. Adjust other settings as desired
8. Click **💾 Save Settings**

**Alternative (Legacy):** You can also set via environment variable:
```bash
export GROQ_API_KEY='gsk_your_api_key_here'
```

### Step 3: Enable Plugins in MeshCentral

Edit your MeshCentral `config.json`:

```json
{
  "settings": {
    "plugins": {
      "enabled": true
    }
  }
}
```

### Step 4: Restart MeshCentral

```bash
# Stop MeshCentral
pkill -f meshcentral

# Start MeshCentral
node meshcentral
```

## Testing

### Test Groq Connection

```bash
node examples/test-groq.js
```

Expected output:
```
Testing Groq Vision API...
✓ Groq client initialized
Analyzing test image...
=== Analysis Result ===
[AI analysis of the test image]
✓ Test completed successfully!
```

### Test API Endpoints

Start monitoring a device:

```bash
curl -X POST http://localhost:443/pluginadmin.ashx/streammonitor/start \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "node//your-device-id"}'
```

Check status:

```bash
curl http://localhost:443/pluginadmin.ashx/streammonitor/status
```

## Basic Usage

### 1. Find Your Device ID

In MeshCentral web interface:
1. Navigate to "My Devices"
2. Click on a device
3. The device ID is in the URL: `node//XXXXX`

### 2. Start Monitoring

**Via API:**
```bash
curl -X POST http://your-server/pluginadmin.ashx/streammonitor/start \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "node//your-device-id"}'
```

**Via Node.js:**
```javascript
const { startMonitoring } = require('./examples/api-usage');
await startMonitoring('node//your-device-id');
```

### 3. View Activity Reports

Check the MeshCentral console logs for activity reports:

```
[StreamMonitor] ACTIVITY DETECTED on node//abc123: User is actively browsing...
```

### 4. Stop Monitoring

```bash
curl -X POST http://your-server/pluginadmin.ashx/streammonitor/stop \
  -H "Content-Type: application/json" \
  -d '{"deviceId": "node//your-device-id"}'
```

## Configuration

### Adjust Monitoring Settings

```bash
curl -X POST http://your-server/pluginadmin.ashx/streammonitor/config \
  -H "Content-Type: application/json" \
  -d '{
    "monitoringInterval": 10000,
    "activityThreshold": 0.8
  }'
```

**Available settings:**
- `monitoringInterval`: Time between captures in milliseconds (default: 5000)
- `activityThreshold`: Confidence threshold for reporting (0-1, default: 0.7)
- `screenshotQuality`: JPEG quality (0-100, default: 80)

## Troubleshooting

### Plugin Not Loading

Check MeshCentral logs:
```bash
tail -f /path/to/meshcentral-data/meshcentral.log
```

Look for:
```
[StreamMonitor] Stream Monitor Plugin starting up...
[StreamMonitor] Groq client initialized successfully
```

### Groq API Errors

**Error: "API key not set"**
- Solution: Set `GROQ_API_KEY` environment variable

**Error: "Rate limit exceeded"**
- Solution: Increase `monitoringInterval` or reduce monitored devices

**Error: "Invalid API key"**
- Solution: Verify your API key at https://console.groq.com/

### No Screenshots Captured

**Note:** Screenshot capture requires additional implementation to integrate with MeshCentral's desktop relay system. The current version includes placeholder code that needs to be completed.

To implement:
1. Review `screenshot-helper.js`
2. Integrate with MeshCentral's desktop relay WebSocket
3. Test with a connected device that has desktop access enabled

## Next Steps

- Read the full [README.md](README.md) for detailed documentation
- Explore [examples/](examples/) for more usage examples
- Check [changelog.md](changelog.md) for version history
- Customize the analysis prompt in `streammonitor.js` for your use case

## Support

- GitHub Issues: Report bugs and request features
- MeshCentral Discord: Get community help
- Documentation: https://ylianst.github.io/MeshCentral/

## Security Notes

- Never commit your `.env` file or API keys to version control
- Use HTTPS for production deployments
- Implement proper access controls for monitoring features
- Consider privacy implications of screenshot capture
- Set appropriate data retention policies

---

**Ready to monitor!** 🚀

For advanced usage and customization, see the full documentation in README.md.
