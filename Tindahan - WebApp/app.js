/**
 * Main Application Module
 * Orchestrates all functionality and event handlers
 */

class InventoryApp {

    async filterSalesReport() {
        try {
            const response = await api.request('GET', '/get_sales/');
            let sales = response.data || [];

            const startDate = document.getElementById('startDate').value;
            const endDate = document.getElementById('endDate').value;
            const itemId = document.getElementById('reportItemFilter').value;

            // Filter by item
            if (itemId) {
                sales = sales.filter(sale =>
                    sale.item_id == itemId
                );
            }

            // Filter by start date
            if (startDate) {
                sales = sales.filter(sale =>
                    new Date(sale.created_at) >= new Date(startDate)
                );
            }

            // Filter by end date
            if (endDate) {
                const end = new Date(endDate);
                end.setHours(23, 59, 59, 999);

                sales = sales.filter(sale =>
                    new Date(sale.created_at) <= end
                );
            }

            ui.displaySalesReport(sales);

        } catch (error) {
            console.error('Failed to filter sales:', error);
        }
    }

    async loadSales() {
        const tbody = document.getElementById('salesTableBody');
        tbody.innerHTML = `<tr><td colspan="7">Loading...</td></tr>`;

        try {
            const response = await api.request('GET', '/get_sales/');
            this.sales = response.data ?? [];

            ui.renderSalesTable(this.sales);

        } catch (error) {
            console.error(error);
            tbody.innerHTML = `<tr><td colspan="7">Failed to load sales</td></tr>`;
        }
    }

    constructor() {
        this.isLoggedIn = false;
        this.init();
    }

    /**
     * Initialize application
     */
    init() {
        this.checkLoginStatus();
        this.attachEventHandlers();
        this.setupModalHandlers();
    }


