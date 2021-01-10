/*
  --- Conversion Functions
*/
exports.rgbToRgb = function (r, g, b) {
	return {
		r: bound01(r, 255) * 255,
		g: bound01(g, 255) * 255,
		b: bound01(b, 255) * 255
	};
}
rgbToHsl(r, g, b) {
	r = bound01(r, 255);
	g = bound01(g, 255);
	b = bound01(b, 255);
	let max = Math.max(r, g, b), min = Math.min(r, g, b),
	    h, s, l = (max + min) / 2;
	if(max == min)
		h = s = 0; // achromatic
	else {
		let d = max - min;
		s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
		switch(max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2; 
				break;
			case b:
				h = (r - g) / d + 4; 
				break;
		}
		h /= 6;
	}

	return { h: h, s: s, l: l };
}
function hslToRgb(h, s, l) {
	let r, g, b, q, p;
	h = bound01(h, 360);
	s = bound01(s, 100);
	l = bound01(l, 100);

	function hue2rgb(p, q, t) {
		if(t < 0)
			t += 1;
		if(t > 1)
			t -= 1;
		if(t < 1/6)
			return p + (q - p) * 6 * t;
		if(t < 1/2)
			return q;
		if(t < 2/3)
			return p + (q - p) * (2/3 - t) * 6;
		return p;
	}

	if(s === 0)
		r = g = b = l; // achromatic
	else
		q = l < 0.5 ? l * (1 + s) : l + s - l * s,
			p = 2 * l - q,
			r = hue2rgb(p, q, h + 1/3),
			g = hue2rgb(p, q, h),
			b = hue2rgb(p, q, h - 1/3);
	return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHsv(r, g, b) {
	r = bound01(r, 255);
	g = bound01(g, 255);
	b = bound01(b, 255);
	let max = Math.max(r, g, b), min = Math.min(r, g, b),
	    h,
	    d = max - min,
	    s = max === 0 ? 0 : d / max,
	    v = max;
	if(max == min)
		h = 0; // achromatic
	else {
		switch(max) {
			case r:
				h = (g - b) / d + (g < b ? 6 : 0);
				break;
			case g:
				h = (b - r) / d + 2;
				break;
			case b:
				h = (r - g) / d + 4;
				break;
		}
		h /= 6;
	}
	return { h: h, s: s, v: v };
}
 function hsvToRgb(h, s, v) {

	h = bound01(h, 360) * 6;
	s = bound01(s, 100);
	v = bound01(v, 100);

	let i = Math.floor(h),
		f = h - i,
		p = v * (1 - s),
		q = v * (1 - f * s),
		t = v * (1 - (1 - f) * s),
		mod = i % 6,
		r = [v, q, p, p, t, v][mod],
		g = [t, v, v, q, p, p][mod],
		b = [p, p, t, v, v, q][mod];

	return { r: r * 255, g: g * 255, b: b * 255 };
}
function rgbToHex(r, g, b, allow3Char) {

	let hex = [
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16))
	];
	if (allow3Char 
	    && hex[0].charAt(0) == hex[0].charAt(1) 
	    && hex[1].charAt(0) == hex[1].charAt(1) 
	    && hex[2].charAt(0) == hex[2].charAt(1))
		return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0);

	return hex.join("");
}
function rgbaToHex(r, g, b, a, allow4Char) {

	let hex = [
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16)),
		pad2(convertDecimalToHex(a))
	];
	if (allow4Char
	    && hex[0].charAt(0) == hex[0].charAt(1)
	    && hex[1].charAt(0) == hex[1].charAt(1) 
	    && hex[2].charAt(0) == hex[2].charAt(1) 
	    && hex[3].charAt(0) == hex[3].charAt(1))
		return hex[0].charAt(0) + hex[1].charAt(0) + hex[2].charAt(0) + hex[3].charAt(0);
	return hex.join("");
}
function rgbaToArgbHex(r, g, b, a) {
	let hex = [
		pad2(convertDecimalToHex(a)),
		pad2(Math.round(r).toString(16)),
		pad2(Math.round(g).toString(16)),
		pad2(Math.round(b).toString(16))
	];
	return hex.join("");
}
function rgbToCmyk(r, g, b) {
	var R = r/255,
	    G = g/255,
	    B = b/255,
	    K = 1-Math.max(R, G, B);
	return {
		C: (1-R-K) / (1-K),
		M: (1-B-K) / (1-K),
		Y: (1-G-K) / (1-K),
		K: K
	};
}
