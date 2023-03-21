(() => {
  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/arrays.ts
  var removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/dom.ts
  var __appDiv = document.body.querySelector("#app");
  if (!__appDiv) {
    console.error("Could not find #app!");
  }
  var __canvasElement = __appDiv.querySelector(
    "canvas"
  );
  if (!__canvasElement) {
    console.error("Could not find #canvas!");
  }
  var __assetsDiv = document.body.querySelector(
    "#assets"
  );
  if (!__assetsDiv) {
    console.error("Could not find #assets!");
  }

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/globals.ts
  var Globals = {
    game: void 0
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/math.ts
  var Vec2 = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(pos) {
      return new Vec2(this.x + pos.x, this.y + pos.y);
    }
    multiply(n) {
      return new Vec2(this.x * n, this.y * n);
    }
    divide(n) {
      return new Vec2(this.x / n, this.y / n);
    }
    half() {
      return this.multiply(0.5);
    }
    snap(gridSize) {
      return new Vec2(
        Math.round(this.x / gridSize) * gridSize,
        Math.round(this.y / gridSize) * gridSize
      );
    }
    lengthTo(pos) {
      return Math.sqrt((this.x - pos.x) ** 2 + (this.y - pos.y) ** 2);
    }
    isInside(pos, size2) {
      return pos.x <= this.x && this.x <= pos.x + size2.x && pos.y <= this.y && this.y <= pos.y + size2.y;
    }
    moveTowards(pos, length) {
      return this.add(this.direction(pos).multiply(length));
    }
    direction(pos) {
      if (pos.y === this.y && pos.x === this.x)
        return new Vec2(0, 0);
      const angle = Math.atan2(pos.y - this.y, pos.x - this.x);
      return new Vec2(Math.cos(angle), Math.sin(angle));
    }
    round() {
      return new Vec2(Math.round(this.x), Math.round(this.y));
    }
    copy() {
      return new Vec2(this.x, this.y);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/input.ts
  var keysJustPressed = /* @__PURE__ */ new Set();
  var keysJustReleased = /* @__PURE__ */ new Set();
  var keysActive = /* @__PURE__ */ new Set();
  var mouseButtonsJustPressed = /* @__PURE__ */ new Set();
  var mouseButtonsJustReleased = /* @__PURE__ */ new Set();
  var mouseButtonsActive = /* @__PURE__ */ new Set();
  var Input = {
    mouse: {
      pos: new Vec2(0, 0),
      button: (button) => {
        return mouseButtonsActive.has(button);
      }
    },
    key: (e) => {
      return keysActive.has(e);
    }
  };
  var eventPosition = (ev) => {
    const scale = Globals.game?.__options.scale ?? 1;
    return new Vec2(
      (ev.pageX - __canvasElement.offsetLeft) / scale,
      (ev.pageY - __canvasElement.offsetTop) / scale
    );
  };
  document.addEventListener("mousedown", (ev) => {
    mouseButtonsJustPressed.add({ button: ev.button, pos: eventPosition(ev) });
  });
  document.addEventListener("mouseup", (ev) => {
    mouseButtonsJustReleased.add({ button: ev.button, pos: eventPosition(ev) });
  });
  document.addEventListener("keydown", (ev) => {
    keysJustPressed.add(ev.key);
  });
  document.addEventListener("keyup", (ev) => {
    keysJustReleased.add(ev.key);
  });
  var preventDefault = (event) => event.preventDefault();
  document.addEventListener("mousemove", (ev) => {
    const pos = eventPosition(ev);
    Input.mouse.pos.x = pos.x;
    Input.mouse.pos.y = pos.y;
    const scale = Globals.game?.__options.scale ?? 1;
    if (Input.mouse.pos.isInside(
      new Vec2(0, 0),
      new Vec2(__canvasElement.width / scale, __canvasElement.height / scale)
    )) {
      document.addEventListener("contextmenu", preventDefault);
    } else {
      document.removeEventListener("contextmenu", preventDefault);
    }
  });
  var handleInput = (gameObjects) => {
    mouseButtonsJustPressed.forEach((ev) => {
      mouseButtonsActive.add(ev.button);
      gameObjects.forEach((obj) => {
        if (obj.onMousePress)
          obj.onMousePress(ev);
      });
    });
    mouseButtonsJustPressed.clear();
    mouseButtonsJustReleased.forEach((ev) => {
      mouseButtonsActive.delete(ev.button);
      gameObjects.forEach((obj) => {
        if (obj.onMouseRelease)
          obj.onMouseRelease(ev);
      });
    });
    mouseButtonsJustReleased.clear();
    keysJustPressed.forEach((key) => {
      keysActive.add(key);
      gameObjects.forEach((obj) => {
        if (obj.onKeyPress)
          obj.onKeyPress(key);
      });
    });
    keysJustPressed.clear();
    keysJustReleased.forEach((key) => {
      keysActive.delete(key);
      gameObjects.forEach((obj) => {
        if (obj.onKeyRelease)
          obj.onKeyRelease(key);
      });
    });
    keysJustReleased.clear();
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/draw.ts
  var Canvas = class {
    constructor(canvasElement) {
      this.withStyle = (style, func) => {
        this.__ctx.save();
        if (style.strokeStyle)
          this.__ctx.strokeStyle = style.strokeStyle;
        if (style.lineWidth !== void 0)
          this.__ctx.lineWidth = style.lineWidth;
        if (style.fillStyle)
          this.__ctx.fillStyle = style.fillStyle;
        if (style.font || style.fontSize)
          this.__ctx.font = `${style.fontSize ?? 8}px ${style.font ?? "arial"}`;
        func();
        this.__ctx.restore();
      };
      this.drawImage = (imageAsset, pos, options = { smoothing: false }) => {
        if (imageAsset.__image) {
          this.__ctx.imageSmoothingEnabled = options.smoothing;
          this.__ctx.drawImage(
            imageAsset.__image,
            pos.x,
            pos.y,
            imageAsset.__image.width,
            imageAsset.__image.height
          );
        }
      };
      this.__canvasElement = canvasElement;
      this.__ctx = this.__canvasElement.getContext("2d");
      if (!this.__ctx) {
        console.error("Could not get context of canvas!");
      }
    }
    drawRect(pos, size2, style = { fillStyle: "white" }) {
      this.withStyle(style, () => {
        this.__ctx.fillRect(pos.x, pos.y, size2.x, size2.y);
      });
    }
    drawClear() {
      this.__ctx.clearRect(0, 0, __canvasElement.width, __canvasElement.height);
    }
    drawPath(points, style = {
      strokeStyle: "white",
      lineWidth: 1
    }) {
      this.withStyle(style, () => {
        this.__ctx.beginPath();
        this.__ctx.moveTo(points[0].x, points[0].y);
        for (let i = 0; i < points.length; i++) {
          this.__ctx.lineTo(points[i].x, points[i].y);
        }
        this.__ctx.stroke();
      });
    }
    drawLine(a, b, options) {
      const _a = a.copy();
      const _b = b.copy();
      const angle = Math.atan2(_b.y - _a.y, _b.x - _a.x);
      if (options.startOffset) {
        _a.x += options.startOffset * Math.cos(angle);
        _a.y += options.startOffset * Math.sin(angle);
      }
      if (options.endOffset) {
        _b.x += options.endOffset * Math.cos(angle);
        _b.y += options.endOffset * Math.sin(angle);
      }
      const length = _a.lengthTo(_b);
      if (options.maxLength && length > options.maxLength) {
        _b.x = _a.x + options.maxLength * Math.cos(angle);
        _b.y = _a.y + options.maxLength * Math.sin(angle);
      } else if (options.minLength && length < options.minLength) {
        _b.x = _a.x + options.minLength * Math.cos(angle);
        _b.y = _a.y + options.minLength * Math.sin(angle);
      }
      this.drawPath([_a, _b]);
    }
    drawText(text, pos, style = { fillStyle: "white", font: "arial", fontSize: 8 }) {
      this.withStyle(style, () => {
        this.__ctx.fillText(text, pos.x, pos.y + (style.fontSize ?? 0));
      });
    }
    drawCircle(radius, pos, style = { fillStyle: "white" }) {
      this.withStyle(style, () => {
        this.__ctx.beginPath();
        this.__ctx.arc(pos.x, pos.y, radius, 0, 2 * Math.PI);
        this.__ctx.fill();
        this.__ctx.stroke();
      });
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/game.ts
  var defaultOptions = {
    width: 480,
    height: 320,
    scale: 2,
    fps: 60,
    zSort: true,
    baseUrl: "./"
  };
  var Game = class {
    constructor(isGlobalGame = true) {
      this.__options = defaultOptions;
      this.__gameObjects = [];
      this.__t = 0;
      this.currentFps = 0;
      if (isGlobalGame) {
        Globals.game = this;
      }
      this.__canvas = new Canvas(__canvasElement);
      this.setOptions(defaultOptions);
    }
    setOptions(options) {
      this.__options = {
        ...this.__options,
        ...options
      };
      const canvasSize = this.getCanvasSize().multiply(this.__options.scale);
      __canvasElement.width = canvasSize.x;
      __canvasElement.height = canvasSize.y;
      this.__canvas.__ctx.scale(this.__options.scale, this.__options.scale);
      return this;
    }
    getCanvasSize() {
      return new Vec2(this.__options.width, this.__options.height);
    }
    addObject(object) {
      this.__gameObjects.push(object);
    }
    removeObject(object) {
      removeFromArray(this.__gameObjects, object);
    }
    play() {
      let timePrevMod = 0;
      let timePrev = 0;
      const gameLoop = (time) => {
        requestAnimationFrame(gameLoop);
        const delta = time - timePrevMod;
        const interval = 1e3 / this.__options.fps;
        if (delta >= interval) {
          timePrevMod = time - delta % interval;
          this.currentFps = 1e3 / (time - timePrev);
          timePrev = time;
          this.__step();
        }
      };
      gameLoop(0);
    }
    __maybeSort() {
      if (!this.__options.zSort)
        return;
      let shouldSort = false;
      for (let i = 0; i < this.__gameObjects.length; i++) {
        if (this.__gameObjects[i].__changed) {
          shouldSort = true;
          break;
        }
      }
      if (shouldSort) {
        this.__gameObjects.sort((a, b) => a.__zIndex - b.__zIndex);
        this.__gameObjects.forEach((o) => o.__changed = false);
      }
    }
    __step() {
      this.__maybeSort();
      handleInput(this.__gameObjects);
      this.__canvas.drawClear();
      this.__gameObjects.forEach((object) => {
        if (object.draw)
          object.draw(this.__canvas, this.__t);
      });
      this.__gameObjects.forEach((object) => {
        if (object.step)
          object.step(Math.round(this.__options.fps / this.currentFps));
      });
      this.__t++;
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/assets.ts
  var assets = /* @__PURE__ */ new Map();
  var Asset = class {
  };
  var ImageAsset = class extends Asset {
    constructor(path) {
      super();
      this.__path = path;
      this.__load();
    }
    __load() {
      const memo = assets.get(this.__path);
      if (memo instanceof HTMLImageElement) {
        this.__image = memo;
      }
      const image = new Image();
      image.src = this.__path;
      image.onload = () => {
        assets.set(this.__path, image);
        this.__image = image;
      };
      __assetsDiv.appendChild(image);
    }
    size() {
      return new Vec2(this.__image?.width ?? 0, this.__image?.height ?? 0);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/gameObject.ts
  var GameObject = class {
    constructor() {
      this.__changed = true;
      this.__zIndex = 0;
      this.activate();
    }
    activate() {
      Globals.game?.addObject(this);
    }
    deactivate() {
      Globals.game?.removeObject(this);
    }
    destruct() {
      this.deactivate();
      if (this.destructor) {
        this.destructor();
      }
    }
    setZIndex(zIndex) {
      this.__zIndex = zIndex;
      this.__changed = true;
    }
  };
  var PositionObject = class extends GameObject {
    constructor(x, y) {
      super();
      this.pos = new Vec2(x, y);
      this.setZIndex(y);
    }
  };
  var ImageObject = class extends PositionObject {
    constructor(x, y, imagePath) {
      super(x, y);
      this.image = new ImageAsset(imagePath);
    }
    imageCenter() {
      return this.pos.add(this.image.size().half());
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/objects/bullet.ts
  var Bullet = class extends PositionObject {
    constructor(pos, target) {
      super(pos.x, pos.y);
      this.speed = 10;
      this.direction = pos.direction(target);
      setTimeout(() => this.destruct(), 2e3);
    }
    draw(c) {
      c.drawCircle(3, this.pos);
    }
    step(dtFactor) {
      this.pos = this.pos.add(this.direction.multiply(this.speed * dtFactor));
      const canvasSize = game.getCanvasSize();
      if (this.pos.x < 0 || canvasSize.x < this.pos.x)
        this.direction.x *= -1;
      if (this.pos.y < 0 || canvasSize.y < this.pos.y)
        this.direction.y *= -1;
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/objects/player.ts
  var size = 16;
  var Player = class extends ImageObject {
    constructor(x, y) {
      super(x, y, "./player.png");
    }
    draw(c) {
      c.drawLine(this.imageCenter(), Input.mouse.pos, {
        startOffset: 20,
        maxLength: 20,
        minLength: 20
      });
      c.drawImage(this.image, this.pos);
    }
    step(dtFactor) {
      const target = this.pos.copy();
      if (Input.key("w"))
        target.y -= 1;
      if (Input.key("a"))
        target.x -= 1;
      if (Input.key("s"))
        target.y += 1;
      if (Input.key("d"))
        target.x += 1;
      this.pos = this.pos.moveTowards(target, 1.5 * dtFactor);
      this.setZIndex(this.pos.y + size);
      if (Input.mouse.button(0 /* Left */)) {
        new Bullet(
          this.imageCenter().moveTowards(Input.mouse.pos, 16),
          Input.mouse.pos
        );
      }
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/objects/textObject.ts
  var TextObject = class extends PositionObject {
    constructor(getText, x, y) {
      super(x, y);
      this.getText = getText;
    }
    draw(c) {
      c.drawText(this.getText(), this.pos);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/main.ts
  var game = new Game().setOptions({
    width: 480,
    height: 320,
    scale: 2,
    fps: 60
  });
  var player = new Player(100, 250);
  new TextObject(() => `Player: ${JSON.stringify(player.pos)}`, 0, 0);
  new TextObject(() => `Objects: ${game.__gameObjects.length}`, 0, 16);
  new TextObject(() => `FPS: ${game.currentFps.toFixed(1)}`, 0, 32);
  game.play();
})();
