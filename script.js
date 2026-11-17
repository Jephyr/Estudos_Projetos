/* ==========================================================================
   CONFIGURAÇÃO DO TEMA, DADOS INICIAIS E APLICAÇÃO PRINCIPAL (script.js)
   ========================================================================== */

// Configuração do Tailwind CSS
if (typeof tailwind !== 'undefined') {
  tailwind.config = {
    darkMode: 'class',
    theme: {
      extend: {
        colors: {
          darkBg: '#0f1115',
          lightBg: '#f3f4f6',
          cardBgDark: '#181b22',
          cardBgLight: '#ffffff',
          cyanAccent: '#00f0ff',
          greenAccent: '#10b981',
          greenGlow: '#059669'
        },
        boxShadow: {
          cyanGlow: '0 0 15px rgba(0, 240, 255, 0.35)',
          greenGlow: '0 0 15px rgba(16, 185, 129, 0.35)',
          lightCard: '0 4px 12px rgba(0, 0, 0, 0.05)'
        }
      }
    }
  };
}

// Dados Iniciais das Contas Padrão
const INITIAL_BILLS = [
  { id: '1', title: 'Aluguel', icon: 'fa-house-user', value: 1200.00, dueDate: '2026-08-10', paid: false, category: 'main' },
  { id: '2', title: 'Luz', icon: 'fa-bolt', value: 185.50, dueDate: '2026-08-15', paid: false, category: 'main' },
  { id: '3', title: 'Água', icon: 'fa-droplet', value: 78.90, dueDate: '2026-08-18', paid: true, category: 'main' },
  { id: '4', title: 'Internet', icon: 'fa-wifi', value: 119.90, dueDate: '2026-08-20', paid: false, category: 'main' },
  { id: '5', title: 'Pet', icon: 'fa-paw', value: 150.00, dueDate: '2026-08-22', paid: false, category: 'main' },
  { id: '6', title: 'Combustível', icon: 'fa-gas-pump', value: 300.00, dueDate: '2026-08-25', paid: false, category: 'main' }
];

// Sub-cartões de crédito com cores originais dos bancos
const INITIAL_CARDS = [
  { id: 'c1', title: 'C6 Bank', icon: 'fa-credit-card', value: 840.30, dueDate: '2026-08-10', paid: false, bgClass: 'bg-[#181818] border-yellow-500/50 text-white', accentColor: '#f8c300', appUrl: 'c6bank://' },
  { id: 'c2', title: 'Itaú', icon: 'fa-credit-card', value: 1250.00, dueDate: '2026-08-15', paid: false, bgClass: 'bg-[#ec7000] border-orange-400 text-white', accentColor: '#ff6200', appUrl: 'itau://' },
  { id: 'c3', title: 'Santander', icon: 'fa-credit-card', value: 620.40, dueDate: '2026-08-20', paid: true, bgClass: 'bg-[#cc0000] border-red-400 text-white', accentColor: '#ec0000', appUrl: 'santander://' },
  { id: 'c4', title: 'Mercado Pago', icon: 'fa-credit-card', value: 310.80, dueDate: '2026-08-28', paid: false, bgClass: 'bg-[#00a8e8] border-cyan-300 text-white', accentColor: '#00b1ea', appUrl: 'mercadopago://' }
];

// Outros Gastos Dinâmicos Iniciais
const INITIAL_OTHERS = [
  { id: 'o1', title: 'Academia', icon: 'fa-dumbbell', value: 99.90, dueDate: '2026-08-05', paid: true, category: 'others' },
  { id: 'o2', title: 'Streaming', icon: 'fa-tv', value: 55.90, dueDate: '2026-08-12', paid: false, category: 'others' }
];

/* ==========================================================================
   COMPONENTE DE CAIXA PADRÃO (BillCard)
   ========================================================================== */
