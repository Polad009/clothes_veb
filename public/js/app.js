/**
 * Atelier Store Main Application Controller
 * Single Page Application router, smooth scroll reveals, & mobile support
 */

const App = {
  currentView: 'home',

  init() {
    // URL Hash Router
    window.addEventListener('hashchange', () => this.handleRoute());
    
    // Initialize components
    Cart.init();
    Store.init();
    
    // Initial route
    this.handleRoute();
  },

  handleRoute() {
    const hash = window.location.hash.replace('#', '') || 'home';
    this.navigate(hash, false);
  },

  navigate(viewName, updateHash = true) {
    this.currentView = viewName;
    if (updateHash) {
      window.location.hash = viewName;
    }

    // Hide all views
    document.querySelectorAll('.view-section').forEach(sec => {
      sec.style.display = 'none';
    });

    // Mobile sticky bar toggle (only show on product view on mobile)
    const mobileBar = document.getElementById('mobileStickyBottomBar');
    if (mobileBar) {
      mobileBar.style.display = (viewName === 'product' && window.innerWidth <= 768) ? 'flex' : 'none';
    }

    // Update nav active states
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.view === viewName);
    });

    // Show target view with smooth fade animation
    const target = document.getElementById(`view-${viewName}`);
    if (target) {
      target.style.display = 'block';
    } else {
      const home = document.getElementById('view-home');
      if (home) home.style.display = 'block';
    }

    // Trigger specific view initializations
    if (viewName === 'studio') {
      Studio.init();
    } else if (viewName === 'checkout') {
      Checkout.init();
    } else if (viewName === 'shop') {
      Store.renderCatalogGrid();
    } else if (viewName === 'home') {
      Store.renderFeaturedGrid();
    } else if (viewName === 'product') {
      Store.renderProductPage();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
    this.closeMobileMenu();
  },

  toggleMobileMenu() {
    const menu = document.getElementById('mobileNavDrawer');
    if (menu) menu.classList.toggle('open');
  },

  closeMobileMenu() {
    const menu = document.getElementById('mobileNavDrawer');
    if (menu) menu.classList.remove('open');
  },

  showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';

    toast.innerHTML = `
      <span style="font-size: 1rem;">${type === 'success' ? '✓' : 'ℹ'}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(12px) scale(0.95)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 3000);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
