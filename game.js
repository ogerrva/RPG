// --- SISTEMA DE RECURSOS ---
let res = {
    power: { amount: 0 },
    biomass: { amount: 0 },
    alloy: { amount: 0 },
    data: { amount: 0 }
};

const resNames = {
    power: "ENERGIA",
    biomass: "BIOMASSA",
    alloy: "LIGA METÁLICA",
    data: "DADOS BRUTOS"
};

// --- GERAÇÃO PROCEDURAL ---
const machineTypes = [
    { baseName: "Extrator Botânico", consumes: { power: 2 }, produces: { biomass: 1 }, time: 2 },
    { baseName: "Forja de Indução", consumes: { power: 5, biomass: 3 }, produces: { alloy: 1 }, time: 3 },
    { baseName: "Servidor Quântico", consumes: { power: 10, alloy: 2 }, produces: { data: 1 }, time: 5 }
];

const machines = [];
for (let i = 0; i < 30; i++) {
    let type = machineTypes[i % 3];
    let tier = Math.floor(i / 3) + 1;
    
    let mCost = {};
    if (type.baseName === "Extrator Botânico") mCost.power = 50 * Math.pow(1.8, tier);
    else if (type.baseName === "Forja de Indução") mCost.biomass = 30 * Math.pow(2.0, tier);
    else if (type.baseName === "Servidor Quântico") mCost.alloy = 20 * Math.pow(2.2, tier);
    
    machines.push({
        id: i,
        name: `${type.baseName} Mk.${tier}`,
        owned: 0,
        progress: 0,
        speed: (100 / type.time) * Math.pow(0.9, tier),
        consumes: { ...type.consumes },
        produces: { ...type.produces },
        cost: mCost,
        isRunning: false,
        isActive: true
    });
    
    for(let k in machines[i].consumes) machines[i].consumes[k] = Math.ceil(machines[i].consumes[k] * Math.pow(1.5, tier - 1));
    for(let k in machines[i].produces) machines[i].produces[k] = Math.ceil(machines[i].produces[k] * Math.pow(1.8, tier - 1));
}

const adjs = ["Criogênico", "Termodinâmico", "Quântico", "Neural", "Cinético", "Magnético", "Iônico", "Subatômico", "Holográfico", "Sintético"];
const nouns = ["Roteamento", "Compressão", "Síntese", "Calibração", "Matriz", "Protocolo", "Algoritmo", "Ressonância", "Fissura", "Catalisador"];
const targets = ["Extrator Botânico", "Forja de Indução", "Servidor Quântico", "Global"];

const researches = [];
for (let i = 0; i < 100; i++) {
    let adj = adjs[Math.floor(Math.random() * adjs.length)];
    let noun = nouns[Math.floor(Math.random() * nouns.length)];
    let target = targets[Math.floor(Math.random() * targets.length)];
    let isGlobal = target === "Global";
    
    researches.push({
        id: i,
        name: `${noun} ${adj}`,
        purchased: false,
        target: target,
        effectMult: 1.2,
        cost: { data: 50 * Math.pow(1.4, i), alloy: 20 * Math.pow(1.2, i) },
        desc: isGlobal ? "Aumenta a velocidade de TODAS as máquinas em 20%." : `Aumenta a produção de [${target}] em 20%.`
    });
}

const gearData = [
    { id: 'h1', type: 'helmet', name: 'Visor Tático Mk.I', cost: { alloy: 100, data: 50 }, effect: 'Clique de Energia x5' },
    { id: 'c1', type: 'chest', name: 'Núcleo de Fissão', cost: { alloy: 500, data: 200 }, effect: 'Geração Passiva de Energia +50/s' },
    { id: 'b1', type: 'boots', name: 'Botas Gravitacionais', cost: { alloy: 1000, data: 1000 }, effect: 'Velocidade Global x2' }
];

let player = {
    gear: { helmet: null, chest: null, boots: null },
    neuralNodes: [],
    clickPower: 1,
    lastSave: Date.now()
};

