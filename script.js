// Estado global de la aplicación
const appState = {
    user: null,
    currentPage: 'landing-page',
    currentDashboardSubpage: 'dashboard-home',
    selectedPlan: { name: '', price: 0 },
    adminExists: null
};

// --- Navegación ---
function navigateTo(pageId) {
    // Remover clase active de todas las páginas
    document.querySelectorAll('.page').forEach(p => {
        p.classList.remove('active');
    });
    
    // Agregar clase active a la página destino
    const targetPage = document.getElementById(pageId);
    if (targetPage) {
        targetPage.classList.add('active');
        appState.currentPage = pageId;
        
        // Scroll al inicio de la página
        window.scrollTo(0, 0);
        
        // Re-inicializar iconos de Lucide y animaciones
        setTimeout(() => {
            lucide.createIcons();
            // Re-inicializar animaciones de scroll para la nueva página
            initScrollAnimations();
        }, 50);
    }
}

function navigateToSection(sectionId) {
    const section = document.getElementById(sectionId);
    if (section) {
        section.scrollIntoView({ behavior: 'smooth' });
    }
}

function navigateToCheckout(planName, planPrice) {
    appState.selectedPlan = { name: planName, price: planPrice };
    document.getElementById('checkout-plan-name').textContent = planName;
    document.getElementById('checkout-plan-price').textContent = `${planPrice}€/mes`;
    navigateTo('checkout-page');
}

function showDashboardSubpage(subpageId) {
    document.querySelectorAll('.dashboard-subpage').forEach(p => p.classList.remove('active'));
    const targetSubpage = document.getElementById(subpageId);
    if (targetSubpage) {
        targetSubpage.classList.add('active');
        appState.currentDashboardSubpage = subpageId;
        
        if (subpageId === 'dashboard-home') {
            setTimeout(initChart, 100);
        }
    }
}

// --- Lógica de Autenticación ---
async function handleLogin(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    try {
        UIHelpers.showLoading(submitBtn);
        
        const email = document.getElementById('login-email').value;
        const password = document.getElementById('login-password').value;
        
        const response = await AuthAPI.login({ email, password });
        
        if (response.success) {
            appState.user = response.data;
            console.log('Login exitoso, usuario:', appState.user);
            UIHelpers.showSuccess('¡Inicio de sesión exitoso!');
            
            // Actualizar header
            updateHeaderUI();
            
            // Admin va al panel de administración
            if (response.data.role === 'admin') {
                console.log('Navegando a admin-page...');
                navigateTo('admin-page');
                setTimeout(() => {
                    console.log('Mostrando admin-home...');
                    showAdminSubpage('admin-home');
                }, 100);
            } else {
                // Usuarios normales vuelven a la landing
                navigateTo('landing-page');
            }
        }
    } catch (error) {
        UIHelpers.showError(error.message || 'Error al iniciar sesión');
    } finally {
        UIHelpers.hideLoading(submitBtn);
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    try {
        UIHelpers.showLoading(submitBtn);
        
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-password-confirm').value;
        
        // Validación de contraseñas
        if (password !== confirmPassword) {
            UIHelpers.showError('Las contraseñas no coinciden');
            UIHelpers.hideLoading(submitBtn);
            return;
        }
        
        const response = await AuthAPI.register({ name, email, password });
        
        if (response.success) {
            appState.user = response.data;
            UIHelpers.showSuccess('¡Registro exitoso! Bienvenido a IAWorks.');
            
            // Actualizar header
            updateHeaderUI();
            
            // Usuarios normales vuelven a la landing
            navigateTo('landing-page');
        }
    } catch (error) {
        UIHelpers.showError(error.message || 'Error al registrarse');
    } finally {
        UIHelpers.hideLoading(submitBtn);
    }
}

function handleLogout() {
    AuthAPI.logout();
    appState.user = null;
    updateHeaderUI();
    UIHelpers.showSuccess('Sesión cerrada correctamente');
    navigateTo('landing-page');
}

// Actualizar UI del header según estado de login
function updateHeaderUI() {
    const headerButtons = document.getElementById('header-buttons');
    const headerUser = document.getElementById('header-user');
    const userNameHeader = document.getElementById('user-name-header');
    
    if (appState.user && appState.user.token) {
        // Usuario logueado - mostrar nombre y botón cerrar sesión
        headerButtons.classList.add('hidden');
        headerUser.classList.remove('hidden');
        headerUser.classList.add('flex');
        if (userNameHeader && appState.user.name) {
            userNameHeader.textContent = appState.user.name;
        }
    } else {
        // Usuario no logueado - mostrar botones login/register
        headerButtons.classList.remove('hidden');
        headerUser.classList.add('hidden');
        headerUser.classList.remove('flex');
    }
}

// --- Lógica de Checkout y Pagos ---
let currentPaymentData = null;
let selectedPaymentMethod = null;

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Actualizar estilos de botones
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'bg-indigo-50');
        btn.classList.add('border-gray-300');
    });
    
    const selectedBtn = document.getElementById(`btn-${method}`);
    selectedBtn.classList.remove('border-gray-300');
    selectedBtn.classList.add('border-indigo-500', 'bg-indigo-50');
    
    // Mostrar botón de pago
    document.getElementById('pay-button').classList.remove('hidden');
    
    lucide.createIcons();
}