function BillCard({ item, darkMode, onTogglePaid, onOpenEdit, formatCurrency, formatDate, useLongPress }) {
  const longPressProps = useLongPress(onOpenEdit, 600);

  return h(
    'div',
    Object.assign({}, longPressProps, {
      onClick: onOpenEdit,
      className: `relative rounded-2xl p-3.5 border border-cyan-500/40 hover:border-cyanAccent transition cursor-pointer flex flex-col justify-between h-32 shadow-md group ${
        darkMode ? 'bg-cardBgDark hover:bg-gray-800/80 text-white' : 'bg-white hover:bg-gray-50 text-gray-900 shadow-lightCard'
      }`
    }),
    // TOPO: Ícone + Bolinha com X (Fica verde quando pago)
    h(
      'div',
      { className: 'flex justify-between items-start' },
      h(
        'div',
        {
          className: `w-8 h-8 rounded-xl border flex items-center justify-center text-cyan-500 text-sm ${
            darkMode ? 'bg-gray-900 border-gray-700' : 'bg-cyan-50 border-cyan-200'
          }`
        },
        h('i', { className: `fa-solid ${item.icon || 'fa-receipt'}` })
      ),
      h(
        'button',
        {
          onClick: onTogglePaid,
          title: item.paid ? 'Marcar como Pendente' : 'Marcar como Pago',
          className: `w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 ${
            item.paid
              ? 'bg-emerald-500 text-slate-950 shadow-greenGlow scale-105'
              : 'bg-rose-600/20 text-rose-500 border border-rose-500/50 hover:bg-rose-600 hover:text-white'
          }`
        },
        item.paid ? h('i', { className: 'fa-solid fa-check' }) : h('i', { className: 'fa-solid fa-xmark' })
      )
    ),
    // MEIO: Nome e Vencimento
    h(
      'div',
      null,
      h('h4', { className: 'font-bold text-xs tracking-wide truncate' }, item.title),
      h(
        'p',
        { className: `text-[10px] flex items-center gap-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}` },
        h('i', { className: 'fa-regular fa-calendar-check text-cyan-500' }),
        'Vence: ',
        formatDate(item.dueDate)
      )
    ),
    // BASE: Valor Editável
    h(
      'div',
      { className: `flex justify-between items-end border-t pt-1.5 ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
      h(
        'span',
        { className: `font-black text-xs ${item.paid ? 'line-through text-gray-400' : 'text-emerald-500'}` },
        formatCurrency(item.value)
      ),
      h('span', { className: 'text-[9px] text-gray-400 group-hover:text-cyan-500' }, 'Editar >')
    )
  );
}

/* ==========================================================================
   COMPONENTE DE CARTÃO BANCÁRIO (BankCard)
   ========================================================================== */
function BankCard({ item, onTogglePaid, onOpenEdit, formatCurrency, formatDate, useLongPress }) {
  const longPressProps = useLongPress(onOpenEdit, 600);

  return h(
    'div',
    Object.assign({}, longPressProps, {
      onClick: onOpenEdit,
      className: `relative rounded-xl p-3 ${item.bgClass || 'bg-[#181818] border-blue-500/50 text-white'} border cursor-pointer flex flex-col justify-between h-28 shadow-lg hover:brightness-110 transition`
    }),
    h(
      'div',
      { className: 'flex justify-between items-center' },
      h('span', { className: 'font-extrabold text-xs tracking-wider uppercase opacity-90' }, item.title),
      h(
        'button',
        {
          onClick: onTogglePaid,
          className: `w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] transition ${
            item.paid
              ? 'bg-emerald-400 text-slate-950'
              : 'bg-black/40 text-white border border-white/40 hover:bg-white hover:text-black'
          }`
        },
        item.paid ? h('i', { className: 'fa-solid fa-check' }) : h('i', { className: 'fa-solid fa-xmark' })
      )
    ),
    h('p', { className: 'text-[10px] opacity-80' }, 'Vence: ', formatDate(item.dueDate)),
    h(
      'div',
      { className: 'flex justify-between items-end pt-1 border-t border-white/20' },
      h(
        'span',
        { className: `font-black text-xs ${item.paid ? 'line-through opacity-60' : 'text-white'}` },
        formatCurrency(item.value)
      ),
      h('i', { className: 'fa-solid fa-angles-right text-[10px] opacity-70' })
    )
  );
}

/* ==========================================================================
   COMPONENTE PRINCIPAL DA APLICAÇÃO (App)
   ========================================================================== */
function App() {
  // Estado de Autenticação (Usuário Logado salvo no navegador da pessoa)
  const [currentUser, setCurrentUser] = useState(() => getActiveSessionUser());

  // Estado de Tema (Claro / Escuro)
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('jefferson_theme');
    return savedTheme ? JSON.parse(savedTheme) : true;
  });

  // Estado para o mês selecionado (formato YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const today = new Date();
    return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}`;
  });

  const [valuesVisible, setValuesVisible] = useState(() => {
    const savedVisibility = localStorage.getItem('jefferson_values_visible');
    return savedVisibility ? JSON.parse(savedVisibility) : true;
  });

  // Carregar e persistir dados no LocalStorage em Tempo Real
  const [bills, setBills] = useState(() => {
    const key = getUserStorageKey(getActiveSessionUser());
    const allData = JSON.parse(localStorage.getItem(key) || '{}');
    return allData[selectedMonth]?.bills || INITIAL_BILLS;
  });

  const [cards, setCards] = useState(() => {
    const key = getUserStorageKey(getActiveSessionUser());
    const allData = JSON.parse(localStorage.getItem(key) || '{}');
    return allData[selectedMonth]?.cards || INITIAL_CARDS;
  });

  const [others, setOthers] = useState(() => {
    const key = getUserStorageKey(getActiveSessionUser());
    const allData = JSON.parse(localStorage.getItem(key) || '{}');
    return allData[selectedMonth]?.others || INITIAL_OTHERS;
  });

  // Estado para controlar a visibilidade do menu lateral
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Notificação Visual de Salvamento Automático
  const [toastMessage, setToastMessage] = useState('Salvo automaticamente!');
  const [showSaveToast, setShowSaveToast] = useState(false);

  const triggerAutoSaveToast = (msg = 'Salvo automaticamente!') => {
    setToastMessage(msg);
    setShowSaveToast(true);
    setTimeout(() => setShowSaveToast(false), 2500);
  };

  // Atualização do tema e visibilidade no LocalStorage
  useEffect(() => {
    localStorage.setItem('jefferson_theme', JSON.stringify(darkMode));
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem('jefferson_values_visible', JSON.stringify(valuesVisible));
  }, [valuesVisible]);

  // Efeito para carregar dados quando o mês ou o usuário muda
  useEffect(() => {
    if (!currentUser) return;
    const storageKey = getUserStorageKey(currentUser);
    const allData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const monthData = allData[selectedMonth];

    if (monthData) {
      setBills(monthData.bills || []);
      setCards(monthData.cards || []);
      setOthers(monthData.others || []);
    } else {
      const resetPaidStatus = (item) => Object.assign({}, item, { paid: false });
      setBills(INITIAL_BILLS.map(resetPaidStatus));
      setCards(INITIAL_CARDS.map(resetPaidStatus));
      setOthers(INITIAL_OTHERS.map(resetPaidStatus));
    }
  }, [selectedMonth, currentUser]);

  // Salvamento automático contínuo para o mês selecionado do usuário atual
  useEffect(() => {
    if (!currentUser) return;
    if (bills.length === 0 && cards.length === 0 && others.length === 0) return;

    const storageKey = getUserStorageKey(currentUser);
    const allData = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const updatedData = Object.assign({}, allData, {
      [selectedMonth]: { bills, cards, others }
    });
    localStorage.setItem(storageKey, JSON.stringify(updatedData));
  }, [bills, cards, others, selectedMonth, currentUser]);

  // Função de Logout
  const handleLogout = () => {
    clearActiveSessionUser();
    setIsMenuOpen(false);
    setCurrentUser(null);
  };

  // Estados de Controle do Modal / Expansão
  const [isCardsExpanded, setIsCardsExpanded] = useState(false);
  const [isOthersExpanded, setIsOthersExpanded] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null); // 'edit', 'new_bill', 'new_card', 'new_other', 'backup'

  // Campos de novo gasto
  const [newItemTitle, setNewItemTitle] = useState('');
  const [newItemValue, setNewItemValue] = useState('');
  const [newItemDate, setNewItemDate] = useState(new Date().toISOString().split('T')[0]);

  // Ref do input de arquivo para importar
  const fileInputRef = useRef(null);

  // Função para EXPORTAR dados em arquivo JSON
  const handleExportData = () => {
    const storageKey = getUserStorageKey(currentUser);
    const dataToExport = {
      version: 2,
      user: currentUser,
      exportDate: new Date().toISOString(),
      financeData: JSON.parse(localStorage.getItem(storageKey) || '{}'),
      settings: {
        darkMode,
        valuesVisible
      }
    };

    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(dataToExport, null, 2))}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    const fileNameDate = new Date().toISOString().split('T')[0];
    const safeUser = (currentUser || 'jefferson').toLowerCase().replace(/[^a-z0-9]/g, '_');
    downloadAnchor.setAttribute('download', `contas_${safeUser}_backup_${fileNameDate}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    triggerAutoSaveToast('Arquivo de backup baixado!');
    setModalType(null);
  };

  // Função para IMPORTAR dados de arquivo JSON
  const handleImportData = (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsedData = JSON.parse(event.target.result);

        if (parsedData.financeData) {
          const storageKey = getUserStorageKey(currentUser);
          localStorage.setItem(storageKey, JSON.stringify(parsedData.financeData));
          setSelectedMonth((prev) => prev);
          window.location.reload();
        }

        if (parsedData.settings?.darkMode !== undefined) setDarkMode(parsedData.settings.darkMode);
        if (parsedData.settings?.valuesVisible !== undefined) setValuesVisible(parsedData.settings.valuesVisible);

        triggerAutoSaveToast('Backup restaurado com sucesso!');
        setModalType(null);
      } catch (err) {
        alert('Erro ao ler o arquivo JSON. Certifique-se de selecionar um arquivo de backup válido.');
      }
    };

    reader.readAsText(file, 'UTF-8');
    e.target.value = '';
  };

  // Cálculo do Total Geral das Contas
  const calculateTotalSum = () => {
    const billsTotal = bills.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    const cardsTotal = cards.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    const othersTotal = others.reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    return billsTotal + cardsTotal + othersTotal;
  };

  const calculatePaidSum = () => {
    const billsPaid = bills.filter((i) => i.paid).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    const cardsPaid = cards.filter((i) => i.paid).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    const othersPaid = others.filter((i) => i.paid).reduce((acc, item) => acc + (Number(item.value) || 0), 0);
    return billsPaid + cardsPaid + othersPaid;
  };

  const totalSum = calculateTotalSum();
  const paidSum = calculatePaidSum();
  const pendingSum = totalSum - paidSum;

  // Alternar estado de Pago / Pendente (Clique na Bolinha)
  const togglePaid = (id, type = 'main', e) => {
    if (e) e.stopPropagation();

    if (type === 'main') {
      setBills((prev) => prev.map((item) => (item.id === id ? Object.assign({}, item, { paid: !item.paid }) : item)));
    } else if (type === 'card') {
      setCards((prev) => prev.map((item) => (item.id === id ? Object.assign({}, item, { paid: !item.paid }) : item)));
    } else if (type === 'other') {
      setOthers((prev) => prev.map((item) => (item.id === id ? Object.assign({}, item, { paid: !item.paid }) : item)));
    }
    triggerAutoSaveToast();
  };

  // Formatar Moeda R$
  const formatCurrency = (val, forceShow = false) => {
    if (!valuesVisible && !forceShow) {
      return 'R$ ●●●';
    }
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  };

  // Formatar Data dd/mm
  const formatDate = (dateString) => {
    if (!dateString) return 'S/ Data';
    const parts = dateString.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}`;
    }
    return dateString;
  };

  // Formatar Mês (Ex: Agosto/2026)
  const formatMonthYear = (monthStr) => {
    const [year, month] = monthStr.split('-');
    const date = new Date(year, month - 1, 1);
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  };

  // Mudar mês
  const changeMonth = (direction) => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const currentDate = new Date(year, month - 1, 1);
    currentDate.setMonth(currentDate.getMonth() + direction);

    const newYear = currentDate.getFullYear();
    const newMonth = String(currentDate.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${newYear}-${newMonth}`);
  };

  // Ação de Segurar (Long Press) para Editar
  const useLongPress = (callback = () => {}, ms = 500) => {
    const timerRef = useRef(null);

    const start = () => {
      timerRef.current = setTimeout(() => {
        callback();
      }, ms);
    };

    const stop = () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };

    return {
      onMouseDown: start,
      onMouseUp: stop,
      onMouseLeave: stop,
      onTouchStart: start,
      onTouchEnd: stop
    };
  };

  // Salvar edições do Item com salvamento instantâneo
  const handleSaveEdit = (updatedItem) => {
    if (updatedItem.type === 'main') {
      setBills((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    } else if (updatedItem.type === 'card') {
      setCards((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    } else if (updatedItem.type === 'other') {
      setOthers((prev) => prev.map((i) => (i.id === updatedItem.id ? updatedItem : i)));
    }
    setSelectedItem(null);
    triggerAutoSaveToast();
  };

  // Adicionar Novo Gasto
  const handleAddItem = (e, type) => {
    e.preventDefault();
    if (!newItemTitle.trim()) return;

    const newItem = {
      id: 'custom_' + Date.now(),
      title: newItemTitle,
      icon: type === 'card' ? 'fa-credit-card' : 'fa-receipt',
      value: parseFloat(newItemValue.replace(',', '.')) || 0,
      dueDate: newItemDate,
      paid: false,
      type: type
    };
    if (type === 'bill') setBills((prev) => [...prev, newItem]);
    else if (type === 'card') setCards((prev) => [...prev, newItem]);
    else if (type === 'other') setOthers((prev) => [...prev, newItem]);
    setNewItemTitle('');
    setNewItemValue('');
    setModalType(null);
    triggerAutoSaveToast();
  };

  // Deletar item
  const handleDeleteItem = (id, type) => {
    if (confirm('Deseja realmente remover esta caixa?')) {
      if (type === 'main') setBills((prev) => prev.filter((i) => i.id !== id));
      if (type === 'card') setCards((prev) => prev.filter((i) => i.id !== id));
      if (type === 'other') setOthers((prev) => prev.filter((i) => i.id !== id));
      setSelectedItem(null);
      triggerAutoSaveToast();
    }
  };

  // Abrir Link/App do Banco
  const handlePayApp = (item) => {
    alert(`Redirecionando para o aplicativo de pagamento (${item.title})...`);
    if (item.appUrl) {
      window.location.href = item.appUrl;
    }
  };

  // Se não estiver logado, exibe a tela de Login / Cadastro / Recuperar Senha
  if (!currentUser) {
    return h(AuthScreen, {
      darkMode: darkMode,
      setDarkMode: setDarkMode,
      onLoginSuccess: (username, rememberMe) => {
        saveActiveSessionUser(username, rememberMe);
        setCurrentUser(username);
        triggerAutoSaveToast(`Bem-vindo(a), ${username}!`);
      }
    });
  }

  return h(
    'div',
    {
      className: `flex-1 flex flex-col p-4 space-y-4 transition-colors duration-300 ${
        darkMode ? 'bg-darkBg text-gray-100' : 'bg-gray-100 text-gray-900'
      }`
    },

    // TOAST DE NOTIFICAÇÃO / SALVAMENTO
    showSaveToast &&
      h(
        'div',
        {
          className:
            'fixed top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-slate-950 font-bold px-4 py-1.5 rounded-full text-xs shadow-lg z-50 flex items-center gap-1.5 animate-bounce'
        },
        h('i', { className: 'fa-solid fa-cloud-arrow-up' }),
        h('span', null, toastMessage)
      ),

    // INPUT OCULTO PARA IMPORTAR ARQUIVO JSON
    h('input', {
      type: 'file',
      ref: fileInputRef,
      onChange: handleImportData,
      accept: '.json',
      className: 'hidden'
    }),

    // BARRA SUPERIOR COM BOTÃO MENU, SELETOR DE MÊS, BACKUP E SELETOR DE TEMA
    h(
      'div',
      { className: 'flex justify-between items-center pt-2 pb-1 px-1 relative' },
      h(
        'button',
        {
          onClick: () => setIsMenuOpen(true),
          className: `text-xl p-1 transition ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-black'}`
        },
        h('i', { className: 'fa-solid fa-bars' })
      ),

      // SELETOR DE MÊS
      h(
        'div',
        { className: 'flex items-center gap-2 font-semibold text-lg' },
        h(
          'button',
          {
            onClick: () => changeMonth(-1),
            className: `p-1 rounded-full ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-black'}`
          },
          h('i', { className: 'fa-solid fa-chevron-left text-sm' })
        ),
        h('span', { className: 'font-bold text-base capitalize cursor-default' }, formatMonthYear(selectedMonth)),
        h(
          'button',
          {
            onClick: () => changeMonth(1),
            className: `p-1 rounded-full ${darkMode ? 'text-gray-500 hover:text-white' : 'text-gray-500 hover:text-black'}`
          },
          h('i', { className: 'fa-solid fa-chevron-right text-sm' })
        )
      ),

      h(
        'div',
        { className: 'flex items-center gap-2' },
        // MENU LATERAL (SIDEBAR)
        isMenuOpen &&
          h(
            React.Fragment,
            null,
            h('div', {
              className: 'fixed inset-0 bg-black/60 z-40',
              onClick: () => setIsMenuOpen(false)
            }),
            h(
              'div',
              {
                className: `fixed top-0 left-0 bottom-0 w-64 p-4 z-50 shadow-2xl flex flex-col justify-between transition-transform transform ${
                  isMenuOpen ? 'translate-x-0' : '-translate-x-full'
                } ${darkMode ? 'bg-darkBg border-r border-gray-800' : 'bg-lightBg border-r border-gray-200'}`
              },
              h(
                'div',
                null,
                h(
                  'div',
                  { className: 'flex justify-between items-center mb-4' },
                  h('h3', { className: 'font-bold text-lg' }, 'Menu'),
                  h(
                    'button',
                    { onClick: () => setIsMenuOpen(false), className: 'p-1' },
                    h('i', { className: 'fa-solid fa-xmark' })
                  )
                ),

                // PERFIL CONECTADO NO MENU
                h(
                  'div',
                  {
                    className: `mb-4 p-3 rounded-xl border flex items-center gap-3 ${
                      darkMode ? 'bg-cardBgDark border-gray-800' : 'bg-white border-gray-200'
                    }`
                  },
                  h(
                    'div',
                    {
                      className:
                        'w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center text-cyan-400 font-bold text-sm'
                    },
                    currentUser.charAt(0).toUpperCase()
                  ),
                  h(
                    'div',
                    { className: 'overflow-hidden' },
                    h('p', { className: 'text-[10px] text-cyan-400 font-bold uppercase tracking-wider' }, 'Conectado como'),
                    h('p', { className: 'text-sm font-extrabold truncate' }, currentUser)
                  )
                ),

                h(
                  'ul',
                  { className: 'space-y-2' },
                  h(
                    'li',
                    null,
                    h(
                      'button',
                      {
                        onClick: () => {
                          setModalType('backup');
                          setIsMenuOpen(false);
                        },
                        className: `w-full text-left flex items-center gap-3 p-2 rounded-lg transition ${
                          darkMode ? 'hover:bg-cardBgDark' : 'hover:bg-gray-200'
                        }`
                      },
                      h('i', { className: 'fa-solid fa-file-arrow-down w-5 text-center text-cyan-400' }),
                      h('span', null, 'Backup & Restaurar')
                    )
                  ),
                  h(
                    'li',
                    null,
                    h(
                      'a',
                      {
                        href: 'https://github.com/jefferson-silva-padtec',
                        target: '_blank',
                        className: `w-full text-left flex items-center gap-3 p-2 rounded-lg transition ${
                          darkMode ? 'hover:bg-cardBgDark' : 'hover:bg-gray-200'
                        }`
                      },
                      h('i', { className: 'fa-brands fa-github w-5 text-center' }),
                      h('span', null, 'Ver no GitHub')
                    )
                  )
                )
              ),

              h(
                'div',
                { className: `pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
                h(
                  'button',
                  {
                    onClick: handleLogout,
                    className:
                      'w-full text-left flex items-center gap-3 p-2.5 rounded-xl text-rose-500 hover:bg-rose-500/10 font-bold text-sm transition'
                  },
                  h('i', { className: 'fa-solid fa-right-from-bracket w-5 text-center' }),
                  h('span', null, 'Sair / Trocar Usuário')
                )
              )
            )
          ),

        // BOTÃO OCULTAR VALORES
        h(
          'button',
          {
            onClick: () => setValuesVisible(!valuesVisible),
            title: valuesVisible ? 'Ocultar valores' : 'Mostrar valores',
            className: `p-2 rounded-xl transition flex items-center justify-center text-sm font-bold ${
              darkMode
                ? 'bg-gray-800 text-gray-400 hover:text-white'
                : 'bg-white text-gray-600 shadow-md hover:bg-gray-50 border border-gray-200'
            }`
          },
          h('i', { className: `fa-solid ${valuesVisible ? 'fa-eye' : 'fa-eye-slash'}` })
        ),

        // BOTÃO ALTERNAR TEMA CLARO / ESCURO
        h(
          'button',
          {
            onClick: () => setDarkMode(!darkMode),
            title: darkMode ? 'Mudar para Tema Claro' : 'Mudar para Tema Escuro',
            className: `p-2 rounded-xl transition flex items-center justify-center text-sm font-bold ${
              darkMode
                ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                : 'bg-white text-indigo-600 shadow-md hover:bg-gray-50 border border-gray-200'
            }`
          },
          h('i', { className: `fa-solid ${darkMode ? 'fa-sun' : 'fa-moon'}` })
        )
      )
    ),

    // CABEÇALHO DO PERFIL: CASA + "Olá, {currentUser}"
    h(
      'div',
      { className: 'flex items-center gap-4 py-2 px-1' },
      h(
        'div',
        {
          className: `w-16 h-16 rounded-2xl flex items-center justify-center text-cyan-400 text-3xl transition ${
            darkMode
              ? 'bg-gradient-to-tr from-cyan-900/40 to-emerald-900/40 border border-cyan-500/50 shadow-cyanGlow'
              : 'bg-gradient-to-tr from-cyan-100 to-emerald-100 border border-cyan-400 shadow-md'
          }`
        },
        h('i', { className: 'fa-solid fa-house' })
      ),
      h(
        'div',
        null,
        h(
          'span',
          { className: 'text-xs font-bold tracking-wider text-cyan-500 dark:text-cyan-400 uppercase' },
          'Residência & Contas'
        ),
        h('h1', { className: 'text-2xl font-extrabold tracking-tight flex items-center gap-2' }, 'Olá, ', currentUser),
        h('p', { className: `text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}` }, 'Controle financeiro pessoal')
      )
    ),

    // CAIXA MAIOR PRINCIPAL - TOTAL SOMADO DAS MENORES
    h(
      'div',
      {
        className: `relative rounded-2xl p-5 border-2 border-cyanAccent transition-all duration-300 shadow-cyanGlow ${
          darkMode
            ? 'bg-gradient-to-b from-[#182026] to-[#12161c]'
            : 'bg-gradient-to-b from-slate-900 to-slate-800 text-white'
        }`
      },
      h(
        'div',
        { className: 'absolute top-3 right-3' },
        h(
          'span',
          {
            className:
              'bg-cyanAccent/20 text-cyanAccent border border-cyanAccent/40 text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider'
          },
          'EXCLUSIVO'
        )
      ),
      h('p', { className: 'text-xs text-gray-300 font-medium' }, 'Total Geral das Contas no Mês'),
      h(
        'div',
        { className: 'mt-1 flex items-baseline gap-2' },
        h('h2', { className: 'text-3xl font-black text-emerald-400 tracking-tight' }, formatCurrency(totalSum, true))
      ),
      // Barra de progresso de pagamentos em verde
      h(
        'div',
        { className: 'mt-3 w-full bg-gray-800 h-2.5 rounded-full overflow-hidden' },
        h('div', {
          className: 'bg-emerald-400 h-full transition-all duration-500 shadow-greenGlow',
          style: { width: `${totalSum > 0 ? (paidSum / totalSum) * 100 : 0}%` }
        })
      ),
      h(
        'div',
        { className: 'mt-3 flex justify-between text-xs text-gray-300 border-t border-gray-800/80 pt-2' },
        h(
          'div',
          { className: 'flex items-center gap-1.5' },
          h('span', { className: 'w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block' }),
          h('span', null, 'Pago: ', h('strong', { className: 'text-emerald-400' }, formatCurrency(paidSum)))
        ),
        h(
          'div',
          { className: 'flex items-center gap-1.5' },
          h('span', { className: 'w-2.5 h-2.5 rounded-full bg-rose-500 inline-block' }),
          h('span', null, 'Pendente: ', h('strong', { className: 'text-rose-400' }, formatCurrency(pendingSum)))
        )
      ),
      h(
        'div',
        { className: 'mt-4 flex justify-between items-center' },
        h(
          'span',
          { className: 'text-xs text-emerald-400 font-medium flex items-center gap-1' },
          h('i', { className: 'fa-solid fa-shield-halved' }),
          ' Proteja seu orçamento'
        ),
        h(
          'button',
          {
            onClick: () => alert(`Total pendente: ${formatCurrency(pendingSum)}`),
            className:
              'bg-cyanAccent hover:bg-cyan-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition shadow-md active:scale-95'
          },
          'Ver Resumo'
        )
      ),
      // Indicadores de slide
      h(
        'div',
        { className: 'flex justify-center gap-1.5 mt-3' },
        h('span', { className: 'w-2 h-2 rounded-full bg-cyanAccent' }),
        h('span', { className: 'w-2 h-2 rounded-full bg-gray-700' })
      )
    ),

    // GRID DE CAIXAS MENORES INDIVIDUAIS
    h(
      'div',
      { className: 'space-y-3' },
      h(
        'h3',
        {
          className: `text-xs font-bold uppercase tracking-wider px-1 flex justify-between items-center ${
            darkMode ? 'text-gray-400' : 'text-gray-600'
          }`
        },
        h('span', null, 'Despesas Fixas'),
        h(
          'div',
          { className: 'flex items-center gap-2' },
          h('span', { className: 'text-[10px] text-cyan-500 font-normal' }, 'Segure para editar'),
          h(
            'button',
            {
              onClick: () => setModalType('new_bill'),
              className: `text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 transition ${
                darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
              }`
            },
            h('i', { className: 'fa-solid fa-plus text-cyan-500' }),
            h('span', null, 'Nova')
          )
        )
      ),

      h(
        'div',
        { className: 'grid grid-cols-2 gap-3' },
        bills.map((item) =>
          h(BillCard, {
            key: item.id,
            item: Object.assign({}, item, { type: 'main' }),
            darkMode: darkMode,
            onTogglePaid: (e) => togglePaid(item.id, 'main', e),
            onOpenEdit: () => {
              setSelectedItem(Object.assign({}, item, { type: 'main' }));
              setModalType('edit');
            },
            formatCurrency: formatCurrency,
            formatDate: formatDate,
            useLongPress: useLongPress
          })
        ),

        // CAIXA CARTÕES DE CRÉDITO (EXPANSÍVEL)
        h(
          'div',
          {
            onClick: () => setIsCardsExpanded(!isCardsExpanded),
            className: `col-span-2 rounded-2xl p-4 border ${
              isCardsExpanded ? 'border-blue-500' : 'border-blue-900/50'
            } cursor-pointer hover:brightness-105 transition flex flex-col justify-between shadow-md ${
              darkMode ? 'bg-gradient-to-r from-[#141b2d] to-[#121622] text-white' : 'bg-slate-900 text-white'
            }`
          },
          h(
            'div',
            { className: 'flex items-center justify-between' },
            h(
              'div',
              { className: 'flex items-center gap-3' },
              h(
                'div',
                {
                  className:
                    'w-10 h-10 rounded-xl bg-blue-600/20 border border-blue-500/40 flex items-center justify-center text-blue-400 text-lg'
                },
                h('i', { className: 'fa-solid fa-credit-card' })
              ),
              h(
                'div',
                null,
                h('h4', { className: 'font-bold text-sm tracking-wide' }, 'TAG CARTÕES'),
                h('p', { className: 'text-xs text-gray-400' }, 'C6, Itaú, Santander, Mercado Pago')
              )
            ),
            h(
              'div',
              { className: 'flex items-center gap-2' },
              h(
                'span',
                { className: 'bg-blue-600 text-white font-extrabold text-xs px-3 py-1 rounded-full uppercase tracking-wider' },
                cards.filter((c) => !c.paid).length
              ),
              h(
                'button',
                {
                  onClick: (e) => {
                    e.stopPropagation();
                    setModalType('new_card');
                  },
                  className: `text-[10px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-1 transition ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`
                },
                h('i', { className: 'fa-solid fa-plus text-blue-400' })
              ),
              h('i', {
                className: `fa-solid fa-chevron-${isCardsExpanded ? 'up' : 'down'} text-gray-400 text-xs transition-transform ml-1`
              })
            )
          ),

          // Sub-caixas expandidas dos bancos
          isCardsExpanded &&
            h(
              'div',
              {
                className: 'mt-4 pt-3 border-t border-gray-800 grid grid-cols-2 gap-2.5',
                onClick: (e) => e.stopPropagation()
              },
              cards.map((card) =>
                h(BankCard, {
                  key: card.id,
                  item: Object.assign({}, card, { type: 'card' }),
                  onTogglePaid: (e) => togglePaid(card.id, 'card', e),
                  onOpenEdit: () => {
                    setSelectedItem(Object.assign({}, card, { type: 'card' }));
                    setModalType('edit');
                  },
                  formatCurrency: formatCurrency,
                  formatDate: formatDate,
                  useLongPress: useLongPress
                })
              )
            )
        )
      )
    ),

    // CATEGORIA OUTROS GASTOS
    h(
      'div',
      {
        className: `rounded-2xl p-4 border transition space-y-3 ${
          darkMode
            ? 'bg-cardBgDark border-emerald-900/40 text-white'
            : 'bg-white border-emerald-300 text-gray-900 shadow-lightCard'
        }`
      },
      h(
        'div',
        {
          onClick: () => setIsOthersExpanded(!isOthersExpanded),
          className: 'flex justify-between items-center cursor-pointer'
        },
        h(
          'div',
          { className: 'flex items-center gap-2.5' },
          h(
            'div',
            {
              className:
                'w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-500 text-sm'
            },
            h('i', { className: 'fa-solid fa-layer-group' })
          ),
          h(
            'div',
            null,
            h('h4', { className: 'font-bold text-sm' }, 'Outros Gastos'),
            h(
              'p',
              { className: `text-[11px] ${darkMode ? 'text-gray-400' : 'text-gray-500'}` },
              'Adicione e controle despesas extras'
            )
          )
        ),
        h(
          'div',
          { className: 'flex items-center gap-2' },
          h(
            'button',
            {
              onClick: (e) => {
                e.stopPropagation();
                setModalType('new_other');
              },
              className:
                'bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 transition active:scale-95'
            },
            h('i', { className: 'fa-solid fa-plus' }),
            ' Nova Caixa'
          ),
          h('i', {
            className: `fa-solid fa-chevron-${isOthersExpanded ? 'up' : 'down'} ${
              darkMode ? 'text-gray-400' : 'text-gray-500'
            } text-xs`
          })
        )
      ),

      isOthersExpanded &&
        h(
          'div',
          { className: `grid grid-cols-2 gap-2.5 pt-2 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
          others.map((item) =>
            h(BillCard, {
              key: item.id,
              item: Object.assign({}, item, { type: 'other' }),
              darkMode: darkMode,
              onTogglePaid: (e) => togglePaid(item.id, 'other', e),
              onOpenEdit: () => {
                setSelectedItem(Object.assign({}, item, { type: 'other' }));
                setModalType('edit');
              },
              formatCurrency: formatCurrency,
              formatDate: formatDate,
              useLongPress: useLongPress
            })
          ),
          others.length === 0 &&
            h(
              'p',
              { className: 'col-span-2 text-center text-xs text-gray-400 py-3' },
              'Nenhum gasto extra cadastrado. Clique em "+ Nova Caixa".'
            )
        )
    ),

    // MODAL DE BACKUP E RESTAURAÇÃO DE ARQUIVO
    modalType === 'backup' &&
      h(
        'div',
        {
          className:
            'fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4'
        },
        h(
          'div',
          {
            className: `w-full max-w-md border border-cyan-500/40 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 ${
              darkMode ? 'bg-cardBgDark text-white' : 'bg-white text-gray-900'
            }`
          },
          h(
            'div',
            { className: `flex justify-between items-center border-b pb-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'h3',
              { className: 'font-bold text-lg text-cyan-400 flex items-center gap-2' },
              h('i', { className: 'fa-solid fa-file-arrow-down' }),
              ' Backup & Restauração'
            ),
            h(
              'button',
              { onClick: () => setModalType(null), className: 'text-gray-400 hover:text-white p-1' },
              h('i', { className: 'fa-solid fa-xmark text-xl' })
            )
          ),
          h(
            'p',
            { className: `text-xs leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-600'}` },
            'Guarde suas contas e status em um arquivo no seu celular/computador ou restaure dados salvos anteriormente.'
          ),
          h(
            'div',
            { className: 'space-y-3 pt-1' },
            // BOTÃO EXPORTAR
            h(
              'button',
              {
                onClick: handleExportData,
                className:
                  'w-full bg-cyanAccent hover:bg-cyan-400 text-slate-950 font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-between shadow-cyanGlow'
              },
              h(
                'div',
                { className: 'flex items-center gap-2.5' },
                h('i', { className: 'fa-solid fa-download text-lg' }),
                h(
                  'div',
                  { className: 'text-left' },
                  h('div', { className: 'font-extrabold' }, 'Salvar em Arquivo'),
                  h('div', { className: 'text-[10px] font-normal opacity-80' }, 'Baixa um arquivo .JSON com seus dados')
                )
              ),
              h('i', { className: 'fa-solid fa-chevron-right text-xs' })
            ),
            // BOTÃO IMPORTAR
            h(
              'button',
              {
                onClick: () => fileInputRef.current && fileInputRef.current.click(),
                className: `w-full border font-bold py-3 px-4 rounded-xl text-sm transition flex items-center justify-between ${
                  darkMode
                    ? 'bg-gray-900 border-gray-700 text-white hover:bg-gray-800'
                    : 'bg-gray-50 border-gray-300 text-gray-900 hover:bg-gray-100'
                }`
              },
              h(
                'div',
                { className: 'flex items-center gap-2.5' },
                h('i', { className: 'fa-solid fa-file-import text-lg text-emerald-500' }),
                h(
                  'div',
                  { className: 'text-left' },
                  h('div', { className: 'font-extrabold' }, 'Carregar de Arquivo'),
                  h(
                    'div',
                    { className: `text-[10px] font-normal ${darkMode ? 'text-gray-400' : 'text-gray-500'}` },
                    'Selecione o arquivo .JSON para restaurar'
                  )
                )
              ),
              h('i', { className: 'fa-solid fa-chevron-right text-xs text-gray-400' })
            )
          ),
          h(
            'div',
            { className: `flex justify-end pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'button',
              {
                onClick: () => setModalType(null),
                className: `px-4 py-2 text-xs font-semibold rounded-xl ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`
              },
              'Fechar'
            )
          )
        )
      ),

    // MODAL DE EDIÇÃO E DETALHES DA CAIXA
    modalType === 'edit' &&
      selectedItem &&
      h(
        'div',
        {
          className:
            'fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4'
        },
        h(
          'div',
          {
            className: `w-full max-w-md border border-cyan-500/40 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 ${
              darkMode ? 'bg-cardBgDark text-white' : 'bg-white text-gray-900'
            }`
          },
          h(
            'div',
            { className: `flex justify-between items-center border-b pb-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'div',
              { className: 'flex items-center gap-2' },
              h('i', { className: `fa-solid ${selectedItem.icon || 'fa-receipt'} text-cyan-400 text-lg` }),
              h('h3', { className: 'font-bold text-lg' }, selectedItem.title)
            ),
            h(
              'button',
              { onClick: () => setSelectedItem(null), className: 'text-gray-400 hover:text-white p-1' },
              h('i', { className: 'fa-solid fa-xmark text-xl' })
            )
          ),
          h(
            'div',
            { className: 'space-y-3' },
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Nome da Conta'),
              h('input', {
                type: 'text',
                value: selectedItem.title,
                onChange: (e) => setSelectedItem(Object.assign({}, selectedItem, { title: e.target.value })),
                className: `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-cyanAccent ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            ),
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Data de Vencimento'),
              h('input', {
                type: 'date',
                value: selectedItem.dueDate || '',
                onChange: (e) => setSelectedItem(Object.assign({}, selectedItem, { dueDate: e.target.value })),
                className: `w-full border rounded-xl px-3 py-2 text-sm outline-none focus:border-cyanAccent ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            ),
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Valor da Conta (R$)'),
              h('input', {
                type: 'number',
                step: '0.01',
                value: selectedItem.value,
                onChange: (e) => setSelectedItem(Object.assign({}, selectedItem, { value: parseFloat(e.target.value) || 0 })),
                className: `w-full border rounded-xl px-3 py-2 text-sm font-bold text-emerald-500 outline-none focus:border-emerald-500 ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
                }`
              })
            ),
            h(
              'div',
              { className: 'pt-2' },
              h(
                'button',
                {
                  onClick: () => handlePayApp(selectedItem),
                  className:
                    'w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2'
                },
                h('i', { className: 'fa-solid fa-external-link' }),
                'PAGAR AGORA NO APP'
              )
            )
          ),
          h(
            'div',
            { className: `flex justify-between items-center pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'button',
              {
                onClick: () => handleDeleteItem(selectedItem.id, selectedItem.type),
                className: 'text-rose-500 text-xs hover:underline flex items-center gap-1'
              },
              h('i', { className: 'fa-solid fa-trash' }),
              ' Excluir'
            ),
            h(
              'div',
              { className: 'flex gap-2' },
              h(
                'button',
                {
                  onClick: () => setSelectedItem(null),
                  className: `px-4 py-2 text-xs font-semibold rounded-xl ${
                    darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                  }`
                },
                'Cancelar'
              ),
              h(
                'button',
                {
                  onClick: () => handleSaveEdit(selectedItem),
                  className: 'px-4 py-2 bg-cyanAccent text-slate-950 text-xs font-bold rounded-xl hover:bg-cyan-400 shadow-cyanGlow'
                },
                'Salvar'
              )
            )
          )
        )
      ),

    // MODAL NOVA CAIXA (Genérico)
    ['new_bill', 'new_card', 'new_other'].includes(modalType) &&
      h(
        'div',
        {
          className:
            'fixed inset-0 bg-black/80 backdrop-blur-sm flex justify-center items-end sm:items-center z-50 p-0 sm:p-4'
        },
        h(
          'form',
          {
            onSubmit: (e) => handleAddItem(e, modalType.replace('new_', '')),
            className: `w-full max-w-md border rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl space-y-4 ${
              darkMode
                ? 'bg-cardBgDark text-white ' +
                  (modalType === 'new_bill'
                    ? 'border-cyan-500/40'
                    : modalType === 'new_card'
                    ? 'border-blue-500/40'
                    : 'border-emerald-500/40')
                : 'bg-white text-gray-900 ' +
                  (modalType === 'new_bill'
                    ? 'border-cyan-300'
                    : modalType === 'new_card'
                    ? 'border-blue-300'
                    : 'border-emerald-300')
            }`
          },
          h(
            'div',
            { className: `flex justify-between items-center border-b pb-3 ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'h3',
              {
                className: `font-bold text-lg flex items-center gap-2 ${
                  modalType === 'new_bill'
                    ? 'text-cyan-400'
                    : modalType === 'new_card'
                    ? 'text-blue-400'
                    : 'text-emerald-500'
                }`
              },
              h('i', { className: 'fa-solid fa-plus-circle' }),
              ' Criar Nova Caixa'
            ),
            h(
              'button',
              {
                type: 'button',
                onClick: () => setModalType(null),
                className: `p-1 ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-black'}`
              },
              h('i', { className: 'fa-solid fa-xmark text-xl' })
            )
          ),
          h(
            'div',
            { className: 'space-y-3' },
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Nome da Caixa / Despesa'),
              h('input', {
                type: 'text',
                placeholder: 'Ex: Netflix, Farmácia...',
                required: true,
                value: newItemTitle,
                onChange: (e) => setNewItemTitle(e.target.value),
                className: `w-full border rounded-xl px-3 py-2 text-sm outline-none ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } ${
                  modalType === 'new_bill'
                    ? 'focus:border-cyan-500'
                    : modalType === 'new_card'
                    ? 'focus:border-blue-500'
                    : 'focus:border-emerald-500'
                }`
              })
            ),
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Data de Vencimento'),
              h('input', {
                type: 'date',
                value: newItemDate,
                onChange: (e) => setNewItemDate(e.target.value),
                className: `w-full border rounded-xl px-3 py-2 text-sm outline-none ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                } ${
                  modalType === 'new_bill'
                    ? 'focus:border-cyan-500'
                    : modalType === 'new_card'
                    ? 'focus:border-blue-500'
                    : 'focus:border-emerald-500'
                }`
              })
            ),
            h(
              'div',
              null,
              h('label', { className: 'text-xs text-gray-400 block mb-1' }, 'Valor Inicial (R$)'),
              h('input', {
                type: 'number',
                step: '0.01',
                placeholder: '0,00',
                value: newItemValue,
                onChange: (e) => setNewItemValue(e.target.value),
                className: `w-full border rounded-xl px-3 py-2 text-sm font-bold outline-none ${
                  darkMode ? 'bg-gray-900 border-gray-700' : 'bg-gray-50 border-gray-300'
                } ${
                  modalType === 'new_bill'
                    ? 'text-cyan-400 focus:border-cyan-500'
                    : modalType === 'new_card'
                    ? 'text-blue-400 focus:border-blue-500'
                    : 'text-emerald-500 focus:border-emerald-500'
                }`
              })
            )
          ),
          h(
            'div',
            { className: `flex justify-end gap-2 pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
            h(
              'button',
              {
                type: 'button',
                onClick: () => setModalType(null),
                className: `px-4 py-2 text-xs font-semibold rounded-xl ${
                  darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-700'
                }`
              },
              'Cancelar'
            ),
            h(
              'button',
              {
                type: 'submit',
                className: `px-5 py-2 text-slate-950 text-xs font-extrabold rounded-xl transition ${
                  modalType === 'new_bill'
                    ? 'bg-cyan-400 hover:bg-cyan-300 shadow-cyanGlow'
                    : modalType === 'new_card'
                    ? 'bg-blue-500 hover:bg-blue-400'
                    : 'bg-emerald-500 hover:bg-emerald-400 shadow-greenGlow'
                }`
              },
              'Criar Caixa'
            )
          )
        )
      )
  );
}

// Inicialização do React no elemento #root
ReactDOM.render(h(App), document.getElementById('root'));
