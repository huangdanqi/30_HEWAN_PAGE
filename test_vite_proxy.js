import axios from 'axios';

async function testViteProxy() {
  try {
    console.log('Testing Vite proxy...');
    
    // Test the toy-production-hyphen endpoint through Vite proxy
    console.log('\n1. Testing toy-production-hyphen endpoint through Vite proxy...');
    const response = await axios.get('http://127.0.0.1:2830/api/toy-production-hyphen');
    console.log('✅ Vite proxy response:');
    console.log('   - Status:', response.status);
    console.log('   - Total records:', response.data.pagination?.total || 'N/A');
    console.log('   - Data count:', response.data.data?.length || 0);
    
    if (response.data.data && response.data.data.length > 0) {
      console.log('\n   Sample data:');
      response.data.data.slice(0, 3).forEach((item, index) => {
        console.log(`     ${index + 1}. ${item.productName} - ${item.manufacturer} - ¥${item.unitPrice}`);
      });
    }
    
    console.log('\n🎉 Vite proxy test passed!');
    
  } catch (error) {
    console.error('❌ Error testing Vite proxy:', error.message);
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    }
  }
}

testViteProxy(); 