async function processPayment() {
    if (!selectedPaymentMethod) {
        UIHelpers.showError('Selecciona un método de pago');
        return;
    }
    
    if (!appState.user || !appState.user.token) {
        UIHelpers.showError('Debes iniciar sesión para continuar');
        navigateTo('login-page');
        return;
    }
    
    const payButton = document.getElementById('pay-button');
    
    try {
        UIHelpers.showLoading(payButton);
        
        // Crear intención de pago
        const plan = appState.selectedPlan.name.toLowerCase();
        const response = await PaymentAPI.createIntent(plan, selectedPaymentMethod);
        
        if (response.success) {
            currentPaymentData = response.data;
            
            // Mostrar detalles según método de pago
            showPaymentDetails(selectedPaymentMethod, response.data);
        }
    } catch (error) {
        UIHelpers.showError(error.message || 'Error al procesar pago');
    } finally {
        UIHelpers.hideLoading(payButton);
    }
}

function showPaymentDetails(method, data) {
    const detailsDiv = document.getElementById('payment-details');
    detailsDiv.classList.remove('hidden');
    
    if (method === 'paypal') {
        detailsDiv.innerHTML = `
            <div class="p-6 bg-blue-50 rounded-lg border border-blue-200">
                <h3 class="font-bold text-lg mb-4">Pago con PayPal</h3>
                <p class="text-sm text-gray-700 mb-4">Serás redirigido a PayPal para completar el pago de <strong>${appState.selectedPlan.price}€</strong></p>
                <p class="text-sm text-gray-600 mb-4">Email del negocio: <strong>${data.paypalEmail}</strong></p>
                <button onclick="redirectToPayPal()" class="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700">
                    Pagar con PayPal
                </button>
            </div>
        `;
    } else if (method === 'usdc') {
        detailsDiv.innerHTML = `
            <div class="p-6 bg-green-50 rounded-lg border border-green-200">
                <h3 class="font-bold text-lg mb-4">Pago con USDC</h3>
                <p class="text-sm text-gray-700 mb-2">Envía <strong>${data.amount} USDC</strong> a la siguiente wallet:</p>
                <div class="mt-3 p-3 bg-white rounded border break-all">
                    <code class="text-xs">${data.usdcWallet}</code>
                </div>
                <div class="mt-4">
                    <label class="block text-sm font-medium mb-2">Hash de la transacción:</label>
                    <input id="crypto-tx-hash" type="text" placeholder="0x..." class="w-full p-2 border rounded">
                </div>
                <div class="mt-3">
                    <label class="block text-sm font-medium mb-2">Tu dirección (desde):</label>
                    <input id="crypto-from-address" type="text" placeholder="0x..." class="w-full p-2 border rounded">
                </div>
                <button onclick="confirmCryptoPayment()" class="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 mt-4">
                    Confirmar Pago
                </button>
            </div>
        `;
    } else if (method === 'bank_transfer') {
        detailsDiv.innerHTML = `
            <div class="p-6 bg-purple-50 rounded-lg border border-purple-200">
                <h3 class="font-bold text-lg mb-4">Transferencia Bancaria</h3>
                <p class="text-sm text-gray-700 mb-4">Realiza una transferencia de <strong>${appState.selectedPlan.price}€</strong> a la siguiente cuenta:</p>
                <div class="space-y-2 text-sm mb-4">
                    <div class="flex justify-between">
                        <span class="text-gray-600">Banco:</span>
                        <span class="font-medium">${data.bankInfo.bankName}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">IBAN:</span>
                        <span class="font-medium">${data.bankInfo.iban}</span>
                    </div>
                    <div class="flex justify-between">
                        <span class="text-gray-600">Titular:</span>
                        <span class="font-medium">${data.bankInfo.accountHolder}</span>
                    </div>
                </div>
                <div class="p-3 bg-yellow-100 border border-yellow-300 rounded mb-4">
                    <p class="text-sm font-bold text-yellow-800">⚠️ IMPORTANTE: Usa esta referencia</p>
                    <p class="text-lg font-mono font-bold text-center mt-2">${data.bankInfo.reference}</p>
                </div>
                <div class="mt-4">
                    <label class="block text-sm font-medium mb-2">URL del comprobante (opcional):</label>
                    <input id="bank-proof-url" type="url" placeholder="https://..." class="w-full p-2 border rounded">
                </div>
                <button onclick="confirmBankTransfer()" class="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 mt-4">
                    Confirmar que he realizado la transferencia
                </button>
            </div>
        `;
    }
}

function redirectToPayPal() {
    // TODO: Integrar con PayPal SDK o generar link de pago
    const paypalEmail = currentPaymentData.paypalEmail;
    const amount = appState.selectedPlan.price;
    const description = `IAWorks - Plan ${appState.selectedPlan.name}`;
    
    // Por ahora, simular pago exitoso
    UIHelpers.showSuccess('Redirigiendo a PayPal...');
    setTimeout(async () => {
        try {
            // Simular confirmación de PayPal
            const orderId = 'PAYPAL_' + Date.now();
            const payerId = 'PAYER_' + Math.random().toString(36).substr(2, 9);
            
            const response = await PaymentAPI.confirmPayPal(
                currentPaymentData.paymentId,
                orderId,
                payerId
            );
            
            if (response.success) {
                UIHelpers.showSuccess('¡Pago completado! Tu suscripción está activa.');
                setTimeout(() => navigateTo('landing-page'), 2000);
            }
        } catch (error) {
            UIHelpers.showError(error.message);
        }
    }, 1500);
}

