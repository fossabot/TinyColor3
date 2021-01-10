class TinyColor {
	constructor() {
	}
	fromRatio (color, opts) {
		if (typeof color == "object") {
			let newColor = {};
			for (var i in color)
				if (color.hasOwnProperty(i))
					if (i === "a")
						newColor[i] = color[i];
					else
						newColor[i] = convertToPercentage(color[i]);
			color = newColor;
		}
		return new TinyColor(color, opts);
	};
}

function isValidCSSUnit(color) {
	return !!matchers.CSS_UNIT.exec(color);
}

// --- Conversion Functions
function rgbToRgb(r, g, b) {
	return {
		r: bound01(r, 255) * 255,
		g: bound01(g, 255) * 255,
		b: bound01(b, 255) * 255
	};
}

function rgbToHsl(r, g, b) {
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
exports.equals = function (color1, color2) {
	if (!color1 || !color2)
		return false;
	return new tinycolor(color1).toRgbString() == new tinycolor(color2).toRgbString();
};

exports.random = function() {
	return new TinyColor.fromRatio({
		r: mathRandom(),
		g: mathRandom(),
		b: mathRandom()
	});
};
function desaturate(color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	let hsl = tinycolor(color).toHsl();
	hsl.s -= amount / 100;
	hsl.s = clamp01(hsl.s);
	return new tinycolor(hsl);
}

function saturate(color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	var hsl = tinycolor(color).toHsl();
	hsl.s += amount / 100;
	hsl.s = clamp01(hsl.s);
	return new tinycolor(hsl);
}

function greyscale(color) {
	return new tinycolor(color).desaturate(100);
}

function lighten (color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	let hsl = new tinycolor(color).toHsl();
	hsl.l += amount / 100;
	hsl.l = clamp01(hsl.l);
	return new tinycolor(hsl);
}

function brighten(color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	let rgb = new tinycolor(color).toRgb();
	rgb.r = mathMax(0, mathMin(255, rgb.r - mathRound(255 * - (amount / 100))));
	rgb.g = mathMax(0, mathMin(255, rgb.g - mathRound(255 * - (amount / 100))));
	rgb.b = mathMax(0, mathMin(255, rgb.b - mathRound(255 * - (amount / 100))));
	return new tinycolor(rgb);
}

function darken (color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	let hsl = new tinycolor(color).toHsl();
	hsl.l -= amount / 100;
	hsl.l = clamp01(hsl.l);
	return new tinycolor(hsl);
}

// Spin takes a positive or negative amount within [-360, 360] indicating the change of hue.
// Values outside of this range will be wrapped into this range.
function spin(color, amount) {
	let hsl = new tinycolor(color).toHsl(),
	    hue = (hsl.h + amount) % 360;
	hsl.h = hue < 0 ? 360 + hue : hue;
	return new tinycolor(hsl);
}

// Combination Functions
// ---------------------
// Thanks to jQuery xColor for some of the ideas behind these
// <https://github.com/infusion/jQuery-xcolor/blob/master/jquery.xcolor.js>

function complement(color) {
	let hsl = new tinycolor(color).toHsl();
	hsl.h = (hsl.h + 180) % 360;
	return new tinycolor(hsl);
}

function triad(color) {
	let hsl = new tinycolor(color).toHsl(),
	    h = hsl.h;
	return [
		new tinycolor(color),
		new tinycolor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
		new tinycolor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
	];
}

function tetrad(color) {
	var hsl = new tinycolor(color).toHsl();
	var h = hsl.h;
	return [
		new tinycolor(color),
		new tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
		new tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
		new tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
	];
}

function splitcomplement(color) {
	var hsl = new tinycolor(color).toHsl();
	var h = hsl.h;
	return [
		new tinycolor(color),
		new tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
		new tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
	];
}

function analogous(color, results, slices) {
	results = results || 6;
	slices = slices || 30;

	var hsl = new tinycolor(color).toHsl();
	var part = 360 / slices;
	var ret = [new tinycolor(color)];

	for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
		hsl.h = (hsl.h + part) % 360;
		ret.push(new tinycolor(hsl));
	}
	return ret;
}

function monochromatic(color, results) {
	results = results || 6;
	var hsv = new tinycolor(color).toHsv();
	var h = hsv.h, s = hsv.s, v = hsv.v;
	var ret = [];
	var modification = 1 / results;

	while (results--) {
		ret.push(new tinycolor({ h: h, s: s, v: v}));
		v = (v + modification) % 1;
	}

	return ret;
}

// Utility Functions
// ---------------------

tinycolor.mix = function(color1, color2, amount) {
	amount = (amount === 0) ? 0 : (amount || 50);

	var rgb1 = new tinycolor(color1).toRgb();
	var rgb2 = new tinycolor(color2).toRgb();

	var p = amount / 100;

	var rgba = {
		r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
		g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
		b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
		a: ((rgb2.a - rgb1.a) * p) + rgb1.a
	};

	return new tinycolor(rgba);
};


// Readability Functions
// ---------------------
// <http://www.w3.org/TR/2008/REC-WCAG20-20081211/#contrast-ratiodef (WCAG Version 2)

