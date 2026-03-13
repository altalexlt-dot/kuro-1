// Configuración de Lenis (Smooth Scroll)
const lenis = new Lenis({ duration: 1.2, easing: t => Math.min(1, 1.001 - Math.pow(2, -10 * t)) });
function raf(time) { lenis.raf(time); requestAnimationFrame(raf); }
requestAnimationFrame(raf);
gsap.registerPlugin(ScrollTrigger);
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add((time) => lenis.raf(time * 1000));
gsap.ticker.lagSmoothing(0);

// Comprobar Preferencias de Movimiento Reducido (Accesibilidad)
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// 1. Inyectar Componentes (Header y Footer)
async function loadComponents() {
  try {
    const headerHtml = await fetch('components/header.html').then(r => r.text());
    const footerHtml = await fetch('components/footer.html').then(r => r.text());
    
    const headerEl = document.getElementById('site-header');
    const footerEl = document.getElementById('site-footer');
    
    if (headerEl) headerEl.innerHTML = headerHtml;
    if (footerEl) footerEl.innerHTML = footerHtml;

    initNavigation();
  } catch (error) {
    console.error("Error cargando componentes:", error);
  }
}

// 2. Inicializar Navegación y Menú Móvil
function initNavigation() {
  const nav = document.getElementById('site-header');
  lenis.on('scroll', ({ scroll }) => {
    if(nav) nav.classList.toggle('is-scrolled', scroll > 80);
  });

  const burger = document.getElementById('burger');
  const mob = document.getElementById('mob-menu');
  let mobOpen = false;

  if(burger && mob) {
    burger.addEventListener('click', () => {
      mobOpen = !mobOpen;
      mob.classList.toggle('open', mobOpen);
      if (mobOpen) lenis.stop(); else lenis.start();
    });
  }
}

// 3. Animaciones GSAP Premium
function initGSAP() {
  if (prefersReducedMotion) return;

  // Animación de textos revelándose
  gsap.utils.toArray('.reveal-text').forEach(text => {
    gsap.from(text, {
      y: 50, opacity: 0, duration: 1.2, ease: "power4.out",
      scrollTrigger: { trigger: text, start: "top 85%" }
    });
  });

  // Contador de números (Ej: 27 Años, 10 en Japón)
  gsap.utils.toArray('.stat-number').forEach(el => {
    const target = parseInt(el.getAttribute('data-target'));
    if(!isNaN(target)) {
      gsap.to(el, {
        innerText: target, duration: 2.5, snap: { innerText: 1 }, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 85%", once: true }
      });
    }
  });

  // Stagger Cards (El Equipo, Eventos)
  gsap.utils.toArray('.grid-stagger').forEach(grid => {
    const cards = grid.children;
    gsap.from(cards, {
      y: 50, opacity: 0, duration: 1, stagger: 0.15, ease: "expo.out",
      scrollTrigger: { trigger: grid, start: "top 80%" }
    });
  });
}

// 4. Cursor Personalizado Accesible
function initCursor() {
  if (prefersReducedMotion || window.innerWidth < 768) return; // Desactivar en móvil o si piden reducción de movimiento
  
  const dot = document.createElement('div'); dot.id = 'cur-dot';
  const ring = document.createElement('div'); ring.id = 'cur-ring';
  document.body.appendChild(dot); document.body.appendChild(ring);

  let mx = 0, my = 0, rx = 0, ry = 0;
  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
  
  gsap.ticker.add(() => {
    gsap.set(dot, { x: mx, y: my });
    rx += (mx - rx) * 0.15; ry += (my - ry) * 0.15;
    gsap.set(ring, { x: rx, y: ry });
  });
}

// 5. Generador PDF Profesional con html2pdf (Sin Popups)
window.descargarPDF = function() {
  const element = document.createElement('div');
  element.innerHTML = `
    <div style="padding: 40px; font-family: Georgia, serif; color: #111;">
      <h1 style="text-align: center; color: #C1121F; font-size: 40px;">KURO 黑</h1>
      <p style="text-align: center; font-style: italic;">Menú Degustación & Carta Completa</p>
      <hr style="margin: 30px 0;">
      <p style="text-align: center;">Por favor, visite nuestra web para ver el menú actualizado.<br>www.kuro-tarragona.com</p>
    </div>
  `;
  
  const opt = {
    margin:       10,
    filename:     'Kuro-Carta.pdf',
    image:        { type: 'jpeg', quality: 0.98 },
    html2canvas:  { scale: 2 },
    jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
  };

  html2pdf().set(opt).from(element).save();
};

// Inicialización General
document.addEventListener('DOMContentLoaded', async () => {
  await loadComponents();
  initCursor();
  initGSAP();
});
