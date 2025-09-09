import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface BlogPost {
  title: string;
  date: string;
  category: string;
  excerpt: string;
}

@Component({
  selector: 'app-home',
  standalone: true,                   
  imports: [CommonModule, FormsModule],
  templateUrl: './blog.component.html',
  styleUrls: ['./blog.component.css']
})
export class BlogCompoennt {
  blogPosts: BlogPost[] = [
    {
      title: 'Mesečni horoskop za septembar 2025',
      date: '1. septembar 2025',
      category: 'Horoskop',
      excerpt: 'Septembar donosi velike promene za sve horoskopske znakove. Mars u Lavu aktivira vašu kreativnost, dok Venera u Vagi donosi harmoniju u odnose...'
    },
    {
      title: 'Uticaj Saturna na vaš životni put',
      date: '28. avgust 2025',
      category: 'Planete',
      excerpt: 'Saturn, planeta ograničenja i lekcija, trenutno prolazi kroz važan tranzit. Saznajte kako ovaj uticaj može da transformiše vaš pristup odgovornostima...'
    },
    {
      title: 'Numerologija imena - kako vaše ime utiče na sudbinu',
      date: '25. avgust 2025',
      category: 'Numerologija',
      excerpt: 'Svako slovo u vašem imenu nosi određenu numerološku vrednost. Otkrijte skriveno značenje vašeg imena i kako ono oblikuje vašu ličnost...'
    }
  ];

  newPost: BlogPost = {
    title: '',
    date: '',
    category: 'Horoskop',
    excerpt: ''
  };

  addPost() {
    if (this.newPost.title && this.newPost.excerpt) {
      this.newPost.date = new Date().toLocaleDateString('sr-RS');
      this.blogPosts.unshift({...this.newPost});
      this.newPost = { title: '', date: '', category: 'Horoskop', excerpt: '' };
    }
  }

  expandPost(post: BlogPost) {
    alert(`Čitanje posta: "${post.title}"\n\n${post.excerpt}\n\n(Ovde bi bio kompletan sadržaj posta)`);
  }
}