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

const SkillTreeData = [
    { id: "start", el: "neutral", n: "Despertar", d: "O início da sua jornada.", cost: 0, req: null, x: 1000, y: 1000 },
    // FOGO
    { id: "f1", el: "fire", n: "Lâmina Aquecida", d: "+10% Dano Base.", cost: 1, req: ["start"], x: 1100, y: 900 },
    { id: "f2", el: "fire", n: "Queimadura", d: "Inimigos queimam (5% dano/s por 3s).", cost: 1, req: ["f1", "p2"], x: 1200, y: 800 },
    { id: "f3", el: "fire", n: "Brasas", d: "10% chance de soltar faíscas em área.", cost: 2, req: ["f2"], x: 1150, y: 650 },
    { id: "f4", el: "fire", n: "Fúria Ígnea", d: "Menos Mana = Mais Dano (até +50%).", cost: 2, req: ["f2"], x: 1350, y: 850 },
    { id: "f5", el: "fire", n: "Explosão Menor", d: "20% chance de inimigos explodirem ao morrer.", cost: 3, req: ["f3"], x: 1250, y: 500 },
    { id: "f6", el: "fire", n: "Rastro de Cinzas", d: "Deixa fogo no chão que queima inimigos.", cost: 3, req: ["f4"], x: 1500, y: 750 },
    { id: "f7", el: "fire", n: "Coração de Magma", d: "+50% Dano Crítico contra alvos queimando.", cost: 4, req: ["f5"], x: 1400, y: 400 },
    { id: "f8", el: "fire", n: "Onda de Calor", d: "A cada 10 giros, emite onda que empurra inimigos.", cost: 4, req: ["f6"], x: 1650, y: 600 },
    { id: "f9", el: "fire", n: "Incinerar", d: "Dobro de dano em inimigos com <20% HP.", cost: 5, req: ["f7", "f8"], x: 1600, y: 300 },
    { id: "f10", el: "fire", n: "Inferno Rotacional", d: "Lâmina de fogo permanente. Explosões em críticos.", cost: 10, req: ["f9"], x: 1800, y: 200 },
    // GELO
    { id: "i1", el: "ice", n: "Toque Gélido", d: "Inimigos ficam 10% mais lentos.", cost: 1, req: ["start"], x: 900, y: 900 },
    { id: "i2", el: "ice", n: "Frio Cortante", d: "+15% Dano contra inimigos lentos.", cost: 1, req: ["i1", "p2"], x: 800, y: 800 },
    { id: "i3", el: "ice", n: "Estilhaços", d: "15% chance de disparar 3 estilhaços de gelo.", cost: 2, req: ["i2"], x: 850, y: 650 },
    { id: "i4", el: "ice", n: "Congelamento", d: "5% chance de congelar o inimigo por 2s.", cost: 2, req: ["i2"], x: 650, y: 850 },
    { id: "i5", el: "ice", n: "Armadura de Gelo", d: "-10% Custo de Mana se houver inimigos congelados.", cost: 3, req: ["i3"], x: 750, y: 500 },
    { id: "i6", el: "ice", n: "Nevasca", d: "A cada 5s, reduz a velocidade de todos em 30%.", cost: 3, req: ["i4"], x: 500, y: 750 },
    { id: "i7", el: "ice", n: "Quebrar Gelo", d: "Acertar alvo congelado causa 300% de dano.", cost: 4, req: ["i5"], x: 600, y: 400 },
    { id: "i8", el: "ice", n: "Aura Gélida", d: "Inimigos próximos perdem 5% HP/s.", cost: 4, req: ["i6"], x: 350, y: 600 },
    { id: "i9", el: "ice", n: "Cristalização", d: "Inimigos congelados mortos dão +20% Ouro.", cost: 5, req: ["i7", "i8"], x: 400, y: 300 },
    { id: "i10", el: "ice", n: "Zero Absoluto", d: "Anel de gelo sólido. Inimigos nascem com 50% lentidão.", cost: 10, req: ["i9"], x: 200, y: 200 },
    // RAIO
    { id: "l1", el: "lightning", n: "Fagulha", d: "+10% Velocidade de Rotação.", cost: 1, req: ["start"], x: 1100, y: 1100 },
    { id: "l2", el: "lightning", n: "Arco Elétrico", d: "20% chance do dano pular para 1 inimigo.", cost: 1, req: ["l1", "f2"], x: 1200, y: 1200 },
    { id: "l3", el: "lightning", n: "Sobrecarga", d: "+30% Mana Máxima.", cost: 2, req: ["l2"], x: 1150, y: 1350 },
    { id: "l4", el: "lightning", n: "Condutor", d: "Cada pulo elétrico aumenta a Rotação em 1%.", cost: 2, req: ["l2"], x: 1350, y: 1150 },
    { id: "l5", el: "lightning", n: "Tempestade Estática", d: "A cada 15 giros, um raio cai no inimigo mais forte.", cost: 3, req: ["l3"], x: 1250, y: 1500 },
    { id: "l6", el: "lightning", n: "Choque Crítico", d: "Críticos têm 100% chance de gerar Arco Elétrico.", cost: 3, req: ["l4"], x: 1500, y: 1250 },
    { id: "l7", el: "lightning", n: "Alta Tensão", d: "O dano do Arco Elétrico aumenta +10% para cada RPS.", cost: 4, req: ["l5"], x: 1400, y: 1600 }, // Nova Skill Reformulada
    { id: "l8", el: "lightning", n: "Curto-Circuito", d: "10% chance de atordoar inimigos atingidos por raios.", cost: 4, req: ["l6"], x: 1650, y: 1400 },
    { id: "l9", el: "lightning", n: "Bateria Viva", d: "+50% Regen de Mana na velocidade máxima.", cost: 5, req: ["l7", "l8"], x: 1600, y: 1700 },
    { id: "l10", el: "lightning", n: "Deus do Trovão", d: "Feixe de luz. Arcos pulam infinitamente.", cost: 10, req: ["l9"], x: 1800, y: 1800 },
    // VENTO
    { id: "w1", el: "wind", n: "Brisa Leve", d: "+10% Raio de Alcance.", cost: 1, req: ["start"], x: 900, y: 1100 },
    { id: "w2", el: "wind", n: "Lâmina de Vento", d: "10% chance de disparar lâmina reta perfurante.", cost: 1, req: ["w1", "i2"], x: 800, y: 1200 },
    { id: "w3", el: "wind", n: "Aerodinâmica", d: "-20% Custo de Mana da rotação.", cost: 2, req: ["w2"], x: 850, y: 1350 },
    { id: "w4", el: "wind", n: "Tornado Menor", d: "A cada 20 giros, cria um mini-tornado.", cost: 2, req: ["w2"], x: 650, y: 1150 },
    { id: "w5", el: "wind", n: "Vácuo", d: "Inimigos são puxados lentamente para a lâmina.", cost: 3, req: ["w3"], x: 750, y: 1500 },
    { id: "w6", el: "wind", n: "Corte Duplo", d: "15% chance de acertar duas vezes no mesmo frame.", cost: 3, req: ["w4"], x: 500, y: 1250 },
    { id: "w7", el: "wind", n: "Vendaval", d: "+20% Rotação se houver >5 inimigos na tela.", cost: 4, req: ["w5"], x: 600, y: 1600 },
    { id: "w8", el: "wind", n: "Lâmina Fantasma", d: "Lâminas de vento agora perseguem inimigos.", cost: 4, req: ["w6"], x: 350, y: 1400 },
    { id: "w9", el: "wind", n: "Fôlego Inesgotável", d: "Sem Mana? Gira a 50% da velocidade por 5s grátis.", cost: 5, req: ["w7", "w8"], x: 400, y: 1700 },
    { id: "w10", el: "wind", n: "Furacão Devastador", d: "Tornado verde gigante. Dobra alcance e puxa todos.", cost: 10, req: ["w9"], x: 200, y: 1800 },
    // VENENO
    { id: "p1", el: "poison", n: "Lâmina Tóxica", d: "Inimigos envenenados perdem 2% HP Max/s.", cost: 1, req: ["start"], x: 1000, y: 800 },
    { id: "p2", el: "poison", n: "Corrosão", d: "Inimigos envenenados recebem +15% Dano Base.", cost: 1, req: ["p1"], x: 1000, y: 650 },
    { id: "p3", el: "poison", n: "Nuvem de Gás", d: "Inimigos mortos deixam nuvem tóxica.", cost: 2, req: ["p2", "i3"], x: 900, y: 500 },
    { id: "p4", el: "poison", n: "Epidemia", d: "Veneno se espalha para inimigos próximos.", cost: 2, req: ["p2", "f3"], x: 1100, y: 500 },
    { id: "p5", el: "poison", n: "Sifão Tóxico", d: "5% do dano de veneno vira Mana.", cost: 3, req: ["p3"], x: 850, y: 350 },
    { id: "p6", el: "poison", n: "Necrose", d: "Envenenados por >5s ficam 30% mais lentos.", cost: 3, req: ["p4"], x: 1150, y: 350 },
    { id: "p7", el: "poison", n: "Veneno Volátil", d: "Críticos em envenenados causam explosão tóxica.", cost: 4, req: ["p5"], x: 950, y: 200 },
    { id: "p8", el: "poison", n: "Miasma", d: "Aumenta dano do veneno para 5% HP Max/s.", cost: 4, req: ["p6"], x: 1050, y: 200 },
    { id: "p9", el: "poison", n: "Decomposição", d: "Inimigos mortos por veneno dão +50% XP.", cost: 5, req: ["p7", "p8"], x: 1000, y: 100 },
    { id: "p10", el: "poison", n: "Praga Absoluta", d: "Rastro de lodo. Todos nascem envenenados.", cost: 10, req: ["p9"], x: 1000, y: 0 }
];

