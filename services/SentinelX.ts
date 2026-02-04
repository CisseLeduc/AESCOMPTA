
import { AuditLog } from '../types';

export class SentinelX {
  static async checkIntegrity() {
    console.debug("SentinelX: Démarrage audit système...");
    const keys = ['aes_transactions', 'aes_products', 'aes_user_profile'];
    let errorsFixes = 0;

    keys.forEach(key => {
      try {
        const data = localStorage.getItem(key);
        if (data) {
          JSON.parse(data); // Test structure
        }
      } catch (e) {
        console.error(`SentinelX: Données corrompues détectées pour ${key}. Réinitialisation sécurisée.`);
        localStorage.setItem(key, JSON.stringify([]));
        errorsFixes++;
      }
    });

    // Nettoyage des doublons de transactions par ID
    const txData = localStorage.getItem('aes_transactions');
    if (txData) {
      const txs = JSON.parse(txData);
      const unique = Array.from(new Map(txs.map((t: any) => [t.id, t])).values());
      if (unique.length !== txs.length) {
        localStorage.setItem('aes_transactions', JSON.stringify(unique));
        errorsFixes++;
      }
    }

    return errorsFixes;
  }

  static async heal(addLog: (action: string, details: string, sev: any) => void) {
    const fixed = await this.checkIntegrity();
    if (fixed > 0) {
      addLog("Système", `SentinelX a réparé ${fixed} anomalies structurelles.`, "medium");
    }
  }
}
