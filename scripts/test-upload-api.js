const fs = require('fs');
const path = require('path');

async function test() {
  // Create a minimal test file (1x1 pixel PNG)
  const testFilePath = path.join(__dirname, 'test-img.png');
  
  // Read the test file
  const fileBuffer = fs.readFileSync(testFilePath);
  
  // Create form data
  const formData = new FormData();
  const blob = new Blob([fileBuffer], { type: 'image/png' });
  formData.append('file', blob, 'test-img.png');
  formData.append('path', `test/test-${Date.now()}.png`);
  formData.append('bucket', 'product-images');
  
  try {
    const res = await fetch('http://localhost:3000/api/upload', { method: 'POST', body: formData });
    const json = await res.json();
    console.log('Status:', res.status);
    console.log('Response:', JSON.stringify(json, null, 2));
    if (res.ok) {
      console.log('SUCCESS: Upload works!');
    } else {
      console.log('FAILED:', json.error);
    }
  } catch (err) {
    console.error('Error:', err.message);
  }
}

test();
