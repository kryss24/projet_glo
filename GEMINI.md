# PROMPT POUR MVP - SYSTÈME D'ORIENTATION ACADÉMIQUE INTELLIGENT

## CONTEXTE DU PROJET
Créer une plateforme web d'orientation académique pour l'École Nationale Supérieure Polytechnique de Douala. L'objectif est d'aider les étudiants camerounais à choisir leur parcours universitaire via des tests psychométriques et des recommandations personnalisées.

## STACK TECHNIQUE IMPOSÉE
- **Frontend**: Angular (dernière version stable)
- **Backend**: Django + Django REST Framework
- **Base de données**: PostgreSQL
- **Temps de livraison**: MVP en 2 semaines

## FONCTIONNALITÉS MVP PRIORITAIRES

### 1. GESTION DES UTILISATEURS
**Module d'authentification complet:**
- Inscription avec validation email (nom, prénom, email, mot de passe, rôle)
- Connexion sécurisée avec JWT
- Réinitialisation de mot de passe par email
- Gestion du profil utilisateur (modification des informations)
- 3 types de rôles: Étudiant, Conseiller, Administrateur

**Critères d'acceptation:**
- Validation des formulaires côté client et serveur
- Hachage des mots de passe (bcrypt/argon2)
- Tokens JWT avec refresh token
- Protection des routes selon les rôles

### 2. TEST D'ORIENTATION INTERACTIF
**Questionnaire intelligent:**
- 20-25 questions organisées en catégories:
  - Intérêts académiques (sciences, lettres, arts, commerce, technique)
  - Compétences perçues (mathématiques, communication, créativité, leadership)
  - Valeurs professionnelles (salaire, passion, impact social, autonomie)
  - Préférences de travail (équipe/solo, bureau/terrain, routine/variété)
- Interface progressive avec barre de progression
- Sauvegarde automatique des réponses
- Types de questions: QCM, échelles de Likert (1-5), classements de préférences

**Algorithme de recommandation:**
- Calcul de scores par domaine (pondération des réponses)
- Matching avec base de données de 15-20 filières camerounaises prioritaires
- Top 5 filières recommandées avec pourcentage de compatibilité
- Génération d'un rapport personnalisé en temps réel

### 3. CATALOGUE DE FILIÈRES
**Base de données initiale (15-20 filières essentielles):**
- Médecine, Pharmacie
- Informatique, Génie Logiciel
- Génie Civil, Architecture
- Droit, Sciences Politiques
- Commerce, Gestion, Comptabilité
- Sciences de l'Éducation
- Agriculture, Agronomie
- etc.

**Informations par filière:**
- Nom et description
- Durée d'études
- Débouchés professionnels (3-5 métiers types)
- Compétences requises
- Établissements proposant la formation (nom, ville, type public/privé)
- Critères d'admission
- Fourchette de frais de scolarité

