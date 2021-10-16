class RGBA
{
    constructor(r,g,b,a){
        this.r = r;
        this.g = g;
        this.b = b;
        this.a = a;
    }

    applyTransparency(factor){
        let ret = new RGBA(this.r, this.g, this.b, this.a);
        ret.a = ret.a * factor;
        return ret;
    }
}

class Pos
{
    constructor(x,y){
        this.x = x;
        this.y = y;
    }
}

function rgbaStr(rgba)
{
    return 'rgba(' + rgba.r + ',' + rgba.g
    + ',' + rgba.b + ',' + rgba.a + ')';
}

const MOV_NO    =  0;
const MOV_LEFT  = -1;
const MOV_RIGHT = +1;

/* Javascript doesn't have enums, so we will have to content ourselves
 *  with this */
const Colors = Object.freeze({
    BLACK: new RGBA(0x00, 0x00, 0x00, 1.0),
    WHITE: new RGBA(0xff, 0xff, 0xff, 1.0),
    RED:   new RGBA(0xff, 0x00, 0x00, 1.0),
    GREEN: new RGBA(0x00, 0xff, 0x00, 1.0),
    BLUE:  new RGBA(0x00, 0x00, 0xff, 1.0),
    DARK_GREEN: new RGBA(0x00, 0x64, 0x00, 1.00),
    DARK_RED: new RGBA(0xc0, 0x0, 0x00, 1.0)
});

function strToRGBA(str)
{
    let hexa_r = str.slice(1,3);
    let hexa_g = str.slice(3,5);
    let hexa_b = str.slice(5,7);
    let r = parseInt(hexa_r, 16);
    let g = parseInt(hexa_g, 16);
    let b = parseInt(hexa_b, 16);
    return new RGBA(r, g, b, 1.0);
}

const Genders = 
{
    MASKULIN:
            {
                article: "der",
                color:   Colors.BLUE
            },
    FEMININ:
            {
                article: "die",
                color:   Colors.DARK_RED
            },
    NEUTRAL:
            {
                article: "das",
                color:   Colors.DARK_GREEN
            }
};

const WORDS =
{
    "Name": Genders.MASKULIN,
    "Mann": Genders.MASKULIN,
    "Frau": Genders.FEMININ,
    "Kind": Genders.NEUTRAL,
    "Haus": Genders.NEUTRAL,
    "Tier": Genders.NEUTRAL,
    "Mutter": Genders.FEMININ,
    "Vater": Genders.MASKULIN,
    "Bruder": Genders.MASKULIN,
    "Schwester": Genders.FEMININ,
    "Auto":  Genders.NEUTRAL,
    "Computer": Genders.MASKULIN,
    "Kamera": Genders.FEMININ,
    "Tisch": Genders.MASKULIN,
    "Stuhl": Genders.MASKULIN,
    "Hand": Genders.FEMININ,
    "Mund": Genders.MASKULIN,
    "Auge": Genders.NEUTRAL,
    "Handy": Genders.NEUTRAL,
    "Fenster": Genders.NEUTRAL,
    "Wohnung": Genders.FEMININ,
    "Schule": Genders.FEMININ,
    "Aufgabe": Genders.FEMININ,
    "Buch": Genders.NEUTRAL,
    "Kuchen": Genders.MASKULIN,
    "Küche": Genders.FEMININ,
    "Lehrer": Genders.MASKULIN,
    "Student": Genders.MASKULIN,
    "Freiheit": Genders.FEMININ,
    "Universität": Genders.FEMININ,
    "Leben": Genders.NEUTRAL,
    "Spiel": Genders.NEUTRAL,
    "Beispiel": Genders.NEUTRAL,
    "Übung": Genders.FEMININ,
    "Seite": Genders.FEMININ,
    "Geschäft": Genders.NEUTRAL,
    "Laden": Genders.MASKULIN,
    "Straße": Genders.FEMININ,
    "Land": Genders.NEUTRAL,
    "Hund": Genders.MASKULIN,
    "Pferd": Genders.NEUTRAL,
    "Maus": Genders.FEMININ,
    "Katze": Genders.FEMININ,
    "Stift": Genders.MASKULIN,
    "Job": Genders.MASKULIN,
    "Arbeit": Genders.FEMININ,
    "Firma": Genders.FEMININ,
    "Stadt": Genders.FEMININ
}

