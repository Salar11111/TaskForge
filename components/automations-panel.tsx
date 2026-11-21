'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

type Rule = { id: string; trigger: string; action: string };

export function AutomationsPanel() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [trigger, setTrigger] = useState('');
  const [action, setAction] = useState('');

  const addRule = () => {
    if (!trigger || !action) return;
    setRules((r) => [...r, { id: crypto.randomUUID(), trigger, action }]);
    setTrigger('');
    setAction('');
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <Input placeholder="Trigger (e.g. status=Done)" value={trigger} onChange={(e) => setTrigger(e.target.value)} />
        <Input placeholder="Action (e.g. assign to lead)" value={action} onChange={(e) => setAction(e.target.value)} />
        <Button onClick={addRule}>Add</Button>
      </div>
      <ul className="space-y-2">
        {rules.map((r) => (
          <li key={r.id} className="border rounded-md p-2 text-sm">
            <span className="font-medium">When</span> {r.trigger} <span className="font-medium">→</span> {r.action}
          </li>
        ))}
      </ul>
    </div>
  );
}