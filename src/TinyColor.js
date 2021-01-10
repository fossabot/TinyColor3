const {
	rgbToRgb,
	rgbToHsl,
	hslToRgb,
	rgbToHsv,
	hsvToRgb,
	rgbToHex,
	rgbaToHex,
	rgbaToArgbHex,
	rgbToCmyk,
	bound01,
} = require("./conversion"),
      trimLeft = /^\s+/,
      trimRight = /\s+$/;
let tinyCounter = 0;
class TinyColor {
	constructor(color, opts) {
		color = (color) ? color : '';
		opts = opts || { };
		if (color instanceof tinycolor)
			return color;
		if (!(this instanceof tinycolor))
			return new tinycolor(color, opts);
		
		let rgb = inputToRGB(color),
		    hsl = rgbToHsl(this._r, this._g, this._b),
		    hsv = rgbToHsv(this._r, this._g, this._b);
		this.originalInput = color;
		this.red = rgb.r;
		this.green = rgb.g;
		this.blue = rgb.b;
		this.alpha = rgb.a;
		
		this.roundAlpha = Math.round(100*this.alpha) / 100;
		this.format = opts.format || rgb.format;
		this.gradientType = opts.gradientType;
		
		if (this.red < 1)
			this.red = Math.round(this.red);
		if (this.green < 1)
			this.green = Math.round(this.green);
		if (this.blue < 1) 
			this.blue = Math.round(this.blue);
		
		this.isValid = rgb.ok;
		this._tc_id = tinyCounter++;
		
		this.brightness = (this.red * 299 + this.green * 587 + this.blue * 114) / 1000;
		this.isDark = (this.getBrightness() < 128);
		this.isLight = (!this.isDark);
		
		this.hex = rgbToHex(this.red, this.green, this.blue);
		this.hexString = `#${rgbToHex(this.red, this.green, this.blue)}`;
		
		this.hex8 = rgbToHex(this.red, this.green, this.blue, this.alpha);
		this.hex8String = `#${rgbToHex(this.red, this.green, this.blue, this.alpha)}`;
		
		this.rgb = {
			r: Math.round(this.red),
			g: Math.round(this.green), 
			b: Math.round(this.blue), 
			a: this.alpha 
		};
		this.rgbString = (this.alpha == 1) ?
			`rgb(${Math.round(this.red)}, ${Math.round(this.green)}, ${Math.round(this.blue)})` : 
			`rgba(${Math.round(this.red)}, ${Math.round(this.green)}, ${Math.round(this.blue)}, ${this.roundAlpha})`;
		
		this.PercentageRgb = {
			r: `${Math.round(bound01(this.red, 255) * 255)}%`,
			g: `${Math.round(bound01(this.green, 255) * 255)}%`, 
			b: `${Math.round(bound01(this.blue, 255) * 255)}%`, 
			a: this.alpha 
		};
		this.PercentageRgbString = (this.alpha == 1) ?
			`rgb(${Math.round(bound01(this.red, 255) * 255)}%, ${Math.round(bound01(this.green, 255) * 255)}%, ${Math.round(bound01(this.blue, 255) * 255)}%)` : 
			`rgba(${Math.round(bound01(this.red, 255) * 255)}%, ${Math.round(bound01(this.green, 255) * 255)}%, ${Math.round(bound01(this.blue, 255) * 255)}%, ${this.roundAlpha})`;
		
		this.hsl = {
			h: hsl.h * 360,
			s: hsl.s,
			l: hsl.l,
			a: this.alpha
		};
		this.hslString =  (this.alpha == 1) ?
			`hsl(${Math.round(hsl.h * 360)}%, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%)` :
			`hsla(${Math.round(hsl.h * 360)}%, ${Math.round(hsl.s * 100)}%, ${Math.round(hsl.l * 100)}%, ${this.roundAlpha})`;
		
		this.hsv = {
			h: hsv.h * 360,
			s: hsv.s,
			l: hsv.l,
			a: this.alpha
		};
		this.hsvString =  (this.alpha == 1) ?
			`hsv(${Math.round(hsv.h * 360)}%, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.l * 100)}%)` :
			`hsva(${Math.round(hsv.h * 360)}%, ${Math.round(hsv.s * 100)}%, ${Math.round(hsv.l * 100)}%, ${this.roundAlpha})`;
		
		this.cmyk = rgbToCmyk(this.red, this.green, this.blue);
		this.cmykString = `cmyk(${Math.round(this.cmyk.c) * 100}%, ${Math.round(this.cmyk.m) * 100}%, ${Math.round(this.cmyk.y) * 100}%, ${Math.round(this.cmyk.k) * 100})`;
	}
	fromRatio () {
		if (typeof this.color == "object") {
			let newColor = {};
			for (var i in this.color)
				if (this.color.hasOwnProperty(i))
					if (i === "a")
						newColor[i] = this.color[i];
					else
						newColor[i] = convertToPercentage(this.color[i]);
			let color = newColor;
		}
		return new TinyColor(color, this.opts);
	};
}

