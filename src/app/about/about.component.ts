import { Component } from '@angular/core';
import { ConsultBannerComponent } from '../consult-banner/consult-banner.component';

@Component({
  selector: 'app-about',
  imports: [ConsultBannerComponent],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  readonly story = [
    {
      icon: '🎓',
      title: 'Obrazovanje',
      text: 'Astrologiju profesionalno izučavam na Johannes Kepler institutu u Beogradu. Pored toga, doprinos konsultacijama sa klijentima imaju moja učenja u Reiki stilovima (Tradicionalni Reiki, Arhanđeoski, Luna, Kundalini Reiki) kao i Kristaloterapija.'
    },
    {
      icon: '🗺️',
      title: 'Mapa duše',
      text: 'Natalna karta je mapa duše koja nas povezuje sa Univerzumom i poljem svih mogućnosti.'
    },
    {
      icon: '🧭',
      title: 'Pravac kroz život',
      text: 'Astrologija nam otkriva pravac kojim je najbolje i najlakše da idemo kroz život. A blokade, nemogućnosti i intenzivni događaji su nam najbolji pokazatelj u čemu treba da se usavršavamo.'
    },
    {
      icon: '✍️',
      title: 'Autorski tekstovi',
      text: 'Svi tekstovi na ovom sajtu su moj autorski rad, zasnovan na višegodišnjem proučavanju i praktičnoj primeni astrologije. Ako te inspiriše jezik kosmosa, ovde ćeš pronaći tekstove koji mogu da te inspirišu i usmere na ličnom putu.'
    }
  ];

  readonly skills = [
    'Astrologija · Johannes Kepler institut',
    'Tradicionalni Reiki',
    'Arhanđeoski Reiki',
    'Luna Reiki',
    'Kundalini Reiki',
    'Kristaloterapija'
  ];
}