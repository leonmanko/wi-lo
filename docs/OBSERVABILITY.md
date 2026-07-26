 
## Outils 
 
| Outil | Usage | Plan | 
|-------|-------|------| 
| Sentry | Erreurs backend, exceptions | Gratuit (5000 erreurs/mois) | 
| Render | Uptime, logs de deploiement | Gratuit | 
| Supabase | Logs DB, connexions Realtime | Gratuit | 
| GitHub Actions | Statut CI/CD | Gratuit | 
 
## Endpoints de sante 
 
- GET /  { status: "ok", name: "WI-LO API" } 
 
## Alertes 
 
- Sentry envoie un email si plus de 10 erreurs en 1h 
- Render notifie si le service est down 
- Seuils de cout : voir WI-LO_Infrastructure_Assessment.md 
 
## Logs 
 
- console.error()  Sentry 
- console.log()  Render logs 
- Ne jamais logger de secrets ou donnees personnelles 