function isValidCSSUnit(color) {
	return !!matchers.CSS_UNIT.exec(color);
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
	rgb.r = Math.max(0, Math.min(255, rgb.r - Math.round(255 * - (amount / 100))));
	rgb.g = Math.max(0, Math.min(255, rgb.g - Math.round(255 * - (amount / 100))));
	rgb.b = Math.max(0, Math.min(255, rgb.b - Math.round(255 * - (amount / 100))));
	return new tinycolor(rgb);
}

function darken (color, amount) {
	amount = (amount === 0) ? 0 : (amount || 10);
	let hsl = new tinycolor(color).toHsl();
	hsl.l -= amount / 100;
	hsl.l = clamp01(hsl.l);
	return new tinycolor(hsl);
}
function spin(color, amount) {
	let hsl = new tinycolor(color).toHsl(),
	    hue = (hsl.h + amount) % 360;
	hsl.h = hue < 0 ? 360 + hue : hue;
	return new tinycolor(hsl);
}

// --- Combination Functions
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
	let hsl = new tinycolor(color).toHsl(),
	    h = hsl.h;
	return [
		new tinycolor(color),
		new tinycolor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
		new tinycolor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
		new tinycolor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
	];
}

function splitcomplement(color) {
	let hsl = new tinycolor(color).toHsl(),
	    h = hsl.h;
	return [
		new tinycolor(color),
		new tinycolor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
		new tinycolor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
	];
}

function analogous(color, results, slices) {
	results = results || 6;
	slices = slices || 30;

	let hsl = new tinycolor(color).toHsl(),
	    part = 360 / slices,
	    ret = [new tinycolor(color)];

	for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
		hsl.h = (hsl.h + part) % 360;
		ret.push(new tinycolor(hsl));
	}
	return ret;
}

function monochromatic(color, results) {
	results = results || 6;
	let hsv = new tinycolor(color).toHsv(),
	    h = hsv.h, s = hsv.s, v = hsv.v,
	    ret = [],
	    modification = 1 / results;
	
	while (results--) {
		ret.push(new tinycolor({ h: h, s: s, v: v}));
		v = (v + modification) % 1;
	}
	return ret;
}

// --- Utility Functions

exports.mix = function(color1, color2, amount) {
	amount = (amount === 0) ? 0 : (amount || 50);
	let rgb1 = new tinycolor(color1).toRgb(),
	    rgb2 = new tinycolor(color2).toRgb(),
	    p = amount / 100,
	    rgba = {
		    r: ((rgb2.r - rgb1.r) * p) + rgb1.r,
		    g: ((rgb2.g - rgb1.g) * p) + rgb1.g,
		    b: ((rgb2.b - rgb1.b) * p) + rgb1.b,
		    a: ((rgb2.a - rgb1.a) * p) + rgb1.a
	    };
	
	return new tinycolor(rgba);
};


function readability (color1, color2) {
	let c1 = new tinycolor(color1),
	    c2 = new tinycolor(color2);
	return (Math.max(c1.getLuminance(),c2.getLuminance())+0.05) / (Math.min(c1.getLuminance(),c2.getLuminance())+0.05);
};

function isReadable (color1, color2, wcag2) {
	let readability = readability(color1, color2),
	    out = false,
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
exports.mostReadable = function(baseColor, colorList, args) {
	let bestColor = null,
	    bestScore = 0,
	    readability,
	    includeFallbackColors, level, size ;
	args = args || {};
	includeFallbackColors = args.includeFallbackColors ;
	level = args.level;
	size = args.size;

	for (var i= 0; i < colorList.length ; i++) {
		readability = readability(baseColor, colorList[i]);
		if (readability > bestScore)
			bestScore = readability,
				bestColor = new tinycolor(colorList[i]);
	}
	if (new bestColor.isReadable(baseColor, bestColor, {"level":level,"size":size}) 
	    || !includeFallbackColors)
		return bestColor;
	else
		args.includeFallbackColors=false;
		return new tinycolor.mostReadable(baseColor,["#fff", "#000"],args);
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
	
	n = Math.min(max, Math.max(0, parseFloat(n)));
	
	if (processPercent)
		n = parseInt(n * max, 10) / 100;
	if ((Math.abs(n - max) < 0.000001))
		return 1;
	return (n % max) / parseFloat(max);
}
function clamp01(val) {
	return Math.min(1, Math.max(0, val));
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
module.exports = TinyColor;
