// Norsan — Calcolatore Automatico Dosaggi Omega-3 (Cane e Gatto)

document.addEventListener("DOMContentLoaded", () => {
  const petButtons = document.querySelectorAll(".pet-btn");
  const peso = document.getElementById("peso");
  const pesoMetabolico = document.getElementById("peso-metabolico");
  const calcola = document.getElementById("calcola");
  const output = document.getElementById("output");
  const resultCard = document.getElementById("result-card");
  const resultSummary = document.getElementById("result-summary");
  const tableCane = document.getElementById("table-cane");
  const tableGatto = document.getElementById("table-gatto");
  const wrapCane = document.getElementById("wrap-cane");
  const wrapGatto = document.getElementById("wrap-gatto");

  let tipologia = null; // "cane" | "gatto"

  // Esponente del peso metabolico: 0,75 per il cane, 0,67 per il gatto
  const getEsponente = () => (tipologia === "gatto" ? 0.67 : 0.75);

  // Peso inserito: accetta sia la virgola sia il punto come separatore decimale
  const parsePeso = () => parseFloat(peso.value.replace(",", "."));

  // Peso metabolico = peso ^ esponente (aggiornato in tempo reale)
  const aggiornaPesoMetabolico = () => {
    const kg = parsePeso();
    pesoMetabolico.value =
      isNaN(kg) || kg <= 0 || !tipologia
        ? ""
        : Math.pow(kg, getEsponente()).toFixed(2).replace(".", ",");

    // I dati inseriti non corrispondono più ai risultati mostrati:
    // nasconde il riepilogo finché non si preme di nuovo Calcola
    resultCard.hidden = true;
  };

  peso.addEventListener("input", aggiornaPesoMetabolico);

  // Anno corrente nel footer
  document.getElementById("anno").textContent = new Date().getFullYear();

  // Selezione tipologia
  petButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      petButtons.forEach((b) => {
        b.classList.remove("is-active");
        b.setAttribute("aria-pressed", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-pressed", "true");
      tipologia = btn.dataset.pet;
      aggiornaPesoMetabolico();
    });
  });

  const showError = (msg) => {
    output.className = "output output--error";
    output.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> ${msg}`;
    resultCard.hidden = true;
  };

  // Calcolo
  calcola.addEventListener("click", () => {
    if (!tipologia) {
      showError("Seleziona prima la tipologia (Cane o Gatto).");
      return;
    }

    const kg = parsePeso();
    if (isNaN(kg) || kg <= 0) {
      showError("Inserisci un peso valido in kg.");
      return;
    }

    output.className = "output";
    output.textContent = "";

    const tipologiaLabel = tipologia === "cane" ? "Cane" : "Gatto";
    const pesoVivo = kg.toLocaleString("it-IT");
    const pesoMetNum = Math.pow(kg, getEsponente());
    const pesoMet = pesoMetNum.toFixed(2).replace(".", ",");

    resultSummary.innerHTML =
      `Tipologia: <strong>${tipologiaLabel}</strong> · ` +
      `Peso vivo: <strong>${pesoVivo} kg</strong> · ` +
      `Peso metabolico: <strong>${pesoMet} kg</strong>`;

    const isCane = tipologia === "cane";
    wrapCane.hidden = !isCane;
    wrapGatto.hidden = isCane;

    // Calcolo ml di prodotto per ogni riga (in base a peso vivo o metabolico)
    fillTable(isCane ? tableCane : tableGatto, kg, pesoMetNum);

    resultCard.hidden = false;

    // Solo su mobile (stesso breakpoint del CSS): scroll automatico fino ai risultati
    if (window.matchMedia("(max-width: 860px)").matches) {
      requestAnimationFrame(() => {
        resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }
  });

  // Modale bibliografia e fonti
  const sourcesModal = document.getElementById("sources-modal");
  const openSources = document.getElementById("open-sources");

  const openModal = () => {
    sourcesModal.hidden = false;
    document.body.style.overflow = "hidden"; // blocca lo scroll di fondo
  };

  const closeModal = () => {
    sourcesModal.hidden = true;
    document.body.style.overflow = "";
  };

  openSources.addEventListener("click", openModal);

  // Chiusura: bottone Chiudi e backdrop (entrambi marcati con data-close-sources)
  sourcesModal.querySelectorAll("[data-close-sources]").forEach((el) => {
    el.addEventListener("click", closeModal);
  });

  // Chiusura con tasto Esc
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && !sourcesModal.hidden) closeModal();
  });

  // Dose arrotondata al mezzo ml più vicino (es. 2,1 → 2 ml; 2,3 → 2,5 ml; 2,8 → 3 ml),
  // con un minimo di 0,5 ml per non mostrare mai 0
  const formatMl = (ml) => {
    const arrotondato = Math.max(0.5, Math.round(ml * 2) / 2);
    return `${arrotondato.toLocaleString("it-IT")} ml`;
  };

  // Le capsule non sono frazionabili: arrotondamento alla capsula intera più
  // vicina, con un minimo di 1 per non mostrare mai 0
  const formatCapsule = (n) => {
    const arrotondato = Math.max(1, Math.round(n));
    return `${arrotondato} cps`;
  };

  function fillTable(table, pesoVivo, pesoMetabolico) {
    // Ogni colonna prodotto porta nel proprio header la titolazione (data-tit,
    // mg totali per unità) e l'unità di misura (data-unit: "ml" per i liquidi,
    // "capsula" per le capsule). Aggiungere un prodotto resta solo questione di
    // HTML (un <th data-tit data-unit> e una <td class="ml-prodotto"> per riga).
    const prodotti = [...table.querySelectorAll("thead th[data-tit]")].map((th) => ({
      tit: parseFloat(th.dataset.tit),
      unit: th.dataset.unit || "ml",
    }));
    table.querySelectorAll("tbody tr").forEach((row) => {
      const dose = parseFloat(row.dataset.dose); // mg/kg
      // Base di calcolo: peso vivo (data-base="pv") o peso metabolico (default)
      const base = row.dataset.base === "pv" ? pesoVivo : pesoMetabolico;
      const totaleMg = dose * base; // mg totali di riferimento
      // Le celle prodotto sono nello stesso ordine degli header con data-tit
      row.querySelectorAll("td.ml-prodotto").forEach((cell, i) => {
        const { tit, unit } = prodotti[i];
        const quantita = totaleMg / tit; // n. di unità (ml o capsule)
        cell.textContent =
          unit === "capsula" ? formatCapsule(quantita) : formatMl(quantita);
      });
    });
  }
});
