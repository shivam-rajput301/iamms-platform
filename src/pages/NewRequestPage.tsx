import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, UploadCloud, X, ImageIcon } from 'lucide-react';
import { PageHeader } from '@/components/ui/PageHeader';
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Input';
import { PageLoader } from '@/components/ui/Spinner';
import { useAssets, useCreateRequest } from '@/lib/hooks';
import { useAuth } from '@/lib/auth';
import { PRIORITIES } from '@/lib/constants';
import type { Priority } from '@/lib/types';

interface UploadedImage {
  file: File;
  previewUrl: string;
}

const MAX_FILES = 5;
const MAX_SIZE_MB = 5;
const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

export function NewRequestPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { data: assets = [], isLoading } = useAssets();
  const createRequest = useCreateRequest();

  const [assetId, setAssetId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('medium');
  const [attachedImages, setAttachedImages] = useState<UploadedImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    setUploadError(null);
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    if (attachedImages.length + files.length > MAX_FILES) {
      setUploadError(`You can attach a maximum of ${MAX_FILES} images per request.`);
      return;
    }

    const validImages: UploadedImage[] = [];
    for (const file of files) {
      if (!ALLOWED_TYPES.includes(file.type)) {
        setUploadError(`"${file.name}" has an unsupported format. Only JPG, JPEG, PNG, and WebP are allowed.`);
        return;
      }
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        setUploadError(`"${file.name}" exceeds the ${MAX_SIZE_MB}MB size limit.`);
        return;
      }
      validImages.push({
        file,
        previewUrl: URL.createObjectURL(file),
      });
    }

    setAttachedImages((prev) => [...prev, ...validImages]);
    // Reset file input value so re-selecting same file works
    e.target.value = '';
  }

  function handleRemoveImage(index: number) {
    setAttachedImages((prev) => {
      const updated = [...prev];
      URL.revokeObjectURL(updated[index].previewUrl);
      updated.splice(index, 1);
      return updated;
    });
    setUploadError(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!assetId || !title) {
      setError('Please select an asset and provide a title.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const code = `MR-${String(Date.now()).slice(-6)}`;
      const base64Images = await Promise.all(attachedImages.map((img) => fileToBase64(img.file)));

      await createRequest.mutateAsync({
        request_code: code,
        asset_id: assetId,
        title,
        description,
        priority,
        status: 'pending',
        requested_by: profile!.id,
        images: base64Images,
      });
      navigate('/requests');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create request');
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate('/requests')} className="mb-4 flex items-center gap-1.5 text-sm text-steel-500 hover:text-steel-700 dark:hover:text-steel-300">
        <ArrowLeft className="h-4 w-4" /> Back to Requests
      </button>
      <PageHeader title="Raise Maintenance Request" description="Report an issue with a plant asset." />

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-4">
        <Card>
          <CardHeader><CardTitle>Request Details</CardTitle></CardHeader>
          <CardBody className="space-y-4">
            <Select label="Asset" required value={assetId} onChange={(e) => setAssetId(e.target.value)}>
              <option value="">Select an asset</option>
              {assets.map((a) => <option key={a.id} value={a.id}>{a.name} ({a.asset_id})</option>)}
            </Select>
            <Input label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Oil leakage near drive unit" />
            <Textarea label="Describe the Issue" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe what you observed, when it started, and any safety concerns." />
            <Select label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as Priority)}>
              {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
            </Select>

            {/* ── Attach Images Upload Component ── */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-steel-700 dark:text-steel-300">
                Attach Images <span className="text-steel-400 font-normal">(Optional, max {MAX_FILES})</span>
              </label>

              {attachedImages.length < MAX_FILES && (
                <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-steel-300 bg-steel-50/50 p-6 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/20 dark:border-steel-700 dark:bg-steel-900/40 dark:hover:border-brand-500">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 dark:bg-brand-900/40 dark:text-brand-400">
                    <UploadCloud className="h-6 w-6" />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-steel-800 dark:text-steel-200">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-steel-500">
                    JPG, JPEG, PNG or WebP (Max {MAX_SIZE_MB}MB per file)
                  </p>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/jpg"
                    multiple
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>
              )}

              {uploadError && (
                <p className="text-xs font-medium text-rose-600 dark:text-rose-400">{uploadError}</p>
              )}

              {/* Image Thumbnails Grid */}
              {attachedImages.length > 0 && (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 pt-2">
                  {attachedImages.map((img, index) => (
                    <div key={index} className="group relative overflow-hidden rounded-xl border border-steel-200 bg-white p-1.5 dark:border-steel-800 dark:bg-steel-900">
                      <img
                        src={img.previewUrl}
                        alt={`Attachment ${index + 1}`}
                        className="h-28 w-full rounded-lg object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveImage(index)}
                        className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600 text-white shadow-md transition-transform hover:scale-110"
                        title="Remove image"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                      <div className="mt-1.5 flex items-center gap-1.5 px-1">
                        <ImageIcon className="h-3 w-3 shrink-0 text-steel-400" />
                        <span className="truncate text-[11px] text-steel-600 dark:text-steel-400">
                          {img.file.name}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {error && (
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-800/60 dark:bg-rose-600/10 dark:text-rose-400">
            {error}
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <Button variant="secondary" type="button" onClick={() => navigate('/requests')}>Cancel</Button>
          <Button type="submit" disabled={saving}><Send className="h-4 w-4" /> {saving ? 'Submitting…' : 'Submit Request'}</Button>
        </div>
      </form>
    </div>
  );
}
