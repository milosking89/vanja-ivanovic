import { Component, NgZone, PLATFORM_ID, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

// Direktan Firebase import
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, getDocs, orderBy, query, Timestamp } from 'firebase/firestore';
import { environment } from '../../environments/environment';

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

interface BlogPost {
  id?: string;
  title: string;
  category: string;
  excerpt: string;
  date: string;
  createdAt?: any;
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

  private platformId = inject(PLATFORM_ID);
  private cdr = inject(ChangeDetectorRef);
  firebaseStatus = 'Loading...';
  isBrowser = false;
  isLoading = false;
  isSubmitting = false;
  latestPost: BlogPost | null = null;
  private db: any;

  constructor(
    private zone: NgZone,
    private cd: ChangeDetectorRef
  ) { }

  // Baza podataka za Da/Ne kombinacije (iz vašeg dokumenta)
  private yesNoDatabase: { [key: string]: 'Da' | 'Ne' } =
    {
      // Sunce kombinacije
      'Sunce_Ovan_1': 'Da', 'Sunce_Ovan_2': 'Da', 'Sunce_Ovan_3': 'Da', 'Sunce_Ovan_4': 'Da',
      'Sunce_Ovan_5': 'Da', 'Sunce_Ovan_6': 'Da', 'Sunce_Ovan_7': 'Da', 'Sunce_Ovan_8': 'Da',
      'Sunce_Ovan_9': 'Da', 'Sunce_Ovan_10': 'Da', 'Sunce_Ovan_11': 'Da', 'Sunce_Ovan_12': 'Da',

      'Sunce_Bik_1': 'Da', 'Sunce_Bik_2': 'Da', 'Sunce_Bik_3': 'Da', 'Sunce_Bik_4': 'Da',
      'Sunce_Bik_5': 'Da', 'Sunce_Bik_6': 'Ne', 'Sunce_Bik_7': 'Da', 'Sunce_Bik_8': 'Ne',
      'Sunce_Bik_9': 'Da', 'Sunce_Bik_10': 'Da', 'Sunce_Bik_11': 'Ne', 'Sunce_Bik_12': 'Ne',

      'Sunce_Blizanac_1': 'Da', 'Sunce_Blizanac_2': 'Ne', 'Sunce_Blizanac_3': 'Da', 'Sunce_Blizanac_4': 'Da',
      'Sunce_Blizanac_5': 'Da', 'Sunce_Blizanac_6': 'Da', 'Sunce_Blizanac_7': 'Ne', 'Sunce_Blizanac_8': 'Da',
      'Sunce_Blizanac_9': 'Ne', 'Sunce_Blizanac_10': 'Da', 'Sunce_Blizanac_11': 'Ne', 'Sunce_Blizanac_12': 'Ne',

      'Sunce_Rak_1': 'Da', 'Sunce_Rak_2': 'Da', 'Sunce_Rak_3': 'Da', 'Sunce_Rak_4': 'Da',
      'Sunce_Rak_5': 'Da', 'Sunce_Rak_6': 'Da', 'Sunce_Rak_7': 'Ne', 'Sunce_Rak_8': 'Ne',
      'Sunce_Rak_9': 'Da', 'Sunce_Rak_10': 'Ne', 'Sunce_Rak_11': 'Ne', 'Sunce_Rak_12': 'Ne',

      'Sunce_Lav_1': 'Da', 'Sunce_Lav_2': 'Da', 'Sunce_Lav_3': 'Da', 'Sunce_Lav_4': 'Da',
      'Sunce_Lav_5': 'Da', 'Sunce_Lav_6': 'Da', 'Sunce_Lav_7': 'Ne', 'Sunce_Lav_8': 'Ne',
      'Sunce_Lav_9': 'Da', 'Sunce_Lav_10': 'Da', 'Sunce_Lav_11': 'Ne', 'Sunce_Lav_12': 'Ne',

      'Sunce_Devica_1': 'Ne', 'Sunce_Devica_2': 'Ne', 'Sunce_Devica_3': 'Ne', 'Sunce_Devica_4': 'Ne',
      'Sunce_Devica_5': 'Da', 'Sunce_Devica_6': 'Ne', 'Sunce_Devica_7': 'Ne', 'Sunce_Devica_8': 'Ne',
      'Sunce_Devica_9': 'Ne', 'Sunce_Devica_10': 'Ne', 'Sunce_Devica_11': 'Ne', 'Sunce_Devica_12': 'Ne',

      'Sunce_Vaga_1': 'Ne', 'Sunce_Vaga_2': 'Ne', 'Sunce_Vaga_3': 'Ne', 'Sunce_Vaga_4': 'Ne',
      'Sunce_Vaga_5': 'Ne', 'Sunce_Vaga_6': 'Ne', 'Sunce_Vaga_7': 'Ne', 'Sunce_Vaga_8': 'Ne',
      'Sunce_Vaga_9': 'Ne', 'Sunce_Vaga_10': 'Ne', 'Sunce_Vaga_11': 'Ne', 'Sunce_Vaga_12': 'Ne',

      'Sunce_Škorpion_1': 'Ne', 'Sunce_Škorpion_2': 'Ne', 'Sunce_Škorpion_3': 'Da', 'Sunce_Škorpion_4': 'Ne',
      'Sunce_Škorpion_5': 'Ne', 'Sunce_Škorpion_6': 'Da', 'Sunce_Škorpion_7': 'Ne', 'Sunce_Škorpion_8': 'Da',
      'Sunce_Škorpion_9': 'Da', 'Sunce_Škorpion_10': 'Ne', 'Sunce_Škorpion_11': 'Da', 'Sunce_Škorpion_12': 'Ne',

      'Sunce_Strelac_1': 'Da', 'Sunce_Strelac_2': 'Da', 'Sunce_Strelac_3': 'Ne', 'Sunce_Strelac_4': 'Da',
      'Sunce_Strelac_5': 'Da', 'Sunce_Strelac_6': 'Ne', 'Sunce_Strelac_7': 'Ne', 'Sunce_Strelac_8': 'Da',
      'Sunce_Strelac_9': 'Da', 'Sunce_Strelac_10': 'Da', 'Sunce_Strelac_11': 'Ne', 'Sunce_Strelac_12': 'Ne',

      'Sunce_Jarac_1': 'Ne', 'Sunce_Jarac_2': 'Ne', 'Sunce_Jarac_3': 'Ne', 'Sunce_Jarac_4': 'Ne',
      'Sunce_Jarac_5': 'Ne', 'Sunce_Jarac_6': 'Ne', 'Sunce_Jarac_7': 'Ne', 'Sunce_Jarac_8': 'Da',
      'Sunce_Jarac_9': 'Ne', 'Sunce_Jarac_10': 'Da', 'Sunce_Jarac_11': 'Ne', 'Sunce_Jarac_12': 'Ne',

      'Sunce_Vodolija_1': 'Ne', 'Sunce_Vodolija_2': 'Ne', 'Sunce_Vodolija_3': 'Ne', 'Sunce_Vodolija_4': 'Ne',
      'Sunce_Vodolija_5': 'Ne', 'Sunce_Vodolija_6': 'Ne', 'Sunce_Vodolija_7': 'Ne', 'Sunce_Vodolija_8': 'Ne',
      'Sunce_Vodolija_9': 'Ne', 'Sunce_Vodolija_10': 'Ne', 'Sunce_Vodolija_11': 'Ne', 'Sunce_Vodolija_12': 'Ne',

      'Sunce_Ribe_1': 'Ne', 'Sunce_Ribe_2': 'Da', 'Sunce_Ribe_3': 'Ne', 'Sunce_Ribe_4': 'Ne',
      'Sunce_Ribe_5': 'Da', 'Sunce_Ribe_6': 'Ne', 'Sunce_Ribe_7': 'Ne', 'Sunce_Ribe_8': 'Ne',
      'Sunce_Ribe_9': 'Da', 'Sunce_Ribe_10': 'Ne', 'Sunce_Ribe_11': 'Ne', 'Sunce_Ribe_12': 'Ne',

      // Mesec kombinacije
      'Mesec_Ovan_1': 'Ne', 'Mesec_Ovan_2': 'Ne', 'Mesec_Ovan_3': 'Ne', 'Mesec_Ovan_4': 'Ne',
      'Mesec_Ovan_5': 'Ne', 'Mesec_Ovan_6': 'Ne', 'Mesec_Ovan_7': 'Ne', 'Mesec_Ovan_8': 'Ne',
      'Mesec_Ovan_9': 'Ne', 'Mesec_Ovan_10': 'Ne', 'Mesec_Ovan_11': 'Ne', 'Mesec_Ovan_12': 'Ne',

      'Mesec_Bik_1': 'Da', 'Mesec_Bik_2': 'Da', 'Mesec_Bik_3': 'Da', 'Mesec_Bik_4': 'Da',
      'Mesec_Bik_5': 'Da', 'Mesec_Bik_6': 'Da', 'Mesec_Bik_7': 'Da', 'Mesec_Bik_8': 'Ne',
      'Mesec_Bik_9': 'Da', 'Mesec_Bik_10': 'Ne', 'Mesec_Bik_11': 'Da', 'Mesec_Bik_12': 'Da',
      'Mesec_Blizanac_1': 'Da', 'Mesec_Blizanac_2': 'Da', 'Mesec_Blizanac_3': 'Da', 'Mesec_Blizanac_4': 'Da',
      'Mesec_Blizanac_5': 'Da', 'Mesec_Blizanac_6': 'Da', 'Mesec_Blizanac_7': 'Da', 'Mesec_Blizanac_8': 'Da',
      'Mesec_Blizanac_9': 'Ne', 'Mesec_Blizanac_10': 'Da', 'Mesec_Blizanac_11': 'Da', 'Mesec_Blizanac_12': 'Ne',

      'Mesec_Rak_1': 'Da', 'Mesec_Rak_2': 'Da', 'Mesec_Rak_3': 'Da', 'Mesec_Rak_4': 'Da',
      'Mesec_Rak_5': 'Da', 'Mesec_Rak_6': 'Da', 'Mesec_Rak_7': 'Da', 'Mesec_Rak_8': 'Ne',
      'Mesec_Rak_9': 'Da', 'Mesec_Rak_10': 'Ne', 'Mesec_Rak_11': 'Da', 'Mesec_Rak_12': 'Ne',

      'Mesec_Lav_1': 'Da', 'Mesec_Lav_2': 'Da', 'Mesec_Lav_3': 'Da', 'Mesec_Lav_4': 'Da',
      'Mesec_Lav_5': 'Da', 'Mesec_Lav_6': 'Da', 'Mesec_Lav_7': 'Da', 'Mesec_Lav_8': 'Ne',
      'Mesec_Lav_9': 'Da', 'Mesec_Lav_10': 'Da', 'Mesec_Lav_11': 'Ne', 'Mesec_Lav_12': 'Da',

      'Mesec_Devica_1': 'Ne', 'Mesec_Devica_2': 'Ne', 'Mesec_Devica_3': 'Da', 'Mesec_Devica_4': 'Ne',
      'Mesec_Devica_5': 'Da', 'Mesec_Devica_6': 'Da', 'Mesec_Devica_7': 'Ne', 'Mesec_Devica_8': 'Ne',
      'Mesec_Devica_9': 'Ne', 'Mesec_Devica_10': 'Da', 'Mesec_Devica_11': 'Da', 'Mesec_Devica_12': 'Ne',

      'Mesec_Vaga_1': 'Da', 'Mesec_Vaga_2': 'Da', 'Mesec_Vaga_3': 'Da', 'Mesec_Vaga_4': 'Da',
      'Mesec_Vaga_5': 'Da', 'Mesec_Vaga_6': 'Ne', 'Mesec_Vaga_7': 'Da', 'Mesec_Vaga_8': 'Ne',
      'Mesec_Vaga_9': 'Da', 'Mesec_Vaga_10': 'Da', 'Mesec_Vaga_11': 'Da', 'Mesec_Vaga_12': 'Da',

      'Mesec_Škorpion_1': 'Ne', 'Mesec_Škorpion_2': 'Ne', 'Mesec_Škorpion_3': 'Ne', 'Mesec_Škorpion_4': 'Ne',
      'Mesec_Škorpion_5': 'Ne', 'Mesec_Škorpion_6': 'Ne', 'Mesec_Škorpion_7': 'Ne', 'Mesec_Škorpion_8': 'Ne',
      'Mesec_Škorpion_9': 'Ne', 'Mesec_Škorpion_10': 'Ne', 'Mesec_Škorpion_11': 'Ne', 'Mesec_Škorpion_12': 'Ne',

      'Mesec_Strelac_1': 'Da', 'Mesec_Strelac_2': 'Da', 'Mesec_Strelac_3': 'Da', 'Mesec_Strelac_4': 'Ne',
      'Mesec_Strelac_5': 'Da', 'Mesec_Strelac_6': 'Ne', 'Mesec_Strelac_7': 'Da', 'Mesec_Strelac_8': 'Ne',
      'Mesec_Strelac_9': 'Da', 'Mesec_Strelac_10': 'Ne', 'Mesec_Strelac_11': 'Da', 'Mesec_Strelac_12': 'Da',

      'Mesec_Jarac_1': 'Ne', 'Mesec_Jarac_2': 'Ne', 'Mesec_Jarac_3': 'Ne', 'Mesec_Jarac_4': 'Ne',
      'Mesec_Jarac_5': 'Ne', 'Mesec_Jarac_6': 'Ne', 'Mesec_Jarac_7': 'Ne', 'Mesec_Jarac_8': 'Ne',
      'Mesec_Jarac_9': 'Ne', 'Mesec_Jarac_10': 'Ne', 'Mesec_Jarac_11': 'Ne', 'Mesec_Jarac_12': 'Ne',

      'Mesec_Vodolija_1': 'Ne', 'Mesec_Vodolija_2': 'Ne', 'Mesec_Vodolija_3': 'Ne', 'Mesec_Vodolija_4': 'Ne',
      'Mesec_Vodolija_5': 'Da', 'Mesec_Vodolija_6': 'Ne', 'Mesec_Vodolija_7': 'Ne', 'Mesec_Vodolija_8': 'Ne',
      'Mesec_Vodolija_9': 'Ne', 'Mesec_Vodolija_10': 'Da', 'Mesec_Vodolija_11': 'Da', 'Mesec_Vodolija_12': 'Ne',

      'Mesec_Ribe_1': 'Da', 'Mesec_Ribe_2': 'Da', 'Mesec_Ribe_3': 'Ne', 'Mesec_Ribe_4': 'Da',
      'Mesec_Ribe_5': 'Da', 'Mesec_Ribe_6': 'Da', 'Mesec_Ribe_7': 'Ne', 'Mesec_Ribe_8': 'Ne',
      'Mesec_Ribe_9': 'Da', 'Mesec_Ribe_10': 'Ne', 'Mesec_Ribe_11': 'Da', 'Mesec_Ribe_12': 'Da',

      // MERKUR kombinacije
      'Merkur_Ovan_1': 'Da', 'Merkur_Ovan_2': 'Da', 'Merkur_Ovan_3': 'Da', 'Merkur_Ovan_4': 'Da',
      'Merkur_Ovan_5': 'Ne', 'Merkur_Ovan_6': 'Da', 'Merkur_Ovan_7': 'Da', 'Merkur_Ovan_8': 'Da',
      'Merkur_Ovan_9': 'Ne', 'Merkur_Ovan_10': 'Da', 'Merkur_Ovan_11': 'Da', 'Merkur_Ovan_12': 'Ne',

      'Merkur_Bik_1': 'Da', 'Merkur_Bik_2': 'Da', 'Merkur_Bik_3': 'Da', 'Merkur_Bik_4': 'Da',
      'Merkur_Bik_5': 'Da', 'Merkur_Bik_6': 'Ne', 'Merkur_Bik_7': 'Da', 'Merkur_Bik_8': 'Ne',
      'Merkur_Bik_9': 'Ne', 'Merkur_Bik_10': 'Da', 'Merkur_Bik_11': 'Ne', 'Merkur_Bik_12': 'Ne',

      'Merkur_Blizanac_1': 'Da', 'Merkur_Blizanac_2': 'Da', 'Merkur_Blizanac_3': 'Da', 'Merkur_Blizanac_4': 'Da',
      'Merkur_Blizanac_5': 'Da', 'Merkur_Blizanac_6': 'Da', 'Merkur_Blizanac_7': 'Da', 'Merkur_Blizanac_8': 'Da',
      'Merkur_Blizanac_9': 'Ne', 'Merkur_Blizanac_10': 'Da', 'Merkur_Blizanac_11': 'Da', 'Merkur_Blizanac_12': 'Ne',

      'Merkur_Rak_1': 'Da', 'Merkur_Rak_2': 'Ne', 'Merkur_Rak_3': 'Da', 'Merkur_Rak_4': 'Da',
      'Merkur_Rak_5': 'Da', 'Merkur_Rak_6': 'Ne', 'Merkur_Rak_7': 'Da', 'Merkur_Rak_8': 'Ne',
      'Merkur_Rak_9': 'Ne', 'Merkur_Rak_10': 'Da', 'Merkur_Rak_11': 'Da', 'Merkur_Rak_12': 'Ne',

      'Merkur_Lav_1': 'Da', 'Merkur_Lav_2': 'Da', 'Merkur_Lav_3': 'Da', 'Merkur_Lav_4': 'Da',
      'Merkur_Lav_5': 'Da', 'Merkur_Lav_6': 'Da', 'Merkur_Lav_7': 'Da', 'Merkur_Lav_8': 'Da',
      'Merkur_Lav_9': 'Da', 'Merkur_Lav_10': 'Da', 'Merkur_Lav_11': 'Da', 'Merkur_Lav_12': 'Ne',

      'Merkur_Devica_1': 'Da', 'Merkur_Devica_2': 'Da', 'Merkur_Devica_3': 'Da', 'Merkur_Devica_4': 'Da',
      'Merkur_Devica_5': 'Da', 'Merkur_Devica_6': 'Da', 'Merkur_Devica_7': 'Da', 'Merkur_Devica_8': 'Da',
      'Merkur_Devica_9': 'Da', 'Merkur_Devica_10': 'Da', 'Merkur_Devica_11': 'Da', 'Merkur_Devica_12': 'Da',

      'Merkur_Vaga_1': 'Da', 'Merkur_Vaga_2': 'Da', 'Merkur_Vaga_3': 'Da', 'Merkur_Vaga_4': 'Da',
      'Merkur_Vaga_5': 'Da', 'Merkur_Vaga_6': 'Da', 'Merkur_Vaga_7': 'Da', 'Merkur_Vaga_8': 'Ne',
      'Merkur_Vaga_9': 'Ne', 'Merkur_Vaga_10': 'Da', 'Merkur_Vaga_11': 'Da', 'Merkur_Vaga_12': 'Ne',

      'Merkur_Škorpion_1': 'Ne', 'Merkur_Škorpion_2': 'Da', 'Merkur_Škorpion_3': 'Da', 'Merkur_Škorpion_4': 'Ne',
      'Merkur_Škorpion_5': 'Ne', 'Merkur_Škorpion_6': 'Da', 'Merkur_Škorpion_7': 'Ne', 'Merkur_Škorpion_8': 'Da',
      'Merkur_Škorpion_9': 'Ne', 'Merkur_Škorpion_10': 'Da', 'Merkur_Škorpion_11': 'Da', 'Merkur_Škorpion_12': 'Da',

      'Merkur_Strelac_1': 'Ne', 'Merkur_Strelac_2': 'Ne', 'Merkur_Strelac_3': 'Ne', 'Merkur_Strelac_4': 'Ne',
      'Merkur_Strelac_5': 'Ne', 'Merkur_Strelac_6': 'Ne', 'Merkur_Strelac_7': 'Ne', 'Merkur_Strelac_8': 'Ne',
      'Merkur_Strelac_9': 'Ne', 'Merkur_Strelac_10': 'Ne', 'Merkur_Strelac_11': 'Ne', 'Merkur_Strelac_12': 'Ne',

      'Merkur_Jarac_1': 'Ne', 'Merkur_Jarac_2': 'Ne', 'Merkur_Jarac_3': 'Ne', 'Merkur_Jarac_4': 'Ne',
      'Merkur_Jarac_5': 'Ne', 'Merkur_Jarac_6': 'Ne', 'Merkur_Jarac_7': 'Ne', 'Merkur_Jarac_8': 'Ne',
      'Merkur_Jarac_9': 'Ne', 'Merkur_Jarac_10': 'Da', 'Merkur_Jarac_11': 'Da', 'Merkur_Jarac_12': 'Ne',

      'Merkur_Vodolija_1': 'Da', 'Merkur_Vodolija_2': 'Da', 'Merkur_Vodolija_3': 'Da', 'Merkur_Vodolija_4': 'Ne',
      'Merkur_Vodolija_5': 'Da', 'Merkur_Vodolija_6': 'Ne', 'Merkur_Vodolija_7': 'Ne', 'Merkur_Vodolija_8': 'Da',
      'Merkur_Vodolija_9': 'Ne', 'Merkur_Vodolija_10': 'Ne', 'Merkur_Vodolija_11': 'Da', 'Merkur_Vodolija_12': 'Ne',

      'Merkur_Ribe_1': 'Ne', 'Merkur_Ribe_2': 'Ne', 'Merkur_Ribe_3': 'Ne', 'Merkur_Ribe_4': 'Ne',
      'Merkur_Ribe_5': 'Ne', 'Merkur_Ribe_6': 'Ne', 'Merkur_Ribe_7': 'Ne', 'Merkur_Ribe_8': 'Ne',
      'Merkur_Ribe_9': 'Ne', 'Merkur_Ribe_10': 'Ne', 'Merkur_Ribe_11': 'Ne', 'Merkur_Ribe_12': 'Ne',

      // VENERA kombinacije
      'Venera_Ovan_1': 'Ne', 'Venera_Ovan_2': 'Ne', 'Venera_Ovan_3': 'Ne', 'Venera_Ovan_4': 'Ne',
      'Venera_Ovan_5': 'Ne', 'Venera_Ovan_6': 'Ne', 'Venera_Ovan_7': 'Ne', 'Venera_Ovan_8': 'Ne',
      'Venera_Ovan_9': 'Ne', 'Venera_Ovan_10': 'Ne', 'Venera_Ovan_11': 'Ne', 'Venera_Ovan_12': 'Ne',

      'Venera_Bik_1': 'Da', 'Venera_Bik_2': 'Da', 'Venera_Bik_3': 'Da', 'Venera_Bik_4': 'Da',
      'Venera_Bik_5': 'Da', 'Venera_Bik_6': 'Da', 'Venera_Bik_7': 'Da', 'Venera_Bik_8': 'Da',
      'Venera_Bik_9': 'Da', 'Venera_Bik_10': 'Da', 'Venera_Bik_11': 'Da', 'Venera_Bik_12': 'Da',

      'Venera_Blizanac_1': 'Da', 'Venera_Blizanac_2': 'Da', 'Venera_Blizanac_3': 'Da', 'Venera_Blizanac_4': 'Da',
      'Venera_Blizanac_5': 'Da', 'Venera_Blizanac_6': 'Ne', 'Venera_Blizanac_7': 'Da', 'Venera_Blizanac_8': 'Ne',
      'Venera_Blizanac_9': 'Da', 'Venera_Blizanac_10': 'Ne', 'Venera_Blizanac_11': 'Ne', 'Venera_Blizanac_12': 'Da',

      'Venera_Rak_1': 'Da', 'Venera_Rak_2': 'Da', 'Venera_Rak_3': 'Da', 'Venera_Rak_4': 'Da', 'Venera_Rak_5': 'Da', 'Venera_Rak_6': 'Ne', 'Venera_Rak_7': 'Da', 'Venera_Rak_8': 'Ne',
      'Venera_Rak_9': 'Da', 'Venera_Rak_10': 'Ne', 'Venera_Rak_11': 'Da', 'Venera_Rak_12': 'Da',

      'Venera_Lav_1': 'Da', 'Venera_Lav_2': 'Da', 'Venera_Lav_3': 'Da', 'Venera_Lav_4': 'Da',
      'Venera_Lav_5': 'Da', 'Venera_Lav_6': 'Ne', 'Venera_Lav_7': 'Da', 'Venera_Lav_8': 'Ne',
      'Venera_Lav_9': 'Da', 'Venera_Lav_10': 'Da', 'Venera_Lav_11': 'Da', 'Venera_Lav_12': 'Da',

      'Venera_Devica_1': 'Ne', 'Venera_Devica_2': 'Ne', 'Venera_Devica_3': 'Da', 'Venera_Devica_4': 'Ne',
      'Venera_Devica_5': 'Ne', 'Venera_Devica_6': 'Ne', 'Venera_Devica_7': 'Ne', 'Venera_Devica_8': 'Ne',
      'Venera_Devica_9': 'Ne', 'Venera_Devica_10': 'Da', 'Venera_Devica_11': 'Ne', 'Venera_Devica_12': 'Ne',

      'Venera_Vaga_1': 'Da', 'Venera_Vaga_2': 'Da', 'Venera_Vaga_3': 'Da', 'Venera_Vaga_4': 'Da',
      'Venera_Vaga_5': 'Da', 'Venera_Vaga_6': 'Da', 'Venera_Vaga_7': 'Da', 'Venera_Vaga_8': 'Da',
      'Venera_Vaga_9': 'Da', 'Venera_Vaga_10': 'Da', 'Venera_Vaga_11': 'Da', 'Venera_Vaga_12': 'Da',

      'Venera_Škorpion_1': 'Ne', 'Venera_Škorpion_2': 'Ne', 'Venera_Škorpion_3': 'Ne', 'Venera_Škorpion_4': 'Ne',
      'Venera_Škorpion_5': 'Ne', 'Venera_Škorpion_6': 'Ne', 'Venera_Škorpion_7': 'Ne', 'Venera_Škorpion_8': 'Ne',
      'Venera_Škorpion_9': 'Ne', 'Venera_Škorpion_10': 'Ne', 'Venera_Škorpion_11': 'Ne', 'Venera_Škorpion_12': 'Ne',

      'Venera_Strelac_1': 'Da', 'Venera_Strelac_2': 'Da', 'Venera_Strelac_3': 'Da', 'Venera_Strelac_4': 'Ne',
      'Venera_Strelac_5': 'Da', 'Venera_Strelac_6': 'Ne', 'Venera_Strelac_7': 'Da', 'Venera_Strelac_8': 'Ne',
      'Venera_Strelac_9': 'Da', 'Venera_Strelac_10': 'Ne', 'Venera_Strelac_11': 'Da', 'Venera_Strelac_12': 'Da',

      'Venera_Jarac_1': 'Da', 'Venera_Jarac_2': 'Da', 'Venera_Jarac_3': 'Ne', 'Venera_Jarac_4': 'Da',
      'Venera_Jarac_5': 'Da', 'Venera_Jarac_6': 'Da', 'Venera_Jarac_7': 'Da', 'Venera_Jarac_8': 'Da',
      'Venera_Jarac_9': 'Da', 'Venera_Jarac_10': 'Da', 'Venera_Jarac_11': 'Da', 'Venera_Jarac_12': 'Ne',

      'Venera_Vodolija_1': 'Ne', 'Venera_Vodolija_2': 'Da', 'Venera_Vodolija_3': 'Ne', 'Venera_Vodolija_4': 'Ne',
      'Venera_Vodolija_5': 'Ne', 'Venera_Vodolija_6': 'Ne', 'Venera_Vodolija_7': 'Ne', 'Venera_Vodolija_8': 'Ne',
      'Venera_Vodolija_9': 'Da', 'Venera_Vodolija_10': 'Ne', 'Venera_Vodolija_11': 'Da', 'Venera_Vodolija_12': 'Ne',

      'Venera_Ribe_1': 'Da', 'Venera_Ribe_2': 'Da', 'Venera_Ribe_3': 'Da', 'Venera_Ribe_4': 'Da',
      'Venera_Ribe_5': 'Da', 'Venera_Ribe_6': 'Da', 'Venera_Ribe_7': 'Da', 'Venera_Ribe_8': 'Da',
      'Venera_Ribe_9': 'Da', 'Venera_Ribe_10': 'Da', 'Venera_Ribe_11': 'Da', 'Venera_Ribe_12': 'Da',

      // MARS kombinacije
      'Mars_Ovan_1': 'Da', 'Mars_Ovan_2': 'Da', 'Mars_Ovan_3': 'Da', 'Mars_Ovan_4': 'Da',
      'Mars_Ovan_5': 'Da', 'Mars_Ovan_6': 'Da', 'Mars_Ovan_7': 'Da', 'Mars_Ovan_8': 'Da',
      'Mars_Ovan_9': 'Da', 'Mars_Ovan_10': 'Da', 'Mars_Ovan_11': 'Da', 'Mars_Ovan_12': 'Da',

      'Mars_Bik_1': 'Ne', 'Mars_Bik_2': 'Ne', 'Mars_Bik_3': 'Ne', 'Mars_Bik_4': 'Ne',
      'Mars_Bik_5': 'Ne', 'Mars_Bik_6': 'Ne', 'Mars_Bik_7': 'Ne', 'Mars_Bik_8': 'Ne',
      'Mars_Bik_9': 'Ne', 'Mars_Bik_10': 'Ne', 'Mars_Bik_11': 'Ne', 'Mars_Bik_12': 'Ne',

      'Mars_Blizanac_1': 'Da', 'Mars_Blizanac_2': 'Da', 'Mars_Blizanac_3': 'Ne', 'Mars_Blizanac_4': 'Ne',
      'Mars_Blizanac_5': 'Da', 'Mars_Blizanac_6': 'Ne', 'Mars_Blizanac_7': 'Ne', 'Mars_Blizanac_8': 'Da',
      'Mars_Blizanac_9': 'Ne', 'Mars_Blizanac_10': 'Da', 'Mars_Blizanac_11': 'Da', 'Mars_Blizanac_12': 'Ne',

      'Mars_Rak_1': 'Ne', 'Mars_Rak_2': 'Ne', 'Mars_Rak_3': 'Ne', 'Mars_Rak_4': 'Ne',
      'Mars_Rak_5': 'Ne', 'Mars_Rak_6': 'Ne', 'Mars_Rak_7': 'Ne', 'Mars_Rak_8': 'Ne',
      'Mars_Rak_9': 'Ne', 'Mars_Rak_10': 'Ne', 'Mars_Rak_11': 'Ne', 'Mars_Rak_12': 'Ne',

      'Mars_Lav_1': 'Da', 'Mars_Lav_2': 'Da', 'Mars_Lav_3': 'Ne', 'Mars_Lav_4': 'Da',
      'Mars_Lav_5': 'Da', 'Mars_Lav_6': 'Ne', 'Mars_Lav_7': 'Da', 'Mars_Lav_8': 'Da',
      'Mars_Lav_9': 'Da', 'Mars_Lav_10': 'Da', 'Mars_Lav_11': 'Ne', 'Mars_Lav_12': 'Ne',

      'Mars_Devica_1': 'Da', 'Mars_Devica_2': 'Da', 'Mars_Devica_3': 'Ne', 'Mars_Devica_4': 'Ne',
      'Mars_Devica_5': 'Ne', 'Mars_Devica_6': 'Ne', 'Mars_Devica_7': 'Ne', 'Mars_Devica_8': 'Da',
      'Mars_Devica_9': 'Da', 'Mars_Devica_10': 'Da', 'Mars_Devica_11': 'Ne', 'Mars_Devica_12': 'Ne',

      'Mars_Vaga_1': 'Ne', 'Mars_Vaga_2': 'Ne', 'Mars_Vaga_3': 'Ne', 'Mars_Vaga_4': 'Ne',
      'Mars_Vaga_5': 'Ne', 'Mars_Vaga_6': 'Ne', 'Mars_Vaga_7': 'Ne', 'Mars_Vaga_8': 'Ne',
      'Mars_Vaga_9': 'Ne', 'Mars_Vaga_10': 'Ne', 'Mars_Vaga_11': 'Ne', 'Mars_Vaga_12': 'Ne',

      'Mars_Škorpion_1': 'Da', 'Mars_Škorpion_2': 'Da', 'Mars_Škorpion_3': 'Da', 'Mars_Škorpion_4': 'Da',
      'Mars_Škorpion_5': 'Da', 'Mars_Škorpion_6': 'Da', 'Mars_Škorpion_7': 'Da', 'Mars_Škorpion_8': 'Da',
      'Mars_Škorpion_9': 'Da', 'Mars_Škorpion_10': 'Da', 'Mars_Škorpion_11': 'Da', 'Mars_Škorpion_12': 'Da',

      'Mars_Strelac_1': 'Da', 'Mars_Strelac_2': 'Ne', 'Mars_Strelac_3': 'Ne', 'Mars_Strelac_4': 'Ne',
      'Mars_Strelac_5': 'Da', 'Mars_Strelac_6': 'Ne', 'Mars_Strelac_7': 'Ne', 'Mars_Strelac_8': 'Ne',
      'Mars_Strelac_9': 'Da', 'Mars_Strelac_10': 'Da', 'Mars_Strelac_11': 'Ne', 'Mars_Strelac_12': 'Da',

      'Mars_Jarac_1': 'Da', 'Mars_Jarac_2': 'Da', 'Mars_Jarac_3': 'Da', 'Mars_Jarac_4': 'Da',
      'Mars_Jarac_5': 'Da', 'Mars_Jarac_6': 'Da', 'Mars_Jarac_7': 'Da', 'Mars_Jarac_8': 'Da',
      'Mars_Jarac_9': 'Da', 'Mars_Jarac_10': 'Da', 'Mars_Jarac_11': 'Da', 'Mars_Jarac_12': 'Da',

      'Mars_Vodolija_1': 'Da', 'Mars_Vodolija_2': 'Da', 'Mars_Vodolija_3': 'Ne', 'Mars_Vodolija_4': 'Ne',
      'Mars_Vodolija_5': 'Da', 'Mars_Vodolija_6': 'Ne', 'Mars_Vodolija_7': 'Ne', 'Mars_Vodolija_8': 'Da',
      'Mars_Vodolija_9': 'Da', 'Mars_Vodolija_10': 'Da', 'Mars_Vodolija_11': 'Da', 'Mars_Vodolija_12': 'Ne',

      'Mars_Ribe_1': 'Ne', 'Mars_Ribe_2': 'Ne', 'Mars_Ribe_3': 'Ne', 'Mars_Ribe_4': 'Ne',
      'Mars_Ribe_5': 'Da', 'Mars_Ribe_6': 'Ne', 'Mars_Ribe_7': 'Ne', 'Mars_Ribe_8': 'Da',
      'Mars_Ribe_9': 'Da', 'Mars_Ribe_10': 'Da', 'Mars_Ribe_11': 'Ne', 'Mars_Ribe_12': 'Ne',

      // JUPITER kombinacije
      'Jupiter_Ovan_1': 'Ne', 'Jupiter_Ovan_2': 'Ne', 'Jupiter_Ovan_3': 'Ne', 'Jupiter_Ovan_4': 'Ne',
      'Jupiter_Ovan_5': 'Ne', 'Jupiter_Ovan_6': 'Ne', 'Jupiter_Ovan_7': 'Ne', 'Jupiter_Ovan_8': 'Ne',
      'Jupiter_Ovan_9': 'Ne', 'Jupiter_Ovan_10': 'Ne', 'Jupiter_Ovan_11': 'Ne', 'Jupiter_Ovan_12': 'Ne',

      'Jupiter_Bik_1': 'Da', 'Jupiter_Bik_2': 'Da', 'Jupiter_Bik_3': 'Ne', 'Jupiter_Bik_4': 'Da',
      'Jupiter_Bik_5': 'Da', 'Jupiter_Bik_6': 'Ne', 'Jupiter_Bik_7': 'Da', 'Jupiter_Bik_8': 'Ne',
      'Jupiter_Bik_9': 'Da', 'Jupiter_Bik_10': 'Da', 'Jupiter_Bik_11': 'Ne', 'Jupiter_Bik_12': 'Da',

      'Jupiter_Blizanac_1': 'Ne', 'Jupiter_Blizanac_2': 'Ne', 'Jupiter_Blizanac_3': 'Ne', 'Jupiter_Blizanac_4': 'Ne',
      'Jupiter_Blizanac_5': 'Ne', 'Jupiter_Blizanac_6': 'Ne', 'Jupiter_Blizanac_7': 'Ne', 'Jupiter_Blizanac_8': 'Ne',
      'Jupiter_Blizanac_9': 'Ne', 'Jupiter_Blizanac_10': 'Ne', 'Jupiter_Blizanac_11': 'Ne', 'Jupiter_Blizanac_12': 'Ne',

      'Jupiter_Rak_1': 'Da', 'Jupiter_Rak_2': 'Da', 'Jupiter_Rak_3': 'Da', 'Jupiter_Rak_4': 'Da',
      'Jupiter_Rak_5': 'Da', 'Jupiter_Rak_6': 'Da', 'Jupiter_Rak_7': 'Da', 'Jupiter_Rak_8': 'Da',
      'Jupiter_Rak_9': 'Da', 'Jupiter_Rak_10': 'Da', 'Jupiter_Rak_11': 'Da', 'Jupiter_Rak_12': 'Da',

      'Jupiter_Lav_1': 'Da', 'Jupiter_Lav_2': 'Da', 'Jupiter_Lav_3': 'Da', 'Jupiter_Lav_4': 'Da',
      'Jupiter_Lav_5': 'Da', 'Jupiter_Lav_6': 'Ne', 'Jupiter_Lav_7': 'Da', 'Jupiter_Lav_8': 'Da',
      'Jupiter_Lav_9': 'Da', 'Jupiter_Lav_10': 'Da', 'Jupiter_Lav_11': 'Da', 'Jupiter_Lav_12': 'Da',

      'Jupiter_Devica_1': 'Ne', 'Jupiter_Devica_2': 'Ne', 'Jupiter_Devica_3': 'Ne', 'Jupiter_Devica_4': 'Ne',
      'Jupiter_Devica_5': 'Ne', 'Jupiter_Devica_6': 'Ne', 'Jupiter_Devica_7': 'Ne', 'Jupiter_Devica_8': 'Ne',
      'Jupiter_Devica_9': 'Ne', 'Jupiter_Devica_10': 'Ne', 'Jupiter_Devica_11': 'Ne', 'Jupiter_Devica_12': 'Ne',

      'Jupiter_Vaga_1': 'Da', 'Jupiter_Vaga_2': 'Da', 'Jupiter_Vaga_3': 'Da', 'Jupiter_Vaga_4': 'Da',
      'Jupiter_Vaga_5': 'Da', 'Jupiter_Vaga_6': 'Ne', 'Jupiter_Vaga_7': 'Da', 'Jupiter_Vaga_8': 'Ne',
      'Jupiter_Vaga_9': 'Da', 'Jupiter_Vaga_10': 'Da', 'Jupiter_Vaga_11': 'Da', 'Jupiter_Vaga_12': 'Da',

      'Jupiter_Škorpion_1': 'Ne', 'Jupiter_Škorpion_2': 'Da', 'Jupiter_Škorpion_3': 'Ne', 'Jupiter_Škorpion_4': 'Ne',
      'Jupiter_Škorpion_5': 'Da', 'Jupiter_Škorpion_6': 'Ne', 'Jupiter_Škorpion_7': 'Ne', 'Jupiter_Škorpion_8': 'Da',
      'Jupiter_Škorpion_9': 'Da', 'Jupiter_Škorpion_10': 'Da', 'Jupiter_Škorpion_11': 'Ne', 'Jupiter_Škorpion_12': 'Da',

      'Jupiter_Strelac_1': 'Da', 'Jupiter_Strelac_2': 'Da', 'Jupiter_Strelac_3': 'Da', 'Jupiter_Strelac_4': 'Da',
      'Jupiter_Strelac_5': 'Da', 'Jupiter_Strelac_6': 'Da', 'Jupiter_Strelac_7': 'Da', 'Jupiter_Strelac_8': 'Da',
      'Jupiter_Strelac_9': 'Da', 'Jupiter_Strelac_10': 'Da', 'Jupiter_Strelac_11': 'Da', 'Jupiter_Strelac_12': 'Da',

      'Jupiter_Jarac_1': 'Ne', 'Jupiter_Jarac_2': 'Ne', 'Jupiter_Jarac_3': 'Ne', 'Jupiter_Jarac_4': 'Ne',
      'Jupiter_Jarac_5': 'Ne', 'Jupiter_Jarac_6': 'Ne', 'Jupiter_Jarac_7': 'Ne', 'Jupiter_Jarac_8': 'Ne',
      'Jupiter_Jarac_9': 'Ne', 'Jupiter_Jarac_10': 'Ne', 'Jupiter_Jarac_11': 'Ne', 'Jupiter_Jarac_12': 'Ne',

      'Jupiter_Vodolija_1': 'Ne', 'Jupiter_Vodolija_2': 'Da', 'Jupiter_Vodolija_3': 'Ne', 'Jupiter_Vodolija_4': 'Da',
      'Jupiter_Vodolija_5': 'Da', 'Jupiter_Vodolija_6': 'Ne', 'Jupiter_Vodolija_7': 'Da', 'Jupiter_Vodolija_8': 'Da',
      'Jupiter_Vodolija_9': 'Da', 'Jupiter_Vodolija_10': 'Ne', 'Jupiter_Vodolija_11': 'Da', 'Jupiter_Vodolija_12': 'Da',

      'Jupiter_Ribe_1': 'Da', 'Jupiter_Ribe_2': 'Da', 'Jupiter_Ribe_3': 'Da', 'Jupiter_Ribe_4': 'Da',
      'Jupiter_Ribe_5': 'Da', 'Jupiter_Ribe_6': 'Da', 'Jupiter_Ribe_7': 'Da', 'Jupiter_Ribe_8': 'Da',
      'Jupiter_Ribe_9': 'Da', 'Jupiter_Ribe_10': 'Da', 'Jupiter_Ribe_11': 'Da', 'Jupiter_Ribe_12': 'Da',

      // SATURN kombinacije  
      'Saturn_Ovan_1': 'Ne', 'Saturn_Ovan_2': 'Ne', 'Saturn_Ovan_3': 'Ne', 'Saturn_Ovan_4': 'Ne',
      'Saturn_Ovan_5': 'Ne', 'Saturn_Ovan_6': 'Ne', 'Saturn_Ovan_7': 'Ne', 'Saturn_Ovan_8': 'Ne',
      'Saturn_Ovan_9': 'Ne', 'Saturn_Ovan_10': 'Ne', 'Saturn_Ovan_11': 'Ne', 'Saturn_Ovan_12': 'Ne',

      'Saturn_Bik_1': 'Ne', 'Saturn_Bik_2': 'Da', 'Saturn_Bik_3': 'Da', 'Saturn_Bik_4': 'Ne',
      'Saturn_Bik_5': 'Da', 'Saturn_Bik_6': 'Ne', 'Saturn_Bik_7': 'Ne', 'Saturn_Bik_8': 'Ne',
      'Saturn_Bik_9': 'Ne', 'Saturn_Bik_10': 'Da', 'Saturn_Bik_11': 'Ne', 'Saturn_Bik_12': 'Ne',

      'Saturn_Blizanac_1': 'Ne', 'Saturn_Blizanac_2': 'Ne', 'Saturn_Blizanac_3': 'Ne', 'Saturn_Blizanac_4': 'Ne',
      'Saturn_Blizanac_5': 'Da', 'Saturn_Blizanac_6': 'Ne', 'Saturn_Blizanac_7': 'Ne', 'Saturn_Blizanac_8': 'Ne',
      'Saturn_Blizanac_9': 'Ne', 'Saturn_Blizanac_10': 'Da', 'Saturn_Blizanac_11': 'Da', 'Saturn_Blizanac_12': 'Ne',

      'Saturn_Rak_1': 'Ne', 'Saturn_Rak_2': 'Ne', 'Saturn_Rak_3': 'Ne', 'Saturn_Rak_4': 'Ne',
      'Saturn_Rak_5': 'Ne', 'Saturn_Rak_6': 'Ne', 'Saturn_Rak_7': 'Ne', 'Saturn_Rak_8': 'Ne',
      'Saturn_Rak_9': 'Ne', 'Saturn_Rak_10': 'Ne', 'Saturn_Rak_11': 'Ne', 'Saturn_Rak_12': 'Ne',

      'Saturn_Lav_1': 'Ne', 'Saturn_Lav_2': 'Da', 'Saturn_Lav_3': 'Ne', 'Saturn_Lav_4': 'Ne',
      'Saturn_Lav_5': 'Da', 'Saturn_Lav_6': 'Ne', 'Saturn_Lav_7': 'Ne', 'Saturn_Lav_8': 'Ne',
      'Saturn_Lav_9': 'Ne', 'Saturn_Lav_10': 'Da', 'Saturn_Lav_11': 'Da', 'Saturn_Lav_12': 'Ne',

      'Saturn_Devica_1': 'Ne', 'Saturn_Devica_2': 'Ne', 'Saturn_Devica_3': 'Ne', 'Saturn_Devica_4': 'Ne',
      'Saturn_Devica_5': 'Ne', 'Saturn_Devica_6': 'Ne', 'Saturn_Devica_7': 'Ne', 'Saturn_Devica_8': 'Ne',
      'Saturn_Devica_9': 'Ne', 'Saturn_Devica_10': 'Da', 'Saturn_Devica_11': 'Da', 'Saturn_Devica_12': 'Ne',

      'Saturn_Vaga_1': 'Da', 'Saturn_Vaga_2': 'Da', 'Saturn_Vaga_3': 'Da', 'Saturn_Vaga_4': 'Ne',
      'Saturn_Vaga_5': 'Da', 'Saturn_Vaga_6': 'Da', 'Saturn_Vaga_7': 'Da', 'Saturn_Vaga_8': 'Da',
      'Saturn_Vaga_9': 'Da', 'Saturn_Vaga_10': 'Da', 'Saturn_Vaga_11': 'Da', 'Saturn_Vaga_12': 'Da',

      'Saturn_Škorpion_1': 'Da', 'Saturn_Škorpion_2': 'Da', 'Saturn_Škorpion_3': 'Ne', 'Saturn_Škorpion_4': 'Ne',
      'Saturn_Škorpion_5': 'Ne', 'Saturn_Škorpion_6': 'Ne', 'Saturn_Škorpion_7': 'Ne', 'Saturn_Škorpion_8': 'Ne',
      'Saturn_Škorpion_9': 'Ne', 'Saturn_Škorpion_10': 'Da', 'Saturn_Škorpion_11': 'Da', 'Saturn_Škorpion_12': 'Ne',

      'Saturn_Strelac_1': 'Ne', 'Saturn_Strelac_2': 'Ne', 'Saturn_Strelac_3': 'Ne', 'Saturn_Strelac_4': 'Ne',
      'Saturn_Strelac_5': 'Ne', 'Saturn_Strelac_6': 'Ne', 'Saturn_Strelac_7': 'Ne', 'Saturn_Strelac_8': 'Ne',
      'Saturn_Strelac_9': 'Ne', 'Saturn_Strelac_10': 'Ne', 'Saturn_Strelac_11': 'Ne', 'Saturn_Strelac_12': 'Ne',

      'Saturn_Jarac_1': 'Da', 'Saturn_Jarac_2': 'Da', 'Saturn_Jarac_3': 'Da', 'Saturn_Jarac_4': 'Ne',
      'Saturn_Jarac_5': 'Da', 'Saturn_Jarac_6': 'Da', 'Saturn_Jarac_7': 'Da', 'Saturn_Jarac_8': 'Da',
      'Saturn_Jarac_9': 'Da', 'Saturn_Jarac_10': 'Da', 'Saturn_Jarac_11': 'Da', 'Saturn_Jarac_12': 'Da',

      'Saturn_Vodolija_1': 'Da', 'Saturn_Vodolija_2': 'Da', 'Saturn_Vodolija_3': 'Da', 'Saturn_Vodolija_4': 'Ne',
      'Saturn_Vodolija_5': 'Da', 'Saturn_Vodolija_6': 'Da', 'Saturn_Vodolija_7': 'Da', 'Saturn_Vodolija_8': 'Da',
      'Saturn_Vodolija_9': 'Da', 'Saturn_Vodolija_10': 'Da', 'Saturn_Vodolija_11': 'Da', 'Saturn_Vodolija_12': 'Da',

      'Saturn_Ribe_1': 'Ne', 'Saturn_Ribe_2': 'Ne', 'Saturn_Ribe_3': 'Ne', 'Saturn_Ribe_4': 'Ne', 'Saturn_Ribe_5': 'Ne', 'Saturn_Ribe_6': 'Ne', 'Saturn_Ribe_7': 'Da', 'Saturn_Ribe_8': 'Ne', 'Saturn_Ribe_9': 'Ne', 'Saturn_Ribe_10': 'Da', 'Saturn_Ribe_11': 'Da', 'Saturn_Ribe_12': 'Ne',


      // URAN kombinacije
      'Uran_Ovan_1': 'Ne', 'Uran_Ovan_2': 'Ne', 'Uran_Ovan_3': 'Ne', 'Uran_Ovan_4': 'Ne',
      'Uran_Ovan_5': 'Ne', 'Uran_Ovan_6': 'Ne', 'Uran_Ovan_7': 'Ne', 'Uran_Ovan_8': 'Da',
      'Uran_Ovan_9': 'Ne', 'Uran_Ovan_10': 'Ne', 'Uran_Ovan_11': 'Da', 'Uran_Ovan_12': 'Ne',

      'Uran_Bik_1': 'Ne', 'Uran_Bik_2': 'Ne', 'Uran_Bik_3': 'Ne', 'Uran_Bik_4': 'Ne',
      'Uran_Bik_5': 'Ne', 'Uran_Bik_6': 'Ne', 'Uran_Bik_7': 'Ne', 'Uran_Bik_8': 'Ne',
      'Uran_Bik_9': 'Ne', 'Uran_Bik_10': 'Ne', 'Uran_Bik_11': 'Ne', 'Uran_Bik_12': 'Ne',

      'Uran_Blizanac_1': 'Ne', 'Uran_Blizanac_2': 'Ne', 'Uran_Blizanac_3': 'Ne', 'Uran_Blizanac_4': 'Ne',
      'Uran_Blizanac_5': 'Ne', 'Uran_Blizanac_6': 'Ne', 'Uran_Blizanac_7': 'Ne', 'Uran_Blizanac_8': 'Da',
      'Uran_Blizanac_9': 'Ne', 'Uran_Blizanac_10': 'Ne', 'Uran_Blizanac_11': 'Da', 'Uran_Blizanac_12': 'Ne',

      'Uran_Rak_1': 'Ne', 'Uran_Rak_2': 'Ne', 'Uran_Rak_3': 'Ne', 'Uran_Rak_4': 'Ne',
      'Uran_Rak_5': 'Ne', 'Uran_Rak_6': 'Ne', 'Uran_Rak_7': 'Ne', 'Uran_Rak_8': 'Da',
      'Uran_Rak_9': 'Ne', 'Uran_Rak_10': 'Ne', 'Uran_Rak_11': 'Da', 'Uran_Rak_12': 'Ne',

      'Uran_Lav_1': 'Ne', 'Uran_Lav_2': 'Ne', 'Uran_Lav_3': 'Ne', 'Uran_Lav_4': 'Ne',
      'Uran_Lav_5': 'Ne', 'Uran_Lav_6': 'Ne', 'Uran_Lav_7': 'Ne', 'Uran_Lav_8': 'Ne',
      'Uran_Lav_9': 'Ne', 'Uran_Lav_10': 'Ne', 'Uran_Lav_11': 'Ne', 'Uran_Lav_12': 'Ne',

      'Uran_Devica_1': 'Ne', 'Uran_Devica_2': 'Ne', 'Uran_Devica_3': 'Ne', 'Uran_Devica_4': 'Ne',
      'Uran_Devica_5': 'Ne', 'Uran_Devica_6': 'Ne', 'Uran_Devica_7': 'Ne', 'Uran_Devica_8': 'Da',
      'Uran_Devica_9': 'Ne', 'Uran_Devica_10': 'Ne', 'Uran_Devica_11': 'Da', 'Uran_Devica_12': 'Ne',

      'Uran_Vaga_1': 'Ne', 'Uran_Vaga_2': 'Ne', 'Uran_Vaga_3': 'Ne', 'Uran_Vaga_4': 'Ne',
      'Uran_Vaga_5': 'Ne', 'Uran_Vaga_6': 'Ne', 'Uran_Vaga_7': 'Ne', 'Uran_Vaga_8': 'Da',
      'Uran_Vaga_9': 'Ne', 'Uran_Vaga_10': 'Ne', 'Uran_Vaga_11': 'Da', 'Uran_Vaga_12': 'Ne',

      'Uran_Škorpion_1': 'Da', 'Uran_Škorpion_2': 'Da', 'Uran_Škorpion_3': 'Da', 'Uran_Škorpion_4': 'Da',
      'Uran_Škorpion_5': 'Da', 'Uran_Škorpion_6': 'Da', 'Uran_Škorpion_7': 'Da', 'Uran_Škorpion_8': 'Da',
      'Uran_Škorpion_9': 'Da', 'Uran_Škorpion_10': 'Da', 'Uran_Škorpion_11': 'Da', 'Uran_Škorpion_12': 'Da',

      'Uran_Strelac_1': 'Ne', 'Uran_Strelac_2': 'Ne', 'Uran_Strelac_3': 'Ne', 'Uran_Strelac_4': 'Ne',
      'Uran_Strelac_5': 'Ne', 'Uran_Strelac_6': 'Ne', 'Uran_Strelac_7': 'Ne', 'Uran_Strelac_8': 'Da',
      'Uran_Strelac_9': 'Ne', 'Uran_Strelac_10': 'Ne', 'Uran_Strelac_11': 'Da', 'Uran_Strelac_12': 'Ne',

      'Uran_Jarac_1': 'Ne', 'Uran_Jarac_2': 'Ne', 'Uran_Jarac_3': 'Ne', 'Uran_Jarac_4': 'Ne',
      'Uran_Jarac_5': 'Ne', 'Uran_Jarac_6': 'Ne', 'Uran_Jarac_7': 'Ne', 'Uran_Jarac_8': 'Ne',
      'Uran_Jarac_9': 'Ne', 'Uran_Jarac_10': 'Ne', 'Uran_Jarac_11': 'Ne', 'Uran_Jarac_12': 'Ne',

      'Uran_Vodolija_1': 'Da', 'Uran_Vodolija_2': 'Ne', 'Uran_Vodolija_3': 'Da', 'Uran_Vodolija_4': 'Da',
      'Uran_Vodolija_5': 'Ne', 'Uran_Vodolija_6': 'Da', 'Uran_Vodolija_7': 'Da', 'Uran_Vodolija_8': 'Da',
      'Uran_Vodolija_9': 'Da', 'Uran_Vodolija_10': 'Da', 'Uran_Vodolija_11': 'Da', 'Uran_Vodolija_12': 'Da',

      'Uran_Ribe_1': 'Ne', 'Uran_Ribe_2': 'Ne', 'Uran_Ribe_3': 'Ne', 'Uran_Ribe_4': 'Ne',
      'Uran_Ribe_5': 'Ne', 'Uran_Ribe_6': 'Ne', 'Uran_Ribe_7': 'Ne', 'Uran_Ribe_8': 'Da',
      'Uran_Ribe_9': 'Ne', 'Uran_Ribe_10': 'Ne', 'Uran_Ribe_11': 'Da', 'Uran_Ribe_12': 'Ne',

      // NEPTUN kombinacije
      'Neptun_Ovan_1': 'Ne', 'Neptun_Ovan_2': 'Ne', 'Neptun_Ovan_3': 'Ne', 'Neptun_Ovan_4': 'Ne',
      'Neptun_Ovan_5': 'Ne', 'Neptun_Ovan_6': 'Ne', 'Neptun_Ovan_7': 'Ne', 'Neptun_Ovan_8': 'Ne',
      'Neptun_Ovan_9': 'Ne', 'Neptun_Ovan_10': 'Ne', 'Neptun_Ovan_11': 'Da', 'Neptun_Ovan_12': 'Da',

      'Neptun_Bik_1': 'Ne', 'Neptun_Bik_2': 'Da', 'Neptun_Bik_3': 'Ne', 'Neptun_Bik_4': 'Ne',
      'Neptun_Bik_5': 'Ne', 'Neptun_Bik_6': 'Ne', 'Neptun_Bik_7': 'Ne', 'Neptun_Bik_8': 'Ne',
      'Neptun_Bik_9': 'Ne', 'Neptun_Bik_10': 'Da', 'Neptun_Bik_11': 'Da', 'Neptun_Bik_12': 'Da',

      'Neptun_Blizanac_1': 'Ne', 'Neptun_Blizanac_2': 'Ne', 'Neptun_Blizanac_3': 'Ne', 'Neptun_Blizanac_4': 'Ne',
      'Neptun_Blizanac_5': 'Ne', 'Neptun_Blizanac_6': 'Ne', 'Neptun_Blizanac_7': 'Ne', 'Neptun_Blizanac_8': 'Ne',
      'Neptun_Blizanac_9': 'Ne', 'Neptun_Blizanac_10': 'Ne', 'Neptun_Blizanac_11': 'Da', 'Neptun_Blizanac_12': 'Da',

      'Neptun_Rak_1': 'Ne', 'Neptun_Rak_2': 'Ne', 'Neptun_Rak_3': 'Ne', 'Neptun_Rak_4': 'Ne',
      'Neptun_Rak_5': 'Ne', 'Neptun_Rak_6': 'Ne', 'Neptun_Rak_7': 'Ne', 'Neptun_Rak_8': 'Ne',
      'Neptun_Rak_9': 'Da', 'Neptun_Rak_10': 'Ne', 'Neptun_Rak_11': 'Da', 'Neptun_Rak_12': 'Da',

      'Neptun_Lav_1': 'Ne', 'Neptun_Lav_2': 'Ne', 'Neptun_Lav_3': 'Ne', 'Neptun_Lav_4': 'Ne',
      'Neptun_Lav_5': 'Ne', 'Neptun_Lav_6': 'Ne', 'Neptun_Lav_7': 'Ne', 'Neptun_Lav_8': 'Ne',
      'Neptun_Lav_9': 'Ne', 'Neptun_Lav_10': 'Ne', 'Neptun_Lav_11': 'Ne', 'Neptun_Lav_12': 'Ne',

      'Neptun_Devica_1': 'Ne', 'Neptun_Devica_2': 'Ne', 'Neptun_Devica_3': 'Ne', 'Neptun_Devica_4': 'Ne',
      'Neptun_Devica_5': 'Ne', 'Neptun_Devica_6': 'Ne', 'Neptun_Devica_7': 'Ne', 'Neptun_Devica_8': 'Ne',
      'Neptun_Devica_9': 'Ne', 'Neptun_Devica_10': 'Ne', 'Neptun_Devica_11': 'Ne', 'Neptun_Devica_12': 'Ne',

      'Neptun_Vaga_1': 'Ne', 'Neptun_Vaga_2': 'Ne', 'Neptun_Vaga_3': 'Ne', 'Neptun_Vaga_4': 'Ne',
      'Neptun_Vaga_5': 'Ne', 'Neptun_Vaga_6': 'Ne', 'Neptun_Vaga_7': 'Ne', 'Neptun_Vaga_8': 'Ne',
      'Neptun_Vaga_9': 'Ne', 'Neptun_Vaga_10': 'Ne', 'Neptun_Vaga_11': 'Da', 'Neptun_Vaga_12': 'Da',

      'Neptun_Škorpion_1': 'Ne', 'Neptun_Škorpion_2': 'Ne', 'Neptun_Škorpion_3': 'Ne', 'Neptun_Škorpion_4': 'Ne',
      'Neptun_Škorpion_5': 'Ne', 'Neptun_Škorpion_6': 'Ne', 'Neptun_Škorpion_7': 'Ne', 'Neptun_Škorpion_8': 'Ne',
      'Neptun_Škorpion_9': 'Ne', 'Neptun_Škorpion_10': 'Ne', 'Neptun_Škorpion_11': 'Da', 'Neptun_Škorpion_12': 'Da',

      'Neptun_Strelac_1': 'Da', 'Neptun_Strelac_2': 'Ne', 'Neptun_Strelac_3': 'Ne', 'Neptun_Strelac_4': 'Ne',
      'Neptun_Strelac_5': 'Ne', 'Neptun_Strelac_6': 'Ne', 'Neptun_Strelac_7': 'Ne', 'Neptun_Strelac_8': 'Ne',
      'Neptun_Strelac_9': 'Ne', 'Neptun_Strelac_10': 'Ne', 'Neptun_Strelac_11': 'Da', 'Neptun_Strelac_12': 'Da',

      'Neptun_Jarac_1': 'Ne', 'Neptun_Jarac_2': 'Ne', 'Neptun_Jarac_3': 'Ne', 'Neptun_Jarac_4': 'Ne',
      'Neptun_Jarac_5': 'Ne', 'Neptun_Jarac_6': 'Ne', 'Neptun_Jarac_7': 'Ne', 'Neptun_Jarac_8': 'Ne',
      'Neptun_Jarac_9': 'Ne', 'Neptun_Jarac_10': 'Ne', 'Neptun_Jarac_11': 'Da', 'Neptun_Jarac_12': 'Da',

      'Neptun_Vodolija_1': 'Da', 'Neptun_Vodolija_2': 'Ne', 'Neptun_Vodolija_3': 'Da', 'Neptun_Vodolija_4': 'Da',
      'Neptun_Vodolija_5': 'Da', 'Neptun_Vodolija_6': 'Ne', 'Neptun_Vodolija_7': 'Da', 'Neptun_Vodolija_8': 'Da',
      'Neptun_Vodolija_9': 'Da', 'Neptun_Vodolija_10': 'Da', 'Neptun_Vodolija_11': 'Da', 'Neptun_Vodolija_12': 'Da',

      'Neptun_Ribe_1': 'Da', 'Neptun_Ribe_2': 'Da', 'Neptun_Ribe_3': 'Da', 'Neptun_Ribe_4': 'Da',
      'Neptun_Ribe_5': 'Da', 'Neptun_Ribe_6': 'Da', 'Neptun_Ribe_7': 'Da', 'Neptun_Ribe_8': 'Da',
      'Neptun_Ribe_9': 'Da', 'Neptun_Ribe_10': 'Da', 'Neptun_Ribe_11': 'Da', 'Neptun_Ribe_12': 'Da',

      // PLUTON kombinacije
      'Pluton_Ovan_1': 'Da', 'Pluton_Ovan_2': 'Da', 'Pluton_Ovan_3': 'Ne', 'Pluton_Ovan_4': 'Ne',
      'Pluton_Ovan_5': 'Ne', 'Pluton_Ovan_6': 'Ne', 'Pluton_Ovan_7': 'Ne', 'Pluton_Ovan_8': 'Da',
      'Pluton_Ovan_9': 'Ne', 'Pluton_Ovan_10': 'Ne', 'Pluton_Ovan_11': 'Ne', 'Pluton_Ovan_12': 'Ne',

      'Pluton_Bik_1': 'Ne', 'Pluton_Bik_2': 'Ne', 'Pluton_Bik_3': 'Ne', 'Pluton_Bik_4': 'Ne',
      'Pluton_Bik_5': 'Ne', 'Pluton_Bik_6': 'Ne', 'Pluton_Bik_7': 'Ne', 'Pluton_Bik_8': 'Ne',
      'Pluton_Bik_9': 'Ne', 'Pluton_Bik_10': 'Ne', 'Pluton_Bik_11': 'Ne', 'Pluton_Bik_12': 'Ne',

      'Pluton_Blizanac_1': 'Ne', 'Pluton_Blizanac_2': 'Ne', 'Pluton_Blizanac_3': 'Ne', 'Pluton_Blizanac_4': 'Ne',
      'Pluton_Blizanac_5': 'Ne', 'Pluton_Blizanac_6': 'Ne', 'Pluton_Blizanac_7': 'Ne', 'Pluton_Blizanac_8': 'Da',
      'Pluton_Blizanac_9': 'Ne', 'Pluton_Blizanac_10': 'Ne', 'Pluton_Blizanac_11': 'Ne', 'Pluton_Blizanac_12': 'Ne',

      'Pluton_Rak_1': 'Ne', 'Pluton_Rak_2': 'Ne', 'Pluton_Rak_3': 'Ne', 'Pluton_Rak_4': 'Ne',
      'Pluton_Rak_5': 'Ne', 'Pluton_Rak_6': 'Ne', 'Pluton_Rak_7': 'Ne', 'Pluton_Rak_8': 'Da',
      'Pluton_Rak_9': 'Ne', 'Pluton_Rak_10': 'Ne', 'Pluton_Rak_11': 'Ne', 'Pluton_Rak_12': 'Ne',

      'Pluton_Lav_1': 'Ne', 'Pluton_Lav_2': 'Da', 'Pluton_Lav_3': 'Ne', 'Pluton_Lav_4': 'Ne',
      'Pluton_Lav_5': 'Da', 'Pluton_Lav_6': 'Ne', 'Pluton_Lav_7': 'Da', 'Pluton_Lav_8': 'Da',
      'Pluton_Lav_9': 'Ne', 'Pluton_Lav_10': 'Da', 'Pluton_Lav_11': 'Da', 'Pluton_Lav_12': 'Da',

      'Pluton_Devica_1': 'Ne', 'Pluton_Devica_2': 'Ne', 'Pluton_Devica_3': 'Ne', 'Pluton_Devica_4': 'Ne',
      'Pluton_Devica_5': 'Ne', 'Pluton_Devica_6': 'Ne', 'Pluton_Devica_7': 'Ne', 'Pluton_Devica_8': 'Da',
      'Pluton_Devica_9': 'Ne', 'Pluton_Devica_10': 'Ne', 'Pluton_Devica_11': 'Ne', 'Pluton_Devica_12': 'Ne',

      'Pluton_Vaga_1': 'Ne', 'Pluton_Vaga_2': 'Ne', 'Pluton_Vaga_3': 'Ne', 'Pluton_Vaga_4': 'Ne',
      'Pluton_Vaga_5': 'Ne', 'Pluton_Vaga_6': 'Ne', 'Pluton_Vaga_7': 'Ne', 'Pluton_Vaga_8': 'Da',
      'Pluton_Vaga_9': 'Ne', 'Pluton_Vaga_10': 'Ne', 'Pluton_Vaga_11': 'Ne', 'Pluton_Vaga_12': 'Ne',

      'Pluton_Škorpion_1': 'Da', 'Pluton_Škorpion_2': 'Da', 'Pluton_Škorpion_3': 'Da', 'Pluton_Škorpion_4': 'Da',
      'Pluton_Škorpion_5': 'Da', 'Pluton_Škorpion_6': 'Da', 'Pluton_Škorpion_7': 'Da', 'Pluton_Škorpion_8': 'Da',
      'Pluton_Škorpion_9': 'Da', 'Pluton_Škorpion_10': 'Da', 'Pluton_Škorpion_11': 'Da', 'Pluton_Škorpion_12': 'Da',

      'Pluton_Strelac_1': 'Ne', 'Pluton_Strelac_2': 'Ne', 'Pluton_Strelac_3': 'Ne', 'Pluton_Strelac_4': 'Ne',
      'Pluton_Strelac_5': 'Ne', 'Pluton_Strelac_6': 'Ne', 'Pluton_Strelac_7': 'Ne', 'Pluton_Strelac_8': 'Da',
      'Pluton_Strelac_9': 'Ne', 'Pluton_Strelac_10': 'Ne', 'Pluton_Strelac_11': 'Ne', 'Pluton_Strelac_12': 'Ne',

      'Pluton_Jarac_1': 'Ne', 'Pluton_Jarac_2': 'Ne', 'Pluton_Jarac_3': 'Ne', 'Pluton_Jarac_4': 'Ne',
      'Pluton_Jarac_5': 'Ne', 'Pluton_Jarac_6': 'Ne', 'Pluton_Jarac_7': 'Ne', 'Pluton_Jarac_8': 'Da',
      'Pluton_Jarac_9': 'Ne', 'Pluton_Jarac_10': 'Ne', 'Pluton_Jarac_11': 'Ne', 'Pluton_Jarac_12': 'Ne',

      'Pluton_Vodolija_1': 'Ne', 'Pluton_Vodolija_2': 'Da', 'Pluton_Vodolija_3': 'Ne', 'Pluton_Vodolija_4': 'Ne',
      'Pluton_Vodolija_5': 'Ne', 'Pluton_Vodolija_6': 'Ne', 'Pluton_Vodolija_7': 'Ne', 'Pluton_Vodolija_8': 'Da',
      'Pluton_Vodolija_9': 'Ne', 'Pluton_Vodolija_10': 'Ne', 'Pluton_Vodolija_11': 'Ne', 'Pluton_Vodolija_12': 'Ne',

      'Pluton_Ribe_1': 'Ne', 'Pluton_Ribe_2': 'Ne', 'Pluton_Ribe_3': 'Ne', 'Pluton_Ribe_4': 'Ne',
      'Pluton_Ribe_5': 'Ne', 'Pluton_Ribe_6': 'Ne', 'Pluton_Ribe_7': 'Ne', 'Pluton_Ribe_8': 'Da',
      'Pluton_Ribe_9': 'Ne', 'Pluton_Ribe_10': 'Ne', 'Pluton_Ribe_11': 'Ne', 'Pluton_Ribe_12': 'Ne',

      // SEVERNI ČVOR kombinacije
      'Severni čvor_Ovan_1': 'Da', 'Severni čvor_Ovan_2': 'Da', 'Severni čvor_Ovan_3': 'Da', 'Severni čvor_Ovan_4': 'Da',
      'Severni čvor_Ovan_5': 'Da', 'Severni čvor_Ovan_6': 'Da', 'Severni čvor_Ovan_7': 'Da', 'Severni čvor_Ovan_8': 'Da',
      'Severni čvor_Ovan_9': 'Da', 'Severni čvor_Ovan_10': 'Da', 'Severni čvor_Ovan_11': 'Da', 'Severni čvor_Ovan_12': 'Da',

      'Severni čvor_Bik_1': 'Da', 'Severni čvor_Bik_2': 'Ne', 'Severni čvor_Bik_3': 'Ne', 'Severni čvor_Bik_4': 'Ne',
      'Severni čvor_Bik_5': 'Ne', 'Severni čvor_Bik_6': 'Ne', 'Severni čvor_Bik_7': 'Ne', 'Severni čvor_Bik_8': 'Ne',
      'Severni čvor_Bik_9': 'Da', 'Severni čvor_Bik_10': 'Da', 'Severni čvor_Bik_11': 'Da', 'Severni čvor_Bik_12': 'Ne',

      'Severni čvor_Blizanac_1': 'Ne', 'Severni čvor_Blizanac_2': 'Ne', 'Severni čvor_Blizanac_3': 'Ne', 'Severni čvor_Blizanac_4': 'Ne', 'Severni čvor_Blizanac_5': 'Ne', 'Severni čvor_Blizanac_6': 'Ne', 'Severni čvor_Blizanac_7': 'Ne', 'Severni čvor_Blizanac_8': 'Ne', 'Severni čvor_Blizanac_9': 'Da', 'Severni čvor_Blizanac_10': 'Da', 'Severni čvor_Blizanac_11': 'Da', 'Severni čvor_Blizanac_12': 'Ne',

      'Severni čvor_Rak_1': 'Ne', 'Severni čvor_Rak_2': 'Ne', 'Severni čvor_Rak_3': 'Ne', 'Severni čvor_Rak_4': 'Ne',
      'Severni čvor_Rak_5': 'Ne', 'Severni čvor_Rak_6': 'Ne', 'Severni čvor_Rak_7': 'Ne', 'Severni čvor_Rak_8': 'Ne',
      'Severni čvor_Rak_9': 'Ne', 'Severni čvor_Rak_10': 'Ne', 'Severni čvor_Rak_11': 'Ne', 'Severni čvor_Rak_12': 'Ne',

      'Severni čvor_Lav_1': 'Da', 'Severni čvor_Lav_2': 'Da', 'Severni čvor_Lav_3': 'Da', 'Severni čvor_Lav_4': 'Ne',
      'Severni čvor_Lav_5': 'Da', 'Severni čvor_Lav_6': 'Da', 'Severni čvor_Lav_7': 'Da', 'Severni čvor_Lav_8': 'Ne',
      'Severni čvor_Lav_9': 'Da', 'Severni čvor_Lav_10': 'Da', 'Severni čvor_Lav_11': 'Da', 'Severni čvor_Lav_12': 'Ne',

      'Severni čvor_Devica_1': 'Ne', 'Severni čvor_Devica_2': 'Ne', 'Severni čvor_Devica_3': 'Ne', 'Severni čvor_Devica_4': 'Ne',
      'Severni čvor_Devica_5': 'Ne', 'Severni čvor_Devica_6': 'Ne', 'Severni čvor_Devica_7': 'Ne', 'Severni čvor_Devica_8': 'Ne',
      'Severni čvor_Devica_9': 'Da', 'Severni čvor_Devica_10': 'Da', 'Severni čvor_Devica_11': 'Ne', 'Severni čvor_Devica_12': 'Ne',

      'Severni čvor_Vaga_1': 'Da', 'Severni čvor_Vaga_2': 'Ne', 'Severni čvor_Vaga_3': 'Ne', 'Severni čvor_Vaga_4': 'Ne',
      'Severni čvor_Vaga_5': 'Da', 'Severni čvor_Vaga_6': 'Ne', 'Severni čvor_Vaga_7': 'Da', 'Severni čvor_Vaga_8': 'Ne',
      'Severni čvor_Vaga_9': 'Da', 'Severni čvor_Vaga_10': 'Da', 'Severni čvor_Vaga_11': 'Da', 'Severni čvor_Vaga_12': 'Ne',

      'Severni čvor_Škorpion_1': 'Ne', 'Severni čvor_Škorpion_2': 'Ne', 'Severni čvor_Škorpion_3': 'Ne', 'Severni čvor_Škorpion_4': 'Ne',
      'Severni čvor_Škorpion_5': 'Ne', 'Severni čvor_Škorpion_6': 'Ne', 'Severni čvor_Škorpion_7': 'Ne', 'Severni čvor_Škorpion_8': 'Ne',
      'Severni čvor_Škorpion_9': 'Da', 'Severni čvor_Škorpion_10': 'Da', 'Severni čvor_Škorpion_11': 'Ne', 'Severni čvor_Škorpion_12': 'Ne',

      'Severni čvor_Strelac_1': 'Da', 'Severni čvor_Strelac_2': 'Da', 'Severni čvor_Strelac_3': 'Da', 'Severni čvor_Strelac_4': 'Da',
      'Severni čvor_Strelac_5': 'Da', 'Severni čvor_Strelac_6': 'Da', 'Severni čvor_Strelac_7': 'Da', 'Severni čvor_Strelac_8': 'Da',
      'Severni čvor_Strelac_9': 'Da', 'Severni čvor_Strelac_10': 'Da', 'Severni čvor_Strelac_11': 'Da', 'Severni čvor_Strelac_12': 'Da',

      'Severni čvor_Jarac_1': 'Da', 'Severni čvor_Jarac_2': 'Da', 'Severni čvor_Jarac_3': 'Da', 'Severni čvor_Jarac_4': 'Da',
      'Severni čvor_Jarac_5': 'Da', 'Severni čvor_Jarac_6': 'Da', 'Severni čvor_Jarac_7': 'Da', 'Severni čvor_Jarac_8': 'Da',
      'Severni čvor_Jarac_9': 'Da', 'Severni čvor_Jarac_10': 'Da', 'Severni čvor_Jarac_11': 'Da', 'Severni čvor_Jarac_12': 'Da',

      'Severni čvor_Vodolija_1': 'Da', 'Severni čvor_Vodolija_2': 'Da', 'Severni čvor_Vodolija_3': 'Da', 'Severni čvor_Vodolija_4': 'Ne',
      'Severni čvor_Vodolija_5': 'Da', 'Severni čvor_Vodolija_6': 'Da', 'Severni čvor_Vodolija_7': 'Ne', 'Severni čvor_Vodolija_8': 'Ne',
      'Severni čvor_Vodolija_9': 'Da', 'Severni čvor_Vodolija_10': 'Da', 'Severni čvor_Vodolija_11': 'Da', 'Severni čvor_Vodolija_12': 'Ne',

      'Severni čvor_Ribe_1': 'Ne', 'Severni čvor_Ribe_2': 'Ne', 'Severni čvor_Ribe_3': 'Ne', 'Severni čvor_Ribe_4': 'Ne',
      'Severni čvor_Ribe_5': 'Ne', 'Severni čvor_Ribe_6': 'Ne', 'Severni čvor_Ribe_7': 'Ne', 'Severni čvor_Ribe_8': 'Ne',
      'Severni čvor_Ribe_9': 'Da', 'Severni čvor_Ribe_10': 'Da', 'Severni čvor_Ribe_11': 'Ne', 'Severni čvor_Ribe_12': 'Ne',

      // JUŽNI ČVOR kombinacije
      'Južni čvor_Ovan_1': 'Da', 'Južni čvor_Ovan_2': 'Ne', 'Južni čvor_Ovan_3': 'Ne', 'Južni čvor_Ovan_4': 'Da',
      'Južni čvor_Ovan_5': 'Ne', 'Južni čvor_Ovan_6': 'Ne', 'Južni čvor_Ovan_7': 'Ne', 'Južni čvor_Ovan_8': 'Da',
      'Južni čvor_Ovan_9': 'Ne', 'Južni čvor_Ovan_10': 'Ne', 'Južni čvor_Ovan_11': 'Ne', 'Južni čvor_Ovan_12': 'Da',

      'Južni čvor_Bik_1': 'Ne', 'Južni čvor_Bik_2': 'Ne', 'Južni čvor_Bik_3': 'Ne', 'Južni čvor_Bik_4': 'Ne',
      'Južni čvor_Bik_5': 'Ne', 'Južni čvor_Bik_6': 'Ne', 'Južni čvor_Bik_7': 'Ne', 'Južni čvor_Bik_8': 'Da',
      'Južni čvor_Bik_9': 'Ne', 'Južni čvor_Bik_10': 'Ne', 'Južni čvor_Bik_11': 'Ne', 'Južni čvor_Bik_12': 'Ne',

      'Južni čvor_Blizanac_1': 'Ne', 'Južni čvor_Blizanac_2': 'Ne', 'Južni čvor_Blizanac_3': 'Ne', 'Južni čvor_Blizanac_4': 'Ne',
      'Južni čvor_Blizanac_5': 'Ne', 'Južni čvor_Blizanac_6': 'Ne', 'Južni čvor_Blizanac_7': 'Ne', 'Južni čvor_Blizanac_8': 'Da',
      'Južni čvor_Blizanac_9': 'Ne', 'Južni čvor_Blizanac_10': 'Ne', 'Južni čvor_Blizanac_11': 'Ne', 'Južni čvor_Blizanac_12': 'Ne',

      'Južni čvor_Rak_1': 'Da', 'Južni čvor_Rak_2': 'Ne', 'Južni čvor_Rak_3': 'Da', 'Južni čvor_Rak_4': 'Da',
      'Južni čvor_Rak_5': 'Da', 'Južni čvor_Rak_6': 'Ne', 'Južni čvor_Rak_7': 'Ne', 'Južni čvor_Rak_8': 'Da',
      'Južni čvor_Rak_9': 'Ne', 'Južni čvor_Rak_10': 'Ne', 'Južni čvor_Rak_11': 'Ne', 'Južni čvor_Rak_12': 'Da',

      'Južni čvor_Lav_1': 'Ne', 'Južni čvor_Lav_2': 'Ne', 'Južni čvor_Lav_3': 'Ne', 'Južni čvor_Lav_4': 'Ne',
      'Južni čvor_Lav_5': 'Ne', 'Južni čvor_Lav_6': 'Ne', 'Južni čvor_Lav_7': 'Ne', 'Južni čvor_Lav_8': 'Da',
      'Južni čvor_Lav_9': 'Ne', 'Južni čvor_Lav_10': 'Ne', 'Južni čvor_Lav_11': 'Ne', 'Južni čvor_Lav_12': 'Ne',

      'Južni čvor_Devica_1': 'Ne', 'Južni čvor_Devica_2': 'Ne', 'Južni čvor_Devica_3': 'Ne', 'Južni čvor_Devica_4': 'Ne',
      'Južni čvor_Devica_5': 'Ne', 'Južni čvor_Devica_6': 'Ne', 'Južni čvor_Devica_7': 'Ne', 'Južni čvor_Devica_8': 'Da',
      'Južni čvor_Devica_9': 'Ne', 'Južni čvor_Devica_10': 'Ne', 'Južni čvor_Devica_11': 'Ne', 'Južni čvor_Devica_12': 'Ne',

      'Južni čvor_Vaga_1': 'Ne', 'Južni čvor_Vaga_2': 'Ne', 'Južni čvor_Vaga_3': 'Ne', 'Južni čvor_Vaga_4': 'Ne',
      'Južni čvor_Vaga_5': 'Ne', 'Južni čvor_Vaga_6': 'Ne', 'Južni čvor_Vaga_7': 'Ne', 'Južni čvor_Vaga_8': 'Da',
      'Južni čvor_Vaga_9': 'Ne', 'Južni čvor_Vaga_10': 'Ne', 'Južni čvor_Vaga_11': 'Ne', 'Južni čvor_Vaga_12': 'Da',

      'Južni čvor_Škorpion_1': 'Da', 'Južni čvor_Škorpion_2': 'Ne', 'Južni čvor_Škorpion_3': 'Ne', 'Južni čvor_Škorpion_4': 'Da',
      'Južni čvor_Škorpion_5': 'Ne', 'Južni čvor_Škorpion_6': 'Ne', 'Južni čvor_Škorpion_7': 'Ne', 'Južni čvor_Škorpion_8': 'Da',
      'Južni čvor_Škorpion_9': 'Ne', 'Južni čvor_Škorpion_10': 'Ne', 'Južni čvor_Škorpion_11': 'Ne', 'Južni čvor_Škorpion_12': 'Da',

      'Južni čvor_Strelac_1': 'Ne', 'Južni čvor_Strelac_2': 'Ne', 'Južni čvor_Strelac_3': 'Ne', 'Južni čvor_Strelac_4': 'Ne',
      'Južni čvor_Strelac_5': 'Ne', 'Južni čvor_Strelac_6': 'Ne', 'Južni čvor_Strelac_7': 'Ne', 'Južni čvor_Strelac_8': 'Da',
      'Južni čvor_Strelac_9': 'Ne', 'Južni čvor_Strelac_10': 'Ne', 'Južni čvor_Strelac_11': 'Ne', 'Južni čvor_Strelac_12': 'Da',

      'Južni čvor_Jarac_1': 'Ne', 'Južni čvor_Jarac_2': 'Ne', 'Južni čvor_Jarac_3': 'Ne', 'Južni čvor_Jarac_4': 'Ne',
      'Južni čvor_Jarac_5': 'Ne', 'Južni čvor_Jarac_6': 'Ne', 'Južni čvor_Jarac_7': 'Ne', 'Južni čvor_Jarac_8': 'Ne',
      'Južni čvor_Jarac_9': 'Ne', 'Južni čvor_Jarac_10': 'Ne', 'Južni čvor_Jarac_11': 'Ne', 'Južni čvor_Jarac_12': 'Ne',

      'Južni čvor_Vodolija_1': 'Ne', 'Južni čvor_Vodolija_2': 'Ne', 'Južni čvor_Vodolija_3': 'Ne', 'Južni čvor_Vodolija_4': 'Ne',
      'Južni čvor_Vodolija_5': 'Ne', 'Južni čvor_Vodolija_6': 'Ne', 'Južni čvor_Vodolija_7': 'Ne', 'Južni čvor_Vodolija_8': 'Da',
      'Južni čvor_Vodolija_9': 'Ne', 'Južni čvor_Vodolija_10': 'Ne', 'Južni čvor_Vodolija_11': 'Ne', 'Južni čvor_Vodolija_12': 'Da',

      'Južni čvor_Ribe_1': 'Da', 'Južni čvor_Ribe_2': 'Ne', 'Južni čvor_Ribe_3': 'Ne', 'Južni čvor_Ribe_4': 'Da',
      'Južni čvor_Ribe_5': 'Ne', 'Južni čvor_Ribe_6': 'Ne', 'Južni čvor_Ribe_7': 'Ne', 'Južni čvor_Ribe_8': 'Da',
      'Južni čvor_Ribe_9': 'Ne', 'Južni čvor_Ribe_10': 'Ne', 'Južni čvor_Ribe_11': 'Ne', 'Južni čvor_Ribe_12': 'Da',

      // Fallback za nedefinirane kombinacije
      // (Za sada ću dodati samo deo da pokažem strukturu)

      // Fallback za nedefinirane kombinacije
      'default': 'Ne'
    };

