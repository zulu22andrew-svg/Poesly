import fs from 'fs';
import path from 'path';

async function test() {
  const formData = new FormData();
  const videoBuffer = fs.readFileSync('test_assets/test.mp4');
  formData.append('video', new Blob([videoBuffer], { type: 'video/mp4' }), 'test.mp4');
  
  console.log("Uploading...");
  try {
    const res = await fetch('http://localhost:3000/api/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    console.log("Upload response:", data);
    
    if (!data.success) {
      console.log("Upload failed!");
      return;
    }
    
    console.log("Processing...");
    const processRes = await fetch('http://localhost:3000/api/process', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        referenceId: data.referenceId,
        filename: data.filename
      })
    });
    
    const processData = await processRes.json();
    console.log("Process response:", processData);
  } catch (e) {
    console.error("Test error:", e);
  }
}

test();
