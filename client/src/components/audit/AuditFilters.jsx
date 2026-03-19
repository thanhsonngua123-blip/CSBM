import {
  AUDIT_ACTION_OPTIONS,
  AUDIT_ROLE_OPTIONS,
  AUDIT_SORT_OPTIONS
} from '../../constants/audit.constants';

function AuditFilters({ filters, total, onFilterChange }) {
  return (
    <div className="grid gap-3 rounded-xl border border-slate-200 bg-white p-4 md:grid-cols-4">
      <select
        value={filters.role}
        onChange={(event) => onFilterChange('role', event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
      >
        {AUDIT_ROLE_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.action}
        onChange={(event) => onFilterChange('action', event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
      >
        {AUDIT_ACTION_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <select
        value={filters.sort}
        onChange={(event) => onFilterChange('sort', event.target.value)}
        className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500"
      >
        {AUDIT_SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      <div className="flex items-center text-sm text-slate-500">Tổng số: {total} bản ghi</div>
    </div>
  );
}

export default AuditFilters;
