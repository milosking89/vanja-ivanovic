import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/product.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { BlogCompoennt } from './blog/blog.component';
import { ContactComponent } from './contact/contact.component';

export const routes: Routes = [ 
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: HomeComponent },
  { path: 'blog', component: BlogCompoennt },
  { path: 'product', component: ProductsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'contact', component: ContactComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }