let todoComplet = [];
let id = 0;
let filtreActif = "tout";

/////////////////////////
// CHARGEMENT INITIALE //
/////////////////////////

afficherTaches();

if (localStorage.getItem("todo")) {
    todoComplet = JSON.parse(localStorage.getItem("todo"));
    majCompteur();
    afficherTaches();
}

///////////////
// FONCTIONS //
///////////////

function getFlexDirectionClass() {
    return window.innerWidth >= 768 ? "flex-row" : "flex-col";
}

function ajouterTache() {
    id = localStorage.getItem("todoId") ? JSON.parse(localStorage.getItem("todoId")) : 0;
    const texte = document.getElementById('tacheAjouter').value.trim();
    if (texte === '') {
        alert("Le champ est vide !");
        return;
    }

    const existe = todoComplet.some(t => t.texte.toLowerCase() === texte.toLowerCase());
    if (existe) {
        alert("Cette tâche existe déjà !");
        return;
    }

    id++;
    todoComplet.push({
        id: id,
        texte: texte,
        etat: true
    });

    localStorage.setItem("todo", JSON.stringify(todoComplet));
    localStorage.setItem("todoId", JSON.stringify(id));

    majCompteur();
    afficherTaches();

    document.getElementById('tacheAjouter').value = '';
}

function supprimer(id) {
    todoComplet = todoComplet.filter(t => t.id !== id);
    localStorage.setItem("todo", JSON.stringify(todoComplet));
    majCompteur();
    afficherTaches();
}

function archiver(id) {
    const tache = todoComplet.find(t => t.id === id);
    if (!tache) return;

    tache.etat = !tache.etat;

    localStorage.setItem("todo", JSON.stringify(todoComplet));
    majCompteur();
    afficherTaches();
}

function modifier(id) {
    const tache = todoComplet.find(t => t.id === id);
    if (!tache) return;

    const element = document.getElementById(id);
    if (!element) return;

    const p = element.querySelector("p");
    const btnModifier = element.querySelector('[data-action="modifier"]');

    const input = document.createElement("input");
    input.type = "text";
    input.value = tache.texte;
    input.className = "border rounded p-1 w-80 text-gray-700";

    element.replaceChild(input, p);
    input.focus();

    function sauvegarder() {
        const nouveauTexte = input.value.trim();
        if (nouveauTexte) tache.texte = nouveauTexte;
        localStorage.setItem("todo", JSON.stringify(todoComplet));
        afficherTaches();
    }

    btnModifier.textContent = "Valider";
    btnModifier.className = "bg-green-500 rounded p-1 text-white";
    btnModifier.setAttribute("data-action", "modifier");    
    
    input.addEventListener("keydown", e => {
        if (e.code === "Enter" || e.code === "NumpadEnter") sauvegarder();
    });
    
    input.addEventListener("blur", () => {
        setTimeout(sauvegarder, 0); 
    });
    
    btnModifier.onclick = sauvegarder;
}

function majCompteur() {
    document.getElementById('tout').innerText = todoComplet.length;
    document.getElementById('a-faire').innerText = todoComplet.filter(t => t.etat).length;
    document.getElementById('archive').innerText = todoComplet.filter(t => !t.etat).length;
}

function afficherTaches() {
    const todoDiv = document.getElementById("todo");
    todoDiv.innerHTML = "";

    const filtres = {
        tout: () => true,
        aFaire: t => t.etat,
        archiver: t => !t.etat
    };

    const tachesFiltrees = todoComplet.filter(filtres[filtreActif]);

    if (tachesFiltrees.length === 0) {
        const message = document.createElement("p");
        message.textContent = "Aucune tâche";
        message.className = "text-gray-200 italic text-center";
        todoDiv.appendChild(message);
    } else {
        tachesFiltrees.forEach(t => {
            const div = document.createElement("div");
            div.className = `flex ${getFlexDirectionClass()} justify-between gap-4 bg-neutral-100 rounded p-4 itemps-center`;
            div.id = t.id;

            div.innerHTML = `
                <p class="max-w-2xl text-black">${t.texte}</p>
                <div class="flex flex-col gap-2 justify-center items-center md:w-[25%]">
                    <button class="bg-[#28337E] rounded p-1 text-white w-full" data-action="modifier">Modifier</button>
                    <button class="bg-green-500 rounded p-1 text-white w-full" data-action="archiver">
                        ${t.etat ? "Archiver" : "Désarchiver"}
                    </button>
                    <button class="bg-red-500 rounded p-1 text-white w-full" data-action="supprimer">Supprimer</button>
                </div>
            `;

            div.style.opacity = t.etat ? 1 : 0.5;
            todoDiv.appendChild(div);
        });
    }

    // --- Mise à jour du bouton bleu ---
    const btns = document.querySelectorAll("#filtres > button");
    btns.forEach(btn => btn.classList.remove("bg-[#4269B1]", "text-white"));

    btns.forEach(btn => {
        if (btn.dataset.filtre === filtreActif) {
            btn.classList.add("bg-[#4269B1]", "text-white");
        }
    });
}

/////////////////////////
//  ÉCOUTEURS D'ÉVÈNTS //
/////////////////////////

document.getElementById('ajouterTache').addEventListener('click', ajouterTache);

document.addEventListener("click", function(event) {
    const action = event.target.getAttribute("data-action");
    if (!action) return;

    const div = event.target.closest("div[id]");
    const id = parseInt(div.id);

    if (action === "supprimer") supprimer(id);
    if (action === "archiver") archiver(id);
    if (action === "modifier") modifier(id);
});

// filtres
document.querySelectorAll("#filtres > button").forEach(btn => {
    btn.addEventListener("click", function () {
        filtreActif = btn.dataset.filtre;
        afficherTaches();
    });
});

// touche Entrée
document.addEventListener("keydown", function (event) {
    if ((event.code === "Enter" || event.code === "NumpadEnter") && event.target.id === "tacheAjouter") {
        ajouterTache();
    }
});
