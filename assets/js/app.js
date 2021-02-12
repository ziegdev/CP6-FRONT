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
    // je mémorise des élements pour plus tard
    app.listFormElement = document.querySelector('#addListForm');
    app.listModalElement = document.querySelector('#addListModal');
    app.buttonElement = document.querySelector('#addListButton');
    app.cardFormElement = document.querySelector('#addCardForm');
    app.cardModalElement = document.querySelector('#addCardModal');
    app.addListenerToActions();
  },

  addListenerToActions: function() { 
    // poser un écouteur au click sur le botuon
    app.buttonElement.addEventListener('click', app.showAddListModal);
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
    app.listFormElement.addEventListener('submit', app.handleAddListForm);

    // on cible les + pour l'ajout de cartes
    const cardButtonElements = document.querySelectorAll('.panel-heading a');
    cardButtonElements.forEach((button) => {
      button.addEventListener('click', app.showAddCardModal);
    });

    // soumission du formulaire des card
    app.cardFormElement.addEventListener('submit', app.handleAddCardForm);
  },

  handleAddListForm: function(event) {
    // j'empeche le comportement par défaut de l'événeement
    event.preventDefault(); 
    // récupérer la valeur du champ
    // grace au constructeur FormData je peux passer à la moulinette un form et ses champs, pour voir ensuite lire facilement les valeurs des champs
    const data = new FormData(app.listFormElement);
    // l'objet de data construit par FormData possède une méthode get permettant de récupérer la valeur d'un champ en fonction de son nom (son attribut name)
    const inputValue = data.get('listName');
    // créer une liste dans le DOM avec la valeur du champ
    app.makeListInDOM(inputValue);
    // je vide le champ pour les prochaines fois
    app.listModalElement.querySelector('input').value = '';
    // je ferme la modale
    app.hideModals();
  },

  handleAddCardForm: function(event) {
    // ajout de la card sur le meme modèle que la liste
    event.preventDefault(); 
    const data = new FormData(app.cardFormElement);
    const inputValue = data.get('cardName');
    // on récvupère la valeur du champ caché
    const listId = data.get('listId');
    app.makeCardInDOM(inputValue, listId);
    app.cardModalElement.querySelector('input').value = '';
    app.hideModals();
  },

  makeListInDOM: function(listName) {
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
    // /!\ on écoute le click sur le + de la nouvelle liste aussi !
    clone.querySelector('.panel-heading a').addEventListener('click', app.showAddCardModal);
    // trouver le parent column du bouton
    const column = app.buttonElement.closest('.column');
    // injecter avant le clone, on connait appendChild qui insère un enfant à la fin d'un parent. .before insère notre enfant à coté et juste avant un élement cible
    column.before(clone);
  },

  // on prévoit ici un deuxième paramètre représentant l'id de la liste dans laquelle on veut la carte
  makeCardInDOM: function(cardName, parentId) {
    // création de la card dans le dom sur le meme principe que la liste
    const template = document.querySelector('#cardTemplate');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.card-name').textContent = cardName;
    clone.querySelector('.box').setAttribute('data-card-id', '?');
    // on insère la card au bon endroit dans la liste, on utilise ici un selecteur d'attribut
    document.querySelector(`div[data-list-id="${parentId}"] .panel-block`).appendChild(clone);
  },

  hideModals: function() {
    app.listModalElement.classList.remove('is-active');
    app.cardModalElement.classList.remove('is-active');

    // ou bien
    // const modals = document.querySelectorAll('.modal');
    // modals.forEach((modal) => {
    //   modal.classList.remove('is-active');
    // });
  },

  showAddListModal: function() {
    // modifier son style display
    // listModalElement.style.display = 'block';
    app.listModalElement.classList.add('is-active');
  },

  showAddCardModal: function(event) {
    app.cardModalElement.classList.add('is-active');
    // en plus d'afficher la modal, on modifie la valeur du champ caché pour mémoriser l'id de la liste parent
    // on trouve le bouton cliqué
    const btn = event.target;
    // on trouve le parent représentant la liste
    const parent = btn.closest('.panel');
    // on trouve son list-id
    const id = parent.getAttribute('data-list-id');
    // on modifie la valeur du champ caché
    app.cardModalElement.querySelector('input[name="listId"]').value = id;
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );