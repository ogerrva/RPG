// ==========================================
// 2. CORE E SISTEMA DO JOGADOR
// ==========================================

const Stats = { timePlayed: 0, totalGold: 0, totalEnergy: 0, targetsDestroyed: 0, spellsCast: 0 };

const Economy = {
    gold: 0, energy: 0, xpRate: 1, dpsHistory: [], targetLevel: 1, targetCount: 1, goldMult: 1,
    earnGold: (amt) => { Economy.gold += amt * Economy.goldMult; Stats.totalGold += amt * Economy.goldMult; UI.needsUpdate = true; },
    earnEnergy: (amt) => { Economy.energy += amt; Stats.totalEnergy += amt; UI.needsUpdate = true; },
    spendGold: (amt) => { if (Economy.gold >= amt) { Economy.gold -= amt; UI.needsUpdate = true; return true; } UI.showToast("Ouro Insuficiente!", true); return false; },
    spendEnergy: (amt) => { if (Economy.energy >= amt) { Economy.energy -= amt; UI.needsUpdate = true; return true; } UI.showToast("Energia Insuficiente!", true); return false; },
    buyTargetLevel: () => { let c = Utils.calcCost(15, Economy.targetLevel - 1, 1.8); if (Economy.spendGold(c)) { Economy.targetLevel++; Combat.updateTargetsMaxHp(); UI.needsFullRebuild = true; } },
    buyTargetCount: () => { let c = Utils.calcCost(50, Economy.targetCount - 1, 2.5); if (Economy.targetCount < 10 && Economy.spendGold(c)) { Economy.targetCount++; Combat.addTarget(); UI.needsFullRebuild = true; } }
};

const Player = {
    level: 1, xp: 0, resets: 0, statPoints: 0, pointsSpent: { dmg: 0, spd: 0, crit: 0, xp: 0, eng: 0 },
    inventory: { items: [], magics: [] }, equipped: { wand: [null], armor: [null], amulet: [null], earring: [null, null], ring: [null, null, null, null, null] }, equippedMagics: [null, null, null, null, null], comboActive: false, secretCombo: false, practiceSlots: 1,
    getReqXp: () => Math.floor(100 * Math.pow(Player.level, 1.8)),
    gainXp: (amount) => {
        if (Player.level >= 400) return; let oldLvl = Player.level; Player.xp += amount; let req = Player.getReqXp();
        while (Player.xp >= req && Player.level < 400) { Player.xp -= req; Player.level++; req = Player.getReqXp(); }
        if (Player.level >= 400) { Player.level = 400; Player.xp = req; } if (Player.level > oldLvl && typeof Renderer !== 'undefined') Renderer.levelUpAuraTimer = 2.0; UI.needsUpdate = true;
    },
    addStat: (key) => { if (Player.statPoints > 0) { Player.statPoints--; Player.pointsSpent[key]++; Combat.recalculateStats(); UI.needsUpdate = true; } },
    buyItem: (id) => { let item = GameData.items[id]; if(Player.inventory.items.includes(id)) return; if(Economy.spendGold(item.cost)) { Player.inventory.items.push(id); UI.needsFullRebuild = true; UI.showToast(`Adquirido: ${item.name}`); } },
    setEquip: (slotType, slotIdx, itemId) => {
        if (itemId !== null) { let item = GameData.items[itemId]; if(Player.level < item.reqLevel) { UI.showToast(`Requer Nível ${item.reqLevel}!`, true); return; } let currentIndex = Player.equipped[slotType].indexOf(itemId); if (currentIndex !== -1) Player.equipped[slotType][currentIndex] = null; }
        Player.equipped[slotType][slotIdx] = itemId; Combat.recalculateStats(); UI.needsFullRebuild = true; UI.closeEquipModal();
    },
    buyMagic: (id) => { let m = GameData.magics[id]; if(Player.inventory.magics.includes(id)) return; if(Economy.spendEnergy(m.cost)) { Player.inventory.magics.push(id); UI.needsFullRebuild = true; UI.showToast("Magia Aprendida!"); } },
    setMagic: (slotIdx, itemId) => { if (itemId !== null) { let currentIndex = Player.equippedMagics.indexOf(itemId); if (currentIndex !== -1) Player.equippedMagics[currentIndex] = null; } Player.equippedMagics[slotIdx] = itemId; Player.checkCombos(); Combat.recalculateStats(); UI.needsFullRebuild = true; UI.closeEquipModal(); },
    checkCombos: () => {
        Player.comboActive = false; Player.secretCombo = false; let activeMags = Player.equippedMagics.filter(m => m !== null);
        if(activeMags.length === 5) { let firstElement = GameData.magics[activeMags[0]].element; if(activeMags.every(id => GameData.magics[id].element === firstElement)) { Player.comboActive = firstElement; UI.showToast(`AURA SUPREMA DESPERTADA! (+100% Dano)`); } }
        let names = activeMags.map(id => GameData.magics[id].name);
        if (names.includes("Echo Pulse") && names.includes("Ripple Surge")) { Player.secretCombo = "Echo Storm"; UI.showToast("Sinergia: Echo Storm!"); }
        if (names.includes("Arc Thread") && names.includes("Chain Bloom")) { Player.secretCombo = "Lightning Web"; UI.showToast("Sinergia: Lightning Web!"); }
        if (names.includes("Fractal Bloom") && names.includes("Split Halo")) { Player.secretCombo = "Fractal Nova"; UI.showToast("Sinergia: Fractal Nova!"); }
        if (names.includes("Void Needle") && names.includes("Collapse Orb")) { Player.secretCombo = "Void Singularity"; UI.showToast("Sinergia: Void Singularity!"); }
        if (names.includes("Orbit Seed") && names.includes("Pulse Garden")) { Player.secretCombo = "Orbital Storm"; UI.showToast("Sinergia: Orbital Storm!"); }
    }
};

