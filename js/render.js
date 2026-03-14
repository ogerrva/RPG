/**
 * =======================================================
 * 5. MOTOR DE RENDERIZAÇÃO (EFEITOS GRÁFICOS DO CANVAS)
 * Arquivo: js/render.js
 * =======================================================
 */

const Renderer = {
    canvas: null, 
    ctx: null, 
    shake: 0, 
    time: 0, 
    clouds: [], 
    levelUpAuraTimer: 0, // Controla o tempo da aura mágica ao subir de Nível Global
    
    init: () => { 
        Renderer.canvas = document.getElementById('gameCanvas'); 
        Renderer.ctx = Renderer.canvas.getContext('2d'); 
        
        // Desativa a suavização para manter a estética Pixel Art perfeita
        Renderer.ctx.imageSmoothingEnabled = false; 
        
        // Gera as nuvens de fundo em posições aleatórias
        for(let i = 0; i < 5; i++) {
            Renderer.clouds.push({
                x: Math.random() * 480, 
                y: Math.random() * 80, 
                s: Math.random() * 5 + 2 // Velocidade
            }); 
        }
    },
    
    drawBackground: (dt) => { 
        let ctx = Renderer.ctx; 
        let w = Renderer.canvas.width; 
        let h = Renderer.canvas.height; 
        
        // 1. CÉU E COMBOS (Sinergia)
        if(Player.comboActive) {
            // Se o jogador ativar um combo de 5 magias iguais, o céu muda de cor!
            let comboColor = Elements[Player.comboActive].color;
            ctx.fillStyle = '#0d0814'; // Fundo base
            ctx.fillRect(0, 0, w, h); 
            ctx.fillStyle = comboColor; 
            ctx.globalAlpha = 0.15; // Tint leve para criar a atmosfera elemental
            ctx.fillRect(0, 0, w, h); 
            ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = '#0d0814'; 
            ctx.fillRect(0, 0, w, h); 
        }
        
        // 2. NUVENS EM PARALLAX
        ctx.fillStyle = '#1a1423'; 
        Renderer.clouds.forEach(c => { 
            c.x -= c.s * dt; 
            if(c.x < -50) { // Respawna a nuvem à direita
                c.x = w + 10; 
                c.y = Math.random() * 80; 
            } 
            ctx.fillRect(Math.floor(c.x), Math.floor(c.y), 40, 10); 
            ctx.fillRect(Math.floor(c.x) + 5, Math.floor(c.y) - 5, 20, 5); 
        }); 
        
        // 3. CHÃO E GRAMA
        let gy = 200; 
        ctx.fillStyle = '#0a0c12'; 
        ctx.fillRect(0, gy, w, h); 
        
        ctx.fillStyle = '#1a2421'; 
        ctx.fillRect(0, gy, w, 4); 
        
        // 4. CASTELO/RUÍNA DE FUNDO
        ctx.fillStyle = '#08090e'; 
        ctx.fillRect(350, gy - 70, 40, 70); 
        ctx.fillRect(360, gy - 90, 20, 20); 
    },
    
    drawWizard: () => { 
        let ctx = Renderer.ctx; 
        let x = 40; // Posição base
        
        // Efeito de respiração flutuante
        let fY = Math.floor(Math.sin(Renderer.time * 3) * 2); 
        let y = 180 + fY; 
        
        ctx.save(); 
        
        // Sombra no chão (dinâmica com a altura do pulo)
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; 
        ctx.fillRect(x - 10, 202, 20, 4); 
        
        // Corpo do Mago
        ctx.drawImage(SpriteGen.sprites.wizard, x - 18, y - 30); 
        
        // O Cajado tem uma levitação independente
        let sY = Math.floor(Math.sin(Renderer.time * 4) * 3); 
        ctx.drawImage(SpriteGen.sprites.staff, x + 5, y - 20 + sY); 
        
        // Muzzle Flash (Efeito de brilho na ponta do cajado ao atirar)
        ctx.globalCompositeOperation = 'screen'; // Faz o brilho ficar igual a Neon/Luz
        if (Combat.muzzleFlash > 0) { 
            ctx.fillStyle = '#d942ff'; 
            ctx.shadowBlur = 20; 
            ctx.shadowColor = '#d942ff'; 
            ctx.beginPath(); 
            ctx.arc(x + 11, y - 15 + sY, 8 + Math.random() * 4, 0, Math.PI * 2); 
            ctx.fill(); 
        } else { 
            // Brilho passivo calmo
            ctx.fillStyle = 'rgba(0, 255, 255, 0.2)'; 
            ctx.beginPath(); 
            ctx.arc(x + 11, y - 15 + sY, 6, 0, Math.PI * 2); 
            ctx.fill(); 
        } 
        ctx.globalCompositeOperation = 'source-over'; 
        ctx.shadowBlur = 0; // Desliga as sombras

        // A Orelha do Mago que pulsa e vibra
        let eOff = Math.floor(Math.sin(Renderer.time * 6) * 1.5); 
        ctx.drawImage(SpriteGen.sprites.ear, x - 2 + eOff, y - 24); 
        
        // ==========================================
        // ANIMAÇÃO DE LEVEL UP (Aura Espiral 3D)
        // ==========================================
        if (Renderer.levelUpAuraTimer > 0) {
            let p = 1 - (Renderer.levelUpAuraTimer / 2.0); // Vai de 0.0 a 1.0 (2 Segundos)
            let baseFeetY = y + 10; 
            let currentY = baseFeetY - (p * 50); // A aura sobe 50 pixels até a cabeça
            
            ctx.shadowBlur = 10; 
            ctx.lineWidth = 2; 
            ctx.globalAlpha = Math.max(0, Renderer.levelUpAuraTimer / 2.0); // Fades out suavemente
            
            // Desenha 3 anéis que formam um tornado
            for(let i = 0; i < 3; i++) { 
                let ringY = currentY + (i * 10); 
                if(ringY > baseFeetY) continue; // Não desenha se estiver embaixo do chão
                
                // Cálculo mágico para fazer a elipse "rodar" simulando 3D
                let scale = Math.sin(Renderer.time * 10 + i) * 0.5 + 0.5; 
                
                // Intercala a cor dos anéis (Ouro e Ciano de XP)
                ctx.strokeStyle = i % 2 === 0 ? '#ffd700' : '#00ffcc'; 
                ctx.shadowColor = i % 2 === 0 ? '#ffd700' : '#00ffcc'; 
                
                ctx.beginPath(); 
                ctx.ellipse(x - 2, ringY, 20, 6 + scale * 4, 0, 0, Math.PI * 2); 
                ctx.stroke(); 
            }
        }
        ctx.restore(); 
    },
    
    draw: (dt) => { 
        Renderer.time += dt; 
        
        if (Renderer.levelUpAuraTimer > 0) {
            Renderer.levelUpAuraTimer -= dt;
        }

        let ctx = Renderer.ctx; 
        ctx.clearRect(0, 0, Renderer.canvas.width, Renderer.canvas.height); 
        ctx.save(); 
        
        // Efeito de Tremor da Tela (Sempre que um cristal quebra)
        if (Renderer.shake > 0) { 
            let dx = Math.floor((Math.random() - 0.5) * Renderer.shake);
            let dy = Math.floor((Math.random() - 0.5) * Renderer.shake);
            ctx.translate(dx, dy); 
            Renderer.shake -= dt * 15; 
        } 
        
        // 1. Renderiza o cenário
        Renderer.drawBackground(dt); 
        
        // 2. Renderiza o Herói
        Renderer.drawWizard(); 
        
        // 3. Renderiza Luzes, Lasers e Explosões (Com o Composite Screen Ativo)
        ctx.globalCompositeOperation = 'screen';
        
        Combat.shockwaves.forEach(s => s.draw(ctx)); 
        Combat.lightnings.forEach(l => l.draw(ctx)); 
        Combat.particles.forEach(p => p.draw(ctx)); 
        Combat.projectiles.forEach(p => p.draw(ctx)); 
        
        // 4. Renderiza Entidades Sólidas (Composite Normal)
        ctx.globalCompositeOperation = 'source-over';
        
        Combat.portals.forEach(p => p.draw(ctx)); 
        Combat.targets.forEach(t => t.draw(ctx)); 
        Combat.texts.forEach(t => t.draw(ctx)); 
        
        ctx.restore(); 
    }
};
