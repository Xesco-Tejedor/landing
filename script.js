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
    document.addEventListener('DOMContentLoaded', () => {
    // --- Código existente del menú hamburguesa ---
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a'); // Para cerrar menú al hacer clic

    if (navToggle && mainNav) {
        navToggle.addEventListener('click', () => {
            mainNav.classList.toggle('is-active');
            const isActive = mainNav.classList.contains('is-active');
            navToggle.setAttribute('aria-expanded', isActive);
            navToggle.classList.toggle('is-active');
        });
    }

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (mainNav.classList.contains('is-active')) {
                mainNav.classList.remove('is-active');
                navToggle.setAttribute('aria-expanded', 'false');
                navToggle.classList.remove('is-active');
            }
        });
    });

    // --- FIN Código existente del menú hamburguesa ---


    // --- NUEVO CÓDIGO para mover Google Translate ---
    const googleTranslateWidget = document.getElementById('google_translate_element');
    const headerContainer = document.querySelector('.main-header .container'); // Contenedor escritorio
    const mobileNavList = document.querySelector('.main-nav ul'); // Lista del menú móvil

    // Punto de referencia en escritorio (el botón hamburguesa, para insertar antes)
    // O si prefieres que quede al final, puedes usar headerContainer.appendChild() más tarde
    const desktopReferencePoint = document.querySelector('.main-header .nav-toggle');

    const mobileBreakpoint = 768; // Mismo valor que en CSS

    function moveTranslateWidget() {
        if (!googleTranslateWidget || !headerContainer || !mobileNavList) {
            console.error("Elementos para mover Google Translate no encontrados.");
            return; // Salir si falta algún elemento esencial
        }

        if (window.innerWidth <= mobileBreakpoint) {
            // --- Vista Móvil ---
            // Comprobar si el widget NO está ya dentro del menú móvil
            if (!mobileNavList.contains(googleTranslateWidget)) {
                // Mover el widget al PRINCIPIO de la lista <ul> del menú móvil
                mobileNavList.prepend(googleTranslateWidget);
                 console.log("Traductor movido a menú móvil.");
            }
        } else {
            // --- Vista Escritorio ---
            // Comprobar si el widget NO está ya dentro del contenedor del header
             // Usamos > .container > para asegurarnos que es el contenedor principal y no uno interno
            const desktopContainerDirect = document.querySelector('.main-header > .container');
            if (desktopContainerDirect && !desktopContainerDirect.contains(googleTranslateWidget)) {
                // Mover el widget de vuelta al contenedor del header, al final
                desktopContainerDirect.appendChild(googleTranslateWidget);
                 console.log("Traductor movido a header escritorio.");

                // Alternativa: Insertar antes del botón hamburguesa (si existe)
                // if (desktopReferencePoint) {
                //     headerContainer.insertBefore(googleTranslateWidget, desktopReferencePoint);
                // } else {
                //      headerContainer.appendChild(googleTranslateWidget); // Fallback por si no hay toggle
                // }
            }
        }
    }

    // Mover el widget al cargar la página
    moveTranslateWidget();

    // Mover el widget si cambia el tamaño de la ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            moveTranslateWidget();
        }, 250); // Esperar un poco antes de ejecutar para evitar llamadas excesivas
    });

    // --- FIN NUEVO CÓDIGO ---

     // Opcional: Cerrar menú si se hace clic fuera de él (código existente)
    document.addEventListener('click', (event) => {
        // ... (tu código existente para cerrar el menú al hacer clic fuera) ...
         const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);

        if (!isClickInsideNav && !isClickOnToggle && mainNav.classList.contains('is-active')) {
            mainNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
             navToggle.classList.remove('is-active');
        }
    });

}); // Fin de DOMContentLoaded
