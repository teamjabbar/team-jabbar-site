// The question flows behind every lead form. Edit the wording or options here.

export type Option = string | { value: string; label: string; hint?: string; icon?: string };
export type Step =
  | { kind: 'choice'; name: string; title: string; titleBy?: Record<string, string>; options: Option[]; cols?: 1 | 2 | 3 }
  | { kind: 'text'; name: string; title: string; titleBy?: Record<string, string>; placeholder: string; chips?: string[]; help?: string }
  | { kind: 'pair'; title: string; groups: { name: string; label: string; options: string[] }[] }
  | { kind: 'contact'; title: string; sub: string };

const areas = ['Mississauga', 'Brampton', 'Toronto', 'Milton', 'Oakville', 'Vaughan', 'Hamilton', 'Elsewhere in Ontario'];
const timeline = ['As soon as possible', '1 to 3 months', '3 to 6 months', '6 to 12 months', 'Just exploring'];
const homeTypes = ['Detached', 'Semi-detached', 'Townhouse', 'Condo', 'Not sure yet'];
const budget = ['Under $600K', '$600K to $800K', '$800K to $1M', '$1M to $1.5M', '$1.5M to $2M', 'Over $2M'];

export const homeSteps: Step[] = [
  {
    kind: 'choice',
    name: 'type',
    title: 'What are you looking to do?',
    cols: 1,
    options: [
      { value: 'buyer', label: 'Buy a home', hint: 'Get listings matched to you', icon: 'key' },
      { value: 'seller', label: 'Sell my home', hint: 'Get a free evaluation', icon: 'tag' },
      { value: 'both', label: 'Sell, then buy', hint: 'Plan both moves together', icon: 'swap' },
    ],
  },
  {
    kind: 'text',
    name: 'area',
    title: 'Which area?',
    titleBy: {
      buyer: 'Where do you want to buy?',
      seller: 'Where is the home you are selling?',
      both: 'Where is the home you are selling?',
    },
    placeholder: 'City or neighbourhood',
    chips: areas,
  },
  { kind: 'choice', name: 'timeline', title: 'When do you want to move?', cols: 1, options: timeline },
  { kind: 'contact', title: 'Where should we reach you?', sub: 'A licensed agent on our team will call or email you. No obligation.' },
];

export const buySteps: Step[] = [
  { kind: 'choice', name: 'home_type', title: 'What type of home are you looking for?', cols: 2, options: homeTypes },
  { kind: 'text', name: 'area', title: 'Which area are you looking in?', placeholder: 'City or neighbourhood', chips: areas, help: 'Pick as many as you like, or type your own.' },
  {
    kind: 'pair',
    title: 'How many bedrooms and washrooms?',
    groups: [
      { name: 'bedrooms', label: 'Bedrooms', options: ['1', '2', '3', '4', '5+'] },
      { name: 'bathrooms', label: 'Washrooms', options: ['1', '2', '3', '4+'] },
    ],
  },
  { kind: 'choice', name: 'size', title: 'How big should it be?', cols: 2, options: ['Under 1,000 sq ft', '1,000 to 1,500 sq ft', '1,500 to 2,000 sq ft', '2,000 to 3,000 sq ft', 'Over 3,000 sq ft', 'Not sure'] },
  { kind: 'choice', name: 'budget', title: 'What is your budget?', cols: 2, options: budget },
  { kind: 'choice', name: 'timeline', title: 'When do you want to buy?', cols: 1, options: timeline },
  { kind: 'contact', title: 'Where should we send matching homes?', sub: 'We email you listings that fit and call to book showings. No obligation.' },
];

export const sellSteps: Step[] = [
  { kind: 'text', name: 'address', title: 'What is the address of your home?', placeholder: 'Street address and city', help: 'We use it to find recent sales near you.' },
  { kind: 'choice', name: 'home_type', title: 'What type of home is it?', cols: 2, options: homeTypes.slice(0, 4) },
  {
    kind: 'pair',
    title: 'How many bedrooms and washrooms?',
    groups: [
      { name: 'bedrooms', label: 'Bedrooms', options: ['1', '2', '3', '4', '5+'] },
      { name: 'bathrooms', label: 'Washrooms', options: ['1', '2', '3', '4+'] },
    ],
  },
  { kind: 'choice', name: 'condition', title: 'What condition is it in?', cols: 1, options: ['Move-in ready', 'Needs a few updates', 'Needs major work'] },
  { kind: 'choice', name: 'timeline', title: 'When are you thinking of selling?', cols: 1, options: timeline },
  { kind: 'choice', name: 'also_buying', title: 'Are you also buying your next home?', cols: 1, options: ['Yes', 'No', 'Not sure yet'] },
  { kind: 'contact', title: 'Where should we send your evaluation?', sub: 'A licensed agent reviews recent sales near you and sends a written evaluation. Free, no obligation.' },
];
