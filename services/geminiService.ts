const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
  console.error('ERREUR DIGITALSTRATEGES : La clé API est introuvable dans lenvironnement.');
}
export default GEMINI_API_KEY;
