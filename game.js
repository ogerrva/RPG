/**
 * TWISTING SLASH: ELEMENTAL - CORE ENGINE
 * Interface Adaptada ao Layout Dark RPG
 */

const Game = {
    state: {
        gold: 0,
        essence: 0,
        xp: 0,
        level: 1,
        points: 0,
        stats: { str: 10, ene: 10, agi: 10 },
        mana: 1050,
        maxMana: 1050,
        dps: 124500, // Exemplo inicial baseado na sua imagem
        lastSave: Date.now(),
        stage: 1,
        wave: 1
    },

    config: {
        saveKey: 'TwistingSlash_RPG_Save',
        baseXP: 120000, // Base do XP para o nível 128 da imagem
        xpScale: 1.15,
        manaRegenBase: 5,
    },

    init() {
        this.loadGame();
        this.setupCanvas();
        this.checkOfflineProgress();
        this.setupPWA();
        
        // Iniciar Loops
        setInterval(() => this.saveGame(), 10000); // Auto-save 10s
        this.gameLoop();
        
        console.log("Sistema de Combate Iniciado...");
    },

    setupCanvas() {
        this.cvs = document.getElementById('game-canvas');
        this.ctx = this.cvs.getContext('2d');
        this.fxCvs = document.getElementById('fx-canvas');
        this.fxCtx = this.fxCvs.getContext('2d');
        
        this.resize();
        window.addEventListener('resize', () => this.resize());
    },

    resize() {
        const container = document.querySelector('.combat-zone');
        [this.cvs, this.fxCvs].forEach(c => {
            c.width = container.clientWidth;
            c.height = container.clientHeight;
        });
    },

    // --- SISTEMA DE ATRIBUTOS (CONFORME A IMAGEM) ---
    buyStat(stat) {
        if (this.state.points > 0) {
            this.state.points--;
            this.state.stats[stat]++;
            this.updateStatsLogic();
            this.updateUI();
            this.createEffect('upgrade', window.innerWidth/2, window.innerHeight/2, '#00aaff');
        }
    },

    updateStatsLogic() {
        // Balanceamento: Força aumenta DPS, Energia aumenta Mana, Agilidade aumenta Velocidade
        this.state.dps = this.state.stats.str * 1200; 
        this.state.maxMana = this.state.stats.ene * 2;
        this.state.manaRegen = 2 + (this.state.stats.ene * 0.1);
    },

    // --- PROGRESSÃO E XP ---
    gainXP(amount) {
        this.state.xp += amount;
        let reqXP = this.getRequiredXP();
        
        if (this.state.xp >= reqXP) {
            this.state.xp -= reqXP;
            this.state.level++;
            this.state.points += 5; // Ganha 5 pontos por nível como na imagem
            this.updateUI();
        }
        this.updateBars();
    },

    getRequiredXP() {
        return Math.floor(this.config.baseXP * Math.pow(this.state.level / 100, 1.5));
    },

    // --- MECÂNICA IDLE OFFLINE ---
    checkOfflineProgress() {
        const now = Date.now();
        const diffInSeconds = Math.floor((now - this.state.lastSave) / 1000);
        
        if (diffInSeconds > 60) { // Mínimo 1 minuto
            const hours = Math.floor(diffInSeconds / 3600);
            const mins = Math.floor((diffInSeconds % 3600) / 60);
            const secs = diffInSeconds % 60;

            // Ganhos balanceados (ajuste os multiplicadores conforme desejar)
            const goldEarned = Math.floor(diffInSeconds * (this.state.dps * 0.05));
            const essenceEarned = Math.floor(diffInSeconds * 0.01);

            this.state.gold += goldEarned;
            this.state.essence += essenceEarned;

            // Mostrar Modal
            const modal = document.getElementById('idle-modal');
            document.querySelector('.idle-time').innerText = 
                `🕒 ${String(hours).padStart(2,'0')}:${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
            document.getElementById('idle-gold').innerText = this.format(goldEarned);
            document.getElementById('idle-essence').innerText = this.format(essenceEarned);
            modal.classList.remove('hidden');
        }
    },

    claimIdle() {
        document.getElementById('idle-modal').classList.add('hidden');
        this.saveGame();
    },

    // --- MOTOR VISUAL (PARTÍCULAS) ---
    particles: [],
    createEffect(type, x, y, color) {
        const count = 15;
        for(let i=0; i<count; i++) {
            this.particles.push({
                x, y,
                vx: (Math.random()-0.5)*8,
                vy: (Math.random()-0.5)*8,
                life: 1.0,
                color: color,
                type: type
            });
        }
    },

    drawEffects() {
        this.fxCtx.clearRect(0,0,this.fxCvs.width, this.fxCvs.height);
        this.particles.forEach((p, i) => {
            this.fxCtx.globalAlpha = p.life;
            this.fxCtx.fillStyle = p.color;
            
            // Efeito de faísca/eletricidade
            if(p.type === 'lightning') {
                this.fxCtx.fillRect(p.x, p.y, 2, 10);
            } else {
                this.fxCtx.beginPath();
                this.fxCtx.arc(p.x, p.y, p.life*3, 0, Math.PI*2);
                this.fxCtx.fill();
            }

            p.x += p.vx; p.y += p.vy; p.life -= 0.02;
            if(p.life <= 0) this.particles.splice(i, 1);
        });
    },

    // --- INTERFACE E UTILITÁRIOS ---
    updateUI() {
        document.getElementById('val-gold').innerText = this.format(this.state.gold);
        document.getElementById('val-essence').innerText = this.format(this.state.essence);
        document.getElementById('val-level').innerText = `NÍVEL ${this.state.level}`;
        document.getElementById('curr-lvl').innerText = this.state.level;
        document.getElementById('val-points').innerText = this.state.points;
        document.getElementById('val-dps').innerText = this.format(this.state.dps);
        
        document.getElementById('stat-str').innerText = this.state.stats.str;
        document.getElementById('stat-ene').innerText = this.state.stats.ene;
        document.getElementById('stat-agi').innerText = this.state.stats.agi;
    },

    updateBars() {
        const manaPerc = (this.state.mana / this.state.maxMana) * 100;
        document.getElementById('mana-fill').style.width = `${manaPerc}%`;
        document.getElementById('mana-text').innerText = `${Math.floor(this.state.mana)} / ${this.state.maxMana}`;

        const xpPerc = (this.state.xp / this.getRequiredXP()) * 100;
        document.getElementById('xp-fill').style.width = `${xpPerc}%`;
    },

    format(num) {
        if (num >= 1000000) return (num / 1000000).toFixed(2) + 'M';
        if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
        return Math.floor(num);
    },

    saveGame() {
        this.state.lastSave = Date.now();
        localStorage.setItem(this.config.saveKey, JSON.stringify(this.state));
    },

    loadGame() {
        const saved = localStorage.getItem(this.config.saveKey);
        if (saved) this.state = {...this.state, ...JSON.parse(saved)};
        this.updateStatsLogic();
    },

    setupPWA() {
        // Lógica de instalação (Manifest)
        window.addEventListener('beforeinstallprompt', (e) => {
            e.preventDefault();
            console.log("PWA Pronto para instalar.");
        });
    },

    gameLoop() {
        // Regeneração de Mana
        if(this.state.mana < this.state.maxMana) {
            this.state.mana += this.state.manaRegen / 60;
        }

        this.drawEffects();
        this.updateBars();
        this.updateUI();
        
        requestAnimationFrame(() => this.gameLoop());
    }
};

window.onload = () => Game.init();
