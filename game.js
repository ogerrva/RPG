/**
 * TWISTING SLASH: ELEMENTAL EVOLUTION
 * Lógica de Jogo, VFX e Progressão Offline
 */

const Game = {
    // 1. ESTADO DO JOGO
    state: {
        gold: 0,
        level: 1,
        xp: 0,
        xpNext: 100,
        essence: 0,
        skillPoints: 0,
        lastUpdate: Date.now(),
        
        // Atributos
        stats: {
            damage: 10,
            atkSpeed: 1,
            critChance: 0.05,
            luck: 1
        },

        // Habilidades (Elemento: Nível)
        skills: {
            fire: 0,
            ice: 0,
            lightning: 0,
            wind: 0
        },
        activeSynergy: null
    },

    // 2. CONFIGURAÇÕES DE BALANCEAMENTO
    config: {
        baseXP: 100,
        xpScaling: 1.15, // Aumenta 15% por nível
        goldScaling: 1.12,
        offlineEfficiency: 0.6, // Ganha 60% do progresso enquanto fora
    },

    // 3. INICIALIZAÇÃO
    init() {
        this.canvas = document.getElementById('vfx-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());

        this.loadGame();
        this.checkOfflineProgress();
        this.setupEventListeners();
        this.renderSkillTree();
        
        // Game Loop
        requestAnimationFrame((t) => this.loop(t));
        
        // Save automático a cada 10 segundos
        setInterval(() => this.saveGame(), 10000);
    },

    resizeCanvas() {
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;
    },

    // 4. SISTEMA DE VFX (ANIMAÇÕES)
    particles: [],
    
    createLightning(x1, y1, x2, y2) {
        this.particles.push({
            type: 'lightning',
            points: this.generateLightningPath(x1, y1, x2, y2),
            life: 1.0,
            color: '#ffe600'
        });
    },

    generateLightningPath(x1, y1, x2, y2) {
        let points = [{x: x1, y: y1}];
        let dist = Math.hypot(x2-x1, y2-y1);
        let segments = 8;
        for(let i=1; i<segments; i++) {
            let px = x1 + (x2-x1) * (i/segments) + (Math.random()-0.5) * 30;
            let py = y1 + (y2-y1) * (i/segments) + (Math.random()-0.5) * 30;
            points.push({x: px, y: py});
        }
        points.push({x: x2, y: y2});
        return points;
    },

    drawVFX() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Aplica efeito de Domínio (Sugestão C)
        if(this.state.activeSynergy === 'Supercondutor') {
            this.ctx.fillStyle = 'rgba(0, 170, 255, 0.05)';
            this.ctx.fillRect(0,0, this.canvas.width, this.canvas.height);
        }

        for(let i = this.particles.length - 1; i >= 0; i--) {
            let p = this.particles[i];
            this.ctx.strokeStyle = p.color;
            this.ctx.lineWidth = 2 * p.life;
            this.ctx.globalAlpha = p.life;
            this.ctx.shadowBlur = 10;
            this.ctx.shadowColor = p.color;

            if(p.type === 'lightning') {
                this.ctx.beginPath();
                this.ctx.moveTo(p.points[0].x, p.points[0].y);
                p.points.forEach(pt => this.ctx.lineTo(pt.x, pt.y));
                this.ctx.stroke();
            }

            p.life -= 0.05;
            if(p.life <= 0) this.particles.splice(i, 1);
        }
        this.ctx.globalAlpha = 1;
        this.ctx.shadowBlur = 0;
    },

    // 5. LÓGICA DE COMBATE E BALANCEAMENTO
    spawnEnemy() {
        // Simulação de ataque automático (Idle)
        const damage = this.state.stats.damage * (1 + (this.state.skills.fire * 0.2));
        const isCrit = Math.random() < this.state.stats.critChance;
        const finalDmg = isCrit ? damage * 2 : damage;

        // Visual do ataque
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        if(this.state.skills.lightning > 0) {
            this.createLightning(centerX - 50, centerY, centerX + 50, centerY + (Math.random()*40 - 20));
        }

        this.gainRewards();
    },

    gainRewards() {
        // Fórmulas de Balanceamento Exponencial
        const rewardGold = Math.floor(5 * Math.pow(this.config.goldScaling, this.state.level));
        const rewardXP = Math.floor(10 * Math.pow(this.config.xpScaling, this.state.level));

        this.state.gold += rewardGold;
        this.state.xp += rewardXP;

        if(this.state.xp >= this.state.xpNext) {
            this.levelUp();
        }
        this.updateUI();
    },

    levelUp() {
        this.state.level++;
        this.state.xp = 0;
        this.state.xpNext = Math.floor(this.config.baseXP * Math.pow(this.config.xpScaling, this.state.level));
        this.state.skillPoints += 2;
        // Feedback visual de level up pode ser adicionado aqui
    },

    // 6. SINERGIAS E SKILLS
    checkSynergies() {
        const s = this.state.skills;
        let oldSynergy = this.state.activeSynergy;

        if(s.fire >= 5 && s.wind >= 5) this.state.activeSynergy = "Tornado de Chamas";
        else if(s.lightning >= 5 && s.ice >= 5) this.state.activeSynergy = "Supercondutor";
        else this.state.activeSynergy = null;

        if(this.state.activeSynergy && this.state.activeSynergy !== oldSynergy) {
            this.showSynergyAlert(this.state.activeSynergy);
        }
    },

    respec() {
        let totalPoints = 0;
        for(let key in this.state.skills) {
            totalPoints += this.state.skills[key];
            this.state.skills[key] = 0;
        }
        this.state.skillPoints += totalPoints;
        this.state.activeSynergy = null;
        this.renderSkillTree();
        this.updateUI();
    },

    // 7. PROGRESSO OFFLINE
    checkOfflineProgress() {
        const now = Date.now();
        const diff = (now - this.state.lastUpdate) / 1000; // Segundos

        if(diff > 60) { // Mais de 1 minuto fora
            const hours = (diff / 3600).toFixed(1);
            const offlineGold = Math.floor(diff * (this.state.level * 0.5) * this.config.offlineEfficiency);
            const offlineXP = Math.floor(diff * (this.state.level * 0.2) * this.config.offlineEfficiency);

            this.state.gold += offlineGold;
            this.state.xp += offlineXP;
            
            // Mostrar Modal
            document.getElementById('offline-time').innerText = `${hours}h`;
            document.getElementById('offline-gold').innerText = offlineGold;
            document.getElementById('offline-xp').innerText = offlineXP;
            document.getElementById('offline-modal').classList.remove('hidden');
        }
        this.state.lastUpdate = now;
    },

    // 8. PERSISTÊNCIA (SAVE/LOAD)
    saveGame() {
        this.state.lastUpdate = Date.now();
        localStorage.setItem('twistingSlashSave', JSON.stringify(this.state));
    },

    loadGame() {
        const saved = localStorage.getItem('twistingSlashSave');
        if(saved) {
            this.state = {...this.state, ...JSON.parse(saved)};
        }
    },

    // 9. UI ENGINE
    setupEventListeners() {
        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.onclick = () => {
                document.querySelectorAll('.tab-btn, .tab-pane').forEach(el => el.classList.remove('active'));
                btn.classList.add('active');
                document.getElementById(`${btn.dataset.tab}-tab`).classList.add('active');
            };
        });

        document.getElementById('btn-respec').onclick = () => this.respec();
        document.getElementById('close-offline').onclick = () => {
            document.getElementById('offline-modal').classList.add('hidden');
        };

        // Clique na arena para ataque manual
        document.getElementById('arena-section').onclick = (e) => {
            this.createLightning(this.canvas.width/2, this.canvas.height/2, e.clientX, e.clientY);
            this.gainRewards();
        };
    },

    renderSkillTree() {
        const container = document.getElementById('skill-tree-container');
        const skills = [
            { id: 'fire', name: 'Chamas Infernais', desc: '+20% Dano por Nível' },
            { id: 'ice', name: 'Zero Absoluto', desc: 'Congela inimigos' },
            { id: 'lightning', name: 'Fúria de Thor', desc: 'Dano em área' },
            { id: 'wind', name: 'Corte de Vácuo', desc: '+10% Velocidade' }
        ];

        container.innerHTML = `<p style="margin-bottom:10px">Pontos Disponíveis: ${this.state.skillPoints}</p>`;
        
        skills.forEach(s => {
            const div = document.createElement('div');
            div.className = 'skill-node';
            div.innerHTML = `
                <div class="skill-info">
                    <h4>${s.name} (Nv. ${this.state.skills[s.id]})</h4>
                    <p>${s.desc}</p>
                </div>
                <button class="main-btn" ${this.state.skillPoints <= 0 ? 'disabled' : ''} onclick="Game.buySkill('${s.id}')">UP</button>
            `;
            container.appendChild(div);
        });
    },

    buySkill(id) {
        if(this.state.skillPoints > 0) {
            this.state.skills[id]++;
            this.state.skillPoints--;
            this.checkSynergies();
            this.renderSkillTree();
            this.updateUI();
        }
    },

    showSynergyAlert(name) {
        const alert = document.getElementById('synergy-alert');
        alert.innerText = `SINERGIA ATIVA: ${name.toUpperCase()}`;
        alert.classList.remove('hidden');
        setTimeout(() => alert.classList.add('hidden'), 3000);
    },

    updateUI() {
        document.getElementById('gold-val').innerText = Math.floor(this.state.gold);
        document.getElementById('level-val').innerText = this.state.level;
        document.getElementById('xp-text').innerText = `XP: ${this.state.xp} / ${this.state.xpNext}`;
        document.getElementById('xp-bar-fill').style.width = `${(this.state.xp / this.state.xpNext) * 100}%`;
    },

    loop(t) {
        this.drawVFX();
        // Ataca automaticamente a cada 1 segundo (Simulação Idle)
        if(t - this.state.lastUpdate > 1000) {
            this.spawnEnemy();
            this.state.lastUpdate = t;
        }
        requestAnimationFrame((t) => this.loop(t));
    }
};

window.onload = () => Game.init();
