import React, { useState, useEffect, useContext, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query } from 'firebase/firestore'; // 引入 Firestore 相關模組

// --- Firebase 配置 (請替換為您自己的 Firebase 專案設定) ---
const firebaseConfig = {
  apiKey: "AIzaSyBNYGv9KUJL15Hf9F3oD9ClJbYXvSzkKw0", // <-- 請替換為您的 Firebase API Key
  authDomain: "loginback-3d50c.firebaseapp.com", // <-- 請替換為您的 Firebase 專案 ID
  projectId: "loginback-3d50c", // <-- 請替換為您的 Firebase 專案 ID
  storageBucket: "loginback-3d50c.firebasestorage.app",
  messagingSenderId: "532321001451",
  appId: "1:532321001451:web:4bef47df3e9385106043ae",
  measurementId: "G-CDHG7KZLEW" // 新增 measurementId
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app); // 初始化 Firestore

// --- 國際化翻譯數據 ---
const translations = {
    'zh-TW': {
        pageTitle: '永續商店地圖 - 登入',
        appName: '永續商店地圖',
        home: '首頁',
        map: '地圖',
        shopList: '商店列表',
        newsletter: '訂閱電子報',
        login: '登入',
        register: '註冊',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: '登入您的帳戶',
        registerTitle: '註冊新帳戶',
        emailLabel: '電子郵件',
        emailPlaceholder: '輸入您的電子郵件',
        passwordLabel: '密碼',
        passwordPlaceholder: '輸入您的密碼',
        loginBtn: '登入',
        registerBtn: '註冊',
        logoutBtn: '登出',
        loginSuccess: '登入成功！',
        loginFailed: '登入失敗，請檢查電子郵件或密碼。',
        registerSuccess: '註冊成功！請登入。',
        registerFailed: '註冊失敗：', // Firebase 錯誤訊息會附加在這裡
        missingFields: '請填寫所有欄位。',
        dashboardTitle: '儀表板',
        welcomeMessage: '歡迎，',
        protectedContent: '這是受保護的內容，只有登入後才能看到。',
        goToLogin: '前往登入',
        goToRegister: '前往註冊',
        alreadyHaveAccount: '已有帳戶？',
        noAccountYet: '還沒有帳戶？',
        notProvided: '未提供',
        newsletterTitle: '訂閱永續生活電子報',
        newsletterSubtitle: '獲取最新的永續商店資訊、環保生活技巧和特別優惠',
        newsletterPlaceholder: '您的電子郵件',
        subscribeBtn: '訂閱',
        newsletterSuccess: '感謝您的訂閱！您將收到我們的最新消息。',
        newsletterInvalidEmail: '請輸入有效的電子郵件地址。',
        newsletterError: '訂閱失敗，請稍後再試。',
        addStoreTitle: '新增商店', // 新增商店管理翻譯
        storeNameLabel: '商店名稱',
        storeNamePlaceholder: '輸入商店名稱',
        storeAddressLabel: '商店地址',
        storeAddressPlaceholder: '輸入商店地址',
        storeTypeLabel: '商店類別',
        storeTypePlaceholder: '輸入商店類別 (例如：食品、服飾)',
        storeDescriptionLabel: '商店描述',
        storeDescriptionPlaceholder: '輸入商店簡短描述',
        addStoreBtn: '新增商店',
        storeAddedSuccess: '商店新增成功！',
        storeAddFailed: '新增商店失敗：',
        storeListTitle: '現有商店列表',
        noStoresYet: '目前沒有商店。新增一個吧！'
    },
    'en': {
        pageTitle: 'Sustainable Store Map - Login',
        appName: 'Sustainable Store Map',
        home: 'Home',
        map: 'Map',
        shopList: 'Shop List',
        newsletter: 'Newsletter',
        login: 'Login',
        register: 'Register',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'Login to Your Account',
        registerTitle: 'Register New Account',
        emailLabel: 'Email',
        emailPlaceholder: 'Enter your email',
        passwordLabel: 'Password',
        passwordPlaceholder: 'Enter your password',
        loginBtn: 'Login',
        registerBtn: 'Register',
        logoutBtn: 'Logout',
        loginSuccess: 'Login successful!',
        loginFailed: 'Login failed, please check email or password.',
        registerSuccess: 'Registration successful! Please log in.',
        registerFailed: 'Registration failed: ',
        missingFields: 'Please fill in all fields.',
        dashboardTitle: 'Dashboard',
        welcomeMessage: 'Welcome, ',
        protectedContent: 'This is protected content, only visible after logging in.',
        goToLogin: 'Go to Login',
        goToRegister: 'Go to Register',
        alreadyHaveAccount: 'Already have an account?',
        noAccountYet: 'Don\'t have an account yet?',
        notProvided: 'Not provided',
        newsletterTitle: 'Subscribe to Sustainable Living Newsletter',
        newsletterSubtitle: 'Get the latest sustainable store information, eco-friendly living tips, and special offers',
        newsletterPlaceholder: 'Your email',
        subscribeBtn: 'Subscribe',
        newsletterSuccess: 'Thank you for subscribing! You will receive our latest news.',
        newsletterInvalidEmail: 'Please enter a valid email address.',
        newsletterError: 'Subscription failed, please try again later.',
        addStoreTitle: 'Add New Store',
        storeNameLabel: 'Store Name',
        storeNamePlaceholder: 'Enter store name',
        storeAddressLabel: 'Store Address',
        storeAddressPlaceholder: 'Enter store address',
        storeTypeLabel: 'Store Type',
        storeTypePlaceholder: 'Enter store type (e.g., Food, Apparel)',
        storeDescriptionLabel: 'Store Description',
        storeDescriptionPlaceholder: 'Enter a short description of the store',
        addStoreBtn: 'Add Store',
        storeAddedSuccess: 'Store added successfully!',
        storeAddFailed: 'Failed to add store: ',
        storeListTitle: 'Existing Stores List',
        noStoresYet: 'No stores yet. Add one!'
    },
    'fr': {
        pageTitle: 'Carte des Magasins Durables - Connexion',
        appName: 'Carte des Magasins Durables',
        home: 'Accueil',
        map: 'Carte',
        shopList: 'Liste des Magasins',
        newsletter: 'Newsletter',
        login: 'Connexion',
        register: 'S\'inscrire',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'Connectez-vous à votre compte',
        registerTitle: 'Créer un nouveau compte',
        emailLabel: 'E-mail',
        emailPlaceholder: 'Entrez votre e-mail',
        passwordLabel: 'Mot de passe',
        passwordPlaceholder: 'Entrez votre mot de passe',
        loginBtn: 'Connexion',
        registerBtn: 'S\'inscrire',
        logoutBtn: 'Déconnexion',
        loginSuccess: 'Connexion réussie !',
        loginFailed: 'Échec de la connexion, veuillez vérifier l\'e-mail ou le mot de passe.',
        registerSuccess: 'Inscription réussie ! Veuillez vous connecter.',
        registerFailed: 'Échec de l\'inscription : ',
        missingFields: 'Veuillez remplir tous les champs.',
        dashboardTitle: 'Tableau de bord',
        welcomeMessage: 'Bienvenue, ',
        protectedContent: 'Ceci est un contenu protégé, visible uniquement après connexion.',
        goToLogin: 'Aller à la connexion',
        goToRegister: 'Aller à l\'inscription',
        alreadyHaveAccount: 'Vous avez déjà un compte ?',
        noAccountYet: 'Vous n\'avez pas encore de compte ?',
        notProvided: 'Non fourni',
        newsletterTitle: 'Abonnez-vous à la Newsletter Vie Durable',
        newsletterSubtitle: 'Recevez les dernières informations sur les magasins durables, des conseils de vie écologique et des offres spéciales',
        newsletterPlaceholder: 'Votre e-mail',
        subscribeBtn: 'S\'abonner',
        newsletterSuccess: 'Merci de votre abonnement ! Vous recevrez nos dernières nouvelles.',
        newsletterInvalidEmail: 'Veuillez entrer une adresse e-mail valide.',
        newsletterError: 'L\'abonnement a échoué, veuillez réessayer plus tard.',
        addStoreTitle: 'Ajouter un nouveau magasin',
        storeNameLabel: 'Nom du magasin',
        storeNamePlaceholder: 'Entrez le nom du magasin',
        storeAddressLabel: 'Adresse du magasin',
        storeAddressPlaceholder: 'Entrez l\'adresse du magasin',
        storeTypeLabel: 'Type de magasin',
        storeTypePlaceholder: 'Entrez le type de magasin (ex : Alimentation, Vêtements)',
        storeDescriptionLabel: 'Description du magasin',
        storeDescriptionPlaceholder: 'Entrez une courte description du magasin',
        addStoreBtn: 'Ajouter un magasin',
        storeAddedSuccess: 'Magasin ajouté avec succès !',
        storeAddFailed: 'Échec de l\'ajout du magasin : ',
        storeListTitle: 'Liste des magasins existants',
        noStoresYet: 'Aucun magasin pour le moment. Ajoutez-en un !'
    },
    'de': {
        pageTitle: 'Karte der Nachhaltigen Geschäfte - Anmeldung',
        appName: 'Karte der Nachhaltigen Geschäfte',
        home: 'Startseite',
        map: 'Karte',
        shopList: 'Geschäftsliste',
        newsletter: 'Newsletter',
        login: 'Anmelden',
        register: 'Registrieren',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'Melden Sie sich bei Ihrem Konto an',
        registerTitle: 'Neues Konto registrieren',
        emailLabel: 'E-Mail',
        emailPlaceholder: 'Geben Sie Ihre E-Mail-Adresse ein',
        passwordLabel: 'Passwort',
        passwordPlaceholder: 'Geben Sie Ihr Passwort ein',
        loginBtn: 'Anmelden',
        registerBtn: 'Registrieren',
        logoutBtn: 'Abmelden',
        loginSuccess: 'Anmeldung erfolgreich!',
        loginFailed: 'Anmeldung fehlgeschlagen, bitte überprüfen Sie E-Mail oder Passwort.',
        registerSuccess: 'Registrierung erfolgreich! Bitte melden Sie sich an.',
        registerFailed: 'Registrierung fehlgeschlagen: ',
        missingFields: 'Bitte füllen Sie alle Felder aus.',
        dashboardTitle: 'Dashboard',
        welcomeMessage: 'Willkommen, ',
        protectedContent: 'Dies ist geschützter Inhalt, nur nach Anmeldung sichtbar.',
        goToLogin: 'Zur Anmeldung gehen',
        goToRegister: 'Zur Registrierung gehen',
        alreadyHaveAccount: 'Haben Sie bereits ein Konto?',
        noAccountYet: 'Haben Sie noch kein Konto?',
        notProvided: 'Nicht angegeben',
        newsletterTitle: 'Nachhaltiger Leben Newsletter Abonnieren',
        newsletterSubtitle: 'Erhalten Sie die neuesten Informationen zu nachhaltigen Geschäften, umweltfreundliche Lebenstipps und Sonderangebote',
        newsletterPlaceholder: 'Ihre E-Mail-Adresse',
        subscribeBtn: 'Abonnieren',
        newsletterSuccess: 'Vielen Dank für Ihr Abonnement! Sie erhalten unsere neuesten Nachrichten.',
        newsletterInvalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        newsletterError: 'Abonnement fehlgeschlagen, bitte versuchen Sie es später erneut.',
        addStoreTitle: 'Neuen Laden hinzufügen',
        storeNameLabel: 'Ladenname',
        storeNamePlaceholder: 'Ladenname eingeben',
        storeAddressLabel: 'Ladenadresse',
        storeAddressPlaceholder: 'Ladenadresse eingeben',
        storeTypeLabel: 'Ladentyp',
        storeTypePlaceholder: 'Ladentyp eingeben (z.B. Lebensmittel, Bekleidung)',
        storeDescriptionLabel: 'Ladenbeschreibung',
        storeDescriptionPlaceholder: 'Kurze Ladenbeschreibung eingeben',
        addStoreBtn: 'Laden hinzufügen',
        storeAddedSuccess: 'Laden erfolgreich hinzugefügt!',
        storeAddFailed: 'Laden konnte nicht hinzugefügt werden: ',
        storeListTitle: 'Liste der bestehenden Läden',
        noStoresYet: 'Noch keine Läden vorhanden. Fügen Sie einen hinzu!'
    },
    'es': {
        pageTitle: 'Mapa de Tiendas Sostenibles - Iniciar Sesión',
        appName: 'Mapa de Tiendas Sostenibles',
        home: 'Inicio',
        map: 'Mapa',
        shopList: 'Lista de Tiendas',
        newsletter: 'Boletín',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'Iniciar Sesión en su Cuenta',
        registerTitle: 'Registrar Nueva Cuenta',
        emailLabel: 'Correo electrónico',
        emailPlaceholder: 'Introduzca su correo electrónico',
        passwordLabel: 'Contraseña',
        passwordPlaceholder: 'Introduzca su contraseña',
        loginBtn: 'Iniciar Sesión',
        registerBtn: 'Registrarse',
        logoutBtn: 'Cerrar Sesión',
        loginSuccess: '¡Inicio de sesión exitoso!',
        loginFailed: 'Error de inicio de sesión, compruebe el correo electrónico o la contraseña.',
        registerSuccess: '¡Registro exitoso! Por favor, inicie sesión.',
        registerFailed: 'Error de registro: ',
        missingFields: 'Por favor, rellene todos los campos.',
        turnstileFailed: 'La verificación humana falló, por favor, inténtelo de nuevo.',
        dashboardTitle: 'Panel de Control',
        welcomeMessage: 'Bienvenido, ',
        protectedContent: 'Este es contenido protegido, solo visible después de iniciar sesión.',
        goToLogin: 'Ir a Iniciar Sesión',
        goToRegister: 'Ir a Registrarse',
        alreadyHaveAccount: '¿Ya tiene una cuenta?',
        noAccountYet: '¿Aún no tiene una cuenta?',
        notProvided: 'No proporcionado',
        newsletterTitle: 'Suscríbete al Boletín de Vida Sostenible',
        newsletterSubtitle: 'Recibe la última información sobre tiendas sostenibles, consejos de vida ecológica y ofertas especiales',
        newsletterPlaceholder: 'Tu correo electrónico',
        subscribeBtn: 'Suscribirse',
        newsletterSuccess: '¡Gracias por suscribirte! Recibirás nuestras últimas noticias.',
        newsletterInvalidEmail: 'Por favor, introduce una dirección de correo electrónico válida.',
        newsletterError: 'Error al suscribirse, por favor, inténtalo de nuevo más tarde.',
        addStoreTitle: 'Añadir nueva tienda',
        storeNameLabel: 'Nombre de la tienda',
        storeNamePlaceholder: 'Introduzca el nombre de la tienda',
        storeAddressLabel: 'Dirección de la tienda',
        storeAddressPlaceholder: 'Introduzca la dirección de la tienda',
        storeTypeLabel: 'Tipo de tienda',
        storeTypePlaceholder: 'Introduzca el tipo de tienda (ej. Comida, Ropa)',
        storeDescriptionLabel: 'Descripción de la tienda',
        storeDescriptionPlaceholder: 'Introduzca una breve descripción de la tienda',
        addStoreBtn: 'Añadir tienda',
        storeAddedSuccess: '¡Tienda añadida con éxito!',
        storeAddFailed: 'Error al añadir tienda: ',
        storeListTitle: 'Lista de tiendas existentes',
        noStoresYet: 'Aún no hay tiendas. ¡Añada una!'
    },
    'la': {
        pageTitle: 'Tabula Copiarum Sustentabilium - Log In',
        appName: 'Tabula Copiarum Sustentabilium',
        home: 'Pagina Prima',
        map: 'Tabula',
        shopList: 'Index Copiarum',
        newsletter: 'Epistula Nuntia',
        login: 'Log In',
        register: 'Register',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'Log In ad Rationem Tuam',
        registerTitle: 'Register Novam Rationem',
        emailLabel: 'Epistula Electronica',
        emailPlaceholder: 'Intra epistulam electronicam tuam',
        passwordLabel: 'Tessera',
        passwordPlaceholder: 'Intra tesseram tuam',
        loginBtn: 'Log In',
        registerBtn: 'Register',
        logoutBtn: 'Log Out',
        loginSuccess: 'Successus initii!',
        loginFailed: 'Initium defecit, quaeso epistulam electronicam vel tesseram verifica.',
        registerSuccess: 'Registratio successit! Quaeso, initium fac.',
        registerFailed: 'Registratio defecit: ',
        missingFields: 'Quaeso, omnia agra imple.',
        turnstileFailed: 'Verificatio humana defecit, quaeso iterum conare.',
        dashboardTitle: 'Tabula Imperii',
        welcomeMessage: 'Salve, ',
        protectedContent: 'Hoc est contentum protectum, solum post initium visibile.',
        goToLogin: 'Ad Log In',
        goToRegister: 'Ad Register',
        alreadyHaveAccount: 'Iam habes rationem?',
        noAccountYet: 'Nondum habes rationem?',
        notProvided: 'Non provisum',
        newsletterTitle: 'Subscribere Epistulae Nuntiae Vitae Sustentabilis',
        newsletterSubtitle: 'Accipe recentissimas informationes de copiia sustentabilibus, consilia vitae naturae amicae, et oblationes speciales',
        newsletterPlaceholder: 'Tua epistula electronica',
        subscribeBtn: 'Subscribere',
        newsletterSuccess: 'Gratias tibi pro subscriptione! Nuntios nostros recentissimos accipies.',
        newsletterInvalidEmail: 'Quaeso, inscriptionem electronicam validam inscribe.',
        newsletterError: 'Subscriptio defecit, quaeso postea iterum conare.',
        addStoreTitle: 'Adde Novam Copiam',
        storeNameLabel: 'Nomen Copiae',
        storeNamePlaceholder: 'Intra nomen copiae',
        storeAddressLabel: 'Inscriptio Copiae',
        storeAddressPlaceholder: 'Intra inscriptionem copiae',
        storeTypeLabel: 'Typus Copiae',
        storeTypePlaceholder: 'Intra typum copiae (exempli gratia: Cibus, Vestimenta)',
        storeDescriptionLabel: 'Descriptio Copiae',
        storeDescriptionPlaceholder: 'Intra brevem descriptionem copiae',
        addStoreBtn: 'Adde Copiam',
        storeAddedSuccess: 'Copia feliciter addita!',
        storeAddFailed: 'Copia addi non potuit: ',
        storeListTitle: 'Index Copiarum Exstantium',
        noStoresYet: 'Nullae copiae adhuc. Adde unam!'
    },
    'ja': {
        pageTitle: 'サステナブルショップマップ - ログイン',
        appName: 'サステナブルショップマップ',
        home: 'ホーム',
        map: 'マップ',
        shopList: 'ショップリスト',
        newsletter: 'ニュースレター',
        login: 'ログイン',
        register: '登録',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        loginTitle: 'アカウントにログイン',
        registerTitle: '新規アカウント登録',
        emailLabel: 'メールアドレス',
        emailPlaceholder: 'メールアドレスを入力してください',
        passwordLabel: 'パスワード',
        passwordPlaceholder: 'パスワードを入力してください',
        loginBtn: 'ログイン',
        registerBtn: '登録',
        logoutBtn: 'ログアウト',
        loginSuccess: 'ログインに成功しました！',
        loginFailed: 'ログインに失敗しました。メールアドレスまたはパスワードを確認してください。',
        registerSuccess: '登録に成功しました！ログインしてください。',
        registerFailed: '登録に失敗しました：',
        missingFields: 'すべての項目を入力してください。',
        turnstileFailed: '人間認証に失敗しました。もう一度お試しください。',
        dashboardTitle: 'ダッシュボード',
        welcomeMessage: 'ようこそ、',
        protectedContent: 'これは保護されたコンテンツであり、ログイン後にのみ表示されます。',
        goToLogin: 'ログインへ',
        goToRegister: '登録へ',
        alreadyHaveAccount: 'すでにアカウントをお持ちですか？',
        noAccountYet: 'まだアカウントをお持ちではありませんか？',
        notProvided: '提供されていません',
        newsletterTitle: 'サステナブルライフニュースレターを購読',
        newsletterSubtitle: '最新のサステナブルショップ情報、エコライフのヒント、特別オファーを受け取る',
        newsletterPlaceholder: 'あなたのメールアドレス',
        subscribeBtn: '購読する',
        newsletterSuccess: 'ご購読ありがとうございます！最新情報をお届けします。',
        newsletterInvalidEmail: '有効なメールアドレスを入力してください。',
        newsletterError: '購読に失敗しました。後でもう一度お試しください。',
        addStoreTitle: '新しい店舗を追加',
        storeNameLabel: '店舗名',
        storeNamePlaceholder: '店舗名を入力してください',
        storeAddressLabel: '店舗住所',
        storeAddressPlaceholder: '店舗住所を入力してください',
        storeTypeLabel: '店舗カテゴリ',
        storeTypePlaceholder: '店舗カテゴリを入力してください（例：食品、アパレル）',
        storeDescriptionLabel: '店舗説明',
        storeDescriptionPlaceholder: '店舗の簡単な説明を入力してください',
        addStoreBtn: '店舗を追加',
        storeAddedSuccess: '店舗が正常に追加されました！',
        storeAddFailed: '店舗の追加に失敗しました：',
        storeListTitle: '既存店舗リスト',
        noStoresYet: 'まだ店舗がありません。追加してください！'
    }
};

