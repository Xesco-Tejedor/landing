// Filtro del catálogo por tipo de juego
(function () {
  var chips = document.querySelectorAll('.chip');
  var cards = document.querySelectorAll('.card');
  var count = document.getElementById('count');

  function apply(filter) {
    var shown = 0;
    cards.forEach(function (card) {
      var match = filter === 'todos' || card.dataset.cat === filter;
      card.classList.toggle('hidden', !match);
      if (match) shown++;
    });
    count.textContent = shown === cards.length
      ? cards.length + ' juegos'
      : shown + ' de ' + cards.length + ' juegos';
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      chips.forEach(function (c) { c.classList.remove('active'); });
      chip.classList.add('active');
      apply(chip.dataset.filter);
    });
  });

  apply('todos');
})();
