import { MessageSquare, Send } from 'lucide-react';
import { useState } from 'react';
import { motion } from 'framer-motion';

const msgs = [
  { id: '1', from: 'Dr. Priya Sharma', role: 'Specialist', content: 'Hi Sarah! Your healing progress looks excellent. We can proceed with the next phase in June.', time: '2:30 PM', date: 'May 15', isMine: false },
  { id: '2', from: 'You', role: 'Patient', content: 'Thank you, Doctor! Should I continue with the same medication?', time: '3:15 PM', date: 'May 15', isMine: true },
  { id: '3', from: 'Dr. Priya Sharma', role: 'Specialist', content: 'Yes, please continue for two more weeks. I\'ll send updated instructions before your appointment.', time: '4:00 PM', date: 'May 15', isMine: false },
];

export default function Messages() {
  const [msg, setMsg] = useState('');
  return (
    <div className="space-y-6">
      <div><h2 className="text-2xl font-heading font-bold text-healthcare-text-primary dark:text-dark-text-primary">Messages</h2><p className="text-sm text-healthcare-text-muted dark:text-dark-text-muted mt-1">Communicate with your care team</p></div>
      <div className="dashboard-card flex flex-col h-[500px]">
        <div className="flex-1 overflow-y-auto space-y-4 p-4">
          {msgs.map((m, i) => (
            <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }} className={`flex ${m.isMine ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] p-4 rounded-2xl ${m.isMine ? 'bg-gradient-primary text-white' : 'bg-gray-50 dark:bg-dark-surface text-healthcare-text-primary dark:text-dark-text-primary'}`}>
                {!m.isMine && <p className="text-xs font-semibold mb-1 opacity-70">{m.from}</p>}
                <p className="text-sm">{m.content}</p>
                <p className={`text-xs mt-2 ${m.isMine ? 'text-white/60' : 'text-healthcare-text-muted dark:text-dark-text-muted'}`}>{m.time}</p>
              </div>
            </motion.div>
          ))}
        </div>
        <div className="p-4 border-t border-healthcare-border dark:border-dark-border flex gap-3">
          <input value={msg} onChange={e => setMsg(e.target.value)} placeholder="Type a message..." className="flex-1 px-4 py-2.5 rounded-xl border border-healthcare-border dark:border-dark-border bg-white dark:bg-dark-surface text-sm outline-none focus:ring-2 focus:ring-primary-400 text-healthcare-text-primary dark:text-dark-text-primary" />
          <button className="btn-primary !py-2.5 !px-4"><Send className="w-4 h-4" /></button>
        </div>
      </div>
    </div>
  );
}