// --- AuthContext 創建 ---
const AuthContext = createContext();

// --- AuthProvider 組件 ---
function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, user => {
            setCurrentUser(user);
            setLoading(false);
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        loading,
        signup: (email, password) => createUserWithEmailAndPassword(auth, email, password),
        login: (email, password) => signInWithEmailAndPassword(auth, email, password),
        logout: () => signOut(auth)
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

// --- 使用者訊息彈出視窗組件 ---
function MessageModal({ message, onClose, currentLang }) {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[2000] flex items-center justify-center">
            <div className="bg-white rounded-lg p-6 shadow-xl max-w-sm mx-auto text-center">
                <p className="text-gray-800 text-lg mb-4">{message}</p>
                <button 
                    onClick={onClose} 
                    className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition"
                >
                    {translations[currentLang].okButton || 'OK'}
                </button>
            </div>
        </div>
    );
}

// --- 登入組件 ---
function Login({ setRoute, currentLang }) {
    const { login } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage(translations[currentLang].missingFields);
            return;
        }

        try {
            await login(email, password);
            setMessage(translations[currentLang].loginSuccess);
            setEmail('');
            setPassword('');
        } catch (error) {
            console.error("登入失敗:", error);
            setMessage(translations[currentLang].loginFailed + ": " + error.message);
        }
    };

    return (
        <section id="login" className="py-12 bg-gradient-to-br from-green-50 to-green-100 min-h-screen flex items-center justify-center font-inter">
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105">
                    <h2 className="text-4xl font-extrabold text-center text-green-700 mb-8 tracking-tight">{translations[currentLang].loginTitle}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].emailLabel}</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                                placeholder={translations[currentLang].emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-8">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].passwordLabel}</label>
                            <input 
                                type="password" 
                                id="password" 
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                                placeholder={translations[currentLang].passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105"
                            >
                                {translations[currentLang].loginBtn}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setRoute('register')} 
                                className="w-full sm:w-auto inline-block align-baseline font-semibold text-sm text-green-600 hover:text-green-800 transition-colors duration-200"
                            >
                                {translations[currentLang].noAccountYet} <span className="underline">{translations[currentLang].goToRegister}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {message && <MessageModal message={message} onClose={() => setMessage('')} currentLang={currentLang} />}
        </section>
    );
}

