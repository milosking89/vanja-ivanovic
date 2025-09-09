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
      { symbol: '☉', name: 'Sunce', meaning: 'otac, oženjen muškarac, zreo čovek, glumac, predsednik, direktor, šef, dan, svetlo, centralno svetlo, vitalnost, karakter, hrabrost, ponos, Ego, svest o sebi, volja, kreativnost, srce, oči, vid....' },
      { symbol: '☾', name: 'Mesec', meaning: 'žena, majka, dom, narod, porodica, intimnost, javnost, nepokretna imovina, plodnost, trudna žena, genetsko nasleđe, privatan posao, hrana i voda, emocije, podsvest, duša, bliskost, brižnost, sigurnost, nežnost, memorija, pamćenje, materica, grudi, stomak...' },
      { symbol: '♂', name: 'Mars', meaning: 'momak, brat, mladić, uniformisano lice, sportista, snažan muškarac, meso, ljuto, akutne bolesti, oružije, oštri predmeti, povrede, energija, hrabrost, borba, napad, adrenalin, strast, seksualna energija, muževnost, akcija, ljutnja, bes, sve ono što nas uzbuđuje...' },
      { symbol: '♀', name: 'Venera', meaning: 'ljubav, mlada devojka, sestra, ljubavnica, brak, bračni partner, diplomatija, imovina, nakit, slatkiši, cveće, parfemi, umetnost, moda, banka, materijalno, sposobnost za sticanje, osećaj za lepo, ženstvenost, ono što nas inspiriše, komfor, luksuz, grlo, jajnici...' },
      { symbol: '☿', name: 'Merkur', meaning: 'mladi ljudi, deca, komunikacija, informacija, braća i sestre, kraća putovanja, prevozna sredstva, rukopis, potpis, način pisanja, ime, način razmišljanja, osnovna škola, učenje, rad rukama, pošta, saobraćaj, novine, pisma, intelekt, ruke, nervi, čula, disajni organi...' },
      { symbol: '♃', name: 'Jupiter', meaning: 'veliko znanje i mudrost, novac, daleka putovanja, inostranstvo, učitelj, profesor, sveštenik, bogataš, obrazovanje, fakultet, skupe stvari, cena, plata,  filozofija, religija, etika, pravda, advokat, ministar, titule, amajlija, zaštitnik, vera, plemenitost, darežljivost, misija, svrha, noge, butine, krv, ako je u lošem dostojanstvu daje lenjost, rasipništvo, preterivanje...' },
      { symbol: '♄', name: 'Saturn', meaning: 'prošlost, istorija, davna dešavanja, stari ljudi, deda, konzervativni ljudi, ljudi na položaju, politika, političari, država, sudija, dugovi, stabilnost i trajnost, jeftine stvari, neobrazovani ljudi, hronične bolesni, Romi, crnci, mrak, tama, senka, mogućnost trajanja kroz vreme, karma, sudbina, čekanje, odgovornost, disciplina, forma, struktura, strogost, hladnoća, tradicija, kosti, kičma, zubi, nasleđe od predaka...' },
      { symbol: '♅', name: 'Uran', meaning: 'čudaci, hrabri ljudi, astrolozi, sadašnjost, rizik, sve novo, organizacije, udruženja, masa ljudi, moderna sredina, kosmopolita, najveći gradovi, astrologija, komunizam, ateizam, zvuk, grom, raskrsnica, otkrića, genijalnost, ravnopravnost, radikalne promene, naglost, univerzalnost, nepristrasnost, nezavisnost, sloboda, iznenadni događaji...' },
      { symbol: '♆', name: 'Neptun', meaning: 'budućnost, baka, TV, film, politika, alkohol, cigarete, droga, hemija, lekovi, alternativna medicina, maska, ostrva, mora, okeani, ludilo, lekar, glumac, monah, fobije, alergije, nepoznate bolesti, Božanska ljubav, vera, molitva, mašta, tajne, vidovitost, laži, obmane, mito, Platonska ljubav, atmosfera...' },
      { symbol: '♇', name: 'Pluton', meaning: 'podzemlje, kriminalci, teroristi, prostitucija, magovi, opasni ljudi, bogatstvo, porez, nasledstvo, ratovi, kataklizme, katastrofe, smrt, operacija, virusne bolesti, tuneli, podrumi, groblja, reke, najdublji porivi u čoveku, okultne moći, pronicljivost, transformacija, posesivnost, ljubomora, vezanost do groba, atomska energija, moć, podsvest…' },
      { symbol: '☋', name: 'Južni čvor', meaning: 'rep Zmaja, prošlost, strahovi iz prošlih života, karmički dug, mesto na kojem smo nešto dužni, gubitak ili osećaj gubitka u oblasti u kojoj se nađe...' },
      { symbol: '☊', name: 'Severni čvor', meaning: 'glava Zmaja, ono čemu težimo, naši ideali i očekivanja, budućnost, polje stvaranja karme...' }
    ],
    // Druga kockica – Znaci (12 opcija)
    [
      { symbol: '♈︎', name: 'Ovan', meaning: 'hrabrost, direktnost, početak, pionir, samopouzdanje, nestrpljivost, strast, takmičarski duh, netolerantnost, početak proleća, akcija, vojnik, policajac, zora, nož, pištolj, vrh nečega (plafon, jarbol), glava, lice, vilica, mozak...' },
      { symbol: '♉︎', name: 'Bik', meaning: 'praktičnost, trajnost, materijalne vrednosti, lenjost, usporenost, čulnost, otpor prema promenama, stabilnost, nakit, lepe stvari, stvari koje posedujemo, pevač, banka/r, zemljoradnik...' },
      { symbol: '♊︎', name: 'Blizanac', meaning: 'prilagodljivost, površnost, nepouzdanost, pričljivost, domišljatost, radoznalost, spretnost, brat, sestra, rođaci, komšije, kraća putovanja, pisma, knjige, auto, ulica, pluća, ključna kost, ramena, ruke, šake...' },
      { symbol: '♋︎', name: 'Rak', meaning: 'materinstvo, plodnost, intuicija, osetljivost, pamćenje, sećanje, poreklo, genetsko nasleđe, samosažaljenje, opsednutost brigama, sakupljanje, štedljivost, rodoljublje, nesigurnost, kuća, dom, jezero, porodica, majka, žena, supruga, materica, grudi, stomak....' },
      { symbol: '♌︎', name: 'Lav', meaning: 'velikodušnost, dostojanstvo, samouverenost, organizacija, dramatičnost, optimizam, kreativnost, netolerantnost, sujeta, detinjastost, šef, direktor, menadzer, glumac, poznati brendovi, centar, pozorište, srce, bokovi, gornji deo leđa....' },
      { symbol: '♍︎', name: 'Devica', meaning: 'skromnost, praktičnost, analitičnost, preciznost, perfekcionizam, marljivost, kritička nastrojenost, potiskivanje emocija, rutina, dnevne obaveze, kancelarije, pomoćne prostorije, lekovi, medicina, apoteke, digestivni trakt, creva...' },
      { symbol: '♎︎', name: 'Vaga', meaning: 'partnerstvo i odnosi, diplomatičnost, kompromisi, ljubaznost, šarm, druželjubivost, finoća, pravednost, komunikativnost, neodlučnost, nedostatak poverenja, neuravnoteženost, ugovori, venčanje, brak, partner, publika, javnost, sud, pravnik, sudija, spoljašnja lepota, galerija, moda, manekenke, bubrezi...' },
      { symbol: '♏︎', name: 'Škorpion', meaning: 'seksualnost, najdublji porivi, moć transformacije i regeneracije, sklonost istraživanju, potreba za suštinskim, strah, osvetoljubivost, ljubomora, destruktivnost, podzemne vode, bunari, tuneli, reke, kanalizacije, tok trudnoće, detektivi, patolozi, kriminalci, prostitutke, iscelitelji, bioenergetičari, reproduktivni organi, bešika, genitalije...' },
      { symbol: '♐︎', name: 'Strelac', meaning: 'nada, optimizam, idealizam, iskrenost, sklonost avanturama, sportski duh, sreća, mudrost, filozofski um, moral, etika, sklonost preterivanju, daleka putovanja, fakultet, plemeniti ljudi, titule, ministar, crkva, sveštenstvo, veroispovest, zakon, advokat, profesor, izdavač, veliki putnici, autoput, veletrgovine, kukovi, butike, krv, jetra...' },
      { symbol: '♑︎', name: 'Jarac', meaning: 'ambicija, istrajnost, vernost, pouzdanost, štedljivost, nemogućnosti, siromaštvo, trajnost, hladnoća, prošlost, konvencionalnost, neosetljivost, pesimizam, okrutnost, red, struktura, hijerarhija, kristalizacija, temelji, nosači, sve staro, istorija, arheologija, ugalj, rudnik, olovo, kamen, groblja, manastiri, kosti, zubi, kolena, koža....' },
      { symbol: '♒︎', name: 'Vodolija', meaning: 'naučni duh, humanost, nepristrasnost, originalnost, moderna sredstva komunikacije, idealizam, buntovništvo, revolucionarstvo, ekscentričnost, prijatelji, organizacije, udruženja, brzina, grom, avion, struja, nebo, aerodrom, internet, pobuna, homoseksualnost, astrologija, naućnik, električar, pilot, socijalni radnik, fizičar, stjuardesa, cirkulacija, nervi, listovi....' },
      { symbol: '♓︎', name: 'Ribe', meaning: 'nepraktičnost, prilagodljivost, osetljivost, saosećajnost, lakovernost, nežnost, stidljivost, intuitivnost, atmosfera, magla, okean, zabuna, cipele, anđeo, monah, lopov, prevarant, špijun, film, fotograf, mornar, ronilac, slikar, političar, muzika, stopala...' }
    ],
    // Treća kockica – Kuće (12 opcija)
    [
      { symbol: '1.', name: '1.kuća', meaning: 'fizičko telo, fizički izgled, identitet, pristup životu, kako nas drugi vide, sam početak života, način izražavanja...' },
      { symbol: '2.', name: '2.kuća', meaning: 'poketna imovina, materijalno stanje, sposobnost za sticanje i zarađivanje, vrednosti, način ishrane, banka, lični potencijal, osećaj lične vrednosti...' },
      { symbol: '3.', name: '3.kuća', meaning: 'način komunikacije, um, način razmišljanja, braća i sestre, komšije, kraća putovanja, prevozna sredstva, osnovna škola, veštine koje posedujemo...' },
      { symbol: '4.', name: '4.kuća', meaning: 'rano detinjstvo, naš dom, unutrašnje stanje, nepokretna imovina, poreklo, privatan posao, kraj života, psihološki temelji, podsvest, mesto groba, predstavlja roditelja suprotnog pola (od nas)...' },
      { symbol: '5.', name: '5.kuća', meaning: 'deca, kreativnost, ljubav, srednja škola, sport, igre na sreću, predbračne ljubavi, učenici, zabava, hobi...' },
      { symbol: '6.', name: '6.kuća', meaning: 'predstavlja poslove koji zahtevaju nošenje uniforme, fizičko zdravlje i bolesti, nutricionisti, dijete, alternativna medicina, podređeni, podstanari, pomoćne prostorije, rutine, navike, obaveze....' },
      { symbol: '7.', name: '7.kuća', meaning: 'brak, poslovno partnerstvo, javnost, neprijatelji, ono šta nam najviše nedostaje, klijenti, konkurencija...' },
      { symbol: '8.', name: '8.kuća', meaning: 'regeneracija, transformacija, seksualnost, najdublji porivi, tuđ novac, krediti, porezi, istraživanja, smrt, testament, nasledstvo, investiranje, operacije, strahovi, posesivnost...' },
      { symbol: '9.', name: '9.kuća', meaning: 'svrha, mudrost, učitelj, sreća u životu, veroispovest, fakultet, daleka putovanja, stranci, poslovi na veliko, uvoz/izvoz, crkva, sveštenstvo, unuci, profesori, gurui, zaštitnici, moral, etika....' },
      { symbol: '10.', name: '10.kuća', meaning: 'karma, status, pozicija u društvu, reputacija, ambicija, sudbina, profesija, karijera, nadređeni i nama važni ljudi, predstavlja roditelja istog pola (naspram nas), način na koji nas drugi vrednuju....' },
      { symbol: '11.', name: '11.kuća', meaning: 'prijatelji, organizacije, udruženja, klubovi, deca partnera, slobodna volja, planovi, namere, želje, profit od biznisa i karijere, penzija, stariji brat ili sestra, društveni odnosi...' },
      { symbol: '12.', name: '12.kuća', meaning: 'sve nepoznato i neistraženo, daleka mesta, tajne, nesvesno, snovi, fobije, predhodni život, psihičko zdravlje, ustanove zatvorenog tipa (zatvori, bolnice), kumovi, ostrva, špijunaža....' }
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
