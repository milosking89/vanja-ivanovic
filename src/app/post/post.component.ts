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
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
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
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: linear-gradient(135deg, #1a1a2e, #16213e, #0f3460);
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              color: #fff;
              padding: 1rem;
            }
            
            .container {
              width: 100%;
              max-width: 800px;
              padding: 2rem;
              background: rgba(255, 255, 255, 0.08);
              border: 1px solid rgba(255, 215, 0, 0.3);
              border-radius: 20px;
              backdrop-filter: blur(12px);
              box-shadow: 0 4px 30px rgba(0, 0, 0, 0.4);
              animation: fadeIn 0.4s ease-in-out;
            }
            
            h1 {
              color: #ffd700;
              font-size: clamp(1.5rem, 5vw, 2.5rem);
              margin-bottom: 1rem;
              line-height: 1.3;
              word-wrap: break-word;
            }
            
            .meta {
              font-size: clamp(0.85rem, 2vw, 1rem);
              color: rgba(255, 255, 255, 0.7);
              margin-bottom: 1.5rem;
              display: flex;
              flex-wrap: wrap;
              gap: 0.5rem;
            }
            
            .content {
              font-size: clamp(1rem, 2.5vw, 1.15rem);
              line-height: 1.7;
              margin-top: 1rem;
              white-space: normal;
              word-break: break-word;
              overflow-wrap: anywhere;
              max-width: 100%;
              display: block;
            }
            
            .close-btn {
              margin-top: 2rem;
              padding: 0.8rem 2rem;
              width: 100%;
              max-width: 250px;
              background: linear-gradient(45deg, #ffd700, #ffb700);
              color: #1a1a2e;
              border: none;
              border-radius: 10px;
              font-size: clamp(0.9rem, 2vw, 1.1rem);
              font-weight: bold;
              cursor: pointer;
              box-shadow: 0 4px 10px rgba(255, 215, 0, 0.3);
              transition: all 0.3s ease;
              display: block;
              margin-left: auto;
              margin-right: auto;
            }
            
            .close-btn:hover {
              background: linear-gradient(45deg, #ffe44d, #ffc107);
              transform: scale(1.05);
            }
            
            .close-btn:active {
              transform: scale(0.98);
            }
            
            @keyframes fadeIn {
              from { 
                opacity: 0; 
                transform: translateY(20px); 
              }
              to { 
                opacity: 1; 
                transform: translateY(0); 
              }
            }
            
            /* Tablet */
            @media (max-width: 768px) {
              .container {
                padding: 1.5rem;
                border-radius: 15px;
              }
              
              h1 {
                margin-bottom: 0.75rem;
              }
              
              .meta {
                margin-bottom: 1rem;
              }
            }
            
            /* Mobile */
            @media (max-width: 480px) {
              body {
                padding: 0.5rem;
              }
              
              .container {
                padding: 1.25rem;
                border-radius: 12px;
              }
              
              .close-btn {
                padding: 0.7rem 1.5rem;
                font-size: 1rem;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>${post.title}</h1>
            <div class="meta">
              <span>📅 ${post.date}</span>
              <span>•</span>
              <span>✨ ${post.category}</span>
            </div>
            <div class="content">${post.excerpt}</div>
            <button class="close-btn" onclick="window.close()">🔙 Zatvori prozor</button>
          </div>
        </body>
      </html>
    `);
    newTab.document.close();
  }
}

}