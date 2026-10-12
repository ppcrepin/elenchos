// @ts-check
// JETABLE (test du message de 18h) : le bouton « Copier » et les confirmations de la page de résultats.
// Mots relus par UX le 12 octobre 2026.

const zone = /** @type {HTMLTextAreaElement | null} */ (document.getElementById('copie'));
const bouton = document.getElementById('copier');
if (zone && bouton) {
  bouton.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(zone.value);
      bouton.textContent = 'Copié';
    } catch {
      zone.select();
    }
  });
}

for (const form of document.querySelectorAll('form[data-confirmer]')) {
  form.addEventListener('submit', (ev) => {
    const question = /** @type {HTMLFormElement} */ (form).dataset.confirmer ?? 'Confirmer ?';
    if (!window.confirm(question)) ev.preventDefault();
  });
}
