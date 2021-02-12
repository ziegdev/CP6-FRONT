
// on objet qui contient des fonctions
const app = {
  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    app.formElement = document.querySelector('#addListForm');
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
    // objectif : afficher une liste dans la page à la validation du formulaire
    // réagir à la soumission
    app.formElement.addEventListener('submit', app.handleAddListForm);
  },

  handleAddListForm: function(event) {
    // j'empeche le comportement par défaut de l'événeement
    event.preventDefault(); 
    // récupérer la valeur du champ
    // grace au constructeur FormData je peux passer à la moulinette un form et ses champs, pour voir ensuite lire facilement les valeurs des champs
    const data = new FormData(app.formElement);
    // l'objet de data construit par FormData possède une méthode get permettant de récupérer la valeur d'un champ en fonction de son nom (son attribut name)
    const inputValue = data.get('name');
    // créer une liste dans le DOM avec la valeur du champ
    app.makeListInDOM(inputValue);
  },

  makeListInDOM: function(listName) {
    console.log('je crée la liste qui s\'appelle ' + listName);
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