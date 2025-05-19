import { bool } from 'aws-sdk/clients/signer';
import { Request, Response, Router } from 'express';
import path from 'path';
import { promisify } from 'util';
import { pipeline } from 'stream';
const multer = require('multer');
const fs = require('fs-extra');


const UPLOAD_DIR = path.join(process.env.UPLOAD_DIR || __dirname, 'uploads');

const TEMP_DIR = path.join(process.env.UPLOAD_DIR || __dirname, 'uploads', 'temp');

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

router.post('/upload', upload.array('file'), (req: Request | { files: any }, res: Response) => {
  if (!req.files || !req.files.length) return res.status(400).json({ error: 'No files uploaded' });
  const files = req.files.map((f: { originalname: string, filename: string, path: string }) => ({
    originalname: f.originalname,
    filename: f.filename,
    path: f.path
  }));
  res.json({ success: true, files });
});

router.get('/tmp/:filename', (req: Request, res: Response) => {
  const { filename } = req.params;
  const filePath = path.join(TEMP_DIR, filename);

  fs.pathExists(filePath)
    .then((exists: boolean) => {
      if (exists) {
        res.sendFile(filePath);
      } else {
        res.status(404).json({ error: 'File not found' });
      }
    })
    .catch((error: any) => {
      res.status(500).json({ error: 'Error retrieving file', details: error.message });
    });
});

const getFileSafePath = (baseDir: string, filename: string) => {
  const filePath = path.join(baseDir, filename);
  const normalizedPath = path.normalize(filePath);

  if (!normalizedPath.startsWith(path.resolve(baseDir))) {
    throw new Error('Invalid file path!');
  }

  return normalizedPath;
};

router.get('/:filename(*)', ({ params: { filename } }, res: Response) => {
  const filePath = getFileSafePath(UPLOAD_DIR, filename);
  res.sendFile(filePath, (err) => {
    if (err) {
      res.status(404).send('File not found or invalid path');
    }
  });

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

export const moveTmp = (files: string[], ...paths: string[]): Promise<string[]> => {
  const finalDir = path.join(UPLOAD_DIR, ...paths);
  const ensureFinalDirPromise = fs.ensureDir(finalDir);

  return ensureFinalDirPromise.then(() => {
    const promises = files.map((filename) => {
      if (filename.startsWith('tmp/')) {
        filename = filename.substring(4);
        const tempPath = path.join(TEMP_DIR, filename);
        const newPath = path.join(finalDir, filename);
        return fs.pathExists(tempPath).then((exists: boolean) => {
          if (exists) {
            return fs.move(tempPath, newPath).then(() => path.join(...paths, filename));
          } else {
            return filename;
          }
        });
      } else {
        return filename;
      }
    });
    return Promise.all(promises);  // Waits for all file move or existence checks to complete
  });
};


export const saveStream = (stream: any, ...paths: string[]): Promise<string[]> => {
  const filename = paths.pop();
  const finalDir = path.join(UPLOAD_DIR, ...paths);
  const ensureFinalDirPromise = fs.ensureDir(finalDir);
  return ensureFinalDirPromise.then(() => {
    const pipelinePromise = promisify(pipeline);
    const savePath = path.join(finalDir, filename!);
    const writer = fs.createWriteStream(savePath);
    return pipelinePromise(stream, writer).then(() => path.join(...paths, filename!))
  });
};

export default router;
