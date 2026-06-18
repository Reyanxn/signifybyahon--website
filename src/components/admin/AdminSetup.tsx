'use client';

import { useState } from 'react';
import { HiCheckCircle, HiXCircle, HiPlay, HiDatabase, HiRefresh } from 'react-icons/hi';

const migrations = [
  {
    id: 'visits',
    label: 'Visits Table',
    description: 'CREATE TABLE public.visits — for real-time analytics',
    sql: `CREATE TABLE IF NOT EXISTS public.visits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ip TEXT,
  city TEXT,
  region TEXT,
  country TEXT,
  page TEXT,
  referrer TEXT,
  title TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_visits_created_at ON public.visits(created_at);
CREATE INDEX IF NOT EXISTS idx_visits_page ON public.visits(page);`,
  },
  {
    id: 'popups',
    label: 'Popups Table',
    description: 'CREATE TABLE public.popups — entrance popup images',
    sql: `CREATE TABLE IF NOT EXISTS public.popups (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  image TEXT NOT NULL,
  link TEXT,
  active BOOLEAN DEFAULT true,
  "order" INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.popups DISABLE ROW LEVEL SECURITY;`,
  },
  {
    id: 'homepage_sections',
    label: 'Homepage Sections',
    description: 'CREATE TABLE public.homepage_sections + seed defaults',
    sql: `CREATE TABLE IF NOT EXISTS public.homepage_sections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'custom',
  display_order INTEGER NOT NULL DEFAULT 0,
  product_ids JSONB DEFAULT '[]'::jsonb,
  alignment TEXT DEFAULT 'left',
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.homepage_sections DISABLE ROW LEVEL SECURITY;
INSERT INTO public.homepage_sections (title, type, display_order, alignment, active) VALUES
  ('New Arrivals', 'new-arrivals', 1, 'left', true),
  ('Best Sellers', 'best-sellers', 2, 'left', true),
  ('Trending Now', 'trending', 3, 'left', true),
  ('Sale', 'sale', 4, 'left', true),
  ('Customer Reviews', 'testimonials', 5, 'center', true)
ON CONFLICT DO NOTHING;`,
  },
  {
    id: 'reviews_columns',
    label: 'Reviews Columns',
    description: 'ALTER TABLE reviews — add approved & featured columns',
    sql: `ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS approved BOOLEAN DEFAULT false;
ALTER TABLE public.reviews ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT false;`,
  },
  {
    id: 'size_stock',
    label: 'Size Stock Column',
    description: 'ALTER TABLE products — add size_stock JSONB + migrate existing data',
    sql: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_stock JSONB DEFAULT '[]'::jsonb;
UPDATE public.products
SET size_stock = (
  SELECT jsonb_agg(
    jsonb_build_object('name', s, 'stock', GREATEST(0, FLOOR(stock::numeric / GREATEST(1, array_length(sizes, 1)))), 'visible', true)
  )
  FROM unnest(sizes) AS s
)
WHERE sizes IS NOT NULL
  AND array_length(sizes, 1) > 0
  AND (size_stock IS NULL OR size_stock = '[]'::jsonb OR jsonb_array_length(size_stock) = 0);`,
  },
  {
    id: 'video_column',
    label: 'Video & Size Chart',
    description: 'ALTER TABLE products — add video & size_chart columns',
    sql: `ALTER TABLE public.products ADD COLUMN IF NOT EXISTS video TEXT;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS size_chart JSONB;`,
  },
  {
    id: 'disable_rls',
    label: 'Disable RLS',
    description: 'ALTER TABLE — disable RLS on all app tables so features work',
    sql: `ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.blogs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.visits DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.popups DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.homepage_sections DISABLE ROW LEVEL SECURITY;`,
  },
];

export default function AdminSetup() {
  const [results, setResults] = useState<Record<string, { loading?: boolean; success?: boolean; error?: string; details?: string }>>({});
  const [runningAll, setRunningAll] = useState(false);

  const runSql = async (id: string, sql: string) => {
    setResults((r) => ({ ...r, [id]: { loading: true } }));
    try {
      const res = await fetch('/api/run-sql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sql }),
      });
      const data = await res.json();
      if (data.success) {
        setResults((r) => ({ ...r, [id]: { success: true, details: `${data.command}: ${data.rowCount} rows` } }));
      } else {
        setResults((r) => ({ ...r, [id]: { success: false, error: data.error } }));
      }
    } catch (e: any) {
      setResults((r) => ({ ...r, [id]: { success: false, error: e.message } }));
    }
  };

  const runAll = async () => {
    setRunningAll(true);
    for (const m of migrations) {
      await runSql(m.id, m.sql);
    }
    setRunningAll(false);
  };

  const numDone = Object.values(results).filter((r) => r.success).length;
  const numFailed = Object.values(results).filter((r) => r && !r.loading && !r.success).length;
  const total = migrations.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xs uppercase tracking-[0.2em]">Database Setup</h2>
          <p className="text-[10px] opacity-40 mt-1">
            {numDone}/{total} completed {numFailed > 0 ? `(${numFailed} failed)` : ''}
          </p>
        </div>
        <button onClick={runAll} disabled={runningAll}
          className="flex items-center gap-2 text-[10px] uppercase tracking-[0.1em] bg-[#1C1C1C] text-white px-4 py-2 disabled:opacity-40"
        >
          <HiPlay className="w-3 h-3" /> {runningAll ? 'Running...' : 'Run All'}
        </button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        {migrations.map((m) => {
          const r = results[m.id];
          return (
            <div key={m.id} className="bg-white border border-[#DDDDDD] p-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs uppercase tracking-[0.2em]">{m.label}</h3>
                  {r?.loading && <HiRefresh className="w-3 h-3 animate-spin" />}
                  {r?.success && <HiCheckCircle className="w-3 h-3 text-green-600" />}
                  {r && !r.loading && !r.success && <HiXCircle className="w-3 h-3 text-red-500" />}
                </div>
                <p className="text-[10px] opacity-40 mt-1">{m.description}</p>
                {r?.error && <p className="text-[10px] text-red-500 mt-1 font-mono break-all">{r.error}</p>}
                {r?.details && <p className="text-[10px] text-green-700 mt-1">{r.details}</p>}
              </div>
              <button onClick={() => runSql(m.id, m.sql)} disabled={r?.loading}
                className="shrink-0 text-[10px] uppercase tracking-[0.1em] border border-[#DDDDDD] px-3 py-1.5 hover:bg-[#F9F9F9] disabled:opacity-40"
              >Run</button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
