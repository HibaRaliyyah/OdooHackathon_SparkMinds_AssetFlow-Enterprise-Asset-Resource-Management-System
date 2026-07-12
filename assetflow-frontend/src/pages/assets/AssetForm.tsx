import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { ArrowLeft, Upload, X } from 'lucide-react';
import { assetService, categoryService, departmentService, userService } from '../../services';
import toast from 'react-hot-toast';

const schema = z.object({
  name: z.string().min(2, 'Name required'),
  description: z.string().optional(),
  category: z.string().min(1, 'Category required'),
  department: z.string().optional(),
  status: z.string().default('available'),
  condition: z.string().default('good'),
  location: z.string().optional(),
  serialNumber: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  purchaseDate: z.string().optional(),
  purchasePrice: z.string().optional(),
  vendor: z.string().optional(),
  warrantyExpiry: z.string().optional(),
  tags: z.string().optional(),
});

type AssetFormData = z.infer<typeof schema>;

const AssetForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditMode = !!id;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [images, setImages] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);

  const { data: cats } = useQuery({ queryKey: ['categories'], queryFn: categoryService.getAll });
  const { data: depts } = useQuery({ queryKey: ['departments'], queryFn: departmentService.getAll });

  const { data: assetResponse } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getById(id!),
    enabled: isEditMode,
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssetFormData>({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (isEditMode && assetResponse?.data?.data) {
      const asset = assetResponse.data.data as any;
      reset({
        name: asset.name,
        description: asset.description || '',
        category: asset.category?._id || asset.category || '',
        department: asset.department?._id || asset.department || '',
        status: asset.status,
        condition: asset.condition,
        location: asset.location || '',
        serialNumber: asset.serialNumber || '',
        brand: asset.brand || '',
        model: asset.model || '',
        purchaseDate: asset.purchaseDate ? new Date(asset.purchaseDate).toISOString().split('T')[0] : '',
        purchasePrice: asset.purchasePrice?.toString() || '',
        vendor: asset.vendor || '',
        warrantyExpiry: asset.warrantyExpiry ? new Date(asset.warrantyExpiry).toISOString().split('T')[0] : '',
        tags: Array.isArray(asset.tags) ? asset.tags.join(', ') : (asset.tags || ''),
      });
      if (asset.images) {
        // Preload images if needed, or simply leave previews empty for new uploads
        setPreviews(asset.images);
      }
    }
  }, [isEditMode, assetResponse, reset]);

  const mutation = useMutation({
    mutationFn: (fd: FormData) => isEditMode ? assetService.update(id!, fd) : assetService.create(fd),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      queryClient.invalidateQueries({ queryKey: ['asset', id] });
      toast.success(isEditMode ? 'Asset updated successfully!' : 'Asset registered successfully!');
      navigate('/assets');
    },
    onError: (err: unknown) => toast.error((err as { response?: { data?: { message?: string } } }).response?.data?.message || (isEditMode ? 'Failed to update asset' : 'Failed to create asset')),
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setImages(prev => [...prev, ...files].slice(0, 5));
    files.forEach(f => {
      const reader = new FileReader();
      reader.onload = ev => setPreviews(p => [...p, ev.target?.result as string].slice(0, 5));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImages(prev => prev.filter((_, idx) => idx !== i));
    setPreviews(prev => prev.filter((_, idx) => idx !== i));
  };

  const onSubmit = (data: AssetFormData) => {
    const fd = new FormData();
    Object.entries(data).forEach(([k, v]) => { if (v) fd.append(k, v); });
    images.forEach(img => fd.append('images', img));
    if (data.tags) fd.set('tags', data.tags.split(',').map(t => t.trim()).join(','));
    mutation.mutate(fd);
  };

  const inputCls = 'w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-none focus:border-primary-400 transition-colors';
  const labelCls = 'block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1.5 uppercase tracking-wider';

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500">
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800 dark:text-slate-100">{isEditMode ? 'Edit Asset' : 'Register New Asset'}</h1>
          <p className="text-slate-500 text-sm">{isEditMode ? 'Update asset details below' : 'Fill in asset details below'}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className={labelCls}>Asset Name *</label>
              <input {...register('name')} placeholder="e.g. MacBook Pro 16" className={inputCls} />
              {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Category *</label>
              <select {...register('category')} className={inputCls}>
                <option value="">Select category</option>
                {(cats as { data: { data: { _id: string; name: string }[] } })?.data?.data?.map(c => (
                  <option key={c._id} value={c._id}>{c.name}</option>
                ))}
              </select>
              {errors.category && <p className="text-xs text-red-500 mt-1">{errors.category.message}</p>}
            </div>
            <div>
              <label className={labelCls}>Department</label>
              <select {...register('department')} className={inputCls}>
                <option value="">Select department</option>
                {(depts as { data: { data: { _id: string; name: string }[] } })?.data?.data?.map(d => (
                  <option key={d._id} value={d._id}>{d.name}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className={labelCls}>Description</label>
              <textarea {...register('description')} rows={3} placeholder="Asset description..." className={inputCls} />
            </div>
          </div>
        </div>

        {/* Asset Details */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Asset Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Status</label>
              <select {...register('status')} className={inputCls}>
                <option value="available">Available</option>
                <option value="allocated">Allocated</option>
                <option value="under_maintenance">Maintenance</option>
                <option value="disposed">Disposed</option>
              </select>
            </div>
            <div>
              <label className={labelCls}>Brand</label>
              <input {...register('brand')} placeholder="Apple, Dell, HP..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Model</label>
              <input {...register('model')} placeholder="Model number..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Serial Number</label>
              <input {...register('serialNumber')} placeholder="SN-..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Condition</label>
              <select {...register('condition')} className={inputCls}>
                {['excellent', 'good', 'fair', 'poor', 'damaged'].map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelCls}>Location</label>
              <input {...register('location')} placeholder="Floor 3 - Desk A12" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Tags (comma-separated)</label>
              <input {...register('tags')} placeholder="laptop, development..." className={inputCls} />
            </div>
          </div>
        </div>

        {/* Purchase Info */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Purchase Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={labelCls}>Purchase Date</label>
              <input type="date" {...register('purchaseDate')} className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Purchase Price (USD)</label>
              <input type="number" {...register('purchasePrice')} placeholder="0.00" className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Vendor</label>
              <input {...register('vendor')} placeholder="Vendor name..." className={inputCls} />
            </div>
            <div>
              <label className={labelCls}>Warranty Expiry</label>
              <input type="date" {...register('warrantyExpiry')} className={inputCls} />
            </div>
          </div>
        </div>

        {/* Image Upload */}
        <div className="glass-card p-5">
          <h3 className="font-semibold text-slate-700 dark:text-slate-200 mb-4 text-sm">Asset Images (up to 5)</h3>
          <div className="flex flex-wrap gap-3">
            {previews.map((p, i) => (
              <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                <img src={p} alt="" className="w-full h-full object-cover" />
                <button type="button" onClick={() => removeImage(i)}
                  className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-white">
                  <X size={10} />
                </button>
              </div>
            ))}
            {images.length < 5 && (
              <label className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 flex flex-col items-center justify-center cursor-pointer hover:border-primary-400 transition-colors">
                <Upload size={16} className="text-slate-400" />
                <span className="text-[10px] text-slate-400 mt-1">Upload</span>
                <input type="file" accept="image/*" multiple onChange={handleImageChange} className="hidden" />
              </label>
            )}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => navigate(-1)}
            className="px-6 py-2.5 text-sm rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800">
            Cancel
          </button>
          <button type="submit" disabled={mutation.isPending}
            className="px-6 py-2.5 text-sm rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-semibold hover:from-primary-600 hover:to-secondary-600 disabled:opacity-70">
            {mutation.isPending ? (isEditMode ? 'Updating...' : 'Registering...') : (isEditMode ? 'Update Asset' : 'Register Asset')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AssetForm;
