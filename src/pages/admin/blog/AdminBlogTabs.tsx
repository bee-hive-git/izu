import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';

const TABS = [
  { label: 'Posts', to: '/admin/blog', end: true },
  { label: 'Categorias', to: '/admin/blog/categorias', end: false },
];

export function AdminBlogTabs() {
  return (
    <div className="flex gap-1 rounded-lg bg-slate-200/70 p-1 w-fit">
      {TABS.map((tab) => (
        <NavLink
          key={tab.to}
          to={tab.to}
          end={tab.end}
          className={({ isActive }) =>
            cn(
              'rounded-md px-4 py-1.5 text-sm font-medium transition-colors',
              isActive ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900',
            )
          }
        >
          {tab.label}
        </NavLink>
      ))}
    </div>
  );
}
