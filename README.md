# foten — Calcolatore Omega-3

Calcolatore dei dosaggi giornalieri di Omega-3 per cane e gatto, sul peso metabolico.
App statica: HTML/CSS/JS vanilla, nessun build step, nessuna chiamata di rete.

## Deploy

Sevalla Static Site → `calcolatore.foten.it`

- root directory: `/`
- published directory: `public`
- install / build command: nessuno
- auto-deploy sul branch `main`

Solo `public/` va online. Tutto il resto del repo non viene pubblicato.

## Provenienza e documentazione

Sorgente consegnato da consulente esterno. La baseline non modificata è il commit `b296542`
del repo `foten.it`, in `configuratore/`.

Il check del codice, i problemi clinici aperti (titolazioni, minimo forzato) e le decisioni
di hosting stanno in `foten.it`:

- `docs/evaluations/2026-07-30-configuratore-omega3.md`
- `docs/decisions.md`

**Le titolazioni prodotto in `public/index.html` (attributi `data-tit`) sono dati clinici:
non si toccano senza conferma dalle schede prodotto.**
