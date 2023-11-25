const { countReset } = require("console");

function initializeGame(canvasId, gameLog, mode="file") {
    
    const gameSpeed = 100;
    const planetsMap = new Map();
    const scores = new Map();
    const fleetMap = new Map();
    const rotationAngles = new Map();
    const fleetColorMap = new Map();
    let width;
    let height;
    let Rcounter =0;
    let canvas;
    const states = [];
    let stateCount = 0;
    let stateResetCounter = 0;
    let currentState = {};
    let previousState = {};
    let animationFrameRef = {};
    const cyanPlanetImage = new Image();
    const magentaPlanetImage = new Image();
    const toxicPlanetImage = new Image();
    const yellowPlanetImage = new Image();
    const neutralPlanetImage = new Image();
    const planetScale = 150;
    const imageMap = {
        "red": magentaPlanetImage,
        "blue": toxicPlanetImage,
        "yellow": yellowPlanetImage,
        "green": cyanPlanetImage,
        "null": neutralPlanetImage
    };
    var socket =null;
    if(mode==="ws"){
        socket = new WebSocket(gameLog);
    }
    if(mode ==="file"){
        for (const line of gameLog.split(/[\r\n]+/)){
            parseLogLine(line);
          }
    }else{
        console.log("Uknown mode: (file, ws)")
    }

    function init() {
        cyanPlanetImage.src = 'assets/Cyan.png';
        magentaPlanetImage.src = 'assets/Magenta.png';
        toxicPlanetImage.src = 'assets/Toxic.png';
        yellowPlanetImage.src = 'assets/Yellow.png';
        neutralPlanetImage.src = 'assets/Grey.png';

        canvas = document.getElementById(canvasId);
        if(canvas==null){
            return;
        }
    
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        var stateT = setInterval(() => stateTransition(), gameSpeed);
        const ctx = canvas.getContext('2d');
        //setInterval(() => renderEnvironment(ctx, currentState), 23);
        animateFleets(ctx, performance.now());
        createFireworks(ctx);
        return [animationFrameRef, stateT];
    }

    function stateTransition() {
        previousState = currentState;
        currentState = states[stateCount];
    
        if (currentState != null && currentState.fleets != null) {
            for (let fleet of currentState.fleets.values()) {
                fleet.startTime = performance.now();
                if (fleet.turn == 1) {
                    fleetColorMap.set(fleet.name, currentState.planets.get(fleet.origin).color);
                }
            }
        }
        stateCount ++;
        
        if (stateResetCounter >= 500) {
            console.log("reseting game");
            stateResetCounter = 0;
            currentState = {};
            previousState = {};
            stateCount = 0;
        }
    }

    function renderScores(ctx, currentState){
        if(!currentState || !currentState.scores) return;
        
        // top left
        let barHeight = height*0.015;
        if  (canvas.width < 768) {
            barHeight = height*0.025;
        } 
        ctx.font = "bold 16px Courier";
        const barPosition = translateCoordinates(currentState.scores.get("team1").relative * width, barHeight);
        ctx.fillStyle = "cyan";
        ctx.fillRect(0,0,barPosition.x, barPosition.y);
       
        // top right
        ctx.fillStyle="orange";
        const endBar = translateCoordinates(width, barHeight);
        ctx.fillRect(barPosition.x,0, endBar.x, endBar.y);

        // top left text
        ctx.fillStyle = 'black';
        
        const text1Pos = translateCoordinates(0, barHeight);
        ctx.beginPath();
        ctx.textAlign = "left";
        ctx.fillText(currentState.scores.get("team1").absolute, text1Pos.x, text1Pos.y);
        ctx.closePath();

        // top right textt
        const text2Pos = translateCoordinates(width, barHeight);
        ctx.beginPath();
        ctx.textAlign = "right";
        ctx.fillText(currentState.scores.get("team2").absolute, text2Pos.x, text2Pos.y);
        ctx.closePath();

        // team 1 player 1
        const sideBarWidth =  width *0.01;
        const leftTpos = translateCoordinates(0,height - (height * currentState.scores.get("red").relative));
        const rightBpos = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = "red";
        ctx.fillRect(leftTpos.x,leftTpos.y,rightBpos.x,rightBpos.y);

        // team 1 player 2
        const leftTpos2 = translateCoordinates(sideBarWidth,height - (height * currentState.scores.get("green").relative));
        const rightBpos2 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = "green";
        ctx.fillRect(leftTpos2.x,leftTpos2.y,rightBpos2.x,rightBpos2.y);

        // team 2 player 1
        const leftTpos3 = translateCoordinates(width - sideBarWidth,height - (height * currentState.scores.get("blue").relative));
        const rightBpos3 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = "blue";
        ctx.fillRect(leftTpos3.x,leftTpos3.y,rightBpos3.x,rightBpos3.y);

        // team 2 player 2
        const leftTpos4 = translateCoordinates(width - 2 * sideBarWidth,height - (height * currentState.scores.get("yellow").relative));
        const rightBpos4 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = "yellow";
        ctx.fillRect(leftTpos4.x,leftTpos4.y,rightBpos4.x,rightBpos4.y);
    }

    function renderEnvironment(ctx, currentState) {
        if (currentState != null) {
            if (!currentState.planets) {
                return
            }
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            for (const [name, planet] of currentState.planets) {
                
                
                //ctx.save();
                const planetCoords = translateCoordinates(planet.x, planet.y);
                const rotationSpeed = 0.005 / planet.size;

                if (!rotationAngles.has(name)) {
                    rotationAngles.set(name, Math.random());
                }
                rotationAngles.set(name, (rotationAngles.get(name) + rotationSpeed) % (Math.PI * 2));
                /*
                ctx.shadowColor = 'white';
                ctx.shadowBlur = 100;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.translate(planetCoords.x, planetCoords.y);
                ctx.rotate(rotationAngles.get(name));

                const imageX = -((40 + planet.size * planetScale) / 2);
                const imageY = -((40 + planet.size * planetScale) / 2);

                const planetImage = imageMap[planet.color];
                const dim = 40 + planet.size * planetScale
                ctx.drawImage(planetImage, imageX, imageY,dim,dim);
                ctx.restore();
                */
                const scale = (0.15+(planet.size ) * 0.3) * Math.min((canvas.width + 300 )/ 1920, 1);
                drawImageCenter(ctx,imageMap[planet.color], planetCoords.x, planetCoords.y,175,175,scale , rotationAngles.get(name));
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.beginPath();
                ctx.fillStyle = 'black';
                ctx.font = "bold 16px Courier";
                if  (canvas.width < 768) {
                    ctx.font = "bold 10px Courier";
                } 

                ctx.textAlign = "center";
                ctx.fillText(planet.fleetSize, planetCoords.x , planetCoords.y+5);
                
                if (previousState.planets &&  previousState.planets.get(name).color != planet.color) {
                    const explosionCoords = translateCoordinates(planet.x, planet.y);
                    new createFireworks(ctx).animateParticules(explosionCoords.x, explosionCoords.y);
                }
                ctx.closePath();
            }
        }
    }

    var animateFleets = function (ctx, currentTime) {
        if (!currentState) {
            stateResetCounter++;
        }

        renderEnvironment(ctx,currentState);        
        if (currentState != null && currentState.fleets != undefined) {
            for (const fleet of currentState.fleets.values()) {
                if (fleet.turn < fleet.neededTurns) {

                    const originPlanet = currentState.planets.get(fleet.origin);
                    const destinationPlanet = currentState.planets.get(fleet.destination);
                    fleet.particles = fleet.particles || [];

                    const elapsedFraction = (currentTime - fleet.startTime) % gameSpeed / gameSpeed;

                    const journeyFraction = (fleet.turn + elapsedFraction) / fleet.neededTurns;
                    currentX = originPlanet.x + (destinationPlanet.x - originPlanet.x) * journeyFraction;
                    currentY = originPlanet.y + (destinationPlanet.y - originPlanet.y) * journeyFraction;

                    ctx.beginPath();
                    const fleetCoords = translateCoordinates(currentX, currentY);
                    const fleetDisplaySize = 5 + 4 * Math.log(fleet.size) * Math.min((canvas.width + 50 )/ 1920, 1)
                    ctx.arc(fleetCoords.x, fleetCoords.y, fleetDisplaySize, 0, Math.PI * 2);
                    ctx.fillStyle = fleetColorMap.get(fleet.name);
                    ctx.fill();
                    ctx.closePath();

                    // if  (canvas.width >= 768) {
                        ctx.fillStyle = 'white';
                        ctx.textAlign = "center";
                        ctx.fillText(fleet.size, fleetCoords.x, fleetCoords.y + 5);
                    // }
                    

                    /*
                    if (fleet.turn == fleet.neededTurns - 1) {
                        const explosionCoords = translateCoordinates(destinationPlanet.x, destinationPlanet.y);
                        new createFireworks(ctx).animateParticules(explosionCoords.x, explosionCoords.y);
                        fleet.turn = -1;
                    }
                    */
                }
            }
        }
        renderScores(ctx,currentState);
        animationFrameRef.id = requestAnimationFrame((timestamp) => {
            animateFleets(ctx, timestamp);
        });
    }

    function createFireworks(ctx) {

        const numberOfParticules = 15;
        let pointerX = 0;
        let pointerY = 0;
        //const tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
        const colors = ['#44a2ff', '#e7358d', 'FF1461', '#999999'];

        function updateCoords(e) {
            pointerX = e.clientX || e.touches[0].clientX;
            pointerY = e.clientY || e.touches[0].clientY;
        }

        function setParticuleDirection(p) {
            const angle = anime.random(0, 360) * Math.PI / 180;
            const value = anime.random(50, 180);
            const radius = [-1, 1][anime.random(0, 1)] * value;
            return {
                x: p.x + radius * Math.cos(angle),
                y: p.y + radius * Math.sin(angle)
            };
        }

        function createParticule(x, y) {
            const p = {};
            p.x = x;
            p.y = y;
            p.color = colors[anime.random(0, colors.length - 1)];
            p.radius = anime.random(5, 10);
            p.endPos = setParticuleDirection(p);
            p.draw = function () {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
                ctx.fillStyle = p.color;
                ctx.fill();
            };
            return p;
        }

        function createCircle(x, y) {
            const p = {};
            p.x = x;
            p.y = y;
            p.color = '#FFF';
            p.radius = 0.1;
            p.alpha = 0.5;
            p.lineWidth = 6;
            p.draw = function () {
                ctx.globalAlpha = p.alpha;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
                ctx.lineWidth = p.lineWidth;
                ctx.strokeStyle = p.color;
                ctx.stroke();
                ctx.globalAlpha = 1;
            };
            return p;
        }

        function renderParticule(anim) {
            for (let i = 0; i < anim.animatables.length; i++) {
                anim.animatables[i].target.draw();
            }
        }

        this.animateParticules = function (x, y) {
            const circle = createCircle(x, y);
            const particules = [];
            for (let i = 0; i < numberOfParticules; i++) {
                particules.push(createParticule(x, y));
            }
            anime.timeline().add({
                targets: particules,
                x: function (p) { return p.endPos.x; },
                y: function (p) { return p.endPos.y; },
                radius: 0.1,
                duration: anime.random(1200, 1800),
                easing: 'easeOutExpo',
                update: renderParticule
            })
            // .add({
            //     targets: circle,
            //     radius: anime.random(80, 160),
            //     lineWidth: 0,
            //     alpha: {
            //         value: 0,
            //         easing: 'linear',
            //         duration: anime.random(600, 800),
            //     },
            //     duration: anime.random(1200, 1800),
            //     easing: 'easeOutExpo',
            //     update: renderParticule,
            //     offset: 0
            // });
        }

        const render = anime({
            duration: Infinity,
            update: function () {
                ctx.clearRect(0, 0, ctx.width, ctx.height);
            }
        });

        /*document.addEventListener(tap, function (e) {
            window.human = true;
            render.play();
            updateCoords(e);
            animateParticules(pointerX, pointerY);
        }, false);
*/
    }

    if (socket) {
        socket.onopen = () => {
            console.log('Connected to the WebSocket server.');
        };
    
        socket.onmessage = (event) => {
            const message = event.data;
            //console.log('Received: ' + message);
            parseLogLine(message);
        };
    
    }
    

    function parseLogLine(message){
        const tokens = message.split(' ');
        const character = tokens[0];
        switch (character) {
            case 'U':
                width = parseInt(tokens[1]);
                height = parseInt(tokens[2]);
                break;

            case 'C': {
                const playerName = tokens[1];
                const playerColor = tokens[2];
            }
                break;

            case 'R': {
                const playerScore = parseInt(tokens[1]);
                const playerColor = tokens[2];
                scores.set(playerColor,{absolute: playerScore});
                if(Rcounter%4==3){
                    let max =0;
                    let team1=0;
                    let team2=0;
                    for(const [key,value] of scores){
                        max = Math.max(max, value.absolute);
                    }
                    for(const [key,value] of scores){
                        if(key == "red" || key =="green"){
                            team1 += value.absolute;
                        }else{
                            team2 += value.absolute;
                        }                    
                    }
                    for (const [key, value] of scores) {
                        if (key == "red" || key == "green") {
                            scores.set(key,{absolute: value.absolute, relative: value.absolute/(team1 + team2)});
                        } else {
                            scores.set(key,{absolute: value.absolute, relative: value.absolute/(team1 + team2)});
                        }
                    }
                    const sum = team1+team2;
                    scores.set("team1", {absolute: team1, relative: team1/sum });
                    scores.set("team2",  {absolute: team2, relative: team2/sum });
                    states.push({
                        planets: new Map(planetsMap),
                        fleets: new Map(fleetMap),
                        scores: new Map(scores),
                    });
                    planetsMap.clear();
                    fleetMap.clear();
                    scores.clear();
                }
                Rcounter++;
            }
                break;

            case 'P': {
                const planetName = parseInt(tokens[1]);
                const planetX = parseInt(tokens[2]);
                const planetY = parseInt(tokens[3]);
                const planetSize = parseFloat(tokens[4]);
                const fleetSize = parseInt(tokens[5]);
                const planetColor = tokens[6];

                planetsMap.set(planetName, {
                    x: planetX,
                    y: planetY,
                    size: planetSize,
                    fleetSize,
                    color: planetColor,
                });
            
            }
                break;

            case 'F': {
                const fleetName = parseInt(tokens[1]);
                const fleetSize = parseInt(tokens[2]);
                const originPlanet = parseInt(tokens[3]);
                const destinationPlanet = parseInt(tokens[4]);
                const currentTurn = parseInt(tokens[5]);
                const neededTurns = parseInt(tokens[6]);
                const owner = tokens[7];
                fleetMap.set(fleetName, {
                    name: fleetName,
                    size: fleetSize,
                    origin: originPlanet,
                    destination: destinationPlanet,
                    turn: currentTurn,
                    neededTurns: neededTurns,
                    color: owner,
                });
            }
                break;

            default:
                //console.log('Unknown character code: ' + character);
                break;
        }

    }

    function translateCoordinates(x, y) {
        const scaleX = canvas.width / width;
        const scaleY = canvas.height / height;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        return { x: canvasX, y: canvasY };
    }

    if (socket) {
        socket.onclose = (event) => {
            if (event.wasClean) {
                console.log(`Connection closed cleanly, code ${event.code}, reason ${event.reason}`);
            } else {
                console.error('Connection abruptly closed.');
            }
        };
    
        socket.onerror = (error) => {
            console.error('WebSocket error: ' + error);
        };
    
    }
    
    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    function drawImageCenter(ctx,image, x, y, cx, cy, scale, rotation){
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        ctx.rotate(rotation);
        ctx.drawImage(image, -cx, -cy);
        ctx.restore();
    } 

    window.addEventListener("resize", setCanvasSize);
    return init();

}