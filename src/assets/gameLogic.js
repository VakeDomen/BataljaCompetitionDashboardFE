function initializeGame(canvasId, gameLog, mode="file") {
    
    const gameSpeed = 150;
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
    const bluePlanetImage = new Image();
    const toxicPlanetImage = new Image();
    const yellowPlanetImage = new Image();
    const neutralPlanetImage = new Image();
    const space = new Image();
    
    const planetScale = 150;
    const imageMap = {
        "blue": bluePlanetImage,
        "green": toxicPlanetImage,
        "yellow": yellowPlanetImage,
        "cyan": cyanPlanetImage,
        "null": neutralPlanetImage
    };

    const colorMap = {
        "blue": "#576cff",
        "cyan": "#00aad9",
        "green": "#a8c70c",
        "yellow": "#ffe700",
        "team1": "#2C8BEC",
        "team2": "#D2B206"
    }
    const textColors = {
        "blue": "#E0E0E0", // Light gray text for "#576cff" background
        "cyan": "#202020", // Dark gray text for "#00aad9" background
        "green": "#202020", // Dark gray text for "#a8c70c" background
        "yellow": "#202020", // Dark gray text for "#fc9d00" background
        "team1": "#E0E0E0", // Light gray text for "#2C8BEC" background
        "team2": "#202020",  // Dark gray text for "#D2B206" background
        "null": "#000000"
    }
    

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
        bluePlanetImage.src = 'assets/Blue.png';
        toxicPlanetImage.src = 'assets/Toxic.png';
        yellowPlanetImage.src = 'assets/Yellow.png';
        neutralPlanetImage.src = 'assets/Grey.png';
        space.src = 'assets/space.jpg';
        canvas = document.getElementById(canvasId);
        if(canvas==null){
            return;
        }
    
        setCanvasSize()
        var stateT = setInterval(() => stateTransition(), gameSpeed);
        const ctx = canvas.getContext('2d');
        //setInterval(() => renderEnvironment(ctx, currentState), 23);
        animateGame(ctx, performance.now());
        createFireworks(ctx);
        return [animationFrameRef, stateT];
    }

    function stateTransition() {
        aboutToBeCurrentState = states[stateCount];
    
        if (aboutToBeCurrentState && aboutToBeCurrentState.fleets) {
            const now = performance.now();
            for (const fleet of aboutToBeCurrentState.fleets.values()) {
                fleet.startTime = now;
            }
        }

        previousState = currentState;
        currentState = aboutToBeCurrentState;
        stateCount ++;
        
        if (stateResetCounter >= 500 && mode == 'file') {
            console.log("reseting game");
            stateResetCounter = 0;
            currentState = {};
            previousState = {};
            stateCount = 0;
        }
    }

    function renderScores(ctx, state){
        if(!state || !state.scores) return;
        
        // top left
        let barHeight = height*0.015;
        if  (canvas.width < 768) {
            barHeight = height*0.025;
        } 
        
        const barPosition = translateCoordinates(state.scores.get("team1").relative * width, barHeight);
        ctx.fillStyle = colorMap["team1"];
        ctx.fillRect(0,0,barPosition.x, barPosition.y);
       
        // top right
        ctx.fillStyle = colorMap["team2"];
        const endBar = translateCoordinates(width, barHeight);
        ctx.fillRect(barPosition.x,0, endBar.x, endBar.y);

        // top left text
        // ctx.fillStyle = 'black';
        ctx.fillStyle = textColors["team1"];
        ctx.font = "bold 16px Courier";
        const text1Pos = translateCoordinates(0, barHeight);
        ctx.textAlign = "left";
        ctx.fillText(state.scores.get("team1").absolute, text1Pos.x, text1Pos.y);

        // top right text
        ctx.fillStyle = textColors["team2"];
        const text2Pos = translateCoordinates(width, barHeight);
        ctx.textAlign = "right";
        ctx.fillText(state.scores.get("team2").absolute, text2Pos.x, text2Pos.y);

        // team 1 player 1
        const sideBarWidth =  width *0.01;
        const leftTpos = translateCoordinates(0,height - (height * state.scores.get("blue").relative));
        const rightBpos = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = colorMap["blue"];
        ctx.fillRect(leftTpos.x,leftTpos.y,rightBpos.x,rightBpos.y);

        // team 1 player 2
        const leftTpos2 = translateCoordinates(sideBarWidth,height - (height * state.scores.get("cyan").relative));
        const rightBpos2 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = colorMap["cyan"];
        ctx.fillRect(leftTpos2.x,leftTpos2.y,rightBpos2.x,rightBpos2.y);

        // team 2 player 1
        const leftTpos3 = translateCoordinates(width - sideBarWidth,height - (height * state.scores.get("green").relative));
        const rightBpos3 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = colorMap["green"];
        ctx.fillRect(leftTpos3.x,leftTpos3.y,rightBpos3.x,rightBpos3.y);

        // team 2 player 2
        const leftTpos4 = translateCoordinates(width - 2 * sideBarWidth,height - (height * state.scores.get("yellow").relative));
        const rightBpos4 = translateCoordinates(sideBarWidth,height);
        ctx.fillStyle = colorMap["yellow"];
        ctx.fillRect(leftTpos4.x,leftTpos4.y,rightBpos4.x,rightBpos4.y);
    }

    function renderEnvironment(ctx, state) {
        // console.time("renderEnvironment")
        if (state != null) {
            if (!state.planets) {
                return
            }

            for (const [name, planet] of state.planets) {
                
                
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
                const scale = (0.15+(planet.size ) * 0.3) * Math.min((canvas.width + 200 )/ 2440, 1);
                drawImageCenter(ctx,imageMap[planet.color], planetCoords.x, planetCoords.y,175,175,scale , rotationAngles.get(name));
                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                // ctx.fillStyle = 'black';
                ctx.fillStyle = textColors[planet.color];
                ctx.font = "bold 16px Courier";
                if  (canvas.width < 768) {
                    ctx.font = "bold 10px Courier";
                } 

                ctx.textAlign = "center";
                ctx.fillText(planet.fleetSize, planetCoords.x , planetCoords.y+5);
                
                if (previousState.planets &&  previousState.planets.get(name).color != planet.color) {
                    const explosionCoords = translateCoordinates(planet.x, planet.y);
                    new createFireworks(ctx, planet.color).animateParticules(explosionCoords.x, explosionCoords.y);
                }
            }
        }
        // console.timeEnd("renderEnvironment")
    }

    // Assuming fleet sizes and canvas width don't change often, cache these values
