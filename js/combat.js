/**
 * =======================================================
 * 4. COMBATE, FÍSICA E PARTÍCULAS
 * =======================================================
 */

class Target {
    constructor(index) { 
        this.index = index; 
        this.maxHp = Combat.getTargetMaxHp(); 
        this.hp = this.maxHp; 
        this.flash = 0; 
        this.x = 0; 
        this.y = 0; 
        this.floatTime = Math.random() * 10; 
        this.isDead = false; 
        this.respawnTimer = 0;
    }
    
    update(dt) { 
        this.floatTime += dt * 2; 
        this.y = 180 + Math.sin(this.floatTime) * 6; 
        let spacing = Math.min(70, (480 - 160 - 40) / Math.max(1, Combat.targets.length)); 
        this.x = 160 + (this.index * spacing); 
        
        if (this.isDead) { 
            this.respawnTimer -= dt; 
            if (this.respawnTimer <= 0) { 
                this.isDead = false; 
                this.hp = this.maxHp; 
                for(let i=0; i<5; i++) Combat.particles.push(new Particle(this.x, this.y, '#00ffcc', 0.5, false, 'normal')); 
            } 
        } else { 
            if (this.flash > 0) this.flash -= dt; 
        }
    }
    
    hit(dmg, critTier, aoe) {
        if (this.isDead) return; 
        this.hp -= dmg; 
        this.flash = 0.1; 
        Combat.registerDamage(dmg); 
        Combat.texts.push(new FloatingText(this.x, this.y - 20, Utils.format(dmg), critTier));
        
        if (critTier > 0) Player.gainXp(Economy.xpRate * 15 * critTier);
        
        if (aoe) { 
            let sDmg = dmg * 0.2; 
            Combat.shockwaves.push(new Shockwave(this.x, this.y, '#ff3300')); 
            Combat.targets.forEach(t => { 
                if (t !== this && !t.isDead) { 
                    t.hp -= sDmg; 
                    Combat.registerDamage(sDmg); 
                    if(t.hp <= 0) t.break(); 
                } 
            }); 
        }
        
        if (this.hp <= 0) this.break();
    }
    
    break() {
        if (this.isDead) return; 
        this.isDead = true; 
        this.respawnTimer = 2.0; 
        
        // Recompensa Multiplicada pelo nível do Alvo
        let multLvl = Math.max(1, Economy.targetLevel);
        
        // Aplica o bônus de Ouro da Prática "Clarividência"
        let goldBonus = 1 + Skills.getBonus("gold");
        Economy.earnGold(Combat.getTargetGold() * goldBonus); 
        
        if (Math.random() < Combat.stats.engDrop) Economy.earnEnergy(1); 
        Stats.targetsDestroyed++; 
        Renderer.shake = 6; 
        
        let xpGained = Economy.xpRate * 100 * multLvl; 
        Player.gainXp(xpGained * 5); 
        Skills.addXp(xpGained);
        
        let pColor = SpriteGen.crystalTiers[(multLvl - 1) % SpriteGen.crystalTiers.length]['c'];
        for(let i=0; i<30; i++) {
            Combat.particles.push(new Particle(this.x, this.y, Math.random()>0.5 ? pColor : '#ffffff', 0.5 + Math.random()*0.8, false, 'shard', 1 + Math.random())); 
        }
        Combat.shockwaves.push(new Shockwave(this.x, this.y, '#ffffff')); 
    }
    
    draw(ctx) {
        if (this.isDead) { 
            ctx.save(); 
            ctx.translate(Math.floor(this.x), Math.floor(this.y)); 
            ctx.fillStyle = 'rgba(0,0,0,0.2)'; 
            ctx.fillRect(-4, 18, 8, 2); 
            ctx.restore(); 
            return; 
        }
        
        ctx.save(); 
        ctx.translate(Math.floor(this.x), Math.floor(this.y)); 
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
        ctx.fillRect(-8, 18, 16, 4); 
        
        let safeLvl = Math.max(1, Economy.targetLevel || 1); 
        let cImg = SpriteGen.crystalSprites[(safeLvl - 1) % SpriteGen.crystalTiers.length] || SpriteGen.crystalSprites[0];
        
        let imgOffsetX = -16;
        let imgOffsetY = -18;

        if (this.flash > 0) { 
            ctx.globalCompositeOperation = 'source-atop'; 
            ctx.drawImage(cImg, imgOffsetX, imgOffsetY); 
            ctx.fillStyle = '#fff'; 
            ctx.fillRect(-20, -20, 40, 40); 
            ctx.globalCompositeOperation = 'source-over'; 
        } else { 
            ctx.drawImage(cImg, imgOffsetX, imgOffsetY); 
        }
        
        let pct = Math.max(0, this.hp / this.maxHp); 
        ctx.fillStyle = '#000'; 
        ctx.fillRect(-10, -25, 20, 4); 
        ctx.fillStyle = SpriteGen.crystalTiers[(safeLvl - 1) % SpriteGen.crystalTiers.length]['c']; 
        ctx.fillRect(-9, -24, Math.floor(18 * pct), 2); 
        ctx.restore();
    }
}

class Portal {
    constructor(x, y, target, dmg, critTier, color) { 
        this.x = x; this.y = y; this.target = target; this.dmg = dmg; 
        this.critTier = critTier; this.color = color; 
        this.life = 0.8; this.fired = false; this.radius = 0; 
    }
    update(dt) { 
        this.life -= dt; 
        if (this.life > 0.6) this.radius += 30 * dt; 
        else if (this.life < 0.2) this.radius -= 30 * dt; 
        
        if (this.life <= 0.5 && !this.fired) { 
            let pData = { speed: 400, type: 'storm', chains: 0, aoe: true, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false };
            Combat.projectiles.push(new Projectile(this.x, this.y, this.target, this.dmg, this.critTier, pData, this.color)); 
            this.fired = true; 
        } 
        return this.life > 0; 
    }
    draw(ctx) { 
        ctx.save(); 
        ctx.translate(Math.floor(this.x), Math.floor(this.y)); 
        ctx.beginPath(); 
        ctx.ellipse(0, 0, Math.max(0, this.radius), Math.max(0, this.radius/2), 0, 0, Math.PI*2); 
        ctx.strokeStyle = this.color; 
        ctx.lineWidth = 2; 
        ctx.stroke(); 
        ctx.fillStyle = '#1a0033'; 
        ctx.fill(); 
        
        if(Math.random() > 0.5) { 
            ctx.fillStyle = '#fff'; 
            ctx.fillRect((Math.random()-0.5)*this.radius, (Math.random()-0.5)*this.radius, 1, 1); 
        } 
        ctx.restore(); 
    }
}

class BlackHole {
    constructor(x, y) {
        this.x = x; this.y = y; this.life = 1.0; this.radius = 0;
    }
    update(dt) {
        this.life -= dt;
        if (this.life > 0.5) this.radius += 100 * dt;
        else this.radius -= 100 * dt;
        
        Combat.particles.forEach(p => {
            let dx = this.x - p.x; let dy = this.y - p.y;
            let dist = Math.hypot(dx, dy);
            if (dist < this.radius * 2) {
                p.x += (dx/dist) * 100 * dt;
                p.y += (dy/dist) * 100 * dt;
            }
        });
        return this.life > 0;
    }
    draw(ctx) {
        ctx.save();
        ctx.shadowBlur = 20; ctx.shadowColor = '#800080';
        ctx.fillStyle = '#000'; ctx.beginPath(); ctx.arc(this.x, this.y, Math.max(0, this.radius), 0, Math.PI*2); ctx.fill();
        ctx.strokeStyle = '#d942ff'; ctx.lineWidth = 2; ctx.stroke();
        ctx.restore();
    }
}

class Shockwave {
    constructor(x, y, color) { this.x = x; this.y = y; this.color = color; this.life = 0.3; this.radius = 0; } 
    update(dt) { this.life -= dt; this.radius += 100 * dt; return this.life > 0; } 
    draw(ctx) { 
        ctx.save(); ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.beginPath(); ctx.arc(Math.floor(this.x), Math.floor(this.y), this.radius, 0, Math.PI*2); 
        ctx.strokeStyle = this.color; ctx.lineWidth = 2; ctx.stroke(); ctx.restore();
    }
}

class Projectile {
    constructor(x, y, target, dmg, critTier, mData, color) { 
        this.x = x; this.y = y; this.target = target; this.dmg = dmg; 
        this.critTier = critTier; this.m = mData; this.color = color; 
        
        let spdBonus = 1 + Skills.getBonus("projSpd");
        this.speed = this.m.speed * spdBonus; 
        this.offsetY = this.m.type === 'storm' ? 0 : (Math.random() - 0.5) * 15; 
        this.time = 0;
    }
    
