import { img } from './helpers.mjs';

/**
 * The launch gallery: the owner's own photographs and reels (October 2026),
 * imported by scripts/import-client-media.mjs. Captions describe what is in
 * the frame and nothing more — these are the site's strongest proof that the
 * stock is real, so they must not over-claim.
 *
 * New items are added from the admin's Gallery tab, which uploads to
 * Cloudinary; these local files stay valid alongside them.
 */
const DATE = '2026-10-14';

const photo = (n, title, caption, tags, extra = {}) => ({
  id: `photo-${n}`,
  kind: 'image',
  image: img(`/images/gallery/photo-${n}.webp`, caption),
  video: '',
  duration: 0,
  title,
  caption,
  tags,
  category: '',
  brand: '',
  service: '',
  location: '',
  instagramUrl: '',
  date: DATE,
  featured: false,
  ...extra,
});

const reel = (n, title, caption, tags, duration, extra = {}) => ({
  id: `reel-${n}`,
  kind: 'reel',
  image: img(`/images/gallery/reel-${n}.webp`, caption),
  video: `/videos/reels/reel-${n}.mp4`,
  duration,
  title,
  caption,
  tags,
  category: '',
  brand: '',
  service: '',
  location: '',
  instagramUrl: '',
  date: DATE,
  featured: true,
  ...extra,
});

