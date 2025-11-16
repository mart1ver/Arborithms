/**
 * @type {HTMLCanvasElement}
*/

// Toggle card collapse/expand
function toggleCard(cardId) {
    const card = document.getElementById(cardId);
    if (card) {
        card.classList.toggle('collapsed');
    }
}

fetchFromTreesData() // load from json data
performance.mark("10");
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pcanvas = document.getElementById("particleCanvas");
const pctx = pcanvas.getContext("2d");
ctx.imageSmoothingEnabled = true;
pctx.imageSmoothingEnabled = true;
let dim = { x: 3440, y: 1440 };
let scaleRatioY = window.innerHeight / 100
let scaleRatioX = window.innerWidth / 1300
let scaleRatio = Math.min(scaleRatioX, scaleRatioY);
dim = { x: Math.floor(window.innerWidth / scaleRatio), y: Math.floor(window.innerHeight / scaleRatio) }
canvas.width = dim.x;
canvas.height = dim.y;
pcanvas.width = dim.x;
pcanvas.height = dim.y;
const imageData = ctx.createImageData(dim.x, dim.y);
let growStepSize = 0.01;
let deltaTime = 0.001;
const lfGen = 7;
const treeSettings = new Map();
//planterStepsPerUpdate = variable qualite de l'animation 1 = fluide mais peur ramer sur de arbres complexes 
let planterStepsPerUpdate = 3;
//planterStepsElapsed = variable du compteur de steps de l'animation , doit etre set a 0
let planterStepsElapsed = 0;

// Genetic algorithm utility functions
function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
}

// Gene constraints definition
const GENE_CONSTRAINTS = {
    TxMut: { min: 0.01, max: 20 },
    lt: { min: 0.1, max: 2 },
    mnSpt: { min: 0.1, max: 2 },
    thk: { min: 0.5, max: 15 },
    gtInitial: { min: -1, max: 2 },
    gtPerGen: { min: 0, max: 1 },
    warping: { min: 0, max: 20 },
    angDif: { min: 0.1, max: 4 },
    sEndMx: { min: 1, max: 15 },
    sMidMx: { min: 0, max: 20 },
    lfGen: { min: 1, max: 10 },
    lfAmount: { min: 0, max: 15 },
    lfLength: { min: 0, max: 5 },
    lfGravity: { min: -5, max: 5 },
    lfThickness: { min: 0, max: 10 },
    lfSteps: { min: 0, max: 10 },
    asymmetry: { min: -1, max: 1 },
    branchAngle: { min: -Math.PI / 2, max: Math.PI / 2 },
    trunkTaper: { min: 0.5, max: 2 },
    branchDensity: { min: 0.1, max: 3 },
    colorVariation: { min: 0, max: 50 },
    leafCluster: { min: 1, max: 10 }
};

// create random trees for the first step in parents slots
function create_random_tree() {
    let a = {
        TxMut: 0.05, //taux de mutation
        gen: 0, // generation
        lt: random(0.3, 1), //taille maximale of the tree
        mnSpt: random(0.5, 1), // amount of small branches (inverted)
        thk: random(1, 7), // thickness of the trunk
        gtInitial: 0.3, // gravity initial
        gtPerGen: 0.35, // gravité exercés sur les branches
        warping: random(0, 10), //recrovitude du tronc
        lfGen: randomInt(2, 6), // number of splits before leaves
        angDif: random(0.5, 2), // inclinaison possible des branches
        lfAmount: randomInt(1, 7), // nombre de feuilles
        lfLength: random(0, 2), // length of leaves
        lfGravity: random(-3, 3), // gravity of leaves
        lfThickness: random(0, 6), //largeur des feuilles
        sEndMx: randomInt(2, 7), // number of mini-branches at the end of the split
        sMidMx: randomInt(1, 10), // number of branches at the trunk
        lfSteps: randomInt(1, 5), // nombre d'etapes dans les feuilles
        colorBase: new Color(random(0, 256), random(0, 256), random(0, 256)),
        colorLeaves: new Color(random(0, 256), random(0, 256), random(0, 256)),
        // New genes
        asymmetry: random(-1, 1), // asymétrie gauche/droite (-1 = gauche, 1 = droite)
        branchAngle: random(-Math.PI / 4, Math.PI / 4), // angle de base des branches
        trunkTaper: random(0.7, 1.3), // vitesse d'amincissement du tronc
        branchDensity: random(0.5, 2), // densité des branches
        colorVariation: random(0, 30), // variation de couleur entre branches
        leafCluster: randomInt(1, 5), // regroupement des feuilles
    };
    return a;
}

