// Comme nous voulons avoir accès à un nœud DOM,
// nous initialisons le script au chargement de la page.
window.addEventListener('load', function () {

    // Ces variables s'utilisent pour stocker les données du formulaire
    var text = document.getElementById("i1");
    var file = {
          dom    : document.getElementById("i2"),
          binary : null
        };
  
    // Nous utilisons l'API de FileReader pour accéder au contenu du fichier
    var reader = new FileReader();
  
    // Comme FileReader est asynchrone, stockons son résulata
    // quand il a fini de lire le fichier
    reader.addEventListener("load", function () {
      file.binary = reader.result;
    });
  
    // Au chargement de la page, si un fichier est déjà choisi, lisons‑le
    if(file.dom.files[0]) {
      reader.readAsBinaryString(file.dom.files[0]);
    }
  
    // Sinon, lisons le fichier une fois que l'utilisateur l'a sélectionné
    file.dom.addEventListener("change", function () {
      if(reader.readyState === FileReader.LOADING) {
        reader.abort();
      }
  
      reader.readAsBinaryString(file.dom.files[0]);
    });
  
    // sendData est notre fonction principale
    function sendData() {
      // S'il y a un fichier sélectionné, attendre sa lecture
      // Sinon, retarder l'exécution de la fonction
      if(!file.binary && file.dom.files.length > 0) {
        setTimeout(sendData, 10);
        return;
      }
  
      // Pour construire notre requête de données de formulaire en plusieurs parties
      // nous avons besoin d'une instance de XMLHttpRequest
      var XHR = new XMLHttpRequest();
  
      // Nous avons besoin d'un séparateur pour définir chaque partie de la requête
      var boundary = "blob";
  
      // Stockons le corps de la requête dans une chaîne littérale
      var data = "";
  
      // Ainsi, si l'utilisateur a sélectionné un fichier
      if (file.dom.files[0]) {
        // Lancer une nouvelle partie de la requête du corps
        data += "--" + boundary + "\r\n";
  
        // Décrivons là comme étant des données du formulaire
        data += 'content-disposition: form-data; '
        // Définissons le nom des données du formulaire
              + 'name="'         + file.dom.name          + '"; '
        // Fournissons le vrai nom du fichier
              + 'filename="'     + file.dom.files[0].name + '"\r\n';
        // et le type MIME du fichier
        data += 'Content-Type: ' + file.dom.files[0].type + '\r\n';
  
        // Il y a une ligne vide entre les métadonnées et les données
        data += '\r\n';
  
        // Ajoutons les données binaires à la requête du corps
        data += file.binary + '\r\n';
      }
  
      // C'est plus simple pour les données textuelles
      // Démarrons une nouvelle partie dans notre requête du corps
      data += "--" + boundary + "\r\n";
  
      // Disons que ce sont des données de formulaire et nommons les
      data += 'content-disposition: form-data; name="' + text.name + '"\r\n';
      // Il y a une ligne vide entre les métadonnées et les données
      data += '\r\n';
  
      // Ajoutons les données textuelles à la requête du corps
      data += text.value + "\r\n";
  
      // Ceci fait, "fermons" la requête du corps
      data += "--" + boundary + "--";
  
      // Définissons ce qui arrive en cas de succès pour la soumission des données
      XHR.addEventListener('load', function(event) {
        alert('Ouais ! Données expédiées et réponse chargée.');
      });
  
      // Définissons ce qui se passe en cas d'eerreur
      XHR.addEventListener('error', function(event) {
        alert('Oups! Quelque chose s\'est mal passé.');
      });
  
      // Configurons la requête
      XHR.open('POST', 'https://example.com/cors.php');
  
      // Ajoutons l'en-tête requise pour gèrer la requête POST des données
      // de formulaire en plusieurs parties
      XHR.setRequestHeader('Content-Type','multipart/form-data; boundary=' + boundary);
  
      // et finalement, expédions les données.
      XHR.send(data);
    }
  
    // Accéder au formulaire …
    var form = document.getElementById("myForm");
  
    // … pour prendre en charge l'événement soumission
    form.addEventListener('submit', function (event) {
      event.preventDefault();
      sendData();
    });
  });