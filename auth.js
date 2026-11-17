/* ==========================================================================
   AUTENTICAÇÃO, SENHAS E GERENCIAMENTO DE USUÁRIOS (auth.js)
   ========================================================================== */

const { useState, useEffect, useRef } = React;
const h = React.createElement;

// Credenciais padrão de teste (ocultas no código)
const _DEFAULT_AUTH = {
  login: 'Jefferson',
  pass: '11223344'
};

// Chaves do LocalStorage / SessionStorage para Autenticação
const AUTH_KEYS = {
  USERS_LIST: 'finance_users_list',
  ACTIVE_USER: 'finance_active_user'
};

// Funções utilitárias de sessão e armazenamento por usuário
function getSavedUsersList() {
  try {
    return JSON.parse(localStorage.getItem(AUTH_KEYS.USERS_LIST) || '[]');
  } catch {
    return [];
  }
}

function saveUsersList(users) {
  localStorage.setItem(AUTH_KEYS.USERS_LIST, JSON.stringify(users));
}

function getActiveSessionUser() {
  return (
    localStorage.getItem(AUTH_KEYS.ACTIVE_USER) ||
    sessionStorage.getItem(AUTH_KEYS.ACTIVE_USER) ||
    null
  );
}

function saveActiveSessionUser(username, rememberMe) {
  if (rememberMe) {
    localStorage.setItem(AUTH_KEYS.ACTIVE_USER, username);
  } else {
    sessionStorage.setItem(AUTH_KEYS.ACTIVE_USER, username);
  }
}

function clearActiveSessionUser() {
  localStorage.removeItem(AUTH_KEYS.ACTIVE_USER);
  sessionStorage.removeItem(AUTH_KEYS.ACTIVE_USER);
}

function getUserStorageKey(username) {
  if (!username || username.toLowerCase() === 'jefferson') {
    return 'jefferson_finance_data';
  }
  return `finance_data_${username.toLowerCase()}`;
}

/* ==========================================================================
   COMPONENTE: TELA DE LOGIN, CADASTRO DE USUÁRIO E RECUPERAÇÃO DE SENHA
   ========================================================================== */