// `contrast`
// Analyze the 2 colors and returns the color contrast defined by (WCAG Version 2)
tinycolor.readability = function(color1, color2) {
	var c1 = new tinycolor(color1);
	var c2 = new tinycolor(color2);
	return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
};

// `isReadable`
// Ensure that foreground and background color combinations meet WCAG2 guidelines.
// The third argument is an optional Object.
//	  the 'level' property states 'AA' or 'AAA' - if missing or invalid, it defaults to 'AA';
//	  the 'size' property states 'large' or 'small' - if missing or invalid, it defaults to 'small'.
// If the entire object is absent, isReadable defaults to {level:"AA",size:"small"}.

// *Example*
//	tinycolor.isReadable("#000", "#111") => false
//	tinycolor.isReadable("#000", "#111",{level:"AA",size:"large"}) => false
tinycolor.isReadable = function(color1, color2, wcag2) {
	var readability = new tinycolor.readability(color1, color2);
	var wcag2Parms, out;

	out = false;

	wcag2Parms = validateWCAG2Parms(wcag2);
	switch (wcag2Parms.level + wcag2Parms.size) {
		case "AAsmall":
		case "AAAlarge":
			out = readability >= 4.5;
			break;
		case "AAlarge":
			out = readability >= 3;
			break;
		case "AAAsmall":
			out = readability >= 7;
			break;
	}
	return out;

};

// `mostReadable`
// Given a base color and a list of possible foreground or background
// colors for that base, returns the most readable color.
// Optionally returns Black or White if the most readable color is unreadable.
// *Example*
//	tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:false}).toHexString(); // "#112255"
//	tinycolor.mostReadable(tinycolor.mostReadable("#123", ["#124", "#125"],{includeFallbackColors:true}).toHexString();  // "#ffffff"
//	tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"large"}).toHexString(); // "#faf3f3"
//	tinycolor.mostReadable("#a8015a", ["#faf3f3"],{includeFallbackColors:true,level:"AAA",size:"small"}).toHexString(); // "#ffffff"
tinycolor.mostReadable = function(baseColor, colorList, args) {
	var bestColor = null;
	var bestScore = 0;
	var readability;
	var includeFallbackColors, level, size ;
	args = args || {};
	includeFallbackColors = args.includeFallbackColors ;
	level = args.level;
	size = args.size;

	for (var i= 0; i < colorList.length ; i++) {
		readability = new tinycolor.readability(baseColor, colorList[i]);
		if (readability > bestScore) {
			bestScore = readability;
			bestColor = new tinycolor(colorList[i]);
		}
	}

	if (new tinycolor(bestColor).isReadable(baseColor, bestColor, {"level":level,"size":size}) || !includeFallbackColors) {
		return bestColor;
	}
	else {
		args.includeFallbackColors=false;
		return new tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
	}
};

let names = tinycolor.names,
    hexNames = tinycolor.hexNames;
function flip(o) {
	let flipped = { };
	for (var i in o)
		if (o.hasOwnProperty(i))
			flipped[o[i]] = i;
	return flipped;
}
function boundAlpha(a) {
	a = parseFloat(a);
	if (isNaN(a) || a < 0 || a > 1)
		a = 1;
	return a;
}
function bound01(n, max) {
	if (isOnePointZero(n))
		n = "100%";
	let processPercent = isPercentage(n);
	
	n = Math.min(max, mathMax(0, parseFloat(n)));
	
	if (processPercent)
		n = parseInt(n * max, 10) / 100;
	if ((Math.abs(n - max) < 0.000001))
		return 1;
	return (n % max) / parseFloat(max);
}
function clamp01(val) {
	return Math.min(1, mathMax(0, val));
}
function parseIntFromHex(val) {
	return parseInt(val, 16);
}
function isOnePointZero(n) {
	return typeof n == "string" && n.indexOf('.') != -1 && parseFloat(n) === 1;
}
function isPercentage(n) {
	return typeof n === "string" && n.indexOf('%') != -1;
}
function pad2(c) {
	return c.length == 1 ? '0' + c : '' + c;
}
function convertToPercentage(n) {
	if (n <= 1)
		n = (n * 100) + "%";
	return n;
}
function convertDecimalToHex(d) {
	return Math.round(parseFloat(d) * 255).toString(16);
}
function convertHexToDecimal(h) {
	return (parseIntFromHex(h) / 255);
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
		if (isValidCSSUnit(color.r)
		    && isValidCSSUnit(color.g)
		    && isValidCSSUnit(color.b))
			rgb = rgbToRgb(color.r, color.g, color.b),
				ok = true,
				format = String(color.r).substr(-1) === "%" ? "prgb" : "rgb";
		else if (isValidCSSUnit(color.h)
			 && isValidCSSUnit(color.s)
			 && isValidCSSUnit(color.v))
			s = convertToPercentage(color.s),
				v = convertToPercentage(color.v),
				rgb = hsvToRgb(color.h, s, v),
				ok = true,
				format = "hsv";
		else if (isValidCSSUnit(color.h) 
			 && isValidCSSUnit(color.s) 
			 && isValidCSSUnit(color.l))
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
		r: Math.min(255, Math.max(rgb.r, 0)),
		g: Math.min(255, Math.max(rgb.g, 0)),
		b: Math.min(255, Math.max(rgb.b, 0)),
		a: a
	};
}
