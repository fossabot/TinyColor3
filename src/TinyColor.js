module.exports = class {
	constructor() {
	}
}
function isValidCSSUnit(color) {
    return !!matchers.CSS_UNIT.exec(color);
}


function stringInputToObject(color) {
	color
	    .replace(trimLeft,'')
	    .replace(trimRight, '')
	    .toLowerCase();
	let named = false,
	    match;
	if (names[color])
		color = names[color],
			named = true;
	else if (color == 'transparent')
		return { r: 0, g: 0, b: 0, a: 0, format: "name" };
	if ((match = matchers.rgb.exec(color)))
		return { r: match[1], g: match[2], b: match[3] };
	if ((match = matchers.rgba.exec(color)))
		return { r: match[1], g: match[2], b: match[3], a: match[4] };
	if ((match = matchers.hsl.exec(color)))
		return { h: match[1], s: match[2], l: match[3] };
	if ((match = matchers.hsla.exec(color)))
		return { h: match[1], s: match[2], l: match[3], a: match[4] };
	if ((match = matchers.hsv.exec(color)))
		return { h: match[1], s: match[2], v: match[3] };
	if ((match = matchers.hsva.exec(color))) 
		return { h: match[1], s: match[2], v: match[3], a: match[4] };
	if ((match = matchers.hex8.exec(color)))
		return {
			r: parseIntFromHex(match[1]),
			g: parseIntFromHex(match[2]),
			b: parseIntFromHex(match[3]),
			a: convertHexToDecimal(match[4]),
			format: named ? "name" : "hex8"
		};
	if ((match = matchers.hex6.exec(color)))
		return {
			r: parseIntFromHex(match[1]),
            g: parseIntFromHex(match[2]),
            b: parseIntFromHex(match[3]),
            format: named ? "name" : "hex"
        };
	if ((match = matchers.hex4.exec(color)))
		return {
			r: parseIntFromHex(match[1] + '' + match[1]),
			g: parseIntFromHex(match[2] + '' + match[2]),
			b: parseIntFromHex(match[3] + '' + match[3]),
			a: convertHexToDecimal(match[4] + '' + match[4]),
			format: named ? "name" : "hex8"
		};
	if ((match = matchers.hex3.exec(color)))
		return {
			r: parseIntFromHex(match[1] + '' + match[1]),
			g: parseIntFromHex(match[2] + '' + match[2]),
			b: parseIntFromHex(match[3] + '' + match[3]),
			format: named ? "name" : "hex"
		};
	return false;
}
function inputToRGB(color) {
	let rgb = { r: 0, g: 0, b: 0 },
	    a = 1,
	    s = null,
	    v = null,
	    l = null,
	    ok = false,
	    format = false;
	if (typeof color == "string")
		color = stringInputToObject(color);
	if (typeof color == "object") {
		if (isValidCSSUnit(color.r) && isValidCSSUnit(color.g) && isValidCSSUnit(color.b))
			rgb = rgbToRgb(color.r, color.g, color.b),
				ok = true,
				format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
		else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.v))
			s = convertToPercentage(color.s),
				v = convertToPercentage(color.v),
				rgb = hsvToRgb(color.h, s, v),
				ok = true,
				format = "hsv";
		else if (isValidCSSUnit(color.h) && isValidCSSUnit(color.s) && isValidCSSUnit(color.l))
			s = convertToPercentage(color.s),
				l = convertToPercentage(color.l),
				rgb = hslToRgb(color.h, s, l),
				ok = true,
				format = "hsl";
		if (color.hasOwnProperty("a"))
			a = color.a;
	}
	a = boundAlpha(a);
	return {
		ok: ok,
		format: color.format || format,
		r: mathMin(255, mathMax(rgb.r, 0)),
		g: mathMin(255, mathMax(rgb.g, 0)),
		b: mathMin(255, mathMax(rgb.b, 0)),
		a: a
	};
}
