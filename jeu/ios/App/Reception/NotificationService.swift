// Elenchos, étape 1 (coquille). L'extension de réception (Notification Service Extension) : à chaque message reçu,
// elle signale la réception au serveur, `POST /api/recu { envoi }`, sans session ni autre donnée, puis laisse le
// message s'afficher tel quel. C'est la mesure « message reçu » (produit.md §8 ; CONTRAT.md 2.13 ;
// DECISIONS-TECHNIQUES.md 1.3).
//
// - `envoi` est le numéro d'envoi tiré au hasard par le serveur, sans lien avec le joueur (`MessageApns`).
// - L'adresse du serveur est fixée à la fabrication (`ElenchosServeur` dans Info.plist, tiré du réglage
//   ELENCHOS_SERVEUR) ; sans adresse valable, rien ne part.
// - Le message n'est jamais modifié, et s'affiche même si l'envoi échoue ou tarde : iOS laisse environ 30 secondes.
// - iOS n'appelle l'extension que si le joueur a accepté les messages avec alerte (documentation d'Apple).
// Rien n'est écrit dans les journaux (P-07).

import Foundation
import UserNotifications

final class NotificationService: UNNotificationServiceExtension {
    private let verrou = NSLock()
    private var rendre: ((UNNotificationContent) -> Void)?
    private var contenu: UNNotificationContent?
    private var tache: URLSessionDataTask?

    override func didReceive(_ request: UNNotificationRequest, withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void) {
        verrou.lock()
        rendre = contentHandler
        contenu = request.content
        verrou.unlock()

        guard let envoi = request.content.userInfo["envoi"] as? String,
              Self.envoiValide(envoi),
              let adresse = Self.adresseRecu(),
              let corps = try? JSONSerialization.data(withJSONObject: ["envoi": envoi]) else {
            terminer()
            return
        }

        var demande = URLRequest(url: adresse, cachePolicy: .reloadIgnoringLocalAndRemoteCacheData, timeoutInterval: 20)
        demande.httpMethod = "POST"
        demande.setValue("application/json", forHTTPHeaderField: "Content-Type")
        demande.httpBody = corps
        demande.httpShouldHandleCookies = false

        let configuration = URLSessionConfiguration.ephemeral
        configuration.httpCookieAcceptPolicy = .never
        configuration.urlCache = nil
        let session = URLSession(configuration: configuration)
        let tache = session.dataTask(with: demande) { _, _, _ in
            self.terminer()
        }
        verrou.lock()
        self.tache = tache
        verrou.unlock()
        tache.resume()
        session.finishTasksAndInvalidate()
    }

    override func serviceExtensionTimeWillExpire() {
        verrou.lock()
        let enCours = tache
        verrou.unlock()
        enCours?.cancel()
        terminer()
    }

    /// Rend le message tel qu'il est arrivé, une seule fois.
    private func terminer() {
        verrou.lock()
        let rendre = self.rendre
        let contenu = self.contenu
        self.rendre = nil
        verrou.unlock()
        if let rendre = rendre, let contenu = contenu {
            rendre(contenu)
        }
    }

    /// Le numéro d'envoi : 1 à 64 signes de base64url. Toute autre valeur est ignorée.
    private static func envoiValide(_ envoi: String) -> Bool {
        let permis = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")
        return (1...64).contains(envoi.count) && envoi.unicodeScalars.allSatisfy { permis.contains($0) }
    }

    /// `{adresse du serveur}/api/recu`. En https seulement ; dans le simulateur, aussi `http://localhost:…` (le faux
    /// serveur de la fabrication d'essai sur GitHub).
    private static func adresseRecu() -> URL? {
        guard let base = Bundle.main.object(forInfoDictionaryKey: "ElenchosServeur") as? String,
              let composants = URLComponents(string: base),
              composants.path.isEmpty, composants.query == nil, composants.fragment == nil,
              let hote = composants.host, !hote.isEmpty else {
            return nil
        }
        #if targetEnvironment(simulator)
        let permise = composants.scheme == "https" || (composants.scheme == "http" && hote == "localhost")
        #else
        let permise = composants.scheme == "https"
        #endif
        guard permise else { return nil }
        return URL(string: base + "/api/recu")
    }
}