// --- 註冊組件 ---
function Register({ setRoute, currentLang }) {
    const { signup } = useContext(AuthContext);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) {
            setMessage(translations[currentLang].missingFields);
            return;
        }
        try {
            await signup(email, password);
            setMessage(translations[currentLang].registerSuccess);
            setEmail('');
            setPassword('');
            setRoute('login'); // 註冊成功後導向登入頁面
        } catch (error) {
            console.error("註冊失敗:", error);
            setMessage(translations[currentLang].registerFailed + error.message);
        }
    };

    return (
        <section id="register" className="py-12 bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen flex items-center justify-center font-inter">
            <div className="container mx-auto px-4">
                <div className="max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8 transform transition-all duration-300 hover:scale-105">
                    <h2 className="text-4xl font-extrabold text-center text-blue-700 mb-8 tracking-tight">{translations[currentLang].registerTitle}</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-6">
                            <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].emailLabel}</label>
                            <input 
                                type="email" 
                                id="email" 
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                placeholder={translations[currentLang].emailPlaceholder}
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div className="mb-8">
                            <label htmlFor="password" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].passwordLabel}</label>
                            <input 
                                type="password" 
                                id="password" 
                                className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 mb-3 leading-tight focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200" 
                                placeholder={translations[currentLang].passwordPlaceholder}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <button 
                                type="submit" 
                                className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-blue-600 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105"
                            >
                                {translations[currentLang].registerBtn}
                            </button>
                            <button 
                                type="button" 
                                onClick={() => setRoute('login')} 
                                className="w-full sm:w-auto inline-block align-baseline font-semibold text-sm text-blue-600 hover:text-blue-800 transition-colors duration-200"
                            >
                                {translations[currentLang].alreadyHaveAccount} <span className="underline">{translations[currentLang].goToLogin}</span>
                            </button>
                        </div>
                    </form>
                </div>
            </div>
            {message && <MessageModal message={message} onClose={() => setMessage('')} currentLang={currentLang} />}
        </section>
    );
}

