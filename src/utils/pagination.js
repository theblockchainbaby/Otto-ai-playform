/**
 * Pagination and Sorting Utility
 * Handles pagination controls and column sorting for data tables
 */

class PaginationManager {
    constructor() {
        this.currentPage = 1;
        this.pageSize = 25;
        this.totalItems = 0;
        this.sortField = null;
        this.sortDirection = 'asc'; // 'asc' or 'desc'
        this.pageSizeOptions = [10, 25, 50, 100];
    }

    /**
     * Set page size
     */
    setPageSize(size) {
        if (this.pageSizeOptions.includes(size)) {
            this.pageSize = size;
            this.currentPage = 1; // Reset to first page
            return true;
        }
        return false;
    }

    /**
     * Go to specific page
     */
    goToPage(pageNumber) {
        const maxPage = this.getTotalPages();
        if (pageNumber >= 1 && pageNumber <= maxPage) {
            this.currentPage = pageNumber;
            return true;
        }
        return false;
    }

    /**
     * Go to next page
     */
    nextPage() {
        return this.goToPage(this.currentPage + 1);
    }

    /**
     * Go to previous page
     */
    previousPage() {
        return this.goToPage(this.currentPage - 1);
    }

    /**
     * Get total number of pages
     */
    getTotalPages() {
        return Math.ceil(this.totalItems / this.pageSize);
    }

    /**
     * Get start index for current page
     */
    getStartIndex() {
        return (this.currentPage - 1) * this.pageSize;
    }

    /**
     * Get end index for current page
     */
    getEndIndex() {
        return Math.min(this.getStartIndex() + this.pageSize, this.totalItems);
    }

    /**
     * Set sort field and direction
     */
    setSortField(field, direction = null) {
        if (this.sortField === field && direction === null) {
            // Toggle direction if same field clicked
            this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
        } else {
            this.sortField = field;
            this.sortDirection = direction || 'asc';
        }
        this.currentPage = 1; // Reset to first page
    }

    /**
     * Get sort indicator for column header
     */
    getSortIndicator(field) {
        if (this.sortField !== field) return '';
        return this.sortDirection === 'asc' ? ' ↑' : ' ↓';
    }

    /**
     * Get pagination info string
     */
    getPaginationInfo() {
        if (this.totalItems === 0) return 'No items';
        return `Showing ${this.getStartIndex() + 1} to ${this.getEndIndex()} of ${this.totalItems}`;
    }

    /**
     * Get query parameters for API
     */
    getQueryParams() {
        return {
            page: this.currentPage,
            limit: this.pageSize,
            sortBy: this.sortField,
            sortOrder: this.sortDirection
        };
    }

    /**
     * Reset pagination
     */
    reset() {
        this.currentPage = 1;
        this.sortField = null;
        this.sortDirection = 'asc';
        this.totalItems = 0;
    }
}

/**
 * Create pagination controls HTML
 */
function createPaginationControls(paginationManager, onPageChange, onPageSizeChange) {
    const totalPages = paginationManager.getTotalPages();
    const currentPage = paginationManager.currentPage;

    let html = `
        <div class="pagination-controls" style="display: flex; align-items: center; justify-content: space-between; padding: 1.5rem; background: var(--card-bg); border-radius: 12px; margin-top: 1.5rem; gap: 2rem;">
            <!-- Left: Pagination Info -->
            <div style="font-size: 0.9rem; color: var(--text-muted);">
                ${paginationManager.getPaginationInfo()}
            </div>

            <!-- Center: Page Navigation -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <button class="pagination-btn" onclick="${onPageChange}(${currentPage - 1})" ${currentPage === 1 ? 'disabled' : ''} style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); cursor: pointer; transition: all 0.2s;">
                    ← Previous
                </button>

                <div style="display: flex; gap: 0.25rem; align-items: center;">
    `;

    // Add page buttons
    const maxButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
    let endPage = Math.min(totalPages, startPage + maxButtons - 1);
    if (endPage - startPage < maxButtons - 1) {
        startPage = Math.max(1, endPage - maxButtons + 1);
    }

    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="${onPageChange}(1)" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); cursor: pointer;">1</button>`;
        if (startPage > 2) {
            html += `<span style="padding: 0 0.5rem;">...</span>`;
        }
    }

    for (let i = startPage; i <= endPage; i++) {
        const isActive = i === currentPage;
        html += `
            <button class="pagination-btn" onclick="${onPageChange}(${i})" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: ${isActive ? 'var(--primary-yellow)' : 'var(--card-bg)'}; color: ${isActive ? '#000' : 'var(--text-light)'}; cursor: pointer; font-weight: ${isActive ? '600' : '400'};">
                ${i}
            </button>
        `;
    }

    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += `<span style="padding: 0 0.5rem;">...</span>`;
        }
        html += `<button class="pagination-btn" onclick="${onPageChange}(${totalPages})" style="padding: 0.5rem 0.75rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); cursor: pointer;">${totalPages}</button>`;
    }

    html += `
                </div>

                <button class="pagination-btn" onclick="${onPageChange}(${currentPage + 1})" ${currentPage === totalPages ? 'disabled' : ''} style="padding: 0.5rem 1rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); cursor: pointer; transition: all 0.2s;">
                    Next →
                </button>
            </div>

            <!-- Right: Page Size Selector -->
            <div style="display: flex; align-items: center; gap: 0.5rem;">
                <label style="font-size: 0.9rem; color: var(--text-muted);">Items per page:</label>
                <select onchange="${onPageSizeChange}(this.value)" style="padding: 0.5rem; border: 1px solid var(--border-color); border-radius: 6px; background: var(--card-bg); color: var(--text-light); cursor: pointer;">
    `;

    paginationManager.pageSizeOptions.forEach(size => {
        html += `<option value="${size}" ${size === paginationManager.pageSize ? 'selected' : ''}>${size}</option>`;
    });

    html += `
                </select>
            </div>
        </div>
    `;

    return html;
}

/**
 * Add sorting to table headers
 */
function addTableSorting(tableSelector, paginationManager, onSort) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach((header, index) => {
        const fieldName = header.dataset.field || header.textContent.toLowerCase().replace(/\s+/g, '_');
        header.style.cursor = 'pointer';
        header.style.userSelect = 'none';
        header.style.padding = '0.5rem';

        header.addEventListener('click', () => {
            paginationManager.setSortField(fieldName);
            if (onSort) {
                onSort(fieldName, paginationManager.sortDirection);
            }
        });

        // Add sort indicator
        const indicator = paginationManager.getSortIndicator(fieldName);
        if (indicator) {
            header.textContent += indicator;
        }
    });
}

/**
 * Highlight sortable columns
 */
function highlightSortableColumns(tableSelector) {
    const table = document.querySelector(tableSelector);
    if (!table) return;

    const headers = table.querySelectorAll('th');
    headers.forEach(header => {
        header.style.backgroundColor = 'rgba(255, 210, 55, 0.05)';
        header.style.fontWeight = '600';
        header.addEventListener('mouseenter', () => {
            header.style.backgroundColor = 'rgba(255, 210, 55, 0.1)';
        });
        header.addEventListener('mouseleave', () => {
            header.style.backgroundColor = 'rgba(255, 210, 55, 0.05)';
        });
    });
}

// Export for use
window.PaginationManager = PaginationManager;
window.createPaginationControls = createPaginationControls;
window.addTableSorting = addTableSorting;
window.highlightSortableColumns = highlightSortableColumns;

