/**
 * ==========================================================================
 * LÓGICA DO JOGO - TWISTING SLASH IDLE (NEON RPG)
 * ==========================================================================
 */

const Utils = {
    format: (num) => {
        if (num < 1000) return Math.floor(num).toString();
        const s = ["", "K", "M", "B", "T", "Qa"];
        const id = Math.floor(Math.log10(num) / 3);
        return (num / Math.pow(1000, id)).toFixed(2) + s[id];
    },
    calcCost: (base, level, exp) => Math.floor(base * Math.pow(exp, level))
};

// ==========================================================================
// BANCO DE DADOS: SKILL TREE ELEMENTAL (50 Skills)
// ==========================================================================
const Elements = {
    fire: { id: "fire", name: "Fogo", color: "#ff3300", glow: "#ff9966" },
    ice: { id: "ice", name: "Gelo", color: "#00ffff", glow: "#ccffff" },
    lightning: { id: "lightning", name: "Raio", color: "#ffff00", glow: "#ffffe6" },
    wind: { id: "wind", name: "Vento", color: "#00ff88", glow: "#99ffcc" },
    poison: { id: "poison", name: "Veneno", color: "#b300ff", glow: "#d9b3ff" }
};

const SkillTreeData = [
    // FOGO (Dano Bruto e Explosões)
    { id: "f1", el: "fire", n: "Lâmina Aquecida", d: "+10% Dano Base.", cost: 1, req: null },
    { id: "f2", el: "fire", n: "Queimadura", d: "Inimigos queimam (5% dano/s por 3s).", cost: 1, req: "f1" },
    { id: "f3", el: "fire", n: "Brasas", d: "10% chance de soltar faíscas em área.", cost: 2, req: "f2" },
    { id: "f4", el: "fire", n: "Fúria Ígnea", d: "Menos Mana = Mais Dano (até +50%).", cost: 2, req: "f3" },
    { id: "f5", el: "fire", n: "Explosão Menor", d: "20% chance de inimigos explodirem ao morrer.", cost: 3, req: "f4" },
    { id: "f6", el: "fire", n: "Rastro de Cinzas", d: "Deixa fogo no chão que queima inimigos.", cost: 3, req: "f5" },
    { id: "f7", el: "fire", n: "Coração de Magma", d: "+50% Dano Crítico contra alvos queimando.", cost: 4, req: "f6" },
    { id: "f8", el: "fire", n: "Onda de Calor", d: "A cada 10 giros, emite onda que empurra inimigos.", cost: 4, req: "f7" },
    { id: "f9", el: "fire", n: "Incinerar", d: "Dobro de dano em inimigos com <20% HP.", cost: 5, req: "f8" },
    { id: "f10", el: "fire", n: "Inferno Rotacional", d: "Lâmina de fogo permanente. Explosões em críticos.", cost: 10, req: "f9" },

    // GELO (Controle e Sobrevivência)
    { id: "i1", el: "ice", n: "Toque Gélido", d: "Inimigos ficam 10% mais lentos.", cost: 1, req: null },
    { id: "i2", el: "ice", n: "Frio Cortante", d: "+15% Dano contra inimigos lentos.", cost: 1, req: "i1" },
    { id: "i3", el: "ice", n: "Estilhaços", d: "15% chance de disparar 3 estilhaços de gelo.", cost: 2, req: "i2" },
    { id: "i4", el: "ice", n: "Congelamento", d: "5% chance de congelar o inimigo por 2s.", cost: 2, req: "i3" },
    { id: "i5", el: "ice", n: "Armadura de Gelo", d: "-10% Custo de Mana se houver inimigos congelados.", cost: 3, req: "i4" },
    { id: "i6", el: "ice", n: "Nevasca", d: "A cada 5s, reduz a velocidade de todos em 30%.", cost: 3, req: "i5" },
    { id: "i7", el: "ice", n: "Quebrar Gelo", d: "Acertar alvo congelado causa 300% de dano.", cost: 4, req: "i6" },
    { id: "i8", el: "ice", n: "Aura Gélida", d: "Inimigos próximos perdem 5% HP/s.", cost: 4, req: "i7" },
    { id: "i9", el: "ice", n: "Cristalização", d: "Inimigos congelados mortos dão +20% Ouro.", cost: 5, req: "i8" },
    { id: "i10", el: "ice", n: "Zero Absoluto", d: "Anel de gelo sólido. Inimigos nascem com 50% lentidão.", cost: 10, req: "i9" },

    // RAIO (Velocidade e Cadeia)
    { id: "l1", el: "lightning", n: "Fagulha", d: "+10% Velocidade de Rotação.", cost: 1, req: null },
    { id: "l2", el: "lightning", n: "Arco Elétrico", d: "20% chance do dano pular para 1 inimigo.", cost: 1, req: "l1" },
    { id: "l3", el: "lightning", n: "Sobrecarga", d: "+30% Mana Máxima.", cost: 2, req: "l2" },
    { id: "l4", el: "lightning", n: "Condutor", d: "Cada pulo elétrico aumenta a Rotação em 1%.", cost: 2, req: "l3" },
    { id: "l5", el: "lightning", n: "Tempestade Estática", d: "A cada 15 giros, um raio cai no inimigo mais forte.", cost: 3, req: "l4" },
    { id: "l6", el: "lightning", n: "Choque Crítico", d: "Críticos têm 100% chance de gerar Arco Elétrico.", cost: 3, req: "l5" },
    { id: "l7", el: "lightning", n: "Eletromagnetismo", d: "Ouro é atraído instantaneamente.", cost: 4, req: "l6" },
    { id: "l8", el: "lightning", n: "Curto-Circuito", d: "10% chance de atordoar inimigos atingidos por raios.", cost: 4, req: "l7" },
    { id: "l9", el: "lightning", n: "Bateria Viva", d: "+50% Regen de Mana na velocidade máxima.", cost: 5, req: "l8" },
    { id: "l10", el: "lightning", n: "Deus do Trovão", d: "Feixe de luz. Arcos pulam infinitamente.", cost: 10, req: "l9" },

    // VENTO (Alcance e Multiplicação)
    { id: "w1", el: "wind", n: "Brisa Leve", d: "+10% Raio de Alcance.", cost: 1, req: null },
    { id: "w2", el: "wind", n: "Lâmina de Vento", d: "10% chance de disparar lâmina reta perfurante.", cost: 1, req: "w1" },
    { id: "w3", el: "wind", n: "Aerodinâmica", d: "-20% Custo de Mana da rotação.", cost: 2, req: "w2" },
    { id: "w4", el: "wind", n: "Tornado Menor", d: "A cada 20 giros, cria um mini-tornado.", cost: 2, req: "w3" },
    { id: "w5", el: "wind", n: "Vácuo", d: "Inimigos são puxados lentamente para a lâmina.", cost: 3, req: "w4" },
    { id: "w6", el: "wind", n: "Corte Duplo", d: "15% chance de acertar duas vezes no mesmo frame.", cost: 3, req: "w5" },
    { id: "w7", el: "wind", n: "Vendaval", d: "+20% Rotação se houver >5 inimigos na tela.", cost: 4, req: "w6" },
    { id: "w8", el: "wind", n: "Lâmina Fantasma", d: "Lâminas de vento agora perseguem inimigos.", cost: 4, req: "w7" },
    { id: "w9", el: "wind", n: "Fôlego Inesgotável", d: "Sem Mana? Gira a 50% da velocidade por 5s grátis.", cost: 5, req: "w8" },
    { id: "w10", el: "wind", n: "Furacão Devastador", d: "Tornado verde gigante. Dobra alcance e puxa todos.", cost: 10, req: "w9" },

    // VENENO (Dano Contínuo e Enfraquecimento)
    { id: "p1", el: "poison", n: "Lâmina Tóxica", d: "Inimigos envenenados perdem 2% HP Max/s.", cost: 1, req: null },
    { id: "p2", el: "poison", n: "Corrosão", d: "Inimigos envenenados recebem +15% Dano Base.", cost: 1, req: "p1" },
    { id: "p3", el: "poison", n: "Nuvem de Gás", d: "Inimigos mortos deixam nuvem tóxica.", cost: 2, req: "p2" },
    { id: "p4", el: "poison", n: "Epidemia", d: "Veneno se espalha para inimigos próximos.", cost: 2, req: "p3" },
    { id: "p5", el: "poison", n: "Sifão Tóxico", d: "5% do dano de veneno vira Mana.", cost: 3, req: "p4" },
    { id: "p6", el: "poison", n: "Necrose", d: "Envenenados por >5s ficam 30% mais lentos.", cost: 3, req: "p5" },
    { id: "p7", el: "poison", n: "Veneno Volátil", d: "Críticos em envenenados causam explosão tóxica.", cost: 4, req: "p6" },
    { id: "p8", el: "poison", n: "Miasma", d: "Aumenta dano do veneno para 5% HP Max/s.", cost: 4, req: "p7" },
    { id: "p9", el: "poison", n: "Decomposição", d: "Inimigos mortos por veneno dão +50% XP.", cost: 5, req: "p8" },
    { id: "p10", el: "poison", n: "Praga Absoluta", d: "Rastro de lodo. Todos nascem envenenados.", cost: 10, req: "p9" }
];

