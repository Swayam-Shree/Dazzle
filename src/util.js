export function emptyfunction(){}
export function translatePoint(absPointX, absPointY, centerX, centerY, theta) {
    absPointX -= centerX;
    absPointY -= centerY;
    let c = Math.cos(theta);
    let s = Math.sin(theta);
    return [(absPointX * c) + (absPointY * s), (-absPointX * s) + (absPointY * c)];
}
export function coordsNearScreenCenter (x, y){
	return x > window.innerWidth / 4 && x < window.innerWidth * 3 / 4 && y > window.innerHeight / 4 && y < window.innerHeight * 3 / 4
}