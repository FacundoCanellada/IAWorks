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
            
            // Solo admin va al dashboard
            if (response.data.role === 'admin') {
                console.log('Navegando a dashboard-page...');
                navigateTo('dashboard-page');
                setTimeout(() => {
                    console.log('Mostrando dashboard-home...');
                    showDashboardSubpage('dashboard-home');
                    loadUserDashboard();
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

// --- Lógica de Checkout (Simulada) ---
async function handleCheckout(event) {
    event.preventDefault();
    const submitBtn = event.target.querySelector('button[type="submit"]');
    
    try {
        UIHelpers.showLoading(submitBtn);
        
        const email = document.getElementById('email').value;
        
        if (!email || !appState.selectedPlan.name) {
            UIHelpers.showError('Por favor completa todos los campos');
            UIHelpers.hideLoading(submitBtn);
            return;
        }
        
        // Simulación de pago exitoso
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        UIHelpers.showSuccess(`¡Pago exitoso para el plan ${appState.selectedPlan.name}!`);
        
        // Si el usuario está logueado, redirigir al dashboard
        if (appState.user) {
            navigateTo('dashboard-page');
            setTimeout(() => {
                showDashboardSubpage('dashboard-home');
            }, 100);
        } else {
            // Si no está logueado, redirigir al registro
            navigateTo('register-page');
        }
    } catch (error) {
        UIHelpers.showError('Error al procesar el pago');
    } finally {
        UIHelpers.hideLoading(submitBtn);
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
        // Solo admin va al dashboard automáticamente
        if (appState.user.role === 'admin') {
            navigateTo('dashboard-page');
            setTimeout(() => {
                showDashboardSubpage('dashboard-home');
                loadUserDashboard();
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