// --- FUNÇÕES CORE ---
function format(num) {
    if (num < 1000) return Math.floor(num).toString();
    const suffixes = ["", "K", "M", "B", "T"];
    const suffixNum = Math.floor(("" + Math.floor(num)).length / 3);
    let shortValue = parseFloat((suffixNum != 0 ? (num / Math.pow(1000, suffixNum)) : num).toPrecision(3));
    return shortValue + suffixes[suffixNum];
}

function formatDict(dict) {
    return Object.entries(dict).map(([k,v]) => `${format(v)} ${resNames[k]}`).join(' | ');
}

function logTerminal(msg) {
    const term = document.getElementById('log-output');
    term.innerHTML += `> ${msg}<br>`;
    term.scrollTop = term.scrollHeight;
}

function crankReactor(e) {
    let power = player.clickPower;
    if (player.gear.helmet) power *= 5;
    
    res.power.amount += power;
    
    const floater = document.createElement('div');
    floater.className = 'floating-text';
    floater.innerText = `+${power} ⚡`;
    
    let clientX = e.clientX || (e.touches && e.touches[0].clientX) || window.innerWidth / 2;
    let clientY = e.clientY || (e.touches && e.touches[0].clientY) || window.innerHeight / 2;
    
    floater.style.left = `${clientX}px`;
    floater.style.top = `${clientY}px`;
    document.getElementById('floating-texts').appendChild(floater);
    setTimeout(() => floater.remove(), 1000);
    
    updateUI();
}

function canAfford(costObj) {
    for (let k in costObj) {
        if (res[k].amount < costObj[k]) return false;
    }
    return true;
}

function pay(costObj) {
    for (let k in costObj) res[k].amount -= costObj[k];
    updateTopBar();
}

function buyMachine(id) {
    let m = machines[id];
    let cost = { ...m.cost };
    for(let k in cost) cost[k] = Math.ceil(cost[k] * Math.pow(1.3, m.owned));
    
    if (canAfford(cost)) {
        pay(cost);
        m.owned++;
        logTerminal(`Construído: ${m.name}`);
        updateUI();
    }
}

function toggleMachine(id) {
    machines[id].isActive = !machines[id].isActive;
    let btn = document.getElementById(`toggle-m-${id}`);
    if(machines[id].isActive) {
        btn.className = 'btn-toggle on';
        btn.innerText = 'ON';
    } else {
        btn.className = 'btn-toggle off';
        btn.innerText = 'OFF';
        machines[id].isRunning = false; 
    }
}

function buyResearch(id) {
    let r = researches[id];
    if (!r.purchased && canAfford(r.cost)) {
        pay(r.cost);
        r.purchased = true;
        logTerminal(`Pesquisa Concluída: ${r.name}`);
        updateUI();
    }
}

function craftGear(id) {
    let g = gearData.find(x => x.id === id);
    if (canAfford(g.cost)) {
        pay(g.cost);
        player.gear[g.type] = g;
        logTerminal(`Equipamento Forjado: ${g.name}`);
        updateUI();
    }
}

// --- ÁRVORE NEURAL ---
const GRID_SIZE = 33;
function initNeuralTree() {
    const container = document.getElementById('neural-grid');
    container.innerHTML = '';
    let center = Math.floor(GRID_SIZE / 2);

    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let node = document.createElement('div');
            node.className = 'node';
            node.id = `node-${x}-${y}`;
            
            let dist = Math.abs(x - center) + Math.abs(y - center);
            
            if (x === center && y === center) {
                node.classList.add('center');
                node.innerText = "CORE";
                if(!player.neuralNodes.includes(`${x},${y}`)) player.neuralNodes.push(`${x},${y}`);
            } else {
                let cost = 100 * Math.pow(1.6, dist);
                node.onclick = () => buyNeuralNode(x, y, cost);
            }
            container.appendChild(node);
        }
    }
    updateNeuralVisuals();
}

