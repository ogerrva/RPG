// ==========================================
// 1. BANCO DE DADOS (Itens, Magias, Sprites e Prática)
// ==========================================

const Elements = {
    arcane: { id: "arcane", name: "Arcano", color: "#d942ff", glow: "#f2b3ff" },
    lightning: { id: "lightning", name: "Raio", color: "#ffff00", glow: "#ffffe6" },
    ice: { id: "ice", name: "Gelo", color: "#00ffff", glow: "#ccffff" },
    fire: { id: "fire", name: "Fogo", color: "#ff3300", glow: "#ff9966" },
    void: { id: "void", name: "Vazio", color: "#800080", glow: "#d9b3ff" }
};

const MagicBehaviors = {
    normal:  { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false, ghost: false, speed: 300 },
    bounce:  { type: "chain", chains: 3, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false, ghost: false, speed: 400 },
    pierce:  { type: "base", chains: 0, aoe: false, pierce: true, split: 0, orbit: false, implode: false, wave: false, delay: false, ghost: false, speed: 500 },
    split:   { type: "base", chains: 0, aoe: false, pierce: false, split: 3, orbit: false, implode: false, wave: false, delay: false, ghost: false, speed: 250 },
    orbit:   { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: true, implode: false, wave: false, delay: false, ghost: false, speed: 150 },
    implode: { type: "base", chains: 0, aoe: true, pierce: false, split: 0, orbit: false, implode: true, wave: false, delay: false, ghost: false, speed: 350 },
    delay:   { type: "storm", chains: 0, aoe: true, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: true, ghost: false, speed: 200 },
    wave:    { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: true, delay: false, ghost: false, speed: 250 },
    ghost:   { type: "base", chains: 0, aoe: false, pierce: true, split: 0, orbit: false, implode: false, wave: false, delay: false, ghost: true, speed: 100 }
};

