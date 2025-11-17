# Settings UI Guide

The Stream Monitor plugin now includes a web-based settings panel instead of requiring `.env` files. All configuration can be done through the MeshCentral admin interface.

## Accessing Settings

1. Log into your MeshCentral server
2. Navigate to **My Account** → **Plugins**
3. Find **Stream Monitor Agent** in the list
4. Click on the plugin name or settings icon
5. You'll see the settings panel with all configuration options

## Settings Sections

### 🤖 Groq API Configuration

**Groq API Key** (Required)
- Your Groq API key from [console.groq.com](https://console.groq.com/)
- Format: `gsk_...`
- The key is stored securely and only partially displayed when reloading settings

**Model**
- Select which Groq vision model to use:
  - `llama-3.2-90b-vision-preview` (Recommended) - Best quality
  - `llama-3.2-11b-vision-preview` (Faster) - Faster processing
  - `llama-vision-free` - Free tier option

**Enable Groq Analysis**
- Toggle to enable/disable AI analysis
- When disabled, monitoring will still capture screenshots but won't analyze them
- Useful for testing or reducing API usage

**Test Connection Button**
- Click to verify your API key and model work correctly
- Shows connection status with visual indicator
- Tests the actual Groq API connection

### ⚙️ Monitoring Settings

**Capture Interval**
- Time between screenshot captures (1-300 seconds)
- Default: 5 seconds
- Lower = more frequent monitoring, higher API usage
- Higher = less frequent monitoring, lower API usage

**Screenshot Quality**
- JPEG quality percentage (10-100)
- Default: 80%
- Higher = better quality but larger file size
- Lower = smaller files but reduced quality

**Activity Threshold**
- Confidence threshold for reporting (0.0-1.0)
- Default: 0.7 (70%)
- Only activities with confidence above this threshold are reported
- Higher = fewer alerts (only high-confidence activities)
- Lower = more alerts (includes lower-confidence activities)

**Max Concurrent Analysis**
- Maximum number of parallel AI analyses (1-10)
- Default: 3
- Higher = faster processing of multiple devices
- Lower = reduced server load

**Enable Detailed Logging**
- Toggle detailed logging to console
- Useful for debugging
- Logs all activities and system events

### 🔍 Analysis Settings

**Custom Analysis Prompt**
- Optional custom prompt for the AI
- Leave empty to use the default prompt
- Customize what the AI should look for in screenshots
- Example: "Focus on detecting financial transactions and sensitive data entry"

**AI Temperature**
- Controls randomness in AI responses (0.0-1.0)
- Default: 0.3
- 0.0 = Deterministic, consistent responses
- 1.0 = Creative, varied responses
- Lower values recommended for monitoring

**Max Response Tokens**
- Maximum length of AI response (100-2000)
- Default: 500
- Higher = more detailed analysis
- Lower = shorter, more concise analysis

## Saving Settings

1. Configure all desired settings
2. Click **💾 Save Settings** button
3. Settings are saved to `settings.json` in the plugin directory
4. The plugin automatically reinitializes with new settings
5. No server restart required!

## Additional Actions

**🔄 Reload Settings**
- Reload settings from file
- Useful if settings were changed externally
- Discards unsaved changes

**↩️ Reset to Defaults**
- Reset all settings to default values
- Does not save automatically - you must click Save
- Useful if configuration becomes problematic

**🔄 Refresh Status**
- Update the current monitoring status display
- Shows active monitors, device count, and recent activity

## Current Status Section

The status section displays:
- **Groq Initialized**: Whether Groq client is connected
- **Active Monitors**: Number of devices being monitored
- **Monitoring Interval**: Current capture interval
- **Activity Threshold**: Current confidence threshold
- **Monitored Devices**: List of devices with statistics

## Settings Storage

Settings are stored in `settings.json` in the plugin directory:
```
/path/to/meshcentral-data/plugins/streammonitor/settings.json
```

**Security Notes:**
- The file contains your Groq API key
- It's automatically added to `.gitignore`
- File permissions should be restricted
- Never commit this file to version control

## Example Settings File

```json
{
  "groqApiKey": "gsk_your_api_key_here",
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

## Testing Your Configuration

1. **Test Groq Connection**
   - Enter your API key
   - Select a model
   - Click "Test Connection"
   - Wait for success/failure message

2. **Start Monitoring a Device**
   - Use the API or device interface
   - Check the status section for updates
   - Monitor console logs for activity

3. **Adjust Settings**
   - If too many alerts: increase activity threshold
   - If missing activity: decrease activity threshold
   - If slow: increase monitoring interval
   - If API limits hit: increase interval or reduce devices

## Troubleshooting

### Settings Not Saving
- Check file permissions on plugin directory
- Ensure MeshCentral has write access
- Check console logs for errors

### API Key Not Working
- Verify key is correct (starts with `gsk_`)
- Test connection using the Test button
- Check Groq console for API status
- Verify model is available for your account

### Changes Not Taking Effect
- Click "Reload Settings" to refresh
- Check that you clicked "Save Settings"
- Verify settings.json file was updated
- Check console logs for errors

### Can't Access Settings Panel
- Ensure you're logged in as admin
- Verify plugin is installed correctly
- Check that `hasAdminPanel: true` in config.json
- Restart MeshCentral if needed

## Migration from .env

If you were using `.env` files before:

1. Open your old `.env` file
2. Copy the `GROQ_API_KEY` value
3. Access the settings panel
4. Paste the API key in the Groq API Key field
5. Configure other settings as desired
6. Click Save Settings
7. You can now delete the `.env` file (optional)

## API Access

Settings can also be managed via API:

**Get Settings:**
```bash
curl http://localhost/pluginadmin.ashx/streammonitor/settings
```

**Update Settings:**
```bash
curl -X POST http://localhost/pluginadmin.ashx/streammonitor/settings \
  -H "Content-Type: application/json" \
  -d '{
    "groqApiKey": "gsk_...",
    "monitoringInterval": 10000,
    "activityThreshold": 0.8
  }'
```

**Test Groq:**
```bash
curl -X POST http://localhost/pluginadmin.ashx/streammonitor/test-groq \
  -H "Content-Type: application/json" \
  -d '{
    "apiKey": "gsk_...",
    "model": "llama-3.2-90b-vision-preview"
  }'
```

## Best Practices

1. **Start Conservative**
   - Begin with default settings
   - Adjust based on results

2. **Monitor API Usage**
   - Check Groq console for usage
   - Adjust interval if hitting limits

3. **Test Before Production**
   - Test with one device first
   - Verify alerts are meaningful
   - Adjust thresholds as needed

4. **Secure Your Settings**
   - Don't share settings.json
   - Use strong API keys
   - Restrict file permissions

5. **Regular Reviews**
   - Review activity logs regularly
   - Adjust thresholds based on patterns
   - Update prompts for better detection

## Support

For issues with the settings UI:
- Check browser console for errors
- Review MeshCentral logs
- Verify plugin is up to date
- Report issues on GitHub
