const card = {
  init: function() {
    card.formElement = document.querySelector('#addCardForm');
    card.modalElement = document.querySelector('#addCardModal');
  },

  handleAddForm: function(event) {
    // ajout de la card sur le meme modèle que la liste
    event.preventDefault(); 
    const data = new FormData(card.formElement);
    const inputValue = data.get('cardName');
    // on récvupère la valeur du champ caché
    const listId = data.get('listId');
    card.makeInDOM(inputValue, listId);
    card.modalElement.querySelector('input').value = '';
    util.hideModals();
  },

  // on prévoit ici un deuxième paramètre représentant l'id de la liste dans laquelle on veut la carte
  makeInDOM: function(cardName, parentId, cardId) {
    // création de la card dans le dom sur le meme principe que la liste
    const template = document.querySelector('#cardTemplate');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.card-name').textContent = cardName;
    clone.querySelector('.box').setAttribute('data-card-id', cardId);
    // on insère la card au bon endroit dans la liste, on utilise ici un selecteur d'attribut
    document.querySelector(`div[data-list-id="${parentId}"] .panel-block`).appendChild(clone);
  },

  showAddModal: function(event) {
    card.modalElement.classList.add('is-active');
    // en plus d'afficher la modal, on modifie la valeur du champ caché pour mémoriser l'id de la liste parent
    // on trouve le bouton cliqué
    const btn = event.target;
    // on trouve le parent représentant la liste
    const parent = btn.closest('.panel');
    // on trouve son list-id
    const id = parent.getAttribute('data-list-id');
    // on modifie la valeur du champ caché
    card.modalElement.querySelector('input[name="listId"]').value = id;
  },

};
