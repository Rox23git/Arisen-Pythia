Linguaggio: Python.

Libreria Discord: discord.py o disnake.

Database: PostgreSQL.

OCR: Tesseract OCR o Google Vision API.

1. Bot
   - Creare applicazione sul Discord Developer Portal
   - Attivare i Message Content Intents (per leggere messaggi e foto)
   - Generare il token del bot
   - OCR
   - Tracking temporale <br />
      import datetime <br />
      current_week = datetime.date.today().isocalendar()[1] <br />
      current_hour = datetime.datetime.utcnow().hour <br />
   - Gestione dei gruppi
   - Interrogazione dei dati (per permettere agli utenti di ricercare le Amities desiderate)
   
2. Db
   - Salvare le pic come link
   - Settimana: numero della settimana dell'anno
   - Gruppo: gruppo di appartenenza dell'utente (seed)
   - Orario: slot orario in UTC (le Amities cambiano ogni ora)
   - Nodo: lettera del nodo (A, B, C, D, E)
   - Risposta: numero della risposta data (1, 2, 3, 4, 5)
   - Risultato: descrizione dell'Amity ottenuta (es. "View Distance +10%") 
   - User_ID: chi ha inserito il dato (Discord handle)

Tabella users: <br />
<br />
CREATE TABLE users ( <br />
    discord_id BIGINT PRIMARY KEY,     -- L'ID univoco dell'utente Discord <br />
    orna_group INTEGER NOT NULL,      -- Il gruppo/seed (es. 1, 2, 3...) <br />
    username TEXT,                    -- Opzionale, per rendere i log leggibili <br />
    updated_at TIMESTAMP DEFAULT NOW() -- Ultima volta che l'utente ha cambiato gruppo <br />
); <br />

Tabella amity logs: <br />
<br />
CREATE TABLE amity_logs ( <br />
    id SERIAL PRIMARY KEY, <br />
    week_number INTEGER NOT NULL,      -- Settimana dell'anno (ISO week) <br />
    year INTEGER NOT NULL,             -- L'anno corrente <br />
    hour_utc INTEGER NOT NULL,         -- L'ora della scoperta (0-23) <br />
    orna_group INTEGER NOT NULL,       -- Il gruppo di appartenenza <br />
    node CHAR(1) NOT NULL,             -- Nodo: 'A', 'B', 'C', 'D', 'E' <br />
    answer INTEGER NOT NULL,           -- Risposta: 1, 2, 3, 4, 5 <br />
    amity_description TEXT NOT NULL,   -- L'effetto dell'Amity (es. "+10% HP") <br />
    discovered_by BIGINT REFERENCES users(discord_id), -- Chi l'ha trovata <br />
    created_at TIMESTAMP DEFAULT NOW(), <br />
    
    -- Vincolo di unicità: evita che la stessa risposta nello stesso slot
    -- venga salvata due volte per lo stesso gruppo. 
    UNIQUE(week_number, year, hour_utc, orna_group, node, answer)
); <br />