    update(dt) { 
        if (!this.target || this.target.isDead) return false; 
        this.time += dt;
        
        let ty = this.target.y + this.offsetY; 
        
        if (this.m.wave) {
            ty += Math.sin(this.time * 20) * 30;
        }
        
        let dx = this.target.x - this.x; let dy = ty - this.y; let dist = Math.hypot(dx, dy); 
        
        if (dist < this.speed * dt) { 
            this.target.hit(this.dmg, this.critTier, this.m.aoe); 
            
            if (this.m.implode) {
                Combat.shockwaves.push(new BlackHole(this.target.x, this.target.y));
            }
            
            if (this.m.split > 0) {
                for(let i=0; i<this.m.split; i++) {
                    Combat.particles.push(new Particle(this.target.x, this.target.y, this.color, 0.5, false, 'fire', 2));
                }
            }

            if (Player.secretCombo === "Echo Storm") {
                Combat.shockwaves.push(new Shockwave(this.target.x, this.target.y, this.color));
                Combat.particles.push(new Particle(this.target.x, this.target.y, this.color, 1.0, false, 'normal', 3));
            }
            else if (Player.secretCombo === "Lightning Web") {
                this.m.chains += 2; 
            }
            else if (Player.secretCombo === "Fractal Nova") {
                this.m.split += 5; 
                Combat.shockwaves.push(new Shockwave(this.target.x, this.target.y, this.color));
            }
            else if (Player.secretCombo === "Void Singularity") {
                Combat.shockwaves.push(new BlackHole(this.target.x, this.target.y));
            }

            if (this.m.chains > 0) { 
                let aliveTargets = Combat.targets.filter(t => !t.isDead); 
                if (aliveTargets.length > 1) { 
                    let next = aliveTargets.find(t => t !== this.target) || aliveTargets[0]; 
                    let newM = {...this.m}; 
                    newM.chains -= 1;
                    Combat.projectiles.push(new Projectile(this.target.x, this.target.y, next, this.dmg, this.critTier, newM, this.color)); 
                    Combat.lightnings.push(new Lightning(this.target.x, this.target.y, next.x, next.y, this.color)); 
                } 
            } 
            
            return this.m.pierce ? true : false; 
        } 
        
        this.x += (dx / dist) * this.speed * dt; 
        this.y += (dy / dist) * this.speed * dt; 
        
        if (Math.random() > 0.4) {
            Combat.particles.push(new Particle(this.x, this.y, this.color, 0.2, true, this.m.type === 'storm' ? 'fire' : 'normal')); 
        }
        return true; 
    }
    
    draw(ctx) { 
        if (this.m.type === 'chain') return; 
        
        ctx.shadowBlur = 10; ctx.shadowColor = this.color;
        ctx.fillStyle = this.color; 
        let s = this.m.type === 'storm' ? 5 : (3 + (this.critTier > 1 ? 1 : 0)); 
        
        if (this.m.orbit) {
            ctx.beginPath(); ctx.arc(Math.floor(this.x), Math.floor(this.y), s, 0, Math.PI*2); ctx.fill();
        } else {
            ctx.fillRect(Math.floor(this.x)-1, Math.floor(this.y)-1, s, s); 
        }
        ctx.shadowBlur = 0;
    }
}

class Lightning {
    constructor(x1, y1, x2, y2, color) { this.x1 = x1; this.y1 = y1; this.x2 = x2; this.y2 = y2; this.color = color; this.life = 0.15; } 
    update(dt) { this.life -= dt; return this.life > 0; }
    draw(ctx) { 
        ctx.save(); 
        ctx.shadowBlur = 15; ctx.shadowColor = this.color;
        ctx.strokeStyle = '#fff'; ctx.lineWidth = 2; 
        ctx.beginPath(); ctx.moveTo(Math.floor(this.x1), Math.floor(this.y1)); 
        let steps = 3; let dx = (this.x2 - this.x1) / steps; let dy = (this.y2 - this.y1) / steps; 
        for(let i=1; i<steps; i++) { 
            let px = Math.floor(this.x1 + dx*i + (Math.random()-0.5)*15); 
            let py = Math.floor(this.y1 + dy*i + (Math.random()-0.5)*15); 
            ctx.lineTo(px, py); 
            if(Math.random()>0.5) Combat.particles.push(new Particle(px, py, this.color, 0.1, true)); 
        } 
        ctx.lineTo(Math.floor(this.x2), Math.floor(this.y2)); ctx.stroke(); ctx.restore(); 
    }
}

