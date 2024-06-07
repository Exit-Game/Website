// GLobale Variablen
const apiDomain = 'http://192.168.213.6:5000';
const apiDomain2 = 'https://getpantry.cloud/apiv1/pantry/23bc2630-a93e-409e-abaf-2fb1d22d05fe/basket/generalData';
var intervalSpeed;
var intervalImages;
var intervalRange;

// 1 Initialisierung

// Passwort Zugriff Beschränkung
document.addEventListener('DOMContentLoaded', function() // Wenn Initialisierung des html Dokumentes abgeschlossen ist, noch keine Rressourcen
{
    var form = document.querySelector('form');
    form.addEventListener('submit', function(event)
    {
        event.preventDefault();
        var password = document.getElementById('pwd').value;
        if ( password === 'Geheimnis' || password === 'geheimnis' ) {
            document.cookie = "auth=true";
            window.location.href = 'dash.html';
        } else {
            alert('Falsches Passwort!');
        }
    });
});

window.onload = function() { // Wenn gesamtes Dokument (Elemente, Stylesheet usw) geladen ist
  if ( getCookie('windowOpen2') === 'true' ) // Wenn game gewonnen dash reset und rest nicht machen
  {
    insertImages();
    resetDash();
    return;
  }
  increaseSpeed();
  decreaseRange();
  insertImages();
  intervalSpeed = setInterval( increaseSpeed, 789 ); // Alle Sekunde Geschwindigkeit erhöhen
  intervalImages = setInterval( insertImages, 2000 ); // Alle 3 Sekunden Bilder aktualisieren
  intervalRange = setInterval( decreaseRange, 6000 ); // alle 6s = 30min total Zeit
};

// 2 Wichtige Funktionen zur Logik der Website

async function insertImages()
{ 
  const windowOpen = (getCookie('windowOpen') === 'true') || false; // Wenn noch kein Cookie vorhanden oder Cookie false sagt dann ist es false
  const windowOpen2 = (getCookie('windowOpen2') === 'true') || false;
  const windowOpen3 = (getCookie('windowOpen3') === 'true') || false;
  const data = await fetchData();

  // Tür images
  for ( var key = 1; key <= 2; key++ )
  {
    if (data[key] == true)
      {
        document.getElementById('tür' + key).querySelector('img').src = "Images/door_green.png";
      } else
      {
        document.getElementById('tür' + key).querySelector('img').src = "Images/door_red.png";
      }
  }

  if ( data[3] == true ) // Wenn Emergency Button true, dann game won Window öffnen + button green
  {
    document.getElementById('tür3').querySelector('img').src = "Images/emergency_green.png";
    if ( !windowOpen2 ) // Nur wenn das Fenster noch nicht gezeigt wurde, um spam zu vermeiden
    {
      showWindow('gameWonWindow');
      setCookie('windowOpen2', 'true', 7);
      resetDash();
    }
  }
  else
  {
    document.getElementById('tür3').querySelector('img').src = "Images/emergency_red.png";
  }
  if ( data[1] == false ) // Am Anfang vom Spiel
  {
    if ( !windowOpen3 ) // Nur wenn das Fenster noch nicht gezeigt wurde, um spam zu vermeiden
    {
      showWindow('hinweisWindow');
      setCookie('windowOpen3', 'true', 7);
    }
  }
  if ( data[4] == true && !windowOpen) // Wenn "4" true dann tutorialWindow öffnen
  {
    showWindow('tutorialWindow');
    setCookie('windowOpen', 'true', 7);
  }
}

// Geschwindigkeit erhöhen
function increaseSpeed() {

    let speed = parseInt(getCookie("speed")) || 122; // Geschwindigkeit aus dem Cookie lesen oder 122, wenn kein Cookie vorhanden
    const speedIncrement = Math.floor(Math.random() * 3); // random zahl zwischen 0 und 3
    speed += speedIncrement;

    // Max Geschwindigkeit Begrenzung
    if (speed >= 500) {
        speed = 500;
        document.getElementById('speed').textContent = "MAX";
      } else {
        document.getElementById('speed').textContent = speed;
      }

    setCookie("speed", speed, 7); // Geschwindigkeit in Cookie speichern, 7 bedeutet 7 Tage Gültigkeit
  }

  // Reichweite verringern
  function decreaseRange() {
  
    let range = parseInt(getCookie("range")) || 300; // Geschwindigkeit aus dem Cookie lesen oder 300, wenn kein Cookie vorhanden
    range -= 1; // Alle 6s
  
    if ( range == 0 ) { // Game over, popup
        document.getElementById('range').textContent = "0";
        setCookie("range", -1, 7);
        document.getElementById("gameOverWindow").style.display = "flex";
        return;
        // game over popup
    }
    else if ( range < 0) { // Damit das popup nicht gespammt wird und er einfach nichts macht ab dann
      document.getElementById('range').textContent = "0";
    }
    else { // Normalfall
        document.getElementById('range').textContent = range;
      }
    setCookie("range", range, 7); // Geschwindigkeit in Cookie speichern, 7 bedeutet 7 Tage Gültigkeit
  }

  // Wenn emergency button gedrückt wird
  function emergency()
  {    
    // POST-Request an API, kein Body benötigt
    fetch(apiDomain + '/set-game/NFC-Tag', {
    // fetch(apiDomain2, {
      method: 'POST',
    })
    .catch(error => {
      emergency();
    });
  }

  // 3 Hilfsfunktionen
  
  // Funktion zum Setzen eines Cookies
  function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = "expires=" + date.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
  }
  
  // Funktion zum Lesen eines Cookies
  function getCookie(name) {
    const decodedCookie = decodeURIComponent(document.cookie);
    const cookies = decodedCookie.split(';');
    for (let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i].trim();
      if (cookie.startsWith(name + "=")) {
        return cookie.substring(name.length + 1);
      }
    }
    return "";
  }

  async function fetchData() {
    try {
      const response = await fetch(apiDomain + '/get-game');
      // const response = await fetch(apiDomain2);
      const data = await response.json();
      return data;
    } catch (error) {
      console.error(error);
      throw error; // Fehler weitergeben, um in der aufrufenden Funktion behandelt zu werden
    }
  }

  // Show window allgemein
function showWindow(id) {
  var window = document.getElementById(id);
  window.style.display = "inline";
  addEventListenerEscape(id);
}

// Close Window allgemein
function closeWindow(id) {
  var window = document.getElementById(id);
  window.style.display = "none";
}
// EscapeTaste allgemein 
function addEventListenerEscape(id)  {
document.addEventListener('keydown', function(event) {
  if (event.key === 'Escape') {
    document.getElementById(id).style.display = 'none';
  }
});
}
// Nachdem das Spiel gewonnen wude, Reichweite freezen + speed auf 0
function resetDash()
  {
    clearInterval(intervalSpeed); clearInterval(intervalImages); clearInterval(intervalRange);
    document.getElementById('range').textContent = getCookie('range');
    document.getElementById('speed').textContent = 0;
    document.getElementById('alarmWindow').style.display = "none";
    setCookie('speed', '0', 7);
    insertImages();
  }
