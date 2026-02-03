import { Component, OnInit, PLATFORM_ID, inject, ChangeDetectorRef, ViewEncapsulation  } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Direktan Firebase import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';

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
  styleUrls: ['./post.component.css'],
    encapsulation: ViewEncapsulation.None 
})
export class PostComponet implements OnInit {
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
    category: 'Dnevni tranziti',
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
        this.loadPosts();
      } catch (error) {
        console.error('Firebase error:', error);
        this.firebaseStatus = 'Error: ' + error;
      }
    }
  }

  async loadPosts() {
    if (!this.db) return;
    
    this.isLoading = true;
    this.cdr.detectChanges(); // Prikaži loading state
    
    try {
      const querySnapshot = await getDocs(collection(this.db, 'posts'));
      
      let posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BlogPost));
      
      const sorted = posts.sort((a, b) => {
        const aSeconds = a.createdAt ? a.createdAt.seconds : 0;
         const bSeconds = b.createdAt ? b.createdAt.seconds : 0;
        return bSeconds - aSeconds;
      });
      
      this.posts = sorted;


      console.log(`Loaded ${posts.length} blogs`);
      
    } catch (error) {
      console.error('Error loading blogs:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges(); // Ažuriraj UI
    }
  }
  
  async addPost() {
    if (!this.db || !this.newPost.title.trim() || !this.newPost.excerpt.trim()) {
      alert('Molimo unesite naslov i sadržaj posta!');
      return;
    }

    this.isSubmitting = true;
    try {
      await addDoc(collection(this.db, 'blog'), {
        title: this.newPost.title.trim(),
        category: this.newPost.category,
        excerpt: this.newPost.excerpt.trim(),
        date: new Date().toLocaleDateString('sr-RS'),
        createdAt: new Date()
      });
      
      // Resetuj formu
      this.newPost = { 
        title: '', 
        category: 'Dnevni tranziti', 
        excerpt: '', 
        date: '' 
      };
      
      this.showSuccessMessage();
      this.loadPosts(); // Reload posts
      
    } catch (error) {
      console.error('Error adding post:', error);
      alert('Greška pri dodavanju posta. Pokušajte ponovo.');
    }
    this.isSubmitting = false;
    
  }


  private showSuccessMessage() {
    if (!this.isBrowser) return;
    
    const toast = document.createElement('div');
    toast.innerHTML = '✨ Blog je uspešno objavljen! ✨';
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

  expandedPostId: string | null = null;

  toggleExpand(postId: string) {
  if (this.expandedPostId === postId) {
    this.expandedPostId = null; // Zatvori ako je već otvoreno
  } else {
    this.expandedPostId = postId; // Otvori novi
  }
}

  expandPost(post: BlogPost) {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
      <html>
        <head>
          <title>${post.title}</title>
          <!-- Google tag (gtag.js) -->
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-XL5G5X9WTV"></script>
            <script>
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());

              gtag('config', 'G-XL5G5X9WTV');
            </script>
          <style>
            body {
              margin: 0;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #fff;
            }
            .container {
              max-width: 700px;
              padding: 2rem;
              margin: 1rem;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 215, 0, 0.3);
              border-radius: 20px;
              backdrop-filter: blur(12px);
              -webkit-backdrop-filter: blur(12px);
              box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
              animation: fadeIn 0.4s ease-in-out;
            }
            h1 {
              color: #ffd700;
              font-size: 2rem;
              margin-bottom: 0.5rem;
            }
            .meta {
              font-size: 0.9rem;
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 1rem;
            }
            .content {
              font-size: 1.1rem;
              line-height: 1.6;
              margin-top: 1rem;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: anywhere;
              max-width: 100%;
              display: block;
            }
            @keyframes fadeIn {
              from { opacity: 0; transform: translateY(10px); }
              to { opacity: 1; transform: translateY(0); }
            }
            a.back-link {
              display: inline-block;
              margin-top: 1.5rem;
              text-decoration: none;
              background: linear-gradient(45deg, #ffd700, #ffb700);
              color: #1a1a2e;
              font-weight: bold;
              padding: 0.6rem 1.2rem;
              border-radius: 10px;
              box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
              transition: background 0.3s ease, transform 0.2s ease;
            }
            a.back-link:hover {
              background: linear-gradient(45deg, #ffe44d, #ffc107);
              transform: scale(1.05);
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${post.title}</h1>
            <div class="meta">
              📅 ${post.date} &nbsp; | &nbsp; ✨ ${post.category}
            </div>
            <div class="content">${post.excerpt}</div>
            <a href="javascript:window.close()" class="back-link">🔙 Zatvori prozor</a>
          </div>
        </body>
      </html>
    `);
      newTab.document.close();
    }
  }
}