# Quick Start Guide - 5 Minutes to Live

## 📋 What You Get

A complete, production-ready inventory management frontend with:
- ✅ Modern, responsive UI (mobile, tablet, desktop)
- ✅ Authentication (login/logout/password change)
- ✅ Item management (create, view, update price)
- ✅ Stock movements (in/out tracking)
- ✅ Real-time data sync with Django API
- ✅ Error handling & loading states
- ✅ Clean, modular code structure

---

## 🚀 Super Quick Setup (3 steps)

### Step 1: Download Files
Download all 6 JavaScript/HTML files to your folder:
```
project/
├── index.html
├── styles.css
├── config.js
├── api.js
├── ui.js
└── app.js
```

### Step 2: Update API URL (if needed)
Edit `config.js` - change this line if your API isn't on localhost:8000:
```javascript
BASE_URL: 'http://127.0.0.1:8000/api',
```

### Step 3: Open in Browser
Double-click `index.html` OR run a local server:
```bash
# Python
python -m http.server 8080

# Node.js
npx http-server
```

Then visit: **http://localhost:8080**

---

## 🎯 Features at a Glance

### 1. Login Page
```
Email: admin@example.com
Password: password123
```
- Auto-saves token
- Persists on page reload
- Logout clears everything

### 2. Items Dashboard
- **View all items** with stock status
- **Create new items** with pricing
- **Update prices** instantly
- See profit margins automatically

### 3. Stock Movements
- **Stock In**: Add inventory + cost price
- **Stock Out**: Remove inventory automatically
- Updates quantities in real-time

### 4. User Profile
- View account details
- Change password
- Auto-logout on 401 errors

---

## 📱 Responsive Design

Automatically adapts to:
- 📱 **Mobile** (320px+): Single column, touch-friendly
- 📊 **Tablet** (768px+): Two columns
- 💻 **Desktop** (1024px+): Full grid layout

---

## 🔌 API Endpoints Expected

Your Django backend should have:

```
POST   /api/admins/login/           - Login
POST   /api/admins/logout/          - Logout  
GET    /api/admins/me/              - User info
PUT    /api/admins/change_password/ - Change password
POST   /api/create_items/           - Create item
PUT    /api/update_item_price/      - Update price
POST   /api/create_sale/            - Stock movement
```

See `DJANGO_SETUP.md` for complete backend code.

---

## ⚙️ Configuration Options

### API Configuration (`config.js`)

```javascript
const API_CONFIG = {
    BASE_URL: 'http://127.0.0.1:8000/api',  // Your API URL
    TIMEOUT: 10000,                         // Request timeout (ms)
};

const APP_CONSTANTS = {
    MIN_STOCK_THRESHOLD: 5,    // Red flag at 5 or less items
    TOAST_DURATION: 3000       // Message display time (ms)
};
```

---

## 📊 Code Structure Explained

```
index.html  ← All HTML elements
   ↓
config.js   ← API URLs & constants
   ↓
api.js      ← Network requests
   ↓
ui.js       ← DOM updates & user feedback
   ↓
app.js      ← Business logic & event handlers
```

**Each module is independent** - easy to understand and modify!

---

## 🔒 Security Features

✅ **Tokens in localStorage** - Auto-added to API requests
✅ **HTML escaping** - Prevents XSS attacks
✅ **Input validation** - Client + backend checks
✅ **Auto logout** - 401 errors trigger logout
✅ **No sensitive data in console** - Safe debugging

---

## 🎨 Customization (5 minutes)

### Change Colors
Edit `styles.css` variables:
```css
:root {
    --primary: #2563eb;     /* Change this */
    --success: #10b981;     /* And this */
    --error: #ef4444;       /* And this */
}
```

### Change Logo
Edit `index.html` navbar:
```html
<div class="navbar-brand">
    <h2>Your Company</h2>  <!-- Change here -->
</div>
```

### Add New Form Field
```javascript
// 1. Add HTML input
<input type="text" id="myField" required>

// 2. Read value in app.js
const myData = document.getElementById('myField').value;

// 3. Send to API in api.js
payload.my_field = myData;
```

---

