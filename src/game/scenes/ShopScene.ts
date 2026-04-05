import 'phaser';
import { LumicashOCR } from '../../api/LumicashOCR';

export class ShopScene extends Phaser.Scene {
    constructor() {
        super('ShopScene');
    }

    create() {
        const { width, height } = this.scale;

        // Background thème luxe/banque
        this.add.rectangle(0, 0, width, height, 0x050505).setOrigin(0);
        
        this.add.text(width / 2, 80, 'BANQUE IbIZUNGU', {
            fontSize: '48px',
            color: '#D4AF37',
            fontFamily: 'Arial Black'
        }).setOrigin(0.5);

        // Zone de retrait DDK -> Lumicash
        this.createSection(width / 4, height / 2, 'RETRAIT (FBU)', 'Convertir 10 000 DDK\nen 50 000 FBU', () => {
            this.handleWithdraw();
        });

        // Zone de dépôt Lumicash -> DDK
        this.createSection(3 * width / 4, height / 2, 'DÉPÔT (DDK)', 'Scanner une preuve\nde paiement Lumicash', () => {
            this.handleDeposit();
        });

        // Bouton Retour
        const backBtn = this.add.text(width / 2, height - 80, '< RETOUR AU MENU', {
            fontSize: '24px',
            color: '#D4AF37'
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });
        
        backBtn.on('pointerdown', () => this.scene.start('MainMenu'));
    }

    private createSection(x: number, y: number, title: string, desc: string, callback: () => void) {
        const container = this.add.container(x, y);
        
        const rect = this.add.rectangle(0, 0, 300, 350, 0x1B4D3E)
            .setStrokeStyle(4, 0xD4AF37)
            .setInteractive({ useHandCursor: true });
            
        const titleTxt = this.add.text(0, -120, title, { fontSize: '28px', color: '#D4AF37', fontStyle: 'bold' }).setOrigin(0.5);
        const descTxt = this.add.text(0, -20, desc, { fontSize: '20px', color: '#fff', align: 'center' }).setOrigin(0.5);
        const actionTxt = this.add.text(0, 100, 'SÉLECTIONNER', { fontSize: '24px', color: '#D4AF37', fontStyle: 'bold' }).setOrigin(0.5);
        
        container.add([rect, titleTxt, descTxt, actionTxt]);
        
        rect.on('pointerdown', callback);
        rect.on('pointerover', () => rect.setFillStyle(0x2B6D4E));
        rect.on('pointerout', () => rect.setFillStyle(0x1B4D3E));
    }

    private handleWithdraw() {
        console.log('Action retrait lancée...');
        // TODO: Vérifier le solde de 10 000 DDK et demander le numéro Lumicash
    }

    private async handleDeposit() {
        console.log('Action dépôt lancée : Ouverture sélecteur de fichier/caméra...');
        
        // Simuler une ouverture de fichier (sera géré par Capacitor en natif)
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e: any) => {
            const file = e.target.files[0];
            if (file) {
                this.add.text(this.scale.width / 2, this.scale.height - 150, 'Analyse en cours...', { color: '#D4AF37' }).setOrigin(0.5);
                
                const result = await LumicashOCR.processSMS(file);
                
                if (result.isValid) {
                    alert(`Transaction validée !\nMontant: ${result.amount} FBU\nID: ${result.transactionId}`);
                    // TODO: Mettre à jour le solde DDK de l'utilisateur
                } else {
                    alert('Désolé, impossible de valider cette preuve de paiement.');
                }
            }
        };
        input.click();
    }
}
