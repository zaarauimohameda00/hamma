import type { Request, Response, NextFunction } from 'express';
import { supabaseAdmin } from '../supabase';

export interface AuthRequest extends Request {
	user?: { id: string; email?: string | null; role?: string | null };
}

export async function requireAuth(req: AuthRequest, res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'Missing or invalid Authorization header' });
		}
		const token = authHeader.substring('Bearer '.length);
		const { data, error } = await supabaseAdmin.auth.getUser(token);
		if (error || !data.user) {
			return res.status(401).json({ error: 'Invalid token' });
		}

		// Fetch profile for role-based access
		const { data: profile, error: profileError } = await supabaseAdmin
			.from('profiles')
			.select('role')
			.eq('id', data.user.id)
			.single();
		if (profileError) {
			return res.status(500).json({ error: 'Failed to load user profile' });
		}

		req.user = { id: data.user.id, email: data.user.email, role: profile?.role ?? null };
		next();
	} catch (err) {
		next(err);
	}
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
	if (!req.user) {
		return res.status(401).json({ error: 'Unauthorized' });
	}
	if (req.user.role !== 'admin') {
		return res.status(403).json({ error: 'Forbidden' });
	}
	next();
}

export async function maybeAuth(req: AuthRequest, _res: Response, next: NextFunction) {
	try {
		const authHeader = req.headers.authorization;
		if (!authHeader?.startsWith('Bearer ')) return next();
		const token = authHeader.substring('Bearer '.length);
		const { data, error } = await supabaseAdmin.auth.getUser(token);
		if (error || !data.user) return next();
		const { data: profile } = await supabaseAdmin
			.from('profiles')
			.select('role')
			.eq('id', data.user.id)
			.single();
		req.user = { id: data.user.id, email: data.user.email, role: profile?.role ?? null };
		return next();
	} catch (_err) {
		return next();
	}
}