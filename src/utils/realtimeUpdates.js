/**
 * Real-time Dashboard Updates
 * Handles automatic refresh of statistics and data when records change
 */

class RealtimeUpdates {
    constructor() {
        this.refreshIntervals = {};
        this.isEnabled = true;
        this.refreshRates = {
            stats: 30000,      // 30 seconds
            customers: 45000,  // 45 seconds
            vehicles: 45000,
            leads: 45000,
            calls: 30000,      // 30 seconds (more frequent for calls)
            appointments: 30000,
            messages: 20000,   // 20 seconds (most frequent)
            tasks: 40000,
            campaigns: 60000,
            emergencyCalls: 15000, // 15 seconds (very frequent)
            serviceRequests: 45000,
            serviceProviders: 60000
        };
    }

    /**
     * Start auto-refresh for a specific data type
     */
    startAutoRefresh(dataType, refreshFunction) {
        if (!this.isEnabled) return;

        // Clear existing interval if any
        if (this.refreshIntervals[dataType]) {
            clearInterval(this.refreshIntervals[dataType]);
        }

        // Set initial refresh
        const rate = this.refreshRates[dataType] || 30000;

        // Call function immediately
        try {
            refreshFunction();
        } catch (error) {
            console.error(`Error in initial refresh for ${dataType}:`, error);
        }

        // Set up interval
        this.refreshIntervals[dataType] = setInterval(() => {
            if (this.isEnabled) {
                try {
                    refreshFunction();
                } catch (error) {
                    console.error(`Error in auto-refresh for ${dataType}:`, error);
                }
            }
        }, rate);

        console.log(`✅ Auto-refresh started for ${dataType} (${rate}ms)`);
    }

    /**
     * Stop auto-refresh for a specific data type
     */
    stopAutoRefresh(dataType) {
        if (this.refreshIntervals[dataType]) {
            clearInterval(this.refreshIntervals[dataType]);
            delete this.refreshIntervals[dataType];
            console.log(`⏹️ Auto-refresh stopped for ${dataType}`);
        }
    }

    /**
     * Stop all auto-refresh intervals
     */
    stopAllAutoRefresh() {
        Object.keys(this.refreshIntervals).forEach(dataType => {
            clearInterval(this.refreshIntervals[dataType]);
        });
        this.refreshIntervals = {};
        console.log('⏹️ All auto-refresh intervals stopped');
    }

    /**
     * Enable/disable auto-refresh globally
     */
    setEnabled(enabled) {
        this.isEnabled = enabled;
        console.log(`🔄 Auto-refresh ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Manually trigger refresh for a data type
     */
    async triggerRefresh(dataType, refreshFunction) {
        try {
            await refreshFunction();
            console.log(`🔄 Manual refresh triggered for ${dataType}`);
        } catch (error) {
            console.error(`Error in manual refresh for ${dataType}:`, error);
        }
    }

    /**
     * Update refresh rate for a data type
     */
    setRefreshRate(dataType, rate) {
        this.refreshRates[dataType] = rate;
        console.log(`⏱️ Refresh rate updated for ${dataType}: ${rate}ms`);
    }

    /**
     * Get current refresh rate for a data type
     */
    getRefreshRate(dataType) {
        return this.refreshRates[dataType] || 30000;
    }

    /**
     * Get all active refresh intervals
     */
    getActiveRefreshes() {
        return Object.keys(this.refreshIntervals);
    }

    /**
     * Show refresh status in console
     */
    showStatus() {
        console.log('=== Real-time Updates Status ===');
        console.log(`Enabled: ${this.isEnabled}`);
        console.log(`Active Refreshes: ${Object.keys(this.refreshIntervals).length}`);
        console.log('Active Data Types:', this.getActiveRefreshes());
        console.log('Refresh Rates:', this.refreshRates);
    }
}

// Create global instance
window.realtimeUpdates = new RealtimeUpdates();

// Export for use
window.RealtimeUpdates = RealtimeUpdates;