function buyNeuralNode(x, y, cost) {
    let id = `${x},${y}`;
    if (player.neuralNodes.includes(id)) return;

    let hasNeighbor = player.neuralNodes.includes(`${x+1},${y}`) || player.neuralNodes.includes(`${x-1},${y}`) || 
                      player.neuralNodes.includes(`${x},${y+1}`) || player.neuralNodes.includes(`${x},${y-1}`);

    if (hasNeighbor && res.data.amount >= cost) {
        res.data.amount -= cost;
        player.neuralNodes.push(id);
        logTerminal(`Sinapse Neural Expandida.`);
        updateNeuralVisuals();
        updateTopBar();
    } else if (hasNeighbor) {
        logTerminal(`Falha: Necessário ${format(cost)} DADOS BRUTOS.`);
    }
}

function updateNeuralVisuals() {
    for (let y = 0; y < GRID_SIZE; y++) {
        for (let x = 0; x < GRID_SIZE; x++) {
            let id = `${x},${y}`;
            let el = document.getElementById(`node-${x}-${y}`);
            if(!el) continue;

            let hasNeighbor = player.neuralNodes.includes(`${x+1},${y}`) || player.neuralNodes.includes(`${x-1},${y}`) || 
                              player.neuralNodes.includes(`${x},${y+1}`) || player.neuralNodes.includes(`${x},${y-1}`);

            if (player.neuralNodes.includes(id)) {
                el.className = 'node purchased';
                if(el.innerText === "") el.innerText = "■";
            } else if (hasNeighbor) {
                el.className = 'node available';
            } else {
                el.className = 'node';
            }
        }
    }
}

// --- INICIALIZAÇÃO DO DOM ---
function initDOM() {
    const mList = document.getElementById('machine-list');
    machines.forEach(m => {
        let div = document.createElement('div');
        div.className = 'machine-card';
        div.id = `card-m-${m.id}`;
        div.innerHTML = `
            <div class="m-header">
                <div class="m-title" id="title-m-${m.id}"></div>
                <div class="m-controls">
                    <button class="btn-toggle on" id="toggle-m-${m.id}" onclick="toggleMachine(${m.id})">ON</button>
                    <div class="m-status-light" id="light-m-${m.id}"></div>
                </div>
            </div>
            <div class="m-desc">Consome: ${formatDict(m.consumes)}<br>Produz: ${formatDict(m.produces)}</div>
            <div class="m-progress-bg">
                <div class="m-progress-fill" id="prog-m-${m.id}"></div>
            </div>
            <div class="m-cost" id="cost-m-${m.id}"></div>
            <button class="btn-buy" id="btn-m-${m.id}" onclick="buyMachine(${m.id})">CONSTRUIR</button>
        `;
        mList.appendChild(div);
    });

    const rList = document.getElementById('research-list');
    researches.forEach(r => {
        let div = document.createElement('div');
        div.className = 'tech-card';
        div.id = `card-r-${r.id}`;
        div.innerHTML = `
            <div class="tech-title">${r.name}</div>
            <div class="tech-effect">${r.desc}</div>
            <div class="m-cost">Requer: ${formatDict(r.cost)}</div>
            <button class="btn-buy" id="btn-r-${r.id}" onclick="buyResearch(${r.id})">PESQUISAR</button>
        `;
        rList.appendChild(div);
    });

    const gList = document.getElementById('gear-list');
    gearData.forEach(g => {
        let div = document.createElement('div');
        div.className = 'tech-card';
        div.id = `card-g-${g.id}`;
        div.innerHTML = `
            <div class="tech-title">${g.name}</div>
            <div class="tech-effect">${g.effect}</div>
            <div class="m-cost">Requer: ${formatDict(g.cost)}</div>
            <button class="btn-buy" id="btn-g-${g.id}" onclick="craftGear('${g.id}')">FORJAR</button>
        `;
        gList.appendChild(div);
    });
}

// --- ATUALIZAÇÃO DE UI ---
function updateTopBar() {
    for (let k in res) {
        document.getElementById(`val-${k}`).innerText = format(res[k].amount);
    }
}

