performance.mark("1");
/** 
 * @type {HTMLCanvasElement}
*/
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const pcanvas = document.getElementById("particleCanvas");
const pctx = pcanvas.getContext("2d");
ctx.imageSmoothingEnabled = false;
pctx.imageSmoothingEnabled = false;
let dim = { x: 512, y: 216 };
let scaleRatioY = window.innerHeight / 300
let scaleRatioX = window.innerWidth / 180
let scaleRatio = Math.min(scaleRatioX, scaleRatioY);
dim = { x: Math.floor(window.innerWidth / scaleRatio), y: Math.floor(window.innerHeight / scaleRatio) }
//const dim = { x: 3440, y: 1440 };
canvas.width = dim.x;
canvas.height = dim.y;
pcanvas.width = dim.x;
pcanvas.height = dim.y;

const imageData = ctx.createImageData(dim.x, dim.y);

let growStepSize = 0.007;
let deltaTime = 0.01;

const lfGen = 7;
const treeSettings = new Map();

treeSettings.set("Oak-baby", {
    hr:30000, // dont know
    lt: .8, // life time
    mnSpT: .7, // inverse amount of leaves
    thk: 2, // thickness of the trunk
    gtInitial: .9, // dont know
    warping: 5, // recroquevitude du tronc
    lfGen: 7, // nombres de splits avant les feuilles
    gtPerGen: .1, // dont know
    angDif: 1.3, // inclinaison possible des branches
    lfAmount: 3, // amount of leaves
    lfLength: .9, // length of leaves
    lfGravity: 6, // gravity of the leaves
    lfThickness: 4, // thickness of leaves
    sEndMx: 3, // number of mini-branches at the end of the split
    sMidMx: 10, // number of branches at the trunk
    skipGenMax: 0, // skip things on the way
    lfSteps: 3, // split des feuilles
    colorBase: new Color(155, 145, 35),
    colorLeaves: new Color(122, 56, 12)
});

treeSettings.set("Oak4", {
    hr:30000, // dont know
    lt: .8, // life time
    mnSpT: .8, // inverse amount of leaves
    thk: 2, // thickness of the trunk
    gtInitial: .9, // dont know
    warping: 7, // recroquevitude du tronc
    lfGen: 7, // nombres de splits avant les feuilles
    gtPerGen: .1, // dont know
    angDif: 1.8, // inclinaison possible des branches
    lfAmount: 3, // amount of leaves
    lfLength: .9, // length of leaves
    lfGravity: 6, // gravity of the leaves
    lfThickness: 3, // thickness of leaves
    sEndMx: 3, // number of mini-branches at the end of the split
    sMidMx: 7, // number of branches at the trunk
    skipGenMax: 0, // skip things on the way
    lfSteps: 3, // split des feuilles
    colorBase: new Color(45, 67, 45),
    colorLeaves: new Color(122, 56, 123)
});


treeSettings.set("Oak", {
    hr:30000, // dont know
    lt: .7, // life time
    mnSpT: .7, // inverse amount of leaves
    thk: 3, // thickness of the trunk
    gtInitial: .9, // dont know
    warping: 5, // recroquevitude du tronc
    lfGen: 5, // nombres de splits avant les feuilles
    gtPerGen: .1, // dont know
    angDif: 1.3, // inclinaison possible des branches
    lfAmount: 3, // amount of leaves
    lfLength: .9, // length of leaves
    lfGravity: -10, // gravity of the leaves
    lfThickness: 4, // thickness of leaves
    sEndMx: 5, // number of mini-branches at the end of the split
    sMidMx: 10, // number of branches at the trunk
    skipGenMax: 0, // skip things on the way
    lfSteps: 2, // split des feuilles
    colorBase: new Color(155, 145, 35),
    colorLeaves: new Color(60, 9, 40)
});

treeSettings.set("Oak4", {
    hr:30000, // dont know
    lt: .8, // life time
    mnSpT: .8, // inverse amount of leaves
    thk: 2, // thickness of the trunk
    gtInitial: .9, // dont know
    warping: 7, // recroquevitude du tronc
    lfGen: 7, // nombres de splits avant les feuilles
    gtPerGen: .1, // dont know
    angDif: 1.8, // inclinaison possible des branches
    lfAmount: 3, // amount of leaves
    lfLength: .9, // length of leaves
    lfGravity: 6, // gravity of the leaves
    lfThickness: 3, // thickness of leaves
    sEndMx: 3, // number of mini-branches at the end of the split
    sMidMx: 7, // number of branches at the trunk
    skipGenMax: 0, // skip things on the way
    lfSteps: 3, // split des feuilles
    colorBase: new Color(45, 67, 45),
    colorLeaves: new Color(122, 56, 123)
});


