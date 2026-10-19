import { Component, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

// Direktan Firebase import
import { getApps, initializeApp } from 'firebase/app';
import { collection, getDocs, getFirestore } from 'firebase/firestore';
import { environment } from '../../environments/environment';

import { HOME_CONFIG } from './home.config';
import { AstroDiceComponent } from '../astro-dice/astro-dice.component';
import { ConsultBannerComponent } from '../consult-banner/consult-banner.component';

interface BlogPost {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  createdAt?: any;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, AstroDiceComponent, ConsultBannerComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  readonly config = HOME_CONFIG;

  readonly isLoading = signal(false);
  readonly latestPost = signal<BlogPost | null>(null);
  readonly expanded = signal(false);

  ngOnInit() {
    if (this.config.latestPost.show) {
      this.loadLatestPost();
    }
  }

  toggleExpand() {
    this.expanded.update(v => !v);
  }

  private async loadLatestPost() {
    this.isLoading.set(true);
    try {
      const app = getApps().length ? getApps()[0] : initializeApp(environment.firebaseConfig);
      const db = getFirestore(app);
      const snapshot = await getDocs(collection(db, 'posts'));

      const posts = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as BlogPost))
        .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

      this.latestPost.set(posts[0] ?? null);
    } catch (error) {
      console.error('Greška pri učitavanju poslednjeg posta:', error);
    } finally {
      this.isLoading.set(false);
    }
  }
}