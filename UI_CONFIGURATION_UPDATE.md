# UI Configuration Update

## What Changed

The Stream Monitor plugin now features a **web-based settings panel** instead of requiring `.env` files or environment variables for configuration.

## New Features

### 🎨 Settings UI
- **Location**: My Account → Plugins → Stream Monitor Agent
- **Full configuration interface** with organized sections
- **Real-time validation** and testing
- **No server restart** required after changes
- **Secure storage** in `settings.json`

### ✅ Built-in Testing
- **Test Connection** button to verify Groq API key
- **Visual status indicators** for connection state
- **Immediate feedback** on configuration issues

### 📊 Live Status Display
- View currently monitored devices
- See capture and analysis counts
- Monitor system status in real-time
- Refresh status on demand

## Key Benefits

1. **No Config Files**: Everything configured through the UI
2. **User-Friendly**: Intuitive interface with helpful descriptions
3. **Secure**: API keys stored safely, partially masked in UI
4. **Flexible**: All settings adjustable without code changes
5. **Testable**: Verify configuration before saving

## Files Added

### `views/streammonitor.handlebars`
Complete settings UI with:
- Groq API configuration section
- Monitoring settings controls
- Analysis customization options
- Status display
- Save/reload/reset functionality

### `SETTINGS_UI_GUIDE.md`
Comprehensive guide covering:
- How to access settings
- Detailed explanation of each setting
- Best practices
- Troubleshooting
- API access for automation

## Files Modified

### `streammonitor.js`
**Added:**
- `loadSettings()` - Load settings from file
- `saveSettings()` - Save settings to file
- Settings file path management
- New API endpoints:
  - `GET /pluginadmin.ashx/streammonitor/settings` - Get current settings
  - `POST /pluginadmin.ashx/streammonitor/settings` - Save settings
  - `POST /pluginadmin.ashx/streammonitor/test-groq` - Test Groq connection

**Updated:**
- `initGroq()` - Now checks if Groq is enabled in settings
- `analyzeWithGroq()` - Uses configured model, prompt, temperature, and maxTokens
- `server_startup()` - Loads settings from file on startup
- Configuration structure with more options

### `config.json`
- Confirmed `hasAdminPanel: true` is set

### `.gitignore`
- Added `settings.json` to prevent committing sensitive data

### `README.md`
- Highlighted UI-based configuration as primary method
- Added UI configuration section
- Updated installation steps
- Marked environment variables as legacy method

### `QUICKSTART.md`
- Updated to emphasize UI configuration
- Simplified setup process
- Added step-by-step UI instructions

## Configuration Options

All configurable through the UI:

### Groq API Settings
- **API Key**: Your Groq API key
- **Model**: Select vision model (90B, 11B, or free)
- **Enable/Disable**: Toggle AI analysis on/off

### Monitoring Settings
- **Capture Interval**: 1-300 seconds
- **Screenshot Quality**: 10-100%
- **Activity Threshold**: 0.0-1.0 confidence
- **Max Concurrent Analysis**: 1-10 parallel analyses
- **Detailed Logging**: Enable/disable

### Analysis Settings
- **Custom Prompt**: Optional custom analysis instructions
- **Temperature**: 0.0-1.0 (AI creativity)
- **Max Tokens**: 100-2000 (response length)

## Settings Storage

Settings are stored in `settings.json`:
```json
{
  "groqApiKey": "gsk_...",
  "groqModel": "llama-3.2-90b-vision-preview",
  "groqEnabled": true,
  "monitoringInterval": 5000,
  "screenshotQuality": 80,
  "activityThreshold": 0.7,
  "maxConcurrentAnalysis": 3,
  "enableLogging": true,
  "analysisPrompt": "",
  "temperature": 0.3,
  "maxTokens": 500
}
```

**Security:**
- File is automatically added to `.gitignore`
- API key is partially masked in UI
- File permissions should be restricted

## Migration Guide

### From .env to UI

If you were using `.env` files:

1. Note your current `GROQ_API_KEY` value
2. Access the settings UI
3. Paste the API key
4. Configure other settings as desired
5. Click Save Settings
6. Delete `.env` file (optional)

### From Environment Variables

Environment variables still work but UI settings take precedence:

1. Access settings UI
2. Configure all settings
3. Save settings
4. Environment variables are now optional

## Usage Examples

### Access Settings UI
1. Log into MeshCentral
2. Click your username → **My Account**
3. Click **Plugins** tab
4. Find **Stream Monitor Agent**
5. Click the plugin name

### Test Configuration
1. Enter Groq API key
2. Select model
3. Click **Test Connection**
4. Wait for success/failure message
5. Adjust settings if needed
6. Click **Save Settings**

### Update Settings
1. Access settings UI
2. Modify desired settings
3. Click **💾 Save Settings**
4. Changes take effect immediately

### View Status
1. Access settings UI
2. Scroll to **Current Status** section
3. Click **🔄 Refresh Status**
4. View active monitors and statistics

## API Access

Settings can also be managed programmatically:

```bash
# Get current settings
curl http://localhost/pluginadmin.ashx/streammonitor/settings

# Update settings
curl -X POST http://localhost/pluginadmin.ashx/streammonitor/settings \
  -H "Content-Type: application/json" \
  -d '{
    "groqApiKey": "gsk_...",
    "monitoringInterval": 10000
  }'

# Test Groq connection
curl -X POST http://localhost/pluginadmin.ashx/streammonitor/test-groq \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "gsk_...",
    "model": "llama-3.2-90b-vision-preview"
  }'
```

## Backward Compatibility

The plugin remains backward compatible:

- ✅ Environment variables still work
- ✅ Existing API endpoints unchanged
- ✅ No breaking changes to functionality
- ✅ UI settings override environment variables

## Benefits Over .env Files

| Feature | .env Files | UI Settings |
|---------|-----------|-------------|
| Ease of Use | ❌ Manual editing | ✅ Point and click |
| Validation | ❌ None | ✅ Real-time |
| Testing | ❌ Separate process | ✅ Built-in |
| Documentation | ❌ External | ✅ Inline help |
| Security | ⚠️ File-based | ✅ Masked display |
| Updates | ❌ Restart needed | ✅ Immediate |
| User-Friendly | ❌ Technical | ✅ Intuitive |

## Troubleshooting

### Can't Access Settings UI
- Verify you're logged in as admin
- Check plugin is installed correctly
- Ensure `hasAdminPanel: true` in config.json
- Restart MeshCentral

### Settings Not Saving
- Check file permissions
- Verify MeshCentral has write access
- Check console for errors
- Try reloading settings

### Test Connection Fails
- Verify API key is correct
- Check internet connectivity
- Verify model is available
- Check Groq API status

## Next Steps

1. **Install/Update Plugin**: Get the latest version
2. **Access Settings UI**: Navigate to plugin settings
3. **Configure**: Set up your Groq API key and preferences
4. **Test**: Use the Test Connection button
5. **Save**: Click Save Settings
6. **Monitor**: Start monitoring devices

## Documentation

- **Full Guide**: See [SETTINGS_UI_GUIDE.md](SETTINGS_UI_GUIDE.md)
- **Quick Start**: See [QUICKSTART.md](QUICKSTART.md)
- **Complete Docs**: See [README.md](README.md)

## Support

For questions or issues:
- Check the settings UI guide
- Review console logs
- Test connection using built-in tester
- Report issues on GitHub

---

**Version**: 0.1.0+
**Status**: ✅ Production Ready
**Last Updated**: 2024-11-16
