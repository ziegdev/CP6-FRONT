(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
const list = require('./list');
const card = require('./card');
const util = require('./util');

// on objet qui contient des fonctions
const app = {

  // fonction d'initialisation, lancée au chargement de la page
  init: function () {
    // je mémorise des élements pour plus tard
    list.init();
    card.init();
    util.addListenerToActions();
  },

};


// on accroche un écouteur d'évènement sur le document : quand le chargement est terminé, on lance app.init
document.addEventListener('DOMContentLoaded', app.init );
},{"./card":2,"./list":3,"./util":4}],2:[function(require,module,exports){
const util = require('./util');

const card = {
  init: function() {
    card.formElement = document.querySelector('#addCardForm');
    card.modalElement = document.querySelector('#addCardModal');
    card.formElement.addEventListener('submit', card.handleAddForm);
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

  handleEditForm: async function(event) {
    event.preventDefault();
    // -faire persister les modifications saisies par l'utilisateur en BDD via un appel ajax à notre api
    // retrouver l'id de la card
    const form = event.target;
    const cardParent = form.closest('.box');
    // const cardId = cardParent.dataset.cardId;
    const cardId = cardParent.getAttribute('data-card-id');
    const data = new FormData(form);
    try {
      const response = await fetch(`${util.base_url}/card/${cardId}`, {
        method: 'PATCH',
        body: data
      });
      const body = await response.json();
      if (response.status === 200) {
        // - en cas de succès modifier le dom pour afficher la card modifiée
        form.classList.add('is-hidden');
        const titleElement = form.previousElementSibling;
        // const titleElement = cardParent.querySelector('.card-name');
        titleElement.classList.remove('is-hidden');
        titleElement.textContent = body.card.title;
      }
      else {
        // - sinon afficher une erreur
        throw new Error(body);
      } 
    } catch(error) {
      alert('Erreur lors de la mise à jour');
      console.error(error);
    }
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
    // on écoute le click sur la poubelle
    const trash = clone.querySelector('.delete-btn');
    trash.addEventListener('click', card.handleDelete);
    // on écoute la soumission du form
    const form = clone.querySelector('form');
    form.addEventListener('submit', card.handleEditForm);
    // on insère la card au bon endroit dans la liste, on utilise ici un selecteur d'attribut
    document.querySelector(`div[data-list-id="${cardItem.list_id}"] .panel-block`).appendChild(clone);
  },

  handleDelete: async function(event) {
    event.preventDefault();
    // identifier l'id de la carte cliquée
    const trash = event.target;
    const cardElement = trash.closest('.box');
    const cardId = cardElement.getAttribute('data-card-id');
    // appeler l'api pour dire qu'on supprimer la carte cliquée
    try {
      const response = await fetch(`${util.base_url}/card/${cardId}`, {
        method: 'DELETE',
      });
      const body = await response.json();
      if (response.status === 200) {
        // si tout va bien, supprimer la carte du DOM
        cardElement.remove();
      }
      else {
        throw new Error(body);
      }
    } catch(error) {
      alert('Impossible de supprimer');
      console.error(error);
    }
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

module.exports = card;

},{"./util":4}],3:[function(require,module,exports){
const card = require('./card');
const util = require('./util');

const list = {
  init: function() {
    list.formElement = document.querySelector('#addListForm');
    list.modalElement = document.querySelector('#addListModal');
    list.buttonElement = document.querySelector('#addListButton');
    list.buttonElement.addEventListener('click', list.showAddModal);
    list.formElement.addEventListener('submit', list.handleAddForm);
    // j'execute ma tache asynchrone pour récupérer et générer les listes
    list.getListsFromAPI();
  },

  // on fait une fonction asynchrone car on ne veut pas mettre en pause le script, il continue son execution
  getListsFromAPI: async function() {
    try {
      // on attend la réponse de l'api
      const response = await fetch(`${util.base_url}/lists`);
      // on attend l'analyse du corps de la réponse en json
      const body = await response.json();
      // si tout va bien
      if (response.status === 200) {
        // on dit quoi faire des données récupérées, ici pour chaque liste on génère une liste dans le DOM, on a tranposé une donnée brut vers une interface facilement compréhensible par mon utilisateur
        // code RED : on récupère un tableau
        // for (list of body) {
        // code BLUE : on récupère un objet contenant un tableau
        for (const listItem of body.lists) {
          list.makeInDOM(listItem.name, listItem.id);
          for (const cardItem of listItem.cards) {
            card.makeInDOM(cardItem);
          }
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

  handleAddForm: async function(event) {
    // j'empeche le comportement par défaut de l'événeement
    event.preventDefault(); 
    // récupérer la valeur du champ
    // grace au constructeur FormData je peux passer à la moulinette un form et ses champs, pour voir ensuite lire facilement les valeurs des champs
    const data = new FormData(list.formElement);
    // il faut informer notre API qu'on veut mémoriser une nouvelle liste pour qu'elle la fasse persister en BDD
    try  {
      // code RED avec s
      // const response = await fetch(`${util.base_url}/lists`, {
      //   method: 'POST',
      //   body: data,
      // });
      // code Blue sans s
      // coté blue la position est obligatoire
      // via la méthode append on peut ajouter une paire clé valeur à nos formData
      data.append('position', document.querySelectorAll('.panel').length + 1);
      const response = await fetch(`${util.base_url}/list`, {
        method: 'POST',
        body: data,
      });
      const body = await response.json();
      if (response.status === 200) {
        // créer une liste dans le DOM avec la valeur du champ
        // RED
        // app.makeListInDOM(body.name, body.id);
        // Blue
        list.makeInDOM(body.list.name, body.list.id);
        // je vide le champ pour les prochaines fois
        list.modalElement.querySelector('input').value = '';
        // je ferme la modale
        util.hideModals();
      }
      else {
        throw new Error(body);
      }
    } catch(error) {
      alert('Problème lors de la sauvegarde la liste');
      console.error(error);
    }
  },

  makeInDOM: function(listName, listId) {
    // je cible mon template
    const template = document.querySelector('#listTemplate');
    // je clone son contenu
    // const clone = document.importNode(template.content, true);
    const clone = template.content.cloneNode(true);
    // je configure le clone
    const title = clone.querySelector('.list-title');
    title.textContent = listName;
    title.addEventListener('dblclick', list.showEditForm);
    const form = clone.querySelector('form');
    form.addEventListener('submit', list.handleEditForm);
    const panel = clone.querySelector('.panel');
    panel.setAttribute('data-list-id', listId);
    // on cible le champ caché via un selecteur d'attribut
    const input = form.querySelector('input[name="list-id"]');
    input.setAttribute('value', listId);
    // /!\ on écoute le click sur le + de la nouvelle liste aussi !
    clone.querySelector('.panel-heading a').addEventListener('click', card.showAddModal);
    // trouver le parent column du bouton
    const column = list.buttonElement.closest('.column');
    // injecter avant le clone, on connait appendChild qui insère un enfant à la fin d'un parent. .before insère notre enfant à coté et juste avant un élement cible
    column.before(clone);
  },

  showAddModal: function() {
    // modifier son style display
    // listModalElement.style.display = 'block';
    list.modalElement.classList.add('is-active');
  },

  showEditForm: function(event) {
    const titleElement = event.target;
    // la propriété nextElementSibling permet de cibler le voisin suivant direct d'un element (frère/soeur)
    // de la meme manière il existe previousElementSibling pour récupérer le voisin précédent
    const formElement = titleElement.nextElementSibling;
    titleElement.classList.add('is-hidden');
    formElement.classList.remove('is-hidden');
  },

  handleEditForm: async function(event) {
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
      // const response = await fetch(`${util.base_url}/lists/${listId}`, {
      //   method: 'PATCH',
      //   body: data,
      // });
      // Blue
      const response = await fetch(`${util.base_url}/list/${listId}`, {
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

module.exports = list;

},{"./card":2,"./util":4}],4:[function(require,module,exports){
const util = {
  // base_url: 'http://localhost:3000',
  base_url: 'http://localhost:3001',

  hideModals: function() {
    // list.modalElement.classList.remove('is-active');
    // card.modalElement.classList.remove('is-active');

    // ou bien
    const modals = document.querySelectorAll('.modal');
    modals.forEach((modal) => {
      modal.classList.remove('is-active');
    });
  },

  addListenerToActions: function() { 
    // cibler les boutons close
    const closeButtons = document.querySelectorAll('.close');
    // poser un écouteur dessus au click
    // for (const closeButton of closeButtons) {
    //   console.log(closeButton);
    // }
    closeButtons.forEach((closeButton) => {
      closeButton.addEventListener('click', util.hideModals);
    });
  },
};

module.exports = util;

},{}]},{},[1])
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJzcmMvYXBwLmpzIiwic3JjL2NhcmQuanMiLCJzcmMvbGlzdC5qcyIsInNyYy91dGlsLmpzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBO0FDQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNuQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzFLQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDbkxBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uKCl7ZnVuY3Rpb24gcihlLG4sdCl7ZnVuY3Rpb24gbyhpLGYpe2lmKCFuW2ldKXtpZighZVtpXSl7dmFyIGM9XCJmdW5jdGlvblwiPT10eXBlb2YgcmVxdWlyZSYmcmVxdWlyZTtpZighZiYmYylyZXR1cm4gYyhpLCEwKTtpZih1KXJldHVybiB1KGksITApO3ZhciBhPW5ldyBFcnJvcihcIkNhbm5vdCBmaW5kIG1vZHVsZSAnXCIraStcIidcIik7dGhyb3cgYS5jb2RlPVwiTU9EVUxFX05PVF9GT1VORFwiLGF9dmFyIHA9bltpXT17ZXhwb3J0czp7fX07ZVtpXVswXS5jYWxsKHAuZXhwb3J0cyxmdW5jdGlvbihyKXt2YXIgbj1lW2ldWzFdW3JdO3JldHVybiBvKG58fHIpfSxwLHAuZXhwb3J0cyxyLGUsbix0KX1yZXR1cm4gbltpXS5leHBvcnRzfWZvcih2YXIgdT1cImZ1bmN0aW9uXCI9PXR5cGVvZiByZXF1aXJlJiZyZXF1aXJlLGk9MDtpPHQubGVuZ3RoO2krKylvKHRbaV0pO3JldHVybiBvfXJldHVybiByfSkoKSIsImNvbnN0IGxpc3QgPSByZXF1aXJlKCcuL2xpc3QnKTtcbmNvbnN0IGNhcmQgPSByZXF1aXJlKCcuL2NhcmQnKTtcbmNvbnN0IHV0aWwgPSByZXF1aXJlKCcuL3V0aWwnKTtcblxuLy8gb24gb2JqZXQgcXVpIGNvbnRpZW50IGRlcyBmb25jdGlvbnNcbmNvbnN0IGFwcCA9IHtcblxuICAvLyBmb25jdGlvbiBkJ2luaXRpYWxpc2F0aW9uLCBsYW5jw6llIGF1IGNoYXJnZW1lbnQgZGUgbGEgcGFnZVxuICBpbml0OiBmdW5jdGlvbiAoKSB7XG4gICAgLy8gamUgbcOpbW9yaXNlIGRlcyDDqWxlbWVudHMgcG91ciBwbHVzIHRhcmRcbiAgICBsaXN0LmluaXQoKTtcbiAgICBjYXJkLmluaXQoKTtcbiAgICB1dGlsLmFkZExpc3RlbmVyVG9BY3Rpb25zKCk7XG4gIH0sXG5cbn07XG5cblxuLy8gb24gYWNjcm9jaGUgdW4gw6ljb3V0ZXVyIGQnw6l2w6huZW1lbnQgc3VyIGxlIGRvY3VtZW50IDogcXVhbmQgbGUgY2hhcmdlbWVudCBlc3QgdGVybWluw6ksIG9uIGxhbmNlIGFwcC5pbml0XG5kb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKCdET01Db250ZW50TG9hZGVkJywgYXBwLmluaXQgKTsiLCJjb25zdCB1dGlsID0gcmVxdWlyZSgnLi91dGlsJyk7XG5cbmNvbnN0IGNhcmQgPSB7XG4gIGluaXQ6IGZ1bmN0aW9uKCkge1xuICAgIGNhcmQuZm9ybUVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWRkQ2FyZEZvcm0nKTtcbiAgICBjYXJkLm1vZGFsRWxlbWVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoJyNhZGRDYXJkTW9kYWwnKTtcbiAgICBjYXJkLmZvcm1FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGNhcmQuaGFuZGxlQWRkRm9ybSk7XG4gIH0sXG5cbiAgaGFuZGxlQWRkRm9ybTogYXN5bmMgZnVuY3Rpb24oZXZlbnQpIHtcbiAgICAvLyBham91dCBkZSBsYSBjYXJkIHN1ciBsZSBtZW1lIG1vZMOobGUgcXVlIGxhIGxpc3RlXG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTsgXG4gICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YShjYXJkLmZvcm1FbGVtZW50KTtcbiAgICAvLyBvbiByw6ljdnVww6hyZSBsYSB2YWxldXIgZHUgY2hhbXAgY2FjaMOpXG4gICAgY29uc3QgbGlzdElkID0gZGF0YS5nZXQoJ2xpc3RfaWQnKTtcbiAgICAvLyBwZXJtZXQgZCdham91dGVyIHVuZSBkb25uw6llIGF1eCBmb3JtRGF0YVxuICAgIC8vIG9uIGNpYmxlIGxhIGxpc3RlXG4gICAgY29uc3QgbGlzdFBhcmVudCA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3IoYC5wYW5lbFtkYXRhLWxpc3QtaWQ9XCIke2xpc3RJZH1cIl1gKTtcbiAgICAvLyBvbiBjaWJsZSBsZXMgY2FydGVzIGRlZGFuc1xuICAgIGNvbnN0IGJveGVzID0gbGlzdFBhcmVudC5xdWVyeVNlbGVjdG9yQWxsKCcuYm94Jyk7XG4gICAgLy8gb24gY29tcHRlIHBvdXIgY29ubmFpdHJlIGxhIHBvc2lzaXRpb24gZGUgbGEgbm91dmVsbGUgY2FydGVcbiAgICBkYXRhLmFwcGVuZCgncG9zaXRpb24nLCBib3hlcy5sZW5ndGggKyAxKTtcbiAgICB0cnkge1xuICAgICAgLy8gYXZhbnQgZGUgbW9kaWZpZXIgbGUgRE9NIG9uIGluZm9ybWUgbm90cmUgQVBJIHF1J2lsIGZhdXQgZmFpcmUgcGVyc2lzdGVyIGRlcyBpbmZvcyBkJ3VuZSBjYXJ0ZVxuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt1dGlsLmJhc2VfdXJsfS9jYXJkYCwge1xuICAgICAgICBtZXRob2Q6ICdQT1NUJyxcbiAgICAgICAgYm9keTogZGF0YSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIC8vIHNpIHRvdXQgdmEgYmllblxuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIC8vIG9uIG1vZGlmaWUgbGUgZG9tXG4gICAgICAgIGNhcmQubWFrZUluRE9NKGJvZHkuY2FyZCk7XG4gICAgICAgIGNhcmQubW9kYWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWUgPSAnJztcbiAgICAgICAgdXRpbC5oaWRlTW9kYWxzKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgLy8gc2lub24gb24gZ8OocmUgbCdlcnJldXJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGJvZHkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIGFsZXJ0KCdFcnJldXIgbG9ycyBkZSBsYSBzYXV2ZWdhcmRlIGRlIGxhIGNhcnRlJyk7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9XG4gIH0sXG5cbiAgaGFuZGxlRWRpdEZvcm06IGFzeW5jIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyAtZmFpcmUgcGVyc2lzdGVyIGxlcyBtb2RpZmljYXRpb25zIHNhaXNpZXMgcGFyIGwndXRpbGlzYXRldXIgZW4gQkREIHZpYSB1biBhcHBlbCBhamF4IMOgIG5vdHJlIGFwaVxuICAgIC8vIHJldHJvdXZlciBsJ2lkIGRlIGxhIGNhcmRcbiAgICBjb25zdCBmb3JtID0gZXZlbnQudGFyZ2V0O1xuICAgIGNvbnN0IGNhcmRQYXJlbnQgPSBmb3JtLmNsb3Nlc3QoJy5ib3gnKTtcbiAgICAvLyBjb25zdCBjYXJkSWQgPSBjYXJkUGFyZW50LmRhdGFzZXQuY2FyZElkO1xuICAgIGNvbnN0IGNhcmRJZCA9IGNhcmRQYXJlbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNhcmQtaWQnKTtcbiAgICBjb25zdCBkYXRhID0gbmV3IEZvcm1EYXRhKGZvcm0pO1xuICAgIHRyeSB7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3V0aWwuYmFzZV91cmx9L2NhcmQvJHtjYXJkSWR9YCwge1xuICAgICAgICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAgIGJvZHk6IGRhdGFcbiAgICAgIH0pO1xuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAvLyAtIGVuIGNhcyBkZSBzdWNjw6hzIG1vZGlmaWVyIGxlIGRvbSBwb3VyIGFmZmljaGVyIGxhIGNhcmQgbW9kaWZpw6llXG4gICAgICAgIGZvcm0uY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJyk7XG4gICAgICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGZvcm0ucHJldmlvdXNFbGVtZW50U2libGluZztcbiAgICAgICAgLy8gY29uc3QgdGl0bGVFbGVtZW50ID0gY2FyZFBhcmVudC5xdWVyeVNlbGVjdG9yKCcuY2FyZC1uYW1lJyk7XG4gICAgICAgIHRpdGxlRWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKTtcbiAgICAgICAgdGl0bGVFbGVtZW50LnRleHRDb250ZW50ID0gYm9keS5jYXJkLnRpdGxlO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIC8vIC0gc2lub24gYWZmaWNoZXIgdW5lIGVycmV1clxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYm9keSk7XG4gICAgICB9IFxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIGFsZXJ0KCdFcnJldXIgbG9ycyBkZSBsYSBtaXNlIMOgIGpvdXInKTtcbiAgICAgIGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuICAgIH1cbiAgfSxcblxuICAvLyBvbiByw6ljdXDDqHJlIHVuIG9iamV0IHJlcHLDqXNlbnRhbnQgbGEgY2FyZFxuICBtYWtlSW5ET006IGZ1bmN0aW9uKGNhcmRJdGVtKSB7XG4gICAgLy8gY3LDqWF0aW9uIGRlIGxhIGNhcmQgZGFucyBsZSBkb20gc3VyIGxlIG1lbWUgcHJpbmNpcGUgcXVlIGxhIGxpc3RlXG4gICAgY29uc3QgdGVtcGxhdGUgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjY2FyZFRlbXBsYXRlJyk7XG4gICAgY29uc3QgY2xvbmUgPSB0ZW1wbGF0ZS5jb250ZW50LmNsb25lTm9kZSh0cnVlKTtcbiAgICBjbG9uZS5xdWVyeVNlbGVjdG9yKCcuY2FyZC1uYW1lJykudGV4dENvbnRlbnQgPSBjYXJkSXRlbS50aXRsZTtcbiAgICBjb25zdCBib3hFbGVtZW50ID0gY2xvbmUucXVlcnlTZWxlY3RvcignLmJveCcpO1xuICAgIGJveEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLWNhcmQtaWQnLCBjYXJkSXRlbS5pZCk7XG4gICAgYm94RWxlbWVudC5zdHlsZS5ib3JkZXJCb3R0b21Db2xvciA9IGNhcmRJdGVtLmNvbG9yO1xuICAgIC8vIG9uIMOpY291dGUgbGUgY2xpY2sgc3VyIGxlIGNyYXlvblxuICAgIGNvbnN0IHBlbmNpbCA9IGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5lZGl0LWJ0bicpO1xuICAgIHBlbmNpbC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcmQuc2hvd0VkaXRGb3JtKTtcbiAgICAvLyBvbiDDqWNvdXRlIGxlIGNsaWNrIHN1ciBsYSBwb3ViZWxsZVxuICAgIGNvbnN0IHRyYXNoID0gY2xvbmUucXVlcnlTZWxlY3RvcignLmRlbGV0ZS1idG4nKTtcbiAgICB0cmFzaC5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcmQuaGFuZGxlRGVsZXRlKTtcbiAgICAvLyBvbiDDqWNvdXRlIGxhIHNvdW1pc3Npb24gZHUgZm9ybVxuICAgIGNvbnN0IGZvcm0gPSBjbG9uZS5xdWVyeVNlbGVjdG9yKCdmb3JtJyk7XG4gICAgZm9ybS5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBjYXJkLmhhbmRsZUVkaXRGb3JtKTtcbiAgICAvLyBvbiBpbnPDqHJlIGxhIGNhcmQgYXUgYm9uIGVuZHJvaXQgZGFucyBsYSBsaXN0ZSwgb24gdXRpbGlzZSBpY2kgdW4gc2VsZWN0ZXVyIGQnYXR0cmlidXRcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKGBkaXZbZGF0YS1saXN0LWlkPVwiJHtjYXJkSXRlbS5saXN0X2lkfVwiXSAucGFuZWwtYmxvY2tgKS5hcHBlbmRDaGlsZChjbG9uZSk7XG4gIH0sXG5cbiAgaGFuZGxlRGVsZXRlOiBhc3luYyBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgLy8gaWRlbnRpZmllciBsJ2lkIGRlIGxhIGNhcnRlIGNsaXF1w6llXG4gICAgY29uc3QgdHJhc2ggPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3QgY2FyZEVsZW1lbnQgPSB0cmFzaC5jbG9zZXN0KCcuYm94Jyk7XG4gICAgY29uc3QgY2FyZElkID0gY2FyZEVsZW1lbnQuZ2V0QXR0cmlidXRlKCdkYXRhLWNhcmQtaWQnKTtcbiAgICAvLyBhcHBlbGVyIGwnYXBpIHBvdXIgZGlyZSBxdSdvbiBzdXBwcmltZXIgbGEgY2FydGUgY2xpcXXDqWVcbiAgICB0cnkge1xuICAgICAgY29uc3QgcmVzcG9uc2UgPSBhd2FpdCBmZXRjaChgJHt1dGlsLmJhc2VfdXJsfS9jYXJkLyR7Y2FyZElkfWAsIHtcbiAgICAgICAgbWV0aG9kOiAnREVMRVRFJyxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAvLyBzaSB0b3V0IHZhIGJpZW4sIHN1cHByaW1lciBsYSBjYXJ0ZSBkdSBET01cbiAgICAgICAgY2FyZEVsZW1lbnQucmVtb3ZlKCk7XG4gICAgICB9XG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGJvZHkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIGFsZXJ0KCdJbXBvc3NpYmxlIGRlIHN1cHByaW1lcicpO1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfVxuICB9LFxuXG4gIC8vIHF1b2kgZmFpcmUgYXUgY2xpY2sgc3VyIGxlIGNyYXlvblxuICBzaG93RWRpdEZvcm06IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAvLyBhZmZpY2hlciBsZSBmb3JtdWxhaXJlIGQnw6lkaXRpb24gLy8gY2libGVyIGxlIGZvcm11bGFpcmUgZXQgbHVpIGVubGV2ZXIgbGEgY2xhc3NlIGlzLWhpZGRlblxuICAgIC8vIG9uIGlkZW50aWZpZSBsZSBjcmF5b24gY2xpcXXDqVxuICAgIGNvbnN0IHBlbmNpbCA9IGV2ZW50LnRhcmdldDtcbiAgICAvLyBvbiB0cm91dmUgbGEgY2FydGUgcGFyZW50XG4gICAgY29uc3QgY2FyZEVsZW1lbnQgPSBwZW5jaWwuY2xvc2VzdCgnLmJveCcpO1xuICAgIC8vIG9uIHRyb3V2ZSBzb24gZW5mYW50IGZvcm1cbiAgICBjb25zdCBmb3JtID0gY2FyZEVsZW1lbnQucXVlcnlTZWxlY3RvcignZm9ybScpO1xuICAgIC8vIG9uIGVubGV2ZSBsYSBjbGFzc2UgaXMtaGlkZGVuXG4gICAgZm9ybS5jbGFzc0xpc3QucmVtb3ZlKCdpcy1oaWRkZW4nKTtcbiAgICAvLyBtYXNxdWVyIGxlIG5vbSBkZSBsYSBjYXJ0ZVxuICAgIGNvbnN0IHRpdGxlID0gY2FyZEVsZW1lbnQucXVlcnlTZWxlY3RvcignLmNhcmQtbmFtZScpO1xuICAgIHRpdGxlLmNsYXNzTGlzdC5hZGQoJ2lzLWhpZGRlbicpO1xuICAgIC8vIG9uIHByw6lyZW1wbGkgbGUgY2hhbXBcbiAgICBjb25zdCBpbnB1dCA9IGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cInRpdGxlXCJdJylcbiAgICBpbnB1dC52YWx1ZSA9IHRpdGxlLnRleHRDb250ZW50O1xuICAgIC8vIG9uIGxlIGNpYmxlIHZpYSBsYSBtw6l0aG9kZSBmb2N1cyBzdXIgbCfDqWxlbWVudCBpbnB1dFxuICAgIGlucHV0LmZvY3VzKCk7XG4gIH0sXG5cbiAgc2hvd0FkZE1vZGFsOiBmdW5jdGlvbihldmVudCkge1xuICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgY2FyZC5tb2RhbEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gICAgLy8gZW4gcGx1cyBkJ2FmZmljaGVyIGxhIG1vZGFsLCBvbiBtb2RpZmllIGxhIHZhbGV1ciBkdSBjaGFtcCBjYWNow6kgcG91ciBtw6ltb3Jpc2VyIGwnaWQgZGUgbGEgbGlzdGUgcGFyZW50XG4gICAgLy8gb24gdHJvdXZlIGxlIGJvdXRvbiBjbGlxdcOpXG4gICAgY29uc3QgYnRuID0gZXZlbnQudGFyZ2V0O1xuICAgIC8vIGwnw6lsZW1lbnQgcXVpIGEgw6l0w6kgY2xpcXXDqSwgY2VsdWkgcXVpIGEgZMOpY2xlbmNow6kgbCfDqXbDqW5lbWVudFxuICAgIC8vIHVuIMOpdsOpbmVtZW50IGVuIGphdmFzY3JpcHQgc2UgcHJvcGFnZSwgZG9uYyB1biBwYXJlbnQgcGV1dCBlbnRlbmRyZSBsZXMgw6l2w6luZW1lbnQgZMOpY2xlbmNow6lzIHN1ciBzZXMgZW5mYW50c1xuICAgIC8vIGNvbnNvbGUubG9nKGV2ZW50LnRhcmdldClcbiAgICAvLyBsJ8OpbGVtZW50IHN1ciBsZXF1ZWwgbCfDqXbDqW5lbWVudCBlc3Qgw6ljb3V0w6lcbiAgICAvLyBjb25zb2xlLmxvZyhldmVudC5jdXJyZW50VGFyZ2V0KVxuICAgIC8vIG9uIHRyb3V2ZSBsZSBwYXJlbnQgcmVwcsOpc2VudGFudCBsYSBsaXN0ZVxuICAgIGNvbnN0IHBhcmVudCA9IGJ0bi5jbG9zZXN0KCcucGFuZWwnKTtcbiAgICAvLyBvbiB0cm91dmUgc29uIGxpc3QtaWRcbiAgICBjb25zdCBpZCA9IHBhcmVudC5nZXRBdHRyaWJ1dGUoJ2RhdGEtbGlzdC1pZCcpO1xuICAgIC8vIG9uIG1vZGlmaWUgbGEgdmFsZXVyIGR1IGNoYW1wIGNhY2jDqVxuICAgIGNhcmQubW9kYWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0W25hbWU9XCJsaXN0X2lkXCJdJykudmFsdWUgPSBpZDtcbiAgfSxcblxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBjYXJkO1xuIiwiY29uc3QgY2FyZCA9IHJlcXVpcmUoJy4vY2FyZCcpO1xuY29uc3QgdXRpbCA9IHJlcXVpcmUoJy4vdXRpbCcpO1xuXG5jb25zdCBsaXN0ID0ge1xuICBpbml0OiBmdW5jdGlvbigpIHtcbiAgICBsaXN0LmZvcm1FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FkZExpc3RGb3JtJyk7XG4gICAgbGlzdC5tb2RhbEVsZW1lbnQgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcjYWRkTGlzdE1vZGFsJyk7XG4gICAgbGlzdC5idXR0b25FbGVtZW50ID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2FkZExpc3RCdXR0b24nKTtcbiAgICBsaXN0LmJ1dHRvbkVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBsaXN0LnNob3dBZGRNb2RhbCk7XG4gICAgbGlzdC5mb3JtRWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCdzdWJtaXQnLCBsaXN0LmhhbmRsZUFkZEZvcm0pO1xuICAgIC8vIGonZXhlY3V0ZSBtYSB0YWNoZSBhc3luY2hyb25lIHBvdXIgcsOpY3Vww6lyZXIgZXQgZ8OpbsOpcmVyIGxlcyBsaXN0ZXNcbiAgICBsaXN0LmdldExpc3RzRnJvbUFQSSgpO1xuICB9LFxuXG4gIC8vIG9uIGZhaXQgdW5lIGZvbmN0aW9uIGFzeW5jaHJvbmUgY2FyIG9uIG5lIHZldXQgcGFzIG1ldHRyZSBlbiBwYXVzZSBsZSBzY3JpcHQsIGlsIGNvbnRpbnVlIHNvbiBleGVjdXRpb25cbiAgZ2V0TGlzdHNGcm9tQVBJOiBhc3luYyBmdW5jdGlvbigpIHtcbiAgICB0cnkge1xuICAgICAgLy8gb24gYXR0ZW5kIGxhIHLDqXBvbnNlIGRlIGwnYXBpXG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3V0aWwuYmFzZV91cmx9L2xpc3RzYCk7XG4gICAgICAvLyBvbiBhdHRlbmQgbCdhbmFseXNlIGR1IGNvcnBzIGRlIGxhIHLDqXBvbnNlIGVuIGpzb25cbiAgICAgIGNvbnN0IGJvZHkgPSBhd2FpdCByZXNwb25zZS5qc29uKCk7XG4gICAgICAvLyBzaSB0b3V0IHZhIGJpZW5cbiAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDIwMCkge1xuICAgICAgICAvLyBvbiBkaXQgcXVvaSBmYWlyZSBkZXMgZG9ubsOpZXMgcsOpY3Vww6lyw6llcywgaWNpIHBvdXIgY2hhcXVlIGxpc3RlIG9uIGfDqW7DqHJlIHVuZSBsaXN0ZSBkYW5zIGxlIERPTSwgb24gYSB0cmFucG9zw6kgdW5lIGRvbm7DqWUgYnJ1dCB2ZXJzIHVuZSBpbnRlcmZhY2UgZmFjaWxlbWVudCBjb21wcsOpaGVuc2libGUgcGFyIG1vbiB1dGlsaXNhdGV1clxuICAgICAgICAvLyBjb2RlIFJFRCA6IG9uIHLDqWN1cMOocmUgdW4gdGFibGVhdVxuICAgICAgICAvLyBmb3IgKGxpc3Qgb2YgYm9keSkge1xuICAgICAgICAvLyBjb2RlIEJMVUUgOiBvbiByw6ljdXDDqHJlIHVuIG9iamV0IGNvbnRlbmFudCB1biB0YWJsZWF1XG4gICAgICAgIGZvciAoY29uc3QgbGlzdEl0ZW0gb2YgYm9keS5saXN0cykge1xuICAgICAgICAgIGxpc3QubWFrZUluRE9NKGxpc3RJdGVtLm5hbWUsIGxpc3RJdGVtLmlkKTtcbiAgICAgICAgICBmb3IgKGNvbnN0IGNhcmRJdGVtIG9mIGxpc3RJdGVtLmNhcmRzKSB7XG4gICAgICAgICAgICBjYXJkLm1ha2VJbkRPTShjYXJkSXRlbSk7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICB9XG4gICAgICAvLyBzaSBsJ2FwaSBub3VzIHLDqXBvbmQgbWFpcyBxdWUgbGEgcsOpcG9uc2UgZXN0IHVuZSBlcnJldXIgKHBhciBleGVtcGxlIHNpIG9uIG9idGllbnQgY29kZSA0MFgpXG4gICAgICBlbHNlIHtcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGJvZHkpO1xuICAgICAgfVxuICAgIH0gY2F0Y2goZXJyb3IpIHtcbiAgICAgIGFsZXJ0KCdFcnJldXIgbG9ycyBkZSBsYSByw6ljdXDDqXJhdGlvbiBkZXMgbGlzdGVzJyk7XG4gICAgICBjb25zb2xlLmVycm9yKGVycm9yKTtcbiAgICB9XG5cbiAgfSxcblxuICBoYW5kbGVBZGRGb3JtOiBhc3luYyBmdW5jdGlvbihldmVudCkge1xuICAgIC8vIGonZW1wZWNoZSBsZSBjb21wb3J0ZW1lbnQgcGFyIGTDqWZhdXQgZGUgbCfDqXbDqW5lZW1lbnRcbiAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpOyBcbiAgICAvLyByw6ljdXDDqXJlciBsYSB2YWxldXIgZHUgY2hhbXBcbiAgICAvLyBncmFjZSBhdSBjb25zdHJ1Y3RldXIgRm9ybURhdGEgamUgcGV1eCBwYXNzZXIgw6AgbGEgbW91bGluZXR0ZSB1biBmb3JtIGV0IHNlcyBjaGFtcHMsIHBvdXIgdm9pciBlbnN1aXRlIGxpcmUgZmFjaWxlbWVudCBsZXMgdmFsZXVycyBkZXMgY2hhbXBzXG4gICAgY29uc3QgZGF0YSA9IG5ldyBGb3JtRGF0YShsaXN0LmZvcm1FbGVtZW50KTtcbiAgICAvLyBpbCBmYXV0IGluZm9ybWVyIG5vdHJlIEFQSSBxdSdvbiB2ZXV0IG3DqW1vcmlzZXIgdW5lIG5vdXZlbGxlIGxpc3RlIHBvdXIgcXUnZWxsZSBsYSBmYXNzZSBwZXJzaXN0ZXIgZW4gQkREXG4gICAgdHJ5ICB7XG4gICAgICAvLyBjb2RlIFJFRCBhdmVjIHNcbiAgICAgIC8vIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dXRpbC5iYXNlX3VybH0vbGlzdHNgLCB7XG4gICAgICAvLyAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgLy8gICBib2R5OiBkYXRhLFxuICAgICAgLy8gfSk7XG4gICAgICAvLyBjb2RlIEJsdWUgc2FucyBzXG4gICAgICAvLyBjb3TDqSBibHVlIGxhIHBvc2l0aW9uIGVzdCBvYmxpZ2F0b2lyZVxuICAgICAgLy8gdmlhIGxhIG3DqXRob2RlIGFwcGVuZCBvbiBwZXV0IGFqb3V0ZXIgdW5lIHBhaXJlIGNsw6kgdmFsZXVyIMOgIG5vcyBmb3JtRGF0YVxuICAgICAgZGF0YS5hcHBlbmQoJ3Bvc2l0aW9uJywgZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbCgnLnBhbmVsJykubGVuZ3RoICsgMSk7XG4gICAgICBjb25zdCByZXNwb25zZSA9IGF3YWl0IGZldGNoKGAke3V0aWwuYmFzZV91cmx9L2xpc3RgLCB7XG4gICAgICAgIG1ldGhvZDogJ1BPU1QnLFxuICAgICAgICBib2R5OiBkYXRhLFxuICAgICAgfSk7XG4gICAgICBjb25zdCBib2R5ID0gYXdhaXQgcmVzcG9uc2UuanNvbigpO1xuICAgICAgaWYgKHJlc3BvbnNlLnN0YXR1cyA9PT0gMjAwKSB7XG4gICAgICAgIC8vIGNyw6llciB1bmUgbGlzdGUgZGFucyBsZSBET00gYXZlYyBsYSB2YWxldXIgZHUgY2hhbXBcbiAgICAgICAgLy8gUkVEXG4gICAgICAgIC8vIGFwcC5tYWtlTGlzdEluRE9NKGJvZHkubmFtZSwgYm9keS5pZCk7XG4gICAgICAgIC8vIEJsdWVcbiAgICAgICAgbGlzdC5tYWtlSW5ET00oYm9keS5saXN0Lm5hbWUsIGJvZHkubGlzdC5pZCk7XG4gICAgICAgIC8vIGplIHZpZGUgbGUgY2hhbXAgcG91ciBsZXMgcHJvY2hhaW5lcyBmb2lzXG4gICAgICAgIGxpc3QubW9kYWxFbGVtZW50LnF1ZXJ5U2VsZWN0b3IoJ2lucHV0JykudmFsdWUgPSAnJztcbiAgICAgICAgLy8gamUgZmVybWUgbGEgbW9kYWxlXG4gICAgICAgIHV0aWwuaGlkZU1vZGFscygpO1xuICAgICAgfVxuICAgICAgZWxzZSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihib2R5KTtcbiAgICAgIH1cbiAgICB9IGNhdGNoKGVycm9yKSB7XG4gICAgICBhbGVydCgnUHJvYmzDqG1lIGxvcnMgZGUgbGEgc2F1dmVnYXJkZSBsYSBsaXN0ZScpO1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfVxuICB9LFxuXG4gIG1ha2VJbkRPTTogZnVuY3Rpb24obGlzdE5hbWUsIGxpc3RJZCkge1xuICAgIC8vIGplIGNpYmxlIG1vbiB0ZW1wbGF0ZVxuICAgIGNvbnN0IHRlbXBsYXRlID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2xpc3RUZW1wbGF0ZScpO1xuICAgIC8vIGplIGNsb25lIHNvbiBjb250ZW51XG4gICAgLy8gY29uc3QgY2xvbmUgPSBkb2N1bWVudC5pbXBvcnROb2RlKHRlbXBsYXRlLmNvbnRlbnQsIHRydWUpO1xuICAgIGNvbnN0IGNsb25lID0gdGVtcGxhdGUuY29udGVudC5jbG9uZU5vZGUodHJ1ZSk7XG4gICAgLy8gamUgY29uZmlndXJlIGxlIGNsb25lXG4gICAgY29uc3QgdGl0bGUgPSBjbG9uZS5xdWVyeVNlbGVjdG9yKCcubGlzdC10aXRsZScpO1xuICAgIHRpdGxlLnRleHRDb250ZW50ID0gbGlzdE5hbWU7XG4gICAgdGl0bGUuYWRkRXZlbnRMaXN0ZW5lcignZGJsY2xpY2snLCBsaXN0LnNob3dFZGl0Rm9ybSk7XG4gICAgY29uc3QgZm9ybSA9IGNsb25lLnF1ZXJ5U2VsZWN0b3IoJ2Zvcm0nKTtcbiAgICBmb3JtLmFkZEV2ZW50TGlzdGVuZXIoJ3N1Ym1pdCcsIGxpc3QuaGFuZGxlRWRpdEZvcm0pO1xuICAgIGNvbnN0IHBhbmVsID0gY2xvbmUucXVlcnlTZWxlY3RvcignLnBhbmVsJyk7XG4gICAgcGFuZWwuc2V0QXR0cmlidXRlKCdkYXRhLWxpc3QtaWQnLCBsaXN0SWQpO1xuICAgIC8vIG9uIGNpYmxlIGxlIGNoYW1wIGNhY2jDqSB2aWEgdW4gc2VsZWN0ZXVyIGQnYXR0cmlidXRcbiAgICBjb25zdCBpbnB1dCA9IGZvcm0ucXVlcnlTZWxlY3RvcignaW5wdXRbbmFtZT1cImxpc3QtaWRcIl0nKTtcbiAgICBpbnB1dC5zZXRBdHRyaWJ1dGUoJ3ZhbHVlJywgbGlzdElkKTtcbiAgICAvLyAvIVxcIG9uIMOpY291dGUgbGUgY2xpY2sgc3VyIGxlICsgZGUgbGEgbm91dmVsbGUgbGlzdGUgYXVzc2kgIVxuICAgIGNsb25lLnF1ZXJ5U2VsZWN0b3IoJy5wYW5lbC1oZWFkaW5nIGEnKS5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIGNhcmQuc2hvd0FkZE1vZGFsKTtcbiAgICAvLyB0cm91dmVyIGxlIHBhcmVudCBjb2x1bW4gZHUgYm91dG9uXG4gICAgY29uc3QgY29sdW1uID0gbGlzdC5idXR0b25FbGVtZW50LmNsb3Nlc3QoJy5jb2x1bW4nKTtcbiAgICAvLyBpbmplY3RlciBhdmFudCBsZSBjbG9uZSwgb24gY29ubmFpdCBhcHBlbmRDaGlsZCBxdWkgaW5zw6hyZSB1biBlbmZhbnQgw6AgbGEgZmluIGQndW4gcGFyZW50LiAuYmVmb3JlIGluc8OocmUgbm90cmUgZW5mYW50IMOgIGNvdMOpIGV0IGp1c3RlIGF2YW50IHVuIMOpbGVtZW50IGNpYmxlXG4gICAgY29sdW1uLmJlZm9yZShjbG9uZSk7XG4gIH0sXG5cbiAgc2hvd0FkZE1vZGFsOiBmdW5jdGlvbigpIHtcbiAgICAvLyBtb2RpZmllciBzb24gc3R5bGUgZGlzcGxheVxuICAgIC8vIGxpc3RNb2RhbEVsZW1lbnQuc3R5bGUuZGlzcGxheSA9ICdibG9jayc7XG4gICAgbGlzdC5tb2RhbEVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtYWN0aXZlJyk7XG4gIH0sXG5cbiAgc2hvd0VkaXRGb3JtOiBmdW5jdGlvbihldmVudCkge1xuICAgIGNvbnN0IHRpdGxlRWxlbWVudCA9IGV2ZW50LnRhcmdldDtcbiAgICAvLyBsYSBwcm9wcmnDqXTDqSBuZXh0RWxlbWVudFNpYmxpbmcgcGVybWV0IGRlIGNpYmxlciBsZSB2b2lzaW4gc3VpdmFudCBkaXJlY3QgZCd1biBlbGVtZW50IChmcsOocmUvc29ldXIpXG4gICAgLy8gZGUgbGEgbWVtZSBtYW5pw6hyZSBpbCBleGlzdGUgcHJldmlvdXNFbGVtZW50U2libGluZyBwb3VyIHLDqWN1cMOpcmVyIGxlIHZvaXNpbiBwcsOpY8OpZGVudFxuICAgIGNvbnN0IGZvcm1FbGVtZW50ID0gdGl0bGVFbGVtZW50Lm5leHRFbGVtZW50U2libGluZztcbiAgICB0aXRsZUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJyk7XG4gICAgZm9ybUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaGlkZGVuJyk7XG4gIH0sXG5cbiAgaGFuZGxlRWRpdEZvcm06IGFzeW5jIGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gb24gZW1wZWNoZSBsYSBzb3VtaXNzaW9uIHBhciBkw6lmYXV0XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgIC8vIG9uIGNpYmxlIGxlIGZvcm11bGFpcmUgZXQgbGUgdGl0cmUgw6AgbWFuaXB1bGVyXG4gICAgY29uc3QgZm9ybUVsZW1lbnQgPSBldmVudC50YXJnZXQ7XG4gICAgY29uc3QgdGl0bGVFbGVtZW50ID0gZm9ybUVsZW1lbnQucHJldmlvdXNFbGVtZW50U2libGluZztcblxuICAgIC8vIG9uIGfDqW7DqHJlIGxlcyBwYWlyZXMgY2zDqXMvdmFsZXVycyBwb3VyIHRvdXQgY2UgcXUnaWwgeSBhIGRhbnMgbGUgZm9ybXVsYWlyZVxuICAgIGNvbnN0IGRhdGEgPSBuZXcgRm9ybURhdGEoZm9ybUVsZW1lbnQpO1xuXG4gICAgLy8gb24gcsOpY3Vww6hyZSBsJ2lkIGRlIGxhIGxpc3RlIMOgIG1vZGlmaWVyXG4gICAgY29uc3QgbGlzdElkID0gZGF0YS5nZXQoJ2xpc3QtaWQnKTtcblxuICAgIHRyeSAgeyBcbiAgICAgIC8vIG9uIGFwcGVsbGUgbCdhcGkgc3VyIGxlIGJvbiBlbmRwb2ludCBwb3VyIGZhaXJlIHBlcnNpc3RlciBsZSBjaGFuZ2VtZW50cyBkZSBsYSBsaXN0ZSBzb3VoYWl0w6llXG4gICAgICAvLyBSRURcbiAgICAgIC8vIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dXRpbC5iYXNlX3VybH0vbGlzdHMvJHtsaXN0SWR9YCwge1xuICAgICAgLy8gICBtZXRob2Q6ICdQQVRDSCcsXG4gICAgICAvLyAgIGJvZHk6IGRhdGEsXG4gICAgICAvLyB9KTtcbiAgICAgIC8vIEJsdWVcbiAgICAgIGNvbnN0IHJlc3BvbnNlID0gYXdhaXQgZmV0Y2goYCR7dXRpbC5iYXNlX3VybH0vbGlzdC8ke2xpc3RJZH1gLCB7XG4gICAgICAgIG1ldGhvZDogJ1BBVENIJyxcbiAgICAgICAgYm9keTogZGF0YSxcbiAgICAgIH0pO1xuICAgICAgY29uc3QgYm9keSA9IGF3YWl0IHJlc3BvbnNlLmpzb24oKTtcbiAgICAgIC8vIGVuIGZvbmN0aW9uIGRlIGxhIHLDqXBvbnNlIHNpIHRvdXQgdmEgYmllbiAgXG4gICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSAyMDApIHtcbiAgICAgICAgLy8gb24gbWV0IMOgIGpvdXIgbGUgdGl0cmUgZGFucyBsZSBET01cbiAgICAgICAgLy8gUmVkXG4gICAgICAgIC8vIHRpdGxlRWxlbWVudC50ZXh0Q29udGVudCA9IGJvZHkubmFtZTtcbiAgICAgICAgLy8gQmx1ZVxuICAgICAgICB0aXRsZUVsZW1lbnQudGV4dENvbnRlbnQgPSBib2R5Lmxpc3QubmFtZTtcbiAgICAgIH1cbiAgICAgIGVsc2Uge1xuICAgICAgICAvLyBzaSB0b3V0IHZhIG1hbCBvbiBhZmZpY2hlIHVuZSBlcnJldXJcbiAgICAgICAgdGhyb3cgbmV3IEVycm9yKGJvZHkpO1xuICAgICAgfVxuXG4gICAgfSBjYXRjaChlcnJvcikge1xuICAgICAgYWxlcnQoJ1Byb2Jsw6htZSBsb3JzIGRlIGxhIG1pc2Ugw6Agam91ciBsYSBsaXN0ZScpO1xuICAgICAgY29uc29sZS5lcnJvcihlcnJvcik7XG4gICAgfVxuICAgIC8vIG9uIHLDqWFmZmljaGUgbGUgdGl0cmVcbiAgICB0aXRsZUVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZSgnaXMtaGlkZGVuJyk7XG4gICAgZm9ybUVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtaGlkZGVuJyk7XG4gIH0sXG5cbn07XG5cbm1vZHVsZS5leHBvcnRzID0gbGlzdDtcbiIsImNvbnN0IHV0aWwgPSB7XG4gIC8vIGJhc2VfdXJsOiAnaHR0cDovL2xvY2FsaG9zdDozMDAwJyxcbiAgYmFzZV91cmw6ICdodHRwOi8vbG9jYWxob3N0OjMwMDEnLFxuXG4gIGhpZGVNb2RhbHM6IGZ1bmN0aW9uKCkge1xuICAgIC8vIGxpc3QubW9kYWxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuICAgIC8vIGNhcmQubW9kYWxFbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUoJ2lzLWFjdGl2ZScpO1xuXG4gICAgLy8gb3UgYmllblxuICAgIGNvbnN0IG1vZGFscyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoJy5tb2RhbCcpO1xuICAgIG1vZGFscy5mb3JFYWNoKChtb2RhbCkgPT4ge1xuICAgICAgbW9kYWwuY2xhc3NMaXN0LnJlbW92ZSgnaXMtYWN0aXZlJyk7XG4gICAgfSk7XG4gIH0sXG5cbiAgYWRkTGlzdGVuZXJUb0FjdGlvbnM6IGZ1bmN0aW9uKCkgeyBcbiAgICAvLyBjaWJsZXIgbGVzIGJvdXRvbnMgY2xvc2VcbiAgICBjb25zdCBjbG9zZUJ1dHRvbnMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCcuY2xvc2UnKTtcbiAgICAvLyBwb3NlciB1biDDqWNvdXRldXIgZGVzc3VzIGF1IGNsaWNrXG4gICAgLy8gZm9yIChjb25zdCBjbG9zZUJ1dHRvbiBvZiBjbG9zZUJ1dHRvbnMpIHtcbiAgICAvLyAgIGNvbnNvbGUubG9nKGNsb3NlQnV0dG9uKTtcbiAgICAvLyB9XG4gICAgY2xvc2VCdXR0b25zLmZvckVhY2goKGNsb3NlQnV0dG9uKSA9PiB7XG4gICAgICBjbG9zZUJ1dHRvbi5hZGRFdmVudExpc3RlbmVyKCdjbGljaycsIHV0aWwuaGlkZU1vZGFscyk7XG4gICAgfSk7XG4gIH0sXG59O1xuXG5tb2R1bGUuZXhwb3J0cyA9IHV0aWw7XG4iXX0=
