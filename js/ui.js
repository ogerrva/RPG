/**
 * =======================================================
 * 6. GERENCIADOR DE INTERFACE (MENUS E TOOLTIPS)
 * =======================================================
 */

const Tooltip = {
    el: null, 
    init: () => { 
        Tooltip.el = document.getElementById('tooltip'); 
        document.addEventListener('mousemove', Tooltip.move); 
    },
    show: (target) => { 
        document.getElementById('tt-title').innerText = target.dataset.name; 
        document.getElementById('tt-desc').innerText = target.dataset.desc; 
        document.getElementById('tt-stats').innerText = target.dataset.stats; 
        Tooltip.el.style.display = 'block'; 
    },
    hide: () => { 
        Tooltip.el.style.display = 'none'; 
    },
    move: (e) => { 
        if(Tooltip.el.style.display === 'block') { 
            let x = e.clientX + 15; 
            let y = e.clientY + 15; 
            if (x + Tooltip.el.offsetWidth > window.innerWidth) x = window.innerWidth - Tooltip.el.offsetWidth - 10; 
            if (y + Tooltip.el.offsetHeight > window.innerHeight) y = window.innerHeight - Tooltip.el.offsetHeight - 10; 
            Tooltip.el.style.left = x + 'px'; 
            Tooltip.el.style.top = y + 'px'; 
        } 
    }
};

const UI = {
    needsUpdate: true, 
    needsFullRebuild: false, 
    currentShopFilter: 'wand',
    currentPracticeFilter: 'corpo',
    
    init: () => { 
        Tooltip.init(); 
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
        
        // Ativa o botão da aba e o conteúdo da aba
        let btn = document.getElementById(`tab-btn-${id}`);
        if(btn) btn.classList.add('active');
        
        let content = document.getElementById(`tab-${id}`);
        if(content) content.classList.add('active'); 
    },
    
    filterShop: (slot) => { 
        UI.currentShopFilter = slot; 
        UI.needsFullRebuild = true; 
    },

    filterPractice: (cat) => {
        UI.currentPracticeFilter = cat;
        UI.needsFullRebuild = true;
    },
    
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
                                <span style="color:${m.color}">${m.name}</span>
                            </div>
                            <div class="item-desc">Elemento: ${m.elementName}</div>
                            <button class="act-btn" onclick="Player.setMagic(${slotIdx}, ${id})">Equipar Aqui</button>
                        </div>`;
            }).join('');
            
            listHtml = `<button class="act-btn btn-danger" style="margin-bottom:15px;" onclick="Player.setMagic(${slotIdx}, null)">Desequipar Slot</button>` + (availMagics || `<p style="font-size:8px; color:gray; text-align:center;">Nenhuma magia comprada.</p>`);
            
        } else {
            let slotName = EquipSlots.find(s => s.id === type).name;
            document.getElementById('equip-modal-title').innerText = `Selecionar ${slotName}`;
            
            let availItems = Player.inventory.items.filter(id => GameData.items[id].slot === type).map(id => {
                let i = GameData.items[id];
                let isEquipped = Array.isArray(Player.equipped[type]) ? Player.equipped[type].includes(id) : Player.equipped[type] === id;
                return `<div class="list-item ${isEquipped ? 'equipped' : ''}">
                            <div class="item-header">
                                <span style="color:${i.color}">${i.name}</span>
                            </div>
                            <div class="item-stats">+${Math.floor(i.stats.eleDmg*100)}% Dano de ${Elements[i.element].name}</div>
                            <button class="act-btn" onclick="Player.setEquip('${type}', ${slotIdx}, ${id})">Equipar Aqui</button>
                        </div>`;
            }).join('');
            
            listHtml = `<button class="act-btn btn-danger" style="margin-bottom:15px;" onclick="Player.setEquip('${type}', ${slotIdx}, null)">Desequipar Slot</button>` + (availItems || `<p style="font-size:8px; color:gray; text-align:center;">Nenhum item comprado.</p>`);
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
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'corpo' ? 'active' : ''}" onclick="UI.filterPractice('corpo')">Corpo</button>
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'mente' ? 'active' : ''}" onclick="UI.filterPractice('mente')">Mente</button>
            <button class="sub-tab-btn ${UI.currentPracticeFilter === 'aura' ? 'active' : ''}" onclick="UI.filterPractice('aura')">Aura</button>
        `;
        document.getElementById('practice-filters').innerHTML = pBtns;
        
        let htmlPractice = Skills.list.filter(s => s.category === UI.currentPracticeFilter).map(s => { 
            let isActive = Skills.activeSkills.includes(s.id); 
            let statsStr = `+${Math.floor(s.level * s.mult * 100)}${s.mult >= 1 ? "" : "%"} ${s.statName}`; 
            
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
        document.getElementById('practice-list').innerHTML = htmlPractice || `<p style="font-size:8px; color:gray; text-align:center;">Nenhum treino encontrado.</p>`;

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
        fBtns += `<button class="sub-tab-btn ${UI.currentShopFilter === 'magic' ? 'active' : ''}" onclick="UI.filterShop('magic')">Magias</button>`;
        document.getElementById('shop-filters').innerHTML = fBtns;
        
        if (UI.currentShopFilter === 'magic') {
            document.getElementById('shop-list').innerHTML = GameData.magics.filter(m => !Player.inventory.magics.includes(m.id)).map(m => `
                <div class="list-item">
                    <div class="item-header"><span style="color:${m.color}; text-shadow:1px 1px 0 ${m.glow}">${m.name}</span></div>
                    <div class="item-desc">Magia do tipo ${m.type}</div>
                    <button class="act-btn" onclick="Player.buyMagic(${m.id})">Comprar: 🔮 ${Utils.format(m.cost)}</button>
                </div>`).join('');
        } else {
            document.getElementById('shop-list').innerHTML = GameData.items.filter(i => i.slot === UI.currentShopFilter && !Player.inventory.items.includes(i.id)).map(i => { 
                let elName = Elements[i.element].name; 
                return `
                <div class="list-item">
                    <div class="item-header">
                        <span style="color:${i.color}">${i.name}</span> 
                        <span style="color:var(--text-muted)">Nv.Req ${i.reqLevel}</span>
                    </div>
                    <div class="item-stats">+${Math.floor(i.stats.eleDmg*100)}% Dano de ${elName}</div>
                    <button class="act-btn" onclick="Player.buyItem(${i.id})">Comprar: 🪙 ${Utils.format(i.cost)}</button>
                </div>`; 
            }).join('');
        }

        // 4. RECONSTROI O INVENTÁRIO (SISTEMA DE SLOTS)
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

        // 5. RECONSTROI OS SLOTS DE MAGIA
        let mSlots = Player.equippedMagics.map((mId, idx) => {
            let name = mId !== null ? GameData.magics[mId].name : 'Vazio';
            let color = mId !== null ? GameData.magics[mId].color : '#888';
            return `<div class="equip-slot ${mId!==null?'filled':''}" onclick="UI.openEquipModal('magic', ${idx})">
                        Slot ${idx+1} <span style="color:${color}">${name}</span>
                    </div>`;
        }).join('');
        document.getElementById('magic-slots-container').innerHTML = mSlots;

        UI.needsUpdate = true;
    },
    
    update: () => {
        // Recria as listas se os filtros mudarem
        if (UI.needsFullRebuild) { 
            UI.rebuildAll(); 
            UI.needsFullRebuild = false; 
        }
        
        if (!UI.needsUpdate && Math.random() > 0.1) return; 
        UI.needsUpdate = false;

        // Top Bar Updates
        document.getElementById('val-gold').innerText = Utils.format(Economy.gold); 
        document.getElementById('val-energy').innerText = Utils.format(Economy.energy);
        document.getElementById('val-player-lvl').innerText = Player.level; 
        document.getElementById('val-resets').innerText = Player.resets; 
        document.getElementById('player-xp-bar').style.width = `${Math.min(100, (Player.xp / Player.getReqXp()) * 100)}%`;
        
        // Combos Visual Feedback
        let comboAlert = document.getElementById('combo-display');
        if (Player.comboActive || Player.secretCombo) { 
            comboAlert.style.display = 'block'; 
            if(Player.secretCombo) {
                comboAlert.innerText = `COMBO SECRETO: ${Player.secretCombo}!`;
            } else {
                comboAlert.innerText = `AURA SUPREMA: Domínio de ${Elements[Player.comboActive].name}! (+100% Dano Global)`; 
            }
        } else { 
            comboAlert.style.display = 'none'; 
        }
        
        document.getElementById('magic-count').innerText = Player.equippedMagics.filter(m => m !== null).length;

        // MU Reset Panel Updates
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
        
        // DPS Meter
        let now = performance.now(); 
        Economy.dpsHistory = Economy.dpsHistory.filter(h => now - h.time <= 1000); 
        let vDps = document.getElementById('val-dps'); 
        if(vDps) vDps.innerText = Utils.format(Economy.dpsHistory.reduce((s, h) => s + h.val, 0));
        
        // Target Upgrades
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
                btC.innerText = "MAX"; 
                btC.disabled = true; 
            } else { 
                csC.innerText = Utils.format(cCnt); 
                btC.disabled = Economy.gold < cCnt; 
            } 
        }
        
        // Updates das Barras de XP de Prática
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
