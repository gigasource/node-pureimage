const Context = require('./context');
const NAMED_COLORS = require('./named_colors');
const GREY_SCALE_LIMIT = 200;

/**
 * The Bitmap class is used for direct pixel manipulation(for example setting a pixel colour,
 * transparency etc). It also provides a factory method for creating new instances of
 * {@link Context}
 *
 * @class Bitmap
 */
class Bitmap {

  /**
   * Creates an instance of Bitmap.
   * @param {number} w      Width
   * @param {number} h      Height
   * @param {any}   options Currently unused
   * @memberof Bitmap
   */
  constructor(w, h, options) {

    /**
     * @type {number}
     */
    this.width = Math.floor(w);

    /**
     * @type {number}
     */
    this.height = Math.floor(h);

    /**
     * @type {ArrayBuffer}
     */
    this.data = Buffer.alloc(Math.ceil(w * h / 8));

    const fillval = NAMED_COLORS.transparent;

    for (var j = 0; j < h; j++) {
      for (var i = 0; i < w; i++) {
        this.setPixelRGBA(i, j, fillval);
      }
    }

  }

  /**
   * Calculate Index
   *
   * @param {number} x X position
   * @param {number} y Y position
   *
   * @returns {number}
   *
   * @memberof Bitmap
   */
  calculateIndex(x, y) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return 0;
    return (this.width * y + x);
  }

  /**
   * Set the RGBA(Red, Green, Blue, Alpha) values on an individual pixel level
   *
   * @param {number} x    X axis position
   * @param {number} y    Y axis position
   * @param {number} rgbaHex A hex representation of the RGBA value of the pixel. See {@link NAMED_COLORS} for examples
   * @param {Buffer|ArrayBuffer} buffer a custom buffer to use
   *
   * @returns {void}
   *
   * @memberof Bitmap
   */
  setPixelRGBA(x, y, rgbaHex, buffer = this.data) {
    const i = this.calculateIndex(x, y);
    const [byteIndex, bitIndex] = calculateByteAndBitIndex(i);

    const [r, g, b] = hexToRgb(rgbaHex);
    const greyScale = Math.round(calculateGreyScale(r, g, b));

    setBitOfByte(buffer, byteIndex, bitIndex, greyScale < GREY_SCALE_LIMIT ? 0 : 1) // 0 is black, 1 is white
  }

  setPixelRGBA_index(pixelIndex, rgbaHex, buffer = this.data) {
    const [byteIndex, bitIndex] = calculateByteAndBitIndex(pixelIndex);

    const [r, g, b] = hexToRgb(rgbaHex);
    const greyScale = Math.round(calculateGreyScale(r, g, b));

    setBitOfByte(buffer, byteIndex, bitIndex, greyScale < GREY_SCALE_LIMIT ? 0 : 1) // 0 is black, 1 is white
  }

  /**
   * Set the individual red, green, blue and alpha levels of an individual pixel
   *
   * @param {number} x X axis position
   * @param {number} y Y axis position
   * @param {number} r Red level
   * @param {number} g Green level
   * @param {number} b Blue level
   * @param {number} a Alpha level
   *
   * @returns {void}
   *
   * @memberof Bitmap
   */
  setPixelRGBA_i(x, y, r, g, b, a) {
    let i = this.calculateIndex(x, y);
    this.data[i + 0] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
  }

  /**
   * Get the RGBA value of an individual pixel as a hexadecimal number(See {@link NAMED_COLORS} for examples)
   *
   * @param {number} x X axis potiion
   * @param {number} y Y axis position
   *
   * @returns {number}
   *
   * @memberof Bitmap
   */
  getPixelRGBA(x, y) {
    const i = this.calculateIndex(x, y);
    const [byteIndex, bitIndex] = calculateByteAndBitIndex(i);
    const byteValue = this.data[byteIndex];

    return getBitOfNumber(byteValue, bitIndex) === 0 ? NAMED_COLORS.black : NAMED_COLORS.white;
  }

  /**
   * Get Pixel RGBA Seperate
   *
   * @param {number} x X axis position
   * @param {number} y Y axis position
   *
   * @ignore
   *
   * @returns {Array}
   *
   * @memberof Bitmap
   */
  getPixelRGBA_separate(x, y) {
    var i = this.calculateIndex(x, y);
    return this.data.slice(i, i + 4);
  }

  /**
   * {@link Context} factory. Creates a new {@link Context} instance object for the current bitmap object
   *
   * @returns {Context}
   *
   * @memberof Bitmap
   */
  getContext() {
    return new Context(this);
  }
}

function setBitOfByte(buffer, byteIndex, bitIndex, value) {
  const byteValue = buffer[byteIndex];
  buffer[byteIndex] = value === 0
    ? (byteValue & ~(1 << bitIndex))
    : (byteValue | (1 << bitIndex))
}

function getBitOfNumber(number, bitIndex) {
  return (number & (1 << bitIndex)) === 0 ? 0 : 1;
}

function hexToRgb(number) {
  const b = (number & 0xFF00) >>> 8;
  const g = (number & 0xFF0000) >>> 16;
  const r = (number & 0xFF000000) >>> 24;
  return [r, g, b];
}

function calculateGreyScale(r, g, b) {
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

function calculateByteAndBitIndex(pixelIndex) {
  const byteIndex = Math.floor(pixelIndex / 8);
  const bitIndex = pixelIndex % 8;

  return [byteIndex, bitIndex];
}

module.exports = Bitmap;
