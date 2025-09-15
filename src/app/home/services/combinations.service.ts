// src/app/services/combinations.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root' // Omogućava da servis bude dostupan globalno
})
export class CombinationsService {
  private combinationsData: any; // Keš za podatke

  constructor(private http: HttpClient) {}

  // Metoda za učitavanje podataka iz JSON-a
  loadCombinations(): Observable<any> {
    if (this.combinationsData) {
      // Ako su podaci već učitani, vrati ih odmah
      return new Observable(observer => {
        observer.next(this.combinationsData);
        observer.complete();
      });
    }
    // Inače, učitaj ih sa servera
    return this.http.get<any>('assets/combinations.json').pipe(
      map(data => {
        this.combinationsData = data; // Sačuvaj učitane podatke
        return data;
      })
    );
  }

  // Metoda za dobijanje specifičnog rezultata na osnovu planeta, znaka i kuće
  getOutcome(planet: string, sign: string, house: string): string | undefined {
    if (!this.combinationsData) {
      console.error("Combinations data not loaded yet!");
      return undefined;
    }

    // Proveri da li postoje podaci za datu planetu i znak
    if (this.combinationsData[planet] && this.combinationsData[planet][sign]) {
      // Vrati rezultat za odgovarajuću kuću
      return this.combinationsData[planet][sign][house];
    }
    return undefined; // Nisu pronađeni podaci
  }
}