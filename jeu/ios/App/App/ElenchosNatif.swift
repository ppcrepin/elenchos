// Elenchos, étape 1 (coquille). Notre seul module natif : ce que le web ne sait pas faire (DECISIONS-TECHNIQUES.md,
// 1.3 ; CONTRAT.md, partie 4). L'interface n'y touche que par `public/natif.js`.
//
// Ce qu'il fait :
// - le trousseau : lire, écrire, effacer le jeton de session (P-11 : le seul objet gardé dans le téléphone) ;
// - le vérificateur d'une connexion : 32 octets tirés au hasard et leur empreinte (CONTRAT.md, 2.5) ;
// - la feuille d'Apple : un jeton signé, avec le nonce donné par le serveur, sans nom ni adresse (D-061, P-03) ;
// - l'appareil (iPhone, iPad ou Mac) et le numéro de fabrication (en-tête `Elenchos-Fabrication`, CONTRAT.md 1.7).
// Place réservée, étape 2 : la feuille du système pour Google (ASWebAuthenticationSession), qui ouvrira l'adresse
// rendue par `POST /api/connexion/debut` et rendra l'adresse de retour `elenchos://connexion#code=…` ; et, pour
// « Tout effacer », la feuille d'Apple qui rend un code d'autorisation neuf (DECISIONS-TECHNIQUES.md, 1.14).
//
// Rien n'est écrit dans les journaux (P-07) : aucune valeur ne sort d'ici, sauf par la réponse à l'interface.
// Les refus portent un code court, jamais une valeur : `requete`, `trousseau`, `hasard`, `annule`, `echec`.

import AuthenticationServices
import Capacitor
import CryptoKit
import Foundation
import Security
import UIKit

@objc(ElenchosNatif)
public class ElenchosNatif: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "ElenchosNatif"
    public let jsName = "ElenchosNatif"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "appareil", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "lireJeton", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "ecrireJeton", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "effacerJeton", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "verificateur", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "connexionApple", returnType: CAPPluginReturnPromise),
    ]

    /// La feuille d'Apple en cours : gardée jusqu'à sa réponse (une seule à la fois).
    private var feuilleApple: FeuilleApple?

    // MARK: L'appareil et la fabrication

    /// `{ appareil: 'iphone' | 'ipad' | 'mac', fabrication: number }`. Le jeu se joue sur iPhone seulement (D-054) :
    /// sur un iPad ou un Mac, l'interface montre N2 (CONTRAT.md, 2.1). Une application pour iPhone ouverte sur un iPad
    /// s'y croit sur un iPhone : on lit donc aussi le modèle de l'appareil.
    @objc func appareil(_ call: CAPPluginCall) {
        let fabrication = Int(Bundle.main.object(forInfoDictionaryKey: "CFBundleVersion") as? String ?? "") ?? 0
        DispatchQueue.main.async {
            let sorte: String
            if ProcessInfo.processInfo.isiOSAppOnMac {
                sorte = "mac"
            } else if UIDevice.current.userInterfaceIdiom == .pad || Self.modele().hasPrefix("iPad") {
                sorte = "ipad"
            } else {
                sorte = "iphone"
            }
            call.resolve(["appareil": sorte, "fabrication": fabrication])
        }
    }

    private static func modele() -> String {
        if let simule = ProcessInfo.processInfo.environment["SIMULATOR_MODEL_IDENTIFIER"] { return simule }
        var infos = utsname()
        uname(&infos)
        return withUnsafePointer(to: &infos.machine) {
            $0.withMemoryRebound(to: CChar.self, capacity: 1) { String(cString: $0) }
        }
    }

    // MARK: Le trousseau (le jeton de session, et rien d'autre)

    /// `{ jeton: string | null }`.
    @objc func lireJeton(_ call: CAPPluginCall) {
        switch Trousseau.lire() {
        case .success(let jeton?): call.resolve(["jeton": jeton])
        case .success(.none): call.resolve(["jeton": NSNull()])
        case .failure: call.reject("trousseau", "trousseau")
        }
    }

    /// `{ jeton: string }` → `{}`. Remplace le jeton précédent (session provisoire, ou ancien compte).
    @objc func ecrireJeton(_ call: CAPPluginCall) {
        guard let jeton = call.getString("jeton"), Self.jetonValide(jeton) else {
            call.reject("requete", "requete")
            return
        }
        if Trousseau.ecrire(jeton) {
            call.resolve()
        } else {
            call.reject("trousseau", "trousseau")
        }
    }

    /// `{}`. Sans erreur s'il n'y avait rien.
    @objc func effacerJeton(_ call: CAPPluginCall) {
        if Trousseau.effacer() {
            call.resolve()
        } else {
            call.reject("trousseau", "trousseau")
        }
    }

    /// Un jeton de session est tiré par le serveur ; on n'en accepte qu'une forme simple (base64url, 16 à 128 signes).
    private static func jetonValide(_ jeton: String) -> Bool {
        let permis = CharacterSet(charactersIn: "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_")
        return (16...128).contains(jeton.count) && jeton.unicodeScalars.allSatisfy { permis.contains($0) }
    }

    // MARK: Le vérificateur d'une connexion (CONTRAT.md, 2.5)

    /// `{ verificateur, defi }` : 32 octets tirés au hasard, écrits en base64url (43 signes) ; `defi` est le SHA-256 de
    /// ce texte, en base64url, comme la méthode S256 de PKCE (RFC 7636). L'interface garde `verificateur` dans sa
    /// seule mémoire, envoie `defi` au début de la connexion et `verificateur` à la fin.
    @objc func verificateur(_ call: CAPPluginCall) {
        var octets = [UInt8](repeating: 0, count: 32)
        guard SecRandomCopyBytes(kSecRandomDefault, octets.count, &octets) == errSecSuccess else {
            call.reject("hasard", "hasard")
            return
        }
        let verificateur = Self.base64url(Data(octets))
        let defi = Self.base64url(Data(SHA256.hash(data: Data(verificateur.utf8))))
        call.resolve(["verificateur": verificateur, "defi": defi])
    }

    private static func base64url(_ donnees: Data) -> String {
        donnees.base64EncodedString()
            .replacingOccurrences(of: "+", with: "-")
            .replacingOccurrences(of: "/", with: "_")
            .replacingOccurrences(of: "=", with: "")
    }

    // MARK: La feuille d'Apple (connexion native)

    /// `{ nonce }` → `{ jetonIdentite }`. Refus : `annule` (le joueur a fermé la feuille ; rien n'est envoyé),
    /// `echec` (tout le reste). On ne demande que l'identifiant : ni nom, ni adresse (D-061, P-03).
    @objc func connexionApple(_ call: CAPPluginCall) {
        guard let nonce = call.getString("nonce"), (16...256).contains(nonce.count) else {
            call.reject("requete", "requete")
            return
        }
        DispatchQueue.main.async {
            guard self.feuilleApple == nil else {
                call.reject("echec", "echec")
                return
            }
            let demande = ASAuthorizationAppleIDProvider().createRequest()
            demande.requestedScopes = []
            demande.nonce = nonce
            let feuille = FeuilleApple(appel: call, fenetre: self.bridge?.viewController?.view.window) { [weak self] in
                self?.feuilleApple = nil
            }
            self.feuilleApple = feuille
            feuille.ouvrir(demande)
        }
    }
}

