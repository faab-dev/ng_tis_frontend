import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { PageNotAccessibleComponent } from './page-not-accessible/page-not-accessible.component';

const appRoutes: Routes = [
  { path: '',   redirectTo: '/installer', pathMatch: 'full' },
  { path: 'not-accessible',  component: PageNotAccessibleComponent },
  { path: '**', component: PageNotFoundComponent }
];

@NgModule({
  imports: [
    RouterModule.forRoot(
      appRoutes,
      { enableTracing: true } // <-- debugging purposes only
    )
  ],
  exports: [ RouterModule ],
  providers: []
})
export class AppRoutingModule { }
