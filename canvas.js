/** 
 * @type {HTMLCanvasElement}
*/
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

// create random trees for the first step in parents slots
function create_random_tree() {
    let a = {
        TxMut: 0.05, //taux de mutation
        gen: 0, // generation
        lt: random(0.3, 1), //taille maximale of the tree
        mnSpt: random(0.5, 1), // amount of small branches (inverted)
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
    };
    return a;
}

// create an invisible tree for child slot at first step
function create_invisible_tree() {

    let a = {
        TxMut: 0.05, //taux de mutation
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
        lfLength: random(0, 0), // length of leaves
        lfGravity: random(-3, 3), // gravity of leaves
        lfThickness: 0, //largeur des feuilles
        sEndMx: randomInt(2, 7), // number of mini-branches at the end of the split
        sMidMx: 0, // number of branches at the trunk
        lfSteps: randomInt(1, 5), // nombre d'etapes dans les feuilles
        colorBase: new Color(random(0, 256), random(0, 256), random(0, 256)),
        colorLeaves: new Color(random(0, 256), random(0, 256), random(0, 256)),
    };
    return a;
}

//cross parents genome and a bit of mutation in their respectives slots >>>>> candide

function cross12() {
    //console.log("parent cross");
    old1 = set1; old2 = set2;
    set1 = crossParents(old1, old2);
    set2 = crossParents(old2, old1);
    generateChild();
}

//cross parents genome and a bit of mutation to make a child in set3 >>>>> candide
function copulate12() {
    //console.log("REPRODUCTION");
    old1 = set1; old2 = set2; // useless in case of copulate??
    set3 = copulate(old1, old2);
    generateChild()
}


//cross parents genome and a bit of mutation to make a child in set3 >>>>> candide
function copulate(set1, set2) {
    let mutation = 0.05;
    lt = (random(0, 1) > mutation) ? set1.lt : random(0.3, 1);
    mnSpt = (random(0, 1) > mutation) ? set1.mnSpt : random(0.5, 1);
    thk = (random(0, 1) > mutation) ? set1.thk : random(1, 7);
    gtInitial = (random(0, 1) > mutation) ? set1.gtInitial : set2.gtInitial;
    gtPerGen = (random(0, 1) > mutation) ? set1.gtPerGen : set2.gtPerGen;
    warping = (random(0, 1) > mutation) ? set1.warping : random(0, 10);
    angDif = (random(0, 1) > mutation) ? set1.angDif : random(0.5, 2);
    sEndMx = (random(0, 1) > mutation) ? set1.sEndMx : randomInt(2, 7);
    sMidMx = (random(0, 1) > mutation) ? set1.sMidMx : randomInt(1, 10);
    colorBase = (random(0, 1) > mutation) ? set1.colorBase : new Color(random(0, 256), random(0, 256), random(0, 256));
    colorLeaves = (random(0, 1) > mutation) ? set2.colorLeaves : new Color(random(0, 256), random(0, 256), random(0, 256));
    lfGeno = (random(0, 1) > mutation) ? set2.lfGen : randomInt(2, 6);
    lfAmount = (random(0, 1) > mutation) ? set2.lfAmount : randomInt(1, 7);
    lfLength = (random(0, 1) > mutation) ? set2.lfLength : random(0, 2);
    lfGravity = (random(0, 1) > mutation) ? set2.lfGravity : random(-3, 3);
    lfThickness = (random(0, 1) > mutation) ? set2.lfThickness : random(0, 6);
    lfSteps = (random(0, 1) > mutation) ? set2.lfSteps : randomInt(1, 5);

    return {
        // general
        lt: lt,
        // tronc et branche  --> set1
        mnSpt: mnSpt,
        thk: thk,
        gtInitial: gtInitial,
        gtPerGen: gtPerGen,
        warping: warping,
        angDif: angDif,
        sEndMx: sEndMx,
        sMidMx: sMidMx,
        colorBase: colorBase,
        // feuilles --> set2
        lfGen: lfGeno,
        lfAmount: lfAmount,
        lfLength: lfLength,
        lfGravity: lfGravity,
        lfThickness: lfThickness,
        lfSteps: lfSteps,
        colorLeaves: colorLeaves,
    };

}

function mutate(set) {
    let mutation = set.TxMut;
    console.log(mutation);
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.TxMut = set.TxMut * 1.1 } else { set.TxMut = set.TxMut * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lt = set.lt * 1.1 } else { set.lt = set.lt * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.mnSpt = set.mnSpt * 1.1 } else { set.mnSpt = set.mnSpt * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.thk = set.thk * 1.1 } else { set.thk = set.thk * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.gtInitial = set.gtInitial * 1.1 } else { set.gtInitial = set.gtInitial * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.gtPerGen = set.gtPerGen * 1.1 } else { set.gtPerGen = set.gtPerGen * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.warping = set.warping * 1.1 } else { set.warping = set.warping * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.angDif = set.angDif * 1.1 } else { set.angDif = set.angDif * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.sEndMx = set.sEndMx * 1.1 } else { set.sEndMx = set.sEndMx * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.sMidMx = set.sMidMx * 1.1 } else { set.sMidMx = set.sMidMx * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.colorBase = new Color(random(0, 256), random(0, 256), random(0, 256)) } };//to be revisited
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.colorLeaves = new Color(random(0, 256), random(0, 256), random(0, 256)) } };//to be revisited
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfGen = set.lfGen * 1.1 } else { set.lfGen = set.lfGen * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfAmount = set.lfAmount * 1.1 } else { set.lfAmount = set.lfAmount * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfLength = set.lfLength * 1.1 } else { set.lfLength = set.lfLength * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfGravity = set.lfGravity * 1.1 } else { set.lfGravity = set.lfGravity * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfThickness = set.lfThickness * 1.1 } else { set.lfThickness = set.lfThickness * 0.9 } };
    if (random(0, 1) < mutation) { if (random(0, 1) > 0, 5) { set.lfSteps = set.lfSteps * 1.1 } else { set.lfSteps = set.lfSteps * 0.9 } };
    generateChild();
}