const Prestige = {
    calcPending: () => { if (Player.level < 350) return 0; return (Player.resets + 1) * 5; }, 
    muReset: () => {
        if (Player.level < 350) { UI.showToast("Mínimo Nível 350!", true); return; }
        let pts = Prestige.calcPending(); 
        if (confirm(`Resetar concederá +${pts} Pontos. Ouro e Energia serão perdidos. ITENS, MAGIAS E PRÁTICA CONTINUAM.`)) {
            Player.resets++; Player.statPoints += pts; Player.level = 1; Player.xp = 0; Economy.gold = 0; Economy.energy = 0; Economy.targetLevel = 1; Economy.targetCount = 1; Combat.init(); UI.rebuildAll(); SaveSystem.save(true);
        }
    }
};

// Aqui o erro fatal foi consertado. O array dinâmico lê de PracticeData do data.js!
const Skills = {
    activeSkills: ["p1"], list: [],
    init: () => { 
        Skills.list = PracticeData.map(p => ({ id: p.id, name: p.name, desc: p.desc, category: p.category, stat: p.stat, statName: p.statName, mult: p.mult, baseReq: p.baseReq, level: 0, xp: 0 }));
    },
    addXp: (amount) => {
        if(Skills.activeSkills.length === 0) Skills.activeSkills = ["p1"]; let leveledUp = false;
        Skills.activeSkills.forEach(id => { let active = Skills.list.find(s => s.id === id); if(active) { active.xp += amount; let req = active.baseReq * Math.pow(1.15, active.level); while (active.xp >= req) { active.xp -= req; active.level++; req = active.baseReq * Math.pow(1.15, active.level); leveledUp = true; } } });
        if (leveledUp) { Combat.recalculateStats(); UI.needsFullRebuild = true; }
    },
    update: (dt) => { Skills.addXp(Economy.xpRate * 10 * dt); },
    toggleActive: (id) => { 
        let maxActive = Player.practiceSlots; if (Skills.activeSkills.includes(id)) { if (Skills.activeSkills.length > 1) Skills.activeSkills = Skills.activeSkills.filter(s => s !== id); } else { Skills.activeSkills.push(id); if (Skills.activeSkills.length > maxActive) Skills.activeSkills.shift(); } UI.needsFullRebuild = true; 
    },
    getBonus: (statKey) => { let s = Skills.list.find(sk => sk.stat === statKey); return s ? (s.level * s.mult) : 0; }
};
