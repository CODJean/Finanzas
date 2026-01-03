import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import StatsCards from '../components/Dashboard/StatsCards';
import Charts from '../components/Dashboard/Charts';
import DateFilter from '../components/Dashboard/DateFilter';
import TransactionList from '../components/Transactions/TransactionList';
import TransactionForm from '../components/Transactions/TransactionForm';
import ChatBot from '../components/Chat/ChatBot';
import { getResumen, getGastos, getIngresos } from '../services/api';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [gastos, setGastos] = useState([]);
  const [ingresos, setIngresos] = useState([]);
  const [allGastos, setAllGastos] = useState([]);
  const [allIngresos, setAllIngresos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('gasto');
  const [dateFilter, setDateFilter] = useState(null);
  const [showChat, setShowChat] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    filterTransactions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateFilter, allGastos, allIngresos]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resumenRes, gastosRes, ingresosRes] = await Promise.all([
        getResumen(),
        getGastos(),
        getIngresos()
      ]);

      setStats(resumenRes.data);
      setAllGastos(gastosRes.data.gastos);
      setAllIngresos(ingresosRes.data.ingresos);
      setGastos(gastosRes.data.gastos);
      setIngresos(ingresosRes.data.ingresos);
    } catch (error) {
      console.error('Error al cargar datos:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTransactions = () => {
    if (!dateFilter) {
      setGastos(allGastos);
      setIngresos(allIngresos);
      
      // Recalcular estadísticas con todos los datos
      const totalIngresos = allIngresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
      const totalGastos = allGastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
      
      setStats({
        totalIngresos: totalIngresos.toFixed(2),
        totalGastos: totalGastos.toFixed(2),
        saldo: (totalIngresos - totalGastos).toFixed(2),
        cantidadIngresos: allIngresos.length,
        cantidadGastos: allGastos.length
      });
      return;
    }

    const filterDate = new Date(dateFilter);
    filterDate.setHours(0, 0, 0, 0);

    const filteredGastos = allGastos.filter(gasto => {
      const gastoDate = new Date(gasto.fecha);
      gastoDate.setHours(0, 0, 0, 0);
      return gastoDate >= filterDate;
    });

    const filteredIngresos = allIngresos.filter(ingreso => {
      const ingresoDate = new Date(ingreso.fecha);
      ingresoDate.setHours(0, 0, 0, 0);
      return ingresoDate >= filterDate;
    });

    setGastos(filteredGastos);
    setIngresos(filteredIngresos);

    // Recalcular estadísticas con datos filtrados
    const totalIngresos = filteredIngresos.reduce((sum, i) => sum + parseFloat(i.monto), 0);
    const totalGastos = filteredGastos.reduce((sum, g) => sum + parseFloat(g.monto), 0);
    
    setStats({
      totalIngresos: totalIngresos.toFixed(2),
      totalGastos: totalGastos.toFixed(2),
      saldo: (totalIngresos - totalGastos).toFixed(2),
      cantidadIngresos: filteredIngresos.length,
      cantidadGastos: filteredGastos.length
    });
  };

  const handleOpenModal = (type) => {
    setModalType(type);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    loadData();
  };

  const handleFilterChange = (startDate) => {
    setDateFilter(startDate);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-xl text-gray-900 dark:text-white">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bienvenida */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            ¡Hola, {user?.nombre}! 👋
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Aquí está tu resumen financiero
          </p>
        </div>

        {/* Filtros por fecha */}
        <DateFilter onFilterChange={handleFilterChange} />

        {/* Estadísticas */}
        {stats && <StatsCards stats={stats} />}

        {/* Botones de acción */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => handleOpenModal('gasto')}
            className="btn-primary flex items-center gap-2"
          >
            <span>➖</span>
            <span>Agregar Gasto</span>
          </button>
          <button
            onClick={() => handleOpenModal('ingreso')}
            className="btn-secondary flex items-center gap-2"
          >
            <span>➕</span>
            <span>Agregar Ingreso</span>
          </button>
          <button
            onClick={() => setShowChat(true)}
            className="bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2"
          >
            <span>🤖</span>
            <span>Asistente IA</span>
          </button>
        </div>

        {/* Gráficos */}
        <Charts />

        {/* Listas de transacciones */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-20">
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

      {/* Modal para agregar transacciones */}
      {showModal && (
        <TransactionForm
          type={modalType}
          onClose={handleCloseModal}
        />
      )}

      {/* Botón flotante del chat */}
      {!showChat && (
        <button
          onClick={() => setShowChat(true)}
          className="fixed bottom-6 right-6 bg-gradient-to-r from-purple-500 to-primary-500 hover:from-purple-600 hover:to-primary-600 text-white p-4 rounded-full shadow-2xl transition-all hover:scale-110 z-40 animate-pulse"
          title="Abrir FinBot - Asistente IA"
        >
          <span className="text-3xl">🤖</span>
        </button>
      )}

      {/* ChatBot */}
      {showChat && <ChatBot onClose={() => setShowChat(false)} />}
    </div>
  );
};

export default Dashboard;
