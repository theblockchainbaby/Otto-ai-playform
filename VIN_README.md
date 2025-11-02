# 🚗 VIN Decoding - Quick Reference

## What Is It?

Otto AI now **automatically decodes Vehicle Identification Numbers (VINs)** to extract detailed vehicle information like make, model, year, engine specs, and more.

## How It Works

```
Customer: "I need service for my Honda Civic, VIN 1HGCV41JXMN109186"
    ↓
Otto: Extracts VIN → Decodes → Gets vehicle info
    ↓
Appointment: Includes make, model, year, engine details
    ↓
CRM: Sales team sees full vehicle context
```

## 🔧 Three API Endpoints

### 1. Decode VIN
```bash
curl -X POST http://localhost:3000/api/vin/decode \
  -H "Content-Type: application/json" \
  -d '{"vin": "1HGCV41JXMN109186"}'
```

Returns: Make, model, year, engine, transmission, body type, etc.

### 2. Extract VIN from Text
```bash
curl -X POST http://localhost:3000/api/vin/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "My car is a 2020 Honda Civic VIN 1HGCV41JXMN109186"}'
```

Automatically finds and decodes VIN from text.

### 3. Validate VIN
```bash
curl http://localhost:3000/api/vin/validate/1HGCV41JXMN109186
```

Checks if VIN format is valid.

## 📊 Data Sources

| Source | Cost | Data |
|--------|------|------|
| **NHTSA** | Free | Make, model, year, engine, transmission, body type |
| **VinAudit** | Paid | History, title status, mileage, color |
| **RapidAPI** | Paid | Comprehensive vehicle data |

**Smart Fallback:** Tries NHTSA first, then alternatives if needed.

## 🎯 Use Cases

### Appointment Booking
Customer provides VIN → Otto decodes → Appointment includes vehicle details

### Service Recommendations
Based on vehicle year/model → Suggest appropriate services

### CRM Enrichment
Vehicle data synced to CRM → Sales team sees full context

### Inventory Management
Track vehicles in service → Match parts → Manage history

## 📝 Example Response

```json
{
  "success": true,
  "data": {
    "source": "NHTSA",
    "vin": "1HGCV41JXMN109186",
    "make": "HONDA",
    "modelYear": "1991",
    "bodyClass": "Sedan",
    "engineCylinders": "4",
    "fuelType": "Gasoline",
    "transmission": "Manual",
    "driveType": "Front-Wheel Drive"
  },
  "formatted": {
    "vin": "1HGCV41JXMN109186",
    "make": "HONDA",
    "model": "Unknown",
    "year": "1991",
    "body_type": "Sedan",
    "engine": "4cyl",
    "transmission": "Manual",
    "fuel_type": "Gasoline",
    "drive_type": "Front-Wheel Drive"
  }
}
```

## 🚀 n8n Workflow Integration

The workflow automatically:
1. Checks for VIN in customer request
2. Decodes VIN if present
3. Merges vehicle data with appointment
4. Saves to database with vehicle info
5. Syncs to CRM with vehicle details

## 💾 CRM Integration

Vehicle data is automatically formatted for all CRM platforms:
- HubSpot
- Salesforce
- Pipedrive
- Zoho CRM
- Freshsales

## 🧪 Testing

All endpoints tested and working:
- ✅ Decode VIN
- ✅ Extract VIN from text
- ✅ Validate VIN format
- ✅ n8n workflow integration
- ✅ CRM field formatting

## 📚 Documentation

- **VIN_DECODING_GUIDE.md** - Complete API reference
- **VIN_INTEGRATION_SUMMARY.md** - Testing & features
- **VIN_FEATURE_COMPLETE.md** - Full overview

## 🔗 Resources

- NHTSA VIN API: https://vpic.nhtsa.dot.gov/api/
- VinAudit: https://www.vinaudit.com
- RapidAPI: https://rapidapi.com/vincheck/info

## ⚡ Quick Commands

```bash
# Start server
npm start

# Test decode
curl -X POST http://localhost:3000/api/vin/decode \
  -d '{"vin": "1HGCV41JXMN109186"}'

# Test extract
curl -X POST http://localhost:3000/api/vin/extract \
  -d '{"text": "My VIN is 1HGCV41JXMN109186"}'

# Test validate
curl http://localhost:3000/api/vin/validate/1HGCV41JXMN109186
```

## 🎓 Summary

Otto AI now has **enterprise-grade VIN decoding** that:
- ✅ Automatically detects VINs
- ✅ Decodes vehicle information
- ✅ Enriches appointment data
- ✅ Syncs to CRM
- ✅ Provides better customer context

**Status:** ✅ Complete & Tested

---

**Repository:** https://github.com/theblockchainbaby/Otto-ai-playform
**Last Updated:** November 2, 2025

