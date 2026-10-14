import { faq } from './helpers.mjs';

/**
 * Answers are lifted whole by search snippets and answer engines with no
 * surrounding context, so each one names Colion International, restates its
 * subject, and leads with the fact before qualifying it.
 */
export const faqGroups = [
  {
    id: 'ordering',
    title: 'Ordering & pricing',
    blurb: 'How to get a quotation, minimums, payment and invoices.',
    items: [
      faq('How do I get a quotation from Colion International?', 'Send the product, model or requirement to Colion International on WhatsApp (+971 50 766 8536), by email to info@colioninternational.com, or through the contact form. The sales desk replies with price, stock and delivery date, usually within business hours the same day.', true),
      faq('Does Colion International sell to individuals or only businesses?', 'Colion International is a wholesale supplier focused on businesses, resellers and projects, but it also sells single units to individual customers from its Deira branches and by delivery.', true),
      faq('Is there a minimum order quantity?', 'No. Colion International supplies single units as well as bulk quantities. Wholesale pricing improves with volume, and resellers buying regularly can ask for trade terms.'),
      faq('What payment methods does Colion International accept?', 'Colion International accepts cash, credit and debit cards, and bank transfer. Established corporate customers can apply for credit terms.'),
      faq('Do you provide VAT invoices?', 'Yes. Every Colion International sale comes with a UAE VAT invoice listing the model and, on request, serial numbers for your asset register.'),
    ],
  },
  {
    id: 'delivery',
    title: 'Delivery & export',
    blurb: 'Delivery times across the UAE and shipping abroad.',
    items: [
      faq('How fast does Colion International deliver in the UAE?', 'For stock items, Colion International delivers the same or next working day in Dubai and Sharjah, next working day to Ajman and Umm Al Quwain, and within one to two working days to Abu Dhabi, Ras Al Khaimah and Fujairah.', true),
      faq('Does Colion International export IT hardware?', 'Yes. Colion International exports IT hardware from Dubai to customers in the GCC, the wider Middle East and Africa, and prepares the commercial invoice, packing list and other export documentation.', true),
      faq('Can I collect my order from your branch?', 'Yes. Orders can be collected from either Colion International branch in Deira, Dubai — Al Sabkha or Al Dhagaya — Monday to Saturday, 9 AM to 7 PM.'),
    ],
  },
  {
    id: 'warranty',
    title: 'Warranty & genuine products',
    blurb: 'Manufacturer warranty, authenticity and returns.',
    items: [
      faq('Are Colion International products genuine?', 'Yes. Colion International supplies genuine products sourced through the manufacturers\' regional distribution channels, in sealed packaging with serial numbers you can verify on the manufacturer\'s website.', true),
      faq('Do products come with a warranty valid in the UAE?', 'Yes. Products supplied by Colion International carry the manufacturer\'s warranty valid in the UAE, typically one to three years depending on the brand and model. Extended warranty is available on many business models.'),
      faq('How do I make a warranty claim?', 'Contact Colion International with the invoice and serial number. We help raise the claim with the manufacturer or its authorised service centre and arrange collection or replacement where the brand allows.'),
    ],
  },
  {
    id: 'services',
    title: 'Installation, AMC & support',
    blurb: 'Free installation, maintenance contracts and support.',
    items: [
      faq('Is installation really free?', 'Colion International installs the hardware it supplies in Dubai free of charge — printers on the network, computers at the desk, and standard server and network setups. Complex projects such as structured cabling are quoted separately.', true),
      faq('What is an IT AMC?', 'An IT annual maintenance contract (AMC) is a yearly agreement under which Colion International services and supports your printers, computers, servers and network for a fixed fee, with agreed response times and preventive maintenance visits.'),
      faq('Do you offer 24/7 support?', 'Colion International offers a support line outside office hours for urgent faults on business-critical systems, such as a server or network outage, for AMC customers and on request.'),
    ],
  },
];
