import 'phaser';
import { StorageManager } from '../../api/StorageManager';

export class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    preload() {
        // Chargement des assets de base
        this.load.setBaseURL('/assets/');
        // TODO: Ajouter les vrais assets images ici
    }

    async create() {
        const { width, height } = this.scale;

        // Vérification du profil
        let profile = await StorageManager.getProfile();
        if (!profile) {
            const pseudo = prompt("Bienvenue sur IbIZUNGU ! Entre ton pseudo (unique et définitif) :");
            if (pseudo) {
                await StorageManager.saveProfile(pseudo);
                profile = await StorageManager.getProfile();
            }
        }

        // Background sombre luxe
        this.add.rectangle(0, 0, width, height, 0x0a0a0a).setOrigin(0);
        
        // Affichage Solde DDK permanent
        this.add.text(20, 20, `Solde: ${profile?.ddk || 0} DDK`, {
            fontSize: '24px',
            color: '#D4AF37',
            fontFamily: 'Arial'
        });

        // Titre IbIZUNGU
        this.add.text(width / 2, 120, 'IbIZUNGU', {
            fontSize: '84px',
            color: '#D4AF37',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // --- BOUTONS PRINCIPAUX ---
        this.createButton(width / 2, 280, 'JOUER', () => this.scene.start('GameScene'));
        this.createButton(width / 2, 360, 'HISTORIQUE', () => alert('Historique bientôt disponible'));
        this.createButton(width / 2, 440, 'ACHETER DDK', () => this.scene.start('ShopScene'));

        // --- BOUTONS SPÉCIAUX (HAUT À DROITE) ---
        this.createSmallButton(width - 150, 50, 'GAGNER ARGENT', 0xD4AF37, () => {
            alert("Tu peux échanger 10 000 DDK pour 50 000 FBU sur ton Lumicash.");
        });
        
        this.createSmallButton(width - 150, 110, 'ENVOYER DDK', 0xffffff, () => {
            alert("Génération du QR Code pour envoyer 50 DDK...");
        });

        // Crédit Danny King
        this.add.text(width / 2, height - 50, 'Uyu mukino wakozwe na Danny King', {
            fontSize: '18px',
            color: '#D4AF37',
            fontStyle: 'italic'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true }).on('pointerdown', () => {
            alert("Règles: As > 7 > K > J > Q > 6.\nVeto: Même couleur.\nKurongora: As+7 de l'atout.");
        });
    }

    private createSmallButton(x: number, y: number, text: string, color: number, callback: () => void) {
        const btn = this.add.container(x, y);
        const rect = this.add.rectangle(0, 0, 220, 40, 0x000000).setStrokeStyle(2, color).setInteractive({ useHandCursor: true });
        const txt = this.add.text(0, 0, text, { fontSize: '16px', color: color.toString(16) }).setOrigin(0.5);
        btn.add([rect, txt]);
        rect.on('pointerdown', callback);
    }

    private createButton(x: number, y: number, text: number | string, callback: () => void) {
        const btn = this.add.container(x, y);
        
        const rect = this.add.rectangle(0, 0, 240, 60, 0x1B4D3E)
            .setStrokeStyle(3, 0xD4AF37)
            .setInteractive({ useHandCursor: true });
            
        const txt = this.add.text(0, 0, text.toString(), {
            fontSize: '28px',
            color: '#D4AF37',
            fontFamily: 'Arial'
        }).setOrigin(0.5);
        
        btn.add([rect, txt]);
        
        rect.on('pointerdown', callback);
        
        // Effets hover
        rect.on('pointerover', () => rect.setFillStyle(0x2B6D4E));
        rect.on('pointerout', () => rect.setFillStyle(0x1B4D3E));
        
        return btn;
    }
}
