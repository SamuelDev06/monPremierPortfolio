let myForm = document.getElementById('myForm');

myForm.addEventListener('submit', function(event) {
    // Bloquage du  rechargement de la page par défaut
    event.preventDefault();

    //  Récupération et nettoyage des valeurs des champs
    let userName = document.getElementById('userName').value.trim();
    let userEmail = document.getElementById('userEmail').value.trim();
    let userSubject = document.getElementById('userSubject').value.trim();
    let userMessage = document.getElementById('userMessage').value.trim();

    // Mise en place Expressions régulières (Regex)
    let myRegexName = /^[a-zA-ZÀ-ÿ\s'-]+$/; 
    let myRegexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // Vérification que TOUS les champs sont remplis 
    if (userName === "" || userEmail === "" || userSubject === "" || userMessage === "") {
        Swal.fire({
            title: "Champs incomplets",
            text: "Veuillez remplir tous les champs du formulaire avant de soumettre.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B35" 
        });
        return; 
    }

    // Vérification des formats (Nom et Email)
    if (!myRegexName.test(userName)) {
        Swal.fire({
            title: "Nom invalide",
            text: "Le champ Nom & Prénoms doit contenir uniquement des lettres.",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B35"
        });
        return;
    }

    if (!myRegexEmail.test(userEmail)) {
        Swal.fire({
            title: "Email invalide",
            text: "Veuillez entrer une adresse email valide (ex: exemple@email.com).",
            icon: "error",
            confirmButtonText: "OK",
            confirmButtonColor: "#FF6B35"
        });
        return;
    }

   
    Swal.fire({
        title: "Succès !",
        text: "Votre message a été envoyé avec succès.",
        icon: "success",
        confirmButtonText: "Super",
        confirmButtonColor: "#0083AE" 
    });

    //  Réinitialiser le formulaire après l'envoi réussi
    myForm.reset();
});