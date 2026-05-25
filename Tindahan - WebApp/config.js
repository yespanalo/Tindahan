// API Configuration
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',
    ENDPOINTS: {
        AUTH: {
            LOGIN: '/admins/login/',
            LOGOUT: '/admins/logout/',
            ME: '/admins/me/',
            CHANGE_PASSWORD: '/admins/change_password/'
        },
        ITEMS: {
            CREATE: '/create_items/',
            UPDATE_PRICE: '/update_selling_price/',
            GET_ITEMS: '/get_items/'
        },
        SALES: {
            CREATE: '/create_sale/'
        }
    },
    TIMEOUT: 10000 // 10 seconds
};

// Local storage keys
const STORAGE_KEYS = {
    TOKEN: 'auth_token',
    USER: 'user_data'
};

// Application constants
const APP_CONSTANTS = {
    MIN_STOCK_THRESHOLD: 5,
    TOAST_DURATION: 3000
};
