import axios from 'axios';

async function testAPI() {
  try {
    console.log('Testing API endpoints...');
    
    // Test health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get('http://127.0.0.1:2829/api/health');
    console.log('✅ Health endpoint:', healthResponse.data);
    
    // Test toy-production-hyphen endpoint
    console.log('\n2. Testing toy-production-hyphen endpoint...');
    const toyResponse = await axios.get('http://127.0.0.1:2829/api/toy-production-hyphen');
    console.log('✅ Toy production endpoint response:');
    console.log('   - Total records:', toyResponse.data.pagination?.total || 'N/A');
    console.log('   - Current page:', toyResponse.data.pagination?.current || 'N/A');
    console.log('   - Page size:', toyResponse.data.pagination?.pageSize || 'N/A');
    console.log('   - Data count:', toyResponse.data.data?.length || 0);
    
    if (toyResponse.data.data && toyResponse.data.data.length > 0) {
      console.log('\n   Sample data:');
      toyResponse.data.data.slice(0, 3).forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.productName} - ${item.manufacturer} - ¥${item.unitPrice}`);
      });
    }
    
    console.log('\n🎉 All tests passed!');
    
  } catch (error) {
    console.error('❌ Error testing API:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testAPI(); 