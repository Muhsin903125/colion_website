import { faq, img } from './helpers.mjs';

const empty = { publicId: '', alt: '', version: null, width: null, height: null };
const logo = (slug, name, ext = 'webp') => img(`/images/brands/${slug}.${ext}`, `${name} logo`);
const base = { indexOverride: 'auto', seoTitle: '', seoDescription: '', ogImage: empty, proof: '', relationship: 'stockist', warrantyNote: '' };

const GENUINE = [
  'Sourced through the manufacturer\'s regional distribution channel, not grey import.',
  'Sealed retail packaging with serial numbers you can check on the manufacturer\'s site.',
  'Manufacturer warranty valid in the UAE, claimed through us or the brand\'s service centre.',
  'VAT invoice with model and serial numbers for your asset register.',
];

/**
 * The twelve brands Colion sells most. Each page carries its own copy, product
 * lines and FAQs, so it clears the quality gate and is indexed.
 */
const core = [
  {
    slug: 'hp', name: 'HP', website: 'https://www.hp.com/ae-en/', ext: 'webp',
    categories: ['printers', 'desktops', 'all-in-one-pcs', 'servers'],
    productLines: ['HP LaserJet and Color LaserJet printers', 'HP Smart Tank and DeskJet printers', 'HP ProBook, EliteBook and HP laptops', 'HP Pro and Elite desktops', 'HP ProOne and HP all-in-one PCs', 'HP monitors and accessories', 'HPE ProLiant servers'],
    answer: 'Colion International is an HP stockist and wholesale supplier in Dubai, carrying HP LaserJet and Smart Tank printers, HP laptops, desktops, all-in-one PCs and monitors, original HP toner and ink, and HPE ProLiant servers. We deliver HP products across the UAE and export to the Middle East and Africa.',
    intro: [
      'HP is the brand we move the most of, and the one our customers ask for by name. Our Deira stock rooms hold HP printers by the pallet — Color LaserJet Pro multifunction printers for offices, LaserJet Pro mono printers for high-volume text, Smart Tank ink-tank models for low-cost colour and DeskJet printers for homes and small offices — alongside the original HP toner and ink that keep them running.',
      'On the computing side we supply HP laptops from the everyday HP 15 series through ProBook and EliteBook business models, HP Pro and Elite desktops, and HP all-in-one PCs such as the HP Series 5 27-inch. For servers we supply HPE ProLiant tower and rack models, configured to the workload.',
      'Resellers, corporate buyers and system integrators order from us in volume because the stock is in Dubai, not on a distributor\'s lead time. See our [printing solutions](/services/printing-solutions/) and [desktop computing](/services/desktop-computing/) services for installation and deployment.',
    ],
    faqs: [
      faq('Is Colion International an HP dealer in Dubai?', 'Colion International is an HP stockist and wholesale supplier in Dubai, selling genuine HP printers, laptops, desktops, all-in-one PCs and supplies sourced through HP\'s regional channel, with the HP warranty valid in the UAE.'),
      faq('Do you stock original HP toner and ink?', 'Yes. Colion International stocks original HP LaserJet toner cartridges and HP ink for DeskJet and Smart Tank printers, and delivers them across Dubai the same or next working day.'),
      faq('Can I buy HP laptops in bulk for my company?', 'Yes. Colion International supplies HP laptops in bulk, from HP 15 and ProBook to EliteBook models, with identical configurations, volume pricing and optional imaging and asset tagging.'),
    ],
  },
  {
    slug: 'dell', name: 'Dell', website: 'https://www.dell.com/en-ae', ext: 'webp',
    categories: ['desktops', 'all-in-one-pcs', 'servers'],
    productLines: ['Dell Latitude business laptops', 'Dell Vostro and Inspiron laptops', 'Dell OptiPlex desktops and all-in-ones', 'Dell Precision workstations', 'Dell PowerEdge servers', 'Dell monitors'],
    answer: 'Colion International supplies Dell laptops, desktops, workstations, monitors and PowerEdge servers in Dubai and across the UAE, including Latitude, Vostro, OptiPlex and Precision models. We quote single units or bulk orders, configure servers to your workload, and deliver with Dell\'s manufacturer warranty.',
    intro: [
      'Dell is a standard in corporate IT departments because of its long product lifecycles and consistent business lines. We supply Dell Latitude laptops for staff on the move, Vostro and Inspiron for small businesses and education, and OptiPlex desktops and all-in-ones for office floors that want one managed fleet.',
      'For technical users we supply Dell Precision workstations certified for CAD, BIM and visualisation software. Dell UltraSharp and business monitors complete each desk, with docking stations for laptop users.',
      'In the data room, Dell PowerEdge tower and rack servers are among the most requested systems we configure. We specify processors, memory, drives and RAID to the workload, enable iDRAC remote management, and install the server with a matching [UPS](/products/ups/). Our [server and storage](/services/server-storage/) team handles the build.',
    ],
    faqs: [
      faq('Do you sell Dell PowerEdge servers in Dubai?', 'Yes. Colion International supplies Dell PowerEdge tower and rack servers in Dubai, configured with the processors, memory, drives and RAID your workload needs, and installs them on site.'),
      faq('Which Dell laptop is best for business?', 'Colion International recommends Dell Latitude for most business users — it is built for durability, manageability and long support lifecycles. Vostro is the value option for small businesses.'),
      faq('Do Dell products from Colion come with a UAE warranty?', 'Yes. Dell laptops, desktops, monitors and servers supplied by Colion International carry Dell\'s manufacturer warranty valid in the UAE.'),
    ],
  },
  {
    slug: 'lenovo', name: 'Lenovo', website: 'https://www.lenovo.com/ae/en/', ext: 'webp',
    categories: ['desktops', 'all-in-one-pcs', 'servers'],
    productLines: ['Lenovo ThinkPad business laptops', 'Lenovo IdeaPad laptops', 'Lenovo ThinkCentre desktops and Tiny PCs', 'Lenovo ThinkCentre and IdeaCentre all-in-ones', 'Lenovo Tab tablets', 'Lenovo ThinkSystem servers'],
    answer: 'Colion International supplies Lenovo ThinkPad and IdeaPad laptops, ThinkCentre desktops, all-in-one PCs, Lenovo tablets and ThinkSystem servers in Dubai and across the UAE. We hold popular Lenovo models in stock at our Deira showroom and quote bulk orders for businesses, schools and resellers.',
    intro: [
      'Lenovo\'s ThinkPad range has a reputation among business users for its keyboards, durability and security features, and it is the laptop many IT departments standardise on. We supply ThinkPad E, L, T and X series for business users and IdeaPad models for students and home offices, plus Lenovo tablets for retail, education and field staff.',
      'ThinkCentre desktops come in Tiny, small-form-factor and tower designs; the Tiny models mount behind a monitor and are popular for reception desks, call centres and kiosks. ThinkCentre and IdeaCentre all-in-ones cover offices that want a single unit per desk.',
      'Lenovo ThinkSystem servers offer strong value for small and medium businesses, with XClarity remote management. You will see Lenovo stock on our showroom shelves; for larger deployments our [desktop computing](/services/desktop-computing/) team images and installs the machines.',
    ],
    faqs: [
      faq('Do you have Lenovo ThinkPad laptops in stock in Dubai?', 'Colion International keeps popular Lenovo ThinkPad and IdeaPad configurations in stock in Dubai and sources other configurations to order. Send the model or specification on WhatsApp for availability and a quote.'),
      faq('What is a Lenovo ThinkCentre Tiny?', 'The ThinkCentre Tiny is a very small business desktop that can mount behind a monitor. Colion International recommends it for reception desks, call centres and kiosks where desk space is limited.'),
      faq('Do you supply Lenovo tablets for businesses?', 'Yes. Colion International supplies Lenovo Tab tablets for retail, education and field teams, alongside laptops and desktops.'),
    ],
  },
  {
    slug: 'epson', name: 'Epson', website: 'https://www.epson.ae/', ext: 'svg',
    categories: ['printers', 'projectors'],
    productLines: ['Epson EcoTank ink-tank printers', 'Epson WorkForce business inkjets', 'Epson label and receipt printers', 'Epson large-format printers', 'Epson business and education projectors', 'Epson original ink bottles'],
    answer: 'Colion International stocks Epson EcoTank ink-tank printers, WorkForce business printers, receipt and label printers, and Epson business, education and laser projectors in Dubai, with original Epson ink. We supply single units and wholesale quantities across the UAE and install projectors on site.',
    intro: [
      'Epson\'s EcoTank printers changed the economics of colour printing: instead of cartridges, they use refillable ink bottles that print thousands of pages for a fraction of the cartridge cost. For small offices, schools and homes printing in colour, they are usually the lowest cost per page available, and they are among the fastest-moving lines in our showroom.',
      'For businesses we also supply Epson WorkForce printers, TM-series receipt printers for retail and hospitality, label printers, and SureColor large-format printers for drawings and posters.',
      'Epson is also the world\'s leading projector brand, and the core of our [projector range](/products/projectors/) — from portable models such as the Epson CO-W01 to short-throw classroom projectors and installation-class laser projectors. Our [presentation solutions](/services/presentation-solutions/) team mounts and installs them.',
    ],
    faqs: [
      faq('Is an Epson EcoTank printer worth it?', 'For users who print in colour regularly, yes. Colion International finds Epson EcoTank printers have one of the lowest costs per page available, because refill bottles replace expensive cartridges. For high-volume text-only printing, a mono laser is still faster.'),
      faq('Do you sell Epson projectors in Dubai?', 'Yes. Colion International supplies Epson business, education, short-throw and laser projectors in Dubai and across the UAE, with screens, mounts and installation.'),
      faq('Do you stock original Epson ink bottles?', 'Yes. Colion International stocks original Epson ink bottles for EcoTank printers and delivers them across Dubai.'),
    ],
  },
  {
    slug: 'fujitsu', name: 'Fujitsu', website: 'https://www.fujitsu.com/global/', ext: null,
    categories: ['desktops', 'servers'],
    productLines: ['Fujitsu PRIMERGY tower and rack servers', 'Fujitsu ESPRIMO business desktops', 'Fujitsu LIFEBOOK business laptops', 'Fujitsu (Ricoh) document scanners', 'Fujitsu server memory and drives'],
    answer: 'Colion International supplies Fujitsu PRIMERGY servers, ESPRIMO business desktops, LIFEBOOK laptops and Fujitsu document scanners in Dubai and across the UAE. We support organisations that have standardised on Fujitsu with replacement units, server expansion parts and new systems.',
    intro: [
      'Fujitsu built a strong following in enterprise and public-sector IT, and many organisations in the region still run Fujitsu PRIMERGY servers and ESPRIMO desktops. We help those customers expand and refresh their estates with matching systems, memory and drives, so new hardware fits the management tools and support processes already in place.',
      'PRIMERGY tower and rack servers cover small-office file serving through to virtualisation hosts. ESPRIMO desktops and LIFEBOOK laptops are business-class machines with long lifecycles and enterprise security features.',
      'Fujitsu\'s document scanners — the fi series and ScanSnap, now part of Ricoh\'s portfolio — are a standard in records management, finance and healthcare for high-speed duplex scanning. We supply them alongside our [printers and copiers](/products/printers/). Our [server and storage](/services/server-storage/) team configures and installs PRIMERGY systems.',
    ],
    faqs: [
      faq('Do you still supply Fujitsu servers?', 'Yes. Colion International supplies Fujitsu PRIMERGY servers and expansion parts for organisations that have standardised on Fujitsu, alongside equivalent HPE, Dell and Lenovo options.'),
      faq('Do you sell Fujitsu document scanners?', 'Yes. Colion International supplies Fujitsu fi-series and ScanSnap document scanners for offices, records departments, finance and healthcare.'),
      faq('Can you supply parts for existing Fujitsu servers?', 'Colion International sources compatible memory, drives and power supplies for Fujitsu PRIMERGY servers. Send the server model and serial number for a quotation.'),
    ],
  },
  {
    slug: 'ricoh', name: 'Ricoh', website: 'https://www.ricoh-me.com/', ext: 'webp',
    categories: ['printers', 'projectors'],
    productLines: ['Ricoh IM multifunction copiers', 'Ricoh A4 laser printers', 'Ricoh production printers', 'Ricoh and Fujitsu document scanners', 'Ricoh toner and supplies'],
    answer: 'Colion International supplies Ricoh multifunction copiers, A4 and A3 laser printers, document scanners and original Ricoh toner in Dubai and across the UAE. Ricoh IM-series copiers suit departments with high print and scan volumes, and we install them on your network.',
    intro: [
      'Ricoh is one of the leading names in office copiers, and its IM series multifunction printers are built for the departments that print, copy and scan the most: finance teams, schools, legal offices, government departments and print rooms. They handle A3 as well as A4, offer finishing options such as stapling and booklet-making, and scan large batches to email, folders and document-management systems.',
      'For smaller teams we supply Ricoh A4 laser printers and multifunction devices, and for high-speed document capture the Ricoh (formerly Fujitsu) fi-series scanners.',
      'Copiers are a long-term investment, so we quote with the cost per page over the life of the machine, supply original Ricoh toner, and our [printing solutions](/services/printing-solutions/) team installs the device on your network with scan-to-email and user codes configured.',
    ],
    faqs: [
      faq('Is a Ricoh copier good for a busy office?', 'Yes. Colion International recommends Ricoh IM-series multifunction copiers for departments printing several thousand pages a month, especially where A3, finishing or high-volume scanning is needed.'),
      faq('Do you supply Ricoh toner in Dubai?', 'Yes. Colion International supplies original Ricoh toner and supplies for the copiers and printers it sells, delivered across Dubai.'),
      faq('Can a Ricoh copier scan to email?', 'Yes. Ricoh multifunction copiers scan to email, network folders and cloud services. Colion International configures scanning as part of installation.'),
    ],
  },
  {
    slug: 'tp-link', name: 'TP-Link', website: 'https://www.tp-link.com/ae/', ext: 'webp',
    categories: ['routers-switches', 'networking-accessories'],
    productLines: ['TP-Link Omada business Wi-Fi and switches', 'TP-Link JetStream managed switches', 'TP-Link Archer and Deco routers', 'TP-Link VIGI surveillance', 'TP-Link SFP modules and adapters'],
    answer: 'Colion International supplies TP-Link networking in Dubai and across the UAE, including Omada business Wi-Fi access points and switches, JetStream managed and PoE switches, Archer and Deco routers, and network adapters. TP-Link Omada is our most recommended value system for small and medium offices.',
    intro: [
      'TP-Link has moved well beyond home routers. Its Omada platform gives small and medium businesses a centrally managed network of ceiling Wi-Fi access points, PoE switches and gateways, configured from one controller or the cloud — the kind of system that used to cost several times more from enterprise brands.',
      'We supply Omada access points for offices, hotels, retail and warehouses, JetStream managed and smart switches with PoE for cameras and phones, and Archer routers and Deco mesh systems for home offices and small sites. Network adapters, SFP modules and unmanaged switches complete the range.',
      'TP-Link is the brand we most often recommend when a customer needs reliable business Wi-Fi on a sensible budget. Our [network infrastructure](/services/network-infrastructure/) team plans access-point positions, installs and configures the system, and supplies the [cabling](/products/networking-accessories/) it runs on.',
    ],
    faqs: [
      faq('Is TP-Link Omada good for business Wi-Fi?', 'Yes. Colion International recommends TP-Link Omada for small and medium offices that want centrally managed Wi-Fi and switching at a sensible cost, with seamless roaming between access points.'),
      faq('Do you sell TP-Link PoE switches?', 'Yes. Colion International supplies TP-Link JetStream and Omada PoE switches for access points, IP phones and CCTV cameras, sized by port count and PoE budget.'),
      faq('Can you install a TP-Link network?', 'Yes. Colion International designs, cables, installs and configures TP-Link Omada networks across the UAE, including VLANs and guest Wi-Fi.'),
    ],
  },
  {
    slug: 'd-link', name: 'D-Link', website: 'https://www.dlink.com/ae/en', ext: 'webp',
    categories: ['routers-switches', 'networking-accessories'],
    productLines: ['D-Link smart-managed and unmanaged switches', 'D-Link PoE switches', 'D-Link Nuclias cloud Wi-Fi', 'D-Link 4G/LTE routers', 'D-Link structured cabling, patch panels and racks'],
    answer: 'Colion International supplies D-Link switches, PoE switches, Wi-Fi, 4G routers and structured-cabling products in Dubai and across the UAE, including D-Link Cat6 cable, patch panels, keystone jacks and network racks in wholesale quantities for installers and projects.',
    intro: [
      'D-Link is one of the most widely installed networking brands in the Middle East, and for many installers it is the default for the passive side of a network as well as the active one. We supply D-Link Cat6 and Cat6A cable in 305-metre boxes, patch panels, keystone jacks, faceplates, patch cords and wall-mount and floor-standing racks.',
      'On the active side, D-Link\'s unmanaged and smart-managed switches cover everything from a five-port desktop switch to rack-mount PoE switches for CCTV and access points. Nuclias cloud-managed Wi-Fi gives small businesses central control, and D-Link 4G/LTE routers provide backup internet or connectivity for sites without fixed lines.',
      'Installers and resellers buy D-Link from us in volume because we hold it in Dubai. Our [network infrastructure](/services/network-infrastructure/) team also uses it for complete office cabling projects; see [networking accessories](/products/networking-accessories/) for the full cabling range.',
    ],
    faqs: [
      faq('Do you sell D-Link Cat6 cable in Dubai?', 'Yes. Colion International supplies D-Link Cat6 and Cat6A cable in 305-metre boxes, with patch panels, jacks and patch cords, at wholesale prices for installers and projects.'),
      faq('Are D-Link switches good for CCTV?', 'Yes. Colion International supplies D-Link PoE switches designed for IP cameras, with enough PoE budget and long-range modes for larger CCTV installations.'),
      faq('Do you supply D-Link 4G routers?', 'Yes. Colion International supplies D-Link 4G/LTE routers for backup internet and for sites without a fixed line.'),
    ],
  },
  {
    slug: 'apc', name: 'APC', website: 'https://www.apc.com/ae/en/', ext: 'webp',
    categories: ['ups'],
    productLines: ['APC Back-UPS', 'APC Smart-UPS line-interactive', 'APC Smart-UPS On-Line', 'APC Easy UPS', 'APC rack PDUs and surge protectors', 'APC replacement battery cartridges'],
    answer: 'Colion International supplies APC by Schneider Electric UPS systems in Dubai and across the UAE — Back-UPS for PCs, Smart-UPS for servers and network cabinets, Smart-UPS On-Line and Easy UPS — plus APC replacement batteries, rack PDUs and surge protectors. We size the UPS to your load and install it.',
    intro: [
      'APC by Schneider Electric is the most recognised UPS brand in IT, and the one most server rooms in the region already use. We supply the full range: APC Back-UPS for desktop PCs and home offices, Smart-UPS line-interactive units for network cabinets and small servers, and Smart-UPS On-Line and Easy UPS online models for servers and sensitive equipment that need double-conversion protection.',
      'APC replacement battery cartridges (RBC) keep existing units in service; in UAE temperatures batteries typically need replacing every three to five years. Rack PDUs and surge protectors complete the power chain.',
      'The most important step is sizing. We calculate the real load and runtime, recommend the right APC model, and our [power and protection](/services/power-protection/) team installs it with PowerChute shutdown software or a network management card for your [servers](/products/servers/).',
    ],
    faqs: [
      faq('Which APC UPS do I need for a server?', 'Colion International recommends APC Smart-UPS On-Line or Smart-UPS for servers, sized at least 25–30% above the server\'s real wattage, with PowerChute shutdown software configured.'),
      faq('Do you sell APC replacement batteries?', 'Yes. Colion International supplies APC replacement battery cartridges (RBC) for Back-UPS and Smart-UPS units across the UAE.'),
      faq('What is the difference between APC Back-UPS and Smart-UPS?', 'Back-UPS is designed for desktop PCs and home offices. Smart-UPS has a pure sine-wave output, better management and longer runtime options for servers and network equipment. Colion International supplies both.'),
    ],
  },
  {
    slug: 'canon', name: 'Canon', website: 'https://en.canon-me.com/', ext: 'webp',
    categories: ['printers'],
    productLines: ['Canon i-SENSYS laser printers', 'Canon imageRUNNER multifunction copiers', 'Canon PIXMA G ink-tank printers', 'Canon imageFORMULA scanners', 'Canon original toner and ink'],
    answer: 'Colion International stocks Canon printers and copiers in Dubai — i-SENSYS laser printers, imageRUNNER multifunction copiers, PIXMA G ink-tank printers and imageFORMULA scanners — with original Canon toner and ink. We hold Canon stock by the pallet for wholesale customers and deliver across the UAE.',
    intro: [
      'Canon is one of our largest printer lines, and the stock you see in our showroom photographs arrives by the pallet. Canon i-SENSYS laser printers are compact, fast mono and colour machines for offices, while the imageRUNNER range covers departmental A3 multifunction copiers with finishing and high-volume scanning.',
      'For low-cost colour, Canon PIXMA G series ink-tank printers use refillable bottles in the same way as Epson EcoTank, and suit schools, small offices and homes. Canon imageFORMULA document scanners handle high-volume scanning for records and finance teams.',
      'Because we buy Canon in volume, resellers and corporate buyers come to us for consistent stock and pricing. We carry original Canon toner and ink, and our [printing solutions](/services/printing-solutions/) team installs the printers on your network.',
    ],
    faqs: [
      faq('Do you sell Canon copiers in Dubai?', 'Yes. Colion International supplies Canon imageRUNNER multifunction copiers and i-SENSYS printers in Dubai, with installation and original toner.'),
      faq('Is Canon i-SENSYS good for an office?', 'Yes. Colion International finds Canon i-SENSYS laser printers reliable and fast for small and medium offices, with compact designs and economical toner.'),
      faq('Can I buy Canon printers wholesale?', 'Yes. Colion International holds Canon printers in volume and supplies resellers and corporate buyers at wholesale prices across the UAE.'),
    ],
  },
  {
    slug: 'cisco', name: 'Cisco', website: 'https://www.cisco.com/', ext: 'webp',
    categories: ['routers-switches', 'networking-accessories'],
    productLines: ['Cisco Catalyst switches', 'Cisco Business switches', 'Cisco routers and ISR', 'Cisco Meraki cloud-managed networking', 'Cisco IP phones', 'Cisco SFP transceivers'],
    answer: 'Colion International supplies Cisco networking in Dubai and across the UAE — Catalyst and Cisco Business switches, routers, Meraki cloud-managed Wi-Fi and switching, IP phones and SFP transceivers — for enterprises, data centres and growing businesses that standardise on Cisco.',
    intro: [
      'Cisco is the reference point for enterprise networking, and many corporate and government networks in the UAE are built on it. We supply Cisco Catalyst switches for core and access layers, Cisco Business switches as a cost-effective line for small and medium businesses, and Cisco routers for branch and internet connectivity.',
      'Cisco Meraki brings cloud management to switches, Wi-Fi and security appliances, which suits organisations with several sites and a small IT team. We also supply Cisco IP phones and the SFP and SFP+ transceivers that connect switches over fibre.',
      'Cisco projects benefit from careful design. Our [network infrastructure](/services/network-infrastructure/) team specifies the switching, Wi-Fi and security together, and supplies the [cabling and racks](/products/networking-accessories/) they need. Where budgets are tighter, we can also quote equivalent designs on Cisco Business or alternative brands for comparison.',
    ],
    faqs: [
      faq('Do you supply Cisco switches in Dubai?', 'Yes. Colion International supplies Cisco Catalyst and Cisco Business switches in Dubai and across the UAE, including PoE and stackable models.'),
      faq('What is Cisco Meraki?', 'Cisco Meraki is Cisco\'s cloud-managed range of switches, Wi-Fi and security appliances, managed from a web dashboard. Colion International recommends it for multi-site organisations with small IT teams.'),
      faq('Do you sell Cisco SFP modules?', 'Yes. Colion International supplies Cisco SFP and SFP+ transceivers for fibre and copper uplinks.'),
    ],
  },
  {
    slug: 'brother', name: 'Brother', website: 'https://www.brother.ae/', ext: 'webp',
    categories: ['printers'],
    productLines: ['Brother HL-L mono laser printers', 'Brother MFC and DCP multifunction printers', 'Brother InkBenefit ink-tank printers', 'Brother P-touch label printers', 'Brother original toner and drums'],
    answer: 'Colion International supplies Brother printers in Dubai and across the UAE — HL-L mono laser printers, MFC and DCP multifunction printers, InkBenefit ink-tank models and P-touch label printers — with original Brother toner and drum units, for offices, retail and logistics.',
    intro: [
      'Brother printers have a reputation for being dependable and economical, which is why they are a favourite for small offices, clinics and retail back offices. The HL-L series mono laser printers and MFC and DCP multifunction models are compact, quick and use high-yield toner that keeps the cost per page low.',
      'Brother\'s separate toner and drum design means you replace each only when it is worn, rather than paying for a new drum with every cartridge. InkBenefit ink-tank printers cover low-cost colour printing.',
      'Brother P-touch and QL label printers are widely used in warehouses, shops and offices for asset tags, shelf labels and shipping labels. We stock original Brother toner and drums, and our [printing solutions](/services/printing-solutions/) team installs printers on your network.',
    ],
    faqs: [
      faq('Are Brother laser printers good for small offices?', 'Yes. Colion International recommends Brother HL-L and MFC-L laser printers for small offices for their reliability, compact size and low running costs with high-yield toner.'),
      faq('Why do Brother printers have a separate drum?', 'Brother separates the toner and drum so each is replaced only when worn, which lowers the cost per page. Colion International supplies both as original Brother parts.'),
      faq('Do you sell Brother label printers?', 'Yes. Colion International supplies Brother P-touch and QL label printers for offices, retail and warehouses.'),
    ],
  },
];

