/**
 * =======================================================
 * 5. MOTOR DE RENDERIZAÇÃO (ILUMINAÇÃO)
 * =======================================================
 */

const Renderer = {
    canvas: null, ctx: null, shake: 0, time: 0, clouds: [], levelUpAuraTimer: 0,
    
    init: () => { 
        Renderer.canvas = document.getElementById('gameCanvas'); 
        Renderer.ctx = Renderer.canvas.getContext('2d'); 
        Renderer.ctx.imageSmoothingEnabled = false; 
        for(let i=0; i<5; i++) Renderer.clouds.push({x: Math.random()*480, y: Math.random()*80, s: Math.random()*5+2}); 
    },
    
    drawBackground: (dt) => { 
        let ctx = Renderer.ctx; let w = 480; let h = 270; 
        
        if(Player.comboActive) {
            let comboColor = Elements[Player.comboActive].color;
            ctx.fillStyle = comboColor; ctx.globalAlpha = 0.15; ctx.fillRect(0, 0, w, h); ctx.globalAlpha = 1.0;
        } else {
            ctx.fillStyle = '#0d0814'; ctx.fillRect(0, 0, w, h); 
        }
        
        ctx.fillStyle = '#1a1423'; 
        Renderer.clouds.forEach(c => { 
            c.x -= c.s * dt; 
            if(c.x < -50) { c.x = w + 10; c.y = Math.random()*80; } 
            ctx.fillRect(Math.floor(c.x), Math.floor(c.y), 40, 10); 
            ctx.fillRect(Math.floor(c.x)+5, Math.floor(c.y)-5, 20, 5); 
        }); 
        
        let gy = 200; 
        ctx.fillStyle = '#0a0c12'; ctx.fillRect(0, gy, w, h); 
        ctx.fillStyle = '#1a2421'; ctx.fillRect(0, gy, w, 4); 
        ctx.fillStyle = '#08090e'; ctx.fillRect(350, gy - 70, 40, 70); ctx.fillRect(360, gy - 90, 20, 20); 
    },
    
    drawWizard: () => { 
        let ctx = Renderer.ctx; let x = 40; 
        let fY = Math.floor(Math.sin(Renderer.time * 3) * 2); let y = 180 + fY; 
        
        ctx.save(); 
        ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(x-10, 202, 20, 4); 
        ctx.drawImage(SpriteGen.sprites.wizard, x - 18, y - 30); 
        
        let sY = Math.floor(Math.sin(Renderer.time * 4) * 3); 
        ctx.drawImage(SpriteGen.sprites.staff, x + 5, y - 20 + sY); 
        
        ctx.globalCompositeOperation = 'screen';
        if (Combat.muzzleFlash > 0) { 
            ctx.fillStyle = '#d942ff'; ctx.shadowBlur = 20; ctx.shadowColor = '#d942ff'; 
            ctx.beginPath(); ctx.arc(x+11, y-15+sY, 8 + Math.random()*4, 0, Math.PI*2); ctx.fill(); 
        } 
        ctx.globalCompositeOperation = 'source-over'; ctx.shadowBlur = 0;

        let eOff = Math.floor(Math.sin(Renderer.time * 6) * 1.5); 
        ctx.drawImage(SpriteGen.sprites.ear, x - 2 + eOff, y - 24); 
        
        if (Renderer.levelUpAuraTimer > 0) {
            let p = 1 - (Renderer.levelUpAuraTimer / 2.0); 
            let baseFeetY = y + 10; let currentY = baseFeetY - (p * 50); 
            ctx.shadowBlur = 10; ctx.lineWidth = 2; ctx.globalAlpha = Renderer.levelUpAuraTimer / 2.0; 
            for(let i=0; i<3; i++) { 
                let ringY = currentY + (i * 10); 
                if(ringY > baseFeetY) continue; 
                let scale = Math.sin(Renderer.time * 10 + i) * 0.5 + 0.5; 
                ctx.strokeStyle = i % 2 === 0 ? '#ffd700' : '#00ffcc'; 
                ctx.shadowColor = i % 2 === 0 ? '#ffd700' : '#00ffcc'; 
                ctx.beginPath(); ctx.ellipse(x - 2, ringY, 20, 6 + scale * 4, 0, 0, Math.PI*2); ctx.stroke(); 
            }
        }
        ctx.restore(); 
    },
    
    draw: (dt) => { 
        Renderer.time += dt; 
        if (Renderer.levelUpAuraTimer > 0) Renderer.levelUpAuraTimer -= dt;

        let ctx = Renderer.ctx; 
        ctx.clearRect(0, 0, 480, 270); 
        ctx.save(); 
        
        if (Renderer.shake > 0) { 
            ctx.translate(Math.floor((Math.random()-0.5)*Renderer.shake), Math.floor((Math.random()-0.5)*Renderer.shake)); 
            Renderer.shake -= dt * 15; 
        } 
        
        Renderer.drawBackground(dt); 
        Renderer.drawWizard(); 
        
        ctx.globalCompositeOperation = 'screen';
        Combat.shockwaves.forEach(s => s.draw(ctx)); 
        Combat.lightnings.forEach(l => l.draw(ctx)); 
        Combat.particles.forEach(p => p.draw(ctx)); 
        Combat.projectiles.forEach(p => p.draw(ctx)); 
        
        ctx.globalCompositeOperation = 'source-over';
        Combat.portals.forEach(p => p.draw(ctx)); 
        Combat.targets.forEach(t => t.draw(ctx)); 
        Combat.texts.forEach(t => t.draw(ctx)); 
        
        ctx.restore(); 
    }
};
