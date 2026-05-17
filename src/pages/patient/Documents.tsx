import { FileText, Image, Download, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useRef } from 'react';

const initialFiles = [
  { id: '1', name: 'Panoramic X-Ray', type: 'X-Ray', date: 'Sep 1, 2025', size: '2.4 MB', icon: Image },
  { id: '2', name: 'Initial Smile Photo', type: 'Photo', date: 'Aug 15, 2025', size: '1.8 MB', icon: Image },
  { id: '3', name: 'Treatment Plan Report', type: 'Report', date: 'Sep 15, 2025', size: '450 KB', icon: FileText },
  { id: '4', name: 'Prescription - Post Surgery', type: 'Prescription', date: 'Oct 20, 2025', size: '120 KB', icon: FileText },
];

export default function Documents() {
  const [files, setFiles] = useState(initialFiles);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDownload = (fileName: string) => {
    const element = document.createElement('a');
    const file = new Blob([`Mock document content for ${fileName}\nGenerated on: ${new Date().toLocaleDateString()}`], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = fileName.replace(/\s+/g, '_') + '.txt';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a mock document entry from the uploaded file
      const newDoc = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('image') ? 'Photo' : 'Document',
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        size: (file.size / (1024 * 1024)).toFixed(1) + ' MB',
        icon: file.type.includes('image') ? Image : FileText,
      };
      setFiles([newDoc, ...files]);
      
      // Reset input so the same file can be uploaded again if needed
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Documents</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Your medical records and reports</p></div>
        <div>
          <input type="file" ref={fileInputRef} onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className="btn-primary text-sm !py-2">
            <Upload className="w-4 h-4" /> Upload
          </button>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {files.map((f, i) => (
          <motion.div key={f.id} onClick={() => handleDownload(f.name)} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className="dashboard-card flex items-center gap-4 cursor-pointer group hover:border-primary-400 transition-colors">
            <div className="w-12 h-12 rounded-2xl bg-primary-50 dark:bg-primary-500/10 flex items-center justify-center shrink-0"><f.icon className="w-6 h-6 text-primary-500" /></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary truncate">{f.name}</p>
              <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">{f.type} · {f.date} · {f.size}</p>
            </div>
            <Download className="w-5 h-5 text-gray-400 opacity-0 group-hover:opacity-100 group-hover:text-primary-500 transition-all" />
          </motion.div>
        ))}
      </div>
    </div>
  );
}
