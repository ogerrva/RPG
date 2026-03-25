/**
 * ==========================================================================
 * 1. BANCO DE DADOS: ELEMENTOS, SKILL TREE E EQUIPAMENTOS
 * Arquivo: js/data.js
 * ==========================================================================
 */

const Elements = {
    fire: { id: "fire", name: "Fogo", color: "#ff3300", glow: "#ff9966" },
    ice: { id: "ice", name: "Gelo", color: "#00ffff", glow: "#ccffff" },
    lightning: { id: "lightning", name: "Raio", color: "#ffff00", glow: "#ffffe6" },
    wind: { id: "wind", name: "Vento", color: "#00ff88", glow: "#99ffcc" },
    poison: { id: "poison", name: "Veneno", color: "#b300ff", glow: "#d9b3ff" }
};

// ==========================================================================
// A ÁRVORE DE HABILIDADES (50 Skills Únicas)
// "row" define a linha na árvore visual. "req" é o ID da skill necessária.
// ==========================================================================
const SkillTreeData = [
    // ---------------- FOGO (Dano Bruto e Explosões) ----------------
    { id: "f1", el: "fire", n: "Lâmina Aquecida", d: "+10% Dano Base.", cost: 1, req: null, row: 1 },
    { id: "f2", el: "fire", n: "Queimadura", d: "Inimigos queimam (5% dano/s por 3s).", cost: 1, req: "f1", row: 2 },
    { id: "f3", el: "fire", n: "Brasas", d: "10% chance de soltar faíscas em área.", cost: 2, req: "f2", row: 3 },
    { id: "f4", el: "fire", n: "Fúria Ígnea", d: "Menos Mana = Mais Dano (até +50%).", cost: 2, req: "f2", row: 3 },
    { id: "f5", el: "fire", n: "Explosão Menor", d: "20% chance de inimigos explodirem ao morrer.", cost: 3, req: "f3", row: 4 },
    { id: "f6", el: "fire", n: "Rastro de Cinzas", d: "Deixa fogo no chão que queima inimigos.", cost: 3, req: "f4", row: 4 },
    { id: "f7", el: "fire", n: "Coração de Magma", d: "+50% Dano Crítico contra alvos queimando.", cost: 4, req: "f5", row: 5 },
    { id: "f8", el: "fire", n: "Onda de Calor", d: "A cada 10 giros, emite onda que empurra inimigos.", cost: 4, req: "f6", row: 5 },
    { id: "f9", el: "fire", n: "Incinerar", d: "Dobro de dano em inimigos com <20% HP.", cost: 5, req: "f7", row: 6 },
    { id: "f10", el: "fire", n: "Inferno Rotacional", d: "Lâmina de fogo permanente. Explosões em críticos.", cost: 10, req: "f9", row: 7 },

    // ---------------- GELO (Controle e Sobrevivência) ----------------
    { id: "i1", el: "ice", n: "Toque Gélido", d: "Inimigos ficam 10% mais lentos.", cost: 1, req: null, row: 1 },
    { id: "i2", el: "ice", n: "Frio Cortante", d: "+15% Dano contra inimigos lentos.", cost: 1, req: "i1", row: 2 },
    { id: "i3", el: "ice", n: "Estilhaços", d: "15% chance de disparar 3 estilhaços de gelo.", cost: 2, req: "i2", row: 3 },
    { id: "i4", el: "ice", n: "Congelamento", d: "5% chance de congelar o inimigo por 2s.", cost: 2, req: "i2", row: 3 },
    { id: "i5", el: "ice", n: "Armadura de Gelo", d: "-10% Custo de Mana se houver inimigos congelados.", cost: 3, req: "i3", row: 4 },
    { id: "i6", el: "ice", n: "Nevasca", d: "A cada 5s, reduz a velocidade de todos em 30%.", cost: 3, req: "i4", row: 4 },
    { id: "i7", el: "ice", n: "Quebrar Gelo", d: "Acertar alvo congelado causa 300% de dano.", cost: 4, req: "i5", row: 5 },
    { id: "i8", el: "ice", n: "Aura Gélida", d: "Inimigos próximos perdem 5% HP/s.", cost: 4, req: "i6", row: 5 },
    { id: "i9", el: "ice", n: "Cristalização", d: "Inimigos congelados mortos dão +20% Ouro.", cost: 5, req: "i7", row: 6 },
    { id: "i10", el: "ice", n: "Zero Absoluto", d: "Anel de gelo sólido. Inimigos nascem com 50% lentidão.", cost: 10, req: "i9", row: 7 },

    // ---------------- RAIO (Velocidade e Cadeia) ----------------
    { id: "l1", el: "lightning", n: "Fagulha", d: "+10% Velocidade de Rotação.", cost: 1, req: null, row: 1 },
    { id: "l2", el: "lightning", n: "Arco Elétrico", d: "20% chance do dano pular para 1 inimigo.", cost: 1, req: "l1", row: 2 },
    { id: "l3", el: "lightning", n: "Sobrecarga", d: "+30% Mana Máxima.", cost: 2, req: "l2", row: 3 },
    { id: "l4", el: "lightning", n: "Condutor", d: "Cada pulo elétrico aumenta a Rotação em 1%.", cost: 2, req: "l2", row: 3 },
    { id: "l5", el: "lightning", n: "Tempestade Estática", d: "A cada 15 giros, um raio cai no inimigo mais forte.", cost: 3, req: "l3", row: 4 },
    { id: "l6", el: "lightning", n: "Choque Crítico", d: "Críticos têm 100% chance de gerar Arco Elétrico.", cost: 3, req: "l4", row: 4 },
    { id: "l7", el: "lightning", n: "Eletromagnetismo", d: "Ouro é atraído instantaneamente.", cost: 4, req: "l5", row: 5 },
    { id: "l8", el: "lightning", n: "Curto-Circuito", d: "10% chance de atordoar inimigos atingidos por raios.", cost: 4, req: "l6", row: 5 },
    { id: "l9", el: "lightning", n: "Bateria Viva", d: "+50% Regen de Mana na velocidade máxima.", cost: 5, req: "l7", row: 6 },
    { id: "l10", el: "lightning", n: "Deus do Trovão", d: "Feixe de luz. Arcos pulam infinitamente.", cost: 10, req: "l9", row: 7 },

    // ---------------- VENTO (Alcance e Multiplicação) ----------------
    { id: "w1", el: "wind", n: "Brisa Leve", d: "+10% Raio de Alcance.", cost: 1, req: null, row: 1 },
    { id: "w2", el: "wind", n: "Lâmina de Vento", d: "10% chance de disparar lâmina reta perfurante.", cost: 1, req: "w1", row: 2 },
    { id: "w3", el: "wind", n: "Aerodinâmica", d: "-20% Custo de Mana da rotação.", cost: 2, req: "w2", row: 3 },
    { id: "w4", el: "wind", n: "Tornado Menor", d: "A cada 20 giros, cria um mini-tornado.", cost: 2, req: "w2", row: 3 },
    { id: "w5", el: "wind", n: "Vácuo", d: "Inimigos são puxados lentamente para a lâmina.", cost: 3, req: "w3", row: 4 },
    { id: "w6", el: "wind", n: "Corte Duplo", d: "15% chance de acertar duas vezes no mesmo frame.", cost: 3, req: "w4", row: 4 },
    { id: "w7", el: "wind", n: "Vendaval", d: "+20% Rotação se houver >5 inimigos na tela.", cost: 4, req: "w5", row: 5 },
    { id: "w8", el: "wind", n: "Lâmina Fantasma", d: "Lâminas de vento agora perseguem inimigos.", cost: 4, req: "w6", row: 5 },
    { id: "w9", el: "wind", n: "Fôlego Inesgotável", d: "Sem Mana? Gira a 50% da velocidade por 5s grátis.", cost: 5, req: "w7", row: 6 },
    { id: "w10", el: "wind", n: "Furacão Devastador", d: "Tornado verde gigante. Dobra alcance e puxa todos.", cost: 10, req: "w9", row: 7 },

    // ---------------- VENENO (Dano Contínuo e Enfraquecimento) ----------------
    { id: "p1", el: "poison", n: "Lâmina Tóxica", d: "Inimigos envenenados perdem 2% HP Max/s.", cost: 1, req: null, row: 1 },
    { id: "p2", el: "poison", n: "Corrosão", d: "Inimigos envenenados recebem +15% Dano Base.", cost: 1, req: "p1", row: 2 },
    { id: "p3", el: "poison", n: "Nuvem de Gás", d: "Inimigos mortos deixam nuvem tóxica.", cost: 2, req: "p2", row: 3 },
    { id: "p4", el: "poison", n: "Epidemia", d: "Veneno se espalha para inimigos próximos.", cost: 2, req: "p2", row: 3 },
    { id: "p5", el: "poison", n: "Sifão Tóxico", d: "5% do dano de veneno vira Mana.", cost: 3, req: "p3", row: 4 },
    { id: "p6", el: "poison", n: "Necrose", d: "Envenenados por >5s ficam 30% mais lentos.", cost: 3, req: "p4", row: 4 },
    { id: "p7", el: "poison", n: "Veneno Volátil", d: "Críticos em envenenados causam explosão tóxica.", cost: 4, req: "p5", row: 5 },
    { id: "p8", el: "poison", n: "Miasma", d: "Aumenta dano do veneno para 5% HP Max/s.", cost: 4, req: "p6", row: 5 },
    { id: "p9", el: "poison", n: "Decomposição", d: "Inimigos mortos por veneno dão +50% XP.", cost: 5, req: "p7", row: 6 },
    { id: "p10", el: "poison", n: "Praga Absoluta", d: "Rastro de lodo. Todos nascem envenenados.", cost: 10, req: "p9", row: 7 }
];

