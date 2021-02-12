/*
  // un exemple de fetch pour commencer
  const demo = async () => {
    // on peut attendre le retour du fetch dans une fonction asynchrone
    const reponse = await fetch('http://localhost:3000/lists', {
      method: 'GET'
    });
    // on peut ensuite transformer le json de la réponse en données exploitables dans notre script, la méthode json retourne une promesse il faut attendre
    const data = await reponse.json();
    app.makeListInDOM(data[0].name);
  };
  demo();
*/



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
    const inputValue = data.get('listName');
    // créer une liste dans le DOM avec la valeur du champ
    app.makeListInDOM(inputValue);
    // je ferme la modale
    app.hideModals();
  },

  makeListInDOM: function(listName) {
    console.log('je crée la liste qui s\'appelle ' + listName);
    // je cible mon template
    const template = document.querySelector('#listTemplate');
    // je clone son contenu
    // const clone = document.importNode(template.content, true);
    const clone = template.content.cloneNode(true);
    // je configure le clone
    const title = clone.querySelector('h2');
    title.textContent = listName;
    const panel = clone.querySelector('.panel');
    panel.setAttribute('data-list-id', 'X');
    // j'injecte le clone dans ma page
    // document.querySelector('.columns').appendChild(clone);
    // cibler le bouton
    const btn = document.querySelector('#addListButton');
    // trouver son parent column
    const column = btn.closest('.column');
    // injecter avant le clone, on connait appendChild qui insère un enfant à la fin d'un parent. .before insère notre enfant à coté et juste avant un élement cible
    column.before(clone);
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