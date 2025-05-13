import multer from 'multer';
import { Request, Response } from 'express';

const storage = multer.memoryStorage();
const upload = multer({storage});

export default upload 