// ==========================================================================
// GERADOR DE EQUIPAMENTOS (LOOT SYSTEM)
// ==========================================================================
const EquipSlots = [
    { id: "wand", name: "Cajado", max: 1 },
    { id: "armor", name: "Traje", max: 1 },
    { id: "amulet", name: "Amuleto", max: 1 },
    { id: "earring", name: "Brinco", max: 2 },
    { id: "ring", name: "Anel", max: 5 }
];

const EquipTiers = [
    { n: "Comum", mult: 1, c: "#a1a1a1" }, 
    { n: "Raro", mult: 3, c: "#3399ff" }, 
    { n: "Épico", mult: 8, c: "#aa33ff" }, 
    { n: "Lendário", mult: 20, c: "#ffd700" }
];

const ItemPrefixes = ["Destruidor", "Rápido", "Ganancioso", "Erudito", "Divino"];

const GameData = {
    items: [], 
    
    generate: () => {
        let iid = 0;
        let els = Object.keys(Elements);
        
        // Gera 100 Equipamentos Únicos com atributos baseados no Prefixo e no Tier
        EquipTiers.forEach((tier, tIdx) => {
            EquipSlots.forEach(slot => {
                els.forEach(elKey => {
                    let el = Elements[elKey];
                    let prefix = ItemPrefixes[Math.floor(Math.random() * ItemPrefixes.length)];
                    
                    let lvlReq = (tIdx * 30) + 1;
                    let cost = Math.floor(200 * Math.pow(2.0, tIdx * 2));
                    
                    let stats = {
                        eleDmg: 0.1 * tier.mult,
                        spd: prefix === "Rápido" ? 0.05 * tier.mult : 0,
                        goldMult: prefix === "Ganancioso" ? 0.2 * tier.mult : 0,
                        xp: prefix === "Erudito" ? 0.1 * tier.mult : 0,
                        slots: prefix === "Divino" && tIdx > 1 ? 1 : 0 // Apenas Épico/Lendário Divino dão slots extras
                    };

                    GameData.items.push({
                        id: iid++, 
                        slot: slot.id, 
                        slotName: slot.name, 
                        name: `${slot.name} ${prefix} de ${el.name}`,
                        color: tier.c, 
                        element: elKey, 
                        reqLevel: lvlReq, 
                        cost: cost,
                        stats: stats
                    });
                });
            });
        });
    }
};

