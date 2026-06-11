import { createClient } from '@supabase/supabase-js';

// Same Supabase project + publishable key the live website already uses.
export const SUPABASE_URL = 'https://yttnuerixoafmhpdghdm.supabase.co';
export const SUPABASE_PUBLISHABLE_KEY =
  'sb_publishable_zBpJVvLrBXI_-CoV28r75w_hSubLVMx';
export const STORAGE_BUCKET = 'pex';
export const WEBSITE_URL = 'https://powerexpress1980.com';

export const supabase = createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);

export type Row = Record<string, any>;

export type Field =
  | {
      kind: 'text';
      col: string;
      label: string;
      hint?: string;
      // Keys the website looks content up by — editable when creating,
      // locked when editing so a typo can't silently break the site.
      lockOnEdit?: boolean;
      placeholder?: string;
    }
  | { kind: 'number'; col: string; label: string; hint?: string; step?: string }
  | { kind: 'color'; col: string; label: string; hint?: string }
  | {
      kind: 'select';
      col: string;
      label: string;
      options: { value: string; label: string }[];
      hint?: string;
    }
  | {
      kind: 'localized';
      base: string; // stored as `${base}_th` and `${base}_en`
      label: string;
      multiline?: boolean;
      rows?: number;
      hint?: string;
    }
  | { kind: 'image'; col: string; label: string; hint?: string }
  | {
      kind: 'gallery'; // newline-separated list of image URLs in one column
      col: string;
      label: string;
      hint?: string;
    }
  | { kind: 'fk'; col: string; label: string; refTable: string; hint?: string };

export interface TableConfig {
  name: string; // exact Supabase table name
  title: string;
  emoji: string;
  description: string;
  rowTitle: (row: Row) => string;
  rowImage?: (row: Row) => string | null;
  rowMeta?: (row: Row) => string;
  orderBy?: string; // defaults to id
  fields: Field[];
}

const t = (row: Row, base: string) =>
  row[`${base}_en`] || row[`${base}_th`] || '';