## 🐛 Troubleshooting

| Problem | Solution |
|---------|----------|
| White screen | Check browser console (F12) for errors |
| CORS error | Install `django-cors-headers` on backend |
| 404 API errors | Check `config.js` - correct the URL |
| Login fails | Verify Django user exists & credentials correct |
| Items not loading | Backend might not have GET /items/ endpoint |

---

## 🚀 To Production

1. **Minify code** (optional but recommended)
   ```bash
   npm install -g terser csso-cli
   terser app.js -o app.min.js
   csso styles.css -o styles.min.css
   ```

2. **Update API URL** in `config.js`
   ```javascript
   BASE_URL: 'https://your-api.com/api',  // Use HTTPS!
   ```

3. **Deploy files** to:
   - AWS S3 + CloudFront
   - GitHub Pages
   - Netlify (drag & drop)
   - Your own server (Nginx/Apache)

4. **Update CORS** on Django:
   ```python
   CORS_ALLOWED_ORIGINS = [
       "https://your-frontend.com",
   ]
   ```

---

## 💡 Pro Tips

### Tip 1: Use Browser DevTools
```
F12 → Network tab → See all API calls
F12 → Console tab → Check for errors
```

### Tip 2: Test API with cURL
```bash
curl -X POST http://localhost:8000/api/admins/login/ \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"pass"}'
```

### Tip 3: Add Logging
```javascript
// In api.js
console.log('API Request:', method, endpoint);
console.log('Response:', data);
```

### Tip 4: Offline Support
Add Service Worker to cache files:
```javascript
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js');
}
```

---

## 📞 Getting Help

### Before asking for help:
1. Check browser console: `F12 → Console`
2. Check Network tab: `F12 → Network`
3. Verify Django backend is running: `http://localhost:8000`
4. Verify API endpoint exists: Test with cURL

### Common Errors:

**"XMLHttpRequest error"** → Backend not running or CORS issue
- Solution: `python manage.py runserver` on backend

**"Unexpected token in JSON"** → API returning HTML instead of JSON
- Solution: Check endpoint URL in `config.js`

**"401 Unauthorized"** → Invalid token or expired session
- Solution: Clear localStorage and login again

---

## 📦 File Checklist

Before deploying, ensure you have:

- [ ] `index.html` - Main HTML
- [ ] `styles.css` - All styling
- [ ] `config.js` - API configuration
- [ ] `api.js` - Network requests
- [ ] `ui.js` - DOM utilities
- [ ] `app.js` - Application logic
- [ ] Django backend running
- [ ] CORS enabled on Django
- [ ] Token authentication setup

---

## 🎓 Learning Resources

### JavaScript
- MDN Web Docs: https://developer.mozilla.org/
- Fetch API: https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API

### Django REST
- DRF Docs: https://www.django-rest-framework.org/
- Token Auth: https://www.django-rest-framework.org/api-guide/authentication/

### Frontend Best Practices
- Web.dev: https://web.dev/
- CSS-Tricks: https://css-tricks.com/

---

## ✨ What Makes This Special

✅ **Zero Dependencies** - No jQuery, React, or Vue needed
✅ **Modular Design** - Easy to understand and extend
✅ **Production Ready** - Error handling, validation, security
✅ **Responsive** - Looks great on all devices
✅ **Well Documented** - Comments in every file
✅ **REST Compliant** - Works with any JSON API

---

## 🎯 Next Steps

1. **Get the files** → Download all 6 files
2. **Configure API** → Update `config.js` if needed
3. **Open in browser** → Double-click `index.html`
4. **Login** → Use your Django admin credentials
5. **Start managing** → Create items, track stock!

---

## 📝 Version Info

- **Version**: 1.0.0
- **Compatible**: Modern browsers (Chrome, Firefox, Safari, Edge)
- **API**: Django REST Framework
- **License**: MIT

---

## 🤝 Support

For detailed setup instructions:
- See `README.md` for complete documentation
- See `DJANGO_SETUP.md` for Django configuration
- Check browser console for errors: `F12 → Console`

---

**You're all set! Happy managing! 🚀**

Need help? Check the documentation files included with your download.
