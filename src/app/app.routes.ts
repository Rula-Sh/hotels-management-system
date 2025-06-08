import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { inject } from '@angular/core';
import { HomeRedirectComponent } from './shared/components/auth/home-redirect/home-redirect.component';
import { LoginComponent } from './shared/components/auth/login/login.component';
import { SignUpComponent } from './shared/components/auth/sign-up/sign-up.component';
import { ProfileComponent } from './shared/components/auth/profile/profile.component';
import { NotFoundComponent } from './shared/components/auth/not-found/not-found.component';
import { MyReservationsComponent } from './pages/customer/my-reservations/my-reservations.component';
import { AvailableServicesComponent } from './pages/customer/available-services/available-services.component';
import { RequestsComponent } from './pages/employee/requests/requests.component';
import { DashboardComponent } from './pages/admin/dashboard/dashboard.component';
import { AddEmployeeComponent } from './pages/admin/add-employee/add-employee.component';
import { ManageUsersComponent } from './pages/admin/manage-users/manage-users.component';
import { UserDetailsComponent } from './pages/admin/user-details/user-details.component';
import { ReservationsComponent } from './pages/admin/reservations/reservations.component';
import { RoomFormComponent } from './pages/admin/room-form/room-form.component';
import { ServicesComponent } from './pages/employee/services/services.component';
import { ServiceFormComponent } from './pages/employee/service-form/service-form.component';
import { RoomsComponent } from './shared/components/room/rooms/rooms.component';
import { RoomDetailsComponent } from './shared/components/room/room-details/room-details.component';

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
    path: 'rooms',
    component: RoomsComponent,
  },
  {
    path: 'room-details/:id',
    component: RoomDetailsComponent,
  },
  {
    path: 'my-reservations',
    component: MyReservationsComponent,
    canActivate: [authGuard],
    data: { roles: ['Customer'] },
  },
  {
    path: 'available-services',
    component: AvailableServicesComponent,
    canActivate: [authGuard],
    data: { roles: ['Customer'] },
  },

  // ------------------------ Emplyoyee ------------------------
  {
    path: 'employee/requests',
    component: RequestsComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'employee/services',
    component: ServicesComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'employee/add-service',
    component: ServiceFormComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'employee/edit-service/:id',
    component: ServiceFormComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },

  // ------------------------ Admin ------------------------
  {
    path: 'admin/dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/add-employee',
    component: AddEmployeeComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/manage-users',
    component: ManageUsersComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'user/:id',
    component: UserDetailsComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/add-room',
    component: RoomFormComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/edit-room/:id',
    component: RoomFormComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  {
    path: 'admin/reservations',
    component: ReservationsComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin'] },
  },
  // have a shared route with the customer 'room-details/:id'

  // -------- All Users --------

  { path: '', component: HomeRedirectComponent },
  { path: 'login', component: LoginComponent },
  { path: 'signup', component: SignUpComponent },
  {
    path: 'profile/:id',
    component: ProfileComponent,
    canActivate: [authGuard],
    data: { roles: ['Admin', 'Employee', 'Customer'] },
  },

  { path: '**', component: NotFoundComponent },
];
