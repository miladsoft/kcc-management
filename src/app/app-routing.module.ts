import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { StartComponent } from './components/start/start.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { WelcomeComponent } from './components/dashboard/welcome/welcome.component';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'start',
    pathMatch: 'full',
  },
  {
    path: 'start',
    component: StartComponent,
  },
  {
    path: 'logout',
    component: StartComponent,
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    children: [
      { path: 'welcome', component: WelcomeComponent },
      { path: '', redirectTo: 'welcome', pathMatch: 'full' }
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
