// ==========================================
// 1. BANCO DE DADOS E GERADOR PROCEDURAL
// ==========================================

const Elements = {
    arcane: { id: "arcane", name: "Arcano", color: "#d942ff", glow: "#f2b3ff" },
    lightning: { id: "lightning", name: "Raio", color: "#ffff00", glow: "#ffffe6" },
    ice: { id: "ice", name: "Gelo", color: "#00ffff", glow: "#ccffff" },
    fire: { id: "fire", name: "Fogo", color: "#ff3300", glow: "#ff9966" },
    void: { id: "void", name: "Vazio", color: "#800080", glow: "#d9b3ff" }
};

const MagicBehaviors = {
    normal:  { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false, speed: 300 },
    bounce:  { type: "chain", chains: 3, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: false, speed: 400 },
    pierce:  { type: "base", chains: 0, aoe: false, pierce: true, split: 0, orbit: false, implode: false, wave: false, delay: false, speed: 500 },
    split:   { type: "base", chains: 0, aoe: false, pierce: false, split: 3, orbit: false, implode: false, wave: false, delay: false, speed: 250 },
    orbit:   { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: true, implode: false, wave: false, delay: false, speed: 150 },
    implode: { type: "base", chains: 0, aoe: true, pierce: false, split: 0, orbit: false, implode: true, wave: false, delay: false, speed: 350 },
    delay:   { type: "storm", chains: 0, aoe: true, pierce: false, split: 0, orbit: false, implode: false, wave: false, delay: true, speed: 200 },
    wave:    { type: "base", chains: 0, aoe: false, pierce: false, split: 0, orbit: false, implode: false, wave: true, delay: false, speed: 250 }
};

