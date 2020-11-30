export function drawPath(context, points) {
    context.beginPath();
    let moveTo = true;
    for (const [x, y] of points) {
        if (moveTo) {
            context.moveTo(x, y);
            moveTo = false;
        }
        else {
            context.lineTo(x, y);
        }
    }
    context.stroke();
}
export function drawPoint(context, x, y, radius) {
    context.beginPath();
    context.arc(x, y, radius, 0, 2 * Math.PI);
    context.fill();
}
export function drawHandPredictions(context, predictions) {
    const color = 'red';
    const fontSize = 24;
    const pointRadius = 6;
    context.fillStyle = color;
    context.font = `${fontSize}px sans-serif`;
    context.lineJoin = 'round';
    context.lineWidth = 6;
    context.strokeStyle = color;
    for (const prediction of predictions) {
        // Draw the bounding box.
        const [x1, y1] = prediction.boundingBox.topLeft;
        const [x2, y2] = prediction.boundingBox.bottomRight;
        context.strokeRect(x1, y1, x2 - x1, y2 - y1);
        context.fillText(`${(prediction.handInViewConfidence * 100).toFixed(1)}%`, x1, y1 + fontSize);
        // Draw the fingers.
        const fingerNames = [
            'thumb',
            'indexFinger',
            'middleFinger',
            'ringFinger',
            'pinky',
        ];
        for (const fingerName of fingerNames) {
            const points = prediction.annotations[fingerName];
            drawPath(context, [...prediction.annotations.palmBase, ...points]);
            for (const [x, y] of points) {
                drawPoint(context, x, y, pointRadius);
            }
        }
        const [x, y] = prediction.annotations.palmBase[0];
        drawPoint(context, x, y, pointRadius);
    }
}
