import { Component, ElementRef, Renderer2, AfterViewInit, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DidService } from '../../services/did.service';
import { handleButtonClick } from './start-slider';
import { Web5 } from '@web5/api';

@Component({
  selector: 'app-start',
  templateUrl: './start.component.html',
  styleUrls: ['./start.component.scss'],
})
export class StartComponent implements OnInit , AfterViewInit{


  constructor(private didService: DidService,
    private renderer: Renderer2,
    private el: ElementRef,
    private router: Router,

  ) {


  }

  ngOnInit(): void {
  }


  ngAfterViewInit() {
    handleButtonClick(this.renderer, this.el);
  }


  async createAccount() {
    await this.didService.createDid();
    alert('DID created and saved!');
  }

  login() {
    if (this.didService.getDid()) {
      this.router.navigate(['/dashboard']);
    } else {
      alert('No DID found. Please create an account first.');
    }
  }


}