// --- 儀表板組件 (受保護頁面，含商店新增工具) ---
function Dashboard({ setRoute, currentLang }) {
    const { currentUser, logout } = useContext(AuthContext);
    const [message, setMessage] = useState('');
    const [storeName, setStoreName] = useState('');
    const [storeAddress, setStoreAddress] = useState('');
    const [storeType, setStoreType] = useState('');
    const [storeDescription, setStoreDescription] = useState('');
    const [stores, setStores] = useState([]); // State to hold stores from Firestore

    // 監聽 Firestore 中的商店資料變化
    useEffect(() => {
        // 建立查詢，獲取 'stores' 集合中的所有文件
        const q = query(collection(db, "stores"));
        
        // 設置即時監聽器
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const storesData = [];
            snapshot.forEach((doc) => {
                storesData.push({ id: doc.id, ...doc.data() });
            });
            setStores(storesData);
        }, (error) => {
            console.error("Error fetching stores: ", error);
            setMessage(translations[currentLang].storeAddFailed + error.message);
        });

        // 組件卸載時取消訂閱
        return () => unsubscribe();
    }, [currentLang]); // 依賴 currentLang 以便在語言切換時重新載入翻譯

    const handleLogout = async () => {
        try {
            await logout();
            setMessage('您已成功登出。');
            setRoute('login');
        } catch (error) {
            console.error("登出失敗:", error);
            setMessage('登出失敗，請稍後再試。');
        }
    };

    const handleAddStore = async (e) => {
        e.preventDefault();
        if (!storeName || !storeAddress || !storeType || !storeDescription) {
            setMessage(translations[currentLang].missingFields);
            return;
        }
        try {
            await addDoc(collection(db, "stores"), {
                name: storeName,
                address: storeAddress,
                type: storeType,
                description: storeDescription,
                createdAt: new Date(), // 新增時間戳
                userId: currentUser ? currentUser.uid : 'anonymous', // 記錄新增商店的使用者 ID
            });
            setMessage(translations[currentLang].storeAddedSuccess);
            // 清空表單
            setStoreName('');
            setStoreAddress('');
            setStoreType('');
            setStoreDescription('');
        } catch (error) {
            console.error("新增商店失敗:", error);
            setMessage(translations[currentLang].storeAddFailed + error.message);
        }
    };

    return (
        <section id="dashboard" className="py-12 bg-gradient-to-br from-green-100 to-green-200 min-h-screen font-inter">
            <div className="container mx-auto px-4">
                <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-xl p-8">
                    <h2 className="text-4xl font-extrabold text-center text-green-700 mb-8 tracking-tight">{translations[currentLang].dashboardTitle}</h2>
                    <p className="text-xl text-gray-700 mb-4 text-center">
                        {translations[currentLang].welcomeMessage}
                        <span className="font-semibold text-green-600">{currentUser ? currentUser.email : '訪客'}</span>!
                    </p>
                    <p className="text-gray-600 mb-8 text-center">{translations[currentLang].protectedContent}</p>
                    
                    {/* 新增商店表單 */}
                    <div className="mb-12 p-6 bg-green-50 rounded-xl shadow-inner">
                        <h3 className="text-2xl font-bold text-green-700 mb-6">{translations[currentLang].addStoreTitle}</h3>
                        <form onSubmit={handleAddStore} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="storeName" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].storeNameLabel}</label>
                                <input 
                                    type="text" 
                                    id="storeName" 
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                                    placeholder={translations[currentLang].storeNamePlaceholder}
                                    value={storeName}
                                    onChange={(e) => setStoreName(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="storeAddress" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].storeAddressLabel}</label>
                                <input 
                                    type="text" 
                                    id="storeAddress" 
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                                    placeholder={translations[currentLang].storeAddressPlaceholder}
                                    value={storeAddress}
                                    onChange={(e) => setStoreAddress(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="storeType" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].storeTypeLabel}</label>
                                <input 
                                    type="text" 
                                    id="storeType" 
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" 
                                    placeholder={translations[currentLang].storeTypePlaceholder}
                                    value={storeType}
                                    onChange={(e) => setStoreType(e.target.value)}
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label htmlFor="storeDescription" className="block text-gray-700 text-sm font-bold mb-2">{translations[currentLang].storeDescriptionLabel}</label>
                                <textarea 
                                    id="storeDescription" 
                                    rows="3"
                                    className="shadow-sm appearance-none border border-gray-300 rounded-lg w-full py-3 px-4 text-gray-700 leading-tight focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200 resize-y" 
                                    placeholder={translations[currentLang].storeDescriptionPlaceholder}
                                    value={storeDescription}
                                    onChange={(e) => setStoreDescription(e.target.value)}
                                ></textarea>
                            </div>
                            <div className="md:col-span-2 text-right">
                                <button type="submit" className="bg-gradient-to-r from-green-500 to-green-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105">
                                    {translations[currentLang].addStoreBtn}
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* 現有商店列表 */}
                    <div className="p-6 bg-white rounded-xl shadow-lg">
                        <h3 className="text-2xl font-bold text-green-700 mb-6">{translations[currentLang].storeListTitle}</h3>
                        {stores.length === 0 ? (
                            <p className="text-gray-600 text-center py-4">{translations[currentLang].noStoresYet}</p>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {stores.map(store => (
                                    <div key={store.id} className="bg-green-50 p-5 rounded-xl shadow-md border border-green-200 transform transition-all duration-300 hover:scale-105 hover:shadow-lg">
                                        <h4 className="text-xl font-bold text-green-800 mb-2">{store.name}</h4>
                                        <p className="text-gray-700 text-sm mb-1"><strong>{translations[currentLang].storeTypeLabel}:</strong> {store.type}</p>
                                        <p className="text-gray-600 text-sm mb-1"><strong>{translations[currentLang].storeAddressLabel}:</strong> {store.address}</p>
                                        <p className="text-gray-500 text-xs mt-3">{store.description}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="text-center mt-12">
                        <button 
                            onClick={handleLogout} 
                            className="bg-gradient-to-r from-red-500 to-red-700 text-white font-bold py-3 px-8 rounded-full shadow-lg hover:from-red-600 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-75 transform transition-all duration-300 hover:scale-105"
                        >
                            {translations[currentLang].logoutBtn}
                        </button>
                    </div>
                </div>
            </div>
            {message && <MessageModal message={message} onClose={() => setMessage('')} currentLang={currentLang} />}
        </section>
    );
}

// --- 主應用程式組件 ---
export default function App() {
    const [currentRoute, setRoute] = useState('login'); // 初始路由為登入頁面
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'zh-TW');

    // 語言切換邏輯
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setCurrentLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    // 渲染導覽列
    const renderNavbar = () => (
        <nav className="bg-white shadow-md sticky top-0 z-50 py-3">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <a href="#" className="text-2xl font-bold text-gray-800 hover:text-green-700 transition-colors duration-200" onClick={() => setRoute('login')}>{translations[currentLang].appName}</a>
                </div>
                <div className="hidden md:flex space-x-6 items-center">
                    <button onClick={() => setRoute('login')} className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].login}</button>
                    <button onClick={() => setRoute('register')} className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].register}</button>
                    <select id="language-select" onChange={handleLanguageChange} value={currentLang} className="bg-green-500 text-white text-sm px-4 py-2 rounded-full hover:bg-green-700 transition-colors duration-200 cursor-pointer shadow-md">
                        <option value="zh-TW">{translations['zh-TW'].langChinese}</option>
                        <option value="en">{translations['en'].langEnglish}</option>
                        <option value="fr">{translations['fr'].langFrench}</option>
                        <option value="de">{translations['de'].langGerman}</option>
                        <option value="es">{translations[currentLang].langSpanish}</option>
                        <option value="la">{translations[currentLang].langLatin}</option>
                        <option value="ja">{translations[currentLang].langJapanese}</option>
                    </select>
                </div>
                <div className="md:hidden flex items-center">
                    <select id="language-select-mobile" onChange={handleLanguageChange} value={currentLang} className="bg-green-500 text-white text-sm px-3 py-1 rounded-full hover:bg-green-700 transition-colors duration-200 cursor-pointer mr-2">
                        <option value="zh-TW">{translations['zh-TW'].langChinese}</option>
                        <option value="en">{translations['en'].langEnglish}</option>
                        <option value="fr">{translations['fr'].langFrench}</option>
                        <option value="de">{translations['de'].langGerman}</option>
                        <option value="es">{translations[currentLang].langSpanish}</option>
                        <option value="la">{translations[currentLang].langLatin}</option>
                        <option value="ja">{translations[currentLang].langJapanese}</option>
                    </select>
                    <button id="menu-toggle" className="text-gray-700 hover:text-green-600 transition-colors duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                </div>
            </div>
            <div id="mobile-menu" className="hidden md:hidden px-4 py-2 bg-white border-t border-gray-200">
                <button onClick={() => setRoute('login')} className="block py-2 text-gray-700 hover:text-green-600 w-full text-left font-medium">
                    {translations[currentLang].login}
                </button>
                <button onClick={() => setRoute('register')} className="block py-2 text-gray-700 hover:text-green-600 w-full text-left font-medium">
                    {translations[currentLang].register}
                </button>
            </div>
        </nav>
    );

    return (
        <AuthProvider>
            {renderNavbar()}
            <AuthContext.Consumer>
                {({ currentUser, loading }) => {
                    if (loading) {
                        return (
                            <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gray-50">
                                載入中...
                            </div>
                        );
                    }
                    if (currentUser) {
                        return <Dashboard setRoute={setRoute} currentLang={currentLang} />;
                    } else {
                        switch (currentRoute) {
                            case 'register':
                                return <Register setRoute={setRoute} currentLang={currentLang} />;
                            case 'login':
                            default:
                                return <Login setRoute={setRoute} currentLang={currentLang} />;
                        }
                    }
                }}
            </AuthContext.Consumer>
        </AuthProvider>
    );
}
