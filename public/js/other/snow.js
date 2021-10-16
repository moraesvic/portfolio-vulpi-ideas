/* necessary class */

class RGB
{
    constructor(r,g,b)
    {
        this.r = r;
        this.g = g;
        this.b = b;
    }
}

/* the following parameters can be tweaked for performance and more */
/* null/undefined stuff is defined in switchLightMode */

var GAUSSIAN_SAMPLE;
var LOOP_CLEAR;

/* Snowflake constants */
const SF =
{
    fps:        null,
    msPerFrame: null,
    minRadius:  0.4,
    maxRadius:  3.5,
    minXVel:    0.0,
    maxXVel:    0.5,
    minYVel:    0.8,
    maxYVel:    1.5,
    minAmp:  10.0,
    maxAmp:  500.0,
    halfLife: null,
    /* periods given in seconds */
    minPeriod: 10.0,
    maxPeriod: 20.0,
    startAngle: 0,
    endAngle:   Math.PI*2,
    white:      Object.freeze(new RGB(0xff,0xff,0xff))
}

/* */

function randint(a, b){
    /* returns random integer in [a, b[ */
    a = Math.floor(a);
    b = Math.floor(b);
    return a + Math.floor(Math.random() * (b - a));
}

function randfloat(a, b){
    /* returns random float in [a, b] */
    return a + Math.random() * (b - a);
}

function randfloatGaussian(a, b){
    var sum = 0;
    for(var i = 0; i < GAUSSIAN_SAMPLE; i++)
        sum += Math.random();
    return (b - a) / 2 * (1 + randsign() * sum / GAUSSIAN_SAMPLE);
}

function randsign(){
    return Math.random() > 0.5 ? 1 : -1;
}



function RGBAToString(rgb, a)
{
    var retString = 'rgb(' + rgb.r + ','
                           + rgb.g + ','
                           + rgb.b + ','
                           + a + ')';
    return retString;                           
}

async function sky(canvas){
    /* CONSTANTS AND CONTROLLERS */
    const FPS   = 20;
    const MS_PER_FRAME = 1000.0 / FPS;

    /* The length of the day/night is in trigonometric terms
       actually a half-period.
       Alpha calculation takes that into consideration */
    /* given in seconds */
    const LENGTH_DAY = 10.0;
    const ALPHA_DAY  = Math.PI / (LENGTH_DAY * FPS);
    const LENGTH_NIGHT = 20.0;
    const ALPHA_NIGHT  = Math.PI / (LENGTH_NIGHT * FPS);
    const R_AMP  = 0x40;
    const G_AMP  = 0xa0;
    const B_AMP  = 0xc0;

    const SkyEnum = Object.freeze({ 'day':{}, 'night':{} });

    /* STARTING STUFF */
    const ctx = canvas.getContext('2d');
    var rgbSky = new RGB(0,0x20,0xff);
    var t = sinAlphaT = loopNumber = 0;
    var timeOfDay = SkyEnum.day;

    while(true)
    {
        var timer = new Promise(res => setTimeout(res, MS_PER_FRAME));
        ctx.fillStyle = RGBAToString(rgbSky, 1.0);
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        if(timeOfDay === SkyEnum.day)
        {
            sinAlphaT = Math.sin(ALPHA_DAY * t);
            rgbSky.r = R_AMP * sinAlphaT;
            rgbSky.g = G_AMP * sinAlphaT;

            if(sinAlphaT < 0)
            {
                rgbSky.r = 0;
                rgbSky.g = 0;
                t = 0;
                timeOfDay = SkyEnum.night;
            }
            else
                t++;
        }
        else if(timeOfDay === SkyEnum.night)
        {
            sinAlphaT = Math.sin(ALPHA_NIGHT * t);
            rgbSky.b = 0xff - B_AMP * sinAlphaT;
            if(sinAlphaT < 0)
            {
                rgbSky.b = 0xff;
                t = 0;
                timeOfDay = SkyEnum.day;
            }
            else
                t++;
        }

        /* FOR DEBUG */
        if(loopNumber % 60 === 0)
        {
            rgbSky.r = Math.floor(rgbSky.r);
            rgbSky.g = Math.floor(rgbSky.g);
            rgbSky.b = Math.floor(rgbSky.b);
            // console.log(rgbSky);
        }

        loopNumber++;
        await timer;
    }
}

const SNOW_PNG = [new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image(), new Image()];

function loadImg(){
    SNOW_PNG[0].src = 
    'data:image/png;base64, \
    iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAE0lEQVQY02NgGALg/////4eCOwGY\
    0QP9ELsJCQAAAABJRU5ErkJggg==';
    SNOW_PNG[1].src = SNOW_PNG[0].src;
    SNOW_PNG[2].src = 
    'data:image/png;base64, \
    iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAHklEQVQY02NgGFhw8eaj/+hijLgU\
    6KvLMZJkEp0BAEIvCxj/fUm4AAAAAElFTkSuQmCC';
    SNOW_PNG[3].src = SNOW_PNG[4].src = SNOW_PNG[5].src = SNOW_PNG[2].src;
    SNOW_PNG[6].src = 
    'data:image/png;base64, \
    iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAMElEQVQY02NgIAfMP/joP9GSeBUf\
    vIgpyYSs6+DFR/8FOBAKcZqGzSTy3IRXEh8AAPS2J+8YBC2QAAAAAElFTkSuQmCC';
    SNOW_PNG[7].src = 
    'data:image/png;base64, \
    iVBORw0KGgoAAAANSUhEUgAAAAkAAAAJCAYAAADgkQYQAAAAMklEQVQY02NgQAMHLz76z4AN4JLA\
    EJ9/ECKAThMPYEbCdF68icrH6UacgKCbiPYdPgkAKXY5LLvUBBYAAAAASUVORK5CYII=';

}

