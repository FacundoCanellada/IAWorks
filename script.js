// Estado global de la aplicación
const appState = {
    user: null,
    currentPage: 'landing-page',
    currentDashboardSubpage: 'dashboard-home',
    selectedPlan: { name: '', price: 0 }
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

// --- Lógica de Autenticación (Simulada) ---
function handleLogin(event) {
    event.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;
    
    if (email && password) {
        appState.user = { name: 'Usuario Ejemplo', email: email };
        navigateTo('dashboard-page');
        setTimeout(() => {
            showDashboardSubpage('dashboard-home');
        }, 100);
    }
}

function handleRegister(event) {
    event.preventDefault();
    const name = document.getElementById('register-name').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const confirmPassword = document.getElementById('register-password-confirm').value;
    
    if (password !== confirmPassword) {
        alert('Las contraseñas no coinciden.');
        return;
    }
    
    if (name && email && password) {
        appState.user = { name: name, email: email };
        alert('¡Registro exitoso! Bienvenido a IAWorks.');
        navigateTo('dashboard-page');
        setTimeout(() => {
            showDashboardSubpage('dashboard-home');
        }, 100);
    }
}

function handleLogout() {
    appState.user = null;
    navigateTo('landing-page');
}

function handleAdminLogin(event) {
    event.preventDefault();
    const username = document.getElementById('admin-username').value;
    const password = document.getElementById('admin-password').value;
    
    if (username === 'admin' && password === 'admin') {
        alert('Login de admin exitoso (simulado). Aquí redirigiría al panel de administración.');
        // Aquí podrías crear una página de admin-dashboard
    } else {
        alert('Credenciales incorrectas.');
    }
}

// --- Lógica de Checkout (Simulada) ---
function handleCheckout(event) {
    event.preventDefault();
    const email = document.getElementById('email').value;
    
    if (email && appState.selectedPlan.name) {
        alert(`Pago simulado exitoso para el plan ${appState.selectedPlan.name}. ¡Gracias por tu compra!`);
        navigateTo('dashboard-page');
        setTimeout(() => {
            showDashboardSubpage('dashboard-home');
        }, 100);
    }
}

// --- Inicialización ---
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar iconos de Lucide
    lucide.createIcons();
    
    // Inicializar gráfico si estamos en el dashboard
    if (appState.currentPage === 'dashboard-page') {
        setTimeout(initChart, 100);
    }
    
    // Inicializar observador de scroll para animaciones
    initScrollAnimations();
});

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