// ==========================================================================
// ESTADO DO JOGO
// ==========================================================================
const Game = {
    state: {
        level: 1, xp: 0, statPoints: 0, skillPoints: 0,
        str: 0, agi: 0, ene: 0,
        gold: 0, essence: 0,
        enemyLvl: 1, maxEnemies: 1, enemySpd: 0,
        mana: 100, lastSave: Date.now(),
        unlockedSkills: [] // IDs das skills compradas
    },

    runtime: {
        lastFrame: performance.now(),
        angle: 0, enemies: [], texts: [], particles: [], projectiles: [], shockwaves: [],
        
        reqXp: 100, maxMana: 100, manaRegen: 5, manaCost: 10,
        dmg: 1, rps: 1, radius: 80, mult: 1,
        isExhausted: false,
        
        // Efeitos Ativos das Skills
        activeElement: null, // Qual ultimate está ativa?
        burnDmg: 0, slowMult: 1, poisonDmg: 0,
        
        // Timers de Skills
        tornadoTimer: 0, meteorTimer: 0, blizzardTimer: 0
    },

    config: {
        baseXpReq: 100, xpReqMultiplier: 1.4,
        baseEnemyHp: 20, enemyHpMultiplier: 1.15,
        baseEnemyXp: 15, enemyXpMultiplier: 1.15,
        baseEnemyGold: 1, enemyGoldMultiplier: 1.15
    },

    init: () => {
        if (localStorage.getItem('twistingSlashSave') === "[object Object]") {
            localStorage.removeItem('twistingSlashSave');
        }
        
        Game.load();
        Game.calcStats();
        Renderer.init();
        for(let i=0; i<Game.state.maxEnemies; i++) Game.spawnEnemy();
        
        Game.runtime.lastFrame = performance.now();
        requestAnimationFrame(Game.loop);
        setInterval(Game.save, 5000);
    },

    save: () => {
        Game.state.lastSave = Date.now();
        localStorage.setItem('twistingSlashSave', JSON.stringify(Game.state));
    },

    load: () => {
        let saved = localStorage.getItem('twistingSlashSave');
        if (saved) {
            try {
                Object.assign(Game.state, JSON.parse(saved));
                if(!Game.state.unlockedSkills) Game.state.unlockedSkills = [];
                if(Game.state.skillPoints === undefined) Game.state.skillPoints = 0;
                
                let now = Date.now();
                let offTime = Math.min((now - Game.state.lastSave) / 1000, 86400);
                
                if (offTime > 60) {
                    Game.calcStats();
                    let dps = Game.runtime.dmg * (Game.runtime.rps * 2) * Game.state.maxEnemies;
                    let eHp = Game.config.baseEnemyHp * Math.pow(Game.config.enemyHpMultiplier, Game.state.enemyLvl);
                    let kills = Math.floor((dps * offTime) / eHp);
                    
                    if (kills > 0) {
                        let g = kills * (Game.config.baseEnemyGold * Math.pow(Game.config.enemyGoldMultiplier, Game.state.enemyLvl) * (1 + Game.state.enemySpd * 0.5));
                        let x = kills * (Game.config.baseEnemyXp * Math.pow(Game.config.enemyXpMultiplier, Game.state.enemyLvl));
                        Game.state.gold += g; 
                        Game.addXp(x);
                        UI.showToast(`Offline: +${Utils.format(g)} Ouro!`);
                    }
                }
            } catch(e){ console.error("Erro ao carregar save:", e); }
        }
    },

    hasSkill: (id) => Game.state.unlockedSkills.includes(id),

    calcStats: () => {
        let s = Game.state; let r = Game.runtime;
        r.reqXp = Math.floor(Game.config.baseXpReq * Math.pow(Game.config.xpReqMultiplier, s.level - 1));
        
        // Bônus da Skill Tree
        let strBonus = Game.hasSkill("f1") ? 1.1 : 1;
        let agiBonus = Game.hasSkill("l1") ? 1.1 : 1;
        let radBonus = Game.hasSkill("w1") ? 1.1 : 1;
        let manaBonus = Game.hasSkill("l3") ? 1.3 : 1;
        let costRed = Game.hasSkill("w3") ? 0.8 : 1;
        
        let bDmg = (1 + (s.str * 0.5) + Math.pow(s.str, 1.2) * 0.1) * strBonus;
        let bSpd = (1 + (s.agi * 0.05)) * agiBonus;
        
        r.radius = 80 * radBonus;
        if(Game.hasSkill("w10")) r.radius *= 2; // Ultimate Vento
        
        r.maxMana = (100 + (s.ene * 15)) * manaBonus;
        r.manaRegen = 5 + (s.ene * 2);
        if(Game.hasSkill("l9") && r.rps > 2) r.manaRegen *= 1.5; // Bateria Viva
        
        let baseCostRed = 1 / (1 + (s.ene * 0.02));

        if (s.mana <= 0) {
            r.isExhausted = true;
            r.dmg = (bDmg * 0.1);
            r.rps = bSpd * 0.3;
        } else {
            r.isExhausted = false;
            r.dmg = bDmg;
            r.rps = bSpd;
        }
        
        // Fórmula de Custo de Mana (Nunca chega a zero, apenas reduz em %)
        r.manaCost = (10 * bSpd) * baseCostRed * costRed;
        
        // Ultimates Ativas
        if(Game.hasSkill("f10")) r.activeElement = "fire";
        else if(Game.hasSkill("i10")) r.activeElement = "ice";
        else if(Game.hasSkill("l10")) r.activeElement = "lightning";
        else if(Game.hasSkill("w10")) r.activeElement = "wind";
        else if(Game.hasSkill("p10")) r.activeElement = "poison";
        else r.activeElement = null;
    },

    addXp: (amt) => {
        if(Game.hasSkill("p9")) amt *= 1.5; // Decomposição
        
        Game.state.xp += amt; let up = false;
        while(Game.state.xp >= Game.runtime.reqXp) {
            Game.state.xp -= Game.runtime.reqXp;
            Game.state.level++;
            Game.state.statPoints += 20; 
            
            // 1 Ponto de Skill a cada 5 Níveis
            if(Game.state.level % 5 === 0) {
                Game.state.skillPoints++;
                UI.showToast(`+1 Ponto de Skill (SP)!`);
            }
            
            Game.calcStats(); up = true;
        }
        if(up) UI.showToast(`Level UP! +20 Pontos`);
        UI.update();
    },

    addStat: (attr) => {
        if (Game.state.statPoints > 0) {
            Game.state.statPoints--; Game.state[attr]++;
            Game.calcStats(); UI.update();
        }
    },

    buySkill: (id) => {
        let skill = SkillTreeData.find(s => s.id === id);
        if(!skill) return;
        if(Game.state.unlockedSkills.includes(id)) return;
        if(skill.req && !Game.state.unlockedSkills.includes(skill.req)) {
            UI.showToast("Desbloqueie a habilidade anterior primeiro!", true); return;
        }
        if(Game.state.skillPoints >= skill.cost) {
            Game.state.skillPoints -= skill.cost;
            Game.state.unlockedSkills.push(id);
            Game.calcStats();
            UI.rebuildSkills();
            UI.update();
            UI.showToast(`Habilidade ${skill.n} Desbloqueada!`);
        } else {
            UI.showToast("Pontos de Skill (SP) Insuficientes!", true);
        }
    },

    buyEnemyLevel: () => { let c = Utils.calcCost(10, Game.state.enemyLvl - 1, 1.5); if(Game.state.gold >= c) { Game.state.gold -= c; Game.state.enemyLvl++; Game.runtime.enemies=[]; for(let i=0; i<Game.state.maxEnemies; i++) Game.spawnEnemy(); UI.update(); } },
    buyMaxEnemies: () => { let c = Utils.calcCost(50, Game.state.maxEnemies - 1, 2.5); if(Game.state.maxEnemies < 10 && Game.state.gold >= c) { Game.state.gold -= c; Game.state.maxEnemies++; Game.spawnEnemy(); UI.update(); } },
    buyEnemySpeed: () => { let c = Utils.calcCost(100, Game.state.enemySpd, 1.8); if(Game.state.gold >= c) { Game.state.gold -= c; Game.state.enemySpd++; UI.update(); } },

    spawnEnemy: () => {
        let hp = 20 * Math.pow(1.15, Game.state.enemyLvl);
        let a = Math.random() * Math.PI * 2; let d = 150 + Math.random() * 50;
        
        let isElite = Math.random() > 0.8;
        if(isElite) hp *= 3;

        let e = { 
            id: Math.random(), hp: hp, maxHp: hp, 
            x: Math.cos(a)*d, y: Math.sin(a)*d, 
            flash: 0, isElite: isElite,
            name: isElite ? "Elite Sombrio" : "Espectro Menor",
            poisonTimer: 0, burnTimer: 0, freezeTimer: 0, stunTimer: 0
        };
        
        if(Game.hasSkill("p10")) e.poisonTimer = 9999; // Praga Absoluta
        if(Game.hasSkill("i10") && !isElite) e.freezeTimer = 9999; // Zero Absoluto
        
        Game.runtime.enemies.push(e);
    },

    hitEnemy: (e, dmg, isCrit = false) => {
        if(e.hp <= 0) return;
        
        // Aplicação de Dano e Efeitos das Skills
        if(Game.hasSkill("i2") && e.freezeTimer > 0) dmg *= 1.15; // Frio Cortante
        if(Game.hasSkill("p2") && e.poisonTimer > 0) dmg *= 1.15; // Corrosão
        if(Game.hasSkill("f9") && (e.hp/e.maxHp) < 0.2) dmg *= 2; // Incinerar
        if(Game.hasSkill("i7") && e.freezeTimer > 0) { dmg *= 3; e.freezeTimer = 0; } // Quebrar Gelo
        
        if(isCrit && Game.hasSkill("f7") && e.burnTimer > 0) dmg *= 1.5; // Coração de Magma
        
        e.hp -= dmg; e.flash = 0.1;
        
        // Efeitos de Acerto (Procs) que custam Mana
        if(Game.hasSkill("p1") && Game.state.mana >= 2) { e.poisonTimer = 3; Game.state.mana -= 2; }
        if(Game.hasSkill("f2") && Game.state.mana >= 2) { e.burnTimer = 3; Game.state.mana -= 2; }
        if(Game.hasSkill("i1") && Game.state.mana >= 2) { e.freezeTimer = 2; Game.state.mana -= 2; }
        
        if(Game.hasSkill("i3") && Math.random() < 0.15 && Game.state.mana >= 5) {
            Game.state.mana -= 5;
            for(let i=0; i<3; i++) Game.fireProjectile(e.x, e.y, "ice", "split");
        }
        if(Game.hasSkill("w2") && Math.random() < 0.10 && Game.state.mana >= 5) {
            Game.state.mana -= 5;
            Game.fireProjectile(e.x, e.y, "wind", "pierce");
        }
        if(Game.hasSkill("l2") && Math.random() < 0.20 && Game.state.mana >= 5) {
            Game.state.mana -= 5;
            Game.fireProjectile(e.x, e.y, "lightning", "bounce");
        }
        if(isCrit && Game.hasSkill("l6") && Game.state.mana >= 5) {
            Game.state.mana -= 5;
            Game.fireProjectile(e.x, e.y, "lightning", "bounce");
        }
        if(isCrit && Game.hasSkill("p7") && e.poisonTimer > 0 && Game.state.mana >= 10) {
            Game.state.mana -= 10;
            Renderer.createExplosion(e.x, e.y, Elements.poison.color);
            Game.runtime.enemies.forEach(en => { if(Math.hypot(en.x-e.x, en.y-e.y) < 50) en.hp -= dmg*0.5; });
        }
        
        Game.runtime.texts.push({ x: e.x + (Math.random()*20-10), y: e.y - 15, txt: Utils.format(dmg), life: 0.8, color: isCrit ? "#ffcc00" : "#fff" });
        
        if (e.hp <= 0) {
            Game.runtime.enemies = Game.runtime.enemies.filter(en => en.id !== e.id);
            
            let g = Game.config.baseEnemyGold * Math.pow(Game.config.enemyGoldMultiplier, Game.state.enemyLvl) * (1 + Game.state.enemySpd * 0.5);
            let x = Game.config.baseEnemyXp * Math.pow(Game.config.enemyXpMultiplier, Game.state.enemyLvl);
            if(e.isElite) { g *= 3; x *= 3; }
            
            if(Game.hasSkill("i9") && e.freezeTimer > 0) g *= 1.2; // Cristalização
            
            Game.state.gold += g; Game.addXp(x);
            
            if(Game.hasSkill("p5") && e.poisonTimer > 0) Game.state.mana += dmg * 0.05; // Sifão Tóxico
            
            if(Game.hasSkill("f5") && Math.random() < 0.2 && Game.state.mana >= 10) {
                Game.state.mana -= 10;
                Renderer.createExplosion(e.x, e.y, Elements.fire.color);
                Game.runtime.enemies.forEach(en => { if(Math.hypot(en.x-e.x, en.y-e.y) < 50) en.hp -= dmg; });
            }
            
            if(Game.hasSkill("p3") && e.poisonTimer > 0 && Game.state.mana >= 10) {
                Game.state.mana -= 10;
                Game.runtime.shockwaves.push({x: e.x, y: e.y, color: Elements.poison.color, radius: 0, life: 2.0});
            }

            Renderer.createExplosion(e.x, e.y, e.isElite ? "#ff2a4b" : "#00aaff");
            setTimeout(Game.spawnEnemy, 500); 
        }
    },

    fireProjectile: (x, y, element, type) => {
        let target = Game.runtime.enemies[Math.floor(Math.random() * Game.runtime.enemies.length)];
        if(!target) return;
        Game.runtime.projectiles.push({
            x: x, y: y, target: target, element: element, type: type,
            speed: 300, dmg: Game.runtime.dmg * 0.5, life: 2.0
        });
    },

    loop: (time) => {
        let dt = Math.min((time - Game.runtime.lastFrame) / 1000, 0.1);
        Game.runtime.lastFrame = time;

        Game.calcStats();
        
        if (!Game.runtime.isExhausted) Game.state.mana -= Game.runtime.manaCost * dt;
        Game.state.mana += Game.runtime.manaRegen * dt;
        if (Game.state.mana > Game.runtime.maxMana) Game.state.mana = Game.runtime.maxMana;
        if (Game.state.mana < 0) Game.state.mana = 0;

        let rotDelta = (Game.runtime.rps * Math.PI * 2) * dt;
        let prevAngle = Game.runtime.angle;
        Game.runtime.angle = (Game.runtime.angle + rotDelta) % (Math.PI * 2);

        // Timers de Skills Globais
        if(Game.hasSkill("w4") && Game.state.mana >= 20) {
            Game.runtime.tornadoTimer += rotDelta;
            if(Game.runtime.tornadoTimer >= Math.PI * 40) { // A cada 20 giros
                Game.runtime.tornadoTimer = 0; Game.state.mana -= 20;
                Game.fireProjectile(0, 0, "wind", "orbit");
            }
        }
        if(Game.hasSkill("l5") && Game.state.mana >= 30) {
            Game.runtime.meteorTimer += rotDelta;
            if(Game.runtime.meteorTimer >= Math.PI * 30) { // A cada 15 giros
                Game.runtime.meteorTimer = 0; Game.state.mana -= 30;
                let strongest = Game.runtime.enemies.reduce((prev, current) => (prev.hp > current.hp) ? prev : current, Game.runtime.enemies[0]);
                if(strongest) Game.hitEnemy(strongest, Game.runtime.dmg * 5);
                Renderer.createExplosion(strongest.x, strongest.y, Elements.lightning.color);
            }
        }

        let baseSpd = 20 * (1 + Game.state.enemySpd * 0.2);
        
        Game.runtime.enemies.forEach(e => {
            if (e.flash > 0) e.flash -= dt;
            if (e.stunTimer > 0) { e.stunTimer -= dt; return; } // Stunned
            
            // DoTs (Damage over Time)
            if (e.burnTimer > 0) { e.burnTimer -= dt; Game.hitEnemy(e, Game.runtime.dmg * 0.05 * dt); }
            if (e.poisonTimer > 0) { 
                e.poisonTimer -= dt; 
                let pDmg = Game.hasSkill("p8") ? 0.05 : 0.02;
                Game.hitEnemy(e, e.maxHp * pDmg * dt); 
            }

            let dist = Math.hypot(e.x, e.y);
            let moveSpd = baseSpd;
            if (e.freezeTimer > 0) { e.freezeTimer -= dt; moveSpd *= 0.9; } // Lentidão do Gelo
            if (Game.hasSkill("w5")) moveSpd += 10; // Vácuo puxa mais rápido
            
            if (dist > 30) { e.x -= (e.x/dist) * moveSpd * dt; e.y -= (e.y/dist) * moveSpd * dt; }
            
            if (dist <= Game.runtime.radius + 10) {
                let eAngle = Math.atan2(e.y, e.x); if (eAngle < 0) eAngle += Math.PI * 2;
                let hit = false;
                if (prevAngle < Game.runtime.angle) { if (eAngle >= prevAngle && eAngle <= Game.runtime.angle) hit = true; } 
                else { if (eAngle >= prevAngle || eAngle <= Game.runtime.angle) hit = true; }
                
                let rots = Math.floor(rotDelta / (Math.PI * 2));
                let hits = (hit ? 1 : 0) + rots;
                
                if (Game.hasSkill("w6") && Math.random() < 0.15) hits *= 2; // Corte Duplo
                
                if (hits > 0) {
                    let isCrit = Math.random() < 0.1; // 10% base crit
                    Game.hitEnemy(e, Game.runtime.dmg * hits * (isCrit ? 2 : 1), isCrit);
                }
            }
        });

        // Atualiza Projéteis
        Game.runtime.projectiles.forEach(p => {
            p.life -= dt;
            if(!p.target || p.target.hp <= 0) { p.life = 0; return; }
            let dx = p.target.x - p.x; let dy = p.target.y - p.y; let dist = Math.hypot(dx, dy);
            if(dist < p.speed * dt) {
                Game.hitEnemy(p.target, p.dmg);
                p.life = 0;
                if(p.type === "bounce") {
                    let next = Game.runtime.enemies.find(en => en.id !== p.target.id);
                    if(next) Game.fireProjectile(p.target.x, p.target.y, p.element, "bounce");
                }
            } else {
                p.x += (dx/dist) * p.speed * dt; p.y += (dy/dist) * p.speed * dt;
            }
        });
        Game.runtime.projectiles = Game.runtime.projectiles.filter(p => p.life > 0);

        // Atualiza Shockwaves (Nuvens de Veneno)
        Game.runtime.shockwaves.forEach(s => {
            s.life -= dt; s.radius += 20 * dt;
            Game.runtime.enemies.forEach(e => {
                if(Math.hypot(e.x, e.y) < s.radius) Game.hitEnemy(e, Game.runtime.dmg * 0.1 * dt);
            });
        });
        Game.runtime.shockwaves = Game.runtime.shockwaves.filter(s => s.life > 0);

        Game.runtime.texts.forEach(t => { t.y -= 30 * dt; t.life -= dt; });
        Game.runtime.texts = Game.runtime.texts.filter(t => t.life > 0);
        
        Game.runtime.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
        Game.runtime.particles = Game.runtime.particles.filter(p => p.life > 0);

        Renderer.draw(); UI.update();
        requestAnimationFrame(Game.loop);
    }
};