  // Tri kockice sa vašim kompletnim podacima
  private diceOptions: DiceOption[][] = [
    // Prva kockica – Planete (12 opcija)
    [
      { symbol: '☉', name: 'Sunce', meaning: 'otac, oženjen muškarac, zreo čovek, glumac, predsednik, direktor, šef, dan, svetlo, centralno svetlo, vitalnost, karakter, hrabrost, ponos, Ego, svest o sebi, volja, kreativnost, srce, oči, vid....' },
      { symbol: '☾', name: 'Mesec', meaning: 'žena, majka, dom, narod, porodica, intimnost, javnost, nepokretna imovina, plodnost, trudna žena, genetsko nasleđe, privatan posao, hrana i voda, emocije, podsvest, duša, bliskost, brižnost, sigurnost, nežnost, memorija, pamćenje, materica, grudi, stomak...' },
      { symbol: '♂', name: 'Mars', meaning: 'momak, brat, mladić, uniformisano lice, sportista, snažan muškarac, meso, ljuto, akutne bolesti, oružije, oštri predmeti, povrede, energija, hrabrost, borba, napad, adrenalin, strast, seksualna energija, muževnost, akcija, ljutnja, bes, sve ono što nas uzbuđuje...' },
      { symbol: '♀', name: 'Venera', meaning: 'ljubav, mlada devojka, sestra, ljubavnica, brak, bračni partner, diplomatija, imovina, nakit, slatkiši, cveće, parfemi, umetnost, moda, banka, materijalno, sposobnost za sticanje, osećaj za lepo, ženstvenost, ono što nas inspiriše, komfor, luksuz, grlo, jajnici...' },
      { symbol: '☿', name: 'Merkur', meaning: 'mladi ljudi, deca, komunikacija, informacija, braća i sestre, kraća putovanja, prevozna sredstva, rukopis, potpis, način pisanja, ime, način razmišljanja, osnovna škola, učenje, rad rukama, pošta, saobraćaj, novine, pisma, intelekt, ruke, nervi, čula, disajni organi...' },
      { symbol: '♃', name: 'Jupiter', meaning: 'veliko znanje i mudrost, novac, daleka putovanja, inostranstvo, učitelj, profesor, sveštenik, bogataš, obrazovanje, fakultet, skupe stvari, cena, plata, filozofija, religija, etika, pravda, advokat, ministar, titule, amajlija, zaštitnik, vera, plemenitost, darežljivost, misija, svrha, noge, butine, krv...' },
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

  // Inicijalni prikaz – prva opcija svake kockice
  dices: DiceOption[] = [
    this.diceOptions[0][0],
    this.diceOptions[1][0],
    this.diceOptions[2][0]
  ];

  rollDice() {
    if (this.isRolling) return;

    this.isRolling = true;
    this.reading = null;

    // Animacija bacanja kockica
    const rollInterval = setInterval(() => {
      this.dices = this.diceOptions.map(options =>
        options[Math.floor(Math.random() * options.length)]
      );
    }, 150);

    setTimeout(() => {
      this.zone.run(() => {
        clearInterval(rollInterval);
        this.isRolling = false;
        this.hasRolled = true;
        this.generateReading();
        this.cd.detectChanges();
      });
    }, 1000);
  }

  private generateReading() {
    const [planet, sign, house] = this.dices;

    // Kreiranje ključa za lookup u bazi podataka
    const houseNumber = house.name.replace('.kuća', '');
    const lookupKey = `${planet.name}_${sign.name}_${houseNumber}`;

    // Dobijanje Da/Ne odgovora iz baze podataka
    const answer = this.yesNoDatabase[lookupKey] || 'Ne';

    // Kreiranje personalizovanog čitanja
    const answerEmoji = answer === 'Da' ? '✅' : '❌';
    const encouragement = answer === 'Da' ? 'Zvezde su naklonjene!' : 'Sačekajte bolji trenutak.';

    this.reading = {
      title: `Odgovor: ${answer} ${answerEmoji}`,
      message: `${planet.name} u znaku ${sign.name} kroz ${house.name} ${answer === 'Da' ? 'favorizuje' : 'ne favorizuje'} vašu želju. ${encouragement}`,
      advice: this.generateAdvice(answer, planet, sign, house)
    };
  }

  private generateAdvice(answer: string, planet: DiceOption, sign: DiceOption, house: DiceOption): string {
    if (answer === 'Da') {
      return `Iskoristite pozitivnu energiju ${planet.name}a u ${sign.name} da aktivno radite na ostvarenju ciljeva u oblasti ${house.name}. Vreme je za akciju!`;
    } else {
      return `${planet.name} u ${sign.name} kroz ${house.name} savjetuje oprez. Fokusirajte se na pripremu i čekanje povoljnijeg trenutka.`;
    }
  }

  ngOnInit() {

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

  async loadPosts() {
    if (!this.db) return;

    this.isLoading = true;
    this.cdr.detectChanges();

    try {
      const querySnapshot = await getDocs(collection(this.db, 'posts'));

      const posts = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as BlogPost));

      const sorted = posts.sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));

      this.latestPost = sorted[0] ?? null; // uzmi samo prvi (najnoviji)

      console.log('Latest post:', this.latestPost);

    } catch (error) {
      console.error('Error loading posts:', error);
    } finally {
      this.isLoading = false;
      this.cdr.detectChanges();
    }
  }

  newPost: BlogPost = {
    title: '',
    date: '',
    category: 'Horoskop',
    excerpt: ''
  };

  expandedPostId: number | null = null;

  expandPost(post: BlogPost) {
    const newTab = window.open('', '_blank');
    if (newTab) {
      newTab.document.write(`
      <html>
        <head>
          <title>${post.title}</title>
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