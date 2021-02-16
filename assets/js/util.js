const util = {
  // base_url: 'http://localhost:3000',
  base_url: 'http://localhost:3001',

  hideModals: function() {
    list.modalElement.classList.remove('is-active');
    card.modalElement.classList.remove('is-active');

    // ou bien
    // const modals = document.querySelectorAll('.modal');
    // modals.forEach((modal) => {
    //   modal.classList.remove('is-active');
    // });
  },

  addListenerToActions: function() { 
    // poser un écouteur au click sur le botuon
    list.buttonElement.addEventListener('click', list.showAddModal);
    // cibler les boutons close
    const closeButtons = document.querySelectorAll('.close');
    // poser un écouteur dessus au click
    // for (const closeButton of closeButtons) {
    //   console.log(closeButton);
    // }
    closeButtons.forEach((closeButton) => {
      closeButton.addEventListener('click', util.hideModals);
    });
    // objectif : afficher une liste dans la page à la validation du formulaire
    // réagir à la soumission
    list.formElement.addEventListener('submit', list.handleAddForm);

    // soumission du formulaire des card
    card.formElement.addEventListener('submit', card.handleAddForm);
  },
};