// =====================================================================
//  POČETNA STRANICA – PODEŠAVANJA
//  Ovde menjaš šta se prikazuje na početnoj, bez diranja HTML-a.
// =====================================================================

export const HOME_CONFIG = {
  /** true = ispod bloga se prikazuju astro kockice (<app-astro-dice />) */
  showDice: false,

  hero: {
    eyebrow: 'Astrology lovers',
    title: 'Vanja Ivanović',
    subtitle: '✦ Astrolog ✦',
    imageAlt: 'Vanja Ivanović',
    // Slika: src/app/home/assets/images/vanja.jpg
    // (za drugu sliku zameni fajl ili putanju u home.component.css → .hero-photo)
  },

  /** Dugme ispod slike */
  link: {
    show: true,
    label: 'Pogledaj moj YouTube kanal',
    url: 'https://www.youtube.com',
    icon: '▶',
  },

  /** Poslednji tekst sa bloga */
  latestPost: {
    show: true,
    heading: 'Najnoviji tekst',
    allPostsLabel: 'Svi tekstovi',
    emptyText: 'Uskoro novi tekstovi – svrati ponovo! ✨',
  },

  /** Baner „Želiš da zaviriš u svoju natalnu kartu?” koji iskoči na početnoj */
  consultPopup: {
    show: true,
    delaySeconds: 8,
    /** true = kad ga posetilac zatvori, ne prikazuje se ponovo do kraja posete */
    rememberDismiss: true,
  },
};