async function confirmCryptoPayment() {
    const txHash = document.getElementById('crypto-tx-hash').value;
    const fromAddress = document.getElementById('crypto-from-address').value;
    
    if (!txHash || !fromAddress) {
        UIHelpers.showError('Por favor completa todos los campos');
        return;
    }
    
    try {
        const response = await PaymentAPI.confirmCrypto(
            currentPaymentData.paymentId,
            txHash,
            fromAddress
        );
        
        if (response.success) {
            UIHelpers.showSuccess('Transacción registrada. Verificando en blockchain...');
            setTimeout(() => navigateTo('landing-page'), 2000);
        }
    } catch (error) {
        UIHelpers.showError(error.message);
    }
}

async function confirmBankTransfer() {
    const proofUrl = document.getElementById('bank-proof-url').value;
    
    try {
        const response = await PaymentAPI.confirmBankTransfer(
            currentPaymentData.paymentId,
            proofUrl || ''
        );
        
        if (response.success) {
            UIHelpers.showSuccess('Transferencia registrada. El administrador verificará tu pago.');
            setTimeout(() => navigateTo('landing-page'), 2000);
        }
    } catch (error) {
        UIHelpers.showError(error.message);
    }
}

// Cargar datos del dashboard del usuario
async function loadUserDashboard() {
    if (!appState.user) return;
    
    try {
        const response = await AuthAPI.getProfile();
        
        if (response.success) {
            const userData = response.data;
            appState.user = { ...appState.user, ...userData };
            TokenService.setUser(appState.user);
            
            // Actualizar UI con datos reales
            updateDashboardUI(userData);
        }
    } catch (error) {
        console.error('Error al cargar dashboard:', error);
        // No mostrar error al usuario, solo en consola
        // El dashboard se mostrará con los datos básicos del token
    }
}

// Actualizar UI del dashboard con datos reales
function updateDashboardUI(userData) {
    // Actualizar nombre del usuario si hay un elemento para eso
    const welcomeElements = document.querySelectorAll('[data-user-name]');
    welcomeElements.forEach(el => {
        el.textContent = userData.name;
    });
    
    // Actualizar contadores
    const leadsCountEl = document.querySelector('[data-leads-count]');
    if (leadsCountEl) {
        leadsCountEl.textContent = userData.leadsCount || 0;
    }
    
    const appointmentsCountEl = document.querySelector('[data-appointments-count]');
    if (appointmentsCountEl) {
        appointmentsCountEl.textContent = userData.appointmentsCount || 0;
    }
    
    // Actualizar estado de configuraciones
    updateConfigStatus('smtp', userData.smtpConfigured);
    updateConfigStatus('instagram', userData.instagramConfigured);
}

function updateConfigStatus(service, isConfigured) {
    const statusEl = document.querySelector(`[data-config-${service}]`);
    if (statusEl) {
        statusEl.textContent = isConfigured ? 'Configurado ✓' : 'No configurado';
        statusEl.className = isConfigured ? 'text-green-600' : 'text-gray-500';
    }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar estado del usuario
    appState.user = TokenService.getUser();
    
    // Actualizar UI del header
    updateHeaderUI();
    
    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    // Verificar si hay usuario logueado
    if (appState.user && appState.user.token) {
        // Admin va al panel de administración automáticamente
        if (appState.user.role === 'admin') {
            navigateTo('admin-page');
            setTimeout(() => {
                showAdminSubpage('admin-home');
            }, 100);
        }
        // Usuarios normales quedan en landing page
    } else {
        // Verificar si existe admin para mostrar pantalla de setup
        checkInitialSetup();
    }
    
    // Inicializar gráfico si estamos en el dashboard
    if (appState.currentPage === 'dashboard-page') {
        setTimeout(initChart, 100);
    }
    
    // Inicializar animaciones de scroll
    initScrollAnimations();
});

// Verificar estado de autenticación
async function checkAuthStatus() {
    try {
        const response = await AuthAPI.getProfile();
        if (response.success) {
            appState.user = { ...appState.user, ...response.data };
            TokenService.setUser(appState.user);
        }
    } catch (error) {
        // Token inválido o expirado, limpiar sesión
        AuthAPI.logout();
        appState.user = null;
    }
}

// Verificar setup inicial del sistema
async function checkInitialSetup() {
    try {
        const response = await AuthAPI.checkAdminExists();
        appState.adminExists = response.adminExists;
        
        // Si no existe admin, mostrar pantalla de setup
        if (!response.adminExists) {
            showAdminSetupScreen();
        }
    } catch (error) {
        console.error('Error al verificar admin:', error);
    }
}

// Mostrar pantalla de setup inicial
function showAdminSetupScreen() {
    const setupScreen = document.getElementById('admin-setup-screen');
    if (setupScreen) {
        setupScreen.classList.add('active');
    } else {
        createAdminSetupScreen();
    }
}

