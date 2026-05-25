/**
 * API Service Module
 * Handles all HTTP requests to Django REST API
 */

class APIService {
    constructor(config) {
        this.baseUrl = config.BASE_URL;
        this.endpoints = config.ENDPOINTS;
        this.timeout = config.TIMEOUT;
    }

    /**
     * Make HTTP request with error handling
     */
    async request(method, endpoint, data = null, isFormData = false) {
        const url = `${this.baseUrl}${endpoint}`;
        const token = localStorage.getItem(STORAGE_KEYS.TOKEN);

        const options = {
            method: method,
            headers: {
                'Accept': 'application/json',
            }
        };

        // Add token if available
        if (token) {
            options.headers['Authorization'] = `Token ${token}`;
        }

        // Add body for POST/PUT requests
        if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
            if (isFormData) {
                options.body = data;
            } else {
                options.headers['Content-Type'] = 'application/json';
                options.body = JSON.stringify(data);
            }
        }

        try {
            const response = await Promise.race([
                fetch(url, options),
                new Promise((_, reject) =>
                    setTimeout(() => reject(new Error('Request timeout')), this.timeout)
                )
            ]);

            // Handle response
            const contentType = response.headers.get('content-type');
            let responseData = null;

            if (contentType && contentType.includes('application/json')) {
                responseData = await response.json();
            } else {
                responseData = await response.text();
            }

            // Check if response is successful
            if (!response.ok) {
                const error = new Error(responseData.detail || responseData.message || 'API Error');
                error.status = response.status;
                error.data = responseData;
                throw error;
            }

            return responseData;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    // ========================
    // AUTHENTICATION ENDPOINTS
    // ========================

    /**
     * Login user
     */
    async login(username, password) {
        const data = await this.request(
            'POST',
            this.endpoints.AUTH.LOGIN,
            { username, password }
        );
        return data;
    }

    /**
     * Logout user
     */
    async logout() {
        const data = await this.request(
            'POST',
            this.endpoints.AUTH.LOGOUT
        );
        return data;
    }

    /**
     * Get current user information
     */
    async getCurrentUser() {
        const data = await this.request(
            'GET',
            this.endpoints.AUTH.ME
        );
        return data;
    }

    /**
     * Change password
     */
    async changePassword(currentPassword, newPassword) {
        const data = await this.request(
            'PUT',
            this.endpoints.AUTH.CHANGE_PASSWORD,
            { current_password: currentPassword, new_password: newPassword }
        );
        return data;
    }

    // ========================
    // ITEMS ENDPOINTS
    // ========================

    /**
     * Create new item
     */
    async createItem(itemData) {
        const data = await this.request(
            'POST',
            this.endpoints.ITEMS.CREATE,
            {
                item_name: itemData.itemName,
                current_price: parseFloat(itemData.currentPrice),
                current_stock: parseInt(itemData.currentStock),
                cost_price: parseFloat(itemData.costPrice)
            }
        );
        return data;
    }


    /**
     * Update item price
     */
    async updateItemPrice(itemId, newPrice) {
        const data = await this.request(
            'PATCH',
            this.endpoints.ITEMS.UPDATE_PRICE,
            {
                item_id: itemId,
                selling_price: parseFloat(newPrice)
            }
        );
        return data;
    }

    // ========================
    // SALES ENDPOINTS
    // ========================

    /**
     * Create sale movement (stock in/out)
     */
    async createSale(saleData) {
        const payload = {
            item_id: parseInt(saleData.itemId),
            movement_type: saleData.movementType,
            quantity: parseInt(saleData.quantity)
        };

        // Add cost_price only for "in" movements
        if (saleData.movementType === 'in' && saleData.costPrice) {
            payload.cost_price = parseFloat(saleData.costPrice);
        }

        const data = await this.request(
            'POST',
            this.endpoints.SALES.CREATE,
            payload
        );

        console.log("Sale payload", saleData);
        console.log("final payload", payload)
        return data;
    }

    // Get Sales
    async getSales() {
        const data = await this.request(
            'GET',
            '/get_sales/'
        );
        return data;
    }
}

// Initialize API service
const api = new APIService(API_CONFIG);
