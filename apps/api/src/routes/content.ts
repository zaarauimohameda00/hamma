import { Router } from 'express';
import { z } from 'zod';
import { supabaseAdmin } from '../supabase';
import PDFDocument from 'pdfkit';
import type { Request, Response } from 'express';

export const contentRouter = Router();

contentRouter.get('/site', async (_req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin.from('site_content').select('*');
    if (error) throw error;
    res.json({ data });
  } catch (err) {
    next(err);
  }
});

contentRouter.post('/newsletter', async (req, res, next) => {
  try {
    const email = z.string().email().parse(req.body.email);
    const { data, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .insert({ email })
      .select('*')
      .single();
    if (error) throw error;
    res.status(201).json({ data });
  } catch (err) {
    next(err);
  }
});

export async function streamInvoice(orderId: string, res: Response) {
  const { data: order, error } = await supabaseAdmin
    .from('orders')
    .select('*, order_items(*, products(name))')
    .eq('id', orderId)
    .single();
  if (error) throw error;

  const doc = new PDFDocument({ bufferPages: true });
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename=invoice-${orderId}.pdf`);
  doc.pipe(res);
  doc.fontSize(20).text('Invoice', { underline: true });
  doc.moveDown();
  doc.fontSize(12).text(`Order ID: ${orderId}`);
  doc.text(`Name: ${order.full_name}`);
  doc.text(`Email: ${order.email}`);
  doc.text(`City: ${order.city}`);
  doc.text(`Country: ${order.country}`);
  doc.moveDown();
  doc.text('Items:');
  for (const item of (order as any).order_items) {
    doc.text(`- ${(item as any).products.name} x${item.quantity} @ $${item.unit_price}`);
  }
  doc.moveDown();
  doc.text(`Subtotal: $${order.subtotal}`);
  doc.text(`Tax: $${order.tax}`);
  doc.text(`Total: $${order.total}`);
  doc.end();
}