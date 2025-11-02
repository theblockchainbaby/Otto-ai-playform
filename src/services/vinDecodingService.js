/**
 * VIN Decoding Service
 * Integrates with NHTSA VIN API and commercial VIN services
 * Automatically decodes vehicle information from VIN numbers
 */

const axios = require('axios');

class VINDecodingService {
  constructor() {
    this.nhtsa_url = 'https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinValues';
    this.vinaudit_url = 'https://api.vinaudit.com/v3';
    this.rapidapi_key = process.env.RAPIDAPI_KEY;
    this.vinaudit_key = process.env.VINAUDIT_API_KEY;
  }

  /**
   * Decode VIN using NHTSA API (Free)
   * @param {string} vin - Vehicle Identification Number
   * @returns {Promise<Object>} Decoded vehicle data
   */
  async decodeVinNHTSA(vin) {
    try {
      if (!vin || vin.length < 17) {
        throw new Error('Invalid VIN format. VIN must be at least 17 characters.');
      }

      console.log(`🔍 Decoding VIN with NHTSA: ${vin}`);

      const response = await axios.get(`${this.nhtsa_url}/${vin}`, {
        params: { format: 'json' },
        timeout: 5000
      });

      if (!response.data || response.data.Results.length === 0) {
        throw new Error('VIN not found in NHTSA database');
      }

      const results = response.data.Results[0];
      
      const decodedData = {
        source: 'NHTSA',
        vin: vin,
        make: results.Make || 'Unknown',
        model: results.Model || 'Unknown',
        modelYear: results.ModelYear || 'Unknown',
        bodyClass: results.BodyClass || 'Unknown',
        engineDisplacement: results.DisplacementCC || 'Unknown',
        engineCylinders: results.EngineCylinders || 'Unknown',
        fuelType: results.FuelTypePrimary || 'Unknown',
        transmission: results.TransmissionStyle || 'Unknown',
        driveType: results.DriveType || 'Unknown',
        plantCountry: results.PlantCountry || 'Unknown',
        plantCity: results.PlantCity || 'Unknown',
        plantState: results.PlantState || 'Unknown',
        series: results.Series || 'Unknown',
        trim: results.Trim || 'Unknown',
        doors: results.Doors || 'Unknown',
        seatRows: results.SeatRows || 'Unknown',
        decodedAt: new Date().toISOString()
      };

      console.log(`✅ VIN decoded successfully: ${decodedData.make} ${decodedData.model} (${decodedData.modelYear})`);
      return decodedData;

    } catch (error) {
      console.error('❌ NHTSA VIN decode error:', error.message);
      throw error;
    }
  }

  /**
   * Decode VIN using VinAudit API (Commercial)
   * @param {string} vin - Vehicle Identification Number
   * @returns {Promise<Object>} Decoded vehicle data with history
   */
  async decodeVinAudit(vin) {
    try {
      if (!this.vinaudit_key) {
        throw new Error('VinAudit API key not configured');
      }

      if (!vin || vin.length < 17) {
        throw new Error('Invalid VIN format');
      }

      console.log(`🔍 Decoding VIN with VinAudit: ${vin}`);

      const response = await axios.get(this.vinaudit_url, {
        params: {
          key: this.vinaudit_key,
          vin: vin
        },
        timeout: 5000
      });

      if (!response.data || response.data.status !== 'success') {
        throw new Error('VinAudit decode failed');
      }

      const data = response.data.data;
      
      const decodedData = {
        source: 'VinAudit',
        vin: vin,
        make: data.make || 'Unknown',
        model: data.model || 'Unknown',
        year: data.year || 'Unknown',
        body: data.body || 'Unknown',
        engine: data.engine || 'Unknown',
        transmission: data.transmission || 'Unknown',
        mileage: data.mileage || 'Unknown',
        title_status: data.title_status || 'Unknown',
        color: data.color || 'Unknown',
        decodedAt: new Date().toISOString()
      };

      console.log(`✅ VIN decoded with VinAudit: ${decodedData.make} ${decodedData.model}`);
      return decodedData;

    } catch (error) {
      console.error('❌ VinAudit decode error:', error.message);
      throw error;
    }
  }

