import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Field,
  Row,
  STORAGE_BUCKET,
  TableConfig,
  supabase,
} from './config';

// ---------------------------------------------------------------- helpers

async function uploadImage(table: string, file: File): Promise<string> {
  const ext =
    (file.name.split('.').pop() || 'jpg').toLowerCase().replace(/[^a-z0-9]/g, '') ||
    'jpg';
  const rand = Math.random().toString(36).slice(2, 8);
  const path = `cms/${table}/${Date.now()}-${rand}.${ext}`;
  const { error } = await supabase.storage
    .from(STORAGE_BUCKET)
    .upload(path, file, { cacheControl: '3600' });
  if (error) throw new Error(error.message);
  const { data } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

function friendlyError(message: string): string {
  if (/row-level security|permission denied|JWT|policy/i.test(message)) {
    return (
      'No permission to save. Please sign out and sign in again, or contact the administrator. ' +
      '(ไม่มีสิทธิ์บันทึก กรุณาออกจากระบบแล้วเข้าสู่ระบบใหม่)'
    );
  }
  return `Could not save: ${message}`;
}

// ---------------------------------------------------------------- fields

function FieldShell(props: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="field">
      <label className="field-label">{props.label}</label>
      {props.hint && <div className="hint">{props.hint}</div>}
      {props.children}
    </div>
  );
}

function LocalizedField(props: {
  field: Extract<Field, { kind: 'localized' }>;
  draft: Row;
  set: (col: string, v: any) => void;
}) {
  const { field, draft, set } = props;
  const cols: Array<['th' | 'en', string]> = [
    ['th', 'ภาษาไทย'],
    ['en', 'English'],
  ];
  return (
    <FieldShell label={field.label} hint={field.hint}>
      <div className="localized-grid">
        {cols.map(([lang, langLabel]) => {
          const col = `${field.base}_${lang}`;
          return (
            <div key={lang} className="localized-cell">
              <span className="lang-badge">{langLabel}</span>
              {field.multiline ? (
                <textarea
                  rows={field.rows ?? 3}
                  value={draft[col] ?? ''}
                  onChange={(e) => set(col, e.target.value)}
                />
              ) : (
                <input
                  type="text"
                  value={draft[col] ?? ''}
                  onChange={(e) => set(col, e.target.value)}
                />
              )}
            </div>
          );
        })}
      </div>
    </FieldShell>
  );
}

function ImageInput(props: {
  table: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function onFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      const url = await uploadImage(props.table, file);
      props.onChange(url);
    } catch (e: any) {
      setErr(friendlyError(e.message ?? String(e)));
    }
    setBusy(false);
  }

  return (
    <div className="image-input">
      <div className="image-preview">
        {props.value ? (
          <img src={props.value} alt="" loading="lazy" />
        ) : (
          <span className="image-empty">No image</span>
        )}
      </div>
      <div className="image-actions">
        <label className={`btn btn-dark ${busy ? 'disabled' : ''}`}>
          {busy ? 'Uploading…' : '⬆ Upload image'}
          <input
            type="file"
            accept="image/*"
            hidden
            disabled={busy}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </label>
        {props.value && (
          <button
            type="button"
            className="btn btn-ghost"
            onClick={() => props.onChange('')}
          >
            Remove
          </button>
        )}
        <input
          type="text"
          className="url-input"
          placeholder="…or paste an image URL"
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
        />
      </div>
      {err && <div className="error">{err}</div>}
    </div>
  );
}

function GalleryField(props: {
  field: Extract<Field, { kind: 'gallery' }>;
  table: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const urls = useMemo(
    () =>
      (props.value || '')
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
    [props.value]
  );
  const setUrls = (arr: string[]) => props.onChange(arr.join('\n'));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  async function addFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    setErr('');
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        added.push(await uploadImage(props.table, file));
      }
      setUrls([...urls, ...added]);
    } catch (e: any) {
      setErr(friendlyError(e.message ?? String(e)));
    }
    setBusy(false);
  }

  function move(i: number, dir: -1 | 1) {
    const j = i + dir;
    if (j < 0 || j >= urls.length) return;
    const next = [...urls];
    [next[i], next[j]] = [next[j], next[i]];
    setUrls(next);
  }

  return (
    <FieldShell
      label={props.field.label}
      hint={props.field.hint ?? 'The first photo appears first on the page.'}
    >
      <div className="gallery">
        {urls.map((url, i) => (
          <div key={`${url}-${i}`} className="gallery-item">
            <img src={url} alt="" loading="lazy" />
            <div className="gallery-tools">
              <button type="button" onClick={() => move(i, -1)} disabled={i === 0} title="Move up">
                ↑
              </button>
              <button
                type="button"
                onClick={() => move(i, 1)}
                disabled={i === urls.length - 1}
                title="Move down"
              >
                ↓
              </button>
              <button
                type="button"
                className="danger"
                onClick={() => setUrls(urls.filter((_, k) => k !== i))}
                title="Remove"
              >
                ✕
              </button>
            </div>
          </div>
        ))}
        <label className={`gallery-add ${busy ? 'disabled' : ''}`}>
          {busy ? 'Uploading…' : '+ Add photo(s)'}
          <input
            type="file"
            accept="image/*"
            multiple
            hidden
            disabled={busy}
            onChange={(e) => addFiles(e.target.files)}
          />
        </label>
      </div>
      {err && <div className="error">{err}</div>}
    </FieldShell>
  );
}

