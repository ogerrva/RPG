const Utils = {
    format: (num) => {
        if (num < 1000) return Math.floor(num).toString();
        const s = ["", "K", "M", "B", "T", "Qa"];
        const id = Math.floor(Math.log10(num) / 3);
        return (num / Math.pow(1000, id)).toFixed(2) + s[id];
    },
    calcCost: (base, level, exp) => Math.floor(base * Math.pow(exp, level)),
    uid: () => Date.now().toString(36) + Math.random().toString(36).substr(2)
};

// CORES BASEADAS NO TIPO DE PODER/ELEMENTO (Estilo PoE)
const Elements = {
    neutral: { color: "#cccccc", name: "Físico" }, 
    fire: { color: "#e63946", name: "Fogo" }, 
    ice: { color: "#00b4d8", name: "Gelo" }, 
    lightning: { color: "#ffd166", name: "Raio" }, 
    wind: { color: "#06d6a0", name: "Vento" }, 
    poison: { color: "#80ed99", name: "Veneno" },
    void: { color: "#7209b7", name: "Vazio" }, 
    blood: { color: "#d90429", name: "Sangue" },
    elemental: { color: "#fca311", name: "Elemental" }
};

const WeaponDB = [
    { id: "w_0", n: "Lâmina Enferrujada", rarity: 0, mult: 1.0, color: "#888", desc: "Uma lâmina velha. Melhor que usar os punhos.", unique: "Nenhum.", draw: "arc", thick: 2 },
    { id: "w_1", n: "Espada Larga do Aprendiz", rarity: 1, mult: 1.5, color: "#00aaff", desc: "Afiada e balanceada.", unique: "+20% de Dano Físico Base.", draw: "sword", thick: 5 },
    { id: "w_2", n: "Foice Mágica do Vazio", rarity: 2, mult: 3.0, color: "#b366ff", desc: "Rasga a realidade.", unique: "+30% de Área de Efeito.", draw: "scythe", thick: 4 },
    { id: "w_3", n: "Katana Devoradora", rarity: 3, mult: 8.0, color: "#ffcc00", desc: "Sedenta por sangue.", unique: "+15% de Chance Crítica Global.", draw: "katana", thick: 2 }
];

const ClassesDB = [
    { id: "spellblade", n: "Lâmina Mágica", desc: "Mestre dos elementos. Evoca Meteoros e Nevascas.", theme: "elemental" },
    { id: "berserker", n: "Berserker", desc: "Dano brutal físico. Esmagamentos e Sangramento.", theme: "blood" },
    { id: "assassin", n: "Assassino das Sombras", desc: "Poças de veneno e clones de sombra.", theme: "poison" },
    { id: "necromancer", n: "Necromante", desc: "Explode cadáveres e drena almas.", theme: "void" },
    { id: "voidwalker", n: "Andarilho do Vazio", desc: "Cria Buracos Negros e fendas temporais.", theme: "void" }
];

const MechanicsDB = {
    spellblade: [
        { n: "Meteoro Fulminante", trg: "periodic", tVal: 3.0, eff: "meteor", ele: "fire", dmg: 5.0, aoe: 100, desc: "A cada 3s, um Meteoro cai causando dano em área." },
        { n: "Nova Glacial", trg: "on_kill", tVal: 0.3, eff: "nova", ele: "ice", dmg: 2.0, aoe: 150, desc: "30% de chance ao matar de soltar uma Nova de Gelo." },
        { n: "Cadeia de Raios", trg: "on_hit", tVal: 0.15, eff: "chain", ele: "lightning", dmg: 1.5, aoe: 200, desc: "15% de chance de soltar um Raio ao acertar inimigos." },
        { n: "Chuva de Fogo", trg: "periodic", tVal: 5.0, eff: "rain", ele: "fire", dmg: 1.0, aoe: 300, desc: "A cada 5s, chuva de fogo atinge a área." },
        { n: "Estilhaço Perfurante", trg: "on_crit", tVal: 1.0, eff: "projectile", ele: "ice", dmg: 3.0, aoe: 0, desc: "Críticos disparam estilhaços de gelo guiados." }
    ],
    berserker: [
        { n: "Esmagamento Sísmico", trg: "periodic", tVal: 4.0, eff: "quake", ele: "neutral", dmg: 6.0, aoe: 120, desc: "A cada 4s, o chão treme causando alto dano Físico." },
        { n: "Explosão Sanguínea", trg: "on_kill", tVal: 0.5, eff: "nova", ele: "blood", dmg: 3.0, aoe: 90, desc: "50% de chance do inimigo explodir em sangue ao morrer." },
        { n: "Corte Furacão", trg: "on_hit", tVal: 0.1, eff: "slash", ele: "neutral", dmg: 2.0, aoe: 60, desc: "10% de chance de dar um corte extra enorme." },
        { n: "Poça de Sangue", trg: "on_kill", tVal: 0.2, eff: "pool", ele: "blood", dmg: 0.5, aoe: 80, desc: "20% chance de criar uma poça de sangue ao matar." },
        { n: "Investida Brutal", trg: "periodic", tVal: 6.0, eff: "shockwave", ele: "neutral", dmg: 8.0, aoe: 200, desc: "A cada 6s libera uma onda de choque letal." }
    ],
    assassin: [
        { n: "Bomba Tóxica", trg: "periodic", tVal: 3.5, eff: "pool", ele: "poison", dmg: 1.0, aoe: 100, desc: "A cada 3.5s joga uma bomba de veneno duradoura." },
        { n: "Lâmina Fantasma", trg: "on_hit", tVal: 0.2, eff: "projectile", ele: "wind", dmg: 1.5, aoe: 0, desc: "20% de chance de disparar uma adaga perseguidora." },
        { n: "Execução Sombria", trg: "on_crit", tVal: 1.0, eff: "meteor", ele: "poison", dmg: 4.0, aoe: 50, desc: "Acertos críticos criam um pilar de escuridão no alvo." },
        { n: "Névoa Mortal", trg: "on_kill", tVal: 0.25, eff: "nova", ele: "poison", dmg: 2.0, aoe: 120, desc: "Inimigos mortos explodem em uma nuvem de veneno." },
        { n: "Clone das Sombras", trg: "periodic", tVal: 8.0, eff: "slash", ele: "void", dmg: 5.0, aoe: 150, desc: "A cada 8s, um clone corta todos os inimigos próximos." }
    ],
    necromancer: [
        { n: "Explosão de Cadáver", trg: "on_kill", tVal: 0.8, eff: "nova", ele: "blood", dmg: 4.0, aoe: 100, desc: "80% de chance do inimigo explodir causando alto dano." },
        { n: "Espíritos Famintos", trg: "periodic", tVal: 2.0, eff: "projectile", ele: "void", dmg: 1.0, aoe: 0, desc: "A cada 2s libera um espírito que persegue os inimigos." },
        { n: "Gêiser de Ossos", trg: "periodic", tVal: 5.0, eff: "quake", ele: "neutral", dmg: 5.0, aoe: 80, desc: "A cada 5s ossos perfuram os inimigos no centro." },
        { n: "Dreno de Almas", trg: "on_hit", tVal: 0.1, eff: "chain", ele: "void", dmg: 2.0, aoe: 150, desc: "10% de chance de criar uma corrente sugadora." },
        { n: "Praga Pútrida", trg: "on_crit", tVal: 1.0, eff: "pool", ele: "poison", dmg: 0.5, aoe: 100, desc: "Críticos deixam o chão apodrecido dando dano contínuo." }
    ],
    voidwalker: [
        { n: "Buraco Negro", trg: "periodic", tVal: 7.0, eff: "pool", ele: "void", dmg: 2.0, aoe: 150, desc: "A cada 7s cria um buraco negro que destrói quem pisa." },
        { n: "Fenda Espacial", trg: "on_hit", tVal: 0.15, eff: "slash", ele: "void", dmg: 3.0, aoe: 100, desc: "15% de chance de rasgar o espaço ao atacar." },
        { n: "Anomalia", trg: "on_kill", tVal: 0.3, eff: "meteor", ele: "lightning", dmg: 4.0, aoe: 80, desc: "Morte de inimigos invocam tempestades cósmicas." },
        { n: "Estilhaçar o Tempo", trg: "on_crit", tVal: 1.0, eff: "nova", ele: "ice", dmg: 3.0, aoe: 200, desc: "Críticos param o tempo e liberam uma nova gélida." },
        { n: "Colapso Estelar", trg: "periodic", tVal: 10.0, eff: "quake", ele: "void", dmg: 15.0, aoe: 300, desc: "A cada 10s, o universo colapsa na tela." }
    ]
};