treeSettings.set("Oak3", {
    hr:30000, // dont know
    lt: .8, // life time
    mnSpT: .5, // inverse amount of leaves
    thk: 6, // thickness of the trunk
    gtInitial: .9, // dont know
    warping: 3, // recroquevitude du tronc
    lfGen: 6, // nombres de splits avant les feuilles
    gtPerGen: .1, // dont know
    angDif: 1.5, // inclinaison possible des branches
    lfAmount: 4, // amount of leaves
    lfLength: .4, // length of leaves
    lfGravity: -6, // gravity of the leaves
    lfThickness: 7, // thickness of leaves
    sEndMx: 5, // number of mini-branches at the end of the split
    sMidMx: 7, // number of branches at the trunk
    skipGenMax: 0, // skip things on the way
    lfSteps: 3, // split des feuilles
    colorBase: new Color(142, 134, 200),
    colorLeaves: new Color(60, 139, 40)
});




treeSettings.set("Oak2", {
    hr:110,
    lt: .7,
    mnSpT: .3,
    thk: 4,
    gtInitial: .3,
    warping: 5,
    lfGen: 4,
    gtPerGen: .35,
    angDif: 1.3,
    lfAmount: 4,
    lfLength: .3,
    lfGravity: 0,
    lfThickness: 4,
    sEndMx: 5,
    sMidMx: 4,
    skipGenMax: 0,
    lfSteps: 2,
    colorBase: new Color(55, 45, 35),
    colorLeaves: new Color(60, 110, 40)
});
treeSettings.set("Sakura", {
    hr:320,
    lt: .5,
    mnSpT: .8,
    thk: 6,
    gtInitial: 3,
    warping: 40,
    lfGen: 12,
    gtPerGen: 1,
    angDif: 1,
    lfAmount: 5,
    lfLength: .8,
    lfGravity: 0,
    lfThickness: 4,
    sEndMx: 2,
    sMidMx: 2,
    lfSteps: 1,
    colorBase: new Color(50, 30, 30),
    colorLeaves: new Color(220, 140, 150)
});
treeSettings.set("Palm", {
    hr:40,
    lt: 1.1,
    mnSpT: 2,
    thk: 3,
    gtInitial: -.5,
    warping: 3,
    lfGen: 1,
    gtPerGen: .5,
    angDif: 0,
    lfAmount: 10,
    lfLength: .3,
    lfGravity: -7,
    lfThickness: 4,
    sEndMx: 1,
    sMidMx: 1,
    skipGenMax: 0,
    lfSteps: 3,
    colorBase: new Color(60, 30, 25),
    colorLeaves: new Color(80, 130, 30)
});
treeSettings.set("OakWinter", {
    hr:180,
    lt: .7,
    mnSpT: .3,
    thk: 4,
    gtInitial: .3,
    warping: 20,
    lfGen: 5,
    gtPerGen: .1,
    angDif: 1.4,
    lfAmount: 1,
    lfLength: .5,
    lfGravity: 0,
    lfThickness: 4,
    sEndMx: 4,
    sMidMx: 3,
    skipGenMax: 1,
    lfSteps: 2,
    colorBase: new Color(80, 110, 125),
    colorLeaves: new Color(185, 190, 200),
});
treeSettings.set("Birch", {
    hr:80,
    lt: .7,
    mnSpT: .6,
    thk: 3,
    gtInitial: .5,
    warping: 3,
    lfGen: 6,
    gtPerGen: .35,
    angDif: .9,
    lfAmount: 3,
    lfLength: 2,
    lfGravity: -30,
    lfThickness: 2,
    sEndMx: 4,
    sMidMx: 6,
    skipGenMax: 0,
    lfSteps: 0,
    colorBase: new Color(180, 170, 160),
    colorLeaves: new Color(90, 120, 40),
});

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
function generate() {
    if (a) {
        document.getElementById("titleText").style.opacity = "0";
        a = false;
    }
    //let set = Array.from(treeSettings.values())[randomInt(0, treeSettings.size - 1)];
    let set = Array.from(treeSettings.values())[randomInt(0, 0)];
   // document.getElementById("bg").style.filter = `hue-rotate(${set.hr}deg)`;
    document.getElementById("bg").style.background = 'black';
    ctx.clearRect(0, 0, dim.x, dim.y);
    Planter.list = [];
    new Planter(dim.x / 2, dim.y, random(Math.PI / -2 - .3, Math.PI / -2 + .3), set)
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

let planterStepsPerUpdate = 1;
let planterStepsElapsed = 0;

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

function randomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}
function random(min, max) {
    return (Math.random() * (max - min)) + min;
}

function randomElement(array) {
    return array[randomInt(0, array.length - 1)];
}

function rotateAngle(from, to, amount) {
    amount = Math.min(1, Math.max(-1, amount))
    var netAngle = (from - to + Math.PI * 2) % (Math.PI * 2);
    var delta = Math.min(Math.abs(netAngle - Math.PI * 2), netAngle, amount);
    var sign = (netAngle - Math.PI) >= 0 ? 1 : -1;
    from += sign * delta + Math.PI * 2;
    from %= Math.PI * 2;
    return from;
}