function randomKey(obj) {
    var keys = Object.keys(obj);
    return keys[ keys.length * Math.random() << 0];
};

class Rect
{
    constructor(x,y,lenx,leny,vx,vy, column){
        this.pos = new Pos(x,y);
        this.lenx = lenx;
        this.leny = leny;
        this.vx = vx || 0;
        this.vy = vy || 0;
        this.color = Colors.BLACK;
        this.active = true;
        this.column = column;
        this.text = '';
    }

    draw(ctx){
        ctx.fillStyle = rgbaStr(this.color);
        ctx.fillRect(this.pos.x, canvas.height - this.pos.y,
            this.lenx, -this.leny);
        // ctx.transform(1, 0, 0, -1, 0, canvas.height);
        ctx.font = '20px sans-serif';
        ctx.fillStyle = rgbaStr(Colors.WHITE);
        ctx.fillText(this.text, this.pos.x + 10, canvas.height - this.pos.y - 7, this.lenx);
        // ctx.transform(1, 0, 0, -1, 0, canvas.height);
    }

    move(){
        this.pos.x += this.vx;
        this.pos.y += this.vy;

        if (this.pos.y + this.leny < 0)
            this.active = false;
    }


}

class Player extends Rect
{
    constructor(x,y,lenx,leny,vx,vy){
        super(x, y, lenx, leny, vx, vy);
        this.lastPos = [];
        this.moving = MOV_NO;
        this.floorBelow = false;
        this.floor = null;
        this.alive = true;
    }

    move(objList){
        this.lastPos.push(new Pos(this.pos.x, this.pos.y));
        
        if (this.lastPos.length > 8)
            this.lastPos.splice(0,1);
        
        if (this.moving === MOV_LEFT  && this.vx > -10)
            this.vx -= 2;

        if (this.moving === MOV_RIGHT && this.vx < +10)
            this.vx += 2; 

        objList.forEach( obj => {
            if (!obj.active)
                return;

            if (this.pos.x + this.lenx + this.vx > obj.pos.x && 
                this.pos.x + this.vx < obj.pos.x + obj.lenx && 
                this.pos.y + this.leny > obj.pos.y && 
                this.pos.y < obj.pos.y + obj.leny)
                    this.vx *= -0.25;

            if (this.pos.x + this.lenx > obj.pos.x && 
                this.pos.x < obj.pos.x + obj.lenx && 
                this.pos.y + this.leny + this.vy > obj.pos.y && 
                this.pos.y + this.vy < obj.pos.y + obj.leny)
                    if (this.pos.y > obj.pos.y) {
                        // this.vy *= -0.10;
                        this.vy = obj.vy;
                        this.floorBelow = true;
                        this.floor = obj;
                    }
                    else
                        this.vy *= -0.20;

            if (this.pos.x + this.lenx > obj.pos.x && 
                this.pos.x < obj.pos.x + obj.lenx && 
                this.pos.y + this.leny > obj.pos.y && 
                this.pos.y < obj.pos.y + obj.leny)
                    this.vy += 3;
        });

        if (this.floorBelow)
            if(!(this.pos.x + this.lenx > this.floor.pos.x
                && this.pos.x < this.floor.pos.x + this.floor.lenx))
                    this.floorBelow = false;

        if (this.floorBelow)
            this.vx *= 0.9;

        this.pos.x += this.vx;
        this.pos.y += this.vy;

        if (this.pos.y + this.leny < 0)
            this.alive = false;
    }

    draw(ctx){
        ctx.fillStyle = rgbaStr(this.color);
        ctx.fillRect(this.pos.x,canvas.height - this.pos.y,
            this.lenx, -this.leny);
        let newColor = this.color;
        for (let i = this.lastPos.length - 1; i > 0; i--) {
            newColor = newColor.applyTransparency(0.5);
            ctx.fillStyle = rgbaStr(newColor);
            ctx.fillRect(this.lastPos[i].x, canvas.height - this.lastPos[i].y,
                this.lenx, -this.leny);
        }
    }

    fall(g){
        if (!this.floorBelow || !this.floor.active
            || this.pos.y > this.floor.pos.y + this.floor.leny + 1)
            this.vy -= g;
        else
            this.vy = this.floor.vy;
    }
}

function randint(a, b){
    /* returns random integer in [a, b[ */
    a = Math.floor(a);
    b = Math.floor(b);
    return a + Math.floor(Math.random() * (b - a));
}

