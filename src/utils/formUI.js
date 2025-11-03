/**
 * Form UI Helper
 * Handles displaying validation errors and success messages
 */

class FormUIHelper {
    /**
     * Show error for a field
     */
    static showFieldError(fieldName, errorMessage) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        const formField = field.closest('.form-field') || field.closest('.form-group');
        if (!formField) return;

        // Add error class
        formField.classList.add('error');

        // Create or update error message
        let errorElement = formField.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formField.appendChild(errorElement);
        }
        errorElement.textContent = errorMessage;
        errorElement.style.display = 'block';

        // Add red border to input
        field.style.borderColor = 'var(--error)';
        field.style.boxShadow = '0 0 0 3px rgba(239, 68, 68, 0.1)';
    }

    /**
     * Clear error for a field
     */
    static clearFieldError(fieldName) {
        const field = document.getElementById(fieldName);
        if (!field) return;

        const formField = field.closest('.form-field') || field.closest('.form-group');
        if (!formField) return;

        // Remove error class
        formField.classList.remove('error');

        // Hide error message
        const errorElement = formField.querySelector('.error-message');
        if (errorElement) {
            errorElement.style.display = 'none';
        }

        // Reset border
        field.style.borderColor = '';
        field.style.boxShadow = '';
    }

    /**
     * Display all validation errors
     */
    static displayErrors(errors) {
        // Clear all previous errors
        document.querySelectorAll('.form-field, .form-group').forEach(field => {
            field.classList.remove('error');
            const errorMsg = field.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
        });

        // Display new errors
        for (const [fieldName, errorMessages] of Object.entries(errors)) {
            if (errorMessages && errorMessages.length > 0) {
                this.showFieldError(fieldName, errorMessages[0]);
            }
        }
    }

    /**
     * Show success message
     */
    static showSuccess(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-success';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">✅</span>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Show error message
     */
    static showError(message, duration = 4000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-error';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">❌</span>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--error);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Show warning message
     */
    static showWarning(message, duration = 3500) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-warning';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">⚠️</span>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--warning);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Show info message
     */
    static showInfo(message, duration = 3000) {
        const toast = document.createElement('div');
        toast.className = 'toast toast-info';
        toast.innerHTML = `
            <div style="display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 1.2rem;">ℹ️</span>
                <span>${message}</span>
            </div>
        `;
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--accent-blue);
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, duration);
    }

    /**
     * Clear all field errors
     */
    static clearAllErrors() {
        document.querySelectorAll('.form-field, .form-group').forEach(field => {
            field.classList.remove('error');
            const errorMsg = field.querySelector('.error-message');
            if (errorMsg) errorMsg.style.display = 'none';
            const input = field.querySelector('input, select, textarea');
            if (input) {
                input.style.borderColor = '';
                input.style.boxShadow = '';
            }
        });
    }

    /**
     * Disable form submission
     */
    static disableForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = true;
        });
    }

    /**
     * Enable form submission
     */
    static enableForm(formId) {
        const form = document.getElementById(formId);
        if (!form) return;
        form.querySelectorAll('input, select, textarea, button').forEach(el => {
            el.disabled = false;
        });
    }
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }

    .error-message {
        color: var(--error);
        font-size: 0.85rem;
        margin-top: 0.5rem;
        display: none;
        font-weight: 500;
    }

    .form-field.error input,
    .form-field.error select,
    .form-field.error textarea,
    .form-group.error input,
    .form-group.error select,
    .form-group.error textarea {
        border-color: var(--error) !important;
        box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
    }
`;
document.head.appendChild(style);

// Export for use in HTML
window.FormUIHelper = FormUIHelper;

