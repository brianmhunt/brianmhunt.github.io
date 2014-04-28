var deck = bespoke.from('article', {
  keys: true,
  touch: true,
  bullets: 'li, .bullet',
  scale: true,
  hash: true,
  progress: true,
  state: true,
  forms: true
});


/* See eg http://tutorialzine.com/2011/09/shuffle-letters-effect-jquery/
 */
function randomChar() {
  var arr,
      pool = "abcdefghijklmnopqrstuvwxyz0123456789"
           + "ABCDEFGHIJKLMNOPQRSTUVWXY"
           + ",.?/\\(^)![]{}*&^%$#'\"";
  arr = pool.split('');
  return arr[Math.floor(Math.random() * arr.length)]
}


function shuffle(ch) {
  if (ch === ' ') {
    return ' ';
  }
  return randomChar(ch);
}


function crypt() {
  var $this = $(this),
      text = $this.text(),
      encoded = text.split('').map(shuffle).join("");

  $this.data('text', text);
  $this.text(encoded);
}


function text_only() {
  // text-only.
  return $(this).children().length == 0;
}


function decrypt() {
  var $this = $(this),
      decoded = $this.data('text'),
      encoded = $this.text(),
      TIMEOUT = 15,
      pos = 0;

  function unshuffle() {
    console.log("DEcoding", encoded, "to", decoded, "pos", pos)
    $this.text(decoded.substr(0, pos) + encoded.substr(pos));
    if (pos > decoded.length) {
      return;
    }
    setTimeout(function () {
      unshuffle(pos++)
    }, TIMEOUT)
  }
  unshuffle()
}


deck.on('activate', function (evt) {
  $(evt.slide).find('*').filter(text_only).each(crypt).each(decrypt)
})
