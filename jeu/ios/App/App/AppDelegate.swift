// Généré par Capacitor 8.5.3 (`npx cap add ios`), puis adapté pour Elenchos (étape 1, coquille) :
// - transmet le jeton d'appareil d'Apple au module officiel des notifications (sa notice, partie iOS) ;
// - commentaires du modèle d'origine retirés.
// Rien n'est écrit dans les journaux (P-07).

import Capacitor
import UIKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        return true
    }

    func application(_ application: UIApplication,
                     configurationForConnecting connectingSceneSession: UISceneSession,
                     options: UIScene.ConnectionOptions) -> UISceneConfiguration {
        let config = UISceneConfiguration(name: "Default Configuration",
                                          sessionRole: connectingSceneSession.role)
        config.delegateClass = SceneDelegate.self
        return config
    }

    // Le message de 18h : iOS rend le jeton d'appareil ici ; le module des notifications le passe à l'interface
    // (événement « registration »), qui l'envoie au serveur (`POST /api/abonnement`, CONTRAT.md 2.13).
    func application(_ application: UIApplication, didRegisterForRemoteNotificationsWithDeviceToken deviceToken: Data) {
        NotificationCenter.default.post(name: .capacitorDidRegisterForRemoteNotifications, object: deviceToken)
    }

    func application(_ application: UIApplication, didFailToRegisterForRemoteNotificationsWithError error: Error) {
        NotificationCenter.default.post(name: .capacitorDidFailToRegisterForRemoteNotifications, object: error)
    }
}