    /**
     * Check if user is logged in
     */
    checkLoginStatus() {
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);
        if (token) {
            this.isLoggedIn = true;
            ui.showScreen('dashboard');
            this.loadDashboard();
        } else {
            ui.showScreen('login');
        }
    }

    /**
     * Load dashboard data
     */
    async loadDashboard() {
        try {
            // Load user info
            const user = await api.getCurrentUser();
            ui.displayUserInfo(user);

            // Load items for sales form
            if (this.items) {
                ui.populateSalesForm(this.items);
                ui.populateSalesFilterItems(this.items);
            }
        } catch (error) {
            console.error('Failed to load dashboard:', error);
            if (error.status === 401) {
                this.logout();
            }
        }
    }

    /**
     * Attach all event handlers
     */
    attachEventHandlers() {


        document.getElementById('filterSalesBtn')
            .addEventListener('click', () => this.filterSales());

        document.getElementById('resetSalesBtn')
            .addEventListener('click', () => this.resetSalesFilters());
        // Login
        document.getElementById('loginForm').addEventListener('submit', (e) => this.handleLogin(e));

        // Navigation
        document.querySelectorAll('.nav-btn:not(.btn-logout)').forEach(btn => {
            btn.addEventListener('click', () => {
                const section = btn.dataset.section;
                ui.showSection(section);
                if (section === 'items') {
                    this.loadItems();
                }
                if (section === 'salesReport') {
                    this.loadSales();
                }
            });
        });

        // Logout
        document.getElementById('logoutBtn').addEventListener('click', () => this.logout());

        // Items
        document.getElementById('addItemBtn').addEventListener('click', () => {
            ui.clearForm('itemForm');
            document.getElementById('itemModalTitle').textContent = 'Add New Item';
            ui.openModal('itemModal');
        });

        document.getElementById('itemForm').addEventListener('submit', (e) => this.handleAddItem(e));
        document.getElementById('cancelItemBtn').addEventListener('click', () => {
            ui.closeModal('itemModal');
        });

        // Price Update
        document.getElementById('priceForm').addEventListener('submit', (e) => this.handleUpdatePrice(e));
        document.getElementById('cancelPriceBtn').addEventListener('click', () => {
            ui.closeModal('priceModal');
        });

        // Sales
        document.getElementById('saleForm').addEventListener('submit', (e) => this.handleCreateSale(e));

        document.getElementById('saleQuantity')
            .addEventListener('input', (e) => {
                console.log('typing:', e.target.value);
            });

        // Movement type change for conditional cost price field
        document.querySelectorAll('input[name="movementType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                const costPriceGroup = document.getElementById('costPriceGroup');
                if (e.target.value === 'in') {
                    costPriceGroup.style.display = 'block';
                    document.getElementById('saleCostPrice').required = true;
                } else {
                    costPriceGroup.style.display = 'none';
                    document.getElementById('saleCostPrice').required = false;
                    document.getElementById('saleCostPrice').value = '';
                }
            });
        });

        // Password change
        document.getElementById('passwordForm').addEventListener('submit', (e) => this.handlePasswordChange(e));

        // Load initial items
        this.loadItems();
    }

    /**
     * Setup modal close handlers
     */
    setupModalHandlers() {
        ui.setupModalHandlers('itemModal');
        ui.setupModalHandlers('priceModal');
    }

    // ========================
    // AUTHENTICATION
    // ========================

    /**
     * Handle login form submission
     */
    async handleLogin(e) {
        e.preventDefault();
        ui.resetFormErrors();
        ui.setButtonLoading('button[type="submit"]', true);

        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;

        try {
            const response = await api.login(username, password);

            // Store token
            if (response.token) {
                localStorage.setItem(STORAGE_KEYS.TOKEN, response.token);
            }
            if (response.user) {
                localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(response.user));
            }

            this.isLoggedIn = true;
            ui.showScreen('dashboard');
            this.loadDashboard();
            this.loadItems();

        } catch (error) {
            const message = error.data?.detail || error.data?.message || 'Invalid credentials. Please try again.';
            ui.showError('loginError', message);
        } finally {
            ui.setButtonLoading('button[type="submit"]', false);
        }
    }

    /**
     * Handle logout
     */
    async logout() {
        try {
            await api.logout();
        } catch (error) {
            console.error('Logout error:', error);
        } finally {
            localStorage.removeItem(STORAGE_KEYS.TOKEN);
            localStorage.removeItem(STORAGE_KEYS.USER);
            this.isLoggedIn = false;
            ui.showScreen('login');
            ui.clearForm('loginForm');
            ui.resetFormErrors();
        }
    }

    /**
     * Handle password change
     */
    async handlePasswordChange(e) {
        e.preventDefault();
        ui.clearErrors('password');

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (newPassword !== confirmPassword) {
            ui.showError('passwordError', 'New passwords do not match');
            return;
        }

        if (newPassword.length < 8) {
            ui.showError('passwordError', 'New password must be at least 8 characters');
            return;
        }

        ui.setButtonLoading('#passwordForm button[type="submit"]', true);

        try {
            await api.changePassword(currentPassword, newPassword);
            ui.showSuccess('passwordSuccess', 'Password updated successfully');
            ui.clearForm('passwordForm');
        } catch (error) {
            const message = error.data?.detail || error.data?.message || 'Failed to change password';
            ui.showError('passwordError', message);
        } finally {
            ui.setButtonLoading('#passwordForm button[type="submit"]', false);
        }
    }

    // ========================
    // ITEMS MANAGEMENT
    // ========================

    /**
     * Load items
     */
    async loadItems() {
        const container = document.getElementById('itemsList');
        container.innerHTML = '<div class="loading-spinner">Loading items...</div>';

        try {
            // Note: This assumes your Django API has a GET endpoint for items
            // If not, you'll need to add it or modify this section
            const items = await this.fetchItems();
            this.items = items;
            ui.displayItems(items);
            ui.populateSalesForm(items);
        } catch (error) {
            console.error('Failed to load items:', error);
            container.innerHTML = '<div class="text-center text-muted" style="grid-column: 1/-1; padding: 3rem;">Failed to load items. Please try again.</div>';
        }
    }

    /**
     * Fetch items from API
     * Note: You need to provide this endpoint
     */
    async fetchItems() {
        try {
            const response = await api.request('GET', '/get_items/');

            console.log('RAW RESPONSE:', response);

            return response.data ?? [];
        } catch (error) {
            console.warn('Failed to load items:', error);
            return [];
        }
    }

    /**
     * Handle add item form submission
     */
    async handleAddItem(e) {
        e.preventDefault();
        ui.clearErrors('itemForm');

        const itemData = {
            itemName: document.getElementById('itemName').value.trim(),
            currentPrice: document.getElementById('currentPrice').value,
            costPrice: document.getElementById('costPrice').value,
            currentStock: document.getElementById('currentStock').value
        };

        // Validation
        if (!itemData.itemName) {
            ui.showError('itemFormError', 'Item name is required');
            return;
        }

        if (parseFloat(itemData.currentPrice) <= 0) {
            ui.showError('itemFormError', 'Current price must be greater than 0');
            return;
        }

        if (parseFloat(itemData.costPrice) <= 0) {
            ui.showError('itemFormError', 'Cost price must be greater than 0');
            return;
        }

        ui.setButtonLoading('#itemForm button[type="submit"]', true);

        try {
            const response = await api.createItem(itemData);
            ui.showSuccess('itemFormError', 'Item created successfully');
            ui.closeModal('itemModal');
            ui.clearForm('itemForm');
            this.loadItems();
        } catch (error) {
            const message = error.data?.detail || error.data?.message || 'Failed to create item';
            ui.showError('itemFormError', message);
        } finally {
            ui.setButtonLoading('#itemForm button[type="submit"]', false);
        }
    }

    /**
     * Handle price update
     */
    async handleUpdatePrice(e) {
        e.preventDefault();
        ui.clearErrors('price');

        const itemId = document.getElementById('priceItemId').value;
        const newPrice = document.getElementById('newPrice').value;

        if (!newPrice || parseFloat(newPrice) <= 0) {
            ui.showError('priceFormError', 'Price must be greater than 0');
            return;
        }

        ui.setButtonLoading('#priceForm button[type="submit"]', true);

        try {
            await api.updateItemPrice(itemId, newPrice);
            ui.showSuccess('priceFormError', 'Price updated successfully');
            ui.closeModal('priceModal');
            this.loadItems();
        } catch (error) {
            const message = error.data?.detail || error.data?.message || 'Failed to update price';
            ui.showError('priceFormError', message);
        } finally {
            ui.setButtonLoading('#priceForm button[type="submit"]', false);
        }
    }

    // ========================
    // SALES MANAGEMENT
    // ========================

    /**
     * Handle create sale
     */
    async handleCreateSale(e) {
        console.log("🔥 CREATE SALE FIRED");
        e.preventDefault();
        ui.clearErrors('sale');

        const saleData = {
            itemId: document.getElementById('saleItemId').value,
            movementType: document.querySelector('input[name="movementType"]:checked')?.value,
            quantity: document.getElementById('saleQuantity').value,
            costPrice: document.getElementById('saleCostPrice').value
        };

        // Validation
        if (!saleData.itemId) {
            ui.showError('saleError', 'Please select an item');
            return;
        }

        if (!saleData.movementType) {
            ui.showError('saleError', 'Please select a movement type');
            return;
        }

        if (!saleData.quantity || parseInt(saleData.quantity) <= 0) {
            ui.showError('saleError', 'Quantity must be greater than 0');
            return;
        }

        if (saleData.movementType === 'in' && (!saleData.costPrice || parseFloat(saleData.costPrice) <= 0)) {
            ui.showError('saleError', 'Cost price is required for stock in');
            return;
        }

        ui.setButtonLoading('#saleForm button[type="submit"]', true);

        try {
            const response = await api.createSale(saleData);
            ui.showSuccess('saleSuccess', 'Movement recorded successfully');
            ui.clearForm('saleForm');
            document.getElementById('saleQuantity').value = '';
            document.getElementById('saleCostPrice').value = '';
            document.getElementById('costPriceGroup').style.display = 'none';

            // this.loadItems();
            // this.updateInventoryUI(this.items);
        } catch (error) {
            const message = error.data?.detail || error.data?.message || 'Failed to record movement';
            ui.showError('saleError', message);
        } finally {
            ui.setButtonLoading('#saleForm button[type="submit"]', false);
        }
    }

    updateInventoryUI(items) {
        this.items = items;
        ui.displayItems(items);
        ui.populateSalesForm(items);
    }

    filterSales() {
        const startDate = document.getElementById('salesStartDate').value;
        const endDate = document.getElementById('salesEndDate').value;
        const itemId = document.getElementById('reportItemFilter').value;  // Changed from salesFilterItem

        let filtered = [...this.sales];

        if (startDate) {
            filtered = filtered.filter(sale =>
                new Date(sale.created_at) >= new Date(startDate)
            );
        }

        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59);

            filtered = filtered.filter(sale =>
                new Date(sale.created_at) <= end
            );
        }

        if (itemId) {
            filtered = filtered.filter(sale =>
                String(sale.item_id) === String(itemId)
            );
        }

        ui.renderSalesTable(filtered);
    }

    resetSalesFilters() {
        document.getElementById('salesStartDate').value = '';
        document.getElementById('salesEndDate').value = '';
        document.getElementById('salesFilterItem').value = '';

        ui.renderSalesTable(this.sales);
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new InventoryApp();
});


