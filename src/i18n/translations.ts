
type Translation = {
  [key: string]: string;
};

type Translations = {
  [language: string]: Translation;
};

export const translations: Translations = {
  en: {
    // Common
    settings: "Settings",
    language: "Language",
    english: "English",
    spanish: "Spanish",
    theme: "Theme",
    light: "Light",
    dark: "Dark",
    system: "System",
    save: "Save",
    cancel: "Cancel",
    
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    email: "Email",
    password: "Password",
    forgotPassword: "Forgot password?",
    sendResetLink: "Send Reset Link",
    checkEmail: "Check Your Email",
    backToLogin: "Back to login",
    
    // Navigation
    dashboard: "Dashboard",
    bills: "Bills",
    accounts: "Accounts",
    calendar: "Calendar",
    paymentGoals: "Payment Goals",
    
    // Feedback banner
    thankYou: "Thank you for helping test this app.",
    requestFeatures: "Feel free to request features and give feedback!",
    sendFeedback: "Send Feedback",
    yourName: "Your name",
    yourEmail: "Your email",
    feedback: "Feedback",
    feedbackPlaceholder: "Share your thoughts, feature requests, or report issues...",
    feedbackHelp: "Your feedback will help improve the app for everyone.",
    submitting: "Sending...",
    submit: "Submit Feedback",
    feedbackSuccess: "Feedback sent successfully! Thank you for your input.",
    
    // Getting started banner
    newHere: "🚀 New here?",
    quickStartGuide: "Check out our quick start guide to supercharge your financial journey!",
    getStarted: "Get Started",
    
    // Settings
    accountSettings: "Account Settings",
    appearance: "Appearance",
    preferences: "Preferences",
    followSystem: "Follow system",
  },
  es: {
    // Common
    settings: "Configuración",
    language: "Idioma",
    english: "Inglés",
    spanish: "Español",
    theme: "Tema",
    light: "Claro",
    dark: "Oscuro",
    system: "Sistema",
    save: "Guardar",
    cancel: "Cancelar",
    
    // Auth
    signIn: "Iniciar Sesión",
    signUp: "Registrarse",
    email: "Correo electrónico",
    password: "Contraseña",
    forgotPassword: "¿Olvidó su contraseña?",
    sendResetLink: "Enviar enlace",
    checkEmail: "Revise su correo electrónico",
    backToLogin: "Volver al inicio de sesión",
    
    // Navigation
    dashboard: "Panel",
    bills: "Facturas",
    accounts: "Cuentas",
    calendar: "Calendario",
    paymentGoals: "Objetivos de pago",
    
    // Feedback banner
    thankYou: "Gracias por ayudar a probar esta aplicación.",
    requestFeatures: "¡No dude en solicitar funciones y enviar comentarios!",
    sendFeedback: "Enviar comentarios",
    yourName: "Su nombre",
    yourEmail: "Su correo electrónico",
    feedback: "Comentarios",
    feedbackPlaceholder: "Comparta sus pensamientos, solicitudes de funciones o informe problemas...",
    feedbackHelp: "Sus comentarios ayudarán a mejorar la aplicación para todos.",
    submitting: "Enviando...",
    submit: "Enviar comentarios",
    feedbackSuccess: "¡Comentarios enviados con éxito! Gracias por su aporte.",
    
    // Getting started banner
    newHere: "🚀 ¿Nuevo aquí?",
    quickStartGuide: "¡Consulte nuestra guía de inicio rápido para potenciar su viaje financiero!",
    getStarted: "Comenzar",
    
    // Settings
    accountSettings: "Ajustes de la cuenta",
    appearance: "Apariencia",
    preferences: "Preferencias",
    followSystem: "Seguir sistema",
  }
};
