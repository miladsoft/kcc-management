import { Component } from '@angular/core';
import { SignUp } from '../../../models/SignUp.model';
import { Router } from '@angular/router';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
})
export class SidebarComponent {
  loggedUser?: SignUp;
  constructor(private router: Router  ) {

  }
   onLogOut() {
    
    this.router.navigate(['/logout']);
  }
}
 //

