function initializeGame(canvasId, gameLog, mode="file") {
    console.log("HEEEEEEELOOOOO")
    const gameSpeed = 200;
    const planetsMap = new Map();
    const fleetMap = new Map();
    const rotationAngles = new Map();
    const fleetColorMap = new Map();
    const states = [];
    let stateCount = 0;
    let currentState = {};
    const cyanPlanetImage = new Image();
    const magentaPlanetImage = new Image();
    const toxicPlanetImage = new Image();
    const yellowPlanetImage = new Image();
    const neutralPlanetImage = new Image();
    const planetScale = 150;
    const imageMap = {
        "red": cyanPlanetImage,
        "blue": magentaPlanetImage,
        "yellow": yellowPlanetImage,
        "green": toxicPlanetImage,
        "null": neutralPlanetImage
    };
    let animationFrameId = {};
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

        const canvas = document.getElementById(canvasId);
        if(canvas==null){
            return;
        }
        console.log(canvas);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        const ctx = canvas.getContext('2d');
        // animateFleets(ctx, performance.now());
        createFireworks(ctx);
        animationFrameId.fr = requestAnimationFrame((timestamp) => {
            animateFleets(ctx, timestamp);
        });
        const i1 = setInterval(() => stateTransition(), gameSpeed);
        const i2 = setInterval(() => renderEnvironment(ctx, currentState), 23);
        return [animationFrameId, i1, i2]
    }

    function setCanvasSize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", setCanvasSize);


    function stateTransition() {
        currentState = states[stateCount];
        if (currentState != null && currentState.fleets != null) {
            for (let fleet of currentState.fleets.values()) {
                fleet.startTime = performance.now();
                if (fleet.turn == 1) {
                    fleetColorMap.set(fleet.name, currentState.planets.get(fleet.origin).color);
                }
            }
        }
        stateCount += 4;
    }

    function renderEnvironment(ctx, currentState) {
        if (currentState != null) {
            ctx.fillStyle = 'black';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            if (!currentState.planets) {
                return
            }

            for (const [name, planet] of currentState.planets) {
                ctx.beginPath();

                ctx.save();
                const planetCoords = translateCoordinates(planet.x, planet.y);
                const rotationSpeed = 0.005 / planet.size;

                if (!rotationAngles.has(name)) {
                    rotationAngles.set(name, Math.random());
                }
                rotationAngles.set(name, (rotationAngles.get(name) + rotationSpeed) % (Math.PI * 2));

                ctx.shadowColor = 'white';
                ctx.shadowBlur = 100;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.translate(planetCoords.x, planetCoords.y);
                ctx.rotate(rotationAngles.get(name));

                const imageX = -planet.size * planetScale / 2;
                const imageY = -planet.size * planetScale / 2;

                const planetImage = imageMap[planet.color];

                ctx.drawImage(planetImage, imageX, imageY, planet.size * planetScale, planet.size * planetScale);
                ctx.restore();

                ctx.shadowColor = 'transparent';
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                ctx.fillStyle = 'black';
                ctx.font = "bold 12pt Courier";
                ctx.fillText(planet.fleetSize, planetCoords.x - 10, planetCoords.y + 5);

                ctx.closePath();
            }
        }
    }

    var animateFleets = function (ctx, currentTime) {
        if (currentState != null && currentState.fleets != undefined) {
            for (const fleet of currentState.fleets.values()) {
                if (fleet.turn < fleet.neededTurns) {

                    const originPlanet = currentState.planets.get(fleet.origin);
                    const destinationPlanet = currentState.planets.get(fleet.destination);
                    fleet.particles = fleet.particles || [];

                    const elapsedFraction = (currentTime - fleet.startTime) % gameSpeed / gameSpeed;
                    const distance = Math.sqrt(
                        (destinationPlanet.x - originPlanet.x) ** 2 +
                        (destinationPlanet.y - originPlanet.y) ** 2
                    );

                    const flightSpeed = distance / fleet.neededTurns;
                    const journeyFraction = (fleet.turn + elapsedFraction) / fleet.neededTurns;
                    currentX = originPlanet.x + (destinationPlanet.x - originPlanet.x) * journeyFraction;
                    currentY = originPlanet.y + (destinationPlanet.y - originPlanet.y) * journeyFraction;

                    ctx.beginPath();
                    const fleetCoords = translateCoordinates(currentX, currentY);
                    ctx.arc(fleetCoords.x, fleetCoords.y, fleet.size, 0, Math.PI * 2);
                    ctx.fillStyle = fleetColorMap.get(fleet.name);
                    ctx.fill();
                    ctx.fillStyle = 'white';
                    ctx.fillText(fleet.size, fleetCoords.x - 5, fleetCoords.y + 5);
                    ctx.closePath();

                    if (fleet.turn == fleet.neededTurns - 1) {
                        const explosionCoords = translateCoordinates(destinationPlanet.x, destinationPlanet.y);
                        // new createFireworks(ctx).animateParticules(explosionCoords.x, explosionCoords.y);
                        fleet.turn = -1;
                    }
                }
            }
        }
        animationFrameId.fr = requestAnimationFrame((timestamp) => {
            animateFleets(ctx, timestamp);
        });
    }

    function createFireworks(ctx) {

        const numberOfParticules = 30;
        let pointerX = 0;
        let pointerY = 0;
        const tap = ('ontouchstart' in window || navigator.msMaxTouchPoints) ? 'touchstart' : 'mousedown';
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
            }).add({
                targets: circle,
                radius: anime.random(80, 160),
                lineWidth: 0,
                alpha: {
                    value: 0,
                    easing: 'linear',
                    duration: anime.random(600, 800),
                },
                duration: anime.random(1200, 1800),
                easing: 'easeOutExpo',
                update: renderParticule,
                offset: 0
            });
        }

        const render = anime({
            duration: Infinity,
            update: function () {
                ctx.clearRect(0, 0, ctx.width, ctx.height);
            }
        });

        // document.addEventListener(tap, function (e) {
        //     window.human = true;
        //     render.play();
        //     updateCoords(e);
        //     animateParticules(pointerX, pointerY);
        // }, false);

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


    function parseLogLine(message){
        const tokens = message.split(' ');
        const character = tokens[0];

        switch (character) {
            case 'U':
                const width = parseInt(tokens[1]);
                const height = parseInt(tokens[2]);
                break;

            case 'C': {
                const playerName = tokens[1];
                const playerColor = tokens[2];
            }
                break;

            case 'R': {
                states.push({
                    planets: new Map(planetsMap),
                    fleets: new Map(fleetMap),
                });
                const playerX = parseInt(tokens[1]);
                const playerY = parseInt(tokens[2]);
                const playerColor = tokens[3];
                planetsMap.clear();
                fleetMap.clear();
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
                fleetMap.set(fleetName, {
                    name: fleetName,
                    size: fleetSize,
                    origin: originPlanet,
                    destination: destinationPlanet,
                    turn: currentTurn,
                    neededTurns: neededTurns,
                });
            }
                break;

            default:
                // console.log('Unknown character code: ' + character);
                break;
        }

    }

    function translateCoordinates(x, y) {
        const scaleX = canvas.width / 100;
        const scaleY = canvas.height / 100;
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        return { x: canvasX, y: canvasY };
    }



    return init();
}