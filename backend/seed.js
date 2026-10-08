const mongoose = require('mongoose');
const Room = require('./models/Room');
const Booking = require('./models/Booking');

const rooms = [
  {
    roomNo: '101',
    type: 'Deluxe',
    name: 'Deluxe Garden Sanctuary',
    description: 'Private terrace facing morning mist gardens. Outfitted with custom Hinoki wood finishes, deep acoustics, and botanical bath infusions.',
    price: 4500,
    maxGuests: 2,
    size: '48 m²',
    floor: 'Ground Level',
    amenities: ['High-speed WiFi', 'Acoustic AC', 'King Plush Bed', 'Artisan Breakfast'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCkWn-95lYHBjTzpxeWyUt1PR5qDBmLjwHo3NrlXr7f-4ZKqeIUk866Hn9CFV9toFHI-927uMRH9HTwaDMe7eqZvWHx1Bc13IrAEO74cld4wRkYPfbtFFh7qevYxt74yiYvDo_5fAxV4-tJ0ciTg-rreAX35pWYj4LNqJ9br1AWhuif1gHwUM9g-_NOVe_1ZDzbRLKeRk7DAJzVYSONpQM_Mau8ftkgggbtsYUGJfE',
    status: 'available'
  },
  {
    roomNo: '102',
    type: 'Executive',
    name: 'Executive Double Haven',
    description: 'Engineered for seamless remote productivity and absolute rest. Includes soundproof glazing, ergonomic lounge, and bespoke espresso bar.',
    price: 3800,
    maxGuests: 2,
    size: '42 m²',
    floor: 'Level 1',
    amenities: ['Dual Queens', 'Ergonomic Desk', 'Nespresso Bar', 'Smart OLED'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAFySom0Wh9zLr6-JOiixGMj0YZ-d50sAZq6nCtIJpWzMcTr99ANGG-pYsrjD_YMO0Ths5glhtW1apDRlDC5a9VcOe0L-0_uC02bJBazrdLcoUgbJxDi0PN0Bs6y8FrGTGSWEyG1LyHEySpKhV2_W26j2_11ibdrTc1ygJqPlB9E4mi9FDVQoBQLRbCPzwZSCw5TBrcq38mXZT5pm7rOtkC8xYI1j9tibjDGEFUslk',
    status: 'available'
  },
  {
    roomNo: '103',
    type: 'Presidential',
    name: 'Presidential Alpine Suite',
    description: 'Our flagship alpine sanctuary. Multi-room layout, central hearth, private thermal jacuzzi, and dedicated private butler service.',
    price: 8200,
    maxGuests: 4,
    size: '95 m²',
    floor: 'Top Alpine Wing',
    amenities: ['Thermal Tub', 'Granite Fireplace', 'Alpine Panorama', 'Sommelier Bar'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA-oTPip6FXJqg8F7GPqsh2Cjh8nTpYIqv_t4DLKcGJ9Or0S8JAHUftHWqdTMqkzf8KVnJ8x91WB4E6bt0vr-M2HB0ZRoC1ilGWZiN_a4WrPX1gI09zvuxBkLAOBkhUsxnIASZNMOjXCYDF7dC39_tcJbleemptGD63vXSoYtESy-zwZyE-qKs50-qK1JHjZoKQPMNj5ZLp8ONaKhxbfuoijmbV0GaAIzCpVpSzMO4',
    status: 'available'
  },
  {
    roomNo: '201',
    type: 'Studio',
    name: 'Minimalist Solo Studio',
    description: 'A compact haven designed for contemplation, reading, and digital detox. Uninterrupted forest canopy vistas and rainfall shower.',
    price: 2800,
    maxGuests: 1,
    size: '32 m²',
    floor: 'Level 2',
    amenities: ['Single Queen', 'Forest View', 'Starlink WiFi', 'Matcha Service'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBUBCw5qIIfuf7ex8Q6AWq3cWsUIMS9MFbR1ivPrllhRGtmJ-7QrAFHGQ3lmng37xd4-YFLa3mk3YOLVO5W57z69IZ6JEprGjY4ueVsX4PlGC1GBztgPJbzpDE9v9xDcF9DerGZv8hEYWWbmozvOufKBCT9vqyznYJIbuwcH9WzSBeA7AflmzdBfEOdPT34sr6hCgi02kd4HBCFSaFxiZN8gsOyf27BBHqmJuYhQw8',
    status: 'available'
  },
  {
    roomNo: '202',
    type: 'Deluxe',
    name: 'Deluxe Courtyard Suite',
    description: 'Featuring a private garden terrace and an outdoor freestanding soaking tub carved from solid volcanic river stone.',
    price: 4800,
    maxGuests: 2,
    size: '52 m²',
    floor: 'Level 2',
    amenities: ['Stone Soaking Tub', 'Private Terrace', 'Plush King Bed', 'Organic Minibar'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDNaDxctvnSEqO_GBWd2wdx3rWPNe3Jot6xBntkSFPH9hz32zyDUW9_PJfhBdMohp6H1jvSU6h02A-yN1nFThKxIpApPL5sHHKSv48W-twXOfX0_FFAOfoV7kcjvpilhd078-ZeDlqbHanrfw5TCQ2OluKMMGqM3tuaT4Y5mhms2azQoux95aysiW_1nQ-Cwxt9TiY0zSyJ6S_Hfb0N6m5aCrvf3l0Gu3mp2AjtvgA',
    status: 'available'
  },
  {
    roomNo: '203',
    type: 'Penthouse',
    name: 'Kyoto Penthouse Suite',
    description: 'Spectacular rooftop residence with personal aromatic cedar onsen, dedicated butler pantry, and unobstructed panoramic skyline outlook.',
    price: 9500,
    maxGuests: 4,
    size: '110 m²',
    floor: 'Penthouse Level',
    amenities: ['Private Cedar Onsen', 'Skyline Panorama', 'Butler Service', 'Tea Master Setup'],
    image: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCjrTy-WbY6F5Nv60ZX8J0r6m0mD7LEfERWS8aYJ8SFLxA19icNum_6XlhWcLX3CSINhJtLeCT1magRPQE-CuCT4vQXmfrsCfYT85so0q-X-Gv4dZ-UIIxdX4N5uydPMyrsMQ_LQFduwtcmi4YHrPEADyXvhf5brH1zgd063GtmdqrNYpPo9NcqKmWkj5Za4-9BVTx3ANNidNy_VrPlI4XP7d5DM5Ho8x5yZCShoJ8',
    status: 'available'
  }
];

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/staynest');
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await Room.deleteMany({});
    await Booking.deleteMany({});
    console.log('Cleared existing rooms and bookings.');

    // Insert rooms
    const createdRooms = await Room.insertMany(rooms);
    console.log(`Seeded ${createdRooms.length} rooms.`);

    // Insert sample bookings
    const now = new Date();
    const sampleBookings = [
      {
        bookingId: 'STN-102938',
        room: createdRooms[0]._id,
        guestName: 'Rahul Sharma',
        email: 'rahul.sharma@example.com',
        phone: '+91 98765 43210',
        checkIn: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 7),
        checkOut: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 10),
        guests: 2,
        totalAmount: 15120,
        paymentStatus: 'paid',
        paymentMethod: 'Via Visa UPI • 8920',
        transactionId: 'TXN20261002123456',
        status: 'confirmed',
        specialRequests: 'Late check-in around 8 PM please'
      },
      {
        bookingId: 'STN-098412',
        room: createdRooms[1]._id,
        guestName: 'Elena Rostova',
        email: 'elena.rostova@geneva.ch',
        phone: '+41 79 123 4567',
        checkIn: new Date(now.getFullYear(), now.getMonth() - 2, 12),
        checkOut: new Date(now.getFullYear(), now.getMonth() - 2, 15),
        guests: 1,
        totalAmount: 12768,
        paymentStatus: 'paid',
        paymentMethod: 'Card ending 4410',
        transactionId: 'TXN20260812789012',
        status: 'completed'
      },
      {
        bookingId: 'STN-087120',
        room: createdRooms[3]._id,
        guestName: 'Marcus Vance',
        email: 'm.vance@archdesign.co.uk',
        phone: '+44 20 7946 0958',
        checkIn: new Date(now.getFullYear(), now.getMonth() - 2, 1),
        checkOut: new Date(now.getFullYear(), now.getMonth() - 2, 3),
        guests: 1,
        totalAmount: 6272,
        paymentStatus: 'refunded',
        paymentMethod: 'Card ending 4410',
        transactionId: 'TXN20260801345678',
        status: 'cancelled'
      }
    ];

    await Booking.create(sampleBookings);
    console.log(`Seeded ${sampleBookings.length} sample bookings.`);
    console.log('\n✅ Database seeded successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Seeding error:', err.message);
    process.exit(1);
  }
};

require('dotenv').config();
seedDatabase();
