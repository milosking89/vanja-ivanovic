import { Component, NgZone, ChangeDetectorRef  } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface DiceOption {
  symbol: string;
  name: string;
  meaning: string;
}

interface Reading {
  title: string;
  message: string;
  advice: string;
}

interface BlogPost {
  title: string;
  date: string;
  category: string;
  excerpt: string;
}


@Component({
  selector: 'app-dice',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {
  isRolling = false;
  reading: Reading | null = null;
  hasRolled = false; 

 constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) {}

  // Tri kockice, svaka sa 12 strana
  private diceOptions: DiceOption[][] = [
    // Prva kockica – Planete (12 opcija)
    [
      { symbol: '☉', name: 'Sunce', meaning: 'energija, vitalnost, liderstvo' },
      { symbol: '☾', name: 'Mesec', meaning: 'intuicija, emocije, ciklusi' },
      { symbol: '♂', name: 'Mars', meaning: 'akcija, hrabrost, strast' },
      { symbol: '♀', name: 'Venera', meaning: 'ljubav, lepota, harmonija' },
      { symbol: '☿', name: 'Merkur', meaning: 'komunikacija, intelekt, brzina' },
      { symbol: '♃', name: 'Jupiter', meaning: 'ekspanzija, sreća, mudrost' },
      { symbol: '♄', name: 'Saturn', meaning: 'odgovornost, struktura, vreme' },
      { symbol: '♅', name: 'Uran', meaning: 'promene, sloboda, inovacija' },
      { symbol: '♆', name: 'Neptun', meaning: 'mašta, iluzije, duhovnost' },
      { symbol: '♇', name: 'Pluton', meaning: 'transformacija, moć, podsvest' },
      { symbol: '⚷', name: 'Hiron', meaning: 'rane, isceljenje, mudrost' },
      { symbol: '☊', name: 'Severni čvor', meaning: 'karma, pravac sudbine' }
    ],
    // Druga kockica – Elementi / Sile (12 opcija)
    [
      { symbol: '🔥', name: 'Vatra', meaning: 'strast, kreativnost, energija' },
      { symbol: '💧', name: 'Voda', meaning: 'emocije, intuicija, dubina' },
      { symbol: '🌍', name: 'Zemlja', meaning: 'stabilnost, praktičnost, izdržljivost' },
      { symbol: '💨', name: 'Vazduh', meaning: 'intelekt, komunikacija, sloboda' },
      { symbol: '⚡', name: 'Etar', meaning: 'duhovnost, transformacija, magija' },
      { symbol: '🌟', name: 'Svetlost', meaning: 'prosvetljenje, inspiracija, vodstvo' },
      { symbol: '🌑', name: 'Tama', meaning: 'nesvesno, strahovi, tajne' },
      { symbol: '🌊', name: 'Okean', meaning: 'kolektivno nesvesno, beskraj' },
      { symbol: '🏔️', name: 'Planina', meaning: 'izdržljivost, prepreke, ambicija' },
      { symbol: '🌪️', name: 'Oluja', meaning: 'haos, oslobađanje, snaga' },
      { symbol: '🔥💧', name: 'Para', meaning: 'transformacija, balans vatre i vode' },
      { symbol: '💎', name: 'Kristal', meaning: 'čistoća, jasnoća, fokus' }
    ],
    // Treća kockica – Životne oblasti (12 opcija)
    [
      { symbol: '💼', name: 'Karijera', meaning: 'profesionalni razvoj, ambicije' },
      { symbol: '💕', name: 'Ljubav', meaning: 'romantični odnosi, partnerstvo' },
      { symbol: '🏠', name: 'Porodica', meaning: 'dom, bliskost, tradicija' },
      { symbol: '💰', name: 'Finansije', meaning: 'materijalna sigurnost, abundance' },
      { symbol: '🎯', name: 'Ciljevi', meaning: 'životni put, svrha, vizija' },
      { symbol: '🧘', name: 'Duhovnost', meaning: 'unutrašnji mir, rast, meditacija' },
      { symbol: '🚀', name: 'Putovanja', meaning: 'istraživanje, avantura, rast' },
      { symbol: '📚', name: 'Znanje', meaning: 'učenje, mudrost, razvoj' },
      { symbol: '⚖️', name: 'Pravda', meaning: 'ravnoteža, moral, etika' },
      { symbol: '🎨', name: 'Kreativnost', meaning: 'umetnost, inspiracija, stvaranje' },
      { symbol: '🏋️', name: 'Zdravlje', meaning: 'snaga, vitalnost, disciplina' },
      { symbol: '🌐', name: 'Društvo', meaning: 'zajednica, veze, prijateljstva' }
    ]
  ];

  // inicijalni prikaz – prva opcija svake kockice
  dices: DiceOption[] = [
    this.diceOptions[0][0],
    this.diceOptions[1][0],
    this.diceOptions[2][0]
  ];

 rollDice() {
    this.isRolling = true;

    setTimeout(() => {
      this.zone.run(() => {
        this.reading = {
          title: "Odgovor: DA ✅",
          message: "Jupiter u kombinaciji sa Tama ukazuje na povoljan ishod u oblasti pravda.",
          advice: "Iskoristi ekspanzija, sreća, mudrost i snagu elementa tama da unaprediš svoju pravda."
        };
        this.hasRolled = true;
        this.isRolling = false;
        this.cd.detectChanges(); // 🔑 ručno obavesti Angular
      });
    }, 1500);
  }


private generateReading() {
  const [planet, element, life] = this.dices;

  this.reading = {
    title: `${planet.name}, ${element.name} i ${life.name}`,
    message: `Kombinacija ${planet.meaning}, ${element.meaning} i ${life.meaning} nosi snažnu simboliku za tvoj trenutni životni period.`,
    advice: `Iskoristi uticaj ${planet.name.toLowerCase()} i ${element.name.toLowerCase()} da unaprediš oblast ${life.name.toLowerCase()}.`
  };

  console.log("Reading set:", this.reading); // 👈 debug

}
  blogPosts: BlogPost[] = [
    {
      title: 'Mesečni horoskop za septembar 2025',
      date: '1. septembar 2025',
      category: 'Horoskop',
      excerpt: 'Septembar donosi velike promene za sve horoskopske znakove. Mars u Lavu aktivira vašu kreativnost, dok Venera u Vagi donosi harmoniju u odnose...'
    }
  ];

  newPost: BlogPost = {
    title: '',
    date: '',
    category: 'Horoskop',
    excerpt: ''
  };
  expandPost(post: BlogPost) {
    alert(`Čitanje posta: "${post.title}"\n\n${post.excerpt}\n\n(Ovde bi bio kompletan sadržaj posta)`);
  }
}
