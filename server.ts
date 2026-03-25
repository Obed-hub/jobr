import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import fetch from "node-fetch";
import multer from "multer";
import { initializeApp } from "firebase/app";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import fs from "fs";

// Load Firebase config for server-side use
const firebaseConfig = JSON.parse(fs.readFileSync("./firebase-applet-config.json", "utf-8"));
const firebaseApp = initializeApp(firebaseConfig);
const storage = getStorage(firebaseApp, firebaseConfig.firestoreDatabaseId);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({ storage: multer.memoryStorage() });

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Proxy for Resume Upload (to bypass CORS)
  app.post("/api/upload-resume", upload.single("resume"), async (req, res) => {
    try {
      const request = req as any;
      if (!request.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }
      const { userId } = request.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      const storageRef = ref(storage, `resumes/${userId}/${request.file.originalname}`);
      await uploadBytes(storageRef, request.file.buffer, {
        contentType: request.file.mimetype,
      });
      const url = await getDownloadURL(storageRef);
      
      res.json({ url, name: request.file.originalname });
    } catch (error: any) {
      console.error("Resume Upload Proxy Error:", error);
      res.status(500).json({ error: error.message || "Failed to upload resume" });
    }
  });

  // API Proxy for Remotive
  app.get("/api/jobs/remotive", async (req, res) => {
    try {
      const { category, search } = req.query;
      const url = new URL('https://remotive.com/api/remote-jobs');
      if (category) url.searchParams.append('category', category as string);
      if (search) url.searchParams.append('search', search as string);
      url.searchParams.append('limit', '50');

      const response = await fetch(url.toString());
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Remotive Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs from Remotive' });
    }
  });

  // API Proxy for Arbeitnow
  app.get("/api/jobs/arbeitnow", async (req, res) => {
    try {
      const response = await fetch('https://www.arbeitnow.com/api/job-board-api');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('Arbeitnow Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs from Arbeitnow' });
    }
  });

  // API Proxy for RemoteOK
  app.get("/api/jobs/remoteok", async (req, res) => {
    try {
      const response = await fetch('https://remoteok.com/api');
      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error('RemoteOK Proxy Error:', error);
      res.status(500).json({ error: 'Failed to fetch jobs from RemoteOK' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
