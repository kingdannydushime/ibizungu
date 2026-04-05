const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

let players = {};
let gameState = {
    turn: 0,
    deck: [],
    table: [],
    iyatotse: null
};

io.on('connection', (socket) => {
    console.log(`Un joueur s'est connecté : ${socket.id}`);

    // Rejoindre une partie
    socket.on('join_game', (data) => {
        players[socket.id] = {
            id: socket.id,
            pseudo: data.pseudo,
            ddk: data.ddk || 1000,
            hand: []
        };
        io.emit('player_list_update', Object.values(players));
    });

    // Gestion du tour par tour
    socket.on('play_card', (card) => {
        console.log(`${players[socket.id]?.pseudo} joue ${card.value}${card.suit}`);
        // Logique de validation et passage au tour suivant
        io.emit('card_played', { player: players[socket.id], card });
    });

    socket.on('disconnect', () => {
        console.log(`Joueur déconnecté : ${socket.id}`);
        delete players[socket.id];
        io.emit('player_list_update', Object.values(players));
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Serveur de jeu IbIZUNGU actif sur le port ${PORT}`);
});
