const https = require('https');

const BASE_URL = 'https://elite-glam-mobile-app-7qv7.onrender.com';

async function testEndpoint(endpoint) {
  return new Promise((resolve, reject) => {
    console.log(`Testing ${endpoint}...`);
    
    const req = https.get(BASE_URL + endpoint, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: json
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: data
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    req.end();
  });
}

async function runTests() {
  try {
    console.log('Starting API tests...');
    
    // Test 1: Base URL
    const baseTest = await testEndpoint('/');
    console.log('\n--- Base URL Test ---');
    console.log('Status:', baseTest.status);
    console.log('Headers:', baseTest.headers);
    
    // Test 2: /api/test endpoint
    const apiTest = await testEndpoint('/api/test');
    console.log('\n--- /api/test Endpoint Test ---');
    console.log('Status:', apiTest.status);
    console.log('Data:', apiTest.data);
    
    // Test 3: /api/products endpoint
    const productsTest = await testEndpoint('/api/products');
    console.log('\n--- /api/products Endpoint Test ---');
    console.log('Status:', productsTest.status);
    console.log('Data:', productsTest.data);
    
    console.log('\n--- Test Summary ---');
    console.log(`Base URL (${BASE_URL}/): ${baseTest.status}`);
    console.log(`/api/test: ${apiTest.status}`);
    console.log(`/api/products: ${productsTest.status}`);
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

runTests();