/**
 * ==========================================================================
 * RENDERIZADOR (CANVAS)
 * ==========================================================================
 */
const Renderer = {
    canvas: null, ctx: null, w: 0, h: 0,
    init: () => {
        Renderer.canvas = document.getElementById('gameCanvas');
        Renderer.ctx = Renderer.canvas.getContext('2d');
        Renderer.resize(); window.addEventListener('resize', Renderer.resize);
    },
    resize: () => {
        let p = Renderer.canvas.parentElement; Renderer.w = p.clientWidth; Renderer.h = p.clientHeight;
        Renderer.canvas.width = Renderer.w; Renderer.canvas.height = Renderer.h;
    },
    createExplosion: (x, y, color) => {
        for(let i=0; i<15; i++) {
            let a = Math.random() * Math.PI * 2; let s = Math.random() * 60 + 20;
            Game.runtime.particles.push({ x: x, y: y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 0.5, max: 0.5, c: color });
        }
    },
    draw: () => {
        let ctx = Renderer.ctx; let cx = Renderer.w / 2; let cy = Renderer.h / 2;
        ctx.clearRect(0, 0, Renderer.w, Renderer.h);

        // Fundo e Grid
        if(Game.runtime.activeElement) {
            ctx.fillStyle = Elements[Game.runtime.activeElement].color;
            ctx.globalAlpha = 0.1; ctx.fillRect(0, 0, Renderer.w, Renderer.h); ctx.globalAlpha = 1.0;
        }

        ctx.beginPath(); ctx.arc(cx, cy, Game.runtime.radius, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.stroke();

        // Nuvens de Veneno (Shockwaves)
        Game.runtime.shockwaves.forEach(s => {
            ctx.beginPath(); ctx.arc(cx, cy, s.radius, 0, Math.PI*2);
            ctx.fillStyle = s.color; ctx.globalAlpha = 0.2; ctx.fill(); ctx.globalAlpha = 1.0;
        });

        // Partículas
        ctx.globalCompositeOperation = "lighter";
        Game.runtime.particles.forEach(p => {
            ctx.fillStyle = p.c; ctx.globalAlpha = p.life/p.max;
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";

        // Projéteis
        Game.runtime.projectiles.forEach(p => {
            ctx.fillStyle = Elements[p.element].color;
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 3, 0, Math.PI*2); ctx.fill();
        });

        // Inimigos
        Game.runtime.enemies.forEach(e => {
            ctx.save(); ctx.translate(cx + e.x, cy + e.y);
            
            let eColor = e.isElite ? "#ff2a4b" : "#00aaff";
            if(e.poisonTimer > 0) eColor = Elements.poison.color;
            if(e.freezeTimer > 0) eColor = Elements.ice.color;
            if(e.burnTimer > 0) eColor = Elements.fire.color;

            ctx.shadowBlur = e.flash > 0 ? 15 : 5; ctx.shadowColor = e.flash > 0 ? "#fff" : eColor;
            ctx.fillStyle = e.flash > 0 ? "#fff" : "#111"; ctx.strokeStyle = e.flash > 0 ? "#fff" : eColor;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, e.isElite ? 16 : 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.restore();
        });

        // Jogador
        ctx.shadowBlur = 15; ctx.shadowColor = Game.runtime.isExhausted ? "#ff2a4b" : (Game.runtime.activeElement ? Elements[Game.runtime.activeElement].color : "#00aaff");
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;

        // Twisting Slash (Lâmina Dupla)
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Game.runtime.angle);
        
        let c1 = Game.runtime.isExhausted ? "rgba(255,42,75,0.8)" : (Game.runtime.activeElement ? Elements[Game.runtime.activeElement].color : "rgba(0,170,255,0.9)");
        let c2 = Game.runtime.isExhausted ? "rgba(255,42,75,0.2)" : "rgba(255,42,75,0.8)"; 
        
        ctx.beginPath(); ctx.arc(0, 0, Game.runtime.radius, -Math.PI/4, Math.PI/4);
        ctx.lineWidth = 4; ctx.strokeStyle = c1; ctx.shadowBlur = 10; ctx.shadowColor = c1; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(0, 0, Game.runtime.radius - 5, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
        ctx.lineWidth = 3; ctx.strokeStyle = c2; ctx.shadowBlur = 10; ctx.shadowColor = c2; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(0, 0, Game.runtime.radius, -Math.PI/2, -Math.PI/4);
        ctx.lineWidth = 2; ctx.strokeStyle = Game.runtime.isExhausted ? "rgba(255,42,75,0.2)" : "rgba(0,170,255,0.3)"; ctx.stroke();
        ctx.restore();

        // Textos
        ctx.font = "bold 14px 'Rajdhani'"; ctx.textAlign = "center";
        Game.runtime.texts.forEach(t => {
            ctx.fillStyle = t.color || `rgba(255, 204, 0, ${t.life})`; ctx.shadowBlur = 2; ctx.shadowColor = "#000";
            ctx.fillText(t.txt, cx + t.x, cy + t.y);
        });
        ctx.shadowBlur = 0;
    }
};

/**
 * ==========================================================================
 * INTERFACE (UI)
 * ==========================================================================
 */
const UI = {
    openDrawer: (id, el) => {
        document.querySelectorAll('.tab-section').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${id}`).classList.add('active');
        el.classList.add('active');
        document.getElementById('drawer-container').classList.add('open');
        document.getElementById('drawer-title').innerText = el.title;
        
        if(id === 'skills') UI.rebuildSkills();
    },

    closeDrawer: () => {
        document.getElementById('drawer-container').classList.remove('open');
        document.querySelectorAll('.nav-btn').forEach(t => t.classList.remove('active'));
    },

    showToast: (msg, isErr = false) => {
        let c = document.getElementById('toast-container');
        if (!c) return;
        let t = document.createElement('div'); t.className = 'toast'; 
        if(isErr) t.style.borderColor = "var(--neon-red)";
        t.innerText = msg;
        c.appendChild(t); setTimeout(() => t.remove(), 2500);
    },

    setTxt: (id, text) => {
        const el = document.getElementById(id);
        if (el) el.innerText = text;
    },

    filterSkills: (element) => {
        document.querySelectorAll('.ele-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.ele-btn.${element}`).classList.add('active');
        UI.rebuildSkills(element);
    },

    rebuildSkills: (filterElement = 'fire') => {
        let html = SkillTreeData.filter(s => s.el === filterElement).map(s => {
            let isUnlocked = Game.hasSkill(s.id);
            let canUnlock = !isUnlocked && (!s.req || Game.hasSkill(s.req));
            let statusClass = isUnlocked ? "unlocked" : (canUnlock ? "" : "locked");
            let btnHtml = isUnlocked ? `<span style="color:var(--neon-gold); font-size:10px;">ADQUIRIDO</span>` : `<button class="btn-buy" ${canUnlock ? '' : 'disabled'} onclick="Game.buySkill('${s.id}')">APRENDER (${s.cost} SP)</button>`;
            
            return `
            <div class="skill-card ${statusClass}">
                <div class="skill-info">
                    <h4 style="color: ${Elements[s.el].color};">${s.n}</h4>
                    <p>${s.d}</p>
                </div>
                ${btnHtml}
            </div>`;
        }).join('');
        document.getElementById('skill-tree-list').innerHTML = html;
    },

    update: () => {
        let s = Game.state; let r = Game.runtime;
        
        UI.setTxt('val-level', s.level);
        UI.setTxt('val-gold', Utils.format(s.gold));
        UI.setTxt('val-essence', Utils.format(s.essence));

        UI.setTxt('ov-str', s.str);
        UI.setTxt('ov-ene', s.ene);
        UI.setTxt('ov-agi', s.agi);
        
        let dps = r.dmg * (r.rps * 2) * s.maxEnemies;
        UI.setTxt('ov-dps', Utils.format(dps));
        UI.setTxt('ov-cost', r.manaCost.toFixed(1) + "/s");
        UI.setTxt('ov-max-en', s.maxEnemies);
        
        const nameEl = document.getElementById('val-enemy-name');
        const hpContainer = document.getElementById('bar-enemy-container');
        const waveInfo = document.getElementById('val-wave-info');
        
        let wave = (s.kills % 10) + 1;
        let act = Math.floor(s.kills / 10) + 1;
        
        // A barra do topo foca no inimigo mais recente
        if (r.enemies.length > 0) {
            let focus = r.enemies[r.enemies.length - 1];
            if (nameEl) {
                nameEl.style.display = 'block';
                nameEl.innerText = focus.name;
                nameEl.style.color = focus.isElite ? "var(--neon-red)" : "#fff";
            }
            if (hpContainer) hpContainer.style.display = 'block';
            if (waveInfo) waveInfo.style.display = 'none';
            
            UI.setTxt('val-enemy-hp-cur', Utils.format(focus.hp));
            UI.setTxt('val-enemy-hp-max', Utils.format(focus.maxHp));
            
            const hpBar = document.getElementById('bar-enemy-hp');
            if (hpBar) hpBar.style.width = `${Math.max(0, (focus.hp / focus.maxHp) * 100)}%`;
        } else {
            if (nameEl) nameEl.style.display = 'none';
            if (hpContainer) hpContainer.style.display = 'none';
            if (waveInfo) {
                waveInfo.style.display = 'block';
                waveInfo.innerText = `Ato ${act} • Inimigos Derrotados: ${wave-1}/10`;
            }
        }

        UI.setTxt('val-mana-cur', Math.floor(s.mana));
        UI.setTxt('val-mana-max', Math.floor(r.maxMana));
        const manaBar = document.getElementById('bar-mana');
        if (manaBar) manaBar.style.width = `${(s.mana / r.maxMana) * 100}%`;
        
        UI.setTxt('val-dps-main', Utils.format(dps));
        
        UI.setTxt('val-level-bar', s.level);
        UI.setTxt('val-xp-cur', Utils.format(s.xp));
        UI.setTxt('val-xp-max', Utils.format(r.reqXp));
        const xpBar = document.getElementById('bar-xp');
        if (xpBar) xpBar.style.width = `${(s.xp / r.reqXp) * 100}%`;

        UI.setTxt('val-pts-main', s.statPoints);
        UI.setTxt('val-sp', s.skillPoints);
        UI.setTxt('card-str', s.str);
        UI.setTxt('card-ene', s.ene);
        UI.setTxt('card-agi', s.agi);

        const canAdd = s.statPoints > 0;
        ['str', 'agi', 'ene'].forEach(attr => {
            const btn = document.getElementById(`btn-add-${attr}`);
            if (btn) btn.disabled = !canAdd;
        });

        UI.setTxt('upg-lvl-val', s.enemyLvl);
        let cLvl = Utils.calcCost(10, s.enemyLvl - 1, 1.5);
        UI.setTxt('cost-lvl', Utils.format(cLvl));
        const btnLvl = document.getElementById('btn-upg-lvl');
        if (btnLvl) btnLvl.disabled = s.gold < cLvl;

        UI.setTxt('upg-max-val', s.maxEnemies);
        let cMax = Utils.calcCost(50, s.maxEnemies - 1, 2.5);
        let bMax = document.getElementById('btn-upg-max');
        if (bMax) {
            if(s.maxEnemies >= 10) { bMax.innerText = "MÁX"; bMax.disabled = true; } 
            else { UI.setTxt('cost-max', Utils.format(cMax)); bMax.disabled = s.gold < cMax; }
        }

        UI.setTxt('upg-spd-val', s.enemySpd);
        let cSpd = Utils.calcCost(100, s.enemySpd, 1.8);
        UI.setTxt('cost-spd', Utils.format(cSpd));
        const btnSpd = document.getElementById('btn-upg-spd');
        if (btnSpd) btnSpd.disabled = s.gold < cSpd;

        let pBtn = document.getElementById('btn-do-prestige');
        if (pBtn) {
            if (s.level >= Game.config.prestigeLevelReq) {
                UI.setTxt('val-pending-essence', Math.floor(s.level / 10));
                pBtn.disabled = false; pBtn.innerText = "ASCENDER";
            } else {
                UI.setTxt('val-pending-essence', "0");
                pBtn.disabled = true; pBtn.innerText = `REQUER NV. ${Game.config.prestigeLevelReq}`;
            }
        }
    }
};

window.onload = Game.init;