// GERADOR DE TEIA COMPLEXA (PROXIMITY GRAPH - PATH OF EXILE STYLE)
const TreeGenerator = {
    generateForClass: (cId) => {
        let cls = ClassesDB.find(c => c.id === cId);
        let nodes = []; let links = []; // Links bidirecionais
        let cx = 1500, cy = 1500; 
        
        // Nó Central
        nodes.push({ id: "start", n: "Despertar: " + cls.n, d: "Início da Teia.", cost: 0, edges: [], x: cx, y: cy, type: "start", mech: null, ele: "neutral" });

        let idCounter = 1; let classMechs = MechanicsDB[cId];
        let rings = [120, 260, 420, 600, 800]; // Expansão do raio da teia

        // PASSO 1: Espalhar 50 nós organicamente em anéis
        for(let r = 0; r < rings.length; r++) {
            let numNodesInRing = 6 + (r * 4); // Mais nós nas bordas
            let angleStep = (Math.PI * 2) / numNodesInRing;

            for(let i = 0; i < numNodesInRing; i++) {
                if (idCounter > 50) break; 
                
                // Adiciona um pequeno ruído (offset) para não ficar um círculo perfeito
                let angleOffset = (Math.random() - 0.5) * 0.3;
                let radOffset = (Math.random() - 0.5) * 40;
                
                let angle = (i * angleStep) + angleOffset; 
                let x = cx + Math.cos(angle) * (rings[r] + radOffset); 
                let y = cy + Math.sin(angle) * (rings[r] + radOffset);

                let baseMech = classMechs[idCounter % classMechs.length]; 
                let powerMult = 1 + (r * 0.4); 

                nodes.push({
                    id: `n_${cId}_${idCounter}`, cost: r < 2 ? 1 : (r < 4 ? 2 : 3), edges: [], 
                    x: x, y: y, type: r === rings.length-1 ? "keystone" : "active",
                    n: `${baseMech.n} ${r>2 ? 'Supremo':'Menor'}`,
                    d: baseMech.desc, 
                    mech: { ...baseMech, dmg: baseMech.dmg * powerMult, aoe: baseMech.aoe * (1+(r*0.1)) },
                    ele: baseMech.ele // Cor visual do nó baseada no elemento da skill
                });
                idCounter++;
            }
        }

        // PASSO 2: Criar a TEIA (Interligar todos os vizinhos próximos)
        // Isso cria os "caminhos" que o jogador pode escolher livremente.
        let connectionDistance = 220; // Distância máxima para ligar dois nós

        for(let i=0; i<nodes.length; i++) {
            for(let j=i+1; j<nodes.length; j++) {
                let n1 = nodes[i]; let n2 = nodes[j];
                let dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
                
                if(dist <= connectionDistance) {
                    n1.edges.push(n2.id); n2.edges.push(n1.id); // Ligação bidirecional
                    
                    // A linha em si contém uma passiva oculta!
                    let statTypes = [ {s:"global_dmg", n:"+10% Dano Global", v:0.1}, {s:"speed", n:"+5% Vel. Ataque", v:0.05}, {s:"crit_c", n:"+5% Chance Crítica", v:0.05} ];
                    let pStat = statTypes[(i+j) % statTypes.length];
                    
                    links.push({
                        id: `link_${n1.id}_${n2.id}`, nA: n1.id, nB: n2.id, 
                        x: (n1.x + n2.x) / 2, y: (n1.y + n2.y) / 2,
                        desc: pStat.n, stat: pStat.s, val: pStat.v
                    });
                }
            }
        }

        return { nodes, links };
    }
};

const GeneratedTrees = {}; ClassesDB.forEach(c => GeneratedTrees[c.id] = TreeGenerator.generateForClass(c.id));