/// Le trousseau : un seul élément, lisible seulement par cette application, seulement sur cet iPhone (jamais copié
/// par iCloud ni dans une sauvegarde vers un autre appareil), et seulement après le premier déverrouillage depuis le
/// démarrage (DECISIONS-TECHNIQUES.md, 1.3).
private enum Trousseau {
    private static func element() -> [String: Any] {
        [
            kSecClass as String: kSecClassGenericPassword,
            kSecAttrService as String: "elenchos",
            kSecAttrAccount as String: "session",
        ]
    }

    static func lire() -> Result<String?, Error> {
        var demande = element()
        demande[kSecReturnData as String] = true
        demande[kSecMatchLimit as String] = kSecMatchLimitOne
        var resultat: AnyObject?
        let statut = SecItemCopyMatching(demande as CFDictionary, &resultat)
        if statut == errSecItemNotFound { return .success(nil) }
        guard statut == errSecSuccess, let donnees = resultat as? Data, let jeton = String(data: donnees, encoding: .utf8) else {
            return .failure(NSError(domain: "trousseau", code: Int(statut)))
        }
        return .success(jeton)
    }

    static func ecrire(_ jeton: String) -> Bool {
        guard effacer() else { return false }
        var demande = element()
        demande[kSecValueData as String] = Data(jeton.utf8)
        demande[kSecAttrAccessible as String] = kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
        return SecItemAdd(demande as CFDictionary, nil) == errSecSuccess
    }

    static func effacer() -> Bool {
        let statut = SecItemDelete(element() as CFDictionary)
        return statut == errSecSuccess || statut == errSecItemNotFound
    }
}

/// Une demande à la feuille d'Apple, de son ouverture à sa réponse.
private final class FeuilleApple: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private let appel: CAPPluginCall
    private weak var fenetre: UIWindow?
    private let fin: () -> Void
    private var controleur: ASAuthorizationController?

    init(appel: CAPPluginCall, fenetre: UIWindow?, fin: @escaping () -> Void) {
        self.appel = appel
        self.fenetre = fenetre
        self.fin = fin
    }

    func ouvrir(_ demande: ASAuthorizationAppleIDRequest) {
        let controleur = ASAuthorizationController(authorizationRequests: [demande])
        controleur.delegate = self
        controleur.presentationContextProvider = self
        self.controleur = controleur
        controleur.performRequests()
    }

    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        if let fenetre = fenetre { return fenetre }
        let scenes = UIApplication.shared.connectedScenes.compactMap { $0 as? UIWindowScene }
        return scenes.flatMap { $0.windows }.first { $0.isKeyWindow } ?? scenes.first?.windows.first ?? ASPresentationAnchor()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let identite = authorization.credential as? ASAuthorizationAppleIDCredential,
           let donnees = identite.identityToken,
           let jeton = String(data: donnees, encoding: .utf8) {
            appel.resolve(["jetonIdentite": jeton])
        } else {
            appel.reject("echec", "echec")
        }
        fin()
    }

    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if (error as? ASAuthorizationError)?.code == .canceled {
            appel.reject("annule", "annule")
        } else {
            appel.reject("echec", "echec")
        }
        fin()
    }
}
