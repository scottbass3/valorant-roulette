import { getLang } from './i18n.js';

const CONTENT = {
  privacy: {
    en: {
      title: 'Privacy Policy',
      sections: [
        { h: 'Data stored locally',
          p: 'This application stores the following data in your browser\'s localStorage: player names, custom agent names, and language preference. This data never leaves your device and is never transmitted to any server.' },
        { h: 'No tracking',
          p: 'There are no analytics, cookies, advertising trackers, or any form of server-side data collection.' },
        { h: 'Your rights',
          p: 'You can delete all stored data at any time by clearing site data or localStorage in your browser settings.' },
      ],
    },
    fr: {
      title: 'Politique de confidentialité',
      sections: [
        { h: 'Données stockées localement',
          p: 'Cette application enregistre les données suivantes dans le localStorage de votre navigateur : noms des joueurs, noms personnalisés des agents et préférence de langue. Ces données ne quittent jamais votre appareil et ne sont jamais transmises à un serveur.' },
        { h: 'Aucun traceur',
          p: 'Il n\'existe ni analytics, ni cookies, ni traceurs publicitaires, ni collecte de données côté serveur.' },
        { h: 'Vos droits',
          p: 'Vous pouvez supprimer toutes les données enregistrées à tout moment via les paramètres de votre navigateur (données du site / localStorage).' },
      ],
    },
    de: {
      title: 'Datenschutzerklärung',
      sections: [
        { h: 'Lokal gespeicherte Daten',
          p: 'Diese Anwendung speichert folgende Daten im localStorage Ihres Browsers: Spielernamen, benutzerdefinierte Agentennamen und Sprachpräferenz. Diese Daten verlassen Ihr Gerät nie und werden nie an einen Server übermittelt.' },
        { h: 'Kein Tracking',
          p: 'Es gibt weder Analysen, Cookies, Werbe-Tracker noch serverseitige Datenerfassung irgendeiner Art.' },
        { h: 'Ihre Rechte',
          p: 'Sie können alle gespeicherten Daten jederzeit über die Browser-Einstellungen (Website-Daten / localStorage) löschen.' },
      ],
    },
    es: {
      title: 'Política de privacidad',
      sections: [
        { h: 'Datos almacenados localmente',
          p: 'Esta aplicación almacena los siguientes datos en el localStorage de tu navegador: nombres de jugadores, nombres personalizados de agentes y preferencia de idioma. Estos datos nunca abandonan tu dispositivo ni se transmiten a ningún servidor.' },
        { h: 'Sin rastreo',
          p: 'No hay análisis, cookies, rastreadores publicitarios ni recopilación de datos del lado del servidor de ningún tipo.' },
        { h: 'Tus derechos',
          p: 'Puedes eliminar todos los datos almacenados en cualquier momento desde los ajustes de tu navegador (datos del sitio / localStorage).' },
      ],
    },
    it: {
      title: 'Informativa sulla privacy',
      sections: [
        { h: 'Dati memorizzati localmente',
          p: 'Questa applicazione memorizza i seguenti dati nel localStorage del browser: nomi dei giocatori, nomi personalizzati degli agenti e preferenza della lingua. Questi dati non lasciano mai il tuo dispositivo e non vengono mai trasmessi a nessun server.' },
        { h: 'Nessun tracciamento',
          p: 'Non esistono analytics, cookie, tracker pubblicitari né raccolta dati lato server di alcun tipo.' },
        { h: 'I tuoi diritti',
          p: 'Puoi eliminare tutti i dati memorizzati in qualsiasi momento dalle impostazioni del browser (dati del sito / localStorage).' },
      ],
    },
  },

  legal: {
    en: {
      title: 'Legal Notice',
      sections: [
        { h: 'About',
          p: 'Valorant Roulette is a free, open-source fan tool for randomly assigning Valorant agents to players. It is not affiliated with, endorsed by, or connected to Riot Games in any way.' },
        { h: 'Author',
          p: 'Created by scottbass3. Source code is available on GitHub under the MIT License.' },
        { h: 'Hosting',
          p: 'This application is hosted on GitHub Pages. GitHub\'s terms of service and privacy policy apply to the hosting infrastructure.' },
        { h: 'Intellectual property',
          p: 'Valorant and all related assets are trademarks of Riot Games, Inc. Agent names and images are used for non-commercial fan purposes only under fair use.' },
      ],
    },
    fr: {
      title: 'Mentions légales',
      sections: [
        { h: 'Présentation',
          p: 'Valorant Roulette est un outil fan gratuit et open-source permettant d\'attribuer aléatoirement des agents Valorant aux joueurs. Il n\'est ni affilié, ni approuvé, ni lié à Riot Games.' },
        { h: 'Auteur',
          p: 'Créé par scottbass3. Le code source est disponible sur GitHub sous licence MIT.' },
        { h: 'Hébergement',
          p: 'Cette application est hébergée sur GitHub Pages. Les conditions d\'utilisation et la politique de confidentialité de GitHub s\'appliquent à l\'infrastructure d\'hébergement.' },
        { h: 'Propriété intellectuelle',
          p: 'Valorant et tous les éléments associés sont des marques déposées de Riot Games, Inc. Les noms et images des agents sont utilisés à des fins non commerciales de fan uniquement.' },
      ],
    },
    de: {
      title: 'Impressum',
      sections: [
        { h: 'Über die Anwendung',
          p: 'Valorant Roulette ist ein kostenloses Open-Source-Fan-Tool zur zufälligen Zuweisung von Valorant-Agenten. Es ist weder mit Riot Games verbunden noch von Riot Games genehmigt.' },
        { h: 'Autor',
          p: 'Erstellt von scottbass3. Der Quellcode ist auf GitHub unter der MIT-Lizenz verfügbar.' },
        { h: 'Hosting',
          p: 'Diese Anwendung wird auf GitHub Pages gehostet. Die Nutzungsbedingungen und Datenschutzrichtlinie von GitHub gelten für die Hosting-Infrastruktur.' },
        { h: 'Geistiges Eigentum',
          p: 'Valorant und alle zugehörigen Assets sind Marken von Riot Games, Inc. Agentennamen und -bilder werden ausschließlich für nicht-kommerzielle Fan-Zwecke verwendet.' },
      ],
    },
    es: {
      title: 'Aviso legal',
      sections: [
        { h: 'Sobre la aplicación',
          p: 'Valorant Roulette es una herramienta fan gratuita y de código abierto para asignar agentes de Valorant aleatoriamente. No está afiliada, respaldada ni conectada a Riot Games de ningún modo.' },
        { h: 'Autor',
          p: 'Creado por scottbass3. El código fuente está disponible en GitHub bajo la licencia MIT.' },
        { h: 'Alojamiento',
          p: 'Esta aplicación está alojada en GitHub Pages. Los términos de servicio y la política de privacidad de GitHub se aplican a la infraestructura de alojamiento.' },
        { h: 'Propiedad intelectual',
          p: 'Valorant y todos los activos relacionados son marcas registradas de Riot Games, Inc. Los nombres e imágenes de los agentes se usan únicamente con fines de fan no comerciales.' },
      ],
    },
    it: {
      title: 'Note legali',
      sections: [
        { h: 'Informazioni',
          p: "Valorant Roulette è uno strumento fan gratuito e open-source per assegnare casualmente agenti Valorant ai giocatori. Non è affiliato, approvato né collegato a Riot Games in alcun modo." },
        { h: 'Autore',
          p: 'Creato da scottbass3. Il codice sorgente è disponibile su GitHub sotto licenza MIT.' },
        { h: 'Hosting',
          p: "Questa applicazione è ospitata su GitHub Pages. I termini di servizio e l'informativa sulla privacy di GitHub si applicano all'infrastruttura di hosting." },
        { h: 'Proprietà intellettuale',
          p: 'Valorant e tutti i relativi asset sono marchi di Riot Games, Inc. I nomi e le immagini degli agenti sono usati esclusivamente per scopi non commerciali di fan.' },
      ],
    },
  },
};

export function openLegalModal(type) {
  const lang    = getLang();
  const data    = CONTENT[type][lang] ?? CONTENT[type].en;
  const existing = document.getElementById('legal-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id        = 'legal-modal';
  modal.className = 'config-modal';

  const sectionsHtml = data.sections.map(s => `
    <div class="legal-section">
      <h3 class="legal-section-title">${s.h}</h3>
      <p class="legal-section-body">${s.p}</p>
    </div>
  `).join('');

  modal.innerHTML = `
    <div class="config-overlay"></div>
    <div class="config-panel">
      <div class="config-header">
        <span class="legal-modal-title">${data.title}</span>
        <button class="config-close">✕</button>
      </div>
      <div class="config-body legal-body">
        ${sectionsHtml}
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  modal.querySelector('.config-close').addEventListener('click',   () => modal.remove());
  modal.querySelector('.config-overlay').addEventListener('click', () => modal.remove());
}
