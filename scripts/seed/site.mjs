import { img, PLACE, STILL } from './helpers.mjs';

/**
 * Facts carried over from the previous site and the Google Business Profile
 * draft (docs/gbp.md). Anything not known for certain — founding year, trade
 * licence, TRN, exact coordinates, partner certificates — is left empty and
 * listed in README "Client inputs", rather than invented.
 */
export const site = {
  name: 'Colion International',
  legalName: 'Colion International Trading LLC',
  logo: { onLight: img(''), onDark: img('') },
  tagline: 'IT hardware stockist, wholesaler and exporter in Dubai',
  positioning:
    'Stockist, wholesaler and exporter of IT hardware from the major brands — desktops, laptops, printers, projectors, servers, networking and UPS — supplying businesses across the UAE, the Middle East and Africa.',
  description:
    'Colion International is an IT hardware stockist, wholesaler and exporter in Dubai, UAE, supplying genuine HP, Dell, Lenovo, Epson, Cisco, APC and 40+ more brands to businesses, resellers and projects across the UAE, the Middle East and Africa.',
  founded: 0,
  email: 'info@colioninternational.com',
  phone: '+971 50 766 8536',
  whatsapp: '971507668536',
  hours: 'Monday to Saturday, 9:00 AM – 7:00 PM (Sunday closed)',
  instagramHandle: 'colioninternational.ae',
  social: [
    { label: 'Instagram', href: 'https://www.instagram.com/colioninternational.ae/', icon: 'instagram' },
    { label: 'Facebook', href: 'https://www.facebook.com/colioninternational/', icon: 'facebook' },
    { label: 'LinkedIn', href: 'https://www.linkedin.com/company/colion-international/', icon: 'linkedin' },
    { label: 'TikTok', href: 'https://www.tiktok.com/@colioninternational', icon: 'tiktok' },
  ],
  locations: [
    {
      // The corporate office moved here from Burj Nahar; it shares the Al Dhagaya shop.
      id: 'corporate',
      label: 'Corporate Office & Store — Al Dhagaya',
      kind: 'store',
      name: 'Colion International Trading LLC — Corporate Office & Store, Al Dhagaya',
      streetAddress: 'Shop 4, Khalifya Building',
      area: 'Al Dhagaya, Deira',
      locality: 'Dubai',
      region: 'Dubai',
      postalCode: '',
      country: 'AE',
      geo: { lat: 25.2735367, lng: 55.3020782 },
      mapUrl: 'https://maps.app.goo.gl/3MH6Gfy4HggJdf5J6',
      hours: 'Mon–Sat 9:00–19:00',
      phone: '+971 50 766 8536',
      image: PLACE('deira', 'Deira, Dubai — home of the Colion International corporate office and store in Al Dhagaya'),
      gbp: { cid: '', placeId: '', url: '' },
    },
    {
      id: 'showroom',
      label: 'Branch — Al Sabkha',
      kind: 'store',
      name: 'Colion International Trading LLC — Al Sabkha Branch',
      streetAddress: 'Shop 1, Al Jaziri Building',
      area: 'Al Sabkha, Deira',
      locality: 'Dubai',
      region: 'Dubai',
      postalCode: '',
      country: 'AE',
      // The Google Business Profile pin.
      geo: { lat: 25.2723295, lng: 55.3025545 },
      mapUrl: 'https://maps.app.goo.gl/38tDH4sYMhe1Fhxr8',
      hours: 'Mon–Sat 9:00–19:00',
      phone: '+971 50 766 8536',
      image: PLACE('deira', 'Dubai Creek at Deira, near the Colion International branch in Al Sabkha'),
      gbp: {
        cid: '7714097723583174697',
        placeId: '',
        url: 'https://www.google.com/maps?cid=7714097723583174697',
      },
    },
  ],
};

export const nav = [
  { label: 'Services', href: '/services/', mega: 'services' },
  { label: 'Products', href: '/products/', mega: 'products' },
  { label: 'Brands', href: '/brands/', mega: 'none' },
  { label: 'About', href: '/about/', mega: 'none' },
  { label: 'Gallery', href: '/gallery/', mega: 'none' },
  { label: 'Contact', href: '/contact/', mega: 'none' },
];

