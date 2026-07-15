import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  en: {
    donor_cockpit: "Donor Cockpit",
    ngo_cockpit: "NGO Cockpit",
    admin_cockpit: "Admin Console",
    post_donation: "Post Donation",
    food_name: "Food Item Name",
    quantity: "Quantity (servings/kg)",
    category: "Category",
    expiry: "Expiry Datetime",
    pickup_address: "Pickup Address",
    active_donations: "Active & Past Donations",
    food_saved: "Total Saved Food",
    co2_offset: "CO2 Offset Equivalent",
    active_listings: "Active Listings",
    language: "Language",
    notifications: "Notifications",
    leaderboard: "Eco Leaderboard",
    eco_points: "Eco-Points",
    redeem_store: "Rewards Store",
    verify_quality: "Scan Food Quality",
    route_opt: "Route Optimization",
    confirm_pickup: "Confirm Pickup",
    scan_qr: "Scan QR Code",
    ai_matching: "AI NGO Matching",
    advisory: "AI Waste Predictions",
    find_food: "Find Available Food Donations",
    active_pickups: "Active Pickups Logistics Tracker",
    home: "Home",
    login: "Login",
    register: "Register",
    logout: "Logout"
  },
  es: {
    donor_cockpit: "Cabina del Donante",
    ngo_cockpit: "Cabina de la ONG",
    admin_cockpit: "Consola de Administración",
    post_donation: "Publicar Donación",
    food_name: "Nombre del Alimento",
    quantity: "Cantidad (porciones/kg)",
    category: "Categoría",
    expiry: "Fecha de Vencimiento",
    pickup_address: "Dirección de Recogida",
    active_donations: "Donaciones Activas y Pasadas",
    food_saved: "Total Alimentos Salvados",
    co2_offset: "Equivalente de Compensación de CO2",
    active_listings: "Listados Activos",
    language: "Idioma",
    notifications: "Notificaciones",
    leaderboard: "Clasificación Ecológica",
    eco_points: "Puntos Eco",
    redeem_store: "Tienda de Recompensas",
    verify_quality: "Escanear Calidad",
    route_opt: "Optimización de Ruta",
    confirm_pickup: "Confirmar Recogida",
    scan_qr: "Escanear Código QR",
    ai_matching: "Coincidencia de ONG IA",
    advisory: "Predicciones de Desperdicios",
    find_food: "Buscar Donaciones de Alimentos",
    active_pickups: "Seguimiento de Logística de Recogida",
    home: "Inicio",
    login: "Iniciar Sesión",
    register: "Registrarse",
    logout: "Cerrar Sesión"
  },
  fr: {
    donor_cockpit: "Cockpit du Donneur",
    ngo_cockpit: "Cockpit de l'ONG",
    admin_cockpit: "Console d'Administration",
    post_donation: "Publier un Don",
    food_name: "Nom de l'Aliment",
    quantity: "Quantité (portions/kg)",
    category: "Catégorie",
    expiry: "Date d'Expiration",
    pickup_address: "Adresse de Ramassage",
    active_donations: "Dons Actifs & Passés",
    food_saved: "Total des Aliments Sauvés",
    co2_offset: "Équivalent Compensation CO2",
    active_listings: "Annonces Actives",
    language: "Langue",
    notifications: "Notifications",
    leaderboard: "Classement Écologique",
    eco_points: "Points Éco",
    redeem_store: "Boutique Récompenses",
    verify_quality: "Analyser la Qualité",
    route_opt: "Optimisation d'Itinéraire",
    confirm_pickup: "Confirmer Ramassage",
    scan_qr: "Scanner Code QR",
    ai_matching: "Recommandations ONG IA",
    advisory: "Prévisions Déchets IA",
    find_food: "Trouver des Dons Alimentaires",
    active_pickups: "Suivi Logistique des Ramassages",
    home: "Accueil",
    login: "Connexion",
    register: "Inscription",
    logout: "Déconnexion"
  },
  hi: {
    donor_cockpit: "दाता कॉकपिट",
    ngo_cockpit: "एनजीओ कॉकपिट",
    admin_cockpit: "एडमिन कंसोल",
    post_donation: "दान पोस्ट करें",
    food_name: "खाद्य सामग्री का नाम",
    quantity: "मात्रा (सर्विंग्स/किग्रा)",
    category: "श्रेणी",
    expiry: "समाप्ति समय",
    pickup_address: "पिकअप का पता",
    active_donations: "सक्रिय और पुराने दान",
    food_saved: "कुल बचाया भोजन",
    co2_offset: "CO2 ऑफसेट समकक्ष",
    active_listings: "सक्रिय सूचियां",
    language: "भाषा",
    notifications: "सूचनाएं",
    leaderboard: "इको लीडरबोर्ड",
    eco_points: "इको-पॉइंट्स",
    redeem_store: "पुरस्कार स्टोर",
    verify_quality: "गुणवत्ता स्कैन करें",
    route_opt: "मार्ग अनुकूलन",
    confirm_pickup: "पिकअप पुष्टि करें",
    scan_qr: "QR कोड स्कैन करें",
    ai_matching: "AI एनजीओ मिलान",
    advisory: "AI अपशिष्ट पूर्वानुमान",
    find_food: "उपलब्ध भोजन दान खोजें",
    active_pickups: "सक्रिय पिकअप ट्रैकर",
    home: "होम",
    login: "लॉगिन",
    register: "रजिस्टर",
    logout: "लॉगआउट"
  }
};

export function LanguageProvider({ children }) {
  const [currentLanguage, setLanguageState] = useState(localStorage.getItem('language') || 'en');

  const setLanguage = (lang) => {
    localStorage.setItem('language', lang);
    setLanguageState(lang);
  };

  const t = (key) => {
    return translations[currentLanguage]?.[key] || translations['en']?.[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ currentLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useTranslation = () => useContext(LanguageContext);