// As 100 Magias Oficiais
const MasterSpells = [
    { n: "Echo Pulse", e: "arcane", b: "wave" }, { n: "Ripple Surge", e: "arcane", b: "wave" }, { n: "Arc Thread", e: "lightning", b: "bounce" }, { n: "Void Needle", e: "void", b: "pierce" }, { n: "Pulse Shard", e: "arcane", b: "split" }, { n: "Time Pebble", e: "ice", b: "delay" }, { n: "Mana Bloom", e: "arcane", b: "implode" }, { n: "Spiral Shot", e: "fire", b: "orbit" }, { n: "Gravity Flick", e: "void", b: "implode" }, { n: "Lumen Dart", e: "lightning", b: "normal" },
    { n: "Fractal Bloom", e: "ice", b: "split" }, { n: "Mirror Bolt", e: "arcane", b: "split" }, { n: "Split Halo", e: "fire", b: "split" }, { n: "Prism Scatter", e: "lightning", b: "split" }, { n: "Pulse Scatter", e: "arcane", b: "split" }, { n: "Echo Split", e: "void", b: "split" }, { n: "Spiral Fracture", e: "fire", b: "orbit" }, { n: "Nova Seed", e: "fire", b: "delay" }, { n: "Chain Bloom", e: "lightning", b: "bounce" }, { n: "Twin Pulse", e: "arcane", b: "split" },
    { n: "Fold Step", e: "void", b: "pierce" }, { n: "Phase Needle", e: "void", b: "pierce" }, { n: "Warp Drift", e: "arcane", b: "wave" }, { n: "Rift Pebble", e: "void", b: "implode" }, { n: "Loop Orb", e: "ice", b: "orbit" }, { n: "Collapse Orb", e: "void", b: "implode" }, { n: "Orbit Seed", e: "arcane", b: "orbit" }, { n: "Slip Shot", e: "ice", b: "wave" }, { n: "Bend Ray", e: "lightning", b: "wave" }, { n: "Rift Rain", e: "void", b: "split" },
    { n: "Temporal Loop", e: "ice", b: "delay" }, { n: "Delay Burst", e: "fire", b: "delay" }, { n: "Time Fracture", e: "ice", b: "implode" }, { n: "Reverse Pulse", e: "arcane", b: "wave" }, { n: "Future Echo", e: "lightning", b: "delay" }, { n: "Slow Wave", e: "ice", b: "wave" }, { n: "Chrono Spark", e: "lightning", b: "normal" }, { n: "Memory Bolt", e: "arcane", b: "bounce" }, { n: "Time Scatter", e: "void", b: "split" }, { n: "Paradox Seed", e: "void", b: "delay" },
    { n: "Mana Torrent", e: "arcane", b: "pierce" }, { n: "Flux Shard", e: "lightning", b: "split" }, { n: "Energy Bloom", e: "fire", b: "implode" }, { n: "Pulse Garden", e: "arcane", b: "orbit" }, { n: "Arc Burst", e: "lightning", b: "implode" }, { n: "Resonance Beam", e: "arcane", b: "pierce" }, { n: "Cascade Pulse", e: "ice", b: "bounce" }, { n: "Static Halo", e: "lightning", b: "orbit" }, { n: "Charge Orb", e: "fire", b: "delay" }, { n: "Surge Ray", e: "lightning", b: "pierce" },
    { n: "Magnet Pulse", e: "void", b: "implode" }, { n: "Repel Burst", e: "fire", b: "implode" }, { n: "Orbit Field", e: "ice", b: "orbit" }, { n: "Merge Spark", e: "lightning", b: "normal" }, { n: "Split Engine", e: "arcane", b: "split" }, { n: "Reflect Core", e: "ice", b: "bounce" }, { n: "Chain Reactor", e: "lightning", b: "bounce" }, { n: "Pulse Engine", e: "fire", b: "normal" }, { n: "Echo Reactor", e: "arcane", b: "wave" }, { n: "Fractal Reactor", e: "void", b: "split" },
    { n: "Dream Needle", e: "void", b: "pierce" }, { n: "Phantom Bloom", e: "ice", b: "implode" }, { n: "Illusion Pulse", e: "arcane", b: "wave" }, { n: "Shadow Thread", e: "void", b: "bounce" }, { n: "Spectral Orb", e: "ice", b: "orbit" }, { n: "Mirage Shot", e: "arcane", b: "split" }, { n: "Nightmare Seed", e: "void", b: "delay" }, { n: "Ghost Ripple", e: "ice", b: "wave" }, { n: "Ether Drift", e: "arcane", b: "wave" }, { n: "Spirit Burst", e: "void", b: "implode" },
    { n: "Whisper Bolt", e: "ice", b: "normal" }, { n: "Echo Phantom", e: "arcane", b: "delay" }, { n: "Memory Pulse", e: "lightning", b: "bounce" }, { n: "Fade Needle", e: "void", b: "pierce" }, { n: "Void Whisper", e: "void", b: "implode" }, { n: "Soul Thread", e: "arcane", b: "bounce" }, { n: "Shade Bloom", e: "void", b: "implode" }, { n: "Spectral Storm", e: "ice", b: "split" }, { n: "Dream Cascade", e: "arcane", b: "bounce" }, { n: "Phantom Nova", e: "void", b: "implode" },
    { n: "Chaos Spark", e: "lightning", b: "split" }, { n: "Entropy Burst", e: "fire", b: "delay" }, { n: "Random Echo", e: "arcane", b: "bounce" }, { n: "Collapse Rain", e: "void", b: "split" }, { n: "Rift Bloom", e: "void", b: "implode" }, { n: "Paradox Bolt", e: "ice", b: "pierce" }, { n: "Singularity Seed", e: "void", b: "implode" }, { n: "Flux Nova", e: "fire", b: "implode" }, { n: "Cascade Rift", e: "arcane", b: "bounce" }, { n: "Reality Tear", e: "void", b: "pierce" },
    { n: "Orbit Chaos", e: "fire", b: "orbit" }, { n: "Pulse Tornado", e: "lightning", b: "orbit" }, { n: "Spiral Storm", e: "ice", b: "split" }, { n: "Echo Singularity", e: "void", b: "implode" }, { n: "Prism Collapse", e: "lightning", b: "implode" }, { n: "Nova Engine", e: "fire", b: "delay" }, { n: "Infinite Split", e: "arcane", b: "split" }, { n: "Chaos Reactor", e: "void", b: "wave" }, { n: "Arcane Cataclysm", e: "arcane", b: "implode" }, { n: "Ear Mage Ascension", e: "lightning", b: "pierce" }
];

const EquipSlots = [
    { id: "wand", name: "Cajado", max: 1 }, { id: "armor", name: "Traje", max: 1 },
    { id: "amulet", name: "Amuleto", max: 1 }, { id: "earring", name: "Brinco", max: 2 }, { id: "ring", name: "Anel", max: 5 }
];

const EquipTiers = [
    { n: "Comum", mult: 1, c: "#a1a1a1" }, { n: "Raro", mult: 3, c: "#3399ff" }, 
    { n: "Épico", mult: 8, c: "#aa33ff" }, { n: "Lendário", mult: 20, c: "#ffd700" }
];

