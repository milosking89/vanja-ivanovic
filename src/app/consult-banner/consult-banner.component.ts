import { Component, OnDestroy, OnInit, PLATFORM_ID, inject, input, output, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

/**
 * Baner „Želiš da zaviriš u svoju natalnu kartu?”
 *
 * Dva načina upotrebe:
 *   <app-consult-banner />                                  → deo stranice (O autoru)
 *   <app-consult-banner mode="popup" [delaySeconds]="10" />  → iskoči posle X sekundi (Početna)
 *
 * U popup režimu: zatvara se na ✕ ili ESC i do kraja posete (sesije) se više ne prikazuje.
 */
@Component({
  selector: 'app-consult-banner',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './consult-banner.component.html',
  styleUrls: ['./consult-banner.component.css'],
  host: {
    '[class.is-popup]': "mode() === 'popup'",
    '(document:keydown.escape)': 'close()'
  }
})
export class ConsultBannerComponent implements OnInit, OnDestroy {
  readonly mode = input<'inline' | 'popup'>('inline');
  readonly delaySeconds = input(10);
  /** Ako je true, posle zatvaranja se ne prikazuje ponovo u istoj sesiji */
  readonly rememberDismiss = input(true);
  readonly closed = output<void>();

  readonly email = 'vanjaivanovic.info@gmail.com';
  readonly visible = signal(false);

  private readonly isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  private timer?: ReturnType<typeof setTimeout>;
  private static readonly STORAGE_KEY = 'consultBannerDismissed';

  ngOnInit() {
    if (this.mode() === 'inline') {
      this.visible.set(true);
      return;
    }
    if (!this.isBrowser || this.wasDismissed()) return;
    this.timer = setTimeout(() => this.visible.set(true), this.delaySeconds() * 1000);
  }

  close() {
    if (this.mode() !== 'popup' || !this.visible()) return;
    this.visible.set(false);
    if (this.rememberDismiss()) {
      try { sessionStorage.setItem(ConsultBannerComponent.STORAGE_KEY, '1'); } catch { /* privatni režim */ }
    }
    this.closed.emit();
  }

  ngOnDestroy() {
    clearTimeout(this.timer);
  }

  private wasDismissed(): boolean {
    if (!this.rememberDismiss()) return false;
    try { return sessionStorage.getItem(ConsultBannerComponent.STORAGE_KEY) === '1'; } catch { return false; }
  }
}