**Fonctionnalités:**
- Page de listing avec filtres (domaine, durée, ville, type d'établissement)
- Recherche par mots-clés
- Fiches détaillées de filières
- Système de favoris pour les étudiants connectés

### 4. TABLEAU DE BORD ADMINISTRATEUR
**Gestion des contenus:**
- CRUD complet des filières et établissements
- Interface d'administration intuitive
- Upload d'images/logos d'établissements

**Statistiques essentielles:**
- Nombre d'utilisateurs inscrits (par rôle)
- Nombre de tests complétés
- Top 10 des filières les plus recommandées/consultées
- Graphiques simples (charts.js ou équivalent)
- Export des données en CSV

**Gestion des utilisateurs:**
- Liste des utilisateurs avec recherche/filtres
- Activation/désactivation de comptes
- Changement de rôles
- Visualisation des tests complétés par étudiant

### 5. ESPACE ÉTUDIANT
**Dashboard personnel:**
- Accès rapide au test d'orientation (si non complété)
- Affichage des résultats et recommandations (si test complété)
- Liste des filières favorites
- Historique des filières consultées
- Possibilité de refaire le test (écrase les anciens résultats)

**Rapport d'orientation:**
- Affichage visuel des scores par domaine (graphique radar)
- Top 5 filières recommandées avec scores de compatibilité
- Justification des recommandations (pourquoi cette filière correspond)
- Export PDF du rapport (optionnel pour MVP, sinon phase 2)

## SPÉCIFICATIONS TECHNIQUES

### ARCHITECTURE
**Backend Django:**
```
Structure des apps:
- accounts/ (gestion utilisateurs, auth)
- orientation/ (tests, algorithme, résultats)
- catalog/ (filières, établissements)
- core/ (configuration, utils)
```

**Models principaux:**
- User (AbstractUser personnalisé avec rôle)
- StudentProfile (informations étudiant)
- OrientationTest (instance de test)
- TestResponse (réponses aux questions)
- Question (banque de questions)
- Field (filière)
- Institution (établissement)
- Recommendation (résultat d'orientation)
- Favorite (filières favorites)

**API REST:**
- Endpoints RESTful avec Django REST Framework
- Pagination (10-20 items par page)
- Filtrage et recherche avec django-filters
- Documentation Swagger/OpenAPI automatique

**Frontend Angular:**
```
Structure des modules:
- auth/ (login, register, password reset)
- student/ (dashboard, test, results, favorites)
- admin/ (dashboard, management)
- catalog/ (listing, details)
- shared/ (components, services, guards)
```

**Services Angular:**
- AuthService (gestion tokens, état connexion)
- OrientationService (test, résultats)
- CatalogService (filières, recherche)
- UserService (profil, favoris)

### DESIGN ET UX

**Charte graphique adaptée au contexte camerounais:**
- Couleurs: Vert, jaune et rouge (référence drapeau) avec palette moderne
- Typographie claire et lisible (Roboto, Inter ou Poppins)
- Images/illustrations représentant la diversité camerounaise
- Icônes modernes (Material Icons, Lucide)

**Interface responsive:**
- Mobile-first design
- Breakpoints: mobile (<768px), tablet (768-1024px), desktop (>1024px)
- Menu burger sur mobile
- Grilles adaptatives

**Expérience utilisateur:**
- Onboarding pour nouveaux utilisateurs (tutoriel rapide)
- Feedback immédiat (loaders, toasts, messages d'erreur clairs)
- Parcours fluide: max 3 clics pour actions principales
- Animations subtiles (transitions, micro-interactions)
- États vides avec illustrations et appels à l'action

### PERFORMANCE ET SÉCURITÉ

**Performance:**
- Lazy loading des modules Angular
- Pagination backend + frontend
- Mise en cache des données statiques (filières)
- Optimisation des images (WebP, compression)
- Index PostgreSQL sur champs recherchés

**Sécurité:**
- Validation des données (frontend + backend)
- Protection CSRF Django
- Rate limiting sur API (django-ratelimit)
- Tokens JWT avec expiration (access: 1h, refresh: 7 jours)
- CORS configuré strictement
- Sanitization des inputs utilisateur
- HTTPS obligatoire en production

### DÉPLOIEMENT (CONFIGURATION MINIMALE)

**Backend:**
- Django + Gunicorn
- Variables d'environnement (.env)
- Migrations appliquées automatiquement

**Frontend:**
- Build de production Angular
- Serveur web (Nginx ou équivalent)

**Base de données:**
- PostgreSQL avec backup automatique
- Seeds avec données de test (10-15 filières, quelques users)

## LIVRABLES ATTENDUS

1. **Code source:**
   - Repository Git avec README détaillé
   - Backend Django structuré et documenté
   - Frontend Angular avec architecture modulaire

2. **Base de données:**
   - Script de migration PostgreSQL
   - Seeds avec données initiales (filières camerounaises)
   - Schéma relationnel documenté

3. **Documentation:**
   - Guide d'installation et de déploiement
   - Documentation API (Swagger)
   - Guide utilisateur simple (captures d'écran)

4. **Credentials de test:**
   - Admin: admin@enspd.cm / admin123
   - Conseiller: conseiller@enspd.cm / conseil123
   - Étudiant: etudiant@enspd.cm / etudiant123

## CRITÈRES DE SUCCÈS MVP

- [ ] Un utilisateur peut s'inscrire et se connecter en moins de 2 minutes
- [ ] Le test d'orientation se complète en 10-15 minutes max
- [ ] Les recommandations s'affichent en moins de 3 secondes
- [ ] Le catalogue contient au minimum 15 filières camerounaises pertinentes
- [ ] L'admin peut ajouter une nouvelle filière en moins de 5 minutes
- [ ] L'interface est entièrement responsive (mobile, tablet, desktop)
- [ ] Temps de chargement des pages < 2 secondes
- [ ] Zéro erreur critique de sécurité (authentification, autorisation)

## EXCLUSIONS POUR MVP (PHASE 2)

- Chat en temps réel entre étudiants et conseillers
- Forum de discussion
- Export PDF des rapports (remplacer par impression navigateur)
- Notifications push/email automatiques
- Chatbot IA
- Système de rendez-vous
- Statistiques avancées avec graphiques complexes
- API publique pour partenaires

## CONTRAINTES SPÉCIFIQUES

- **Langue**: Interface en français (public camerounais)
- **Accessibilité**: Contraste minimum WCAG AA
- **Données**: Filières et établissements du système éducatif camerounais
- **Hébergement**: Configuration pour déploiement sur serveur Linux standard

---

**NOTE IMPORTANTE:** Ce MVP doit être fonctionnel, sécurisé et esthétiquement soigné. Privilégier la qualité à la quantité de fonctionnalités. L'objectif est d'avoir une base solide pour itérations futures.