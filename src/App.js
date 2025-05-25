import React, { useState, useEffect, useContext, createContext } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, onSnapshot, query, doc, getDoc, updateDoc, deleteDoc } from 'firebase/firestore'; // 引入 Firestore 更多模組
import L from 'leaflet'; // 引入 Leaflet 庫

// Leaflet 預設圖標的路徑問題修正
// 這是因為 Leaflet 預設的圖標路徑在打包後可能不正確，需要手動指定
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});


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
        pageTitle: '永續商店地圖 - 首頁',
        appName: '永續商店地圖',
        home: '首頁',
        map: '地圖',
        shopList: '商店列表',
        newsletter: '訂閱電子報',
        login: '登入',
        register: '註冊',
        adminPanel: '管理後台', // 新增管理後台連結
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: '探索台灣永續商店',
        heroSubtitle: '找到支持環保、公平貿易和永續發展的商店，一起為地球盡一份心力',
        viewMapBtn: '查看地圖',
        browseShopsBtn: '瀏覽商店列表',
        searchTitle: '搜尋永續商店',
        searchPlaceholder: '輸入商店名稱或地址...',
        filterCategoryTitle: '依類別篩選',
        filterAll: '全部',
        filterApparel: '服飾',
        filterFood: '食品',
        filterCafe: '咖啡廳',
        filterHomeGoods: '家居用品',
        filterZeroWaste: '無包裝商店',
        filterSecondHand: '二手商店',
        filterCreative: '文創',
        mapSectionTitle: '永續商店地圖',
        shopListSectionTitle: '永續商店列表',
        viewDetailsBtn: '查看詳情',
        loadMoreBtn: '載入更多',
        newsletterTitle: '訂閱永續生活電子報',
        newsletterSubtitle: '獲取最新的永續商店資訊、環保生活技巧和特別優惠',
        newsletterPlaceholder: '您的電子郵件',
        subscribeBtn: '訂閱',
        footerAppName: '永續商店地圖',
        footerAppDescription: '幫助消費者找到並支持永續發展的商店，一起為地球盡一份心力。',
        contactUsTitle: '聯絡我們',
        contactUsText: '有任何問題或建議，歡迎與我們聯繫',
        contactUsEmail: '電子郵件：info@sustainablemap.tw',
        followUsTitle: '關注我們',
        copyright: '© 2023 永續商店地圖 - 版權所有',
        modalAboutUs: '關於我們',
        modalSustainability: '永續理念',
        modalVideoIntro: '影片介紹',
        modalLatestCollections: '最新系列',
        modalShopInfo: '商店資訊',
        modalAddress: '地址',
        modalOpeningHours: '營業時間',
        modalContactInfo: '聯絡方式',
        modalPhone: '電話',
        modalEmail: 'Email',
        modalWebsite: '網站',
        modalSocialMedia: '社群媒體',
        modalLocation: '位置',
        shopDetailsNotAvailable: '此店家詳情尚未建立，敬請期待！',
        okButton: '確定',
        notProvided: '未提供',
        newsletterSuccess: '感謝您的訂閱！您將收到我們的最新消息。',
        newsletterInvalidEmail: '請輸入有效的電子郵件地址。',
        newsletterError: '訂閱失敗，請稍後再試。',
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
        adminDashboardTitle: '管理後台儀表板', // 管理後台標題
        addStoreTitle: '新增商店',
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
        noStoresYet: '目前沒有商店。新增一個吧！',
        editStoreBtn: '編輯', // 新增編輯按鈕
        deleteStoreBtn: '刪除', // 新增刪除按鈕
        confirmDelete: '確定要刪除這家商店嗎？', // 新增確認刪除訊息
        storeDeletedSuccess: '商店已成功刪除！', // 新增刪除成功訊息
        storeDeleteFailed: '刪除商店失敗：', // 新增刪除失敗訊息
        storeUpdatedSuccess: '商店已成功更新！', // 新增更新成功訊息
        storeUpdateFailed: '更新商店失敗：', // 新增更新失敗訊息
        adminAccessRequired: '您沒有權限訪問此頁面，請登入管理員帳戶。', // 新增權限不足訊息
        goToHomePage: '返回首頁', // 返回首頁按鈕
        editStoreModalTitle: '編輯商店', // 編輯模態視窗標題
        saveChangesBtn: '儲存變更', // 儲存變更按鈕
        cancelBtn: '取消', // 取消按鈕
        publicViewTitle: '永續商店地圖', // 公開頁面標題
        publicViewSubtitle: '探索台灣永續商店，找到支持環保、公平貿易和永續發展的店家。' // 公開頁面副標題
    },
    'en': {
        pageTitle: 'Sustainable Store Map - Home',
        appName: 'Sustainable Store Map',
        home: 'Home',
        map: 'Map',
        shopList: 'Shop List',
        newsletter: 'Newsletter',
        login: 'Login',
        register: 'Register',
        adminPanel: 'Admin Panel',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: 'Explore Taiwan\'s Sustainable Stores',
        heroSubtitle: 'Find stores that support environmental protection, fair trade, and sustainable development, and contribute to the Earth together.',
        viewMapBtn: 'View Map',
        browseShopsBtn: 'Browse Shop List',
        searchTitle: 'Search Sustainable Stores',
        searchPlaceholder: 'Enter store name or address...',
        filterCategoryTitle: 'Filter by Category',
        filterAll: 'All',
        filterApparel: 'Apparel',
        filterFood: 'Food',
        filterCafe: 'Cafe',
        filterHomeGoods: 'Home Goods',
        filterZeroWaste: 'Zero-Waste Stores',
        filterSecondHand: 'Second-hand Stores',
        filterCreative: 'Creative & Cultural',
        mapSectionTitle: 'Sustainable Store Map',
        shopListSectionTitle: 'Sustainable Shop List',
        viewDetailsBtn: 'View Details',
        loadMoreBtn: 'Load More',
        newsletterTitle: 'Subscribe to Sustainable Living Newsletter',
        newsletterSubtitle: 'Get the latest sustainable store information, eco-friendly living tips, and special offers',
        newsletterPlaceholder: 'Your email',
        subscribeBtn: 'Subscribe',
        footerAppName: 'Sustainable Store Map',
        footerAppDescription: 'Helping consumers find and support sustainable development stores, contributing to the Earth together.',
        contactUsTitle: 'Contact Us',
        contactUsText: 'For any questions or suggestions, please contact us',
        contactUsEmail: 'Email: info@sustainablemap.tw',
        followUsTitle: 'Follow Us',
        copyright: '© 2023 Sustainable Store Map - All Rights Reserved',
        modalAboutUs: 'About Us',
        modalSustainability: 'Sustainability Philosophy',
        modalVideoIntro: 'Video Introduction',
        modalLatestCollections: 'Latest Collections',
        modalShopInfo: 'Store Information',
        modalAddress: 'Address',
        modalOpeningHours: 'Opening Hours',
        modalContactInfo: 'Contact Info',
        modalPhone: 'Phone',
        modalEmail: 'Email',
        modalWebsite: 'Website',
        modalSocialMedia: 'Social Media',
        modalLocation: 'Location',
        shopDetailsNotAvailable: 'Shop details not yet available, please look forward to it!',
        okButton: 'OK',
        notProvided: 'Not provided',
        newsletterSuccess: 'Thank you for subscribing! You will receive our latest news.',
        newsletterInvalidEmail: 'Please enter a valid email address.',
        newsletterError: 'Subscription failed, please try again later.',
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
        adminDashboardTitle: 'Admin Dashboard',
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
        noStoresYet: 'No stores yet. Add one!',
        editStoreBtn: 'Edit',
        deleteStoreBtn: 'Delete',
        confirmDelete: 'Are you sure you want to delete this store?',
        storeDeletedSuccess: 'Store deleted successfully!',
        storeDeleteFailed: 'Failed to delete store: ',
        storeUpdatedSuccess: 'Store updated successfully!',
        storeUpdateFailed: 'Failed to update store: ',
        adminAccessRequired: 'You do not have permission to access this page. Please log in as an administrator.',
        goToHomePage: 'Go to Home Page',
        editStoreModalTitle: 'Edit Store',
        saveChangesBtn: 'Save Changes',
        cancelBtn: 'Cancel',
        publicViewTitle: 'Sustainable Store Map',
        publicViewSubtitle: 'Explore sustainable stores in Taiwan and find businesses that support environmental protection, fair trade, and sustainable development.'
    },
    'fr': {
        pageTitle: 'Carte des Magasins Durables - Accueil',
        appName: 'Carte des Magasins Durables',
        home: 'Accueil',
        map: 'Carte',
        shopList: 'Liste des Magasins',
        newsletter: 'Newsletter',
        login: 'Connexion',
        register: 'S\'inscrire',
        adminPanel: 'Panneau d\'administration',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: 'Explorez les Magasins Durables de Taïwan',
        heroSubtitle: 'Trouvez des magasins qui soutiennent la protection de l\'environnement, le commerce équitable et le développement durable, et contribuez ensemble à la Terre.',
        viewMapBtn: 'Voir la Carte',
        browseShopsBtn: 'Parcourir la Liste des Magasins',
        searchTitle: 'Rechercher des Magasins Durables',
        searchPlaceholder: 'Entrez le nom du magasin ou l\'adresse...',
        filterCategoryTitle: 'Filtrer par Catégorie',
        filterAll: 'Tout',
        filterApparel: 'Vêtements',
        filterFood: 'Alimentation',
        filterCafe: 'Café',
        filterHomeGoods: 'Articles Ménagers',
        filterZeroWaste: 'Magasins Zéro Déchet',
        filterSecondHand: 'Magasins d\'Occasion',
        filterCreative: 'Créatif & Culturel',
        mapSectionTitle: 'Carte des Magasins Durables',
        shopListSectionTitle: 'Liste des Magasins Durables',
        viewDetailsBtn: 'Voir les Détails',
        loadMoreBtn: 'Charger Plus',
        newsletterTitle: 'Abonnez-vous à la Newsletter Vie Durable',
        newsletterSubtitle: 'Recevez les dernières informations sur les magasins durables, des conseils de vie écologique et des offres spéciales',
        newsletterPlaceholder: 'Votre e-mail',
        subscribeBtn: 'S\'abonner',
        footerAppName: 'Carte des Magasins Durables',
        footerAppDescription: 'Aider les consommateurs à trouver et à soutenir les magasins de développement durable, contribuant ensemble à la Terre.',
        contactUsTitle: 'Nous Contacter',
        contactUsText: 'Pour toute question ou suggestion, veuillez nous contacter',
        contactUsEmail: 'E-mail: info@sustainablemap.tw',
        followUsTitle: 'Suivez-nous',
        copyright: '© 2023 Carte des Magasins Durables - Tous Droits Réservés',
        modalAboutUs: 'À Propos de Nous',
        modalSustainability: 'Philosophie de Durabilité',
        modalVideoIntro: 'Introduction Vidéo',
        modalLatestCollections: 'Dernières Collections',
        modalShopInfo: 'Informations sur le Magasin',
        modalAddress: 'Adresse',
        modalOpeningHours: 'Heures d\'Ouverture',
        modalContactInfo: 'Coordonnées',
        modalPhone: 'Téléphone',
        modalEmail: 'E-mail',
        modalWebsite: 'Site Web',
        modalSocialMedia: 'Réseaux Sociaux',
        modalLocation: 'Localisation',
        shopDetailsNotAvailable: 'Les détails du magasin ne sont pas encore disponibles, veuillez patienter !',
        okButton: 'OK',
        notProvided: 'Non fourni',
        newsletterSuccess: 'Merci de votre abonnement ! Vous recevrez nos dernières nouvelles.',
        newsletterInvalidEmail: 'Veuillez entrer une adresse e-mail valide.',
        newsletterError: 'L\'abonnement a échoué, veuillez réessayer plus tard.',
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
        adminDashboardTitle: 'Panneau d\'administration',
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
        noStoresYet: 'Aucun magasin pour le moment. Ajoutez-en un !',
        editStoreBtn: 'Modifier',
        deleteStoreBtn: 'Supprimer',
        confirmDelete: 'Êtes-vous sûr de vouloir supprimer ce magasin ?',
        storeDeletedSuccess: 'Magasin supprimé avec succès !',
        storeDeleteFailed: 'Échec de la suppression du magasin : ',
        storeUpdatedSuccess: 'Magasin mis à jour avec succès !',
        storeUpdateFailed: 'Échec de la mise à jour du magasin : ',
        adminAccessRequired: 'Vous n\'avez pas la permission d\'accéder à cette page. Veuillez vous connecter en tant qu\'administrateur.',
        goToHomePage: 'Aller à la page d\'accueil',
        editStoreModalTitle: 'Modifier le magasin',
        saveChangesBtn: 'Enregistrer les modifications',
        cancelBtn: 'Annuler',
        publicViewTitle: 'Carte des Magasins Durables',
        publicViewSubtitle: 'Explorez les magasins durables à Taïwan et trouvez des entreprises qui soutiennent la protection de l\'environnement, le commerce équitable et le développement durable.'
    },
    'de': {
        pageTitle: 'Karte der Nachhaltigen Geschäfte - Startseite',
        appName: 'Karte der Nachhaltigen Geschäfte',
        home: 'Startseite',
        map: 'Karte',
        shopList: 'Geschäftsliste',
        newsletter: 'Newsletter',
        login: 'Anmelden',
        register: 'Registrieren',
        adminPanel: 'Admin-Panel',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: 'Entdecken Sie Taiwans Nachhaltige Geschäfte',
        heroSubtitle: 'Finden Sie Geschäfte, die Umweltschutz, fairen Handel und nachhaltige Entwicklung unterstützen, und tragen Sie gemeinsam zum Wohl der Erde bei.',
        viewMapBtn: 'Karte Ansehen',
        browseShopsBtn: 'Geschäftsliste Durchsuchen',
        searchTitle: 'Nach Nachhaltigen Geschäften Suchen',
        searchPlaceholder: 'Geschäftsname oder Adresse eingeben...',
        filterCategoryTitle: 'Nach Kategorie Filtern',
        filterAll: 'Alle',
        filterApparel: 'Bekleidung',
        filterFood: 'Lebensmittel',
        filterCafe: 'Café',
        filterHomeGoods: 'Haushaltswaren',
        filterZeroWaste: 'Unverpackt-Läden',
        filterSecondHand: 'Second-Hand-Läden',
        filterCreative: 'Kreatives & Kulturelles',
        mapSectionTitle: 'Nachhaltige Geschäfte auf der Karte',
        shopListSectionTitle: 'Liste der Nachhaltigen Geschäfte',
        viewDetailsBtn: 'Details Ansehen',
        loadMoreBtn: 'Mehr Laden',
        newsletterTitle: 'Nachhaltiger Leben Newsletter Abonnieren',
        newsletterSubtitle: 'Erhalten Sie die neuesten Informationen zu nachhaltigen Geschäften, umweltfreundliche Lebenstipps und Sonderangebote',
        newsletterPlaceholder: 'Ihre E-Mail-Adresse',
        subscribeBtn: 'Abonnieren',
        footerAppName: 'Karte der Nachhaltigen Geschäfte',
        footerAppDescription: 'Verbrauchern helfen, nachhaltige Entwicklungsgeschäfte zu finden und zu unterstützen, gemeinsam zur Erde beitragen.',
        contactUsTitle: 'Kontaktieren Sie Uns',
        contactUsText: 'Bei Fragen oder Anregungen kontaktieren Sie uns bitte',
        contactUsEmail: 'E-Mail: info@sustainablemap.tw',
        followUsTitle: 'Folgen Sie Uns',
        copyright: '© 2023 Karte der Nachhaltigen Geschäfte - Alle Rechte Vorbehalten',
        modalAboutUs: 'Über Uns',
        modalSustainability: 'Nachhaltigkeitsphilosophie',
        modalVideoIntro: 'Video-Einführung',
        modalLatestCollections: 'Neueste Kollektionen',
        modalShopInfo: 'Geschäftsinformationen',
        modalAddress: 'Adresse',
        modalOpeningHours: 'Öffnungszeiten',
        modalContactInfo: 'Kontaktinformationen',
        modalPhone: 'Telefon',
        modalEmail: 'E-Mail',
        modalWebsite: 'Webseite',
        modalSocialMedia: 'Soziale Medien',
        modalLocation: 'Standort',
        shopDetailsNotAvailable: 'Geschäftsdetails noch nicht verfügbar, bitte freuen Sie sich darauf!',
        okButton: 'OK',
        notProvided: 'Nicht angegeben',
        newsletterSuccess: 'Vielen Dank für Ihr Abonnement! Sie erhalten unsere neuesten Nachrichten.',
        newsletterInvalidEmail: 'Bitte geben Sie eine gültige E-Mail-Adresse ein.',
        newsletterError: 'Abonnement fehlgeschlagen, bitte versuchen Sie es später erneut.',
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
        adminDashboardTitle: 'Admin-Dashboard',
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
        noStoresYet: 'Noch keine Läden vorhanden. Fügen Sie einen hinzu!',
        editStoreBtn: 'Bearbeiten',
        deleteStoreBtn: 'Löschen',
        confirmDelete: 'Möchten Sie diesen Laden wirklich löschen?',
        storeDeletedSuccess: 'Laden erfolgreich gelöscht!',
        storeDeleteFailed: 'Löschen des Ladens fehlgeschlagen: ',
        storeUpdatedSuccess: 'Laden erfolgreich aktualisiert!',
        storeUpdateFailed: 'Aktualisierung des Ladens fehlgeschlagen: ',
        adminAccessRequired: 'Sie haben keine Berechtigung, auf diese Seite zuzugreifen. Bitte melden Sie sich als Administrator an.',
        goToHomePage: 'Zur Startseite',
        editStoreModalTitle: 'Laden bearbeiten',
        saveChangesBtn: 'Änderungen speichern',
        cancelBtn: 'Abbrechen',
        publicViewTitle: 'Karte der Nachhaltigen Geschäfte',
        publicViewSubtitle: 'Entdecken Sie nachhaltige Geschäfte in Taiwan und finden Sie Unternehmen, die Umweltschutz, fairen Handel und nachhaltige Entwicklung unterstützen.'
    },
    'es': {
        pageTitle: 'Mapa de Tiendas Sostenibles - Inicio',
        appName: 'Mapa de Tiendas Sostenibles',
        home: 'Inicio',
        map: 'Mapa',
        shopList: 'Lista de Tiendas',
        newsletter: 'Boletín',
        login: 'Iniciar Sesión',
        register: 'Registrarse',
        adminPanel: 'Panel de administrador',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: 'Explora las Tiendas Sostenibles de Taiwán',
        heroSubtitle: 'Encuentra tiendas que apoyan la protección del medio ambiente, el comercio justo y el desarrollo sostenible, y contribuye junto a la Tierra.',
        viewMapBtn: 'Ver Mapa',
        browseShopsBtn: 'Explorar Lista de Tiendas',
        searchTitle: 'Buscar Tiendas Sostenibles',
        searchPlaceholder: 'Introduce el nombre o la dirección de la tienda...',
        filterCategoryTitle: 'Filtrar por Categoría',
        filterAll: 'Todo',
        filterApparel: 'Ropa',
        filterFood: 'Comida',
        filterCafe: 'Cafetería',
        filterHomeGoods: 'Artículos para el Hogar',
        filterZeroWaste: 'Tiendas de Cero Residuos',
        filterSecondHand: 'Tiendas de Segunda Mano',
        filterCreative: 'Creativo y Cultural',
        mapSectionTitle: 'Mapa de Tiendas Sostenibles',
        shopListSectionTitle: 'Lista de Tiendas Sostenibles',
        viewDetailsBtn: 'Ver Detalles',
        loadMoreBtn: 'Cargar Más',
        newsletterTitle: 'Suscríbete al Boletín de Vida Sostenible',
        newsletterSubtitle: 'Recibe la última información sobre tiendas sostenibles, consejos de vida ecológica y ofertas especiales',
        newsletterPlaceholder: 'Tu correo electrónico',
        subscribeBtn: 'Suscribirse',
        footerAppName: 'Mapa de Tiendas Sostenibles',
        footerAppDescription: 'Ayudando a los consumidores a encontrar y apoyar tiendas de desarrollo sostenible, contribuyendo juntos a la Tierra.',
        contactUsTitle: 'Contáctanos',
        contactUsText: 'Para cualquier pregunta o sugerencia, por favor contáctanos',
        contactUsEmail: 'Correo electrónico: info@sustainablemap.tw',
        followUsTitle: 'Síguenos',
        copyright: '© 2023 Mapa de Tiendas Sostenibles - Todos los Derechos Reservados',
        modalAboutUs: 'Sobre Nosotros',
        modalSustainability: 'Filosofía de Sostenibilidad',
        modalVideoIntro: 'Introducción en Video',
        modalLatestCollections: 'Últimas Colecciones',
        modalShopInfo: 'Información de la Tienda',
        modalAddress: 'Dirección',
        modalOpeningHours: 'Horario de Apertura',
        modalContactInfo: 'Información de Contacto',
        modalPhone: 'Teléfono',
        modalEmail: 'Correo electrónico',
        modalWebsite: 'Sitio web',
        modalSocialMedia: 'Redes Sociales',
        modalLocation: 'Ubicación',
        shopDetailsNotAvailable: 'Los detalles de la tienda aún no están disponibles, ¡espéralos con ansias!',
        okButton: 'OK',
        notProvided: 'No proporcionado',
        newsletterSuccess: '¡Gracias por suscribirte! Recibirás nuestras últimas noticias.',
        newsletterInvalidEmail: 'Por favor, introduce una dirección de correo electrónico válida.',
        newsletterError: 'Error al suscribirse, por favor, inténtalo de nuevo más tarde.',
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
        adminDashboardTitle: 'Panel de administrador',
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
        noStoresYet: 'Aún no hay tiendas. ¡Añada una!',
        editStoreBtn: 'Editar',
        deleteStoreBtn: 'Eliminar',
        confirmDelete: '¿Está seguro de que desea eliminar esta tienda?',
        storeDeletedSuccess: '¡Tienda eliminada con éxito!',
        storeDeleteFailed: 'Error al eliminar tienda: ',
        storeUpdatedSuccess: '¡Tienda actualizada con éxito!',
        storeUpdateFailed: 'Error al actualizar tienda: ',
        adminAccessRequired: 'No tiene permiso para acceder a esta página. Por favor, inicie sesión como administrador.',
        goToHomePage: 'Ir a la página de inicio',
        editStoreModalTitle: 'Editar tienda',
        saveChangesBtn: 'Guardar cambios',
        cancelBtn: 'Cancelar',
        publicViewTitle: 'Mapa de Tiendas Sostenibles',
        publicViewSubtitle: 'Explore tiendas sostenibles en Taiwán y encuentre negocios que apoyan la protección del medio ambiente, el comercio justo y el desarrollo sostenible.'
    },
    'la': {
        pageTitle: 'Tabula Copiarum Sustentabilium - Pagina Prima',
        appName: 'Tabula Copiarum Sustentabilium',
        home: 'Pagina Prima',
        map: 'Tabula',
        shopList: 'Index Copiarum',
        newsletter: 'Epistula Nuntia',
        login: 'Log In',
        register: 'Register',
        adminPanel: 'Panneau d\'administration',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: 'Explora Copias Sustentabiles Taiwaniae',
        heroSubtitle: 'Reperi copias quae tutelam naturae, commercium aequum, progressionemque sustentabilem adiuvant, et una pro Terra opera da.',
        viewMapBtn: 'Vide Tabulam',
        browseShopsBtn: 'Percurrere Indicem Copiarum',
        searchTitle: 'Quaerere Copias Sustentabiles',
        searchPlaceholder: 'Intra nomen copiae vel inscriptionem...',
        filterCategoryTitle: 'Per Categoriem Filtra',
        filterAll: 'Omnia',
        filterApparel: 'Vestimenta',
        filterFood: 'Cibi',
        filterCafe: 'Taberna Coffeae',
        filterHomeGoods: 'Res Domesticae',
        filterZeroWaste: 'Copiae Sine Vaste',
        filterSecondHand: 'Copiae Secundae Manus',
        filterCreative: 'Creativum et Culturale',
        mapSectionTitle: 'Tabula Copiarum Sustentabilium',
        shopListSectionTitle: 'Index Copiarum Sustentabilium',
        viewDetailsBtn: 'Vide Singula',
        loadMoreBtn: 'Plura Carica',
        newsletterTitle: 'Subscribere Epistulae Nuntiae Vitae Sustentabilis',
        newsletterSubtitle: 'Accipe recentissimas informationes de copiia sustentabilibus, consilia vitae naturae amicae, et oblationes speciales',
        newsletterPlaceholder: 'Tua epistula electronica',
        subscribeBtn: 'Subscribere',
        footerAppName: 'Tabula Copiarum Sustentabilium',
        footerAppDescription: 'Adiuvare consumptores ut copias progressionis sustentabilis inveniant et sustineant, una pro Terra cooperantes.',
        contactUsTitle: 'Contacta Nos',
        contactUsText: 'Pro quibusvis quaestionibus vel suggestionibus, quaeso nos contacta',
        contactUsEmail: 'Epistula electronica: info@sustainablemap.tw',
        followUsTitle: 'Sequere Nos',
        copyright: '© 2023 Tabula Copiarum Sustentabilium - Omnia Iura Reservata',
        modalAboutUs: 'De Nobis',
        modalSustainability: 'Philosophia Sustentabilitatis',
        modalVideoIntro: 'Introductio Video',
        modalLatestCollections: 'Novissimae Collectiones',
        modalShopInfo: 'Informatio Copiae',
        modalAddress: 'Inscriptio',
        modalOpeningHours: 'Horae Aperturae',
        modalContactInfo: 'Contacta Informatio',
        modalPhone: 'Telephonum',
        modalEmail: 'Epistula electronica',
        modalWebsite: 'Situs Interretialis',
        modalSocialMedia: 'Media Socialia',
        modalLocation: 'Locus',
        shopDetailsNotAvailable: 'Singula copiae nondum praesto sunt, quaeso exspecta!',
        okButton: 'Bene',
        notProvided: 'Non provisum',
        newsletterSuccess: 'Gratias tibi pro subscriptione! Nuntios nostros recentissimos accipies.',
        newsletterInvalidEmail: 'Quaeso, inscriptionem electronicam validam inscribe.',
        newsletterError: 'Subscriptio defecit, quaeso postea iterum conare.',
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
        adminDashboardTitle: 'Tabula Imperii',
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
        noStoresYet: 'Nullae copiae adhuc. Adde unam!',
        editStoreBtn: 'Edit',
        deleteStoreBtn: 'Delete',
        confirmDelete: 'Esne certus vis delere hanc copiam?',
        storeDeletedSuccess: 'Copia feliciter deleta!',
        storeDeleteFailed: 'Defuit ad delere copiam: ',
        storeUpdatedSuccess: 'Copia feliciter updated!',
        storeUpdateFailed: 'Defuit ad update copiam: ',
        adminAccessRequired: 'Non habes licentiam ad hanc paginam. Quaeso, ini in ratione administratoris.',
        goToHomePage: 'Ire ad Pagina Prima',
        editStoreModalTitle: 'Edit Copiam',
        saveChangesBtn: 'Serva Mutationes',
        cancelBtn: 'Cancella',
        publicViewTitle: 'Tabula Copiarum Sustentabilium',
        publicViewSubtitle: 'Explora copias sustentabiles in Taiwan et reperi negotia quae tutelam naturae, commercium aequum, et progressionem sustentabilem adiuvant.'
    },
    'ja': {
        pageTitle: 'サステナブルショップマップ - ホーム',
        appName: 'サステナブルショップマップ',
        home: 'ホーム',
        map: 'マップ',
        shopList: 'ショップリスト',
        newsletter: 'ニュースレター',
        login: 'ログイン',
        register: '登録',
        adminPanel: '管理パネル',
        langChinese: '繁體中文',
        langEnglish: 'English',
        langFrench: 'Français',
        langGerman: 'Deutsch',
        langSpanish: 'Español',
        langLatin: 'Latin',
        langJapanese: '日本語',
        heroTitle: '台湾のサステナブルショップを探す',
        heroSubtitle: '環境保護、フェアトレード、持続可能な開発を支援するショップを見つけて、一緒に地球に貢献しましょう。',
        viewMapBtn: 'マップを見る',
        browseShopsBtn: 'ショップリストを見る',
        searchTitle: 'サステナブルショップを検索',
        searchPlaceholder: 'ショップ名または住所を入力...',
        filterCategoryTitle: 'カテゴリで絞り込む',
        filterAll: 'すべて',
        filterApparel: 'アパレル',
        filterFood: '食品',
        filterCafe: 'カフェ',
        filterHomeGoods: '家庭用品',
        filterZeroWaste: 'ゼロウェイストショップ',
        filterSecondHand: 'リサイクルショップ',
        filterCreative: '文具・雑貨',
        mapSectionTitle: 'サステナブルショップマップ',
        shopListSectionTitle: 'サステナブルショップリスト',
        viewDetailsBtn: '詳細を見る',
        loadMoreBtn: 'もっと読み込む',
        newsletterTitle: 'サステナブルライフニュースレターを購読',
        newsletterSubtitle: '最新のサステナブルショップ情報、エコライフのヒント、特別オファーを受け取る',
        newsletterPlaceholder: 'あなたのメールアドレス',
        subscribeBtn: '購読する',
        footerAppName: 'サステナブルショップマップ',
        footerAppDescription: '消費者が持続可能な開発を支援するショップを見つけて支援し、一緒に地球に貢献するのを助けます。',
        contactUsTitle: 'お問い合わせ',
        contactUsText: 'ご質問やご提案がありましたら、お気軽にお問い合わせください',
        contactUsEmail: 'Eメール：info@sustainablemap.tw',
        followUsTitle: 'フォローする',
        copyright: '© 2023 サステナブルショップマップ - 全著作権所有',
        modalAboutUs: '私たちについて',
        modalSustainability: 'サステナビリティ理念',
        modalVideoIntro: 'ビデオ紹介',
        modalLatestCollections: '最新コレクション',
        modalShopInfo: 'ショップ情報',
        modalAddress: '住所',
        modalOpeningHours: '営業時間',
        modalContactInfo: '連絡先情報',
        modalPhone: '電話',
        modalEmail: 'Eメール',
        modalWebsite: 'ウェブサイト',
        modalSocialMedia: 'ソーシャルメディア',
        modalLocation: '場所',
        shopDetailsNotAvailable: 'ショップの詳細はまだ利用できません。お楽しみに！',
        okButton: 'OK',
        notProvided: '提供されていません',
        newsletterSuccess: 'ご購読ありがとうございます！最新情報をお届けします。',
        newsletterInvalidEmail: '有効なメールアドレスを入力してください。',
        newsletterError: '購読に失敗しました。後でもう一度お試しください。',
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
        adminDashboardTitle: '管理ダッシュボード',
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
        noStoresYet: 'まだ店舗がありません。追加してください！',
        editStoreBtn: '編集',
        deleteStoreBtn: '削除',
        confirmDelete: 'この店舗を削除してもよろしいですか？',
        storeDeletedSuccess: '店舗が正常に削除されました！',
        storeDeleteFailed: '店舗の削除に失敗しました：',
        storeUpdatedSuccess: '店舗が正常に更新されました！',
        storeUpdateFailed: '店舗の更新に失敗しました：',
        adminAccessRequired: 'このページにアクセスする権限がありません。管理者としてログインしてください。',
        goToHomePage: 'ホームページへ移動',
        editStoreModalTitle: '店舗を編集',
        saveChangesBtn: '変更を保存',
        cancelBtn: 'キャンセル',
        publicViewTitle: 'サステナブルショップマップ',
        publicViewSubtitle: '台湾の持続可能な店舗を探索し、環境保護、フェアトレード、持続可能な開発を支援するビジネスを見つけてください。'
    }
};