/**
 * ==========================================================================
 * MOTOR DE SPRITES PIXEL ART (FORMATOS DE INIMIGOS)
 * ==========================================================================
 */
const SpriteGen = {
    palettes: { 
        wizard: { '.': null, '#': '#111', 'R': '#4a235a', 'r': '#8e44ad', 'S': '#f5cba7', 'E': '#e67e22', 'e': '#d35400', 'W': '#5c4033', 'G': '#00ffff' },
        targets: { '.': null, '#': '#000', '1': '#ffffff' } // Cores serão tintadas no draw
    },
    
    // Formatos Diferentes de Alvo! Cristal, Obelisco, Esfera, Estrela
    shapes: {
        crystal: ["......####......", "....##1111##....", "...#11111111#...", "..#1111111111#..", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", "..#1111111111#..", "...#11111111#...", "....##1111##....", "......####......"],
        obelisk: [".......##.......", "......#11#......", ".....#1111#.....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", "....#111111#....", ".....######....."],
        sphere:  ["......####......", "....##1111##....", "...#11111111#...", "..#1111111111#..", ".#111111111111#.", ".#111111111111#.", ".#111111111111#.", "..#1111111111#..", "...#11111111#...", "....##1111##....", "......####......"],
        star:    [".......##.......", ".......##.......", "...##########...", "..#1111111111#..", "...#11111111#...", "....#111111#....", "...#11111111#...", "..#11#....#11#..", ".##..........##."],
    },
    
    crystalTiers: [ 
        { '#': '#000', 'C': '#00b386', 'c': '#00ffcc', 'd': '#00664d' }, 
        { '#': '#000', 'C': '#0066cc', 'c': '#3399ff', 'd': '#003380' }, 
        { '#': '#000', 'C': '#800080', 'c': '#cc33ff', 'd': '#4d004d' }, 
        { '#': '#000', 'C': '#cc0000', 'c': '#ff4d4d', 'd': '#800000' }, 
        { '#': '#000', 'C': '#b38f00', 'c': '#ffcc00', 'd': '#665200' }, 
        { '#': '#000', 'C': '#cccccc', 'c': '#ffffff', 'd': '#666666' } 
    ],
    
    data: {
        wizard: [".......####.......", "......#rrrr#......", ".....#rrrrrr#.....", "....#rrrrrrrr#....", "....#rrrrrrrr#....", ".....#rrrrrr#.....", "......#SSSS#......", "......#SSSS#......", ".....#RRRRRR#.....", "....#RRRRRRRR#....", "...#RRRRRRRRRR#...", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "..#RRRRRRRRRRRR#..", "...############..."],
        ear: ["....####....", "..##EEEE##..", ".#EEEEEEEE#.", ".#EEeeeeEE#.", ".#EEeEEeEE#.", ".#EEeeeeEE#.", "..##EEEE##..", "....####...."],
        staff: ["..##..", ".#GG#.", ".#GG#.", "..##..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW..", "..WW.."]
    },
    
    sprites: {}, 
    targetSprites: {}, 
    
    init: () => {
        ['wizard', 'ear', 'staff'].forEach(k => SpriteGen.sprites[k] = SpriteGen.build(SpriteGen.data[k], SpriteGen.palettes.wizard, 2));
        
        // Constrói os formatos brancos base dos inimigos
        Object.keys(SpriteGen.shapes).forEach(key => {
            SpriteGen.targetSprites[key] = SpriteGen.build(SpriteGen.shapes[key], SpriteGen.palettes.targets, 2);
        });
    },
    
    build: (grid, palette, scale) => {
        let canvas = document.createElement('canvas'); 
        canvas.width = grid[0].length * scale; 
        canvas.height = grid.length * scale; 
        let ctx = canvas.getContext('2d');
        
        for (let y = 0; y < grid.length; y++) { 
            for (let x = 0; x < grid[y].length; x++) { 
                if (palette[grid[y][x]]) { 
                    ctx.fillStyle = palette[grid[y][x]]; 
                    ctx.fillRect(x * scale, y * scale, scale, scale); 
                } 
            } 
        } 
        return canvas;
    }
};
