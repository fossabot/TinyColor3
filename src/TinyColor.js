const { rgbToRgb, rgbToHsl, hslToRgb, rgbToHsv, hsvToRgb, rgbToHex, rgbaToHex, rgbaToArgbHex, rgbToCmyk, bound01 } = require("./conversion"),
	colorNames = require("./colorNames"),
	trimLeft = /^\s+/,
	trimRight = /\s+$/,
	trimBoth = /(^\s+|\s+$)/
let tinyCounter = 0,
    names = {};

colorNames.forEach(color => names[color.name] = color.hex)
class TinyColor {
	constructor(color, opts) {
		if (typeof color == "string")
			if (color == "random")
				color = ((1 << 24) * Math.random() | 0).toString(16)
		color = (color) ? color : '';
		opts = opts || { };
		if (color instanceof TinyColor)
			return color;
		if (!(this instanceof TinyColor))
			return new TinyColor(color, opts);
		
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
		this.isDark = (this.brightness < 128);
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
	_applyModification: function(fn, args) {
		let color = fn.apply(null, [this].concat([].slice.call(args)));
		this.red = color.red;
		this.green = color.green;
		this.blue = color.blue;
		this.setAlpha(color.alpha);
		return this;
	}
	equals (color) {
		if (!color)
			return false;
		return this.rgbString == new TinyColor(color).rgbString;
	}
	
	mix(color, amount) {
		amount = (amount === 0) ? 0 : (amount || 50);
		let rgb = this.rgb,
		    rgb1 = new TinyColor(color).rgb,
		    p = amount / 100,
		    rgba = {
			    r: ((rgb1.r - rgb.r) * p) + rgb.r,
			    g: ((rgb1.g - rgb.g) * p) + rgb.g,
			    b: ((rgb1.b - rgb.b) * p) + rgb.b,
			    a: ((rgb1.a - rgb.a) * p) + rgb.a
		    };
	
		return new TinyColor(rgba)
	};
	
	// --- Modification
	
	desaturate(amount) {
		amount = (amount === 0) ? 0 : (amount || 10);
		this.hsl.s -= amount / 100;
		this.hsl.s = clamp01(this.hsl.s);
		return new TinyColor(this.hsl);
	}
	saturate(amount) {
		amount = (amount === 0) ? 0 : (amount || 10);
		this.hsl.s += amount / 100;
		this.hsl.s = clamp01(this.hsl.s);
		return new TinyColor(this.hsl);
	}
	
	greyscale() {
		return this.desaturate(100);
	}
	
	lighten (amount) {
		amount = (amount === 0) ? 0 : (amount || 10);
		this.hsl.l += amount / 100;
		this.hsl.l = clamp01(this.hsl.l);
		return new TinyColor(this.hsl);
	}
	
	brighten(amount) {
		amount = (amount === 0) ? 0 : (amount || 10);
		this.rgb.r = Math.max(0, Math.min(255, this.rgb.r - Math.round(255 * - (amount / 100))));
		this.rgb.g = Math.max(0, Math.min(255, this.rgb.g - Math.round(255 * - (amount / 100))));
		this.rgb.b = Math.max(0, Math.min(255, this.rgb.b - Math.round(255 * - (amount / 100))));
		return new TinyColor(rgb);
	}
	darken (amount) {
		amount = (amount === 0) ? 0 : (amount || 10);
		this.hsl.l -= amount / 100;
		this.hsl.l = clamp01(this.hsl.l);
		return new TinyColor(this.hsl);
	}
	
	spin(amount) {
		let hue = (this.hsl.h + amount) % 360;
		this.hsl.h = hue < 0 ? 360 + hue : hue;
		return new TinyColor(this.hsl);
	}
}

function isValidCSSUnit(color) {
	return !!matchers.CSS_UNIT.exec(color);
}
function validateWCAG2Parms(parms) {
	parms = parms || {
		level:"AA",
		size:"small"
	};
	let level = (parms.level|| "AA").toUpperCase(),
	    size = (parms.size || "small").toLowerCase();
	if (level !== "AA" && level !== "AAA")
		level = "AA";
	if (size !== "small" && size !== "large")
		size = "small";
	return {
		level: level, 
		size: size
	};
}
// --- Combination Functions
function complement(color) {
	let hsl = new TinyColor(color).hsl
	hsl.h = (hsl.h + 180) % 360;
	return new TinyColor(hsl);
}

function triad(color) {
	let hsl = new TinyColor(color).hsl,
	    h = hsl.h;
	return [
		new TinyColor(color),
		new TinyColor({ h: (h + 120) % 360, s: hsl.s, l: hsl.l }),
		new TinyColor({ h: (h + 240) % 360, s: hsl.s, l: hsl.l })
	];
}

function tetrad(color) {
	let hsl = new TinyColor(color).toHsl(),
	    h = hsl.h;
	return [
		new TinyColor(color),
		new TinyColor({ h: (h + 90) % 360, s: hsl.s, l: hsl.l }),
		new TinyColor({ h: (h + 180) % 360, s: hsl.s, l: hsl.l }),
		new TinyColor({ h: (h + 270) % 360, s: hsl.s, l: hsl.l })
	];
}

function splitcomplement(color) {
	let hsl = new TinyColor(color).toHsl(),
	    h = hsl.h;
	return [
		new TinyColor(color),
		new TinyColor({ h: (h + 72) % 360, s: hsl.s, l: hsl.l}),
		new TinyColor({ h: (h + 216) % 360, s: hsl.s, l: hsl.l})
	];
}

function analogous(color, results, slices) {
	results = results || 6;
	slices = slices || 30;

	let hsl = new TinyColor(color).hsl,
	    part = 360 / slices,
	    ret = [new TinyColor(color)];

	for (hsl.h = ((hsl.h - (part * results >> 1)) + 720) % 360; --results; ) {
		hsl.h = (hsl.h + part) % 360;
		ret.push(new TinyColor(hsl));
	}
	return ret;
}

function monochromatic(color, results) {
	results = results || 6;
	let hsv = new TinyColor(color).hsv,
	    h = hsv.h, s = hsv.s, v = hsv.v,
	    ret = [],
	    modification = 1 / results;
	
	while (results--) {
		ret.push(new TinyColor({ h: h, s: s, v: v}));
		v = (v + modification) % 1;
	}
	return ret;
}

function readability (color1, color2) {
	let c1 = new TinyColor(color1),
	    c2 = new TinyColor(color2);
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
				bestColor = new TinyColor(colorList[i]);
	}
	if (isReadable(baseColor, bestColor, {"level":level,"size":size}) 
	    || !includeFallbackColors)
		return bestColor;
	else
		args.includeFallbackColors=false;
		return mostReadable(baseColor,["#fff", "#000"],args);
};
function flip(o) {
	let flipped = { };
	for (var i in o)
		if (o.hasOwnProperty(i))
			flipped[o[i]] = i;
	return flipped;
}

