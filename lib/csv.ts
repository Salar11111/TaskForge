export function exportTasksCsv(tasks: Array<{ id: string; title: string; status: string; priority: string; dueDate: string | null }>) {
  const header = ['id', 'title', 'status', 'priority', 'dueDate'];
  const rows = tasks.map((t) => [t.id, `"${t.title.replace(/"/g, '""')}"`, t.status, t.priority, t.dueDate ?? ''].join(','));
  const csv = [header.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'tasks.csv';
  a.click();
  URL.revokeObjectURL(url);
}

export function parseTasksCsv(text: string): Array<{ title: string; status: string; priority: string; dueDate: string | null }> {
  const lines = text.trim().split(/\r?\n/);
  const header = lines[0].split(',');
  const idx = (name: string) => header.indexOf(name);
  return lines.slice(1).map((line) => {
    const cols = line.split(',');
    return {
      title: cols[idx('title')]?.replace(/^"|"$/g, '') ?? '',
      status: cols[idx('status')] ?? 'TODO',
      priority: cols[idx('priority')] ?? 'MEDIUM',
      dueDate: cols[idx('dueDate')] || null,
    };
  });
}