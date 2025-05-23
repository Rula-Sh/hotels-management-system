import { Component } from '@angular/core';
import { SignUpComponent } from "../../shared/auth/sign-up/sign-up.component";
import { LoginComponent } from '../../shared/auth/login/login.component';
import { RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  imports: [ RouterLink,RouterModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {

}
