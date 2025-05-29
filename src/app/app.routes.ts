import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  Routes,
} from '@angular/router';
import { AuthService } from './services/auth.service';
import { inject } from '@angular/core';
import { HomeRedirectComponent } from './components/shared/auth/home-redirect/home-redirect.component';
import { LoginComponent } from './components/shared/auth/login/login.component';
import { SignUpComponent } from './components/shared/auth/sign-up/sign-up.component';
import { ProfileComponent } from './components/shared/auth/profile/profile.component';
import { NotAuthorizedComponent } from './components/shared/auth/not-authorized/not-authorized.component';
import { NotFoundComponent } from './components/shared/not-found/not-found.component';
import { MyReservationsComponent } from './components/customer/my-reservations/my-reservations.component';
import { AvailableServicesComponent } from './components/customer/available-services/available-services.component';
import { RequestsComponent } from './components/employee/requests/requests.component';
import { RequestDetailsComponent } from './components/employee/request-details/request-details.component';
import { DashboardComponent } from './components/admin/dashboard/dashboard.component';
import { AddEmployeeComponent } from './components/admin/add-employee/add-employee.component';
import { ManageUsersComponent } from './components/admin/manage-users/manage-users.component';
import { UserDetailsComponent } from './components/admin/user-details/user-details.component';
import { ReservationsComponent } from './components/admin/reservations/reservations.component';
import { RoomsComponent } from './components/shared/rooms/rooms.component';
import { AddRoomComponent } from './components/admin/add-room/add-room.component';
import { RoomDetailsComponent } from './components/shared/room-details/room-details.component';
import { ServicesComponent } from './components/employee/services/services.component';
import { AddServiceComponent } from './components/employee/add-service/add-service.component';

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

  // redirect to /not-autherized if the user tries to access a page that is not specified to their role
  // const expectedRoles = route.data['roles'] as string[] | undefined;

  // const userRole = authService.getUserRole() ?? '';

  // if (expectedRoles && !expectedRoles.includes(userRole)) {
  //   return router.createUrlTree(['/not-autherized']);
  // }

  return true;
};

export const routes: Routes = [
  // ------------------------ Customer ------------------------
  {
    path: 'rooms',
    component: RoomsComponent,
  },
  {
    path: 'room/:id',
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
  // {
  //   path: 'request-details/:id',
  //   component: RequestDetailsComponent,
  //   canActivate: [authGuard],
  //   data: { roles: ['Employee'] },
  // },
  {
    path: 'employee/services',
    component: ServicesComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  {
    path: 'employee/add-service',
    component: AddServiceComponent,
    canActivate: [authGuard],
    data: { roles: ['Employee'] },
  },
  // {
  //   path: 'service-details/:id',
  //   component: ServiceDetailsComponent,
  //   canActivate: [authGuard],
  //   data: { roles: ['Employee'] },
  // },

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
    component: AddRoomComponent,
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

  { path: 'not-autherized', component: NotAuthorizedComponent },
  { path: '**', component: NotFoundComponent },
];
