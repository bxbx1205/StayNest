const http = require('http');

const request = (method, path, body = null) => {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('--- STARTING EDGE CASE TESTS ---');
    
    // 1. Get a room to book
    console.log('\\n1. Fetching available rooms...');
    const roomsRes = await request('GET', '/api/rooms');
    const room = roomsRes.body.data[0];
    console.log(`Selected Room: ${room.roomNo} (${room.name})`);
    
    // 2. Book the room for a specific date range
    console.log('\\n2. Booking the room from Nov 10 to Nov 15...');
    const book1Res = await request('POST', '/api/bookings', {
      room: room._id,
      guestName: 'Test Guest 1',
      email: 'test1@example.com',
      phone: '1234567890',
      checkIn: '2026-11-10',
      checkOut: '2026-11-15',
      guests: 1
    });
    console.log('Booking 1 Status:', book1Res.status);
    console.log('Booking 1 Response:', book1Res.body.success ? 'Success' : book1Res.body.message);
    
    // 3. Try to double book the SAME room for overlapping dates (Nov 12 to Nov 18)
    console.log('\\n3. Attempting DOUBLE BOOKING for overlapping dates (Nov 12 to Nov 18)...');
    const book2Res = await request('POST', '/api/bookings', {
      room: room._id,
      guestName: 'Test Guest 2',
      email: 'test2@example.com',
      phone: '0987654321',
      checkIn: '2026-11-12',
      checkOut: '2026-11-18',
      guests: 1
    });
    console.log('Booking 2 Status (Expected 409):', book2Res.status);
    console.log('Booking 2 Response:', book2Res.body.message);
    
    // 4. Try to cancel a non-existent booking
    console.log('\\n4. Attempting to cancel a non-existent booking...');
    const fakeId = '5f8d0d55b54764421b7156d9'; // valid mongo ObjectId but doesn't exist
    const cancelFakeRes = await request('PUT', `/api/bookings/${fakeId}/cancel`);
    console.log('Cancel Fake Status (Expected 404):', cancelFakeRes.status);
    console.log('Cancel Fake Response:', cancelFakeRes.body.message);
    
    // 5. Try to cancel the booking created in step 2 TWICE
    console.log('\\n5. Cancelling the valid booking...');
    const validBookingId = book1Res.body.data._id;
    const cancel1Res = await request('PUT', `/api/bookings/${validBookingId}/cancel`);
    console.log('First Cancel Status (Expected 200):', cancel1Res.status);
    console.log('First Cancel Response:', cancel1Res.body.message);
    
    console.log('\\n6. Attempting to cancel the SAME booking again...');
    const cancel2Res = await request('PUT', `/api/bookings/${validBookingId}/cancel`);
    console.log('Second Cancel Status (Expected 400):', cancel2Res.status);
    console.log('Second Cancel Response:', cancel2Res.body.message);
    
    console.log('\\n--- TESTS COMPLETED ---');
  } catch (err) {
    console.error('Test Failed:', err);
  }
};

runTests();
