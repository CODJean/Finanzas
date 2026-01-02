import React from 'react';

const StatsCards = ({ stats }) => {
  const cards = [
    {
      title: 'Total Ingresos',
      value: `$${stats.totalIngresos}`,
      color: 'bg-green-500',
      icon: '📈'
    },
    {
      title: 'Total Gastos',
      value: `$${stats.totalGastos}`,
      color: 'bg-red-500',
      icon: '📉'
    },
    {
      title: 'Saldo',
      value: `$${stats.saldo}`,
      color: stats.saldo >= 0 ? 'bg-primary-500' : 'bg-orange-500',
      icon: '💵'
    },
    {
      title: 'Transacciones',
      value: stats.cantidadGastos + stats.cantidadIngresos,
      color: 'bg-secondary-500',
      icon: '📊'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {cards.map((card, index) => (
        <div key={index} className="card">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm mb-1">{card.title}</p>
              <p className="text-2xl font-bold text-gray-900">{card.value}</p>
            </div>
            <div className={`${card.color} w-12 h-12 rounded-full flex items-center justify-center text-2xl`}>
              {card.icon}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