// Crear pantalla de setup inicial
function createAdminSetupScreen() {
    const setupHTML = `
        <div id="admin-setup-screen" class="page active">
            <div class="flex items-center justify-center min-h-screen gradient-bg p-4">
                <div class="w-full max-w-md p-8 rounded-2xl bg-white shadow-2xl">
                    <div class="text-center mb-8">
                        <i data-lucide="settings" class="h-16 w-16 mx-auto text-indigo-600 mb-4"></i>
                        <h1 class="text-3xl font-bold text-gray-900">Configuración Inicial</h1>
                        <p class="mt-2 text-gray-600">Crea la cuenta de administrador para comenzar</p>
                    </div>
                    
                    <form onsubmit="handleAdminSetup(event)" class="space-y-6">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Nombre</label>
                            <input id="setup-name" type="text" required 
                                class="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <input id="setup-email" type="email" required 
                                class="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Contraseña</label>
                            <input id="setup-password" type="password" required minlength="6"
                                class="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                        </div>
                        
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Clave de Administrador</label>
                            <input id="setup-admin-key" type="password" required 
                                placeholder="IAWORKS_ADMIN_2024"
                                class="flex h-11 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            <p class="mt-1 text-xs text-gray-500">Usa la clave predefinida del sistema</p>
                        </div>
                        
                        <button type="submit" class="btn-primary ripple w-full rounded-full py-3 font-semibold shadow-lg">
                            Crear Administrador
                        </button>
                    </form>
                </div>
            </div>
        </div>
    `;
    
    const appDiv = document.getElementById('app');
    appDiv.insertAdjacentHTML('beforeend', setupHTML);
    
    // Ocultar otras páginas
    document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
    document.getElementById('admin-setup-screen').classList.add('active');
    
    // Re-inicializar iconos
    setTimeout(() => lucide.createIcons(), 50);
}

// Manejar setup de admin
async function handleAdminSetup(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    try {
        UIHelpers.showLoading(submitBtn);
        
        const name = document.getElementById('setup-name').value;
        const email = document.getElementById('setup-email').value;
        const password = document.getElementById('setup-password').value;
        const adminKey = document.getElementById('setup-admin-key').value;
        
        const response = await AuthAPI.createFirstAdmin({ name, email, password, adminKey });
        
        if (response.success) {
            appState.user = response.data;
            appState.adminExists = true;
            
            UIHelpers.showSuccess('¡Administrador creado exitosamente!');
            
            // Ocultar pantalla de setup
            document.getElementById('admin-setup-screen').remove();
            
            // Ir al dashboard
            navigateTo('dashboard-page');
            setTimeout(() => {
                showDashboardSubpage('dashboard-home');
                loadUserDashboard();
            }, 100);
        }
    } catch (error) {
        UIHelpers.showError(error.message || 'Error al crear administrador');
    } finally {
        UIHelpers.hideLoading(submitBtn);
    }
}

// --- Animaciones de Scroll ---
let scrollObserver = null;

function initScrollAnimations() {
    // Destruir observador anterior si existe
    if (scrollObserver) {
        scrollObserver.disconnect();
    }
    
    // Resetear todas las animaciones de scroll primero
    const allScrollElements = document.querySelectorAll(
        '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate, .scroll-reveal-blur'
    );
    allScrollElements.forEach(element => {
        element.classList.remove('revealed');
    });
    
    // Configurar Intersection Observer para detectar elementos en viewport
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1 // El elemento debe ser visible al menos un 10%
    };
    
    scrollObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Observar todos los elementos con clases de scroll-reveal en la página actual
    const currentPage = document.querySelector('.page.active');
    if (currentPage) {
        const elementsToReveal = currentPage.querySelectorAll(
            '.scroll-reveal, .scroll-reveal-left, .scroll-reveal-right, .scroll-reveal-scale, .scroll-reveal-rotate, .scroll-reveal-blur'
        );
        
        elementsToReveal.forEach(element => {
            scrollObserver.observe(element);
        });
    }
}

// Efecto parallax suave en el hero
function handleParallax() {
    const scrolled = window.pageYOffset;
    const parallaxElements = document.querySelectorAll('.parallax');
    
    parallaxElements.forEach(element => {
        const speed = element.dataset.speed || 0.5;
        const yPos = -(scrolled * speed);
        element.style.transform = `translateY(${yPos}px)`;
    });
}

// Agregar listener para parallax
window.addEventListener('scroll', () => {
    requestAnimationFrame(handleParallax);
});

function initChart() {
    const ctx = document.getElementById('leadsChart');
    if (!ctx) return;
    
    // Destruir gráfico anterior si existe
    const existingChart = Chart.getChart(ctx);
    if (existingChart) {
        existingChart.destroy();
    }
    
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Ene', 'Feb', 'Mar', 'Abr', 'May'],
            datasets: [{
                label: 'Leads Generados',
                data: [400, 300, 600, 800, 500],
                backgroundColor: 'rgba(99, 102, 241, 0.5)',
                borderColor: 'rgba(99, 102, 241, 1)',
                borderWidth: 1,
                borderRadius: 5
            }]
        },
        options: {
            scales: {
                y: { beginAtZero: true, grid: { display: false } },
                x: { grid: { display: false } }
            },
            plugins: {
                legend: { display: false }
            }
        }
    });
}

// ========== FUNCIONES DE ADMIN ==========

// Toggle del sidebar en móviles
function toggleAdminSidebar() {
    const sidebar = document.getElementById('admin-sidebar');
    const backdrop = document.getElementById('admin-sidebar-backdrop');
    
    if (sidebar && backdrop) {
        const isHidden = sidebar.classList.contains('hidden');
        
        if (isHidden) {
            // Mostrar sidebar
            sidebar.classList.remove('hidden');
            backdrop.classList.remove('hidden');
            // Prevenir scroll del body
            document.body.style.overflow = 'hidden';
        } else {
            // Ocultar sidebar
            sidebar.classList.add('hidden');
            backdrop.classList.add('hidden');
            // Restaurar scroll del body
            document.body.style.overflow = '';
        }
        
        // Reiniciar iconos
        setTimeout(() => lucide.createIcons(), 50);
    }
}