function updateUI() {
    updateTopBar();

    let highest = 0;
    machines.forEach((m, i) => { if(m.owned > 0) highest = i; });

    machines.forEach((m, i) => {
        let card = document.getElementById(`card-m-${m.id}`);
        if (i <= highest + 2) {
            card.style.display = 'block';
            document.getElementById(`title-m-${m.id}`).innerText = `${m.name} [x${m.owned}]`;
            
            let cost = { ...m.cost };
            for(let k in cost) cost[k] = Math.ceil(cost[k] * Math.pow(1.3, m.owned));
            document.getElementById(`cost-m-${m.id}`).innerText = `Custo: ` + formatDict(cost);
            
            let btn = document.getElementById(`btn-m-${m.id}`);
            btn.className = canAfford(cost) ? 'btn-buy affordable' : 'btn-buy';
        } else {
            card.style.display = 'none';
        }
    });

    let rCount = 0;
    researches.forEach(r => {
        let card = document.getElementById(`card-r-${r.id}`);
        if (!r.purchased && rCount < 12) {
            card.style.display = 'block';
            let btn = document.getElementById(`btn-r-${r.id}`);
            btn.className = canAfford(r.cost) ? 'btn-buy affordable' : 'btn-buy';
            rCount++;
        } else {
            card.style.display = 'none';
        }
    });

    document.getElementById('slot-helmet').innerText = player.gear.helmet ? `CAPACETE: ${player.gear.helmet.name}` : "CAPACETE: [VAZIO]";
    document.getElementById('slot-helmet').className = player.gear.helmet ? "suit-slot equipped" : "suit-slot";
    
    document.getElementById('slot-chest').innerText = player.gear.chest ? `PEITORAL: ${player.gear.chest.name}` : "PEITORAL: [VAZIO]";
    document.getElementById('slot-chest').className = player.gear.chest ? "suit-slot equipped" : "suit-slot";
    
    document.getElementById('slot-boots').innerText = player.gear.boots ? `BOTAS: ${player.gear.boots.name}` : "BOTAS: [VAZIO]";
    document.getElementById('slot-boots').className = player.gear.boots ? "suit-slot equipped" : "suit-slot";

    gearData.forEach(g => {
        let card = document.getElementById(`card-g-${g.id}`);
        if (player.gear[g.type] && player.gear[g.type].id === g.id) {
            card.style.display = 'none';
        } else {
            card.style.display = 'block';
            let btn = document.getElementById(`btn-g-${g.id}`);
            btn.className = canAfford(g.cost) ? 'btn-buy affordable' : 'btn-buy';
        }
    });
}

// --- NAVEGAÇÃO ---
document.querySelectorAll('.nav-btn:not([onclick])').forEach(btn => {
    btn.addEventListener('click', (e) => {
        document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
        
        let target = e.currentTarget.getAttribute('data-target');
        document.getElementById(target).classList.add('active');
        e.currentTarget.classList.add('active');
        updateUI();
    });
});

// --- SAVE / LOAD / AFK ---
function saveGame() {
    player.lastSave = Date.now();
    let saveObj = {
        res: res,
        player: player,
        machinesOwned: machines.map(m => m.owned),
        machinesActive: machines.map(m => m.isActive),
        researchesPurchased: researches.map(r => r.purchased)
    };
    localStorage.setItem('deepCoreSaveV4', JSON.stringify(saveObj));
}

function loadGame() {
    let save = localStorage.getItem('deepCoreSaveV4');
    if (save) {
        try {
            let data = JSON.parse(save);
            res = { ...res, ...data.res };
            player = { ...player, ...data.player };
            
            if(data.machinesOwned) {
                data.machinesOwned.forEach((owned, i) => { if(machines[i]) machines[i].owned = owned; });
            }
            if(data.machinesActive) {
                data.machinesActive.forEach((isActive, i) => { 
                    if(machines[i]) {
                        machines[i].isActive = isActive;
                        let btn = document.getElementById(`toggle-m-${i}`);
                        if(btn) {
                            btn.className = isActive ? 'btn-toggle on' : 'btn-toggle off';
                            btn.innerText = isActive ? 'ON' : 'OFF';
                        }
                    }
                });
            }
            if(data.researchesPurchased) {
                data.researchesPurchased.forEach((purchased, i) => { if(researches[i]) researches[i].purchased = purchased; });
            }
            
            calculateAFK();
        } catch (e) { console.error("Save corrompido."); }
    }
    initNeuralTree();
    updateUI();
}

