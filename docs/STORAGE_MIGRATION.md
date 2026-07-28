# Plan de Migration Supabase Storage  AWS S3 
 
## Seuil de declenchement 
 
- Supabase plan gratuit : 1 Go de stockage, 2 Go/mois de bande passante 
- Seuil d alerte : 700 Mo (70%%) 
- Migration a envisager si le seuil est atteint de facon repetee 
 
## Cout estime S3 
 
- Stockage : 0,023 $/Go/mois 
- Bande passante : 0,09 $/Go 
- Pour 10 Go stockes + 50 Go transfert : environ 5 $/mois 
 
## Etapes de migration 
 
1. Creer un bucket S3 dans la region eu-west-3 
2. Configurer CloudFront comme CDN devant S3 
3. Mettre a jour upload.service.ts avec le SDK AWS S3 
4. Migrer les fichiers existants de Supabase vers S3 
5. Mettre a jour les URLs dans la base de donnees 
