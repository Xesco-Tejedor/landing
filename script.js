document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de elementos del DOM ---
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    // Seleccionar solo los enlaces DIRECTAMENTE dentro de la lista UL principal del nav
    // para evitar seleccionar enlaces dentro del widget de traducción si Google añade alguno.
    const navLinks = document.querySelectorAll('.main-nav > ul > li > a');
    const googleTranslateWidget = document.getElementById('google_translate_element');
    const headerContainer = document.querySelector('.main-header > .container'); // Contenedor escritorio
    const mobileNavList = document.querySelector('.main-nav ul'); // Lista <ul> del menú móvil

    const mobileBreakpoint = 768; // Mismo valor que en la media query de CSS

    // --- Lógica Menú Hamburguesa ---
    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            const isActive = mainNav.classList.toggle('is-active');
            navToggle.setAttribute('aria-expanded', isActive);
            navToggle.classList.toggle('is-active');
            // Llamar a moveTranslateWidget solo si el widget existe
            if (googleTranslateWidget) {
                moveTranslateWidget();
            }
        });
    }

    // --- Cerrar Menú al Hacer Clic en Enlace (DENTRO DEL MENÚ) --- // <--- ESTE ES EL BLOQUE AÑADIDO
    if (navLinks.length > 0) {
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                // Solo cerrar si el menú está activo
                if (mainNav && mainNav.classList.contains('is-active')) {
                     console.log("Cerrando menú por clic en enlace de navegación.");
                    mainNav.classList.remove('is-active');
                    // Asegurarse de que navToggle existe
                    if (navToggle) {
                        navToggle.setAttribute('aria-expanded', 'false');
                        navToggle.classList.remove('is-active');
                    }
                }
            });
        });
    }


    // --- Lógica para Mover Google Translate Widget ---
    function moveTranslateWidget() {
        if (!googleTranslateWidget || !headerContainer || !mobileNavList) {
            console.warn("Elementos necesarios para mover Google Translate no están listos o no existen.");
            return;
        }
        console.log("--- moveTranslateWidget Check ---");
        console.log("Ancho ventana:", window.innerWidth);

        if (window.innerWidth <= mobileBreakpoint) {
            // --- Vista Móvil ---
            console.log("Detectado: Móvil");
            if (!mobileNavList.contains(googleTranslateWidget)) {
                console.log("Intentando mover widget a menú móvil...");
                mobileNavList.prepend(googleTranslateWidget);
                console.log("Widget movido a menú móvil.");
            } else {
                 console.log("Widget ya está en menú móvil.");
            }
        } else {
            // --- Vista Escritorio ---
            console.log("Detectado: Escritorio");
            if (!headerContainer.contains(googleTranslateWidget)) {
                console.log("Intentando mover widget a header escritorio...");
                headerContainer.appendChild(googleTranslateWidget);
                console.log("Widget movido a header escritorio.");
            } else {
                console.log("Widget ya está en header escritorio.");
            }
            // Cerrar menú si está activo al pasar a escritorio
            if (mainNav && mainNav.classList.contains('is-active')) {
                 console.log("Cerrando menú activo al pasar a escritorio.");
                 mainNav.classList.remove('is-active');
                 if (navToggle) {
                     navToggle.setAttribute('aria-expanded', 'false');
                     navToggle.classList.remove('is-active');
                 }
            }
        }
        console.log("--- Fin moveTranslateWidget Check ---");
    }

    // Mover el widget al cargar la página (con retraso)
    if (googleTranslateWidget) {
        setTimeout(() => {
            moveTranslateWidget();
        }, 500);
    }

    // Mover el widget al redimensionar ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            if (googleTranslateWidget) {
                moveTranslateWidget();
            }
        }, 250);
    });

    // --- Cerrar Menú al Hacer Mousedown FUERA ---
    document.addEventListener('mousedown', (event) => {
        if (!mainNav || !navToggle) return;

        const isClickInsideTranslate = googleTranslateWidget && googleTranslateWidget.contains(event.target);
        if (isClickInsideTranslate) {
             console.log("MouseDown dentro del widget de traducción. No cerrar.");
            return;
        }

        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);

        if (mainNav.classList.contains('is-active') && !isClickInsideNav && !isClickOnToggle) {
             console.log("Cerrando menú por mousedown fuera.");
            mainNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('is-active');
        }
    });

}); // Fin de DOMContentLoaded