function showAdminSubpage(subpageId) {
    document.querySelectorAll('.dashboard-subpage').forEach(p => p.classList.remove('active'));
    const targetSubpage = document.getElementById(subpageId);
    if (targetSubpage) {
        targetSubpage.classList.add('active');
        
        // Cargar datos según la subpágina
        setTimeout(() => {
            lucide.createIcons();
            if (subpageId === 'admin-home') loadAdminStats();
            if (subpageId === 'admin-users') loadUsers();
            if (subpageId === 'admin-coupons') loadCoupons();
            if (subpageId === 'admin-pending-payments') loadPendingPayments();
            if (subpageId === 'admin-payments') loadPaymentConfig();
            if (subpageId === 'admin-logs') loadLogs();
        }, 50);
    }
}

async function loadAdminStats() {
    try {
        const response = await AdminAPI.getDashboardStats();
        if (response.success) {
            const stats = response.data;
            
            // Actualizar estadísticas principales
            document.getElementById('admin-stat-users').textContent = stats.totalUsers || 0;
            document.getElementById('admin-stat-revenue').textContent = `${stats.totalRevenue || 0}€`;
            document.getElementById('admin-stat-active-subs').textContent = stats.activeSubs || 0;
            document.getElementById('admin-stat-pending').textContent = stats.pendingPayments || 0;
            
            // Usuarios por plan
            const usersByPlanDiv = document.getElementById('admin-users-by-plan');
            if (stats.usersByPlan && stats.usersByPlan.length > 0) {
                usersByPlanDiv.innerHTML = stats.usersByPlan.map(item => `
                    <div class="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                        <span class="font-medium capitalize">${item._id || 'Sin plan'}</span>
                        <span class="text-2xl font-bold text-indigo-600">${item.count}</span>
                    </div>
                `).join('');
            } else {
                usersByPlanDiv.innerHTML = '<p class="text-gray-500 text-sm">No hay datos disponibles</p>';
            }
            
            // Pagos recientes
            const recentPaymentsDiv = document.getElementById('admin-recent-payments');
            if (stats.recentPayments && stats.recentPayments.length > 0) {
                recentPaymentsDiv.innerHTML = stats.recentPayments.map(payment => `
                    <div class="flex justify-between items-center p-3 border-b">
                        <div>
                            <p class="font-medium">${payment.user?.name || 'Usuario'}</p>
                            <p class="text-sm text-gray-500">${new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <span class="font-bold text-green-600">${payment.amount}€</span>
                    </div>
                `).join('');
            } else {
                recentPaymentsDiv.innerHTML = '<p class="text-gray-500 text-sm">No hay pagos recientes</p>';
            }
        }
    } catch (error) {
        UIHelpers.showError('Error al cargar estadísticas: ' + error.message);
    }
}

async function loadUsers() {
    try {
        const response = await AdminAPI.getAllUsers();
        if (response.success) {
            const tbody = document.getElementById('users-table-body');
            const cardsBody = document.getElementById('users-cards-body');
            const users = response.data;
            
            if (users.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-4 py-4 text-center text-gray-500 text-sm">No hay usuarios</td></tr>';
                cardsBody.innerHTML = '<p class="text-center text-gray-500 text-sm">No hay usuarios</p>';
                return;
            }
            
            // Render desktop table
            tbody.innerHTML = users.map(user => `
                <tr class="hover:bg-gray-50">
                    <td class="px-4 py-4 text-sm font-medium text-gray-900">${user.name}</td>
                    <td class="px-4 py-4 text-sm text-gray-500">${user.email}</td>
                    <td class="px-4 py-4 text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'Golden' ? 'bg-yellow-100 text-yellow-800' :
                            user.plan === 'Premium' ? 'bg-purple-100 text-purple-800' :
                            user.plan === 'Casual' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }">${user.plan || 'Sin plan'}</span>
                    </td>
                    <td class="px-4 py-4 text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            user.planStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">${user.planStatus === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </td>
                    <td class="px-4 py-4 text-sm">
                        <div class="flex gap-2 flex-wrap">
                            <button onclick="toggleUserStatus('${user._id}')" class="text-indigo-600 hover:text-indigo-800 text-xs">
                                ${user.planStatus === 'active' ? 'Suspender' : 'Activar'}
                            </button>
                            <button onclick="showChangeUserPlanModal('${user._id}', '${user.plan}')" class="text-green-600 hover:text-green-800 text-xs">
                                Cambiar Plan
                            </button>
                        </div>
                    </td>
                </tr>
            `).join('');
            
            // Render mobile cards
            cardsBody.innerHTML = users.map(user => `
                <div class="bg-white border rounded-lg p-4 space-y-3">
                    <div class="flex justify-between items-start">
                        <div>
                            <p class="font-semibold text-gray-900">${user.name}</p>
                            <p class="text-xs text-gray-500">${user.email}</p>
                        </div>
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            user.planStatus === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }">${user.planStatus === 'active' ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div>
                        <span class="text-xs text-gray-500">Plan:</span>
                        <span class="ml-2 px-2 py-1 rounded-full text-xs font-semibold ${
                            user.plan === 'Golden' ? 'bg-yellow-100 text-yellow-800' :
                            user.plan === 'Premium' ? 'bg-purple-100 text-purple-800' :
                            user.plan === 'Casual' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                        }">${user.plan || 'Sin plan'}</span>
                    </div>
                    <div class="flex gap-2 pt-2 border-t">
                        <button onclick="toggleUserStatus('${user._id}')" class="flex-1 text-indigo-600 hover:text-indigo-800 text-xs font-medium py-2 border border-indigo-200 rounded">
                            ${user.planStatus === 'active' ? 'Suspender' : 'Activar'}
                        </button>
                        <button onclick="showChangeUserPlanModal('${user._id}', '${user.plan}')" class="flex-1 text-green-600 hover:text-green-800 text-xs font-medium py-2 border border-green-200 rounded">
                            Cambiar Plan
                        </button>
                    </div>
                </div>
            `).join('');
            
            lucide.createIcons();
        }
    } catch (error) {
        UIHelpers.showError('Error al cargar usuarios: ' + error.message);
    }
}