export const TABLES: TableConfig[] = [
  {
    name: 'hero-banner',
    title: 'Hero Banners',
    emoji: '🖼️',
    description:
      'The large rotating banners at the top of the home page (แบนเนอร์ใหญ่หน้าแรก).',
    rowTitle: (r) => t(r, 'title') || `Banner #${r.id}`,
    rowImage: (r) => r.banner,
    rowMeta: (r) => t(r, 'subtitle'),
    fields: [
      {
        kind: 'image',
        col: 'banner',
        label: 'Background photo',
        hint: 'Wide landscape photo, around 1920×1080 px works best.',
      },
      { kind: 'image', col: 'icon', label: 'Small icon' },
      { kind: 'localized', base: 'title', label: 'Title', multiline: true, rows: 2 },
      { kind: 'localized', base: 'subtitle', label: 'Subtitle' },
      {
        kind: 'localized',
        base: 'excerpt',
        label: 'Short description',
        multiline: true,
        rows: 4,
      },
    ],
  },
  {
    name: 'project',
    title: 'Projects',
    emoji: '☀️',
    description:
      'The project showcase pages (โครงการ). Home-page statistics update automatically from this list.',
    rowTitle: (r) => t(r, 'title') || `Project #${r.id}`,
    rowImage: (r) => r.thumbnail,
    rowMeta: (r) =>
      [t(r, 'client'), r.capacity ? `${r.capacity} kWp` : '', r.completion]
        .filter(Boolean)
        .join(' · '),
    fields: [
      { kind: 'localized', base: 'title', label: 'Project title' },
      { kind: 'localized', base: 'client', label: 'Client name' },
      { kind: 'localized', base: 'location', label: 'Location' },
      {
        kind: 'number',
        col: 'capacity',
        label: 'Capacity (kWp)',
        step: '0.01',
        hint: 'Installed capacity in kWp, e.g. 200.64',
      },
      {
        kind: 'number',
        col: 'completion',
        label: 'Year completed',
        step: '1',
        hint: 'e.g. 2023',
      },
      {
        kind: 'localized',
        base: 'excerpt',
        label: 'Short teaser',
        multiline: true,
        rows: 4,
        hint: 'Shown on the project card and list page.',
      },
      {
        kind: 'localized',
        base: 'details',
        label: 'Full details',
        multiline: true,
        rows: 8,
        hint: 'Shown on the project page. Leave an empty line between paragraphs.',
      },
      {
        kind: 'image',
        col: 'thumbnail',
        label: 'Card photo',
        hint: 'Shown on the project list. Around 800×600 px.',
      },
      {
        kind: 'image',
        col: 'banner',
        label: 'Page banner photo',
        hint: 'Wide photo at the top of the project page.',
      },
      { kind: 'gallery', col: 'photos', label: 'Photo gallery' },
      { kind: 'text', col: 'energy', label: 'Energy produced (text, optional)' },
      { kind: 'text', col: 'solar_array', label: 'Solar array (text, optional)' },
      {
        kind: 'text',
        col: 'trees_planted',
        label: 'Trees equivalent (text, optional)',
      },
    ],
  },
  {
    name: 'activity',
    title: 'News & Activities',
    emoji: '📰',
    description: 'Company news, awards and activity articles (ข่าวสารและกิจกรรม).',
    rowTitle: (r) => t(r, 'title') || `Activity #${r.id}`,
    rowImage: (r) => r.thumbnail,
    fields: [
      { kind: 'localized', base: 'title', label: 'Title', multiline: true, rows: 2 },
      { kind: 'fk', col: 'tag_id', label: 'Tag badge', refTable: 'activity-tag' },
      {
        kind: 'fk',
        col: 'type_id',
        label: 'Activity type',
        refTable: 'activity-type',
      },
      { kind: 'image', col: 'thumbnail', label: 'Card photo' },
      { kind: 'image', col: 'banner', label: 'Page banner photo' },
      {
        kind: 'localized',
        base: 'excerpt',
        label: 'Short teaser',
        multiline: true,
        rows: 4,
      },
      {
        kind: 'localized',
        base: 'details',
        label: 'Full story',
        multiline: true,
        rows: 10,
        hint: 'Leave an empty line between paragraphs.',
      },
    ],
  },
  {
    name: 'activity-tag',
    title: 'Activity Tags',
    emoji: '🏷️',
    description: 'The small colored badges shown on news cards (e.g. New, Event).',
    rowTitle: (r) => t(r, 'title') || `Tag #${r.id}`,
    rowMeta: (r) => r.color || '',
    fields: [
      { kind: 'localized', base: 'title', label: 'Tag name' },
      { kind: 'color', col: 'color', label: 'Badge color' },
    ],
  },
  {
    name: 'activity-type',
    title: 'Activity Types',
    emoji: '📂',
    description: 'Categories for news articles (e.g. CSR, Awards, Milestones).',
    rowTitle: (r) => t(r, 'title') || `Type #${r.id}`,
    rowMeta: (r) => r.color || '',
    fields: [
      { kind: 'localized', base: 'title', label: 'Type name' },
      { kind: 'color', col: 'color', label: 'Color' },
    ],
  },
  {
    name: 'benefit',
    title: 'Benefits',
    emoji: '✅',
    description: 'The benefit blocks on the home page (ข้อดีของบริการ).',
    rowTitle: (r) => t(r, 'title') || `Benefit #${r.id}`,
    rowImage: (r) => r.icon,
    fields: [
      { kind: 'image', col: 'icon', label: 'Icon', hint: 'Square SVG or PNG.' },
      { kind: 'localized', base: 'title', label: 'Title' },
      {
        kind: 'localized',
        base: 'excerpt',
        label: 'Description',
        multiline: true,
        rows: 3,
      },
    ],
  },
  {
    name: 'partner',
    title: 'Partners & Clients',
    emoji: '🤝',
    description: 'The logo strips: technology partners (vendor) and clients.',
    rowTitle: (r) => t(r, 'name') || `Partner #${r.id}`,
    rowImage: (r) => r.logo,
    rowMeta: (r) => `${r.type || ''} · order ${r.seq ?? '-'}`,
    orderBy: 'seq',
    fields: [
      {
        kind: 'image',
        col: 'logo',
        label: 'Logo',
        hint: 'PNG/WebP with transparent background looks best.',
      },
      { kind: 'localized', base: 'name', label: 'Company name' },
      {
        kind: 'select',
        col: 'type',
        label: 'Strip',
        options: [
          { value: 'client', label: 'client — Enterprises That Trust Us' },
          { value: 'vendor', label: 'vendor — Technology Partners' },
        ],
      },
      {
        kind: 'number',
        col: 'seq',
        label: 'Display order',
        step: '1',
        hint: '1 = first in the strip.',
      },
    ],
  },
  {
    name: 'contact',
    title: 'Contact Channels',
    emoji: '📞',
    description: 'Phone, email, address and social links shown in the contact section.',
    rowTitle: (r) => t(r, 'text') || `Contact #${r.id}`,
    rowImage: (r) => r.icon,
    rowMeta: (r) => r.type || '',
    fields: [
      {
        kind: 'text',
        col: 'type',
        label: 'Channel type',
        lockOnEdit: true,
        placeholder: 'tel / email / address / facebook / line …',
        hint: 'Used by the website to decide how the row behaves. Do not change unless instructed.',
      },
      { kind: 'image', col: 'icon', label: 'Icon' },
      { kind: 'localized', base: 'text', label: 'Displayed text' },
      {
        kind: 'text',
        col: 'url',
        label: 'Link (optional)',
        placeholder: 'https://… or tel:0820966595 or mailto:info@…',
        hint: 'Where clicking the row takes the visitor. Leave empty for plain text.',
      },
    ],
  },
  {
    name: 'localization',
    title: 'Site Text',
    emoji: '✏️',
    description:
      'Every fixed heading and sentence on the website (English + Thai). Use the search box to find a text.',
    rowTitle: (r) => r.key || `Text #${r.id}`,
    rowMeta: (r) => t(r, 'text').slice(0, 80),
    orderBy: 'key',
    fields: [
      {
        kind: 'text',
        col: 'key',
        label: 'Key',
        lockOnEdit: true,
        hint: 'Technical name the website uses to find this text. Do not change unless instructed.',
      },
      {
        kind: 'localized',
        base: 'text',
        label: 'Text',
        multiline: true,
        rows: 3,
      },
    ],
  },
  {
    name: 'media',
    title: 'Site Images',
    emoji: '🌄',
    description:
      'Standalone images used around the site (e.g. the About page banner), looked up by key.',
    rowTitle: (r) => r.key || `Image #${r.id}`,
    rowImage: (r) => r.url,
    rowMeta: (r) => r.type || '',
    orderBy: 'key',
    fields: [
      {
        kind: 'text',
        col: 'key',
        label: 'Key',
        lockOnEdit: true,
        hint: 'Technical name the website uses to find this image. Do not change unless instructed.',
      },
      {
        kind: 'text',
        col: 'type',
        label: 'Type',
        placeholder: 'image',
        hint: 'Normally "image".',
      },
      { kind: 'image', col: 'url', label: 'Image' },
    ],
  },
];
