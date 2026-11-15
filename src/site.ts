// Everything about the team lives here. Change it once and every page updates.

export const site = {
  name: 'Team Jabbar',
  tagline: 'Realtors to move you forward',
  url: 'https://teamjabbar.com',
  phone: '(647) 886-7355',
  phoneHref: 'tel:+16478867355',
  email: 'M2jabbar@gmail.com',
  brokerage: {
    name: 'CENTURY 21 Green Realty Inc., Brokerage',
    note: 'Independently owned and operated',
    office: '(905) 565-9565',
    officeHref: 'tel:+19055659565',
    fax: '(905) 565-9522',
    street: '6980 Maritz Dr, Unit 8',
    city: 'Mississauga, ON L5W 1Z3',
  },
  social: {
    facebook: 'https://www.facebook.com/teamjabbar',
    instagram: 'https://www.instagram.com/teamjabbar',
  },
  // Bridge until the new site has its own listing feed: the existing MLS search.
  listingsSearchUrl: 'https://www.teamjabbar.ca/PropertySearchMap',
  // TEMPORARY: these point at the old site's image host. Replace with files in
  // /public/images (e.g. '/images/team.png') before the old site is cancelled.
  images: {
    team: 'https://ik.imagekit.io/remarketer/media/3759-20230124045130.png',
    logo: 'https://ik.imagekit.io/remarketer/media/3759-20230117050447.png',
  },
};

export const team = [
  {
    name: 'Abdul-Jabbar Anjum',
    role: 'Real Estate Agent, Team Lead',
    photo: 'https://ik.imagekit.io/remarketer/media/3759-20230123225913.jpg',
    bio: 'With over 15 years in Ontario real estate, Abdul leads the team. Clients know him for his market knowledge, his negotiating, and his kindness.',
  },
  {
    name: 'Ali Jabbar',
    role: 'Real Estate Agent',
    photo: '/images/ali-jabbar.jpg',
    bio: '',
  },
  {
    name: 'Umer Jabbar',
    role: 'Real Estate Agent',
    photo: '/images/umer-jabbar.jpg',
    bio: '',
  },
];

// Ordered roughly south to north, the way the drive goes.
export const regions = ['Windsor', 'Greater Toronto Area', 'Barrie', 'Ottawa', 'Sudbury', 'Timmins'];

export const nav = [
  { href: '/buy/', label: 'Buy' },
  { href: '/sell/', label: 'Sell' },
  { href: '/pre-construction/', label: 'Pre-construction' },
  { href: '/listings/', label: 'Listings' },
  { href: '/blog/', label: 'Blog' },
  { href: '/tools/', label: 'Tools' },
  { href: '/about/', label: 'About' },
];
