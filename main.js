pelialueendiv = document.getElementById("peli");

var pelihahmo;
var seinat = [];
var avainloydetty = false;
avainefekti = new sound("avainloydetty.mp3", false);
voittoefekti = new sound("voittoefekti.mp3", false);
kavelyefekti = new sound("kavely.mp3", true);
//jos haluat nähdä pelikentän testauksessa laita pimeys = false
var pimeys = true;


// tätä funktiota kutsumalla peli alkaa, se luo pelihahmon ja kutsuu luoseinät funktiota joka lisää seinat var seinät listaan//
function aloitapeli(){
    pelihahmo = new komponentti(20, 20, "green", 25, 30);
    luoseinat();
    avain = new komponentti(10, 10, "yellow", 990, 530);
    ovi = new komponentti(10, 60, "brown", 1120, 10);
    pelialue.aloita();
    
}

//tämä funktio tekee pelialueen + lisää interval koodilla frameraten joka on 20ms. window addeventlistener lisää nuolinäppäimet liikumiseen//
var pelialue = {
    canvas : document.createElement("canvas"),
    aloita : function() {
        this.canvas.width = 1130;
        this.canvas.height = 710;
        this.context = this.canvas.getContext("2d");
        pelialueendiv.insertBefore(this.canvas, pelialueendiv.childNodes[0]);
        this.interval = setInterval(updateGameArea, 20);
        window.addEventListener('keydown', function (e) {
            pelialue.keys = (pelialue.keys || []);
            pelialue.keys[e.keyCode] = (e.type == "keydown");
        })
        window.addEventListener('keyup', function (e) {
            pelialue.keys[e.keyCode] = (e.type == "keydown")     
        })
        
    },
        clear : function() {
        this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    },
        stop : function() {
        clearInterval(this.interval);
  }
}

