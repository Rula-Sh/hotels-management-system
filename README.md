# 🚀 Project Title: Hotels Hub

## 👥 Team Members

- Rula Hisham - Admin & Employee
- Areen Al-Shawabkeh - Customer

## 📚 Project Description

Hotels Hub is a comprehensive web application designed to simplify and enhance the hotel booking experience. Customers can easily search and browse hotels, book rooms, request additional services (like dining or healthcare), and track the progress of their requests. On the operational side, hotel employees can manage and process service requests to ensure customer satisfaction. Admin users oversee the entire platform by managing users, monitoring activity, and controlling booking approvals. The system aims to deliver a smooth, user-friendly, and efficient interface for both customers and hotel staff.

## 🌐 Technologies Used

- _Angular 16+ (Standalone APIs)_ – Modern Angular architecture without NgModules
- _SCSS & Bootstrap 5_ – Styling and responsive UI components
- _Bootstrap Icons & Font Awesome_ – Icon libraries for UI elements
- _Custom Internationalization (i18n)_ – Manual translation support for English and Arabic
- _JSON Server_ – Mock backend for testing and development
- \*PrimeNG Toast & Confirmation Service – For user notifications and confirmations
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

### ▶️ Run the Application

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
public
└───src
    ├───app
    │   ├───components
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
    │   │   ├───employee
    │   │   │   ├───requests
    │   │   │   ├───service-form
    │   │   │   └───services
    │   │   └───shared
    │   │       ├───auth
    │   │       │   ├───home-redirect
    │   │       │   ├───login
    │   │       │   ├───not-authorized
    │   │       │   ├───profile
    │   │       │   └───sign-up
    │   │       ├───footer
    │   │       ├───header
    │   │       ├───not-found
    │   │       ├───room-details
    │   │       └───rooms
    │   ├───directives
    │   ├───models
    │   ├───pipes
    │   └───services
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
- [x] Add skeleton loaders for async data states
- [x] Implement light/dark mode toggle

### 🌐 Internationalization

- [x] Integrate Angular i18n for translation support
- [x] Translate all static UI elements and messages
- [x] Translate dynamic messages in Toasts, ConfirmDialogs, and Forms
- [x] Provide Arabic logo and RTL support
- [x] Create language switcher in the header

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

- [x] Combine AddService/EditService into `ServiceForm`
- [x] Combine AddRoom/EditRoom into `RoomForm`
- [x] Use Rooms, RoomDetails Component in Admin, Customers, and Guests Pages

### 🛠️ Core Services

- [x] AuthService – Handle authentication and token storage
- [x] I18nService – Language and translation handling
- [x] UserService – Manage user CRUD and roles
- [x] RoomService – Manage rooms data and actions
- [x] ReservationService – Handle booking rooms data and actions
- [x] ServiceService – Manage service data and actions
- [x] UploadService – Handle image uploads (Cloudinary)
- [x] DashboardService – Provide analytics and system stats

### 🏨 Room Management

- [x] Restrict Add/Edit/Delete Room actions to Admin only
- [x] Allow customers to Book Room and View Services
- [x] Display multiple images in room listings
- [x] Add search, filter, and sorting in Rooms component
- [x] Add room availability

### 📋 Service Management

- [x] Add search, filter, and sorting to Services component
- [x] Allow employees to manage their services and requests
- [x] Automatically assign serviceType based on employee job title

### 👨‍💼 Employee Management

- [x] Enable Admin to add, update, and remove employees
- [x] Add “Fire Employee” (deactivate user) feature
- [x] Filter employees by job title or category

### 👤 User Profile

- [x] Combine View/Edit Profile in a single editable page
- [x] Add default profile picture for new users
- [x] Allow password update and image, and personal details change

### 📞 Phone Input

- [x] Install and configure `NgxIntlTelInputModule` for international phone numbers
- [x] Validate phone number input format

### 🌁 Image Upload & Management

- [x] Add image upload with real-time preview
- [x] Replace manual image URL input with Cloudinary integration
- [x] Support multiple image uploads for Rooms, Services, and profiles
- [x] Store image URLs array (`imagesUrl`) instead of single `imageUrl` for rooms

### 📊 DataTables & Lists

- [x] Use PrimeNG DataTable for listing Users, Rooms, and Services
- [x] Add pagination, search, sorting, and filtering

### 🧠 State Management

- [x] Handle subscriptions and properly unsubscribe to avoid memory leaks

### 🧩 Routing & Structure

- [x] Define and guard routes per user role (Admin, Employee, Customer)
- [x] Add shared routes/components for public access
- [x] Merge Rooms routes where shared (Admin + Customer)

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

## 🧪 Testing Steps

### 🔐 Login & Role Access

1- Login as Admin (email: admin@gmail.com, password: !Q23wewe) and ensure redirection to the Dashboard Home Page.
2- Login as Employee (email: employee@gmail.com, password: !Q23wewe) and ensure redirection to the Service Requests Home Page.
3- Login as Customer (email: customer@gmail.com, password: !Q23wewe) and ensure redirection to the Rooms Home Page.

### 🧑‍💼 Admin Role

1- Access the Dashboard to view system overview.
2- Navigate to Manage Users to view user details or add a new employee.
3- Navigate to Rooms to view room details, and add, edit, or delete rooms.
4- Navigate to Reservations to approve or reject room bookings.
5- Test the Room Form for input validity.

### 👷 Employee Role

1- Navigate to the Requests page to:

- Approve or reject pending service requests
- Complete active requests
- View completed requests
  2- Navigate to Services to view, update, add, or delete services.
  3- Test the Service Form for input validity.

### 👤 Customer Role

1- Access the Rooms Home Page to browse available hotels and rooms, view room details, and book a room.
2- Navigate to Room Details to view available services associated with the selected room.
3- Book a room and verify the reservation appears under My Reservations.
4- Navigate to Available Services to request services related to a booked room.

### 🌍 Internationalization Testing

1- Toggle between English and Arabic from the footer.
2- Verify proper translation of all UI elements and dynamic content.
3- Ensure layout direction changes correctly between LTR and RTL.
4- Confirm that toasts and confirmation messages are properly translated.

### ✅ Form Validation

1- Submit forms with invalid data (e.g., incorrect phone number format, missing required fields).
2- Confirm that appropriate translated validation messages are displayed.

### 📱 Responsive Design

- Resize the browser window or test on mobile devices to verify:
  - Navigation bar collapses into a burger menu
  - Pages remain readable and functional
  - Layout adapts correctly in RTL mode

### 🖼️ Image Upload

- Upload images for rooms, services, or user profiles.
- Check restrictions on file type and size.
- Confirm real-time previews and successful uploads to Cloudinary.

### 🔔 Toast Notifications

- Perform actions like booking, editing services, or submitting invalid forms.
- Ensure PrimeNG Toast notifications appear correctly and clearly.

### 📊 DataTables

- Visit pages with user/service/room listings.
- Use features like search, sort, filter, and pagination.

### 🔒 Security & Routing

- Attempt to access restricted routes (e.g., /admin) as a Customer.
- Confirm that redirection or access denial is properly enforced.
