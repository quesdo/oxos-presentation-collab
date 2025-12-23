# OXOS Presentation - Mode Collaboratif

Version collaborative de la présentation OXOS avec synchronisation en temps réel via Supabase.

## Fonctionnalités

- **Synchronisation temps réel**: Tous les utilisateurs voient la même slide
- **Contrôle partagé**: N'importe quel utilisateur peut cliquer sur "Next" pour avancer
- **Pas de contrôleur unique**: Tous les utilisateurs ont les mêmes droits
- **Visibilité 3D synchronisée**: Les objets 3D (PRD Sound, AS IS Product, etc.) s'affichent automatiquement via le SDK

## Configuration Supabase

### 1. La table est déjà créée!

La table `oxos_presentation_session` a été créée automatiquement via MCP Supabase.

Structure de la table:
- `id` (UUID) - ID unique de la session
- `current_slide` (INTEGER) - Index de la slide actuelle (-1 = pas commencé)
- `created_at` (TIMESTAMP) - Date de création
- `updated_at` (TIMESTAMP) - Dernière mise à jour

### 2. Configuration automatique

La configuration Supabase est déjà chargée via `supabase-config.js`:
- URL: https://jajibuwuhotlqyezliei.supabase.co
- Anon Key: Configurée automatiquement
- User ID: Généré automatiquement pour chaque session

### 3. Real-time déjà activé!

Le Real-time a été automatiquement activé pour la table `oxos_presentation_session` lors de la création.

## Fonctionnement

1. **Initialisation**: Au chargement, chaque client se connecte à la même session Supabase
2. **Clic sur Next**: Le client met à jour `current_slide` dans Supabase
3. **Real-time sync**: Tous les autres clients reçoivent la mise à jour et avancent automatiquement
4. **Nouveaux arrivants**: Les utilisateurs qui rejoignent voient directement la slide actuelle

## Différences avec la version auto

- **oxos-presentation-auto**: Défilement automatique avec timings fixes
- **oxos-presentation-collab**: Contrôle manuel partagé entre tous les utilisateurs
- **oxos-presentation**: Version classique sans synchronisation (chaque utilisateur contrôle sa propre vue)

## Reset de la session

Pour réinitialiser la session (retour à la slide -1):

```sql
UPDATE oxos_presentation_session SET current_slide = -1;
```

## Dépendances

- Supabase JS v2 (chargé via CDN)
- Table `oxos_presentation_session` configurée dans Supabase
- Real-time activé pour la table
