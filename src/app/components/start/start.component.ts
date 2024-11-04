import { Component, ElementRef, Renderer2 } from '@angular/core';
import { handleButtonClick } from './start-slider';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as bcrypt from 'bcryptjs';
import { AuthService } from '../../services/auth.service';
import { LogIn } from '../../models/LogIn.model';
import { SignUp } from '../../models/SignUp.model';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent {
  hide = true;

  loggedUser?: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
    public authService: AuthService
  ) {
    this.authService.isLoggedIn$.subscribe((isLoggedIn) => {
      this.authService.isLoggedIn = isLoggedIn;
    });


  }

  ngAfterViewInit() {
    handleButtonClick(this.renderer, this.el);
  }

   onSignUp() {

  }

   onLogIn() {

            this.router.navigate(['/dashboard']);

  }

  onLogOut() {
    this.authService.logOut();
    this.router.navigate(['/logout']);
  }

  private getStoredUsers(): SignUp[] {
    const localUsers = localStorage.getItem('appUsers');
    return localUsers ? JSON.parse(localUsers) : [];
  }
}