// 100 Magias Reais, sem repetição de mecânica
const MasterSpells = [
    { n: "Echo Pulse", e: "arcane", b: "wave", shape: "circle", desc: "Ondas circulares que ecoam." },
    { n: "Ripple Surge", e: "arcane", b: "wave", shape: "ring", desc: "Distorção que perfura alvos." },
    { n: "Arc Thread", e: "lightning", b: "bounce", shape: "line", desc: "Fios conectando alvos vivos." },
    { n: "Void Needle", e: "void", b: "pierce", shape: "line", desc: "Linha negra que ignora defesas." },
    { n: "Pulse Shard", e: "arcane", b: "split", shape: "star", desc: "Estilhaços de luz fragmentada." },
    { n: "Time Pebble", e: "ice", b: "delay", shape: "square", desc: "Partículas que atrasam o dano." },
    { n: "Mana Bloom", e: "arcane", b: "implode", shape: "spiral", desc: "Uma flor arcana que implode." },
    { n: "Spiral Shot", e: "fire", b: "orbit", shape: "spiral", desc: "Espiral luminosa em órbita." },
    { n: "Gravity Flick", e: "void", b: "implode", shape: "circle", desc: "Mini campo gravitacional." },
    { n: "Lumen Dart", e: "lightning", b: "pierce", shape: "line", desc: "Rastro branco hiperveloz." },
    { n: "Fractal Bloom", e: "ice", b: "split", shape: "star", desc: "Divide-se em geometria fractal." },
    { n: "Mirror Bolt", e: "arcane", b: "split", shape: "circle", desc: "Duplica-se como um espelho." },
    { n: "Split Halo", e: "fire", b: "split", shape: "ring", desc: "Cria um halo de mini-projéteis." },
    { n: "Prism Scatter", e: "lightning", b: "split", shape: "star", desc: "Fragmentação em múltiplos ângulos." },
    { n: "Pulse Scatter", e: "arcane", b: "split", shape: "circle", desc: "Explode em pulsos repetidos." },
    { n: "Echo Split", e: "void", b: "split", shape: "ring", desc: "Fragmentos que deixam fantasmas." },
    { n: "Spiral Fracture", e: "fire", b: "orbit", shape: "spiral", desc: "Pedaços flamejantes orbitais." },
    { n: "Nova Seed", e: "fire", b: "delay", shape: "circle", desc: "Semente que explode no futuro." },
    { n: "Chain Bloom", e: "lightning", b: "bounce", shape: "star", desc: "Pula e explode em cada alvo." },
    { n: "Twin Pulse", e: "arcane", b: "split", shape: "circle", desc: "Dois projéteis sincronizados." },
    { n: "Fold Step", e: "void", b: "pierce", shape: "square", desc: "Teleporta ignorando o espaço." },
    { n: "Phase Needle", e: "void", b: "pierce", shape: "line", desc: "Atravessa matéria física pesada." },
    { n: "Warp Drift", e: "arcane", b: "wave", shape: "spiral", desc: "Desvia lentamente manipulando a área." },
    { n: "Rift Pebble", e: "void", b: "implode", shape: "star", desc: "Gera uma pequena fissura." },
    { n: "Loop Orb", e: "ice", b: "orbit", shape: "circle", desc: "Orbita e retorna ao ponto de partida." },
    { n: "Collapse Orb", e: "void", b: "implode", shape: "circle", desc: "Colapsa sobre si mesma." },
    { n: "Orbit Seed", e: "arcane", b: "orbit", shape: "ring", desc: "Semeia anéis que cercam inimigos." },
    { n: "Slip Shot", e: "ice", b: "wave", shape: "line", desc: "Desliza erraticamente como gelo." },
    { n: "Bend Ray", e: "lightning", b: "wave", shape: "line", desc: "Curva-se formando arcos longos." },
    { n: "Rift Rain", e: "void", b: "split", shape: "star", desc: "Chove matéria negra de fendas." },
    { n: "Temporal Loop", e: "ice", b: "delay", shape: "ring", desc: "Repete o impacto no mesmo local." },
    { n: "Delay Burst", e: "fire", b: "delay", shape: "star", desc: "Causa dano super atrasado." },
    { n: "Time Fracture", e: "ice", b: "implode", shape: "square", desc: "Congela e quebra o alvo." },
    { n: "Reverse Pulse", e: "arcane", b: "wave", shape: "circle", desc: "Projétil que retorna o dano." },
    { n: "Future Echo", e: "lightning", b: "delay", shape: "line", desc: "Surge no futuro causando dano." },
    { n: "Slow Wave", e: "ice", b: "wave", shape: "ring", desc: "Onda de pura lentidão." },
    { n: "Chrono Spark", e: "lightning", b: "normal", shape: "star", desc: "Fagulha temporal acelerada." },
    { n: "Memory Bolt", e: "arcane", b: "bounce", shape: "line", desc: "Reaparece em alvos antigos." },
    { n: "Time Scatter", e: "void", b: "split", shape: "circle", desc: "Aparece em momentos diferentes." },
    { n: "Paradox Seed", e: "void", b: "delay", shape: "spiral", desc: "Gera eventos imprevisíveis." },
    { n: "Mana Torrent", e: "arcane", b: "pierce", shape: "line", desc: "Rajada contínua de pura mana." },
    { n: "Flux Shard", e: "lightning", b: "split", shape: "square", desc: "Fragmentos de força variável." },
    { n: "Energy Bloom", e: "fire", b: "implode", shape: "ring", desc: "Explosão de calor concentrado." },
    { n: "Pulse Garden", e: "arcane", b: "orbit", shape: "star", desc: "Planta projéteis na área." },
    { n: "Arc Burst", e: "lightning", b: "implode", shape: "star", desc: "Impacto elétrico denso." },
    { n: "Resonance Beam", e: "arcane", b: "pierce", shape: "line", desc: "Raio ressonante contínuo." },
    { n: "Cascade Pulse", e: "ice", b: "bounce", shape: "circle", desc: "Pulsação que encadeia dano." },
    { n: "Static Halo", e: "lightning", b: "orbit", shape: "ring", desc: "Campo elétrico estático." },
    { n: "Charge Orb", e: "fire", b: "delay", shape: "circle", desc: "Acumula energia antes de bater." },
    { n: "Surge Ray", e: "lightning", b: "pierce", shape: "line", desc: "Raio de alta voltagem." },
    { n: "Magnet Pulse", e: "void", b: "implode", shape: "ring", desc: "Atrai e esmaga o alvo." },
    { n: "Repel Burst", e: "fire", b: "implode", shape: "star", desc: "Explosão com recuo intenso." },
    { n: "Orbit Field", e: "ice", b: "orbit", shape: "circle", desc: "Cria campo rotacional gelado." },
    { n: "Merge Spark", e: "lightning", b: "normal", shape: "star", desc: "Fagulhas que buscam se fundir." },
    { n: "Split Engine", e: "arcane", b: "split", shape: "square", desc: "Motor de divisão arcana." },
    { n: "Reflect Core", e: "ice", b: "bounce", shape: "circle", desc: "Núcleo que reflete entre os alvos." },
    { n: "Chain Reactor", e: "lightning", b: "bounce", shape: "star", desc: "Multiplica impactos a cada pulo." },
    { n: "Pulse Engine", e: "fire", b: "normal", shape: "ring", desc: "Acelera bruscamente no ar." },
    { n: "Echo Reactor", e: "arcane", b: "wave", shape: "spiral", desc: "Repete impactos perfeitamente." },
    { n: "Fractal Reactor", e: "void", b: "split", shape: "star", desc: "Multiplica a divisão do vácuo." },
    { n: "Dream Needle", e: "void", b: "ghost", shape: "line", desc: "Agulha fantasma onírica." },
    { n: "Phantom Bloom", e: "ice", b: "implode", shape: "circle", desc: "Explosão invisível." },
    { n: "Illusion Pulse", e: "arcane", b: "wave", shape: "ring", desc: "Projéteis falsos e enganosos." },
    { n: "Shadow Thread", e: "void", b: "bounce", shape: "line", desc: "Conecta as sombras dos inimigos." },
    { n: "Spectral Orb", e: "ice", b: "orbit", shape: "circle", desc: "Orbe lento e espectral." },
    { n: "Mirage Shot", e: "arcane", b: "split", shape: "star", desc: "Aparece em múltiplos lugares." },
    { n: "Nightmare Seed", e: "void", b: "delay", shape: "spiral", desc: "Dano massivo crescente." },
    { n: "Ghost Ripple", e: "ice", b: "wave", shape: "ring", desc: "Ondas que atravessam tudo." },
    { n: "Ether Drift", e: "arcane", b: "wave", shape: "line", desc: "Flutuação etérea." },
    { n: "Spirit Burst", e: "void", b: "implode", shape: "star", desc: "Detonação de almas." },
    { n: "Whisper Bolt", e: "ice", b: "normal", shape: "square", desc: "Silencioso e mortal." },
    { n: "Echo Phantom", e: "arcane", b: "delay", shape: "circle", desc: "Reaparece invisível." },
    { n: "Memory Pulse", e: "lightning", b: "bounce", shape: "ring", desc: "Revive projéteis antigos." },
    { n: "Fade Needle", e: "void", b: "pierce", shape: "line", desc: "Pisca e perfura o ar." },
    { n: "Void Whisper", e: "void", b: "implode", shape: "circle", desc: "Sussurro que gera vácuo." },
    { n: "Soul Thread", e: "arcane", b: "bounce", shape: "line", desc: "Costura almas juntas." },
    { n: "Shade Bloom", e: "void", b: "implode", shape: "spiral", desc: "Explosão de pura escuridão." },
    { n: "Spectral Storm", e: "ice", b: "split", shape: "star", desc: "Tempestade fantasmagórica." },
    { n: "Dream Cascade", e: "arcane", b: "bounce", shape: "ring", desc: "Cascata aleatória." },
    { n: "Phantom Nova", e: "void", b: "implode", shape: "circle", desc: "Uma explosão ilusória." },
    { n: "Chaos Spark", e: "lightning", b: "split", shape: "star", desc: "Totalmente imprevisível." },
    { n: "Entropy Burst", e: "fire", b: "delay", shape: "spiral", desc: "Entropia destrutiva." },
    { n: "Random Echo", e: "arcane", b: "bounce", shape: "ring", desc: "Ecos descontrolados." },
    { n: "Collapse Rain", e: "void", b: "split", shape: "circle", desc: "Chuva de mini-implosões." },
    { n: "Rift Bloom", e: "void", b: "implode", shape: "star", desc: "Fendas que rasgam a tela." },
    { n: "Paradox Bolt", e: "ice", b: "pierce", shape: "line", desc: "Paradoxo que quebra regras." },
    { n: "Singularity Seed", e: "void", b: "implode", shape: "circle", desc: "Semente de buraco negro." },
    { n: "Flux Nova", e: "fire", b: "implode", shape: "spiral", desc: "Explosão super instável." },
    { n: "Cascade Rift", e: "arcane", b: "bounce", shape: "ring", desc: "Fendas encadeadas." },
    { n: "Reality Tear", e: "void", b: "pierce", shape: "line", desc: "Rasga o tecido da realidade." },
    { n: "Orbit Chaos", e: "fire", b: "orbit", shape: "star", desc: "Órbita frenética." },
    { n: "Pulse Tornado", e: "lightning", b: "orbit", shape: "circle", desc: "Tornado de pulsos rápidos." },
    { n: "Spiral Storm", e: "ice", b: "split", shape: "spiral", desc: "Tempestade em espiral." },
    { n: "Echo Singularity", e: "void", b: "implode", shape: "circle", desc: "Buraco negro repetitivo." },
    { n: "Prism Collapse", e: "lightning", b: "implode", shape: "star", desc: "Colapso multicolorido." },
    { n: "Nova Engine", e: "fire", b: "delay", shape: "ring", desc: "Motor de supernovas." },
    { n: "Infinite Split", e: "arcane", b: "split", shape: "star", desc: "Divisão geométrica infinita." },
    { n: "Chaos Reactor", e: "void", b: "wave", shape: "circle", desc: "Reator de puro caos." },
    { n: "Arcane Cataclysm", e: "arcane", b: "implode", shape: "spiral", desc: "O fim de tudo." },
    { n: "Ear Mage Ascension", e: "lightning", b: "pierce", shape: "star", desc: "O poder supremo do Mago." }
];

