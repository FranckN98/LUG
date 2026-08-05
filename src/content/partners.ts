export interface Partner {
  name: string;
  logo: string; // chemin relatif dans /public/partners/
  website?: string;
}

export const partners2025: Partner[] = [

  { name: 'Regus', logo: '/partners/regus.png', website: 'https://www.regus.com/de' },
  { name: 'Campusdirekt', logo: '/partners/campusdirekt.avif', website: 'https://campusdirekt.de/' },
  { name: 'AfroGeek', logo: '/partners/5.png' },
  { name: 'GrowInDE', logo: '/partners/4.png' },
  { name: 'SB Salon', logo: '/partners/10.png' },
  { name: 'Delycious', logo: '/partners/3.png' },
  { name: 'Dream Village', logo: '/partners/9.png' },
  { name: 'CEF ImmoFinanz', logo: '/partners/6.png' },
  { name: 'SESANA', logo: '/partners/8.png' },
  { name: 'Believe Real Estate Formation', logo: '/partners/2.png' },
];
