import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import pino from 'pino';
import pinoHttp from 'pino-http';
import { productsRouter } from './routes/products';
import { categoriesRouter } from './routes/categories';
import { cartRouter } from './routes/cart';
import { ordersRouter } from './routes/orders';
import { usersRouter } from './routes/users';
import { analyticsRouter } from './routes/analytics';
import { uploadRouter } from './routes/upload';
import { i18nRouter } from './routes/i18n';
import { errorHandler } from './middleware/errorHandler';
import { contentRouter, streamInvoice } from './routes/content';
import { maybeAuth, type AuthRequest } from './middleware/auth';
import { z } from 'zod';
import { supabaseAdmin } from './supabase';

const app = express();

const logger = pino({ level: process.env.LOG_LEVEL || 'info' });
app.use(pinoHttp({ logger }));

app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

const allowedOrigin = process.env.APP_BASE_URL || 'http://localhost:3000';
app.use(cors({ origin: allowedOrigin, credentials: true }));

const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 300 });
app.use(limiter);

app.get('/api/health', (_req, res) => {
	res.json({ status: 'ok', uptime: process.uptime() });
});

app.use('/api/products', productsRouter);
app.use('/api/categories', categoriesRouter);
app.use('/api/cart', maybeAuth, cartRouter);
app.use('/api/orders', maybeAuth, ordersRouter);
app.use('/api/users', usersRouter);
app.use('/api/analytics', analyticsRouter);
app.use('/api/upload', uploadRouter);
app.use('/api/i18n', i18nRouter);
app.use('/api/content', contentRouter);

app.get('/api/orders/:id/invoice', maybeAuth, async (req: AuthRequest, res, next) => {
	try {
		const id = z.string().uuid().parse(req.params.id);
		const { data: order, error } = await supabaseAdmin.from('orders').select('id, user_id').eq('id', id).single();
		if (error) throw error;
		// Allow admin, owner, or guest order (no user_id)
		if (order.user_id && !(req.user && (req.user.role === 'admin' || req.user.id === order.user_id))) {
			return res.status(403).json({ error: 'Forbidden' });
		}
		await streamInvoice(id, res);
	} catch (err) {
		next(err);
	}
});

app.use(errorHandler);

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
	logger.info(`API server listening on http://localhost:${port}`);
});