const matchers = (function() {
    let CSS_INTEGER = "[-\\+]?\\d+%?",
	CSS_NUMBER = "[-\\+]?\\d*\\.\\d+%?",
	CSS_UNIT = "(?:" + CSS_NUMBER + ")|(?:" + CSS_INTEGER + ")",
	PERMISSIVE_MATCH3 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?",
	PERMISSIVE_MATCH4 = "[\\s|\\(]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")[,|\\s]+(" + CSS_UNIT + ")\\s*\\)?";

    return {
        CSS_UNIT: new RegExp(CSS_UNIT),
        rgb: new RegExp("rgb" + PERMISSIVE_MATCH3),
        rgba: new RegExp("rgba" + PERMISSIVE_MATCH4),
        hsl: new RegExp("hsl" + PERMISSIVE_MATCH3),
        hsla: new RegExp("hsla" + PERMISSIVE_MATCH4),
        hsv: new RegExp("hsv" + PERMISSIVE_MATCH3),
        hsva: new RegExp("hsva" + PERMISSIVE_MATCH4),
        hex3: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex6: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/,
        hex4: /^#?([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})([0-9a-fA-F]{1})$/,
        hex8: /^#?([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})$/
    };
})();


function boundAlpha(a) {
	a = parseFloat(a);
	if (isNaN(a) || a < 0 || a > 1)
		a = 1;
	return a;
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
	color = color.replace(trimBoth, '').toLowerCase();
	let named = false,
	    match;
	if (names[color])
		color = names[color],
			named = true;
	else if (color == 'transparent')
		return {
			r: 0,
			g: 0,
			b: 0,
			a: 0,
			format: "name"
		};
    if ((match = matchers.rgb.exec(color))) 
		return {
			r: match[1],
			g: match[2],
			b: match[3]
		};
    if ((match = matchers.rgba.exec(color)))
        return {
			r: match[1],
			g: match[2],
			b: match[3],
			a: match[4]
		};
    if ((match = matchers.hsl.exec(color)))
        return {
			h: match[1],
			s: match[2],
			l: match[3]
		};
    if ((match = matchers.hsla.exec(color)))
        return {
			h: match[1],
			s: match[2],
			l: match[3],
			a: match[4]
		};
    if ((match = matchers.hsv.exec(color)))
        return {
			h: match[1],
			s: match[2],
			v: match[3]
		};
    if ((match = matchers.hsva.exec(color)))
        return {
			h: match[1],
			s: match[2],
			v: match[3],
			a: match[4]
		};
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
