const Utils = {
    format: (num) => {
        if (num < 1000) return Math.floor(num).toString();
        const s = ["", "K", "M", "B", "T", "Qa"];
        const id = Math.floor(Math.log10(num) / 3);
        return (num / Math.pow(1000, id)).toFixed(2) + s[id];
    },
    calcCost: (base, level, exp) => Math.floor(base * Math.pow(exp, level))
};

const Elements = {
    neutral: { color: "#ffffff", name: "Neutro" },
    fire: { color: "#ff3300", name: "Fogo" }, 
    ice: { color: "#00ffff", name: "Gelo" },
    lightning: { color: "#ffff00", name: "Raio" }, 
    wind: { color: "#00ff88", name: "Vento" },
    poison: { color: "#b300ff", name: "Veneno" }
};

const WeaponDB = [
    { id: "w_0", n: "Lâmina Enferrujada", rarity: 0, mult: 1.0, color: "#888" },
    { id: "w_1", n: "Espada Larga do Aprendiz", rarity: 1, mult: 1.5, color: "#00aaff" },
    { id: "w_2", n: "Foice Mágica do Vazio", rarity: 2, mult: 3.0, color: "#b366ff" },
    { id: "w_3", n: "Katana Devoradora de Almas", rarity: 3, mult: 8.0, color: "#ffcc00" }
];

const ClassesDB = [
    { id: "spellblade", n: "Lâmina Mágica", desc: "Mestre dos elementos. Balanceado.", reqAscension: 0 },
    { id: "berserker", n: "Berserker", desc: "Dano brutal físico. Lento mas letal.", reqAscension: 1 },
    { id: "assassin", n: "Assassino das Sombras", desc: "Altíssima velocidade e Crítico.", reqAscension: 2 },
    { id: "necromancer", n: "Necromante", desc: "Usa os mortos ao seu favor.", reqAscension: 3 },
    { id: "voidwalker", n: "Andarilho do Vazio", desc: "Manipula o tempo e espaço.", reqAscension: 4 }
];

// OVERHAUL DE SKILLS (Estilo Path of Exile)
const SkillTreeData = [
    { id: "start", el: "neutral", n: "Núcleo", d: "O início da sua jornada.", cost: 0, req: null, x: 1000, y: 1000 },
    
    // FOGO (Foco em Dano Massivo em Área)
    { id: "f1", el: "fire", n: "Ignição", d: "Inimigos atingidos queimam em 20% do Dano Base/s.", cost: 1, req: ["start"], x: 1100, y: 900 },
    { id: "f2", el: "fire", n: "Combustão", d: "A queimadura dura 5 segundos e acumula.", cost: 1, req: ["f1"], x: 1200, y: 800 },
    { id: "f3", el: "fire", n: "Propagação", d: "Inimigos mortos em chamas espalham o fogo para 3 inimigos próximos.", cost: 2, req: ["f2"], x: 1150, y: 650 },
    { id: "f4", el: "fire", n: "Meteoro Certeiro", d: "A cada 5 giros, um meteoro cai causando 500% de dano de fogo na área.", cost: 3, req: ["f2"], x: 1350, y: 850 },
    
    // GELO (Foco em Controle e Multiplicador de Estouro)
    { id: "i1", el: "ice", n: "Frio Cortante", d: "Lentidão permanente de 15% em todos os inimigos na tela.", cost: 1, req: ["start"], x: 900, y: 900 },
    { id: "i2", el: "ice", n: "Congelamento", d: "Críticos congelam por 2 segundos.", cost: 1, req: ["i1"], x: 800, y: 800 },
    { id: "i3", el: "ice", n: "Estilhaçar", d: "Atingir um alvo congelado causa 400% de Dano, mas cancela o congelamento.", cost: 2, req: ["i2"], x: 850, y: 650 },
    { id: "i4", el: "ice", n: "Aura do Inverno", d: "Reduz sua Velocidade de Ataque em 20%, mas dobra seu Dano Base.", cost: 3, req: ["i2"], x: 650, y: 850 },

    // VENTO (Foco em Alcance e Velocidade, Dano Baixo)
    { id: "w1", el: "wind", n: "Aerodinâmica", d: "+30% Velocidade de Rotação (RPS).", cost: 1, req: ["start"], x: 900, y: 1100 },
    { id: "w2", el: "wind", n: "Vácuo", d: "Sua lâmina puxa os inimigos ativamente para o centro.", cost: 1, req: ["w1"], x: 800, y: 1200 },
    { id: "w3", el: "wind", n: "Lâminas Fantasmas", d: "A cada golpe, dispara lâminas perfurantes aleatórias (15% dano base).", cost: 2, req: ["w2"], x: 850, y: 1350 },
    { id: "w4", el: "wind", n: "Olho do Furacão", d: "Raio da lâmina dobrado, mas Dano Base reduzido pela metade.", cost: 3, req: ["w2"], x: 650, y: 1150 }
];

