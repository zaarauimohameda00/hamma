import { Router } from 'express';
import multer from 'multer';
import sharp from 'sharp';
import { v4 as uuidv4 } from 'uuid';
import { requireAuth, requireAdmin } from '../middleware/auth';
import { supabaseAdmin } from '../supabase';

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

export const uploadRouter = Router();

uploadRouter.post('/', requireAuth, requireAdmin, upload.array('files', 10), async (req, res, next) => {
  try {
    const bucket = process.env.SUPABASE_BUCKET_PRODUCTS || 'product-images';
    const files = (req.files as Express.Multer.File[]) || [];

    const urls: string[] = [];
    for (const file of files) {
      const id = uuidv4();
      const ext = (file.mimetype.includes('png') && 'png') || (file.mimetype.includes('webp') && 'webp') || 'jpg';
      const path = `products/${id}.${ext}`;
      const optimized = await sharp(file.buffer).resize(1600, 1600, { fit: 'inside' }).toFormat(ext as any, { quality: 82 }).toBuffer();
      const { error: upErr } = await supabaseAdmin.storage.from(bucket).upload(path, optimized, {
        contentType: file.mimetype,
        upsert: true,
      });
      if (upErr) throw upErr;
      const { data: publicUrl } = supabaseAdmin.storage.from(bucket).getPublicUrl(path);
      urls.push(publicUrl.publicUrl);
    }

    res.status(201).json({ urls });
  } catch (err) {
    next(err);
  }
});