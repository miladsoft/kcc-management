import { Component, ElementRef, Renderer2, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
 import { DidService } from '../../services/did.service';
import { SignUp } from '../../models/SignUp.model';
import { LogIn } from '../../models/LogIn.model';
import { handleButtonClick } from './start-slider';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements AfterViewInit {
  hide = true;
  isLoggedIn?: any;

  constructor(
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,
     private didService: DidService
  ) {
       this. isLoggedIn = false;

  }

  ngAfterViewInit() {
    handleButtonClick(this.renderer, this.el);
  }

  async onSignUp() {
    try {
      const did = await this.didService.createDid();
      if (did) {
        alert(`Sign-up successful! Your DID: ${did}`);
        this.router.navigate(['/dashboard']);
      }
    } catch (error) {
      console.error('Failed to sign up with DID:', error);
      alert('Sign-up failed. Please try again.');
    }
  }

  async onLogIn() {
    try {
      const isAuthenticated = await this.didService.isAuthenticated();
      if (isAuthenticated) {
        alert('Login successful!');
        this.router.navigate(['/dashboard']);
      } else {
        alert('Login failed. Please sign up first.');
      }
    } catch (error) {
      console.error('Failed to log in with DID:', error);
      alert('Login failed. Please try again.');
    }
  }

  onLogOut() {
     this.router.navigate(['/']);
    alert('You have been logged out.');
  }

 
}
