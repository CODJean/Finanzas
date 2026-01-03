import React, { useState, useEffect } from 'react';
import { getPresupuestos, deletePresupuesto } from '../../services/api';
import BudgetForm from './BudgetForm';
import BudgetProgress from './BudgetProgress';

const BudgetList = () => {
  const [presupuestos, setPresupuestos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);

  useEffect(() => {
    loadPresupuestos();
  }, []);

  const loadPresupuestos = async () => {
    try {
      const response = await getPresupuestos();
      setPresupuestos(response.data.presupuestos);
    } catch (error) {
      console.error('Error al cargar presupuestos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar este presupuesto?')) {
      return;
    }

    try {
      await deletePresupuesto(id);
      loadPresupuestos();
    } catch (error) {
      console.error('Error al eliminar presupuesto:', error);
      alert('Error al eliminar el presupuesto');
    }
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBudget(null);
    loadPresupuestos();
  };

  if (loading) {
    return <div className="text-center py-8">Cargando presupuestos...</div>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Presupuestos</h2>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary"
        >
          ➕ Nuevo Presupuesto
        </button>
      </div>

      {presupuestos.length === 0 ? (
        <div className="card text-center py-8">
          <p className="text-gray-500 mb-4">No tienes presupuestos configurados</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn-primary"
          >
            Crear tu primer presupuesto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {presupuestos.map((presupuesto) => (
            <BudgetProgress
              key={presupuesto.id}
              presupuesto={presupuesto}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {showModal && (
        <BudgetForm
          budget={editingBudget}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default BudgetList;
