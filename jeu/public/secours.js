// @ts-check
// Elenchos, étape 1 (coquille). La vue de secours (CONTRAT.md 2.1, dernière ligne) : un script classique, sans
// module, qui montre la vue de secours si app.js n'a pas signalé son démarrage au bout de quatre secondes (par
// exemple si un module ne se lit pas). app.js la montre lui-même s'il échoue après avoir démarré.

setTimeout(() => {
  if (document.documentElement.dataset.demarre === 'oui') return;
  const application = document.getElementById('application');
  const secours = document.getElementById('secours');
  if (application) application.hidden = true;
  if (secours) secours.hidden = false;
}, 4000);
