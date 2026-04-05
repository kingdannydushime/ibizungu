import 'phaser';
import { GameLogic, Card, Suit, Value } from '../logic/GameLogic';

export class GameScene extends Phaser.Scene {
    private logic: GameLogic;
    private playerHand: Card[] = [];
    private iyatotseCard: Card | null = null;
    private cardsGroup: Phaser.GameObjects.Group;

    constructor() {
        super('GameScene');
        this.logic = new GameLogic();
    }

    create() {
        const { width, height } = this.scale;

        // Table de poker verte réaliste
        this.add.ellipse(width / 2, height / 2, width * 0.8, height * 0.7, 0x1B4D3E)
            .setStrokeStyle(15, 0x5D4037); // Bordure bois sombre

        // Affichage du titre
        this.add.text(width / 2, 40, 'Table IbIZUNGU', { fontSize: '32px', color: '#D4AF37' }).setOrigin(0.5);

        // Simulation de distribution (par exemple 6 cartes pour 4 joueurs)
        this.simulateDistribution(6);

        // Bouton de simulation
        const simBtn = this.add.text(100, 50, 'SIMULER VETO/KURONGORA', { color: '#00ff00', fontSize: '18px' })
            .setInteractive({ useHandCursor: true })
            .on('pointerdown', () => this.runSimulation());
    }

    private runSimulation() {
        console.log("Démarrage de la simulation IbIZUNGU...");
        
        // 1. TEST VETO (Individuel/Couleur)
        const vetoHand: Card[] = [
            { suit: Suit.HEARTS, value: Value.AS },
            { suit: Suit.HEARTS, value: Value.SEVEN },
            { suit: Suit.HEARTS, value: Value.KING },
            { suit: Suit.HEARTS, value: Value.JACK }
        ];
        const hasVeto = this.logic.checkVeto(vetoHand);
        console.log("Résultat Test Veto (Même couleur) :", hasVeto ? "SUCCÈS (Gagné!)" : "ÉCHEC");

        // 2. TEST KURONGORA (Défaite de l'équipe)
        // On suppose que l'atout est COEUR
        (this.logic as any).iyatotse = Suit.HEARTS; 
        const teamTrick: Card[] = [
            { suit: Suit.HEARTS, value: Value.AS },    // Joueur A (Partenaire 1)
            { suit: Suit.HEARTS, value: Value.SEVEN }, // Joueur B (Partenaire 2)
            { suit: Suit.CLUBS, value: Value.KING }    // Autre joueur
        ];
        const isKurongora = this.logic.checkKurongora(teamTrick);
        console.log("Résultat Test Kurongora (As+7 Atout même pli) :", isKurongora ? "DÉFAITE ÉQUIPE (KURONGORA!)" : "OK");
        
        if (isKurongora) alert("KURONGORA ! Votre équipe a perdu immédiatement.");
        if (hasVeto) alert("VETO ! Vous avez gagné avant même de commencer.");
    }

    private simulateDistribution(count: number) {
        // En vrai, ces cartes viendraient du serveur ou d'un Deck mélangé
        const suits = Object.values(Suit);
        const values = Object.values(Value);
        
        for (let i = 0; i < count; i++) {
            this.playerHand.push({
                suit: suits[Math.floor(Math.random() * suits.length)],
                value: values[Math.floor(Math.random() * values.length)]
            });
        }

        // Affichage des cartes du joueur (bas de l'écran)
        this.renderPlayerHand();
    }

    private showIyatotse() {
        // On tire une carte de la main du joueur 1 pour définir l'atout
        this.iyatotseCard = this.logic.setIyatotseFromHand(this.playerHand);
        
        const { width, height } = this.scale;
        this.add.text(width / 2, height / 2 - 50, 'COULEUR FORTE (IYATOTSE)', { fontSize: '20px', color: '#D4AF37' }).setOrigin(0.5);
        
        const cardDisplay = this.add.container(width / 2, height / 2 + 20);
        const cardBg = this.add.rectangle(0, 0, 100, 140, 0xffffff).setStrokeStyle(2, 0x000000);
        const cardText = this.add.text(0, 0, `${this.iyatotseCard.value}\n${this.iyatotseCard.suit}`, {
            fontSize: '32px',
            color: (this.iyatotseCard.suit === Suit.HEARTS || this.iyatotseCard.suit === Suit.DIAMONDS) ? '#ff0000' : '#000000',
            align: 'center'
        }).setOrigin(0.5);
        
        cardDisplay.add([cardBg, cardText]);
    }

    private renderPlayerHand() {
        const { width, height } = this.scale;
        const startX = width / 2 - (this.playerHand.length * 60) / 2;
        
        this.playerHand.forEach((card, index) => {
            const cardX = startX + (index * 70);
            const cardY = height - 100;
            
            const cardContainer = this.add.container(cardX, cardY);
            const cardBg = this.add.rectangle(0, 0, 60, 90, 0xffffff).setStrokeStyle(1, 0x000000).setInteractive({ useHandCursor: true });
            
            const cardText = this.add.text(0, 0, `${card.value}${card.suit}`, {
                fontSize: '20px',
                color: (card.suit === Suit.HEARTS || card.suit === Suit.DIAMONDS) ? '#ff0000' : '#000000'
            }).setOrigin(0.5);
            
            cardContainer.add([cardBg, cardText]);

            // Animation au survol
            cardBg.on('pointerover', () => cardContainer.setY(cardY - 20));
            cardBg.on('pointerout', () => cardContainer.setY(cardY));
            
            // Logique de jeu (clic pour jouer)
            cardBg.on('pointerdown', () => {
                console.log(`Joué: ${card.value}${card.suit}`);
                // TODO: Envoyer l'action au serveur
            });
        });
    }
}
