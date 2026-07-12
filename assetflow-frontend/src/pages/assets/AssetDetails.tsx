import React, { useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { QRCodeSVG } from 'qrcode.react';
import toast from 'react-hot-toast';
import { ArrowLeft, Edit, Trash2, Printer, MapPin, Tag, Box, Info } from 'lucide-react';
import { assetService } from '../../services';
import { Asset } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../lib/utils';
import { CardSkeleton } from '../../components/common/Skeleton';

const AssetDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const printRef = useRef<HTMLDivElement>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const { data: res, isLoading } = useQuery({
    queryKey: ['asset', id],
    queryFn: () => assetService.getById(id as string),
    enabled: !!id,
  });

  const asset = res?.data?.data as Asset;

  const handlePrint = () => {
    window.print();
  };

  const deleteMutation = useMutation({
    mutationFn: () => assetService.delete(id as string),
    onSuccess: () => {
      toast.success('Asset deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['assets'] });
      navigate('/assets');
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Failed to delete asset');
    }
  });

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };
  
  const confirmDelete = () => {
    deleteMutation.mutate();
    setShowDeleteConfirm(false);
  };

  if (isLoading) {
    return <div className="p-6"><CardSkeleton /></div>;
  }

  if (!asset) {
    return <div className="p-6 text-center text-slate-500">Asset not found.</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors print:hidden">
            <ArrowLeft size={20} className="text-slate-600 dark:text-slate-300" />
          </button>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Asset Details</h1>
        </div>
        <div className="flex gap-2 print:hidden">
          <button onClick={handlePrint} className="btn-secondary">
            <Printer size={16} /> Print QR
          </button>
          <button onClick={() => navigate(`/assets/${id}/edit`)} className="btn-primary">
            <Edit size={16} /> Edit Asset
          </button>
          <button 
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            className="btn-danger"
          >
            <Trash2 size={16} /> {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card p-6">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">{asset.name}</h2>
                <p className="text-sm text-slate-500">{asset.assetId}</p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(asset.status)}`}>
                {asset.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-6 mb-6">
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Box size={14} /> Category</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.category?.name || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><MapPin size={14} /> Location</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.location || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Info size={14} /> Condition</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 capitalize">{asset.condition}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-xs text-slate-500 mb-1">Brand</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{asset.brand || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Model</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{asset.model || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Serial Number</p>
                <p className="text-sm text-slate-800 dark:text-slate-200">{asset.serialNumber || 'N/A'}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Purchase Price</p>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {asset.purchasePrice ? formatCurrency(asset.purchasePrice) : 'N/A'}
                </p>
              </div>
            </div>
            
            <div className="border-t border-slate-200 dark:border-slate-800 pt-6 mt-6">
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1"><Tag size={14} /> Tags</p>
              <div className="flex flex-wrap gap-2">
                {asset.tags?.length ? asset.tags.map(tag => (
                  <span key={tag} className="px-2 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs rounded-md">
                    #{tag}
                  </span>
                )) : <span className="text-xs text-slate-400">No tags</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="glass-card p-6 flex flex-col items-center justify-center text-center">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Asset QR Code</h3>
            <div ref={printRef} className="bg-white p-4 rounded-xl shadow-sm mb-4 print-only">
              <QRCodeSVG value={`https://assetflow.com/assets/${asset._id}`} size={160} level="H" includeMargin />
            </div>
            <p className="text-xs text-slate-500 mb-4">Scan to view or manage this asset from a mobile device.</p>
            <button onClick={handlePrint} className="text-sm text-primary-600 hover:text-primary-700 font-medium">
              Download QR Code
            </button>
          </div>

          <div className="glass-card p-6">
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-4">Lifecycle & Ownership</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">Department</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.department?.name || 'Unassigned'}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">Assigned To</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {asset.assignedTo ? `${asset.assignedTo.firstName} ${asset.assignedTo.lastName}` : 'Unassigned'}
                </span>
              </div>
              <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs text-slate-500">Purchase Date</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.purchaseDate ? formatDate(asset.purchaseDate) : 'N/A'}</span>
              </div>
              <div className="flex justify-between items-center py-2">
                <span className="text-xs text-slate-500">Warranty Expiry</span>
                <span className="text-sm font-medium text-slate-800 dark:text-slate-200">{asset.warrantyExpiry ? formatDate(asset.warrantyExpiry) : 'N/A'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl max-w-md w-full p-6 animate-scale-in">
            <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">Delete Asset</h3>
            <p className="text-slate-600 dark:text-slate-300 mb-6">
              Are you sure you want to delete this asset? This action cannot be undone and will remove all associated data.
            </p>
            <div className="flex justify-end gap-3">
              <button 
                onClick={() => setShowDeleteConfirm(false)}
                className="btn-secondary"
                disabled={deleteMutation.isPending}
              >
                Cancel
              </button>
              <button 
                onClick={confirmDelete}
                className="btn-danger"
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? 'Deleting...' : 'Delete Asset'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssetDetails;