class Snowflake
{
    constructor()
    {
        /* put the snowflake anywhere, horizontally */
        /* so when we change to light mode it is not weird */
        this.x = randint(0,960);
        this.y = 0;
        this.radius = randfloat(SF.minRadius,SF.maxRadius);
        // console.log(this.radius);
        this.size   = Math.floor((this.radius - SF.minRadius) / (SF.maxRadius - SF.minRadius) * SNOW_PNG.length);
        // console.log(SNOW_PNG.length);
        this.transparency = 0.4 + 0.35 * Math.random();

        this.t = 0;
        this.xVel = randsign() * randfloat(SF.minXVel, SF.maxXVel);
        this.yVel = randfloat(SF.minYVel, SF.maxYVel);

    }

    draw(ctx)
    {
        if(this.x > 1.1 * canvasWidth || this.x < -0.1 * canvasWidth
            || this.y > 1.1 * canvasHeight || this.y < -0.1 * canvasHeight)
                return;
        
        ctx.globalAlpha = this.transparency;
        ctx.drawImage(SNOW_PNG[this.size],this.x,this.y);
        /*
        ctx.fillStyle = RGBAToString(SF.white, this.transparency);
        ctx.strokeStyle = RGBAToString(SF.white, this.transparency);
        ctx.translate(this.x,this.y);

        var sin, cos;

        for(var i = 0; i < 3; i++)
        {   
            sin = Math.sin(i * 2.0/3.0 * Math.PI);
            cos = Math.cos(i * 2.0/3.0 * Math.PI);
            ctx.beginPath();
            ctx.moveTo(-this.radius * cos, -this.radius * sin);
            ctx.lineTo(+this.radius * cos, +this.radius * sin);
            ctx.stroke();
        }

        ctx.translate(-this.x,-this.y);
        */
        
    }

    move()
    {
        this.x += this.xVel / this.radius;
        this.xVel += randfloat(-SF.maxXVel, SF.maxXVel) / 10.0;

        this.y += this.yVel;
        if(this.radius < 1.5)
            this.y -= 0.8 * randfloat(SF.minYVel, SF.maxYVel);

        this.t++;
        if(this.t > 1200)
            this.transparency -= 0.005;
    }
}

async function snow(canvas){
    /* */
    const ctx = canvas.getContext('2d');
    
    var flakes = [];
    
    for(var loopNumber = 0; ; loopNumber++)
    {
        var timer = new Promise(res => setTimeout(res, SF.msPerFrame));
        ctx.clearRect(0,0,canvas.width,canvas.height);

        flakes.forEach(el =>
        {
            el.move();
            el.draw(ctx);
        });

        flakes.push(new Snowflake());
        
        if(loopNumber % LOOP_CLEAR === 0)
        {
            console.log(flakes.length);
            for(var i = 0; i < flakes.length; i++)
                if(flakes[i].transparency <= 0.0)
                    flakes.splice(i,1);
        }

        await timer;
    }
}

var canvasWidth, canvasHeight;

function resizeCanvas(){
    const canvasContainer = document.getElementById('canvasContainer');
    const desiredHeight = canvasContainer.offsetWidth * 9.0 / 16.0;
    canvasWidth = document.getElementById('canvasLayer1').width;
    canvasHeight = document.getElementById('canvasLayer1').height;
    canvasContainer.setAttribute('style','height:' + desiredHeight + 'px');
}

/* */

var LIGHT_MODE;

function switchLightMode(){
    const slowFast = document.getElementById('slowfast');
    const layer2 = document.getElementById('canvasLayer2');

    if(LIGHT_MODE === true)
    {
        /* turn off light mode */
        SF.fps = 30;
        SF.msPerFrame = 1000.0 / SF.fps;
        SF.halfLife = 1200;
        GAUSSIAN_SAMPLE = 100;
        LOOP_CLEAR = 120;
        layer2.width = 960;
        layer2.height = 540;

        LIGHT_MODE = false;
        console.log('turning off light mode');
        slowFast.innerHTML = 'Too slow? Enable light mode 😎';
    }
    else
    {
        /* enable light mode */
        SF.fps = 30;
        SF.msPerFrame = 1000.0 / SF.fps;
        SF.halfLife = 600;
        GAUSSIAN_SAMPLE = 50;
        LOOP_CLEAR = 60;
        layer2.width = 800;
        layer2.height = 450;
        
        LIGHT_MODE = true;
        console.log('enabling light mode');
        slowFast.innerHTML = 'Too cranky? Click here 🚀';
    }
}

/* */
function playAudio(){
    var isChrome = /Chrome/.test(navigator.userAgent) && /Google Inc/.test(navigator.vendor);
    var elem;
    if (!isChrome)
        elem = document.getElementById('iframeAudio');
    else 
        elem = document.getElementById('playAudio');

    elem.parentNode.removeChild(elem);
}

async function main(){
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    loadImg();
    LIGHT_MODE = true; /* will be inverted */
    switchLightMode();
    
    const layer1 = document.getElementById('canvasLayer1');
    const layer2 = document.getElementById('canvasLayer2');
    if(!layer1 || !layer2){
        alert('could not load canvas. website will not load properly. sorry :(');
        return;
    }

    sky(layer1);
    snow(layer2);
    

    
    
    /* */
    
    
}

