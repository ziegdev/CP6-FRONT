# Procédure git pour travailler en multi remote cette saison

## A faire 1 première fois

**Générer votre dépot nominatif personnel et ajouter la remote de correction**

- Cloner votre dépot
  - `git clone monDepotPerso`
- Ajouter la remote de correction
  - `git remote add correction git@github.com:O-clock-Pan/S07-oKanban-front-alexisOclock.git`
  - /!\\ Si vous aviez déjà renseigné la remote RED en jour 1, vous pouvez remplacer la remote ainsi  : `git remote set-url correction git@github.com:O-clock-Pan/S07-oKanban-front-alexisOclock.git`

## A faire au quotidien

**Récupérer si on veut la correction coder dans une branche par jour**

- `git checkout master` -> on repasse sur master pour récupérer la correction
- On récupère la correction `git pull correction master`
  - Avec l'option pour les historiques non liés `git pull correction master --allow-unrelated-histories`
  - Avec l'option force si jamais on a fait des modif pour des tests qu'on ne souhaite pas garder `git pull correction master --force` (/!\ si ce sont des modifs à garder -> on fait un commit et on prépare une nouvelle branche basée sur master)

Tous les jours (meme ajourd'hui)

- On travaille sur une nouvelle branche spécifique aux modifs de chaque jour
- `git checkout -b jour1` en changeant le jour à chaque fois