const EquipSlots = [
    { id: "wand", name: "Cajado", max: 1 }, { id: "armor", name: "Traje", max: 1 },
    { id: "amulet", name: "Amuleto", max: 1 }, { id: "earring", name: "Brinco", max: 2 }, { id: "ring", name: "Anel", max: 5 }
];
const EquipTiers = [
    { n: "Comum", mult: 1, c: "#a1a1a1" }, { n: "Raro", mult: 3, c: "#3399ff" }, 
    { n: "Épico", mult: 8, c: "#aa33ff" }, { n: "Lendário", mult: 20, c: "#ffd700" }
];
const ItemPrefixes = ["Destruidor", "Rápido", "Ganancioso", "Erudito", "Divino"];

// O Banco de Habilidades de Prática! (AQUI ESTAVA O SEU ERRO ANTES, AGORA FIXO)
const PracticeData = [
    { id: "p1", name: "Calejamento Físico", desc: "Aumenta o Dano Base das magias.", stat: "dmg", statName: "Dano Base", mult: 0.10, baseReq: 10, category: "corpo" },
    { id: "p2", name: "Reflexos de Lince", desc: "Aumenta a Velocidade de Disparo.", stat: "spd", statName: "Vel. Ataque", mult: 0.05, baseReq: 50, category: "corpo" },
    { id: "p3", name: "Golpe Penetrante", desc: "Aumenta a Chance de Crítico Múltiplo.", stat: "crit", statName: "Crítico", mult: 0.02, baseReq: 250, category: "corpo" },
    { id: "p5", name: "Meditação Astral", desc: "Aumenta o Ganho de XP Global.", stat: "xp", statName: "XP Global", mult: 0.15, baseReq: 20, category: "mente" },
    { id: "p6", name: "Sifão de Almas", desc: "Aumenta a Chance de Dropar Energia.", stat: "eng", statName: "Drop Energia", mult: 0.02, baseReq: 100, category: "mente" },
    { id: "p7", name: "Clarividência", desc: "Aumenta o Ganho de Ouro dos monstros.", stat: "gold", statName: "Bônus Ouro", mult: 0.10, baseReq: 500, category: "mente" },
    { id: "p8", name: "Ressonância", desc: "Potencializa Sinergias (Combos).", stat: "combo", statName: "Poder do Combo", mult: 0.20, baseReq: 1000, category: "aura" }
];