  /**
   * Decode VIN using RapidAPI (Commercial)
   * @param {string} vin - Vehicle Identification Number
   * @returns {Promise<Object>} Decoded vehicle data
   */
  async decodeVinRapidAPI(vin) {
    try {
      if (!this.rapidapi_key) {
        throw new Error('RapidAPI key not configured');
      }

      if (!vin || vin.length < 17) {
        throw new Error('Invalid VIN format');
      }

      console.log(`🔍 Decoding VIN with RapidAPI: ${vin}`);

      const response = await axios.get('https://vin-decoder.p.rapidapi.com/decode', {
        params: { vin: vin },
        headers: {
          'X-RapidAPI-Key': this.rapidapi_key,
          'X-RapidAPI-Host': 'vin-decoder.p.rapidapi.com'
        },
        timeout: 5000
      });

      const decodedData = {
        source: 'RapidAPI',
        vin: vin,
        ...response.data,
        decodedAt: new Date().toISOString()
      };

      console.log(`✅ VIN decoded with RapidAPI`);
      return decodedData;

    } catch (error) {
      console.error('❌ RapidAPI decode error:', error.message);
      throw error;
    }
  }

  /**
   * Smart VIN decode - tries multiple sources
   * @param {string} vin - Vehicle Identification Number
   * @param {string} preferredSource - 'nhtsa', 'vinaudit', 'rapidapi', or 'auto'
   * @returns {Promise<Object>} Decoded vehicle data
   */
  async decodeVin(vin, preferredSource = 'auto') {
    try {
      // Try preferred source first
      if (preferredSource === 'nhtsa' || preferredSource === 'auto') {
        try {
          return await this.decodeVinNHTSA(vin);
        } catch (error) {
          if (preferredSource === 'nhtsa') throw error;
          console.log('⚠️  NHTSA failed, trying alternative sources...');
        }
      }

      if (preferredSource === 'vinaudit' || preferredSource === 'auto') {
        try {
          return await this.decodeVinAudit(vin);
        } catch (error) {
          if (preferredSource === 'vinaudit') throw error;
          console.log('⚠️  VinAudit failed, trying alternative sources...');
        }
      }

      if (preferredSource === 'rapidapi' || preferredSource === 'auto') {
        try {
          return await this.decodeVinRapidAPI(vin);
        } catch (error) {
          if (preferredSource === 'rapidapi') throw error;
          console.log('⚠️  RapidAPI failed');
        }
      }

      throw new Error('All VIN decoding services failed');

    } catch (error) {
      console.error('❌ VIN decode error:', error.message);
      throw error;
    }
  }

  /**
   * Format decoded VIN data for CRM
   * @param {Object} decodedData - Decoded VIN data
   * @returns {Object} Formatted data for CRM
   */
  formatForCRM(decodedData) {
    return {
      vin: decodedData.vin,
      make: decodedData.make,
      model: decodedData.model,
      year: decodedData.modelYear || decodedData.year,
      body_type: decodedData.bodyClass || decodedData.body,
      engine: decodedData.engine || `${decodedData.engineCylinders}cyl ${decodedData.engineDisplacement}cc`,
      transmission: decodedData.transmission,
      fuel_type: decodedData.fuelType,
      drive_type: decodedData.driveType,
      color: decodedData.color,
      mileage: decodedData.mileage,
      title_status: decodedData.title_status,
      source: decodedData.source,
      decoded_at: decodedData.decodedAt
    };
  }

  /**
   * Validate VIN format
   * @param {string} vin - Vehicle Identification Number
   * @returns {boolean} True if valid VIN format
   */
  validateVIN(vin) {
    if (!vin) return false;
    // Remove spaces and convert to uppercase
    const cleanVin = vin.replace(/\s/g, '').toUpperCase();
    // VIN should be 17 characters, alphanumeric (no I, O, Q)
    return /^[A-HJ-NPR-Z0-9]{17}$/.test(cleanVin);
  }

  /**
   * Extract VIN from text
   * @param {string} text - Text that may contain a VIN
   * @returns {string|null} Extracted VIN or null
   */
  extractVINFromText(text) {
    if (!text) return null;
    // Look for 17-character alphanumeric sequences (excluding I, O, Q)
    const vinPattern = /\b[A-HJ-NPR-Z0-9]{17}\b/i;
    const match = text.match(vinPattern);
    return match ? match[0].toUpperCase() : null;
  }
}

module.exports = new VINDecodingService();