var player;
var interrupt;
const canvas = document.getElementById('gamecanvas');

const NUMBER_OF_COLUMNS = 5;

function newPlatform(objList, canvas)
{
    while (objList.filter( (el) => {return el.active}).length < 18) {
        let last = objList[objList.length - 1];
        let column;
        do
            column = randint(0, NUMBER_OF_COLUMNS);
        while (column === last.column);
        let x = column / NUMBER_OF_COLUMNS * canvas.width + randint(-20, +80);
        let y = last.pos.y + 90 + randint(-10,10);
        let width  = 120 + randint(-10, 0);
        let height = 25;
        let vx = 0, vy = last.vy - 0.04 + 0.05 * randint(-1,2);
        let floor = new Rect(x, y, width, height, vx, vy, column);
        let word = randomKey(WORDS);
        console.log(word);
        floor.text = word;
        floor.color = WORDS[word].color;
        objList.push(floor);
    }
}

window.addEventListener("load", playGame);

async function playGame()
{
    let ctx;
    if (canvas.getContext)
        ctx = canvas.getContext('2d');
    else
        return ;
    
    /* to use normal XY axes */
    // ctx.transform(1, 0, 0, -1, 0, canvas.height);

    let objList = [];

    // objList.push(new Rect(0, 0, canvas.width, 1));
    objList.push(new Rect(0, 0, 1, canvas.height * 5));
    objList.push(new Rect(canvas.width - 1, 0, 1, canvas.height * 5));
    // objList.push(new Rect(0, canvas.height - 1, canvas.width, 1));

    /* building first floor and setting player */
    let floor = new Rect(canvas.width / 2, 350, 80, 10, 0, -1.0, 2);
    floor.color = Colors.RED;
    objList.push(floor);
    player = new Player(canvas.width / 2, 361, 30, 40);

    interrupt = false;

    while (player.alive && !interrupt) {
        newPlatform(objList, canvas);
        let timer = new Promise(resolve => setTimeout(resolve, 33));
        ctx.clearRect(0,0, canvas.width, canvas.height);
        player.fall(1.56);
        player.move(objList);
        player.draw(ctx);
        objList.forEach (el => {
            el.draw(ctx);
            el.move();
        });
        await timer;
    }
    if (!interrupt) {
        ctx.fillStyle = rgbaStr(Colors.BLACK);
        ctx.fillRect(0, canvas.height / 3, canvas.width, canvas.height / 3);

        // ctx.transform(1, 0, 0, -1, 0, canvas.height);
        ctx.fillStyle = rgbaStr(Colors.RED);
        ctx.font = '100px serif';
        ctx.fillText("GAME OVER", canvas.width / 4, canvas.height / 2,
            canvas.width / 2);
        // ctx.transform(1, 0, 0, -1, 0, canvas.height);
    }
}

window.addEventListener("keydown", function(e){
    switch (e.key){
    case("ArrowUp"):
        if (player.floorBelow) {
            player.vy = 28;
            player.floorBelow = false;
        }
        break;
    case("ArrowDown"):
        break;
    case("ArrowLeft"):
        player.moving = MOV_LEFT;
        break;
    case("ArrowRight"):
        player.moving = MOV_RIGHT;
        break;
    }
});


window.addEventListener("keyup", function(e){
    switch (e.key){
    case("ArrowUp"):
        break;
    case("ArrowDown"):
        break;
    case("ArrowLeft"):
        if (player.moving === MOV_LEFT)
            player.moving = MOV_NO;
        break;
    case("ArrowRight"):
        if (player.moving === MOV_RIGHT)
            player.moving = MOV_NO;
        break;
    }
});

document.getElementById('colorform').onsubmit = function (e){
    e.preventDefault();
    const masc = document.getElementById('colormasc');
    const fem = document.getElementById('colorfem');
    const neut = document.getElementById('colorneut');
    let mascRGBA = strToRGBA(masc.value);
    let femRGBA  = strToRGBA(fem.value);
    let neutRGBA  = strToRGBA(neut.value);
    Genders.MASKULIN.color = mascRGBA;
    Genders.FEMININ.color = femRGBA;
    Genders.NEUTRAL.color = neutRGBA;
    restartGame();
}

document.getElementById('replay').onclick = restartGame;

function restartGame(){
    interrupt = true;
    setTimeout( () => {
        playGame();
    }, 50);
}