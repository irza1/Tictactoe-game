import Store from "./store.js";
import View from "./view.js";

const app = {
  $: {
    menu: document.querySelector('[data-id="menu"]'),
    menuBtn: document.querySelector('[data-id="menu-btn"]'),
    menuItem: document.querySelector('[data-id="menu-items"]'),
    resetButton: document.querySelector('[data-id="reset-btn"]'),
    newRoundBtn: document.querySelector('[data-id="new-round-btn"]'),
    square: document.querySelectorAll('[data-id="square"]'),
    modal: document.querySelector('[data-id="modal"]'),
    modalText: document.querySelector('[data-id="modal-text"]'),
    modalBtn: document.querySelector('[data-id="modal-btn"]'),
    turn: document.querySelector('[data-id="turn"]'),
  },
  init() {
    app.registerEvent();
  },

  state: {
    currentPlayer: 1,
    move: [],
  },

  getGameStatus(move) {
    const p1moves = move
      .filter((m) => m.playerid === 1)
      .map((m) => +m.squareId);
    const p2moves = move
      .filter((m) => m.playerid === 2)
      .map((m) => +m.squareId);

    const winningPatterns = [
      [1, 2, 3],
      [1, 5, 9],
      [1, 4, 7],
      [2, 5, 8],
      [3, 5, 7],
      [3, 6, 9],
      [4, 5, 6],
      [7, 8, 9],
    ];

    let winner = null;

    winningPatterns.forEach((patter) => {
      const p1Win = patter.every((v) => p1moves.includes(v));
      const p2Win = patter.every((v) => p2moves.includes(v));

      if (p1Win) winner = 1;
      if (p2Win) winner = 2;
    });

    return {
      status: move.length === 9 || winner != null ? "complete" : "in-progres ",
      winner,
    };
  },

  registerEvent() {
    app.$.menuBtn.addEventListener("click", (event) => {
      app.$.menuItem.classList.toggle("hidden");
    });

    app.$.modalBtn.addEventListener("click", (event) => {
      app.state.move = [];
      app.$.square.forEach((square) => square.replaceChildren());
      app.$.modal.classList.add("hidden");
    });

    app.$.square.forEach((square) => {
      square.addEventListener("click", (event) => {
        // const hasMove = (squareId) => {
        //   const existingMove = app.state.move.find(
        //     (move) => move.squerId === squareId
        //   );
        //   return existingMove !== undefined;
        // };

        if (square.hasChildNodes()) {
          return;
        }

        const lastMove = app.state.move.at(-1);
        const getOppositePlayer = (playerid) => (playerid === 1 ? 2 : 1);
        const currentPlayer =
          app.state.move.length === 0
            ? 1
            : getOppositePlayer(lastMove.playerid);

        const icon = document.createElement("i");
        if (currentPlayer === 1) {
          icon.classList.add("fa-solid", "fa-x", "turquoise");
        } else {
          icon.classList.add("fa-solid", "fa-o", "yellow");
        }

        app.state.move.push({
          squareId: +square.id,
          playerid: currentPlayer,
        });

        square.replaceChildren(icon);

        const game = app.getGameStatus(app.state.move);

        if (game.status === "complete") {
          let message = "";
          app.$.modal.classList.remove("hidden");
          if (game.winner) {
            message = `player ${game.winner} win`;
          } else {
            message = `tie game`;
          }
          app.$.modalText.textContent = message;
        }
      });
    });
  },
};

const players = [
  {
    id: 1,
    name: "Player 1",
    iconClass: "fa-x",
    colorClass: "turquoise",
  },
  {
    id: 2,
    name: "Player 2",
    iconClass: "fa-o",
    colorClass: "yellow",
  },
];

// window.addEventListener("load", app.init);

function init() {
  const view = new View();
  const store = new Store(players);

  view.bindGameResetEvent((event) => {
    view.closeAll();

    store.reset();

    view.clearMove();
    view.setTurnIndicator(store.game.currentPlayer);
  });

  view.bindNewRoundEvent((event) => {
    console.log("new round");
  });

  view.bindPlayerMoveEvent((square) => {
    const existingMove = store.game.moves.find(
      (move) => move.squareId === +square.id
    );

    if (existingMove) {
      return;
    }

    view.handlerPlayerMove(square, store.game.currentPlayer);

    store.playerMove(+square.id);

    if (store.game.status.isComplete) {
      view.openModal(
        store.game.status.winner
          ? `${store.game.status.winner.name} Win!`
          : "Tie game"
      );
      return;
    }

    view.setTurnIndicator(store.game.currentPlayer);
  });
}

window.addEventListener("load", init);
