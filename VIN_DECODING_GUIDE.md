# 🚗 VIN Decoding Integration Guide

## Overview

Otto AI now automatically decodes Vehicle Identification Numbers (VINs) to extract detailed vehicle information. This enriches appointment data with make, model, year, engine specs, and more.

## 🔧 Setup

### 1. Environment Variables

Add to your `.env` file:

```bash
# Free NHTSA API (no key needed)
# NHTSA_API_URL=https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues

# Optional: Commercial APIs
VINAUDIT_API_KEY=your_vinaudit_key
RAPIDAPI_KEY=your_rapidapi_key
```

### 2. Install Dependencies

```bash
npm install axios
```

Already included in your project!

## 📡 API Endpoints

### 1. Decode VIN

**Endpoint:** `POST /api/vin/decode`

**Request:**
```bash
curl -X POST http://localhost:3000/api/vin/decode \
  -H "Content-Type: application/json" \
  -d '{
    "vin": "1HGCV41JXMN109186",
    "source": "auto"
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "source": "NHTSA",
    "vin": "1HGCV41JXMN109186",
    "make": "Honda",
    "model": "Civic",
    "modelYear": "1991",
    "bodyClass": "Sedan",
    "engineDisplacement": "1590",
    "engineCylinders": "4",
    "fuelType": "Gasoline",
    "transmission": "Manual",
    "driveType": "Front-Wheel Drive",
    "plantCountry": "Japan",
    "decodedAt": "2024-11-01T12:00:00Z"
  },
  "formatted": {
    "vin": "1HGCV41JXMN109186",
    "make": "Honda",
    "model": "Civic",
    "year": "1991",
    "body_type": "Sedan",
    "engine": "4cyl 1590cc",
    "transmission": "Manual",
    "fuel_type": "Gasoline",
    "drive_type": "Front-Wheel Drive",
    "source": "NHTSA",
    "decoded_at": "2024-11-01T12:00:00Z"
  }
}
```

### 2. Extract & Decode VIN from Text

**Endpoint:** `POST /api/vin/extract`

Automatically finds and decodes VIN from text.

**Request:**
```bash
curl -X POST http://localhost:3000/api/vin/extract \
  -H "Content-Type: application/json" \
  -d '{
    "text": "I have a 2020 Honda Civic with VIN 1HGCV41JXMN109186"
  }'
```

**Response:**
```json
{
  "success": true,
  "vin": "1HGCV41JXMN109186",
  "decoded": { ... },
  "formatted": { ... }
}
```

### 3. Validate VIN

**Endpoint:** `GET /api/vin/validate/:vin`

**Request:**
```bash
curl http://localhost:3000/api/vin/validate/1HGCV41JXMN109186
```

**Response:**
```json
{
  "success": true,
  "vin": "1HGCV41JXMN109186",
  "valid": true,
  "message": "Valid VIN format"
}
```

## 🔌 VIN Decoding Sources

### 1. NHTSA (Free) ⭐ Recommended
- **URL:** `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues`
- **Cost:** Free
- **Data:** Make, model, year, engine, transmission, body type, plant info
- **Rate Limit:** Generous
- **Best For:** Basic vehicle information

### 2. VinAudit (Commercial)
- **URL:** `https://api.vinaudit.com/v3`
- **Cost:** Paid
- **Data:** History, title status, mileage, color, market data
- **Setup:** Get API key from https://www.vinaudit.com
- **Env Var:** `VINAUDIT_API_KEY`

### 3. RapidAPI (Commercial)
- **URL:** `https://rapidapi.com/vincheck/info`
- **Cost:** Paid
- **Data:** Comprehensive vehicle data
- **Setup:** Get API key from RapidAPI
- **Env Var:** `RAPIDAPI_KEY`

## 🔄 n8n Workflow Integration

The workflow now includes VIN decoding:

```
Customer Call
    ↓
Extract VIN (if provided)
    ↓
Check for VIN
    ↓
Has VIN? (Switch)
    ├→ YES: Decode VIN
    │   ↓
    │   Merge VIN Data
    │   ↓
    │   Continue with Appointment
    │
    └→ NO: Continue without VIN
```

