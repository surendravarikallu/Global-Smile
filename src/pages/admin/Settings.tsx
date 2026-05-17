import { Settings as SettingsIcon, Save } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Settings</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Clinic configuration and preferences</p></div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="dashboard-card space-y-4">
          <h3 className="font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary flex items-center gap-2"><SettingsIcon className="w-5 h-5 text-primary-500" /> Clinic Information</h3>
          {[['Clinic Name', 'Global Smile Advanced Prosthodontics'], ['Location', 'Vijayawada, Andhra Pradesh'], ['Phone', '+91 866-XXX-XXXX'], ['Email', 'hello@globalsmile.health']].map(([label, val]) => (
            <div key={label}><label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1">{label}</label><input defaultValue={val} className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" /></div>
          ))}
          <button className="btn-primary text-sm !py-2"><Save className="w-4 h-4" /> Save Changes</button>
        </div>
        <div className="dashboard-card space-y-4">
          <h3 className="font-heading font-semibold text-healthcare-text-primary dark:text-dark-text-primary">AI Provider Configuration</h3>
          <div><label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1">Provider</label><select className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none cursor-pointer text-healthcare-text-primary dark:text-dark-text-primary"><option>NVIDIA NIM</option><option>OpenRouter</option><option>Hugging Face</option><option>Demo Mode</option></select></div>
          <div><label className="block text-sm font-medium text-healthcare-text-primary dark:text-dark-text-primary mb-1">API Key</label><input type="password" defaultValue="•••••••••••" className="w-full px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" /></div>
          <button className="btn-secondary text-sm !py-2">Test Connection</button>
        </div>
      </div>
    </div>
  );
}
