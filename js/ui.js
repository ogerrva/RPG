/**
 * =======================================================
 * 6. GERENCIADOR DE INTERFACE (MENUS E TOOLTIPS)
 * =======================================================
 */

const UI = {
    needsUpdate: true, 
    needsFullRebuild: false, 
    currentShopFilter: 'wand', 
    currentPracticeFilter: 'corpo',
    currentInvFilter: 'all',
    currentMagicFilter: 'all',
    
    init: () => { 
        UI.rebuildAll(); 
    },
    
    showToast: (msg, isErr = false) => { 
        let c = document.getElementById('toast-container'); 
        let t = document.createElement('div'); 
        t.className = `toast ${isErr ? 'error' : ''}`; 
        t.innerText = msg; 
        c.appendChild(t); 
        setTimeout(() => t.remove(), 2500); 
    },
    
    switchTab: (id) => { 
        document.querySelectorAll('.tab, .tab-content').forEach(t => t.classList.remove('active')); 
        
        let btn = document.getElementById(`tab-btn-${id}`);
        if(btn) btn.classList.add('active');
        
        let content = document.getElementById(`tab-${id}`);
        if(content) content.classList.add('active'); 
    },
    
    filterShop: (slot) => { UI.currentShopFilter = slot; UI.needsFullRebuild = true; },
    filterPractice: (cat) => { UI.currentPracticeFilter = cat; UI.needsFullRebuild = true; },
    filterInv: (cat) => { UI.currentInvFilter = cat; UI.needsFullRebuild = true; },
    filterMagic: (cat) => { UI.currentMagicFilter = cat; UI.needsFullRebuild = true; },
    
    toggleStats: () => { 
        let m = document.getElementById('modal-overlay'); 
        if (m.style.display === 'flex') { 
            m.style.display = 'none'; 
        } else { 
            document.getElementById('stat-dmg').innerText = Utils.format(Combat.stats.damage); 
            document.getElementById('stat-spd').innerText = Combat.stats.attackSpeed.toFixed(2) + "/s"; 
            document.getElementById('stat-crit').innerText = Math.floor(Combat.stats.critChance * 100) + "%"; 
            document.getElementById('stat-xp').innerText = Math.floor(Economy.xpRate * 100) + "%"; 
            document.getElementById('stat-drop').innerText = Math.floor(Combat.stats.engDrop * 100) + "%"; 
            document.getElementById('stat-time').innerText = Utils.formatTime(Stats.timePlayed); 
            document.getElementById('stat-gold').innerText = Utils.format(Stats.totalGold); 
            document.getElementById('stat-kills').innerText = Utils.format(Stats.targetsDestroyed); 
            m.style.display = 'flex'; 
        } 
    },
    
    openEquipModal: (type, slotIdx) => {
        let listHtml = "";
        
        if (type === "magic") {
            document.getElementById('equip-modal-title').innerText = "Selecionar Magia";
            
            let availMagics = Player.inventory.magics.map(id => {
                let m = GameData.magics[id];
                let isEquipped = Player.equippedMagics.includes(id);
                return `<div class="list-item ${isEquipped ? 'equipped' : ''}">
                            <div class="item-header">
                                <span style="color:${m.color}; text-shadow: 1px 1px 0 ${m.glow}">${m.name}</span>
                            </div>
                            <div class="item-desc">${m.desc}</div>
                            <button class="act-btn" onclick="Player.setMagic(${slotIdx}, ${id})">Equipar Aqui</button>
                        </div>`;
            }).join('');
            
            listHtml = `<button class="act-btn btn-danger" style="margin-bottom:15px;" onclick="Player.setMagic(${slotIdx}, null)">Desequipar Slot</button>` + (availMagics || `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Nenhuma magia comprada.</p>`);
            
        } else {
            let slotName = EquipSlots.find(s => s.id === type).name;
            document.getElementById('equip-modal-title').innerText = `Selecionar ${slotName}`;
            
            let availItems = Player.inventory.items.filter(id => GameData.items[id].slot === type).map(id => {
                let i = GameData.items[id];
                let isEquipped = Array.isArray(Player.equipped[type]) ? Player.equipped[type].includes(id) : Player.equipped[type] === id;
                
                let statsHtml = [];
                if(i.stats.eleDmg) statsHtml.push(`+${Math.floor(i.stats.eleDmg*100)}% Dano de ${Elements[i.element].name}`);
                if(i.stats.spd) statsHtml.push(`+${Math.floor(i.stats.spd*100)}% Vel. Ataque`);
                if(i.stats.xp) statsHtml.push(`+${Math.floor(i.stats.xp*100)}% XP Global`);
                if(i.stats.goldMult) statsHtml.push(`+${Math.floor(i.stats.goldMult*100)}% Ouro`);
                if(i.stats.slots) statsHtml.push(`+${i.stats.slots} Slot de Prática`);

                return `<div class="list-item ${isEquipped ? 'equipped' : ''}">
                            <div class="item-header">
                                <span style="color:${i.color}">${i.name}</span>
                            </div>
                            <div class="item-stats">${statsHtml.join('<br>')}</div>
                            <button class="act-btn" onclick="Player.setEquip('${type}', ${slotIdx}, ${id})">Equipar Aqui</button>
                        </div>`;
            }).join('');
            
            listHtml = `<button class="act-btn btn-danger" style="margin-bottom:15px;" onclick="Player.setEquip('${type}', ${slotIdx}, null)">Desequipar Slot</button>` + (availItems || `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Nenhum item desta categoria comprado.</p>`);
        }
        
        document.getElementById('equip-modal-list').innerHTML = listHtml;
        document.getElementById('equip-modal').style.display = 'flex';
    },
    
    closeEquipModal: () => { 
        document.getElementById('equip-modal').style.display = 'none'; 
    },
    
    rebuildAll: () => {
        let l = Locales[Lang.current]; 
        
        // 1. RECONSTROI A ABA DE PRÁTICA COM FILTROS
        let pBtns = `
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'corpo' ? 'active' : ''}" onclick="UI.filterPractice('corpo')">Físico</button>
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'mente' ? 'active' : ''}" onclick="UI.filterPractice('mente')">Mental</button>
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'aura' ? 'active' : ''}" onclick="UI.filterPractice('aura')">Auras</button>
        `;
        document.getElementById('practice-filters').innerHTML = pBtns;
        
        let htmlPractice = Skills.list.filter(s => s.category === UI.currentPracticeFilter).map(s => { 
            let isActive = Skills.activeSkills.includes(s.id); 
            
            let multVal = s.stat === "slots" ? Math.floor(s.level * s.mult) : Math.floor(s.level * s.mult * 100);
            let statsStr = `+${multVal}${s.stat === "slots" ? "" : "%"} ${s.statName}`; 
            
            return `<div class="list-item ${isActive ? 'active' : ''}">
                        <div class="item-header">
                            <span style="color:var(--gold);">${s.name}</span>
                            <span style="color:var(--text-muted)">Lv.<span id="skill-lv-${s.id}">${s.level}</span></span>
                        </div>
                        <div class="item-desc">${s.desc}</div>
                        <div class="item-stats">${statsStr}</div>
                        <div class="progress-bg">
                            <div class="progress-fill" id="skill-prog-${s.id}"></div>
                        </div>
                        <button class="act-btn" style="${isActive ? 'border-color: var(--xp)' : ''}" onclick="Skills.toggleActive('${s.id}')">
                            ${isActive ? 'Treinando...' : 'Treinar'}
                        </button>
                    </div>`; 
        }).join('');
        document.getElementById('practice-list').innerHTML = htmlPractice || `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Nenhum treino disponível.</p>`;

        // 2. RECONSTROI A ABA DE ALVOS
        document.getElementById('targets-list').innerHTML = `
            <div class="list-item">
                <div class="item-header"><span>${l.targetLvl} (Lv.<span id="val-target-lvl">${Economy.targetLevel}</span>)</span></div>
                <div class="item-desc">${l.targetLvlDesc}</div>
                <button class="act-btn" id="btn-upg-lvl" onclick="Economy.buyTargetLevel()">${l.cost}: 🪙 <span id="cost-target-lvl">--</span></button>
            </div>
            <div class="list-item">
                <div class="item-header"><span>${l.targetCnt} (<span id="val-target-cnt">${Economy.targetCount}</span>/10)</span></div>
                <div class="item-desc">${l.targetCntDesc}</div>
                <button class="act-btn" id="btn-upg-cnt" onclick="Economy.buyTargetCount()">${l.cost}: 🪙 <span id="cost-target-cnt">--</span></button>
            </div>`;
        
        // 3. RECONSTROI A ABA DE LOJA COM FILTROS
        let fBtns = EquipSlots.map(s => `<button class="sub-tab-btn ${UI.currentShopFilter === s.id ? 'active' : ''}" onclick="UI.filterShop('${s.id}')">${s.name}s</button>`).join('');
        fBtns += `<button class="sub-tab-btn ${UI.currentShopFilter === 'magic' ? 'active' : ''}" onclick="UI.filterShop('magic')">Grimórios</button>`;
        document.getElementById('shop-filters').innerHTML = fBtns;
        
        if (UI.currentShopFilter === 'magic') {
            document.getElementById('shop-list').innerHTML = GameData.magics.filter(m => !Player.inventory.magics.includes(m.id)).map(m => `
                <div class="list-item">
                    <div class="item-header">
                        <span style="color:${m.color}; text-shadow:1px 1px 0 ${m.glow}">${m.name}</span>
                    </div>
                    <div class="item-desc">${m.desc}</div>
                    <button class="act-btn" onclick="Player.buyMagic(${m.id})">Comprar: 🔮 ${Utils.format(m.cost)}</button>
                </div>`).join('');
        } else {
            document.getElementById('shop-list').innerHTML = GameData.items.filter(i => i.slot === UI.currentShopFilter && !Player.inventory.items.includes(i.id)).map(i => { 
                
                let statsHtml = [];
                if(i.stats.eleDmg) statsHtml.push(`+${Math.floor(i.stats.eleDmg*100)}% Dano de ${Elements[i.element].name}`);
                if(i.stats.spd) statsHtml.push(`+${Math.floor(i.stats.spd*100)}% Vel.`);
                if(i.stats.xp) statsHtml.push(`+${Math.floor(i.stats.xp*100)}% XP`);
                if(i.stats.goldMult) statsHtml.push(`+${Math.floor(i.stats.goldMult*100)}% Ouro`);
                if(i.stats.slots) statsHtml.push(`+${i.stats.slots} Prática`);

                return `
                <div class="list-item">
                    <div class="item-header">
                        <span style="color:${i.color}">${i.name}</span> 
                        <span style="color:var(--text-muted)">Nv.Req ${i.reqLevel}</span>
                    </div>
                    <div class="item-stats">${statsHtml.join(' | ')}</div>
                    <button class="act-btn" onclick="Player.buyItem(${i.id})">Comprar: 🪙 ${Utils.format(i.cost)}</button>
                </div>`; 
            }).join('');
        }

        // Se a loja esvaziar
        if(document.getElementById('shop-list').innerHTML === "") {
            document.getElementById('shop-list').innerHTML = `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Você comprou todos os itens desta categoria.</p>`;
        }

        // 4. RECONSTROI O INVENTÁRIO COM FILTROS DE EXIBIÇÃO
        let invBtns = `<button class="sub-tab-btn ${UI.currentInvFilter === 'all' ? 'active' : ''}" onclick="UI.filterInv('all')">Todos</button>`;
        invBtns += EquipSlots.map(s => `<button class="sub-tab-btn ${UI.currentInvFilter === s.id ? 'active' : ''}" onclick="UI.filterInv('${s.id}')">${s.name}s</button>`).join('');
        document.getElementById('inv-filters').innerHTML = invBtns;

        let eqGrid = EquipSlots.map(s => {
            return Player.equipped[s.id].map((eqId, idx) => {
                let name = eqId !== null ? GameData.items[eqId].name : 'Vazio';
                let color = eqId !== null ? GameData.items[eqId].color : '#888';
                return `<div class="equip-slot ${eqId!==null?'filled':''}" onclick="UI.openEquipModal('${s.id}', ${idx})">
                            ${s.name} <span style="color:${color}">${name}</span>
                        </div>`;
            }).join('');
        }).join('');
        document.getElementById('equip-slots-container').innerHTML = eqGrid;

        let invHtml = Player.inventory.items.filter(id => UI.currentInvFilter === 'all' || GameData.items[id].slot === UI.currentInvFilter).map(id => {
            let i = GameData.items[id];
            let isEquipped = Array.isArray(Player.equipped[i.slot]) ? Player.equipped[i.slot].includes(id) : Player.equipped[i.slot] === id;
            
            let statsHtml = [];
            if(i.stats.eleDmg) statsHtml.push(`+${Math.floor(i.stats.eleDmg*100)}% Dano ${Elements[i.element].name}`);
            if(i.stats.spd) statsHtml.push(`+${Math.floor(i.stats.spd*100)}% Vel.`);
            if(i.stats.xp) statsHtml.push(`+${Math.floor(i.stats.xp*100)}% XP`);
            if(i.stats.goldMult) statsHtml.push(`+${Math.floor(i.stats.goldMult*100)}% Ouro`);
            if(i.stats.slots) statsHtml.push(`+${i.stats.slots} Prática`);

            return `
            <div class="list-item ${isEquipped ? 'equipped' : ''}">
                <div class="item-header"><span style="color:${i.color}">${i.name}</span></div>
                <div class="item-stats">${statsHtml.join(' | ')}</div>
            </div>`;
        }).join('');
        document.getElementById('inventory-list').innerHTML = invHtml || `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Nenhum item encontrado.</p>`;


        // 5. RECONSTROI AS MAGIAS COM FILTROS
        let magBtns = `<button class="sub-tab-btn ${UI.currentMagicFilter === 'all' ? 'active' : ''}" onclick="UI.filterMagic('all')">Todas</button>`;
        magBtns += Object.keys(Elements).map(k => `<button class="sub-tab-btn ${UI.currentMagicFilter === k ? 'active' : ''}" onclick="UI.filterMagic('${k}')">${Elements[k].name}</button>`).join('');
        document.getElementById('magic-filters').innerHTML = magBtns;

        let mSlots = Player.equippedMagics.map((mId, idx) => {
            let name = mId !== null ? GameData.magics[mId].name : 'Vazio';
            let color = mId !== null ? GameData.magics[mId].color : '#888';
            return `<div class="equip-slot ${mId!==null?'filled':''}" onclick="UI.openEquipModal('magic', ${idx})">
                        Slot ${idx+1} <span style="color:${color}">${name}</span>
                    </div>`;
        }).join('');
        document.getElementById('magic-slots-container').innerHTML = mSlots;

        let mInvHtml = Player.inventory.magics.filter(id => UI.currentMagicFilter === 'all' || GameData.magics[id].element === UI.currentMagicFilter).map(id => {
            let m = GameData.magics[id];
            let isEquipped = Player.equippedMagics.includes(id);
            return `
            <div class="list-item ${isEquipped ? 'equipped' : ''}">
                <div class="item-header"><span style="color:${m.color}; text-shadow:1px 1px 0 ${m.glow}">${m.name}</span></div>
                <div class="item-desc">${m.desc}</div>
            </div>`;
        }).join('');
        document.getElementById('magic-inventory-list').innerHTML = mInvHtml || `<p style="font-size:8px; color:gray; text-align:center; padding: 20px;">Nenhuma magia encontrada.</p>`;

        UI.needsUpdate = true;
    },
    
    update: () => {
        if (UI.needsFullRebuild) { 
            UI.rebuildAll(); 
            UI.needsFullRebuild = false; 
        }
        
        if (!UI.needsUpdate && Math.random() > 0.1) return; 
        UI.needsUpdate = false;

        document.getElementById('val-gold').innerText = Utils.format(Economy.gold); 
        document.getElementById('val-energy').innerText = Utils.format(Economy.energy);
        document.getElementById('val-player-lvl').innerText = Player.level; 
        document.getElementById('val-resets').innerText = Player.resets; 
        document.getElementById('player-xp-bar').style.width = `${Math.min(100, (Player.xp / Player.getReqXp()) * 100)}%`;
        
        // Feedback de Combos Secretos e Supremas
        let comboAlert = document.getElementById('combo-display');
        if (Player.comboActive || Player.secretCombo) { 
            comboAlert.style.display = 'block'; 
            if(Player.secretCombo) {
                comboAlert.innerText = `🔥 COMBO SECRETO: ${Player.secretCombo}! 🔥`;
            } else {
                comboAlert.innerText = `✨ AURA SUPREMA: Domínio de ${Elements[Player.comboActive].name}! (+100% Dano Global) ✨`; 
            }
        } else { 
            comboAlert.style.display = 'none'; 
        }
        
        document.getElementById('magic-count').innerText = Player.equippedMagics.filter(m => m !== null).length;

        // Atualiza a aba MU Online Reset
        document.getElementById('val-stat-pts').innerText = Player.statPoints;
        ['dmg', 'spd', 'crit', 'xp', 'eng'].forEach(k => { 
            let e = document.getElementById(`pts-${k}`); 
            if(e) e.innerText = Player.pointsSpent[k]; 
        });
        
        let resetBtn = document.getElementById('btn-do-reset'); 
        if (resetBtn) { 
            if (Player.level < 350) { 
                resetBtn.disabled = true; 
                resetBtn.innerText = `Requer Nível 350`; 
            } else { 
                resetBtn.disabled = false; 
                resetBtn.innerText = `Resetar e Ganhar +${Prestige.calcPending()} Pontos`; 
            } 
        }
        
        // DPS Metter Constante
        let now = performance.now(); 
        Economy.dpsHistory = Economy.dpsHistory.filter(h => now - h.time <= 1000); 
        let vDps = document.getElementById('val-dps'); 
        if(vDps) vDps.innerText = Utils.format(Economy.dpsHistory.reduce((s, h) => s + h.val, 0));
        
        // Target Costs
        let tL = document.getElementById('val-target-lvl'); if(tL) tL.innerText = Economy.targetLevel; 
        let tC = document.getElementById('val-target-cnt'); if(tC) tC.innerText = Economy.targetCount;
        
        let cLvl = Utils.calcCost(15, Economy.targetLevel - 1, 1.8); 
        let cCnt = Utils.calcCost(50, Economy.targetCount - 1, 2.5);
        
        let csL = document.getElementById('cost-target-lvl'); 
        let btL = document.getElementById('btn-upg-lvl'); 
        if(csL && btL) { 
            csL.innerText = Utils.format(cLvl); 
            btL.disabled = Economy.gold < cLvl; 
        }
        
        let csC = document.getElementById('cost-target-cnt'); 
        let btC = document.getElementById('btn-upg-cnt'); 
        if (btC && csC) { 
            if (Economy.targetCount >= 10) { 
                btC.innerText = "MÁX"; 
                btC.disabled = true; 
            } else { 
                csC.innerText = Utils.format(cCnt); 
                btC.disabled = Economy.gold < cCnt; 
            } 
        }
        
        // Updates da Barra de XP na Prática
        Skills.activeSkills.forEach(id => { 
            let act = Skills.list.find(s => s.id === id); 
            if(act) { 
                let sL = document.getElementById(`skill-lv-${act.id}`); 
                if(sL) sL.innerText = act.level; 
                
                let sP = document.getElementById(`skill-prog-${act.id}`); 
                if(sP) { 
                    let req = act.baseReq * Math.pow(1.15, act.level); 
                    sP.style.width = `${Math.min(100, (act.xp / req) * 100)}%`; 
                } 
            } 
        });
    }
};
