(() => {
  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/arrays.ts
  var removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/dom.ts
  var appDiv = document.body.querySelector("#app");
  if (!appDiv) {
    console.error("Could not find #app!");
  }
  var canvasElement = appDiv.querySelector(
    "canvas"
  );
  if (!canvasElement) {
    console.error("Could not find #canvas!");
  }
  var ctx = canvasElement.getContext("2d");
  if (!ctx) {
    console.error("Could not get context of canvas!");
  }
  var assetsDiv = document.body.querySelector(
    "#assets"
  );
  if (!assetsDiv) {
    console.error("Could not find #assets!");
  }

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/draw.ts
  var drawRect = (x, y, w, h) => {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, w, h);
  };
  var drawClear = () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  };
  var drawImage = (imageAsset, pos, options = { smoothing: false }) => {
    if (imageAsset.image) {
      ctx.imageSmoothingEnabled = options.smoothing;
      ctx.drawImage(
        imageAsset.image,
        pos.x,
        pos.y,
        imageAsset.image.width,
        imageAsset.image.height
      );
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/events.ts
  var keysJustPressed = /* @__PURE__ */ new Set();
  var keysJustReleased = /* @__PURE__ */ new Set();
  var activeKeys = /* @__PURE__ */ new Set();
  var Input = {
    key: (e) => {
      return activeKeys.has(e);
    }
  };
  document.addEventListener("keydown", (ev) => {
    keysJustPressed.add(ev.key);
  });
  document.addEventListener("keyup", (ev) => {
    keysJustReleased.add(ev.key);
  });
  var handleInput = (game2) => {
    keysJustPressed.forEach((key) => {
      activeKeys.add(key);
      game2.gameObjects.forEach((obj) => obj.onKeyPress(key));
    });
    keysJustReleased.forEach((key) => {
      activeKeys.delete(key);
      game2.gameObjects.forEach((obj) => obj.onKeyRelease(key));
    });
    keysJustPressed.clear();
    keysJustReleased.clear();
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/images.ts
  var ImageAsset = class {
    constructor(path) {
      this.path = path;
    }
  };
  var loadImages = (imageAssets, baseUrl) => {
    Object.values(imageAssets).forEach((imageAsset) => {
      const image = new Image();
      image.src = baseUrl + imageAsset.path;
      image.onload = () => {
        imageAsset.image = image;
      };
      assetsDiv.appendChild(image);
    });
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
    constructor() {
      this.options = defaultOptions;
      this.gameObjects = [];
      this.t = 0;
      this.setOptions(defaultOptions);
    }
    setOptions(options) {
      this.options = {
        ...this.options,
        ...options
      };
      canvasElement.width = this.options.width * this.options.scale;
      canvasElement.height = this.options.height * this.options.scale;
      ctx.scale(this.options.scale, this.options.scale);
    }
    __maybeSort() {
      if (!this.options.zSort)
        return;
      let shouldSort = false;
      for (let i = 0; i < this.gameObjects.length; i++) {
        if (this.gameObjects[i].__changed) {
          shouldSort = true;
          break;
        }
      }
      if (shouldSort) {
        this.gameObjects.sort((a, b) => a.__zIndex - b.__zIndex);
        this.gameObjects.forEach((o) => o.__changed = false);
      }
    }
    __step() {
      this.__maybeSort();
      handleInput(this);
      drawClear();
      this.gameObjects.forEach((object) => object.draw(this.t));
      this.gameObjects.forEach((object) => object.step());
      this.t++;
    }
    addGameObject(object) {
      this.gameObjects.push(object);
    }
    removeGameObject(object) {
      removeFromArray(this.gameObjects, object);
    }
    setImageAssets(imageAssets) {
      this.imageAssets = imageAssets;
      loadImages(this.imageAssets, this.options.baseUrl);
    }
    play() {
      if (!this.imageAssets) {
        console.warn(
          "Game has no image assets! Use game.setImageAssets() before calling game.play()"
        );
      }
      const interval = 1e3 / this.options.fps;
      let timePrev = 0;
      const gameLoop = (time) => {
        requestAnimationFrame(gameLoop);
        const delta = time - timePrev;
        if (delta > interval) {
          timePrev = time - delta % interval;
          this.__step();
        }
      };
      gameLoop(0);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/gameObject.ts
  var GameObject = class {
    constructor() {
      this.__changed = true;
      this.__zIndex = 0;
    }
    step() {
    }
    draw(_t) {
    }
    onKeyPress(_ev) {
    }
    onKeyRelease(_ev) {
    }
    setZIndex(zIndex) {
      this.__zIndex = zIndex;
      this.__changed = true;
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/engine/position.ts
  var Vec2 = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(pos) {
      return new Vec2(this.x + pos.x, this.y + pos.y);
    }
    snap(gridSize) {
      return new Vec2(
        Math.round(this.x / gridSize) * gridSize,
        Math.round(this.y / gridSize) * gridSize
      );
    }
    copy() {
      return new Vec2(this.x, this.y);
    }
  };
  var PositionObject = class extends GameObject {
    constructor(x, y) {
      super();
      this.pos = new Vec2(x, y);
      this.setZIndex(y);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/objects/player.ts
  var size = 16;
  var Player = class extends PositionObject {
    constructor(x, y) {
      super(x, y);
      this.speed = 10;
      this.image = ImageAssets.player;
      this.target = this.pos.copy();
    }
    draw() {
      drawImage(this.image, this.pos);
    }
    step() {
      const snapped = this.pos.snap(size);
      if (Input.key("w"))
        this.target.y = snapped.y - size;
      if (Input.key("a"))
        this.target.x = snapped.x - size;
      if (Input.key("s"))
        this.target.y = snapped.y + size;
      if (Input.key("d"))
        this.target.x = snapped.x + size;
      this.pos.x += Math.sign(this.target.x - this.pos.x);
      this.pos.y += Math.sign(this.target.y - this.pos.y);
      this.setZIndex(this.pos.y + size);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/objects/rectangleObject.ts
  var RectangleSinObject = class extends PositionObject {
    constructor(x, y, width, height) {
      super(x, y);
      this.x0 = x;
      this.width = width;
      this.height = height;
      this.setZIndex(this.pos.y + this.height);
    }
    draw(t) {
      this.pos.x = this.x0 + Math.sin(t / 40) * 100;
      drawRect(this.pos.x, this.pos.y, this.width, this.height);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/deno-game-engine/src/main.ts
  var game = new Game();
  var ImageAssets = {
    player: new ImageAsset("player.png")
  };
  game.setOptions({
    width: 480,
    height: 320,
    scale: 2,
    fps: 60,
    baseUrl: "./docs/games/test/"
  });
  game.setImageAssets(ImageAssets);
  game.addGameObject(new RectangleSinObject(10, 10, 50, 50));
  game.addGameObject(new RectangleSinObject(100, 250, 50, 50));
  game.addGameObject(new Player(100, 250));
  game.play();
})();
