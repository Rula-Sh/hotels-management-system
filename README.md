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

- [ ] Improve overall styling and modernize the color palette
- [ ] Implement responsive design for all screen sizes (mobile, tablet, desktop)
- [ ] Add burger menu, logo, profile picture, and form icons
- [ ] Add tooltips and `alt` attributes for accessibility and user guidance
- [ ] Display "No [data] available" messages when lists are empty
- [ ] Add PrimeNG Toast for notification messages
- [ ] Use Font Awesome and Bootstrap Icons for consistent iconography
- [ ] Use SCSS/CSS variables for theme consistency
- [ ] Add skeleton loaders for async data states
- [ ] Implement light/dark mode toggle

### 🌐 Internationalization

- [ ] Integrate Angular i18n for translation support
- [ ] Translate all static UI elements and messages
- [ ] Translate dynamic messages in Toasts, ConfirmDialogs, and Forms
- [ ] Provide Arabic logo and RTL support
- [ ] Create language switcher in the header

### 📦 Components by Role

#### 🔐 Shared Components

- [ ] HomeRedirect, Header, Footer
- [ ] Login, SignUp, Profile
- [ ] NotFound, Rooms, RoomDetails

#### 👑 Admin Components

- [ ] Dashboard, ManageUsers
- [ ] AddEmployee, UserDetails
- [ ] RoomForm, Reservations

#### 👷 Employee Components

- [ ] Requests, ServiceForm, Services

#### 🧍 Customer Components

- [ ] AvailableServices, MyReservations

#### 🧩 Reusable Components

- [ ] Combine AddService/EditService into `ServiceForm`
- [ ] Combine AddRoom/EditRoom into `RoomForm`
- [ ] Use Rooms, RoomDetails Component in Admin, Customers, and Guests Pages

### 🛠️ Core Services

- [ ] AuthService – Handle authentication and token storage
- [ ] I18nService – Language and translation handling
- [ ] UserService – Manage user CRUD and roles
- [ ] RoomService – Manage rooms data and actions
- [ ] ReservationService – Handle booking rooms data and actions
- [ ] ServiceService – Manage service data and actions
- [ ] UploadService – Handle image uploads (Cloudinary)
- [ ] DashboardService – Provide analytics and system stats

### 🏨 Room Management

- [ ] Restrict Add/Edit/Delete Room actions to Admin only
- [ ] Allow customers to Book Room and View Services
- [ ] Display multiple images in room listings
- [ ] Add search, filter, and sorting in Rooms component
- [ ] Add room availability

### 📋 Service Management

- [ ] Add search, filter, and sorting to Services component
- [ ] Allow employees to manage their services and requests
- [ ] Automatically assign serviceType based on employee job title

### 👨‍💼 Employee Management

- [ ] Enable Admin to add, update, and remove employees
- [ ] Add “Fire Employee” (deactivate user) feature
- [ ] Filter employees by job title or category

### 👤 User Profile

- [ ] Combine View/Edit Profile in a single editable page
- [ ] Add default profile picture for new users
- [ ] Allow password update and image, and personal details change

### 📞 Phone Input

- [ ] Install and configure `NgxIntlTelInputModule` for international phone numbers
- [ ] Validate phone number input format

### 🌁 Image Upload & Management

- [ ] Add image upload with real-time preview
- [ ] Replace manual image URL input with Cloudinary integration
- [ ] Support multiple image uploads for Rooms, Services, and profiles
- [ ] Store image URLs array (`imagesUrl`) instead of single `imageUrl` for rooms

### 📊 DataTables & Lists

- [ ] Use PrimeNG DataTable for listing Users, Rooms, and Services
- [ ] Add pagination, search, sorting, and filtering

### 🧠 State Management

- [ ] Handle subscriptions and properly unsubscribe to avoid memory leaks

### 🧩 Routing & Structure

- [ ] Define and guard routes per user role (Admin, Employee, Customer)
- [ ] Add shared routes/components for public access
- [ ] Merge Rooms routes where shared (Admin + Customer)

### 📑 Form Handling & Validation

- [ ] Add reactive forms with validations across all components
- [ ] Add custom validators for phone, password, etc.
- [ ] Provide translated validation messages for each input
- [ ] Use dropdowns and image upload fields where needed

### ⚙️ General App Setup

- [ ] Install and configure PrimeNG, Bootstrap, Font Awesome, Bootstrap Icons
- [ ] Configure Angular i18n and NgxIntlTelInput
- [ ] Set up routing, guards, and initial layout
- [ ] Ensure mobile-first design from the beginning

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
