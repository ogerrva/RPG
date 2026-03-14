/**
 * =======================================================
 * 7. SISTEMA DE SAVE INDESTRUTÍVEL (COM MIGRAÇÃO DE DADOS)
 * =======================================================
 */

const SaveSystem = {
    key: 'earMageSaveData_Final100',
    save: (silent = false) => {
        try {
            let data = { 
                timestamp: Date.now(), 
                lang: Lang.current, 
                stats: Stats, 
                player: Player, 
                economy: { 
                    g: Economy.gold, 
                    e: Economy.energy, 
                    tl: Economy.targetLevel, 
                    tc: Economy.targetCount 
                }, 
                skills: { 
                    actArr: Skills.activeSkills, 
                    d: Skills.list.map(s => ({ id: s.id, l: s.level, x: s.xp })) 
                }
            };
            localStorage.setItem(SaveSystem.key, JSON.stringify(data));
            
            if (!silent) { 
                let ind = document.getElementById('save-indicator'); 
                if(ind){ 
                    ind.style.opacity = 1; 
                    setTimeout(() => ind.style.opacity = 0, 2000); 
                } 
            }
        } catch(e) {
            console.error("Falha ao salvar o progresso:", e);
        }
    },
    
    load: () => {
        // Tenta achar o save novo. Se não achar, procura a chave do save antigo para não perder progresso
        let saved = localStorage.getItem(SaveSystem.key) || localStorage.getItem('earMageSaveData_EpicBuilds'); 
        if (!saved) return 0;
        
        try {
            let d = JSON.parse(saved); 
            Lang.current = d.lang || 'pt'; 
            
            if (d.stats) Object.assign(Stats, d.stats);
            
            if (d.player) { 
                Player.level = d.player.level || 1; 
                Player.xp = d.player.xp || 0; 
                Player.resets = d.player.resets || 0; 
                Player.statPoints = d.player.statPoints || 0; 
                Player.pointsSpent = d.player.pointsSpent || { dmg: 0, spd: 0, crit: 0, xp: 0, eng: 0 }; 
                
                if(d.player.inventory) Player.inventory = d.player.inventory;
                
                if(d.player.equipped) {
                    Player.equipped.wand = Array.isArray(d.player.equipped.wand) ? d.player.equipped.wand : [null];
                    Player.equipped.armor = Array.isArray(d.player.equipped.armor) ? d.player.equipped.armor : [null];
                    Player.equipped.amulet = Array.isArray(d.player.equipped.amulet) ? d.player.equipped.amulet : [null];
                    Player.equipped.earring = Array.isArray(d.player.equipped.earring) ? d.player.equipped.earring : [null, null];
                    Player.equipped.ring = Array.isArray(d.player.equipped.ring) ? d.player.equipped.ring : [null, null, null, null, null];
                }
                
                if(d.player.equippedMagics) {
                    Player.equippedMagics = Array.isArray(d.player.equippedMagics) ? d.player.equippedMagics : [null, null, null, null, null];
                    while(Player.equippedMagics.length < 5) Player.equippedMagics.push(null);
                }
            }
            
            if (d.economy) { 
                Economy.gold = parseFloat(d.economy.g) || 0; 
                Economy.energy = parseFloat(d.economy.e) || 0; 
                Economy.targetLevel = Math.max(1, parseInt(d.economy.tl) || 1); 
                Economy.targetCount = Math.max(1, parseInt(d.economy.tc) || 1); 
            }
            
            if (d.skills) { 
                Skills.activeSkills = Array.isArray(d.skills.actArr) && d.skills.actArr.length > 0 ? d.skills.actArr : ["p1"]; 
                if(d.skills.d) {
                    d.skills.d.forEach(s => { 
                        let targetSkill = Skills.list.find(sk => sk.id === s.id);
                        if(targetSkill){ 
                            targetSkill.level = parseInt(s.l) || 0; 
                            targetSkill.xp = parseFloat(s.x) || 0; 
                        }
                    }); 
                }
            }
            return (Date.now() - (d.timestamp || Date.now())) / 1000;
        } catch(e) { 
            console.error("Save corrompido. Iniciando um novo jogo.");
            return 0; 
        }
    },
    
    hardReset: () => { 
        if (confirm("Isto apagará TODO O SEU PROGRESSO permanentemente (Reset de Máquina). Você voltará ao zero. Tem certeza?")) { 
            localStorage.removeItem(SaveSystem.key); 
            location.reload(); 
        } 
    }
};

/**
 * =======================================================
 * 8. ENGINE LOOP (CORAÇÃO DO JOGO)
 * =======================================================
 */
const Engine = {
    lastTime: Date.now(), 
    
    init: () => {
        // 1. Gera os 100 poderes e os itens
        GameData.generate(); 
        
        // 2. Inicializa as habilidades base (Prática)
        Skills.init();
        
        // 3. Prepara os sprites nativos de Pixel Art
        SpriteGen.init(); 
        
        // 4. Carrega o SaveGame (se houver)
        let offlineTime = SaveSystem.load(); 
        
        // 5. Verifica se há combos armados
        Player.checkCombos();
        
        // 6. Prepara as entidades e os Menus Visuais
        Combat.init(); 
        Renderer.init(); 
        UI.init();
        
        // 7. Sistema de Recompensa Offline (Max 24h)
        if (offlineTime > 60) {
            let offCap = Math.min(offlineTime, 86400); 
            let eqM = Player.equippedMagics.filter(m => m !== null).length;
            
            // Se tiver sem magia nenhuma equipada, ganha pelo ataque básico
            let dps = Combat.stats.damage * Combat.stats.attackSpeed * (1 + eqM); 
            let kills = Math.floor((dps * offCap) / Combat.getTargetMaxHp());
            
            if (kills > 0) { 
                Economy.gold += kills * Combat.getTargetGold() * Economy.goldMult; 
                Economy.energy += Math.floor(kills * Combat.stats.engDrop); 
                Player.gainXp(kills * 100 * Economy.targetLevel); 
                Skills.addXp(kills * 50 * Economy.targetLevel);
                UI.showToast(`Ganho Offline: +${Utils.format(kills * Combat.getTargetGold() * Economy.goldMult)} Ouro!`); 
            }
        }
        
        // 8. Salva inicialmente e liga o Auto-Save
        SaveSystem.save(true); 
        setInterval(() => SaveSystem.save(true), 5000); 
        window.addEventListener('beforeunload', () => SaveSystem.save(true)); 
        
        // 9. Inicia o Loop Temporal
        Engine.lastTime = Date.now(); 
        requestAnimationFrame(Engine.loop);
    },
    
    loop: () => { 
        try { 
            let now = Date.now(); 
            let dt = (now - Engine.lastTime) / 1000; 
            
            // Limitador de tempo para aba hibernando
            if (dt < 0) dt = 0; 
            if (dt > 0.1) dt = 0.1; 
            
            Engine.lastTime = now; 
            
            Stats.timePlayed += dt; 
            Skills.update(dt); 
            Combat.update(dt); 
            UI.update(); 
            Renderer.draw(dt); 
            
        } catch(err) { 
            console.error("Game Loop parou:", err); 
        } 
        
        requestAnimationFrame(Engine.loop); 
    }
};

// Start automático
window.onload = Engine.init;
