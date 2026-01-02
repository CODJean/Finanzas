import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import StatsCards from '../components/Dashboard/StatsCards';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionForm from '../components/Transactions/TransactionForm';
import { getResumen, getGastos, getIngresos } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('gasto');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumenRes, gastosRes, ingresosRes] = await Promise.all([
        getResumen(),
        getGastos(),
        getIngresos()
      ]);

      setStats(resumenRes.data);
      setGastos(gastosRes.data.gastos);
      setIngresos(ingresosRes.data.ingresos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    loadData();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p className="text-gray-600 mt-2">
            Aquí está tu resumen financiero
          </p>
        </div>

        {stats && <StatsCards stats={stats} />}

        <div className="flex gap-4 mb-8">
          <button
            onClick={() => handleOpenModal('gasto')}
            className="btn-primary"
          >
            ➖ Agregar Gasto
          </button>
          <button
            onClick={() => handleOpenModal('ingreso')}
            className="btn-secondary"
          >
            ➕ Agregar Ingreso
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TransactionList
            title="Gastos Recientes"
            transactions={gastos}
            type="gasto"
            onUpdate={loadData}
          />
          <TransactionList
            title="Ingresos Recientes"
            transactions={ingresos}
            type="ingreso"
            onUpdate={loadData}
          />
        </div>
      </div>

      {showModal && (
        <TransactionForm
          type={modalType}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default Dashboard;
