document.addEventListener('DOMContentLoaded', () => {
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a'); // Para cerrar menú al hacer clic

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-active');
            // Cambiar el estado aria-expanded
            const isActive = mainNav.classList.contains('is-active');
            navToggle.setAttribute('aria-expanded', isActive);
            // Cambiar la clase del botón para la animación de X (opcional)
            navToggle.classList.toggle('is-active');
        });
    }

    // Cerrar menú al hacer clic en un enlace (para SPAs o páginas largas)
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('is-active');
            }
        });
    });

    // Opcional: Cerrar menú si se hace clic fuera de él
    document.addEventListener('click', (event) => {
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);

        if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('is-active')) {
            mainNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
             navToggle.classList.remove('is-active');
        }
    });

});