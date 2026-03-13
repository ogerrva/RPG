// ==========================================
// 2. CORE: ECONOMIA, PLAYER E SAVE
// ==========================================

const Stats = { timePlayed: 0, totalGold: 0, totalEnergy: 0, targetsDestroyed: 0, spellsCast: 0 };

const Economy = {
    gold: 0, energy: 0, xpRate: 1, dpsHistory: [], targetLevel: 1, targetCount: 1,
    earnGold: (amt) => { Economy.gold += amt; Stats.totalGold += amt; UI.needsUpdate = true; },
    earnEnergy: (amt) => { Economy.energy += amt; Stats.totalEnergy += amt; UI.needsUpdate = true; },
    spendGold: (amt) => { if (Economy.gold >= amt) { Economy.gold -= amt; UI.needsUpdate = true; return true; } UI.showToast("Ouro Insuficiente!", true); return false; },
    spendEnergy: (amt) => { if (Economy.energy >= amt) { Economy.energy -= amt; UI.needsUpdate = true; return true; } UI.showToast("Energia Insuficiente!", true); return false; },
    buyTargetLevel: () => { let c = Utils.calcCost(15, Economy.targetLevel - 1, 1.8); if (Economy.spendGold(c)) { Economy.targetLevel++; Combat.updateTargetsMaxHp(); UI.needsFullRebuild = true; } },
    buyTargetCount: () => { let c = Utils.calcCost(50, Economy.targetCount - 1, 2.5); if (Economy.targetCount < 10 && Economy.spendGold(c)) { Economy.targetCount++; Combat.addTarget(); UI.needsFullRebuild = true; } }
};

const Player = {
    level: 1, xp: 0, resets: 0, statPoints: 0, pointsSpent: { dmg: 0, spd: 0, crit: 0, xp: 0, eng: 0 },
    inventory: { items: [], magics: [] }, 
    equipped: { wand: [null], armor: [null], amulet: [null], earring: [null, null], ring: [null, null, null, null, null] },
    equippedMagics: [null, null, null, null, null], 
    comboActive: false, secretCombo: false,
    
    getReqXp: () => Math.floor(100 * Math.pow(Player.level, 1.8)),
    
    gainXp: (amount) => {
        if (Player.level >= 400) return; 
        let oldLvl = Player.level; Player.xp += amount; let req = Player.getReqXp();
        while (Player.xp >= req && Player.level < 400) { Player.xp -= req; Player.level++; req = Player.getReqXp(); }
        if (Player.level >= 400) { Player.level = 400; Player.xp = req; } 
        if (Player.level > oldLvl) Renderer.levelUpAuraTimer = 2.0;
        UI.needsUpdate = true;
    },
    addStat: (key) => { if (Player.statPoints > 0) { Player.statPoints--; Player.pointsSpent[key]++; Combat.recalculateStats(); UI.needsUpdate = true; } },
    
    buyItem: (id) => {
        let item = GameData.items[id];
        if(Player.inventory.items.includes(id)) return;
        if(Economy.spendGold(item.cost)) { Player.inventory.items.push(id); UI.needsFullRebuild = true; UI.showToast(`Adquirido: ${item.name}`); }
    },
    setEquip: (slotType, slotIdx, itemId) => {
        if (itemId !== null) {
            let item = GameData.items[itemId];
            if(Player.level < item.reqLevel) { UI.showToast(`Requer Nível ${item.reqLevel}!`, true); return; }
            let currentIndex = Player.equipped[slotType].indexOf(itemId);
            if (currentIndex !== -1) Player.equipped[slotType][currentIndex] = null;
        }
        Player.equipped[slotType][slotIdx] = itemId;
        Combat.recalculateStats(); UI.needsFullRebuild = true; UI.closeEquipModal();
    },
    buyMagic: (id) => {
        let m = GameData.magics[id];
        if(Player.inventory.magics.includes(id)) return;
        if(Economy.spendEnergy(m.cost)) { Player.inventory.magics.push(id); UI.needsFullRebuild = true; UI.showToast("Magia Aprendida!"); }
    },
    setMagic: (slotIdx, itemId) => {
        if (itemId !== null) {
            let currentIndex = Player.equippedMagics.indexOf(itemId);
            if (currentIndex !== -1) Player.equippedMagics[currentIndex] = null; 
        }
        Player.equippedMagics[slotIdx] = itemId;
        Player.checkCombos(); Combat.recalculateStats(); UI.needsFullRebuild = true; UI.closeEquipModal();
    },
    checkCombos: () => {
        Player.comboActive = false; Player.secretCombo = false;
        let activeMags = Player.equippedMagics.filter(m => m !== null);
        
        // Aura Suprema
        if(activeMags.length === 5) {
            let firstElement = GameData.magics[activeMags[0]].element;
            if(activeMags.every(id => GameData.magics[id].element === firstElement)) { 
                Player.comboActive = firstElement; UI.showToast(`AURA SUPREMA DESPERTADA!`); 
            }
        }
        
        // Combos Secretos do Desafio
        let names = activeMags.map(id => GameData.magics[id].name);
        if (names.includes("Echo Pulse") && names.includes("Ripple Surge")) { Player.secretCombo = "Echo Storm"; UI.showToast("COMBO SECRETO: Echo Storm!"); }
        else if (names.includes("Arc Thread") && names.includes("Chain Bloom")) { Player.secretCombo = "Lightning Web"; UI.showToast("COMBO SECRETO: Lightning Web!"); }
        else if (names.includes("Fractal Bloom") && names.includes("Split Halo")) { Player.secretCombo = "Fractal Nova"; UI.showToast("COMBO SECRETO: Fractal Nova!"); }
        else if (names.includes("Void Needle") && names.includes("Collapse Orb")) { Player.secretCombo = "Void Singularity"; UI.showToast("COMBO SECRETO: Void Singularity!"); }
        else if (names.includes("Orbit Seed") && names.includes("Pulse Garden")) { Player.secretCombo = "Orbital Storm"; UI.showToast("COMBO SECRETO: Orbital Storm!"); }
    }
};

