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
  // Web addresses here are copied onto this site at build time (scripts/fetch-assets.mjs).
  images: {
    team: 'https://ik.imagekit.io/remarketer/media/3759-20230124045130.png',
    logo: '/images/logo.png',
    logoWhite: '/images/logo-white.png',
  },
};

export const team = [
  {
    name: 'Abdul-Jabbar Anjum',
    role: 'Real Estate Agent, Team Lead',
    photo: 'https://ik.imagekit.io/remarketer/media/3759-20230123225913.jpg',
    bio: 'An engineer by education who made real estate his profession in 2007. Abdul leads the team, and clients know him for his market knowledge, his negotiating and his kindness.',
    story: [
      'Abdul was educated as an engineer, but real estate was always his passion. In 2007 he made it his profession, and it has been his sole focus ever since.',
      'He brings an engineer\'s habits to every sale and purchase. He studies the numbers, checks the details, and tells you plainly what a home is worth and why. Nearly two decades of buying and selling across Ontario have given him a deep knowledge of the market and a calm, firm hand at the negotiating table.',
      'As a father and the head of Team Jabbar, he treats every client\'s move the way he would treat his own family\'s: with patience, honesty and care.',
    ],
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
