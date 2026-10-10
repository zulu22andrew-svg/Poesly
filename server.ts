import express from "express";
import path from "path";
import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import sharp from "sharp";
import { createServer as createViteServer } from "vite";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import { analyzeFrame, rankFrames, FrameAnalysisResult } from "./server/visionAnalyzer";
import { enhanceSingleFrame, enhanceBatchFrames, getEnhancedFrames } from "./server/upscaler";
import { segmentSingleFrame, segmentBatchFrames, getStoredSegmentations } from "./server/segmentation";
import { applyBackgroundEffect, getStoredBackgrounds } from "./server/backgroundEditor";
import { applyFilterOnServer } from "./server/filterEngine";
import { exportFullResolutionPhoto } from "./server/exportEngine";
import { BackgroundMode, FilterPresetId, ExportOptions } from "./src/types";

if (ffmpegPath) {
  ffmpeg.setFfmpegPath(ffmpegPath);
}

const app = express();
const PORT = 3000;

app.use(express.json());
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// Ensure uploads directory exists
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const id = uuidv4();
    cb(null, `${id}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024, // 200MB
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("video/") || file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Supported formats: MP4, MOV, WEBM for video; JPG, JPEG, PNG, WEBP for photos."));
    }
  },
});

// API Routes
app.post("/api/upload", (req, res, next) => {
  // Support 'file', 'video', or 'photo' field names
  upload.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(400).json({ error: "File too large. Maximum size is 200MB." });
      }
      return res.status(400).json({ error: err.message });
    } else if (err) {
      return res.status(400).json({ error: err.message });
    }

    const uploadedFile = (req.files as Express.Multer.File[])?.[0];
    if (!uploadedFile) {
      return res.status(400).json({ error: "No video or photo file uploaded." });
    }

    const referenceId = path.parse(uploadedFile.filename).name;
    const isPhoto = uploadedFile.mimetype.startsWith("image/");
    const isVideo = uploadedFile.mimetype.startsWith("video/");

    res.json({
      success: true,
      referenceId,
      filename: uploadedFile.filename,
      originalName: uploadedFile.originalname,
      size: uploadedFile.size,
      mimetype: uploadedFile.mimetype,
      mediaType: isPhoto ? 'photo' : (isVideo ? 'video' : 'unknown')
    });
  });
});

app.post("/api/process-photo", async (req, res) => {
  const { referenceId, filename } = req.body;

  if (!referenceId || !filename) {
    return res.status(400).json({ error: "Missing referenceId or filename" });
  }

  const sourcePhotoPath = path.join(uploadDir, filename);
  if (!fs.existsSync(sourcePhotoPath)) {
    return res.status(404).json({ error: "Photo file not found" });
  }

  const framesDir = path.join(uploadDir, referenceId);
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  const targetFramePath = path.join(framesDir, "frame-0001.jpg");

  try {
    // Ingest photo via sharp to validate integrity and normalize format to JPEG
    await sharp(sourcePhotoPath)
      .jpeg({ quality: 95, mozjpeg: true })
      .toFile(targetFramePath);

    const frameUrl = `/uploads/${referenceId}/frame-0001.jpg`;
    
    // Run full vision analysis pipeline (pose, face, sharpness, composite quality)
    const analysis = await analyzeFrame(targetFramePath, "frame-0001", frameUrl, 0);
    const rankedResults = rankFrames([analysis]);

    // Store analysis JSON alongside frame
    const analysisFilePath = path.join(framesDir, "analysis.json");
    await fs.promises.writeFile(analysisFilePath, JSON.stringify(rankedResults, null, 2));

    const frames = rankedResults.map(a => ({
      id: a.id,
      url: a.url,
      timestamp: 0,
      pose: a.pose,
      face: a.face,
      sharpness: a.sharpness,
      quality: a.quality
    }));

    res.json({
      success: true,
      referenceId,
      frameCount: frames.length,
      frames,
      analysis: rankedResults
    });
  } catch (err: any) {
    console.error("Photo processing error:", err);
    res.status(500).json({ error: "Photo analysis failed: " + err.message });
  }
});

app.post("/api/process", (req, res) => {
  const { referenceId, filename } = req.body;

  if (!referenceId || !filename) {
    return res.status(400).json({ error: "Missing referenceId or filename" });
  }

  const videoPath = path.join(uploadDir, filename);
  if (!fs.existsSync(videoPath)) {
    return res.status(404).json({ error: "Video file not found" });
  }

  const framesDir = path.join(uploadDir, referenceId);
  if (!fs.existsSync(framesDir)) {
    fs.mkdirSync(framesDir, { recursive: true });
  }

  // Extract at 2 FPS (every 0.5 seconds)
  ffmpeg(videoPath)
    .outputOptions([
      '-vf fps=2',
      '-q:v 2'
    ])
    .output(path.join(framesDir, 'frame-%04d.jpg'))
    .on('end', async () => {
      try {
        const files = await fs.promises.readdir(framesDir);
        const frameFiles = files.filter(f => f.endsWith('.jpg')).sort();

        const analysisResults: FrameAnalysisResult[] = [];

        for (let i = 0; i < frameFiles.length; i++) {
          const file = frameFiles[i];
          const frameId = path.parse(file).name;
          const framePath = path.join(framesDir, file);
          const frameUrl = `/uploads/${referenceId}/${file}`;

          const analysis = await analyzeFrame(framePath, frameId, frameUrl, i);
          analysisResults.push(analysis);
        }

        // Rank all frames by composite quality score and assign ranks
        const rankedResults = rankFrames(analysisResults);

        // Store analysis alongside frames
        const analysisFilePath = path.join(framesDir, 'analysis.json');
        await fs.promises.writeFile(analysisFilePath, JSON.stringify(rankedResults, null, 2));

        const frames = rankedResults.map(a => ({
          id: a.id,
          url: a.url,
          timestamp: a.timestamp,
          pose: a.pose,
          face: a.face,
          sharpness: a.sharpness,
          quality: a.quality
        }));

        res.json({
          success: true,
          referenceId,
          frameCount: frames.length,
          frames,
          analysis: rankedResults
        });
      } catch (err: any) {
        console.error("Frame processing error:", err);
        res.status(500).json({ error: "Frame analysis failed: " + err.message });
      }
    })
    .on('error', (err) => {
      console.error('FFmpeg error:', err);
      res.status(500).json({ error: "Frame extraction failed: " + err.message });
    })
    .run();
});

app.get("/api/sessions", async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir, { withFileTypes: true });
    const sessionDirs = files.filter(f => f.isDirectory()).map(d => d.name);
    
    const sessions = [];
    for (const refId of sessionDirs) {
      const analysisPath = path.join(uploadDir, refId, 'analysis.json');
      if (fs.existsSync(analysisPath)) {
        const stats = await fs.promises.stat(analysisPath);
        const data = await fs.promises.readFile(analysisPath, 'utf-8');
        const analysis = JSON.parse(data);
        sessions.push({
          referenceId: refId,
          createdAt: stats.mtime,
          frameCount: analysis.length,
          topScore: analysis[0]?.quality?.score ?? 0,
          previewUrl: analysis[0]?.url || ''
        });
      }
    }
    
    // Sort by latest
    sessions.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    res.json({ sessions });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to list sessions: " + err.message });
  }
});

app.get("/api/latest-session", async (req, res) => {
  try {
    const files = await fs.promises.readdir(uploadDir, { withFileTypes: true });
    const sessionDirs = files.filter(f => f.isDirectory()).map(d => d.name);
    
    let latestSession: { refId: string; mtime: Date } | null = null;
    for (const refId of sessionDirs) {
      const analysisPath = path.join(uploadDir, refId, 'analysis.json');
      if (fs.existsSync(analysisPath)) {
        const stats = await fs.promises.stat(analysisPath);
        if (!latestSession || stats.mtime > latestSession.mtime) {
          latestSession = { refId, mtime: stats.mtime };
        }
      }
    }

    if (!latestSession) {
      return res.status(404).json({ error: "No sessions found" });
    }

    const analysisPath = path.join(uploadDir, latestSession.refId, 'analysis.json');
    const data = await fs.promises.readFile(analysisPath, 'utf-8');
    const analysis = JSON.parse(data);

    res.json({
      success: true,
      referenceId: latestSession.refId,
      frameCount: analysis.length,
      frames: analysis,
      analysis
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get latest session: " + err.message });
  }
});

app.get("/api/frames/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  const framesDir = path.join(uploadDir, referenceId);
  
  if (!fs.existsSync(framesDir)) {
    return res.status(404).json({ error: "Frames not found" });
  }

  try {
    const analysisFilePath = path.join(framesDir, 'analysis.json');
    if (fs.existsSync(analysisFilePath)) {
      const data = await fs.promises.readFile(analysisFilePath, 'utf-8');
      const analysis: FrameAnalysisResult[] = JSON.parse(data);
      return res.json({ frames: analysis, analysis });
    }

    const files = await fs.promises.readdir(framesDir);
    const frames = files
      .filter(f => f.endsWith('.jpg'))
      .sort()
      .map((f, i) => ({
        id: path.parse(f).name,
        url: `/uploads/${referenceId}/${f}`,
        timestamp: Number((i * 0.5).toFixed(1))
      }));
      
    res.json({ frames });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read frames: " + err.message });
  }
});

app.get("/api/analysis/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  const analysisFilePath = path.join(uploadDir, referenceId, 'analysis.json');
  
  if (!fs.existsSync(analysisFilePath)) {
    return res.status(404).json({ error: "Analysis data not found for this reference ID" });
  }

  try {
    const data = await fs.promises.readFile(analysisFilePath, 'utf-8');
    res.json({ success: true, referenceId, analysis: JSON.parse(data) });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to read analysis: " + err.message });
  }
});

// Stage 10: Neural Super-Resolution & Face Enhancement for a single selected frame
app.post("/api/enhance-frame", async (req, res) => {
  const { referenceId, frameId, scale = 2 } = req.body;

  if (!referenceId || !frameId) {
    return res.status(400).json({ error: "referenceId and frameId are required" });
  }

  try {
    console.log(`[API] Triggering enhancement for ${referenceId} -> ${frameId} (scale: ${scale}x)...`);
    const enhancedResult = await enhanceSingleFrame({
      referenceId,
      frameId,
      scale: Number(scale) || 2
    });

    res.json(enhancedResult);
  } catch (err: any) {
    console.error("[API] Frame enhancement failed:", err);
    res.status(500).json({
      error: "Frame enhancement failed: " + err.message,
      referenceId,
      frameId
    });
  }
});

// Stage 10 & 11: Batch Neural Super-Resolution & Face Enhancement
app.post("/api/enhance-batch", async (req, res) => {
  const { referenceId, frameIds, scale = 2 } = req.body;

  if (!referenceId || !Array.isArray(frameIds) || frameIds.length === 0) {
    return res.status(400).json({ error: "referenceId and non-empty frameIds array are required" });
  }

  try {
    console.log(`[API] Triggering batch enhancement for ${referenceId} -> ${frameIds.length} frames (scale: ${scale}x)...`);
    const batchResult = await enhanceBatchFrames({
      referenceId,
      frameIds,
      scale: Number(scale) || 2
    });

    res.json(batchResult);
  } catch (err: any) {
    console.error("[API] Batch frame enhancement failed:", err);
    res.status(500).json({
      error: "Batch frame enhancement failed: " + err.message,
      referenceId
    });
  }
});

app.get("/api/enhanced-frames/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  try {
    const records = await getEnhancedFrames(referenceId);
    res.json({ success: true, referenceId, enhancements: records });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get enhanced frames: " + err.message });
  }
});

// Stage 12: Neural Human Background Segmentation & Matting
app.post("/api/segment-frame", async (req, res) => {
  const { referenceId, frameId, useEnhancedIfAvailable = true } = req.body;

  if (!referenceId || !frameId) {
    return res.status(400).json({ error: "referenceId and frameId are required" });
  }

  try {
    console.log(`[API] Segmenting frame ${frameId} for session ${referenceId}...`);
    const segmentationResult = await segmentSingleFrame({
      referenceId,
      frameId,
      useEnhancedIfAvailable
    });

    res.json(segmentationResult);
  } catch (err: any) {
    console.error("[API] Frame segmentation failed:", err);
    res.status(500).json({
      error: "Frame segmentation failed: " + err.message,
      referenceId,
      frameId
    });
  }
});

app.post("/api/segment-batch", async (req, res) => {
  const { referenceId, frameIds, useEnhancedIfAvailable = true } = req.body;

  if (!referenceId || !Array.isArray(frameIds) || frameIds.length === 0) {
    return res.status(400).json({ error: "referenceId and non-empty frameIds array are required" });
  }

  try {
    console.log(`[API] Segmenting batch of ${frameIds.length} frames for session ${referenceId}...`);
    const batchResult = await segmentBatchFrames({
      referenceId,
      frameIds,
      useEnhancedIfAvailable
    });

    res.json(batchResult);
  } catch (err: any) {
    console.error("[API] Batch frame segmentation failed:", err);
    res.status(500).json({
      error: "Batch frame segmentation failed: " + err.message,
      referenceId
    });
  }
});

app.get("/api/segmentations/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  try {
    const records = await getStoredSegmentations(referenceId);
    res.json({ success: true, referenceId, segmentations: records });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get segmentation records: " + err.message });
  }
});

// Stage 13: Background Blur, Remove, and Modification using Stage 12 Segmentation
app.post("/api/apply-background", async (req, res) => {
  const { referenceId, frameId, mode = "original", blurSigma = 20, forceReprocess = false } = req.body;

  if (!referenceId || !frameId) {
    return res.status(400).json({ error: "referenceId and frameId are required" });
  }

  const validModes: BackgroundMode[] = ["original", "blur", "remove", "white", "black"];
  if (!validModes.includes(mode as BackgroundMode)) {
    return res.status(400).json({ error: `Invalid background mode '${mode}'. Allowed: ${validModes.join(", ")}` });
  }

  try {
    console.log(`[API] Applying background effect '${mode}' for frame ${frameId} in session ${referenceId}...`);
    const result = await applyBackgroundEffect({
      referenceId,
      frameId,
      mode: mode as BackgroundMode,
      blurSigma: Number(blurSigma) || 20,
      forceReprocess: Boolean(forceReprocess)
    });

    res.json(result);
  } catch (err: any) {
    console.error("[API] Background application failed:", err);
    res.status(500).json({
      error: "Background modification failed: " + err.message,
      referenceId,
      frameId
    });
  }
});

app.get("/api/backgrounds/:referenceId", async (req, res) => {
  const { referenceId } = req.params;
  try {
    const records = await getStoredBackgrounds(referenceId);
    res.json({ success: true, referenceId, backgrounds: records });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to get background records: " + err.message });
  }
});

// Stage 14: Professional Style Filter System (LUTs)
app.post("/api/apply-filter", async (req, res) => {
  const { referenceId, frameId, filterId = "none", intensity = 70, backgroundMode = "original", forceReprocess = false } = req.body;

  if (!referenceId || !frameId) {
    return res.status(400).json({ error: "referenceId and frameId are required" });
  }

  const validFilters: FilterPresetId[] = ["none", "natural", "studio", "editorial"];
  if (!validFilters.includes(filterId as FilterPresetId)) {
    return res.status(400).json({ error: `Invalid filterId '${filterId}'. Allowed: ${validFilters.join(", ")}` });
  }

  try {
    console.log(`[API] Applying filter preset '${filterId}' (${intensity}%) for frame ${frameId} in session ${referenceId}...`);
    const result = await applyFilterOnServer({
      referenceId,
      frameId,
      filterId: filterId as FilterPresetId,
      intensity: Number(intensity),
      backgroundMode: backgroundMode as BackgroundMode,
      forceReprocess: Boolean(forceReprocess)
    });

    res.json(result);
  } catch (err: any) {
    console.error("[API] Filter application failed:", err);
    res.status(500).json({
      error: "Filter application failed: " + err.message,
      referenceId,
      frameId
    });
  }
});

// Stage 15: Full-Resolution Download & Export Pipeline
app.post("/api/export-photo", async (req, res) => {
  const {
    referenceId,
    frameId,
    backgroundMode = "original",
    filterId = "none",
    filterIntensity = 70,
    format = "auto",
    sessionName,
    customFilename
  } = req.body;

  if (!referenceId || !frameId) {
    return res.status(400).json({ error: "referenceId and frameId are required" });
  }

  try {
    console.log(`[API] Exporting full-resolution photo for frame ${frameId} (bg: ${backgroundMode}, filter: ${filterId} @ ${filterIntensity}%)...`);
    const result = await exportFullResolutionPhoto({
      referenceId,
      frameId,
      backgroundMode: backgroundMode as BackgroundMode,
      filterId: filterId as FilterPresetId,
      filterIntensity: Number(filterIntensity),
      format: format as 'auto' | 'jpeg' | 'png',
      sessionName,
      customFilename
    });

    res.json(result);
  } catch (err: any) {
    console.error("[API] Full-resolution export failed:", err);
    res.status(500).json({
      error: "Export processing failed: " + err.message,
      referenceId,
      frameId
    });
  }
});

// Download endpoint with attachment headers
app.get("/api/download/:referenceId/:filename", async (req, res) => {
  const { referenceId, filename } = req.params;

  // Sanitization against directory traversal
  const safeFilename = path.basename(filename);
  const sessionDir = path.join(uploadDir, referenceId);
  
  if (!fs.existsSync(sessionDir)) {
    return res.status(404).json({ error: "Session not found" });
  }

  // Check exports subfolder first, then session root
  const exportPath = path.join(sessionDir, "exports", safeFilename);
  const rootSessionPath = path.join(sessionDir, safeFilename);

  let targetFilePath = "";
  if (fs.existsSync(exportPath)) {
    targetFilePath = exportPath;
  } else if (fs.existsSync(rootSessionPath)) {
    targetFilePath = rootSessionPath;
  } else {
    return res.status(404).json({ error: "File not found for download: " + safeFilename });
  }

  const isPng = safeFilename.endsWith(".png");
  res.setHeader("Content-Disposition", `attachment; filename="${safeFilename}"`);
  res.setHeader("Content-Type", isPng ? "image/png" : "image/jpeg");
  
  res.sendFile(targetFilePath);
});



async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
