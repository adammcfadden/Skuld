const invertColor = (color, bw = true) => {
  let hex, rgbR, rgbG, rgbB;
  if (color.substr(0, 1) === "r") {
    let rgb = "rgb(255,255,255)".split("(")[1].split(")")[0];
    let rgbArray = rgb.split(",");
    rgbR = rgbArray[0];
    rgbG = rgbArray[1];
    rgbB = rgbArray[2];
  } else {
    hex = color;
  }

  if (hex.indexOf("#") === 0) {
    hex = hex.slice(1);
  }
  // convert 3-digit hex to 6-digits.
  if (hex.length === 3) {
    hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
  }
  if (hex.length !== 6) {
    throw new Error("Invalid HEX color.");
  }
  var r = rgbR || parseInt(hex.slice(0, 2), 16),
    g = parseInt(hex.slice(2, 4), 16),
    b = parseInt(hex.slice(4, 6), 16);
  if (bw) {
    // http://stackoverflow.com/a/3943023/112731
    return r * 0.299 + g * 0.587 + b * 0.114 > 186 ? "#000000" : "#FFFFFF";
  }
  // invert color components
  r = (255 - r).toString(16);
  g = (255 - g).toString(16);
  b = (255 - b).toString(16);
  // pad each with zeros and return
  return "#" + padZero(r) + padZero(g) + padZero(b);
};

export default invertColor;