const Game = {
    state: {
        sharedGold: 0, sharedEssence: 0, totalAscensions: 0, unlockedClasses: ["spellblade"], classUnlocks: 0,
        inventory: [{ uid: Utils.uid(), id: "w_0" }], activeCharId: null,
        chars: [ { id: 0, class: "spellblade", level: 1, xp: 0, statPoints: 0, skillPoints: 0, str: 0, agi: 0, ene: 0, enemyLvl: 1, maxEnemies: 1, enemySpd: 0, unlockedSkills: ["start"], weaponUid: null } ],
        lastSave: Date.now()
    },
    runtime: {
        lastFrame: performance.now(), angle: 0, enemies: [], particles: [], texts: [], projectiles: [], groundEffects: [],
        reqXp: 100, maxMana: 100, mana: 100, manaRegen: 5, manaCost: 10, dmg: 1, rps: 1, radius: 80,
        isExhausted: false, spawnTimer: 0, totalSessionXp: 0, xpHistory: [], etaTimer: 0, activeChar: null, weaponMult: 1.0,
        wpnObj: null, treeStats: { global_dmg:0, speed:0, crit_c:0, phys_dmg:0, aoe:0 }, activeMechs: [], mechTimers: {}
    },

    init: () => {
        Game.load();
        if(!Game.state.unlockedClasses) Game.state.unlockedClasses = ["spellblade"];
        if(Game.state.classUnlocks === undefined) Game.state.classUnlocks = 0;
        if(Game.state.chars[0].weaponUid === null) Game.state.chars[0].weaponUid = Game.state.inventory[0].uid;

        UI.buildWorldMap(); Renderer.init(); UI.initDrag();
        requestAnimationFrame(Game.loop); setInterval(Game.save, 5000);
    },

    save: () => { Game.state.lastSave = Date.now(); localStorage.setItem('ts_save_v8', JSON.stringify(Game.state)); },
    load: () => { let saved = localStorage.getItem('ts_save_v8'); if (saved) Object.assign(Game.state, JSON.parse(saved)); },

    unlockClass: (cId) => { if(Game.state.classUnlocks > 0) { Game.state.classUnlocks--; Game.state.unlockedClasses.push(cId); Game.save(); UI.buildWorldMap(); UI.showToast("Classe Desbloqueada!"); } },

    playCharacter: (id) => {
        Game.state.activeCharId = id; Game.runtime.activeChar = Game.state.chars.find(c => c.id === id);
        Game.runtime.mana = 100; Game.runtime.enemies = []; 
        Game.runtime.totalSessionXp = 0; Game.runtime.xpHistory = []; 
        Game.calcStats();
        
        document.getElementById('screen-world').classList.remove('active'); document.getElementById('app-container').classList.add('active');
        setTimeout(Renderer.resize, 10); UI.setTxt('player-name', ClassesDB.find(c => c.id === Game.runtime.activeChar.class).n); UI.update();
    },

    returnToWorld: () => {
        document.getElementById('app-container').classList.remove('active'); document.getElementById('screen-world').classList.add('active');
        Game.state.activeCharId = null; Game.runtime.activeChar = null; UI.buildWorldMap(); Game.save();
    },

    createCharacter: (classId) => {
        let newId = Game.state.chars.length;
        Game.state.chars.push({ id: newId, class: classId, level: 1, xp: 0, statPoints: 0, skillPoints: 0, str: 0, agi: 0, ene: 0, enemyLvl: 1, maxEnemies: 1, enemySpd: 0, unlockedSkills: ["start"], weaponUid: null });
        Game.save(); UI.buildWorldMap(); UI.showToast("Herói Criado!");
    },

    equipWeapon: (uid) => { let c = Game.runtime.activeChar; if(c) { c.weaponUid = uid; Game.calcStats(); Game.save(); UI.update(); UI.showToast("Arma Equipada!"); } },

    dropLoot: (enemyLevel) => {
        if(Math.random() < 0.005) {
            let roll = Math.random(); let dropId = "w_1"; 
            if(roll < 0.1 && enemyLevel > 10) dropId = "w_2"; 
            if(roll < 0.01 && enemyLevel > 30) dropId = "w_3"; 
            Game.state.inventory.push({ uid: Utils.uid(), id: dropId });
            UI.showToast(`✨ DROP: ${WeaponDB.find(w=>w.id===dropId).n}!`); UI.update(); UI.buildWorldMap();
        }
    },

    hasSkill: (id) => Game.runtime.activeChar.unlockedSkills.includes(id),

    // Lógica Grafo PoE: Você pode desbloquear se QUALQUER nó vizinho estiver desbloqueado.
    canUnlockSkill: (id) => {
        if (id === "start") return true; 
        let c = Game.runtime.activeChar; let tree = GeneratedTrees[c.class]; let node = tree.nodes.find(s => s.id === id);
        if (!node) return false; 
        return node.edges.some(adjId => Game.hasSkill(adjId));
    },

    // Lógica Grafo PoE: Você só pode devolver um nó se, ao removê-lo, todos os outros nós ativos ainda puderem chegar ao "start". (Busca em Profundidade / DFS)
    canRefundSkill: (id) => {
        if(id === "start" || !Game.hasSkill(id)) return false; 
        let c = Game.runtime.activeChar; let tree = GeneratedTrees[c.class];
        
        let remainingNodes = c.unlockedSkills.filter(sk => sk !== id);
        if (remainingNodes.length === 0) return true; // Só sobrou o start
        
        let visited = new Set();
        let stack = ["start"];
        
        while(stack.length > 0) {
            let curr = stack.pop();
            if(!visited.has(curr)) {
                visited.add(curr);
                let node = tree.nodes.find(n => n.id === curr);
                // Adiciona vizinhos à stack SE eles fazem parte da teia comprada (remainingNodes)
                node.edges.forEach(adj => {
                    if (remainingNodes.includes(adj) && !visited.has(adj)) {
                        stack.push(adj);
                    }
                });
            }
        }
        
        // Se a quantidade de nós visitados for igual a quantidade de nós restantes, a teia não quebrou.
        return visited.size === remainingNodes.length;
    },

    calcStats: () => {
        let c = Game.runtime.activeChar; let r = Game.runtime; if(!c) return;

        let invItem = Game.state.inventory.find(i => i.uid === c.weaponUid); 
        let wpn = invItem ? WeaponDB.find(w => w.id === invItem.id) : WeaponDB[0];
        
        r.wpnObj = wpn; r.weaponMult = wpn.mult; 
        UI.setTxt('val-weapon-name', wpn.n); document.getElementById('val-weapon-name').style.color = wpn.color;

        r.reqXp = Math.floor(100 * Math.pow(1.4, c.level - 1));
        r.treeStats = { global_dmg:0, speed:0, crit_c:0, phys_dmg:0, aoe:0 }; r.activeMechs = []; 
        
        let tree = GeneratedTrees[c.class];
        c.unlockedSkills.forEach(skId => { let node = tree.nodes.find(n => n.id === skId); if(node && node.mech) { r.activeMechs.push(node.mech); if(node.mech.trg === "periodic" && !r.mechTimers[node.mech.n]) r.mechTimers[node.mech.n] = 0; } });
        tree.links.forEach(link => { if(Game.hasSkill(link.nA) && Game.hasSkill(link.nB)) { if(r.treeStats[link.stat] !== undefined) r.treeStats[link.stat] += link.val; } });

        if(wpn.id === "w_1") r.treeStats.phys_dmg += 0.20;
        if(wpn.id === "w_2") r.treeStats.aoe += 0.30;
        if(wpn.id === "w_3") r.treeStats.crit_c += 0.15;

        r.radius = 80 * (1 + r.treeStats.aoe); 
        r.maxMana = (100 + (c.ene * 15)); r.manaRegen = (5 + (c.ene * 2));
    },

    addXp: (amt) => {
        let c = Game.runtime.activeChar; Game.runtime.totalSessionXp += amt; c.xp += amt; let up = false;
        while(c.xp >= Game.runtime.reqXp) { c.xp -= Game.runtime.reqXp; c.level++; c.statPoints += 20; c.skillPoints++; Game.calcStats(); up = true; }
        if(up) UI.showToast(`Level UP! Ganhou +1 SP!`); UI.update();
    },

    addStat: (attr) => { let c = Game.runtime.activeChar; if (c.statPoints > 0) { c.statPoints--; c[attr]++; Game.calcStats(); UI.update(); } },

    refundSkill: () => {
        let id = Game.runtime.selectedSkill; let c = Game.runtime.activeChar;
        if(Game.canRefundSkill(id)) {
            let tree = GeneratedTrees[c.class]; let skill = tree.nodes.find(s => s.id === id);
            c.unlockedSkills = c.unlockedSkills.filter(sk => sk !== id); c.skillPoints += skill.cost;
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buySkill: () => {
        let id = Game.runtime.selectedSkill; let c = Game.runtime.activeChar; let tree = GeneratedTrees[c.class]; let skill = tree.nodes.find(s => s.id === id);
        if(skill && c.skillPoints >= skill.cost && Game.canUnlockSkill(id)) {
            c.skillPoints -= skill.cost; c.unlockedSkills.push(id);
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buyEnemyLevel: () => { let c = Game.runtime.activeChar; let cost = Utils.calcCost(10, c.enemyLvl - 1, 1.5); if(Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.enemyLvl++; UI.update(); } },
    buyMaxEnemies: () => { let c = Game.runtime.activeChar; let cost = Utils.calcCost(50, c.maxEnemies - 1, 2.5); if(c.maxEnemies < 30 && Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.maxEnemies++; UI.update(); } },
    buyEnemySpeed: () => { let c = Game.runtime.activeChar; let cost = Utils.calcCost(100, c.enemySpd, 1.8); if(Game.state.sharedGold >= cost) { Game.state.sharedGold -= cost; c.enemySpd++; UI.update(); } },

    spawnEnemy: () => {
        let c = Game.runtime.activeChar; let hp = 20 * Math.pow(1.4, c.enemyLvl);
        let a = Math.random() * Math.PI * 2; let d = 150 + Math.random() * 50; let isElite = Math.random() > 0.8; if(isElite) hp *= 3;
        Game.runtime.enemies.push({ id: Math.random(), hp: hp, maxHp: hp, x: Math.cos(a)*d, y: Math.sin(a)*d, flash: 0, isElite: isElite });
    },

    triggerMechanic: (mech, targetEnemy = null) => {
        let r = Game.runtime; let pDmg = r.dmg * mech.dmg;
        if (mech.eff === "meteor" || mech.eff === "quake") {
            let tx = targetEnemy ? targetEnemy.x : (Math.random() - 0.5) * 200; let ty = targetEnemy ? targetEnemy.y : (Math.random() - 0.5) * 200;
            r.groundEffects.push({ x: tx, y: ty, r: mech.aoe, life: 0.5, max: 0.5, type: mech.eff, ele: mech.ele });
            r.enemies.forEach(en => { if(Math.hypot(en.x - tx, en.y - ty) <= mech.aoe) Game.hitEnemy(en, pDmg, false, true); });
        } else if (mech.eff === "nova" || mech.eff === "shockwave") {
            let tx = targetEnemy ? targetEnemy.x : 0; let ty = targetEnemy ? targetEnemy.y : 0;
            r.groundEffects.push({ x: tx, y: ty, r: mech.aoe, life: 0.4, max: 0.4, type: "nova", ele: mech.ele });
            r.enemies.forEach(en => { if(Math.hypot(en.x - tx, en.y - ty) <= mech.aoe) Game.hitEnemy(en, pDmg, false, true); });
        } else if (mech.eff === "projectile" || mech.eff === "chain") {
            if(!targetEnemy && r.enemies.length > 0) targetEnemy = r.enemies[Math.floor(Math.random()*r.enemies.length)];
            if(targetEnemy) { r.projectiles.push({ x: 0, y: 0, tx: targetEnemy.x, ty: targetEnemy.y, speed: 500, dmg: pDmg, life: 1.5, ele: mech.ele, target: targetEnemy }); }
        } else if (mech.eff === "pool") {
            let tx = targetEnemy ? targetEnemy.x : (Math.random() - 0.5) * 200; let ty = targetEnemy ? targetEnemy.y : (Math.random() - 0.5) * 200;
            r.groundEffects.push({ x: tx, y: ty, r: mech.aoe, life: 5.0, max: 5.0, type: "pool", ele: mech.ele, dmg: pDmg * 0.2 });
        }
    },

    hitEnemy: (e, dmg, isCrit = false, isProc = false) => {
        if(e.hp <= 0) return; let r = Game.runtime;
        dmg *= (0.85 + (Math.random() * 0.30)); if(isCrit) dmg *= 1.5;
        e.hp -= dmg; e.flash = 0.1;
        let textScale = isCrit ? 1.3 : 0.85; let cColor = isCrit ? "#ff1100" : (Math.random() > 0.5 ? "#ffffff" : "#ffffaa");
        r.texts.push({ x: e.x + (Math.random()*30-15), y: e.y - 20, txt: isCrit ? `CRIT! ${Utils.format(dmg)}` : Utils.format(dmg), life: 1.0, maxLife: 1.0, scale: textScale, color: cColor, vx: (Math.random() - 0.5) * 60, vy: -50 - (Math.random() * 40) });
        
        if(!isProc) {
            r.activeMechs.forEach(m => {
                if(m.trg === "on_hit" && Math.random() < m.tVal) Game.triggerMechanic(m, e);
                if(m.trg === "on_crit" && isCrit && Math.random() < m.tVal) Game.triggerMechanic(m, e);
            });
        }

        if (e.hp <= 0) {
            r.enemies = r.enemies.filter(en => en.id !== e.id); let c = r.activeChar;
            let g = 1 * Math.pow(1.4, c.enemyLvl) * (1 + c.enemySpd * 0.8); let x = 15 * Math.pow(1.4, c.enemyLvl);
            if(e.isElite) { g *= 3; x *= 3; }
            Game.state.sharedGold += g; Game.addXp(x); Game.dropLoot(c.enemyLvl); 
            Renderer.createExplosion(e.x, e.y, e.isElite ? "#ff2a4b" : "#00aaff");
            r.activeMechs.forEach(m => { if(m.trg === "on_kill" && Math.random() < m.tVal) Game.triggerMechanic(m, e); });
        }
    },

    prestige: () => {
        let c = Game.runtime.activeChar; if (c.level < 50) return; let ess = Math.floor(c.level / 10);
        if (confirm(`Ascender este herói concederá +${ess} Essências e +1 Ponto de Classe. O Nível, Atributos e Skills dele serão totalmente zerados!`)) {
            Game.state.sharedEssence += ess; Game.state.totalAscensions++; Game.state.classUnlocks++;
            c.level = 1; c.xp = 0; c.statPoints = 0; c.str = 0; c.agi = 0; c.ene = 0; c.enemyLvl = 1; c.maxEnemies = 1; c.enemySpd = 0; c.skillPoints = 0; c.unlockedSkills = ["start"]; 
            Game.runtime.enemies = []; Game.calcStats(); Game.save(); Game.returnToWorld();
        }
    },

    loop: (time) => {
        if(!document.getElementById('app-container').classList.contains('active')) return requestAnimationFrame(Game.loop);
        let dt = Math.min((time - Game.runtime.lastFrame) / 1000, 0.1); Game.runtime.lastFrame = time;
        let c = Game.runtime.activeChar; let r = Game.runtime;

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

        r.spawnTimer -= dt; if (r.enemies.length < c.maxEnemies && r.spawnTimer <= 0) { Game.spawnEnemy(); r.spawnTimer = 0.2; }

        let baseCostRed = 1 / (1 + (c.ene * 0.02));
        let bDmg = (1 + (c.str * 0.5) + Math.pow(c.str, 1.2) * 0.1) * r.weaponMult * (1 + r.treeStats.global_dmg + r.treeStats.phys_dmg);
        let bSpd = (1 + (c.agi * 0.05)) * (1 + r.treeStats.speed);
        let mult = 1 + (Game.state.sharedEssence * 0.1);

        r.manaCost = (10 * bSpd) * baseCostRed;
        if (r.mana <= 0) r.isExhausted = true; if (r.mana >= r.maxMana * 0.2) r.isExhausted = false;
        if (r.isExhausted) { r.dmg = (bDmg * 0.1) * mult; r.rps = bSpd * 0.3; } else { r.dmg = bDmg * mult; r.rps = bSpd; r.mana -= r.manaCost * dt; }

        r.mana += r.manaRegen * dt; if (r.mana > r.maxMana) r.mana = r.maxMana; if (r.mana < 0) r.mana = 0;

        let rotDelta = (r.rps * Math.PI * 2) * dt; let prevAngle = r.angle; r.angle = (r.angle + rotDelta) % (Math.PI * 2); let baseSpd = 20 * (1 + c.enemySpd * 0.2);

        r.activeMechs.forEach(m => {
            if(m.trg === "periodic") { r.mechTimers[m.n] -= dt; if(r.mechTimers[m.n] <= 0) { Game.triggerMechanic(m, r.enemies[Math.floor(Math.random()*r.enemies.length)]); r.mechTimers[m.n] = m.tVal; } }
        });

        r.groundEffects.forEach(gf => { gf.life -= dt; if(gf.type === "pool") { r.enemies.forEach(en => { if(Math.hypot(en.x - gf.x, en.y - gf.y) <= gf.r) Game.hitEnemy(en, gf.dmg * dt, false, true); }); } });
        r.groundEffects = r.groundEffects.filter(gf => gf.life > 0);

        r.projectiles.forEach(p => {
            p.life -= dt; if(!p.target || p.target.hp <= 0) { p.life = 0; return; }
            let dx = p.target.x - p.x; let dy = p.target.y - p.y; let dist = Math.hypot(dx, dy);
            if(dist < p.speed * dt) { Game.hitEnemy(p.target, p.dmg, false, true); p.life = 0; } else { p.x += (dx/dist) * p.speed * dt; p.y += (dy/dist) * p.speed * dt; }
        });
        r.projectiles = r.projectiles.filter(p => p.life > 0);

        r.enemies.forEach(e => {
            if (e.flash > 0) e.flash -= dt; let dist = Math.hypot(e.x, e.y); let moveSpd = baseSpd; if(moveSpd < 5) moveSpd = 5;
            if (dist > 30) { e.x -= (e.x/dist) * moveSpd * dt; e.y -= (e.y/dist) * moveSpd * dt; }
            
            if (dist <= r.radius + 10) {
                let eAngle = Math.atan2(e.y, e.x); if (eAngle < 0) eAngle += Math.PI * 2; let hit = false;
                if (prevAngle < r.angle) { if (eAngle >= prevAngle && eAngle <= r.angle) hit = true; } else { if (eAngle >= prevAngle || eAngle <= r.angle) hit = true; }
                let rots = Math.floor(rotDelta / (Math.PI * 2)); let hits = (hit ? 1 : 0) + rots;
                if (hits > 0) Game.hitEnemy(e, r.dmg * hits, Math.random() < (0.1 + r.treeStats.crit_c));
            }
        });

        r.texts.forEach(t => { t.x += t.vx * dt; t.y += t.vy * dt; t.life -= dt; }); r.texts = r.texts.filter(t => t.life > 0);
        r.particles.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.life -= dt; }); r.particles = r.particles.filter(p => p.life > 0);

        Renderer.draw(); UI.update(); requestAnimationFrame(Game.loop);
    }
};

const Renderer = {
    canvas: null, ctx: null, w: 0, h: 0,
    init: () => { Renderer.canvas = document.getElementById('gameCanvas'); Renderer.ctx = Renderer.canvas.getContext('2d'); window.addEventListener('resize', Renderer.resize); },
    resize: () => { let p = Renderer.canvas.parentElement; if(p && p.clientWidth > 0 && p.clientHeight > 0) { Renderer.w = p.clientWidth; Renderer.h = p.clientHeight; Renderer.canvas.width = Renderer.w; Renderer.canvas.height = Renderer.h; } },
    createExplosion: (x, y, color) => { for(let i=0; i<15; i++) { let a = Math.random() * Math.PI * 2; let s = Math.random() * 60 + 20; Game.runtime.particles.push({ x: x, y: y, vx: Math.cos(a)*s, vy: Math.sin(a)*s, life: 0.5, max: 0.5, c: color }); } },
    draw: () => {
        if(Renderer.w === 0) { Renderer.resize(); if(Renderer.w === 0) return; }
        let ctx = Renderer.ctx; let cx = Renderer.w / 2; let cy = Renderer.h / 2 - 50; ctx.clearRect(0, 0, Renderer.w, Renderer.h);

        ctx.globalCompositeOperation = "lighter";
        Game.runtime.groundEffects.forEach(gf => {
            ctx.save(); ctx.translate(cx + gf.x, cy + gf.y); let c = Elements[gf.ele].color;
            if (gf.type === "meteor" || gf.type === "quake") { let progress = 1 - (gf.life / gf.max); ctx.beginPath(); ctx.arc(0, 0, gf.r * progress, 0, Math.PI*2); ctx.fillStyle = c + "55"; ctx.fill(); ctx.strokeStyle = c; ctx.lineWidth = 2; ctx.stroke(); } 
            else if (gf.type === "nova") { let progress = 1 - (gf.life / gf.max); ctx.beginPath(); ctx.arc(0, 0, gf.r * progress, 0, Math.PI*2); ctx.strokeStyle = c; ctx.lineWidth = 5 * (1-progress); ctx.stroke(); } 
            else if (gf.type === "pool") { ctx.beginPath(); ctx.arc(0, 0, gf.r, 0, Math.PI*2); ctx.fillStyle = c + "33"; ctx.fill(); ctx.strokeStyle = c + "88"; ctx.lineWidth = 1; ctx.stroke(); }
            ctx.restore();
        });

        Game.runtime.particles.forEach(p => { ctx.fillStyle = p.c; ctx.globalAlpha = p.life/p.max; ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2, 0, Math.PI*2); ctx.fill(); });
        Game.runtime.projectiles.forEach(p => { ctx.fillStyle = Elements[p.ele].color; ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle; ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 5, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0; });
        ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";

        Game.runtime.enemies.forEach(e => {
            ctx.save(); ctx.translate(cx + e.x, cy + e.y); let eColor = e.isElite ? "#ff2a4b" : "#00aaff";
            ctx.shadowBlur = e.flash > 0 ? 15 : 5; ctx.shadowColor = e.flash > 0 ? "#fff" : eColor; ctx.fillStyle = e.flash > 0 ? "#fff" : "#111"; ctx.strokeStyle = e.flash > 0 ? "#fff" : eColor;
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, e.isElite ? 16 : 12, 0, Math.PI*2); ctx.fill(); ctx.stroke(); ctx.shadowBlur = 0;
            let hpPercent = Math.max(0, e.hp / e.maxHp); ctx.fillStyle = "#000"; ctx.fillRect(-12, -22, 24, 4); ctx.fillStyle = hpPercent > 0.5 ? "#00ff66" : (hpPercent > 0.25 ? "#ffcc00" : "#ff2a4b"); ctx.fillRect(-12, -22, 24 * hpPercent, 4); ctx.restore();
        });

        ctx.shadowBlur = 15; ctx.shadowColor = Game.runtime.isExhausted ? "#ff2a4b" : "#00aaff"; ctx.fillStyle = "#fff"; ctx.beginPath(); ctx.arc(cx, cy, 10, 0, Math.PI*2); ctx.fill(); ctx.shadowBlur = 0;
        
        ctx.save(); ctx.translate(cx, cy); ctx.rotate(Game.runtime.angle); 
        let r = Game.runtime.radius; let wpn = Game.runtime.wpnObj || WeaponDB[0]; let baseColor = Game.runtime.isExhausted ? "rgba(255,42,75,0.5)" : wpn.color;
        ctx.strokeStyle = baseColor; ctx.shadowBlur = 15; ctx.shadowColor = baseColor;

        if(wpn.draw === "scythe") {
            ctx.lineWidth = wpn.thick; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/2, Math.PI/4); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(Math.cos(Math.PI/4)*r, Math.sin(Math.PI/4)*r); ctx.lineTo(0, 0); ctx.stroke();
        } else if(wpn.draw === "katana") {
            ctx.lineWidth = wpn.thick; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/6, Math.PI/6); ctx.stroke();
        } else if(wpn.draw === "sword") {
            ctx.lineWidth = wpn.thick; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r, Math.PI - Math.PI/4, Math.PI + Math.PI/4); ctx.stroke();
        } else {
            ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4); ctx.stroke();
            ctx.beginPath(); ctx.arc(0, 0, r - 5, Math.PI - Math.PI/4, Math.PI + Math.PI/4); ctx.stroke();
        }
        ctx.restore();

        ctx.font = "900 16px 'Rajdhani'"; ctx.textAlign = "center";
        Game.runtime.texts.forEach(t => {
            ctx.save(); ctx.translate(cx + t.x, cy + t.y); let currentScale = t.scale * (1 + (1 - t.life/t.maxLife) * 0.3); ctx.scale(currentScale, currentScale); ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
            ctx.lineWidth = 3; ctx.strokeStyle = "#000"; ctx.strokeText(t.txt, 0, 0); ctx.fillStyle = t.color; ctx.fillText(t.txt, 0, 0); ctx.restore();
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
        UI.setTxt('global-gold', Utils.format(Game.state.sharedGold)); UI.setTxt('global-essence', Utils.format(Game.state.sharedEssence)); UI.setTxt('global-unlocks', Game.state.classUnlocks || 0);
        let charHtml = '';
        ClassesDB.forEach(cdb => {
            let existingChar = Game.state.chars.find(c => c.class === cdb.id); let isUnlocked = Game.state.unlockedClasses.includes(cdb.id);
            if(existingChar) { charHtml += `<div class="char-card" onclick="Game.playCharacter(${existingChar.id})"><div class="char-info"><h3>${cdb.n}</h3><p>Nível ${existingChar.level}</p></div><button class="btn-play">JOGAR</button></div>`; } 
            else if(isUnlocked) { charHtml += `<div class="char-card" onclick="Game.createCharacter('${cdb.id}')"><div class="char-info"><h3>${cdb.n}</h3><p style="color:#888;">${cdb.desc}</p></div><button class="btn-play" style="background:var(--neon-green);">CRIAR</button></div>`; } 
            else { if(Game.state.classUnlocks > 0) { charHtml += `<div class="char-card" onclick="Game.unlockClass('${cdb.id}')"><div class="char-info"><h3>${cdb.n}</h3><p style="color:var(--neon-gold);">Clique para Desbloquear</p></div><button class="btn-play" style="background:var(--neon-gold); color:#000;">DESBLOQUEAR</button></div>`; } else { charHtml += `<div class="char-card locked"><div class="char-info"><h3>${cdb.n}</h3><p style="color:#888;">Requer 1 Ponto de Ascensão</p></div></div>`; } }
        });
        document.getElementById('char-grid').innerHTML = charHtml;

        let invHtml = '';
        Game.state.inventory.forEach(item => { let w = WeaponDB.find(w => w.id === item.id); invHtml += `<div class="inv-slot rarity-${w.rarity}" onclick="UI.showWeaponDetails('${item.uid}', true)" title="${w.n}">🗡️</div>`; });
        let glGrid = document.getElementById('global-inventory-grid'); if(glGrid) glGrid.innerHTML = invHtml;
    },

    showWeaponDetails: (uid, isWorldView = false) => {
        let item = Game.state.inventory.find(i => i.uid === uid); let w = WeaponDB.find(w => w.id === item.id);
        UI.setTxt('modal-wpn-title', w.n); document.getElementById('modal-wpn-title').style.color = w.color;
        UI.setTxt('modal-wpn-desc', w.desc); UI.setTxt('modal-wpn-stats', `Multiplicador de Dano: ${w.mult}x\nPassiva da Arma: ${w.unique}`);
        
        let btn = document.getElementById('btn-equip-weapon'); 
        if(isWorldView) { btn.style.display = "none"; } else { btn.style.display = "block"; btn.onclick = () => { Game.equipWeapon(uid); UI.closeModal('weapon-details-modal'); }; }
        document.getElementById('weapon-details-modal').style.display = 'flex';
    },

    switchTab: (id, el) => {
        let targetTab = document.getElementById(`tab-${id}`); let isAlreadyActive = targetTab.classList.contains('active') && document.getElementById('main-content').classList.contains('open');
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active')); document.querySelectorAll('.nav-item').forEach(t => t.classList.remove('active'));
        document.getElementById('app-container').classList.remove('skills-active'); document.getElementById('main-content').classList.remove('open'); document.getElementById('app-container').classList.remove('menu-open');

        if (!isAlreadyActive) {
            targetTab.classList.add('active'); el.classList.add('active'); document.getElementById('main-content').classList.add('open'); document.getElementById('app-container').classList.add('menu-open');
            if(id === 'skills') { document.getElementById('app-container').classList.add('skills-active'); UI.rebuildSkillTree(); setTimeout(() => { let vp = document.getElementById('tree-viewport'); vp.scrollLeft = 1500 - vp.clientWidth / 2; vp.scrollTop = 1500 - vp.clientHeight / 2; }, 50); }
        }
    },
    
    showToast: (msg) => { let c = document.getElementById('toast-container'); let t = document.createElement('div'); t.className = 'toast'; t.innerText = msg; c.appendChild(t); setTimeout(() => t.remove(), 2500); },
    setTxt: (id, text) => { const el = document.getElementById(id); if (el) el.innerText = text; },

    // Renderiza a Nova Teia (PoE Graph)
    rebuildSkillTree: () => {
        let c = Game.runtime.activeChar; if(!c) return;
        let tree = GeneratedTrees[c.class]; let container = document.getElementById('skill-tree-container');
        
        let svgHtml = `<svg width="100%" height="100%" style="position:absolute; top:0; left:0; z-index:1;">`;
        tree.links.forEach(link => {
            let nA = tree.nodes.find(n => n.id === link.nA); let nB = tree.nodes.find(n => n.id === link.nB);
            if(nA && nB) {
                let isUnlocked = Game.hasSkill(nA.id) && Game.hasSkill(nB.id);
                let color = isUnlocked ? 'var(--neon-gold)' : '#222';
                let width = isUnlocked ? 3 : 1;
                svgHtml += `<line x1="${nA.x}px" y1="${nA.y}px" x2="${nB.x}px" y2="${nB.y}px" stroke="${color}" stroke-width="${width}" />`;
            }
        });
        svgHtml += `</svg>`;

        let nodesHtml = '';
        tree.links.forEach(link => {
            let isActive = Game.hasSkill(link.nA) && Game.hasSkill(link.nB);
            let cl = isActive ? 'synergy-node active' : 'synergy-node';
            nodesHtml += `<div class="${cl}" style="left:${link.x}px; top:${link.y}px;" onclick="UI.showSynergyModal('${link.id}')"></div>`;
        });

        tree.nodes.forEach(s => {
            let isUnlocked = Game.hasSkill(s.id); let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);
            let elColor = Elements[s.ele].color; // COR BASEADA NO ELEMENTO DA SKILL
            let extraClass = s.type === "start" ? "start-node" : (s.type === "keystone" ? "ultimate" : "");
            let styleColor = isUnlocked ? elColor : (canUnlock ? elColor : '#333');
            let isLocked = !isUnlocked && !canUnlock;
            let classLock = isUnlocked ? 'unlocked' : (canUnlock ? 'can-unlock' : 'locked');
            nodesHtml += `<div class="tree-node ${extraClass} ${classLock}" style="left: ${s.x}px; top: ${s.y}px; --node-color: ${styleColor};" onclick="UI.showSkillModal('${s.id}')"></div>`;
        });
        container.innerHTML = svgHtml + nodesHtml;
    },

    showSkillModal: (id) => {
        let c = Game.runtime.activeChar; let tree = GeneratedTrees[c.class]; let s = tree.nodes.find(sk => sk.id === id); if(!s) return;
        
        Game.runtime.selectedSkill = id;
        UI.setTxt('modal-skill-title', s.n); document.getElementById('modal-skill-title').style.color = Elements[s.ele].color;
        UI.setTxt('modal-skill-desc', s.d);
        
        let btn = document.getElementById('btn-learn-skill'); let btnRef = document.getElementById('btn-refund-skill'); let costEl = document.getElementById('modal-skill-cost');
        btn.style.display = "none"; btnRef.style.display = "none";

        let isUnlocked = Game.hasSkill(s.id); let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);
        if (isUnlocked) {
            costEl.innerText = "Poder Adquirido."; costEl.style.color = "var(--neon-green)";
            if (Game.canRefundSkill(s.id)) btnRef.style.display = "block";
        } else if (canUnlock) {
            costEl.innerText = `Custo: ${s.cost} SP`; costEl.style.color = "var(--neon-gold)";
            btn.style.display = "block"; btn.innerText = "Aprender"; btn.disabled = c.skillPoints < s.cost;
        } else {
            costEl.innerText = "Requer conexão adjacente."; costEl.style.color = "var(--text-muted)";
        }
        document.getElementById('skill-modal').style.display = 'flex';
    },

    showSynergyModal: (id) => {
        let c = Game.runtime.activeChar; let tree = GeneratedTrees[c.class];
        let syn = tree.links.find(s => s.id === id); if(!syn) return;

        UI.setTxt('modal-skill-title', "Passiva de Rota"); document.getElementById('modal-skill-title').style.color = "#fff";
        UI.setTxt('modal-skill-desc', `Efeito: ${syn.desc}\n\nAtivada automaticamente ao desbloquear os dois poderes adjacentes desta linha.`);

        let btnLearn = document.getElementById('btn-learn-skill'); let btnRef = document.getElementById('btn-refund-skill'); let costEl = document.getElementById('modal-skill-cost');
        btnLearn.style.display = "none"; btnRef.style.display = "none";

        let isActive = Game.hasSkill(syn.nA) && Game.hasSkill(syn.nB);
        if(isActive) { costEl.innerText = "Passiva Ativa!"; costEl.style.color = "var(--neon-gold)"; } 
        else { costEl.innerText = "Inativa."; costEl.style.color = "var(--text-muted)"; }
        document.getElementById('skill-modal').style.display = 'flex';
    },
    
    closeModal: (id) => { document.getElementById(id).style.display = 'none'; },

    update: () => {
        let c = Game.runtime.activeChar; let r = Game.runtime; if(!c) return;

        let equippedUids = Game.state.chars.filter(ch => ch.id !== c.id && ch.weaponUid !== null).map(ch => ch.weaponUid);
        let invHtml = '';
        Game.state.inventory.forEach(item => {
            if(equippedUids.includes(item.uid)) return; 
            let w = WeaponDB.find(w => w.id === item.id); let isEq = c.weaponUid === item.uid;
            invHtml += `<div class="inv-slot rarity-${w.rarity} ${isEq?'equipped':''}" onclick="UI.showWeaponDetails('${item.uid}')" title="${w.n}">🗡️</div>`;
        });
        let grid = document.getElementById('game-inventory-grid'); if(grid) grid.innerHTML = invHtml;

        UI.setTxt('val-level', c.level); UI.setTxt('val-gold', Utils.format(Game.state.sharedGold)); UI.setTxt('val-essence', Utils.format(Game.state.sharedEssence));
        document.getElementById('mini-xp-fill').style.width = `${(c.xp / r.reqXp) * 100}%`;
        
        UI.setTxt('ov-str', c.str); UI.setTxt('ov-ene', c.ene); UI.setTxt('ov-agi', c.agi);
        UI.setTxt('val-pts-side', c.statPoints); UI.setTxt('val-pts-main', c.statPoints);
        
        let dps = r.dmg * (r.rps * 2) * c.maxEnemies; UI.setTxt('ov-dps', Utils.format(dps)); 
        UI.setTxt('ov-mana-regen', r.manaRegen.toFixed(1)); UI.setTxt('ov-cost', r.manaCost.toFixed(1));
        
        UI.setTxt('val-mana-txt', `${Math.floor(r.mana)} / ${Math.floor(r.maxMana)}`); document.getElementById('bar-mana').style.width = `${(r.mana / r.maxMana) * 100}%`;
        UI.setTxt('val-level-bar', c.level); UI.setTxt('val-xp-txt', `${Utils.format(c.xp)} / ${Utils.format(r.reqXp)}`); document.getElementById('bar-xp').style.width = `${(c.xp / r.reqXp) * 100}%`;

        UI.setTxt('card-str', c.str); UI.setTxt('card-ene', c.ene); UI.setTxt('card-agi', c.agi);
        ['str', 'ene', 'agi'].forEach(a => document.getElementById(`btn-add-${a}`).disabled = c.statPoints <= 0);

        UI.setTxt('upg-lvl-val', c.enemyLvl); let cLvl = Utils.calcCost(10, c.enemyLvl - 1, 1.5); UI.setTxt('cost-lvl', Utils.format(cLvl)); document.getElementById('btn-upg-lvl').disabled = Game.state.sharedGold < cLvl;
        UI.setTxt('upg-max-val', c.maxEnemies); let cMax = Utils.calcCost(50, c.maxEnemies - 1, 2.5); let bMax = document.getElementById('btn-upg-max'); if(c.maxEnemies >= 30) { bMax.innerText = "MÁX"; bMax.disabled = true; } else { UI.setTxt('cost-max', Utils.format(cMax)); bMax.disabled = Game.state.sharedGold < cMax; }
        UI.setTxt('upg-spd-val', c.enemySpd); let cSpd = Utils.calcCost(100, c.enemySpd, 1.8); UI.setTxt('cost-spd', Utils.format(cSpd)); document.getElementById('btn-upg-spd').disabled = Game.state.sharedGold < cSpd;
        
        UI.setTxt('val-sp', c.skillPoints); UI.setTxt('val-pending-essence', Math.floor(c.level / 10)); document.getElementById('btn-do-prestige').disabled = c.level < 50;
    }
};

window.onload = Game.init;