const Prestige = {
    calcPending: () => { if (Player.level < 350) return 0; return (Player.resets + 1) * 5; }, 
    muReset: () => {
        if (Player.level < 350) { UI.showToast("Mínimo Nível 350!", true); return; }
        let pts = Prestige.calcPending(); 
        if (confirm(`Resetar concederá +${pts} Pontos. Ouro e Energia serão perdidos. ITENS E MAGIAS SÃO MANTIDOS! Continuar?`)) {
            Player.resets++; Player.statPoints += pts; Player.level = 1; Player.xp = 0;
            Economy.gold = 0; Economy.energy = 0; Economy.targetLevel = 1; Economy.targetCount = 1;
            Combat.init(); UI.rebuildAll(); SaveSystem.save(true);
        }
    }
};

const Skills = {
    activeSkills: [0], list: [],
    types: [{ name: "Concentração", stat: "XP Global" }, { name: "Força", stat: "Dano Base" }, { name: "Casting Arcano", stat: "Vel. Ataque" }, { name: "Precisão", stat: "Chance Crítico" }, { name: "Sifão", stat: "Drop Energia" }],
    tiers: ["Novato", "Adepto", "Especial", "Mestre", "Grão", "Lendário", "Mítico", "Divino", "Cósmico", "Supremo"],
    init: () => { let idCounter = 0; for (let t = 0; t < 10; t++) { for (let typeIdx = 0; typeIdx < 5; typeIdx++) { Skills.list.push({ id: idCounter++, tierIdx: t, typeIdx: typeIdx, level: 0, xp: 0, baseReq: 10 * Math.pow(5, t), mult: [0.05, 0.05, 0.02, 0.02, 0.02][typeIdx] * (1 + (t * 0.5)) }); } } },
    addXp: (amount) => {
        if(Skills.activeSkills.length === 0) Skills.activeSkills = [0]; let leveledUp = false;
        Skills.activeSkills.forEach(id => {
            let active = Skills.list[id];
            if(active) { active.xp += amount; let req = active.baseReq * Math.pow(1.2, active.level); while (active.xp >= req) { active.xp -= req; active.level++; req = active.baseReq * Math.pow(1.2, active.level); leveledUp = true; } }
        });
        if (leveledUp) { Combat.recalculateStats(); UI.needsFullRebuild = true; }
    },
    update: (dt) => { Skills.addXp(Economy.xpRate * 10 * dt); },
    toggleActive: (id) => { 
        let maxActive = 1; if (Player.level > 100) maxActive = 2; if (Player.level > 200) maxActive = 3; if (Player.level > 300) maxActive = 4; if (Player.resets > 0) maxActive = 5;
        if (Skills.activeSkills.includes(id)) { if (Skills.activeSkills.length > 1) { Skills.activeSkills = Skills.activeSkills.filter(s => s !== id); } } 
        else { Skills.activeSkills.push(id); if (Skills.activeSkills.length > maxActive) { Skills.activeSkills.shift(); } } 
        UI.needsFullRebuild = true; 
    },
    getBonus: (typeIdx) => { return Skills.list.filter(s => s.typeIdx === typeIdx).reduce((sum, s) => sum + (s.level * s.mult), 0); }
};

