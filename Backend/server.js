const { addEarning } = require("./api/api");
const express = require("express");
const views = __dirname + "/build";
const dotenv = require("dotenv");
const path =require("path")

const app = express();
const cors = require("cors");
const corsOptions = {
  origin: "http://159.203.166.246:3000 https://battle.sol-btc.xyz",
  credentials: true, //access-control-allow-credentials:true
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));
// app.use(express.static(views));

app.use(express.static(path.join(__dirname, 'build')));

app.get('*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.use(express.json());
dotenv.config();
const server = require("http").createServer(app);
const connectDB = require("./config/db");
const io = require("socket.io")(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//db connection

connectDB();

app.use("/api/users", require("./routes/api/users"));

// gaming

//
let mines = [];
let mine_damage = 20;

const NUCLEAR = 0;
const FREEZE = 1;
const BULLET_1 = 2;
const BULLET_2 = 3;
const BULLET_3 = 4;

const POWER_NUCLEAR = 30;
//
/*
item 
  x,
  y,
  time,
  r,
  id,
  type,
*/
let items = [];

let removedItem = [];
// let teams = [];

let gameLog = [];
let _hp = 10,
  _speed = 5,
  _reload = 80;
_power = 0.5;

let initialReloading = 800;
let initialSpeed = 100;
let initialHp = 30;
let initialPower = 3;

const config = [
  {
    hp: initialHp + 6 * _hp,
    speed: initialSpeed + _speed * 3,
    reloading: initialReloading - _reload * 4,
    power: initialPower + _power * 5,
  },
  {
    hp: initialHp + 4 * _hp,
    speed: initialSpeed + _speed * 5,
    reloading: initialReloading - _reload * 5,
    power: initialPower + _power * 3,
  },

  {
    hp: initialHp + 5 * _hp,
    speed: initialSpeed + _speed * 4,
    reloading: initialReloading - _reload * 5,
    power: initialPower + _power * 5,
  },
  {
    hp: initialHp + 4 * _hp,
    speed: initialSpeed + _speed * 6,
    reloading: initialReloading - _reload * 5,
    power: initialPower + _power * 5,
  },
  {
    hp: initialHp + 5 * _hp,
    speed: initialSpeed + _speed * 4,
    reloading: initialReloading - _reload * 4,
    power: initialPower + _power * 6,
  },
  {
    hp: initialHp + 3 * _hp,
    speed: initialSpeed + _speed * 6,
    reloading: initialReloading - _reload * 6,
    power: initialPower + _power * 4,
  },
];
let players = {};
let map = [];
let mapArray = [];
for (let i = 0; i < 100; i++) {
  let w, h;
  let r = Math.random();
  if (r >= 0.7) {
    w = 1;
    h = Math.floor(Math.random() * 7) + 3;
  } else if (r >= 0.4) {
    h = 1;
    w = Math.floor(Math.random() * 7) + 3;
  } else if (r >= 0.2) {
    w = h = 1;
  } else if (r >= 0.1) {
    w = 1;
    h = 7;
  } else {
    w = 10;
    h = 1;
  }
  let x = Math.floor(Math.random() * 50 + (i % 10) * 500);
  let y = Math.floor(Math.random() * 50 + (i / 10) * 500);
  map.push({
    x: x,
    y: y,
    w: w,
    h: h,
  });
}

// console.log(map);
const getRandom = () => {
  return { x: Math.random() * 4500 + 50, y: Math.random() * 4500 + 50 };
};

const addLog = (newLog) => {
  if (gameLog.length == 5) {
    gameLog.pop();
  }
  gameLog.unshift(newLog);
};

// remove mine

const removeMine = (data) => {
  for (let i = 0; i < mines.length; i++) {
    if (
      data.x == mines[i].x &&
      data.y == mines[i].y &&
      data.team == mines[i].team
    ) {
      mines.splice(i, 1);
      break;
    }
  }
};
const PORT = process.env.PORT || 9031;
server.listen(PORT, () => console.log(`Server started on port ${PORT}`));

io.on("connection", (socket) => {
  const nuclearAttack = (attacker) => {
    Object.keys(players).forEach((player) => {
      console.log("nuclear---", players[player], players[attacker]);
      if (players[player].team != players[attacker].team) {
        if (players[player].config.hp > 0) {
          players[player].config.hp -= POWER_NUCLEAR;
          if (players[player].config.hp < 0) {
            players[player].config.hp = 0;
            if (players[attacker] != undefined) {
              addLog(
                `${players[attacker].name} has killed ${players[player].name}`
              );

              // console.log(players[attacker].userId);
              addEarning(players[attacker].userId);
            } else {
              addLog(`${players[player].name} has been killed`);
            }

            socket.emit("killEnemy", data.attacker);
            socket.broadcast.emit("killEnemy", attacker);
            socket.emit("deletePlayer", players[player]);
            socket.broadcast.emit("deletePlayer", players[player]);
            socket.emit("newLog", gameLog);
            socket.broadcast.emit("newLog", gameLog);
          } else {
            socket.emit("playerMoved", players[player]);
            socket.broadcast.emit("playerMoved", players[player]);
          }
        }
      }
    });
  };

  const damageEnemy = (data, power) => {
    try {
      console.log("---", data), players[data.attacker];
      // socket.broadcast.emit("mineExplosion", data);

      if (players[data.enemy].config.hp <= 0) return;

      players[data.enemy].config.hp -= power;
      if (players[data.enemy].config.hp <= 0) {
        players[data.enemy].config.hp = 0;

        if (players[data.attacker] != undefined) {
          addLog(
            `${players[data.attacker].name} has killed ${
              players[data.enemy].name
            }`
          );

          // console.log(players[data.attacker].userId);
          addEarning(players[data.attacker].userId);
        } else {
          addLog(`${players[data.enemy].name} has been killed`);
        }
        // socket.emit("killed");
        socket.emit("killEnemy", data.attacker);
        socket.broadcast.emit("killEnemy", data.attacker);
        socket.emit("deletePlayer", players[data.enemy]);
        socket.broadcast.emit("deletePlayer", players[data.enemy]);
        socket.emit("newLog", gameLog);
        socket.broadcast.emit("newLog", gameLog);

        // dropItem();
        // delete players[data.enemy];
      } else {
        socket.emit("playerMoved", players[data.enemy]);
        socket.broadcast.emit("playerMoved", players[data.enemy]);
      }
    } catch (err) {}
  };
  const dropItem = () => {
    let item = {
      id: 0,
      config: {
        x: Math.random() * 5000 + 25,
        y: Math.random() * 5000 + 25,
        r: 200,
        time: 6000,
      },
      type: NUCLEAR,
    };
    console.log(item.config);
    item.id = items.length;
    if (removedItem.length > 0) {
      item.id = removedItem.pop();
    }
    items.push(item);
    socket.emit("newItem", item);
    socket.broadcast.emit("newItem", item);
  };

  const loadItem = () => {
    socket.emit("loadItem", items);
  };

  // setInterval(() => {
  //   dropItem();
  // }, 30000);

  socket.emit("gameConnected");

  socket.on("mapLoad", () => {
    socket.emit("map", map);
    socket.emit("map");
    socket.emit("loadMine", mines);
  });
  socket.on("upgrade", (data) => {
    players[data.id].name = data.name;
    socket.broadcast.emit("upgrade", { id: data.id, name: data.name });
  });

  //ITEM

  socket.on("nuclear", (attacker) => {
    console.log(attacker);
    nuclearAttack(attacker);
  });
  socket.on("getItem", (id, type) => {
    removedItem.push(id);
    for (let i = 0; i < items.length; i++) {
      if (items.id == id) {
        items.splice(i, 1);
        break;
      }
    }
    socket.emit("removeItem", id);
    socket.broadcast.emit("removeItem", id);
  });
  socket.on("registerTank", (data) => {
    console.log("register", data);
    players[socket.id] = {
      x: Math.random() * 4500 + 50,
      y: Math.random() * 4500 + 50,
      direction: Math.floor(Math.random() * 3) * 90,
      playerId: socket.id,
      type: data.type,
      config: { ...config[data.type - 1] },
      name: data.name,
      team: data.team,
      userId: data.userId,
    };
    console.log(data.name, " --- connected");
    // console.log("registerTank", players[socket.id], type);
    socket.broadcast.emit("newPlayer", players[socket.id]);
    socket.emit("currentPlayers", players);
    addLog(`${data.name} connected `);
    socket.broadcast.emit("newLog", gameLog);
    socket.emit("newLog", gameLog);
  });

  socket.on("playerMovement", (movement) => {
    try {
      players[socket.id].x = movement.x;
      players[socket.id].y = movement.y;
      players[socket.id].direction = movement.direction;
      players[socket.id].config.hp = movement.hp;
      socket.broadcast.emit("playerMoved", players[socket.id]);
    } catch (err) {}
  });

  socket.on("disconnect", () => {
    try {
      console.log("disconnected", socket.id);
      socket.broadcast.emit("deletePlayer", players[socket.id]);
      // addLog(`${players[socket.id].name} has left the game`);
      // socket.broadcast.emit("newLog", gameLog);
      delete players[socket.id];
    } catch (err) {}
  });
  socket.on("collision", (player) => {
    // console.log(player);
    try {
      players[player.playerId].x = player.x;
      players[player.playerId].y = player.y;
      players[player.playerId].direction = player.direction;
      socket.broadcast.emit("playerMoved", players[player.playerId]);
    } catch (err) {}
  });
  socket.on("bulletFired", (bulletData) => {
    socket.broadcast.emit("bulletFired", bulletData);
  });

  socket.on("hitEnemy", (data) => {
    damageEnemy(data, data.power);
  });

  socket.on("hitMine", (data) => {
    removeMine(data);
    damageEnemy(data, mine_damage);
  });
  socket.on("mine", (data) => {
    mines.push(data);
    socket.broadcast.emit("mine", data);
  });
  socket.on("mineDstroy", (mineItem) => {
    removeMine(data);
    socket.broadcast.emit("mineDestroy", mineItem);
  });
});
