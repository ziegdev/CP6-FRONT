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

  // base_url: 'http://localhost:3000',
  base_url: 'http://localhost:3001',

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    // je mémorise des élements pour plus tard
    app.listFormElement = document.querySelector('#addListForm');
    app.listModalElement = document.querySelector('#addListModal');
    app.buttonElement = document.querySelector('#addListButton');
    app.cardFormElement = document.querySelector('#addCardForm');
    app.cardModalElement = document.querySelector('#addCardModal');
    app.addListenerToActions();
    // j'execute ma tache asynchrone pour récupérer et générer les listes
    app.getListsFromAPI();
  },

  // on fait une fonction asynchrone car on ne veut pas mettre en pause le script, il continue son execution
  getListsFromAPI: async function() {
    try {
      // on attend la réponse de l'api
      const response = await fetch(`${app.base_url }/lists`);
      // on attend l'analyse du corps de la réponse en json
      const body = await response.json();
      // si tout va bien
      if (response.status === 200) {
        // on dit quoi faire des données récupérées, ici pour chaque liste on génère une liste dans le DOM, on a tranposé une donnée brut vers une interface facilement compréhensible par mon utilisateur
        // code RED : on récupère un tableau
        // for (list of body) {
        // code BLUE : on récupère un objet contenant un tableau
        for (list of body.lists) {
          app.makeListInDOM(list.name, list.id);
        }
      }
      // si l'api nous répond mais que la réponse est une erreur (par exemple si on obtient code 40X)
      else {
        throw new Error(body);
      }
    } catch(error) {
      alert('Erreur lors de la récupération des listes');
      console.error(error);
    }

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

    // soumission du formulaire des card
    app.cardFormElement.addEventListener('submit', app.handleAddCardForm);
  },

  handleAddListForm: async function(event) {
    // j'empeche le comportement par défaut de l'événeement
    event.preventDefault(); 
    // récupérer la valeur du champ
    // grace au constructeur FormData je peux passer à la moulinette un form et ses champs, pour voir ensuite lire facilement les valeurs des champs
    const data = new FormData(app.listFormElement);
    // il faut informer notre API qu'on veut mémoriser une nouvelle liste pour qu'elle la fasse persister en BDD
    try  {
      // code RED avec s
      // const response = await fetch(`${app.base_url}/lists`, {
      //   method: 'POST',
      //   body: data,
      // });
      // code Blue sans s
      // coté blue la position est obligatoire
      // via la méthode append on peut ajouter une paire clé valeur à nos formData
      data.append('position', 1);
      const response = await fetch(`${app.base_url}/list`, {
        method: 'POST',
        body: data,
      });
      const body = await response.json();
      if (response.status === 200) {
        // créer une liste dans le DOM avec la valeur du champ
        // RED
        // app.makeListInDOM(body.name, body.id);
        // Blue
        app.makeListInDOM(body.list.name, body.list.id);
        // je vide le champ pour les prochaines fois
        app.listModalElement.querySelector('input').value = '';
        // je ferme la modale
        app.hideModals();
      }
      else {
        throw new Error(body);
      }
    } catch(error) {
      alert('Problème lors de la sauvegarde la liste');
      console.error(error);
    }
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

  makeListInDOM: function(listName, listId) {
    // je cible mon template
    const template = document.querySelector('#listTemplate');
    // je clone son contenu
    // const clone = document.importNode(template.content, true);
    const clone = template.content.cloneNode(true);
    // je configure le clone
    const title = clone.querySelector('.list-title');
    title.textContent = listName;
    title.addEventListener('dblclick', app.showEditListForm);
    const form = clone.querySelector('form');
    form.addEventListener('submit', app.handleEditListForm);
    const panel = clone.querySelector('.panel');
    panel.setAttribute('data-list-id', listId);
    // on cible le champ caché via un selecteur d'attribut
    const input = form.querySelector('input[name="list-id"]');
    input.setAttribute('value', listId);
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

  showEditListForm: function(event) {
    const titleElement = event.target;
    // la propriété nextElementSibling permet de cibler le voisin suivant direct d'un element (frère/soeur)
    // de la meme manière il existe previousElementSibling pour récupérer le voisin précédent
    const formElement = titleElement.nextElementSibling;
    titleElement.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditListForm: async function(event) {
    // on empeche la soumission par défaut
    event.preventDefault();

    // on cible le formulaire et le titre à manipuler
    const formElement = event.target;
    const titleElement = formElement.previousElementSibling;

    // on génère les paires clés/valeurs pour tout ce qu'il y a dans le formulaire
    const data = new FormData(formElement);

    // on récupère l'id de la liste à modifier
    const listId = data.get('list-id');

    try  { 
      // on appelle l'api sur le bon endpoint pour faire persister le changements de la liste souhaitée
      // RED
      // const response = await fetch(`${app.base_url}/lists/${listId}`, {
      //   method: 'PATCH',
      //   body: data,
      // });
      // Blue
      const response = await fetch(`${app.base_url}/list/${listId}`, {
        method: 'PATCH',
        body: data,
      });
      const body = await response.json();
      // en fonction de la réponse si tout va bien  
      if (response.status === 200) {
        // on met à jour le titre dans le DOM
        // Red
        // titleElement.textContent = body.name;
        // Blue
        titleElement.textContent = body.list.name;
      }
      else {
        // si tout va mal on affiche une erreur
        throw new Error(body);
      }

    } catch(error) {
      alert('Problème lors de la mise à jour la liste');
      console.error(error);
    }
    // on réaffiche le titre
    titleElement.classList.remove('is-hidden');
    formElement.classList.add('is-hidden');
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );