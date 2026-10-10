import { execSync } from 'child_process';
import FormData from 'form-data';
import http from 'http';
import fs from 'fs';

async function testFullRankedPipeline() {
  console.log('1. Assembling diverse multi-condition video from test frames...');
  // Assemble our 7 distinct verification frames into a 3.5s video at 2fps
  // 1: sharp smiling, 2: sharp neutral, 3: sharp eyes closed, 4: mild blur, 5: medium blur, 6: heavy blur, 7: no person
  // Create a concat text file
  const concatList = [
    "file 'verification_frames/01_sharp_smiling.jpg'\nduration 1",
    "file 'verification_frames/02_sharp_neutral.jpg'\nduration 1",
    "file 'verification_frames/03_sharp_eyes_closed.jpg'\nduration 1",
    "file 'verification_frames/04_blur_mild.jpg'\nduration 1",
    "file 'verification_frames/05_blur_medium.jpg'\nduration 1",
    "file 'verification_frames/06_blur_heavy.jpg'\nduration 1",
    "file 'verification_frames/07_no_person.jpg'\nduration 1",
    "file 'verification_frames/07_no_person.jpg'"
  ].join('\n');
  fs.writeFileSync('test_assets/concat.txt', concatList);

  execSync('ffmpeg -y -f concat -safe 0 -i test_assets/concat.txt -vsync vfr -pix_fmt yuv420p test_assets/full_ranking_test.mp4', { stdio: 'pipe' });
  console.log('Created test_assets/full_ranking_test.mp4 successfully');

  console.log('2. Uploading video to /api/upload...');
  const form = new FormData();
  form.append('video', fs.createReadStream('test_assets/full_ranking_test.mp4'));

  const uploadReq = http.request({
    host: 'localhost',
    port: 3000,
    path: '/api/upload',
    method: 'POST',
    headers: form.getHeaders()
  }, (res) => {
    let body = '';
    res.on('data', (chunk) => body += chunk);
    res.on('end', () => {
      const uploadJson = JSON.parse(body);
      console.log('Upload success! Reference ID:', uploadJson.referenceId);

      console.log('3. Triggering /api/process (Pose -> Face -> Sharpness -> Stage 8 Composite Quality Ranking)...');
      const processData = JSON.stringify({
        referenceId: uploadJson.referenceId,
        filename: uploadJson.filename
      });

      const processReq = http.request({
        host: 'localhost',
        port: 3000,
        path: '/api/process',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(processData)
        }
      }, (pres) => {
        let pbody = '';
        pres.on('data', (chunk) => pbody += chunk);
        pres.on('end', () => {
          const pjson = JSON.parse(pbody);
          console.log('\n================================================================');
          console.log('STAGE 8 API RESPONSE SUMMARY:');
          console.log('Total extracted frames:', pjson.frameCount);
          console.log('Ranked frames leaderboard (Sorted Best to Worst):');
          console.log('================================================================');

          pjson.frames.forEach((f: any) => {
            console.log(
              `Rank #${f.quality?.rank}: ${f.id} (${f.timestamp}s) ` +
              `=> Composite Score: ${f.quality?.score}/100 [${f.quality?.rating?.toUpperCase()}] ` +
              `| Sharpness: ${f.sharpness?.score}% [${f.sharpness?.level}] ` +
              `| Eyes: ${f.face?.eyes?.state || 'no face'} ` +
              `| Exp: ${f.face?.expression?.type || 'none'} ` +
              `| Pose: ${f.pose?.keyAngles?.posture || (f.pose?.detected ? 'detected' : 'none')}`
            );
            if (f.quality?.breakdown?.penalties?.length) {
              console.log(`   Penalties: ${f.quality.breakdown.penalties.join(', ')}`);
            }
          });
        });
      });

      processReq.write(processData);
      processReq.end();
    });
  });

  form.pipe(uploadReq);
}

testFullRankedPipeline();