const fleetSizeDisplayCache = new Map();
let disp = [];


function renderFleets(ctx, state, currentTime) {
    // console.time('renderFleets2');
    if (state?.fleets) {
        disp = [];
        for (const fleet of state.fleets.values()) {
            if (fleet.turn < fleet.neededTurns) {
                const originPlanet = state.planets.get(fleet.origin);
                const destinationPlanet = state.planets.get(fleet.destination);
                const elapsedFraction = (currentTime - fleet.startTime) / gameSpeed;
                const journeyFraction = (fleet.turn + elapsedFraction) / (fleet.neededTurns);
                currentX = originPlanet.x + (destinationPlanet.x - originPlanet.x) * journeyFraction;
                currentY = originPlanet.y + (destinationPlanet.y - originPlanet.y) * journeyFraction;

                const fleetCoords = translateCoordinates(currentX, currentY);
                const fleetDisplaySize = 5 + 4 * Math.log(fleet.size) * Math.min((canvas.width + 50) / 2440, 1);


                disp.push([fleetCoords.x, fleetCoords.y, fleet.size, fleetDisplaySize, fleet.color]);
            }
        }
        // console.time('renderFleets1');
        for (const [x, y, flsize, disize, color] of disp) {
            if (flsize < 1) {
                continue;
            }
            ctx.beginPath();
            ctx.arc(x, y, disize, 0, Math.PI * 2);
            ctx.fillStyle = colorMap[color]; 
            ctx.fill();
            ctx.closePath();
            ctx.fillStyle = textColors[color];
            ctx.fillStyle = 'white';
            ctx.textAlign = "center";
            ctx.fillText(flsize, x, y + 5);
        }
        // console.timeEnd('renderFleets1');
    }
    
    // console.timeEnd('renderFleets2');
}


    function renderBG(ctx, cs) {
        if (!cs) {
            return;
        }
        if (space) {
            ctx.drawImage(space, 0, 0, canvas.width, canvas.height)
        } else {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
    }

    var lastFrameTime = 0;
    var frameDuration = 1000 / 40; // 1000 milliseconds / 40 fps
    var animateGame = function (ctx, currentTime) {
        if (currentTime - lastFrameTime < frameDuration) {
            animationFrameRef.id = requestAnimationFrame((timestamp) => animateGame(ctx, timestamp));
            return;
        }

        if (!currentState) {
            stateResetCounter++;
        }

        let cs = cloneStateWithMaps(currentState);
        renderBG(ctx, cs);
        renderEnvironment(ctx,cs);        
        renderFleets(ctx, cs, currentTime);
        renderScores(ctx,cs);
        // Schedule the next frame

        // Update the last frame time
        lastFrameTime = currentTime;
        animationFrameRef.id = requestAnimationFrame((timestamp) => animateGame(ctx, timestamp));
    }

    function cloneStateWithMaps(state) {
        if (!state) {
            return
        }
        const clonedState = JSON.parse(JSON.stringify(state, (key, value) => {
            if (value instanceof Map) {
                // Convert Map to an array of key-value pairs
                return Array.from(value.entries());
            }
            return value;
        }));
    
        return JSON.parse(JSON.stringify(clonedState), (key, value) => {
            // Check if value is an array and if its elements are array-like objects
            if (Array.isArray(value) && value.every(item => Array.isArray(item) && item.length === 2)) {
                // Convert arrays of key-value pairs back into Map objects
                return new Map(value);
            }
            return value;
        });
    }
    function createFireworks(ctx, color) {

        const numberOfParticules = 15;
        let colors = [colorMap[color]];
        


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
            p.radius = anime.random(2, 7);
            p.endPos = setParticuleDirection(p);
            p.draw = function () {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
                ctx.fillStyle = p.color;
                ctx.fill();
                ctx.closePath();
            };
            return p;
        }

        // function createCircle(x, y) {
        //     const p = {};
        //     p.x = x;
        //     p.y = y;
        //     p.color = '#FFF';
        //     p.radius = 0.1;
        //     p.alpha = 0.5;
        //     p.lineWidth = 6;
        //     p.draw = function () {
        //         ctx.globalAlpha = p.alpha;
        //         ctx.beginPath();
        //         ctx.arc(p.x, p.y, p.radius, 0, 2 * Math.PI, true);
        //         ctx.lineWidth = p.lineWidth;
        //         ctx.strokeStyle = p.color;
        //         ctx.stroke();
        //         ctx.closePath();
        //         ctx.globalAlpha = 1;
        //     };
        //     return p;
        // }

        function renderParticule(anim) {
            for (let i = 0; i < anim.animatables.length; i++) {
                anim.animatables[i].target.draw();
            }
        }

        this.animateParticules = function (x, y) {
            // const circle = createCircle(x, y);
            const particules = [];
            for (let i = 0; i < numberOfParticules; i++) {
                particules.push(createParticule(x, y));
            }
            anime.timeline().add({
                targets: particules,
                x: function (p) { return p.endPos.x; },
                y: function (p) { return p.endPos.y; },
                radius: 0.03,
                duration: anime.random(800, 1000),
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

        // const render = anime({
        //     duration: Infinity,
        //     update: function () {
        //         ctx.clearRect(0, 0, ctx.width, ctx.height);
        //     }
        // });

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
                        if(key == "blue" || key =="cyan"){
                            team1 += value.absolute;
                        }else{
                            team2 += value.absolute;
                        }                    
                    }
                    for (const [key, value] of scores) {
                        if (key == "blue" || key == "cyan") {
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
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
    }
    window.addEventListener("resize", setCanvasSize);

    function drawImageCenter(ctx,image, x, y, cx, cy, scale, rotation){
        ctx.save();
        ctx.setTransform(scale, 0, 0, scale, x, y); // sets scale and origin
        ctx.rotate(rotation);
        ctx.drawImage(image, -cx, -cy);
        ctx.restore();
    } 

    return init();

}