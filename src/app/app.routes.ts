import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';

export const authGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  const token = localStorage.getItem('auth_token');

  // If the user is not logged in, redirect to login page
  if (!token) {
    authService.setRedirectUrl(state.url); // Save the attempted URL for redirecting
    return router.createUrlTree(['/login']);
  }

  // redirect to /not-found if the user tries to access a page that is not specified to their role
  const expectedRoles = route.data['roles'] as string[] | undefined;

  const userRole = authService.getUserRole() ?? '';

  if (expectedRoles && !expectedRoles.includes(userRole)) {
    return router.createUrlTree(['/not-found']);
  }

  return true;
};

export const routes: Routes = [
  // ------------------------ Customer ------------------------
  {
    path: '',
    children: [
      {
        path: 'rooms',
        loadComponent: () =>
          import('./shared/components/room/rooms/rooms.component').then(
            (m) => m.RoomsComponent
          ),
      }, // shared with guests and admin
      {
        path: 'room-details/:id',
        loadComponent: () =>
          import(
            './shared/components/room/room-details/room-details.component'
          ).then((m) => m.RoomDetailsComponent),
      }, // shared with guests and admin
      {
        path: 'my-reservations',
        loadComponent: () =>
          import(
            './pages/customer/my-reservations/my-reservations.component'
          ).then((m) => m.MyReservationsComponent),
        canActivate: [authGuard],
        data: { roles: ['Customer'] },
      },
      {
        path: 'available-services',
        loadComponent: () =>
          import(
            './pages/customer/available-services/available-services.component'
          ).then((m) => m.AvailableServicesComponent),
        canActivate: [authGuard],
        data: { roles: ['Customer'] },
      },
    ],
  },

  // ------------------------ Emplyoyee ------------------------
  {
    path: 'employee',
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
    children: [
      {
        path: 'requests',
        loadComponent: () =>
          import('./pages/employee/requests/requests.component').then(
            (m) => m.RequestsComponent
          ),
      },
      {
        path: 'services',
        loadComponent: () =>
          import('./pages/employee/services/services.component').then(
            (m) => m.ServicesComponent
          ),
      },
      {
        path: 'add-service',
        loadComponent: () =>
          import('./pages/employee/service-form/service-form.component').then(
            (m) => m.ServiceFormComponent
          ),
      },
      {
        path: 'edit-service/:id',
        loadComponent: () =>
          import('./pages/employee/service-form/service-form.component').then(
            (m) => m.ServiceFormComponent
          ),
      },
    ],
  },

  // ------------------------ Admin ------------------------
  {
    path: 'admin',
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/admin/dashboard/dashboard.component').then(
            (m) => m.DashboardComponent
          ),
      },
      {
        path: 'add-employee',
        loadComponent: () =>
          import('./pages/admin/add-employee/add-employee.component').then(
            (m) => m.AddEmployeeComponent
          ),
      },
      {
        path: 'manage-users',
        loadComponent: () =>
          import('./pages/admin/manage-users/manage-users.component').then(
            (m) => m.ManageUsersComponent
          ),
      },
      {
        path: 'user-details/:id',
        loadComponent: () =>
          import('./pages/admin/user-details/user-details.component').then(
            (m) => m.UserDetailsComponent
          ),
      },
      {
        path: 'add-room',
        loadComponent: () =>
          import('./pages/admin/room-form/room-form.component').then(
            (m) => m.RoomFormComponent
          ),
      },
      {
        path: 'edit-room/:id',
        loadComponent: () =>
          import('./pages/admin/room-form/room-form.component').then(
            (m) => m.RoomFormComponent
          ),
      },
      {
        path: 'reservations',
        loadComponent: () =>
          import('./pages/admin/reservations/reservations.component').then(
            (m) => m.ReservationsComponent
          ),
      },
    ],
  },
  // have a shared route with the customer 'rooms' and 'room-details/:id'

  // -------- All Users --------

  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'home-redirect',
  },
  {
    path: 'home-redirect',
    loadComponent: () =>
      import(
        './shared/components/auth/home-redirect/home-redirect.component'
      ).then((m) => m.HomeRedirectComponent),
  },
  {
    path: 'login',
    loadComponent: () =>
      import('./shared/components/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'signup',
    loadComponent: () =>
      import('./shared/components/auth/sign-up/sign-up.component').then(
        (m) => m.SignUpComponent
      ),
  },
  {
    path: 'profile/:id',
    loadComponent: () =>
      import('./shared/components/auth/profile/profile.component').then(
        (m) => m.ProfileComponent
      ),
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Employee', 'Customer'] },
  },

  {
    path: '**',
    loadComponent: () =>
      import('./shared/components/auth/not-found/not-found.component').then(
        (m) => m.NotFoundComponent
      ),
  },
];