class Particle {
    constructor(x, y, color, life, isTrail, style, speedMod = 1) { 
        this.x = x; this.y = y; this.color = color; this.life = life; this.maxLife = life; 
        this.isTrail = isTrail; this.style = style; 
        let a = Math.random() * Math.PI * 2; 
        let s = (isTrail ? 0 : Math.random() * 80 + 20) * speedMod; 
        this.vx = Math.cos(a) * s; this.vy = Math.sin(a) * s; 
    }
    update(dt) { 
        this.x += this.vx * dt; this.y += this.vy * dt; 
        if (!this.isTrail && this.style !== 'fire') { 
            this.vy += 200 * dt; 
            if(this.y > 200) { this.y = 200; this.vy *= -0.5; this.vx *= 0.5; } 
        } 
        if (this.style === 'fire') { this.vy -= 50 * dt; this.vx *= 0.9; } 
        this.life -= dt; return this.life > 0; 
    }
    draw(ctx) { 
        if (Math.random() < this.life / this.maxLife) { 
            ctx.fillStyle = this.color; ctx.fillRect(Math.floor(this.x), Math.floor(this.y), 1.5, 1.5); 
        } 
    }
}

class FloatingText {
    constructor(x, y, text, critTier) { 
        this.x = x + (Math.random()*16-8); this.y = y; this.text = text; this.critTier = critTier || 0; 
        this.life = 0.8; this.vy = -20 - (this.critTier * 10); 
        if (this.critTier === 0) this.color = '#ffffff'; 
        else if (this.critTier === 1) this.color = '#ffd700'; 
        else if (this.critTier === 2) this.color = '#ff8800'; 
        else if (this.critTier === 3) this.color = '#ff3333'; 
        else this.color = '#ff00ff'; 
    }
    update(dt) { this.vy += 30 * dt; this.y += this.vy * dt; this.life -= dt; return this.life > 0; }
    draw(ctx) { 
        let px = Math.floor(this.x); let py = Math.floor(this.y); 
        let fSize = Math.min(16, 8 + (this.critTier * 2)); 
        ctx.font = `${fSize}px "Press Start 2P", cursive, sans-serif`; ctx.textAlign = 'center'; 
        ctx.fillStyle = '#000'; ctx.fillText(this.text, px+1, py+1); 
        ctx.fillStyle = this.color; ctx.fillText(this.text, px, py); 
    }
}

