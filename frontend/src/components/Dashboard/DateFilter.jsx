import React from 'react';
import { startOfWeek, startOfMonth, startOfYear, format } from 'date-fns';

const DateFilter = ({ onFilterChange }) => {
  const filters = [
    { label: 'Todo', value: 'all' },
    { label: 'Hoy', value: 'today' },
    { label: 'Esta Semana', value: 'week' },
    { label: 'Este Mes', value: 'month' },
    { label: 'Este Año', value: 'year' }
  ];

  const getDateRange = (filterValue) => {
    const now = new Date();
    let startDate = null;

    switch (filterValue) {
      case 'today':
        startDate = format(now, 'yyyy-MM-dd');
        break;
      case 'week':
        startDate = format(startOfWeek(now, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        break;
      case 'month':
        startDate = format(startOfMonth(now), 'yyyy-MM-dd');
        break;
      case 'year':
        startDate = format(startOfYear(now), 'yyyy-MM-dd');
        break;
      default:
        startDate = null;
    }

    return startDate;
  };

  const handleFilterClick = (filterValue) => {
    const startDate = getDateRange(filterValue);
    onFilterChange(startDate);
  };

  return (
    <div className="card mb-6">
      <h3 className="text-lg font-semibold mb-3 text-gray-800">Filtrar por fecha</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => handleFilterClick(filter.value)}
            className="px-4 py-2 bg-gray-100 hover:bg-primary-500 hover:text-white rounded-lg transition-colors text-sm font-medium"
          >
            {filter.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default DateFilter;
