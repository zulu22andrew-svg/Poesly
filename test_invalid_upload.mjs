import fs from 'fs';
import path from 'path';

async function test() {
  const formData = new FormData();
  fs.writeFileSync('test_assets/test.txt', 'Hello world');
  const buffer = fs.readFileSync('test_assets/test.txt');
  formData.append('video', new Blob([buffer], { type: 'text/plain' }), 'test.txt');
  
  console.log("Uploading invalid file...");
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Upload response:", data);
  } catch (e) {
    console.error("Test error:", e);
  }
}

test();
