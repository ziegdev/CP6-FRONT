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
