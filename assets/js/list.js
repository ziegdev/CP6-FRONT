const list = {
  init: function() {
    list.formElement = document.querySelector('#addListForm');
    list.modalElement = document.querySelector('#addListModal');
    list.buttonElement = document.querySelector('#addListButton');
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