### Workflow Nodes

1. **Check for VIN** - Extracts VIN from request
2. **Has VIN?** - Conditional switch
3. **Decode VIN** - HTTP request to `/api/vin/decode`
4. **Merge VIN Data** - Combines VIN data with appointment data

## 💾 CRM Integration

VIN data is automatically formatted for CRM sync:

```json
{
  "vin": "1HGCV41JXMN109186",
  "make": "Honda",
  "model": "Civic",
  "year": "1991",
  "body_type": "Sedan",
  "engine": "4cyl 1590cc",
  "transmission": "Manual",
  "fuel_type": "Gasoline",
  "drive_type": "Front-Wheel Drive",
  "source": "NHTSA",
  "decoded_at": "2024-11-01T12:00:00Z"
}
```

This data is synced to your CRM as custom fields:
- HubSpot: Custom properties
- Salesforce: Custom fields
- Pipedrive: Custom fields
- Zoho: Custom fields
- Freshsales: Custom fields

## 🧪 Testing

### Test 1: Decode Valid VIN
```bash
curl -X POST http://localhost:3000/api/vin/decode \
  -H "Content-Type: application/json" \
  -d '{"vin": "1HGCV41JXMN109186"}'
```

### Test 2: Extract VIN from Text
```bash
curl -X POST http://localhost:3000/api/vin/extract \
  -H "Content-Type: application/json" \
  -d '{"text": "My car is a 2020 Honda Civic VIN 1HGCV41JXMN109186"}'
```

### Test 3: Validate VIN
```bash
curl http://localhost:3000/api/vin/validate/1HGCV41JXMN109186
```

## 📊 VIN Format

Valid VIN format:
- **Length:** 17 characters
- **Characters:** Alphanumeric (A-Z, 0-9)
- **Excluded:** I, O, Q (to avoid confusion)
- **Pattern:** `^[A-HJ-NPR-Z0-9]{17}$`

Example: `1HGCV41JXMN109186`

## ⚠️ Error Handling

### Invalid VIN
```json
{
  "success": false,
  "error": "Invalid VIN format. VIN must be 17 characters (alphanumeric, no I/O/Q)"
}
```

### VIN Not Found
```json
{
  "success": false,
  "error": "VIN not found in NHTSA database"
}
```

### Service Unavailable
The system automatically tries alternative sources if one fails.

## 🚀 Use Cases

1. **Appointment Booking**
   - Customer provides VIN
   - Otto automatically decodes vehicle info
   - Appointment includes vehicle details

2. **Service Recommendations**
   - Based on vehicle year/model
   - Suggest appropriate services
   - Provide accurate pricing

3. **CRM Enrichment**
   - Vehicle data synced to CRM
   - Sales team sees full vehicle history
   - Better customer context

4. **Inventory Management**
   - Track vehicles in service
   - Match parts to vehicles
   - Manage service history

## 📝 Code Examples

### JavaScript/Node.js

```javascript
const vinService = require('./services/vinDecodingService');

// Decode VIN
const decoded = await vinService.decodeVin('1HGCV41JXMN109186');
console.log(decoded.make, decoded.model, decoded.modelYear);

// Extract VIN from text
const vin = vinService.extractVINFromText('My car is a 2020 Honda Civic VIN 1HGCV41JXMN109186');

// Validate VIN
const isValid = vinService.validateVIN('1HGCV41JXMN109186');

// Format for CRM
const crmData = vinService.formatForCRM(decoded);
```

## 🔗 Resources

- **NHTSA VIN API:** https://vpic.nhtsa.dot.gov/api/
- **VinAudit:** https://www.vinaudit.com
- **RapidAPI VIN Decoder:** https://rapidapi.com/vincheck/info
- **VIN Format:** https://en.wikipedia.org/wiki/Vehicle_identification_number

---

**Status:** ✅ Ready to use
**Last Updated:** November 1, 2025

