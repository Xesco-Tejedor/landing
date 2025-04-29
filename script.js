document.addEventListener('DOMContentLoaded', () => {
    // --- Selección de elementos del DOM ---
    const navToggle = document.querySelector('.nav-toggle');
    const mainNav = document.querySelector('.main-nav');
    const navLinks = document.querySelectorAll('.main-nav a'); // Enlaces dentro del menú para cerrar
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
            // Asegurar que el widget esté en el lugar correcto al abrir/cerrar menú
            // (aunque el resize ya debería encargarse, esto es una doble verificación)
            moveTranslateWidget();
        });
    }

    // --- Cerrar Menú al Hacer Clic Fuera (Usando mousedown) ---
    document.addEventListener('mousedown', (event) => { // <-- CAMBIADO A 'mousedown'
        // Asegurarse de que los elementos existen
        if (!mainNav || !navToggle) return;

        // Comprobación extra: Si el click fue en el widget de Google, no hacer nada aquí.
        // El propio widget manejará su apertura/cierre.
        const isClickInsideTranslate = googleTranslateWidget && googleTranslateWidget.contains(event.target);
        if (isClickInsideTranslate) {
             console.log("Clic/MouseDown detectado DENTRO del widget de traducción. No se cierra el menú.");
            return; // Salir temprano si el clic fue en el widget
        }

        // Comprobar si el clic fue fuera del Nav y fuera del Toggle
        const isClickInsideNav = mainNav.contains(event.target);
        const isClickOnToggle = navToggle.contains(event.target);

        // Si el menú está activo Y el clic fue fuera de todo (nav, toggle, y ya verificamos translate)
        if (mainNav.classList.contains('is-active') && !isClickInsideNav && !isClickOnToggle) {
             console.log("Cerrando menú por mousedown fuera.");
            mainNav.classList.remove('is-active');
            navToggle.setAttribute('aria-expanded', 'false');
            navToggle.classList.remove('is-active');
        }
    });
    // --- Lógica para Mover Google Translate Widget ---
    function moveTranslateWidget() {
        console.log("--- moveTranslateWidget Check ---");
        console.log("Ancho ventana:", window.innerWidth);

        // Verificar que los elementos existen antes de usarlos
        if (!googleTranslateWidget) {
            console.error("Error: googleTranslateWidget no encontrado.");
            return;
        }
        if (!headerContainer) {
            console.error("Error: headerContainer no encontrado.");
            return;
        }
        if (!mobileNavList) {
            console.error("Error: mobileNavList no encontrado.");
            return;
        }

         console.log("Widget encontrado:", googleTranslateWidget);
         console.log("Contenedor Header:", headerContainer);
         console.log("Lista Nav Móvil:", mobileNavList);

        if (window.innerWidth <= mobileBreakpoint) {
            // --- Vista Móvil ---
            console.log("Detectado: Móvil");
            // Comprobar si el widget NO está ya dentro del menú móvil
            if (!mobileNavList.contains(googleTranslateWidget)) {
                console.log("Intentando mover widget a menú móvil...");
                // Usar prepend para añadirlo al principio de la lista <ul>
                mobileNavList.prepend(googleTranslateWidget);
                console.log("Widget movido a menú móvil (DOM actualizado).");
            } else {
                 console.log("Widget ya está en menú móvil.");
            }
        } else {
            // --- Vista Escritorio ---
            console.log("Detectado: Escritorio");
            // Comprobar si el widget NO está ya como hijo directo del contenedor del header
            if (!headerContainer.contains(googleTranslateWidget)) {
                console.log("Intentando mover widget a header escritorio...");
                // Mover el widget de vuelta al contenedor del header, al final (o donde estaba)
                // appendChild lo añade al final, ajusta si necesitas otra posición
                headerContainer.appendChild(googleTranslateWidget);
                console.log("Widget movido a header escritorio (DOM actualizado).");
            } else {
                console.log("Widget ya está en header escritorio.");
            }
             // Asegurar que el menú móvil no esté activo en escritorio si se redimensiona
            if (mainNav.classList.contains('is-active')) {
                 mainNav.classList.remove('is-active');
                 navToggle.setAttribute('aria-expanded', 'false');
                 navToggle.classList.remove('is-active');
            }
        }
        console.log("--- Fin moveTranslateWidget Check ---");
    }

    // Mover el widget al cargar la página (después de asegurarse que Google lo ha inicializado)
    // Google usa un callback 'googleTranslateElementInit', esperamos un poco tras la carga inicial
    // Usar setTimeout puede ser una solución simple si Google tarda en renderizar
    setTimeout(() => {
        moveTranslateWidget();
    }, 500); // Espera medio segundo tras carga DOM (ajusta si es necesario)


    // Mover el widget si cambia el tamaño de la ventana
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            moveTranslateWidget();
        }, 250); // Esperar un poco (debounce)
    });

}); // Fin de DOMContentLoaded
