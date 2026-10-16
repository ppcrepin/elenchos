// Elenchos, étape 1 (coquille). Le contrôleur de Capacitor, qui inscrit notre module natif : c'est la façon
// documentée par Capacitor d'ajouter un module écrit dans l'application elle-même (« Custom Native iOS Code »,
// documentation de Capacitor 8).

import Capacitor
import UIKit

class ElenchosBridgeViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(ElenchosNatif())
    }
}