// create an invisible tree for child slot at first step
function create_invisible_tree() {

    let a = {
        TxMut: 0, //taux de mutation
        gen: 0, // generation
        lt: 0, //taille maximale of the tree
        mnSpt: random(0.5, 1), // amount of small branches (inverted)
        thk: 0, // thickness of the trunk
        gtInitial: 0.3, // gravity initial
        gtPerGen: 0.35, // gravité exercés sur les branches
        warping: random(0, 10), //recrovitude du tronc
        lfGen: 0, // number of splits before leaves
        angDif: random(0.5, 2), // inclinaison possible des branches
        lfAmount: 0, // nombre de feuilles
        lfLength: 0, // length of leaves
        lfGravity: random(-3, 3), // gravity of leaves
        lfThickness: 0, //largeur des feuilles
        sEndMx: 0, // number of mini-branches at the end of the split
        sMidMx: 0, // number of branches at the trunk
        lfSteps: 0, // nombre d'etapes dans les feuilles
        colorBase: new Color(random(0, 256), random(0, 256), random(0, 256), 0),
        colorLeaves: new Color(random(0, 256), random(0, 256), random(0, 256), 0),
        // New genes
        asymmetry: 0,
        branchAngle: 0,
        trunkTaper: 1,
        branchDensity: 1,
        colorVariation: 0,
        leafCluster: 1,
    };
    return a;
}

//cross parents genome and a bit of mutation to make a child in set3
function copulate12() {
    set3 = copulate(set1, set2);
    generateChild()
}


//cross parents genome with Mendelian inheritance and mutation
function copulate(set1, set2) {
    let child = {};
    let mutationRate = 0.05;

    // Process all numeric genes
    for (let gene in set1) {
        if (gene === 'colorBase' || gene === 'colorLeaves') {
            // Handle colors separately - choose from one parent randomly
            child[gene] = random(0, 1) > 0.5 ? set1[gene] : set2[gene];
        } else if (gene === 'gen' || gene === 'TxMut') {
            // Special handling for metadata
            if (gene === 'gen') {
                child[gene] = Math.max(set1.gen, set2.gen);
            } else if (gene === 'TxMut') {
                // TxMut is inherited but clamped to prevent runaway
                child[gene] = random(0, 1) > 0.5 ? set1[gene] : set2[gene];
                child[gene] = clamp(child[gene], GENE_CONSTRAINTS.TxMut.min, GENE_CONSTRAINTS.TxMut.max);
            }
        } else if (typeof set1[gene] === 'number') {
            // Mendelian inheritance: 50/50 from each parent
            child[gene] = random(0, 1) > 0.5 ? set1[gene] : set2[gene];

            // Apply mutation
            if (random(0, 1) < mutationRate) {
                let mutationFactor = random(0, 1) > 0.5 ? 1.1 : 0.9;
                child[gene] *= mutationFactor;
            }

            // Apply constraints
            if (GENE_CONSTRAINTS[gene]) {
                child[gene] = clamp(child[gene], GENE_CONSTRAINTS[gene].min, GENE_CONSTRAINTS[gene].max);
            }
        }
    }

    return child;
}
//load child in parent slot left (set2)
function loadLeft() {
    set2 = set3;
    set3 = create_invisible_tree();
    generateChild()
}

//load child in parent slot right (set1)
function loadRight() {
    set1 = set3;
    set3 = create_invisible_tree();
    generateChild()
}