const Combat = {
    stats: { damage: 1, attackSpeed: 0.5, critChance: 0, engDrop: 0.05, elementalBonus: {} }, 
    timer: 0, muzzleFlash: 0,
    targets: [], projectiles: [], particles: [], texts: [], lightnings: [], portals: [], shockwaves: [],
    
    init: () => { 
        Combat.recalculateStats(); 
        Combat.targets = []; 
        for(let i=0; i<Economy.targetCount; i++) Combat.addTarget(); 
    },
    
    recalculateStats: () => {
        let muXp = 1 + (Player.pointsSpent.xp * 0.10); 
        let muDmg = 1 + (Player.pointsSpent.dmg * 0.10); 
        let muSpd = Player.pointsSpent.spd * 0.05; 
        let muCrit = Player.pointsSpent.crit * 0.01; 
        let muDrop = Player.pointsSpent.eng * 0.01;
        
        let eqDmg = 0, eqSpd = 0, eqCrit = 0, eqXp = 0, eqEng = 0;
        Combat.stats.elementalBonus = { fire: 0, ice: 0, lightning: 0, arcane: 0, void: 0 };
        
        Object.keys(Player.equipped).forEach(slot => {
            let ids = Array.isArray(Player.equipped[slot]) ? Player.equipped[slot] : [Player.equipped[slot]];
            ids.forEach(id => {
                if(id !== null && GameData.items[id]) {
                    let item = GameData.items[id];
                    let st = item.stats;
                    if(st.spd) eqSpd += st.spd; 
                    if(st.xp) eqXp += st.xp;
                    if(item.element) Combat.stats.elementalBonus[item.element] += st.eleDmg;
                }
            });
        });
        
        let comboMult = Player.comboActive ? 2.0 : 1.0; 
        // Aplica o bônus da prática especial de Aura (Ressonância)
        let comboPower = 1 + Skills.getBonus("combo");
        if(Player.comboActive) comboMult *= comboPower;
        
        Economy.xpRate = (1 + Skills.getBonus("xp") + eqXp) * muXp * comboMult; 
        Combat.stats.damage = 1 * (1 + Skills.getBonus("dmg") + eqDmg) * muDmg * comboMult; 
        Combat.stats.attackSpeed = 0.5 * (1 + Skills.getBonus("spd") + eqSpd) * (1 + muSpd); 
        Combat.stats.critChance = 0 + Skills.getBonus("crit") + eqCrit + muCrit; 
        Combat.stats.engDrop = Math.min(0.8, 0.05 + Skills.getBonus("eng") + eqEng + muDrop);
    },
    
    getTargetMaxHp: () => Math.floor(5 * Math.pow(2.8, Math.max(0, Economy.targetLevel - 1))), 
    getTargetGold: () => Math.floor(1 * Math.pow(1.8, Math.max(0, Economy.targetLevel - 1))),
    
    updateTargetsMaxHp: () => { 
        let m = Combat.getTargetMaxHp(); 
        Combat.targets.forEach(t => { t.maxHp = m; t.hp = m; }); 
    },
    
    addTarget: () => { 
        Combat.targets.push(new Target(Combat.targets.length)); 
    },
    
    fireProjectile: (startX, startY, target, mData, color, eleMultiplier) => {
        if (!target || target.isDead) return; 
        
        let chance = Combat.stats.critChance; 
        let cTier = Math.floor(chance); 
        if (Math.random() < (chance - cTier)) cTier++;
        
        let finalDmg = Combat.stats.damage * eleMultiplier * Math.pow(2.5, cTier);
        
        if (mData.type === 'storm') { 
            Combat.portals.push(new Portal(target.x + (Math.random()-0.5)*50, 40 + Math.random()*30, target, finalDmg, cTier, color)); 
        } else { 
            Combat.projectiles.push(new Projectile(startX, startY, target, finalDmg, cTier, mData, color)); 
            if (mData.type === 'base') Combat.muzzleFlash = 0.1; 
        } 
        Stats.spellsCast++;
    },
    
    update: (dt) => {
        Combat.timer += dt; 
        let intv = 1 / Combat.stats.attackSpeed; 
        let shots = 0; 
        
        if (Combat.muzzleFlash > 0) Combat.muzzleFlash -= dt;
        
        let aliveTargets = Combat.targets.filter(t => !t.isDead);
        
        while (Combat.timer >= intv && shots < 10) { 
            Combat.timer -= intv; 
            shots++; 
            
            if (aliveTargets.length > 0) {
                let equippedMagics = Player.equippedMagics.filter(m => m !== null);
                
                if (equippedMagics.length > 0) { 
                    equippedMagics.forEach(mId => {
                        let m = GameData.magics[mId];
                        let eleMult = 1 + (Combat.stats.elementalBonus[m.element] || 0); 
                        let pIdx = Math.floor(Math.random() * aliveTargets.length); 
                        
                        Combat.fireProjectile(60, 180 + ((Math.random()-0.5)*20), aliveTargets[pIdx], m, m.color, eleMult);
                    });
                } else {
                    let pIdx = Math.floor(Math.random() * aliveTargets.length); 
                    let basicM = {speed: 250, type: 'base', chains: 0, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false};
                    Combat.fireProjectile(60, 180, aliveTargets[pIdx], basicM, '#d942ff', 1);
                }
            }
        }
        
        if (Combat.timer > intv * 2) Combat.timer = intv; 
        
        Combat.targets.forEach(t => t.update(dt)); 
        Combat.projectiles = Combat.projectiles.filter(p => p.update(dt)); 
        Combat.particles = Combat.particles.filter(p => p.update(dt)); 
        Combat.texts = Combat.texts.filter(t => t.update(dt)); 
        Combat.lightnings = Combat.lightnings.filter(l => l.update(dt)); 
        Combat.portals = Combat.portals.filter(p => p.update(dt)); 
        Combat.shockwaves = Combat.shockwaves.filter(s => s.update(dt));
    }, 
    
    registerDamage: (amt) => { Economy.dpsHistory.push({ time: performance.now(), val: amt || 0 }); }
};
