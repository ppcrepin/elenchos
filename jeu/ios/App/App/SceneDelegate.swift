// Généré par Capacitor 8.5.3 (`npx cap add ios`), puis adapté pour Elenchos (étape 1, coquille) : la fenêtre porte
// notre contrôleur, qui inscrit le module natif d'Elenchos (ElenchosBridgeViewController.swift). La fenêtre est faite
// ici seulement : l'application n'a pas de storyboard.

import Capacitor
import UIKit

class SceneDelegate: UIResponder, UIWindowSceneDelegate {
    var window: UIWindow?

    func scene(_ scene: UIScene, willConnectTo session: UISceneSession, options connectionOptions: UIScene.ConnectionOptions) {
        guard let windowScene = scene as? UIWindowScene else { return }

        window = UIWindow(windowScene: windowScene)
        window?.rootViewController = ElenchosBridgeViewController()
        window?.makeKeyAndVisible()

        SceneDelegateProxy.shared.scene(scene, willConnectTo: session, options: connectionOptions)
    }

    // Les adresses reçues (lien universel `…/invitation#lien=…`, retour de Google `elenchos://connexion#code=…`)
    // passent au module officiel du cycle de vie, qui les donne à l'interface (étape 2 ; CONTRAT.md, partie 4).
    func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
        SceneDelegateProxy.shared.scene(scene, openURLContexts: URLContexts)
    }

    func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
        SceneDelegateProxy.shared.scene(scene, continue: userActivity)
    }
}
