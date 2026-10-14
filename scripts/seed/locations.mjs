import { faq, PLACE } from './helpers.mjs';

const empty = { publicId: '', alt: '', version: null, width: null, height: null };
const base = { indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: empty };

/**
 * One page per emirate. Every page says plainly that orders are supplied from
 * the Deira branches in Dubai — Colion has no address in the other six
 * emirates, and neither the copy nor the schema pretends otherwise.
 */
export const locations = [
  {
    ...base,
    slug: 'dubai',
    imageCredit: 'Photo: Norlando Pobre, CC BY 2.0, via Wikimedia Commons',
    name: 'Dubai',
    isoCode: 'AE-DU',
    wikipedia: 'https://en.wikipedia.org/wiki/Dubai',
    deliveryTime: 'Same day or next working day',
    installation: 'On-site installation by our own technicians',
    image: PLACE('dubai', 'Dubai Marina skyline'),
    answer:
      'Colion International is an IT hardware supplier in Dubai with two branches in Deira, including its corporate office in Al Dhagaya. We deliver printers, computers, servers, networking and UPS across Dubai the same or next working day, and install them at your office free of charge.',
    intro: [
      'Dubai is home. Our two walk-in branches in Al Sabkha and Al Dhagaya, Deira, sit in one of the city\'s oldest trading districts, a few minutes from the Creek, and our corporate office sits with the Al Dhagaya branch. Customers from across the city collect from the branches, and our delivery vehicles cover every district from Deira and Bur Dubai to Dubai Marina, Jebel Ali and Dubai Silicon Oasis.',
      'For stock items, orders confirmed in the morning are usually delivered the same day within central Dubai, and next working day elsewhere in the emirate. Free zone companies in JAFZA, DMCC, Dubai Internet City and Dubai Silicon Oasis order from us regularly; we prepare the paperwork their gate and warehouse teams require.',
      'Because our technicians are based in Dubai, installation is on-site and quick: [printers on the network](/services/printing-solutions/), [servers in the rack](/services/server-storage/), and [Wi-Fi across the floor](/services/network-infrastructure/). Visit the [contact page](/contact/) for directions to the branches.',
    ],
    districts: ['Deira', 'Bur Dubai', 'Business Bay', 'Downtown Dubai', 'Al Quoz', 'Al Barsha', 'Dubai Marina', 'Jumeirah Lake Towers', 'Al Qusais', 'Dubai Investments Park'],
    freeZones: ['JAFZA', 'DMCC', 'Dubai Internet City', 'Dubai Silicon Oasis', 'Dubai Airport Freezone (DAFZA)', 'Dubai South'],
    sectors: ['Trading and wholesale', 'Hospitality', 'Healthcare', 'Education', 'Logistics', 'Real estate and facilities'],
    popularCategories: ['printers', 'desktops', 'routers-switches', 'ups'],
    faqs: [
      faq('Where is Colion International located in Dubai?', 'Colion International has two branches in Deira — Shop 1, Al Jaziri Building, Al Sabkha, and Shop 4, Khalifya Building, Al Dhagaya, which is also the corporate office. The branches are open Monday to Saturday, 9 AM to 7 PM.', true),
      faq('Do you deliver IT hardware the same day in Dubai?', 'Yes, for stock items. Colion International usually delivers same day within central Dubai for orders confirmed in the morning, and next working day elsewhere in the emirate.', true),
      faq('Do you deliver to free zones like JAFZA and DMCC?', 'Yes. Colion International delivers to Dubai free zones including JAFZA, DMCC, Dubai Internet City, Dubai Silicon Oasis and DAFZA, with the documentation free zone warehouses require.'),
    ],
  },
  {
    ...base,
    slug: 'abu-dhabi',
    imageCredit: 'Photo: AdnanDekedek, CC BY-SA 4.0, via Wikimedia Commons',
    name: 'Abu Dhabi',
    isoCode: 'AE-AZ',
    wikipedia: 'https://en.wikipedia.org/wiki/Abu_Dhabi',
    deliveryTime: '1–2 working days',
    installation: 'Scheduled on-site installation',
    image: PLACE('abu-dhabi', 'Abu Dhabi Corniche skyline'),
    answer:
      'Colion International supplies IT hardware to businesses in Abu Dhabi from its Dubai branches, delivering printers, computers, servers, networking and UPS to Abu Dhabi city, Mussafah, KIZAD and Al Ain within one to two working days, with scheduled on-site installation.',
    intro: [
      'Many of our Abu Dhabi customers are companies that want Dubai\'s wholesale stock and pricing without driving to Deira. We supply them from our Dubai branches and deliver to Abu Dhabi island, Mussafah, Khalifa City, Al Reem and Yas Island, as well as to the industrial and free zones at KIZAD and Masdar City, typically within one to two working days.',
      'Larger orders — an office fit-out, a server room, or a school\'s computer lab — are delivered on a scheduled date and installed by our technicians on site. Smaller orders and supplies such as toner and UPS batteries are sent by courier.',
      'Abu Dhabi has a high concentration of government, energy and construction organisations, which tend to standardise on [HP](/brands/hp/), [Dell](/brands/dell/) and [Lenovo](/brands/lenovo/) computing and [Cisco](/brands/cisco/) networking. We quote against their specifications and supply VAT invoices with model and serial numbers for asset registers.',
    ],
    districts: ['Abu Dhabi Island', 'Mussafah', 'Khalifa City', 'Al Reem Island', 'Yas Island', 'Al Ain'],
    freeZones: ['KIZAD', 'Masdar City Free Zone', 'Abu Dhabi Airport Free Zone', 'ADGM'],
    sectors: ['Government', 'Oil and gas', 'Construction', 'Education', 'Healthcare'],
    popularCategories: ['desktops', 'servers', 'routers-switches', 'printers'],
    faqs: [
      faq('Do you deliver IT hardware to Abu Dhabi?', 'Yes. Colion International delivers from its Dubai branches to Abu Dhabi city, Mussafah, KIZAD, Masdar City and Al Ain, typically within one to two working days.'),
      faq('Can you install equipment on site in Abu Dhabi?', 'Yes. Colion International schedules on-site installation in Abu Dhabi for servers, networks, printers and computer roll-outs.'),
      faq('Do you have a branch in Abu Dhabi?', 'No. Colion International\'s branches are in Deira, Dubai. Abu Dhabi orders are supplied and delivered from Dubai.'),
    ],
  },
  {
    ...base,
    slug: 'sharjah',
    imageCredit: 'Photo: Thomas Dahlstrøm Nielsen, CC BY-SA 4.0, via Wikimedia Commons',
    name: 'Sharjah',
    isoCode: 'AE-SH',
    wikipedia: 'https://en.wikipedia.org/wiki/Sharjah',
    deliveryTime: 'Same day or next working day',
    installation: 'On-site installation',
    image: PLACE('sharjah', 'Sharjah Corniche and Khalid Lagoon'),
    answer:
      'Colion International supplies IT hardware to Sharjah from its Deira branches, a short drive away, delivering printers, computers, servers, networking and UPS to Sharjah city, the industrial areas, SAIF Zone and Hamriyah Free Zone, usually the same or next working day, with on-site installation.',
    intro: [
      'Sharjah is the nearest emirate to our Deira branches, and many Sharjah businesses collect in person or have us deliver the same day. We supply offices in Al Majaz, Al Nahda and Al Taawun, factories and warehouses in the Sharjah Industrial Areas, and companies in SAIF Zone and Hamriyah Free Zone.',
      'Industrial and logistics customers often need rugged label and receipt printers, UPS protection for production systems, and Wi-Fi that covers a warehouse floor. Schools and universities in University City order computer labs and projectors.',
      'Our technicians install on site in Sharjah as they do in Dubai: [network infrastructure](/services/network-infrastructure/), [power protection](/services/power-protection/) and [printers](/products/printers/) configured and tested before hand-over. Customers who prefer to see the stock first can visit either of our Deira branches, a short drive from most of Sharjah.',
    ],
    districts: ['Al Majaz', 'Al Nahda', 'Al Taawun', 'Sharjah Industrial Areas', 'Muwaileh', 'University City'],
    freeZones: ['SAIF Zone', 'Hamriyah Free Zone', 'Sharjah Publishing City', 'SRTI Park'],
    sectors: ['Manufacturing', 'Logistics', 'Education', 'Retail', 'Healthcare'],
    popularCategories: ['printers', 'ups', 'routers-switches', 'desktops'],
    faqs: [
      faq('Do you deliver IT hardware to Sharjah the same day?', 'Often, yes. Colion International\'s Deira branches are close to Sharjah, so stock items are usually delivered the same or next working day.'),
      faq('Do you deliver to SAIF Zone and Hamriyah Free Zone?', 'Yes. Colion International delivers to SAIF Zone and Hamriyah Free Zone with the documentation their warehouses require.'),
      faq('Can I collect my order from your branch instead?', 'Yes. Sharjah customers can collect from the Colion International branches in Deira, Dubai, Monday to Saturday, 9 AM to 7 PM.'),
    ],
  },
  {
    ...base,
    slug: 'ajman',
    imageCredit: 'Photo: Mahmoud Farrag, CC BY 3.0, via Wikimedia Commons',
    name: 'Ajman',
    isoCode: 'AE-AJ',
    wikipedia: 'https://en.wikipedia.org/wiki/Ajman',
    deliveryTime: 'Next working day',
    installation: 'On-site installation',
    image: PLACE('ajman', 'Ajman Corniche'),
    answer:
      'Colion International delivers IT hardware to Ajman from its Dubai branches, supplying printers, computers, networking, servers and UPS to Ajman city, Al Jurf and Ajman Free Zone, usually by the next working day, with on-site installation for networks, servers and printer fleets.',
    intro: [
      'Ajman\'s business community is dominated by small and medium enterprises, trading companies and light industry, many of them registered in Ajman Free Zone. They typically need practical, cost-effective IT: reliable printers, a handful of desktops or laptops, a solid network and a UPS to keep it all running.',
      'We supply those businesses from our Deira branches with next-working-day delivery for stock items. Industrial customers in Al Jurf and the Ajman industrial areas order UPS systems and label printers, while schools and clinics order computers and projectors.',
      'Because the distance is short, our technicians install on site in Ajman — [networks](/services/network-infrastructure/), [servers](/services/server-storage/) and [printer fleets](/services/printing-solutions/) — on the same terms as Dubai. Supplies such as toner, ink and replacement UPS batteries are delivered with the next scheduled run.',
    ],
    districts: ['Ajman City', 'Al Nuaimiya', 'Al Rashidiya', 'Al Jurf', 'Ajman Industrial Area'],
    freeZones: ['Ajman Free Zone', 'Ajman Media City Free Zone'],
    sectors: ['SMEs and trading', 'Light industry', 'Education', 'Healthcare'],
    popularCategories: ['printers', 'desktops', 'ups', 'networking-accessories'],
    faqs: [
      faq('Do you deliver to Ajman?', 'Yes. Colion International delivers IT hardware to Ajman city, Al Jurf and Ajman Free Zone, usually by the next working day for stock items.'),
      faq('Do you install networks in Ajman?', 'Yes. Colion International installs office networks, Wi-Fi, servers and printers on site in Ajman.'),
      faq('Is there a minimum order for delivery to Ajman?', 'Colion International delivers business orders to Ajman without a fixed minimum; for small items such as toner, courier delivery may be arranged. Ask the sales desk for the delivery option on your order.'),
    ],
  },
  {
    ...base,
    slug: 'ras-al-khaimah',
    imageCredit: 'Photo: Tashmetova808, CC BY-SA 4.0, via Wikimedia Commons',
    name: 'Ras Al Khaimah',
    isoCode: 'AE-RK',
    wikipedia: 'https://en.wikipedia.org/wiki/Ras_Al_Khaimah',
    deliveryTime: '1–2 working days',
    installation: 'Scheduled on-site installation',
    image: PLACE('ras-al-khaimah', 'Jebel Jais mountains, Ras Al Khaimah'),
    answer:
      'Colion International supplies IT hardware to Ras Al Khaimah from its Dubai branches, delivering to RAK city, Al Hamra and the RAKEZ economic zones within one to two working days, with scheduled on-site installation for networks, servers and multi-unit roll-outs.',
    intro: [
      'Ras Al Khaimah combines a growing tourism sector around Al Hamra and Al Marjan Island with one of the UAE\'s largest industrial and free-zone communities in RAKEZ. That mix shapes what our customers there order: hotels and resorts need guest Wi-Fi, reception PCs and receipt printers, while manufacturers and RAKEZ companies need UPS protection, rugged networking and office IT.',
      'We deliver from our Dubai branches within one to two working days for stock items, and schedule larger deliveries and installations in advance so our technicians can complete them in one visit.',
      'Hospitality customers often standardise on [TP-Link Omada](/brands/tp-link/) or [Cisco](/brands/cisco/) Wi-Fi; industrial sites rely on [APC](/brands/apc/) power protection. Our [network infrastructure](/services/network-infrastructure/) team designs and installs both, and toner and spares follow on our regular northern-emirates delivery runs.',
    ],
    districts: ['RAK City', 'Al Nakheel', 'Al Hamra', 'Al Marjan Island', 'Al Jazeera Al Hamra'],
    freeZones: ['RAKEZ', 'RAK Maritime City'],
    sectors: ['Hospitality', 'Manufacturing', 'Ceramics and building materials', 'Logistics'],
    popularCategories: ['routers-switches', 'ups', 'desktops', 'printers'],
    faqs: [
      faq('Do you deliver to Ras Al Khaimah?', 'Yes. Colion International delivers IT hardware from Dubai to Ras Al Khaimah, including RAKEZ and Al Hamra, typically within one to two working days.'),
      faq('Can you install hotel Wi-Fi in Ras Al Khaimah?', 'Yes. Colion International designs and installs business Wi-Fi for hotels and resorts in Ras Al Khaimah, scheduled in advance so it is completed in one visit.'),
      faq('Do you supply RAKEZ companies?', 'Yes. Colion International supplies companies registered in RAKEZ with computers, networking, printers and UPS, delivered to their facilities.'),
    ],
  },
  {
    ...base,
    slug: 'fujairah',
    imageCredit: 'Photo: Mike Che, CC BY-SA 3.0, via Wikimedia Commons',
    name: 'Fujairah',
    isoCode: 'AE-FU',
    wikipedia: 'https://en.wikipedia.org/wiki/Fujairah',
    deliveryTime: '1–2 working days',
    installation: 'Scheduled on-site installation',
    image: PLACE('fujairah', 'Fujairah Fort'),
    answer:
      'Colion International supplies IT hardware to Fujairah on the UAE\'s east coast from its Dubai branches, delivering to Fujairah city, the port and Fujairah Free Zone within one to two working days, with scheduled on-site installation for networks, servers and office roll-outs.',
    intro: [
      'Fujairah is the UAE\'s east-coast hub for shipping, bunkering and oil storage, and the Port of Fujairah and Fujairah Free Zone host many logistics and energy companies. Their offices and terminals need dependable IT that keeps working far from the big service centres: UPS-protected servers and networks, rugged printers, and computers that can be supported remotely.',
      'We deliver to Fujairah from our Dubai branches within one to two working days for stock items, and schedule installation visits for larger projects so equipment is configured and tested in a single trip.',
      'For remote sites we recommend hardware with good remote management — [Dell PowerEdge](/brands/dell/) and [HPE ProLiant](/brands/hp/) servers with iDRAC and iLO, and cloud-managed [networking](/products/routers-switches/) — so most support can be done without travelling.',
    ],
    districts: ['Fujairah City', 'Dibba Al Fujairah', 'Qidfa', 'Port of Fujairah area'],
    freeZones: ['Fujairah Free Zone', 'Creative Tower (Fujairah Creative City)'],
    sectors: ['Shipping and bunkering', 'Oil storage and energy', 'Logistics', 'Tourism'],
    popularCategories: ['servers', 'ups', 'routers-switches', 'desktops'],
    faqs: [
      faq('Do you deliver IT hardware to Fujairah?', 'Yes. Colion International delivers from Dubai to Fujairah city, the port area and Fujairah Free Zone, typically within one to two working days.'),
      faq('Can you support equipment in Fujairah remotely?', 'Colion International recommends servers and network equipment with remote management for Fujairah sites, so configuration and many support tasks can be handled without a site visit.'),
      faq('Do you install on site in Fujairah?', 'Yes. Colion International schedules on-site installation visits in Fujairah for servers, networks and multi-unit roll-outs.'),
    ],
  },
  {
    ...base,
    slug: 'umm-al-quwain',
    imageCredit: 'Photo: Peter Dowley, CC BY 2.0, via Wikimedia Commons',
    name: 'Umm Al Quwain',
    isoCode: 'AE-UQ',
    wikipedia: 'https://en.wikipedia.org/wiki/Umm_Al_Quwain',
    deliveryTime: 'Next working day',
    installation: 'Scheduled on-site installation',
    image: PLACE('umm-al-quwain', 'Mangroves in Umm Al Quwain'),
    answer:
      'Colion International delivers IT hardware to Umm Al Quwain from its Dubai branches, supplying printers, computers, networking and UPS to UAQ city, the industrial area and Umm Al Quwain Free Trade Zone, usually by the next working day, with scheduled on-site installation.',
    intro: [
      'Umm Al Quwain is the smallest emirate by population, with a business community centred on its free trade zone, light industry along the Emirates Road corridor, and government and education offices in the old town. Most of our UAQ customers are small and medium companies that want wholesale pricing and dependable delivery without a long wait.',
      'Orders are delivered from our Dubai branches, usually by the next working day for stock items. UAQ Free Trade Zone companies often order complete small-office setups: a few [desktops](/products/desktops/), a [multifunction printer](/products/printers/), a router and switch, and a UPS.',
      'We schedule on-site installation for networks and multi-unit deliveries, and can bundle the hardware, cabling and setup on one quotation through our [network infrastructure](/services/network-infrastructure/) service.',
    ],
    districts: ['UAQ City', 'Al Salamah', 'Al Raas', 'UAQ Industrial Area'],
    freeZones: ['Umm Al Quwain Free Trade Zone (UAQ FTZ)'],
    sectors: ['SMEs and trading', 'Light industry', 'Government', 'Education'],
    popularCategories: ['desktops', 'printers', 'routers-switches', 'ups'],
    faqs: [
      faq('Do you deliver to Umm Al Quwain?', 'Yes. Colion International delivers IT hardware from Dubai to Umm Al Quwain city, the industrial area and UAQ Free Trade Zone, usually by the next working day.'),
      faq('Can you set up a complete small office in UAQ?', 'Yes. Colion International supplies and installs complete small-office setups in Umm Al Quwain: computers, printer, router, switch, Wi-Fi and UPS on one quotation.'),
      faq('Do you supply UAQ Free Trade Zone companies?', 'Yes. Colion International regularly supplies companies registered in UAQ Free Trade Zone and delivers to their offices and warehouses.'),
    ],
  },
];
