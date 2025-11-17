# Installation Guide - MeshCentral Stream Monitor Plugin

## ⚠️ Important: Use Manual Installation

Due to MeshCentral's plugin download issues, **manual installation is recommended**.

## Manual Installation Steps

### 1. Navigate to MeshCentral plugins directory
```bash
cd /opt/meshcentral/meshcentral-data/plugins
```

### 2. Clone the repository
```bash
git clone https://github.com/brettmkettler/MeshCentral-StreamMonitor.git streammonitor
```

### 3. Install dependencies
```bash
cd streammonitor
npm install
```

### 4. Configure the API key
Edit `streammonitor.js` and replace the placeholder API key:
```bash
nano streammonitor.js
# Find line 22: groqApiKey: 'gsk_****',
# Replace with your actual Groq API key from https://console.groq.com/
```

### 5. Restart MeshCentral
```bash
# If using systemd:
sudo systemctl restart meshcentral

# If running manually:
# Stop MeshCentral (Ctrl+C) and restart it
cd /opt/meshcentral
node meshcentral
```

### 6. Verify Installation
Check the MeshCentral log for:
```
[StreamMonitor] Stream Monitor Plugin starting up...
[StreamMonitor] Plugin directory: /opt/meshcentral/meshcentral-data/plugins/streammonitor
[StreamMonitor] Stream Monitor Plugin started successfully
```

## Troubleshooting

### Error: Cannot find module 'groq-sdk'
```bash
cd /opt/meshcentral/meshcentral-data/plugins/streammonitor
npm install groq-sdk sharp
```

### Error: Sharp compilation failed
Sharp requires native compilation. Install build tools:

**Ubuntu/Debian:**
```bash
sudo apt-get install build-essential python3
cd /opt/meshcentral/meshcentral-data/plugins/streammonitor
npm rebuild sharp
```

**CentOS/RHEL:**
```bash
sudo yum groupinstall "Development Tools"
cd /opt/meshcentral/meshcentral-data/plugins/streammonitor
npm rebuild sharp
```

### Plugin shows as "disabled"
1. Check MeshCentral config has plugins enabled:
   ```json
   {
     "plugins": {
       "enabled": true
     }
   }
   ```

2. Check file permissions:
   ```bash
   ls -la /opt/meshcentral/meshcentral-data/plugins/streammonitor/
   # Should be owned by the user running MeshCentral
   ```

3. Check for errors in the log:
   ```bash
   tail -f /opt/meshcentral/meshcentral-data/meshcentral.log | grep StreamMonitor
   ```

### /tmp directory issues
If you see errors about `/tmp/Plugin_*.zip`, this is a MeshCentral bug with automatic downloads. Use manual installation instead.

## Alternative: Direct Download

If git is not available:

```bash
cd /opt/meshcentral/meshcentral-data/plugins
wget https://github.com/brettmkettler/MeshCentral-StreamMonitor/archive/refs/heads/main.zip
unzip main.zip
mv MeshCentral-StreamMonitor-main streammonitor
cd streammonitor
npm install
```

## Verification

After installation, you should see the plugin in:
- MeshCentral Web UI → My Account → Plugins
- Status should show as "Active" or "Enabled"

The plugin will log startup messages to the MeshCentral console/log file.

## Support

If you encounter issues:
1. Check the MeshCentral log file
2. Verify all dependencies are installed
3. Ensure the API key is configured
4. Open an issue: https://github.com/brettmkettler/MeshCentral-StreamMonitor/issues
