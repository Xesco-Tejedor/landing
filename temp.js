
        // Helper function for responsive image drawing (Object-fit: cover for Canvas)
        function drawImageCover(ctx, img, x, y, w, h, offsetX = 0.5, offsetY = 0.5) {
            if (!img.complete || img.naturalWidth === 0) return;

            const iw = img.naturalWidth;
            const ih = img.naturalHeight;
            const r = Math.min(w / iw, h / ih);
            let nw = iw * r;   // new prop. width
            let nh = ih * r;   // new prop. height
            let cx, cy, cw, ch, ar = 1;

            // Decide which gap to fill
            if (nw < w) ar = w / nw;
            if (Math.abs(ar - 1) < 1e-14 && nh < h) ar = h / nh;  // updated
            nw *= ar;
            nh *= ar;

            // Calc source rectangle
            cw = iw / (nw / w);
            ch = ih / (nh / h);

            cx = (iw - cw) * offsetX;
            cy = (ih - ch) * offsetY;

            // Make sure source rectangle is valid
            if (cx < 0) cx = 0;
            if (cy < 0) cy = 0;
            if (cw > iw) cw = iw;
            if (ch > ih) ch = ih;

            ctx.drawImage(img, cx, cy, cw, ch, x, y, w, h);
        }

        let audioCtx;
        let isMusicPlaying = false;
        let activeOscillators = [];

        // Typewriter Logo Logic
        const logoText = ` __  __  ____  ____  ____  _____ 
 \\ \\/ / / ___|/ ___|/ ___|/ _ \\
  \\  / | _| |___ \\| | | | | |
  /  \\ | |___ ___| | |___ | |_| |
 /_/\\_\\ \\____|____/ \\____|\\_____/`;

        function typeLogo() {
            const el = document.getElementById('xesco-logo');
            if (!el) return;

            const fullText = logoText.trim();
            el.style.opacity = '1';
            el.textContent = '';

            let i = 0;
            let blinkCount = 0;

            // FASE 1: PARPADEO INICIAL (1.5s)
            const initialBlink = setInterval(() => {
                el.textContent = (blinkCount % 2 === 0) ? '█' : '';
                blinkCount++;
                if (blinkCount > 6) {
                    clearInterval(initialBlink);
                    startTyping();
                }
            }, 250);

            function startTyping() {
                // FASE 2: ESCRIBIR CARÁCTER A CARÁCTER
                const typeInterval = setInterval(() => {
                    // Texto actual + cursor al final
                    el.textContent = fullText.substring(0, i) + '█';
                    i++;

                    if (i > fullText.length) {
                        clearInterval(typeInterval);
                        el.textContent = fullText; // Quitar cursor al terminar

                        // FASE 3: ESPERAR (4 segundos)
                        setTimeout(() => {
                            // FASE 4: BORRAR (Recorrido inverso / Backspace)
                            let eraseIdx = fullText.length;
                            const eraseInterval = setInterval(() => {
                                el.textContent = fullText.substring(0, eraseIdx) + '█';
                                eraseIdx--;

                                if (eraseIdx < 0) {
                                    clearInterval(eraseInterval);
                                    setTimeout(typeLogo, 500); // Reiniciar ciclo tras breve pausa
                                }
                            }, 5); // Borrado muy rápido (efecto retroceso)
                        }, 4000);
                    }
                }, 10); // Velocidad de escritura rápida pero perceptible
            }
        }

        window.addEventListener('DOMContentLoaded', typeLogo);

        function initAudio() {
            if (audioCtx) return;
            try {
                const AudioContextClass = window.AudioContext || window.webkitAudioContext;
                if (AudioContextClass) {
                    audioCtx = new AudioContextClass();
                    console.log("AudioContext initialized successfully.");
                } else {
                    console.warn("AudioContext not supported in this browser.");
                }
            } catch (e) {
                console.error("AudioContext initialization failed:", e);
            }
        }

        function createOsc(freq, type, startTime, duration, volume, detune = 0) {
            if (!audioCtx) return;
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();

            osc.type = type;
            osc.frequency.setValueAtTime(freq, startTime);
            osc.detune.setValueAtTime(detune, startTime);

            gain.gain.setValueAtTime(0, startTime);
            gain.gain.linearRampToValueAtTime(volume, startTime + 0.02);
            gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

            osc.connect(gain);
            gain.connect(audioCtx.destination);

            osc.start(startTime);
            osc.stop(startTime + duration);

            activeOscillators.push(osc);
            osc.onended = () => {
                activeOscillators = activeOscillators.filter(o => o !== osc);
            };
        }

        let currentTempo = 130;
        let musicTimeout = null;
        let fanfareTimeout = null;
        let isFanfarePlaying = false;

        function stopAllMusic() {
            isMusicPlaying = false;
            isFanfarePlaying = false;
            if (musicTimeout) clearTimeout(musicTimeout);
            if (fanfareTimeout) clearTimeout(fanfareTimeout);

            // Detener todos los osciladores activos inmediatamente
            activeOscillators.forEach(osc => {
                try {
                    osc.stop();
                    osc.disconnect();
                } catch (e) { }
            });
            activeOscillators = [];
        }

        function playEpicMusic() {
            if (isMusicPlaying) return;
            isMusicPlaying = true;

            const notes = {
                C3: 130.81, G3: 196.00, A3: 220.00, F3: 174.61,
                C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
                C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
            };

            const melody = [
                { f: notes.A4, t: 0, d: 1 }, { f: notes.E5, t: 1, d: 1 },
                { f: notes.D5, t: 2, d: 0.5 }, { f: notes.C5, t: 2.5, d: 0.5 },
                { f: notes.B4, t: 3, d: 1 }, { f: notes.A4, t: 4, d: 1 },
                { f: notes.C5, t: 5, d: 1 }, { f: notes.G4, t: 6, d: 2 },
                { f: notes.F4, t: 8, d: 1 }, { f: notes.A4, t: 9, d: 1 },
                { f: notes.G4, t: 10, d: 1 }, { f: notes.F4, t: 11, d: 1 },
                { f: notes.E4, t: 12, d: 4 }
            ];

            const bass = [
                { f: notes.A3, t: 0 }, { f: notes.A3, t: 0.5 }, { f: notes.A3, t: 1 }, { f: notes.A3, t: 1.5 },
                { f: notes.F3, t: 2 }, { f: notes.F3, t: 2.5 }, { f: notes.G3, t: 3 }, { f: notes.G3, t: 3.5 },
                { f: notes.A3, t: 4 }, { f: notes.A3, t: 4.5 }, { f: notes.A3, t: 5 }, { f: notes.A3, t: 5.5 },
                { f: notes.C3, t: 6 }, { f: notes.C3, t: 6.5 }, { f: notes.G3, t: 7 }, { f: notes.G3, t: 7.5 }
            ];

            function playArp(startTime, baseFreq, step) {
                const arp = [1, 1.25, 1.5, 2];
                arp.forEach((r, i) => {
                    createOsc(baseFreq * r, 'square', startTime + i * (step / 4), step / 4, 0.03);
                });
            }

            function scheduleLoop(startTime) {
                if (!isMusicPlaying) return;
                const step = 60 / currentTempo;
                const loopDuration = 16 * step;

                melody.forEach(n => createOsc(n.f, 'sawtooth', startTime + n.t * step, n.d * step, 0.08, 5));
                bass.forEach(n => createOsc(n.f, 'triangle', startTime + n.t * step, 0.4 * step, 0.15));

                for (let i = 0; i < 16; i += 2) {
                    const freq = i < 8 ? notes.A3 : notes.F3;
                    playArp(startTime + i * step, freq, step);
                }

                musicTimeout = setTimeout(() => {
                    scheduleLoop(audioCtx.currentTime + 0.1);
                }, loopDuration * 1000 - 100);
            }

            scheduleLoop(audioCtx.currentTime + 0.1);
        }

        function playVictoryFanfare() {
            if (isFanfarePlaying) return;
            isFanfarePlaying = true;

            const step = 0.15;
            const notes = { C4: 261.63, E4: 329.63, G4: 392.00, C5: 523.25, G5: 783.99 };

            function scheduleFanfare(startTime) {
                if (!isFanfarePlaying) return;

                // Melodía heroica / Fanfarria
                const sequence = [
                    { f: notes.C4, t: 0, d: 1 }, { f: notes.G4, t: 1, d: 1 },
                    { f: notes.C5, t: 2, d: 2 }, { f: notes.E4, t: 4, d: 1 },
                    { f: notes.G4, t: 5, d: 1 }, { f: notes.C5, t: 6, d: 4 },
                    { f: notes.G4, t: 10, d: 1 }, { f: notes.C5, t: 11, d: 1 },
                    { f: notes.G5, t: 12, d: 4 }
                ];

                sequence.forEach(n => {
                    createOsc(n.f, 'triangle', startTime + n.t * step, n.d * step, 0.15);
                    createOsc(n.f * 1.01, 'square', startTime + n.t * step, n.d * step, 0.05); // Brillo metálico
                });

                // Acompañamiento
                for (let i = 0; i < 16; i++) {
                    if (i % 4 === 0) createOsc(notes.C4 / 2, 'sawtooth', startTime + i * step, step * 2, 0.1);
                }

                fanfareTimeout = setTimeout(() => {
                    scheduleFanfare(audioCtx.currentTime + 0.1);
                }, 16 * step * 1000);
            }

            scheduleFanfare(audioCtx.currentTime + 0.1);
        }

        let comingFromGameEnd = false;

        function showScreen(screenId) {
            console.log("Attempting to show screen:", screenId);
            initAudio();
            if (audioCtx && audioCtx.state === 'suspended') {
                audioCtx.resume().catch(e => console.error("Error resuming audio:", e));
            }

            if (typeof ghostGameActive !== 'undefined' && ghostGameActive && screenId !== 'ghostgame') {
                stopGhostGame();
            }

            const screens = document.querySelectorAll('.screen');
            screens.forEach(s => s.classList.remove('active'));
            
            const target = document.getElementById(screenId);
            if (target) {
                target.classList.add('active');
                console.log("Screen activated:", screenId);
                const content = target.querySelector('.content');
                if (content) content.scrollTop = 0;
            } else {
                console.error("Target screen not found:", screenId);
            }

            // Gestión de música por pantalla
            if (screenId === 'gameover') {
                stopAllMusic();
                playVictoryFanfare();

                const badgeCont = document.getElementById('badgeContainer');
                if (badgeCont && !comingFromGameEnd) {
                    badgeCont.style.display = 'none';
                }
                comingFromGameEnd = false;
            } else if (screenId === 'ghostgame') {
                stopAllMusic();
                currentTempo = 130;
                playEpicMusic();
            } else {
                if (typeof isFanfarePlaying !== 'undefined' && isFanfarePlaying) {
                    stopAllMusic();
                    playEpicMusic();
                }
            }
        }
        // Exponer globalmente para onclick
        window.showScreen = showScreen;

        window.addEventListener('DOMContentLoaded', () => {
            document.querySelectorAll('.btn').forEach(btn => {
                btn.addEventListener('click', () => {
                    if (audioCtx && audioCtx.state === 'running') {
                        const osc = audioCtx.createOscillator();
                        const gain = audioCtx.createGain();
                        osc.type = 'triangle';
                        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
                        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
                        gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + 0.1);
                        osc.connect(gain);
                        gain.connect(audioCtx.destination);
                        osc.start();
                        osc.stop(audioCtx.currentTime + 0.1);
                    }
                });
            });
        });

        // Ghost Game Logic
        let ghostGameActive = false;
        let gamePaused = false;
        let ghosts = [];
        let score = 0;
        let health = 100;
        let canvas, ctx;
        let offCanvas, offCtx;
        let mouseX = 0, mouseY = 0;
        let isShooting = false;
        let lastTime = 0;
        let ghostImage = new Image();
        ghostImage.src = 'ghost.png';
        let ghostImage2 = new Image();
        ghostImage2.src = 'monstuo2.png';
        let powerUpImage = new Image();
        powerUpImage.src = 'powerUp.png';
        let poisonImage = new Image();
        poisonImage.src = 'poison.png';
        let powerups = [];
        let poisons = [];
        let particles = [];
        let bgLibrary = new Image(); bgLibrary.src = 'library.png';
        let bgHell = new Image(); bgHell.src = 'libHell.png';
        let gamePhase = 0;
        let phaseTimer = 0;
        let gameTimer = 60;
        let countdownValue = -1;
        const dpr = window.devicePixelRatio || 1;
        const BASE_WIDTH = 800;
        const BASE_HEIGHT = 600;
        let gameScale = 1;
        let spawnAccumulator = 0;
        let powerupAccumulator = 0;
        let poisonAccumulator = 0;
        let beamParticleAccumulator = 0;
        let beamSoundAccumulator = 0;

        function startGhostGame() {
            document.getElementById('ghostMenu').style.display = 'none';
            document.getElementById('gameCanvas').style.display = 'block';
            document.getElementById('gameUI').style.display = 'flex';
            document.getElementById('crosshair').style.display = 'block';

            // Creepy Sign Logic
            const sign = document.getElementById('creepySign');
            if (sign) {
                // Limpieza SEGURA de duplicados: solo buscamos en elementos de texto específicos
                const targetText = 'TIENES UN MINUTO PARA SALVAR EL MUNDO';
                document.querySelectorAll('p, div, span, h1, h2, h3').forEach(el => {
                    if (el.id !== 'creepySign' && 
                        el.textContent.trim() === targetText && 
                        el.children.length === 0) {
                        el.remove();
                    }
                });

                sign.style.display = 'block';
                sign.style.opacity = '1';
                setTimeout(() => {
                    sign.style.opacity = '0';
                    setTimeout(() => {
                        sign.style.display = 'none';
                        sign.style.opacity = '1';
                    }, 1000);
                }, 3000);
            }

            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');

            const container = document.getElementById('game-container');
            
            // Calculamos dimensiones reales considerando el DPR
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            
            // Calculamos la escala para el sistema de coordenadas virtuales (800x600)
            // Queremos que el juego quepa siempre, manteniendo el aspect ratio para la lógica
            gameScale = Math.min(rect.width / BASE_WIDTH, rect.height / BASE_HEIGHT);
            
            if (!offCanvas) {
                offCanvas = document.createElement('canvas');
                offCtx = offCanvas.getContext('2d');
            }
            offCanvas.width = canvas.width;
            offCanvas.height = canvas.height;

            // Reset transform before scaling
            ctx.setTransform(1, 0, 0, 1, 0, 0);
            ctx.scale(dpr, dpr);
            
            offCtx.setTransform(1, 0, 0, 1, 0, 0);
            offCtx.scale(dpr, dpr);

            // Limpiamos y aseguramos opacidad inicial
            offCtx.globalCompositeOperation = 'source-over';
            offCtx.fillStyle = 'black';
            offCtx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);

            function drawInitialLibrary() {
                if (bgLibrary.complete && bgLibrary.naturalWidth > 0) {
                    drawImageCover(offCtx, bgLibrary, 0, 0, rect.width, rect.height);
                } else {
                    bgLibrary.onload = () => {
                        drawImageCover(offCtx, bgLibrary, 0, 0, rect.width, rect.height);
                    };
                }
            }
            
            drawInitialLibrary();

            score = 0;
            health = 100;
            gameTimer = 60;
            currentTempo = 130;
            ghosts = [];
            powerups = [];
            poisons = [];
            particles = [];
            ghostGameActive = true;
            gamePhase = 0;
            phaseTimer = 0;
            lastTime = performance.now();
            updateUI();

            container.addEventListener('mousemove', handleMouseMove);
            container.addEventListener('mousedown', () => isShooting = true);
            container.addEventListener('mouseup', () => isShooting = false);
            container.addEventListener('mouseleave', () => isShooting = false);

            container.addEventListener('touchmove', (e) => {
                if (!ghostGameActive) return;
                e.preventDefault();
                handleTouchMove(e);
            }, { passive: false });
            container.addEventListener('touchstart', (e) => {
                if (!ghostGameActive) return;
                e.preventDefault();
                handleTouchMove(e);
                isShooting = true;
            }, { passive: false });
            container.addEventListener('touchend', () => isShooting = false);

            requestAnimationFrame(gameLoop);
        }

        function handleMouseMove(e) {
            if (!ghostGameActive || gamePaused) return;
            const rect = canvas.getBoundingClientRect();
            mouseX = e.clientX - rect.left;
            mouseY = e.clientY - rect.top;

            const crosshair = document.getElementById('crosshair');
            // En escritorio mantenemos un pequeño offset si se prefiere, 
            // pero lo centramos mejor
            crosshair.style.left = (mouseX) + 'px';
            crosshair.style.top = (mouseY) + 'px';
        }

        function handleTouchMove(e) {
            if (!ghostGameActive || gamePaused) return;
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            mouseX = touch.clientX - rect.left;
            mouseY = touch.clientY - rect.top;

            const crosshair = document.getElementById('crosshair');
            // En táctil, centramos la mirilla EXACTAMENTE bajo el dedo
            crosshair.style.left = (mouseX) + 'px';
            crosshair.style.top = (mouseY) + 'px';
        }

        function spawnGhost(deltaTime) {
            let effScore = Math.min(score, 50);
            
            // Definimos tasas por segundo en lugar de por frame
            const spawnRatePerSec = 0.5 + (effScore * 0.05); // Aumenta con el score
            const powerupRatePerSec = 0.08;
            const poisonRatePerSec = 0.04;

            spawnAccumulator += deltaTime;
            powerupAccumulator += deltaTime;
            poisonAccumulator += deltaTime;

            // Spawning de fantasmas en coordenadas virtuales
            if (spawnAccumulator >= 1 / spawnRatePerSec || (ghosts.length === 0 && spawnAccumulator > 0.5)) {
                let isAdvanced = score >= 50 && Math.random() < 0.4;
                ghosts.push({
                    type: isAdvanced ? 2 : 1,
                    x: BASE_WIDTH / 2 + (Math.random() - 0.5) * 400,
                    y: BASE_HEIGHT / 2 + (Math.random() - 0.5) * 300,
                    size: 10,
                    vx: (Math.random() - 0.5) * (60 + effScore * 0.5) * (isAdvanced ? 1.5 : 1),
                    vy: (Math.random() - 0.5) * (60 + effScore * 0.5) * (isAdvanced ? 1.5 : 1),
                    hp: 20 + effScore * 1.5 + (isAdvanced ? 30 : 0)
                });
                spawnAccumulator = 0;
            }

            // Spawning de Power-Ups
            if (powerupAccumulator >= 1 / powerupRatePerSec) {
                powerups.push({
                    x: BASE_WIDTH / 2 + (Math.random() - 0.5) * 400,
                    y: BASE_HEIGHT / 2 + (Math.random() - 0.5) * 300,
                    size: 10,
                    vx: (Math.random() - 0.5) * (120 + effScore * 1),
                    vy: (Math.random() - 0.5) * (120 + effScore * 1),
                    hp: 5
                });
                powerupAccumulator = 0;
            }

            // Spawning de Venenos
            if (poisonAccumulator >= 1 / poisonRatePerSec) {
                poisons.push({
                    x: BASE_WIDTH / 2 + (Math.random() - 0.5) * 400,
                    y: BASE_HEIGHT / 2 + (Math.random() - 0.5) * 300,
                    size: 10,
                    vx: (Math.random() - 0.5) * (120 + effScore * 1),
                    vy: (Math.random() - 0.5) * (120 + effScore * 1),
                    hp: 5
                });
                poisonAccumulator = 0;
            }
        }

        function generateBadge(finalScore) {
            /* 
               STYLE PROMPT REFERENCE (requested by user): 
               "Genera una insignia de estilo heavy metal de los años 80, sin marcos, 
               con ilustraciones de fantasía oscura, colores vibrantes y contrastados, 
               estilo pintura aerográfica retro."
            */
            // High Score Logic
            let highScore = localStorage.getItem('ghostGameHighScore') || 0;
            let isNewRecord = false;
            if (finalScore > highScore) {
                highScore = finalScore;
                localStorage.setItem('ghostGameHighScore', highScore);
                isNewRecord = true;
            }

            const hsText = document.getElementById('highScoreText');
            if (hsText) {
                hsText.innerText = isNewRecord ? `¡NUEVO RÉCORD INFERNAL: ${highScore}!` : `RÉCORD INFERNAL: ${highScore}`;
                hsText.style.color = isNewRecord ? 'var(--bright-yellow)' : 'var(--bright-green)';
            }

            if (isNewRecord && finalScore > 0 && typeof audioCtx !== 'undefined' && audioCtx) {
                let t = audioCtx.currentTime;
                const riff = [
                    { f: 329.63, d: 0.1 }, { f: 329.63, d: 0.1 }, { f: 392.00, d: 0.1 },
                    { f: 329.63, d: 0.1 }, { f: 440.00, d: 0.1 }, { f: 329.63, d: 0.1 },
                    { f: 493.88, d: 0.15 }, { f: 392.00, d: 0.15 }, { f: 587.33, d: 0.4 }
                ];
                let offset = 0;
                riff.forEach(note => {
                    createOsc(note.f, 'sawtooth', t + offset, note.d, 0.15, 0);
                    createOsc(note.f * 1.01, 'square', t + offset, note.d, 0.1, 0); // Distortion/Chorus
                    offset += note.d + 0.02;
                });
            }

            // Canvas Setup for Badge
            const bCanvas = document.createElement('canvas');
            bCanvas.width = 400;
            bCanvas.height = 400;
            const bCtx = bCanvas.getContext('2d');

            // Load and draw one of the heavy metal style illustrations
            // PROMPT STYLE: 1980s heavy metal aesthetic, frame-free illustrations, dark fantasy, vibrant neon highlights
            const icons = ['badge_art_1.png', 'badge_art_2.png', 'badge_art_3.png'];
            const selectedIcon = icons[Math.floor(Math.random() * icons.length)];
            let badgeIcon = new Image();
            // crossOrigin removed to avoid CORS issues on file://
            badgeIcon.src = selectedIcon;
            
            badgeIcon.onload = () => {
                // Clear background
                bCtx.fillStyle = '#000000';
                bCtx.fillRect(0, 0, 400, 400);

                // Draw the illustration full size (filling the entire badge area)
                bCtx.drawImage(badgeIcon, 0, 0, 400, 400);


                    // Rank / Score Banner area
                    bCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                    bCtx.fillRect(50, 310, 300, 60);
                    
                    let rank = 'ESPECTRO ERRANTE';
                    if (finalScore > 20) rank = 'RECLUTA DEL ABISMO';
                    if (finalScore > 50) rank = 'CAZADOR DE ÉLITE';
                    if (finalScore > 100) rank = 'EXORCISTA BINARIO';
                    if (finalScore > 250) rank = 'MAESTRO DEL ECTOPLASMA';
                    if (finalScore > 500) rank = 'SOBERANO DEL INFRAMUNDO';

                    bCtx.fillStyle = '#FFD700'; // Gold
                    bCtx.font = '10px "Press Start 2P", monospace';
                    bCtx.textAlign = 'center';
                    bCtx.fillText(rank, 200, 330);
                    
                    bCtx.font = '18px "Press Start 2P", monospace';
                    bCtx.fillStyle = '#FFFFFF';
                    bCtx.fillText(finalScore, 200, 355);

                    // Update DOM
                    const imgData = bCanvas.toDataURL('image/png');
                    const bImg = document.getElementById('badgeImage');
                    const dBtn = document.getElementById('downloadBadgeBtn');
                    const bCont = document.getElementById('badgeContainer');

                    if (bImg && dBtn && bCont) {
                        bImg.src = imgData;
                        dBtn.href = imgData;
                        bCont.style.display = 'block';
                        dBtn.style.display = 'inline-block';
                    }
                };

            badgeIcon.onerror = () => {
                // Fallback to emoji if icon fails to load
                bCtx.fillStyle = '#000000';
                bCtx.fillRect(0, 0, 400, 400);
                bCtx.font = '80px monospace';
                bCtx.textAlign = 'center';
                bCtx.textBaseline = 'middle';
                bCtx.fillStyle = '#FFFFFF';
                bCtx.fillText('💀', 200, 200);
                
                // Rank / Score Banner area
                bCtx.fillStyle = 'rgba(0, 0, 0, 0.7)';
                bCtx.fillRect(50, 310, 300, 60);
                bCtx.fillStyle = '#FFD700';
                bCtx.font = '10px "Press Start 2P", monospace';
                bCtx.fillText('ESPECTRO ERRANTE', 200, 330);
                bCtx.font = '18px "Press Start 2P", monospace';
                bCtx.fillStyle = '#FFFFFF';
                bCtx.fillText(finalScore, 200, 355);

                const imgData = bCanvas.toDataURL('image/png');
                document.getElementById('badgeImage').src = imgData;
                document.getElementById('downloadBadgeBtn').href = imgData;
                document.getElementById('badgeContainer').style.display = 'block';
            };
        }

        function updateUI() {
            document.getElementById('gameScore').innerText = score;
            document.getElementById('gameTimerUI').innerText = Math.ceil(gameTimer);
            const hb = document.getElementById('healthBar');
            hb.style.width = Math.max(0, health) + '%';
            if (health < 30) hb.style.backgroundColor = 'var(--bright-red)';
            else if (health < 60) hb.style.backgroundColor = 'var(--bright-yellow)';
            else hb.style.backgroundColor = 'var(--bright-green)';
        }

        function drawProtonBeam(deltaTime) {
            if (!isShooting) return;

            // Convertimos coordenadas reales de ratón/touch a virtuales para la lógica
            // Centramos el área de juego (800x600 * gameScale) dentro del rect real del canvas
            const rect = canvas.getBoundingClientRect();
            const gameWidth = BASE_WIDTH * gameScale;
            const gameHeight = BASE_HEIGHT * gameScale;
            const offsetX = (rect.width - gameWidth) / 2;
            const offsetY = (rect.height - gameHeight) / 2;
            
            const virtualMouseX = (mouseX - offsetX) / gameScale;
            const virtualMouseY = (mouseY - offsetY) / gameScale;

            let hitGhost = false;
            for (let g of ghosts) {
                if (virtualMouseX > g.x - g.size / 2 && virtualMouseX < g.x + g.size / 2 &&
                    virtualMouseY > g.y - g.size / 2 && virtualMouseY < g.y + g.size / 2) {
                    hitGhost = true; break;
                }
            }
            if (!hitGhost) {
                for (let p of powerups) {
                    if (virtualMouseX > p.x - p.size / 2 && virtualMouseX < p.x + p.size / 2 &&
                        virtualMouseY > p.y - p.size / 2 && virtualMouseY < p.y + p.size / 2) {
                        hitGhost = true; break;
                    }
                }
            }
            if (!hitGhost) {
                for (let p of poisons) {
                    if (virtualMouseX > p.x - p.size / 2 && virtualMouseX < p.x + p.size / 2 &&
                        virtualMouseY > p.y - p.size / 2 && virtualMouseY < p.y + p.size / 2) {
                        hitGhost = true; break;
                    }
                }
            }

            if (!hitGhost) {
                // 1. DESINTEGRACIÓN LIMPIA EN LA CAPA SUPERFICIAL
                offCtx.save();
                // Dibujamos en el offCanvas (que está escalado por DPR pero usa coordenadas lógicas gracias a ctx.scale)
                // Usamos las coordenadas de mouse relativas al rect del canvas
                const burnX = mouseX;
                const burnY = mouseY;
                const radius = (25 + Math.random() * 20);
                const spikes = 15;

                offCtx.globalCompositeOperation = 'destination-out';
                offCtx.beginPath();
                for (let i = 0; i < spikes; i++) {
                    const angle = (i / spikes) * Math.PI * 2;
                    const dist = radius * (0.8 + Math.random() * 0.4);
                    const px = burnX + Math.cos(angle) * dist;
                    const py = burnY + Math.sin(angle) * dist;
                    if (i === 0) offCtx.moveTo(px, py);
                    else offCtx.lineTo(px, py);
                }
                offCtx.closePath();
                offCtx.fill();
                offCtx.restore();

                // 2. EFECTOS VISUALES DE ENERGÍA (Sobre el agujero en el lienzo principal)
                ctx.save();
                ctx.shadowBlur = 15;
                ctx.shadowColor = '#FF4500';
                
                // Borde de plasma incandescente
                ctx.strokeStyle = Math.random() > 0.5 ? '#FFD700' : '#FFFFFF';
                ctx.lineWidth = 3;
                ctx.beginPath();
                for (let i = 0; i < spikes; i++) {
                    const angle = (i / spikes) * Math.PI * 2;
                    const dist = radius * (0.8 + Math.random() * 0.4);
                    const px = burnX + Math.cos(angle) * dist;
                    const py = burnY + Math.sin(angle) * dist;
                    
                    // Pequeños arcos eléctricos
                    if (Math.random() < 0.3) {
                        ctx.lineTo(px + (Math.random()-0.5)*20, py + (Math.random()-0.5)*20);
                    }
                    
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.stroke();
                ctx.restore();

                // 3. CHISPAS DE ALTA VELOCIDAD
                beamParticleAccumulator += deltaTime;
                const particlesPerSec = 300;
                while (beamParticleAccumulator > 1 / particlesPerSec) {
                    particles.push({
                        x: burnX, y: burnY,
                        vx: (Math.random() - 0.5) * 200,
                        vy: (Math.random() - 0.5) * 200 - 50,
                        life: 0.6 + Math.random() * 0.4,
                        color: Math.random() > 0.5 ? '#FFD700' : '#FFF'
                    });
                    beamParticleAccumulator -= 1 / particlesPerSec;
                }
            }

            const startX = rect.width / 2;
            const startY = rect.height;

            // 1. Núcleo principal del rayo (Naranja/Amarillo/Blanco)
            ctx.shadowBlur = 15;
            ctx.shadowColor = 'var(--bright-red)';
            ctx.lineWidth = 12;
            ctx.strokeStyle = 'rgba(255, 100, 0, 0.8)';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            ctx.shadowBlur = 10;
            ctx.shadowColor = 'var(--bright-yellow)';
            ctx.lineWidth = 6;
            ctx.strokeStyle = 'var(--bright-yellow)';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            ctx.shadowBlur = 5;
            ctx.shadowColor = 'var(--bright-white)';
            ctx.lineWidth = 2;
            ctx.strokeStyle = 'var(--bright-white)';
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(mouseX, mouseY);
            ctx.stroke();

            ctx.restore();

            // 2. Rayos eléctricos inestables (Cian/Azul) que envuelven el núcleo
            const numArcs = 2;
            for (let a = 0; a < numArcs; a++) {
                ctx.lineWidth = 3;
                ctx.strokeStyle = Math.random() > 0.5 ? 'var(--bright-cyan)' : 'var(--bright-blue)';
                ctx.beginPath();
                ctx.moveTo(startX, startY);

                let steps = 12;
                let dx = (mouseX - startX) / steps;
                let dy = (mouseY - startY) / steps;

                let currentX = startX;
                let currentY = startY;

                for (let i = 1; i <= steps; i++) {
                    let jitterX = (Math.random() - 0.5) * 50; // Gran dispersión
                    let jitterY = (Math.random() - 0.5) * 50;
                    if (i === steps) { jitterX = 0; jitterY = 0; } // Debe terminar justo en la mirilla

                    ctx.lineTo(currentX + dx + jitterX, currentY + dy + jitterY);
                    currentX += dx;
                    currentY += dy;
                }
                ctx.stroke();
            }

            // Sonido más grave y constante para el rayo
            beamSoundAccumulator += deltaTime;
            if (beamSoundAccumulator > 0.05 && typeof audioCtx !== 'undefined' && audioCtx) {
                createOsc(250 + Math.random() * 100, 'sawtooth', audioCtx.currentTime, 0.1, 0.08);
                beamSoundAccumulator = 0;
            }
        }

        function stopGhostGame() {
            ghostGameActive = false;
            document.getElementById('ghostMenu').style.display = 'flex';
            document.getElementById('gameCanvas').style.display = 'none';
            document.getElementById('gameUI').style.display = 'none';
            document.getElementById('crosshair').style.display = 'none';
        }

        function gameLoop(timestamp) {
            if (!ghostGameActive) return;
            
            if (gamePaused) {
                lastTime = timestamp; // Reset lastTime to avoid jumps
                requestAnimationFrame(gameLoop);
                return;
            }

            if (!lastTime) {
                lastTime = timestamp;
                requestAnimationFrame(gameLoop);
                return;
            }
            let deltaTime = (timestamp - lastTime) / 1000;
            // Cap deltaTime to prevent huge jumps (e.g. after long backgrounding)
            if (deltaTime > 0.1) deltaTime = 0.1;
            lastTime = timestamp;
            
            const timeScale = deltaTime * 60;

            // Timer Logic
            gameTimer -= deltaTime;
            updateUI();

            // Music Speed Up at 15 seconds remaining
            if (gameTimer <= 15) {
                currentTempo = 180;
            }

            if (gameTimer <= 0) {
                stopGhostGame();
                generateBadge(score);
                comingFromGameEnd = true;
                showScreen('gameover');
                return;
            }

            // Handle Phases (Lógica de tiempo real en segundos)
            if (gamePhase < 2) {
                phaseTimer += deltaTime;
                // Fase 1 a los 2 segundos, Fase 2 (Hell) a los 5 segundos (fin del temblor)
                if (gamePhase === 0 && phaseTimer >= 2.0 && typeof audioCtx !== 'undefined' && audioCtx) {
                    createOsc(100, 'sawtooth', audioCtx.currentTime, 1.0, 0.2); 
                }
                if (gamePhase === 0 && phaseTimer >= 2.0) gamePhase = 1;
                if (gamePhase === 1 && phaseTimer >= 5.0) gamePhase = 2;
            }

            // Screen Shake Effect for the beginning (Library Hallway trembling)
            let shakeX = 0;
            let shakeY = 0;
            if (gamePhase < 2 && phaseTimer > 0.5) {
                const shakeIntensity = (phaseTimer < 3) ? (phaseTimer - 0.5) * 6 : Math.max(0, (5 - phaseTimer) * 6);
                if (shakeIntensity > 0) {
                    shakeX = (Math.random() - 0.5) * shakeIntensity;
                    shakeY = (Math.random() - 0.5) * shakeIntensity;
                }
            }

            // Dibujamos el fondo centrado
            const rect = canvas.getBoundingClientRect();
            const gameWidth = BASE_WIDTH * gameScale;
            const gameHeight = BASE_HEIGHT * gameScale;
            const offsetX = (rect.width - gameWidth) / 2;
            const offsetY = (rect.height - gameHeight) / 2;

            ctx.save();
            ctx.translate(offsetX, offsetY);
            ctx.scale(gameScale, gameScale);

            if (bgLibrary.complete && bgHell.complete) {
                if (gamePhase === 0) {
                    drawImageCover(ctx, bgLibrary, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);
                    const blurAmount = (phaseTimer / 2.0) * 5;
                    ctx.filter = `blur(${blurAmount}px)`;
                    drawImageCover(ctx, bgLibrary, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);
                    ctx.filter = 'none';
                } else if (gamePhase === 1) {
                    const alpha = (phaseTimer - 2.0) / 3.0;
                    drawImageCover(ctx, bgLibrary, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);
                    ctx.save();
                    const blurAmount = 5 + (alpha * 10);
                    ctx.filter = `blur(${blurAmount}px)`;
                    ctx.globalAlpha = alpha;
                    drawImageCover(ctx, bgHell, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);
                    ctx.restore();
                } else {
                    drawImageCover(ctx, bgHell, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);
                }
            } else {
                ctx.fillStyle = 'black';
                ctx.fillRect(0, 0, BASE_WIDTH, BASE_HEIGHT);
            }

            // Draw Library Layer (offCanvas with burns)
            // Necesitamos que offCanvas esté alineado con el sistema virtual
            ctx.drawImage(offCanvas, shakeX/gameScale, shakeY/gameScale, BASE_WIDTH, BASE_HEIGHT);

            // Destello rojo en la transición de fase
            if (gamePhase === 1) {
                const flashAlpha = Math.sin((phaseTimer - 2.0) * (Math.PI / 3.0)) * 0.3;
                ctx.fillStyle = `rgba(255, 0, 0, ${Math.max(0, flashAlpha)})`;
                ctx.fillRect(0, 0, rect.width, rect.height);
            }
            if (gamePhase === 2) {
                spawnGhost(deltaTime);
            }

            for (let i = ghosts.length - 1; i >= 0; i--) {
                let g = ghosts[i];

                g.x += g.vx * timeScale;
                g.y += g.vy * timeScale;
                // Crecen/Se acercan MUCHO más despacio
                g.size += (0.5 + (score * 0.01)) * deltaTime * 60;

                // Fantasmas hululan al azar (Probabilidad escalada por deltaTime)
                if (Math.random() < 0.3 * deltaTime && typeof audioCtx !== 'undefined' && audioCtx) {
                    let freq = 200 + Math.random() * 100;
                    createOsc(freq, 'sine', audioCtx.currentTime, 0.5, 0.02);
                    createOsc(freq + 20, 'sine', audioCtx.currentTime + 0.1, 0.5, 0.02);
                }

                let currentImg = g.type === 2 ? ghostImage2 : ghostImage;
                try {
                    if (currentImg.complete && currentImg.naturalWidth > 0) {
                        ctx.drawImage(currentImg, g.x - g.size / 2, g.y - g.size / 2, g.size, g.size);
                    } else {
                        ctx.fillStyle = g.type === 2 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 0, 255, 0.8)';
                        ctx.fillRect(g.x - g.size / 2, g.y - g.size / 2, g.size, g.size);
                    }
                } catch (e) {
                    console.error("Error drawing image: ", e);
                    ctx.fillStyle = g.type === 2 ? 'rgba(0, 255, 255, 0.8)' : 'rgba(255, 0, 255, 0.8)';
                    ctx.fillRect(g.x - g.size / 2, g.y - g.size / 2, g.size, g.size);
                }

                if (isShooting) {
                    const rect = canvas.getBoundingClientRect();
                    const virtualMouseX = (mouseX - (rect.width - BASE_WIDTH * gameScale) / 2) / gameScale;
                    const virtualMouseY = (mouseY - (rect.height - BASE_HEIGHT * gameScale) / 2) / gameScale;
                    
                    if (virtualMouseX > g.x - g.size / 2 && virtualMouseX < g.x + g.size / 2 &&
                        virtualMouseY > g.y - g.size / 2 && virtualMouseY < g.y + g.size / 2) {
                        // El rayo hace muchísimo daño
                        g.hp -= 10 * timeScale;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fillRect(g.x - g.size / 2, g.y - g.size / 2, g.size, g.size);

                        // Chillido al ser alcanzado
                        if (Math.random() < 18 * deltaTime && typeof audioCtx !== 'undefined' && audioCtx) {
                            createOsc(800 + Math.random() * 400, 'triangle', audioCtx.currentTime, 0.08, 0.03);
                        }
                    }
                }

                if (g.hp <= 0) {
                    // Explosión de ectoplasma/sangre roja
                    const ghostExplosionColors = ['#FF0000', '#D70000', '#8B0000', '#FF4500', '#B22222'];
                    for (let k = 0; k < 30; k++) {
                        particles.push({
                            x: g.x,
                            y: g.y,
                            vx: (Math.random() - 0.5) * 350,
                            vy: (Math.random() - 0.5) * 350,
                            life: 1.2,
                            color: ghostExplosionColors[Math.floor(Math.random() * ghostExplosionColors.length)]
                        });
                    }

                    ghosts.splice(i, 1);
                    score += 10;
                    updateUI();
                    if (typeof audioCtx !== 'undefined' && audioCtx) createOsc(800, 'square', audioCtx.currentTime, 0.1, 0.05);
                    continue;
                }

                if (g.size > 200) {
                    ghosts.splice(i, 1);
                    health -= 20;
                    updateUI();

                    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
                    ctx.fillRect(0, 0, rect.width, rect.height);

                    if (typeof audioCtx !== 'undefined' && audioCtx) createOsc(100, 'sawtooth', audioCtx.currentTime, 0.3, 0.1);

                    if (health <= 0) {
                        ctx.restore(); // Balance save
                        stopGhostGame();
                        generateBadge(score);
                        comingFromGameEnd = true;
                        showScreen('gameover');
                        return;
                    }
                }
            }

            // Loop de Power-Ups
            for (let i = powerups.length - 1; i >= 0; i--) {
                let p = powerups[i];
                p.x += p.vx * timeScale;
                p.y += p.vy * timeScale;
                p.size += (0.05 + (score * 0.0005)) * timeScale;

                try {
                    if (powerUpImage.complete && powerUpImage.naturalWidth > 0) {
                        ctx.drawImage(powerUpImage, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    } else {
                        ctx.fillStyle = '#00FF00';
                        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    }
                } catch (e) { }

                if (isShooting) {
                    const rect = canvas.getBoundingClientRect();
                    const virtualMouseX = (mouseX - (rect.width - BASE_WIDTH * gameScale) / 2) / gameScale;
                    const virtualMouseY = (mouseY - (rect.height - BASE_HEIGHT * gameScale) / 2) / gameScale;

                    if (virtualMouseX > p.x - p.size / 2 && virtualMouseX < p.x + p.size / 2 &&
                        virtualMouseY > p.y - p.size / 2 && virtualMouseY < p.y + p.size / 2) {
                        p.hp -= 10 * timeScale;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    }
                }

                if (p.hp <= 0) {
                    health = Math.min(100, health + 80);
                    updateUI();

                    if (typeof audioCtx !== 'undefined' && audioCtx) {
                        createOsc(600, 'sine', audioCtx.currentTime, 0.1, 0.1);
                        createOsc(800, 'sine', audioCtx.currentTime + 0.1, 0.2, 0.1);
                        createOsc(1200, 'sine', audioCtx.currentTime + 0.3, 0.4, 0.1);
                    }

                    const pColors = ['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF', '#FFFFFF'];
                    for (let k = 0; k < 30; k++) {
                        particles.push({
                            x: p.x, y: p.y,
                            vx: (Math.random() - 0.5) * 300,
                            vy: (Math.random() - 0.5) * 300,
                            life: 1.0,
                            color: pColors[Math.floor(Math.random() * pColors.length)]
                        });
                    }

                    powerups.splice(i, 1);
                    continue;
                }

                if (p.size > 200) {
                    powerups.splice(i, 1); // Desaparece sin hacer daño
                }
            }

            // Loop de Venenos
            for (let i = poisons.length - 1; i >= 0; i--) {
                let p = poisons[i];
                p.x += p.vx * timeScale;
                p.y += p.vy * timeScale;
                p.size += (0.05 + (score * 0.0005)) * timeScale;

                try {
                    if (poisonImage.complete && poisonImage.naturalWidth > 0) {
                        ctx.drawImage(poisonImage, p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    } else {
                        ctx.fillStyle = '#800080';
                        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    }
                } catch (e) { }

                if (isShooting) {
                    const rect = canvas.getBoundingClientRect();
                    const virtualMouseX = (mouseX - (rect.width - BASE_WIDTH * gameScale) / 2) / gameScale;
                    const virtualMouseY = (mouseY - (rect.height - BASE_HEIGHT * gameScale) / 2) / gameScale;

                    if (virtualMouseX > p.x - p.size / 2 && virtualMouseX < p.x + p.size / 2 &&
                        virtualMouseY > p.y - p.size / 2 && virtualMouseY < p.y + p.size / 2) {
                        p.hp -= 10 * timeScale;
                        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                        ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
                    }
                }

                if (p.hp <= 0) {
                    // Sonido de quejido (groan) al reventar el veneno
                    if (typeof audioCtx !== 'undefined' && audioCtx) {
                        let t = audioCtx.currentTime;
                        createOsc(150, 'sawtooth', t, 0.2, 0.1);
                        createOsc(100, 'sawtooth', t + 0.15, 0.3, 0.1);
                        createOsc(60, 'sawtooth', t + 0.3, 0.4, 0.05);
                    }

                    // Explosión de sangre/fuego
                    const pColors = ['#8B0000', '#FF0000', '#FF4500', '#FF8C00', '#B22222'];
                    for (let k = 0; k < 30; k++) {
                        particles.push({
                            x: p.x, y: p.y,
                            vx: (Math.random() - 0.5) * 300,
                            vy: (Math.random() - 0.5) * 300,
                            life: 1.0,
                            color: pColors[Math.floor(Math.random() * pColors.length)]
                        });
                    }

                    poisons.splice(i, 1);
                    continue;
                }

                if (p.size > 200) {
                    // Causa daño letal (40 puntos, el doble que un fantasma normal)
                    poisons.splice(i, 1);
                    health -= 40;
                    updateUI();

                    // Flash morado/rojo de daño
                    ctx.fillStyle = 'rgba(128, 0, 128, 0.4)';
                    ctx.fillRect(0, 0, rect.width, rect.height);

                    if (typeof audioCtx !== 'undefined' && audioCtx) createOsc(50, 'sawtooth', audioCtx.currentTime, 0.5, 0.1);

                    if (health <= 0) {
                        ctx.restore(); // Balance save
                        stopGhostGame();
                        generateBadge(score);
                        showScreen('gameover');
                        return;
                    }
                }
            }

            // Loop de Partículas
            for (let i = particles.length - 1; i >= 0; i--) {
                let part = particles[i];
                part.x += part.vx * deltaTime;
                part.y += part.vy * deltaTime;
                part.life -= deltaTime * 1.5; // Desaparecen rápido

                if (part.life <= 0) {
                    particles.splice(i, 1);
                } else {
                    ctx.fillStyle = part.color;
                    ctx.globalAlpha = part.life;
                    ctx.fillRect(part.x - 2, part.y - 2, 4, 4);
                    ctx.globalAlpha = 1.0;
                }
            }

            drawProtonBeam(deltaTime);
            ctx.restore(); // Restore from game centering transform

            /* 
               Eliminamos la expansión automática del fuego para que el descubrimiento 
               sea 100% manual y no haya un "fade out" accidental de la biblioteca.
            */

            // Cuenta regresiva final con perspectiva y contorno rojo
            if (gameTimer <= 10 && gameTimer > 0) {
                let currentVal = Math.ceil(gameTimer);
                let progress = 1 - (gameTimer % 1); // De 0 a 1 cada segundo
                let scale = progress * 350; // El número "crece" hacia el jugador
                let alpha = 1 - progress; // Se desvanece al final del segundo
                
                ctx.save();
                ctx.font = `${scale}px "Press Start 2P"`;
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                
                const rect = canvas.getBoundingClientRect();
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;

                // Contorno Rojo (Borde)
                ctx.strokeStyle = `rgba(255, 0, 0, ${alpha})`;
                ctx.lineWidth = Math.max(2, scale / 30);
                ctx.strokeText(currentVal, centerX, centerY);
                
                // Relleno Blanco
                ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
                ctx.fillText(currentVal, centerX, centerY);
                
                ctx.restore();
            }

            requestAnimationFrame(gameLoop);
        }

        // Login Logic
        function validateLogin() {
            console.log("validateLogin called");
            const statusEl = document.getElementById('login-status');
            const msgEl = document.getElementById('login-msg');

            statusEl.textContent = '';
            statusEl.classList.remove('access-granted');
            
            msgEl.textContent = '> AUTHENTICATING...';

            // Instant access for atmosphere
            setTimeout(() => {
                statusEl.textContent = 'ACCESS GRANTED';
                statusEl.style.textShadow = '0 0 8px var(--bright-green)';
                statusEl.classList.add('access-granted');
                msgEl.textContent = '> HANDSHAKE SUCCESSFUL';
                
                if (audioCtx) {
                    createOsc(440, 'sine', audioCtx.currentTime, 0.1, 0.1);
                    createOsc(880, 'sine', audioCtx.currentTime + 0.1, 0.2, 0.1);
                }

                setTimeout(() => {
                    showScreen('splash');
                }, 1000);
            }, 800);
        }
        window.validateLogin = validateLogin;

        // Allow Enter key to login
        document.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const loginScreen = document.getElementById('login');
                if (loginScreen.classList.contains('active')) {
                    validateLogin();
                }
            }
        });

        // Pause/Resume functions
        function togglePause(pause) {
            if (!ghostGameActive) return;
            gamePaused = pause;
            const overlay = document.getElementById('pauseOverlay');
            if (gamePaused) {
                overlay.style.display = 'flex';
                isShooting = false;
                if (isMusicPlaying) {
                    // Opcional: bajar volumen o pausar música si se implementa stop() suave
                }
            } else {
                overlay.style.display = 'none';
            }
        }

        window.addEventListener('blur', () => togglePause(true));
        document.getElementById('pauseOverlay').addEventListener('click', () => togglePause(false));

        // Listener para adaptar el juego si el usuario gira el móvil o redimensiona la pantalla
        window.addEventListener('resize', () => {
            if (ghostGameActive && canvas) {
                const rect = canvas.getBoundingClientRect();
                
                // Guardar estado actual de las quemaduras antes de redimensionar
                const tempCanvas = document.createElement('canvas');
                tempCanvas.width = canvas.width;
                tempCanvas.height = canvas.height;
                const tempCtx = tempCanvas.getContext('2d');
                tempCtx.drawImage(offCanvas, 0, 0);

                // Actualizar dimensiones reales y escala
                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;
                gameScale = Math.min(rect.width / BASE_WIDTH, rect.height / BASE_HEIGHT);
                
                ctx.setTransform(1, 0, 0, 1, 0, 0);
                ctx.scale(dpr, dpr);
                
                if (offCanvas) {
                    offCanvas.width = canvas.width;
                    offCanvas.height = canvas.height;
                    offCtx.setTransform(1, 0, 0, 1, 0, 0);
                    offCtx.scale(dpr, dpr);
                    
                    // Restaurar el estado de las quemaduras
                    offCtx.drawImage(tempCanvas, 0, 0, rect.width, rect.height);
                    
                    // Asegurar que el fondo se mantenga si es necesario
                    if (bgLibrary.complete) {
                        offCtx.globalCompositeOperation = 'destination-over';
                        drawImageCover(offCtx, bgLibrary, 0, 0, rect.width, rect.height);
                        offCtx.globalCompositeOperation = 'source-over';
                    }
                }
            }
        });
        console.log("Retro Game App script loaded successfully.");
    