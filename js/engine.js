// ==========================================
// 6. ENGINE LOOP E INICIALIZAÇÃO GERAL
// ==========================================

const Engine = {
    lastTime: Date.now(), 
    init: () => {
        GameData.generate(); 
        SpriteGen.init(); 
        
        // Verifica se tem save ou cria um novo
        let offlineTime = 0;
        if(typeof SaveSystem !== 'undefined') {
             offlineTime = SaveSystem.load(); 
        }
        
        Player.checkCombos();
        Combat.init(); 
        Renderer.init(); 
        UI.init();
        
        // Mecânica de Ganhos Offline
        if (offlineTime > 60) {
            let offCap = Math.min(offlineTime, 86400); 
            let dps = Combat.stats.damage * Combat.stats.attackSpeed * (1 + Player.equippedMagics.filter(m=>m!==null).length); 
            let kills = Math.floor((dps * offCap) / Combat.getTargetMaxHp());
            if (kills > 0) { 
                Economy.gold += kills * Combat.getTargetGold(); 
                Economy.energy += Math.floor(kills * Combat.stats.engDrop); 
                Player.gainXp(kills * 100 * Economy.targetLevel); 
                UI.showToast(`Ganho Offline: +${Utils.format(kills * Combat.getTargetGold())} Ouro!`); 
            }
        }
        
        // Salva periodicamente a cada 5 segundos
        SaveSystem.save(true); 
        setInterval(() => SaveSystem.save(true), 5000); 
        window.addEventListener('beforeunload', () => SaveSystem.save(true)); 
        
        Engine.lastTime = Date.now(); 
        requestAnimationFrame(Engine.loop);
    },
    
    loop: () => { 
        try { 
            let now = Date.now(); 
            let dt = (now - Engine.lastTime) / 1000; 
            
            // Limitador de tempo para quando a aba for minimizada não quebrar o jogo
            if (dt < 0) dt = 0; 
            if (dt > 0.1) dt = 0.1; 
            
            Engine.lastTime = now; 
            
            Stats.timePlayed += dt; 
            Skills.update(dt); 
            Combat.update(dt); 
            UI.update(); 
            Renderer.draw(dt); 
        } catch(err) { 
            console.error("Erro no GameLoop:", err); 
        } 
        
        requestAnimationFrame(Engine.loop); 
    }
};

window.onload = Engine.init;