async function toggleUserStatus(userId) {
    if (!confirm('¿Estás seguro de cambiar el estado de este usuario?')) return;
    
    try {
        const response = await AdminAPI.toggleUserStatus(userId);
        if (response.success) {
            UIHelpers.showSuccess('Estado actualizado correctamente');
            loadUsers();
        }
    } catch (error) {
        UIHelpers.showError('Error al cambiar estado: ' + error.message);
    }
}

function showChangeUserPlanModal(userId, currentPlan) {
    const newPlan = prompt(`Plan actual: ${currentPlan}\n\nIntroduce el nuevo plan (Casual/Premium/Golden):`, currentPlan);
    if (!newPlan) return;
    
    const validPlans = ['Casual', 'Premium', 'Golden'];
    if (!validPlans.includes(newPlan)) {
        UIHelpers.showError('Plan inválido. Usa: Casual, Premium o Golden');
        return;
    }
    
    changeUserPlan(userId, newPlan);
}

async function changeUserPlan(userId, newPlan) {
    try {
        const response = await AdminAPI.changeUserPlan(userId, newPlan);
        if (response.success) {
            UIHelpers.showSuccess('Plan actualizado correctamente');
            loadUsers();
        }
    } catch (error) {
        UIHelpers.showError('Error al cambiar plan: ' + error.message);
    }
}

async function loadCoupons() {
    try {
        const response = await AdminAPI.getAllCoupons();
        if (response.success) {
            const grid = document.getElementById('coupons-grid');
            const coupons = response.data;
            
            if (coupons.length === 0) {
                grid.innerHTML = '<div class="col-span-3 rounded-xl border bg-white p-6 shadow-md text-center text-gray-500">No hay cupones creados</div>';
                return;
            }
            
            grid.innerHTML = coupons.map(coupon => {
                const isExpired = new Date(coupon.expiryDate) < new Date();
                const isMaxed = coupon.maxUses && coupon.usedCount >= coupon.maxUses;
                const isInactive = !coupon.active || isExpired || isMaxed;
                
                return `
                    <div class="card-hover rounded-xl border bg-white p-6 shadow-md ${isInactive ? 'opacity-60' : ''}">
                        <div class="flex justify-between items-start mb-4">
                            <div>
                                <h3 class="text-xl font-bold text-indigo-600">${coupon.code}</h3>
                                <p class="text-2xl font-bold text-gray-900 mt-1">${coupon.discountPercentage}% OFF</p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                isInactive ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }">${isInactive ? 'Inactivo' : 'Activo'}</span>
                        </div>
                        <div class="text-sm text-gray-600 space-y-1">
                            <p>Expira: ${new Date(coupon.expiryDate).toLocaleDateString()}</p>
                            <p>Usos: ${coupon.usedCount}${coupon.maxUses ? `/${coupon.maxUses}` : ' (ilimitado)'}</p>
                        </div>
                        <button onclick="deleteCoupon('${coupon._id}')" class="mt-4 w-full text-sm text-red-600 hover:text-red-800 font-medium">
                            Eliminar
                        </button>
                    </div>
                `;
            }).join('');
            
            lucide.createIcons();
        }
    } catch (error) {
        UIHelpers.showError('Error al cargar cupones: ' + error.message);
    }
}

function showCreateCouponModal() {
    document.getElementById('coupon-modal').classList.remove('hidden');
    lucide.createIcons();
}

function hideCouponModal() {
    document.getElementById('coupon-modal').classList.add('hidden');
    document.getElementById('coupon-code').value = '';
    document.getElementById('coupon-discount').value = '';
    document.getElementById('coupon-expiry').value = '';
    document.getElementById('coupon-max-uses').value = '';
}

async function createCoupon(event) {
    event.preventDefault();
    
    const code = document.getElementById('coupon-code').value.toUpperCase();
    const discountPercentage = parseInt(document.getElementById('coupon-discount').value);
    const expiryDate = document.getElementById('coupon-expiry').value;
    const maxUses = document.getElementById('coupon-max-uses').value;
    
    const couponData = {
        code,
        discountPercentage,
        expiryDate,
        maxUses: maxUses ? parseInt(maxUses) : undefined
    };
    
    try {
        const response = await AdminAPI.createCoupon(couponData);
        if (response.success) {
            UIHelpers.showSuccess('Cupón creado correctamente');
            hideCouponModal();
            loadCoupons();
        }
    } catch (error) {
        UIHelpers.showError('Error al crear cupón: ' + error.message);
    }
}

