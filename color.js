class Color {
    r = 0;
    g = 0;
    b = 0;
    a = 255;
    constructor(r, g, b, a) {
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a ?? 255;
    }
    toCSS() {
        return "rgb(" + this.r + "," + this.g + "," + this.b + ")";
    }
    randomise(d) {
        return new Color(clampRound(this.r + random(-d, d)), clampRound(this.g + random(-d, d)), clampRound(this.b + random(-d, d)))
    }
    static grayscale(val) {
        return new Color(val, val, val);
    }
}
function clampRound(x) {
    return Math.max(0, Math.min(255, Math.round(x)));
}