// mutate a set with genetic drift and constraints
function mutate(set) {
    let mutationRate = set.TxMut;
    console.log("Mutation rate:", mutationRate);

    // Mutate all numeric genes
    for (let gene in set) {
        if (gene === 'gen') {
            // Don't mutate generation counter
            continue;
        } else if (gene === 'colorBase' || gene === 'colorLeaves') {
            // Mutate colors completely
            if (random(0, 1) < mutationRate && random(0, 1) > 0.5) {
                set[gene] = new Color(random(0, 256), random(0, 256), random(0, 256));
            }
        } else if (typeof set[gene] === 'number') {
            // Mutate numeric genes with +/-10%
            if (random(0, 1) < mutationRate) {
                let mutationFactor = random(0, 1) > 0.5 ? 1.1 : 0.9;
                set[gene] *= mutationFactor;

                // Apply constraints
                if (GENE_CONSTRAINTS[gene]) {
                    set[gene] = clamp(set[gene], GENE_CONSTRAINTS[gene].min, GENE_CONSTRAINTS[gene].max);
                }
            }
        }
    }

    set.gen = set.gen + 1;
    generateChild();
}

class Planter {
    speed = 100;
    age = 0;
    gen = 1;
    enabled = true;
    constructor(x, y, angle = random(0, Math.PI * 2), stgs = null) {
        this.fx = x;
        this.fy = y;
        this.angle = angle;
        this.stgs = stgs || set1;
        this.lT = this.stgs.lt * random(.5, 1.5);
        this.splitTime = this.lT * random(this.stgs.mnSpT, (this.stgs.mxSpT ?? (this.stgs.mnSpT + .1)));
        this.thk = this.stgs.thk;
        this.gt = this.stgs.gtInitial;
        this.color = this.stgs.colorBase.randomise(7 + (this.stgs.colorVariation || 0)).toCSS();
        Planter.list.push(this);
    }
    update() {
        this.angle += random(-this.stgs.warping, this.stgs.warping) * growStepSize;
        this.angle += (this.stgs.asymmetry || 0) * growStepSize * 0.1; // Asymmetry bias
        this.angle = rotateAngle(this.angle, Math.PI / -2, this.gt * growStepSize);
        this.fx += Math.cos(this.angle) * this.speed * growStepSize;
        this.fy += Math.sin(this.angle) * this.speed * growStepSize;
        if (this.fx >= dim.x) this.fx = dim.x - 1;
        if (this.fy >= dim.y) this.fy = dim.y - 1;
        if (this.fx < 0) this.fx = 0;
        if (this.fy < 0) this.fy = 0;
        ctx.fillStyle = this.color;
        ctx.fillRect(Math.ceil(this.x - this.thk / 2), Math.ceil(this.y - this.thk / 2), this.thk, this.thk);
        this.x = Math.floor(this.fx);
        this.y = Math.floor(this.fy);
        ctx.fillStyle = "white";
        this.age += growStepSize;
        if (this.age > this.splitTime) {
            this.split(0, Math.floor(this.stgs.sMidMx * (this.stgs.branchDensity || 1)));
            this.splitTime += random(this.stgs.mnSpT, this.stgs.mxSpT ?? (this.stgs.mnSpT * 2));
        }
        if (this.age > this.lT) {
            this.split(1, Math.floor(this.stgs.sEndMx * (this.stgs.branchDensity || 1)));
            ctx.fillStyle = this.color;
            ctx.fillRect(this.x, this.y, 1, 1);
            this.enabled = false;
            if (this.gen > this.stgs.lfGen && random(0, 1) > .8) {
                let particle = new Particle(this.x, this.y, this.angle);
                particle.color = this.color;
            }
            Planter.list.splice(Planter.list.indexOf(this), 1);
        }
    }
    split(min = 0, max = 3) {
        let r = randomInt(min, max);
        let angDif = this.stgs.angDif;
        if (this.gen >= this.stgs.lfGen + (this.stgs.lfSteps ?? 0)) r = 0;
        if (r == 1) angDif = 0.1;
        if (this.gen == this.stgs.lfGen) {
            angDif = 3;
            r = Math.floor(this.stgs.lfAmount * (this.stgs.leafCluster || 1));
        }

        for (let i = 0; i < r; i++) {
            let newAngle = this.angle + random(-angDif, angDif) + (this.stgs.branchAngle || 0);
            let pla = new Planter(this.x, this.y, rotateAngle(newAngle, Math.PI / -2, .3), this.stgs);
            pla.thk = Math.max(1, this.thk - (this.stgs.trunkTaper || 1));
            pla.gen = this.gen + randomInt(1, 1 + (this.stgs.skipGenMax ?? 1));
            pla.lT /= pla.gen;
            pla.splitTime /= pla.gen / pla.gen;
            pla.gt -= pla.gen * this.stgs.gtPerGen
            if (this.gen >= this.stgs.lfGen) {
                pla.color = this.stgs.colorLeaves.randomise(20 + (this.stgs.colorVariation || 0)).toCSS();
                pla.lT *= this.stgs.lfLength;
                pla.thk = Math.max(1, this.stgs.lfThickness - (pla.gen - this.stgs.lfGen))
                pla.gt = this.stgs.lfGravity;
            }
        }
    }
}
Planter.list = [];
class Particle {
    angle;
    speed = 85;
    age = 0;
    drag = 2;
    enabled = true;
    constructor(x, y, angle = random(0, Math.PI * 2)) {
        this.fx = x;
        this.fy = y;
        this.angle = angle;
        this.vx = Math.cos(angle) * this.speed;
        this.vy = Math.sin(angle) * this.speed;
        this.lT = 20;
        this.size = 1
        this.gt = 50;
        this.color = new Color(150, 150, 150).randomise(100).toCSS();
        Particle.list.push(this);
        if (Particle.list.length > 1000) Particle.list.shift();
    }
    update() {
        this.vy *= (1 - (this.drag * deltaTime));
        this.vx *= (1 - (this.drag * deltaTime));

        if (this.fy >= dim.y - 1) {
            this.vy = 0;
        }
        else {
            this.vx += random(-100, 100) * deltaTime;
            if (this.fy < dim.y - 20) this.vy += random(-100, 100) * deltaTime;
            this.vy += this.gt * deltaTime;
            this.vy -= Math.abs(this.vx) / 150
            this.fx += this.vx * deltaTime;
            this.fy += this.vy * deltaTime;
        }
        if (this.fx >= dim.x) this.fx = dim.x - 1;
        if (this.fy >= dim.y) this.fy = dim.y - 1;
        if (this.fx < 0) this.fx = 0;
        if (this.fy < 0) this.fy = 0;
        pctx.fillStyle = this.color;
        pctx.fillRect(Math.ceil(this.x - this.size / 2), Math.ceil(this.y - this.size / 2), this.size, this.size);
        this.x = Math.floor(this.fx);
        this.y = Math.floor(this.fy);
        this.age += deltaTime;
        if (this.age > this.lT) {
            this.enabled = false;
            Particle.list.splice(Particle.list.indexOf(this), 1);
        }
    }
}
Particle.list = [];
let a = true;
let set1 = create_random_tree();
let set2 = create_random_tree();
let set3 = create_invisible_tree();
// generate parent only from seed sets
function generate() {
    if (a) {
        document.getElementById("titleText").style.opacity = "0";
        a = false;
    }
    ctx.clearRect(0, 0, dim.x, dim.y);
    Planter.list = [];
    new Planter(dim.x / 4, dim.y, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set2)
    new Planter((dim.x / 4) * 3, dim.y, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set1)

}
// generate parent an child from seed sets
function generateChild() {
    if (a) {
        document.getElementById("titleText").style.opacity = "0";
        a = false;
    }
    ctx.clearRect(0, 0, dim.x, dim.y);
    Planter.list = [];
    new Planter(dim.x / 2, dim.y * 0.8, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set3)
    new Planter(dim.x / 4, dim.y, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set2)
    new Planter((dim.x / 4) * 3, dim.y, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set1)

}
// Save a tree to JSON file with custom name
function jsondump() {
    let treeName = document.getElementById("treeName")?.value;
    let treeToSave = document.getElementById("treeToSave")?.value;

    if (!treeName) {
        alert("Please enter a tree name!");
        return;
    }

    if (!treeToSave) {
        alert("Please select which tree to save!");
        return;
    }

    // Get the selected tree
    let selectedSet = window["set" + treeToSave];
    if (!selectedSet) {
        alert("Selected tree not found!");
        return;
    }

    // Add to treeSettings
    treeSettings.set(treeName, selectedSet);

    // Export all trees to JSON
    let myObj = Object.fromEntries(treeSettings);
    JSONToFile(myObj, "Trees");

    console.log(`Tree "${treeName}" saved successfully!`);
    alert(`Tree "${treeName}" saved! Download the JSON file and add it to your repository.`);
}