//luo komponentteja kuten pelihahmon sekä seinät. newpos liikuttaa pelaajaa/komponentteja ja update piirtää ne kenttään//
//craswith komento tarkistaa kyseisen objektin (this) sekä otherobj esim vaikka seinän osumista. Sille voi antaa mitkä tahansa kaksi asiaa ja palauttaa joko 
// false eli osumista ei tapahtunut tai true eli osuminen tapahtuu. Jos on true, se palauttaa pelaajan takaisin omalle paikalle. Se tarkistaa joka kerta kun liikut//
//kutsumalla funktiota voi luoda minkä tahansa objektin antamalla sille objektin leveyden, pituuden, värin, x-kordinaatin ja y-kordinaatin
function komponentti(width, height, color, x, y) {
    this.width = width;
    this.height = height;
    this.speedX = 0;
    this.speedY = 0;
    this.x = x;
    this.y = y;
    this.update = function() {
        ctx = pelialue.context;
        ctx.fillStyle = color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
    this.newPos = function() {
        this.x += this.speedX;
        this.y += this.speedY;    
 
    }
    this.crashWith = function(otherobj) {
        var myleft = this.x;
        var myright = this.x + (this.width);
        var mytop = this.y;
        var mybottom = this.y + (this.height);
        var otherleft = otherobj.x;
        var otherright = otherobj.x + (otherobj.width);
        var othertop = otherobj.y;
        var otherbottom = otherobj.y + (otherobj.height);
        var crash = true;
        if ((mybottom < othertop) || (mytop > otherbottom) || (myright < otherleft) || (myleft > otherright)) {
            crash = false;
        }
        return crash;
    }
}

// tämä koodi ohjaa pelialueen uusimista ja updatea. Tällä koodilla voit piirtää asioita kuten vihollisen
// koodi katsoo mitä nappeja on painettu ja myös liikuttaa hahmoa. Pelaajaa likutetaan nuolinäppäimillä.
// Koodi myös luo seinät, avaimen ja oven sekä piirtää niitä, sekä aktivoi seinään, oveen ja avaimeen osumistarkistus koodin
// tätä tarkistusta voi mahdollisesti myös käyttää viholliseen osumisessa
function updateGameArea() {
    pelialue.clear();
    pelihahmo.speedX = 0;
    pelihahmo.speedY = 0;
    if (pelialue.keys && pelialue.keys[37] != true && pelialue.keys[38] != true && pelialue.keys[39] != true && pelialue.keys[40] != true) {
        kavelyefekti.stop()
    } 
    if (pelialue.keys && pelialue.keys[37]) {pelihahmo.speedX = -1; if(!kavelyefekti.paused) {kavelyefekti.play()}};
    if (pelialue.keys && pelialue.keys[39]) {pelihahmo.speedX = 1;if(!kavelyefekti.paused) {kavelyefekti.play()}};;
    if (pelialue.keys && pelialue.keys[38]) {pelihahmo.speedY = -1;if(!kavelyefekti.paused) {kavelyefekti.play()}};
    if (pelialue.keys && pelialue.keys[40]) {pelihahmo.speedY = 1;if(!kavelyefekti.paused) {kavelyefekti.play()}};
    for (i = 0; i < seinat.length; i += 1) {
        seinat[i].update(); 
    }
    pelihahmo.newPos();    
    for (i = 0; i < seinat.length; i += 1) {
        if (pelihahmo.crashWith(seinat[i])) {
            pelihahmo.x -= pelihahmo.speedX;
            pelihahmo.y -= pelihahmo.speedY;
        } 
    }
    if(pelihahmo.crashWith(avain)){
        avainloydetty = true;
        avainefekti.play();
        }
    if(avainloydetty == false) {
        avain.update();
    }
    if(pelihahmo.crashWith(ovi)){
        if(avainloydetty == true){
            voitto();
        }else {
            pelihahmo.x -= pelihahmo.speedX;
            pelihahmo.y -= pelihahmo.speedY;
        }
    }
    pelihahmo.update();
    ovi.update();
    if(pimeys == true) {
        var fog = createFog(pelihahmo);
        pelialue.context.drawImage(fog, 0, 0);
    }

}   

//peli tarkistaa nyt onko avainloydetty true. Jos avainloydetty on true ja pelaaja osuu oveen, funktiota voitto kutsutaan ja pelialue pysähtyy
//tällä funktiolla voit tehdä voittoruudun
function voitto(){
    pelialue.stop();
    voittoefekti.play();
    kavelyefekti.stop();
}

//tämä koodi lisää array(seinat) jokaisen seinän jonka yläpuolella oleva koodi updategamearea lisää kentään
function luoseinat(){
    seinat.push(new komponentti(10, 710, "black", 0, 0));
    seinat.push(new komponentti(1140, 10, "black", 0, 0));
    seinat.push(new komponentti(1140, 10, "black", 0, 700));
    seinat.push(new komponentti(10, 630, "black", 1120, 80));
    seinat.push(new komponentti(80, 140, "black", 70, 10));
    seinat.push(new komponentti(80, 430, "black", 70, 210));
    seinat.push(new komponentti(80, 80, "black", 140, 560));
    seinat.push(new komponentti(80, 140, "black", 280, 560));
    seinat.push(new komponentti(80, 80, "black", 350, 560));
    seinat.push(new komponentti(150, 80, "black", 210, 420));
    seinat.push(new komponentti(150, 80, "black", 420, 420));
    seinat.push(new komponentti(80, 290, "black", 490, 350));
    seinat.push(new komponentti(80, 290, "black", 630, 350));
    seinat.push(new komponentti(80, 290, "black", 210, 70));
    seinat.push(new komponentti(80, 80, "black", 140, 210));
    seinat.push(new komponentti(150, 80, "black", 280, 70));
    seinat.push(new komponentti(220, 80, "black", 350, 210));
    seinat.push(new komponentti(80, 80, "black", 350, 280));
    seinat.push(new komponentti(80, 140, "black", 490, 10));
    seinat.push(new komponentti(80, 70, "black", 560, 10));
    seinat.push(new komponentti(80, 80, "black", 700, 70));
    seinat.push(new komponentti(80, 150, "black", 630, 140));
    seinat.push(new komponentti(290, 80, "black", 840, 70));
    seinat.push(new komponentti(80, 220, "black", 840, 70));
    seinat.push(new komponentti(80, 80, "black", 770, 210));
    seinat.push(new komponentti(220, 80, "black", 700, 350));
    seinat.push(new komponentti(220, 80, "black", 910, 420));
    seinat.push(new komponentti(290, 80, "black", 770, 560));
    seinat.push(new komponentti(80, 80, "black", 770, 490));
    seinat.push(new komponentti(80, 150, "black", 980, 210));
}


//tämän funktion löysin netistä ja implimentoin tähän peliin. Se luo pimeyden ja näköalan vain pelaajan ympärille
function createFog(player) {
    var fogCanvas = document.createElement('canvas'),
        ctx = fogCanvas.getContext('2d'),
        grd = ctx.createRadialGradient(player.x,
                                        player.y,
                                        0,player.x,
                                        player.y,80);
    fogCanvas.width = 1130;
    fogCanvas.height = 710;

    grd.addColorStop(0,"rgba(50,50,50,0)");
    grd.addColorStop(1,"black");

    ctx.fillStyle = grd;
    ctx.fillRect(0,0,1130,710);

    return fogCanvas;
}

//funktio ääniefekteille
function sound(src, loops) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.loop = loops
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.sound.volume = 0.5
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}
