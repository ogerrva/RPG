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
    fire: { id: "fire", color: "#ff3300" }, ice: { id: "ice", color: "#00ffff" },
    lightning: { id: "lightning", color: "#ffff00" }, wind: { id: "wind", color: "#00ff88" },
    poison: { id: "poison", color: "#b300ff" }
};

// Árvore de Skills Simplificada para o exemplo
const SkillTreeData = [
    { id: "f1", el: "fire", n: "Lâmina Aquecida", d: "+10% Dano Base.", cost: 1, req: null, row: 1 },
    { id: "f2", el: "fire", n: "Queimadura", d: "Inimigos queimam.", cost: 1, req: "f1", row: 2 },
    { id: "i1", el: "ice", n: "Toque Gélido", d: "Inimigos ficam lentos.", cost: 1, req: null, row: 1 },
    { id: "i2", el: "ice", n: "Frio Cortante", d: "+15% Dano em lentos.", cost: 1, req: "i1", row: 2 },
    { id: "w1", el: "wind", n: "Brisa Leve", d: "+10% Alcance.", cost: 1, req: null, row: 1 },
    { id: "p1", el: "poison", n: "Lâmina Tóxica", d: "Veneno contínuo.", cost: 1, req: null, row: 1 }
];

const Game = {
    state: {
        level: 1, xp: 0, statPoints: 0, skillPoints: 0,
        str: 0, agi: 0, ene: 0, gold: 0, essence: 0,
        enemyLvl: 1, maxEnemies: 1, mana: 100,
        lastSave: Date.now(), unlockedSkills: [], kills: 0
    },
    runtime: {
        lastFrame: performance.now(), angle: 0, enemies: [], particles: [], texts: [],
        reqXp: 100, maxMana: 100, manaRegen: 5, manaCost: 10, dmg: 1, rps: 1, radius: 80,
        isExhausted: false, synergies: {}, offlineGains: null
    },

    init: () => {
        Game.load();
        Game.calcStats();
        Renderer.init();
        for(let i=0; i<Game.state.maxEnemies; i++) Game.spawnEnemy();
        requestAnimationFrame(Game.loop);
        setInterval(Game.save, 5000);
        UI.update();
    },

    save: () => {
        Game.state.lastSave = Date.now();
        localStorage.setItem('ts_save', JSON.stringify(Game.state));
    },

    load: () => {
        let saved = localStorage.getItem('ts_save');
        if (saved) {
            Object.assign(Game.state, JSON.parse(saved));
            let offTime = Math.min((Date.now() - Game.state.lastSave) / 1000, 86400); // Max 24h
            
            if (offTime > 60) {
                Game.calcStats();
                let dps = Game.runtime.dmg * (Game.runtime.rps * 2) * Game.state.maxEnemies;
                let eHp = 20 * Math.pow(1.15, Game.state.enemyLvl);
                let kills = Math.floor((dps * offTime) / eHp);
                
                if (kills > 0) {
                    let g = kills * (1 * Math.pow(1.15, Game.state.enemyLvl));
                    let x = kills * (15 * Math.pow(1.12, Game.state.enemyLvl));
                    Game.runtime.offlineGains = { gold: g, xp: x, time: offTime };
                    document.getElementById('offline-claim-box').style.display = 'block';
                    
                    let h = Math.floor(offTime / 3600);
                    let m = Math.floor((offTime % 3600) / 60);
                    document.getElementById('offline-time').innerText = `${h}h ${m}m ausente`;
                }
            }
        }
    },

    claimOffline: () => {
        if(Game.runtime.offlineGains) {
            Game.state.gold += Game.runtime.offlineGains.gold;
            Game.addXp(Game.runtime.offlineGains.xp);
            UI.showToast(`Coletado: ${Utils.format(Game.runtime.offlineGains.gold)} Ouro!`);
            Game.runtime.offlineGains = null;
            document.getElementById('offline-claim-box').style.display = 'none';
            UI.update();
        }
    },

    hasSkill: (id) => Game.state.unlockedSkills.includes(id),

    calcStats: () => {
        let s = Game.state; let r = Game.runtime;
        let mult = 1 + (s.essence * 0.1);
        
        // Curva de XP balanceada (Híbrida)
        r.reqXp = Math.floor(100 * Math.pow(1.12, s.level - 1) + (s.level * 50));
        
        let bDmg = (1 + (s.str * 0.5)) * (Game.hasSkill("f1") ? 1.1 : 1);
        let bSpd = (1 + (s.agi * 0.05));
        
        r.radius = 80 * (Game.hasSkill("w1") ? 1.1 : 1);
        r.maxMana = 100 + (s.ene * 15);
        r.manaRegen = 5 + (s.ene * 2);
        
        // Sinergias (Mecânica Nova)
        r.synergies.steam = Game.hasSkill("f2") && Game.hasSkill("i2"); // Fogo + Gelo
        r.synergies.toxicStorm = Game.hasSkill("p1") && Game.hasSkill("w1"); // Veneno + Vento

        if (s.mana <= 0) {
            r.isExhausted = true; r.dmg = (bDmg * 0.1) * mult; r.rps = bSpd * 0.3;
        } else {
            r.isExhausted = false; r.dmg = bDmg * mult; r.rps = bSpd;
        }
        r.manaCost = (10 * bSpd) / (1 + (s.ene * 0.02));
    },

    addXp: (amt) => {
        Game.state.xp += amt; let up = false;
        while(Game.state.xp >= Game.runtime.reqXp) {
            Game.state.xp -= Game.runtime.reqXp;
            Game.state.level++; Game.state.statPoints += 5;
            if(Game.state.level % 5 === 0) Game.state.skillPoints++;
            Game.calcStats(); up = true;
        }
        if(up) UI.showToast(`Level UP!`);
        UI.update();
    },

    addStat: (attr) => {
        if (Game.state.statPoints > 0) { Game.state.statPoints--; Game.state[attr]++; Game.calcStats(); UI.update(); }
    },

    resetSkills: () => {
        if(confirm("Deseja resetar suas habilidades? Todos os SP serão devolvidos.")) {
            Game.state.skillPoints += Game.state.unlockedSkills.length; // Assumindo custo 1 para simplificar
            Game.state.unlockedSkills = [];
            Game.calcStats(); UI.rebuildSkillTree(UI.currentSkillElement); UI.update();
        }
    },

    buySkill: () => {
        let id = Game.runtime.selectedSkill;
        let skill = SkillTreeData.find(s => s.id === id);
        if(skill && Game.state.skillPoints >= skill.cost) {
            Game.state.skillPoints -= skill.cost;
            Game.state.unlockedSkills.push(id);
            Game.calcStats(); UI.rebuildSkillTree(skill.el); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buyEnemyLevel: () => { let c = Utils.calcCost(10, Game.state.enemyLvl - 1, 1.5); if(Game.state.gold >= c) { Game.state.gold -= c; Game.state.enemyLvl++; Game.runtime.enemies=[]; for(let i=0; i<Game.state.maxEnemies; i++) Game.spawnEnemy(); UI.update(); } },
    buyMaxEnemies: () => { let c = Utils.calcCost(50, Game.state.maxEnemies - 1, 2.5); if(Game.state.maxEnemies < 10 && Game.state.gold >= c) { Game.state.gold -= c; Game.state.maxEnemies++; Game.spawnEnemy(); UI.update(); } },

    spawnEnemy: () => {
        let hp = 20 * Math.pow(1.15, Game.state.enemyLvl);
        let a = Math.random() * Math.PI * 2; let d = 150 + Math.random() * 50;
        Game.runtime.enemies.push({ id: Math.random(), hp: hp, maxHp: hp, x: Math.cos(a)*d, y: Math.sin(a)*d, flash: 0, burn: 0, slow: 0 });
    },

    hitEnemy: (e, dmg) => {
        if(e.hp <= 0) return;
        
        // Aplica Sinergias
        if(Game.runtime.synergies.steam) { e.burn = 2; e.slow = 2; dmg *= 1.2; }
        if(Game.runtime.synergies.toxicStorm && Math.random() < 0.1) dmg *= 2; // Crítico tóxico

        e.hp -= dmg; e.flash = 0.1;
        Game.runtime.texts.push({ x: e.x, y: e.y - 15, txt: Utils.format(dmg), life: 0.8 });
        
        if (e.hp <= 0) {
            Game.runtime.enemies = Game.runtime.enemies.filter(en => en.id !== e.id);
            Game.state.kills++;
            let g = 1 * Math.pow(1.15, Game.state.enemyLvl);
            let x = 15 * Math.pow(1.12, Game.state.enemyLvl);
            Game.state.gold += g; Game.addXp(x);
            Renderer.createExplosion(e.x, e.y, "#ff2a4b");
            setTimeout(Game.spawnEnemy, 500);
        }
    },

    prestige: () => {
        if (Game.state.level < 50) return;
        let ess = Math.floor(Game.state.level / 10);
        if (confirm(`Ascender concederá +${ess} Essência. Tudo será zerado. Continuar?`)) {
            Game.state.essence += ess; Game.state.level = 1; Game.state.xp = 0; Game.state.statPoints = 0;
            Game.state.str = 0; Game.state.agi = 0; Game.state.ene = 0; Game.state.gold = 0;
            Game.state.enemyLvl = 1; Game.state.maxEnemies = 1; Game.state.mana = 100; Game.state.kills = 0;
            Game.runtime.enemies = []; Game.spawnEnemy(); Game.calcStats(); UI.update();
        }
    },

    loop: (time) => {
        let dt = Math.min((time - Game.runtime.lastFrame) / 1000, 0.1);
        Game.runtime.lastFrame = time;

        if (!Game.runtime.isExhausted) Game.state.mana -= Game.runtime.manaCost * dt;
        Game.state.mana += Game.runtime.manaRegen * dt;
        if (Game.state.mana > Game.runtime.maxMana) Game.state.mana = Game.runtime.maxMana;
        if (Game.state.mana < 0) Game.state.mana = 0;

        let rotDelta = (Game.runtime.rps * Math.PI * 2) * dt;
        let prevAngle = Game.runtime.angle;
        Game.runtime.angle = (Game.runtime.angle + rotDelta) % (Math.PI * 2);

        Game.runtime.enemies.forEach(e => {
            if (e.flash > 0) e.flash -= dt;
            let dist = Math.hypot(e.x, e.y);
            let spd = 20; if(e.slow > 0) { e.slow -= dt; spd *= 0.5; }
            if (dist > 30) { e.x -= (e.x/dist) * spd * dt; e.y -= (e.y/dist) * spd * dt; }
            
            if (dist <= Game.runtime.radius + 10) {
                let eAngle = Math.atan2(e.y, e.x); if (eAngle < 0) eAngle += Math.PI * 2;
                let hit = false;
                if (prevAngle < Game.runtime.angle) { if (eAngle >= prevAngle && eAngle <= Game.runtime.angle) hit = true; } 
                else { if (eAngle >= prevAngle || eAngle <= Game.runtime.angle) hit = true; }
                
                let rots = Math.floor(rotDelta / (Math.PI * 2));
                let hits = (hit ? 1 : 0) + rots;
                if (hits > 0) Game.hitEnemy(e, Game.runtime.dmg * hits);
            }
        });

        Game.runtime.texts.forEach(t => { t.y -= 30 * dt; t.life -= dt; });
        Game.runtime.texts = Game.runtime.texts.filter(t => t.life > 0);
        Game.runtime.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; });
        Game.runtime.particles = Game.runtime.particles.filter(p => p.life > 0);

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
        for(let i=0; i<10; i++) {
            let a = Math.random() * Math.PI * 2; let s = Math.random() * 50 + 10;
            Game.runtime.particles.push({ x: x, y: y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 0.5, max: 0.5, c: color });
        }
    },
    draw: () => {
        let ctx = Renderer.ctx; let cx = Renderer.w / 2; let cy = Renderer.h / 2 - 50; // Deslocado para cima
        ctx.clearRect(0, 0, Renderer.w, Renderer.h);

        ctx.beginPath(); ctx.arc(cx, cy, Game.runtime.radius, 0, Math.PI*2);
        ctx.strokeStyle = "rgba(255,255,255,0.05)"; ctx.stroke();

        Game.runtime.particles.forEach(p => {
            ctx.fillStyle = p.c; ctx.globalAlpha = p.life/p.max;
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1.0;

        Game.runtime.enemies.forEach(e => {
            ctx.save(); ctx.translate(cx + e.x, cy + e.y);
            ctx.fillStyle = e.flash > 0 ? "#fff" : "#111"; ctx.strokeStyle = e.flash > 0 ? "#fff" : "#ff2a4b";
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, 12, 0, Math.PI*2); ctx.fill(); ctx.stroke();
            ctx.restore();
        });

        ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill();

        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Game.runtime.angle);
        let c1 = Game.runtime.isExhausted ? "rgba(255,42,75,0.8)" : "rgba(0,170,255,0.9)";
        ctx.beginPath(); ctx.arc(0, 0, Game.runtime.radius, -Math.PI/4, Math.PI/4);
        ctx.lineWidth = 4; ctx.strokeStyle = c1; ctx.shadowBlur = 10; ctx.shadowColor = c1; ctx.stroke();
        ctx.restore();

        ctx.font = "bold 14px 'Rajdhani'"; ctx.textAlign = "center";
        Game.runtime.texts.forEach(t => {
            ctx.fillStyle = `rgba(255, 204, 0, ${t.life})`; ctx.fillText(t.txt, cx + t.x, cy + t.y);
        });
    }
};

