# 🚀 Hotels Hub

## 👥 Team Members

- Rula Hisham - Admin & Employee
- Areen Al-Shawabkeh - Customer

## 📚 Project Description

Hotels Hub is a web app that simplifies hotel bookings and service management. Customers can search for rooms, book them, and track service requests (e.g., dining, healthcare), while staff manage requests efficiently. Admins oversee users, bookings, and platform activity—ensuring a seamless experience for all.

## 🌟 Main Features  

### 🔒 **Security & Access**  
- **Role-based access control** (Admin, Employee, Customer)  
- **Route Guards** – Protect sensitive routes from unauthorized users  

### 🌍 **Internationalization (i18n)**  
- **Multi-language support** (English + Arabic)  
- **RTL/LTR dynamic switching** – Full layout direction adjustment  
- **JSON-based translations** – Easy to extend for new languages  

### 🖼️ **Media & Uploads**  
- **Cloudinary Integration** – Image upload and perview
- **Multi-image uploads** – For rooms, services, and profiles  

### 📱 **Responsive UI/UX**  
- **Mobile-first design** – Optimized for all screen sizes  
- **Bootstrap 5 + SCSS** – Customizable themes and variables  
- **PrimeNG + Font Awesome** – Rich UI components and icons  

### ⚡ **Performance & Scalability**  
- **Lazy-loaded modules** – Faster initial page loads  
- **Modular architecture** – Standalone components/services  

### 🔄 **State & Data Management**  
- **Reactive Forms** – Real-time validation with error feedback  
- **DataTables & Pagination** – Sort, filter, and browse datasets  

### 🛠️ **Developer-Friendly**  
- **Mock Backend (JSON Server)** – Test APIs without a live server  
- **Custom Services** – Auth, i18n, Uploads, etc.  
- **Clean Code Practices** – Unsubscriptions, typed models, and solid principles  

## 🌐 Technologies Used

- _Angular 16+ (Standalone APIs)_ – Modern Angular architecture without NgModules
- _SCSS & Bootstrap 5_ – Styling and responsive UI components
- _Bootstrap Icons & Font Awesome_ – Icon libraries for UI elements
- _Custom Internationalization (i18n)_ – Manual translation support for English and Arabic
- _JSON Server_ – Mock backend for testing and development
- PrimeNG Toast & Confirmation Service – For user notifications and confirmations
- _Cloudinary_ – Cloud-based image hosting and transformation
- _libphonenumber-js_ – Phone number validation and formatting
- _DataTables_ – Tabular data handling with sorting and filtering

## 🚦 Setup Instructions

### 📦 Install Dependencies

```bash
# Run Angular app and JSON Server together
npm start
# Run Angular and JSON Server separately
ng serve
json-server --watch backend/db.json --port 3000
```

### ▶️ Run Application

```bash
# Install core dependencies
npm install

# Install required libraries
npm install bootstrap@5.3.6
npm i @fortawesome/angular-fontawesome
npm install json-server --save-dev
npm i --save-dev concurrently
npm install primeng @primeng/themes
npm i @cloudinary/url-gen @cloudinary/ng
npm i ngx-intl-tel-input
npm i angular-datatables@9.0.2
```

### 🔧 Add start Script to package.json

```json
"scripts": {
  "start": "concurrently \"ng serve\" \"json-server --watch backend/db.json --port 3000\""
}
```

## 📁 Folder Structure

```bash
├───backend
    └───db.json
├───src
    ├───app
    │   ├───core
    │   │   └───services
    │   ├───pages
    │   │   ├───admin
    │   │   │   ├───add-employee
    │   │   │   ├───dashboard
    │   │   │   ├───manage-users
    │   │   │   ├───reservations
    │   │   │   ├───room-form
    │   │   │   └───user-details
    │   │   ├───customer
    │   │   │   ├───available-services
    │   │   │   └───my-reservations
    │   │   └───employee
    │   │       ├───requests
    │   │       ├───service-form
    │   │       └───services
    │   └───shared
    │       ├───components
    │       │   ├───auth
    │       │   │   ├───home-redirect
    │       │   │   ├───login
    │       │   │   ├───not-found
    │       │   │   ├───profile
    │       │   │   └───sign-up
    │       │   ├───layout
    │       │   │   ├───footer
    │       │   │   └───header
    │       │   └───room
    │       │       ├───room-details
    │       │       └───rooms
    │       ├───directives
    │       ├───models
    │       └───pipes
    ├───assets
    │   ├───i18n
    │   └───images
    └───styles
```

## 📸 Screenshots

Include at least 3:

- Login Page
- Role Dashboard
- Responsive View (mobile/tablet)

## 🔐 Role-Based Access

- Customer: Browse hotels, book rooms, request special services, and track reservation status.

- Employee: View, manage, and fulfill customer service requests, update hotel service availability, and maintain day-to-day hotel operations.

- Admin: Full control over the platform including user management, system monitoring, booking approvals or rejections, and configuration of rooms.

## 🌍 i18n

- Custom Angular service for dynamic language loading
- Supports English (LTR) and Arabic (RTL) with direction adjustment
- Loads translations from JSON files (assets/i18n/en.json, ar.json)

## ✅ Features Checklist

### 🎨 UI/UX & Styling

- [x] Improve overall styling and modernize the color palette
- [x] Implement responsive design for all screen sizes (mobile, tablet, desktop)
- [x] Add burger menu, logo, profile picture, and form icons
- [x] Add tooltips and `alt` attributes for accessibility and user guidance
- [x] Display "No [data] available" messages when lists are empty
- [x] Add PrimeNG Toast for notification messages
- [x] Use Font Awesome and Bootstrap Icons for consistent iconography
- [x] Use SCSS/CSS variables for theme consistency
- [ ] Implement light/dark mode toggle

### 🌐 Internationalization

- [x] Integrate Angular i18n for translation support including RTL
- [x] Translate all static UI elements and messages
- [x] Translate dynamic messages in Toasts, ConfirmDialogs, and Forms
- [ ] Create language switcher in the header

### 📦 Components by Role

#### 🔐 Shared Components

- [x] HomeRedirect, Header, Footer
- [x] Login, SignUp, Profile
- [x] NotFound, Rooms, RoomDetails

#### 👑 Admin Components

- [x] Dashboard, ManageUsers
- [x] AddEmployee, UserDetails
- [x] RoomForm, Reservations

#### 👷 Employee Components

- [x] Requests, ServiceForm, Services

#### 🧍 Customer Components

- [x] AvailableServices, MyReservations

#### 🧩 Reusable Components

- [x] Use Rooms, RoomDetails Component in Admin, Customers, and Guests Pages
- [x] Combine AddService/EditService into `ServiceForm`
- [x] Combine AddRoom/EditRoom into `RoomForm`
- [ ] Implement Notifications on Header

### 🛠️ Core Services

- [x] AuthService – Handle authentication and token storage
- [x] UserService – Manage user CRUD and roles
- [x] RoomService – Manage rooms data and actions
- [x] ReservationService – Handle booking rooms data and actions
- [x] ServiceService – Manage service data and actions
- [x] UploadService – Handle image uploads (Cloudinary)
- [x] I18nService – Language and translation handling
- [x] DashboardService – Provide analytics and system stats

### 🏨 Room Management

- [x] Restrict Add/Edit/Delete room actions to Admin only
- [x] Allow customers to book available rooms and view services
- [x] Display multiple images in room listings
- [x] Add search, filter, and sorting in Rooms component

### 📋 Service Management

- [x] Allow employees to manage their services and requests
- [x] Add search, filter, and sorting to Services component
- [x] Automatically assign serviceType based on employee job title

### 👨‍💼 Employee Management

- [x] Assign Admin to add, and fire employees
- [x] Filter job title by category when adding employee

### 👤 User Profile