// ESTADO GLOBAL DO JOGO (NOVA ARQUITETURA)
const Game = {
    state: {
        sharedGold: 0, sharedEssence: 0, totalAscensions: 0,
        inventory: ["w_0"], activeCharId: 0,
        chars: [
            { id: 0, class: "spellblade", level: 1, xp: 0, statPoints: 0, skillPoints: 0, str: 0, agi: 0, ene: 0, enemyLvl: 1, maxEnemies: 1, enemySpd: 0, unlockedSkills: ["start"], weapon: "w_0" }
        ],
        lastSave: Date.now()
    },
    runtime: {
        lastFrame: performance.now(), angle: 0, enemies: [], particles: [], texts: [], projectiles: [], groundEffects: [],
        reqXp: 100, maxMana: 100, mana: 100, manaRegen: 5, manaCost: 10, dmg: 1, rps: 1, radius: 80,
        isExhausted: false, offlineGains: null, spawnTimer: 0,
        totalSessionXp: 0, xpHistory: [], etaTimer: 0, activeChar: null, weaponMult: 1.0
    },

    init: () => {
        Game.load();
        UI.buildWorldMap();
        Renderer.init();
        UI.initDrag();
        requestAnimationFrame(Game.loop);
        setInterval(Game.save, 5000);
    },

    save: () => { Game.state.lastSave = Date.now(); localStorage.setItem('ts_save_v2', JSON.stringify(Game.state)); },
    
    load: () => {
        let saved = localStorage.getItem('ts_save_v2');
        if (saved) Object.assign(Game.state, JSON.parse(saved));
    },

    playCharacter: (id) => {
        Game.state.activeCharId = id;
        Game.runtime.activeChar = Game.state.chars.find(c => c.id === id);
        Game.runtime.mana = 100;
        Game.runtime.enemies = []; // Limpa inimigos ao entrar no jogo
        Game.calcStats();
        
        document.getElementById('screen-world').classList.remove('active');
        document.getElementById('app-container').classList.add('active');
        UI.setTxt('player-name', ClassesDB.find(c => c.id === Game.runtime.activeChar.class).n);
        UI.update();
    },

    returnToWorld: () => {
        document.getElementById('app-container').classList.remove('active');
        document.getElementById('screen-world').classList.add('active');
        UI.buildWorldMap();
        Game.save();
    },

    createCharacter: (classId) => {
        let newId = Game.state.chars.length;
        Game.state.chars.push({ id: newId, class: classId, level: 1, xp: 0, statPoints: 0, skillPoints: 0, str: 0, agi: 0, ene: 0, enemyLvl: 1, maxEnemies: 1, enemySpd: 0, unlockedSkills: ["start"], weapon: "w_0" });
        Game.save(); UI.buildWorldMap();
    },

    equipWeapon: (wId) => {
        if(Game.runtime.activeChar) {
            Game.runtime.activeChar.weapon = wId;
            Game.calcStats(); UI.update(); UI.buildWorldMap();
        }
    },

    dropLoot: (enemyLevel) => {
        // Chance de 0.5% de dropar arma por kill
        if(Math.random() < 0.005) {
            let roll = Math.random();
            let dropId = "w_1"; // Raro
            if(roll < 0.1 && enemyLevel > 10) dropId = "w_2"; // Épico
            if(roll < 0.01 && enemyLevel > 30) dropId = "w_3"; // Lendário
            
            if(!Game.state.inventory.includes(dropId)) {
                Game.state.inventory.push(dropId);
                UI.showToast(`✨ DROP NOVO: ${WeaponDB.find(w=>w.id===dropId).n}!`);
            }
        }
    },

    hasSkill: (id) => Game.runtime.activeChar.unlockedSkills.includes(id),

    canUnlockSkill: (id) => {
        if (id === "start") return true;
        let node = SkillTreeData.find(s => s.id === id);
        if (!node || !node.req) return false;
        let reqs = Array.isArray(node.req) ? node.req : [node.req];
        if (!reqs.some(r => Game.hasSkill(r))) return false;
        return Game.runtime.activeChar.unlockedSkills.some(unlockedId => {
            let uNode = SkillTreeData.find(s => s.id === unlockedId);
            if (uNode && uNode.req) {
                let uReqs = Array.isArray(uNode.req) ? uNode.req : [uNode.req];
                return uReqs.includes(id);
            }
            return false;
        });
    },

    // BUG FIX: Lógica de reembolso
    canRefundSkill: (id) => {
        if(id === "start" || !Game.hasSkill(id)) return false;
        let isNeeded = Game.runtime.activeChar.unlockedSkills.some(unlockedId => {
            let node = SkillTreeData.find(s => s.id === unlockedId);
            if (!node || !node.req) return false;
            let reqs = Array.isArray(node.req) ? node.req : [node.req];
            return reqs.includes(id); // Se alguma skill desbloqueada tiver essa 'id' como req, não pode devolver
        });
        return !isNeeded;
    },

    calcStats: () => {
        let c = Game.runtime.activeChar; let r = Game.runtime;
        if(!c) return;

        let wpn = WeaponDB.find(w => w.id === c.weapon);
        r.weaponMult = wpn ? wpn.mult : 1.0;
        UI.setTxt('val-weapon-name', wpn ? wpn.n : "Desarmado");
        document.getElementById('val-weapon-name').style.color = wpn ? wpn.color : "#fff";

        r.reqXp = Math.floor(100 * Math.pow(1.4, c.level - 1));
        
        let radMult = Game.hasSkill("w4") ? 2.0 : 1.0;
        r.radius = 80 * radMult;
        
        r.maxMana = (100 + (c.ene * 15));
        r.manaRegen = 5 + (c.ene * 2);
    },

    addXp: (amt) => {
        let c = Game.runtime.activeChar;
        Game.runtime.totalSessionXp += amt;
        c.xp += amt; let up = false;
        while(c.xp >= Game.runtime.reqXp) {
            c.xp -= Game.runtime.reqXp;
            c.level++; c.statPoints += 20; c.skillPoints++;
            Game.calcStats(); up = true;
        }
        if(up) UI.showToast(`Level UP! Ganhou +1 SP!`);
        UI.update();
    },

    addStat: (attr) => {
        let c = Game.runtime.activeChar;
        if (c.statPoints > 0) { c.statPoints--; c[attr]++; Game.calcStats(); UI.update(); }
    },

    resetSkills: () => {
        let c = Game.runtime.activeChar;
        if(confirm("Devolver todas as skills?")) {
            let totalCost = 0;
            c.unlockedSkills.forEach(id => { let sk = SkillTreeData.find(s => s.id === id); if(sk) totalCost += sk.cost; });
            c.skillPoints += totalCost; c.unlockedSkills = ["start"];
            Game.calcStats(); UI.rebuildSkillTree(); UI.update();
        }
    },

    refundSkill: () => {
        let id = Game.runtime.selectedSkill;
        let c = Game.runtime.activeChar;
        if(Game.canRefundSkill(id)) {
            let skill = SkillTreeData.find(s => s.id === id);
            c.unlockedSkills = c.unlockedSkills.filter(sk => sk !== id);
            c.skillPoints += skill.cost;
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buySkill: () => {
        let id = Game.runtime.selectedSkill;
        let c = Game.runtime.activeChar;
        let skill = SkillTreeData.find(s => s.id === id);
        if(skill && c.skillPoints >= skill.cost) {
            c.skillPoints -= skill.cost; c.unlockedSkills.push(id);
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    // BUG FIX: Respawn. Não limpa mais a array de inimigos atuais.
    buyEnemyLevel: () => { 
        let c = Game.runtime.activeChar; let cost = Utils.calcCost(10, c.enemyLvl - 1, 1.5); 
        if(Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.enemyLvl++; UI.update(); } 
    },
    buyMaxEnemies: () => { 
        let c = Game.runtime.activeChar; let cost = Utils.calcCost(50, c.maxEnemies - 1, 2.5); 
        if(c.maxEnemies < 30 && Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.maxEnemies++; UI.update(); } 
    },
    buyEnemySpeed: () => { 
        let c = Game.runtime.activeChar; let cost = Utils.calcCost(100, c.enemySpd, 1.8); 
        if(Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.enemySpd++; UI.update(); } 
    },

    spawnEnemy: () => {
        let c = Game.runtime.activeChar;
        let hp = 20 * Math.pow(1.4, c.enemyLvl);
        let a = Math.random() * Math.PI * 2; let d = 150 + Math.random() * 50;
        let isElite = Math.random() > 0.8; if(isElite) hp *= 3;
        
        let e = { 
            id: Math.random(), hp: hp, maxHp: hp, 
            x: Math.cos(a)*d, y: Math.sin(a)*d, flash: 0, isElite: isElite, 
            burnTimer: 0, freezeTimer: 0 
        };
        if(Game.hasSkill("i1")) e.freezeTimer = 9999; // Lentidão permanente passiva (Frio Cortante)
        Game.runtime.enemies.push(e);
    },

    hitEnemy: (e, dmg, isCrit = false) => {
        if(e.hp <= 0) return;
        
        let variance = 0.85 + (Math.random() * 0.30);
        dmg *= variance;

        if(Game.hasSkill("i3") && e.freezeTimer > 0) { dmg *= 4.0; e.freezeTimer = 0; } // Estilhaçar
        if(isCrit && Game.hasSkill("i2")) e.freezeTimer = 2;

        e.hp -= dmg; e.flash = 0.1;
        
        if(Game.hasSkill("f1") && Game.runtime.mana >= 2) { 
            e.burnTimer = Game.hasSkill("f2") ? 5 : 2; 
            Game.runtime.mana -= 2; 
        }

        // Dano estilo RPG Chinês
        let textScale = isCrit ? 1.3 : 0.85; 
        let cColor = isCrit ? "#ff1100" : (Math.random() > 0.5 ? "#ffffff" : "#ffffaa");
        let displayTxt = isCrit ? `CRIT! ${Utils.format(dmg)}` : Utils.format(dmg);
        Game.runtime.texts.push({ x: e.x + (Math.random()*30-15), y: e.y - 20, txt: displayTxt, life: 1.0, maxLife: 1.0, scale: textScale, color: cColor, vx: (Math.random() - 0.5) * 60, vy: -50 - (Math.random() * 40) });
        
        if (e.hp <= 0) {
            Game.runtime.enemies = Game.runtime.enemies.filter(en => en.id !== e.id);
            let c = Game.runtime.activeChar;
            let g = 1 * Math.pow(1.4, c.enemyLvl) * (1 + c.enemySpd * 0.8);
            let x = 15 * Math.pow(1.4, c.enemyLvl);
            if(e.isElite) { g *= 3; x *= 3; }
            
            Game.state.sharedGold += g; Game.addXp(x);
            Game.dropLoot(c.enemyLvl); // Chamada do novo sistema de drop

            if(Game.hasSkill("f3") && e.burnTimer > 0) {
                // Propagação de Fogo
                let nearby = Game.runtime.enemies.filter(en => Math.hypot(en.x-e.x, en.y-e.y) < 100).slice(0, 3);
                nearby.forEach(en => en.burnTimer = 5);
            }
            Renderer.createExplosion(e.x, e.y, e.isElite ? "#ff2a4b" : "#00aaff");
        }
    },

    prestige: () => {
        let c = Game.runtime.activeChar;
        if (c.level < 50) return;
        let ess = Math.floor(c.level / 10);
        if (confirm(`Ascender este herói concederá +${ess} Essências Globais. Nível, Atributos e Upgrades da Fenda dele serão zerados. (As armas no Stash são mantidas).`)) {
            Game.state.sharedEssence += ess; Game.state.totalAscensions++;
            c.level = 1; c.xp = 0; c.statPoints = 0; c.str = 0; c.agi = 0; c.ene = 0;
            c.enemyLvl = 1; c.maxEnemies = 1; c.enemySpd = 0;
            Game.runtime.enemies = []; Game.calcStats(); Game.save(); Game.returnToWorld();
        }
    },

    loop: (time) => {
        if(!document.getElementById('app-container').classList.contains('active')) return requestAnimationFrame(Game.loop);
        let dt = Math.min((time - Game.runtime.lastFrame) / 1000, 0.1);
        Game.runtime.lastFrame = time;
        let c = Game.runtime.activeChar; let r = Game.runtime;

        // ETA
        r.xpHistory.push({ time: time, xp: r.totalSessionXp });
        r.xpHistory = r.xpHistory.filter(h => time - h.time <= 5000); 
        r.etaTimer += dt;
        if (r.etaTimer >= 1.0) {
            r.etaTimer = 0;
            if (r.xpHistory.length > 1) {
                let first = r.xpHistory[0]; let last = r.xpHistory[r.xpHistory.length - 1];
                let dtSec = (last.time - first.time) / 1000;
                let xps = dtSec > 0 ? (last.xp - first.xp) / dtSec : 0;
                if (xps > 0) {
                    let secLeft = (r.reqXp - c.xp) / xps;
                    let mins = Math.floor(secLeft / 60); let secs = Math.floor(secLeft % 60);
                    UI.setTxt('val-eta', `${mins}:${secs < 10 ? '0'+secs : secs}`);
                } else { UI.setTxt('val-eta', `--:--`); }
            }
        }

        r.spawnTimer -= dt;
        if (r.enemies.length < c.maxEnemies && r.spawnTimer <= 0) { Game.spawnEnemy(); r.spawnTimer = 0.2; }

        let agiBonus = Game.hasSkill("w1") ? 1.3 : 1; 
        if(Game.hasSkill("i4")) agiBonus -= 0.2; // Aura do inverno deixa lento

        let baseCostRed = 1 / (1 + (c.ene * 0.02));
        
        let bDmg = (1 + (c.str * 0.5) + Math.pow(c.str, 1.2) * 0.1) * r.weaponMult;
        if(Game.hasSkill("i4")) bDmg *= 2.0; // Aura do Inverno dobra dano
        if(Game.hasSkill("w4")) bDmg *= 0.5; // Furacão corta dano

        let bSpd = (1 + (c.agi * 0.05)) * agiBonus;
        let mult = 1 + (Game.state.sharedEssence * 0.1);

        r.manaCost = (10 * bSpd) * baseCostRed;

        if (r.mana <= 0) r.isExhausted = true;
        if (r.mana >= r.maxMana * 0.2) r.isExhausted = false;

        if (r.isExhausted) { r.dmg = (bDmg * 0.1) * mult; r.rps = bSpd * 0.3; } 
        else { r.dmg = bDmg * mult; r.rps = bSpd; r.mana -= r.manaCost * dt; }

        r.mana += r.manaRegen * dt;
        if (r.mana > r.maxMana) r.mana = r.maxMana;
        if (r.mana < 0) r.mana = 0;

        let rotDelta = (r.rps * Math.PI * 2) * dt;
        let prevAngle = r.angle;
        r.angle = (r.angle + rotDelta) % (Math.PI * 2);

        // Chuva de Meteoro (Skill Refeita)
        if(Game.hasSkill("f4") && r.mana >= 30) {
            r.meteorTimer += rotDelta;
            if(r.meteorTimer >= Math.PI * 10) { // A cada 5 giros
                r.meteorTimer = 0; r.mana -= 30;
                let t = r.enemies[Math.floor(Math.random() * r.enemies.length)];
                if(t) {
                    Game.hitEnemy(t, r.dmg * 5.0, false); // 500% dano
                    Renderer.createExplosion(t.x, t.y, "#ffaa00");
                }
            }
        }

        let baseSpd = 20 * (1 + c.enemySpd * 0.2);

        r.enemies.forEach(e => {
            if (e.flash > 0) e.flash -= dt;
            if (e.burnTimer > 0) { e.burnTimer -= dt; Game.hitEnemy(e, r.dmg * 0.2 * dt); } // Fogo dá 20% DPS passivo

            let dist = Math.hypot(e.x, e.y);
            let moveSpd = baseSpd;
            if (e.freezeTimer > 0) moveSpd *= 0.5; // Lentidão
            if (Game.hasSkill("w2")) moveSpd += 20; // Vácuo puxa
            
            if (dist > 30) { e.x -= (e.x/dist) * moveSpd * dt; e.y -= (e.y/dist) * moveSpd * dt; }
            
            if (dist <= r.radius + 10) {
                let eAngle = Math.atan2(e.y, e.x); if (eAngle < 0) eAngle += Math.PI * 2;
                let hit = false;
                if (prevAngle < r.angle) { if (eAngle >= prevAngle && eAngle <= r.angle) hit = true; } 
                else { if (eAngle >= prevAngle || eAngle <= r.angle) hit = true; }
                
                let rots = Math.floor(rotDelta / (Math.PI * 2));
                let hits = (hit ? 1 : 0) + rots;
                
                if (hits > 0) {
                    let isCrit = Math.random() < 0.1;
                    Game.hitEnemy(e, r.dmg * hits * (isCrit ? 2 : 1), isCrit);
                    
                    // Dispara fantasma
                    if(Game.hasSkill("w3") && Math.random() < 0.3) {
                        r.projectiles.push({ x: 0, y: 0, target: e, element: "wind", renderType: "crescent", speed: 500, dmg: r.dmg * 0.15, life: 2.0 });
                    }
                }
            }
        });

        r.projectiles.forEach(p => {
            p.life -= dt;
            if(!p.target || p.target.hp <= 0) { p.life = 0; return; }
            let dx = p.target.x - p.x; let dy = p.target.y - p.y; let dist = Math.hypot(dx, dy);
            if(dist < p.speed * dt) { Game.hitEnemy(p.target, p.dmg, false); p.life = 0; } 
            else { p.x += (dx/dist) * p.speed * dt; p.y += (dy/dist) * p.speed * dt; }
        });
        r.projectiles = r.projectiles.filter(p => p.life > 0);

        r.texts.forEach(t => { t.x += t.vx * dt; t.y += t.vy * dt; t.life -= dt; }); r.texts = r.texts.filter(t => t.life > 0);
        r.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); r.particles = r.particles.filter(p => p.life > 0);

        Renderer.draw(); UI.update();
        requestAnimationFrame(Game.loop);
    }
};

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
        let ctx = Renderer.ctx; let cx = Renderer.w / 2; let cy = Renderer.h / 2 - 50;
        ctx.clearRect(0, 0, Renderer.w, Renderer.h);

        ctx.globalCompositeOperation = "lighter";
        Game.runtime.particles.forEach(p => {
            ctx.fillStyle = p.c; ctx.globalAlpha = p.life/p.max;
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";

        Game.runtime.projectiles.forEach(p => {
            ctx.save(); ctx.translate(cx + p.x, cy + p.y);
            ctx.fillStyle = Elements[p.element].color; ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
            if(p.renderType === 'crescent') {
                let angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                ctx.rotate(angle); ctx.beginPath(); ctx.arc(0, 0, 10, -Math.PI/2, Math.PI/2); ctx.lineTo(-5, 0); ctx.fill();
            }
            ctx.restore();
        });

        Game.runtime.enemies.forEach(e => {
            ctx.save(); ctx.translate(cx + e.x, cy + e.y);
            let eColor = e.isElite ? "#ff2a4b" : "#00aaff";
            if(e.freezeTimer > 0) eColor = Elements.ice.color;
            if(e.burnTimer > 0) eColor = Elements.fire.color;

            ctx.shadowBlur = e.flash > 0 ? 15 : 5; ctx.shadowColor = e.flash > 0 ? "#fff" : eColor;
            ctx.fillStyle = e.flash > 0 ? "#fff" : "#111"; ctx.strokeStyle = e.flash > 0 ? "#fff" : eColor;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, e.isElite ? 16 : 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.shadowBlur = 0;

            let hpPercent = Math.max(0, e.hp / e.maxHp);
            let barW = 24; let barH = 4;
            ctx.fillStyle = "#000"; ctx.fillRect(-barW/2, -22, barW, barH);
            ctx.fillStyle = hpPercent > 0.5 ? "#00ff66" : (hpPercent > 0.25 ? "#ffcc00" : "#ff2a4b");
            ctx.fillRect(-barW/2, -22, barW * hpPercent, barH);
            ctx.restore();
        });

        ctx.shadowBlur = 15; ctx.shadowColor = Game.runtime.isExhausted ? "#ff2a4b" : "#00aaff";
        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;

        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Game.runtime.angle);
        let r = Game.runtime.radius; 
        let baseColor = Game.runtime.isExhausted ? "rgba(255,42,75,0.5)" : "rgba(0,170,255,0.8)";
        ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4);
        ctx.lineWidth = 4; ctx.strokeStyle = baseColor; ctx.shadowBlur = 10; ctx.shadowColor = baseColor; ctx.stroke();
        ctx.beginPath(); ctx.arc(0, 0, r - 5, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
        ctx.lineWidth = 3; ctx.strokeStyle = baseColor; ctx.stroke();
        ctx.restore();

        ctx.font = "900 16px 'Rajdhani'"; ctx.textAlign = "center";
        Game.runtime.texts.forEach(t => {
            ctx.save(); ctx.translate(cx + t.x, cy + t.y);
            let currentScale = t.scale * (1 + (1 - t.life/t.maxLife) * 0.3); 
            ctx.scale(currentScale, currentScale); ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
            ctx.lineWidth = 3; ctx.strokeStyle = "#000"; ctx.strokeText(t.txt, 0, 0);
            ctx.fillStyle = t.color; ctx.fillText(t.txt, 0, 0);
            ctx.restore();
        });
    }
};

const UI = {
    initDrag: () => {
        const slider = document.getElementById('tree-viewport');
        let isDown = false; let startX, startY, scrollLeft, scrollTop;
        const start = (e) => { isDown = true; startX = (e.pageX || e.touches[0].pageX) - slider.offsetLeft; startY = (e.pageY || e.touches[0].pageY) - slider.offsetTop; scrollLeft = slider.scrollLeft; scrollTop = slider.scrollTop; };
        const end = () => { isDown = false; };
        const move = (e) => { if (!isDown) return; e.preventDefault(); const x = (e.pageX || e.touches[0].pageX) - slider.offsetLeft; const y = (e.pageY || e.touches[0].pageY) - slider.offsetTop; slider.scrollLeft = scrollLeft - (x - startX) * 1.5; slider.scrollTop = scrollTop - (y - startY) * 1.5; };
        slider.addEventListener('mousedown', start); slider.addEventListener('touchstart', start, {passive: false}); slider.addEventListener('mouseleave', end); slider.addEventListener('mouseup', end); slider.addEventListener('touchend', end); slider.addEventListener('mousemove', move); slider.addEventListener('touchmove', move, {passive: false});
    },

    buildWorldMap: () => {
        UI.setTxt('global-gold', Utils.format(Game.state.sharedGold));
        UI.setTxt('global-essence', Utils.format(Game.state.sharedEssence));

        let charHtml = '';
        ClassesDB.forEach(cdb => {
            let existingChar = Game.state.chars.find(c => c.class === cdb.id);
            let isLocked = Game.state.totalAscensions < cdb.reqAscension;

            if(existingChar) {
                charHtml += `<div class="char-card" onclick="Game.playCharacter(${existingChar.id})">
                    <div class="char-info"><h3>${cdb.n}</h3><p>Nível ${existingChar.level}</p></div>
                    <button class="btn-play">JOGAR</button>
                </div>`;
            } else if(!isLocked) {
                charHtml += `<div class="char-card" onclick="Game.createCharacter('${cdb.id}')">
                    <div class="char-info"><h3>${cdb.n}</h3><p style="color:#888;">${cdb.desc}</p></div>
                    <button class="btn-play" style="background:var(--neon-green);">CRIAR</button>
                </div>`;
            } else {
                charHtml += `<div class="char-card locked">
                    <div class="char-info"><h3>${cdb.n}</h3><p style="color:#888;">Requer ${cdb.reqAscension} Ascensões</p></div>
                </div>`;
            }
        });
        document.getElementById('char-grid').innerHTML = charHtml;

        let invHtml = '';
        Game.state.inventory.forEach(wId => {
            let w = WeaponDB.find(w => w.id === wId);
            if(w) invHtml += `<div class="inv-slot rarity-${w.rarity}" onclick="Game.equipWeapon('${w.id}')" title="${w.n}">🗡️</div>`;
        });
        document.getElementById('inventory-grid').innerHTML = invHtml;
    },

    switchTab: (id, el) => {
        let targetTab = document.getElementById(`tab-${id}`);
        let isAlreadyActive = targetTab.classList.contains('active') && document.getElementById('main-content').classList.contains('open');

        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
        document.getElementById('app-container').classList.remove('skills-active');
        document.getElementById('main-content').classList.remove('open');
        document.getElementById('app-container').classList.remove('menu-open');

        if (!isAlreadyActive) {
            targetTab.classList.add('active'); el.classList.add('active');
            document.getElementById('main-content').classList.add('open');
            document.getElementById('app-container').classList.add('menu-open');
            if(id === 'skills') {
                document.getElementById('app-container').classList.add('skills-active'); UI.rebuildSkillTree();
                setTimeout(() => { let vp = document.getElementById('tree-viewport'); vp.scrollLeft = 1000 - vp.clientWidth / 2; vp.scrollTop = 1000 - vp.clientHeight / 2; }, 50);
            }
        }
    },
    
    showToast: (msg) => {
        let c = document.getElementById('toast-container');
        let t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
        c.appendChild(t); setTimeout(() => t.remove(), 2500);
    },
    setTxt: (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; },

    rebuildSkillTree: () => {
        let container = document.getElementById('skill-tree-container');
        let svgHtml = `<svg width="100%" height="100%" style="position:absolute; top:0; left:0; z-index:1;">`;
        SkillTreeData.forEach(s => {
            if(s.req) {
                let reqs = Array.isArray(s.req) ? s.req : [s.req];
                reqs.forEach(rId => {
                    let parent = SkillTreeData.find(p => p.id === rId);
                    if(parent) {
                        let isUnlocked = Game.hasSkill(s.id);
                        let isParentUnlocked = Game.hasSkill(parent.id);
                        let color = isUnlocked ? Elements[s.el].color : (isParentUnlocked ? '#555' : '#222');
                        let width = isUnlocked ? 3 : 1;
                        svgHtml += `<line x1="${parent.x}px" y1="${parent.y}px" x2="${s.x}px" y2="${s.y}px" stroke="${color}" stroke-width="${width}" />`;
                    }
                });
            }
        });
        svgHtml += `</svg>`;

        let nodesHtml = '';
        SkillTreeData.forEach(s => {
            let isUnlocked = Game.hasSkill(s.id); let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);
            let elColor = Elements[s.el].color; let nodeStyle = `left: ${s.x}px; top: ${s.y}px; border-color: ${elColor};`;
            if(isUnlocked) nodeStyle += `background: ${elColor}33; box-shadow: 0 0 15px ${elColor}; color: #fff;`; 
            else if(canUnlock) nodeStyle += `box-shadow: 0 0 5px ${elColor}; color: ${elColor};`; 
            else nodeStyle += `border-color: #333; color: #555;`;
            let isUlt = s.cost === 3 ? "ultimate" : ""; let isStart = s.id === "start" ? "start-node" : "";
            nodesHtml += `<div class="tree-node ${isUlt} ${isStart}" style="${nodeStyle}" onclick="UI.showSkillModal('${s.id}')">${s.id.toUpperCase()}</div>`;
        });
        container.innerHTML = svgHtml + nodesHtml;
    },

    showSkillModal: (id) => {
        let s = SkillTreeData.find(sk => sk.id === id); if(!s) return;
        Game.runtime.selectedSkill = id;
        UI.setTxt('modal-skill-title', s.n); UI.setTxt('modal-skill-desc', s.d);
        
        let btn = document.getElementById('btn-learn-skill'); let btnRef = document.getElementById('btn-refund-skill'); let costEl = document.getElementById('modal-skill-cost');
        btn.style.display = "none"; btnRef.style.display = "none";

        let isUnlocked = Game.hasSkill(s.id); let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);
        if (isUnlocked) {
            costEl.innerText = "Habilidade Adquirida."; costEl.style.color = "var(--neon-green)";
            if (Game.canRefundSkill(s.id)) btnRef.style.display = "block";
        } else if (canUnlock) {
            costEl.innerText = `Custo: ${s.cost} SP`; costEl.style.color = "var(--neon-gold)";
            btn.style.display = "block"; btn.innerText = "Aprender"; btn.disabled = Game.runtime.activeChar.skillPoints < s.cost;
        } else {
            costEl.innerText = "Requisito não atendido."; costEl.style.color = "var(--neon-red)";
        }
        document.getElementById('skill-modal').style.display = 'flex';
    },
    closeModal: (id) => { document.getElementById(id).style.display = 'none'; },

    update: () => {
        let c = Game.runtime.activeChar; let r = Game.runtime;
        if(!c) return;

        UI.setTxt('val-level', c.level); UI.setTxt('val-gold', Utils.format(Game.state.sharedGold)); UI.setTxt('val-essence', Utils.format(Game.state.sharedEssence));
        document.getElementById('mini-xp-fill').style.width = `${(c.xp / r.reqXp) * 100}%`;
        
        UI.setTxt('ov-str', c.str); UI.setTxt('ov-ene', c.ene); UI.setTxt('ov-agi', c.agi);
        UI.setTxt('val-pts-side', c.statPoints); UI.setTxt('val-pts-main', c.statPoints);
        
        let dps = r.dmg * (r.rps * 2) * c.maxEnemies;
        UI.setTxt('ov-dps', Utils.format(dps)); 
        UI.setTxt('ov-mana-regen', r.manaRegen.toFixed(1)); UI.setTxt('ov-cost', r.manaCost.toFixed(1));
        
        UI.setTxt('val-mana-txt', `${Math.floor(r.mana)} / ${Math.floor(r.maxMana)}`);
        document.getElementById('bar-mana').style.width = `${(r.mana / r.maxMana) * 100}%`;
        UI.setTxt('val-level-bar', c.level); UI.setTxt('val-xp-txt', `${Utils.format(c.xp)} / ${Utils.format(r.reqXp)}`);
        document.getElementById('bar-xp').style.width = `${(c.xp / r.reqXp) * 100}%`;

        UI.setTxt('card-str', c.str); UI.setTxt('card-ene', c.ene); UI.setTxt('card-agi', c.agi);
        ['str', 'ene', 'agi'].forEach(a => document.getElementById(`btn-add-${a}`).disabled = c.statPoints <= 0);

        UI.setTxt('upg-lvl-val', c.enemyLvl); let cLvl = Utils.calcCost(10, c.enemyLvl - 1, 1.5); UI.setTxt('cost-lvl', Utils.format(cLvl));
        document.getElementById('btn-upg-lvl').disabled = Game.state.sharedGold < cLvl;

        UI.setTxt('upg-max-val', c.maxEnemies); let cMax = Utils.calcCost(50, c.maxEnemies - 1, 2.5); let bMax = document.getElementById('btn-upg-max');
        if(c.maxEnemies >= 30) { bMax.innerText = "MÁX"; bMax.disabled = true; } else { UI.setTxt('cost-max', Utils.format(cMax)); bMax.disabled = Game.state.sharedGold < cMax; }

        UI.setTxt('upg-spd-val', c.enemySpd); let cSpd = Utils.calcCost(100, c.enemySpd, 1.8); UI.setTxt('cost-spd', Utils.format(cSpd));
        document.getElementById('btn-upg-spd').disabled = Game.state.sharedGold < cSpd;
        
        UI.setTxt('val-sp', c.skillPoints); UI.setTxt('val-pending-essence', Math.floor(c.level / 10));
        document.getElementById('btn-do-prestige').disabled = c.level < 50;

        if (Game.runtime.selectedSkill) {
            let sk = SkillTreeData.find(sk => sk.id === Game.runtime.selectedSkill); let btnLearn = document.getElementById('btn-learn-skill');
            if(btnLearn && sk) btnLearn.disabled = c.skillPoints < sk.cost;
        }
    }
};

window.onload = Game.init;