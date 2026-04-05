import { createWorker } from 'tesseract.js';

export interface LumicashTransaction {
    amount: number;
    transactionId: string;
    sender: string;
    isValid: boolean;
}

export class LumicashOCR {
    /**
     * Analyse une image (photo ou screenshot) pour extraire les données Lumicash.
     * @param imageSource URL de l'image ou objet File/Blob
     */
    public static async processSMS(imageSource: string | File): Promise<LumicashTransaction> {
        console.log("Démarrage de l'analyse OCR Lumicash...");
        
        const worker = await createWorker('fra'); // Utilisation du français pour les SMS Lumicash
        const { data: { text } } = await worker.recognize(imageSource);
        await worker.terminate();

        console.log("Texte extrait :", text);

        return this.parseLumicashText(text);
    }

    /**
     * Analyse le texte brut pour trouver le montant et l'ID de transaction.
     * Exemple de texte attendu : "Vous avez recu 50000 FBU de 79XXXXXX. Ref: 123456789"
     */
    private static parseLumicashText(text: string): LumicashTransaction {
        const transaction: LumicashTransaction = {
            amount: 0,
            transactionId: '',
            sender: '',
            isValid: false
        };

        // Recherche du montant (ex: 50000 FBU)
        const amountMatch = text.match(/(\d+)\s*FBU/i);
        if (amountMatch) {
            transaction.amount = parseInt(amountMatch[1]);
        }

        // Recherche de l'ID de transaction (ex: Ref: 123456789)
        const idMatch = text.match(/(?:Ref|ID|No)[:\s]*([A-Z0-9]+)/i);
        if (idMatch) {
            transaction.transactionId = idMatch[1];
        }

        // Recherche du numéro expéditeur (ex: de 79XXXXXX)
        const senderMatch = text.match(/(?:de|from)[:\s]*(\d{8})/i);
        if (senderMatch) {
            transaction.sender = senderMatch[1];
        }

        // Validation basique : si on a un montant et un ID, on considère la transaction comme détectée
        if (transaction.amount > 0 && transaction.transactionId.length > 5) {
            transaction.isValid = true;
        }

        return transaction;
    }
}
