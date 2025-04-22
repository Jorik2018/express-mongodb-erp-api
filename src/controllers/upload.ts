import { bool } from 'aws-sdk/clients/signer';
import { Request, Response, Router } from 'express';
const multer = require('multer');
const fs = require('fs-extra');
const path = require('path');

const TEMP_DIR = path.join(__dirname, 'uploads', 'temp');

fs.ensureDirSync(TEMP_DIR);

const storage = multer.diskStorage({
  destination: (req: Request, file: any, cb: any) => {
    console.log('TEMP_DIR=', TEMP_DIR);
    cb(null, TEMP_DIR);
  },
  filename: (req: Request, file: any, cb: any) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
    cb(null, `${unique}-${file.originalname}`);
  }
});

const upload = multer({ storage });

const router = Router();

router.post('/upload', upload.array('file', 10), (req: Request | { files: any }, res: Response) => {
  if (!req.files || !req.files.lenght) return res.status(400).json({ error: 'No files uploaded' });
  const files = req.files.map((f: { originalname: string, filename: string, path: string }) => ({
    originalname: f.originalname,
    filename: f.filename,
    path: f.path
  }));
  res.json({ success: true, files });
});


router.post('/confirm-upload', (req, res) => {
  const { entityId, files } = req.body; // files = [filename1, filename2, ...]

  if (!entityId || !files) return res.status(400).json({ error: 'Missing data' });

  const finalDir = path.join(__dirname, 'uploads', 'entity', entityId);
  fs.ensureDir(finalDir).then(() => {
    for (const filename of files) {
      const tempPath = path.join(TEMP_DIR, filename);
      const newPath = path.join(finalDir, filename);
      fs.pathExists(tempPath).then((exists: bool) => {
        if (exists) fs.move(tempPath, newPath).then(() => { });
      })
    }
    res.json({ success: true, message: 'Files moved.' });
  });
});

export default router;