function AuthScreen({ darkMode, setDarkMode, onLoginSuccess }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register' | 'recover'
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recoveryKey, setRecoveryKey] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Lista de usuários salvos localmente no navegador da pessoa
  const [savedUsers, setSavedUsers] = useState(() => getSavedUsersList());

  const resetFeedback = () => {
    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchMode = (newMode) => {
    resetFeedback();
    setPassword('');
    setConfirmPassword('');
    setRecoveryKey('');
    setMode(newMode);
  };

  // 1. Ação de Login Convencional
  const handleLogin = (e) => {
    e.preventDefault();
    resetFeedback();

    const cleanUser = username.trim();
    if (!cleanUser || !password) {
      setErrorMsg('Preencha o login e a senha.');
      return;
    }

    // Verifica nos usuários salvos no navegador da pessoa
    const foundLocal = savedUsers.find(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
    );

    if (foundLocal) {
      if (foundLocal.password === password) {
        onLoginSuccess(foundLocal.username, rememberMe);
        return;
      } else {
        setErrorMsg('Senha incorreta. Tente novamente ou clique em "Recuperar".');
        return;
      }
    }

    // Verifica a conta de teste oculta no código (Jefferson / 11223344)
    if (
      cleanUser.toLowerCase() === _DEFAULT_AUTH.login.toLowerCase() &&
      password === _DEFAULT_AUTH.pass
    ) {
      onLoginSuccess(_DEFAULT_AUTH.login, rememberMe);
      return;
    }

    setErrorMsg('Usuário ou senha inválidos.');
  };

  // 2. Ação de Criar Novo Usuário (salvo no site/navegador da pessoa)
  const handleRegister = (e) => {
    e.preventDefault();
    resetFeedback();

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Digite um nome de login para o usuário.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('A senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('As senhas digitadas não conferem.');
      return;
    }

    const alreadyExists =
      savedUsers.some((u) => u.username.toLowerCase() === cleanUser.toLowerCase()) ||
      cleanUser.toLowerCase() === _DEFAULT_AUTH.login.toLowerCase();

    if (alreadyExists) {
      setErrorMsg('Este login já existe neste dispositivo. Escolha outro ou faça login.');
      return;
    }

    const newUserObj = {
      username: cleanUser,
      password: password,
      recoveryKey: recoveryKey.trim(),
      createdAt: new Date().toISOString()
    };

    const updatedUsers = [...savedUsers, newUserObj];
    saveUsersList(updatedUsers);
    setSavedUsers(updatedUsers);

    // Já conecta o usuário criado e mantém salvo no site da pessoa
    onLoginSuccess(cleanUser, rememberMe);
  };

  // 3. Ação de Recuperar / Redefinir Senha
  const handleRecover = (e) => {
    e.preventDefault();
    resetFeedback();

    const cleanUser = username.trim();
    if (!cleanUser) {
      setErrorMsg('Informe o seu login de usuário.');
      return;
    }
    if (password.length < 4) {
      setErrorMsg('A nova senha deve ter pelo menos 4 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('A confirmação da nova senha não confere.');
      return;
    }

    const foundIndex = savedUsers.findIndex(
      (u) => u.username.toLowerCase() === cleanUser.toLowerCase()
    );
    const isDefaultUser = cleanUser.toLowerCase() === _DEFAULT_AUTH.login.toLowerCase();

    if (foundIndex === -1 && !isDefaultUser) {
      setErrorMsg('Usuário não encontrado neste navegador.');
      return;
    }

    // Se o usuário cadastrou palavra de segurança, valida
    if (foundIndex !== -1 && savedUsers[foundIndex].recoveryKey) {
      if (
        savedUsers[foundIndex].recoveryKey.toLowerCase() !==
        recoveryKey.trim().toLowerCase()
      ) {
        setErrorMsg('Palavra de recuperação incorreta para este usuário.');
        return;
      }
    }

    const updatedUsers = [...savedUsers];
    if (foundIndex !== -1) {
      updatedUsers[foundIndex] = {
        ...updatedUsers[foundIndex],
        password: password
      };
    } else {
      // Caso seja o usuário padrão (Jefferson) redefinindo a senha localmente
      updatedUsers.push({
        username: _DEFAULT_AUTH.login,
        password: password,
        recoveryKey: recoveryKey.trim(),
        createdAt: new Date().toISOString()
      });
    }

    saveUsersList(updatedUsers);
    setSavedUsers(updatedUsers);

    setPassword('');
    setConfirmPassword('');
    setRecoveryKey('');
    setMode('login');
    setSuccessMsg('Senha redefinida com sucesso! Faça login com a nova senha.');
  };

  return h(
    'div',
    {
      className: `flex-1 flex flex-col justify-between p-6 transition-colors duration-300 ${
        darkMode ? 'bg-darkBg text-gray-100' : 'bg-gray-100 text-gray-900'
      }`
    },
    // TOPO: Alternar tema
    h(
      'div',
      { className: 'flex justify-between items-center' },
      h(
        'div',
        { className: 'flex items-center gap-2 text-cyan-400 font-bold text-xs uppercase tracking-wider' },
        h('i', { className: 'fa-solid fa-shield-halved' }),
        h('span', null, 'Acesso Seguro')
      ),
      h(
        'button',
        {
          type: 'button',
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
    ),

    // CENTRO: Card de Autenticação
    h(
      'div',
      { className: 'my-auto py-4 space-y-6' },
      // Logo / Cabeçalho
      h(
        'div',
        { className: 'text-center space-y-2' },
        h(
          'div',
          {
            className: `w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-cyan-400 text-4xl transition ${
              darkMode
                ? 'bg-gradient-to-tr from-cyan-900/40 to-emerald-900/40 border border-cyan-500/50 shadow-cyanGlow'
                : 'bg-gradient-to-tr from-cyan-100 to-emerald-100 border border-cyan-400 shadow-md'
            }`
          },
          h('i', { className: 'fa-solid fa-wallet' })
        ),
        h('h1', { className: 'text-2xl font-black tracking-tight pt-1' }, 'Contas Pessoais'),
        h(
          'p',
          { className: `text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}` },
          mode === 'login' && 'Entre com seu login e senha para acessar',
          mode === 'register' && 'Crie seu usuário (salvo neste navegador)',
          mode === 'recover' && 'Redefina a senha da sua conta'
        )
      ),

      // Abas de Navegação Rápida
      h(
        'div',
        {
          className: `grid grid-cols-3 p-1 rounded-xl border text-xs font-bold ${
            darkMode ? 'bg-gray-900/90 border-gray-800' : 'bg-gray-200 border-gray-300'
          }`
        },
        h(
          'button',
          {
            type: 'button',
            onClick: () => switchMode('login'),
            className: `py-2 rounded-lg transition ${
              mode === 'login'
                ? 'bg-cyanAccent text-slate-950 shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`
          },
          'Entrar'
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => switchMode('register'),
            className: `py-2 rounded-lg transition ${
              mode === 'register'
                ? 'bg-emerald-500 text-slate-950 shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`
          },
          'Criar Conta'
        ),
        h(
          'button',
          {
            type: 'button',
            onClick: () => switchMode('recover'),
            className: `py-2 rounded-lg transition ${
              mode === 'recover'
                ? 'bg-amber-400 text-slate-950 shadow-sm font-extrabold'
                : 'text-gray-400 hover:text-white'
            }`
          },
          'Recuperar'
        )
      ),

      // Alertas de Erro / Sucesso
      errorMsg &&
        h(
          'div',
          {
            className:
              'bg-rose-500/15 border border-rose-500/50 text-rose-400 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2'
          },
          h('i', { className: 'fa-solid fa-circle-exclamation text-sm' }),
          h('span', null, errorMsg)
        ),
      successMsg &&
        h(
          'div',
          {
            className:
              'bg-emerald-500/15 border border-emerald-500/50 text-emerald-400 px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2'
          },
          h('i', { className: 'fa-solid fa-circle-check text-sm' }),
          h('span', null, successMsg)
        ),

      // FORMULÁRIO: LOGIN CONVENCIONAL
      mode === 'login' &&
        h(
          'form',
          {
            onSubmit: handleLogin,
            className: `rounded-2xl p-5 border space-y-4 shadow-lg ${
              darkMode ? 'bg-cardBgDark border-cyan-500/30' : 'bg-white border-gray-200'
            }`
          },
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1.5' }, 'Login / Usuário'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 text-xs'
              }),
              h('input', {
                type: 'text',
                required: true,
                placeholder: 'Digite seu usuário',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-cyanAccent transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'div',
            null,
            h(
              'div',
              { className: 'flex justify-between items-center mb-1.5' },
              h('label', { className: 'text-xs text-gray-400 font-semibold' }, 'Senha'),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => switchMode('recover'),
                  className: 'text-[11px] text-cyan-400 hover:underline font-medium'
                },
                'Esqueceu a senha?'
              )
            ),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-cyan-400 text-xs'
              }),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Digite sua senha',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-cyanAccent transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              }),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-cyan-400 text-xs p-1'
                },
                h('i', { className: `fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}` })
              )
            )
          ),
          h(
            'div',
            { className: 'flex items-center justify-between pt-1' },
            h(
              'label',
              { className: 'flex items-center gap-2 text-xs text-gray-400 cursor-pointer' },
              h('input', {
                type: 'checkbox',
                checked: rememberMe,
                onChange: (e) => setRememberMe(e.target.checked),
                className: 'rounded accent-cyan-400'
              }),
              h('span', null, 'Manter login salvo neste site')
            )
          ),
          h(
            'button',
            {
              type: 'submit',
              className:
                'w-full bg-cyanAccent hover:bg-cyan-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition shadow-cyanGlow active:scale-95 flex items-center justify-center gap-2'
            },
            h('i', { className: 'fa-solid fa-right-to-bracket' }),
            h('span', null, 'ENTRAR NA CONTA')
          ),
          savedUsers.length > 0 &&
            h(
              'div',
              { className: `pt-3 border-t ${darkMode ? 'border-gray-800' : 'border-gray-200'}` },
              h('p', { className: 'text-[11px] text-gray-400 mb-2' }, 'Usuários salvos neste navegador:'),
              h(
                'div',
                { className: 'flex flex-wrap gap-1.5' },
                savedUsers.map((u) =>
                  h(
                    'button',
                    {
                      key: u.username,
                      type: 'button',
                      onClick: () => {
                        setUsername(u.username);
                        resetFeedback();
                      },
                      className: `text-xs px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition ${
                        username.toLowerCase() === u.username.toLowerCase()
                          ? 'border-cyanAccent bg-cyan-500/20 text-cyan-300 font-bold'
                          : darkMode
                          ? 'border-gray-700 bg-gray-800/70 text-gray-300 hover:border-gray-600'
                          : 'border-gray-300 bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`
                    },
                    h('i', { className: 'fa-solid fa-user-check text-[10px] text-cyan-400' }),
                    h('span', null, u.username)
                  )
                )
              )
            )
        ),

      // FORMULÁRIO: CRIAR NOVO USUÁRIO
      mode === 'register' &&
        h(
          'form',
          {
            onSubmit: handleRegister,
            className: `rounded-2xl p-5 border space-y-3.5 shadow-lg ${
              darkMode ? 'bg-cardBgDark border-emerald-500/30' : 'bg-white border-gray-200'
            }`
          },
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Novo Login / Nome de Usuário'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-user-plus absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs'
              }),
              h('input', {
                type: 'text',
                required: true,
                placeholder: 'Ex: Maria, João...',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Criar Senha'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-lock absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs'
              }),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Mínimo 4 caracteres',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-emerald-500 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              }),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-emerald-400 text-xs p-1'
                },
                h('i', { className: `fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}` })
              )
            )
          ),
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Confirmar Senha'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-check-double absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs'
              }),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Repita a senha',
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'div',
            null,
            h(
              'label',
              { className: 'text-xs text-gray-400 font-semibold block mb-1' },
              'Palavra de Recuperação ',
              h('span', { className: 'text-[10px] font-normal opacity-75' }, '(Opcional)')
            ),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400 text-xs'
              }),
              h('input', {
                type: 'text',
                placeholder: 'Ex: nome do pet, cidade natal...',
                value: recoveryKey,
                onChange: (e) => setRecoveryKey(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-emerald-500 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'button',
            {
              type: 'submit',
              className:
                'w-full bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition shadow-greenGlow active:scale-95 flex items-center justify-center gap-2'
            },
            h('i', { className: 'fa-solid fa-user-check' }),
            h('span', null, 'CRIAR E SALVAR NO SITE')
          )
        ),

      // FORMULÁRIO: RECUPERAR SENHA
      mode === 'recover' &&
        h(
          'form',
          {
            onSubmit: handleRecover,
            className: `rounded-2xl p-5 border space-y-3.5 shadow-lg ${
              darkMode ? 'bg-cardBgDark border-amber-500/30' : 'bg-white border-gray-200'
            }`
          },
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Seu Login / Usuário'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs'
              }),
              h('input', {
                type: 'text',
                required: true,
                placeholder: 'Digite o login para recuperar',
                value: username,
                onChange: (e) => setUsername(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-amber-400 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'div',
            null,
            h(
              'label',
              { className: 'text-xs text-gray-400 font-semibold block mb-1' },
              'Palavra de Recuperação ',
              h('span', { className: 'text-[10px] font-normal opacity-75' }, '(se tiver cadastrado)')
            ),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-key absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs'
              }),
              h('input', {
                type: 'text',
                placeholder: 'Deixe em branco se não cadastrou',
                value: recoveryKey,
                onChange: (e) => setRecoveryKey(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-amber-400 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Nova Senha'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-lock-open absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs'
              }),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Digite a nova senha',
                value: password,
                onChange: (e) => setPassword(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-10 py-2.5 text-sm outline-none focus:border-amber-400 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              }),
              h(
                'button',
                {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  className: 'absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-amber-400 text-xs p-1'
                },
                h('i', { className: `fa-solid ${showPassword ? 'fa-eye-slash' : 'fa-eye'}` })
              )
            )
          ),
          h(
            'div',
            null,
            h('label', { className: 'text-xs text-gray-400 font-semibold block mb-1' }, 'Confirmar Nova Senha'),
            h(
              'div',
              { className: 'relative' },
              h('i', {
                className: 'fa-solid fa-check-double absolute left-3.5 top-1/2 -translate-y-1/2 text-amber-400 text-xs'
              }),
              h('input', {
                type: showPassword ? 'text' : 'password',
                required: true,
                placeholder: 'Repita a nova senha',
                value: confirmPassword,
                onChange: (e) => setConfirmPassword(e.target.value),
                className: `w-full border rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-amber-400 transition ${
                  darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-gray-50 border-gray-300 text-gray-900'
                }`
              })
            )
          ),
          h(
            'button',
            {
              type: 'submit',
              className:
                'w-full bg-amber-400 hover:bg-amber-300 text-slate-950 font-extrabold py-3 rounded-xl text-sm transition shadow-md active:scale-95 flex items-center justify-center gap-2'
            },
            h('i', { className: 'fa-solid fa-rotate-right' }),
            h('span', null, 'REDEFINIR SENHA')
          )
        )
    ),

    // RODAPÉ
    h(
      'div',
      { className: 'text-center text-[11px] text-gray-500' },
      'Seus dados e login ficam salvos com segurança no seu navegador.'
    )
  );
}
