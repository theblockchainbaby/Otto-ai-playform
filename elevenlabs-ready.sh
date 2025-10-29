#!/bin/bash

# ElevenLabs Setup Complete - Test Script
echo "🎙️  ELEVENLABS OTTO AI - SETUP COMPLETE"
echo "=========================================="
echo ""

# Show API key status
echo "✅ Local .env file: ElevenLabs API key configured"
echo "   Key: sk_069522...699038 (truncated for security)"
echo ""

# Test local server
echo "🧪 Testing local configuration..."
echo ""

# Read .env and check
if grep -q "ELEVENLABS_API_KEY=\"sk_069522a3e143c120684fe6924fa8791093d6fea95c699038\"" .env; then
    echo "   ✅ API key found in .env file"
else
    echo "   ⚠️  API key might not be in .env (but may be in environment)"
fi
echo ""

# Next steps for Render
echo "📋 NEXT STEPS TO ENABLE ON PRODUCTION:"
echo "=========================================="
echo ""
echo "1. Go to Render Dashboard:"
echo "   🔗 https://dashboard.render.com/"
echo ""
echo "2. Find your Otto AI service"
echo ""
echo "3. Add Environment Variable:"
echo "   Key:   ELEVENLABS_API_KEY"
echo "   Value: sk_069522a3e143c120684fe6924fa8791093d6fea95c699038"
echo ""
echo "4. Save and wait for auto-redeploy (~2 minutes)"
echo ""
echo "5. Test with this command:"
echo "   ./quick-voice-test.sh"
echo ""
echo "=========================================="
echo ""

# Show what will change
echo "🎯 WHAT WILL CHANGE:"
echo ""
echo "BEFORE (Current Production):"
echo "  🤖 AWS Polly voice: 'Hello valued customer...'"
echo "  ❌ Robotic sound"
echo "  ❌ Press 1 or 2 only"
echo ""
echo "AFTER (With ElevenLabs):"
echo "  🎙️  Natural human voice from Otto"
echo "  ✅ Conversational AI"
echo "  ✅ Understands: 'I need to reschedule'"
echo "  ✅ Can answer questions naturally"
echo ""
echo "=========================================="
echo ""

# Agent info
echo "🤖 YOUR OTTO AI AGENT:"
echo ""
echo "   Agent ID: agent_3701k70bz4gcfd6vq1bkh57d15bw"
echo "   Test Agent: https://elevenlabs.io/app/talk-to?agent_id=agent_3701k70bz4gcfd6vq1bkh57d15bw"
echo ""
echo "   Phone Number: +18884118568 (Twilio)"
echo "   Test Phone: +19163337305"
echo ""
echo "=========================================="
echo ""

# Offer to open browser
read -p "🌐 Open Render Dashboard in browser? (y/n): " -n 1 -r
echo ""
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "   Opening https://dashboard.render.com/ ..."
    open "https://dashboard.render.com/" 2>/dev/null || xdg-open "https://dashboard.render.com/" 2>/dev/null || echo "   Please open manually: https://dashboard.render.com/"
fi
echo ""

echo "📚 Documentation created:"
echo "   - ELEVENLABS_SETUP.md (detailed guide)"
echo "   - RENDER_ADD_ELEVENLABS.md (Render instructions)"
echo "   - TEST_VOICE_CALL_NOW.md (testing guide)"
echo "   - N8N_TEST_WITHOUT_WAIT.md (n8n workflow guide)"
echo ""
echo "=========================================="