export const seo = {
  alternateName: ['Colion', 'Colion Trading', 'Colion International Trading', 'كوليون إنترناشونال'],
  knowsAbout: [
    'IT hardware wholesale',
    'Computer hardware supplier Dubai',
    'Desktop computers',
    'All-in-one PCs',
    'Business laptops',
    'Laser printers',
    'Multifunction printers',
    'Printer toner and ink',
    'Projectors',
    'Rack servers',
    'Tower servers',
    'Network storage',
    'Network switches',
    'Wi-Fi routers and access points',
    'Firewalls',
    'Structured cabling',
    'UPS systems',
    'Power protection',
    'IT annual maintenance contracts (AMC)',
    'IT hardware export to Africa and the Middle East',
    'Bulk IT procurement for businesses',
  ],
  openingHours: { days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'], opens: '09:00', closes: '19:00' },
  priceRange: 'AED',
  vatId: '',
  tradeLicense: '',
  languages: ['English', 'Arabic', 'Hindi', 'Urdu', 'Malayalam'],
  defaultShare: img('/images/stills/hero-datacenter.webp', 'Colion International — IT hardware supplier in Dubai'),
  trademarkNote:
    'All brand names, logos and trademarks shown are the property of their respective owners and are used only to identify the products Colion International supplies. Their use does not imply endorsement or a partnership unless one is stated.',
};

export const features = [
  { icon: 'truck', title: 'Fast delivery across the UAE', body: 'Same-day or next-day delivery in Dubai, and scheduled delivery to every emirate.' },
  { icon: 'warehouse', title: 'Stockist & wholesale dealer', body: 'Ready stock in Dubai at wholesale pricing for resellers, integrators and corporate buyers.' },
  { icon: 'tools', title: 'Free installation', body: 'Setup and configuration of the hardware we supply, on site, by our own technicians.' },
  { icon: 'headset', title: '24/7 support', body: 'A support line that answers outside office hours when a business-critical system is down.' },
  { icon: 'shield', title: 'AMC contracts', body: 'Annual maintenance contracts that keep printers, PCs, servers and networks running.' },
];

export const stats = [
  { value: '6000', unit: '+', label: 'Business clients served' },
  { value: '15', unit: 'K+', label: 'Products delivered' },
  { value: '50', unit: '+', label: 'Brands in stock' },
  { value: '7', unit: '', label: 'Emirates covered' },
];

export const credentials = [];

/**
 * Team functions, not invented people. Each is flagged `placeholder`: it
 * renders on the site, stays out of the structured data, and keeps `/team/`
 * noindexed until real names, photos and bios replace it in the admin.
 */
export const team = [
  {
    id: 'mohamed-anas',
    name: 'Mohamed Anas',
    role: 'Founder',
    bio: 'Mohamed Anas founded Colion International Trading LLC and leads it from Deira, Dubai — building the brand relationships, the stock and the delivery network that resellers, businesses and export buyers across the UAE, the Middle East and Africa rely on.',
    photo: img('/images/team/mohamed-anas.webp', 'Mohamed Anas, founder of Colion International'),
    expertise: ['IT hardware wholesale', 'Brand and distributor relationships', 'Export to the Middle East and Africa'],
    yearsExperience: 0,
    languages: [],
    linkedin: 'https://www.linkedin.com/in/muhammed-anas-35331313a/',
    email: 'anas@colioninternational.com',
    social: [
      { network: 'linkedin', href: 'https://www.linkedin.com/in/muhammed-anas-35331313a/' },
      { network: 'instagram', href: 'https://www.instagram.com/__nw10_/' },
    ],
    featured: true,
    placeholder: false,
  },
];

/**
 * Empty on purpose. Testimonials must be real customers' words with their
 * permission (ideally Google reviews, with the link); the section shows a
 * "read our reviews" prompt until the first one is added.
 */
export const testimonials = [];