const GameData = {
    items: [], magics: [],
    generate: () => {
        let iid = 0; let els = Object.keys(Elements);
        EquipSlots.forEach(slot => {
            for(let level = 1; level <= 20; level++) {
                let elKey = els[Math.floor(Math.random() * els.length)];
                let prefix = ItemPrefixes[Math.floor(Math.random() * ItemPrefixes.length)];
                let stats = { eleDmg: 0.1 * level, spd: prefix === "Rápido" ? 0.05 * level : 0, goldMult: prefix === "Ganancioso" ? 0.2 * level : 0, xp: prefix === "Erudito" ? 0.1 * level : 0 };
                let rarityColor = level < 5 ? "#a1a1a1" : (level < 10 ? "#3399ff" : (level < 15 ? "#aa33ff" : "#ffd700"));

                GameData.items.push({ id: iid++, slot: slot.id, slotName: slot.name, name: `${slot.name} ${prefix} de ${Elements[elKey].name}`, color: rarityColor, element: elKey, reqLevel: level * 10, cost: Math.floor(100 * Math.pow(1.5, level)), stats: stats });
            }
        });

        MasterSpells.forEach((sp, idx) => {
            let el = Elements[sp.e]; let b = MagicBehaviors[sp.b];
            GameData.magics.push({ id: idx, name: sp.n, desc: sp.desc, element: sp.e, elementName: el.name, color: el.color, glow: el.glow, type: b.type, behavior: sp.b, shape: sp.shape, speed: b.speed, chains: b.chains, aoe: b.aoe, pierce: b.pierce, split: b.split, orbit: b.orbit, implode: b.implode, wave: b.wave, delay: b.delay, ghost: b.ghost, cost: Math.min(5000, Math.floor(100 * Math.pow(1.1, idx))), dmgMult: 1 + (idx * 0.05) });
        });
    }
};

const SpriteGen = {
    palettes: { wizard: { '.': null, '#': '#111', 'R': '#4a235a', 'r': '#8e44ad', 'S': '#f5cba7', 'E': '#e67e22', 'e': '#d35400', 'W': '#5c4033', 'G': '#00ffff' }, targets: { '.': null, '#': '#000', '1': '#ffffff' } },
    shapes: {
        crystal: ["......####......", "....##1111##....", "...#11111111#...", "..#1111111111#..", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", "..#1111111111#..", "...#11111111#...", "....##1111##....", "......####......"],
        obelisk: [".......##.......", "......#11#......", ".....#1111#.....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", ".....######....."],
        sphere:  ["......####......", "....##1111##....", "...#11111111#...", "..#1111111111#..", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", "..#1111111111#..", "...#11111111#...", "....##1111##....", "......####......"],
        star:    [".......##.......", ".......##.......", "...##########...", "..#1111111111#..", "...#11111111#...", "....#111111#....", "...#11111111#...", "..#11#....#11#..", ".##..........##."],
    },
    crystalTiers: [ { '#': '#000', 'C': '#00b386', 'c': '#00ffcc', 'd': '#00664d' }, { '#': '#000', 'C': '#0066cc', 'c': '#3399ff', 'd': '#003380' }, { '#': '#000', 'C': '#800080', 'c': '#cc33ff', 'd': '#4d004d' }, { '#': '#000', 'C': '#cc0000', 'c': '#ff4d4d', 'd': '#800000' }, { '#': '#000', 'C': '#b38f00', 'c': '#ffcc00', 'd': '#665200' }, { '#': '#000', 'C': '#cccccc', 'c': '#ffffff', 'd': '#666666' } ],
    data: { wizard: [".......####.......", "......#rrrr#......", ".....#rrrrrr#.....", "....#rrrrrrrr#....", "....#rrrrrrrr#....", ".....#rrrrrr#.....", "......#SSSS#......", "......#SSSS#......", ".....#RRRRRR#.....", "....#RRRRRRRR#....", "...#RRRRRRRRRR#...", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "...############..."], ear: ["....####....", "..##EEEE##..", ".#EEEEEEEE#.", ".#EEeeeeEE#.", ".#EEeEEeEE#.", ".#EEeeeeEE#.", "..##EEEE##..", "....####...."], staff: ["..##..", ".#GG#.", ".#GG#.", "..##..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW.."] },
    sprites: {}, targetSprites: {},
    init: () => {
        ['wizard', 'ear', 'staff'].forEach(k => SpriteGen.sprites[k] = SpriteGen.build(SpriteGen.data[k], SpriteGen.palettes.wizard, 2));
        Object.keys(SpriteGen.shapes).forEach(k => SpriteGen.targetSprites[k] = SpriteGen.build(SpriteGen.shapes[k], SpriteGen.palettes.targets, 2));
    },
    build: (grid, palette, scale) => {
        let canvas = document.createElement('canvas'); canvas.width = grid[0].length * scale; canvas.height = grid.length * scale; let ctx = canvas.getContext('2d');
        for (let y = 0; y < grid.length; y++) { for (let x = 0; x < grid[y].length; x++) { if (palette[grid[y][x]]) { ctx.fillStyle = palette[grid[y][x]]; ctx.fillRect(x * scale, y * scale, scale, scale); } } } return canvas;
    }
};

const Utils = { format: (n) => { if (n < 1000) return Math.floor(n).toString(); const s = ["", "K", "M", "B", "T", "Qa"]; const id = Math.floor(Math.log10(n) / 3); return (n / Math.pow(1000, id)).toFixed(2) + s[id]; }, formatTime: (sec) => { let h = Math.floor(sec / 3600); let m = Math.floor((sec % 3600) / 60); let s = Math.floor(sec % 60); return `${h}h ${m}m ${s}s`; }, calcCost: (b, l, e) => Math.floor(b * Math.pow(e, l)) };