const SaveSystem = {
    key: 'earMageSaveData_Modules',
    save: (silent = false) => {
        try {
            let data = { timestamp: Date.now(), lang: Lang.current, stats: Stats, player: Player, economy: { g: Economy.gold, e: Economy.energy, tl: Economy.targetLevel, tc: Economy.targetCount }, skills: { actArr: Skills.activeSkills, d: Skills.list.map(s => ({ l: s.level, x: s.xp })) }};
            localStorage.setItem(SaveSystem.key, JSON.stringify(data));
            if (!silent) { let ind = document.getElementById('save-indicator'); if(ind){ ind.style.opacity = 1; setTimeout(() => ind.style.opacity = 0, 2000); } }
        } catch(e) {}
    },
    load: () => {
        let saved = localStorage.getItem(SaveSystem.key) || localStorage.getItem('earMageSaveData_BuildSystem_100Spells'); 
        if (!saved) return 0;
        try {
            let d = JSON.parse(saved); Lang.current = d.lang || 'pt'; if (d.stats) Object.assign(Stats, d.stats);
            if (d.player) { 
                Player.level = d.player.level || 1; Player.xp = d.player.xp || 0; Player.resets = d.player.resets || 0; Player.statPoints = d.player.statPoints || 0; 
                Player.pointsSpent = d.player.pointsSpent || { dmg: 0, spd: 0, crit: 0, xp: 0, eng: 0 }; 
                if(d.player.inventory) Player.inventory = d.player.inventory;
                if(d.player.equipped) {
                    Player.equipped.wand = Array.isArray(d.player.equipped.wand) ? d.player.equipped.wand : [null];
                    Player.equipped.armor = Array.isArray(d.player.equipped.armor) ? d.player.equipped.armor : [null];
                    Player.equipped.amulet = Array.isArray(d.player.equipped.amulet) ? d.player.equipped.amulet : [null];
                    Player.equipped.earring = Array.isArray(d.player.equipped.earring) ? d.player.equipped.earring : [null, null];
                    Player.equipped.ring = Array.isArray(d.player.equipped.ring) ? d.player.equipped.ring : [null, null, null, null, null];
                }
                if(d.player.equippedMagics) { Player.equippedMagics = Array.isArray(d.player.equippedMagics) ? d.player.equippedMagics : [null, null, null, null, null]; while(Player.equippedMagics.length < 5) Player.equippedMagics.push(null); }
            }
            if (d.economy) { Economy.gold = parseFloat(d.economy.g) || 0; Economy.energy = parseFloat(d.economy.e) || 0; Economy.targetLevel = Math.max(1, parseInt(d.economy.tl) || 1); Economy.targetCount = Math.max(1, parseInt(d.economy.tc) || 1); }
            if (d.skills) { Skills.activeSkills = Array.isArray(d.skills.actArr) && d.skills.actArr.length > 0 ? d.skills.actArr : [0]; if(d.skills.d) d.skills.d.forEach((s, i) => { if(Skills.list[i]){ Skills.list[i].level = parseInt(s.l) || 0; Skills.list[i].xp = parseFloat(s.x) || 0; }}); }
            return (Date.now() - (d.timestamp || Date.now())) / 1000;
        } catch(e) { return 0; }
    },
    hardReset: () => { if (confirm("Apagar TODO O SEU PROGRESSO permanentemente?")) { localStorage.removeItem(SaveSystem.key); location.reload(); } }
};