const GameData = {
    items: [], magics: [],
    generate: () => {
        let iid = 0;
        let els = Object.keys(Elements);
        
        EquipTiers.forEach((tier, tIdx) => {
            EquipSlots.forEach(slot => {
                els.forEach(elKey => {
                    let el = Elements[elKey];
                    GameData.items.push({
                        id: iid++, slot: slot.id, slotName: slot.name, 
                        name: `${slot.name} ${tier.n} do ${el.name}`,
                        color: tier.c, element: elKey, 
                        reqLevel: (tIdx * 30) + 1, 
                        cost: Math.floor(200 * Math.pow(2.0, tIdx * 2)),
                        stats: { eleDmg: (0.2 * tier.mult), spd: (0.02 * tier.mult), xp: (0.05 * tier.mult) }
                    });
                });
            });
        });

        MasterSpells.forEach((sp, idx) => {
            let el = Elements[sp.e];
            let b = MagicBehaviors[sp.b];
            let calcCost = Math.floor(100 * Math.pow(1.1, idx));
            
            GameData.magics.push({
                id: idx, name: sp.n, element: sp.e, elementName: el.name,
                color: el.color, glow: el.glow, type: b.type, behavior: sp.b,
                speed: b.speed, chains: b.chains, aoe: b.aoe, pierce: b.pierce, 
                split: b.split, orbit: b.orbit, implode: b.implode, wave: b.wave, delay: b.delay,
                cost: Math.min(5000, calcCost), 
                dmgMult: 1 + (idx * 0.05)
            });
        });
    }
};

const SpriteGen = {
    palettes: { wizard: { '.': null, '#': '#111', 'R': '#4a235a', 'r': '#8e44ad', 'S': '#f5cba7', 'E': '#e67e22', 'e': '#d35400', 'W': '#5c4033', 'G': '#00ffff' } },
    crystalTiers: [ { '#': '#000', 'C': '#00b386', 'c': '#00ffcc', 'd': '#00664d' }, { '#': '#000', 'C': '#0066cc', 'c': '#3399ff', 'd': '#003380' }, { '#': '#000', 'C': '#800080', 'c': '#cc33ff', 'd': '#4d004d' }, { '#': '#000', 'C': '#cc0000', 'c': '#ff4d4d', 'd': '#800000' }, { '#': '#000', 'C': '#b38f00', 'c': '#ffcc00', 'd': '#665200' }, { '#': '#000', 'C': '#cccccc', 'c': '#ffffff', 'd': '#666666' } ],
    data: {
        wizard: [".......####.......", "......#rrrr#......", ".....#rrrrrr#.....", "....#rrrrrrrr#....", "....#rrrrrrrr#....", ".....#rrrrrr#.....", "......#SSSS#......", "......#SSSS#......", ".....#RRRRRR#.....", "....#RRRRRRRR#....", "...#RRRRRRRRRR#...", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "...############..."],
        ear: ["....####....", "..##EEEE##..", ".#EEEEEEEE#.", ".#EEeeeeEE#.", ".#EEeEEeEE#.", ".#EEeeeeEE#.", "..##EEEE##..", "....####...."],
        staff: ["..##..", ".#GG#.", ".#GG#.", "..##..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW.."],
        crystalBase: ["......####......", "....##cccc##....", "...#cccccccc#...", "..#cccccccccc#..", ".#ccCCCCCCCCcc#.", ".#cCCCCCCCCCCd#.", ".#cCCCCCCCCCCd#.", ".#cCCCCCCCCCCd#.", ".#cCCCCCCCCCCd#.", "..#cCCCCCCCCd#..", "...#cCCCCCCd#...", "....##CCCC##....", "......####......"]
    },
    sprites: {}, crystalSprites: [],
    init: () => {
        ['wizard', 'ear', 'staff'].forEach(k => SpriteGen.sprites[k] = SpriteGen.build(SpriteGen.data[k], SpriteGen.palettes.wizard, 2));
        SpriteGen.crystalTiers.forEach(t => SpriteGen.crystalSprites.push(SpriteGen.build(SpriteGen.data.crystalBase, t, 2)));
    },
    build: (grid, palette, scale) => {
        let canvas = document.createElement('canvas'); canvas.width = grid[0].length * scale; canvas.height = grid.length * scale; let ctx = canvas.getContext('2d');
        for (let y = 0; y < grid.length; y++) { for (let x = 0; x < grid[y].length; x++) { if (palette[grid[y][x]]) { ctx.fillStyle = palette[grid[y][x]]; ctx.fillRect(x * scale, y * scale, scale, scale); } } } return canvas;
    }
};

const Locales = { pt: { title: "Ear Mage" }, en: { title: "Ear Mage" } };
const Lang = { current: 'pt', toggle: () => { Lang.current = Lang.current === 'pt' ? 'en' : 'pt'; document.getElementById('btn-lang').innerText = Lang.current === 'pt' ? 'PT' : 'EN'; UI.rebuildAll(); SaveSystem.save(true); } };
const Utils = { 
    format: (n) => { if (n < 1000) return Math.floor(n).toString(); const s = ["", "K", "M", "B", "T", "Qa"]; const id = Math.floor(Math.log10(n) / 3); return (n / Math.pow(1000, id)).toFixed(2) + s[id]; }, 
    formatTime: (sec) => { let h = Math.floor(sec / 3600); let m = Math.floor((sec % 3600) / 60); let s = Math.floor(sec % 60); return `${h}h ${m}m ${s}s`; }, 
    calcCost: (b, l, e) => Math.floor(b * Math.pow(e, l)) 
};
