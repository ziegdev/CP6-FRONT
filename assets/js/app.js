
// on objet qui contient des fonctions
var app = {

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    app.addListenerToActions();
  },

  addListenerToActions: function() { 
    // cibler le bouton
    const buttonElement = document.querySelector('#addListButton');
    // poser un écouteur au click dessus
    buttonElement.addEventListener('click', app.showAddListModal);
  },

  showAddListModal: function() {
    // cibler la modale
    const modalElement = document.querySelector('#addListModal');
    // modifier son style display
    // modalElement.style.display = 'block';
    modalElement.classList.add('is-active');
  },

};

app.showAddListModal();


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );