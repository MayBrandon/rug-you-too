-- ============================================================================
-- update_catalogue_tuftage.sql
--
-- Remet à plat le catalogue (produits + options) pour coller au nouveau
-- modèle de prix "tufté main" (voir src/lib/catalogue.ts) : laine à 2,50€/
-- pelote de 100g, cadre de référence 90x90cm à 10€, main d'œuvre à 25€/h
-- (~6h pour ce même cadre) -> environ 219,14 €/m².
--
-- Sans danger à exécuter même si tu as déjà lancé l'ancien seed.sql : ce
-- script vide d'abord les tables puis réinsère un catalogue propre. Comme le
-- configurateur ne garde que la taille/forme/couleur (la matière disparaît,
-- le tuftage étant toujours en laine), les anciennes lignes "matiere" sont
-- supprimées.
--
-- Les tailles de sol/mur/bureau sont écrites "L x H cm" : le prix se calcule
-- alors automatiquement à partir de la surface réelle. Les tailles de
-- voiture restent descriptives (un jeu de tapis ne se mesure pas en cm²) et
-- utilisent un prix de base + supplément, comme avant. Ce sont des tailles
-- indicatives — à corriger depuis /admin/produits dès que tu as tes
-- vraies dimensions.
-- ============================================================================

delete from public.options_configuration
where categorie in ('voiture', 'sol', 'mur', 'bureau');

delete from public.produits
where categorie in ('voiture', 'sol', 'mur', 'bureau');

-- --- Produits (prix "à partir de", basé sur la plus petite taille) ---------

insert into public.produits (categorie, nom, slug, prix_base, actif, ordre) values
  ('voiture', 'Tapis Voiture — Base', 'tapis-voiture-base', 110, true, 0),
  ('sol',     'Tapis Sol — Base',     'tapis-sol-base',      118.34, true, 0),
  ('mur',     'Tapis Mur — Base',     'tapis-mur-base',       78.89, true, 0),
  ('bureau',  'Tapis Bureau — Base',  'tapis-bureau-base',    52.59, true, 0);

-- --- Tailles ----------------------------------------------------------------
-- Voiture : pas de dimensions en cm² exploitables -> prix de base + supplément.
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('voiture', 'taille', '2 tapis avant', '', 0, 0),
  ('voiture', 'taille', 'Jeu complet (4 tapis)', '', 110, 1),
  ('voiture', 'taille', '+ tapis de coffre', '', 65, 2);

-- Sol/Mur/Bureau : dimensions en cm -> prix calculé au m² (~219,14 €/m²).
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre) values
  ('sol', 'taille', '90 x 60 cm', '90x60', 0, 0),
  ('sol', 'taille', '120 x 80 cm', '120x80', 0, 1),
  ('sol', 'taille', '150 x 100 cm', '150x100', 0, 2),
  ('sol', 'taille', '200 x 140 cm', '200x140', 0, 3),
  ('mur', 'taille', '60 x 60 cm', '60x60', 0, 0),
  ('mur', 'taille', '90 x 90 cm', '90x90', 0, 1),
  ('mur', 'taille', '120 x 90 cm', '120x90', 0, 2),
  ('bureau', 'taille', '60 x 40 cm', '60x40', 0, 0),
  ('bureau', 'taille', '80 x 50 cm', '80x50', 0, 1),
  ('bureau', 'taille', '100 x 60 cm', '100x60', 0, 2);

-- --- Formes (supplément forfaitaire : perte de laine à la découpe) ----------
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre)
select c.categorie, 'forme', v.label, '', v.supplement, v.ordre
from (values ('voiture'::categorie_tapis), ('sol'::categorie_tapis), ('mur'::categorie_tapis), ('bureau'::categorie_tapis)) as c(categorie)
cross join (values
  ('Rectangle', 0, 0),
  ('Rond', 15, 1),
  ('Découpe sur mesure', 30, 2)
) as v(label, supplement, ordre);

-- --- Couleurs (choix multiples possibles dans le configurateur) ------------
-- Large palette de laine, du neutre au vif. Suppléments : 0€ pour les teintes
-- courantes, 3-5€ pour les teintes plus rares/plus difficiles à doser, 8€
-- pour les dorés/argentés, 10€ pour une couleur personnalisée sur mesure.
insert into public.options_configuration (categorie, type, label, valeur, supplement_prix, ordre)
select c.categorie, 'couleur', v.label, v.valeur, v.supplement, v.ordre
from (values ('voiture'::categorie_tapis), ('sol'::categorie_tapis), ('mur'::categorie_tapis), ('bureau'::categorie_tapis)) as c(categorie)
cross join (values
  ('Noir', '#151316', 0, 0),
  ('Blanc cassé', '#F0EAE0', 0, 1),
  ('Gris chiné', '#8A8478', 0, 2),
  ('Gris anthracite', '#3A3B3C', 0, 3),
  ('Beige sable', '#D8C4A0', 0, 4),
  ('Camel', '#C69B6D', 0, 5),
  ('Marron chocolat', '#4A2C20', 0, 6),
  ('Terracotta', '#C1583B', 0, 7),
  ('Bordeaux', '#6E1F2A', 0, 8),
  ('Rouge coquelicot', '#D62828', 3, 9),
  ('Rose poudré', '#F4C2C2', 3, 10),
  ('Rose fuchsia', '#FF3D9A', 5, 11),
  ('Orange brûlé', '#D2691E', 3, 12),
  ('Jaune moutarde', '#D8A93B', 3, 13),
  ('Vert olive', '#6B7A3A', 0, 14),
  ('Vert sapin', '#2F4F3E', 0, 15),
  ('Vert menthe', '#A8E6C9', 3, 16),
  ('Turquoise', '#2DE0C4', 5, 17),
  ('Bleu ciel', '#7EC8E3', 3, 18),
  ('Bleu marine', '#1B2A4A', 0, 19),
  ('Lavande', '#C7A8E0', 3, 20),
  ('Violet prune', '#5B2A5E', 5, 21),
  ('Argenté', '#C4C4C4', 5, 22),
  ('Doré', '#D4AF37', 8, 23),
  ('Couleur personnalisée', '#7A3DFF', 10, 24)
) as v(label, valeur, supplement, ordre);
