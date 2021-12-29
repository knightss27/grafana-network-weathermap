export function getSolidFromAlphaColor(fg: string, bg: string) {
    let fgColor = parseColor(fg.toUpperCase());
    if (fgColor.length < 4) return fg;

    let bgColor = parseColor(bg.toUpperCase());
    if (bgColor.length < 4) bgColor.push(1.0)
    
    let finalColor = [
        bgColor[0] + (fgColor[0]-bgColor[0])*fgColor[3],
        bgColor[1] + (fgColor[1]-bgColor[1])*fgColor[3],
        bgColor[2] + (fgColor[2]-bgColor[2])*fgColor[3],
    ]

    return `rgb(${finalColor.join(",")})`
}

function parseColor(input: string) {
    if (input.substring(0,1)=="#") {
    let collen = (input.length-1)/3;
    let factors = [17,1,0.062272]
    let fact = factors[collen-1];
    return [
        Math.round(parseInt(input.substring(1,1+collen),16)*fact),
        Math.round(parseInt(input.substring(1+collen,1+2*collen),16)*fact),
        Math.round(parseInt(input.substring(1+2*collen),16)*fact)
    ];
    }
    else return input.split("(")[1].split(")")[0].split(",").map(x=>+x);
}