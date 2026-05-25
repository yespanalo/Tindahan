/**
 * UI Module
 * Handles DOM manipulation, screen transitions, and user interface updates
 */

class UIManager {

    populateSalesFilterItems(items) {
        const select = document.getElementById('salesFilterItem');

        select.innerHTML = `
        <option value="">All Items</option>
    ` + items.map(item => `
        <option value="${item.item_id}">
            ${this.escapeHtml(item.item_name)}
        </option>
    `).join('');
    }

    renderSalesTable(sales) {
        const tbody = document.getElementById('salesTableBody');

        if (!sales || sales.length === 0) {
            tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding:20px;">
                    No sales found
                </td>
            </tr>
        `;
            return;
        }

        tbody.innerHTML = sales.map(sale => {
            const total = (sale.quantity || 0) * (sale.sell_price || 0);

            return `
            <tr>
                <td>${sale.id}</td>
                <td>${this.escapeHtml(sale.item_name)}</td>
                <td>
                    <span class="badge ${sale.movement_type}">
                        ${sale.movement_type}
                    </span>
                </td>
                <td>${sale.quantity}</td>
                <td>₱${Number(sale.sell_price ?? 0).toFixed(2)}</td>
                <td>₱${total.toFixed(2)}</td>
                <td>${new Date(sale.created_at).toLocaleString()}</td>
            </tr>
        `;
        }).join('');
    }
    constructor() {
        this.currentScreen = 'login';
        this.currentSection = 'items';
        this.items = [];
        this.user = null;
    }

    // ========================
    // SCREEN MANAGEMENT
    // ========================

    /**
     * Switch between screens
     */
    showScreen(screenName) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        document.getElementById(screenName + 'Screen').classList.add('active');
        this.currentScreen = screenName;
    }

    /**
     * Switch between sections
     */
    showSection(sectionName) {
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        document.getElementById(sectionName + 'Section').classList.add('active');

        // Update nav buttons
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById('nav' + sectionName.charAt(0).toUpperCase() + sectionName.slice(1))?.classList.add('active');

        this.currentSection = sectionName;
    }

    // ========================
    // MODAL MANAGEMENT
    // ========================

    /**
     * Open modal
     */
    openModal(modalId) {
        document.getElementById(modalId).classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close modal
     */
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
        document.body.style.overflow = 'auto';
    }

    /**
     * Setup modal close handlers
     */
    setupModalHandlers(modalId) {
        const modal = document.getElementById(modalId);

        modal.querySelector('.modal-close')?.addEventListener('click', () => {
            this.closeModal(modalId);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.closeModal(modalId);
            }
        });
    }

    // ========================
    // ITEMS MANAGEMENT
    // ========================

    /**
     * Display items list
     */
    displayItems(items) {
        this.items = items;
        const container = document.getElementById('itemsList');

        if (!items || items.length === 0) {
            container.innerHTML = '<div class="text-center text-muted" style="grid-column: 1/-1; padding: 3rem;">No items found. Create one to get started.</div>';
            return;
        }

        container.innerHTML = items.map(item => this.createItemCard(item)).join('');
        this.attachItemEventHandlers();
    }

    /**
     * Create item card HTML
     */
    createItemCard(item) {
        const stockStatus = this.getStockStatus(item.current_stock);

        const currentPrice = Number(item.current_price ?? 0);

        return `
        <div class="item-card">
            <div class="item-header">
                <div class="item-name">${this.escapeHtml(item.item_name)}</div>
                <span class="item-status status-${stockStatus.class}">
                    ${stockStatus.label}
                </span>
            </div>

            <div class="item-info">
                <div class="info-row">
                    <span class="info-label">Current Stock</span>
                    <span class="info-value">${item.current_stock ?? 0}</span>
                </div>

                <div class="info-row">
                    <span class="info-label">Current Price</span>
                    <span class="info-value">₱${currentPrice.toFixed(2)}</span>
                </div>
            </div>

            <div class="item-actions">
                <button class="btn btn-small btn-primary item-btn edit-price-btn"
                    data-id="${item.item_id}"
                    data-name="${this.escapeHtml(item.item_name)}">
                    Edit Price
                </button>
            </div>
        </div>
    `;
    }


    displaySalesReport(sales) {
        const tbody = document.getElementById('salesTableBody');

        if (!sales.length) {
            tbody.innerHTML = `
            <tr>
                <td colspan="7">No sales found</td>
            </tr>
        `;
            return;
        }

        tbody.innerHTML = sales.map(sale => {
            const total = sale.quantity * sale.sell_price;

            return `
            <tr>
                <td>${sale.id}</td>
                <td>${sale.item_name}</td>
                <td>${sale.movement_type}</td>
                <td>${sale.quantity}</td>
                <td>₱${Number(sale.sell_price).toFixed(2)}</td>
                <td>₱${total.toFixed(2)}</td>
                <td>${new Date(sale.created_at).toLocaleString()}</td>
            </tr>
        `;
        }).join('');
    }

    /**
     * Get stock status
     */
    getStockStatus(stock) {
        if (stock <= 0) {
            return { label: 'Out of Stock', class: 'out-of-stock' };
        } else if (stock <= APP_CONSTANTS.MIN_STOCK_THRESHOLD) {
            return { label: 'Low Stock', class: 'low-stock' };
        }
        return { label: 'In Stock', class: 'in-stock' };
    }

    /**
     * Attach event handlers to item buttons
     */
    attachItemEventHandlers() {
        document.querySelectorAll('.edit-price-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const itemId = e.target.dataset.id;
                const itemName = e.target.dataset.name;
                this.populatePriceModal(itemId, itemName);
                this.openModal('priceModal');
            });
        });
    }

    /**
     * Populate price modal with item data
     */
    populatePriceModal(itemId, itemName) {
        document.getElementById('priceItemId').value = itemId;
        document.getElementById('priceItemName').value = itemName;
        document.getElementById('newPrice').value = '';
    }

    /**
     * Populate sales form with items
     */
    populateSalesForm(items) {
        // Sales form dropdown
        const saleSelect = document.getElementById('saleItemId');

        saleSelect.innerHTML =
            '<option value="">Choose an item...</option>' +
            items.map(item =>
                `<option value="${item.item_id}">
                ${this.escapeHtml(item.item_name)}
            </option>`
            ).join('');

        // Report filter dropdown
        const reportSelect = document.getElementById('reportItemFilter');

        if (reportSelect) {
            reportSelect.innerHTML =
                '<option value="">All Items</option>' +
                items.map(item =>
                    `<option value="${item.item_id}">
                    ${this.escapeHtml(item.item_name)}
                </option>`
                ).join('');
        }
    }
    // ========================
    // USER INFORMATION
    // ========================

    /**
     * Display user information
     */
    displayUserInfo(user) {
        this.user = user;
        const container = document.getElementById('userInfo');

        const infoHtml = `
            <div class="info-item">
                <span class="info-item-label">Email</span>
                <span class="info-item-value">${this.escapeHtml(user.email || 'N/A')}</span>
            </div>
            <div class="info-item">
                <span class="info-item-label">Username</span>
                <span class="info-item-value">${this.escapeHtml(user.username || 'N/A')}</span>
            </div>
            <div class="info-item">
                <span class="info-item-label">First Name</span>
                <span class="info-item-value">${this.escapeHtml(user.first_name || 'Not set')}</span>
            </div>
            <div class="info-item">
                <span class="info-item-label">Last Name</span>
                <span class="info-item-value">${this.escapeHtml(user.last_name || 'Not set')}</span>
            </div>
        `;

        container.innerHTML = infoHtml;
    }

    // ========================
    // FORM MANAGEMENT
    // ========================

    /**
     * Clear form
     */
    clearForm(formId) {
        document.getElementById(formId).reset();
    }

    /**
     * Clear error messages
     */
    clearErrors(formId) {
        const errorElement = document.getElementById(formId + 'Error');
        if (errorElement) {
            errorElement.classList.remove('show');
            errorElement.textContent = '';
        }
    }

    /**
     * Show error message
     */
    showError(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
        }
    }

    /**
     * Show success message
     */
    showSuccess(elementId, message) {
        const element = document.getElementById(elementId);
        if (element) {
            element.textContent = message;
            element.classList.add('show');
            setTimeout(() => {
                element.classList.remove('show');
            }, APP_CONSTANTS.TOAST_DURATION);
        }
    }

    /**
     * Set form button loading state
     */
    setButtonLoading(buttonSelector, isLoading) {
        const button = document.querySelector(buttonSelector);
        if (button) {
            button.disabled = isLoading;
            const originalText = button.dataset.originalText || button.textContent;
            if (isLoading) {
                button.dataset.originalText = originalText;
                button.textContent = 'Loading...';
            } else {
                button.textContent = originalText;
            }
        }
    }

    // ========================
    // UTILITIES
    // ========================

    /**
     * Escape HTML to prevent XSS
     */
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    /**
     * Get form data as object
     */
    getFormData(formId) {
        const form = document.getElementById(formId);
        const formData = new FormData(form);
        const data = {};
        formData.forEach((value, key) => {
            data[key] = value;
        });
        return data;
    }

    /**
     * Reset form errors
     */
    resetFormErrors() {
        document.querySelectorAll('.error-message').forEach(el => {
            el.classList.remove('show');
            el.textContent = '';
        });
    }
}

// Initialize UI manager
const ui = new UIManager();
