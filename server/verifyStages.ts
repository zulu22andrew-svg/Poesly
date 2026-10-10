import { analyzeFrame, computeSharpness, rankFrames, FrameAnalysisResult } from './visionAnalyzer.ts';

async function verifyAll() {
  console.log('================================================================');
  console.log('PART 1 & STAGE 8 VERIFICATION: POSE, FACE, SHARPNESS & COMPOSITE QUALITY');
  console.log('================================================================\n');

  const testCases = [
    { name: '01. Sharp Person Smiling (Eyes Open, Ideal Stance)', file: 'test_assets/verification_frames/01_sharp_smiling.jpg' },
    { name: '02. Sharp Person Neutral (Eyes Open, Good Stance)', file: 'test_assets/verification_frames/02_sharp_neutral.jpg' },
    { name: '03. Sharp Person Blinking (Eyes Closed)', file: 'test_assets/verification_frames/03_sharp_eyes_closed.jpg' },
    { name: '04. Mild Motion Blur (Soft Face)', file: 'test_assets/verification_frames/04_blur_mild.jpg' },
    { name: '05. Out of Focus (Medium Blur)', file: 'test_assets/verification_frames/05_blur_medium.jpg' },
    { name: '06. Extreme Blur (Heavy Motion)', file: 'test_assets/verification_frames/06_blur_heavy.jpg' },
    { name: '07. No Person / Blank Wall', file: 'test_assets/verification_frames/07_no_person.jpg' }
  ];

  const results: FrameAnalysisResult[] = [];

  for (let i = 0; i < testCases.length; i++) {
    const tc = testCases[i];
    const res = await analyzeFrame(tc.file, `frame-${i+1}`, `/uploads/test/${i+1}.jpg`, i);
    results.push(res);

    console.log(`[Frame ${i+1}] ${tc.name}`);
    console.log(`  • Pose: detected=${res.pose.detected}, confidence=${res.pose.confidence}, posture=${res.pose.keyAngles?.posture || 'none'}`);
    console.log(`  • Face: detected=${res.face.detected}, confidence=${res.face.confidence}`);
    if (res.face.detected) {
      console.log(`    - Eyes: ${res.face.eyes.state} (L:${res.face.eyes.leftScore}, R:${res.face.eyes.rightScore})`);
      console.log(`    - Expression: ${res.face.expression.type} (smileScore: ${res.face.expression.smileScore})`);
      console.log(`    - Orientation: ${res.face.angle.orientation}`);
    } else {
      console.log(`    - Reason: ${res.face.reason}`);
    }
    console.log(`  • Sharpness: ${res.sharpness.score}/100 (${res.sharpness.level}, var=${res.sharpness.variance}, target=${res.sharpness.target})`);
    console.log(`  • Quality: ${res.quality?.score}/100 (${res.quality?.rating})`);
    console.log(`    - Breakdown: Sharpness=${res.quality?.breakdown.sharpnessScore}, Face=${res.quality?.breakdown.faceScore}, Pose=${res.quality?.breakdown.poseScore}`);
    if (res.quality?.breakdown.penalties.length) {
      console.log(`    - Penalties: ${res.quality.breakdown.penalties.join(' | ')}`);
    }
    console.log('');
  }

  console.log('================================================================');
  console.log('FINAL STAGE 8 RANKED LEADERBOARD (BEST TO WORST):');
  console.log('================================================================');
  const ranked = rankFrames(results);
  ranked.forEach((rf) => {
    console.log(`Rank #${rf.quality?.rank}: ${rf.id} => Final Quality Score = ${rf.quality?.score}/100 [${rf.quality?.rating.toUpperCase()}] (Sharpness: ${rf.sharpness.score} | Face: ${rf.quality?.breakdown.faceScore} | Pose: ${rf.quality?.breakdown.poseScore})`);
  });
}

verifyAll();
