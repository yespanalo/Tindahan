# Inventory Management Frontend - Complete Documentation

## 📋 Project Overview

A modern, responsive inventory management dashboard built with vanilla JavaScript, HTML, and CSS. Integrates with Django REST API to manage items, stock movements, and user accounts.

---

## 📁 Project Structure

```
project-root/
├── index.html          # Main HTML file
├── styles.css          # All CSS styling
├── config.js           # API configuration and constants
├── api.js              # API service layer
├── ui.js               # UI management utilities
├── app.js              # Main application logic
└── README.md           # This file
```

---

## 🚀 Getting Started

### Prerequisites
- A modern web browser (Chrome, Firefox, Safari, Edge)
- Django backend running on `http://127.0.0.1:8000`
- Internet connection

### Installation

1. **Place all files in a web-accessible directory**

```bash
# All files should be in the same directory
your-project/
├── index.html
├── styles.css
├── config.js
├── api.js
├── ui.js
├── app.js
```

2. **Open in a browser**
   - Simply open `index.html` in your web browser
   - Or use a local server: `python -m http.server 8080`
   - Then visit `http://localhost:8080`

3. **Configure API URL (if needed)**
   - Edit `config.js` to change the API base URL
   - Default: `http://127.0.0.1:8000/api`

---

## 🔧 Configuration

### API Configuration (`config.js`)

Modify the `API_CONFIG` object to match your backend:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',  // Change this
    ENDPOINTS: {
        AUTH: { ... },
        ITEMS: { ... },
        SALES: { ... }
    },
    TIMEOUT: 10000  // Request timeout in milliseconds
};
```

### Application Constants

```javascript
const APP_CONSTANTS = {
    MIN_STOCK_THRESHOLD: 5,      // Stock level warning threshold
    TOAST_DURATION: 3000         // Message display duration (ms)
};
```

---

## 📱 Features & Usage

### 1. Authentication

#### Login
- Navigate to the login screen
- Enter your admin credentials (email and password)
- The token is automatically stored in browser's localStorage
- Automatic token validation on page reload

#### Logout
- Click "Logout" button in the navbar
- Clears token and redirects to login

#### Password Change
1. Go to "Profile" section
2. Fill in current and new passwords
3. Passwords must match and be at least 8 characters

### 2. Inventory Management

#### Add New Item
1. Click "+ Add Item" button
2. Fill in item details:
   - **Item Name**: Product name
   - **Current Price**: Selling price
   - **Cost Price**: Purchase/production cost
   - **Initial Stock**: Starting quantity
3. Click "Save Item"

#### Update Item Price
1. Click "Edit Price" on any item card
2. Enter new price
3. Click "Update Price"

#### View Items
- Browse all items in the Items section
- See current stock, price, cost, and margin %
- Visual stock status indicators:
  - 🟢 **In Stock**: Normal inventory level
  - 🟡 **Low Stock**: Below 5 units (configurable)
  - 🔴 **Out of Stock**: Zero or negative

### 3. Stock Movement (Sales)

#### Record Stock In (Purchase/Receiving)
1. Go to "Sales" section
2. Select item from dropdown
3. Choose "Stock In" movement type
4. Enter quantity
5. Enter cost price
6. Click "Record Movement"

#### Record Stock Out (Sales/Removal)
1. Go to "Sales" section
2. Select item from dropdown
3. Choose "Stock Out" movement type
4. Enter quantity
5. Click "Record Movement"
   (Cost price not needed for outgoing stock)

---

## 🔌 API Integration

### Authentication Endpoints

**Login**
```javascript
POST /api/admins/login/
Body: { "email": "user@example.com", "password": "password" }
Response: { "token": "...", "user": {...} }
```

**Get Current User**
```javascript
GET /api/admins/me/
Headers: { "Authorization": "Bearer <token>" }
Response: { "id": 1, "email": "...", "username": "...", ... }
```

**Change Password**
```javascript
PUT /api/admins/change_password/
Body: { "current_password": "old", "new_password": "new" }
```

**Logout**
```javascript
POST /api/admins/logout/
```

### Items Endpoints

**Create Item**
```javascript
POST /api/create_items/
Body: {
  "item_name": "Pancit Canton",
  "current_price": 14,
  "current_stock": 2,
  "cost_price": 10
}
```

**Update Item Price**
```javascript
PUT /api/update_item_price/
Body: {
  "item_id": 9,
  "new_price": 15
}
```

### Sales Endpoints

**Create Sale - Stock In**
```javascript
POST /api/create_sale/
Body: {
  "item_id": 9,
  "movement_type": "in",
  "quantity": 6,
  "cost_price": 9
}
```

**Create Sale - Stock Out**
```javascript
POST /api/create_sale/
Body: {
  "item_id": 9,
  "movement_type": "out",
  "quantity": 6
}
```

---

## 🎨 Styling & Customization

### CSS Variables
All colors and spacing are defined as CSS variables in `styles.css`:

```css
:root {
    --primary: #2563eb;              /* Main brand color */
    --primary-dark: #1d4ed8;         /* Darker primary */
    --success: #10b981;              /* Success/positive */
    --error: #ef4444;                /* Error/negative */
    --warning: #f59e0b;              /* Warning state */
    /* ... more variables */
}
```

### Customizing Colors
Edit the CSS variables in `styles.css` root selector:

```css
:root {
    --primary: #your-color;
    --success: #your-color;
    /* ... etc */
}
```

### Responsive Breakpoints
- **Desktop**: Full layout (> 1024px)
- **Tablet**: Adjusted columns (768px - 1024px)
- **Mobile**: Single column (< 768px)

---

## 🔒 Security Features

### Token Management
- Tokens stored in browser localStorage
- Automatically added to request headers
- Cleared on logout

### Input Validation
- Client-side validation before API calls
- XSS protection via HTML escaping
- Form field validation

### Error Handling
- Graceful error messages
- Network timeout handling (10 seconds)
- Automatic logout on 401 errors

### Best Practices
- Never expose sensitive data in console
- Use HTTPS in production
- Implement CORS properly on backend
- Validate all inputs on backend too

---

## 📊 Code Structure

### `config.js`
- API endpoints configuration
- Storage keys for localStorage
- Application constants

### `api.js`
- `APIService` class for HTTP requests
- Methods for all API endpoints
- Error handling and request formatting
- Token management

### `ui.js`
- `UIManager` class for DOM manipulation
- Screen/section switching
- Modal management
- Form utilities
- Item display and formatting

### `app.js`
- `InventoryApp` class (main controller)
- Event handler attachment
- Business logic for each feature
- Data flow coordination

---

## 🐛 Troubleshooting

### Issue: "Failed to fetch" or CORS error
**Solution**: Ensure Django backend is running and CORS is enabled
```python
# In Django settings.py
INSTALLED_APPS = [
    'corsheaders',
]
MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
]
CORS_ALLOWED_ORIGINS = [
    "http://localhost:8080",
    "http://127.0.0.1:8080",
]
```

### Issue: Login fails with 404
**Solution**: Check that API endpoints are correct in `config.js`
- Ensure backend routes match the endpoints defined

### Issue: Items not loading
**Solution**: Your backend may not have a GET items endpoint
- Add `GET /api/items/` endpoint to your Django backend
- Or modify `fetchItems()` in `app.js` to handle your API structure

### Issue: Token expires or session lost
**Solution**: Implement token refresh in `api.js`
```javascript
// Add this to the request method
if (response.status === 401) {
    // Call refresh endpoint
    // Or redirect to login
}
```

---

## 🔄 Data Flow

```
User Input (Form)
    ↓