async function deleteCoupon(couponId) {
    if (!confirm('¿Estás seguro de eliminar este cupón?')) return;
    
    try {
        const response = await AdminAPI.deleteCoupon(couponId);
        if (response.success) {
            UIHelpers.showSuccess('Cupón eliminado correctamente');
            loadCoupons();
        }
    } catch (error) {
        UIHelpers.showError('Error al eliminar cupón: ' + error.message);
    }
}

async function savePaymentConfig(event, method) {
    event.preventDefault();
    
    let config = {};
    
    if (method === 'paypal') {
        config.businessEmail = document.getElementById('paypal-email').value;
    } else if (method === 'crypto') {
        config.walletAddress = document.getElementById('usdc-wallet').value;
        config.network = document.getElementById('usdc-network').value;
    } else if (method === 'bank_transfer') {
        config.iban = document.getElementById('bank-iban').value;
        config.accountHolder = document.getElementById('bank-holder').value;
        config.bankName = document.getElementById('bank-name').value;
    }
    
    try {
        const response = await PaymentAPI.updatePaymentConfig(method, config);
        if (response.success) {
            UIHelpers.showSuccess('Configuración de pago guardada correctamente');
        }
    } catch (error) {
        UIHelpers.showError('Error al guardar configuración: ' + error.message);
    }
}

async function loadPaymentConfig() {
    try {
        // Obtener perfil del usuario admin para cargar su paymentConfig
        const response = await AuthAPI.getProfile();
        if (response.success && response.data.paymentConfig) {
            const config = response.data.paymentConfig;
            
            // Cargar PayPal
            if (config.paypal?.businessEmail) {
                document.getElementById('paypal-email').value = config.paypal.businessEmail;
            }
            
            // Cargar USDC
            if (config.crypto?.walletAddress) {
                document.getElementById('usdc-wallet').value = config.crypto.walletAddress;
                document.getElementById('usdc-network').value = config.crypto.network || 'ethereum';
            }
            
            // Cargar Bank Transfer
            if (config.bankTransfer?.iban) {
                document.getElementById('bank-iban').value = config.bankTransfer.iban;
                document.getElementById('bank-holder').value = config.bankTransfer.accountHolder || '';
                document.getElementById('bank-name').value = config.bankTransfer.bankName || '';
            }
        }
    } catch (error) {
        console.error('Error al cargar configuración de pagos:', error);
    }
}

async function loadLogs() {
    try {
        const type = document.getElementById('log-type-filter').value;
        const filters = type ? { type } : {};
        
        const response = await AdminAPI.getLogs(filters);
        if (response.success) {
            const tbody = document.getElementById('logs-table-body');
            const logs = response.data;
            
            if (logs.length === 0) {
                tbody.innerHTML = '<tr><td colspan="5" class="px-2 md:px-4 py-4 text-center text-gray-500 text-sm">No hay logs</td></tr>';
                return;
            }
            
            tbody.innerHTML = logs.map(log => `
                <tr class="hover:bg-gray-50">
                    <td class="px-2 md:px-4 py-4 text-sm text-gray-900">${new Date(log.createdAt).toLocaleString()}</td>
                    <td class="px-2 md:px-4 py-4 text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            log.type === 'error' ? 'bg-red-100 text-red-800' :
                            log.type === 'payment' ? 'bg-green-100 text-green-800' :
                            'bg-blue-100 text-blue-800'
                        }">${log.type}</span>
                    </td>
                    <td class="px-2 md:px-4 py-4 text-sm">
                        <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                            log.level === 'error' ? 'bg-red-100 text-red-800' :
                            log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                        }">${log.level}</span>
                    </td>
                    <td class="px-2 md:px-4 py-4 text-sm text-gray-900">${log.message}</td>
                    <td class="px-2 md:px-4 py-4 text-sm text-gray-500">${log.user?.name || '-'}</td>
                </tr>
            `).join('');
            
            lucide.createIcons();
        }
    } catch (error) {
        UIHelpers.showError('Error al cargar logs: ' + error.message);
    }
}

