# Agenter til dit arbejde

Dette repo indeholder fire Claude Code-agenter i `.claude/agents/`. De indlæses automatisk, når du starter en Claude Code-session i repoet, og Claude vælger selv den rette agent ud fra din besked – eller du kan nævne dem ved navn.

## Oversigt

| Agent | Hvad den gør | Eksempel på besked |
|---|---|---|
| **ruti-udvikler** | Bygger nye funktioner og retter fejl i appen | "Tilføj en mørk tilstand til appen" |
| **ruti-reviewer** | Gennemgår ændringer for fejl og datatab-risici (ændrer intet selv) | "Brug ruti-reviewer til at tjekke mine seneste ændringer" |
| **aktivitetsplan** | Laver dagsrytmer, ugeplaner og aktivitetsforslag; kan udvide appens aktivitetsbank | "Lav en dagsplan for en gruppe 4-årige med to børn der har brug for ekstra pauser" |
| **skriv-hjaelper** | Udkast til forældrebeskeder, nyhedsbreve, handleplaner og notater | "Skriv et ugebrev til forældrene om vores uge med bondegårdstema" |

## Sådan bruger du dem

Skriv bare naturligt – f.eks. *"Lav en ugeplan for næste uge"* – så bruger Claude automatisk `aktivitetsplan`. Vil du styre det selv, så nævn agenten: *"Brug ruti-reviewer på den seneste commit."*

## Sådan tilpasser du dem

Hver agent er én markdown-fil i `.claude/agents/`:

- Øverst (mellem `---`) står navn, beskrivelse, hvilke værktøjer agenten må bruge, og hvilken model den kører på.
- Resten af filen er agentens instruktioner. Ret dem til, som du ville instruere en ny kollega – f.eks. jeres faktiske åbningstider, gruppestørrelser eller skrivestil.

## Sådan laver du en ny agent

Kopiér en eksisterende fil, giv den et nyt `name` og en `description`, der beskriver *hvornår* den skal bruges, og skriv instruktionerne. Idéer til flere agenter:

- **møde-referent**: strukturerer noter fra personalemøder til referater med aktionspunkter.
- **læreplans-hjælper**: kobler aktiviteter til de seks læreplanstemaer og hjælper med evaluering.
- **vagtplan-hjælper**: hjælper med at fordele personale over ugen.

## Vigtigt om persondata

Repoet kan være offentligt. Skriv aldrig børns navne, CPR-numre eller andre personoplysninger ind i filer i repoet – agenterne er instrueret i at bruge pladsholdere som [Barnets navn], men det er dit ansvar at tjekke, før noget gemmes eller pushes.