const JSONToFile = (obj, filename) => {
    const blob = new Blob([JSON.stringify(obj, null, 2)], {
        type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
};
//load an element of the 'wich' html list into desired parent slot(1 or 2)
function loadInParentSlot(n) {

    if (n == '1') {
        let tree = document.getElementById("whichRight").value;
        let treeData = treeSettings.get(tree);
        if (treeData) {
            set1 = treeData;
        } else {
            console.warn("Tree not found:", tree);
        }
    }
    if (n == '2') {
        let tree = document.getElementById("whichLeft").value;
        let treeData = treeSettings.get(tree);
        if (treeData) {
            set2 = treeData;
        } else {
            console.warn("Tree not found:", tree);
        }
    }
    generateChild();
}
//randomise parents sets
function reset(n) {
    if (n == '1') {
        set1 = create_random_tree();
    }
    else if (n == '2') {
        set2 = create_random_tree();
    }
    else {
        set1 = create_random_tree();
        set2 = create_random_tree();
    }
    generateChild()
}

let newTime = Date.now();
let oldTime = Date.now();
window.requestAnimationFrame(update);
function update() {
    newTime = Date.now();
    deltaTime = (newTime - oldTime) / 1000;
    oldTime = newTime;
    pctx.clearRect(0, 0, dim.x, dim.y);
    for (const particle of Particle.list) {
        if (particle.enabled) particle.update();
    }
    window.requestAnimationFrame(update);
}

function planterUpdate() {
    planterStepsElapsed++;
    for (const planter of Planter.list) {
        if (planter.enabled) planter.update();
    }
    if (Planter.list.length > 0 && planterStepsElapsed < planterStepsPerUpdate) planterUpdate();
}

setInterval(() => {
    planterStepsElapsed = 0;
    planterUpdate();
}, 10);

//random integer whith min and max value
function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
//random whith min and max value
function random(min, max) {
    return (Math.random() * (max - min)) + min;
}

//pour le dessin de l'arbre, permet d'obtenir les angles des prochaines branches et splits ( used in updqate() and split () )
function rotateAngle(from, to, amount) {
    amount = Math.min(1, Math.max(-1, amount))
    var netAngle = (from - to + Math.PI * 2) % (Math.PI * 2);
    var delta = Math.min(Math.abs(netAngle - Math.PI * 2), netAngle, amount);
    var sign = (netAngle - Math.PI) >= 0 ? 1 : -1;
    from += sign * delta + Math.PI * 2;
    from %= Math.PI * 2;
    return from;
}

//to load trees data from jsonfile , construct the html lists to
function fetchFromTreesData() {
    var jsonData;
    fetch("Trees.json").then(response => response.json()).then(data => {
        jsonData = data;
        if (data) {
            var x1 = document.createElement("DATALIST"); x1.setAttribute("id", "varietiesLeft");
            var x2 = document.createElement("DATALIST"); x2.setAttribute("id", "varietiesRight");
            for (var i in data) {
                treeSettings.set(i, data[i]);
                var a1 = document.createElement("OPTION"); a1.setAttribute("value", i);
                x1.appendChild(a1)
                document.body.appendChild(x1);
                var a2 = document.createElement("OPTION"); a2.setAttribute("value", i);
                x2.appendChild(a2)
                document.body.appendChild(x2);
                let setx = treeSettings.get(i);
                setx.colorBase = new Color(setx.colorBase.r, setx.colorBase.g, setx.colorBase.b);
                setx.colorLeaves = new Color(setx.colorLeaves.r, setx.colorLeaves.g, setx.colorLeaves.b);
                treeSettings.set(i, setx);
            }
        }
    }).catch(error => {
        console.warn("Could not load Trees.json (this is normal when opening HTML files directly):", error.message);
        console.log("Using default random trees. To use saved trees, please run a local web server.");
    })
}