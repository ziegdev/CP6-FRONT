
// on objet qui contient des fonctions
const app = {
  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    app.modalElement = document.querySelector('#addListModal');
    app.addListenerToActions();
  },

  addListenerToActions: function() { 
    // cibler le bouton
    const buttonElement = document.querySelector('#addListButton');
    // poser un écouteur au click dessus
    buttonElement.addEventListener('click', app.showAddListModal);
    // cibler les boutons close
    const closeButtons = document.querySelectorAll('.close');
    // poser un écouteur dessus au click
    // for (const closeButton of closeButtons) {
    //   console.log(closeButton);
    // }
    closeButtons.forEach((closeButton) => {
      closeButton.addEventListener('click', app.hideModals);
    });

  },

  hideModals: function() {
    app.modalElement.classList.remove('is-active');
  },

  showAddListModal: function() {
    // modifier son style display
    // modalElement.style.display = 'block';
    app.modalElement.classList.add('is-active');
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );