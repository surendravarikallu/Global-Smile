import { useState, useCallback, useRef, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Scan, AlertTriangle, Loader2, Eye, Smile, Camera, FileText, X, Plus, ChevronDown, ChevronUp } from 'lucide-react';

const DentalViewer3D = lazy(() => import('@/components/DentalViewer3D'));

interface ImageSlot {
  key: string;
  label: string;
  description: string;
  icon: any;
  data: string | null;
}

interface DocSlot {
  id: string;
  name: string;
  type: string;
  data: string | null;
}

export default function SmileVisualizer() {
  const [imageSlots, setImageSlots] = useState<ImageSlot[]>([
    { key: 'smile', label: 'Smile Photo', description: 'Front-facing smile showing teeth', icon: Smile, data: null },
    { key: 'inside', label: 'Inside Mouth', description: 'Open mouth view of teeth & gums', icon: Camera, data: null },
    { key: 'upper', label: 'Upper Jaw (Teeth)', description: 'Top teeth / upper arch view', icon: Camera, data: null },
    { key: 'lower', label: 'Lower Jaw (Teeth)', description: 'Bottom teeth / lower arch view', icon: Camera, data: null },
  ]);

  const [documents, setDocuments] = useState<DocSlot[]>([]);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const [expandedFindings, setExpandedFindings] = useState(true);
  const [expandedRecs, setExpandedRecs] = useState(true);
  const docInputRef = useRef<HTMLInputElement>(null);

  const hasAnyImage = imageSlots.some(s => s.data !== null);
  const uploadedCount = imageSlots.filter(s => s.data !== null).length + documents.length;

  const handleSlotFile = useCallback((slotKey: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImageSlots(prev => prev.map(s =>
        s.key === slotKey ? { ...s, data: e.target?.result as string } : s
      ));
    };
    reader.readAsDataURL(file);
  }, []);

  const clearSlot = (slotKey: string) => {
    setImageSlots(prev => prev.map(s =>
      s.key === slotKey ? { ...s, data: null } : s
    ));
    setAnalysis(null);
  };

  const handleDocUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setDocuments(prev => [...prev, {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: file.type.includes('image') ? 'image' : 'document',
        data: ev.target?.result as string,
      }]);
    };
    reader.readAsDataURL(file);
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const removeDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  const analyzeAll = async () => {
    if (!hasAnyImage) return;
    setAnalyzing(true);
    try {
      // Collect all images into an array
      const images: { type: string; base64: string }[] = [];
      for (const slot of imageSlots) {
        if (slot.data) {
          images.push({ type: slot.key, base64: slot.data.split(',')[1] });
        }
      }
      for (const doc of documents) {
        if (doc.data && doc.type === 'image') {
          images.push({ type: `document:${doc.name}`, base64: doc.data.split(',')[1] });
        }
      }

      // Send primary image (first available) for backward compatibility
      const primaryImage = images[0]?.base64 || 'demo';
      const res = await fetch('/api/ai/analyze-smile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: primaryImage,
          images,
          documentCount: documents.length,
        }),
      });
      const data = await res.json();
      setAnalysis(data);
    } catch {
      // Fallback to demo
      const res = await fetch('/api/ai/analyze-smile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: 'demo' }),
      });
      const data = await res.json();
      setAnalysis(data);
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">AI Dental Analysis</h2>
        <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">
          Upload smile, jaw, and mouth photos for comprehensive AI-powered dental analysis
        </p>
      </div>

      {/* Upload Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {imageSlots.map((slot, i) => (
          <motion.div
            key={slot.key}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="dashboard-card !p-0 overflow-hidden"
          >
            {slot.data ? (
              <div className="relative">
                <img src={slot.data} alt={slot.label} className="w-full h-40 object-cover" />
                <button
                  onClick={() => clearSlot(slot.key)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/90 hover:bg-red-600 text-white transition cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                  <p className="text-xs font-medium text-white">{slot.label}</p>
                </div>
              </div>
            ) : (
              <label className="flex flex-col items-center justify-center h-40 cursor-pointer hover:bg-primary-50/50 dark:hover:bg-primary-500/5 transition-colors">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleSlotFile(slot.key, e.target.files[0])}
                  className="hidden"
                />
                <slot.icon className="w-8 h-8 text-primary-300 mb-2" />
                <p className="text-xs font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{slot.label}</p>
                <p className="text-[10px] text-healthcare-text-muted dark:text-dark-text-muted mt-0.5 text-center px-2">{slot.description}</p>
              </label>
            )}
          </motion.div>
        ))}
      </div>

      {/* Documents Section */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="dashboard-card">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary-500" />
            <h3 className="text-sm font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">
              Attach Documents
            </h3>
            <span className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">(X-rays, reports, prescriptions)</span>
          </div>
          <div>
            <input type="file" ref={docInputRef} onChange={handleDocUpload} accept="image/*,.pdf" className="hidden" />
            <button onClick={() => docInputRef.current?.click()} className="btn-secondary text-xs !py-1.5 !px-3 cursor-pointer">
              <Plus className="w-3.5 h-3.5" /> Add File
            </button>
          </div>
        </div>

        {documents.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {documents.map(doc => (
              <div key={doc.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 dark:bg-dark-surface border border-healthcare-border dark:border-dark-border">
                {doc.type === 'image' && doc.data ? (
                  <img src={doc.data} alt={doc.name} className="w-8 h-8 rounded object-cover" />
                ) : (
                  <FileText className="w-4 h-4 text-primary-500" />
                )}
                <span className="text-xs font-medium text-healthcare-text-primary dark:text-dark-text-primary max-w-[120px] truncate">{doc.name}</span>
                <button onClick={() => removeDoc(doc.id)} className="p-0.5 rounded hover:bg-red-100 dark:hover:bg-red-500/10 cursor-pointer transition">
                  <X className="w-3.5 h-3.5 text-red-400" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">No documents attached. You can add X-rays or other reports for a more comprehensive analysis.</p>
        )}
      </motion.div>

      {/* Analyze Button */}
      <div className="flex items-center gap-4">
        <button onClick={analyzeAll} disabled={analyzing || !hasAnyImage} className="btn-primary flex-1 sm:flex-none">
          {analyzing ? <><Loader2 className="w-4 h-4 animate-spin" /> Analyzing {uploadedCount} file(s)...</> : <><Scan className="w-4 h-4" /> Analyze {uploadedCount} File(s) with AI</>}
        </button>
        {hasAnyImage && !analyzing && (
          <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted hidden sm:block">
            {uploadedCount} image(s) / document(s) ready
          </p>
        )}
      </div>

      {/* Results */}
      <AnimatePresence mode="wait">
        {analyzing ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="dashboard-card flex flex-col items-center justify-center min-h-[300px]">
            <div className="w-20 h-20 rounded-full bg-gradient-primary flex items-center justify-center animate-pulse-soft mb-4">
              <Scan className="w-10 h-10 text-white" />
            </div>
            <p className="font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">Analyzing your dental images...</p>
            <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Reviewing {uploadedCount} file(s). This may take a few seconds.</p>
            <div className="w-48 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full mt-4 overflow-hidden">
              <motion.div animate={{ x: ['-100%', '100%'] }} transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }} className="w-1/2 h-full bg-gradient-primary rounded-full" />
            </div>
          </motion.div>
        ) : analysis ? (
          <motion.div key="results" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            {/* 3D Dental Visualization */}
            <Suspense fallback={
              <div className="dashboard-card flex items-center justify-center h-[420px] bg-slate-900 rounded-2xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary-400" />
              </div>
            }>
              <DentalViewer3D
                findings={analysis.analysis?.findings}
                aesthetics={analysis.analysis?.aestheticAssessment}
                overallScore={analysis.analysis?.overallScore}
              />
            </Suspense>

            {/* Score + Aesthetics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Score card */}
              <div className="dashboard-card">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">Dental Health Score</h3>
                  <span className="text-3xl font-bold gradient-text">{analysis.analysis?.overallScore || 74}/100</span>
                </div>
                <div className="w-full h-3 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${analysis.analysis?.overallScore || 74}%` }} transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full bg-gradient-primary rounded-full" />
                </div>
                {analysis.analysis?.summary && (
                  <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-4 leading-relaxed">{analysis.analysis.summary}</p>
                )}
              </div>

              {/* Aesthetics radar-like card */}
              {analysis.analysis?.aestheticAssessment && (
                <div className="dashboard-card">
                  <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary mb-4">Aesthetic Assessment</h3>
                  <div className="space-y-3">
                    {Object.entries(analysis.analysis.aestheticAssessment).map(([key, val]: [string, any]) => (
                      <div key={key}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-medium text-healthcare-text-secondary dark:text-dark-text-secondary capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                          <span className="text-xs font-bold text-primary-500">{val}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 dark:bg-dark-border rounded-full overflow-hidden">
                          <motion.div initial={{ width: 0 }} animate={{ width: `${val}%` }} transition={{ duration: 0.8, ease: 'easeOut' }}
                            className={`h-full rounded-full ${val >= 80 ? 'bg-emerald-400' : val >= 60 ? 'bg-amber-400' : 'bg-red-400'}`} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Findings */}
            <div className="dashboard-card">
              <button onClick={() => setExpandedFindings(!expandedFindings)} className="flex items-center justify-between w-full cursor-pointer">
                <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">
                  Findings ({(analysis.analysis?.findings || []).length})
                </h3>
                {expandedFindings ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
              </button>
              {expandedFindings && (
                <div className="space-y-3 mt-4">
                  {(analysis.analysis?.findings || []).map((f: any) => (
                    <div key={f.id} className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-dark-surface">
                      <Eye className={`w-5 h-5 mt-0.5 shrink-0 ${f.severity === 'severe' ? 'text-red-500' : f.severity === 'moderate' ? 'text-amber-500' : 'text-primary-500'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{f.issue}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full ${f.severity === 'severe' ? 'bg-red-100 text-red-600 dark:bg-red-500/10 dark:text-red-400' : f.severity === 'moderate' ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/10 dark:text-amber-400' : 'bg-primary-100 text-primary-600 dark:bg-primary-500/10 dark:text-primary-400'}`}>
                            {f.severity}
                          </span>
                          {f.location && <span className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">• {f.location}</span>}
                        </div>
                        <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1">{f.description}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="text-xs text-healthcare-text-muted dark:text-dark-text-muted">Confidence:</span>
                          <div className="flex-1 h-1.5 bg-gray-200 dark:bg-dark-border rounded-full max-w-[100px]">
                            <div className="h-full bg-primary-400 rounded-full" style={{ width: `${f.confidence}%` }} />
                          </div>
                          <span className="text-xs font-medium text-primary-500">{f.confidence}%</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Recommendations */}
            {analysis.analysis?.recommendations && (
              <div className="dashboard-card">
                <button onClick={() => setExpandedRecs(!expandedRecs)} className="flex items-center justify-between w-full cursor-pointer">
                  <h3 className="text-lg font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">
                    Recommendations ({analysis.analysis.recommendations.length})
                  </h3>
                  {expandedRecs ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                </button>
                {expandedRecs && (
                  <div className="space-y-3 mt-4">
                    {analysis.analysis.recommendations.map((r: any, idx: number) => (
                      <div key={idx} className="p-3 rounded-xl bg-gray-50 dark:bg-dark-surface flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${r.priority === 'high' ? 'bg-red-100 dark:bg-red-500/10' : r.priority === 'medium' ? 'bg-amber-100 dark:bg-amber-500/10' : 'bg-emerald-100 dark:bg-emerald-500/10'}`}>
                          <span className={`text-xs font-bold ${r.priority === 'high' ? 'text-red-600 dark:text-red-400' : r.priority === 'medium' ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                            {r.priority === 'high' ? '!' : r.priority === 'medium' ? '•' : '✓'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-semibold text-healthcare-text-primary dark:text-dark-text-primary">{r.treatment}</span>
                            {r.estimatedCostRange && (
                              <span className="text-xs px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 font-medium">
                                {r.estimatedCostRange}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-healthcare-text-muted dark:text-dark-text-muted mt-1">{r.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-700 dark:text-amber-400">{analysis.disclaimer}</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="dashboard-card flex flex-col items-center justify-center min-h-[240px]">
            <Scan className="w-16 h-16 text-primary-200 dark:text-primary-500/30 mb-4" />
            <p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted text-center max-w-md">
              Upload your dental photos above — smile, inside mouth, upper & lower jaw — and optionally attach X-rays or reports, then click <strong>Analyze</strong> for a comprehensive AI dental assessment.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