export const gallery = [
  reel('03', 'Deliveries leaving the Deira branch', 'Customer orders loaded at the Colion International branch in Deira for delivery across Dubai.', ['delivery', 'showroom', 'operations'], 15, { location: 'dubai' }),
  reel('01', 'Inside the Colion showroom', 'A walk through the Colion International showroom: laptops, tablets, printers, networking and accessories on the shelves.', ['showroom', 'products', 'team'], 56),
  reel('02', 'Epson stock out for delivery', 'Cartons of Epson printers loaded onto a delivery truck for a customer order.', ['delivery', 'operations'], 31, { brand: 'epson', category: 'printers' }),
  reel('05', 'Canon stock arriving', 'A pallet of Canon printers and copiers unloaded into the showroom.', ['warehouse', 'operations'], 21, { brand: 'canon', category: 'printers' }),
  reel('04', 'Night delivery of Canon printers', 'Canon printers moved by trolley for an evening delivery.', ['delivery', 'operations'], 22, { brand: 'canon', category: 'printers' }),
  reel('06', 'Unloading a pallet', 'A wrapped pallet of IT hardware being unloaded.', ['warehouse', 'operations'], 5),

  photo('04', 'The Colion International branch, Deira', 'The Colion International storefront in Deira, Dubai, with stock visible through the windows.', ['showroom'], { featured: true, location: 'dubai' }),
  photo('25', 'Showroom shelves', 'Printers, ink and accessories stocked floor to ceiling in the Colion International showroom.', ['showroom', 'products'], { featured: true }),
  photo('28', 'Sales desk and Lenovo stock', 'The sales desk inside the showroom, with Lenovo, Epson and HP stock behind it.', ['showroom', 'products'], { brand: 'lenovo' }),
  photo('01', 'HP Color LaserJet Pro MFP stock', 'HP Color LaserJet Pro multifunction printers in stock.', ['products', 'warehouse'], { brand: 'hp', category: 'printers', featured: true }),
  photo('02', 'HP colour laser printers', 'Boxed HP colour laser printers ready for dispatch.', ['products', 'warehouse'], { brand: 'hp', category: 'printers' }),
  photo('03', 'HP LaserJet stock', 'A wall of HP LaserJet printers in the stock room.', ['products', 'warehouse'], { brand: 'hp', category: 'printers' }),
  photo('05', 'HP laptops in stock', 'HP 15.6-inch laptops stacked beside Epson ink-tank printers.', ['products', 'warehouse'], { brand: 'hp', category: 'desktops' }),
  photo('09', 'HP all-in-one PCs', 'HP Series 5 27-inch all-in-one PCs in stock.', ['products', 'warehouse'], { brand: 'hp', category: 'all-in-one-pcs', featured: true }),
  photo('22', 'HP DeskJet printers', 'HP DeskJet printers stacked for wholesale orders.', ['products', 'warehouse'], { brand: 'hp', category: 'printers' }),
  photo('18', 'HP LaserJet Pro boxes', 'HP LaserJet Pro printers ready for delivery.', ['products', 'warehouse'], { brand: 'hp', category: 'printers' }),
  photo('14', 'HP stock', 'Mixed HP stock in the warehouse.', ['warehouse'], { brand: 'hp' }),
  photo('16', 'HP monitors and desktops', 'HP monitors and desktop computers in their cartons.', ['products', 'warehouse'], { brand: 'hp', category: 'desktops' }),
  photo('08', 'HP printer cartons', 'HP printers stacked in the stock room.', ['warehouse'], { brand: 'hp', category: 'printers' }),
  photo('13', 'Canon copiers in stock', 'Canon office copiers and printers in the stock room.', ['products', 'warehouse'], { brand: 'canon', category: 'printers', featured: true }),
  photo('10', 'Canon printer stock', 'Canon laser printers stacked for wholesale customers.', ['products', 'warehouse'], { brand: 'canon', category: 'printers' }),
  photo('11', 'Canon laser printers', 'A column of Canon laser printers in stock.', ['products', 'warehouse'], { brand: 'canon', category: 'printers' }),
  photo('24', 'Canon i-SENSYS printers', 'Canon i-SENSYS printers in the showroom.', ['products', 'showroom'], { brand: 'canon', category: 'printers' }),
  photo('19', 'Epson printers in stock', 'Epson printers stacked high in the showroom.', ['products', 'showroom'], { brand: 'epson', category: 'printers', featured: true }),
  photo('29', 'Epson EcoTank stock', 'Epson EcoTank ink-tank printers in stock.', ['products', 'warehouse'], { brand: 'epson', category: 'printers' }),
  photo('32', 'Epson printer wall', 'Epson printers ready for wholesale orders.', ['products', 'warehouse'], { brand: 'epson', category: 'printers' }),
  photo('23', 'Printer stock on the shop floor', 'Epson and Canon printers on the showroom floor.', ['products', 'showroom'], { category: 'printers' }),
  photo('34', 'New stock: Epson CO-W01 projector', 'New stock announcement: the Epson CO-W01 WXGA projector, 3,000 lumens.', ['products'], { brand: 'epson', category: 'projectors', featured: true }),
  photo('30', 'Order packed for a customer', 'A large order packed and labelled for a Colion International customer.', ['delivery', 'operations']),
  photo('33', 'Orders staged for delivery', 'Customer orders staged outside the branch for delivery.', ['delivery', 'operations'], { location: 'dubai' }),
  photo('31', 'Bulk order cartons', 'A bulk order of boxed hardware ready to ship.', ['warehouse', 'operations']),
  photo('21', 'Palletised stock', 'Palletised stock in the warehouse.', ['warehouse']),
  photo('06', 'Stock corridor', 'A corridor of boxed printers and computers in the stock room.', ['warehouse']),
  photo('07', 'Warehouse stock', 'Cartons of IT hardware in the warehouse.', ['warehouse']),
  photo('12', 'Boxed hardware', 'Boxed IT hardware stacked in the stock room.', ['warehouse']),
  photo('15', 'Stock room', 'Cartons stacked to the ceiling in the stock room.', ['warehouse']),
  photo('17', 'Incoming stock', 'Incoming stock waiting to be shelved.', ['warehouse']),
  photo('20', 'Stock room aisle', 'An aisle between stacks of boxed hardware.', ['warehouse']),
  photo('26', 'Printer stock aisle', 'Printers stacked along a stock-room aisle.', ['warehouse'], { category: 'printers' }),
  photo('27', 'Wall of cartons', 'A wall of cartons ready for wholesale customers.', ['warehouse']),
];