Event Handler (app.js)
    ↓
Validation
    ↓
API Call (api.js)
    ↓
Backend Processing
    ↓
Response
    ↓
UI Update (ui.js)
    ↓
User Feedback
```

---

## 📈 Performance Optimization

### Already Implemented
- Modular code structure for easy caching
- CSS variables for efficient styling
- Event delegation where possible
- Minimal DOM manipulation

### Recommendations for Production
- Minify CSS and JavaScript
- Implement lazy loading for large item lists
- Add pagination to item displays
- Use Service Workers for offline support
- Implement caching strategies

---

## 🚀 Deployment

### Hosting Options

**Option 1: Static File Server**
```bash
# Using Python
python -m http.server 3000

# Using Node.js http-server
npx http-server -p 3000
```

**Option 2: Cloud Storage**
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps

**Option 3: Traditional Server**
- Nginx/Apache with static files
- Include proper CORS headers

### Important Notes
- Update `API_CONFIG.BASE_URL` to your production API URL
- Ensure backend is accessible from frontend origin
- Configure proper CORS headers on backend
- Use HTTPS in production
- Implement authentication token refresh mechanism

---

## 📝 Example: Adding a New Feature

### Scenario: Add item search

**1. Update HTML** (index.html)
```html
<input type="text" id="searchInput" placeholder="Search items...">
```

**2. Add API method** (api.js)
```javascript
async searchItems(query) {
    return await this.request('GET', `/items/?search=${query}`);
}
```

**3. Add UI method** (ui.js)
```javascript
displaySearchResults(items) {
    // Display filtered items
}
```

**4. Add event handler** (app.js)
```javascript
document.getElementById('searchInput').addEventListener('input', (e) => {
    this.searchItems(e.target.value);
});
```

---

## 🤝 Support & Contribution

For issues or questions:
1. Check browser console for error messages
2. Verify API endpoints are correct
3. Ensure Django backend is running
4. Check network tab in DevTools
5. Review this documentation

---

## 📄 License

This project is provided as-is for use with your Django inventory system.

---

## 🎯 Quick Reference

### Key Functions

```javascript
// Login
app.handleLogin(event)

// Load items
app.loadItems()

// Add item
app.handleAddItem(event)

// Update price
app.handleUpdatePrice(event)

// Create sale
app.handleCreateSale(event)

// Logout
app.logout()
```

### Key DOM Elements

```javascript
document.getElementById('loginForm')        // Login form
document.getElementById('itemForm')         // Add item form
document.getElementById('priceForm')        // Price update form
document.getElementById('saleForm')         // Sales form
document.getElementById('itemsList')        // Items container
document.getElementById('userInfo')         // User profile
```

### localStorage Keys

```javascript
localStorage.getItem('auth_token')    // Auth token
localStorage.getItem('user_data')     // User info
```

---

**Last Updated**: May 2026  
**Version**: 1.0.0
