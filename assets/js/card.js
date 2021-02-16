const card = {
  init: function() {
    card.formElement = document.querySelector('#addCardForm');
    card.modalElement = document.querySelector('#addCardModal');
  },

  handleAddForm: async function(event) {
    // ajout de la card sur le meme modèle que la liste
    event.preventDefault(); 
    const data = new FormData(card.formElement);
    // on récvupère la valeur du champ caché
    const listId = data.get('list_id');
    // permet d'ajouter une donnée aux formData
    // on cible la liste
    const listParent = document.querySelector(`.panel[data-list-id="${listId}"]`);
    // on cible les cartes dedans
    const boxes = listParent.querySelectorAll('.box');
    // on compte pour connaitre la posisition de la nouvelle carte
    data.append('position', boxes.length + 1);
    try {
      // avant de modifier le DOM on informe notre API qu'il faut faire persister des infos d'une carte
      const response = await fetch(`${util.base_url}/card`, {
        method: 'POST',
        body: data,
      });
      const body = await response.json();
      // si tout va bien
      if (response.status === 200) {
        // on modifie le dom
        card.makeInDOM(body.card);
        card.modalElement.querySelector('input').value = '';
        util.hideModals();
      }
      else {
        // sinon on gère l'erreur
        throw new Error(body);
      }
    } catch(error) {
      alert('Erreur lors de la sauvegarde de la carte');
      console.error(error);
    }
  },

  handleEditForm: function(event) {
    event.preventDefault();
    console.log('je réagis à la soumission');
  },

  // on récupère un objet représentant la card
  makeInDOM: function(cardItem) {
    // création de la card dans le dom sur le meme principe que la liste
    const template = document.querySelector('#cardTemplate');
    const clone = template.content.cloneNode(true);
    clone.querySelector('.card-name').textContent = cardItem.title;
    const boxElement = clone.querySelector('.box');
    boxElement.setAttribute('data-card-id', cardItem.id);
    boxElement.style.borderBottomColor = cardItem.color;
    // on écoute le click sur le crayon
    const pencil = clone.querySelector('.edit-btn');
    pencil.addEventListener('click', card.showEditForm);
    // on écoute la soumission du form
    const form = clone.querySelector('form');
    form.addEventListener('submit', card.handleEditForm);
    // on insère la card au bon endroit dans la liste, on utilise ici un selecteur d'attribut
    document.querySelector(`div[data-list-id="${cardItem.list_id}"] .panel-block`).appendChild(clone);
  },

  // quoi faire au click sur le crayon
  showEditForm: function(event) {
    event.preventDefault();
    // afficher le formulaire d'édition // cibler le formulaire et lui enlever la classe is-hidden
    // on identifie le crayon cliqué
    const pencil = event.target;
    // on trouve la carte parent
    const cardElement = pencil.closest('.box');
    // on trouve son enfant form
    const form = cardElement.querySelector('form');
    // on enleve la classe is-hidden
    form.classList.remove('is-hidden');
    // masquer le nom de la carte
    const title = cardElement.querySelector('.card-name');
    title.classList.add('is-hidden');
    // on prérempli le champ
    const input = form.querySelector('input[name="title"]')
    input.value = title.textContent;
    // on le cible via la méthode focus sur l'élement input
    input.focus();
  },

  showAddModal: function(event) {
    event.preventDefault();
    card.modalElement.classList.add('is-active');
    // en plus d'afficher la modal, on modifie la valeur du champ caché pour mémoriser l'id de la liste parent
    // on trouve le bouton cliqué
    const btn = event.target;
    // l'élement qui a été cliqué, celui qui a déclenché l'événement
    // un événement en javascript se propage, donc un parent peut entendre les événement déclenchés sur ses enfants
    // console.log(event.target)
    // l'élement sur lequel l'événement est écouté
    // console.log(event.currentTarget)
    // on trouve le parent représentant la liste
    const parent = btn.closest('.panel');
    // on trouve son list-id
    const id = parent.getAttribute('data-list-id');
    // on modifie la valeur du champ caché
    card.modalElement.querySelector('input[name="list_id"]').value = id;
  },

};