const ResonancesDB = {
    "syn_f2_p2": { n: "Ressonância Fogo Tóxico", d: "A Corrosão e a Queimadura reagem: Inimigos afetados sofrem Quebra de Armadura (+10% de dano recebido)." },
    "syn_i2_p2": { n: "Ressonância Sangue Frio", d: "O metabolismo lento dos inimigos congelados/lentos faz com que o Veneno dure o dobro de tempo." },
    "syn_l2_f2": { n: "Ressonância Sobrecarga Térmica", d: "Arcos elétricos superaquecem alvos em chamas, causando +50% de dano elétrico." },
    "syn_w2_i2": { n: "Ressonância Vento Glacial", d: "A umidade é congelada no ar: As Lâminas de Vento projetadas ganham 20% de chance de congelar." },
    "syn_p3_i3": { n: "Ressonância Nevasca Ácida", d: "A Nuvem de Gás se funde ao gelo e passa a causar 20% de lentidão profunda em quem pisar nela." },
    "syn_p4_f3": { n: "Ressonância Combustão Volátil", d: "A Epidemia (espalhar veneno) ao encostar em inimigos em chamas causa explosões menores garantidas." },
    "syn_f2_f1": { n: "Ressonância Fervente", d: "+2% Dano Físico Base convertido passivamente da Lâmina." },
    "syn_f3_f2": { n: "Ressonância Cintilante", d: "+5% Dano de Faíscas e efeitos de queimadura." },
    "syn_f4_f2": { n: "Ressonância Implacável", d: "+2% Rotação (RPS) constante extraida do calor residual." },
    "syn_f5_f3": { n: "Ressonância Detonadora", d: "+5% Raio de impacto das explosões." },
    "syn_f6_f4": { n: "Ressonância Vulcânica", d: "+2s na duração de Rastros de Cinzas no chão." },
    "syn_f7_f5": { n: "Ressonância Magmática", d: "+5% Dano Crítico Geral de todos os elementos." },
    "syn_f8_f6": { n: "Ressonância de Calor", d: "Ondas de Calor empurram inimigos 15% mais longe." },
    "syn_f9_f7": { n: "Ressonância Calcinante", d: "+5% de chance crítica contra alvos com menos de 20% HP." },
    "syn_f9_f8": { n: "Ressonância Desoladora", d: "+10% Dano da onda de calor base." },
    "syn_f10_f9": { n: "Ressonância do Inferno", d: "Dano da Lâmina ganha perfuração de armadura térmica (+5% dano base)." },
    "syn_i2_i1": { n: "Ressonância Gélida", d: "+5% Intensidade da Lentidão Base." },
    "syn_i3_i2": { n: "Ressonância Perfurante", d: "+1 Estilhaço extra garantido ao disparar." },
    "syn_i4_i2": { n: "Ressonância Congelante", d: "+1s extra na duração de cada congelamento." },
    "syn_i5_i3": { n: "Ressonância Glacial", d: "-5% custo de mana absoluto de qualquer ação." },
    "syn_i6_i4": { n: "Ressonância da Tundra", d: "+10% Alcance da habilidade Nevasca." },
    "syn_i7_i5": { n: "Ressonância Quebradiça", d: "+50% no multiplicador de Dano ao quebrar gelo." },
    "syn_i8_i6": { n: "Ressonância do Zero", d: "Aura Gélida aumenta seu raio de ação sutilmente." },
    "syn_i9_i7": { n: "Ressonância Cristalina", d: "+5% Ouro ganho de qualquer fonte congelada." },
    "syn_i9_i8": { n: "Ressonância Translúcida", d: "+5% EXP ganho de qualquer fonte na aura gélida." },
    "syn_i10_i9": { n: "Ressonância Absoluta", d: "-5% da Vida Máxima base dos inimigos ao spawnar." },
    "syn_l2_l1": { n: "Ressonância Elétrica", d: "+1 Pulo adicional garantido no Arco Elétrico." },
    "syn_l3_l2": { n: "Ressonância Voltagem", d: "+15 Mana Máxima Base." },
    "syn_l4_l2": { n: "Ressonância Condutora", d: "+1% Rotação Base (permanente)." },
    "syn_l5_l3": { n: "Ressonância Estática", d: "Reduz de 15 para 12 giros o requisito da Tempestade Estática." },
    "syn_l6_l4": { n: "Ressonância Crítica", d: "+5% Chance de Acerto Crítico." },
    "syn_l7_l5": { n: "Ressonância de Polaridade", d: "Aumenta a eficiência da Alta Tensão passivamente em 5%." },
    "syn_l8_l6": { n: "Ressonância Chocante", d: "+1s na duração dos atordoamentos de Raio." },
    "syn_l9_l7": { n: "Ressonância Viva", d: "+2 Mana Regen Base passiva." },
    "syn_l9_l8": { n: "Ressonância Cinética", d: "+5% Dano Base elétrico extra." },
    "syn_l10_l9": { n: "Ressonância do Trovão", d: "Arcos elétricos causam +10% de dano a cada pulo extra." },
    "syn_w2_w1": { n: "Ressonância Aerodinâmica", d: "+5% Raio de Alcance Base da lâmina primária." },
    "syn_w3_w2": { n: "Ressonância Fluida", d: "-5% Custo de Mana da Rotação." },
    "syn_w4_w2": { n: "Ressonância Espiral", d: "Tornados criados duram +1s no mapa." },
    "syn_w5_w3": { n: "Ressonância do Vácuo", d: "Puxa inimigos 15% mais forte para o centro." },
    "syn_w6_w4": { n: "Ressonância Cortante", d: "+5% chance de causar um Corte Duplo no mesmo frame." },
    "syn_w7_w5": { n: "Ressonância Vendaval", d: "Vendaval ativa com apenas 3 inimigos (antes 5)." },
    "syn_w8_w6": { n: "Ressonância Fantasma", d: "Velocidade de movimento das lâminas fantasmas +20%." },
    "syn_w9_w7": { n: "Ressonância Inesgotável", d: "Fôlego Inesgotável dá +2s de giro grátis sem mana." },
    "syn_w9_w8": { n: "Ressonância Tempestiva", d: "+5% Rotação RPS ativa durante o giro." },
    "syn_w10_w9": { n: "Ressonância Devastadora", d: "Furacão Devastador puxa mais intensamente os inimigos." },
    "syn_p2_p1": { n: "Ressonância Tóxica", d: "+1% de dano contínuo baseado no HP Máximo pelo Veneno." },
    "syn_p3_p2": { n: "Ressonância Gasosa", d: "Nuvens de Gás deixadas no chão duram +2s." },
    "syn_p4_p2": { n: "Ressonância Viral", d: "Área de espalhamento da Epidemia é 15% maior." },
    "syn_p5_p3": { n: "Ressonância Sifão", d: "+2% da eficácia do roubo de mana via Sifão Tóxico." },
    "syn_p6_p4": { n: "Ressonância Necrótica", d: "Necrose ativa aos 3s de envenenamento (em vez de 5s)." },
    "syn_p7_p5": { n: "Ressonância Volátil", d: "+10% Raio da explosão gerada pelo Veneno Volátil." },
    "syn_p8_p6": { n: "Ressonância Miasma", d: "+5% Dano Base Adicional contra envenenados." },
    "syn_p9_p7": { n: "Ressonância Podre", d: "+10% XP Adicional por inimigos mortos por veneno." },
    "syn_p9_p8": { n: "Ressonância Decadente", d: "Inimigos muito envenenados têm a defesa derretida (-5% HP)." },
    "syn_p10_p9": { n: "Ressonância da Praga", d: "Praga Absoluta afeta inimigos com dobro da intensidade." }
};

const SynergyData = [];
SkillTreeData.forEach(s => {
    if(s.req) {
        let reqs = Array.isArray(s.req) ? s.req : [s.req];
        reqs.forEach(rId => {
            let parent = SkillTreeData.find(p => p.id === rId);
            if(parent && parent.id !== "start") {
                let synId1 = `syn_${s.id}_${parent.id}`;
                let synId2 = `syn_${parent.id}_${s.id}`;
                let dbData = ResonancesDB[synId1] || ResonancesDB[synId2];
                let finalId = ResonancesDB[synId1] ? synId1 : synId2;
                
                if(dbData && !SynergyData.find(sy => sy.id === finalId)) {
                    SynergyData.push({
                        id: finalId, req1: s.id, req2: parent.id,
                        n: dbData.n, d: dbData.d
                    });
                }
            }
        });
    }
});

const Game = {
    state: {
        level: 1, xp: 0, statPoints: 0, skillPoints: 0,
        str: 0, agi: 0, ene: 0, gold: 0, essence: 0,
        enemyLvl: 1, maxEnemies: 1, enemySpd: 0, mana: 100,
        lastSave: Date.now(), unlockedSkills: []
    },
    runtime: {
        lastFrame: performance.now(), angle: 0, enemies: [], particles: [], texts: [], 
        projectiles: [], groundEffects: [], lightnings: [],
        reqXp: 100, maxMana: 100, manaRegen: 5, manaCost: 10, dmg: 1, rps: 1, radius: 80,
        isExhausted: false, offlineGains: null,
        tornadoTimer: 0, meteorTimer: 0, spawnTimer: 0,
        elementCounts: { fire: 0, ice: 0, lightning: 0, wind: 0, poison: 0 },
        totalSessionXp: 0, xpHistory: [], etaTimer: 0
    },
    R: {},

    init: () => {
        Game.load();
        if(!Game.hasSkill("start")) Game.state.unlockedSkills.push("start");
        Game.calcStats();
        Renderer.init();
        UI.initDrag();
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
            if(Game.state.enemySpd === undefined) Game.state.enemySpd = 0;
            let offTime = Math.min((Date.now() - Game.state.lastSave) / 1000, 86400);
            
            if (offTime > 60) {
                Game.calcStats();
                let critFactor = 1.1; 
                let dps = Game.runtime.dmg * (Game.runtime.rps * 2) * Game.state.maxEnemies * critFactor;
                let baseHp = 20 * Math.pow(1.4, Game.state.enemyLvl);
                let avgHp = baseHp * 1.4; 
                
                let kills = Math.floor((dps * offTime) / avgHp);
                let maxKills = 5 * offTime;
                if (kills > maxKills) kills = maxKills;
                
                if (kills > 0) {
                    let avgGoldPerKill = 1 * Math.pow(1.4, Game.state.enemyLvl) * (1 + Game.state.enemySpd * 0.8) * 1.4;
                    let avgXpPerKill = 15 * Math.pow(1.4, Game.state.enemyLvl) * 1.4;
                    
                    Game.runtime.offlineGains = { 
                        gold: kills * avgGoldPerKill, 
                        xp: kills * avgXpPerKill, 
                        time: offTime 
                    };
                    
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
            UI.showToast(`Coletado: ${Utils.format(Game.runtime.offlineGains.gold)} Ouro e ${Utils.format(Game.runtime.offlineGains.xp)} XP!`);
            Game.runtime.offlineGains = null;
            document.getElementById('offline-claim-box').style.display = 'none';
            UI.update();
        }
    },

    hasSkill: (id) => Game.state.unlockedSkills.includes(id),
    hasSynergy: (id) => {
        let syn = SynergyData.find(s => s.id === id);
        return syn ? (Game.hasSkill(syn.req1) && Game.hasSkill(syn.req2)) : false;
    },

    canUnlockSkill: (id) => {
        if (id === "start") return true;
        let node = SkillTreeData.find(s => s.id === id);
        if (!node) return false;
        if (node.req) {
            let reqs = Array.isArray(node.req) ? node.req : [node.req];
            if (reqs.some(r => Game.hasSkill(r))) return true;
        }
        return Game.state.unlockedSkills.some(unlockedId => {
            let uNode = SkillTreeData.find(s => s.id === unlockedId);
            if (uNode && uNode.req) {
                let uReqs = Array.isArray(uNode.req) ? uNode.req : [uNode.req];
                return uReqs.includes(id);
            }
            return false;
        });
    },

    canRefundSkill: (id) => {
        if(id === "start" || !Game.hasSkill(id)) return false;
        let isRequiredByUnlocked = Game.state.unlockedSkills.some(unlockedId => {
            let uNode = SkillTreeData.find(s => s.id === unlockedId);
            if(uNode && uNode.req) {
                let uReqs = Array.isArray(uNode.req) ? uNode.req : [uNode.req];
                return uReqs.includes(id);
            }
            return false;
        });
        return !isRequiredByUnlocked;
    },

    calcStats: () => {
        let s = Game.state; let r = Game.runtime;
        SynergyData.forEach(syn => { Game.R[syn.id] = Game.hasSkill(syn.req1) && Game.hasSkill(syn.req2); });

        r.reqXp = Math.floor(100 * Math.pow(1.4, s.level - 1));
        
        let radBonus = Game.hasSkill("w1") ? 1.1 : 1;
        if (Game.R["syn_w2_w1"]) radBonus += 0.05; 
        
        let manaBonus = Game.hasSkill("l3") ? 1.3 : 1;
        
        r.radius = 80 * radBonus;
        if(Game.hasSkill("w10")) r.radius *= 2;
        
        let bonusManaBase = Game.R["syn_l3_l2"] ? 15 : 0; 
        r.maxMana = (100 + bonusManaBase + (s.ene * 15)) * manaBonus;
        
        let baseManaRegen = 5 + (s.ene * 2);
        if (Game.R["syn_l9_l7"]) baseManaRegen += 2; 

        r.manaRegen = baseManaRegen;
        if(Game.hasSkill("l9") && r.rps > 2) r.manaRegen *= 1.5;

        r.elementCounts = { fire: 0, ice: 0, lightning: 0, wind: 0, poison: 0 };
        s.unlockedSkills.forEach(id => {
            let sk = SkillTreeData.find(sk => sk.id === id);
            if(sk && sk.el !== "neutral") r.elementCounts[sk.el]++;
        });
    },

    addXp: (amt) => {
        if(Game.hasSkill("p9")) amt *= 1.5;
        if(Game.R["syn_p9_p7"]) amt *= 1.1; 
        if(Game.R["syn_i9_i8"]) amt *= 1.05; 

        Game.runtime.totalSessionXp += amt;
        Game.state.xp += amt; let up = false;

        while(Game.state.xp >= Game.runtime.reqXp) {
            Game.state.xp -= Game.runtime.reqXp;
            Game.state.level++; Game.state.statPoints += 20;
            Game.state.skillPoints++; // SP EM TODOS OS LEVELS
            Game.calcStats(); up = true;
        }
        if(up) UI.showToast(`Level UP! Ganhou +1 SP!`);
        UI.update();
    },

    addStat: (attr) => {
        if (Game.state.statPoints > 0) { Game.state.statPoints--; Game.state[attr]++; Game.calcStats(); UI.update(); }
    },

    resetSkills: () => {
        if(confirm("Deseja resetar TODAS as suas habilidades? Todos os SP serão devolvidos.")) {
            let totalCost = 0;
            Game.state.unlockedSkills.forEach(id => {
                let sk = SkillTreeData.find(s => s.id === id);
                if(sk) totalCost += sk.cost;
            });
            Game.state.skillPoints += totalCost;
            Game.state.unlockedSkills = ["start"];
            Game.calcStats(); UI.rebuildSkillTree(); UI.update();
        }
    },

    refundSkill: () => {
        let id = Game.runtime.selectedSkill;
        if(Game.canRefundSkill(id)) {
            let skill = SkillTreeData.find(s => s.id === id);
            Game.state.unlockedSkills = Game.state.unlockedSkills.filter(sk => sk !== id);
            Game.state.skillPoints += skill.cost;
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buySkill: () => {
        let id = Game.runtime.selectedSkill;
        let skill = SkillTreeData.find(s => s.id === id);
        if(skill && Game.state.skillPoints >= skill.cost) {
            Game.state.skillPoints -= skill.cost;
            Game.state.unlockedSkills.push(id);
            Game.calcStats(); UI.rebuildSkillTree(); UI.update(); UI.closeModal('skill-modal');
        }
    },

    buyEnemyLevel: () => { 
        let c = Utils.calcCost(10, Game.state.enemyLvl - 1, 1.5); 
        if(Game.state.gold >= c) { Game.state.gold -= c; Game.state.enemyLvl++; Game.runtime.enemies = []; UI.update(); } 
    },
    buyMaxEnemies: () => { 
        let c = Utils.calcCost(50, Game.state.maxEnemies - 1, 2.5); 
        if(Game.state.maxEnemies < 30 && Game.state.gold >= c) { Game.state.gold -= c; Game.state.maxEnemies++; UI.update(); } 
    },
    buyEnemySpeed: () => { 
        let c = Utils.calcCost(100, Game.state.enemySpd, 1.8); 
        if(Game.state.gold >= c) { Game.state.gold -= c; Game.state.enemySpd++; UI.update(); } 
    },

    spawnEnemy: () => {
        let hp = 20 * Math.pow(1.4, Game.state.enemyLvl);
        let a = Math.random() * Math.PI * 2; let d = 150 + Math.random() * 50;
        let isElite = Math.random() > 0.8; if(isElite) hp *= 3;
        
        if(Game.R["syn_i10_i9"]) hp *= 0.95; 
        
        let e = { 
            id: Math.random(), hp: hp, maxHp: hp, 
            x: Math.cos(a)*d, y: Math.sin(a)*d, flash: 0, isElite: isElite, 
            poisonTimer: 0, burnTimer: 0, freezeTimer: 0, stunTimer: 0, armorBreakTimer: 0
        };
        if(Game.hasSkill("p10")) e.poisonTimer = 9999;
        if(Game.hasSkill("i10") && !isElite) e.freezeTimer = 9999;
        Game.runtime.enemies.push(e);
    },

    hitEnemy: (e, dmg, isCrit = false, isProc = false) => {
        if(e.hp <= 0) return;
        let R = Game.R;

        // Variação de RPG (± 15%)
        let variance = 0.85 + (Math.random() * 0.30);
        dmg *= variance;

        if(Game.hasSkill("i2") && e.freezeTimer > 0) dmg *= 1.15;
        if(Game.hasSkill("p2") && e.poisonTimer > 0) dmg *= 1.15;
        if(Game.hasSkill("f9") && (e.hp/e.maxHp) < 0.2) dmg *= (R["syn_f9_f7"] ? 2.1 : 2.0); 
        if(Game.hasSkill("i7") && e.freezeTimer > 0) { dmg *= (R["syn_i7_i5"] ? 3.5 : 3.0); e.freezeTimer = 0; } 
        if(isCrit && Game.hasSkill("f7") && e.burnTimer > 0) dmg *= 1.5;
        if(e.armorBreakTimer > 0) dmg *= 1.1;
        
        e.hp -= dmg; e.flash = 0.1;
        
        if (!isProc) {
            if(Game.hasSkill("p1") && Game.state.mana >= 2) { 
                let dur = (R["syn_i2_p2"] && e.freezeTimer > 0) ? 6 : 3;
                e.poisonTimer = dur; Game.state.mana -= 2; 
            }
            if(Game.hasSkill("f2") && Game.state.mana >= 2) { e.burnTimer = 3; Game.state.mana -= 2; }
            if(Game.hasSkill("i1") && Game.state.mana >= 2) { e.freezeTimer = (R["syn_i4_i2"] ? 3 : 2); Game.state.mana -= 2; }
            
            if(R["syn_f2_p2"] && e.poisonTimer > 0) e.armorBreakTimer = 3;

            if(Game.hasSkill("i3") && Math.random() < 0.15 && Game.state.mana >= 5) { 
                Game.state.mana -= 5; let sh = R["syn_i3_i2"] ? 4 : 3;
                for(let i=0; i<sh; i++) Game.fireProjectile(e.x, e.y, "ice", "shard"); 
            }
            if(Game.hasSkill("w2") && Math.random() < 0.10 && Game.state.mana >= 5) { 
                Game.state.mana -= 5; Game.fireProjectile(e.x, e.y, "wind", "crescent"); 
            }
            if((Game.hasSkill("l2") && Math.random() < 0.20) || (isCrit && Game.hasSkill("l6"))) {
                if(Game.state.mana >= 5) { Game.state.mana -= 5; Game.fireLightning(e.x, e.y, R["syn_l2_l1"] ? 4 : 3); }
            }
            if(isCrit && Game.hasSkill("p7") && e.poisonTimer > 0 && Game.state.mana >= 10) { 
                Game.state.mana -= 10; Renderer.createExplosion(e.x, e.y, Elements.poison.color); 
                Game.runtime.enemies.forEach(en => { if(Math.hypot(en.x-e.x, en.y-e.y) < 50) Game.hitEnemy(en, dmg*0.5, false, true); }); 
            }
        }
        
        // Textos menores para não poluir
        let textScale = isCrit ? 1.3 : 0.85; 
        let cColor = isCrit ? "#ff1100" : (Math.random() > 0.5 ? "#ffffff" : "#ffffaa");
        let displayTxt = isCrit ? `CRIT! ${Utils.format(dmg)}` : Utils.format(dmg);
        
        Game.runtime.texts.push({ 
            x: e.x + (Math.random()*30-15), y: e.y - 20, 
            txt: displayTxt, life: 1.0, maxLife: 1.0, scale: textScale, color: cColor,
            vx: (Math.random() - 0.5) * 60, vy: -50 - (Math.random() * 40)
        });
        
        if (e.hp <= 0) {
            Game.runtime.enemies = Game.runtime.enemies.filter(en => en.id !== e.id);
            let g = 1 * Math.pow(1.4, Game.state.enemyLvl) * (1 + Game.state.enemySpd * 0.8);
            let x = 15 * Math.pow(1.4, Game.state.enemyLvl);
            if(e.isElite) { g *= 3; x *= 3; }
            if(Game.hasSkill("i9") && e.freezeTimer > 0) g *= (R["syn_i9_i7"] ? 1.25 : 1.2);
            
            Game.state.gold += g; Game.addXp(x);
            if(Game.hasSkill("p5") && e.poisonTimer > 0) Game.state.mana += dmg * (R["syn_p5_p3"] ? 0.07 : 0.05);
            
            if (!isProc) {
                if(Game.hasSkill("f6") && Math.random() < 0.3) {
                    Game.runtime.groundEffects.push({x: e.x, y: e.y, color: Elements.fire.color, radius: 30, life: R["syn_f6_f4"] ? 5.0 : 3.0, type: 'fire'});
                }
                if(Game.hasSkill("f5") && Math.random() < 0.2 && Game.state.mana >= 10) { 
                    Game.state.mana -= 10; Renderer.createExplosion(e.x, e.y, Elements.fire.color); 
                    let exRadius = R["syn_f5_f3"] ? 60 : 50;
                    Game.runtime.enemies.forEach(en => { if(Math.hypot(en.x-e.x, en.y-e.y) < exRadius) Game.hitEnemy(en, dmg, false, true); }); 
                }
                if(Game.hasSkill("p3") && e.poisonTimer > 0 && Game.state.mana >= 10) { 
                    Game.state.mana -= 10; 
                    Game.runtime.groundEffects.push({x: e.x, y: e.y, color: Elements.poison.color, radius: 40, life: R["syn_p3_p2"] ? 6.0 : 4.0, type: 'poison'}); 
                }
            }
            Renderer.createExplosion(e.x, e.y, e.isElite ? "#ff2a4b" : "#00aaff");
        }
    },

    fireProjectile: (x, y, element, renderType) => {
        let target = Game.runtime.enemies[Math.floor(Math.random() * Game.runtime.enemies.length)];
        if(!target) return;
        let d = Game.runtime.dmg * 0.5;
        let s = 400; if(Game.R["syn_w8_w6"] && element === "wind") s = 480; 
        Game.runtime.projectiles.push({ x: x, y: y, target: target, element: element, renderType: renderType, speed: s, dmg: d, life: 2.0 });
    },

    fireLightning: (startX, startY, jumpsLeft) => {
        if(jumpsLeft <= 0) return;
        let target = Game.runtime.enemies.find(en => Math.hypot(en.x - startX, en.y - startY) < 150 && en.hp > 0);
        if(target) {
            Game.runtime.lightnings.push({ x1: startX, y1: startY, x2: target.x, y2: target.y, life: 0.15 });
            let lDmg = Game.runtime.dmg * 0.8;
            
            // Lógica reformulada do l7 (Alta Tensão)
            if (Game.hasSkill("l7")) lDmg *= (1 + (Game.runtime.rps * 0.1));

            if (Game.R["syn_l10_l9"]) lDmg *= 1.1;
            if(Game.R["syn_l2_f2"] && target.burnTimer > 0) lDmg *= 1.5;
            
            Game.hitEnemy(target, lDmg, false, true);
            setTimeout(() => Game.fireLightning(target.x, target.y, jumpsLeft - 1), 100);
        }
    },

    prestige: () => {
        if (Game.state.level < 50) return;
        let ess = Math.floor(Game.state.level / 10);
        if (confirm(`Ascender concederá +${ess} Essência. Tudo será zerado. Continuar?`)) {
            Game.state.essence += ess; Game.state.level = 1; Game.state.xp = 0; Game.state.statPoints = 0;
            Game.state.str = 0; Game.state.agi = 0; Game.state.ene = 0; Game.state.gold = 0;
            Game.state.enemyLvl = 1; Game.state.maxEnemies = 1; Game.state.enemySpd = 0; Game.state.mana = 100;
            Game.runtime.enemies = []; Game.calcStats(); UI.update();
        }
    },

    loop: (time) => {
        let dt = Math.min((time - Game.runtime.lastFrame) / 1000, 0.1);
        Game.runtime.lastFrame = time;
        let s = Game.state; let r = Game.runtime; let R = Game.R;

        // Gerenciador de ETA - Baseado na janela móvel de 5 segundos
        r.xpHistory.push({ time: time, xp: r.totalSessionXp });
        r.xpHistory = r.xpHistory.filter(h => time - h.time <= 5000); 
        
        r.etaTimer += dt;
        if (r.etaTimer >= 1.0) {
            r.etaTimer = 0;
            if (r.xpHistory.length > 1) {
                let first = r.xpHistory[0]; let last = r.xpHistory[r.xpHistory.length - 1];
                let dtSec = (last.time - first.time) / 1000;
                let dxp = last.xp - first.xp;
                let xps = dtSec > 0 ? dxp / dtSec : 0;
                
                if (xps > 0) {
                    let secLeft = (r.reqXp - s.xp) / xps;
                    let mins = Math.floor(secLeft / 60); let secs = Math.floor(secLeft % 60);
                    let textSecs = secs < 10 ? '0'+secs : secs;
                    UI.setTxt('val-eta', `${mins}:${textSecs}`);
                } else { UI.setTxt('val-eta', `--:--`); }
            }
        }

        r.spawnTimer -= dt;
        if (r.enemies.length < s.maxEnemies && r.spawnTimer <= 0) {
            Game.spawnEnemy(); r.spawnTimer = 0.2; 
        }

        let strBonus = Game.hasSkill("f1") ? 1.1 : 1;
        if(R["syn_f2_f1"]) strBonus += 0.02; 
        
        let agiBonus = Game.hasSkill("l1") ? 1.1 : 1;
        if(R["syn_l4_l2"]) agiBonus += 0.01; 
        if(R["syn_w9_w8"]) agiBonus += 0.05; 
        
        let costRed = Game.hasSkill("w3") ? 0.8 : 1;
        if(R["syn_w3_w2"]) costRed -= 0.05; 
        if(R["syn_i5_i3"]) costRed -= 0.05; 

        let baseCostRed = 1 / (1 + (s.ene * 0.02));
        
        let bDmg = (1 + (s.str * 0.5) + Math.pow(s.str, 1.2) * 0.1) * strBonus;
        if(R["syn_f9_f8"]) bDmg *= 1.05; 
        if(R["syn_l9_l8"]) bDmg *= 1.05; 
        if(R["syn_p8_p6"]) bDmg *= 1.05; 

        let bSpd = (1 + (s.agi * 0.05)) * agiBonus;
        let mult = 1 + (s.essence * 0.1);

        r.manaCost = (10 * bSpd) * baseCostRed * costRed;

        if (s.mana <= 0) {
            if(R["syn_w9_w7"] && !r.isExhausted) s.mana += r.maxMana * 0.1; 
            else r.isExhausted = true;
        }
        if (s.mana >= r.maxMana * 0.2) r.isExhausted = false;

        if (r.isExhausted) { r.dmg = (bDmg * 0.1) * mult; r.rps = bSpd * 0.3; } 
        else { r.dmg = bDmg * mult; r.rps = bSpd; s.mana -= r.manaCost * dt; }

        s.mana += r.manaRegen * dt;
        if (s.mana > r.maxMana) s.mana = r.maxMana;
        if (s.mana < 0) s.mana = 0;

        let rotDelta = (r.rps * Math.PI * 2) * dt;
        let prevAngle = r.angle;
        r.angle = (r.angle + rotDelta) % (Math.PI * 2);

        if(Game.hasSkill("w4") && s.mana >= 20) {
            r.tornadoTimer += rotDelta;
            if(r.tornadoTimer >= Math.PI * 40) { r.tornadoTimer = 0; s.mana -= 20; Game.fireProjectile(0, 0, "wind", "tornado"); }
        }
        if(Game.hasSkill("l5") && s.mana >= 30) {
            r.meteorTimer += rotDelta;
            let meteorLimit = R["syn_l5_l3"] ? 24 : 30;
            if(r.meteorTimer >= Math.PI * meteorLimit) {
                r.meteorTimer = 0; s.mana -= 30;
                let strongest = r.enemies.reduce((prev, current) => (prev.hp > current.hp) ? prev : current, r.enemies[0]);
                if(strongest) { 
                    Game.hitEnemy(strongest, r.dmg * 5, false, true); 
                    r.lightnings.push({x1: strongest.x, y1: strongest.y - 200, x2: strongest.x, y2: strongest.y, life: 0.2});
                    Renderer.createExplosion(strongest.x, strongest.y, Elements.lightning.color); 
                }
            }
        }

        let baseSpd = 20 * (1 + s.enemySpd * 0.2);

        r.enemies.forEach(e => {
            if (e.armorBreakTimer > 0) e.armorBreakTimer -= dt;
            if (e.flash > 0) e.flash -= dt;
            if (e.stunTimer > 0) { e.stunTimer -= dt; return; }
            
            if (e.burnTimer > 0) { e.burnTimer -= dt; Game.hitEnemy(e, r.dmg * 0.05 * dt, false, true); }
            if (e.poisonTimer > 0) { e.poisonTimer -= dt; let pDmg = Game.hasSkill("p8") ? 0.05 : 0.02; Game.hitEnemy(e, e.maxHp * pDmg * dt, false, true); }

            let dist = Math.hypot(e.x, e.y);
            let moveSpd = baseSpd;
            if (e.freezeTimer > 0) { e.freezeTimer -= dt; moveSpd *= (R["syn_i2_i1"] ? 0.85 : 0.9); }
            if (Game.hasSkill("w5")) moveSpd += (R["syn_w5_w3"] ? 15 : 10);
            
            if (dist > 30) { e.x -= (e.x/dist) * moveSpd * dt; e.y -= (e.y/dist) * moveSpd * dt; }
            
            if (dist <= r.radius + 10) {
                let eAngle = Math.atan2(e.y, e.x); if (eAngle < 0) eAngle += Math.PI * 2;
                let hit = false;
                if (prevAngle < r.angle) { if (eAngle >= prevAngle && eAngle <= r.angle) hit = true; } 
                else { if (eAngle >= prevAngle || eAngle <= r.angle) hit = true; }
                
                let rots = Math.floor(rotDelta / (Math.PI * 2));
                let hits = (hit ? 1 : 0) + rots;
                if (Game.hasSkill("w6") && Math.random() < (R["syn_w6_w4"]? 0.20 : 0.15)) hits *= 2;
                
                if (hits > 0) {
                    let cChance = 0.1 + (R["syn_l6_l4"] ? 0.05 : 0.0);
                    let isCrit = Math.random() < cChance;
                    Game.hitEnemy(e, r.dmg * hits * (isCrit ? 2 : 1), isCrit, false);
                }
            }
        });

        r.projectiles.forEach(p => {
            p.life -= dt;
            if(!p.target || p.target.hp <= 0) { p.life = 0; return; }
            let dx = p.target.x - p.x; let dy = p.target.y - p.y; let dist = Math.hypot(dx, dy);
            if(dist < p.speed * dt) {
                if (R["syn_w2_i2"] && p.element === "wind" && Math.random() < 0.2) p.target.freezeTimer = 2; 
                Game.hitEnemy(p.target, p.dmg, false, true); p.life = 0;
            } else { p.x += (dx/dist) * p.speed * dt; p.y += (dy/dist) * p.speed * dt; }
        });
        r.projectiles = r.projectiles.filter(p => p.life > 0);

        r.groundEffects.forEach(ge => { 
            ge.life -= dt; 
            r.enemies.forEach(e => { 
                if(Math.hypot(e.x - ge.x, e.y - ge.y) < ge.radius) {
                    if(ge.type === 'fire') e.burnTimer = 1;
                    if(ge.type === 'poison') {
                        Game.hitEnemy(e, r.dmg * 0.1 * dt, false, true);
                        if (R["syn_p3_i3"]) e.freezeTimer = 0.5; 
                    }
                }
            }); 
        });
        r.groundEffects = r.groundEffects.filter(ge => ge.life > 0);

        r.lightnings.forEach(l => l.life -= dt); r.lightnings = r.lightnings.filter(l => l.life > 0);
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
    drawLightning: (ctx, x1, y1, x2, y2, color) => {
        ctx.beginPath(); ctx.moveTo(x1, y1);
        let segments = 5;
        for(let i=1; i<=segments; i++) {
            let nx = x1 + (x2-x1)*(i/segments) + (Math.random()*30-15);
            let ny = y1 + (y2-y1)*(i/segments) + (Math.random()*30-15);
            if(i === segments) { nx = x2; ny = y2; }
            ctx.lineTo(nx, ny);
        }
        ctx.strokeStyle = color; ctx.lineWidth = 2; ctx.shadowBlur = 10; ctx.shadowColor = color; ctx.stroke(); ctx.shadowBlur = 0;
    },
    draw: () => {
        let ctx = Renderer.ctx; let cx = Renderer.w / 2; let cy = Renderer.h / 2 - 50;
        ctx.clearRect(0, 0, Renderer.w, Renderer.h);

        Game.runtime.groundEffects.forEach(ge => {
            ctx.beginPath(); ctx.arc(cx + ge.x, cy + ge.y, ge.radius, 0, Math.PI*2);
            ctx.fillStyle = ge.color; ctx.globalAlpha = (ge.life / 4.0) * 0.3; ctx.fill(); ctx.globalAlpha = 1.0;
        });

        ctx.globalCompositeOperation = "lighter";
        Game.runtime.particles.forEach(p => {
            ctx.fillStyle = p.c; ctx.globalAlpha = p.life/p.max;
            ctx.beginPath(); ctx.arc(cx + p.x, cy + p.y, 2, 0, Math.PI*2); ctx.fill();
        });
        ctx.globalAlpha = 1.0; ctx.globalCompositeOperation = "source-over";

        Game.runtime.lightnings.forEach(l => {
            Renderer.drawLightning(ctx, cx + l.x1, cy + l.y1, cx + l.x2, cy + l.y2, Elements.lightning.color);
        });

        Game.runtime.projectiles.forEach(p => {
            ctx.save(); ctx.translate(cx + p.x, cy + p.y);
            ctx.fillStyle = Elements[p.element].color; ctx.shadowBlur = 10; ctx.shadowColor = ctx.fillStyle;
            
            if(p.renderType === 'shard') {
                let angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                ctx.rotate(angle); ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-5, 5); ctx.lineTo(-5, -5); ctx.fill();
            } else if(p.renderType === 'crescent') {
                let angle = Math.atan2(p.target.y - p.y, p.target.x - p.x);
                ctx.rotate(angle); ctx.beginPath(); ctx.arc(0, 0, 10, -Math.PI/2, Math.PI/2); ctx.lineTo(-5, 0); ctx.fill();
            } else if(p.renderType === 'tornado') {
                ctx.rotate(Game.runtime.angle * 5); ctx.beginPath(); ctx.arc(0, 0, 15, 0, Math.PI); ctx.stroke();
            } else {
                ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI*2); ctx.fill();
            }
            ctx.restore();
        });

        Game.runtime.enemies.forEach(e => {
            ctx.save(); ctx.translate(cx + e.x, cy + e.y);
            let eColor = e.isElite ? "#ff2a4b" : "#00aaff";
            if(e.poisonTimer > 0) eColor = Elements.poison.color;
            if(e.freezeTimer > 0) eColor = Elements.ice.color;
            if(e.burnTimer > 0) eColor = Elements.fire.color;

            if(e.armorBreakTimer > 0 && e.flash <= 0) { ctx.shadowBlur = 15; ctx.shadowColor = "#ff00ff"; eColor = "#ff00ff"; }
            else { ctx.shadowBlur = e.flash > 0 ? 15 : 5; ctx.shadowColor = e.flash > 0 ? "#fff" : eColor; }
            
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
        let r = Game.runtime.radius; let counts = Game.runtime.elementCounts;

        let baseColor = Game.runtime.isExhausted ? "rgba(255,42,75,0.5)" : "rgba(0,170,255,0.8)";
        ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4);
        ctx.lineWidth = 4; ctx.strokeStyle = baseColor; ctx.shadowBlur = 10; ctx.shadowColor = baseColor; ctx.stroke();
        
        ctx.beginPath(); ctx.arc(0, 0, r - 5, Math.PI - Math.PI/4, Math.PI + Math.PI/4);
        ctx.lineWidth = 3; ctx.strokeStyle = baseColor; ctx.stroke();

        if(!Game.runtime.isExhausted) {
            if(counts.fire > 0) {
                ctx.beginPath(); ctx.arc(0, 0, r+2, -Math.PI/3, Math.PI/4);
                ctx.lineWidth = 2 + counts.fire; ctx.strokeStyle = "rgba(255,51,0,0.6)"; ctx.shadowColor = "#ff3300"; ctx.stroke();
            }
            if(counts.ice > 0) {
                ctx.beginPath(); ctx.arc(0, 0, r-8, -Math.PI/4, Math.PI/4);
                ctx.lineWidth = 2; ctx.strokeStyle = "rgba(0,255,255,0.8)"; ctx.stroke();
            }
            if(counts.wind > 0) {
                ctx.beginPath(); ctx.arc(0, 0, r+10, -Math.PI/2, Math.PI/2);
                ctx.lineWidth = 1; ctx.strokeStyle = "rgba(0,255,136,0.4)"; ctx.stroke();
            }
            if(counts.poison > 0) {
                ctx.beginPath(); ctx.arc(0, 0, r, -Math.PI/4, Math.PI/4);
                ctx.lineWidth = 8; ctx.strokeStyle = "rgba(179,0,255,0.3)"; ctx.stroke();
            }
            if(counts.lightning > 0 && Math.random() < 0.5) {
                let sparkAngle = (Math.random() * Math.PI/2) - Math.PI/4;
                let sx = Math.cos(sparkAngle) * r; let sy = Math.sin(sparkAngle) * r;
                Renderer.drawLightning(ctx, sx, sy, sx + (Math.random()*20), sy + (Math.random()*20), "#ffff00");
            }
        }
        ctx.restore();

        ctx.font = "900 16px 'Rajdhani'"; ctx.textAlign = "center";
        Game.runtime.texts.forEach(t => {
            ctx.save();
            ctx.translate(cx + t.x, cy + t.y);
            let currentScale = t.scale * (1 + (1 - t.life/t.maxLife) * 0.3); 
            ctx.scale(currentScale, currentScale);
            ctx.globalAlpha = Math.max(0, t.life / t.maxLife);
            
            ctx.lineWidth = 3; ctx.strokeStyle = "#000"; 
            ctx.strokeText(t.txt, 0, 0);
            ctx.fillStyle = t.color; 
            ctx.fillText(t.txt, 0, 0);
            ctx.restore();
        });
    }
};

const UI = {
    initDrag: () => {
        const slider = document.getElementById('tree-viewport');
        let isDown = false; let startX, startY, scrollLeft, scrollTop;

        const start = (e) => {
            isDown = true;
            startX = (e.pageX || e.touches[0].pageX) - slider.offsetLeft;
            startY = (e.pageY || e.touches[0].pageY) - slider.offsetTop;
            scrollLeft = slider.scrollLeft; scrollTop = slider.scrollTop;
        };
        const end = () => { isDown = false; };
        const move = (e) => {
            if (!isDown) return;
            e.preventDefault();
            const x = (e.pageX || e.touches[0].pageX) - slider.offsetLeft;
            const y = (e.pageY || e.touches[0].pageY) - slider.offsetTop;
            slider.scrollLeft = scrollLeft - (x - startX) * 1.5;
            slider.scrollTop = scrollTop - (y - startY) * 1.5;
        };

        slider.addEventListener('mousedown', start); slider.addEventListener('touchstart', start, {passive: false});
        slider.addEventListener('mouseleave', end); slider.addEventListener('mouseup', end); slider.addEventListener('touchend', end);
        slider.addEventListener('mousemove', move); slider.addEventListener('touchmove', move, {passive: false});
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
            targetTab.classList.add('active');
            el.classList.add('active');
            document.getElementById('main-content').classList.add('open');
            document.getElementById('app-container').classList.add('menu-open');

            if(id === 'skills') {
                document.getElementById('app-container').classList.add('skills-active');
                UI.rebuildSkillTree();
                setTimeout(() => {
                    let vp = document.getElementById('tree-viewport');
                    vp.scrollLeft = 1000 - vp.clientWidth / 2; vp.scrollTop = 1000 - vp.clientHeight / 2;
                }, 50);
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
        let synHtml = '';

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

                        let syn = SynergyData.find(sy => (sy.req1 === s.id && sy.req2 === parent.id) || (sy.req1 === parent.id && sy.req2 === s.id));
                        if(syn) {
                            let synActive = Game.hasSkill(s.id) && Game.hasSkill(parent.id);
                            let midX = (s.x + parent.x) / 2; let midY = (s.y + parent.y) / 2;
                            let synCls = synActive ? "active" : "";
                            let synColor = synActive ? Elements[s.el].color : "#333";
                            synHtml += `<div class="synergy-node ${synCls}" style="left: ${midX}px; top: ${midY}px; border-color: ${synColor};" onclick="UI.showSkillModal('${syn.id}', true)"></div>`;
                        }
                    }
                });
            }
        });
        svgHtml += `</svg>`;

        let nodesHtml = '';
        SkillTreeData.forEach(s => {
            let isUnlocked = Game.hasSkill(s.id);
            let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);
            let elColor = Elements[s.el].color;
            let nodeStyle = `left: ${s.x}px; top: ${s.y}px; border-color: ${elColor};`;
            
            if(isUnlocked) { nodeStyle += `background: ${elColor}33; box-shadow: 0 0 15px ${elColor}; color: #fff;`; } 
            else if(canUnlock) { nodeStyle += `box-shadow: 0 0 5px ${elColor}; color: ${elColor};`; } 
            else { nodeStyle += `border-color: #333; color: #555;`; }

            let isUlt = s.cost === 10 ? "ultimate" : ""; let isStart = s.id === "start" ? "start-node" : "";
            nodesHtml += `<div class="tree-node ${isUlt} ${isStart}" style="${nodeStyle}" onclick="UI.showSkillModal('${s.id}', false)">${s.id.toUpperCase()}</div>`;
        });
        container.innerHTML = svgHtml + synHtml + nodesHtml;
    },

    showSkillModal: (id, isSynergy) => {
        let s = isSynergy ? SynergyData.find(sk => sk.id === id) : SkillTreeData.find(sk => sk.id === id);
        if(!s) return;
        
        Game.runtime.selectedSkill = isSynergy ? null : id;
        UI.setTxt('modal-skill-title', s.n); UI.setTxt('modal-skill-desc', s.d);
        
        let btn = document.getElementById('btn-learn-skill');
        let btnRef = document.getElementById('btn-refund-skill');
        let costEl = document.getElementById('modal-skill-cost');

        btn.style.display = "none"; btnRef.style.display = "none";

        if(isSynergy) {
            let isActive = Game.hasSkill(s.req1) && Game.hasSkill(s.req2);
            costEl.innerText = isActive ? "Passiva Ativa!" : "Requer nós adjacentes para ativar.";
            costEl.style.color = isActive ? "var(--neon-green)" : "var(--neon-red)";
        } else {
            let isUnlocked = Game.hasSkill(s.id);
            let canUnlock = !isUnlocked && Game.canUnlockSkill(s.id);

            if (isUnlocked) {
                costEl.innerText = "Habilidade Adquirida."; costEl.style.color = "var(--neon-green)";
                if (Game.canRefundSkill(s.id)) btnRef.style.display = "block";
            } else if (canUnlock) {
                costEl.innerText = `Custo: ${s.cost} SP`; costEl.style.color = "var(--neon-gold)";
                btn.style.display = "block"; btn.innerText = "Aprender";
                btn.disabled = Game.state.skillPoints < s.cost;
            } else {
                costEl.innerText = "Requisito não atendido."; costEl.style.color = "var(--neon-red)";
            }
        }
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
        
        UI.setTxt('val-mana-txt', `${Math.floor(s.mana)} / ${Math.floor(r.maxMana)}`);
        document.getElementById('bar-mana').style.width = `${(s.mana / r.maxMana) * 100}%`;
        UI.setTxt('val-level-bar', s.level); UI.setTxt('val-xp-txt', `${Utils.format(s.xp)} / ${Utils.format(r.reqXp)}`);
        document.getElementById('bar-xp').style.width = `${(s.xp / r.reqXp) * 100}%`;

        UI.setTxt('card-str', s.str); UI.setTxt('card-ene', s.ene); UI.setTxt('card-agi', s.agi);
        ['str', 'ene', 'agi'].forEach(a => document.getElementById(`btn-add-${a}`).disabled = s.statPoints <= 0);

        UI.setTxt('upg-lvl-val', s.enemyLvl); 
        let cLvl = Utils.calcCost(10, s.enemyLvl - 1, 1.5);
        UI.setTxt('cost-lvl', Utils.format(cLvl));
        document.getElementById('btn-upg-lvl').disabled = s.gold < cLvl;

        UI.setTxt('upg-max-val', s.maxEnemies); 
        let cMax = Utils.calcCost(50, s.maxEnemies - 1, 2.5);
        let bMax = document.getElementById('btn-upg-max');
        if(s.maxEnemies >= 30) { bMax.innerText = "MÁX"; bMax.disabled = true; } 
        else { UI.setTxt('cost-max', Utils.format(cMax)); bMax.disabled = s.gold < cMax; }

        UI.setTxt('upg-spd-val', s.enemySpd); 
        let cSpd = Utils.calcCost(100, s.enemySpd, 1.8);
        UI.setTxt('cost-spd', Utils.format(cSpd));
        document.getElementById('btn-upg-spd').disabled = s.gold < cSpd;
        
        UI.setTxt('val-sp', s.skillPoints);
        UI.setTxt('val-pending-essence', Math.floor(s.level / 10));
        document.getElementById('btn-do-prestige').disabled = s.level < 50;

        if (Game.runtime.selectedSkill) {
            let sk = SkillTreeData.find(sk => sk.id === Game.runtime.selectedSkill);
            let btnLearn = document.getElementById('btn-learn-skill');
            if(btnLearn && sk) btnLearn.disabled = s.skillPoints < sk.cost;
        }
    }
};

let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); deferredPrompt = e; document.getElementById('btn-install').style.display = 'flex';
});
function installPWA() {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then(() => { deferredPrompt = null; document.getElementById('btn-install').style.display = 'none'; });
    }
}
if ('serviceWorker' in navigator) { navigator.serviceWorker.register('sw.js').catch(err => console.log('SW falhou', err)); }
window.onload = Game.init;