- [x] Combine View/Edit Profile in a single editable page
- [x] Add default profile picture for new users
- [x] Allow password update and image, and personal details change

### 🌁 Image Upload & Management

- [x] Add image upload with real-time preview
- [x] Support multiple image uploads for Rooms, Services, and profiles

### 📊 DataTables & Lists

- [x] Use PrimeNG DataTable for listing Users
- [x] Add pagination, search, sorting, and filtering

### 🧠 State Management

- [x] Handle subscriptions and properly unsubscribe to avoid memory leaks

### 🧩 Routing & Structure

- [x] Define and guard routes by user role (Admin, Employee, Customer)
- [x] Add shared routes/components for public access
- [x] Merge Rooms routes where shared (Admin + Customer)
- [x] Use childeren and implement Lazy Loading

### 📑 Form Handling & Validation

- [x] Add reactive forms with validations across all components
- [x] Add custom validators for phone, password, etc.
- [x] Provide translated validation messages for each input
- [x] Use dropdowns and image upload fields where needed

### ⚙️ General App Setup

- [x] Install and configure PrimeNG, Bootstrap, Font Awesome, Bootstrap Icons
- [x] Configure Angular i18n and NgxIntlTelInput
- [x] Set up routing, guards, and initial layout
- [x] Ensure mobile-first design from the beginning
- [ ] Restructure db.json
- [ ] Add Hotel model
- [ ] Add forgot password

## 🧪 Testing Guide

### 🔐 Authentication & Authorization
#### Role-Based Access Testing
1. **Admin Login**
   - Credentials: `admin@gmail.com` / `123123`
   - Expected: Redirect to Dashboard Home Page
2. **Employee Login**
   - Credentials: `emp1@gmail.com` / `123123`
   - Expected: Redirect to Service Requests Page
3. **Customer Login**
   - Credentials: `customer1@gmail.com` / `123123`
   - Expected: Redirect to Rooms Home Page

### 👨‍💼 Admin Functionality
1. **Dashboard**
   - Verify system overview metrics and charts
2. **User Management**
   - View all users and their details
   - Test add employee form validation
3. **Room Management**
   - CRUD operations on rooms
   - Test room form validation
   - Verify image upload functionality
4. **Reservations**
   - Approve/Reject  bookings

### 👷 Employee Workflows
1. **Service Requests**
   - Approve pending requests 
   - Mark active requests as completed
   - View request history
2. **Service Catalog**
   - CRUD operations on service
   - Test service form validation
   - Verify image upload functionality

### 👤 Customer Experience
1. **Room Booking**
   - Browse available rooms
   - View detailed room information
   - Test booking flow
2. **My Reservations**
   - Verify bookings appearance
   - Check reservation details
   - View reservation Services
3. **Service Requests**
   - Request services for booked rooms
   - View request status updates

### 🌐 Internationalization
1. **Language Switching**
   - Toggle between EN/AR in footer
   - Verify all UI elements translate
2. **Layout Direction**
   - Confirm proper RTL/LTR switching
3. **Dynamic Content**
   - Check translated:
     - Form errors
     - Toast messages
     - Tables and cards content

### ✔️ Validation & UX
1. **Form Validation**
   - Submit invalid forms (empty/malformed)
   - Verify helpful error messages
2. **Responsive Design**
   - Test on mobile/tablet:
     - Burger menu functionality
     - Readable layouts
     - RTL adaptation
3. **Notifications**
   - Verify PrimeNG toasts appear for:
     - Success/error states
     - System messages

### 🛡️ Security & Edge Cases
1. **Route Protection**
   - Attempt unauthorized access to:
     - `/admin` as customer
     - `/employee` as customer
   - Verify proper redirection
2. **Data Integrity**
   - Test pagination/search/filter
   - Verify CRUD operations reflect instantly
3. **Media Handling**
   - Upload test images:
     - Verify Cloudinary integration
     - Check file type/size restrictions
     - Confirm preview functionality