// --- AuthContext 創建 ---
const AuthContext = createContext();

// --- AuthProvider 組件 ---
function AuthProvider({ children }) {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); // 新增 isAdmin 狀態

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // 檢查使用者是否是管理員
                const userDocRef = doc(db, "userRoles", user.uid);
                const userDocSnap = await getDoc(userDocRef);
                if (userDocSnap.exists() && userDocSnap.data().role === 'admin') {
                    setIsAdmin(true);
                } else {
                    setIsAdmin(false);
                }
                setCurrentUser(user);
            } else {
                setCurrentUser(null);
                setIsAdmin(false);
            }
            setLoading(false);
        });
        return unsubscribe;
    }, []); // 依賴項為空數組，只在組件 mount 時執行一次

    const value = {
        currentUser,
        loading,
        isAdmin, // 提供 isAdmin 狀態
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

// --- 公開頁面組件 (地圖與商店列表) ---
function PublicView({ currentLang, setRoute }) {
    const [shops, setShops] = useState([]); // 從 Firestore 讀取商店資料

    useEffect(() => {
        const q = query(collection(db, "stores"));
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const shopsData = [];
            snapshot.forEach((doc) => {
                shopsData.push({ id: doc.id, ...doc.data() });
            });
            setShops(shopsData);
        }, (error) => {
            console.error("Error fetching shops for public view: ", error);
        });
        return () => unsubscribe();
    }, []);

    // 模擬 shopDetails 數據，以備地圖需要特定格式的資料，如果Firestore中沒有經緯度
    // 或者可以調整map marker的數據來源直接從firestore的shops中提取
    const mapShops = shops.map(shop => ({
        id: shop.id,
        lat: shop.latitude || 25.0330, // 假設Firestore有經緯度，否則給預設值
        lng: shop.longitude || 121.5500,
        name: shop.name,
        type: shop.type,
        address: shop.address,
        description: shop.description
    }));

    useEffect(() => {
        let mapInstance;
        // 確保 Leaflet 庫已載入
        if (typeof L !== 'undefined') {
            mapInstance = L.map('public-sustainability-map').setView([25.0330, 121.5654], 13);
            
            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(mapInstance);
            
            const markersGroup = L.featureGroup();
            mapShops.forEach(shop => {
                const marker = L.marker([shop.lat, shop.lng]);
                marker.bindPopup(`<b>${shop.name}</b><br>${shop.type}<br>${shop.address}<br>`); // 暫時不顯示詳情按鈕
                markersGroup.addLayer(marker);
            });
            markersGroup.addTo(mapInstance);
        }

        return () => {
            if (mapInstance) {
                mapInstance.remove();
            }
        };
    }, [mapShops]); // 當mapShops變動時重新渲染地圖

    return (
        <main className="font-inter">
            <section className="hero-section py-20 md:py-32 text-white bg-cover bg-center" style={{ backgroundImage: "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?ixlib=rb-1.2.1&auto=format&fit=crop&w=1200&q=80')" }}>
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold mb-6">{translations[currentLang].publicViewTitle}</h1>
                    <p className="text-xl max-w-2xl mx-auto mb-8">{translations[currentLang].publicViewSubtitle}</p>
                    <div className="flex flex-col md:flex-row justify-center gap-4">
                        <a href="#map" className="bg-white text-green-600 px-8 py-3 rounded-full font-medium shadow-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105">{translations[currentLang].viewMapBtn}</a>
                        <a href="#shops" className="bg-green-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105">{translations[currentLang].browseShopsBtn}</a>
                    </div>
                </div>
            </section>

            {/* 搜尋篩選區塊 (簡化版，無實際搜尋邏輯) */}
            <section className="py-12 bg-gray-50">
                <div className="container mx-auto px-4">
                    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg p-6">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-gray-800 mb-4">{translations[currentLang].searchTitle}</h2>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <input type="text" id="public-search-input" placeholder={translations[currentLang].searchPlaceholder} className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200" />
                                <button id="public-search-button" className="bg-green-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-600 transition-colors duration-200 shadow-md">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                    </svg>
                                </button>
                            </div>
                        </div>
                        <div>
                            <h3 className="font-medium text-gray-700 mb-3">{translations[currentLang].filterCategoryTitle}</h3>
                            <div className="flex flex-wrap gap-2" id="public-filter-buttons-container">
                                {/* 為了簡化，這裡的篩選按鈕暫時沒有實際功能 */}
                                <button className="tag px-3 py-1 rounded-full text-sm bg-green-200 text-green-800 hover:bg-green-300 transition-colors duration-200">{translations[currentLang].filterAll}</button>
                                <button className="tag px-3 py-1 rounded-full text-sm bg-blue-200 text-blue-800 hover:bg-blue-300 transition-colors duration-200">{translations[currentLang].filterApparel}</button>
                                <button className="tag px-3 py-1 rounded-full text-sm bg-yellow-200 text-yellow-800 hover:bg-yellow-300 transition-colors duration-200">{translations[currentLang].filterFood}</button>
                                <button className="tag px-3 py-1 rounded-full text-sm bg-purple-200 text-purple-800 hover:bg-purple-300 transition-colors duration-200">{translations[currentLang].filterCafe}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="map" className="py-12 bg-green-100">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{translations[currentLang].mapSectionTitle}</h2>
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-green-200">
                        <div className="map-container">
                            <div id="public-sustainability-map" className="h-96 md:h-[500px] w-full"></div>
                        </div>
                    </div>
                </div>
            </section>

            <section id="shops" className="py-12 bg-white">
                <div className="container mx-auto px-4">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">{translations[currentLang].shopListSectionTitle}</h2>
                    {shops.length === 0 ? (
                        <p className="text-gray-600 text-center py-8">{translations[currentLang].noStoresYet}</p>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {shops.map(shop => (
                                <div key={shop.id} className="shop-card bg-white rounded-xl overflow-hidden shadow-md transform transition-all duration-300 hover:scale-[1.02] hover:shadow-lg border border-gray-200">
                                    <div className="h-48 bg-gray-100 flex items-center justify-center text-gray-400 text-6xl">
                                        {/* 商店圖標或圖片佔位符 */}
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                                        </svg>
                                    </div>
                                    <div className="p-6 flex flex-col justify-between flex-grow">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-xl font-bold text-green-800">{shop.name || translations[currentLang].notProvided}</h3>
                                            <span className="tag px-3 py-1 rounded-full text-xs font-semibold bg-green-200 text-green-800">{shop.type || translations[currentLang].notProvided}</span>
                                        </div>
                                        <p className="text-gray-600 mb-4 text-sm leading-relaxed">{shop.description || translations[currentLang].notProvided}</p>
                                        <div className="mb-4">
                                            <div className="flex items-center text-gray-600 text-sm mb-1">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                </svg>
                                                {shop.address || translations[currentLang].notProvided}
                                            </div>
                                            {/* 假設沒有營業時間或電話等詳細信息用於公開列表，這裡只顯示地址 */}
                                        </div>
                                        <button className="block w-full text-center py-2 bg-gradient-to-r from-green-500 to-green-700 text-white rounded-lg hover:from-green-600 hover:to-green-800 transition-all duration-300 font-medium shadow-md" onClick={() => {/* showShopDetail(shop.id) */}} data-i18n="viewDetailsBtn">
                                            {translations[currentLang].viewDetailsBtn}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="text-center mt-8">
                        <button id="load-more-button" className="bg-green-500 text-white px-8 py-3 rounded-full font-medium shadow-lg hover:bg-green-600 transition-all duration-300 transform hover:scale-105" data-i18n="loadMoreBtn">{translations[currentLang].loadMoreBtn}</button>
                    </div>
                </div>
            </section>

            <section id="newsletter" className="py-12 bg-gradient-to-r from-green-600 to-green-800 text-white">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto text-center">
                        <h2 className="text-3xl font-bold mb-4">{translations[currentLang].newsletterTitle}</h2>
                        <p className="mb-6">{translations[currentLang].newsletterSubtitle}</p>
                        <div className="flex flex-col md:flex-row gap-4">
                            <input type="email" id="newsletter-email" placeholder={translations[currentLang].newsletterPlaceholder} className="flex-1 px-4 py-3 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-white focus:border-transparent transition-all duration-200" />
                            <button id="subscribe-button" className="bg-white text-green-700 px-6 py-3 rounded-lg font-medium hover:bg-gray-100 transition-all duration-200 shadow-md">{translations[currentLang].subscribeBtn}</button>
                        </div>
                    </div>
                </div>
            </section>

            <footer className="bg-gray-900 text-white py-10">
                <div className="container mx-auto px-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4">{translations[currentLang].footerAppName}</h3>
                            <p className="text-gray-400 text-sm">{translations[currentLang].footerAppDescription}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">{translations[currentLang].contactUsTitle}</h3>
                            <p className="text-gray-400 text-sm">{translations[currentLang].contactUsText}</p>
                            <p className="text-gray-400 text-sm">{translations[currentLang].contactUsEmail}</p>
                        </div>
                        <div>
                            <h3 className="text-xl font-bold mb-4">{translations[currentLang].followUsTitle}</h3>
                            <div className="flex space-x-4">
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M22.675 0h-21.35c-.732 0-1.325.593-1.325 1.325v21.351c0 .731.593 1.324 1.325 1.324h11.495v-9.294h-3.128v-3.622h3.128v-2.671c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12v9.293h6.116c.73 0 1.323-.593 1.323-1.325v-21.35c0-.732-.593-1.325-1.325-1.325z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6.066 9.645c.183 4.04-2.83 8.544-8.164 8.544-1.622 0-3.131-.476-4.402-1.291 1.524.18 3.045-.244 4.252-1.189-1.256-.023-2.317-.854-2.684-1.995.451.086.895.061 1.298-.049-1.381-.278-2.335-1.522-2.304-2.853.388.215.83.344 1.301.359-1.279-.855-1.641-2.544-.889-3.835 1.416 1.738 3.533 2.881 5.92 3.001-.419-1.796.944-3.527 2.799-3.527.825 0 1.572.349 2.096.907.654-.128 1.27-.368 1.824-.697-.215.671-.67 1.233-1.263 1.589.581-.07 1.135-.224 1.649-.453-.384.578-.87 1.084-1.433 1.489z"/>
                                    </svg>
                                </a>
                                <a href="#" className="text-gray-400 hover:text-white transition-colors duration-200">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div className="border-t border-gray-700 mt-8 pt-6 text-center text-gray-400">
                        <p data-i18n="copyright">{translations[currentLang].copyright}</p>
                    </div>
                </div>
            </footer>
        </main>
    );
}

// --- 主要應用程式組件 ---
export default function App() {
    const [currentRoute, setRoute] = useState('home'); // 初始路由為首頁
    const [currentLang, setCurrentLang] = useState(localStorage.getItem('lang') || 'zh-TW');

    // 語言切換邏輯
    const handleLanguageChange = (e) => {
        const newLang = e.target.value;
        setCurrentLang(newLang);
        localStorage.setItem('lang', newLang);
    };

    // 渲染導覽列
    const renderNavbar = (isAdmin) => (
        <nav className="bg-white shadow-md sticky top-0 z-50 py-3">
            <div className="container mx-auto px-4 flex justify-between items-center">
                <div className="flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-9 w-9 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <a href="#" className="text-2xl font-bold text-gray-800 hover:text-green-700 transition-colors duration-200" onClick={() => setRoute('home')}>{translations[currentLang].appName}</a>
                </div>
                <div className="hidden md:flex space-x-6 items-center">
                    <button onClick={() => setRoute('home')} className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].home}</button>
                    {/* <a href="#map" className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].map}</a> */}
                    {/* <a href="#shops" className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].shopList}</a> */}
                    {/* <a href="#newsletter" className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].newsletter}</a> */}
                    {isAdmin && (
                        <button onClick={() => setRoute('admin')} className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].adminPanel}</button>
                    )}
                    <button onClick={() => setRoute('login')} className="text-gray-700 hover:text-green-600 transition-colors duration-200 font-medium">{translations[currentLang].login}</button>
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
                <button onClick={() => setRoute('home')} className="block py-2 text-gray-700 hover:text-green-600 w-full text-left font-medium">
                    {translations[currentLang].home}
                </button>
                {isAdmin && (
                    <button onClick={() => setRoute('admin')} className="block py-2 text-gray-700 hover:text-green-600 w-full text-left font-medium">{translations[currentLang].adminPanel}</button>
                )}
                <button onClick={() => setRoute('login')} className="block py-2 text-gray-700 hover:text-green-600 w-full text-left font-medium">
                    {translations[currentLang].login}
                </button>
            </div>
        </nav>
    );

    return (
        <AuthProvider>
            <AuthContext.Consumer>
                {({ currentUser, loading, isAdmin }) => {
                    return (
                        <>
                            {renderNavbar(isAdmin)}
                            {loading ? (
                                <div className="min-h-screen flex items-center justify-center text-xl text-gray-600 bg-gray-50">
                                    載入中...
                                </div>
                            ) : (
                                <>
                                    {currentRoute === 'login' && !currentUser && <Login setRoute={setRoute} currentLang={currentLang} />}
                                    {currentRoute === 'register' && !currentUser && <Register setRoute={setRoute} currentLang={currentLang} />}
                                    {currentRoute === 'home' && <PublicView currentLang={currentLang} setRoute={setRoute} />}
                                    {currentRoute === 'admin' && currentUser && isAdmin && <AdminDashboard currentLang={currentLang} setRoute={setRoute} />}
                                    {/* 未登入或無權限訪問 Admin 時，導向首頁或提示 */}
                                    {currentRoute === 'admin' && currentUser && !isAdmin && (
                                        <section className="min-h-screen flex items-center justify-center bg-red-50 text-red-700 text-center text-2xl font-bold p-8">
                                            {translations[currentLang].adminAccessRequired}
                                            <button onClick={() => setRoute('home')} className="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition">
                                                {translations[currentLang].goToHomePage}
                                            </button>
                                        </section>
                                    )}
                                </>
                            )}
                        </>
                    );
                }}
            </AuthContext.Consumer>
        </AuthProvider>
    );
}