const UI = {
    currentSkillElement: 'fire',
    switchTab: (id, el) => {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
        document.getElementById(`tab-${id}`).classList.add('active');
        el.classList.add('active');
        if(id === 'skills') UI.rebuildSkillTree(UI.currentSkillElement);
    },
    showToast: (msg) => {
        let c = document.getElementById('toast-container');
        let t = document.createElement('div'); t.className = 'toast'; t.innerText = msg;
        c.appendChild(t); setTimeout(() => t.remove(), 2500);
    },
    setTxt: (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; },
    
    filterSkills: (element) => {
        UI.currentSkillElement = element;
        document.querySelectorAll('.ele-btn').forEach(b => b.classList.remove('active'));
        document.querySelector(`.ele-btn.${element}`).classList.add('active');
        UI.rebuildSkillTree(element);
    },
    rebuildSkillTree: (el) => {
        let skills = SkillTreeData.filter(s => s.el === el);
        let html = `<div class="tree-row">`;
        skills.forEach(s => {
            let isUnlocked = Game.hasSkill(s.id);
            let canUnlock = !isUnlocked && (!s.req || Game.hasSkill(s.req));
            let cls = isUnlocked ? "unlocked" : (canUnlock ? "available" : "locked");
            html += `<div class="tree-node ${cls}" onclick="UI.showSkillModal('${s.id}')">${s.id.toUpperCase()}</div>`;
        });
        html += `</div>`;
        document.getElementById('skill-tree-container').innerHTML = html;
    },
    showSkillModal: (id) => {
        let s = SkillTreeData.find(sk => sk.id === id);
        if(!s) return;
        Game.runtime.selectedSkill = id;
        UI.setTxt('modal-skill-title', s.n); UI.setTxt('modal-skill-desc', s.d);
        document.getElementById('skill-modal').style.display = 'flex';
    },
    closeModal: (id) => { document.getElementById(id).style.display = 'none'; },

    update: () => {
        let s = Game.state; let r = Game.runtime;
        UI.setTxt('val-level', s.level); UI.setTxt('val-gold', Utils.format(s.gold)); UI.setTxt('val-essence', Utils.format(s.essence));
        document.getElementById('mini-xp-fill').style.width = `${(s.xp / r.reqXp) * 100}%`;
        
        UI.setTxt('ov-str', s.str); UI.setTxt('ov-ene', s.ene); UI.setTxt('ov-agi', s.agi);
        UI.setTxt('val-pts-side', s.statPoints); UI.setTxt('val-pts-main', s.statPoints);
        
        let dps = r.dmg * (r.rps * 2) * s.maxEnemies;
        UI.setTxt('ov-dps', Utils.format(dps)); UI.setTxt('val-dps-main', Utils.format(dps));
        UI.setTxt('ov-mana-regen', r.manaRegen.toFixed(1)); UI.setTxt('ov-cost', r.manaCost.toFixed(1));
        
        UI.setTxt('val-wave', `${(s.kills % 10)}/10`);
        
        UI.setTxt('val-mana-txt', `${Math.floor(s.mana)} / ${Math.floor(r.maxMana)}`);
        document.getElementById('bar-mana').style.width = `${(s.mana / r.maxMana) * 100}%`;
        
        UI.setTxt('val-level-bar', s.level); UI.setTxt('val-xp-txt', `${Utils.format(s.xp)} / ${Utils.format(r.reqXp)}`);
        document.getElementById('bar-xp').style.width = `${(s.xp / r.reqXp) * 100}%`;

        UI.setTxt('card-str', s.str); UI.setTxt('card-ene', s.ene); UI.setTxt('card-agi', s.agi);
        ['str', 'ene', 'agi'].forEach(a => document.getElementById(`btn-add-${a}`).disabled = s.statPoints <= 0);

        UI.setTxt('upg-lvl-val', s.enemyLvl); UI.setTxt('cost-lvl', Utils.format(Utils.calcCost(10, s.enemyLvl - 1, 1.5)));
        UI.setTxt('upg-max-val', s.maxEnemies); UI.setTxt('cost-max', Utils.format(Utils.calcCost(50, s.maxEnemies - 1, 2.5)));
        
        UI.setTxt('val-sp', s.skillPoints);
        UI.setTxt('val-pending-essence', Math.floor(s.level / 10));
    }
};

// PWA Setup
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e;
    document.getElementById('btn-install').style.display = 'flex';
});
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; document.getElementById('btn-install').style.display = 'none'; });
    }
}
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW falhou', err));
}

window.onload = Game.init;
