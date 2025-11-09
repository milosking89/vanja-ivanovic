import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { ProductsComponent } from './products/product.component';
import { AboutComponent } from './about/about.component';
import { LoginComponent } from './login/login.component';
import { BlogComponent } from './blog/blog.component';
import { AdminAuthGuard } from './admin/admin-auth/admin-auth.guard';
import { PostComponet } from './post/post.component';
import { CreateComponent } from './admin/admin-create/create.component';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'home', component: HomeComponent },
  { path: 'blog', component: BlogComponent },
  { path: 'post', component: PostComponet },
  { path: 'create', component: CreateComponent },
  { path: 'product', component: ProductsComponent },
  { path: 'about', component: AboutComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'post',
    loadComponent: () => import('./admin/admin-create/create.component').then(c => c.CreateComponent),
    canActivate: [AdminAuthGuard] 
  }
];