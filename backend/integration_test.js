const http = require('http');

const API_URL = 'http://localhost:5000/api/v1';

async function request(endpoint, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${API_URL}${endpoint}`);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);

    if (data) {
      req.write(JSON.stringify(data));
    }
    req.end();
  });
}

async function runTests() {
  console.log('Starting Integration Tests...');
  const ts = Date.now();
  
  // 1. Register Admin
  console.log('Registering Admin...');
  let adminRes = await request('/auth/register', 'POST', { name: `Admin ${ts}`, email: `admin${ts}@test.com`, password: 'password', role: 'Administrator' });
  let adminLogin = await request('/auth/login', 'POST', { email: `admin${ts}@test.com`, password: 'password' });
  const adminToken = adminLogin.data.token;
  
  // 2. Register Citizen & Report Emergency
  console.log('Registering Citizen...');
  let citizenRes = await request('/auth/register', 'POST', { name: `Citizen ${ts}`, email: `citizen${ts}@test.com`, password: 'password', role: 'Citizen' });
  let citizenLogin = await request('/auth/login', 'POST', { email: `citizen${ts}@test.com`, password: 'password' });
  const citizenToken = citizenLogin.data.token;
  
  console.log('Reporting Emergency...');
  let emRes = await request('/emergencies', 'POST', { category: 'Fire', location: 'Downtown', description: 'Big fire' }, citizenToken);
  const emergencyId = emRes.data.emergency._id;
  
  // 3. Admin Verifies Emergency
  console.log('Admin Verifying Emergency...');
  await request(`/emergencies/${emergencyId}/status`, 'PATCH', { status: 'Verified' }, adminToken);
  
  // 4. Register Volunteer & Create Profile
  console.log('Registering Volunteer...');
  let volRes = await request('/auth/register', 'POST', { name: `Vol ${ts}`, email: `vol${ts}@test.com`, password: 'password', role: 'Volunteer' });
  let volLogin = await request('/auth/login', 'POST', { email: `vol${ts}@test.com`, password: 'password' });
  const volToken = volLogin.data.token;
  
  console.log('Creating Volunteer Profile...');
  await request('/volunteers', 'POST', { skills: ['First Aid'], area: 'Downtown', availability: true }, volToken);
  let volProfileRes = await request('/volunteers/me', 'GET', null, volToken);
  const volunteerId = volProfileRes.data.volunteer._id;
  
  // 5. Admin Assigns Volunteer
  console.log('Admin Assigning Volunteer...');
  let assignRes = await request('/assignments', 'POST', { emergencyId, volunteerId }, adminToken);
  const assignmentId = assignRes.data.assignment._id;
  
  // 6. Volunteer Starts Task
  console.log('Volunteer starting task...');
  await request(`/assignments/${assignmentId}/status`, 'PATCH', { status: 'In Progress' }, volToken);
  
  // 7. Register Donor & Pledge
  console.log('Registering Donor...');
  let donorRes = await request('/auth/register', 'POST', { name: `Donor ${ts}`, email: `donor${ts}@test.com`, password: 'password', role: 'Donor' });
  let donorLogin = await request('/auth/login', 'POST', { email: `donor${ts}@test.com`, password: 'password' });
  const donorToken = donorLogin.data.token;
  
  console.log('Donor Pledging...');
  await request('/donations', 'POST', { emergencyId, donationType: 'Food', quantity: 100 }, donorToken);
  
  // 8. Admin check pledges
  let adminPledgesRes = await request('/donations/all', 'GET', null, adminToken);
  
  console.log('All tests passed successfully!');
}

runTests().catch(console.error);
