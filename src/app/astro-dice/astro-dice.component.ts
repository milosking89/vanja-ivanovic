import { Component, OnDestroy, input, signal } from '@angular/core';
import {
  DICE_OPTIONS,
  DICE_ROLL_DURATION_MS,
  DICE_TEXTS,
  DiceOption,
  DiceReading,
  createReading
} from './astro-dice.config';

/**
 * Astro kockice – samostalna komponenta.
 *
 * Upotreba na bilo kojoj stranici:
 *   1) u komponenti: imports: [AstroDiceComponent]
 *   2) u šablonu:    <app-astro-dice />
 *      ili bez naslova i uvodnog teksta: <app-astro-dice [showIntro]="false" />
 *
 * Podaci (planete, znaci, kuće, DA/NE tabela) su u astro-dice.config.ts.
 */
@Component({
  selector: 'app-astro-dice',
  standalone: true,
  templateUrl: './astro-dice.component.html',
  styleUrls: ['./astro-dice.component.css']
})
export class AstroDiceComponent implements OnDestroy {
  /** Prikaži naslov i uvodni tekst iznad kockica */
  readonly showIntro = input(true);

  readonly texts = DICE_TEXTS;
  readonly faces = ['front', 'back', 'right', 'left', 'top', 'bottom'];

  readonly dices = signal<DiceOption[]>(DICE_OPTIONS.map(options => options[0]));
  readonly isRolling = signal(false);
  readonly hasRolled = signal(false);
  readonly reading = signal<DiceReading | null>(null);

  private rollInterval?: ReturnType<typeof setInterval>;
  private rollTimeout?: ReturnType<typeof setTimeout>;

  rollDice() {
    if (this.isRolling() || this.hasRolled()) return;

    this.isRolling.set(true);
    this.reading.set(null);

    this.rollInterval = setInterval(() => {
      this.dices.set(DICE_OPTIONS.map(options => options[Math.floor(Math.random() * options.length)]));
    }, 150);

    this.rollTimeout = setTimeout(() => {
      clearInterval(this.rollInterval);
      this.isRolling.set(false);
      this.hasRolled.set(true);
      this.reading.set(createReading(this.dices()));
    }, DICE_ROLL_DURATION_MS);
  }

  ngOnDestroy() {
    clearInterval(this.rollInterval);
    clearTimeout(this.rollTimeout);
  }
}