//cross parents genome and a bit of mutation in their respectives slots >>>>> candide
function crossParents(set1, set2) {

    let mutation = 0.01;
    lt = (random(0, 1) > mutation) ? set1.lt : random(0.3, 1);
    mnSpt = (random(0, 1) > mutation) ? set1.mnSpt : random(0.5, 1);
    thk = (random(0, 1) > mutation) ? set1.thk : random(1, 7);
    gtInitial = (random(0, 1) > mutation) ? set1.gtInitial : set2.gtInitial;
    gtPerGen = (random(0, 1) > mutation) ? set1.gtPerGen : set2.gtPerGen;
    warping = (random(0, 1) > mutation) ? set1.warping : random(0, 10);
    angDif = (random(0, 1) > mutation) ? set1.angDif : random(0.5, 2);
    sEndMx = (random(0, 1) > mutation) ? set1.sEndMx : randomInt(2, 7);
    sMidMx = (random(0, 1) > mutation) ? set1.sMidMx : randomInt(1, 10);
    colorBase = (random(0, 1) > mutation) ? set1.colorBase : new Color(random(0, 256), random(0, 256), random(0, 256));
    colorLeaves = (random(0, 1) > mutation) ? set2.colorLeaves : new Color(random(0, 256), random(0, 256), random(0, 256));
    lfGeno = (random(0, 1) > mutation) ? set2.lfGen : randomInt(2, 6);
    lfAmount = (random(0, 1) > mutation) ? set2.lfAmount : randomInt(1, 7);
    lfLength = (random(0, 1) > mutation) ? set2.lfLength : random(0, 2);
    lfGravity = (random(0, 1) > mutation) ? set2.lfGravity : random(-3, 3);
    lfThickness = (random(0, 1) > mutation) ? set2.lfThickness : random(0, 6);
    lfSteps = (random(0, 1) > mutation) ? set2.lfSteps : randomInt(1, 5);

    return {
        // general
        lt: lt,
        // tronc et branche  --> set1
        mnSpt: mnSpt,
        thk: thk,
        gtInitial: gtInitial,
        gtPerGen: gtPerGen,
        warping: warping,
        angDif: angDif,
        sEndMx: sEndMx,
        sMidMx: sMidMx,
        colorBase: colorBase,
        // feuilles --> set2
        lfGen: lfGeno,
        lfAmount: lfAmount,
        lfLength: lfLength,
        lfGravity: lfGravity,
        lfThickness: lfThickness,
        lfSteps: lfSteps,
        colorLeaves: colorLeaves,
    };

}

class Planter {
    speed = 100;
    age = 0;
    gen = 1;
    enabled = true;
    constructor(x, y, angle = random(0, Math.PI * 2), stgs = treeSettings.values().next()) {
        this.fx = x;
        this.fy = y;
        this.angle = angle;
        this.stgs = stgs;
        this.lT = this.stgs.lt * random(.5, 1.5);
        this.splitTime = this.lT * random(this.stgs.mnSpT, (this.stgs.mxSpT ?? (this.stgs.mnSpT + .1)));
        this.thk = this.stgs.thk;
        this.gt = this.stgs.gtInitial;
        this.color = this.stgs.colorBase.randomise(7).toCSS();
        Planter.list.push(this);
    }
    update() {
        this.angle += random(-this.stgs.warping, this.stgs.warping) * growStepSize;
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
            this.split(0, this.stgs.sMidMx);
            this.splitTime += random(this.stgs.mnSpT, this.stgs.mxSpT ?? (this.stgs.mnSpT * 2));
        }
        if (this.age > this.lT) {
            this.split(1, this.stgs.sEndMx);
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
            r = this.stgs.lfAmount;
        }

        for (let i = 0; i < r; i++) {
            let pla = new Planter(this.x, this.y, rotateAngle((this.angle + random(-angDif, angDif)), Math.PI / -2, .3), this.stgs);
            pla.thk = Math.max(1, this.thk - 1);
            pla.gen = this.gen + randomInt(1, 1 + (this.stgs.skipGenMax ?? 1));
            pla.lT /= pla.gen;
            pla.splitTime /= pla.gen / pla.gen;
            pla.gt -= pla.gen * this.stgs.gtPerGen
            if (this.gen >= this.stgs.lfGen) {
                pla.color = this.stgs.colorLeaves.randomise(20).toCSS();
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
// to export desired tree to file in view of integrating it in the main json file >>>>> broken
function jsondump() {
    let tree = document.getElementById("which").value;

    if (tree) {
        let set = (eval("set" + tree));
        treeSettings.set(tree, set);
    }


    let myObj = Object.fromEntries(treeSettings);
    JSONToFile(myObj, "Trees.json");
}
// to export desired tree to file in view of integrating it in the main json file >>>>> broken
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
        set1 = treeSettings.get(tree);
    }
    if (n == '2') {
        let tree = document.getElementById("whichLeft").value;
        set2 = treeSettings.get(tree);
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

let pixelData = Array.from(Array(dim.x), () => new Array(dim.y))
for (let x = 0; x < dim.x; x++) {
    for (let y = 0; y < dim.y; y++) {
        pixelData[x][y] = { value: 0, newValue: 0 };
    }
}
pixelData[Math.floor(dim.x / 2)][Math.floor(dim.y / 2)].newValue = 254;
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
    })
}