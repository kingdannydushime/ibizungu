/**
 * IbIZUNGU Rules Engine - Created by Danny King
 * Gestion de la logique de jeu de cartes locale.
 */

export enum Suit {
    HEARTS = '♥',
    DIAMONDS = '♦',
    CLUBS = '♣',
    SPADES = '♠'
}

export enum Value {
    AS = 'A',
    SEVEN = '7',
    KING = 'K',
    JACK = 'J',
    QUEEN = 'Q',
    SIX = '6'
}

export interface Card {
    suit: Suit;
    value: Value;
}

export class GameLogic {
    private deck: Card[] = [];
    private iyatotse: Suit | null = null;

    constructor() {
        this.initializeDeck();
    }

    private initializeDeck() {
        const suits = Object.values(Suit);
        const values = Object.values(Value);
        for (const suit of suits) {
            for (const value of values) {
                this.deck.push({ suit, value });
            }
        }
    }

    /**
     * Pioche une carte aléatoire du premier joueur pour définir l'Iyatotse (Atout).
     */
    public setIyatotseFromHand(playerHand: Card[]): Card {
        const randomIndex = Math.floor(Math.random() * playerHand.length);
        const selectedReservedCard = playerHand[randomIndex];
        this.iyatotse = selectedReservedCard.suit;
        return selectedReservedCard;
    }

    /**
     * Vérifie la victoire par Veto (toutes les cartes d'une même couleur OU plus d'Ibimari).
     */
    public checkVeto(playerHand: Card[], allPlayersHands?: Card[][]): boolean {
        // 1. Veto de Couleur
        const suitsInHand = playerHand.map(c => c.suit);
        const uniqueSuits = [...new Set(suitsInHand)];
        for (const suit of uniqueSuits) {
            if (playerHand.filter(c => c.suit === suit).length === playerHand.length) return true;
        }

        // 2. Veto individuel par nombre d'Ibimari (si les mains des autres sont fournies)
        if (allPlayersHands) {
            const myIbimari = this.countIbimari(playerHand);
            const othersIbimari = allPlayersHands
                .filter(hand => hand !== playerHand)
                .map(hand => this.countIbimari(hand));
            
            const maxOthers = Math.max(...othersIbimari);
            // Victoire si j'ai STRICTEMENT plus d'Ibimari
            if (myIbimari > maxOthers) return true;
        }

        return false;
    }

    /**
     * Vérifie la défaite Kurongora (As + 7 de l'Iyatotse joués par la même équipe).
     */
    public checkKurongora(cardsPlayedByTeam: Card[]): boolean {
        if (!this.iyatotse) return false;
        const hasAsAtout = cardsPlayedByTeam.some(c => c.suit === this.iyatotse && c.value === Value.AS);
        const hasSevenAtout = cardsPlayedByTeam.some(c => c.suit === this.iyatotse && c.value === Value.SEVEN);
        return hasAsAtout && hasSevenAtout;
    }

    /**
     * Détermine le gagnant en mode GROUPE à la fin de la partie.
     * @param teamIbimari Nombre total d'Ibimari de l'équipe (As + 7)
     * @param teamPoints Points totaux (K=4, J=3, Q=2, 6=0)
     */
    public checkTeamVictory(teamIbimari: number, teamPoints: number): { win: boolean, type: string } {
        // 1. KAPPA : Tous les Ibimari (8)
        if (teamIbimari === 8) {
            return { win: true, type: 'KAPPA' };
        }

        // 2. Victoire Automatique : Plus de 5 Ibimari (6 ou 7)
        if (teamIbimari > 5) {
            return { win: true, type: 'AUTO_IBIMARI' };
        }

        // 3. Exactement 5 Ibimari : Besoin de 10 points ou plus
        if (teamIbimari === 5) {
            return { win: teamPoints >= 10, type: 'FIVE_IBIMARI_POINTS' };
        }

        // 4. Exactement 4 Ibimari : L'équipe avec le plus de points l'emporte
        // Note: La comparaison avec l'autre équipe doit être gérée par l'appelant
        if (teamIbimari === 4) {
            return { win: false, type: 'FOUR_IBIMARI_COMPARE' }; 
        }

        return { win: false, type: 'NONE' };
    }

    /**
     * Détermine le gagnant en mode INDIVIDUEL à la fin de la partie.
     */
    public checkIndividualVictory(players: { hand: Card[], points: number }[]): number {
        // 1. KAPPA : Un joueur a les 8 Ibimari
        for (let i = 0; i < players.length; i++) {
            if (this.countIbimari(players[i].hand) === 8) return i;
        }

        // 2. Victoire par nombre d'Ibimari
        const ibimariCounts = players.map(p => this.countIbimari(p.hand));
        const maxIbimari = Math.max(...ibimariCounts);
        
        const winnersWithMaxIbimari = ibimariCounts
            .map((count, index) => count === maxIbimari ? index : -1)
            .filter(index => index !== -1);

        if (winnersWithMaxIbimari.length === 1) {
            return winnersWithMaxIbimari[0];
        }

        // 3. Égalité d'Ibimari -> Départage par les points
        let bestScore = -1;
        let finalWinner = -1;
        for (const index of winnersWithMaxIbimari) {
            if (players[index].points > bestScore) {
                bestScore = players[index].points;
                finalWinner = index;
            }
        }

        return finalWinner;
    }

    /**
     * Compte le nombre d'Ibimari (As et 7).
     */
    public countIbimari(cards: Card[]): number {
        return cards.filter(c => c.value === Value.AS || c.value === Value.SEVEN).length;
    }

    public getIyatotse(): Suit | null {
        return this.iyatotse;
    }
}