/**
 * The rest of the brand wall. Each has a page with its product lines and the
 * categories it appears in, but stays `noindex` until an editor writes the
 * intro and FAQs — see the quality gate in src/data/quality.ts.
 */
const std = (slug, name, website, categories, productLines, ext = 'webp') => ({
  slug, name, website, ext, categories, productLines,
  answer: `Colion International supplies ${name} products in Dubai and across the UAE, including ${productLines.slice(0, 2).join(' and ').toLowerCase().replace(name.toLowerCase(), name)}. Ask our sales desk on WhatsApp for current stock and a quotation.`,
  intro: [`We supply ${name} alongside the other leading brands in our range. Contact us for availability, specifications and wholesale pricing.`],
  faqs: [],
});

const standard = [
  std('acer', 'Acer', 'https://www.acer.com/ae-en', ['desktops', 'all-in-one-pcs'], ['Acer TravelMate and Aspire laptops', 'Acer Veriton desktops', 'Acer monitors and projectors']),
  std('adata', 'ADATA', 'https://www.adata.com/', ['desktops', 'servers'], ['ADATA SSDs', 'ADATA memory modules', 'ADATA external drives']),
  std('amd', 'AMD', 'https://www.amd.com/', ['desktops', 'servers'], ['AMD Ryzen processors', 'AMD EPYC server processors', 'AMD Radeon graphics']),
  std('apple', 'Apple', 'https://www.apple.com/ae/', ['desktops', 'all-in-one-pcs'], ['MacBook Air and MacBook Pro', 'iMac all-in-one', 'iPad']),
  std('aruba', 'Aruba (HPE)', 'https://www.arubanetworks.com/', ['routers-switches'], ['Aruba Instant On access points', 'Aruba CX switches', 'Aruba Instant On switches']),
  std('asus', 'ASUS', 'https://www.asus.com/ae-en/', ['desktops', 'all-in-one-pcs', 'routers-switches'], ['ASUS ExpertBook and Vivobook laptops', 'ASUS all-in-one PCs', 'ASUS routers and monitors']),
  std('corsair', 'Corsair', 'https://www.corsair.com/', ['desktops'], ['Corsair memory', 'Corsair power supplies', 'Corsair keyboards and mice']),
  std('crucial', 'Crucial', 'https://www.crucial.com/', ['desktops', 'servers'], ['Crucial SSDs', 'Crucial desktop and laptop memory', 'Crucial server memory']),
  std('cyberpower', 'CyberPower', 'https://www.cyberpowersystems.com/', ['ups'], ['CyberPower line-interactive UPS', 'CyberPower online UPS', 'CyberPower PDUs and surge protectors']),
  std('eaton', 'Eaton', 'https://www.eaton.com/', ['ups'], ['Eaton 5E and 5P UPS', 'Eaton 9SX and 9PX online UPS', 'Eaton rack PDUs']),
  std('fortinet', 'Fortinet', 'https://www.fortinet.com/', ['routers-switches'], ['FortiGate firewalls', 'FortiSwitch switches', 'FortiAP access points'], 'svg'),
  std('g-skill', 'G.Skill', 'https://www.gskill.com/', ['desktops'], ['G.Skill desktop memory', 'G.Skill gaming memory kits', 'G.Skill peripherals'], 'svg'),
  std('huawei', 'Huawei', 'https://e.huawei.com/', ['routers-switches'], ['Huawei enterprise switches', 'Huawei access points', 'Huawei routers']),
  std('hyperx', 'HyperX', 'https://www.hyperx.com/', ['desktops'], ['HyperX headsets', 'HyperX keyboards', 'HyperX mice']),
  std('intel', 'Intel', 'https://www.intel.com/', ['desktops', 'servers'], ['Intel Core processors', 'Intel Xeon server processors', 'Intel network adapters']),
  std('juniper', 'Juniper Networks', 'https://www.juniper.net/', ['routers-switches'], ['Juniper EX switches', 'Juniper SRX firewalls', 'Juniper Mist access points']),
  std('kaspersky', 'Kaspersky', 'https://www.kaspersky.com/', ['desktops'], ['Kaspersky endpoint security', 'Kaspersky small office security', 'Kaspersky antivirus licences']),
  std('kingston', 'Kingston', 'https://www.kingston.com/', ['desktops', 'servers'], ['Kingston memory', 'Kingston SSDs', 'Kingston USB drives']),
  std('konica-minolta', 'Konica Minolta', 'https://www.konicaminolta.com/', ['printers'], ['Konica Minolta bizhub multifunction copiers', 'Konica Minolta production printers', 'Konica Minolta toner']),
  std('kyocera', 'Kyocera', 'https://www.kyoceradocumentsolutions.eu/', ['printers'], ['Kyocera ECOSYS printers', 'Kyocera TASKalfa copiers', 'Kyocera toner']),
  std('lg', 'LG', 'https://www.lg.com/ae/', ['desktops', 'projectors'], ['LG monitors', 'LG large-format displays', 'LG projectors']),
  std('linksys', 'Linksys', 'https://www.linksys.com/', ['routers-switches', 'networking-accessories'], ['Linksys routers', 'Linksys Velop mesh Wi-Fi', 'Linksys switches']),
  std('logitech', 'Logitech', 'https://www.logitech.com/', ['desktops', 'projectors'], ['Logitech keyboards and mice', 'Logitech webcams', 'Logitech video-conferencing systems']),
  std('mercury', 'Mercury', 'https://www.mercury-ups.com/', ['ups'], ['Mercury line-interactive UPS', 'Mercury online UPS', 'Mercury UPS batteries']),
  std('microsoft', 'Microsoft', 'https://www.microsoft.com/', ['desktops'], ['Microsoft Windows licences', 'Microsoft 365', 'Microsoft Surface']),
  std('mikrotik', 'MikroTik', 'https://mikrotik.com/', ['routers-switches', 'networking-accessories'], ['MikroTik routers', 'MikroTik switches', 'MikroTik wireless']),
  std('msi', 'MSI', 'https://www.msi.com/', ['desktops', 'all-in-one-pcs'], ['MSI laptops', 'MSI desktops and all-in-ones', 'MSI monitors and motherboards']),
  std('netgear', 'Netgear', 'https://www.netgear.com/', ['routers-switches', 'networking-accessories'], ['Netgear business switches', 'Netgear Insight access points', 'Netgear routers']),
  std('philips', 'Philips', 'https://www.philips.ae/', ['desktops', 'projectors', 'ups'], ['Philips monitors', 'Philips large-format displays', 'Philips power accessories']),
  std('razer', 'Razer', 'https://www.razer.com/', ['desktops'], ['Razer keyboards', 'Razer mice', 'Razer headsets'], 'svg'),
  std('samsung', 'Samsung', 'https://www.samsung.com/ae/', ['desktops', 'projectors', 'servers'], ['Samsung monitors', 'Samsung large-format displays', 'Samsung SSDs']),
  std('seagate', 'Seagate', 'https://www.seagate.com/', ['servers'], ['Seagate IronWolf NAS drives', 'Seagate Exos enterprise drives', 'Seagate SkyHawk surveillance drives']),
  std('teamgroup', 'TeamGroup', 'https://www.teamgroupinc.com/', ['desktops'], ['TeamGroup memory', 'TeamGroup SSDs', 'TeamGroup USB drives']),
  std('toshiba', 'Toshiba', 'https://www.toshiba.com/', ['servers', 'printers'], ['Toshiba hard drives', 'Toshiba external drives', 'Toshiba multifunction printers']),
  std('ubiquiti', 'Ubiquiti', 'https://www.ui.com/', ['routers-switches', 'networking-accessories'], ['Ubiquiti UniFi access points', 'Ubiquiti UniFi switches', 'Ubiquiti UniFi gateways']),
  std('wacom', 'Wacom', 'https://www.wacom.com/', ['desktops'], ['Wacom pen tablets', 'Wacom pen displays', 'Wacom signature pads']),
  std('western-digital', 'Western Digital', 'https://www.westerndigital.com/', ['servers'], ['WD Red NAS drives', 'WD Purple surveillance drives', 'WD external drives']),
  std('xerox', 'Xerox', 'https://www.xerox.com/', ['printers'], ['Xerox VersaLink printers', 'Xerox AltaLink multifunction copiers', 'Xerox toner']),
];

const finish = ({ ext, ...b }, tier) => ({
  ...base,
  ...b,
  tier,
  logo: ext ? logo(b.slug, b.name, ext) : empty,
  whyGenuine: GENUINE,
});

export const brands = [...core.map((b) => finish(b, 'core')), ...standard.map((b) => finish(b, 'standard'))];
