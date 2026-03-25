/**
 * TWISTING SLASH: ELEMENTAL - CORE ENGINE
 */

const Game = {
    // 1. CONFIGURAÇÕES E ESTADO
    state: {
        gold: 0,
        xp: 0,
        level: 1,
        essence: 0,
        mana: 100,
        maxMana: 100,
        manaRegen: 0.5,
        lastSave: Date.now(),
        dps: 10,
        stats: { str: 1, agi: 1, int: 1, vit: 1 },
        skills: [],
        unlockedElements: []
    },

    config: {
        saveKey: 'TwistingSlash_v2_Save',
        baseXP: 100,
        xpExponent: 1.5,
        enemyBaseHP: 50,
        enemyBaseXP: 15
    },

    init() {
        this.setupCanvas();
        this.loadGame();
        this.setupEventListeners();
        this.spawnEnemies();
        this.checkOfflineProgress();
        this.setupPWA();
        this.loop();
    },

    setupCanvas() {
        this.canvases = {
            bg: document.getElementById('bg-canvas'),
            game: document.getElementById('game-canvas'),
            fx: document.getElementById('fx-canvas')
        };
        this.ctxs = {};
        for (let key in this.canvases) {
            this.ctxs[key] = this.canvases[key].getContext('2d');
            this.resize();
        }
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        for (let key in this.canvases) {
            this.canvases[key].width = window.innerWidth;
            this.canvases[key].height = window.innerHeight;
        }
    },

    // 2. SISTEMA VISUAL (PARTÍCULAS E SKILLS)
    particles: [],
    
    createEffect(type, x, y, color) {
        const count = type === 'explosion' ? 20 : 5;
        for (let i = 0; i < count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                life: 1.0,
                color: color || '#fff',
                type: type // 'lightning', 'fire', 'wind'
            });
        }
    },

    drawFX() {
        const ctx = this.ctxs.fx;
        ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
        
        this.particles.forEach((p, index) => {
            ctx.beginPath();
            ctx.globalAlpha = p.life;
            
            if (p.type === 'lightning') {
                ctx.strokeStyle = '#00f2ff';
                ctx.lineWidth = 2;
                ctx.moveTo(p.x, p.y);
                ctx.lineTo(p.x + (Math.random()-0.5)*20, p.y + (Math.random()-0.5)*20);
                ctx.stroke();
            } else {
                ctx.fillStyle = p.color;
                ctx.arc(p.x, p.y, p.life * 4, 0, Math.PI * 2);
                ctx.fill();
            }

            p.x += p.vx;
            p.y += p.vy;
            p.life -= 0.02;
            if (p.life <= 0) this.particles.splice(index, 1);
        });
    },

    // 3. MECÂNICA DE PROGRESSÃO E BALANCEAMENTO
    gainXP(amount) {
        this.state.xp += amount;
        const required = Math.floor(this.config.baseXP * Math.pow(this.state.level, this.config.xpExponent));
        
        if (this.state.xp >= required) {
            this.state.xp -= required;
            this.state.level++;
            this.createEffect('explosion', window.innerWidth/2, window.innerHeight/2, '#a200ff');
            this.updateUI();
        }
        this.updateXPBar(required);
    },

    // 4. IDLE OFFLINE (PROGRESSO)
    checkOfflineProgress() {
        const now = Date.now();
        const diff = (now - this.state.lastSave) / 1000; // segundos
        
        if (diff > 60) { // Mais de 1 minuto fora
            const goldEarned = Math.floor(diff * (this.state.dps * 0.1));
            const xpEarned = Math.floor(diff * (this.state.level * 2));
            
            this.state.gold += goldEarned;
            this.gainXP(xpEarned);

            document.getElementById('idle-gold').innerText = goldEarned;
            document.getElementById('idle-xp').innerText = xpEarned;
            document.getElementById('idle-modal').classList.remove('hidden');
        }
    },

    claimIdle() {
        document.getElementById('idle-modal').classList.add('hidden');
        this.saveGame();
    },

    // 5. SISTEMA PWA (INSTALAÇÃO)
    setupPWA() {
        let deferredPrompt;
        const btn = document.getElementById('pwa-install');

        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            deferredPrompt = e;
            btn.classList.remove('hidden');
        });

        btn.addEventListener('click', async () => {
            if (deferredPrompt) {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') btn.classList.add('hidden');
                deferredPrompt = null;
            }
        });
    },

    // 6. LOOP PRINCIPAL
    loop() {
        // Lógica de Combate (Simulação rápida para o exemplo)
        this.state.mana = Math.min(this.state.maxMana, this.state.mana + this.state.manaRegen/60);
        
        this.drawFX();
        this.updateUI();
        
        // Auto-save a cada 30 segundos
        if (Date.now() - this.state.lastSave > 30000) this.saveGame();
        
        requestAnimationFrame(() => this.loop());
    },

    // UTILITÁRIOS
    saveGame() {
        this.state.lastSave = Date.now();
        localStorage.setItem(this.config.saveKey, JSON.stringify(this.state));
    },

    loadGame() {
        const saved = localStorage.getItem(this.config.saveKey);
        if (saved) {
            this.state = { ...this.state, ...JSON.parse(saved) };
        }
    },

    updateUI() {
        document.getElementById('val-gold').innerText = Math.floor(this.state.gold);
        document.getElementById('val-level').innerText = `NV. ${this.state.level}`;
        document.getElementById('val-essence').innerText = this.state.essence;
        
        const manaPercent = (this.state.mana / this.state.maxMana) * 100;
        document.getElementById('mana-fill').style.width = `${manaPercent}%`;
        document.getElementById('mana-text').innerText = `${Math.floor(this.state.mana)}/${this.state.maxMana}`;
    },

    updateXPBar(required) {
        const percent = (this.state.xp / required) * 100;
        document.getElementById('xp-fill').style.width = `${percent}%`;
    },

    setupEventListeners() {
        // Exemplo de clique para efeito (teste de raios)
        this.canvases.game.addEventListener('click', (e) => {
            this.createEffect('lightning', e.clientX, e.clientY);
            this.state.gold += 1; // Pequeno ganho no clique
        });
    }
};

// Objeto Global para Interface
const UI = {
    toggleTab(tabId) {
        const panel = document.getElementById(`tab-${tabId}`);
        const isHidden = panel.classList.contains('hidden');
        this.closeAll();
        if (isHidden) panel.classList.remove('hidden');
    },
    closeAll() {
        document.querySelectorAll('.panel').forEach(p => p.classList.add('hidden'));
    }
};

// Iniciar
window.onload = () => Game.init();
