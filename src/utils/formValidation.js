/**
 * Form Validation Utility
 * Provides comprehensive validation for all dashboard forms
 */

class FormValidator {
    constructor() {
        this.errors = {};
        this.rules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/,
            vin: /^[A-HJ-NPR-Z0-9]{17}$/,
            url: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
            zipCode: /^\d{5}(-\d{4})?$/,
            currency: /^\d+(\.\d{2})?$/,
        };
    }

    /**
     * Validate a single field
     */
    validateField(fieldName, value, rules) {
        this.errors[fieldName] = [];

        if (!rules) return true;

        // Required validation
        if (rules.required && (!value || value.toString().trim() === '')) {
            this.errors[fieldName].push(`${this.formatFieldName(fieldName)} is required`);
            return false;
        }

        if (!value) return true; // Skip other validations if empty and not required

        // Min length
        if (rules.minLength && value.length < rules.minLength) {
            this.errors[fieldName].push(
                `${this.formatFieldName(fieldName)} must be at least ${rules.minLength} characters`
            );
        }

        // Max length
        if (rules.maxLength && value.length > rules.maxLength) {
            this.errors[fieldName].push(
                `${this.formatFieldName(fieldName)} must not exceed ${rules.maxLength} characters`
            );
        }

        // Pattern matching
        if (rules.pattern && !this.rules[rules.pattern].test(value)) {
            this.errors[fieldName].push(
                `${this.formatFieldName(fieldName)} format is invalid`
            );
        }

        // Custom validation
        if (rules.custom && !rules.custom(value)) {
            this.errors[fieldName].push(rules.customMessage || 'Invalid value');
        }

        // Min value
        if (rules.min !== undefined && parseFloat(value) < rules.min) {
            this.errors[fieldName].push(
                `${this.formatFieldName(fieldName)} must be at least ${rules.min}`
            );
        }

        // Max value
        if (rules.max !== undefined && parseFloat(value) > rules.max) {
            this.errors[fieldName].push(
                `${this.formatFieldName(fieldName)} must not exceed ${rules.max}`
            );
        }

        return this.errors[fieldName].length === 0;
    }

    /**
     * Validate entire form
     */
    validateForm(formData, validationRules) {
        this.errors = {};
        let isValid = true;

        for (const [fieldName, rules] of Object.entries(validationRules)) {
            const value = formData[fieldName];
            if (!this.validateField(fieldName, value, rules)) {
                isValid = false;
            }
        }

        return isValid;
    }

    /**
     * Get all errors
     */
    getErrors() {
        return this.errors;
    }

    /**
     * Get error for specific field
     */
    getFieldError(fieldName) {
        return this.errors[fieldName] ? this.errors[fieldName][0] : null;
    }

    /**
     * Format field name for display
     */
    formatFieldName(fieldName) {
        return fieldName
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase())
            .trim();
    }

    /**
     * Clear all errors
     */
    clearErrors() {
        this.errors = {};
    }
}

// Validation rules for different forms
const VALIDATION_RULES = {
    customer: {
        firstName: { required: true, minLength: 2, maxLength: 50 },
        lastName: { required: true, minLength: 2, maxLength: 50 },
        email: { required: true, pattern: 'email' },
        phone: { required: true, pattern: 'phone' },
        address: { required: false, maxLength: 200 },
        city: { required: false, maxLength: 50 },
        state: { required: false, maxLength: 2 },
        zipCode: { required: false, pattern: 'zipCode' },
    },
    vehicle: {
        make: { required: true, minLength: 2, maxLength: 50 },
        model: { required: true, minLength: 2, maxLength: 50 },
        year: { required: true, min: 1900, max: new Date().getFullYear() + 1 },
        vin: { required: true, pattern: 'vin' },
        color: { required: false, maxLength: 30 },
        mileage: { required: false, min: 0, max: 999999 },
        price: { required: false, pattern: 'currency' },
    },
    lead: {
        customerId: { required: true },
        source: { required: true },
        status: { required: true },
        interest: { required: false, maxLength: 100 },
        notes: { required: false, maxLength: 500 },
    },
    call: {
        customerId: { required: true },
        direction: { required: true },
        status: { required: true },
        duration: { required: false, min: 0, max: 86400 },
        notes: { required: false, maxLength: 1000 },
    },
    appointment: {
        title: { required: true, minLength: 5, maxLength: 200 },
        customerId: { required: true },
        type: { required: true },
        startTime: { required: true },
        endTime: { required: true },
        location: { required: false, maxLength: 100 },
        description: { required: false, maxLength: 500 },
    },
};

// Export for use in HTML
window.FormValidator = FormValidator;
window.VALIDATION_RULES = VALIDATION_RULES;

