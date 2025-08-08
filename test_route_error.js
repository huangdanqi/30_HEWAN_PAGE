import axios from 'axios';

async function testRouteError() {
  try {
    console.log('Testing route error...');
    
    // Test the direct API endpoint
    console.log('\n1. Testing direct API endpoint...');
    const directResponse = await axios.get('http://127.0.0.1:2829/api/product-list');
    console.log('✅ Direct API response status:', directResponse.status);
    console.log('✅ Direct API data count:', directResponse.data.length || 0);
    
    // Test the Vite proxy endpoint
    console.log('\n2. Testing Vite proxy endpoint...');
    const proxyResponse = await axios.get('http://[::1]:2830/api/product-list');
    console.log('✅ Proxy API response status:', proxyResponse.status);
    console.log('✅ Proxy API data count:', proxyResponse.data.length || 0);
    
  } catch (error) {
    console.error('❌ Error details:');
    console.error('   Message:', error.message);
    console.error('   Status:', error.response?.status);
    console.error('   Status Text:', error.response?.statusText);
    console.error('   Data:', error.response?.data);
    console.error('   Headers:', error.response?.headers);
  }
}

testRouteError(); 