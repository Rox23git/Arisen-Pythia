1. Bot
   - Creare applicazione sul Discord Developer Portal
   - Attivare i Message Content Intents (per leggere messaggi e foto)
   - Generare il token del bot
1.1 OCR
1.2 Tracking temporale
      import datetime
      current_week = datetime.date.today().isocalendar()[1]
      current_hour = datetime.datetime.utcnow().hour
1.3 Gestione dei gruppi
1.4 Interrogazione dei dati (per permettere agli utenti di ricercare le Amities desiderate)
   
2. Db
   - Salvare le pic come link
   - Settimana: numero della settimana dell'anno
   - Gruppo: gruppo di appartenenza dell'utente (seed)
   - Orario: slot orario in UTC (le Amities cambiano ogni ora)
   - Nodo: lettera del nodo (A, B, C, D, E)
   - Risposta: numero della risposta data (1, 2, 3, 4, 5)
   - Risultato: descrizione dell'Amity ottenuta (es. "View Distance +10%") 
   - User_ID: chi ha inserito il dato (Discord handle)


Linguaggio: Python.

Libreria Discord: discord.py o disnake.

Database: PostgreSQL.

OCR: Tesseract OCR o Google Vision API.

Hosting: Railway, Heroku o un VPS (come DigitalOcean).
