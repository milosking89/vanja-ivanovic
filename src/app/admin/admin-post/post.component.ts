import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Direktan Firebase import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../../environments/environment';

interface BlogPost {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  createdAt?: any;
}

@Component({
  selector: 'app-post',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './post.component.html',
  styleUrls: ['./post.component.css']
})
export class PostComponent implements OnInit {
  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  firebaseStatus = 'Loading...';
  isBrowser = false;
  isLoading = false;
  isSubmitting = false;
  posts: BlogPost[] = [];
  private db: any;
  
  newPost: BlogPost = {
    title: '',
    category: 'Horoskop',
    excerpt: '',
    date: ''
  };

  ngOnInit() {
    this.isBrowser = isPlatformBrowser(this.platformId);
    
    if (this.isBrowser) {
      try {
        const app = initializeApp(environment.firebaseConfig);
        this.db = getFirestore(app);
        this.firebaseStatus = 'Connected';
      } catch (error) {
        console.error('Firebase error:', error);
        this.firebaseStatus = 'Error: ' + error;
      }
    }
  }
  
  async addPost() {
    if (!this.db || !this.newPost.title.trim() || !this.newPost.excerpt.trim()) {
      alert('Molimo unesite naslov i sadržaj posta!');
      return;
    }

    this.isSubmitting = true;
    try {
      await addDoc(collection(this.db, 'posts'), {
        title: this.newPost.title.trim(),
        category: this.newPost.category,
        excerpt: this.newPost.excerpt.trim(),
        date: new Date().toLocaleDateString('sr-RS'),
        createdAt: new Date()
      });
      
      // Resetuj formu
      this.newPost = { 
        title: '', 
        category: 'Horoskop', 
        excerpt: '', 
        date: '' 
      };
      
      this.showSuccessMessage();
      
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Greška pri dodavanju posta. Pokušajte ponovo.');
    }
    this.isSubmitting = false;
    
  }

  expandPost(post: BlogPost) {
    alert(`📖 Čitanje posta: "${post.title}"\n\n${post.excerpt}\n\n✨ Kategorija: ${post.category}\n📅 Objavljeno: ${post.date}\n\n(Ovde bi bio kompletan sadržaj posta)`);
  }

  private showSuccessMessage() {
    if (!this.isBrowser) return;
    
    const toast = document.createElement('div');
    toast.innerHTML = '✨ Post je uspešno objavljen! ✨';
    toast.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(45deg, #ffd700, #ffb347);
      color: #1a1a2e;
      padding: 15px 25px;
      border-radius: 10px;
      font-weight: bold;
      z-index: 1000;
      box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    }, 3000);
  }

  // Utility metode
  getTotalPosts(): number {
    return this.posts.length;
  }
}