function calculateAFK() {
    let now = Date.now();
    let diffSecs = (now - player.lastSave) / 1000;
    
    if (diffSecs > 60) {
        let cycles = Math.floor(diffSecs);
        for(let i=0; i<cycles; i++) {
            if(player.gear.chest) res.power.amount += 50;
            machines.forEach(m => {
                if(m.owned > 0 && m.isActive) {
                    let canRun = true;
                    for (let req in m.consumes) { if (res[req].amount < m.consumes[req] * m.owned) canRun = false; }
                    if(canRun) {
                        for (let req in m.consumes) res[req].amount -= (m.consumes[req] * m.owned);
                        for (let prod in m.produces) res[prod].amount += (m.produces[prod] * m.owned);
                    }
                }
            });
        }
        
        let timeStr = diffSecs > 3600 ? `${(diffSecs/3600).toFixed(1)} horas` : `${Math.floor(diffSecs/60)} minutos`;
        document.getElementById('afk-time').innerText = timeStr;
        document.getElementById('afk-modal').style.display = 'flex';
    }
    player.lastSave = now;
}

function hardReset() {
    if(confirm("ATENÇÃO: Isso destruirá o núcleo e apagará todo o seu progresso. Deseja continuar?")) {
        localStorage.removeItem('deepCoreSaveV4');
        location.reload();
    }
}

// --- GAME LOOP ---
let lastTick = Date.now();

function gameLoop() {
    let now = Date.now();
    let dt = (now - lastTick) / 1000;
    lastTick = now;

    let globalSpeed = 1 + (player.neuralNodes.length * 0.01);
    if (player.gear.boots) globalSpeed *= 2;
    
    researches.forEach(r => {
        if(r.purchased && r.target === "Global") globalSpeed *= r.effectMult;
    });

    if (player.gear.chest) res.power.amount += 50 * dt;

    let anyMachineRunning = false;

    machines.forEach(m => {
        if (m.owned > 0 && m.isActive) {
            let canRun = true;
            for (let req in m.consumes) {
                if (res[req].amount < m.consumes[req] * m.owned) canRun = false;
            }

            if (canRun) {
                m.isRunning = true;
                anyMachineRunning = true;
                
                let localSpeed = m.speed * globalSpeed;
                researches.forEach(r => {
                    if(r.purchased && r.target === m.name.split(' Mk.')[0]) localSpeed *= r.effectMult;
                });

                m.progress += localSpeed * dt;

                if (m.progress >= 100) {
                    m.progress = 0;
                    for (let req in m.consumes) res[req].amount -= (m.consumes[req] * m.owned);
                    for (let prod in m.produces) res[prod].amount += (m.produces[prod] * m.owned);
                    updateUI(); 
                }
            } else {
                m.isRunning = false;
                if(m.progress > 0) m.progress = Math.max(0, m.progress - (20 * dt));
            }
        } else if (!m.isActive) {
            m.isRunning = false;
        }
        
        let progBar = document.getElementById(`prog-m-${m.id}`);
        let light = document.getElementById(`light-m-${m.id}`);
        if(progBar) progBar.style.width = `${m.progress}%`;
        if(light) m.isRunning ? light.classList.add('running') : light.classList.remove('running');
    });

    let stateEl = document.getElementById('reactor-state');
    if (res.power.amount < 10 && anyMachineRunning) {
        stateEl.innerText = "ENERGIA CRÍTICA";
        stateEl.className = "state-alert";
    } else {
        stateEl.innerText = "ESTÁVEL";
        stateEl.className = "state-ok";
    }

    requestAnimationFrame(gameLoop);
}

// Inicialização
window.onload = () => {
    initDOM();
    loadGame();
    setInterval(saveGame, 5000); 
    requestAnimationFrame(gameLoop);
    
    setTimeout(() => {
        let container = document.getElementById('neural-container');
        container.scrollLeft = (container.scrollWidth - container.clientWidth) / 2;
        container.scrollTop = (container.scrollHeight - container.clientHeight) / 2;
    }, 100);
};