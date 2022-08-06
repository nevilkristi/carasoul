export const defaultDocumentTitle = "Untitled Slideshow";

export const defaultTextParameters = {
  position: "absolute",
  textAlign: "center",
  fontFamily: "arial",
  isBold: false,
  isUnderline: false,
  isItalic: false,
  fontSize: "48px",
  lineHeight: "65px",
  color: "#000000",
  backgroundColor: null,
  opacity: 100,
  borderSettings: false,
  borderColor: "#000000",
  borderWidth: "0px",
  borderRadius: "0px",
  borderStyle: "solid",
  rotate: 0,
  zIndex: 1000,
  width: "500px",
  height: "60px",
  placeholder: "Enter Text Here",
  text: "<p></p>",
  translate: { y: 337.5, x: 390 },
};

export const defaultImageParameters = {
  height: "300px",
  width: "400px",
  borderSettings: false,
  borderColor: "#000000",
  borderWidth: "0px",
  borderRadius: "0px",
  borderStyle: "solid",
  rotate: 0,
  overflow: "hidden",
  translate: { x: 0, y: 0 },
  zIndex: 1000,
  position: "absolute",
  opacity: 100,
};

export const fontFamilies = [
  { label: "Andale Mono", value: "andalemono" },
  { label: "Arial", value: "arial" },
  { label: "Arial Black", value: "arialblack" },
  { label: "Baskerville", value: "baskerville" },
  { value: "bookantiqua", label: "Book Antiqua" },
  { value: "calibri", label: "Calibri" },
  { value: "bodoni", label: "Bodoni" },
  { value: "cambria", label: "Cambria" },
  { value: "comicsansms", label: "Comic Sans MS" },
  { value: "couriernew", label: "Courier New" },
  { value: "futura", label: "Futura" },
  { value: "franklingothic", label: "Franklin Gothic" },
  { value: "garamond", label: "Garamond" },
  { value: "georgia", label: "Georgia" },
  { value: "gotham", label: "Gotham" },
  { value: "helvetica", label: "Helvetica" },
  { value: "impact", label: "Impact" },
  { value: "myriad", label: "Myriad" },
  { value: "rockwell", label: "Rockwell" },
  { value: "symbol", label: "Symbol" },
  { value: "tahoma", label: "Tahoma" },
  { value: "terminal", label: "Terminal" },
  { value: "timesnewroman", label: "Times New Roman" },
  { value: "trebuchetms", label: "Trebuchet MS" },
  { value: "verdana", label: "Verdana" },
];

export const fontSizes = [
  { label: "12", value: 12 },
  { label: "16", value: 16 },
  { label: "18", value: 18 },
  { label: "20", value: 20 },
  { label: "24", value: 24 },
  { label: "28", value: 28 },
  { label: "36", value: 36 },
  { label: "38", value: 38 },
  { label: "48", value: 48 },
  { label: "50", value: 50 },
  { label: "62", value: 62 },
  { label: "78", value: 78 },
  { label: "85", value: 85 },
  { label: "92", value: 92 },
  { label: "100", value: 100 },
  { label: "108", value: 108 },
  { label: "114", value: 114 },
  { label: "120", value: 120 },
  { label: "125", value: 125 },
];

export const lineHights = [
  { label: "12", value: 12 },
  { label: "16", value: 16 },
  { label: "18", value: 18 },
  { label: "20", value: 20 },
  { label: "24", value: 24 },
  { label: "28", value: 28 },
  { label: "36", value: 36 },
  { label: "50", value: 50 },
  { label: "55", value: 55 },
  { label: "62", value: 62 },
  { label: "65", value: 65 },
  { label: "78", value: 78 },
  { label: "85", value: 85 },
  { label: "92", value: 92 },
  { label: "125", value: 125 },
];
export const borders = [
  { label: "None", value: 0 },
  { label: "1", value: 1 },
  { label: "2", value: 2 },
  { label: "3", value: 3 },
  { label: "5", value: 5 },
  { label: "10", value: 10 },
  { label: "15", value: 15 },
  { label: "20", value: 20 },
  { label: "25", value: 25 },
  { label: "50", value: 50 },
];
export const borderRadiuses = [
  { label: "None", value: 0 },
  { label: "6", value: 6 },
  { label: "10", value: 10 },
  { label: "40", value: 40 },
  { label: "46", value: 46 },
  { label: "50", value: 50 },
];

export const borderTypes = [
  { value: "dotted", label: "Dotted" },
  { value: "dashed", label: "Dashed" },
  { value: "solid", label: "Solid" },
  { value: "double", label: "Double" },
  { value: "groove", label: "Groove" },
  { value: "ridge", label: "Ridge" },
  { value: "inset", label: "Inset" },
  { value: "outset", label: "Outset" },
];

export const presentationSizes = [
  { value: 1, label: "1280*720 - 16:9 - Default" },
  { value: 2, label: "960*720" },
];

export const autoSlideTimes = [
  { value: 1000 * 0, label: "Off" },
  { value: 1000 * 5, label: "5 seconds" },
  { value: 1000 * 10, label: "10 seconds" },
  { value: 1000 * 15, label: "15 seconds" },
  { value: 1000 * 20, label: "20 seconds" },
  { value: 1000 * 30, label: "30 seconds" },
  { value: 1000 * 40, label: "40 seconds" },
  { value: 1000 * 60 * 1, label: "1 Minute" },
  { value: 1000 * 60 * 2, label: "2 Minutes" },
  { value: 1000 * 60 * 5, label: "5 Minutes" },
  { value: 1000 * 60 * 10, label: "10 Minutes" },
  { value: 1000 * 60 * 20, label: "20 Minutes" },
  { value: 1000 * 60 * 30, label: "30 Minutes" },
  { value: 1000 * 60 * 45, label: "45 Minutes" },
  { value: 1000 * 60 * 60 * 1, label: "1 Hour" },
];

export const backgroundRepeats = [
  { value: "no-repeat", label: "No Repeat" },
  { value: "repeat", label: "Repeat" },
  { value: "repeat-x", label: "Repeat-x" },
  { value: "space", label: "Space" },
  { value: "round", label: "Round" },
];

export const backgroundSizes = [
  { value: "auto", label: "Auto" },
  { value: "contain", label: "Contain" },
  { value: "cover", label: "Cover" },
];

export const backgroundPositions = [
  { value: "top", label: "Top" },
  { value: "left", label: "Left" },
  { value: "right", label: "Right" },
  { value: "center", label: "Center" },
  { value: "bottom", label: "Bottom" },
  { value: "revert", label: "Revert" },
];
