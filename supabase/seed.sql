-- ============================================================================
-- seed.sql — Catalogue de départ (placeholders), éditable ensuite depuis
-- /admin/produits. À exécuter une fois dans le SQL Editor Supabase, après
-- les migrations 0001 à 0005.
-- ============================================================================

-- Un "produit" de base par catégorie, qui porte le prix de départ affiché
-- dans le configurateur (Brandon peut en ajouter d'autres, seul le premier
-- actif, trié par `ordre`, sert de prix de base pour l'instant).
insert into public.produits (categorie, nom, slug, prix_base, actif, ordre) values
  ('voiture', 'Tapis Voiture — Base', 'tapis-voiture-base', 89, true, 0),
  ('sol',     'Tapis Sol — Base',     'tapis-sol-base',     129, true, 0),
  ('mur',     'Tapis Mur — Base',     'tapis-mur-base',     149, true, 0),
  ('bureau',  'Tapis Bureau — Base',  'tapis-bureau-base',  69, true, 0);

-- Options du configurateur, par catégorie et par type.
-- Pour le type "couleur", `valeur` porte le code hex (utilisé pour la pastille).

-- Voiture
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('voiture', 'taille', '2 tapis avant', '', 0, 0),
  ('voiture', 'taille', 'Jeu complet (4 tapis)', '', 35, 1),
  ('voiture', 'taille', '+ tapis de coffre', '', 25, 2),
  ('voiture', 'forme', 'Rectangle', '', 0, 0),
  ('voiture', 'forme', 'Rond', '', 15, 1),
  ('voiture', 'forme', 'Découpe sur mesure', '', 30, 2),
  ('voiture', 'matiere', 'Moquette renforcée', '', 0, 0),
  ('voiture', 'matiere', 'Caoutchouc (résistant eau/boue)', '', 15, 1),
  ('voiture', 'matiere', 'Velours premium', '', 25, 2);

-- Sol
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('sol', 'taille', '120 x 80 cm', '', 0, 0),
  ('sol', 'taille', '160 x 120 cm', '', 30, 1),
  ('sol', 'taille', '200 x 140 cm', '', 60, 2),
  ('sol', 'taille', 'Dimensions sur mesure', '', 40, 3),
  ('sol', 'forme', 'Rectangle', '', 0, 0),
  ('sol', 'forme', 'Rond', '', 15, 1),
  ('sol', 'forme', 'Découpe sur mesure', '', 30, 2),
  ('sol', 'matiere', 'Velours', '', 0, 0),
  ('sol', 'matiere', 'Berbère', '', 10, 1),
  ('sol', 'matiere', 'Fibre extérieur (résistante UV/pluie)', '', 20, 2);

-- Mur
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('mur', 'taille', '60 x 90 cm', '', 0, 0),
  ('mur', 'taille', '90 x 140 cm', '', 40, 1),
  ('mur', 'taille', 'Dimensions sur mesure', '', 50, 2),
  ('mur', 'forme', 'Rectangle', '', 0, 0),
  ('mur', 'forme', 'Rond', '', 15, 1),
  ('mur', 'forme', 'Découpe sur mesure', '', 30, 2),
  ('mur', 'matiere', 'Velours', '', 0, 0),
  ('mur', 'matiere', 'Berbère', '', 10, 1),
  ('mur', 'matiere', 'Fibre extérieur (résistante UV/pluie)', '', 20, 2);

-- Bureau
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('bureau', 'taille', '70 x 100 cm', '', 0, 0),
  ('bureau', 'taille', 'Sous-chaise (100 x 130 cm)', '', 20, 1),
  ('bureau', 'forme', 'Rectangle', '', 0, 0),
  ('bureau', 'forme', 'Rond', '', 15, 1),
  ('bureau', 'forme', 'Découpe sur mesure', '', 30, 2),
  ('bureau', 'matiere', 'Velours', '', 0, 0),
  ('bureau', 'matiere', 'Berbère', '', 10, 1),
  ('bureau', 'matiere', 'Fibre extérieur (résistante UV/pluie)', '', 20, 2);

-- Couleurs (mêmes choix pour les 4 catégories)
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre)
select c.categorie, 'couleur', v.label, v.valeur, v.supplement, v.ordre
from (values ('voiture'::categorie_tapis), ('sol'::categorie_tapis), ('mur'::categorie_tapis), ('bureau'::categorie_tapis)) as c(categorie)
cross join (values
  ('Noir', '#151316', 0, 0),
  ('Terracotta', '#C1583B', 0, 1),
  ('Gris chiné', '#8A8478', 0, 2),
  ('Rose fuchsia', '#FF3D9A', 5, 3),
  ('Turquoise', '#2DE0C4', 5, 4),
  ('Couleur personnalisée', '#7A3DFF', 10, 5)
) as v(label, valeur, supplement, ordre);
