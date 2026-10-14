import { img, intro, link, noVideo, section, STILL, vid } from './helpers.mjs';

const G = (n, alt) => img(`/images/gallery/${n}.webp`, alt);
const realVideo = (n, alt) => ({
  src: `/videos/reels/${n}-loop.mp4`,
  srcMobile: `/videos/reels/${n}-loop.mp4`,
  poster: img(`/images/gallery/${n}.webp`, alt),
});

const quote = link('Get a quote on WhatsApp', 'wa:Hello Colion International, I would like a quotation for:');

export const pages = {
  home: {
    title: 'IT Hardware Supplier in Dubai, UAE | Colion International',
    description: 'IT hardware stockist and wholesaler in Dubai since 2022. Genuine HP, Dell, Lenovo, Epson, Cisco and APC, delivered across the UAE and installed free.',
    sections: [
      section('videoHero', {
        eyebrow: 'IT hardware stockist · Wholesale · Export',
        lines: ['Genuine IT hardware,', 'in stock in Dubai', 'for'],
        rotating: ['offices', 'resellers', 'schools', 'projects', 'export'],
        body: 'Printers, computers, servers, networking and UPS from HP, Dell, Lenovo, Epson, Canon, Cisco, APC and 40+ more brands — at wholesale prices, delivered across the UAE and installed free.',
        cta: quote,
        secondary: link('Browse products', '/products/'),
        video: {
          src: '/videos/hero-datacenter.mp4',
          srcMobile: '/videos/reels/reel-03-loop.mp4',
          poster: STILL('hero-datacenter', 'IT engineers walking through a server room'),
        },
        chips: [
          { value: '6000', unit: '+', label: 'Business clients' },
          { value: '50', unit: '+', label: 'Brands' },
        ],
        trust: ['Genuine products', 'UAE warranty', 'VAT invoice'],
        slides: [
          { image: img('/images/gallery/reel-03.webp', 'Customer orders loaded at the Colion International branch in Deira'), video: '/videos/reels/reel-03-loop.mp4', caption: 'Orders leaving our Deira branch' },
          { image: G('photo-25', 'Shelves of printers and accessories inside the Colion International showroom'), video: '', caption: 'Inside the Colion showroom' },
          { image: img('/images/gallery/reel-02.webp', 'Epson printer cartons loaded onto a delivery truck'), video: '/videos/reels/reel-02-loop.mp4', caption: 'Epson stock out for delivery' },
          { image: G('photo-09', 'HP all-in-one PCs in stock'), video: '', caption: 'HP all-in-ones, ready to ship' },
          { image: img('/images/gallery/reel-05.webp', 'A pallet of Canon printers unloaded into the showroom'), video: '/videos/reels/reel-05-loop.mp4', caption: 'Canon stock arriving' },
          { image: G('photo-19', 'Epson printers stacked high in the showroom'), video: '', caption: 'Wholesale stock, on the shelf' },
        ],
      }),
      section('brandMarquee', { intro: intro(), rows: 1, source: 'core' }),
      section('answerSection', {
        label: 'About Colion',
        question: 'Who is Colion International?',
        answer:
          'Colion International Trading LLC is an IT hardware stockist, wholesaler and exporter based in Deira, Dubai, trading since 2022. It supplies genuine printers, computers, servers, networking and UPS from more than 50 brands to businesses, resellers and projects across the UAE, the Middle East and Africa, with free installation and AMC support.',
        bullets: ['Two walk-in branches in Deira, Dubai', 'Ready stock at wholesale prices', 'Delivery to all seven emirates', 'Export to the GCC and Africa'],
        image: G('photo-28', 'The sales desk inside the Colion International showroom in Deira, with Lenovo, Epson and HP stock'),
        video: '/videos/reels/reel-01-loop.mp4',
        cta: link('More about us', '/about/'),
      }),
      section('serviceGrid', {
        intro: intro('What we do', ['Complete IT hardware', 'solutions'], 'From one printer to a full office fit-out — supplied, delivered and installed by one team.', link('All services', '/services/')),
        source: 'all',
        slugs: [],
        backdrop: { image: img(''), video: vid('circuit', 'Circuit board'), wash: 93 },
      }),
      section('featureStrip', {
        intro: intro('Why Colion', ['Why businesses', 'buy from us'], 'Stock in Dubai, wholesale prices, and a team that delivers, installs and supports what it sells.'),
        image: G('photo-15', 'Cartons of HP desktop computers stacked in the Colion International stock room'),
      }),
      section('statBand', {
        background: STILL('fibre-network', 'Fibre-optic network cables'),
        video: vid('fibre-network', 'Fibre-optic network cables'),
        intro: intro('Trusted across the UAE', ['Numbers that', 'speak for themselves']),
        stats: [],
      }),
      section('categoryGrid', {
        intro: intro('Products', ['IT hardware', 'products in stock'], 'Every category is genuine regional stock with the manufacturer warranty.', link('All products', '/products/')),
        source: 'all',
        slugs: [],
        layout: 'rail',
      }),
      { ...section('featureSplit', {
        images: [STILL('rack-install', 'An engineer installing equipment in a server rack'), STILL('tech-cabling', 'Engineers cabling a server room')],
        intro: intro('Installation', ['Supplied, installed', 'and supported'], 'We do not drop boxes at the door. Our technicians install and configure what we sell, and stay on call afterwards.', link('Our services', '/services/')),
        items: [
          { title: 'Networks', body: 'Switches, Wi-Fi and firewalls cabled, configured and documented.' },
          { title: 'Servers', body: 'Racked, RAID configured, remote management enabled, UPS connected.' },
          { title: 'Printers', body: 'On the network with scan-to-email, drivers on every PC.' },
          { title: 'AMC & support', body: 'Annual maintenance contracts and a line for urgent faults.' },
        ],
        reverse: false,
      }), hidden: true },
      section('reelRail', {
        intro: intro('From the floor', ['Real stock.', 'Real deliveries.'], 'Straight from our showroom and loading bay — follow us on Instagram for new arrivals.', link('Open the gallery', '/gallery/')),
        limit: 8,
      }),
      { ...section('aboutBlock', {
        intro: intro('Why Colion', ['Stock you can see,', 'prices you can trust'], '', link('Visit our branches', '/contact/')),
        paragraphs: [
          'We hold our stock in Dubai, not on a distributor\'s lead time — walls of HP, Canon and Epson printers, laptops, all-in-ones and networking ready to dispatch the day you order.',
          'That is why resellers, system integrators and corporate buyers across the UAE and beyond come to us: consistent availability, wholesale pricing, and a team that installs and supports what it sells.',
        ],
        image: G('photo-25', 'Shelves of printers and accessories inside the Colion International showroom'),
        secondImage: G('photo-01', 'HP Color LaserJet Pro printers in stock'),
        badge: { value: '50+', label: 'brands in stock' },
        highlights: ['Genuine regional stock', 'Manufacturer warranty in the UAE', 'Free installation in Dubai', 'AMC and 24/7 support'],
        secondary: link('Our story', '/about/'),
      }), hidden: true },
      section('processSteps', {
        intro: intro('How it works', ['How to order IT hardware', 'from Colion International']),
        steps: [
          { title: 'Send your requirement', body: 'WhatsApp, email or the enquiry form — a model number or just a description of what you need.' },
          { title: 'Receive a quotation', body: 'Price, stock status and delivery date, usually the same business day.' },
          { title: 'Confirm and pay', body: 'Cash, card or bank transfer; credit terms for established corporate accounts.' },
          { title: 'Delivery', body: 'Same or next working day in Dubai, scheduled delivery to every emirate, export worldwide.' },
          { title: 'Installation and support', body: 'Installed on site free in Dubai, with warranty support and optional AMC.' },
        ],
        image: G('photo-33', 'Customer orders staged for delivery'),
        asHowTo: true,
        backdrop: { image: STILL('truck', 'Delivery truck at a warehouse'), video: noVideo(), wash: 90 },
      }),
      section('locationGrid', {
        intro: intro('Coverage', ['Delivering to', 'all seven emirates'], 'Supplied from our Deira branches, with delivery and installation across the UAE.', link('Delivery areas', '/locations/')),
        backdrop: { image: img(''), video: vid('dubai-street', 'Dubai street'), wash: 91 },
      }),
      { ...section('galleryStrip', {
        intro: intro('Gallery', ['Inside our', 'stock rooms'], '', link('View the gallery', '/gallery/')),
        tag: '',
        limit: 8,
      }), hidden: true },
      section('testimonialSlider', { intro: intro('Reviews', ['What our', 'customers say']), backdrop: { image: STILL('team-laptop', 'A team at a laptop'), video: noVideo(), wash: 84 } }),
      section('faqBlock', {
        intro: intro('FAQ', ['Questions buyers', 'ask us most'], '', link('All questions', '/faq/')),
        source: 'top',
        groupIds: [],
        backdrop: { image: STILL('meeting-display', 'Meeting room'), video: noVideo(), wash: 92 },
      }),
      section('ctaBand', {
        background: STILL('server-corridor', 'Server corridor'),
        video: vid('server-corridor', 'Server racks in a data centre'),
        intro: intro('Get started', ['Need a quotation', 'today?'], 'Send the model or your requirement on WhatsApp — our sales desk replies with price, stock and delivery date.', quote),
        secondary: link('Call +971 50 766 8536', 'tel:+971507668536'),
      }),
    ],
  },

  about: {
    title: 'About Colion International | IT Wholesaler in Dubai',
    description: 'Colion International Trading LLC: IT hardware stockist, wholesaler and exporter in Deira, Dubai since 2022, serving the UAE, Middle East and Africa.',
    sections: [
      section('pageHero', {
        background: G('photo-25', 'Inside the Colion International showroom'),
        video: realVideo('reel-01', 'A walk through the Colion International showroom'),
        intro: intro('About us', ['IT hardware stockist,', 'wholesaler & exporter'], 'Two branches in Deira, a stock room full of the brands businesses rely on, and a team that delivers and installs what it sells.', quote),
        secondary: link('Visit us', '/contact/'),
        align: 'left',
        size: 'tall',
        focus: '',
      }),
      section('splitProse', {
        intro: intro('Our story', ['Built in the', 'heart of Deira']),
        paragraphs: [
          'Colion International Trading LLC grew up in Deira, Dubai\'s historic trading district, supplying computers and printers to the businesses around it. Today we are a stockist, wholesaler and exporter of IT hardware from more than fifty brands, serving companies, resellers and projects across the UAE, the Middle East and Africa.',
          'What has not changed is how we work. We hold real stock in Dubai — the walls of boxed [HP](/brands/hp/), [Canon](/brands/canon/) and [Epson](/brands/epson/) printers in our photographs are our warehouse, not a catalogue — so a customer can order in the morning and receive the same day. We sell genuine regional products with the manufacturer warranty, issue proper VAT invoices, and install what we supply.',
          'Our customers range from a one-person office buying a single printer to system integrators ordering by the pallet and companies exporting to Africa. Each gets the same thing: straight answers on price and availability, and a team that picks up the phone after the sale.',
        ],
        stats: [],
      }),
      section('statBand', {
        background: STILL('dubai-skyline', 'Dubai skyline'),
        video: vid('dubai-skyline', 'Aerial view of Dubai'),
        intro: intro('In numbers', ['Colion', 'International']),
        stats: [],
      }),
      section('pillarGrid', {
        tone: 'light',
        columns: 3,
        intro: intro('Why customers choose us', ['What we', 'stand behind']),
        backdrop: { image: img(''), video: vid('tech-cabling', 'Engineers cabling a server room'), wash: 88 },
        items: [
          { icon: 'shield', title: 'Genuine products only', body: 'Regional-channel stock in sealed packaging, with serial numbers you can verify and the manufacturer warranty valid in the UAE.' },
          { icon: 'warehouse', title: 'Real stock in Dubai', body: 'Our own stock rooms in Deira mean same-day dispatch on most popular lines, not a distributor\'s lead time.' },
          { icon: 'tag', title: 'Wholesale pricing', body: 'Trade prices for resellers and volume buyers, and honest prices for single units.' },
          { icon: 'tools', title: 'Installed by our team', body: 'Printers, PCs, servers and networks installed and tested by our own technicians.' },
          { icon: 'globe', title: 'Export-ready', body: 'Export documentation and shipping arranged for customers in the GCC, Middle East and Africa.' },
          { icon: 'headset', title: 'Support after the sale', body: 'Warranty claims handled, AMC contracts available, and a support line for urgent faults.' },
        ],
      }),
      section('featureSplit', {
        images: [STILL('presenter-display', 'A presenter at a large meeting-room display'), STILL('office-laptops', 'An office team on laptops')],
        intro: intro('Who we serve', ['From one desk', 'to a whole floor']),
        items: [
          { title: 'Businesses', body: 'Offices, clinics, schools and hotels buying for their own use, from one printer to a full fit-out.' },
          { title: 'Resellers', body: 'IT shops and integrators who need consistent stock and trade pricing in Dubai.' },
          { title: 'Projects', body: 'Contractors and tenders that need volume, documentation and a delivery date they can plan around.' },
          { title: 'Export', body: 'Buyers in the GCC, the Middle East and Africa, with export paperwork prepared.' },
        ],
        reverse: true,
      }),
      section('galleryStrip', {
        intro: intro('Inside Colion', ['Our showroom', 'and stock rooms'], '', link('Full gallery', '/gallery/')),
        tag: '',
        limit: 8,
      }),
      section('teamGrid', {
        intro: intro('Leadership', ['Meet', 'the founder']),
        source: 'featured',
      }),
      section('contactPanel', { intro: intro('Visit us', ['Our branches', 'in Deira, Dubai']), showMap: true }),
      section('ctaBand', {
        background: STILL('warehouse-team', 'Warehouse'),
        video: vid('warehouse-team', 'A team walking through a warehouse'),
        intro: intro('Work with us', ['Let\'s supply your', 'next project'], 'Single units, bulk orders and export — tell us what you need.', quote),
        secondary: link('Contact the sales desk', '/contact/'),
      }),
    ],
  },

  team: {
    title: 'Mohamed Anas, Founder — Colion International, Dubai',
    description: 'Meet Mohamed Anas, founder of Colion International Trading LLC, the IT hardware stockist, wholesaler and exporter based in Deira, Dubai.',
    sections: [
      section('pageHero', {
        background: G('photo-28', 'The sales desk inside the Colion International showroom'),
        video: noVideo(),
        intro: intro('Leadership', ['The people behind', 'Colion International'], 'A founder-led business: the person who built the brand relationships still answers for every order.'),
        secondary: link(),
        align: 'left',
        size: 'medium',
        focus: '',
      }),
      section('teamGrid', { intro: intro(), source: 'all' }),
      section('richText', {
        tone: 'surface',
        align: 'center',
        intro: intro('Careers', ['Join', 'Colion International']),
        paragraphs: ['We are always glad to hear from experienced sales executives, technicians and logistics staff who know the UAE IT market. Send your CV to [info@colioninternational.com](mailto:info@colioninternational.com).'],
      }),
      section('ctaBand', {
        background: STILL('team-laptop', 'A team working together at a laptop'),
        video: vid('team-laptop', 'A team working together at a laptop'),
        intro: intro('Talk to us', ['Speak to the', 'sales desk'], '', quote),
        secondary: link('Contact', '/contact/'),
      }),
    ],
  },

  services: {
    title: 'IT Hardware Services in Dubai | Colion International',
    description: 'Printing, computing, display, server, network and power solutions, supplied, delivered and installed by Colion International across the UAE.',
    sections: [
      section('pageHero', {
        background: STILL('control-room', 'An engineer at a monitoring station'),
        video: vid('control-room', 'An engineer monitoring systems at a workstation'),
        intro: intro('Services', ['Complete IT hardware', 'solutions'], 'Supply, delivery, installation and maintenance for every part of an office\'s IT — from one team.', quote),
        secondary: link('Browse products', '/products/'),
        align: 'left',
        size: 'medium',
        focus: '',
      }),
      section('answerSection', {
        label: 'In short',
        question: 'What IT services does Colion International provide?',
        answer: 'Colion International supplies and installs IT hardware for businesses across the UAE: printing solutions, desktop and all-in-one computing, presentation and display systems, servers and storage, network infrastructure, and power protection, with free installation in Dubai, annual maintenance contracts and 24/7 support for critical systems.',
        bullets: [],
        image: img(''),
        cta: link(),
      }),
      section('serviceGrid', { intro: intro(), source: 'all', slugs: [] }),
      section('processSteps', {
        intro: intro('Our approach', ['From requirement', 'to running system']),
        backdrop: { image: img(''), video: vid('rack-install', 'An engineer at a server rack'), wash: 90 },
        steps: [
          { title: 'Understand the requirement', body: 'Users, workload, space and budget — before we recommend anything.' },
          { title: 'Recommend and quote', body: 'Two or three options across brands, with honest trade-offs.' },
          { title: 'Supply from stock', body: 'Genuine regional stock, delivered across the UAE.' },
          { title: 'Install and configure', body: 'Set up and tested on site by our technicians.' },
          { title: 'Support', body: 'Warranty handling, AMC and a support line for urgent faults.' },
        ],
        image: img(''),
        asHowTo: false,
      }),
      section('faqBlock', { intro: intro('FAQ', ['Services', 'questions']), source: 'groups', groupIds: ['services'] }),
      section('ctaBand', {
        background: STILL('server-corridor', 'Server corridor'),
        video: vid('server-corridor', 'Server racks'),
        intro: intro('Start a project', ['Tell us what', 'you need'], '', quote),
        secondary: link('Contact', '/contact/'),
      }),
    ],
  },

  products: {
    title: 'IT Hardware Products in Dubai | Colion International',
    description: 'Printers, desktops, all-in-one PCs, projectors, servers, switches, UPS and cabling in stock at Colion International, Dubai. Delivered across the UAE.',
    sections: [
      section('pageHero', {
        background: G('photo-19', 'Epson printers in stock'),
        video: realVideo('reel-05', 'Canon stock arriving at the showroom'),
        intro: intro('Products', ['IT hardware', 'in stock in Dubai'], 'Eight categories, fifty-plus brands, genuine regional stock with the manufacturer warranty.', quote),
        secondary: link('Brands we carry', '/brands/'),
        align: 'left',
        size: 'medium',
        focus: '',
      }),
      section('categoryGrid', { intro: intro(), source: 'all', slugs: [] }),
      section('answerSection', {
        label: 'Buying guide',
        question: 'How do I buy IT hardware wholesale in the UAE?',
        answer: 'To buy IT hardware wholesale in the UAE, send Colion International the models or requirements and quantities on WhatsApp or email. The sales desk confirms price, stock and delivery date, issues a VAT invoice, and delivers across the UAE — same or next day in Dubai — with export available.',
        bullets: ['No minimum order', 'Trade terms for resellers', 'VAT invoice with serial numbers'],
        image: G('photo-31', 'A bulk order of boxed hardware'),
        cta: link(),
      }),
      section('brandMarquee', { intro: intro('Brands', ['50+ brands', 'in stock']), rows: 2, source: 'all' }),
      section('faqBlock', { intro: intro('FAQ', ['Buying', 'questions']), source: 'groups', groupIds: ['ordering', 'warranty'] }),
      section('ctaBand', {
        background: STILL('parcel-delivery', 'A parcel being delivered'),
        video: vid('parcel-delivery', 'A parcel being delivered'),
        intro: intro('Can\'t find it?', ['We source it', 'for you'], 'If a model is not listed, ask — we source across our brand network.', quote),
        secondary: link('Contact', '/contact/'),
      }),
    ],
  },

  brands: {
    title: 'IT Brands: HP, Dell, Lenovo, Epson | Colion International',
    description: 'Genuine products from 50+ IT brands in Dubai, including HP, Dell, Lenovo, Epson, Canon, Cisco and APC, supplied by Colion International across the UAE.',
    sections: [
      section('brandHero', {
        intro: intro('Brands', ['50+ brands.', 'One supplier.'], 'Genuine products from the brands businesses rely on — sourced through regional channels, in stock in Dubai, with the manufacturer warranty.', link('Get a brand quote', 'wa:Hello Colion International, I need a quotation for brand:')),
        secondary: link('Browse all brands', '#all-brands'),
      }),
      section('brandSpotlight', {
        intro: intro('Core brands', ['The brands we', 'stock in depth'], 'Held in volume in our Deira stock rooms, with the full product range and original supplies.', link('Talk to sales', '/contact/')),
        ribbon: [],
      }),
      { ...section('logoWall', { intro: intro('A–Z', ['Every brand', 'we supply'], 'Filter by category or search by name. Not listed? We source on request.'), backdrop: { image: STILL('server-racks', 'Server racks'), video: noVideo(), wash: 95 } }), anchor: 'all-brands' },
      section('answerSection', {
        label: 'Authenticity',
        question: 'Does Colion International sell genuine branded products?',
        answer: 'Yes. Colion International supplies genuine products sourced through each manufacturer\'s regional distribution channel, in sealed packaging with verifiable serial numbers and the manufacturer warranty valid in the UAE, and issues a VAT invoice for every sale.',
        bullets: [],
        image: img(''),
        cta: link(),
      }),
      section('faqBlock', { intro: intro('FAQ', ['Warranty &', 'authenticity']), source: 'groups', groupIds: ['warranty'] }),
      section('ctaBand', {
        background: STILL('server-corridor', 'Server corridor'),
        video: vid('server-corridor', 'Server racks in a data centre'),
        intro: intro('Any brand, any model', ['Looking for a', 'specific model?'], 'Send the brand and model number on WhatsApp — we reply with price, stock and delivery date.', quote),
        secondary: link('All products', '/products/'),
      }),
    ],
  },

  locations: {
    title: 'UAE Delivery to All 7 Emirates | Colion International',
    description: 'Colion International delivers IT hardware from Dubai to Abu Dhabi, Sharjah, Ajman, Ras Al Khaimah, Fujairah and Umm Al Quwain, with on-site installation.',
    sections: [
      section('pageHero', {
        background: STILL('truck', 'Delivery truck'),
        video: realVideo('reel-02', 'Epson printers loaded onto a delivery truck'),
        intro: intro('Delivery areas', ['Delivering to', 'all seven emirates'], 'Supplied from our Deira branches with delivery and installation across the UAE.'),
        secondary: link(),
        align: 'left',
        size: 'medium',
        focus: '',
      }),
      section('locationGrid', { intro: intro() }),
      section('comparisonTable', {
        intro: intro('Delivery times', ['How fast we', 'deliver']),
        caption: 'Typical delivery time for stock items by emirate',
        columns: ['Emirate', 'Typical delivery', 'Installation'],
        rows: [],
        note: 'Times are for in-stock items confirmed before midday on a working day. Bulk and custom orders are given a delivery date with the quotation.',
      }),
      section('faqBlock', { intro: intro('FAQ', ['Delivery', 'questions']), source: 'groups', groupIds: ['delivery'] }),
    ],
  },

  gallery: {
    title: 'Gallery: Showroom, Stock & Deliveries | Colion',
    description: 'Photos and reels from Colion International: our Deira showroom, stock rooms of HP, Canon and Epson hardware, and deliveries across Dubai and the UAE.',
    sections: [
      section('pageHero', {
        background: G('photo-04', 'The Colion International branch in Deira'),
        video: noVideo(),
        intro: intro('Gallery', ['Showroom, stock', '& deliveries'], 'Real photos and reels from our branches and loading bay, updated as new stock arrives.'),
        secondary: link(),
        align: 'left',
        size: 'short',
        focus: '',
      }),
    ],
  },

  contact: {
    title: 'Contact Colion International — Deira, Dubai',
    description: 'Contact Colion International, Deira, Dubai: +971 50 766 8536 or info@colioninternational.com. Branches in Al Sabkha and Al Dhagaya, Mon–Sat 10am–10pm.',
    sections: [
      section('pageHero', {
        background: G('photo-04', 'The Colion International branch in Deira'),
        video: noVideo(),
        intro: intro('Contact', ['Talk to', 'our sales desk'], 'WhatsApp, call, email or visit — we reply with price, stock and delivery date.'),
        secondary: link(),
        align: 'left',
        size: 'short',
        focus: '',
      }),
      section('contactPanel', { intro: intro(), showMap: true }),
      section('formBlock', {
        intro: intro('Request a quote', ['Tell us what', 'you need'], 'The form opens WhatsApp with your request filled in — just press send.'),
        note: 'We reply during business hours, usually the same day.',
        backdrop: { image: STILL('office-laptops', 'An office team on laptops'), video: noVideo(), wash: 92 },
        interests: [],
        quantities: ['1 unit', '2–10 units', '11–50 units', '50+ units', 'Project / tender'],
        next: [
          { title: 'We confirm', body: 'Price, stock and delivery date for each item.' },
          { title: 'You approve', body: 'Accept the quotation and choose payment.' },
          { title: 'We deliver', body: 'Delivered and installed on the agreed date.' },
        ],
      }),
      section('faqBlock', { intro: intro('FAQ', ['Before you', 'order']), source: 'groups', groupIds: ['ordering', 'delivery'] }),
    ],
  },

  faq: {
    title: 'FAQ: Ordering, Delivery & Warranty | Colion International',
    description: 'Answers about buying IT hardware from Colion International: quotations, minimums, UAE delivery times, export, warranty, installation and AMC.',
    sections: [],
  },

  privacy: {
    title: 'Privacy Policy',
    description: 'How Colion International handles the personal information you share when you contact us or place an order.',
    sections: [
      section('richText', {
        tone: 'white',
        align: 'left',
        intro: intro('Legal', ['Privacy policy']),
        paragraphs: [
          '**Who we are.** This website is operated by Colion International Trading LLC, Deira, Dubai, United Arab Emirates. Contact: info@colioninternational.com.',
          '**What we collect.** When you send an enquiry we receive the details you choose to share — your name, company, phone number, email address and the products you are interested in. Enquiry forms on this site open WhatsApp or your email application with your message filled in; nothing is stored on this website.',
          '**How we use it.** Only to reply to your enquiry, prepare quotations, process and deliver orders, handle warranty claims, and meet our legal and tax obligations in the UAE. We do not sell your information.',
          '**Analytics.** We use Google Analytics to understand how visitors use the site, in aggregate. It sets cookies; you can block them in your browser settings without affecting how the site works.',
          '**Your rights.** You can ask us at any time what information we hold about you, and ask us to correct or delete it, by emailing info@colioninternational.com.',
        ],
      }),
    ],
  },

  terms: {
    title: 'Terms of Sale',
    description: 'Terms of sale for IT hardware supplied by Colion International Trading LLC, Dubai.',
    sections: [
      section('richText', {
        tone: 'white',
        align: 'left',
        intro: intro('Legal', ['Terms of sale']),
        paragraphs: [
          '**Quotations.** Quotations are valid for the period stated on them and subject to stock availability at the time of order. Prices are in UAE dirhams (AED) and include VAT where stated.',
          '**Genuine products and warranty.** All products are genuine and supplied with the manufacturer\'s warranty valid in the UAE. Warranty service is provided by the manufacturer or its authorised service centre; Colion International assists with claims.',
          '**Delivery.** Delivery times are estimates. Risk passes to the customer on delivery. Please check goods on receipt and report any visible damage or shortage within 48 hours.',
          '**Returns.** Unopened products may be returned within 7 days of delivery, subject to inspection, unless they were ordered specially. Opened products are handled under the manufacturer\'s warranty.',
          '**Trademarks.** Brand names and logos on this site belong to their owners and are used only to identify the products we supply.',
        ],
      }),
    ],
  },
};
