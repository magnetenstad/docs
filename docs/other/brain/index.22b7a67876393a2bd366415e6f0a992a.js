(() => {
  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/arrays.ts
  var removeFromArray = (array, item) => {
    const index = array.indexOf(item);
    if (index > -1) {
      array.splice(index, 1);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/dom.ts
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

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/draw.ts
  var drawRect = (x, y, w, h) => {
    ctx.fillStyle = "white";
    ctx.fillRect(x, y, w, h);
  };
  var drawClear = () => {
    ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  };
  var drawText = (text, x, y, color = "white", size = 20) => {
    ctx.save();
    ctx.font = `${size}px arial`;
    ctx.fillStyle = color;
    ctx.fillText(text, x, y);
    ctx.restore();
  };
  var drawArrow = (from, to, width = 2, color = "white") => {
    const headlen = 10;
    const fromx = from.x;
    const fromy = from.y;
    const tox = to.x;
    const toy = to.y;
    const angle = Math.atan2(toy - fromy, tox - fromx);
    ctx.save();
    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(fromx, fromy);
    ctx.lineTo(tox, toy);
    ctx.lineWidth = width;
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );
    ctx.lineTo(
      tox - headlen * Math.cos(angle + Math.PI / 7),
      toy - headlen * Math.sin(angle + Math.PI / 7)
    );
    ctx.lineTo(tox, toy);
    ctx.lineTo(
      tox - headlen * Math.cos(angle - Math.PI / 7),
      toy - headlen * Math.sin(angle - Math.PI / 7)
    );
    ctx.stroke();
    ctx.restore();
  };
  var drawOutline = (x, y, w, h) => {
    ctx.save();
    ctx.strokeStyle = "#666666";
    ctx.strokeRect(x, y, w, h);
    ctx.restore();
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/events.ts
  var keysJustPressed = /* @__PURE__ */ new Set();
  var keysJustReleased = /* @__PURE__ */ new Set();
  var activeKeys = /* @__PURE__ */ new Set();
  document.addEventListener("keydown", (ev) => {
    keysJustPressed.add(ev.key.toLowerCase());
  });
  document.addEventListener("keyup", (ev) => {
    keysJustReleased.add(ev.key.toLowerCase());
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

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/images.ts
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

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/game.ts
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

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/gameObject.ts
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

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/objects/emitter.ts
  var Emitter = class extends GameObject {
    constructor(interval, func) {
      super();
      this.emitPrev = 0;
      this.interval = interval;
      this.func = func;
    }
    step() {
      const now = new Date().getTime();
      if (now - this.emitPrev > this.interval && globalInput.autoEmit) {
        this.func();
        this.emitPrev = now;
      }
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/position.ts
  var Vec2 = class {
    constructor(x, y) {
      this.x = x;
      this.y = y;
    }
    add(pos) {
      return new Vec2(this.x + pos.x, this.y + pos.y);
    }
    addX(dx) {
      return new Vec2(this.x + dx, this.y);
    }
    addY(dy) {
      return new Vec2(this.x, this.y + dy);
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
    lengthTo(pos) {
      return Math.sqrt((this.x - pos.x) ** 2 + (this.y - pos.y) ** 2);
    }
  };
  var PositionObject = class extends GameObject {
    constructor(x, y) {
      super();
      this.pos = new Vec2(x, y);
      this.setZIndex(y);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/engine/time.ts
  var sleep = (ms) => new Promise((r) => setTimeout(r, ms));

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/objects/textObject.ts
  var TextObject = class extends PositionObject {
    constructor(text, x, y, preScript = (oldData, newData) => Object.assign(oldData, newData), postScript = (data) => data) {
      super(x, y);
      this.data = {};
      this.arrowTo = [];
      this.sentPrev = "";
      this.text = text;
      this.preScript = preScript;
      this.postScript = postScript;
    }
    draw(_t) {
      this.arrowTo.forEach((other) => {
        drawArrow(this.pos.addX(64), other.pos.addX(-16), 2, "#333333");
      });
      drawText(this.text, this.pos.x, this.pos.y);
      drawText(
        JSON.stringify(this.postScript(this.data)),
        this.pos.x,
        this.pos.y + 16,
        "#AAAAAA",
        16
      );
    }
    step() {
      if (this.target) {
        this.pos.x += (this.target.pos.x - this.pos.x) * 0.04;
        this.pos.y += (this.target.pos.y - this.pos.y) * 0.04;
        if (this.pos.lengthTo(this.target.pos) < 10) {
          this.target.receiveData(this.data);
          game.removeGameObject(this);
        }
      }
    }
    async receiveData(data) {
      this.data = this.preScript(this.data, data);
      await sleep(500);
      const dataToSend = this.postScript(this.data);
      const sendString = JSON.stringify(dataToSend);
      if (sendString == this.sentPrev)
        return;
      this.sentPrev = sendString;
      for (let i = 0; i < this.arrowTo.length; i++) {
        const other = this.arrowTo[i];
        const text = new TextObject("", this.pos.x, this.pos.y);
        text.data = dataToSend;
        text.target = other;
        game.addGameObject(text);
      }
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/objects/globalInput.ts
  var GlobalInput = class extends GameObject {
    constructor() {
      super(...arguments);
      this.keys = "";
      this.autoEmit = false;
    }
    onKeyPress(key) {
      if (key == "q") {
        this.autoEmit = !this.autoEmit;
        game.gameObjects.forEach((obj) => {
          if (obj instanceof TextObject) {
            obj.data = {};
          }
        });
        return;
      }
      if (!isNaN(+key)) {
        if (this.keys.length == 0)
          return;
        const all = Object.keys(emitters);
        const filtered = [];
        for (let j = 0; j < all.length; j++) {
          if (all[j].substring(0, this.keys.length) === this.keys) {
            filtered.push(all[j]);
          }
        }
        filtered.forEach((name) => {
          emitters[name].func(Number(key));
        });
        this.keys = "";
      } else if (key.length == 1) {
        this.keys += key;
      } else {
        this.keys = "";
      }
    }
    draw(_t) {
      if (!this.autoEmit) {
        drawRect(10, 10, 20, 20);
      }
      drawText(this.keys, 40, 30);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/objects/outline.ts
  var Outline = class extends GameObject {
    constructor(around, header = "") {
      super();
      this.around = [];
      this.header = "";
      this.around = around;
      this.header = header;
    }
    draw() {
      const minX = Math.min(...this.around.map((o) => o.pos.x));
      const minY = Math.min(...this.around.map((o) => o.pos.y));
      const maxX = Math.max(...this.around.map((o) => o.pos.x));
      const maxY = Math.max(...this.around.map((o) => o.pos.y));
      drawText(this.header, minX, minY - 50, "#AAAAAA");
      drawOutline(minX - 20, minY - 40, maxX - minX + 200, maxY - minY + 80);
    }
  };

  // deno:file:///C:/Users/tenst/Documents/GitHub/web-game-engine/src/main.ts
  var game = new Game();
  var ImageAssets = {};
  game.setOptions({
    width: 1e3,
    height: 600,
    scale: 2,
    fps: 60
  });
  game.setImageAssets(ImageAssets);
  var globalInput = new GlobalInput();
  game.addGameObject(globalInput);
  var texts = {
    apeople: new TextObject("Antall personer A", 50, 100),
    anoise: new TextObject("St\xF8y A", 50, 200),
    xpeople: new TextObject("Antall personer", 350, 150),
    bpeople: new TextObject("Antall personer B", 50, 400),
    bnoise: new TextObject("St\xF8y B", 50, 500),
    xnoise: new TextObject("St\xF8y", 350, 450),
    room: new TextObject(
      "Anbefalt arbeidsrom",
      550,
      300,
      (oldData, newData) => {
        for (const key of Object.keys(newData)) {
          oldData[key] = Object.assign(oldData[key] ?? {}, newData[key]);
        }
        return oldData;
      },
      (data) => {
        let roomName = "";
        let maxValue = -Infinity;
        for (const key of Object.keys(data)) {
          const roomObj = data[key];
          let value = 20;
          if ("noise" in roomObj) {
            value -= roomObj.noise;
          }
          if ("people" in roomObj) {
            value -= roomObj.people;
          }
          if (value > maxValue) {
            maxValue = value;
            roomName = key;
          }
        }
        return roomName ? { room: roomName } : {};
      }
    ),
    user1: new TextObject("Bruker 1", 800, 300),
    user2: new TextObject("Bruker 2", 800, 450),
    app: new TextObject("St\xF8yApp", 550, 500),
    cantine: new TextObject("Kantine", 550, 100, (_, newData) => {
      let result = 0;
      Object.values(newData).forEach((v) => result += v.people ?? 0);
      return { cinnamonBuns: result * 2 };
    })
  };
  texts.apeople.arrowTo.push(texts.xpeople);
  texts.anoise.arrowTo.push(texts.xnoise);
  texts.xpeople.arrowTo.push(texts.room);
  texts.bpeople.arrowTo.push(texts.xpeople);
  texts.bnoise.arrowTo.push(texts.xnoise);
  texts.xnoise.arrowTo.push(texts.room);
  texts.room.arrowTo.push(texts.user1);
  texts.room.arrowTo.push(texts.user2);
  texts.xnoise.arrowTo.push(texts.app);
  texts.xpeople.arrowTo.push(texts.cantine);
  var outlineA = new Outline([texts.anoise, texts.apeople], "Rom A");
  var outlineB = new Outline([texts.bnoise, texts.bpeople], "Rom B");
  game.addGameObject(outlineA);
  game.addGameObject(outlineB);
  var emitInterval = 1e4;
  var emitters = {
    apeople: new Emitter(
      emitInterval,
      (value) => texts.apeople.receiveData({
        A: { people: value ?? Math.round(Math.random() * 10) }
      })
    ),
    anoise: new Emitter(
      emitInterval,
      (value) => texts.anoise.receiveData({
        A: { noise: value ?? Math.round(Math.random()) }
      })
    ),
    bpeople: new Emitter(
      emitInterval,
      (value) => texts.bpeople.receiveData({
        B: { people: value ?? Math.round(Math.random() * 10) }
      })
    ),
    bnoise: new Emitter(
      emitInterval,
      (value) => texts.bnoise.receiveData({
        B: { noise: value ?? Math.round(Math.random()) }
      })
    )
  };
  Object.values(texts).forEach((text) => {
    game.addGameObject(text);
  });
  Object.values(emitters).forEach((emitter) => {
    game.addGameObject(emitter);
  });
  game.play();
})();
