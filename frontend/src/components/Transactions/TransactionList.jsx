import React, { useState } from 'react';
import { deleteGasto, deleteIngreso } from '../../services/api';
import TransactionEditModal from './TransactionEditModal';

const TransactionList = ({ title, transactions, type, onUpdate }) => {
  const [editingTransaction, setEditingTransaction] = useState(null);

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta transacción?')) {
      return;
    }

    try {
      if (type === 'gasto') {
        await deleteGasto(id);
      } else {
        await deleteIngreso(id);
      }
      onUpdate();
    } catch (error) {
      console.error('Error al eliminar:', error);
      alert('Error al eliminar la transacción');
    }
  };

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
  };

  const handleCloseEdit = () => {
    setEditingTransaction(null);
    onUpdate();
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  return (
    <>
      <div className="card">
        <h3 className="text-xl font-bold mb-4 text-gray-800">{title}</h3>
        
        {transactions.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay {type === 'gasto' ? 'gastos' : 'ingresos'} registrados
          </p>
        ) : (
          <div className="space-y-3">
            {transactions.slice(0, 10).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-gray-900">
                      ${parseFloat(transaction.monto).toFixed(2)}
                    </span>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      type === 'gasto' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-green-100 text-green-700'
                    }`}>
                      {transaction.categoria || transaction.fuente}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    {transaction.descripcion || 'Sin descripción'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDate(transaction.fecha)}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-blue-500 hover:text-blue-700 p-2"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-500 hover:text-red-700 p-2"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {editingTransaction && (
        <TransactionEditModal
          transaction={editingTransaction}
          type={type}
          onClose={handleCloseEdit}
        />
      )}
    </>
  );
};

export default TransactionList;
