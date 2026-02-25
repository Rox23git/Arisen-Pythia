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



