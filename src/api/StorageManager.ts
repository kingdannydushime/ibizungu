export interface UserData {
    pseudo: string;
    ddk: number;
    history: any[];
}

export class StorageManager {
    private static DB_NAME = 'IBIZUNGU_DB';
    private static STORE_NAME = 'USER_DATA';

    /**
     * Initialise ou récupère les données de l'utilisateur.
     */
    public static async getProfile(): Promise<UserData | null> {
        const data = localStorage.getItem(this.DB_NAME);
        return data ? JSON.parse(data) : null;
    }

    /**
     * Sauvegarde le profil (utilisé pour les 1000 DDK au départ).
     */
    public static async saveProfile(pseudo: string, ddk: number = 1000): Promise<void> {
        const userData: UserData = {
            pseudo,
            ddk,
            history: []
        };
        localStorage.setItem(this.DB_NAME, JSON.stringify(userData));
    }

    /**
     * Met à jour le solde DDK.
     */
    public static async updateDDK(amount: number): Promise<number> {
        const profile = await this.getProfile();
        if (profile) {
            profile.ddk += amount;
            localStorage.setItem(this.DB_NAME, JSON.stringify(profile));
            return profile.ddk;
        }
        return 0;
    }
}