// Cargar pagos pendientes
async function loadPendingPayments() {
    try {
        const response = await PaymentAPI.getPendingPayments();
        if (response.success) {
            const tbody = document.getElementById('pending-payments-table-body');
            const cardsBody = document.getElementById('pending-payments-cards-body');
            const payments = response.data;
            
            if (payments.length === 0) {
                tbody.innerHTML = '<tr><td colspan="7" class="px-4 py-4 text-center text-gray-500 text-sm">No hay pagos pendientes</td></tr>';
                cardsBody.innerHTML = '<p class="text-center text-gray-500 text-sm">No hay pagos pendientes</p>';
                return;
            }
            
            // Render desktop table
            tbody.innerHTML = payments.map(payment => {
                let detalles = '';
                
                if (payment.paymentMethod === 'paypal') {
                    detalles = `Order ID: ${payment.paypalOrderId || 'N/A'}`;
                } else if (payment.paymentMethod === 'usdc') {
                    detalles = `<div class="text-xs">
                        <p><strong>TX Hash:</strong></p>
                        <p class="truncate max-w-xs">${payment.cryptoTxHash || 'N/A'}</p>
                        <p class="mt-1"><strong>Desde:</strong> ${payment.cryptoFromAddress ? payment.cryptoFromAddress.substring(0, 10) + '...' : 'N/A'}</p>
                    </div>`;
                } else if (payment.paymentMethod === 'bank_transfer') {
                    detalles = `<div class="text-xs">
                        <p><strong>Ref:</strong> ${payment.bankReference || 'N/A'}</p>
                        ${payment.bankProof ? `<a href="${payment.bankProof}" target="_blank" class="text-indigo-600 hover:underline">Ver comprobante</a>` : '<p class="text-gray-400">Sin comprobante</p>'}
                    </div>`;
                }
                
                return `
                    <tr class="hover:bg-gray-50">
                        <td class="px-4 py-4 text-sm">
                            <div>
                                <p class="font-medium text-gray-900">${payment.user?.name || 'Usuario'}</p>
                                <p class="text-gray-500 text-xs">${payment.user?.email || ''}</p>
                            </div>
                        </td>
                        <td class="px-4 py-4 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                payment.plan === 'golden' ? 'bg-yellow-100 text-yellow-800' :
                                payment.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                            }">${payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}</span>
                        </td>
                        <td class="px-4 py-4 text-sm font-bold text-gray-900">${payment.amount}€</td>
                        <td class="px-4 py-4 text-sm">
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                payment.paymentMethod === 'paypal' ? 'bg-blue-100 text-blue-800' :
                                payment.paymentMethod === 'usdc' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }">${
                                payment.paymentMethod === 'paypal' ? 'PayPal' :
                                payment.paymentMethod === 'usdc' ? 'USDC' :
                                'Transferencia'
                            }</span>
                        </td>
                        <td class="px-4 py-4 text-sm">${detalles}</td>
                        <td class="px-4 py-4 text-sm text-gray-500">${new Date(payment.createdAt).toLocaleDateString()}</td>
                        <td class="px-4 py-4 text-sm">
                            <div class="flex gap-2">
                                <button onclick="approvePayment('${payment._id}')" class="text-green-600 hover:text-green-800 font-medium text-xs">
                                    Aprobar
                                </button>
                                <button onclick="rejectPayment('${payment._id}')" class="text-red-600 hover:text-red-800 font-medium text-xs">
                                    Rechazar
                                </button>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
            
            // Render mobile cards
            cardsBody.innerHTML = payments.map(payment => {
                const methodText = payment.paymentMethod === 'paypal' ? 'PayPal' :
                                 payment.paymentMethod === 'usdc' ? 'USDC' : 'Transferencia';
                
                return `
                    <div class="bg-white border rounded-lg p-4 space-y-3">
                        <div class="flex justify-between items-start">
                            <div>
                                <p class="font-semibold text-gray-900">${payment.user?.name || 'Usuario'}</p>
                                <p class="text-xs text-gray-500">${payment.user?.email || ''}</p>
                            </div>
                            <span class="px-2 py-1 rounded-full text-xs font-semibold ${
                                payment.plan === 'golden' ? 'bg-yellow-100 text-yellow-800' :
                                payment.plan === 'premium' ? 'bg-purple-100 text-purple-800' :
                                'bg-blue-100 text-blue-800'
                            }">${payment.plan.charAt(0).toUpperCase() + payment.plan.slice(1)}</span>
                        </div>
                        <div class="grid grid-cols-2 gap-2 text-sm">
                            <div>
                                <span class="text-xs text-gray-500">Monto:</span>
                                <p class="font-bold text-gray-900">${payment.amount}€</p>
                            </div>
                            <div>
                                <span class="text-xs text-gray-500">Método:</span>
                                <p class="font-medium text-gray-900">${methodText}</p>
                            </div>
                        </div>
                        <div>
                            <span class="text-xs text-gray-500">Fecha:</span>
                            <p class="text-sm text-gray-700">${new Date(payment.createdAt).toLocaleDateString()}</p>
                        </div>
                        <div class="flex gap-2 pt-2 border-t">
                            <button onclick="approvePayment('${payment._id}')" class="flex-1 text-green-600 hover:text-green-800 text-xs font-medium py-2 border border-green-200 rounded">
                                Aprobar
                            </button>
                            <button onclick="rejectPayment('${payment._id}')" class="flex-1 text-red-600 hover:text-red-800 text-xs font-medium py-2 border border-red-200 rounded">
                                Rechazar
                            </button>
                        </div>
                    </div>
                `;
            }).join('');
            }).join('');
            
            lucide.createIcons();
        }
    } catch (error) {
        UIHelpers.showError('Error al cargar pagos pendientes: ' + error.message);
    }
}

// Aprobar pago
async function approvePayment(paymentId) {
    if (!confirm('¿Estás seguro de aprobar este pago? Se activará la suscripción del usuario.')) return;
    
    try {
        const response = await PaymentAPI.approvePayment(paymentId);
        if (response.success) {
            UIHelpers.showSuccess('Pago aprobado y suscripción activada');
            loadPendingPayments();
            loadAdminStats(); // Actualizar estadísticas
        }
    } catch (error) {
        UIHelpers.showError('Error al aprobar pago: ' + error.message);
    }
}

// Rechazar pago
async function rejectPayment(paymentId) {
    if (!confirm('¿Estás seguro de rechazar este pago?')) return;
    
    try {
        const response = await PaymentAPI.rejectPayment(paymentId);
        if (response.success) {
            UIHelpers.showSuccess('Pago rechazado');
            loadPendingPayments();
        }
    } catch (error) {
        UIHelpers.showError('Error al rechazar pago: ' + error.message);
    }
}

