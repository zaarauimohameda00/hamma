import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const service = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const bucket = process.env.SUPABASE_BUCKET_PRODUCTS || 'product-images';

if (!url || !service) throw new Error('Missing Supabase envs');

const db = createClient(url, service, { auth: { persistSession: false } });

async function upsertCategory(name: string, slug: string, parent_id: string | null = null) {
  const { data, error } = await db
    .from('categories')
    .upsert({ name, slug, parent_id }, { onConflict: 'slug' })
    .select('*')
    .single();
  if (error) throw error;
  return data.id as string;
}

async function main() {
  // Categories
  const shoes = await upsertCategory('Shoes', 'shoes');
  const clothing = await upsertCategory('Clothing', 'clothing');
  const shirts = await upsertCategory('Shirts', 'shirts', clothing);
  const pants = await upsertCategory('Pants', 'pants', clothing);
  const shorts = await upsertCategory('Shorts', 'shorts', clothing);
  const perfumes = await upsertCategory('Perfumes', 'perfumes');
  const watches = await upsertCategory('Watches', 'watches');

  // Site content
  await db.from('site_content').upsert([
    {
      key: 'home.hero',
      value: {
        heading: 'Discover quality you can trust',
        subheading: 'Curated products at fair prices',
        cta_label: 'Shop now',
        cta_href: '/search',
      },
    },
    {
      key: 'home.footer',
      value: { blocks: [{ title: 'About', links: [{ label: 'Our Story', href: '/about' }] }] },
    },
  ]);

  // Site settings
  await db.from('site_settings').upsert([
    { key: 'tax', value: { rate: 0.1 } },
    { key: 'shipping', value: { flat: 9.99, free_over: 100 } },
  ]);

  // i18n namespaces
  const { data: nsHome } = await db
    .from('i18n_namespaces')
    .upsert({ name: 'home' }, { onConflict: 'name' })
    .select('*')
    .single();
  const { data: nsCommon } = await db
    .from('i18n_namespaces')
    .upsert({ name: 'common' }, { onConflict: 'name' })
    .select('*')
    .single();

  const translations = [
    { ns: nsHome!.id, lang: 'en', key: 'hero.title', value: 'Discover quality you can trust' },
    { ns: nsHome!.id, lang: 'es', key: 'hero.title', value: 'Descubre calidad en la que puedes confiar' },
    { ns: nsHome!.id, lang: 'ar', key: 'hero.title', value: 'اكتشف جودة يمكنك الوثوق بها' },
    { ns: nsCommon!.id, lang: 'en', key: 'cta.shop', value: 'Shop now' },
    { ns: nsCommon!.id, lang: 'es', key: 'cta.shop', value: 'Compra ahora' },
    { ns: nsCommon!.id, lang: 'ar', key: 'cta.shop', value: 'تسوق الآن' },
  ];

  for (const t of translations) {
    await db.from('i18n_translations').upsert(
      { namespace_id: t.ns, lang: t.lang, key: t.key, value: t.value },
      { onConflict: 'namespace_id,lang,key' }
    );
  }

  // Products (sample realistic)
  const sampleImage = `https://PLACE_YOUR_PROJECT_REF.supabase.co/storage/v1/object/public/${bucket}/placeholder.jpg`;

  const products = [
    { name: 'Classic Leather Sneakers', slug: 'classic-leather-sneakers', description: 'Premium leather upper with cushioned sole.', price: 119.99, category_id: shoes, images: [sampleImage], stock_quantity: 50, featured: true },
    { name: 'Oxford Shirt', slug: 'oxford-shirt', description: 'Breathable cotton, tailored fit.', price: 49.99, category_id: shirts, images: [sampleImage], stock_quantity: 100, featured: true },
    { name: 'Slim Fit Pants', slug: 'slim-fit-pants', description: 'Stretch fabric for comfort.', price: 59.99, category_id: pants, images: [sampleImage], stock_quantity: 80 },
    { name: 'Sport Shorts', slug: 'sport-shorts', description: 'Lightweight moisture-wicking.', price: 29.99, category_id: shorts, images: [sampleImage], stock_quantity: 120 },
    { name: 'Eau de Parfum', slug: 'eau-de-parfum', description: 'Long-lasting floral notes.', price: 89.99, category_id: perfumes, images: [sampleImage], stock_quantity: 60 },
    { name: 'Chronograph Watch', slug: 'chronograph-watch', description: 'Stainless steel with sapphire glass.', price: 199.99, category_id: watches, images: [sampleImage], stock_quantity: 40 },
  ];

  for (const p of products) {
    await db.from('products').upsert(p, { onConflict: 'slug' });
  }

  // Admin user setup (create manually in Supabase auth; then elevate role)
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@example.com';
  const { data: adminProfile } = await db.from('profiles').select('*').eq('email', adminEmail).maybeSingle();
  if (adminProfile) {
    await db.from('profiles').update({ role: 'admin' }).eq('id', adminProfile.id);
  } else {
    console.log(`Create an auth user with email ${adminEmail} and then re-run to elevate role.`);
  }

  console.log('Seed completed');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});