function FkField(props: {
  field: Extract<Field, { kind: 'fk' }>;
  value: number | null;
  refRows: Row[];
  onChange: (v: number | null) => void;
}) {
  return (
    <FieldShell label={props.field.label} hint={props.field.hint}>
      <select
        value={props.value == null ? '' : String(props.value)}
        onChange={(e) =>
          props.onChange(e.target.value === '' ? null : Number(e.target.value))
        }
      >
        <option value="">— none —</option>
        {props.refRows.map((r) => (
          <option key={r.id} value={r.id}>
            {r.title_en || r.title_th || `#${r.id}`}
            {r.title_th && r.title_en ? ` (${r.title_th})` : ''}
          </option>
        ))}
      </select>
    </FieldShell>
  );
}

// ---------------------------------------------------------------- editor form

function EditorForm(props: {
  cfg: TableConfig;
  row: Row; // {} for a new row
  refData: Record<string, Row[]>;
  onClose: () => void;
  onSaved: (msg: string) => void;
}) {
  const { cfg, refData } = props;
  const [draft, setDraft] = useState<Row>(() => ({ ...props.row }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const isNew = draft.id == null;
  const set = (col: string, v: any) => setDraft((d) => ({ ...d, [col]: v }));

  async function save() {
    setSaving(true);
    setError('');
    const payload: Row = {};
    for (const f of cfg.fields) {
      if (f.kind === 'localized') {
        payload[`${f.base}_th`] = draft[`${f.base}_th`] ?? '';
        payload[`${f.base}_en`] = draft[`${f.base}_en`] ?? '';
      } else if (f.kind === 'number') {
        const raw = draft[f.col];
        if (raw === '' || raw == null) {
          payload[f.col] = null;
        } else {
          const n = Number(raw);
          if (Number.isNaN(n)) {
            setError(`"${f.label}" must be a number. (ต้องเป็นตัวเลข)`);
            setSaving(false);
            return;
          }
          payload[f.col] = n;
        }
      } else if (f.kind === 'fk') {
        payload[f.col] = draft[f.col] ?? null;
      } else {
        payload[f.col] = draft[f.col] ?? '';
      }
    }
    const { error } = isNew
      ? await supabase.from(cfg.name).insert(payload)
      : await supabase.from(cfg.name).update(payload).eq('id', draft.id);
    setSaving(false);
    if (error) {
      setError(friendlyError(error.message));
      return;
    }
    props.onSaved(
      isNew
        ? 'Added — it is live on the website now. (เพิ่มแล้ว แสดงบนเว็บไซต์ทันที)'
        : 'Saved — the change is live on the website. (บันทึกแล้ว แสดงบนเว็บไซต์ทันที)'
    );
  }

  return (
    <div className="editor">
      <div className="editor-head">
        <h2>
          {isNew ? `New ${cfg.title.replace(/s$/, '')}` : cfg.rowTitle(draft)}
        </h2>
        <button className="btn btn-ghost" onClick={props.onClose}>
          ← Back to list
        </button>
      </div>

      {cfg.fields.map((f) => {
        switch (f.kind) {
          case 'localized':
            return (
              <LocalizedField key={f.base} field={f} draft={draft} set={set} />
            );
          case 'image':
            return (
              <FieldShell key={f.col} label={f.label} hint={f.hint}>
                <ImageInput
                  table={cfg.name}
                  value={draft[f.col] ?? ''}
                  onChange={(v) => set(f.col, v)}
                />
              </FieldShell>
            );
          case 'gallery':
            return (
              <GalleryField
                key={f.col}
                field={f}
                table={cfg.name}
                value={draft[f.col] ?? ''}
                onChange={(v) => set(f.col, v)}
              />
            );
          case 'fk':
            return (
              <FkField
                key={f.col}
                field={f}
                value={draft[f.col] ?? null}
                refRows={refData[f.refTable] ?? []}
                onChange={(v) => set(f.col, v)}
              />
            );
          case 'select':
            return (
              <FieldShell key={f.col} label={f.label} hint={f.hint}>
                <select
                  value={draft[f.col] ?? ''}
                  onChange={(e) => set(f.col, e.target.value)}
                >
                  <option value="">— choose —</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </FieldShell>
            );
          case 'number':
            return (
              <FieldShell key={f.col} label={f.label} hint={f.hint}>
                <input
                  type="number"
                  step={f.step ?? 'any'}
                  value={draft[f.col] ?? ''}
                  onChange={(e) => set(f.col, e.target.value)}
                />
              </FieldShell>
            );
          case 'color':
            return (
              <FieldShell key={f.col} label={f.label} hint={f.hint}>
                <div className="color-row">
                  <input
                    type="color"
                    value={draft[f.col] || '#FF6B35'}
                    onChange={(e) => set(f.col, e.target.value)}
                  />
                  <input
                    type="text"
                    value={draft[f.col] ?? ''}
                    placeholder="#FF6B35"
                    onChange={(e) => set(f.col, e.target.value)}
                  />
                </div>
              </FieldShell>
            );
          case 'text':
            return (
              <FieldShell key={f.col} label={f.label} hint={f.hint}>
                <input
                  type="text"
                  value={draft[f.col] ?? ''}
                  placeholder={f.placeholder}
                  disabled={!isNew && f.lockOnEdit}
                  onChange={(e) => set(f.col, e.target.value)}
                />
              </FieldShell>
            );
        }
      })}

      {error && <div className="error error-big">{error}</div>}

      <div className="editor-actions">
        <button className="btn btn-primary" onClick={save} disabled={saving}>
          {saving ? 'Saving…' : '💾 Save · บันทึก'}
        </button>
        <button className="btn btn-ghost" onClick={props.onClose} disabled={saving}>
          Cancel
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- collection

export default function CollectionEditor({ cfg }: { cfg: TableConfig }) {
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [editing, setEditing] = useState<Row | null>(null); // {} = new row
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [refData, setRefData] = useState<Record<string, Row[]>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError('');
    const orderBy = cfg.orderBy ?? 'id';
    const { data, error } = await supabase
      .from(cfg.name)
      .select('*')
      .order(orderBy, { ascending: true })
      .order('id', { ascending: true });
    if (error) setLoadError(`Could not load data: ${error.message}`);
    setRows(data ?? []);
    setLoading(false);
  }, [cfg.name, cfg.orderBy]);

  useEffect(() => {
    load();
    // Load FK reference tables (tags/types) once per collection.
    const fkTables = Array.from(
      new Set(
        cfg.fields
          .filter((f): f is Extract<Field, { kind: 'fk' }> => f.kind === 'fk')
          .map((f) => f.refTable)
      )
    );
    fkTables.forEach(async (name) => {
      const { data } = await supabase.from(name).select('*').order('id');
      setRefData((prev) => ({ ...prev, [name]: data ?? [] }));
    });
  }, [cfg, load]);

  function showToast(msg: string) {
    setToast(msg);
    window.setTimeout(() => setToast(''), 4000);
  }

  async function remove(row: Row) {
    const title = cfg.rowTitle(row);
    if (
      !window.confirm(
        `Delete "${title}"?\nThis cannot be undone.\n\nลบ "${title}"? การลบนี้ไม่สามารถย้อนกลับได้`
      )
    )
      return;
    const { error } = await supabase.from(cfg.name).delete().eq('id', row.id);
    if (error) {
      showToast(friendlyError(error.message));
      return;
    }
    showToast('Deleted. (ลบแล้ว)');
    load();
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      Object.values(r).some(
        (v) => typeof v === 'string' && v.toLowerCase().includes(q)
      )
    );
  }, [rows, search]);

  if (editing) {
    return (
      <>
        {toast && <div className="toast">{toast}</div>}
        <EditorForm
          cfg={cfg}
          row={editing}
          refData={refData}
          onClose={() => setEditing(null)}
          onSaved={(msg) => {
            setEditing(null);
            showToast(msg);
            load();
          }}
        />
      </>
    );
  }

  return (
    <div className="collection">
      {toast && <div className="toast">{toast}</div>}
      <div className="collection-head">
        <div>
          <h1>
            {cfg.emoji} {cfg.title}
          </h1>
          <p className="description">{cfg.description}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setEditing({})}>
          + Add new · เพิ่มใหม่
        </button>
      </div>

      <input
        type="search"
        className="search"
        placeholder={`Search ${cfg.title.toLowerCase()}… · ค้นหา`}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {loading && <div className="empty">Loading…</div>}
      {loadError && <div className="error error-big">{loadError}</div>}
      {!loading && !loadError && filtered.length === 0 && (
        <div className="empty">No items found.</div>
      )}

      <div className="row-list">
        {filtered.map((row) => (
          <div key={row.id} className="row-card">
            {cfg.rowImage && (
              <div className="row-thumb">
                {cfg.rowImage(row) ? (
                  <img src={cfg.rowImage(row)!} alt="" loading="lazy" />
                ) : (
                  <span className="image-empty">—</span>
                )}
              </div>
            )}
            <div className="row-body">
              <div className="row-title">{cfg.rowTitle(row)}</div>
              {cfg.rowMeta && <div className="row-meta">{cfg.rowMeta(row)}</div>}
            </div>
            <div className="row-actions">
              <button className="btn btn-dark" onClick={() => setEditing(row)}>
                ✏ Edit
              </button>
              <button className="btn btn-danger" onClick={() => remove(row)}>
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
