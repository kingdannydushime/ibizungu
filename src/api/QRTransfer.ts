import QRCode from 'qrcode';

export class QRTransfer {
    /**
     * Génère un QR Code (en Data URL) pour envoyer 50 DDK.
     * Le code contient le pseudo de l'expéditeur et une signature temporelle.
     */
    public static async generateTransferQR(senderPseudo: string): Promise<string> {
        const payload = {
            type: 'IBIZUNGU_TRANSFER',
            amount: 50,
            from: senderPseudo,
            timestamp: Date.now()
        };
        
        try {
            const dataUrl = await QRCode.toDataURL(JSON.stringify(payload));
            return dataUrl;
        } catch (err) {
            console.error('Erreur QR Code :', err);
            throw err;
        }
    }

    /**
     * Valide les données extraites d'un QR Code.
     */
    public static validateTransfer(data: string): { from: string, amount: number } | null {
        try {
            const payload = JSON.parse(data);
            if (payload.type === 'IBIZUNGU_TRANSFER' && (Date.now() - payload.timestamp < 120000)) {
                return { from: payload.from, amount: payload.amount };
            }
        } catch (e) {
            return null;
        }
        return null;
    }
}
