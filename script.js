// One clear entry point for the code
window.addEventListener("DOMContentLoaded", () => {
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener("resize", resize);
    resize();

    const Input = {
        mouse: { x: window.innerWidth / 2, y: window.innerHeight / 2, left: false, middle: false, right: false }
    };

    window.addEventListener("mousemove", (event) => {
        Input.mouse.x = event.clientX;
        Input.mouse.y = event.clientY;
    });

    window.addEventListener("mousedown", (event) => {
        if (event.button === 0) Input.mouse.left = true;
        if (event.button === 1) Input.mouse.middle = true;
        if (event.button === 2) Input.mouse.right = true;
    });

    document.addEventListener("mouseup", function (event) {
        if (event.button === 0) Input.mouse.left = false;
        if (event.button === 1) Input.mouse.middle = false;
        if (event.button === 2) Input.mouse.right = false;
    });

    window.addEventListener("contextmenu", event => event.preventDefault());

    // --- DRAGON STRUCTURAL PARAMETERS ---
    const numSegments = 38; 
    const segmentLength = 13;
    let segments = [];

    for (let i = 0; i < numSegments; i++) {
        segments.push({
            x: window.innerWidth / 2 + i * segmentLength,
            y: window.innerHeight / 2,
            angle: 0
        });
    }

    const legConfigs = [
        { spineIdx: 9, side: -1 },  
        { spineIdx: 9, side: 1 },   
        { spineIdx: 24, side: -1 }, 
        { spineIdx: 24, side: 1 }   
    ];

    let legs = legConfigs.map(config => {
        return {
            spineIdx: config.spineIdx,
            side: config.side,
            currentX: window.innerWidth / 2,
            currentY: window.innerHeight / 2,
            targetX: window.innerWidth / 2,
            targetY: window.innerHeight / 2,
            stepProgress: 1,
            startX: window.innerWidth / 2,
            startY: window.innerHeight / 2
        };
    });

    function animate() {
        ctx.fillStyle = "#151515";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        let head = segments[0];
        
        // Stalking tracking speed
        head.x += (Input.mouse.x - head.x) * 0.04;
        head.y += (Input.mouse.y - head.y) * 0.04;
        
        if(segments[1]) {
            head.angle = Math.atan2(head.y - segments[1].y, head.x - segments[1].x);
        }

        for (let i = 1; i < numSegments; i++) {
            let prev = segments[i - 1];
            let curr = segments[i];
            let dx = prev.x - curr.x;
            let dy = prev.y - curr.y;
            
            curr.angle = Math.atan2(dy, dx);
            curr.x = prev.x - Math.cos(curr.angle) * segmentLength;
            curr.y = prev.y - Math.sin(curr.angle) * segmentLength;
        }

        legs.forEach(leg => {
            let spineSeg = segments[leg.spineIdx];
            let hipX = spineSeg.x;
            let hipY = spineSeg.y;
            let angleOffset = spineSeg.angle + (Math.PI / 2) * leg.side;
            
            let idealX = hipX + Math.cos(angleOffset) * 95 + Math.cos(spineSeg.angle) * 15;
            let idealY = hipY + Math.sin(angleOffset) * 95 + Math.sin(spineSeg.angle) * 15;

            let distToIdeal = Math.hypot(leg.targetX - idealX, leg.targetY - idealY);
            if (distToIdeal > 65 && leg.stepProgress >= 1) {
                leg.startX = leg.currentX;
                leg.startY = leg.currentY;
                leg.targetX = idealX;
                leg.targetY = idealY;
                leg.stepProgress = 0;
            }

            if (leg.stepProgress < 1) {
                leg.stepProgress += 0.08; 
                if (leg.stepProgress > 1) leg.stepProgress = 1;
                
                let t = leg.stepProgress;
                leg.currentX = leg.startX + (leg.targetX - leg.startX) * t;
                leg.currentY = leg.startY + (leg.targetY - leg.startY) * t;
                
                let lift = Math.sin(t * Math.PI) * 35; 
                leg.currentY -= lift;
            }
        });

        ctx.strokeStyle = "rgba(240, 240, 240, 0.8)";
        ctx.lineWidth = 1.8;

        legs.forEach(leg => {
            let spineSeg = segments[leg.spineIdx];
            let hipX = spineSeg.x;
            let hipY = spineSeg.y;
            
            let midX = (hipX + leg.currentX) / 2 + Math.cos(spineSeg.angle) * 45 * leg.side;
            let midY = (hipY + leg.currentY) / 2 - Math.sin(spineSeg.angle) * 45 * leg.side;

            ctx.beginPath();
            ctx.moveTo(hipX, hipY);
            ctx.lineTo(midX, midY);
            ctx.lineTo(leg.currentX, leg.currentY);
            ctx.stroke();

            ctx.save();
            ctx.translate(leg.currentX, leg.currentY);
            let footAngle = Math.atan2(leg.currentY - midY, leg.currentX - midX);
            ctx.rotate(footAngle);
            
            ctx.beginPath();
            for(let a = -0.6; a <= 0.6; a += 0.3) {
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(a) * 16, Math.sin(a) * 16); 
            }
            ctx.stroke();
            ctx.restore();
        });

        for (let i = 0; i < numSegments; i++) {
            let seg = segments[i];

            ctx.save();
            ctx.translate(seg.x, seg.y);
            ctx.rotate(seg.angle);

            ctx.fillStyle = i === 0 ? "transparent" : "#ffffff"; 
            ctx.beginPath();
            ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
            ctx.fill();

            if (i === 0) {
                ctx.fillStyle = "#ffffff";
                ctx.beginPath();
                ctx.moveTo(-5, -6);
                ctx.lineTo(12, 0);
                ctx.lineTo(-5, 6);
                ctx.closePath();
                ctx.fill();

                ctx.strokeStyle = "#ffffff";
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(-2, -4); ctx.lineTo(-15, -15);
                ctx.moveTo(-2, 4);  ctx.lineTo(-15, 15);
                ctx.stroke();

                ctx.fillStyle = "#ff003c";
                ctx.shadowColor = "#ff003c";
                ctx.shadowBlur = 12; 
                
                ctx.beginPath(); ctx.arc(5, -3, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(5, 3, 2.5, 0, Math.PI * 2); ctx.fill();
                
                ctx.shadowBlur = 0;
            }

            if (i > 0 && i < numSegments - 1) {
                let ribWidth = Math.sin((i / numSegments) * Math.PI) * 34;
                
                ctx.strokeStyle = "rgba(245, 245, 245, 0.75)";
                ctx.lineWidth = 1.5;
                ctx.beginPath();
                ctx.moveTo(0, -ribWidth);
                ctx.lineTo(0, ribWidth);
                ctx.stroke();
                
                ctx.beginPath();
                ctx.moveTo(0, -ribWidth); ctx.lineTo(-7, -ribWidth + 5);
                ctx.moveTo(0, ribWidth);  ctx.lineTo(-7, ribWidth - 5);
                ctx.stroke();
            }
            ctx.restore();
        }

        requestAnimationFrame(animate);
    }

    animate();
});