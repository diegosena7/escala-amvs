# Escala 5x2 – Queen Plaza (AMVS Facilities)

Site estático com a proposta de escala 5x2 (EC 141/2026) para a equipe do Condomínio Queen Plaza. Calendário semana a semana de 14/12/2026 a 30/05/2027.

## Páginas
- `index.html`: início, resumo para decisão e recomendação.
- `escala.html`: semana, minha escala (mês), quem está no dia, mapa de horas e fins de semana por pessoa.
- `opcoes.html`: o que muda, as 3 opções, comparativo, perguntas e próximos passos.
- `regras.html`: regras, rodízio de fim de semana, feriados e glossário.

## Estrutura
- `assets/`: `styles.css`, `app.js`, `data.js` (gerado), favicon e o logo.
- `src/`: fontes. `pages/` (partes das páginas), `styles.css`, `app.js`, calendários (`opcao1/2/3.json`) e `build.py`.

Para alterar a escala, edite os JSON de `src/` e rode `python3 src/build.py`. Os arquivos da raiz e de `assets/` são regenerados.

Deploy na Vercel: Framework Preset "Other", sem build command e sem output directory.

Opção recomendada: 2 (plantão de fim de semana de 8h). Confirme com contador, jurídico e a convenção coletiva (SIEMACO) antes de aplicar.
